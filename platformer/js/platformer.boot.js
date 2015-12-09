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

Platformer.FogColor = 0x000000;
Platformer.Settings = {};
Platformer.Settings.ParticleAmount = PARTICLE_AMOUNT_HIGH;
Platformer.Settings.IsSoundEnabled = true;

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

Platformer.Init = function() {

	Platformer.Renderer = new THREE.WebGLRenderer({
		antialias : true,

	});
	Platformer.Renderer.setClearColor( Platformer.FogColor );
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
	Platformer.Canvas.width = 512;
	Platformer.Canvas.height = 512;

	Platformer.Texture = new THREE.Texture(Platformer.Canvas);
	Platformer.Texture.wrapS = THREE.RepeatWrapping;
	Platformer.Texture.wrapT = THREE.RepeatWrapping;
	Platformer.Texture.magFilter = THREE.NearestFilter;
	Platformer.Texture.minFilter = THREE.NearestMipMapLinearFilter;
	Util.DrawMatrixTexture(255, 0, 254, 0);
	// Defaults
	Platformer.DefaultMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
		map : Platformer.Texture
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