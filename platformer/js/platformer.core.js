// sg
var sceneobjs = [];

// dbg
var insideLoop = false;

/**
 * Add an object to the scene
 * 
 * @param obj
 */
function addSceneObject(obj) {
	sceneobjs.push(obj);
	scene.add(obj);
}

/**
 * Remove an object from the scene
 * 
 * @param obj
 */
function removeSceneObject(obj) {
	if (insideLoop) {
		alert("You moron, you can't remove an object inside the update loop. CONCURRENT MODIFICATION MUCH???");
	}
	sceneobjs.splice(sceneobjs.indexOf(obj), 1);
	scene.remove(obj);
}

// Patch three
THREE.Scene.add = function(obj) {
	alert("Rekt meit");
};

onInit = function() {

	var testMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
		map : loader.load('images/plywood.jpg')
	}), .8, // high friction
	.4 // low restitution
	);

	var box = Geometry.StaticBox(v3(0, 0, 0), v3(5, 5, 5), testMaterial);

	box.value = 0;
	box.onUpdate = function() {
		box.value++;
		
		box.scale.x = box.value * 0.01;
		box.scale.y = box.value * 0.01;
		box.scale.z = box.value * 0.01;
		
	};

	addSceneObject(box);

};

onRender = function() {

};

onSimulation = function() {
	insideLoop = true;
	for (var i = 0; i < sceneobjs.length; i++) {
		var so = sceneobjs[i];
		if (so !== undefined) {
			if (so.onUpdate !== undefined) {
				so.onUpdate();
			}
		}
	}
	insideLoop = false;
};