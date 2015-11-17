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
Designer.TileSize = 64;
Designer.TickTime = 1000 / 30; // 30 TPS
Designer.AccumDelta = 0;
Designer.MAX_SKIP_FRAMES = 5;
Designer.ActiveTab = 0;
Designer.StartTile = null;
Designer.EndTile = null;
Designer.SelectedTile = null;

Designer.Init = function() {

	Designer.FinalCanvas = document.getElementById("viewport");
	Designer.FinalContext = Designer.FinalCanvas.getContext("2d");

	Designer.Canvas = document.createElement("canvas");
	Designer.Canvas.width = Designer.FinalCanvas.width;
	Designer.Canvas.height = Designer.FinalCanvas.height;
	Designer.Context = Designer.Canvas.getContext("2d");
	Designer.Context.lineWidth = 2;

	// Make tile 0,0 centered on the screen
	Designer.OffsetX = Math.ceil(Designer.Canvas.width / 2);
	Designer.OffsetY = Math.ceil(Designer.Canvas.height / 2);

	// Setup stuff
	MInput.PreventRightClickMenu = true;

	// Event listeners
	MInput.AddListeners(Designer.FinalCanvas);

	// Render our frame
	Designer.Render();

	// Stuff
	Designer.AddTools();

	// Add a start tile at origo
	Designer.Tiles.push(new Tile_Start(0, 0));
	Designer.StartTile = Designer.Tiles[0];
	Designer.SelectedTile = Designer.StartTile;

	// Start render loop
	requestAnimationFrame(Designer.FrameRefresh);
};

Designer.OutputJSON = function() {
	var replacer = function(key, value) {
		if (key == "Color" || key == "TextColor" || key == "Font" || key == "CachedTextWidth"
				|| key == "CachedTextHeight" || key == "Text") {
			return undefined;
		} else {
			return value;
		}
	};

	var tostringify = {};
	tostringify.objects = Designer.Tiles;
	
	var stringified = JSON.stringify(tostringify, replacer);
	var myWindow = window.open("", "JSON Output", "width=200, height=100");
	myWindow.document.write(stringified);
};

Designer.SelectTile = function(tile) {
	Designer.SelectedTile = tile;
	$("#tab1-content").html(tile.GetHtml());
	Designer.SelectTab(1);
}

Designer.AddTools = function() {
	Designer.AddTool(TOOL_FLOOR);
	Designer.AddTool(TOOL_REMOVE);
	Designer.AddTool(TOOL_WALL);
	Designer.AddTool(TOOL_TRACER);
	Designer.AddTool(TOOL_SCANNER);
	Designer.AddTool(TOOL_JUMPPAD);
	Designer.AddTool(TOOL_START);
	Designer.AddTool(TOOL_END);
	Designer.SelectTool(TOOL_FLOOR);
};

Designer.AddTool = function(tool) {
	$("#tool-list").append(
			"<a id=\"tool-" + tool + "\" href=\"javascript:Designer.SelectTool('" + tool
					+ "');\" class=\"list-group-item\">" + tool + "</a>");
};

Designer.SelectTool = function(tool) {
	Designer.Tool = tool;
};

Designer.FrameRefresh = function(timestamp) {

	// Initialization
	if (Designer.LastFrame == undefined) {
		Designer.LastFrame = timestamp;
	}

	// Delta time and time accumulation
	var delta = timestamp - Designer.LastFrame;
	Designer.LastFrame = timestamp;
	Designer.AccumDelta += delta;

	// Tick loop
	var skipFrames = 0;
	while (Designer.AccumDelta > Designer.TickTime && skipFrames < Designer.MAX_SKIP_FRAMES) {
		Designer.Update();
		Designer.AccumDelta -= Designer.TickTime;
		skipFrames++;
	}

	// Clear
	Designer.FinalContext.clearRect(0, 0, Designer.FinalCanvas.width, Designer.FinalCanvas.height);

	// Render frame
	Designer.FinalContext.drawImage(Designer.Canvas, 0, 0);

	// Debug
	Designer.FinalContext.beginPath();
	Designer.FinalContext.fillStyle = "#000000";
	Designer.FinalContext.font = "bolder 16px Arial";
	Designer.FinalContext.fillText("FPS: " + Math.floor(1000 / delta), 10, 35);
	Designer.FinalContext.fillText("AccumDelta: " + Math.floor(Designer.AccumDelta), 10, 50);
	Designer.FinalContext.closePath();

	// Request next frame
	requestAnimationFrame(Designer.FrameRefresh);
};

