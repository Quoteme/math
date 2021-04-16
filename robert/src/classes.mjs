import * as THREE from './three.module.js';

export class Character{
	/**
	 * Constructs a new character with the following animations
	 *
	 * @param [Imgae] still - images to be looped when still
	 * @param [Imgae] walking - images to be looped when walking
	 */
	constructor(moves=[],still=[],walking=[]){
		this.x = this.y = this.z = 0;
		this.moves = moves;
		this.still = still;
		this.walking = walking;
		this._state = 'still' // "still" / "walking"
		this._frameDuration = 15;
		this._animationDuration = 45;
		this._animationTimer = 0;
		this._timer = 0;
		this._canvas = document.createElement("canvas");
		this._canvas.width = this._canvas.height = 512;
		// this stores all the character specific movements
		// if a used is defined in this.moves but not defined here
		// it will be ignored!
		// These will be executed each frame during animation
		this._movements = {
			// a movement is just a group element.
			// these are defined by the way they act during each frame
			// on this character. They take no argument
			e: _ => {}
		}
		this.mesh = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(20,20,10,10),
			new THREE.MeshBasicMaterial({
				map: new THREE.CanvasTexture(this._canvas),
				alphaTest: 0.5,
				transparent: true,
				side: THREE.DoubleSide,
			})
		)
		this.draw();
	}
	get x(){
		return this._x;
	}
	set x(v){
		this._x = v;
	}
	get y(){
		return this._y;
	}
	set y(v){
		this._y = v;
	}
	get z(){
		return this._z;
	}
	set z(v){
		this._z = v;
	}
	/**
	 * Draws the character onto his mesh
	 */
	draw(){
		let timer = Math.floor(this._timer/this._frameDuration)
		let img = this._state=="still"
			? this.still[timer%this.still.length]
			: this.walking[timer%this.walking.length]
		let ctx = this._canvas.getContext("2d");
		ctx.clearRect(0,0,this._canvas.width,this._canvas.height);
		ctx.drawImage(img,0,0);
		this.mesh.material.map.needsUpdate = true;
		this._timer++;
	}
	/**
	 * Reset the animationtimer - This means that a new move can be
	 * startet that lasts exactly this._animationDuration
	 * frames (the duration of this timer)
	 */
	resetAnimationTimer(){
		this._animationTimer = this._animationDuration;
	}
	/**
	 * Remove the first move from this.moves if the current move has
	 * been finished. Finally set up everything for the new move to
	 * be animated
	 */
	nextMove(){
		this.resetAnimationTimer();
		this._state = "still";
		this.moves = this.moves.splice(1)
	}
	/**
	 * Get the percentage of how much the current move has been
	 * animated so far
	 */
	get animationPercentage(){
		return this._animationTimer/this._animationDuration;
	}
	/**
	 * Get the move that is currently being used
	 * if no move is currently being made, return undefined
	 */
	get currentMove(){
		return this.moves.length!=0 ? this.moves[0] : undefined
	}
	/**
	 * Only true if the character is in the middle of an animation
	 */
	get moving(){
		return !(this.animationPercentage==1);
	}
	/**
	 * True if the last frame of an animation is playing
	 */
	get lastFrame(){
		return this._animationTimer==1
	}
	/**
	 * Get the function that is supposed to be called each frame
	 * when executing a move.
	 * If the move that is supposed to be made now has no such function,
	 * return undefined
	 */
	get currentMoveFkt(){
		return this._movements[this.currentMove];
	}
	/**
	 * Animate the current move
	 */
	animateMove(){
		this._state = "walking"
		this.currentMoveFkt();
		this._animationTimer--;
	}
	/**
	 * Handle all the movement (animation / new move beginning /...)
	 */
	move(){
		if(this._animationTimer<=0 || this._movements[this.currentMove]==undefined)
			this.nextMove();
		else if(this.moves!=[])
			this.animateMove();
	}
	/**
	 * Update all the values for this character
	 * includes animation and movement
	 */
	update(){
		this.draw();
		this.move();
	}
	/**
	 * Load a Character from a bunch of images
	 * each one will be displayed for this._frameDuration millyseconds
	 * @param [url] still - still image urls
	 * @param [url] walking - walking image urls
	 */
	static async fromImages(still=[],walking=[]){
		for(let i=0; i<still.length; i++)
			still[i] = await loadimage(still[i]);
		for(let i=0; i<walking.length; i++)
			walking[i] = await loadimage(walking[i]);
		return new Character([],still,walking);
	}
}

export class CylinderCharacter extends Character{
	/**
	 * Construct a Character that lives on a cylinder
	 * @param [string] moves - moves that the character will perform
	 * @param [img] still - images that display when still
	 * @param [img] walking - images that display when walking
	 * @param [float] radius - radius of the cylinder the character is on
	 * @param [int] order - because moving and turning (as moves)
	 * constitutes a dyhedral group, this will determine the oder
	 * of its cyclic subgroup
	 */
	constructor(moves,still,walking,radius,order=6){
		super(moves,still,walking);
		this.radius = radius;
		this.mesh.position.z = radius;
		this.order = order;
		this._rotated = false;
		this._movements = {
			e: _ => {},
			s: _ => {
				this.x += this._rotated
					? -1/this._animationDuration
					: +1/this._animationDuration
			},
			f: _ => {
				this.mesh.rotateY(Math.PI/this._animationDuration)
				if(this.lastFrame){
					this._rotated = !this._rotated
					this.x = this.x
				}
			},
		}
		this.mesh.position.y = 30;
	}
	get x(){
		return this._x;
	}
	set x(v){
		this._x = v;
		this.mesh?.position.set(
			Math.sin(2*Math.PI/this.order*v)*this.radius,
			30,
			Math.cos(2*Math.PI/this.order*v)*this.radius,
		)
		this.mesh?.lookAt(0,30,0)
		if(!this._rotated)
			this.mesh?.rotateY(Math.PI)
	}
	static async fromImages(still=[],walking=[],radius){
		for(let i=0; i<still.length; i++)
			still[i] = await loadimage(still[i]);
		for(let i=0; i<walking.length; i++)
			walking[i] = await loadimage(walking[i]);
		return new CylinderCharacter([],still,walking,radius);
	}
}

let loadimage = url => new Promise( (resolve,reject)=>{
	let img = new Image();
	img.onload = _ => resolve(img);
	img.onerror = _ => reject("character image could not be found")
	img.src = url
})
