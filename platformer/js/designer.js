var Designer = {};

var TOOL_FLOOR = "floor";
var TOOL_REMOVE = "tool_remove";
var TOOL_WALL = "wall";
var TOOL_TRACER = "tracer";
var TOOL_SCANNER = "scanner";
var TOOL_JUMPPAD = "jumppad";
var TOOL_START = "start";
var TOOL_END = "end";
var TOOL_END_FINAL = "end_final";
var TOOL_DISK = "floppydisk";
var TOOL_PENDULUM = "pendulum";
var TOOL_ROTATINGCUBE = "rotcube";

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
Designer.LevelName = "leveltest";

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
	Input.PreventRightClickMenu = true;

	// Event listeners
	Input.AddListeners(Designer.FinalCanvas);

	// Render our frame
	Designer.Render();

	// Stuff
	Designer.AddTools();

	// Add a start tile at origo
	Designer.Tiles.push(new Tile_Start(0, 0));
	Designer.StartTile = Designer.Tiles[0];
	Designer.SelectedTile = Designer.StartTile;

	// Load the level
	Designer.LoadLevel();

	// Start render loop
	requestAnimationFrame(Designer.FrameRefresh);
};

Designer.LevelFromJSON = function(json) {

};

Designer.LevelToJSON = function() {
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
	return stringified;
}

Designer.OutputJSON = function() {
	var myWindow = window.open("", "JSON Output", "width=200, height=100");
	myWindow.document.write(Designer.LevelToJSON());
};

Designer.LoadLevel = function() {
	Designer.LevelName = $("#levelName").val();
	Designer.Tiles = [];
	Designer.StartTile = null;
	Designer.EndTile = null;
	Designer.SelectedTile = null;
	$.getJSON("./levels/" + Designer.LevelName + ".json", function(data) {
		$("#tab0-loadstatus").html("Loaded: " + "./levels/" + Designer.LevelName + ".json");
		for (var i = 0; i < data.objects.length; i++) {

			var obj = data.objects[i];

			var tileX = obj.TileX;
			var tileY = obj.TileY;
			var type = obj.TileType;

			if (type == "floor") {
				var tileFloor = new Tile_Floor(tileX, tileY);
				var tileHeight = obj.TileHeight;

				tileFloor.TileHeight = tileHeight;
				tileFloor.Text = "Floor (" + tileHeight + ")";
				// Platformer.AddFloor(position, dimension);
				Designer.Tiles.push(tileFloor);
				// console.log("Added floor at " + tileX + " / " + tileY);

			} else if (type == TOOL_PENDULUM) {
				var tileFloor = new Tile_Pendulum(tileX, tileY);
				var tileHeight = obj.TileHeight;
				tileFloor.TileHeight = tileHeight;
				Designer.Tiles.push(tileFloor);
			} else if (type == TOOL_ROTATINGCUBE) {
				var tileFloor = new Tile_RotatingCube(tileX, tileY);
				var tileHeight = obj.TileHeight;
				tileFloor.TileHeight = tileHeight;
				Designer.Tiles.push(tileFloor);
			} else if (type == "start") {
				Designer.AddStartTile(tileX, tileY);
			} else if (type == "end") {
				Designer.AddEndTile(tileX, tileY);
			} else if (type == "wall") {
				Designer.Tiles.push(new Tile_Wall(tileX, tileY));
			} else if (type == TOOL_TRACER) {
				var tile = new Tile_Tracer(tileX, tileY);
				tile.TileHeight = obj.TileHeight;
				tile.WithFloor = obj.WithFloor;
				Designer.Tiles.push(tile);
			}else if (type == TOOL_JUMPPAD) {
				var tile = new Tile_JumpPad(tileX, tileY);
				Designer.Tiles.push(tile);
			} else if (type == TOOL_DISK) {
				var tile = new Tile_FloppyDisk(tileX, tileY);
				tile.WithFloor = obj.WithFloor;
				Designer.Tiles.push(tile);
			} else if (type == TOOL_SCANNER) {
				var tile = new Tile_Scanner(tileX, tileY);
				tile.Targets = obj.Targets;
				tile.WithFloor = obj.WithFloor;
				Designer.Tiles.push(tile);
			} else if (type == TOOL_END_FINAL) {
				var tile = new Tile_EndFinal(tileX, tileY);
				tile.WithFloor = obj.WithFloor;
				Designer.Tiles.push(tile);
			}else {
				console.log("type: " + type);
			}

		}

	});

};

