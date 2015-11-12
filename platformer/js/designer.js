var Designer = {};

Designer.SaveX = 0;
Designer.SaveY = 0;
Designer.IsDragging = false;
Designer.OffsetX = 0;
Designer.OffsetY = 0;
Designer.Tiles = [];
Designer.Init = function() {

	Designer.Canvas = document.getElementById("level");
	Designer.Context = Designer.Canvas.getContext("2d");
	console.log(Designer.Context);

	// Event listeners
	MInput.AddListeners(Designer.Canvas);

	// Start rendering
	setInterval(Designer.Render, 20);
};

Designer.Render = function() {
	console.log("## Frame ##");
	
	//Update Input
	//MInput.Update();
	
	//Move!
	Designer.OffsetX += MInput.DeltaMouseX;
	Designer.OffsetY += MInput.DeltaMouseY;
	
	//
	var canvas = Designer.Canvas;
	var context = Designer.Context;

	// Clear
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw tile map thing
	var tileSize = 32;
	var minX = 0;
	var minY = 0;
	var maxX = canvas.width / tileSize;
	var maxY = canvas.height / tileSize;

	for (var x = minX; x < maxX; x++) {
		for (var y = minY; y < maxY; y++) {
			context.strokeStyle = "#ff0000";
			context.rect(x * tileSize, y * tileSize, tileSize, tileSize);
			context.stroke();
		}
	}

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
	context.font = "16px Arial";
	context.fillText("OffsetX: " + Designer.OffsetX, 10, 20);
	context.fillText("OffsetY: " + Designer.OffsetX, 10, 35);
	
	//Flush input
	//MInput.Flush();
};
