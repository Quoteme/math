import * as KEYBOARD from './keyboard/keyboard.mjs'
import * as THREE from './three.module.js'
import {OrbitControls} from './OrbitControls.js'

class PR2 {
	/**
	 * Class representing the real projective space
	 * @param {[PR2.point]} points in this space
	 */
	constructor(...points) {
		this.points = [] // the points are added at the end of this init

		// 3D-scene stuff for use with sphere representation
		this._3dWidth = 400
		this._3dHeight = 400
		this._container = document.createElement('div')
		this._container.style.width = `${this._3dWidth}px`
		this._container.style.height = `${this._3dHeight}px`
		this._container.classList.add("pr2sphere")
		this._scene = new THREE.Scene()
		this._scene.background = new THREE.Color(0xeeeeee)
		this._camera = new THREE.PerspectiveCamera(
			70,
			this._3dWidth/this._3dHeight,
			0.001,500
		)
		this._camera.position.z = 2.5
		// this._scene.add(this._camera)
		this._renderer = new THREE.WebGLRenderer({antialias: true})
		this._renderer.setPixelRatio(window.devicePixelRatio)
		this._renderer.setSize(this._3dWidth,this._3dHeight)
		// this._renderer.setSize(window.innerWidth,window.innerHeight)
		this._container.appendChild(this._renderer.domElement)
		this._controls = new OrbitControls(this._camera, this._renderer.domElement)
		this._sphere = new THREE.Mesh(
			new THREE.SphereGeometry(1,15,15),
			new THREE.MeshBasicMaterial({color: 0x161616, wireframe: true})
		)
		this._scene.add(this._sphere)
		this._bounds = [
			new THREE.Mesh(
				new THREE.TorusGeometry(1,0.05,5,20,Math.PI/2),
				new THREE.MeshBasicMaterial({color:0x61cba2})
			),
			new THREE.Mesh(
				new THREE.TorusGeometry(1,0.05,20,5,Math.PI/2),
				new THREE.MeshBasicMaterial({color:0xe7a2fb})
			),
			new THREE.Mesh(
				new THREE.TorusGeometry(1,0.05,5,20,Math.PI/2),
				new THREE.MeshBasicMaterial({color:0x61cba2})
			),
			new THREE.Mesh(
				new THREE.TorusGeometry(1,0.05,20,5,Math.PI/2),
				new THREE.MeshBasicMaterial({color:0xe7a2fb})
			)
		]
		this._bounds.forEach((p,i) => p.rotateZ(i*Math.PI/2-Math.PI/4))
		this._bounds.forEach(p => this._scene.add(p))

		// add all the points
		points.forEach(p => this.addPoint(p))
	};
	/**
	 * Adds a point to this PR2
	 * It will be drawn when calling a function that draws this space
	 * @param {PR2.point}
	 */
	addPoint(p){
		this.points = this.points.concat([p])
		this._scene.add(p._point)
		this._scene.add(p._line)
		this._scene.add(p._intersectionPoint)
	}
	/**
	 * Updates all the points in this space
	 * Used to move movable points
	 */
	update(...args){
		this.points.forEach(p => {
			if(p.isMovable == true) p.update(...args)
		})
	}
	static point = class Point{
		/**
		 * Class representing a point in PR2
		 * @param {number} x - x value on Sphere
		 * @param {number} y - y value on Sphere
		 * @param {number} z - z value on Sphere
		 */
		constructor(x=0,y=0,z=1){
			if(x==0 && y==0 && z==0) throw 'This point is not in PR2'
			this.x = x
			this.y = y
			this.z = z
			//
			// other stuff for 3D sphere representation
			this._line = this.createLine()
			this._point = this.createPoint(0xffc900)
			this._intersectionPoint = this.createPoint(0xed0015)
			this.updatePoint()
		}
		/**
		 * Returns the Angles for this point in spherical coordinates
		 * phi: x,z rotation
		 * psi: y,z rotation
		 * rho: distance
		 */
		get	angles(){
			let phi = Math.atan2(this.z,this.x)
			let psi = Math.atan2(this.z,this.y)
			return [phi,psi]
		}
		/**
		 * Returns this point in spherical coordinates
		 */
		get sphericalCoordinates(){
			let [phi,psi] = this.angles
			return [
				Math.cos(phi),
				(-1)*Math.cos(psi)*Math.sin(phi),
				Math.sin(phi)*Math.sin(psi)
			]
		}
		/**
		 * Scales this point (actually leaves it unchanged in the
		 * perspective of PR2
		 * @param {number} s - A not-zero scaling factor
		 */
		scale(s){
			if (s==0) throw 'Zero-scalar used'
			return new PR2.point(s*this.x,s*this.y,s*this.z)
		}
		/**
		 * Return the magnitude the underlying coordinates for this
		 * point have
		 * @return {number} magnitude of this points underlying coords
		 */
		get magnitude(){
			return Math.hypot(this.x, this.y, this.z)
		}
		/**
		 * Normalizes the Scaling of this point (magnitude will be 1)
		 * @return {PR2.point} normalized point
		 */
		normalize(){
			return this.scale(1/this.magnitude)
		}
		/**
		 * Generate the 2D coordinates for this Point
		 * (if it is not a point at infinity)
		 * @return {x:number, y:number} 2d point
		 * @throws if this is a point at infinity
		 */
		to2d(){
			if(this.z==0) throw "Point at infinity cannot be projected to plane"
			else return {x:this.x/this.z, y:this.y/this.z}
		}
		/**
		 * Draw this point on a squareWithIdentifiedEdges diagram
		 * @param {dom.element} canvas - the canvas to draw on
		 * @param {number} x - x position
		 * @param {number} y - y position
		 */
		draw(canvas,x,y){
			let ctx = canvas.getContext('2d')
			ctx.beginPath()
			ctx.arc(x,y,3,0,2*Math.PI)
			ctx.fill()
		}
		/**
		 * creates the line that passes though the origin and this
		 * point. It is uniquely identified
		 */
		createLine(){
			let geometry = new THREE.BufferGeometry()
			let d = Math.hypot(this.x,this.y,this.z)
			let [x,y,z] = [this.x/d,this.y/d,this.z/d]
			let vertecies = new Float32Array([
				-500*x , -500*y , -500*z ,
				    -x , -y     , -z     ,
				 0.0   , 0.0    , 0.0    ,
				   x   , y      , z      ,
			 	 500*x , 500*y  , 500*z  ,
			])
			geometry.setAttribute(
				'position',
				new THREE.BufferAttribute(vertecies, 3))
			return new THREE.Line(
				geometry,
				new THREE.MeshBasicMaterial({
					color: 0x0027ff,
					linewidth: 3,
				})
			)
		}
		/**
		 * Updates the line
		 */
		updateLine(){
			let [phi,psi] = this.angles
			this._line.rotation.set(0,0,0)
			this._line.rotation.set(
				Math.PI/2-psi,
				Math.PI/2-phi,
				0)
			// this._line.rotateX(Math.PI/2-psi)
			// this._line.rotateX(Math.PI/2-psi)
			// this._line.rotation.set( 1/2*Math.PI, 0,0)
		}
		/**
		 * Creates a point in 3d-space to represent this point
		 */
		createPoint(color){
			return new THREE.Mesh(
				new THREE.SphereGeometry(0.05,10,10),
				new THREE.MeshBasicMaterial({color: color})
			)
		}
		/**
		 * Updates the 3d-space representation of this point
		 */
		updatePoint(){
			let [x,y,z] = this.sphericalCoordinates
			this._point.position.set(x,y,z)
			// this._point.rotation.set( Math.PI/2-psi,Math.PI/2-phi,0 )
		}
		/**
		 * Update the intersection between the line and the plane
		 */
		updateIntersection(){
			// this._intersectionPoint.position.set(
			// 	this.x/this.z,
			// 	-this.y/this.z,
			// 	1
			// )
			let [x,y,z] = this.sphericalCoordinates
			this._intersectionPoint.position.set(x/z, y/z, 1)
		}
		/**
		 * Updates all the 3d-space stuff for this point
		 */
		update3D(){
			this.updatePoint()
			this.updateLine()
			this.updateIntersection()
		}
		/**
		 * Determines if two points are Equal
		 * @param {PR2.point} p - the first point
		 * @param {PR2.point} q - the second point
		 */
		static eq(p,q){
			p1 = p.normalize()
			q1 = q.normalize()
			return p1.x==q1.x && p1.y==q1.y && p1.z==q1.z
		}
	};
	static movablePoint = class moveablePoint extends PR2.point{
		/**
		 * A movable point in PR2
		 * It additionally stores a change in x and y coordinates defined
		 * as "angle" and this change can be applied by calling "move()"
		 * @param {number} x - x coordinate
		 * @param {number} y - y coordinate
		 * @param {number} z - z coordinate
		 * @param {number} angle - the change in x and y coordinates as
		 *                         an angle
		 */
		constructor(x=0,y=0,z=1,angle=0){
			super(x,y,z)
			this.angle = angle
		}

		/**
		 * Returns that this point is indeed movable
		 */
		get isMovable(){
			return true
		}

		/**
		 * Move the point by some distance
		 * @param {number} dt - if called once per unit time, then this
		 *                      should be one. If called twice per unit
		 *                      time then dt=1/2 and so on...
		 *                      (the reciprocal of calls per unit time)
		 *
		 * /!\ This allows one to see the z component of a point as its
		 *     speed through space; allowing us to think of (0,0,0)
		 *     as a point at (0,0) with speed 1/0=Infinity
		 */
		move(dt=1){
			this.x += dt*Math.cos(this.angle)
			this.y += dt*Math.sin(this.angle)
		}
		// TODO
		update(
			keyLeft,
			keyRight,
			keyForward,
			keyBackward,
			rotationSpeed=0.1,
			movementSpeed=0.1,
			dt
		){
			if(keyLeft) this.angle+=rotationSpeed
			if(keyRight) this.angle-=rotationSpeed
			if(keyForward) this.move(dt)*movementSpeed
			if(keyBackward) this.move(-dt)*movementSpeed
		}
		/**
		 * Draw the point as a triangle, so that it indicates where it
		 * is moving towards
		 * @param {dom.element} canvas - the canvas to draw on
		 * @param {number} x - x position
		 * @param {number} y - y position
		 */
		draw(canvas,x,y){
			let ctx = canvas.getContext('2d')
			ctx.beginPath()
			ctx.moveTo(x,y)
			ctx.lineTo(x-Math.cos(this.angle)*12,y-Math.sin(this.angle)*12)
			ctx.stroke()
			super.draw(canvas,x,y)
		}
	};
	// Representations
	/**
	 * Draws PR2 on a canvas using the process of indentifying edges
	 * @param {dom.element} canvas - the canvas element to draw to
	 * @param {number} size - the size of the box that bounds PR2
	 * @param {number->number} scale - a function that relates
	 *                                 the distance of a point from the
	 *                                 center of PR2 to how far away to
	 *                                 draw the point in the depiction
	 *                                 0 : center
	 *                                 1 : at the boundary
	 */
	squareWithIdentifiedEdges(
		canvas,
		size = Math.min(canvas.width*0.8,canvas.height*0.8),
		scale = x => 1-1/(x+1)
		){
		let ctx = canvas.getContext('2d')
		let center = {x: canvas.width/2, y:canvas.height/2}
		// draw the arrows / identified edges
		ctx.strokeStyle = '#61cba2'
		ctx.fillStyle = '#61cba2'
		ctx.lineWidth = 3
		canvas_arrow(
			ctx,
			center.x-size/2,
			center.y+size/2,
			center.x-size/2,
			center.y-size/2)
		canvas_arrow(
			ctx,
			center.x+size/2,
			center.y-size/2,
			center.x+size/2,
			center.y+size/2)
		ctx.strokeStyle = '#e7a2fb'
		ctx.fillStyle = '#e7a2fb'
		canvas_arrow(
			ctx,
			center.x-size/2,
			center.y-size/2,
			center.x+size/2,
			center.y-size/2)
		canvas_arrow(
			ctx,
			center.x+size/2,
			center.y+size/2,
			center.x-size/2,
			center.y+size/2)
		// draw the points in this PR2 instance
		ctx.lineWidth = 1
		ctx.strokeStyle = '#ffc900'
		ctx.fillStyle = '#ff0015'
		this.points.forEach(p => {
			try{
				let {x:x, y:y} = p.to2d()
				let direction = Math.atan2(y,x)
				let magnitude = size/2*scale(Math.hypot(x,y))
				p.draw(
					canvas,
					center.x + magnitude*Math.cos(direction),
					center.y + magnitude*Math.sin(direction),
				)
			}
			catch {
				console.log("error")
			}
		})
	};
	projectivePlane(){
	};
	/**
	 * Updates the 3D models for use in the sphere model of PR2
	 * to access the rendering, use instanceElement._container
	 */
	sphere(){
		this._controls.update()
		this._renderer.render(this._scene,this._camera)
		this.points.forEach(p => p.update3D())
	};
}

