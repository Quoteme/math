let c = document.getElementById("c");
let ctx = c.getContext("2d");

class Vector{
	constructor(x,y,root,source,colored){
		this.x = x ?? 0;
		this.y = y ?? 0;
		this.s = 5;
		this.root = root ?? true;
		if(!this.root)
			this.source = source
		this.colored = colored ?? false;
	}
	get x(){
		return this._x + c.width/2;
	}
	set x(v){
		this._x = v
	}
	get y(){
		return this._y + c.height/2;
	}
	set y(v){
		this._y = v
	}
	get color(){
		if(!this.colored){
			return '#161616';
		}else{
			let hue = Math.hypot(this._y,this._x)/(Math.hypot(z._y,z._x)+Math.hypot(w._y,w._x))*360
			return `hsl(${hue},100%,50%)`;
		}
	}
	draw(){
		ctx.lineWidth = 10;
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		if(this.root)
			ctx.moveTo(c.width/2,c.height/2);
		else
			ctx.moveTo(this.source.x,this.source.y);
		ctx.lineTo(this.x,this.y);
		let angle = Math.atan2(this.y-c.height/2,this.x-c.width/2);
		ctx.lineTo(
			this.x+Math.cos(angle+2*Math.PI/3)*this.s,
			this.y+Math.sin(angle+2*Math.PI/3)*this.s,
		)
		ctx.lineTo(
			this.x+Math.cos(angle-2*Math.PI/3)*this.s,
			this.y+Math.sin(angle-2*Math.PI/3)*this.s,
		)
		ctx.lineTo(this.x,this.y);
		ctx.stroke();
		ctx.fill();
	}
}

let z = new Vector();
let w = new Vector(140,200,false,z);

let clicked = false;
c.onmousedown = _ => clicked = true;
c.onmouseup = _ => clicked = false;

c.onmousemove = (({pageX: x, pageY: y}) => {
	if(!clicked)
		return
	let zdist = Math.hypot(z.x-x,z.y-y)
	let wdist = Math.hypot(w.x-x,w.y-y)
	if(zdist < wdist){
		z.x = x-c.width/2;
		z.y = y-c.height/2;
	}else{
		w.x = x-c.width/2;
		w.y = y-c.height/2;
	}
	draw()
})

window.addEventListener("resize", init)

init();

function init(){
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	draw();
}

function draw(vectors=[z,w,new Vector(w.x-c.width/2,w.y-c.height/2,true,z,true)]){
	ctx.clearRect(0,0,c.width,c.height);
	console.log(vectors)
	vectors.forEach(v => v.draw());
}

