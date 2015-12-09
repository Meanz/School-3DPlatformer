//For debugging
Platformer.AlertOnError = true;
Platformer.Log = function(message) {
	// =D
	console.log(message);
};
Platformer.LogError = function(message) {
	if (Platformer.AlertOnError) {
		alert(message);
	} else {
		console.log(message);
	}
	console.trace();
};
Platformer.NullArgument = function(func, argument) {
	Platformer.LogError("The supplied argument \"" + argument + "\" in function \"" + func + "\" is null.");
};

/**
 * All objects in the scenegraph can subscribe to the following events by adding
 * the variable to them:
 * 
 * OnStart, OnUpdate, OnRender, OnEnd
 */

//
var SceneManager = {};
Platformer.SceneManager = SceneManager;
SceneManager.AddQueue = [];
SceneManager.RemoveQueue = [];
SceneManager.SceneObjects = [];
SceneManager.LevelObjects = [];
SceneManager.TileObjects = [];
SceneManager.IsInsideLoop = false;

// 00000001
var TAG_TILE = 1;
// 00000010
var TAG_LEVEL = 2;
// 00000100
var TAG_BASE = 4;

/**
 * Initialize the SceneManager
 */
SceneManager.Init = function() {
};

/**
 * Add an object to the Level (NB: Add's an object as a child of the Level root
 * node)
 * 
 * @param obj1
 *            The object to add if obj2 is undefined or the parent if obj2 is
 *            defined
 * @param obj2
 *            The object to add to obj1
 * @return The object you tried to add
 */
SceneManager.Add = function(obj1, obj2) {
	var parent, child;
	if (obj2 == undefined || obj2 == null) {
		parent = Platformer.Scene;
		child = obj1;
		if (child.Tag !== undefined) {
			if (!(child.Tag & TAG_BASE)) {
				child.Tag |= TAG_LEVEL;
			}
		} else {
			child.Tag = TAG_LEVEL;
		}
	} else {
		parent = obj1;
		child = obj2;
	}
	SceneManager.AddQueue.push([ parent, child ]);
	return child;
};

/**
 * Adds an object under the base
 */
SceneManager.AddBase = function(child) {
	if (child.Tag !== undefined) {
		child.Tag |= TAG_BASE;
	} else {
		child.Tag = TAG_BASE;
	}
	SceneManager.Add(child);
};

/**
 * Adds an object as a tile to the Level
 * 
 * @param tile
 *            The object to add as a tile
 */
SceneManager.AddTile = function(child) {
	if (child.Tag !== undefined) {
		child.Tag |= TAG_TILE;
	} else {
		child.Tag = TAG_TILE;
	}
	SceneManager.Add(child);
};

/**
 * Internal
 */
SceneManager.Internal_Add = function(obj) {
	if (!SceneManager.IsInsideLoop) {
		var parent = obj[0];
		var child = obj[1];
		// Add to the scene
		SceneManager.SceneObjects.push(child);

		// Add to THREE.JS
		parent.add(child);
		// Check tag
		if (child.Tag !== undefined) {
			// Add to tiles if we have the tag
			if (child.Tag & TAG_TILE) {
				SceneManager.TileObjects.push(child);
			}
			if (child.Tag & TAG_LEVEL) {
				SceneManager.LevelObjects.push(child);
			}
		}
		// Call the on start event
		if (child.OnStart !== undefined) {
			child.OnStart();
		}
	} else {
		Platformer.LogError("Concurrent modification in SceneManager.Internal_Add");
	}
};

/**
 * Removes an object from it's parent
 * 
 * @param obj
 *            The Object to remove
 */
SceneManager.Remove = function(obj) {
	if (obj !== undefined && obj !== null) {
		if(SceneManager.RemoveQueue.indexOf(obj) == -1) {
			SceneManager.RemoveQueue.push(obj);
		} else {
			console.log("Tried to remove the same element twice, what a noob you are.");
		}
	} else {
		Platformer.NullArgument("SceneManager.Remove", "obj");
	}
};

/**
 * Internal
 */
