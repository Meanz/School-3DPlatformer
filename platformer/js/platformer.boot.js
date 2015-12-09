'use strict';

Physijs.scripts.worker = './lib/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

// Scene, Renderer
var Platformer = {};
Platformer.Scene = null;
Platformer.Canvas = document.createElement("canvas");
Platformer.Texture = null;
Platformer.Camera = null;
Platformer.IsPointerLocked = false;
Platformer.IsPlaying = false;

//Time constants
var SECOND = 1.0 / 1000.0;
var MINUTE = SECOND * 60.0;
var HOUR = MINUTE * 60.0;

//Settings constants
var PARTICLE_AMOUNT_LOW = 10000;
var PARTICLE_AMOUNT_MEDIUM = 25000;
var PARTICLE_AMOUNT_HIGH = 50000;
var PARTICLE_AMOUNT_ULTRA = 100000;
var PARTICLE_AMOUNT_INSANE = 500000;

var SENSITIVITY_LOW = 0.001;
var SENSITIVITY_MEDIUM = 0.005;
var SENSITIVITY_HIGH = 0.01;
var SENSITIVITY_ULTRA = 0.1;
var SENSITIVITY_INSANE = 0.5;

Platformer.Settings = {};
Platformer.Settings.ParticleAmount = PARTICLE_AMOUNT_HIGH;

//
Platformer.Textures = {};
Platformer.Audio = {};

var OnInit;

var canvas;

// The initial light of the scene
var light;

// Texture Loader
var loader;

// Loop timining
Platformer.LastFrameTimestamp = null;
Platformer.LastPhysicsTimestamp = null;

function renderScene(timestamp) {
	requestAnimationFrame(renderScene);

	if (Platformer.LastFrameTimestamp == null) {
		Platformer.LastFrameTimestamp = timestamp;
	}
	var delta = timestamp - Platformer.LastFrameTimestamp;
	Platformer.LastFrameTimestamp = timestamp;

	if (SceneManager.OnRender !== undefined) {
		if (Platformer.Camera.inPerspectiveMode) {
			Platformer.Controls.Update(delta);
		}
		Platformer.MouseX = Platformer.Controls.LastMouseX;
		Platformer.MouseY = Platformer.Controls.LastMouseY - 8;
		SceneManager.OnRender(delta);
	}

	Platformer.Renderer.render(Platformer.Scene, Platformer.Camera);
}

var resx = 512;
var resy = 512;
function TextureCreate(clrx, clry, clrz, delta) {
	var x, y;
	// Do some fancy magic
	var ctx = Platformer.Canvas.getContext("2d");
	// Make some data
	var blockX = 0;
	var blockY = 0;
	var w = resx;
	var h = resy;
	/*
	 * for (x = 0; x < w; x++) { for (y = 0; y < h; y++) { blockX = Math.floor(x /
	 * 32); blockY = Math.floor(y / 32);
	 * 
	 * //var r = 255; var r = clrx; var g = clry; var b = clrz;
	 * 
	 * if (blockY % 2 == 0) { if (blockX % 2 == 0) { r = 0; b = 0; } } else if
	 * (blockY % 2 == 1) { if (blockX % 2 == 1) { r = 0; b = 0; } }
	 * 
	 * var idx = (x + (y * w)) * 4; imgd.data[idx] = r; imgd.data[idx + 1] = g;
	 * imgd.data[idx + 2] = b; imgd.data[idx + 3] = 255; } }
	 * ctx.putImageData(imgd, 0, 0);
	 */

	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, resx, resy);
	ctx.font = "48px matrixcode";
	ctx.fillStyle = "#00aa00";

	var txtwidth = Math.ceil(ctx.measureText("9").width);
	var txtheight = Math.ceil(ctx.measureText("M").width);

	var elems = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
			'u', 'v', 'w', 'x', 'y', 'z' ];

	for (var i = 0; i < Math.floor(resx / txtwidth) + 1; i++) {
		for (var j = 0; j < Math.ceil(resy / txtheight) + 1; j++) {
			// var ran = Math.floor(Math.random() * 2);
			// var ran = Math.round((noise.simplex2(i, j - delta) + 1) / 2);
			var ran = Math.round(((noise.simplex2(i, j - delta) + 1) / 2) * elems.length);
			// 0.111
			// -1, 1
			// +1
			// 0, 2

			ctx.fillText("" + elems[ran], i * txtwidth, j * txtheight);
		}
	}

	ctx.lineWidth = 5;
	ctx.strokeStyle = "#ff0000";
	ctx.beginPath();

	ctx.moveTo(0, 0);
	ctx.lineTo(0, resy);
	ctx.lineTo(resx, resy);

	ctx.stroke();
	ctx.closePath();

	Platformer.Texture.needsUpdate = true;
	return Platformer.Texture;
}

