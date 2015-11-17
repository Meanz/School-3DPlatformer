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
 * Add an object to the scene
 * 
 * @param obj
 */
Platformer.AddParent = function(parent, obj) {
	sceneobjs.push(obj);
	parent.add(obj);
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
var AccumDelta = 0;
var AccumThing = 0;
onRender = function(delta) {
	insideLoop = true;
	for (var i = 0; i < sceneobjs.length; i++) {
		var so = sceneobjs[i];
		if (so !== undefined) {
			if (so.onRender !== undefined) {
				so.onRender();
			}
		}
	}
	insideLoop = false;
	
	AccumDelta += delta;
	if(AccumDelta > 100) {
		AccumThing += 1;
		AccumThing = AccumThing % 128;
		var ranr = Math.floor(Math.random() * 255);
		var rang = Math.floor(Math.random() * 255);
		var ranb = 255;
		TextureCreate(ranr, rang, ranb, AccumThing);
		AccumDelta = 0;
	}
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