SceneManager.Internal_Remove = function(obj) {
	if (!SceneManager.IsInsideLoop) {
		if (obj != undefined && obj != null) {

			// Remove from our scene system
			SceneManager.SceneObjects.splice(SceneManager.SceneObjects.indexOf(obj), 1);
			// Does this object have a tag?
			if (obj.Tag !== undefined) {
				// Is this object a part of the tile list?
				if (obj.Tag & TAG_TILE) {
					// Remove it from the tile list
					SceneManager.TileObjects.splice(SceneManager.TileObjects.indexOf(obj), 1);
				}
				// Is this object a part of the level?
				// If so, remove it
				if (obj.Tag & TAG_LEVEL) {
					SceneManager.LevelObjects.splice(SceneManager.LevelObjects.indexOf(obj), 1);
				}
			}

			// Remove from THREE.JS
			if (obj.parent == null) {
				// Dis wurk?
				Platformer.Scene.remove(obj);
			} else {
				obj.parent.remove(obj);
			}
			if (obj.OnEnd !== undefined) {
				obj.OnEnd();
			}
		} else {
			Platformer.NullArgument("SceneManager.Internal_Remove", "obj");
		}
	} else {
		Platformer.LogError("Concurrent modification in SceneManager.Internal_Remove");
	}

};

/**
 * Utility functions
 */

/**
 * Remove all children of the given node
 * 
 * @param from
 *            The parent node of all the children
 */
SceneManager.RemoveAllChildren = function(from) {
	if (from !== undefined && from !== null) {
		// Get all the children of the node
		for (var i = 0; i < from.children; i++) {
			SceneManager.Remove(from.children[i]);
		}
	} else {
		NullArgument("SceneManager.RemoveAllChildren", "from");
	}
};

/**
 * Clear our level
 */
SceneManager.ClearLevel = function() {
	for (var i = 0; i < SceneManager.LevelObjects.length; i++) {
		SceneManager.Remove(SceneManager.LevelObjects[i]);
	}
};

/**
 * Hide all level objects
 */
SceneManager.HideLevel = function() {
	for (var i = 0; i < SceneManager.LevelObjects.length; i++) {
		SceneManager.LevelObjects[i].visible = false;
	}
}

/**
 * Show all level objects
 */
SceneManager.ShowLevel = function() {
	for (var i = 0; i < SceneManager.LevelObjects.length; i++) {
		SceneManager.LevelObjects[i].visible = true;
	}
}

/**
 * Clear all tiles in our level
 */
SceneManager.ClearTiles = function() {
	for (var i = 0; i < SceneManager.TileObjects.length; i++) {
		// Awkward stuff will happen if there is a child that is not part of our
		// SceneSystem =D
		SceneManager.Remove(SceneManager.TileObjects[i]);
	}
};

/**
 * Untested
 */
SceneManager.ClearScene = function() {
	// Meep
	for (var i = 0; i < SceneManager.SceneObjects.length; i++) {
		SceneManager.Remove(SceneManager.SceneObjects[i]);
	}
};

/**
 * 
 */
var AccumDelta = 0;
var AccumThing = 0;
SceneManager.OnRender = function(delta) {
	SceneManager.IsInsideLoop = true;
	if (Platformer.IsPlaying) {
		TWEEN.update();
	}
	for (var i = 0; i < SceneManager.SceneObjects.length; i++) {
		var so = SceneManager.SceneObjects[i];
		if (so !== undefined) {
			if (so.onRender !== undefined) {
				so.onRender(delta);
			}
		}
	}
	SceneManager.IsInsideLoop = false;

	AccumDelta += delta;
	if (AccumDelta > 100) {
		AccumThing += 1;
		AccumThing = AccumThing % 128;
		var ranr = Math.floor(Math.random() * 255);
		var rang = Math.floor(Math.random() * 255);
		var ranb = 255;
		// TextureCreate(ranr, rang, ranb, AccumThing);
        Util.DrawMatrixTexture(ranr, rang, ranb, AccumThing);
		AccumDelta = 0;
	}
};

/**
 * 
 */
SceneManager.OnSimulation = function(delta) {
	// Do all adds
	for (var i = 0; i < SceneManager.AddQueue.length; i++) {
		SceneManager.Internal_Add(SceneManager.AddQueue[i]);
	}
	if (SceneManager.AddQueue.length > 0) {
		SceneManager.AddQueue = [];
	}
	// Do all removes
	for (var i = 0; i < SceneManager.RemoveQueue.length; i++) {
		SceneManager.Internal_Remove(SceneManager.RemoveQueue[i]);
	}
	if (SceneManager.RemoveQueue.length > 0) {
		SceneManager.RemoveQueue = [];
	}

	SceneManager.IsInsideLoop = true;
	for (var i = 0; i < SceneManager.SceneObjects.length; i++) {
		var so = SceneManager.SceneObjects[i];
		if (so !== undefined) {
			if (so.OnUpdate !== undefined) {
				if (Platformer.IsPlaying || !(so.Tag !== undefined && so.Tag & TAG_LEVEL)) {
					so.OnUpdate(delta);
				}
			}
		}
	}
	SceneManager.IsInsideLoop = false;
};