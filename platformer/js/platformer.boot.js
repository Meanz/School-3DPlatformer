'use strict';

Physijs.scripts.worker = './lib/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

// Scene, Renderer
var onInit, onRender, onSimulation;
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
	document.getElementById('viewport').appendChild(renderer.domElement);

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
	camera.position.set(60, 50, 60);
	camera.lookAt(scene.position);
	scene.add(camera);

	controls = new THREE.OrbitControls(camera);

	// Light
	light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(10, 40, 30);
	light.target.position.copy(scene.position);
	scene.add(light);

	// Loader
	loader = new THREE.TextureLoader();
	requestAnimationFrame(renderScene);
	scene.simulate();

	if (onInit !== undefined) {
		onInit();
	}
};