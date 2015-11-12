var Designer = {};

var TOOL_FLOOR = "floor";
var TOOL_REMOVE = "tool_remove";
var TOOL_WALL = "wall";
var TOOL_TRACER = "tracer";
var TOOL_SCANNER = "scanner";
var TOOL_JUMPPAD = "jumppad";
var TOOL_START = "start";
var TOOL_END = "end";

Designer.Tool = TOOL_FLOOR;
Designer.SaveX = 0;
Designer.SaveY = 0;
Designer.IsDragging = false;
Designer.OffsetX = 0;
Designer.OffsetY = 0;
Designer.Tiles = [];
Designer.TileSize = 32;

var Tile = function(tileX, tileY) {
	this.TileX = tileX;
	this.TileY = tileY;
	this.TileType = "unknown";
	this.Color = "#00ff00";
	this.OnRender = function() {
		Designer.Context.beginPath();
		var drawX = Math.floor((Math.floor(Designer.OffsetX / Designer.TileSize) + this.TileX) * Designer.TileSize)
				+ (Math.floor(Designer.OffsetX) % Designer.TileSize);

		var drawY = Math.floor((Math.floor(Designer.OffsetY / Designer.TileSize) + this.TileY) * Designer.TileSize)
				+ (Math.floor(Designer.OffsetY) % Designer.TileSize);
		Designer.Context.fillRect(drawX, drawY, Designer.TileSize, Designer.TileSize);
		Designer.Context.strokeStyle = this.Color;
		Designer.Context.stroke();
	};
};

var Floor = function(tileX, tileY) {

};

Designer.RefreshFPS = function() {
	var date = new Date();
	var ms = date.getMilliseconds();
	var fps = 1000 / (ms - Designer.LastMs); // 1000 / frameDelta
	Designer.LastMs = ms;
	return fps;
};

Designer.Init = function() {

	Designer.Canvas = document.getElementById("viewport");
	Designer.Context = Designer.Canvas.getContext("2d");
	console.log(Designer.Context);

	// Setup stuff
	MInput.PreventRightClickMenu = true;

	// Event listeners
	MInput.AddListeners(Designer.Canvas);

	// Init some stuff
	Designer.RefreshFPS();

	// Start rendering
	setInterval(Designer.Update, 1000 / 60);
	Designer.Render();
};

Designer.Update = function() {
	// Update Input
	MInput.Update();

	// Move!
	if (MInput.IsMouseKeyPressed(MOUSE_LMB)) {
		Designer.IsDragging = true;
	}
	if (MInput.IsMouseKeyReleased(MOUSE_LMB)) {
		Designer.IsDragging = false;
	}
	
	if(MInput.IsKeyReleased(KEY_1)) {
		Designer.Tool = TOOL_FLOOR;
		Designer.Render();
	}
	if(MInput.IsKeyReleased(KEY_2)) {
		Designer.Tool = TOOL_REMOVE;
		Designer.Render();
	}
	if(MInput.IsKeyReleased(KEY_3)) {
		Designer.Tool = TOOL_WALL;
		Designer.Render();
	}
	if(MInput.IsKeyReleased(KEY_4)) {
		Designer.Tool = TOOL_TRACER;
		Designer.Render();
	}
	if(MInput.IsKeyReleased(KEY_5)) {
		Designer.Tool = TOOL_SCANNER;
		Designer.Render();
	}
	if(MInput.IsKeyReleased(KEY_6)) {
		Designer.Tool = TOOL_JUMPPAD;
		Designer.Render();
	}
	if(MInput.IsKeyReleased(KEY_7)) {
		Designer.Tool = TOOL_START;
		Designer.Render();
	}
	if(MInput.IsKeyReleased(KEY_8)) {
		Designer.Tool = TOOL_END;
		Designer.Render();
	}

	if (MInput.IsMouseKeyReleased(MOUSE_RMB)) {

		var tileX = Math.floor((MInput.MouseX - 10 - (Math.floor(Designer.OffsetX) % Designer.TileSize)) / Designer.TileSize)
				- Math.floor(Designer.OffsetX / Designer.TileSize);
		var tileY = Math.floor((MInput.MouseY - 10 - (Math.floor(Designer.OffsetY) % Designer.TileSize)) / Designer.TileSize)
				- Math.floor(Designer.OffsetY / Designer.TileSize);
		// Do we have a tile at this position?
		var hasTile = false;
		var tile = undefined;
		var tileIndex = -1;
		for (var i = 0; i < Designer.Tiles.length; i++) {
			tile = Designer.Tiles[i];
			tileIndex = i;
			if (tile.TileX == tileX && tile.TileY == tileY) {
				// We already have a tile
				hasTile = true;
				break;
			}
		}
		if (!hasTile) {
			if (Designer.Tool == TOOL_FLOOR) {
				Designer.Tiles.push(new Tile(tileX, tileY));
			}
		} else {
			if (Designer.Tool == TOOL_REMOVE) {
				// Get the index of
				Designer.Tiles.splice(tileIndex, 1);
			}
		}
		Designer.Render();
	}

	if ((MInput.DeltaMouseX != 0 || MInput.DeltaMouseY != 0) && Designer.IsDragging) {
		Designer.OffsetX += MInput.DeltaMouseX;
		Designer.OffsetY += MInput.DeltaMouseY;
		Designer.Render();
	}
	


	// Flush input
	MInput.Flush();
};

