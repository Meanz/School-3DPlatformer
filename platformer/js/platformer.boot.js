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
Platformer.Canvas = document.createElement("canvas");
Platformer.Texture = null;


var resx = 512;
var resy = 512;
function TextureCreate(clrx, clry, clrz, delta) {
	var x, y;
	// Do some fancy magic
	var ctx = Platformer.Canvas.getContext("2d");
	var imgd = ctx.createImageData(resx, resy);

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

	console.log("w: " + txtwidth);

	var elems = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

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
	lastTimestamp = 0;
	TWEEN.start();

	renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	canvas = document.getElementById('viewport').appendChild(renderer.domElement);
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock
			|| canvas.webkitRequestPointerLock;
	canvas.exitPointerLock = canvas.exitPointerLock || canvas.mozExitPointerLock || canvas.webkitExitPointerLock;

	scene = new Physijs.Scene({
		fixedTimeStep : 1 / 60
	});
	scene.setGravity(new THREE.Vector3(0, -15, 0));
	scene.addEventListener('update', function() {
		scene.simulate(undefined, 2);
		if (onSimulation !== undefined) {
			onSimulation();
		}
	});

	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(-10, 10, -10);
	camera.lookAt(scene.position);
	scene.add(camera);

	controls = new Platformer.FirstPersonControls(camera);

	// Light
	light = new THREE.DirectionalLight(0x444444);
	light.position.set(-0.4, 0.6, -0.4);
	light.target.position.copy(scene.position);
	// scene.add(light);

	var ambLight = new THREE.AmbientLight(0xFFFFFF);

	scene.add(ambLight);

	// Loader
	loader = new THREE.TextureLoader();
	requestAnimationFrame(renderScene);
	scene.simulate();

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
			controls.PointerLock = true;
			isPointerLocked = !isPointerLocked;
		}
		if (key == 72) {

		}
	});

	if (onInit !== undefined) {
		onInit();
	}
};