Designer.Update = function() {
	// Update Input
	MInput.Update();

	// Move!
	if (MInput.IsMouseKeyPressed(MOUSE_MMB)) {
		Designer.IsDragging = true;
	}
	if (MInput.IsMouseKeyReleased(MOUSE_MMB)) {
		Designer.IsDragging = false;
	}

	if (MInput.WheelDelta != 0) {
		Designer.TileSize += Math.ceil(Math.ceil(MInput.WheelDelta / 120) * 2);
		if (Designer.TileSize < 16) {
			Designer.TileSize = 16;
		} else if (Designer.TileSize > 128) {
			Designer.TileSize = 128;
		}
	}

	if (MInput.IsKeyReleased(KEY_1)) {
		Designer.Tool = TOOL_FLOOR;
	}
	if (MInput.IsKeyReleased(KEY_2)) {
		Designer.Tool = TOOL_REMOVE;
	}
	if (MInput.IsKeyReleased(KEY_3)) {
		Designer.Tool = TOOL_WALL;
	}
	if (MInput.IsKeyReleased(KEY_4)) {
		Designer.Tool = TOOL_TRACER;
	}
	if (MInput.IsKeyReleased(KEY_5)) {
		Designer.Tool = TOOL_SCANNER;
	}
	if (MInput.IsKeyReleased(KEY_6)) {
		Designer.Tool = TOOL_JUMPPAD;
	}
	if (MInput.IsKeyReleased(KEY_7)) {
		Designer.Tool = TOOL_START;
	}
	if (MInput.IsKeyReleased(KEY_8)) {
		Designer.Tool = TOOL_END;
	}

	if (MInput.IsMouseKeyReleased(MOUSE_RMB) || MInput.IsMouseKeyReleased(MOUSE_LMB)) {

		var tileX = Math
				.floor((MInput.MouseX - (Math.floor(Designer.OffsetX) % Designer.TileSize)) / Designer.TileSize)
				- Math.floor(Designer.OffsetX / Designer.TileSize);
		var tileY = Math
				.floor((MInput.MouseY - (Math.floor(Designer.OffsetY) % Designer.TileSize)) / Designer.TileSize)
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

		if (MInput.IsMouseKeyReleased(MOUSE_LMB)) {
			if (hasTile) {
				Designer.SelectTile(tile);
			}
		} else if (MInput.IsMouseKeyReleased(MOUSE_RMB)) {
			if (!hasTile) {
				if (Designer.Tool == TOOL_FLOOR) {
					Designer.Tiles.push(new Tile_Floor(tileX, tileY));
				} else if (Designer.Tool == TOOL_WALL) {
					Designer.Tiles.push(new Tile_Wall(tileX, tileY));
				} else if (Designer.Tool == TOOL_START) {
					var startTile = new Tile_Start(tileX, tileY);
					// find old start tile, remove it
					if (Designer.StartTile != null) {
						var startTileIndex = -1;
						for (var i = 0; i < Designer.Tiles.length; i++) {
							if (Designer.StartTile == Designer.Tiles[i]) {
								startTileIndex = i;
								break;
							}
						}
						if (startTileIndex != -1) {
							Designer.Tiles.splice(startTileIndex, 1);
						} else {
							console.log("Designer.StartTile != null but it couldn't be find in the tile list?");
						}
					}
					Designer.StartTile = startTile;
					Designer.Tiles.push(startTile);
				} else if (Designer.Tool == TOOL_END) {
					var endTile = new Tile_End(tileX, tileY);
					// find old start tile, remove it
					if (Designer.EndTile != null) {
						var endTileIndex = -1;
						for (var i = 0; i < Designer.Tiles.length; i++) {
							if (Designer.EndTile == Designer.Tiles[i]) {
								endTileIndex = i;
								break;
							}
						}
						if (endTileIndex != -1) {
							Designer.Tiles.splice(endTileIndex, 1);
						} else {
							console.log("Designer.EndTile != null but it couldn't be find in the tile list?");
						}
					}
					Designer.EndTile = endTile;
					Designer.Tiles.push(endTile);
				}
			} else {
				if (Designer.Tool == TOOL_REMOVE) {
					// Get the index of
					if(Designer.SelectedTile == tile) {
						Designer.SelectedTile = null;
					}
					Designer.Tiles.splice(tileIndex, 1);
				}
			}
		}
	}

	if ((MInput.DeltaMouseX != 0 || MInput.DeltaMouseY != 0) && Designer.IsDragging) {
		Designer.OffsetX += MInput.DeltaMouseX;
		Designer.OffsetY += MInput.DeltaMouseY;
	}

	// Flush input
	MInput.Flush();

	//
	Designer.Render();
};

