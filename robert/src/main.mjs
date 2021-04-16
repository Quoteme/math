import * as THREE from './three.module.js';
import { DDSLoader } from './DDSLoader.js';
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { OrbitControls } from './OrbitControls.js';
import { CylinderCharacter } from './classes.mjs';

let camera, scene, renderer, controls;
let light, ambient;
let world, robert;


init();

async function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set(0,50,100)

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x87CEEB);

	light = new THREE.PointLight(0xffffff, 0.8);
	light.position.set(-500,500,500);
	scene.add(light);

	ambient = new THREE.AmbientLight(0xe15335,0.2);
	scene.add(ambient);

	const geometry = new THREE.CylinderBufferGeometry(150,200,200,200,200)
	const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );

	robert = await CylinderCharacter.fromImages(
		["./res/character/robert/still.png"],
		["./res/character/robert/walking1.png",
		 "./res/character/robert/walking2.png"],
		40,
	)
	window.robert = robert;
	scene.add(robert.mesh)

	world = await loadWorld();
	scene.add(world)
	camera.lookAt(world)

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	//
	controls = new OrbitControls( camera, renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );
	//
	animate();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	robert.update()
	renderer.render( scene, camera );
}

function loadWorld(){
	return new Promise((resolve,reject)=>{
		const onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				const percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
			}
		};

		const onError = function () { };

		const manager = new THREE.LoadingManager();
		manager.addHandler( /\.dds$/i, new DDSLoader() );

		// comment in the following line and import TGALoader if your asset uses TGA textures
		// manager.addHandler( /\.tga$/i, new TGALoader() );

		new MTLLoader( manager )
			.setPath( './res/models/' )
			.load( 'low-poly-mill.mtl', function ( materials ) {

				materials.preload();

				new OBJLoader( manager )
					.setMaterials( materials )
					.setPath( './res/models/' )
					.load( 'low-poly-mill.obj', function ( object ) {
						resolve(object)
					}, onProgress, onError );

			} );
	})
}

window.onkeypress = ({key: key}) => robert.moves.push(key)
