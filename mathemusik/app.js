// AUDIO STUFF
var audioCtx = new AudioContext();
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
oscillator.connect(gainNode);
// volume
gainNode.gain.value = 0.1;
oscillator.frequency.value = 300;
oscillator.type = "sine";
oscillator.start();

const stopAudio = () => {
	gainNode.disconnect();
	oscillator.disconnect();
}
const startAudio = () => {
	gainNode.connect(audioCtx.destination);
	oscillator.connect(gainNode);
}
const setAudioFreq = (freq) => {
	oscillator.frequency.value = freq;
}
const setAudioVol = (vol) => {
	if(vol>0)
		gainNode.gain.value = math.round(vol*100000)/100000;
	else
		gainNode.gain.value = 0.00000000001;
}

const playPauseBtn = () => {
	if (playing){
		// pause playing
		stopAudio();
	}else{
		// start playing
		startAudio();
	}
	playing=!playing;
}

// FUNCTION STUFF

var c = document.getElementById("graph");
var ctx = c.getContext("2d");
var time = document.getElementById("time");
var soundScale = document.getElementById("scale");
var scale = {
	"x": 15,
	"y": 15,
}
var base = {
	"x": 0,
	"y": c.height*(3/4)
}
var step = 12;
var offsetY = document.getElementById("offsetY");
var functions = [];
var playing = false;
var updated = false; // track, if an update occured

const changeStep = (e) => {
	step = e;
}

const newFunction = (trgt, expr, colr) => {
	// PARAMETERS
		// trgt | target
		// expr | expression
		// colr | color

	// CREATION
		let node = document.createElement("li");
		let expression = document.createElement("input");
		let color = document.createElement("input");
		let removeButton = document.createElement("button");

	// DEFINITION
		expression.type = "text";
		color.type = "color";

	// ID ASSIGNMENT
		expression.classList.add("expr");
		color.classList.add("colr");

	// VALUE ASSIGNMENT
		expression.value = expr || "1+i";
		expression.onchange = () => {update();};
		color.value = colr || "#"+parseInt(Math.random()*0xFFFFFF).toString(16);
		color.onchange = () => {update();};
		// remove button
			removeButton.innerHTML = "X";
			removeButton.onclick = () => {
				// get the list the function is stored in
				event.currentTarget.parentNode.parentNode.removeChild(
					// remove the node this remove-button is in
					// (ie. the node that represents this function)
					event.currentTarget.parentNode
				);
				update();
			};

	// NODE ASSIGNMENT
		node.appendChild(expression);
		node.appendChild(color);
		node.appendChild(removeButton);
		document.getElementById(trgt).appendChild(node);

	// Update the program
	update();
}

const getFuncs = (id) => {
	// PARAMETERS
		// id = id of the list where the functions are stored in
	let list = document.getElementById(id).children;
	let out = [];
	for (var i=0; i<list.length; i++) {
		out.push([
			list[i].getElementsByClassName("expr")[0].value,
			list[i].getElementsByClassName("colr")[0].value,
		])
	}
	return out;
}

const updateFuncs = (id) => {
	// PARAMETERS
		// id = id of the list where the functions are stored in
	return compileFuncs(getFuncs(id||"functions"));
}

const compileFuncs = (func) => {
	// PARAMETERS
		// func = list of function expressions + color to be compiled
		//			[["e^x","#ffbbbb"],["sin(x)","#ffffbb"], ... ]
	return func.map( x => [
		math.compile(x[0]),
		x[1],
	]);
}

const drawFuncs = (func, strt, stop) => {
	// PARAMETERS
		// func = array of functions
		// colr = array of colors matching to the functions
		// strt = start from which value to draw from
		// stop = stop where the functions should not be plotted anymore
	if (document.getElementById("lazyDraw").checked){
		for (var i=0; i<func.length; i++) {
			drawFuncDots(func[i][0],func[i][1],strt,stop,step);
		}
	}else{
		for (var i=0; i<func.length; i++) {
			drawFuncLine(func[i][0],func[i][1],strt,stop,step);
		}
	}
}

const drawFuncDots = (func, colr, bgin, end, step) => {
	// PARAMETERS
		// bgin = beginning of the graph on the x axis
		// end = length of the graph
	if(typeof step=="undefined")
		step=1;
	ctx.fillStyle = colr;
	for (var i=bgin; i<end*scale.x ; i+=step) {
		let value = func.eval( {"x":math.complex(i/scale.x,0)} );
		math.add(value,math.complex(0,0));
		ctx.globalAlpha = value.im>0?value.im:0;
		ctx.fillRect( i-bgin, base.y+parseFloat(offsetY.value)-value.re*scale.y,2,2);
	}
	ctx.globalAlpha=1;
}

