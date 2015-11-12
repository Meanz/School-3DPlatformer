var Designer = {};

Designer.SaveX = 0;
Designer.SaveY = 0;
Designer.IsDragging = false;
Designer.OffsetX = 0;
Designer.OffsetY = 0;
Designer.Tiles = [];
Designer.TileSize = 32;

var NewTile = function(tileX, tileY) {

	this.TileX = tileX;
	this.TileY = tileY;

	this.OnRender = function() {

		Designer.Context.beginPath();

		var drawX = Math.floor((Math.floor(Designer.OffsetX / Designer.TileSize) + this.TileX) * Designer.TileSize)
				+ (Math.floor(Designer.OffsetX) % Designer.TileSize);

		var drawY = Math.floor((Math.floor(Designer.OffsetY / Designer.TileSize) + this.TileY) * Designer.TileSize)
				+ (Math.floor(Designer.OffsetY) % Designer.TileSize);

		Designer.Context.fillRect(drawX, drawY, Designer.TileSize, Designer.TileSize);
		Designer.Context.strokeStyle = "#00ff00";
		Designer.Context.stroke();
		console.log("drawing tile");
	};
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
		console.log("Drag Start");
	}
	if (MInput.IsMouseKeyReleased(MOUSE_LMB)) {
		Designer.IsDragging = false;
		console.log("Drag End");
	}

	if (MInput.IsMouseKeyReleased(MOUSE_RMB)) {
		//
		var tileX = Math.floor(MInput.MouseX / Designer.TileSize) - Math.floor(Designer.OffsetX / Designer.TileSize);
		var tileY = Math.floor(MInput.MouseY / Designer.TileSize) - Math.floor(Designer.OffsetY / Designer.TileSize);

		Designer.Tiles.push(new NewTile(tileX, tileY));

		console.log("added tile");
	}

	if ((MInput.DeltaMouseX != 0 || MInput.DeltaMouseY != 0) && Designer.IsDragging) {
		Designer.OffsetX += MInput.DeltaMouseX;
		Designer.OffsetY += MInput.DeltaMouseY;

		Designer.Render();
		console.log("Update frame");
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
	for (x = -1; x < numWTiles; x++) {
		for (y = -1; y < numHTiles; y++) {
			var drawX = (Math.floor(Designer.OffsetX) % Designer.TileSize) + Math.floor((x * Designer.TileSize));
			var drawY = (Math.floor(Designer.OffsetY) % Designer.TileSize) + Math.floor((y * Designer.TileSize));

			// console.log("drawx: " + drawX + " drawy: " + drawY);

			var tileX = x - Math.floor(Designer.OffsetX / Designer.TileSize);
			var tileY = y - Math.floor(Designer.OffsetY / Designer.TileSize);

			Designer.Context.rect(drawX, drawY, Designer.TileSize, Designer.TileSize);
			// Designer.Context.fillText("" + tileX + ", " + tileY, drawX + 3,
			// drawY + 15);
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
			console.log("has tile");
			if (tile.OnRender != undefined) {
				console.log("drawing tile 0");
				tile.OnRender();
			}
		}
	}

	// Draw debug text
	Designer.Context.fillStyle = "#000000";
	Designer.Context.font = "16px Arial";
	Designer.Context.fillText("OffsetX: " + Designer.OffsetX, 10, 20);
	Designer.Context.fillText("OffsetY: " + Designer.OffsetX, 10, 35);

	// calculate fps
	// Designer.Context.fillText("FPS: " + Designer.RefreshFPS(), 10, 50);
};
