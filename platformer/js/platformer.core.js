// sg
var sceneobjs = [];

// dbg
var insideLoop = false;

/**
 * Add an object to the scene
 * 
 * @param obj
 */
Platformer.Add = function(obj) {
	sceneobjs.push(obj);
	scene.add(obj);
}

/**
 * Remove an object from the scene
 * 
 * @param obj
 */
Platformer.Remove = function(obj) {
	if (insideLoop) {
		alert("You moron, you can't remove an object inside the update loop. CONCURRENT MODIFICATION MUCH???");
	}
	sceneobjs.splice(sceneobjs.indexOf(obj), 1);
	scene.remove(obj);
}

/**
 * 
 */
onRender = function() {

};

/**
 * 
 */
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