Designer.SaveLevel = function() {
	Designer.LevelName = $("#levelName").val();
	$("#tab0-savestatus").html("Saving...");
	$.post("designer.php?op=savelevel&levelName=" + Designer.LevelName, {
		data : Designer.LevelToJSON()
	}, function(data, status) {
		if (data == "ok") {
			$("#tab0-savestatus").html("<font color='#00ff00'>Saved!</font>");
		} else {
			$("#tab0-savestatus").html("<font color='#ff0000'>Error! :'(</font>");
		}
	});

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
	Designer.AddTool(TOOL_END_FINAL);
	Designer.AddTool(TOOL_DISK);
	Designer.AddTool(TOOL_ROTATINGCUBE);
	Designer.AddTool(TOOL_PENDULUM);
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

Designer.AddStartTile = function(tileX, tileY) {
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
};

Designer.AddEndTile = function(tileX, tileY) {
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
};

Designer.Update = function() {
	// Update Input
	Input.Update();

	// Move!
	if (Input.IsMouseKeyPressed(MOUSE_MMB)) {
		Designer.IsDragging = true;
	}
	if (Input.IsMouseKeyReleased(MOUSE_MMB)) {
		Designer.IsDragging = false;
	}

	if (Input.WheelDelta != 0) {
		Designer.TileSize += Math.ceil(Math.ceil(Input.WheelDelta / 120) * 2);
		if (Designer.TileSize < 16) {
			Designer.TileSize = 16;
		} else if (Designer.TileSize > 128) {
			Designer.TileSize = 128;
		}
	}

	if (Input.IsKeyReleased(KEY_1)) {
		Designer.Tool = TOOL_FLOOR;
	}
	if (Input.IsKeyReleased(KEY_2)) {
		Designer.Tool = TOOL_REMOVE;
	}
	if (Input.IsKeyReleased(KEY_3)) {
		Designer.Tool = TOOL_WALL;
	}
	if (Input.IsKeyReleased(KEY_4)) {
		Designer.Tool = TOOL_TRACER;
	}
	if (Input.IsKeyReleased(KEY_5)) {
		Designer.Tool = TOOL_SCANNER;
	}
	if (Input.IsKeyReleased(KEY_6)) {
		Designer.Tool = TOOL_JUMPPAD;
	}
	if (Input.IsKeyReleased(KEY_7)) {
		Designer.Tool = TOOL_START;
	}
	if (Input.IsKeyReleased(KEY_8)) {
		Designer.Tool = TOOL_END;
	}

	if (Input.IsMouseKeyReleased(MOUSE_RMB) || Input.IsMouseKeyReleased(MOUSE_LMB)) {

		var tileX = Math
				.floor((Input.MouseX - (Math.floor(Designer.OffsetX) % Designer.TileSize)) / Designer.TileSize)
				- Math.floor(Designer.OffsetX / Designer.TileSize);
		var tileY = Math
				.floor((Input.MouseY - (Math.floor(Designer.OffsetY) % Designer.TileSize)) / Designer.TileSize)
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

		if (Input.IsMouseKeyReleased(MOUSE_LMB)) {
			if (hasTile) {
				Designer.SelectTile(tile);
			}
		} else if (Input.IsMouseKeyReleased(MOUSE_RMB)) {
			if (!hasTile) {
				if (Designer.Tool == TOOL_FLOOR) {
					Designer.Tiles.push(new Tile_Floor(tileX, tileY));
				} else if (Designer.Tool == TOOL_WALL) {
					Designer.Tiles.push(new Tile_Wall(tileX, tileY));
				} else if (Designer.Tool == TOOL_TRACER) {
					Designer.Tiles.push(new Tile_Tracer(tileX, tileY));
				}else if (Designer.Tool == TOOL_JUMPPAD) {
					Designer.Tiles.push(new Tile_JumpPad(tileX, tileY));
				} else if (Designer.Tool == TOOL_DISK) {
					Designer.Tiles.push(new Tile_FloppyDisk(tileX, tileY));
				} else if (Designer.Tool == TOOL_SCANNER) {
					Designer.Tiles.push(new Tile_Scanner(tileX, tileY));
				} else if (Designer.Tool == TOOL_END_FINAL) {
					Designer.Tiles.push(new Tile_EndFinal(tileX, tileY));
				}else if (Designer.Tool == TOOL_START) {
					Designer.AddStartTile(tileX, tileY);
				}else if (Designer.Tool == TOOL_ROTATINGCUBE) {
					Designer.Tiles.push(new Tile_RotatingCube(tileX, tileY));
				}else if (Designer.Tool == TOOL_PENDULUM) {
					Designer.Tiles.push(new Tile_Pendulum(tileX, tileY));
				} else if (Designer.Tool == TOOL_END) {
					Designer.AddEndTile(tileX, tileY);
				}
			} else {
				if (Designer.Tool == TOOL_REMOVE) {
					// Get the index of
					if (Designer.SelectedTile == tile) {
						Designer.SelectedTile = null;
					}
					Designer.Tiles.splice(tileIndex, 1);
				}
			}
		}
	}

	if ((Input.DeltaMouseX != 0 || Input.DeltaMouseY != 0) && Designer.IsDragging) {
		Designer.OffsetX += Input.DeltaMouseX;
		Designer.OffsetY += Input.DeltaMouseY;
	}

	// Flush input
	Input.Flush();

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
	this.TileHeight = 0;
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

	var onchange = "onchange=\"javascript:Designer.SelectedTile.UpdateValues();\"";

	html += "TileHeight: <input id='input_tileHeight' type='text' " + onchange + " value='" + this.TileHeight + "' />";

	return html;
};
Tile.prototype.UpdateValues = function() {
	this.TileHeight = $("#input_tileHeight").val();
	this.Text = "Floor (" + this.TileHeight + ")";
	console.log("Value update");
};

var Tile_Floor = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileHeight = 0;
	this.TileType = "floor";
	this.Color = "#0000ff";
	this.Text = "Floor (0)";
};
Tile_Floor.prototype = Object.create(Tile.prototype);
Tile_Floor.prototype.GetHtml = function() {
	var html = Tile.prototype.GetHtml.call(this);
	return html;
}
Tile_Floor.prototype.UpdateValues = function() {
	Tile.prototype.UpdateValues.call(this);
};