const drawFuncLine = (func, colr, bgin, end, step) => {
	// PARAMETERS
		// bgin = beginning of the graph on the x axis
		// end = length of the graph
	// draw an individual function
		ctx.strokeStyle = colr;
	// previous/next value of the function
		let prev = func.eval( {"x":math.complex(i/scale.x,0)} );
		let next;

	// draw first start of the function
		ctx.moveTo( 0,prev );

	if(typeof step=="undefined")
		step=1;
	for (var i=bgin; i<end*scale.x; i+=step) {
		ctx.beginPath();
		next = func.eval( {"x":math.complex(i/scale.x,0)} );
		//ctx.lineWidth = next.im;
		ctx.globalAlpha=next.im;
		ctx.moveTo( i-bgin, base.y+parseFloat(offsetY.value)-prev.re*scale.y );
		ctx.lineTo( i-bgin+step, base.y+parseFloat(offsetY.value)-next.re*scale.y );
		ctx.stroke();
		prev = next;
	}
	ctx.globalAlpha=1;
}

const drawGrid = () => {
	ctx.strokeStyle="#ffffff";
	ctx.lineWidth=1;
	ctx.beginPath();
	ctx.moveTo(0,base.y+parseFloat(offsetY.value));
	ctx.lineTo(c.width,base.y+parseFloat(offsetY.value));
	ctx.stroke();
	ctx.fillStyle="#ffffff";
	for (var i=0; i<c.width/scale.x; i++){
		ctx.fillRect(scale.x*i,base.y+parseFloat(offsetY.value), 1,5);
	}
}

const drawCrntTime = (time) => {
	// draw the current position in time in the canvas
	// PARAMETERS
		// time = a position in time, where the tone is made currently
	let prevComOp = ctx.globalCompositeOperation;
	ctx.globalCompositeOperation = 'xor';
	ctx.fillStyle="#ffffff";
	ctx.fillRect(
		c.width/4,
		0,
		1,
		c.height
	);

	// restore prev composit operation
	ctx.globalCompositeOperation = prevComOp;
}

const update = () => {
	// update the function-cache
	functions = updateFuncs();
	updated = true;
}

const getFunctionValues = (funcs, param) => {
	// returns the function values at the position param
	// PARAMETERS
		// funcs = array of precompiled functions
		// param = what parameter to give the functions
	return funcs.map(x=>x[0]).map(x=>x.eval({"x":param}))
}

const render = () => {
	ctx.clearRect(0,0,c.width,c.height);
	drawGrid();
	drawFuncs(
		functions,
		parseFloat(time.value)*scale.x,
		parseFloat(time.value)*scale.x+c.width/scale.x
	)
}

const updateAudio = () => {
	let funcValues = getFunctionValues(
		functions,
		math.complex(parseFloat(time.value),0)
	)
	let res;
	switch (document.getElementById("composition").value) {
		case 'add':
			res = math.add(
				...funcValues,
				math.complex(0,0),
				math.complex(0,0)
			)
			break;
		case 'mult':
			res = math.multiply(
				...funcValues,
				math.complex(1,0),
				math.complex(1,0)
			)
			break;
		default:
			res = 0;
	}
	setAudioFreq(
		res.re * parseFloat(
			soundScale.value
		) +parseFloat(
			document.getElementById("frequency").value
		));
	setAudioVol(res.im);
}

const save = (id) =>{
	let f = JSON.stringify(getFuncs(id));
	download("untitled.json",f);
}

const fileUploaded = (e) => {
	let files = e.files;
	if (files) {
		for (var i=0, f; f=files[i]; i++) {
			const r = new FileReader();
			r.onload = (e) => {
				let data = JSON.parse(e.target.result);
				console.log(data);
				for (var i=0; i<data.length; i++) {
					newFunction("functions", data[i][0], data[i][1]);
				}
			}
			r.readAsText(f);
		}
	}
}

c.addEventListener("wheel", function(e){
	scale.y += e.deltaY*0.1;
	scale.x += e.deltaY*0.1;
	if(scale.x<0)
		scale.x =0.1;
	if(scale.y<0)
		scale.y =0.1;
	//scale.x += e.deltaX*0.1;
	time.value = parseFloat(time.value)+e.deltaX*0.1;
	e.preventDefault;

}, false);

setInterval(
	function(){
		if (document.getElementById("visualization").checked || updated){
			render();
			updated = false;
		}
		if (playing){
			time.value=parseFloat(time.value)+0.1;
		}
		updateAudio();
	},
100);

function download(filename, text) {
//	// Start file download.
//	download("hello.txt","This is the content of my file :)");
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}
