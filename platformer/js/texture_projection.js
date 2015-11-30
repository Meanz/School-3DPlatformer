


var Designer = {};
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

	// Start render loop
	requestAnimationFrame(Designer.FrameRefresh);
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
	
	if(MInput.IsKeyReleased(KEY_1))
	{
		
		var minX = 100000, minY = 100000;
		var maxX = -100000, maxY = -100000;
		
		//
		if(Triangle.a.x < minX) {
			minX = Triangle.a.x;
		}
		if(Triangle.b.x < minX) {
			minX = Triangle.b.x;
		}
		if(Triangle.c.x < minX) {
			minX = Triangle.c.x;
		}
		
		//
		if(Triangle.a.y < minY) {
			minY = Triangle.a.y;
		}
		if(Triangle.b.y < minY) {
			minY = Triangle.b.y;
		}
		if(Triangle.c.y < minY) {
			minY = Triangle.c.y;
		}
		
		Triangle.a.x -= minX;
		Triangle.b.x -= minX;
		Triangle.c.x -= minX;
		Triangle.a.y -= minY;
		Triangle.b.y -= minY;
		Triangle.c.y -= minY;
		
	}
	
	if(MInput.IsKeyReleased(KEY_2))
	{
		//
		var a = Triangle.a;
		var b = Triangle.b;
		var ab = { x: b.x - a.x, y: b.y - a.y };
		var abl = Math.sqrt( (ab.x * ab.x) + (ab.y * ab.y));
		var abn = { x: ab.x / abl, y : ab.y / abl };
		
		var angle = -Math.acos(abn.x);
		
		var _cos = Math.cos(angle);
		var _sin = Math.sin(angle);
		
		var ax = (Triangle.a.x * _cos) - (Triangle.a.y * _sin);
		var ay = (Triangle.a.x * _sin) + (Triangle.a.y * _cos);

		var bx = (Triangle.b.x * _cos) - (Triangle.b.y * _sin);
		var by = (Triangle.b.x * _sin) + (Triangle.b.y * _cos);

		var cx = (Triangle.c.x * _cos) - (Triangle.c.y * _sin);
		var cy = (Triangle.c.x * _sin) + (Triangle.c.y * _cos);

		Triangle.a.x = ax;
		Triangle.a.y = ay;
		Triangle.b.x = bx;
		Triangle.b.y = by;
		Triangle.c.x = cx;
		Triangle.c.y = cy;
		
		console.log(angle);
		
	}

	// Flush input
	MInput.Flush();

	//
	Designer.Render();
};

var Triangle = 
{
	a : { x : 100, y : 100 },
	b : { x : 300, y : 200 },
	c : { x: 200, y : 300 }
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

	
	
	//Draw axes

	var maxY = 500;
	var minY = 50;
	var maxX = 700;
	var minX = 200;
	
	Designer.Context.moveTo(200, 50);
	Designer.Context.lineTo(200, 500);
	Designer.Context.moveTo(200, 500);
	Designer.Context.lineTo(700, 500);
	
	Designer.Context.fillText("Y", 200, 40);
	Designer.Context.fillText("X", 710, 500);
	
	//Draw triangle
	Designer.Context.moveTo(minX + Triangle.a.x, maxY - Triangle.a.y);
	Designer.Context.lineTo(minX + Triangle.b.x, maxY - Triangle.b.y);
	Designer.Context.moveTo(minX + Triangle.b.x, maxY - Triangle.b.y);
	Designer.Context.lineTo(minX + Triangle.c.x, maxY - Triangle.c.y);
	Designer.Context.moveTo(minX + Triangle.c.x, maxY - Triangle.c.y);
	Designer.Context.lineTo(minX + Triangle.a.x, maxY - Triangle.a.y);
	
	Designer.Context.strokeStyle = "#000000";
	Designer.Context.stroke();
	Designer.Context.closePath();

	// Draw debug text
	Designer.Context.beginPath();
	Designer.Context.fillStyle = "#000000";
	Designer.Context.font = "bolder 16px Arial";
	Designer.Context.closePath();
};