var Tile_Pendulum = function(tileX, tileY) {
	Tile_Floor.call(this, tileX, tileY);
	this.TileHeight = 0;
	this.TileType = "pendulum";
	this.Color = "#ff00ff";
	this.Text = "Pendulum";
};
Tile_Pendulum.prototype = Object.create(Tile_Floor.prototype);

var Tile_RotatingCube = function(tileX, tileY) {
	Tile_Floor.call(this, tileX, tileY);
	this.TileHeight = 0;
	this.TileType = "rotcube";
	this.Color = "#ff00ff";
	this.Text = "Rotating Cube";
};
Tile_RotatingCube.prototype = Object.create(Tile_Floor.prototype);


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
	this.TileType = "end";
	this.Color = "#ff0000";
	this.Text = "End";
}
Tile_End.prototype = Object.create(Tile.prototype);

var Tile_Tracer = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileType = "tracer";
	this.Color = "#ff00ff";
	this.Text = "Tracer";
	this.WithFloor = true;
}
Tile_Tracer.prototype = Object.create(Tile.prototype);
Tile_Tracer.prototype.GetHtml = function() {
	var html = Tile.prototype.GetHtml.call(this);
	var onchange = "onchange=\"javascript:Designer.SelectedTile.UpdateValues();\"";
	html += "<br />WithFloor: <input id='input_withFloor' " + onchange + " type='checkbox' " +(this.WithFloor ? "checked" : "")  +">";
	return html;
}
Tile_Tracer.prototype.UpdateValues = function() {
	Tile.prototype.UpdateValues.call(this);
	this.WithFloor = $("#input_withFloor").is(':checked');
	this.Text = "Tracer";
};