// Startup

let examplePR2
let canvas
let lastCallTime, deltaTime

const init = _ => {
	lastCallTime = performance.now()
	deltaTime = 0
	canvas = document.getElementById('c')
	examplePR2 = new PR2(new PR2.movablePoint())
	document.body.appendChild(examplePR2._container)
	window.examplePR2 = examplePR2
	window.PR2 = PR2
	window.THREE = THREE
}

const update = _ => {
	[lastCallTime, deltaTime] = updateTime(lastCallTime)
	examplePR2.update(
		KEYBOARD.pressed("ArrowLeft"),
		KEYBOARD.pressed("ArrowRight"),
		KEYBOARD.pressed("ArrowUp"),
		KEYBOARD.pressed("ArrowDown"),
		1/deltaTime,
		0.5,
		1/deltaTime,
	)
	examplePR2.sphere()
	canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
	examplePR2.squareWithIdentifiedEdges(canvas)
	window.requestAnimationFrame(update)
}

init()
update()

// helper functions
function updateTime(lastCallTime){
	let now = performance.now()
	return [now, lastCallTime-now]
}

function canvas_arrow(ctx, fromx, fromy, tox, toy, arrSize=10) {
	let center = {
		x:(tox-fromx)/2+fromx,
		y:(toy-fromy)/2+fromy,
	}
	let direction = Math.atan2(toy-fromy, tox-fromx)
	ctx.beginPath()
	ctx.moveTo(fromx,fromy)
	ctx.lineTo(tox,toy)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(
		center.x+arrSize*Math.cos(direction),
		center.y+arrSize*Math.sin(direction),
	)
	ctx.lineTo(
		center.x+arrSize*Math.cos(direction+Math.PI*2*2/3),
		center.y+arrSize*Math.sin(direction+Math.PI*2*2/3),
	)
	ctx.lineTo(
		center.x+arrSize*Math.cos(direction+Math.PI*2/3),
		center.y+arrSize*Math.sin(direction+Math.PI*2/3),
	)
	ctx.closePath()
	ctx.fill()
}