Platformer.Init = function() {

	Platformer.Renderer = new THREE.WebGLRenderer({
		antialias : true
	});

	Platformer.Width = window.innerWidth - 4;
	Platformer.Height = window.innerHeight - 4;

	Platformer.Renderer.setSize(Platformer.Width, Platformer.Height);
	canvas = document.getElementById('viewport').appendChild(Platformer.Renderer.domElement);
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock
			|| canvas.webkitRequestPointerLock;
	canvas.exitPointerLock = canvas.exitPointerLock || canvas.mozExitPointerLock || canvas.webkitExitPointerLock;

	Input.AddListeners(canvas);

	Platformer.Scene = new Physijs.Scene({
		fixedTimeStep : 1 / 60
	});



	//0000 0001
	//1000 0000 0000 0000 ....n
	//1 2 4 8 16
	//8
	//0001 0010
	//0000 1000
	//two's complement

	Platformer.Scene.setGravity(new THREE.Vector3(0, -15, 0));
	Platformer.Scene.addEventListener('update', function() {
		Input.Update();

		// update timing
		var ctime = Date.now();
		if (Platformer.LastPhysicsTimestamp == null) {
			Platformer.LastPhysicsTimestamp = ctime;
		}
		var delta = ctime - Platformer.LastPhysicsTimestamp;
		Platformer.LastPhysicsTimestamp = ctime;

		Platformer.Scene.simulate(undefined, 2);
		if (SceneManager.OnSimulation !== undefined) {
			SceneManager.OnSimulation(delta);
		}
		Input.Flush();
	});

	// width, height, fov, near, far, orthoNear, orthoFar
	Platformer.Camera = new THREE.CombinedCamera(window.innerWidth, window.innerHeight, 60, 0.1, 1000, -10, 10);
	Platformer.Camera.position.set(-10, 10, -10);
	Platformer.Camera.lookAt(Platformer.Scene.position);
	Platformer.Scene.add(Platformer.Camera);

	Platformer.Controls = new Platformer.FirstPersonControls(Platformer.Camera);

	// Light
	light = new THREE.DirectionalLight(0x666666);
	light.position.set(-0.2, 0.6, -0.2);
	light.target.position.copy(Platformer.Scene.position);
	Platformer.Scene.add(light);

	var ambLight = new THREE.AmbientLight(0x666666);

	Platformer.Scene.add(ambLight);

	// Loader
	loader = new THREE.TextureLoader();
	requestAnimationFrame(renderScene);
	Platformer.Scene.simulate();

	Platformer.Canvas = document.createElement("canvas");
	Platformer.Canvas.width = resx;
	Platformer.Canvas.height = resy;

	Platformer.Texture = new THREE.Texture(Platformer.Canvas);
	Platformer.Texture.wrapS = THREE.RepeatWrapping;
	Platformer.Texture.wrapT = THREE.RepeatWrapping;
	Platformer.Texture.magFilter = THREE.NearestFilter;
	Platformer.Texture.minFilter = THREE.NearestMipMapLinearFilter;
	TextureCreate(255, 0, 254, 0);
	// Defaults
	Platformer.DefaultMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
		map : Platformer.Texture
	// loader.load('images/bg.png')
	}), 5, // high friction
	.1 // low restitution
	);

	$(document).keyup(function(event) {
		var key = event.which;

		if (key == 32) {
			canvas.requestPointerLock();
			Platformer.Controls.PointerLock = true;
			Platformer.IsPointerLocked = !Platformer.IsPointerLocked;
		}
		if (key == 72) {

		}
	});

	Platformer.jsonLoader = new THREE.JSONLoader();
	Platformer.textureLoader = new THREE.TextureLoader();
	Platformer.audioListener = new THREE.AudioListener();
	Platformer.audioListener.name = "audioListener";

	if(SceneManager !== undefined && SceneManager.Init !== undefined) {
		SceneManager.Init();
	}
	if (OnInit !== undefined) {
		OnInit();
	}
};

Platformer.LockCursor = function() {
	canvas.requestPointerLock();
	Platformer.Controls.PointerLock = true;
};

Platformer.FreeCursor = function() {
	document.exitPointerLock();
	Platformer.IsPointerLocked = false;
	Platformer.Controls.PointerLock = false;
};