var Tile_JumpPad = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileType = "jumppad";
	this.Color = "#0f0fff";
	this.Text = "Jpad";
}
Tile_JumpPad.prototype = Object.create(Tile.prototype);

var Tile_EndFinal = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileType = "end_final";
	this.Color = "#00ffff";
	this.Text = "Efinal";
	this.WithFloor = true;
}
Tile_EndFinal.prototype = Object.create(Tile.prototype);
Tile_EndFinal.prototype.GetHtml = function() {
	var html = Tile.prototype.GetHtml.call(this);
	var onchange = "onchange=\"javascript:Designer.SelectedTile.UpdateValues();\"";
	html += "<br />WithFloor: <input id='input_withFloor' " + onchange + " type='checkbox' " +(this.WithFloor ? "checked" : "")  +">";
	return html;
}
Tile_EndFinal.prototype.UpdateValues = function() {
	Tile.prototype.UpdateValues.call(this);
	this.WithFloor = $("#input_withFloor").is(':checked');
	this.Text = "Efinal";
};

var Tile_FloppyDisk = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileType = "floppydisk";
	this.Color = "#0fffff";
	this.Text = "Disk";
	this.WithFloor = true;
};
Tile_FloppyDisk.prototype = Object.create(Tile.prototype);
Tile_FloppyDisk.prototype.GetHtml = function() {
	var html = Tile.prototype.GetHtml.call(this);
	var onchange = "onchange=\"javascript:Designer.SelectedTile.UpdateValues();\"";
	html += "<br />WithFloor: <input id='input_withFloor' " + onchange + " type='checkbox' " +(this.WithFloor ? "checked" : "")  +">";
	return html;
}
Tile_FloppyDisk.prototype.UpdateValues = function() {
	Tile.prototype.UpdateValues.call(this);
	this.WithFloor = $("#input_withFloor").is(':checked');
	this.Text = "Disk";
};

// Scanner
var Tile_Scanner = function(tileX, tileY) {
	Tile.call(this, tileX, tileY);
	this.TileType = "scanner";
	this.Color = "#0affaf";
	this.Text = "Scanner";
	this.WithFloor = true;
	this.Targets = [ { x: tileX, y: 0, z: tileY } ];
};
Tile_Scanner.prototype = Object.create(Tile.prototype);
Tile_Scanner.prototype.GetHtml = function() {
	var html = Tile.prototype.GetHtml.call(this);
	var onchange = "onchange=\"javascript:Designer.SelectedTile.UpdateValues();\"";

	json = JSON.stringify(this.Targets);
	html += "<br />WithFloor: <input id='input_withFloor' " + onchange + " type='checkbox' " +(this.WithFloor ? "checked" : "")  +">";
	html += "<br />Targets: <textarea id='input_Targets' " + onchange + " type='checkbox' " +(this.WithFloor ? "checked" : "")  +">" + json + "</textarea>";
	return html;
}
Tile_Scanner.prototype.UpdateValues = function() {
	Tile.prototype.UpdateValues.call(this);
	this.WithFloor = $("#input_withFloor").is(':checked');
	this.Targets = JSON.parse($("#input_Targets").val());
	this.Text = "Scanner";
};

// Tab related
Designer.SelectTab = function(index) {
	$("#tab" + Designer.ActiveTab).removeAttr("class");
	$("#tab" + Designer.ActiveTab + "-content").hide();
	$("#tab" + index).attr("class", "active");
	$("#tab" + index + "-content").show();
	Designer.ActiveTab = index;
};