Designer.Render = function() {
	var x, y, numWTiles, numHTiles;

	// Clear
	Designer.Context.fillStyle = "#ffffff";
	Designer.Context.fillRect(0, 0, Designer.Canvas.width, Designer.Canvas.height);
	// Designer.Context.clearRect(0, 0, Designer.Canvas.width,
	// Designer.Canvas.height);

	numWTiles = Math.ceil(Designer.Canvas.width / Designer.TileSize);
	numHTiles = Math.ceil(Designer.Canvas.height / Designer.TileSize);

	// console.log("numW: " + numWTiles + " numH: " + numHTiles);
	// console.log("offsetX: " + Designer.OffsetX + " offsetY: " +
	// Designer.OffsetY);
	// Debug
	Designer.Context.fillStyle = "#000000";
	Designer.Context.font = "12px Arial";

	// Draw tile map thing
	Designer.Context.beginPath();
	for (x = -1; x < numWTiles + 1; x++) {
		for (y = -1; y < numHTiles + 1; y++) {
			var drawX = (Math.floor(Designer.OffsetX) % Designer.TileSize) + Math.floor((x * Designer.TileSize));
			var drawY = (Math.floor(Designer.OffsetY) % Designer.TileSize) + Math.floor((y * Designer.TileSize));

			// console.log("drawx: " + drawX + " drawy: " + drawY);

			var tileX = x - Math.floor(Designer.OffsetX / Designer.TileSize);
			var tileY = y - Math.floor(Designer.OffsetY / Designer.TileSize);

			Designer.Context.rect(drawX, drawY, Designer.TileSize, Designer.TileSize);
			Designer.Context.fillText("" + tileX, drawX + 4, drawY + 13);
			Designer.Context.fillText("" + tileY, drawX + 4, drawY + 25);
			// Designer.Context.fillText("" + y, drawX + 3, drawY + 25);
		}
	}

	// Designer.Context.endPath();
	//
	Designer.Context.strokeStyle = "#ff0000";
	Designer.Context.stroke();

	// Render each tile
	var tile = undefined;
	for (var i = 0; i < Designer.Tiles.length; i++) {
		tile = Designer.Tiles[i];
		if (tile != undefined) {
			if (tile.OnRender != undefined) {
				tile.OnRender();
			}
		}
	}

	// Draw debug text
	Designer.Context.fillStyle = "#000000";
	Designer.Context.font = "16px Arial";
	Designer.Context.fillText("Tool: " + Designer.Tool, 10, 20);

	// calculate fps
	// Designer.Context.fillText("FPS: " + Designer.RefreshFPS(), 10, 50);
};
