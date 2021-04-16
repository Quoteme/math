import * as THREE from './three.module.js'
import { OrbitControls } from './OrbitControls.js';

let camera, scene, renderer, controls;
let mesh;

init();
animate();

function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 80;
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	controls = new OrbitControls( camera, renderer.domElement );
	//
	// const material = new THREE.PointsMaterial({ color: 0xff00ff });
	// const geometry = new THREE.BufferGeometry();
	// 	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute([0,0,0], 3) )
	// mesh = new THREE.Points( geometry, material )
	// scene.add(mesh)
	//
	window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

const solveEquation = (
	equation,
	x1=-1,
	y1=-1,
	x2=1,
	y2=1,
	partitionsX=30,
	partitionsY=30,
) =>
	new Array(partitionsX)
		.fill(0)
		.map( (_,x) => new Array(partitionsY)
			.fill(0)
			.map((_,y) => parsePolySolutions(Algebrite
				.nroots(equation
					.replaceAll('x', `(${x1+x*(x2-x1)/partitionsX}${y1+y*(y2-y1)/partitionsY}*i)`)
				)
				.toString()
			))
		)

const meshifySolution = (
	s,
	x1=-1,
	y1=-1,
	x2=1,
	y2=1,
	partitionsX=30,
	partitionsY=30,
) => {
	// const stepX = (x2-x1)/partitionsX
	// const stepY = (y2-y1)/partitionsY
	const stepX = 1
	const stepY = 1
	const verts = s.map((u,x)=>
		u.map((v,y)=>
			v.map((w,z) =>
				[x*stepX-x1,Math.atan2(w.imag,w.real),y*stepY-y1]
		))).flat(3)
	const material = new THREE.PointsMaterial({ color: 0xff00ff });
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute(
			verts,
		3) )
	mesh = new THREE.Points( geometry, material )
	return mesh
}

const parseSolutionString = s => s
	.replaceAll('...','')
	.replaceAll('[','')
	.replaceAll(']','')
	.split(',')

const parseComplex = s => s.indexOf('i')==-1
	// purely real number
	? { real: parseFloat(s)
	  , imag: 0}
	// a complex number
	: s.indexOf('+')!=-1
		// complex number with positive imag part
		? removeI(s.split(/(?=\+)/g))
		// complex number with negative imag part
		: removeI(s.split(/(?=\-)/g))

const removeI = ([a,b]) => b==undefined
	? { real: 0
	  , imag: a.indexOf('*')!=-1
		? parseFloat(a.replace('*i',''))
		: 1}
	: { real: parseFloat(a)
	  , imag: b.indexOf('*')!=-1
		? parseFloat(b.replace('*i',''))
		: 1}

const parsePolySolutions = s => parseSolutionString(s)
	.map(parseComplex)

window.solveEquation = solveEquation
window.meshifySolution = meshifySolution
window.scene = scene