Designer.Render = function() {
	var x, y, numWTiles, numHTiles;

	// Clear
	Designer.Context.beginPath();
	Designer.Context.fillStyle = "#ffffff";
	Designer.Context.clearRect(0, 0, Designer.Canvas.width, Designer.Canvas.height);
	Designer.Context.closePath();

	numWTiles = Math.ceil(Designer.Canvas.width / Designer.TileSize);
	numHTiles = Math.ceil(Designer.Canvas.height / Designer.TileSize);

	// Draw tile map thing
	Designer.Context.beginPath();
	Designer.Context.fillStyle = "#000000";
	Designer.Context.font = "bolder 11px Arial";
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

	Designer.Context.strokeStyle = "#000000";
	Designer.Context.stroke();
	Designer.Context.closePath();

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
	Designer.Context.beginPath();
	Designer.Context.fillStyle = "#000000";
	Designer.Context.font = "bolder 16px Arial";
	Designer.Context.fillText("Tool: " + Designer.Tool, 10, 20);
	Designer.Context.closePath();
};

var Tile = function(tileX, tileY) {
	this.TileX = tileX;
	this.TileY = tileY;
	this.TileType = "unknown";
	this.Color = "#00ff00";
	this.TextColor = "#000000";
	this.Font = "bolder 12px Arial";
	this.Text = "Tile";
	this.CachedTextWidth = 0;
	this.CachedTextHeight = 0;
};

Tile.prototype.OnRender = function() {
	Designer.Context.beginPath();
	Designer.Context.strokeStyle = this.Color;
	Designer.Context.fillStyle = this.Color;
	var drawX = Math.floor((Math.floor(Designer.OffsetX / Designer.TileSize) + this.TileX) * Designer.TileSize)
			+ (Math.floor(Designer.OffsetX) % Designer.TileSize);

	var drawY = Math.floor((Math.floor(Designer.OffsetY / Designer.TileSize) + this.TileY) * Designer.TileSize)
			+ (Math.floor(Designer.OffsetY) % Designer.TileSize);
	Designer.Context.fillRect(drawX, drawY, Designer.TileSize, Designer.TileSize);

	if (this.Text != "") {
		Designer.Context.fillStyle = this.TextColor;
		Designer.Context.font = this.Font;

		// Measure the text
		if (this.CachedTextWidth == 0) {
			this.CachedTextWidth = Designer.Context.measureText(this.Text).width;
			this.CachedTextHeight = Designer.Context.measureText('M').width;
		}
		Designer.Context.fillText(this.Text, Math.ceil(drawX + (Designer.TileSize / 2) - (this.CachedTextWidth / 2)),
				Math.ceil(drawY + (Designer.TileSize / 2) + (this.CachedTextHeight / 2)));
	}

	Designer.Context.stroke();
	Designer.Context.strokeStyle = "#ff0000";
	if (Designer.SelectedTile == this) {
		Designer.Context.rect(drawX + 1, drawY + 1, Designer.TileSize - 2, Designer.TileSize - 2);
	}
	Designer.Context.stroke();

	Designer.Context.closePath();
};

Tile.prototype.GetHtml = function() {
	var html = "";

	html += "<h4>Tile: " + this.Text + "</h4>";
	html += "<p>";
	html += "TileX: " + this.TileX + "<br />";
	html += "TileY: " + this.TileY + "<br />";
	html += "</p>";

	return html;
};

var Tile_Floor = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileHeight = 0;
	this.TileType = "floor";
	this.Color = "#0000ff";
	this.Text = "Floor";
};
Tile_Floor.prototype = Object.create(Tile.prototype);
Tile_Floor.prototype.GetHtml = function() {
	var html = Tile.prototype.GetHtml.call(this);
	
	var onchange = "onchange=\"javascript:Designer.SelectedTile.UpdateValues();\"";
	
	html += "TileHeight: <input id='input_tileHeight' type='text' " + onchange + " value='" + this.TileHeight + "' />";
	
	return html;
}
Tile_Floor.prototype.UpdateValues = function() {
	this.TileHeight = $("#input_tileHeight").val();
	console.log("Value update");
};

var Tile_Wall = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileType = "wall";
	this.Color = "#00ffff";
	this.Text = "Wall";
};
Tile_Wall.prototype = Object.create(Tile.prototype);

var Tile_Start = function(tileX, tileY) {
	Tile_Floor.call(this, tileX, tileY);
	this.TileType = "start";
	this.Color = "#00ff00";
	this.Text = "Start";
}
Tile_Start.prototype = Object.create(Tile.prototype);

var Tile_End = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileType = "stop";
	this.Color = "#ff0000";
	this.Text = "Stop";
}
Tile_End.prototype = Object.create(Tile.prototype);

// Tab related
Designer.SelectTab = function(index) {
	$("#tab" + Designer.ActiveTab).removeAttr("class");
	$("#tab" + Designer.ActiveTab + "-content").hide();
	$("#tab" + index).attr("class", "active");
	$("#tab" + index + "-content").show();
	Designer.ActiveTab = index;
};
