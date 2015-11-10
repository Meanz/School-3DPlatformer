'use strict';

Physijs.scripts.worker = './lib/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

// Scene, Renderer
var Platformer = {};

var onInit, onRender, onSimulation;
var isPointerLocked = false;
var canvas;
var scene;
var renderer;

// The initial light of the scene
var light;

// Camera Controls
var camera, controls;

// Texture Loader
var loader;

//
var lastTimestamp;

function renderScene(timestamp) {
	requestAnimationFrame(renderScene);

	if (lastTimestamp == 0) {
		lastTimestamp = timestamp;
	}
	var delta = timestamp - lastTimestamp;
	lastTimestamp = timestamp;

	if (onRender !== undefined) {
		controls.Update(delta);
		onRender(delta);
	}

	renderer.render(scene, camera);
}

var Platformer = {};

Platformer.Init = function() {
	lastTimestamp = 0;
	TWEEN.start();

	renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	canvas = document.getElementById('viewport').appendChild(
			renderer.domElement);
	canvas.requestPointerLock = canvas.requestPointerLock
			|| canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
	canvas.exitPointerLock = canvas.exitPointerLock
			|| canvas.mozExitPointerLock || canvas.webkitExitPointerLock;

	scene = new Physijs.Scene({
		fixedTimeStep : 1 / 60
	});
	scene.setGravity(new THREE.Vector3(0, -200, 0));
	scene.addEventListener('update', function() {
		scene.simulate(undefined, 2);
		if (onSimulation !== undefined) {
			onSimulation();
		}
	});

	camera = new THREE.PerspectiveCamera(35, window.innerWidth
			/ window.innerHeight, 1, 1000);
	camera.position.set(-10, 10, -10);
	camera.lookAt(scene.position);
	scene.add(camera);

	controls = new Platformer.FirstPersonControls(camera);

	// Light
	light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(10, 40, 30);
	light.target.position.copy(scene.position);
	scene.add(light);

	// Loader
	loader = new THREE.TextureLoader();
	requestAnimationFrame(renderScene);
	scene.simulate();

	// Defaults
	Platformer.DefaultMaterial = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({
				map : loader.load('images/wood.jpg')
			}), .8, // high friction
			.4 // low restitution
	);

	$(document).keyup(function(event) {
		var key = event.which;

		if (key == 32) {
			canvas.requestPointerLock();
			controls.PointerLock = true;
			isPointerLocked = !isPointerLocked;
		}
	});

	if (onInit !== undefined) {
		onInit();
	}
};