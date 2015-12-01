// sg
var sceneobjs = [];
var removequeue = [];
var addqueue = [];

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
	if (obj.OnStart !== undefined) {
		obj.OnStart();
	}
	return obj;
};

/**
 * Add an object to the scene as a child of the supplied parent
 */
Platformer.AddAsChild = function(parent, child) {
	addqueue.push([parent, child]);
	return child;
};

/**
 * 
 */
Platformer.AddAsChild_internal = function(parent, child) {
	sceneobjs.push(child);
	parent.add(child);
	if (child.OnStart !== undefined) {
		child.OnStart();
	}
	return child;
};

/**
 * Add an object to the scene
 * 
 * @param obj
 */
Platformer.AddParent = function(parent, obj) {
	sceneobjs.push(obj);
	parent.add(obj);
};

/**
 * 
 */
Platformer.QueueEverythingForRemoval = function() {
	//=D
	for(var i=0; i < sceneobjs.length; i++) {
		Platformer.QueueRemove(sceneobjs[i]);
	}
};

/**
 * Queue an object for removal
 */
Platformer.QueueRemove = function(obj) {
	removequeue.push(obj);
};

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
	obj.parent.remove(obj);
	console.log("Removed: " + obj);
};

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
				so.onRender(delta);
			}
		}
	}
	insideLoop = false;

	AccumDelta += delta;
	if (AccumDelta > 100) {
		AccumThing += 1;
		AccumThing = AccumThing % 128;
		var ranr = Math.floor(Math.random() * 255);
		var rang = Math.floor(Math.random() * 255);
		var ranb = 255;
		// TextureCreate(ranr, rang, ranb, AccumThing);
		AccumDelta = 0;
	}
};

/**
 * 
 */
onSimulation = function() {
	// Do all removes
	for (var i = 0; i < removequeue.length; i++) {
		Platformer.Remove(removequeue[i]);
	}
	if (removequeue.length > 0) {
		removequeue = [];
	}
	//Do all adds
	for (var i = 0; i < addqueue.length; i++) {
		Platformer.AddAsChild_internal(addqueue[i][0], addqueue[i][1]);
	}
	if (addqueue.length > 0) {
		addqueue = [];
	}
	
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