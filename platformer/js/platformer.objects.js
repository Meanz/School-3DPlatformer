Platformer.MainMenu = function(inPauseMode) {
	THREE.Object3D.call(this);
	// Base is THREE.Object3D
	this.Menu = "main";
	this.InPauseMode = inPauseMode;
	this.Clear = function() {
		for (var i = 0; i < this.children.length; i++) {
			SceneManager.Remove(this.children[i]);
		}
	};

	this.DisplayHelp = function() {
		var mainMenu = this;

		var text = SceneManager.Add(mainMenu, new Platformer.UIText("Inside the Mainframe", "48px Arial", "#ff0000",
				v3z()));
		text.SetPosition(0, Platformer.Camera.top - (text.GetHeight() / 2));

		SceneManager.Add(mainMenu, new Platformer.UIText("In dis game there is no halp!", "24px Arial", "#ff0000", v3z(
				0.0, -10.0)));

		this.startButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Back", v2(0, -50), function() {
			mainMenu.Clear();
			mainMenu.DisplayMainMenu();
		}));
	};

	this.DisplaySettings = function() {
		var mainMenu = this;

		var text = SceneManager.Add(mainMenu, new Platformer.UIText("Inside the Mainframe", "48px Arial", "#ff0000",
				v3z()));
		text.SetPosition(0, Platformer.Camera.top - (text.GetHeight() / 2));

		SceneManager.Add(mainMenu, new Platformer.UIText("You set me? NOOO, I SET YOU!", "24px Arial", "#ff0000", v3z(
				0.0, -10.0)));

		this.startButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Back", v2(0, -50), function() {
			mainMenu.Clear();
			mainMenu.DisplayMainMenu();
		}));
	};

	this.DisplayLevelMenu = function() {

		var mainMenu = this;

		var text = SceneManager.Add(mainMenu, new Platformer.UIText("Inside the Mainframe", "48px Arial", "#ff0000",
				v3z()));
		text.SetPosition(0, Platformer.Camera.top - (text.GetHeight() / 2));

		var levels = [ "level1.json", "level2.json", "leveltest.json", "niva1.json", "test.json", "test1.json" ];

		for (var i = 0; i < levels.length; i++) {
			var that = SceneManager.Add(mainMenu, new Platformer.UIButton(levels[i], v2(0, 100 - (i * 50)), function() {

				mainMenu.Clear();
				SceneManager.Remove(mainMenu);
				// Fix camera
				Platformer.Camera.toPerspective();

				Platformer.StartLevel(this.level);
				Platformer.LockCursor();
			}));
			that.level = levels[i];
		}

		SceneManager.Add(mainMenu, new Platformer.UIButton("Back", v2(0, 100 - (levels.length * 50) - 20), function() {
			mainMenu.Clear();
			mainMenu.DisplayMainMenu();
		}));
	};

	this.DisplayMainMenu = function() {

		var mainMenu = this;
		var text = SceneManager.Add(mainMenu, new Platformer.UIText("Inside the Mainframe", "48px Arial", "#ff0000",
				v3z()));
		text.SetPosition(0, Platformer.Camera.top - (text.GetHeight() / 2));

		if(this.InPauseMode) {
			this.resumeButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Resume", v2(0, 60), function() {
				mainMenu.Clear();
				SceneManager.Remove(mainMenu);
				// Fix camera
				Platformer.Camera.toPerspective();
				Platformer.IsPlaying = true;
				SceneManager.ShowLevel();
				Platformer.LockCursor();
			}));
		} else {
			this.startButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Start", v2(0, 60), function() {

				// Remove everything from zhe scene
				// alert("You clicked buttan");
				mainMenu.Clear();

				mainMenu.DisplayLevelMenu();
			}));
		}

		this.settingsButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Innstillinger", v2(0, 0), function() {
			mainMenu.Clear();
			mainMenu.DisplaySettings();
		}));
		this.helpButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Hjelp", v2(0, -60), function() {
			mainMenu.Clear();
			mainMenu.DisplayHelp();
		}));

	};

	this.OnStart = function() {
		// Switch camera
		Platformer.Camera.toOrthographic2(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2,
				-window.innerHeight / 2);
		Platformer.Camera.toFrontView();

		this.DisplayMainMenu();
	};

	this.onUpdate = function() {
		// set camera to ortho
	};

};
Platformer.MainMenu.prototype = Object.create(THREE.Object3D.prototype);
Platformer.MainMenu.constructor = Platformer.MainMenu;

Platformer.UIText = function(text, font, color, position) {
	this.Text = text;
	this.Font = font;
	this.Color = color;
	this.Position = position;
	this.TextTexture = new THREE.Texture(null);
	// Create text thing
	Util.DrawTextToTexture(text, font, color, this.TextTexture);
	this.Geometry = new THREE.PlaneGeometry(this.TextTexture.image.width, this.TextTexture.image.height, 1, 1);
	this.Material = new THREE.MeshLambertMaterial({
		color : 0xffffff,
		map : this.TextTexture
	});
	THREE.Mesh.call(this, this.Geometry, this.Material);
	this.SetText = function(text, font, color) {
		this.Text = text;
		this.Font = font;
		this.Color = color;
		Util.DrawTextToTexture(text, font, color, this.TextTexture);
	};
	this.GetWidth = function() {
		return this.TextTexture.image.width;
	};
	this.GetHeight = function() {
		return this.TextTexture.image.height;
	};
	this.SetPosition = function(x, y) {
		var v = v3(x, y, 0);
		this.position.copy(v);
	};
	this.position.copy(position);
};
Platformer.UIText.prototype = Object.create(THREE.Mesh.prototype);
Platformer.UIText.constructor = Platformer.UIText;

Platformer.UIButton = function(text, position, onClick) {
	var normalColor = "#ff0000";
	var hoverColor = "#00ff00";
	Platformer.UIText.call(this, text, "36px Arial", normalColor, v3(position.x, position.y, 0.0));
	this.SetPosition(position.x, position.y);
	this.IsHovering = false;
	this.onClick = onClick;
	this.onUpdate = function(delta) {
		// console.log("" + Platformer.MouseX + " / " + Platformer.MouseY + " --
		// " + this.width + " / " + this.height);
		// Get mouse coordinates
		if (Platformer.MouseX >= (this.position.x - (this.GetWidth() / 2))
				&& Platformer.MouseX <= (this.position.x + (this.GetWidth() / 2))
				&& Platformer.MouseY >= (-this.position.y - (this.GetHeight() / 2))
				&& Platformer.MouseY <= (-this.position.y + (this.GetHeight() / 2))) {
			if (!this.IsHovering) {
				this.SetText(this.Text, this.Font, hoverColor);
				this.IsHovering = true;
			}
			if (MInput.IsMouseKeyReleased(0)) {
				this.onClick();
			}
		} else {
			if (this.IsHovering) {
				this.SetText(this.Text, this.Font, normalColor);
				this.IsHovering = false;
			}
		}
	};
};
Platformer.UIButton.prototype = Object.create(Platformer.UIText.prototype);

Platformer.AddPlane = function(size, color, position) {
	this.Color = color;
	this.Position = position;
	this.Geometry = new THREE.PlaneGeometry(size.x, size.y, 1, 1);
	this.Material = new THREE.MeshLambertMaterial({
		color : this.Color
	});
	this.Mesh = new THREE.Mesh(this.Geometry, this.Material);
	this.SetPosition = function(x, y) {
		var v = v3(x, y, 0);
		this.Mesh.position.copy(v);
	};
	this.Mesh.position.copy(position);
	Platformer.Add(this.Mesh);
	return this;
};

Platformer.AddFloor = function(position, dimension, material) {
	if (material === undefined) {
		material = Platformer.DefaultMaterial;
	}
	var floor = Geometry.StaticBox(position, dimension, material);
	SceneManager.AddTile(floor);
	return floor;
};

Platformer.AddPlayer = function(position, dimension, material, mass) {
	if (material === undefined) {
		material = Platformer.DefaultMaterial;
	}
	var floor = Geometry.StaticBoxMass(position, dimension, material, mass);
	SceneManager.AddBase(floor);
	return floor;
};

Platformer.AddTestBox = function(position, dimension) {
	var testMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
		map : loader.load('images/plywood.jpg')
	}), .8, // high friction
	.4 // low restitution
	);

	var box = Geometry.StaticBox(position, dimension, testMaterial);

	box.value = 0;
	box.reverse = false;
	box.onUpdate = function() {
		if (box.reverse) {
			box.value--;
		} else {
			box.value++;
		}

		box.scale.x = box.value * 0.1;
		box.scale.y = box.value * 0.1;
		box.scale.z = box.value * 0.1;

		if (box.value > 100) {
			box.reverse = true;
		} else if (box.value < 0) {
			box.reverse = false;
		}

	};

	SceneManager.Add(box);
};

Platformer.AddTracer = function(position) {
	var tracer = new THREE.Mesh(Platformer.Tracer.geomery, Platformer.Tracer.material);
	tracer.position.set(position.x, position.y, position.z);
	tracer.scale.set(0.08, 0.08, 0.08);
	tracer.isActive = false;
	tracer.speed = 1;
	tracer.t = 1;
	tracer.speedVector = v3z();

	tracer.onRender = function(delta) {
		var player = Platformer.Scene.getObjectByName("player");
		var disVec = v3z();
		disVec.subVectors(player.position, tracer.position);

		if (tracer.isActive) {
			if (disVec.length() < 3.2) {
				Platformer.PlayerDied("tracer");
			} else {
				tracer.speedVector.subVectors(player.position, tracer.position);
				tracer.speedVector.normalize();
				tracer.speedVector.multiplyScalar(delta / 1000 * tracer.speed);
				tracer.position.add(tracer.speedVector);
			}
		} else {

			if (disVec.length() < 20) {
				tracer.isActive = true;
				console.log("Tracer became active");
			}
		}
	};

	console.log("Tracer created");
	SceneManager.Add(tracer);
	return tracer;

};

Platformer.AddScanner = function(positions) {
	var scanner = new THREE.Mesh(Platformer.Scanner.geomery, Platformer.Scanner.material);
	scanner.position.set(positions[0].y, positions[0].x, positions[0].z);
	scanner.scale.set(0.05, 0.05, 0.05);
	scanner.rotation.z = -Math.PI / 2;
	scanner.speed = 3;

	var scannerSpot = new THREE.SpotLight(0xff3333, 1.0, 20, Math.PI / 4, 0.5, 0.5);
	scannerSpot.position.set(scanner.position.x, scanner.position.y + 1.01, scanner.position.z);
	scannerSpot.target = scanner;
	scanner.spot = scannerSpot;
	SceneManager.Add(scannerSpot);
	scanner.sound = new THREE.Audio(Platformer.audioListener);
	scanner.sound.load("sounds/160421__bigkahuna360__electrical-shock-zap.wav");
	scanner.add(scanner.sound);
	scanner.cooldownTime = 5000;
	scanner.cooldown = 0;
	scanner.speed = 4;

	if (positions.length > 1) {
		var tweens = [];
		tweens.push(new TWEEN.Tween(scanner.position).to({
			x : positions[1].x,
			y : positions[1].y,
			z : positions[1].z
		}, positions[0].distanceTo(positions[1]) * 1000 / scanner.speed));

		for (var i = 1; i < positions.length - 1; i++) {
			var tween = new TWEEN.Tween(scanner.position).to({
				x : positions[i + 1].x,
				y : positions[i + 1].y,
				z : positions[i + 1].z
			}, positions[i].distanceTo(positions[i + 1]) * 1000 / scanner.speed);
			tweens.push(tween);
			tweens[i - 1].chain(tweens[i]);
		}
		var tween = new TWEEN.Tween(scanner.position).to({
			x : positions[0].x,
			y : positions[0].y,
			z : positions[0].z
		}, positions[tweens.length].distanceTo(positions[0]) * 1000 / scanner.speed);
		tweens.push(tween);
		tweens[tweens.length - 2].chain(tweens[tweens.length - 1]);
		tweens[tweens.length - 1].chain(tweens[0]);

		tweens[0].start();
	}
	scanner.onTweenUpdate = function() {

	};

	console.log("Scanner created");

	scanner.onRender = function(delta) {
		if (scanner.cooldown <= 0) {
			scanner.spot.visible = true;
			var player = Platformer.Scene.getObjectByName("player");
			var vScanToPlay = v3z().subVectors(scanner.position, player.position);
			var angleToY = vScanToPlay.angleTo(v3(0, 1, 0));
			// console.log("To player angle: " + angleToY);
			// console.log("Spot angle: " + scanner.spot.angle);
			if (angleToY < scanner.spot.angle && vScanToPlay.length() < scanner.spot.distance) {
				Platformer.PlayerSeenByScanner(scanner.id);
				scanner.spot.visible = false;
				if (scanner.sound.source.buffer instanceof AudioBuffer) {
					scanner.sound.play();
				} else {
					Platformer.LogError("AudioBuffer not loaded")
				}

				scanner.cooldown = scanner.cooldownTime;
			}
		} else {
			scanner.cooldown -= delta;
			if (scanner.cooldown <= 0) {

				// scanner.sound.stop();
			}
		}

		scanner.spot.position.set(scanner.position.x, scanner.position.y + 1.01, scanner.position.z);

	};
	SceneManager.Add(scanner);
	return scanner;

};

Platformer.AddTeleporter = function(position) {
	var teleporter = new THREE.Mesh(Platformer.Teleporter.geomery, Platformer.Teleporter.material);
	teleporter.position.copy(position);
	teleporter.scale.set(0.09, 0.09, 0.09);

	teleporter.onRender = function(delta) {
		var player = Platformer.Scene.getObjectByName("player");
		var difVec = v3z().subVectors(player.position, teleporter.position);
		if (difVec.length() < 1
				&& (player.position.y >= teleporter.position.y && player.position.y < teleporter.position.y + 3)) {
			Platformer.PlayerReachedEnd();
		}
	};

	console.log("Teleporter created");
	SceneManager.Add(teleporter);
	return teleporter;
};

Platformer.AddJumppad = function(position) {
	// var jumppad = new Physijs.ConvexMesh(Platformer.Jumppad.geomery,
	// Platformer.Jumppad.material, 0);
	var jumppad = new THREE.Mesh(Platformer.Jumppad.geomery, Platformer.Jumppad.material);
	jumppad.position.copy(position);
	jumppad.scale.set(0.09, 0.09, 0.09);
	jumppad.cooldownTime = 5000;
	jumppad.cooldown = 0;

	jumppad.onUpdate = function(delta) {
		if (jumppad.cooldown <= 0) {
			var player = Platformer.Scene.getObjectByName("player");
			if (v3z().subVectors(player.position, jumppad.position).length() < 2) {
				player.applyCentralImpulse(v3(0, 500, 0));
				jumppad.cooldown = jumppad.cooldownTime;
			}
		} else {
			jumppad.cooldown -= delta;
		}

	};

	console.log("Jumppad created");
	SceneManager.Add(jumppad);
	return jumppad;
};

Platformer.AddFloppyDisk = function(position, extraTime) {
	var floppyDisk = new THREE.Mesh(Platformer.FloppyDisk.geomery, Platformer.FloppyDisk.material);
	floppyDisk.position.copy(position);
	floppyDisk.scale.set(0.09, 0.09, 0.09);

	if (extraTime === undefined) {
		extraTime = 10000;
	}
	floppyDisk.extraTime = extraTime;

	floppyDisk.onUpdate = function() {
		var player = Platformer.Scene.getObjectByName("player");
		if (floppyDisk.position.distanceTo(player.position) < 2) {
			/*
			 * TODO: Gjør at spilleren får mer tid Terminer seg selv
			 */
		}
	};
};

Platformer.ParseJsonObjects = function() {

	var tracerParced = Platformer.jsonLoader.parse(Platformer.jsonModels.GetTracer());
	Platformer.Tracer = {};
	Platformer.Tracer.geomery = tracerParced.geometry;
	Platformer.Tracer.material = new THREE.MeshPhongMaterial({
		color : 0x384040,
		specular : 0xD6D6D6,
		shininess : 10
	});

	var scannerParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetScanner());
	Platformer.Scanner = {};
	Platformer.Scanner.geomery = scannerParsed.geometry;
	Platformer.Scanner.material = new THREE.MeshPhongMaterial({
		color : 0x140404,
		specular : 0xD6D6D6,
		shininess : 10
	});

	var jumppadParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetJumppad());
	Platformer.Jumppad = {};
	Platformer.Jumppad.geomery = jumppadParsed.geometry;
	Platformer.Jumppad.material = new THREE.MeshPhongMaterial();
	Platformer.textureLoader.load("images/jumppadTex.png", function(texture) {
		Platformer.Jumppad.material.setValues({
			map : texture
		});
	});

	var floppyDiskParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetFloppyDisk());
	Platformer.FloppyDisk = {};
	Platformer.FloppyDisk.geomery = floppyDiskParsed.geometry;
	Platformer.FloppyDisk.material = new THREE.MeshPhongMaterial();
	Platformer.textureLoader.load("images/floppydiskTex.png", function(texture) {
		Platformer.FloppyDisk.material.setValues({
			map : texture
		});
	});
	var teleporterParsed = Platformer.jsonLoader.parse({

		"metadata" : {
			"sourceFile" : "enemies03.max",
			"generatedBy" : "3ds max ThreeJSExporter",
			"formatVersion" : 3.1,
			"vertices" : 844,
			"normals" : 1680,
			"colors" : 0,
			"uvs" : 1007,
			"triangles" : 1680
		},

		"vertices" : [ 22.9088, 0.0, 5.59568e-007, 21.7876, 0.0, -7.07921, 18.5336, 0.0, -13.4655, 13.4655, 0.0,
				-18.5336, 7.07921, 0.0, -21.7876, -3.26346e-006, 0.0, -22.9088, -7.07921, 0.0, -21.7876, -13.4655, 0.0,
				-18.5336, -18.5336, 0.0, -13.4655, -21.7876, 0.0, -7.07921, -22.9088, 0.0, 8.0242e-006, -21.7876, 0.0,
				7.07922, -18.5336, 0.0, 13.4655, -13.4654, 0.0, 18.5336, -7.0792, 0.0, 21.7876, 1.98586e-005, 0.0,
				22.9088, 7.07923, 0.0, 21.7876, 13.4655, 0.0, 18.5336, 18.5336, 0.0, 13.4654, 21.7876, 0.0, 7.07918,
				15.279, 2.05024, 0.0, 14.5312, 2.05024, -4.72149, 12.361, 2.05024, -8.9808, 8.9808, 2.05024, -12.361,
				4.72148, 2.05024, -14.5312, -6.67868e-007, 2.05024, -15.279, -4.72149, 2.05024, -14.5312, -8.9808,
				2.05024, -12.361, -12.361, 2.05024, -8.9808, -14.5312, 2.05024, -4.72148, -15.279, 2.05024,
				4.97855e-006, -14.5312, 2.05024, 4.72149, -12.361, 2.05024, 8.98081, -8.98079, 2.05024, 12.361,
				-4.72147, 2.05024, 14.5312, 1.47534e-005, 2.05024, 15.279, 4.7215, 2.05024, 14.5312, 8.98081, 2.05024,
				12.361, 12.361, 2.05024, 8.98078, 14.5312, 2.05024, 4.72146, 0.0, 69.8002, 0.0, 4.96989, 66.7286, 0.0,
				1.53578, 66.7286, -4.72665, -4.02073, 66.7286, -2.92123, -4.02072, 66.7286, 2.92123, 1.53578, 66.7286,
				4.72665, 4.02072, 61.7587, -2.92123, -1.53578, 61.7587, -4.72665, -4.96989, 61.7587, 4.34482e-007,
				-1.53578, 61.7587, 4.72665, 4.02072, 61.7587, 2.92123, 0.0, 58.6872, 0.0, -1.14205e-006, 64.2437,
				-26.127, -1.12773e-006, 65.3589, -25.7995, -1.08934e-006, 66.12, -24.9211, -1.03905e-006, 66.2855,
				-23.7706, -9.92833e-007, 65.8026, -22.7134, -9.65365e-007, 64.8248, -22.085, -9.65365e-007, 63.6625,
				-22.085, -9.92833e-007, 62.6847, -22.7134, -1.03905e-006, 62.2019, -23.7706, -1.08934e-006, 62.3673,
				-24.9211, -1.12773e-006, 63.1284, -25.7995, 6.76216, 64.2437, -25.2367, 6.67741, 65.3589, -24.9204,
				6.45006, 66.12, -24.0719, 6.15229, 66.2855, -22.9607, 5.87865, 65.8026, -21.9394, 5.71601, 64.8248,
				-21.3324, 5.71601, 63.6625, -21.3324, 5.87865, 62.6847, -21.9394, 6.15229, 62.2019, -22.9607, 6.45006,
				62.3673, -24.0719, 6.67741, 63.1284, -24.9204, 13.0635, 64.2437, -22.6266, 12.8998, 65.3589, -22.343,
				12.4606, 66.12, -21.5823, 11.8853, 66.2855, -20.586, 11.3567, 65.8026, -19.6704, 11.0425, 64.8248,
				-19.1262, 11.0425, 63.6625, -19.1262, 11.3567, 62.6847, -19.6704, 11.8853, 62.2019, -20.586, 12.4606,
				62.3673, -21.5823, 12.8998, 63.1284, -22.343, 18.4746, 64.2437, -18.4746, 18.243, 65.3589, -18.243,
				17.6219, 66.12, -17.6219, 16.8084, 66.2855, -16.8084, 16.0608, 65.8026, -16.0608, 15.6164, 64.8248,
				-15.6164, 15.6164, 63.6625, -15.6164, 16.0608, 62.6847, -16.0608, 16.8084, 62.2019, -16.8084, 17.6219,
				62.3673, -17.6219, 18.243, 63.1284, -18.243, 22.6266, 64.2437, -13.0635, 22.343, 65.3589, -12.8998,
				21.5823, 66.12, -12.4606, 20.586, 66.2855, -11.8853, 19.6704, 65.8026, -11.3567, 19.1262, 64.8248,
				-11.0425, 19.1262, 63.6625, -11.0425, 19.6704, 62.6847, -11.3567, 20.586, 62.2019, -11.8853, 21.5823,
				62.3673, -12.4606, 22.343, 63.1284, -12.8998, 25.2367, 64.2437, -6.76216, 24.9204, 65.3589, -6.67741,
				24.0719, 66.12, -6.45006, 22.9607, 66.2855, -6.15229, 21.9394, 65.8026, -5.87865, 21.3324, 64.8248,
				-5.71601, 21.3324, 63.6625, -5.71601, 21.9394, 62.6847, -5.87865, 22.9607, 62.2019, -6.15229, 24.0719,
				62.3673, -6.45006, 24.9204, 63.1284, -6.67741, 26.127, 64.2437, 0.0, 25.7995, 65.3589, 0.0, 24.9211,
				66.12, 0.0, 23.7706, 66.2855, 0.0, 22.7134, 65.8026, 0.0, 22.085, 64.8248, 0.0, 22.085, 63.6625, 0.0,
				22.7134, 62.6847, 0.0, 23.7706, 62.2019, 0.0, 24.9211, 62.3673, 0.0, 25.7995, 63.1284, 0.0, 25.2367,
				64.2437, 6.76216, 24.9204, 65.3589, 6.67741, 24.0719, 66.12, 6.45006, 22.9607, 66.2855, 6.15229,
				21.9394, 65.8026, 5.87865, 21.3324, 64.8248, 5.71601, 21.3324, 63.6625, 5.71601, 21.9394, 62.6847,
				5.87865, 22.9607, 62.2019, 6.15229, 24.0719, 62.3673, 6.45006, 24.9204, 63.1284, 6.67741, 22.6266,
				64.2437, 13.0635, 22.343, 65.3589, 12.8998, 21.5823, 66.12, 12.4606, 20.586, 66.2855, 11.8853, 19.6704,
				65.8026, 11.3567, 19.1262, 64.8248, 11.0425, 19.1262, 63.6625, 11.0425, 19.6704, 62.6847, 11.3567,
				20.586, 62.2019, 11.8853, 21.5823, 62.3673, 12.4606, 22.343, 63.1284, 12.8998, 18.4746, 64.2437,
				18.4746, 18.243, 65.3589, 18.243, 17.6219, 66.12, 17.6219, 16.8084, 66.2855, 16.8084, 16.0608, 65.8026,
				16.0608, 15.6164, 64.8248, 15.6164, 15.6164, 63.6625, 15.6164, 16.0608, 62.6847, 16.0608, 16.8084,
				62.2019, 16.8084, 17.6219, 62.3673, 17.6219, 18.243, 63.1284, 18.243, 13.0635, 64.2437, 22.6266,
				12.8998, 65.3589, 22.343, 12.4606, 66.12, 21.5823, 11.8853, 66.2855, 20.586, 11.3567, 65.8026, 19.6704,
				11.0425, 64.8248, 19.1262, 11.0425, 63.6625, 19.1262, 11.3567, 62.6847, 19.6704, 11.8853, 62.2019,
				20.586, 12.4606, 62.3673, 21.5823, 12.8998, 63.1284, 22.343, 6.76216, 64.2437, 25.2367, 6.67741,
				65.3589, 24.9204, 6.45006, 66.12, 24.0719, 6.15229, 66.2855, 22.9607, 5.87865, 65.8026, 21.9394,
				5.71601, 64.8248, 21.3324, 5.71601, 63.6625, 21.3324, 5.87865, 62.6847, 21.9394, 6.15229, 62.2019,
				22.9607, 6.45006, 62.3673, 24.0719, 6.67741, 63.1284, 24.9204, 1.97253e-006, 64.2437, 26.127,
				1.94781e-006, 65.3589, 25.7995, 1.88149e-006, 66.12, 24.9211, 1.79463e-006, 66.2855, 23.7706,
				1.71481e-006, 65.8026, 22.7134, 1.66737e-006, 64.8248, 22.085, 1.66737e-006, 63.6625, 22.085,
				1.71481e-006, 62.6847, 22.7134, 1.79463e-006, 62.2019, 23.7706, 1.88149e-006, 62.3673, 24.9211,
				1.94781e-006, 63.1284, 25.7995, -6.76216, 64.2437, 25.2367, -6.6774, 65.3589, 24.9204, -6.45005, 66.12,
				24.0719, -6.15229, 66.2855, 22.9607, -5.87865, 65.8026, 21.9394, -5.71601, 64.8248, 21.3324, -5.71601,
				63.6625, 21.3324, -5.87865, 62.6847, 21.9394, -6.15229, 62.2019, 22.9607, -6.45006, 62.3673, 24.0719,
				-6.6774, 63.1284, 24.9204, -13.0635, 64.2437, 22.6266, -12.8998, 65.3589, 22.343, -12.4606, 66.12,
				21.5823, -11.8853, 66.2855, 20.586, -11.3567, 65.8026, 19.6704, -11.0425, 64.8248, 19.1262, -11.0425,
				63.6625, 19.1262, -11.3567, 62.6847, 19.6704, -11.8853, 62.2019, 20.586, -12.4606, 62.3673, 21.5823,
				-12.8998, 63.1284, 22.343, -18.4746, 64.2437, 18.4746, -18.243, 65.3589, 18.243, -17.6219, 66.12,
				17.6219, -16.8084, 66.2855, 16.8084, -16.0608, 65.8026, 16.0608, -15.6164, 64.8248, 15.6164, -15.6164,
				63.6625, 15.6164, -16.0608, 62.6847, 16.0608, -16.8084, 62.2019, 16.8084, -17.6219, 62.3673, 17.6219,
				-18.243, 63.1284, 18.243, -22.6266, 64.2437, 13.0635, -22.343, 65.3589, 12.8998, -21.5823, 66.12,
				12.4606, -20.586, 66.2855, 11.8853, -19.6703, 65.8026, 11.3567, -19.1261, 64.8248, 11.0425, -19.1261,
				63.6625, 11.0425, -19.6703, 62.6847, 11.3567, -20.586, 62.2019, 11.8853, -21.5823, 62.3673, 12.4606,
				-22.343, 63.1284, 12.8998, -25.2367, 64.2437, 6.76217, -24.9204, 65.3589, 6.67742, -24.0719, 66.12,
				6.45007, -22.9607, 66.2855, 6.1523, -21.9394, 65.8026, 5.87866, -21.3324, 64.8248, 5.71602, -21.3324,
				63.6625, 5.71602, -21.9394, 62.6847, 5.87866, -22.9607, 62.2019, 6.1523, -24.0719, 62.3673, 6.45007,
				-24.9204, 63.1284, 6.67742, -26.127, 64.2437, 1.01742e-005, -25.7995, 65.3589, 1.00467e-005, -24.9211,
				66.12, 9.70464e-006, -23.7706, 66.2855, 9.25663e-006, -22.7134, 65.8026, 8.84491e-006, -22.085,
				64.8248, 8.60021e-006, -22.085, 63.6625, 8.60021e-006, -22.7134, 62.6847, 8.84491e-006, -23.7706,
				62.2019, 9.25663e-006, -24.9211, 62.3673, 9.70464e-006, -25.7995, 63.1284, 1.00467e-005, -25.2367,
				64.2437, -6.76215, -24.9204, 65.3589, -6.6774, -24.0719, 66.12, -6.45005, -22.9607, 66.2855, -6.15228,
				-21.9394, 65.8026, -5.87864, -21.3325, 64.8248, -5.716, -21.3325, 63.6625, -5.716, -21.9394, 62.6847,
				-5.87864, -22.9607, 62.2019, -6.15228, -24.0719, 62.3673, -6.45005, -24.9204, 63.1284, -6.6774,
				-22.6266, 64.2437, -13.0635, -22.343, 65.3589, -12.8997, -21.5823, 66.12, -12.4605, -20.586, 66.2855,
				-11.8853, -19.6704, 65.8026, -11.3567, -19.1262, 64.8248, -11.0425, -19.1262, 63.6625, -11.0425,
				-19.6704, 62.6847, -11.3567, -20.586, 62.2019, -11.8853, -21.5823, 62.3673, -12.4605, -22.343, 63.1284,
				-12.8997, -18.4746, 64.2437, -18.4746, -18.243, 65.3589, -18.243, -17.6219, 66.12, -17.6219, -16.8084,
				66.2855, -16.8084, -16.0608, 65.8026, -16.0608, -15.6164, 64.8248, -15.6164, -15.6164, 63.6625,
				-15.6164, -16.0608, 62.6847, -16.0608, -16.8084, 62.2019, -16.8084, -17.6219, 62.3673, -17.6219,
				-18.243, 63.1284, -18.243, -13.0635, 64.2437, -22.6266, -12.8998, 65.3589, -22.343, -12.4606, 66.12,
				-21.5823, -11.8853, 66.2855, -20.586, -11.3567, 65.8026, -19.6703, -11.0425, 64.8248, -19.1261,
				-11.0425, 63.6625, -19.1261, -11.3567, 62.6847, -19.6703, -11.8853, 62.2019, -20.586, -12.4606,
				62.3673, -21.5823, -12.8998, 63.1284, -22.343, -6.76217, 64.2437, -25.2367, -6.67742, 65.3589,
				-24.9204, -6.45007, 66.12, -24.0719, -6.1523, 66.2855, -22.9607, -5.87866, 65.8026, -21.9394, -5.71602,
				64.8248, -21.3324, -5.71602, 63.6625, -21.3324, -5.87866, 62.6847, -21.9394, -6.1523, 62.2019,
				-22.9607, -6.45007, 62.3673, -24.0719, -6.67742, 63.1284, -24.9204, -8.47027e-007, 83.5728,
				8.47027e-007, -8.36411e-007, 83.3299, 0.827134, -8.07933e-007, 82.6784, 1.39166, -7.70635e-007,
				81.8251, 1.51434, -7.36359e-007, 81.041, 1.15623, -7.15987e-007, 80.5749, 0.431026, -7.15987e-007,
				80.5749, -0.431026, -7.36359e-007, 81.041, -1.15623, -7.70635e-007, 81.8251, -1.51434, -8.07933e-007,
				82.6784, -1.39166, -8.36411e-007, 83.3299, -0.827132, 5.01532, 82.9125, 8.18165e-007, 4.95247, 82.6779,
				0.827134, 4.78384, 82.0486, 1.39166, 4.563, 81.2244, 1.51434, 4.36005, 80.4669, 1.15623, 4.23942,
				80.0168, 0.431026, 4.23942, 80.0168, -0.431026, 4.36005, 80.4669, -1.15623, 4.563, 81.2244, -1.51434,
				4.78385, 82.0486, -1.39166, 4.95247, 82.6779, -0.827132, 9.68886, 80.9766, 7.33547e-007, 9.56743,
				80.7663, 0.827134, 9.24168, 80.2021, 1.39166, 8.81504, 79.4631, 1.51434, 8.42296, 78.784, 1.15623,
				8.18993, 78.3804, 0.431026, 8.18993, 78.3804, -0.431026, 8.42296, 78.784, -1.15623, 8.81504, 79.4631,
				-1.51434, 9.24168, 80.2021, -1.39166, 9.56743, 80.7663, -0.827132, 13.7021, 77.8971, 5.98939e-007,
				13.5304, 77.7254, 0.827133, 13.0697, 77.2647, 1.39166, 12.4663, 76.6614, 1.51434, 11.9119, 76.1069,
				1.15623, 11.5823, 75.7773, 0.431026, 11.5823, 75.7773, -0.431026, 11.9119, 76.1069, -1.15623, 12.4663,
				76.6614, -1.51434, 13.0697, 77.2647, -1.39166, 13.5304, 77.7254, -0.827132, 16.7816, 73.8839,
				4.23514e-007, 16.5713, 73.7625, 0.827133, 16.0071, 73.4367, 1.39166, 15.2681, 73.0101, 1.51434, 14.589,
				72.618, 1.15623, 14.1854, 72.385, 0.431026, 14.1854, 72.385, -0.431026, 14.589, 72.618, -1.15623,
				15.2681, 73.0101, -1.51434, 16.0071, 73.4367, -1.39166, 16.5713, 73.7625, -0.827133, 18.7174, 69.2104,
				2.19227e-007, 18.4828, 69.1475, 0.827133, 17.8535, 68.9789, 1.39166, 17.0293, 68.758, 1.51434, 16.2719,
				68.5551, 1.15623, 15.8217, 68.4344, 0.431026, 15.8217, 68.4344, -0.431026, 16.2719, 68.5551, -1.15623,
				17.0293, 68.758, -1.51434, 17.8536, 68.9789, -1.39166, 18.4828, 69.1475, -0.827133, 19.3777, 64.195,
				0.0, 19.1349, 64.195, 0.827133, 18.4834, 64.195, 1.39166, 17.6301, 64.195, 1.51434, 16.8459, 64.195,
				1.15623, 16.3799, 64.195, 0.431026, 16.3799, 64.195, -0.431026, 16.8459, 64.195, -1.15623, 17.6301,
				64.195, -1.51434, 18.4834, 64.195, -1.39166, 19.1349, 64.195, -0.827133, 18.7174, 59.1797,
				-2.19227e-007, 18.4828, 59.2426, 0.827133, 17.8535, 59.4112, 1.39166, 17.0293, 59.632, 1.51434,
				16.2719, 59.835, 1.15623, 15.8217, 59.9556, 0.431026, 15.8217, 59.9556, -0.431026, 16.2719, 59.835,
				-1.15623, 17.0293, 59.632, -1.51434, 17.8536, 59.4112, -1.39166, 18.4828, 59.2426, -0.827133, 16.7816,
				54.5062, -4.23514e-007, 16.5713, 54.6276, 0.827132, 16.0071, 54.9534, 1.39166, 15.2681, 55.38, 1.51434,
				14.589, 55.7721, 1.15623, 14.1854, 56.0051, 0.431025, 14.1854, 56.0051, -0.431027, 14.589, 55.7721,
				-1.15623, 15.2681, 55.38, -1.51434, 16.0071, 54.9534, -1.39166, 16.5713, 54.6276, -0.827133, 13.7021,
				50.4929, -5.98939e-007, 13.5304, 50.6646, 0.827132, 13.0697, 51.1253, 1.39166, 12.4663, 51.7287,
				1.51434, 11.9119, 52.2832, 1.15623, 11.5823, 52.6127, 0.431025, 11.5823, 52.6127, -0.431027, 11.9119,
				52.2832, -1.15623, 12.4663, 51.7287, -1.51434, 13.0697, 51.1253, -1.39166, 13.5304, 50.6646, -0.827134,
				9.68886, 47.4134, -7.33547e-007, 9.56743, 47.6238, 0.827132, 9.24168, 48.188, 1.39166, 8.81504,
				48.9269, 1.51434, 8.42296, 49.606, 1.15623, 8.18993, 50.0096, 0.431025, 8.18993, 50.0096, -0.431027,
				8.42296, 49.606, -1.15623, 8.81504, 48.9269, -1.51434, 9.24168, 48.188, -1.39166, 9.56743, 47.6238,
				-0.827134, 5.01532, 45.4776, -8.18165e-007, 4.95247, 45.7122, 0.827132, 4.78384, 46.3415, 1.39166,
				4.563, 47.1657, 1.51434, 4.36005, 47.9231, 1.15623, 4.23942, 48.3733, 0.431025, 4.23942, 48.3733,
				-0.431027, 4.36005, 47.9231, -1.15623, 4.563, 47.1657, -1.51434, 4.78385, 46.3415, -1.39166, 4.95247,
				45.7122, -0.827134, 1.46298e-006, 44.8173, -8.47027e-007, 1.44464e-006, 45.0602, 0.827132,
				1.39545e-006, 45.7117, 1.39166, 1.33103e-006, 46.5649, 1.51434, 1.27183e-006, 47.3491, 1.15623,
				1.23665e-006, 47.8152, 0.431025, 1.23665e-006, 47.8152, -0.431027, 1.27183e-006, 47.3491, -1.15623,
				1.33103e-006, 46.5649, -1.51434, 1.39545e-006, 45.7117, -1.39166, 1.44464e-006, 45.0602, -0.827134,
				-5.01532, 45.4776, -8.18165e-007, -4.95246, 45.7122, 0.827132, -4.78384, 46.3415, 1.39166, -4.563,
				47.1657, 1.51434, -4.36004, 47.9231, 1.15623, -4.23942, 48.3733, 0.431025, -4.23942, 48.3733,
				-0.431027, -4.36004, 47.9231, -1.15623, -4.563, 47.1657, -1.51434, -4.78384, 46.3415, -1.39166,
				-4.95246, 45.7122, -0.827134, -9.68886, 47.4134, -7.33547e-007, -9.56742, 47.6238, 0.827132, -9.24168,
				48.188, 1.39166, -8.81504, 48.9269, 1.51434, -8.42296, 49.606, 1.15623, -8.18993, 50.0096, 0.431025,
				-8.18993, 50.0096, -0.431027, -8.42296, 49.606, -1.15623, -8.81504, 48.9269, -1.51434, -9.24168,
				48.188, -1.39166, -9.56742, 47.6238, -0.827134, -13.7021, 50.4929, -5.98939e-007, -13.5304, 50.6646,
				0.827132, -13.0697, 51.1253, 1.39166, -12.4663, 51.7287, 1.51434, -11.9119, 52.2832, 1.15623, -11.5823,
				52.6127, 0.431025, -11.5823, 52.6127, -0.431027, -11.9119, 52.2832, -1.15623, -12.4663, 51.7287,
				-1.51434, -13.0697, 51.1253, -1.39166, -13.5304, 50.6646, -0.827134, -16.7816, 54.5062, -4.23514e-007,
				-16.5713, 54.6276, 0.827132, -16.0071, 54.9533, 1.39166, -15.2681, 55.38, 1.51434, -14.589, 55.7721,
				1.15623, -14.1854, 56.0051, 0.431025, -14.1854, 56.0051, -0.431027, -14.589, 55.7721, -1.15623,
				-15.2681, 55.38, -1.51434, -16.0071, 54.9533, -1.39166, -16.5713, 54.6276, -0.827133, -18.7174,
				59.1797, -2.19227e-007, -18.4828, 59.2426, 0.827133, -17.8535, 59.4112, 1.39166, -17.0293, 59.632,
				1.51434, -16.2719, 59.835, 1.15623, -15.8217, 59.9556, 0.431026, -15.8217, 59.9556, -0.431026,
				-16.2719, 59.835, -1.15623, -17.0293, 59.632, -1.51434, -17.8535, 59.4112, -1.39166, -18.4828, 59.2426,
				-0.827133, -19.3777, 64.195, 0.0, -19.1349, 64.195, 0.827133, -18.4834, 64.195, 1.39166, -17.6301,
				64.195, 1.51434, -16.8459, 64.195, 1.15623, -16.3799, 64.195, 0.431026, -16.3799, 64.195, -0.431026,
				-16.8459, 64.195, -1.15623, -17.6301, 64.195, -1.51434, -18.4834, 64.195, -1.39166, -19.1349, 64.195,
				-0.827133, -18.7174, 69.2103, 2.19226e-007, -18.4828, 69.1475, 0.827133, -17.8536, 68.9789, 1.39166,
				-17.0294, 68.758, 1.51434, -16.2719, 68.5551, 1.15623, -15.8217, 68.4344, 0.431026, -15.8217, 68.4344,
				-0.431026, -16.2719, 68.5551, -1.15623, -17.0294, 68.758, -1.51434, -17.8536, 68.9789, -1.39166,
				-18.4828, 69.1475, -0.827133, -16.7816, 73.8839, 4.23513e-007, -16.5713, 73.7625, 0.827133, -16.0071,
				73.4367, 1.39166, -15.2681, 73.0101, 1.51434, -14.589, 72.618, 1.15623, -14.1854, 72.385, 0.431026,
				-14.1854, 72.385, -0.431026, -14.589, 72.618, -1.15623, -15.2681, 73.0101, -1.51434, -16.0071, 73.4367,
				-1.39166, -16.5713, 73.7625, -0.827133, -13.7021, 77.8971, 5.98938e-007, -13.5304, 77.7254, 0.827133,
				-13.0697, 77.2647, 1.39166, -12.4664, 76.6614, 1.51434, -11.9119, 76.1069, 1.15623, -11.5823, 75.7773,
				0.431026, -11.5823, 75.7773, -0.431026, -11.9119, 76.1069, -1.15623, -12.4664, 76.6614, -1.51434,
				-13.0697, 77.2647, -1.39166, -13.5304, 77.7254, -0.827132, -9.68887, 80.9766, 7.33547e-007, -9.56743,
				80.7663, 0.827134, -9.24168, 80.2021, 1.39166, -8.81504, 79.4631, 1.51434, -8.42297, 78.784, 1.15623,
				-8.18994, 78.3804, 0.431026, -8.18994, 78.3804, -0.431026, -8.42297, 78.784, -1.15623, -8.81504,
				79.4631, -1.51434, -9.24168, 80.2021, -1.39166, -9.56743, 80.7663, -0.827132, -5.01533, 82.9125,
				8.18165e-007, -4.95247, 82.6779, 0.827134, -4.78385, 82.0486, 1.39166, -4.56301, 81.2244, 1.51434,
				-4.36005, 80.4669, 1.15623, -4.23943, 80.0168, 0.431026, -4.23943, 80.0168, -0.431026, -4.36005,
				80.4669, -1.15623, -4.56301, 81.2244, -1.51434, -4.78385, 82.0486, -1.39166, -4.95247, 82.6779,
				-0.827132, 0.0, 64.195, -13.971, -0.596347, 64.195, -13.7959, -1.00336, 64.195, -13.3261, -1.09181,
				64.195, -12.7109, -0.833619, 64.195, -12.1456, -0.310761, 64.195, -11.8096, 0.310762, 64.195, -11.8096,
				0.83362, 64.195, -12.1456, 1.09181, 64.195, -12.7109, 1.00336, 64.195, -13.3261, 0.596347, 64.195,
				-13.7959, -1.58058e-007, 67.811, -13.4949, -0.596347, 67.7657, -13.3258, -1.00336, 67.6441, -12.8721,
				-1.09181, 67.4849, -12.2778, -0.83362, 67.3385, -11.7317, -0.310761, 67.2516, -11.4072, 0.310761,
				67.2516, -11.4072, 0.83362, 67.3385, -11.7317, 1.09181, 67.4849, -12.2778, 1.00336, 67.6441, -12.8721,
				0.596347, 67.7657, -13.3258, -3.05345e-007, 71.1805, -12.0992, -0.596347, 71.093, -11.9476, -1.00336,
				70.8581, -11.5408, -1.09181, 70.5505, -11.008, -0.83362, 70.2678, -10.5184, -0.310761, 70.0998,
				-10.2274, 0.310761, 70.0998, -10.2274, 0.83362, 70.2678, -10.5184, 1.09181, 70.5505, -11.008, 1.00336,
				70.8581, -11.5408, 0.596346, 71.093, -11.9476, -4.31823e-007, 74.074, -9.87896, -0.596347, 73.9502,
				-9.75514, -1.00336, 73.618, -9.423, -1.09181, 73.183, -8.988, -0.83362, 72.7833, -8.58823, -0.310762,
				72.5457, -8.35063, 0.310761, 72.5457, -8.35063, 0.833619, 72.7833, -8.58823, 1.09181, 73.183, -8.988,
				1.00336, 73.618, -9.423, 0.596346, 73.9502, -9.75514, -5.28873e-007, 76.2942, -6.98548, -0.596347,
				76.1426, -6.89793, -1.00336, 75.7358, -6.66307, -1.09181, 75.203, -6.35547, -0.83362, 74.7134,
				-6.07279, -0.310762, 74.4224, -5.90478, 0.310761, 74.4224, -5.90478, 0.833619, 74.7134, -6.07279,
				1.09181, 75.203, -6.35547, 1.00336, 75.7358, -6.66307, 0.596346, 76.1426, -6.89793, -5.89881e-007,
				77.6899, -3.61595, -0.596347, 77.5208, -3.57063, -1.00336, 77.0671, -3.44906, -1.09181, 76.4729,
				-3.28983, -0.83362, 75.9268, -3.14351, -0.310762, 75.6022, -3.05654, 0.310761, 75.6022, -3.05654,
				0.833619, 75.9268, -3.14351, 1.09181, 76.4729, -3.28983, 1.00336, 77.0671, -3.44906, 0.596346, 77.5208,
				-3.57063, -6.1069e-007, 78.166, 0.0, -0.596347, 77.9909, 0.0, -1.00336, 77.5212, 0.0, -1.09181, 76.906,
				0.0, -0.83362, 76.3406, 0.0, -0.310762, 76.0046, 0.0, 0.310761, 76.0046, 0.0, 0.833619, 76.3406, 0.0,
				1.09181, 76.906, 0.0, 1.00336, 77.5212, 0.0, 0.596346, 77.9909, 0.0, -5.89881e-007, 77.6899, 3.61595,
				-0.596347, 77.5208, 3.57063, -1.00336, 77.0671, 3.44906, -1.09181, 76.4729, 3.28983, -0.83362, 75.9268,
				3.14351, -0.310762, 75.6022, 3.05654, 0.310761, 75.6022, 3.05654, 0.833619, 75.9268, 3.14351, 1.09181,
				76.4729, 3.28983, 1.00336, 77.0671, 3.44906, 0.596346, 77.5208, 3.57063, -5.28873e-007, 76.2942,
				6.98548, -0.596347, 76.1426, 6.89793, -1.00336, 75.7358, 6.66307, -1.09181, 75.203, 6.35547, -0.83362,
				74.7134, 6.07279, -0.310762, 74.4224, 5.90478, 0.310761, 74.4224, 5.90478, 0.833619, 74.7134, 6.07279,
				1.09181, 75.203, 6.35547, 1.00336, 75.7358, 6.66307, 0.596346, 76.1426, 6.89793, -4.31823e-007, 74.074,
				9.87896, -0.596347, 73.9502, 9.75514, -1.00336, 73.618, 9.423, -1.09181, 73.183, 8.988, -0.83362,
				72.7833, 8.58823, -0.310762, 72.5457, 8.35063, 0.310761, 72.5457, 8.35063, 0.833619, 72.7833, 8.58823,
				1.09181, 73.183, 8.988, 1.00336, 73.618, 9.423, 0.596346, 73.9502, 9.75514, -3.05345e-007, 71.1805,
				12.0992, -0.596347, 71.093, 11.9476, -1.00336, 70.8581, 11.5408, -1.09181, 70.5505, 11.008, -0.83362,
				70.2678, 10.5184, -0.310761, 70.0998, 10.2274, 0.310761, 70.0998, 10.2274, 0.83362, 70.2678, 10.5184,
				1.09181, 70.5505, 11.008, 1.00336, 70.8581, 11.5408, 0.596346, 71.093, 11.9476, -1.58058e-007, 67.811,
				13.4949, -0.596347, 67.7657, 13.3258, -1.00336, 67.6441, 12.8721, -1.09181, 67.4849, 12.2778, -0.83362,
				67.3385, 11.7317, -0.310761, 67.2516, 11.4072, 0.310761, 67.2516, 11.4072, 0.83362, 67.3385, 11.7317,
				1.09181, 67.4849, 12.2778, 1.00336, 67.6441, 12.8721, 0.596347, 67.7657, 13.3258, 0.0, 64.195, 13.971,
				-0.596347, 64.195, 13.7959, -1.00336, 64.195, 13.3261, -1.09181, 64.195, 12.7109, -0.833619, 64.195,
				12.1456, -0.310761, 64.195, 11.8096, 0.310762, 64.195, 11.8096, 0.83362, 64.195, 12.1456, 1.09181,
				64.195, 12.7109, 1.00336, 64.195, 13.3261, 0.596347, 64.195, 13.7959, 1.58058e-007, 60.5791, 13.4949,
				-0.596346, 60.6244, 13.3258, -1.00336, 60.746, 12.8721, -1.09181, 60.9052, 12.2778, -0.833619, 61.0515,
				11.7317, -0.310761, 61.1385, 11.4072, 0.310762, 61.1385, 11.4072, 0.83362, 61.0515, 11.7317, 1.09181,
				60.9052, 12.2778, 1.00336, 60.746, 12.8721, 0.596347, 60.6244, 13.3258, 3.05345e-007, 57.2096, 12.0992,
				-0.596346, 57.2971, 11.9476, -1.00336, 57.532, 11.5408, -1.09181, 57.8396, 11.008, -0.833619, 58.1222,
				10.5184, -0.310761, 58.2902, 10.2274, 0.310762, 58.2902, 10.2274, 0.83362, 58.1222, 10.5184, 1.09181,
				57.8396, 11.008, 1.00336, 57.532, 11.5408, 0.596347, 57.2971, 11.9476, 4.31823e-007, 54.3161, 9.87896,
				-0.596346, 54.4399, 9.75515, -1.00336, 54.772, 9.42301, -1.09181, 55.207, 8.988, -0.833619, 55.6068,
				8.58823, -0.310761, 55.8444, 8.35063, 0.310762, 55.8444, 8.35063, 0.83362, 55.6068, 8.58823, 1.09181,
				55.207, 8.988, 1.00336, 54.772, 9.42301, 0.596347, 54.4399, 9.75515, 5.28873e-007, 52.0958, 6.98548,
				-0.596346, 52.2475, 6.89793, -1.00336, 52.6543, 6.66307, -1.09181, 53.187, 6.35548, -0.833619, 53.6766,
				6.0728, -0.310761, 53.9676, 5.90479, 0.310762, 53.9676, 5.90479, 0.83362, 53.6766, 6.0728, 1.09181,
				53.187, 6.35548, 1.00336, 52.6543, 6.66307, 0.596347, 52.2475, 6.89793, 5.89881e-007, 50.7001, 3.61595,
				-0.596346, 50.8693, 3.57064, -1.00336, 51.323, 3.44906, -1.09181, 51.9172, 3.28984, -0.833619, 52.4633,
				3.14351, -0.310761, 52.7879, 3.05654, 0.310762, 52.7879, 3.05654, 0.83362, 52.4633, 3.14351, 1.09181,
				51.9172, 3.28984, 1.00336, 51.323, 3.44906, 0.596347, 50.8693, 3.57064, 6.1069e-007, 50.2241,
				5.44049e-006, -0.596346, 50.3992, 5.3723e-006, -1.00336, 50.8689, 5.18939e-006, -1.09181, 51.4841,
				4.94982e-006, -0.833619, 52.0494, 4.72967e-006, -0.310761, 52.3855, 4.59882e-006, 0.310762, 52.3855,
				4.59882e-006, 0.83362, 52.0494, 4.72967e-006, 1.09181, 51.4841, 4.94982e-006, 1.00336, 50.8689,
				5.18939e-006, 0.596347, 50.3992, 5.3723e-006, 5.89881e-007, 50.7001, -3.61594, -0.596346, 50.8693,
				-3.57062, -1.00336, 51.323, -3.44905, -1.09181, 51.9172, -3.28983, -0.833619, 52.4633, -3.1435,
				-0.310761, 52.7879, -3.05654, 0.310762, 52.7879, -3.05654, 0.83362, 52.4633, -3.1435, 1.09181, 51.9172,
				-3.28983, 1.00336, 51.323, -3.44905, 0.596347, 50.8693, -3.57062, 5.28873e-007, 52.0958, -6.98547,
				-0.596346, 52.2475, -6.89792, -1.00336, 52.6543, -6.66306, -1.09181, 53.187, -6.35547, -0.833619,
				53.6766, -6.07279, -0.310761, 53.9676, -5.90478, 0.310762, 53.9676, -5.90478, 0.83362, 53.6766,
				-6.07279, 1.09181, 53.187, -6.35547, 1.00336, 52.6543, -6.66306, 0.596347, 52.2475, -6.89792,
				4.31823e-007, 54.3161, -9.87895, -0.596346, 54.4399, -9.75514, -1.00336, 54.772, -9.423, -1.09181,
				55.207, -8.98799, -0.833619, 55.6068, -8.58822, -0.310761, 55.8444, -8.35062, 0.310762, 55.8444,
				-8.35062, 0.83362, 55.6068, -8.58822, 1.09181, 55.207, -8.98799, 1.00336, 54.772, -9.423, 0.596347,
				54.4399, -9.75514, 3.05345e-007, 57.2095, -12.0992, -0.596346, 57.2971, -11.9476, -1.00336, 57.532,
				-11.5408, -1.09181, 57.8396, -11.008, -0.833619, 58.1222, -10.5184, -0.310761, 58.2902, -10.2274,
				0.310762, 58.2902, -10.2274, 0.83362, 58.1222, -10.5184, 1.09181, 57.8396, -11.008, 1.00336, 57.532,
				-11.5408, 0.596347, 57.2971, -11.9476, 1.58058e-007, 60.5791, -13.4949, -0.596346, 60.6244, -13.3258,
				-1.00336, 60.746, -12.8721, -1.09181, 60.9052, -12.2778, -0.833619, 61.0515, -11.7317, -0.310761,
				61.1385, -11.4072, 0.310762, 61.1385, -11.4072, 0.83362, 61.0515, -11.7317, 1.09181, 60.9052, -12.2778,
				1.00336, 60.746, -12.8721, 0.596347, 60.6244, -13.3258 ],

		"normals" : [ 0.259291, 0.964926, -0.0410676, 0.259291, 0.964926, -0.0410676, 0.23391, 0.964926, -0.119183,
				0.23391, 0.964926, -0.119183, 0.185632, 0.964926, -0.185632, 0.185632, 0.964926, -0.185632, 0.119183,
				0.964926, -0.23391, 0.119183, 0.964926, -0.23391, 0.0410676, 0.964926, -0.259291, 0.0410676, 0.964926,
				-0.259291, -0.0410676, 0.964926, -0.259291, -0.0410676, 0.964926, -0.259291, -0.119183, 0.964926,
				-0.233909, -0.119183, 0.964926, -0.233909, -0.185632, 0.964926, -0.185632, -0.185632, 0.964926,
				-0.185632, -0.233909, 0.964926, -0.119183, -0.233909, 0.964926, -0.119183, -0.259291, 0.964926,
				-0.0410675, -0.259291, 0.964926, -0.0410675, -0.259291, 0.964926, 0.0410677, -0.259291, 0.964926,
				0.0410677, -0.233909, 0.964926, 0.119183, -0.233909, 0.964926, 0.119183, -0.185631, 0.964926, 0.185632,
				-0.185631, 0.964926, 0.185632, -0.119183, 0.964926, 0.23391, -0.119183, 0.964926, 0.23391, -0.0410674,
				0.964926, 0.259291, -0.0410674, 0.964926, 0.259291, 0.0410679, 0.964926, 0.259291, 0.0410679, 0.964926,
				0.259291, 0.119183, 0.964926, 0.233909, 0.119183, 0.964926, 0.233909, 0.185632, 0.964926, 0.185631,
				0.185632, 0.964926, 0.185631, 0.23391, 0.964926, 0.119183, 0.23391, 0.964926, 0.119183, 0.259291,
				0.964926, 0.0410674, 0.259291, 0.964926, 0.0410674, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
				0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
				-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
				0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
				1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
				0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
				0.0, 0.491123, 0.794655, -0.356822, -0.187592, 0.794655, -0.57735, -0.607061, 0.794655, 0.0, -0.187592,
				0.794655, 0.57735, 0.491123, 0.794655, 0.356822, 0.982247, -0.187592, 0.0, 0.303531, -0.187592,
				-0.934172, -0.794654, -0.187592, -0.57735, -0.794654, -0.187593, 0.57735, 0.303531, -0.187592,
				0.934172, 0.794654, 0.187592, -0.57735, -0.303531, 0.187592, -0.934172, -0.982247, 0.187592, 0.0,
				-0.303531, 0.187592, 0.934172, 0.794655, 0.187592, 0.57735, 0.187592, -0.794654, -0.57735, -0.491123,
				-0.794654, -0.356822, -0.491123, -0.794654, 0.356822, 0.187593, -0.794655, 0.57735, 0.607062,
				-0.794655, 0.0, 0.125324, 0.279511, -0.951928, 0.125324, 0.279511, -0.951928, 0.0858952, 0.752958,
				-0.652439, 0.0858953, 0.752957, -0.652439, 0.0187328, 0.989648, -0.14229, 0.0187328, 0.989648,
				-0.14229, -0.0546091, 0.908274, 0.414797, -0.054609, 0.908274, 0.414797, -0.11008, 0.537356, 0.836141,
				-0.11008, 0.537356, 0.836141, -0.130526, 0.0, 0.991445, -0.130526, 0.0, 0.991445, -0.11008, -0.537356,
				0.836141, -0.11008, -0.537356, 0.836141, -0.0546087, -0.908275, 0.414794, -0.0546087, -0.908275,
				0.414794, 0.0187328, -0.989648, -0.14229, 0.0187328, -0.989648, -0.14229, 0.0858954, -0.752957,
				-0.65244, 0.0858953, -0.752957, -0.65244, 0.125324, -0.279512, -0.951928, 0.125324, -0.279512,
				-0.951928, 0.367431, 0.279511, -0.887056, 0.367431, 0.279511, -0.887056, 0.251832, 0.752957, -0.607977,
				0.251832, 0.752958, -0.607976, 0.0549218, 0.989648, -0.132593, 0.0549218, 0.989648, -0.132593,
				-0.160106, 0.908274, 0.386529, -0.160106, 0.908274, 0.386529, -0.322738, 0.537356, 0.779159, -0.322738,
				0.537356, 0.779159, -0.382683, 0.0, 0.92388, -0.382683, 0.0, 0.92388, -0.322738, -0.537356, 0.779159,
				-0.322738, -0.537356, 0.779159, -0.160105, -0.908275, 0.386527, -0.160105, -0.908275, 0.386527,
				0.0549217, -0.989648, -0.132593, 0.0549217, -0.989648, -0.132593, 0.251833, -0.752956, -0.607978,
				0.251832, -0.752957, -0.607977, 0.367431, -0.279512, -0.887056, 0.367431, -0.279512, -0.887056,
				0.584498, 0.27951, -0.761732, 0.584498, 0.279511, -0.761732, 0.400607, 0.752958, -0.522081, 0.400607,
				0.752957, -0.522082, 0.0873682, 0.989648, -0.11386, 0.087368, 0.989648, -0.11386, -0.254691, 0.908274,
				0.33192, -0.254691, 0.908274, 0.33192, -0.513403, 0.537356, 0.669079, -0.513402, 0.537356, 0.669079,
				-0.608762, 0.0, 0.793353, -0.608762, 0.0, 0.793353, -0.513403, -0.537356, 0.669079, -0.513403,
				-0.537356, 0.669079, -0.254689, -0.908275, 0.331917, -0.25469, -0.908275, 0.331918, 0.087368,
				-0.989648, -0.11386, 0.0873679, -0.989648, -0.11386, 0.400608, -0.752957, -0.522082, 0.400608,
				-0.752956, -0.522082, 0.584498, -0.279511, -0.761732, 0.584498, -0.279512, -0.761732, 0.761733,
				0.27951, -0.584498, 0.761732, 0.27951, -0.584498, 0.522081, 0.752958, -0.400607, 0.522081, 0.752958,
				-0.400607, 0.11386, 0.989648, -0.087368, 0.11386, 0.989648, -0.0873682, -0.33192, 0.908274, 0.254691,
				-0.331919, 0.908274, 0.254691, -0.669079, 0.537356, 0.513402, -0.669079, 0.537356, 0.513403, -0.793353,
				0.0, 0.608761, -0.793353, 0.0, 0.608761, -0.669079, -0.537356, 0.513402, -0.669079, -0.537356,
				0.513403, -0.331918, -0.908275, 0.25469, -0.331917, -0.908275, 0.254689, 0.11386, -0.989648,
				-0.0873678, 0.11386, -0.989648, -0.087368, 0.522082, -0.752957, -0.400608, 0.522082, -0.752957,
				-0.400608, 0.761732, -0.279511, -0.584498, 0.761732, -0.279511, -0.584498, 0.887056, 0.279511,
				-0.367431, 0.887056, 0.27951, -0.367431, 0.607976, 0.752958, -0.251832, 0.607976, 0.752958, -0.251832,
				0.132593, 0.989648, -0.0549218, 0.132593, 0.989648, -0.0549218, -0.386529, 0.908274, 0.160106,
				-0.386529, 0.908274, 0.160106, -0.779159, 0.537356, 0.322738, -0.779159, 0.537356, 0.322738, -0.92388,
				0.0, 0.382684, -0.92388, 0.0, 0.382684, -0.779159, -0.537356, 0.322738, -0.779159, -0.537356, 0.322738,
				-0.386527, -0.908275, 0.160105, -0.386527, -0.908275, 0.160105, 0.132593, -0.989648, -0.0549217,
				0.132593, -0.989648, -0.0549217, 0.607977, -0.752957, -0.251832, 0.607977, -0.752957, -0.251832,
				0.887056, -0.279512, -0.367431, 0.887056, -0.27951, -0.367431, 0.951928, 0.279511, -0.125324, 0.951928,
				0.279511, -0.125324, 0.65244, 0.752957, -0.0858953, 0.652439, 0.752958, -0.0858953, 0.14229, 0.989648,
				-0.0187328, 0.14229, 0.989648, -0.0187328, -0.414797, 0.908274, 0.0546091, -0.414797, 0.908274,
				0.0546091, -0.836141, 0.537356, 0.11008, -0.836141, 0.537356, 0.11008, -0.991445, 0.0, 0.130526,
				-0.991445, 0.0, 0.130526, -0.83614, -0.537356, 0.11008, -0.836141, -0.537356, 0.11008, -0.414794,
				-0.908275, 0.0546087, -0.414794, -0.908275, 0.0546087, 0.14229, -0.989648, -0.0187328, 0.14229,
				-0.989648, -0.0187328, 0.65244, -0.752957, -0.0858954, 0.65244, -0.752957, -0.0858953, 0.951928,
				-0.279512, -0.125324, 0.951928, -0.279512, -0.125324, 0.951928, 0.279511, 0.125324, 0.951928, 0.279511,
				0.125324, 0.652439, 0.752958, 0.0858952, 0.65244, 0.752957, 0.0858954, 0.14229, 0.989648, 0.0187328,
				0.14229, 0.989648, 0.0187328, -0.414797, 0.908274, -0.0546091, -0.414797, 0.908274, -0.054609,
				-0.836141, 0.537356, -0.11008, -0.83614, 0.537356, -0.11008, -0.991445, 0.0, -0.130526, -0.991445, 0.0,
				-0.130526, -0.836141, -0.537356, -0.11008, -0.836141, -0.537356, -0.11008, -0.414794, -0.908275,
				-0.0546087, -0.414794, -0.908275, -0.0546087, 0.14229, -0.989648, 0.0187328, 0.14229, -0.989648,
				0.0187328, 0.65244, -0.752957, 0.0858954, 0.65244, -0.752957, 0.0858954, 0.951928, -0.279512, 0.125324,
				0.951928, -0.279512, 0.125324, 0.887056, 0.27951, 0.367431, 0.887056, 0.279511, 0.367431, 0.607976,
				0.752958, 0.251832, 0.607976, 0.752958, 0.251832, 0.132593, 0.989648, 0.0549219, 0.132593, 0.989648,
				0.0549218, -0.386529, 0.908274, -0.160106, -0.386529, 0.908274, -0.160106, -0.779159, 0.537356,
				-0.322738, -0.779159, 0.537356, -0.322738, -0.92388, 0.0, -0.382684, -0.92388, 0.0, -0.382684,
				-0.779159, -0.537356, -0.322738, -0.779159, -0.537356, -0.322738, -0.386527, -0.908275, -0.160105,
				-0.386527, -0.908275, -0.160105, 0.132593, -0.989648, 0.0549217, 0.132593, -0.989648, 0.0549217,
				0.607977, -0.752957, 0.251832, 0.607977, -0.752957, 0.251832, 0.887056, -0.27951, 0.367431, 0.887056,
				-0.279511, 0.367431, 0.761732, 0.27951, 0.584498, 0.761732, 0.27951, 0.584498, 0.522081, 0.752958,
				0.400607, 0.522081, 0.752958, 0.400607, 0.11386, 0.989648, 0.0873682, 0.11386, 0.989648, 0.087368,
				-0.33192, 0.908274, -0.254691, -0.33192, 0.908274, -0.254691, -0.669079, 0.537356, -0.513403,
				-0.669079, 0.537356, -0.513402, -0.793353, 0.0, -0.608761, -0.793353, 0.0, -0.608761, -0.669079,
				-0.537356, -0.513403, -0.669079, -0.537356, -0.513403, -0.331917, -0.908275, -0.254689, -0.331918,
				-0.908275, -0.25469, 0.11386, -0.989648, 0.087368, 0.11386, -0.989648, 0.0873679, 0.522082, -0.752957,
				0.400608, 0.522082, -0.752957, 0.400608, 0.761732, -0.279511, 0.584498, 0.761732, -0.279511, 0.584498,
				0.584498, 0.279511, 0.761732, 0.584498, 0.27951, 0.761732, 0.400607, 0.752957, 0.522082, 0.400607,
				0.752958, 0.522081, 0.087368, 0.989648, 0.11386, 0.0873682, 0.989648, 0.11386, -0.254691, 0.908274,
				-0.33192, -0.254691, 0.908274, -0.331919, -0.513403, 0.537356, -0.669079, -0.513403, 0.537356,
				-0.669079, -0.608762, 0.0, -0.793353, -0.608762, 0.0, -0.793353, -0.513403, -0.537356, -0.669079,
				-0.513403, -0.537356, -0.669079, -0.25469, -0.908275, -0.331918, -0.254689, -0.908275, -0.331917,
				0.0873679, -0.989648, 0.11386, 0.087368, -0.989648, 0.11386, 0.400608, -0.752956, 0.522082, 0.400608,
				-0.752957, 0.522082, 0.584498, -0.279512, 0.761732, 0.584498, -0.279511, 0.761732, 0.367431, 0.279511,
				0.887056, 0.367431, 0.279511, 0.887056, 0.251832, 0.752958, 0.607976, 0.251832, 0.752957, 0.607977,
				0.0549218, 0.989648, 0.132593, 0.0549218, 0.989648, 0.132593, -0.160106, 0.908274, -0.386529,
				-0.160106, 0.908274, -0.386529, -0.322738, 0.537356, -0.779159, -0.322738, 0.537356, -0.779159,
				-0.382683, 0.0, -0.92388, -0.382683, 0.0, -0.92388, -0.322738, -0.537356, -0.779159, -0.322738,
				-0.537356, -0.779159, -0.160105, -0.908275, -0.386527, -0.160105, -0.908275, -0.386527, 0.0549217,
				-0.989648, 0.132593, 0.0549217, -0.989648, 0.132593, 0.251832, -0.752957, 0.607977, 0.251833,
				-0.752956, 0.607978, 0.367431, -0.279511, 0.887056, 0.367431, -0.279512, 0.887056, 0.125324, 0.279511,
				0.951928, 0.125324, 0.279511, 0.951928, 0.0858953, 0.752957, 0.652439, 0.0858953, 0.752958, 0.652439,
				0.0187328, 0.989648, 0.14229, 0.0187328, 0.989648, 0.14229, -0.0546091, 0.908274, -0.414797,
				-0.0546091, 0.908274, -0.414797, -0.11008, 0.537356, -0.83614, -0.11008, 0.537356, -0.836141,
				-0.130526, 0.0, -0.991445, -0.130526, 0.0, -0.991445, -0.11008, -0.537356, -0.836141, -0.11008,
				-0.537356, -0.836141, -0.0546087, -0.908275, -0.414794, -0.0546087, -0.908275, -0.414794, 0.0187328,
				-0.989648, 0.14229, 0.0187328, -0.989648, 0.14229, 0.0858955, -0.752957, 0.65244, 0.0858953, -0.752957,
				0.65244, 0.125324, -0.279512, 0.951928, 0.125324, -0.279512, 0.951928, -0.125324, 0.279511, 0.951928,
				-0.125324, 0.279511, 0.951928, -0.0858953, 0.752957, 0.65244, -0.0858952, 0.752957, 0.652439,
				-0.0187328, 0.989648, 0.14229, -0.0187328, 0.989648, 0.14229, 0.054609, 0.908274, -0.414797, 0.0546089,
				0.908274, -0.414797, 0.11008, 0.537357, -0.83614, 0.11008, 0.537356, -0.836141, 0.130526, 0.0,
				-0.991445, 0.130526, 0.0, -0.991445, 0.11008, -0.537357, -0.83614, 0.11008, -0.537356, -0.836141,
				0.0546086, -0.908275, -0.414794, 0.0546086, -0.908275, -0.414794, -0.0187327, -0.989648, 0.14229,
				-0.0187328, -0.989648, 0.14229, -0.0858953, -0.752956, 0.652441, -0.0858954, -0.752957, 0.65244,
				-0.125324, -0.279512, 0.951928, -0.125324, -0.279512, 0.951928, -0.36743, 0.279511, 0.887056, -0.36743,
				0.279511, 0.887056, -0.251832, 0.752957, 0.607977, -0.251832, 0.752957, 0.607977, -0.0549218, 0.989648,
				0.132593, -0.0549218, 0.989648, 0.132593, 0.160106, 0.908274, -0.386529, 0.160106, 0.908274, -0.386529,
				0.322738, 0.537357, -0.779159, 0.322738, 0.537357, -0.779158, 0.382683, 0.0, -0.92388, 0.382683, 0.0,
				-0.92388, 0.322738, -0.537357, -0.779159, 0.322738, -0.537357, -0.779158, 0.160105, -0.908275,
				-0.386527, 0.160105, -0.908275, -0.386527, -0.0549217, -0.989648, 0.132593, -0.0549217, -0.989648,
				0.132593, -0.251833, -0.752956, 0.607978, -0.251833, -0.752956, 0.607978, -0.36743, -0.279512,
				0.887056, -0.36743, -0.279512, 0.887056, -0.584498, 0.27951, 0.761733, -0.584498, 0.279511, 0.761732,
				-0.400607, 0.752958, 0.522081, -0.400607, 0.752957, 0.522082, -0.087368, 0.989648, 0.11386, -0.087368,
				0.989648, 0.11386, 0.254691, 0.908274, -0.33192, 0.254691, 0.908274, -0.33192, 0.513403, 0.537356,
				-0.669079, 0.513402, 0.537356, -0.669079, 0.608761, 0.0, -0.793353, 0.608761, 0.0, -0.793353, 0.513402,
				-0.537356, -0.669079, 0.513402, -0.537356, -0.669079, 0.254689, -0.908275, -0.331918, 0.25469,
				-0.908275, -0.331918, -0.0873678, -0.989648, 0.11386, -0.0873678, -0.989648, 0.11386, -0.400608,
				-0.752957, 0.522082, -0.400608, -0.752956, 0.522082, -0.584497, -0.279511, 0.761732, -0.584497,
				-0.279512, 0.761732, -0.761732, 0.279511, 0.584498, -0.761732, 0.27951, 0.584498, -0.522082, 0.752957,
				0.400607, -0.522081, 0.752958, 0.400607, -0.11386, 0.989648, 0.0873681, -0.11386, 0.989648, 0.087368,
				0.33192, 0.908274, -0.254691, 0.33192, 0.908274, -0.254691, 0.669079, 0.537356, -0.513403, 0.669079,
				0.537356, -0.513403, 0.793353, 0.0, -0.608762, 0.793353, 0.0, -0.608762, 0.669079, -0.537356,
				-0.513403, 0.669079, -0.537356, -0.513403, 0.331918, -0.908275, -0.25469, 0.331918, -0.908275,
				-0.25469, -0.11386, -0.989648, 0.0873679, -0.11386, -0.989648, 0.0873678, -0.522082, -0.752956,
				0.400608, -0.522082, -0.752957, 0.400608, -0.761732, -0.279512, 0.584498, -0.761732, -0.279511,
				0.584498, -0.887056, 0.279511, 0.367431, -0.887056, 0.279511, 0.367431, -0.607976, 0.752958, 0.251832,
				-0.607977, 0.752957, 0.251832, -0.132593, 0.989648, 0.0549218, -0.132593, 0.989648, 0.0549219,
				0.386529, 0.908274, -0.160106, 0.386529, 0.908274, -0.160106, 0.779159, 0.537356, -0.322738, 0.779159,
				0.537356, -0.322738, 0.923879, 0.0, -0.382684, 0.923879, 0.0, -0.382684, 0.779159, -0.537356,
				-0.322738, 0.779159, -0.537356, -0.322738, 0.386527, -0.908275, -0.160105, 0.386527, -0.908275,
				-0.160105, -0.132593, -0.989648, 0.0549217, -0.132593, -0.989648, 0.0549218, -0.607977, -0.752957,
				0.251832, -0.607978, -0.752956, 0.251833, -0.887056, -0.279511, 0.367431, -0.887056, -0.279512,
				0.367431, -0.951928, 0.279511, 0.125324, -0.951928, 0.279511, 0.125324, -0.652439, 0.752957, 0.0858955,
				-0.652439, 0.752958, 0.0858955, -0.14229, 0.989648, 0.0187329, -0.14229, 0.989648, 0.0187329, 0.414797,
				0.908274, -0.0546092, 0.414797, 0.908274, -0.0546092, 0.83614, 0.537356, -0.11008, 0.83614, 0.537356,
				-0.11008, 0.991445, 0.0, -0.130527, 0.991445, 0.0, -0.130527, 0.83614, -0.537356, -0.11008, 0.83614,
				-0.537356, -0.11008, 0.414794, -0.908275, -0.0546088, 0.414794, -0.908275, -0.0546089, -0.14229,
				-0.989648, 0.0187328, -0.14229, -0.989648, 0.0187328, -0.65244, -0.752957, 0.0858957, -0.65244,
				-0.752957, 0.0858955, -0.951928, -0.279512, 0.125324, -0.951928, -0.279512, 0.125324, -0.951928,
				0.279511, -0.125323, -0.951928, 0.279511, -0.125323, -0.65244, 0.752957, -0.0858951, -0.65244,
				0.752957, -0.085895, -0.14229, 0.989648, -0.0187327, -0.14229, 0.989648, -0.0187327, 0.414796,
				0.908274, 0.0546088, 0.414797, 0.908274, 0.0546089, 0.836141, 0.537356, 0.11008, 0.836141, 0.537356,
				0.11008, 0.991445, 0.0, 0.130526, 0.991445, 0.0, 0.130526, 0.836141, -0.537356, 0.11008, 0.836141,
				-0.537356, 0.11008, 0.414794, -0.908275, 0.0546085, 0.414794, -0.908275, 0.0546085, -0.14229,
				-0.989648, -0.0187327, -0.14229, -0.989648, -0.0187327, -0.652441, -0.752956, -0.0858951, -0.65244,
				-0.752957, -0.0858952, -0.951928, -0.279512, -0.125323, -0.951928, -0.279512, -0.125323, -0.887056,
				0.279511, -0.36743, -0.887056, 0.279511, -0.36743, -0.607977, 0.752957, -0.251832, -0.607977, 0.752957,
				-0.251832, -0.132593, 0.989648, -0.0549217, -0.132593, 0.989648, -0.0549218, 0.386529, 0.908274,
				0.160106, 0.386529, 0.908274, 0.160105, 0.779159, 0.537356, 0.322738, 0.779159, 0.537356, 0.322738,
				0.92388, 0.0, 0.382683, 0.92388, 0.0, 0.382683, 0.779159, -0.537356, 0.322738, 0.779159, -0.537356,
				0.322738, 0.386527, -0.908275, 0.160104, 0.386526, -0.908275, 0.160104, -0.132593, -0.989648,
				-0.0549217, -0.132593, -0.989648, -0.0549217, -0.607977, -0.752957, -0.251832, -0.607978, -0.752956,
				-0.251832, -0.887056, -0.279512, -0.36743, -0.887056, -0.279512, -0.36743, -0.761733, 0.27951,
				-0.584498, -0.761733, 0.279511, -0.584497, -0.522082, 0.752957, -0.400607, -0.522082, 0.752957,
				-0.400607, -0.11386, 0.989648, -0.0873679, -0.11386, 0.989648, -0.0873679, 0.33192, 0.908274, 0.254691,
				0.33192, 0.908274, 0.254691, 0.669079, 0.537356, 0.513402, 0.669079, 0.537356, 0.513402, 0.793354, 0.0,
				0.608761, 0.793354, 0.0, 0.608761, 0.66908, -0.537356, 0.513402, 0.669079, -0.537356, 0.513402,
				0.331918, -0.908275, 0.254689, 0.331918, -0.908275, 0.254689, -0.11386, -0.989648, -0.0873677,
				-0.11386, -0.989648, -0.0873678, -0.522083, -0.752956, -0.400608, -0.522082, -0.752957, -0.400607,
				-0.761733, -0.279511, -0.584497, -0.761732, -0.279512, -0.584497, -0.584498, 0.279511, -0.761732,
				-0.584498, 0.27951, -0.761732, -0.400607, 0.752957, -0.522082, -0.400608, 0.752957, -0.522082,
				-0.087368, 0.989648, -0.11386, -0.087368, 0.989648, -0.11386, 0.254691, 0.908274, 0.33192, 0.254691,
				0.908274, 0.33192, 0.513403, 0.537356, 0.669079, 0.513403, 0.537356, 0.669079, 0.608762, 0.0, 0.793353,
				0.608762, 0.0, 0.793353, 0.513403, -0.537356, 0.669079, 0.513403, -0.537356, 0.669079, 0.25469,
				-0.908275, 0.331918, 0.25469, -0.908275, 0.331918, -0.0873679, -0.989648, -0.11386, -0.0873678,
				-0.989648, -0.11386, -0.400608, -0.752956, -0.522082, -0.400608, -0.752956, -0.522083, -0.584498,
				-0.279512, -0.761732, -0.584498, -0.279511, -0.761732, -0.367431, 0.279511, -0.887056, -0.367431,
				0.279511, -0.887056, -0.251833, 0.752957, -0.607977, -0.251833, 0.752957, -0.607977, -0.0549219,
				0.989648, -0.132593, -0.0549219, 0.989648, -0.132593, 0.160106, 0.908274, 0.386529, 0.160106, 0.908274,
				0.386529, 0.322738, 0.537356, 0.779159, 0.322738, 0.537356, 0.779159, 0.382684, 0.0, 0.923879,
				0.382684, 0.0, 0.923879, 0.322738, -0.537356, 0.779159, 0.322738, -0.537356, 0.779159, 0.160104,
				-0.908275, 0.386526, 0.160105, -0.908275, 0.386527, -0.0549218, -0.989648, -0.132593, -0.0549218,
				-0.989648, -0.132593, -0.251833, -0.752956, -0.607978, -0.251833, -0.752956, -0.607978, -0.367431,
				-0.279511, -0.887056, -0.367431, -0.279512, -0.887056, -0.125324, 0.279511, -0.951928, -0.125324,
				0.279511, -0.951928, -0.0858955, 0.752957, -0.652439, -0.0858955, 0.752957, -0.65244, -0.0187328,
				0.989648, -0.14229, -0.0187328, 0.989648, -0.14229, 0.0546091, 0.908274, 0.414797, 0.0546092, 0.908274,
				0.414796, 0.11008, 0.537356, 0.83614, 0.11008, 0.537356, 0.83614, 0.130527, 0.0, 0.991445, 0.130527,
				0.0, 0.991445, 0.11008, -0.537356, 0.83614, 0.11008, -0.537356, 0.83614, 0.0546089, -0.908275,
				0.414794, 0.0546087, -0.908275, 0.414794, -0.0187328, -0.989648, -0.14229, -0.0187328, -0.989648,
				-0.14229, -0.0858955, -0.752957, -0.65244, -0.0858957, -0.752956, -0.652441, -0.125324, -0.279512,
				-0.951928, -0.125324, -0.279512, -0.951928, 0.125323, 0.951927, 0.279515, 0.125323, 0.951926, 0.279518,
				0.0858949, 0.652441, 0.752956, 0.0858961, 0.652444, 0.752953, 0.0187328, 0.14229, 0.989648, 0.0187328,
				0.142289, 0.989648, -0.0546089, -0.414795, 0.908275, -0.0546079, -0.414792, 0.908276, -0.110079,
				-0.836141, 0.537355, -0.11008, -0.836143, 0.537352, -0.130526, -0.991445, 0.0, -0.130526, -0.991445,
				0.0, -0.11008, -0.836141, -0.537355, -0.110079, -0.836143, -0.537352, -0.0546082, -0.414795, -0.908275,
				-0.0546084, -0.414792, -0.908276, 0.0187328, 0.14229, -0.989648, 0.0187328, 0.14229, -0.989648,
				0.0858956, 0.652441, -0.752956, 0.0858953, 0.652444, -0.752953, 0.125323, 0.951927, -0.279515,
				0.125323, 0.951926, -0.279518, 0.36743, 0.887054, 0.279516, 0.367431, 0.887055, 0.279515, 0.251834,
				0.607979, 0.752955, 0.251833, 0.607978, 0.752956, 0.0549218, 0.132593, 0.989648, 0.0549217, 0.132593,
				0.989648, -0.160105, -0.386528, 0.908274, -0.160105, -0.386528, 0.908275, -0.322739, -0.77916,
				0.537353, -0.322738, -0.779159, 0.537355, -0.382683, -0.92388, 0.0, -0.382683, -0.92388, 0.0,
				-0.322738, -0.779161, -0.537353, -0.322738, -0.779159, -0.537355, -0.160105, -0.386528, -0.908275,
				-0.160105, -0.386527, -0.908275, 0.0549219, 0.132593, -0.989648, 0.0549219, 0.132593, -0.989648,
				0.251833, 0.607979, -0.752955, 0.251833, 0.607978, -0.752956, 0.367431, 0.887054, -0.279516, 0.367431,
				0.887055, -0.279515, 0.584497, 0.761731, 0.279515, 0.584497, 0.761731, 0.279516, 0.400607, 0.522081,
				0.752957, 0.400609, 0.522083, 0.752956, 0.0873685, 0.113861, 0.989648, 0.087368, 0.11386, 0.989648,
				-0.254691, -0.33192, 0.908274, -0.254691, -0.331919, 0.908274, -0.513401, -0.669078, 0.537358,
				-0.513404, -0.669079, 0.537354, -0.608762, -0.793353, 0.0, -0.608762, -0.793353, 0.0, -0.513402,
				-0.669077, -0.537358, -0.513403, -0.66908, -0.537354, -0.25469, -0.331919, -0.908274, -0.25469,
				-0.331919, -0.908275, 0.0873677, 0.11386, -0.989648, 0.0873679, 0.11386, -0.989648, 0.400609, 0.522085,
				-0.752954, 0.400609, 0.522083, -0.752955, 0.584497, 0.761731, -0.279515, 0.584497, 0.761731, -0.279516,
				0.761733, 0.584498, 0.279508, 0.761731, 0.584498, 0.279514, 0.52208, 0.400607, 0.752958, 0.522081,
				0.400607, 0.752957, 0.11386, 0.0873682, 0.989648, 0.113861, 0.0873683, 0.989648, -0.331919, -0.25469,
				0.908275, -0.331919, -0.254691, 0.908274, -0.669079, -0.513402, 0.537356, -0.669078, -0.513402,
				0.537358, -0.793353, -0.608762, 0.0, -0.793353, -0.608762, 0.0, -0.669079, -0.513403, -0.537356,
				-0.669078, -0.513402, -0.537358, -0.331918, -0.25469, -0.908275, -0.331919, -0.25469, -0.908275,
				0.11386, 0.0873682, -0.989648, 0.11386, 0.0873678, -0.989648, 0.522081, 0.400607, -0.752958, 0.522084,
				0.40061, -0.752954, 0.761733, 0.584499, -0.279508, 0.761732, 0.584497, -0.279514, 0.887055, 0.367431,
				0.279513, 0.887057, 0.36743, 0.279509, 0.607978, 0.251832, 0.752957, 0.607976, 0.251832, 0.752958,
				0.132593, 0.0549219, 0.989648, 0.132593, 0.0549219, 0.989648, -0.386527, -0.160105, 0.908275,
				-0.386528, -0.160105, 0.908275, -0.779159, -0.322738, 0.537355, -0.779159, -0.322738, 0.537355,
				-0.92388, -0.382683, 0.0, -0.92388, -0.382683, 0.0, -0.779159, -0.322738, -0.537356, -0.779159,
				-0.322738, -0.537355, -0.386527, -0.160104, -0.908275, -0.386527, -0.160105, -0.908275, 0.132593,
				0.054922, -0.989648, 0.132593, 0.0549219, -0.989648, 0.607979, 0.251833, -0.752956, 0.607977, 0.251832,
				-0.752957, 0.887056, 0.36743, -0.279513, 0.887057, 0.367431, -0.279509, 0.951928, 0.125324, 0.279512,
				0.951928, 0.125324, 0.279513, 0.652441, 0.0858955, 0.752956, 0.65244, 0.0858955, 0.752957, 0.14229,
				0.0187328, 0.989648, 0.14229, 0.0187328, 0.989648, -0.414795, -0.0546088, 0.908275, -0.414795,
				-0.0546088, 0.908275, -0.836142, -0.11008, 0.537354, -0.836141, -0.11008, 0.537355, -0.991445,
				-0.130526, 0.0, -0.991445, -0.130526, 0.0, -0.836142, -0.11008, -0.537354, -0.836141, -0.11008,
				-0.537355, -0.414794, -0.0546086, -0.908275, -0.414794, -0.0546087, -0.908275, 0.14229, 0.0187329,
				-0.989648, 0.14229, 0.0187329, -0.989648, 0.652441, 0.0858954, -0.752956, 0.652441, 0.0858956,
				-0.752956, 0.951928, 0.125324, -0.279512, 0.951928, 0.125323, -0.279513, 0.951928, -0.125323, 0.279513,
				0.951928, -0.125324, 0.279512, 0.65244, -0.0858953, 0.752957, 0.652441, -0.0858957, 0.752956, 0.14229,
				-0.0187329, 0.989648, 0.14229, -0.0187329, 0.989648, -0.414795, 0.0546088, 0.908275, -0.414795,
				0.0546087, 0.908275, -0.836141, 0.11008, 0.537354, -0.836142, 0.11008, 0.537354, -0.991445, 0.130526,
				0.0, -0.991445, 0.130526, 0.0, -0.836141, 0.11008, -0.537354, -0.836142, 0.11008, -0.537354, -0.414795,
				0.0546088, -0.908275, -0.414794, 0.0546088, -0.908275, 0.14229, -0.0187328, -0.989648, 0.14229,
				-0.0187328, -0.989648, 0.652441, -0.0858954, -0.752956, 0.652441, -0.0858954, -0.752956, 0.951928,
				-0.125324, -0.279513, 0.951928, -0.125323, -0.279512, 0.887056, -0.367431, 0.27951, 0.887055, -0.36743,
				0.279513, 0.607977, -0.251832, 0.752957, 0.607977, -0.251832, 0.752957, 0.132593, -0.0549219, 0.989648,
				0.132593, -0.0549219, 0.989648, -0.386528, 0.160105, 0.908275, -0.386528, 0.160105, 0.908275,
				-0.779159, 0.322738, 0.537355, -0.77916, 0.322739, 0.537354, -0.923879, 0.382684, 0.0, -0.923879,
				0.382684, 0.0, -0.779159, 0.322738, -0.537355, -0.77916, 0.322738, -0.537354, -0.386527, 0.160105,
				-0.908275, -0.386527, 0.160105, -0.908275, 0.132593, -0.0549218, -0.989648, 0.132593, -0.0549218,
				-0.989648, 0.607978, -0.251833, -0.752956, 0.607978, -0.251833, -0.752956, 0.887056, -0.367431,
				-0.27951, 0.887055, -0.367431, -0.279513, 0.761732, -0.584497, 0.279512, 0.761733, -0.584498, 0.27951,
				0.522081, -0.400607, 0.752957, 0.522082, -0.400607, 0.752957, 0.113861, -0.0873684, 0.989648, 0.11386,
				-0.0873682, 0.989648, -0.331918, 0.254689, 0.908275, -0.331919, 0.25469, 0.908275, -0.669079, 0.513403,
				0.537356, -0.669079, 0.513403, 0.537356, -0.793353, 0.608762, 0.0, -0.793353, 0.608762, 0.0, -0.669079,
				0.513403, -0.537356, -0.669079, 0.513403, -0.537356, -0.331917, 0.254689, -0.908275, -0.331919,
				0.25469, -0.908275, 0.113861, -0.0873682, -0.989648, 0.11386, -0.0873681, -0.989648, 0.522082,
				-0.400608, -0.752957, 0.522082, -0.400608, -0.752957, 0.761732, -0.584498, -0.279512, 0.761733,
				-0.584498, -0.27951, 0.584497, -0.761731, 0.279516, 0.584497, -0.761732, 0.279512, 0.400608, -0.522083,
				0.752956, 0.400607, -0.522081, 0.752957, 0.087368, -0.11386, 0.989648, 0.0873683, -0.113861, 0.989648,
				-0.25469, 0.331919, 0.908274, -0.254689, 0.331917, 0.908275, -0.513403, 0.669079, 0.537356, -0.513403,
				0.669079, 0.537356, -0.608762, 0.793353, 0.0, -0.608762, 0.793353, 0.0, -0.513403, 0.669079, -0.537356,
				-0.513403, 0.669079, -0.537356, -0.254691, 0.331919, -0.908274, -0.254689, 0.331917, -0.908276,
				0.0873679, -0.11386, -0.989648, 0.0873684, -0.113861, -0.989648, 0.400609, -0.522083, -0.752955,
				0.400607, -0.522082, -0.752957, 0.584497, -0.761731, -0.279516, 0.584498, -0.761732, -0.279512,
				0.36743, -0.887056, 0.279511, 0.367431, -0.887054, 0.279516, 0.251832, -0.607976, 0.752958, 0.251833,
				-0.607979, 0.752955, 0.054922, -0.132594, 0.989648, 0.0549218, -0.132593, 0.989648, -0.160105,
				0.386528, 0.908275, -0.160105, 0.386528, 0.908274, -0.322738, 0.779159, 0.537355, -0.322738, 0.779159,
				0.537356, -0.382684, 0.923879, 0.0, -0.382684, 0.923879, 0.0, -0.322739, 0.779159, -0.537355,
				-0.322738, 0.779159, -0.537356, -0.160105, 0.386527, -0.908275, -0.160105, 0.386528, -0.908274,
				0.0549218, -0.132593, -0.989648, 0.0549219, -0.132593, -0.989648, 0.251833, -0.607978, -0.752956,
				0.251834, -0.607979, -0.752955, 0.367431, -0.887056, -0.279511, 0.36743, -0.887055, -0.279516,
				0.125323, -0.951928, 0.279514, 0.125323, -0.951928, 0.279511, 0.0858951, -0.652442, 0.752955,
				0.0858954, -0.652439, 0.752958, 0.0187329, -0.14229, 0.989648, 0.0187329, -0.14229, 0.989648,
				-0.0546087, 0.414794, 0.908275, -0.0546086, 0.414795, 0.908275, -0.11008, 0.836141, 0.537355, -0.11008,
				0.836141, 0.537355, -0.130526, 0.991445, 0.0, -0.130526, 0.991445, 0.0, -0.11008, 0.836141, -0.537355,
				-0.11008, 0.836141, -0.537355, -0.0546084, 0.414794, -0.908275, -0.0546088, 0.414795, -0.908275,
				0.0187329, -0.14229, -0.989648, 0.0187327, -0.14229, -0.989648, 0.0858953, -0.652442, -0.752955,
				0.085895, -0.652441, -0.752956, 0.125323, -0.951928, -0.279514, 0.125323, -0.951928, -0.279511,
				-0.125323, -0.951928, 0.279511, -0.125323, -0.951928, 0.279514, -0.085895, -0.652441, 0.752956,
				-0.0858953, -0.652442, 0.752955, -0.0187327, -0.14229, 0.989648, -0.0187329, -0.14229, 0.989648,
				0.0546089, 0.414795, 0.908275, 0.0546085, 0.414794, 0.908275, 0.11008, 0.836141, 0.537355, 0.11008,
				0.836141, 0.537355, 0.130526, 0.991445, 0.0, 0.130526, 0.991445, 0.0, 0.11008, 0.836141, -0.537355,
				0.11008, 0.836141, -0.537355, 0.0546086, 0.414795, -0.908275, 0.0546087, 0.414794, -0.908275,
				-0.0187328, -0.14229, -0.989648, -0.0187328, -0.14229, -0.989648, -0.0858952, -0.652441, -0.752956,
				-0.0858951, -0.652442, -0.752955, -0.125323, -0.951928, -0.279511, -0.125323, -0.951928, -0.279514,
				-0.36743, -0.887056, 0.279512, -0.367431, -0.887056, 0.279511, -0.251832, -0.607977, 0.752957,
				-0.251833, -0.607978, 0.752956, -0.0549218, -0.132593, 0.989648, -0.0549218, -0.132593, 0.989648,
				0.160105, 0.386528, 0.908274, 0.160105, 0.386528, 0.908275, 0.322738, 0.779159, 0.537356, 0.322738,
				0.779159, 0.537355, 0.382684, 0.923879, 0.0, 0.382684, 0.923879, 0.0, 0.322738, 0.779159, -0.537356,
				0.322738, 0.779159, -0.537355, 0.160105, 0.386528, -0.908275, 0.160105, 0.386527, -0.908275,
				-0.0549218, -0.132593, -0.989648, -0.0549218, -0.132593, -0.989648, -0.251833, -0.607977, -0.752957,
				-0.251833, -0.607978, -0.752956, -0.36743, -0.887056, -0.279512, -0.36743, -0.887056, -0.279511,
				-0.584497, -0.761732, 0.279512, -0.584497, -0.761732, 0.279512, -0.400607, -0.522082, 0.752957,
				-0.400607, -0.522082, 0.752957, -0.0873682, -0.113861, 0.989648, -0.0873678, -0.11386, 0.989648,
				0.254689, 0.331918, 0.908275, 0.25469, 0.331919, 0.908274, 0.513402, 0.669079, 0.537356, 0.513402,
				0.669079, 0.537356, 0.608761, 0.793353, 0.0, 0.608761, 0.793353, 0.0, 0.513402, 0.669079, -0.537356,
				0.513402, 0.669079, -0.537356, 0.254689, 0.331918, -0.908275, 0.25469, 0.331919, -0.908275, -0.0873682,
				-0.113861, -0.989648, -0.087368, -0.11386, -0.989648, -0.400607, -0.522082, -0.752957, -0.400608,
				-0.522082, -0.752957, -0.584497, -0.761732, -0.279512, -0.584497, -0.761732, -0.279512, -0.761732,
				-0.584498, 0.279513, -0.761732, -0.584498, 0.279512, -0.522083, -0.400608, 0.752956, -0.522081,
				-0.400608, 0.752957, -0.11386, -0.0873682, 0.989648, -0.11386, -0.0873683, 0.989648, 0.331919, 0.25469,
				0.908275, 0.331918, 0.25469, 0.908275, 0.669079, 0.513403, 0.537356, 0.669079, 0.513403, 0.537356,
				0.793353, 0.608762, 0.0, 0.793353, 0.608762, 0.0, 0.669079, 0.513403, -0.537356, 0.669079, 0.513403,
				-0.537356, 0.331918, 0.25469, -0.908275, 0.331918, 0.25469, -0.908275, -0.11386, -0.087368, -0.989648,
				-0.11386, -0.0873682, -0.989648, -0.522083, -0.400609, -0.752955, -0.522082, -0.400608, -0.752957,
				-0.761732, -0.584498, -0.279513, -0.761732, -0.584498, -0.279512, -0.887056, -0.367431, 0.279511,
				-0.887056, -0.367431, 0.279512, -0.607977, -0.251833, 0.752957, -0.607978, -0.251833, 0.752956,
				-0.132593, -0.054922, 0.989648, -0.132593, -0.0549219, 0.989648, 0.386527, 0.160105, 0.908275,
				0.386527, 0.160105, 0.908275, 0.779158, 0.322738, 0.537357, 0.779159, 0.322738, 0.537355, 0.92388,
				0.382683, 0.0, 0.92388, 0.382683, 0.0, 0.779158, 0.322738, -0.537357, 0.779159, 0.322739, -0.537355,
				0.386527, 0.160105, -0.908275, 0.386527, 0.160105, -0.908275, -0.132593, -0.054922, -0.989648,
				-0.132593, -0.0549218, -0.989648, -0.607978, -0.251833, -0.752957, -0.607978, -0.251833, -0.752956,
				-0.887056, -0.367431, -0.279511, -0.887056, -0.367431, -0.279512, -0.951928, -0.125324, 0.279512,
				-0.951928, -0.125324, 0.279511, -0.652441, -0.0858955, 0.752956, -0.652439, -0.0858957, 0.752958,
				-0.14229, -0.018733, 0.989648, -0.14229, -0.0187329, 0.989648, 0.414795, 0.0546088, 0.908275, 0.414795,
				0.0546088, 0.908275, 0.836142, 0.11008, 0.537354, 0.83614, 0.110081, 0.537356, 0.991445, 0.130527, 0.0,
				0.991445, 0.130527, 0.0, 0.836142, 0.110081, -0.537354, 0.83614, 0.11008, -0.537356, 0.414794,
				0.0546087, -0.908275, 0.414795, 0.0546089, -0.908275, -0.14229, -0.0187328, -0.989648, -0.14229,
				-0.0187328, -0.989648, -0.652441, -0.0858956, -0.752956, -0.65244, -0.0858954, -0.752957, -0.951928,
				-0.125324, -0.279512, -0.951928, -0.125324, -0.279511, -0.951928, 0.125324, 0.279511, -0.951928,
				0.125323, 0.279512, -0.652441, 0.0858953, 0.752956, -0.652441, 0.0858951, 0.752956, -0.14229,
				0.0187327, 0.989648, -0.14229, 0.0187326, 0.989648, 0.414794, -0.0546084, 0.908275, 0.414795,
				-0.0546086, 0.908275, 0.836141, -0.11008, 0.537355, 0.836142, -0.11008, 0.537354, 0.991445, -0.130526,
				0.0, 0.991445, -0.130526, 0.0, 0.836141, -0.11008, -0.537355, 0.836142, -0.11008, -0.537354, 0.414794,
				-0.0546084, -0.908275, 0.414794, -0.0546083, -0.908275, -0.14229, 0.0187328, -0.989648, -0.14229,
				0.0187328, -0.989648, -0.652441, 0.0858952, -0.752956, -0.652441, 0.0858953, -0.752956, -0.951928,
				0.125323, -0.279511, -0.951928, 0.125324, -0.279512, -0.887056, 0.36743, 0.27951, -0.887056, 0.36743,
				0.279511, -0.607977, 0.251832, 0.752957, -0.607979, 0.251833, 0.752956, -0.132593, 0.0549218, 0.989648,
				-0.132593, 0.0549219, 0.989648, 0.386528, -0.160105, 0.908275, 0.386526, -0.160104, 0.908275, 0.779159,
				-0.322738, 0.537355, 0.77916, -0.322739, 0.537354, 0.92388, -0.382683, 0.0, 0.92388, -0.382683, 0.0,
				0.779159, -0.322738, -0.537355, 0.77916, -0.322738, -0.537354, 0.386527, -0.160104, -0.908275,
				0.386526, -0.160104, -0.908276, -0.132593, 0.0549219, -0.989648, -0.132593, 0.054922, -0.989648,
				-0.607977, 0.251832, -0.752957, -0.607979, 0.251832, -0.752956, -0.887056, 0.36743, -0.27951,
				-0.887056, 0.36743, -0.279511, -0.761732, 0.584496, 0.279514, -0.761733, 0.584498, 0.279509, -0.522084,
				0.400609, 0.752955, -0.522082, 0.400607, 0.752958, -0.11386, 0.0873676, 0.989648, -0.11386, 0.0873681,
				0.989648, 0.331919, -0.254691, 0.908274, 0.331919, -0.25469, 0.908275, 0.669081, -0.513403, 0.537353,
				0.66908, -0.513402, 0.537356, 0.793354, -0.60876, 0.0, 0.793354, -0.60876, 0.0, 0.669081, -0.513403,
				-0.537353, 0.669079, -0.513402, -0.537356, 0.331919, -0.25469, -0.908275, 0.331919, -0.25469,
				-0.908275, -0.11386, 0.0873677, -0.989648, -0.113861, 0.0873681, -0.989648, -0.522085, 0.400609,
				-0.752954, -0.522081, 0.400607, -0.752958, -0.761732, 0.584497, -0.279514, -0.761733, 0.584497,
				-0.279509, -0.584498, 0.761733, 0.279509, -0.584498, 0.761731, 0.279515, -0.400607, 0.52208, 0.752958,
				-0.400609, 0.522085, 0.752954, -0.0873679, 0.11386, 0.989648, -0.0873677, 0.11386, 0.989648, 0.254691,
				-0.331919, 0.908274, 0.254691, -0.33192, 0.908274, 0.513403, -0.66908, 0.537354, 0.513403, -0.669081,
				0.537353, 0.608761, -0.793354, 0.0, 0.608761, -0.793354, 0.0, 0.513403, -0.66908, -0.537354, 0.513403,
				-0.669081, -0.537353, 0.25469, -0.331919, -0.908275, 0.254691, -0.331919, -0.908274, -0.0873673,
				0.113859, -0.989648, -0.0873676, 0.11386, -0.989648, -0.400609, 0.522083, -0.752955, -0.40061,
				0.522084, -0.752954, -0.584499, 0.761732, -0.279509, -0.584497, 0.761731, -0.279515, -0.367431,
				0.887055, 0.279515, -0.36743, 0.887057, 0.279509, -0.251832, 0.607978, 0.752956, -0.251832, 0.607975,
				0.752959, -0.0549222, 0.132594, 0.989648, -0.054922, 0.132593, 0.989648, 0.160106, -0.386527, 0.908275,
				0.160106, -0.386528, 0.908274, 0.32274, -0.779159, 0.537355, 0.32274, -0.77916, 0.537353, 0.382684,
				-0.923879, 0.0, 0.382684, -0.923879, 0.0, 0.322739, -0.779159, -0.537355, 0.32274, -0.77916, -0.537353,
				0.160105, -0.386527, -0.908275, 0.160106, -0.386527, -0.908275, -0.0549221, 0.132593, -0.989648,
				-0.0549214, 0.132592, -0.989648, -0.251835, 0.607982, -0.752953, -0.251833, 0.607979, -0.752955,
				-0.36743, 0.887055, -0.279515, -0.367431, 0.887056, -0.279509, -0.125324, 0.951926, 0.279518,
				-0.125324, 0.951927, 0.279515, -0.0858963, 0.652444, 0.752953, -0.0858966, 0.652441, 0.752956,
				-0.018733, 0.142289, 0.989648, -0.0187329, 0.142291, 0.989648, 0.0546084, -0.414792, 0.908276,
				0.0546082, -0.414795, 0.908275, 0.110079, -0.836143, 0.537352, 0.110079, -0.836141, 0.537355, 0.130526,
				-0.991445, 0.0, 0.130526, -0.991445, 0.0, 0.11008, -0.836143, -0.537352, 0.110079, -0.836141,
				-0.537355, 0.0546078, -0.414792, -0.908276, 0.0546087, -0.414795, -0.908275, -0.0187328, 0.14229,
				-0.989648, -0.0187328, 0.14229, -0.989648, -0.0858959, 0.652444, -0.752953, -0.0858964, 0.652445,
				-0.752952, -0.125324, 0.951926, -0.279518, -0.125325, 0.951927, -0.279515, -0.279511, 0.125324,
				-0.951928, -0.279511, 0.125324, -0.951928, -0.752958, 0.0858951, -0.652439, -0.752957, 0.0858954,
				-0.65244, -0.989648, 0.0187328, -0.14229, -0.989648, 0.0187328, -0.14229, -0.908275, -0.0546089,
				0.414795, -0.908275, -0.0546088, 0.414795, -0.537355, -0.11008, 0.836141, -0.537355, -0.11008,
				0.836141, 0.0, -0.130526, 0.991445, 0.0, -0.130526, 0.991445, 0.537355, -0.11008, 0.836141, 0.537355,
				-0.11008, 0.836141, 0.908275, -0.0546087, 0.414795, 0.908275, -0.0546088, 0.414795, 0.989648,
				0.0187328, -0.14229, 0.989648, 0.0187328, -0.14229, 0.752957, 0.0858955, -0.65244, 0.752956, 0.0858954,
				-0.652441, 0.279512, 0.125324, -0.951928, 0.279511, 0.125324, -0.951928, -0.279513, 0.36743, -0.887055,
				-0.279511, 0.367431, -0.887056, -0.752956, 0.251833, -0.607978, -0.752958, 0.251832, -0.607976,
				-0.989648, 0.0549217, -0.132593, -0.989648, 0.0549218, -0.132593, -0.908274, -0.160105, 0.386528,
				-0.908275, -0.160105, 0.386528, -0.537354, -0.322739, 0.77916, -0.537354, -0.322738, 0.77916, 0.0,
				-0.382683, 0.92388, 0.0, -0.382683, 0.92388, 0.537354, -0.322738, 0.77916, 0.537354, -0.322738,
				0.77916, 0.908275, -0.160105, 0.386528, 0.908275, -0.160105, 0.386527, 0.989648, 0.0549217, -0.132593,
				0.989648, 0.0549218, -0.132593, 0.752955, 0.251833, -0.607979, 0.752957, 0.251833, -0.607977, 0.279513,
				0.367431, -0.887055, 0.279511, 0.367431, -0.887056, -0.279512, 0.584498, -0.761732, -0.279514,
				0.584497, -0.761731, -0.752957, 0.400608, -0.522082, -0.752956, 0.400609, -0.522083, -0.989648,
				0.0873685, -0.113861, -0.989648, 0.0873676, -0.11386, -0.908276, -0.254688, 0.331917, -0.908274,
				-0.254691, 0.331919, -0.537354, -0.513403, 0.66908, -0.537353, -0.513404, 0.66908, 0.0, -0.608762,
				0.793353, 0.0, -0.608762, 0.793353, 0.537354, -0.513403, 0.66908, 0.537353, -0.513404, 0.66908,
				0.908276, -0.254689, 0.331917, 0.908275, -0.25469, 0.331919, 0.989648, 0.0873683, -0.113861, 0.989648,
				0.0873677, -0.11386, 0.752956, 0.400608, -0.522083, 0.752955, 0.400609, -0.522083, 0.279512, 0.584498,
				-0.761732, 0.279514, 0.584498, -0.761731, -0.279509, 0.761733, -0.584498, -0.279512, 0.761732,
				-0.584498, -0.752956, 0.522083, -0.400609, -0.752956, 0.522082, -0.400608, -0.989648, 0.11386,
				-0.0873681, -0.989648, 0.113861, -0.0873686, -0.908275, -0.331918, 0.254689, -0.908276, -0.331917,
				0.254689, -0.537353, -0.66908, 0.513403, -0.537354, -0.66908, 0.513403, 0.0, -0.793353, 0.608762, 0.0,
				-0.793353, 0.608762, 0.537353, -0.66908, 0.513404, 0.537354, -0.66908, 0.513403, 0.908275, -0.331917,
				0.254689, 0.908276, -0.331916, 0.254688, 0.989648, 0.11386, -0.0873679, 0.989648, 0.113861, -0.0873686,
				0.752955, 0.522083, -0.400609, 0.752956, 0.522083, -0.400609, 0.279509, 0.761732, -0.584499, 0.279512,
				0.761732, -0.584498, -0.27951, 0.887056, -0.367431, -0.279509, 0.887057, -0.367431, -0.752958,
				0.607976, -0.251832, -0.752955, 0.607979, -0.251833, -0.989648, 0.132594, -0.054922, -0.989648,
				0.132593, -0.0549218, -0.908276, -0.386526, 0.160104, -0.908275, -0.386526, 0.160104, -0.537354,
				-0.77916, 0.322739, -0.537353, -0.779161, 0.322739, 0.0, -0.92388, 0.382683, 0.0, -0.92388, 0.382683,
				0.537354, -0.77916, 0.322738, 0.537353, -0.779161, 0.322739, 0.908276, -0.386525, 0.160104, 0.908276,
				-0.386526, 0.160104, 0.989648, 0.132594, -0.0549221, 0.989648, 0.132593, -0.0549216, 0.752958,
				0.607977, -0.251831, 0.752955, 0.607979, -0.251833, 0.27951, 0.887056, -0.367431, 0.279509, 0.887057,
				-0.367431, -0.27951, 0.951929, -0.125324, -0.27951, 0.951928, -0.125324, -0.752959, 0.652438,
				-0.0858956, -0.752958, 0.652439, -0.0858955, -0.989648, 0.14229, -0.0187329, -0.989648, 0.142291,
				-0.0187328, -0.908276, -0.414793, 0.0546083, -0.908276, -0.414793, 0.0546083, -0.537356, -0.836141,
				0.110079, -0.537354, -0.836142, 0.110079, 0.0, -0.991445, 0.130525, 0.0, -0.991445, 0.130525, 0.537356,
				-0.83614, 0.110079, 0.537354, -0.836142, 0.11008, 0.908276, -0.414792, 0.0546082, 0.908276, -0.414792,
				0.0546082, 0.989648, 0.14229, -0.0187327, 0.989648, 0.142291, -0.018733, 0.752959, 0.652438,
				-0.0858953, 0.752958, 0.652439, -0.0858957, 0.27951, 0.951929, -0.125325, 0.27951, 0.951928, -0.125324,
				-0.27951, 0.951928, 0.125324, -0.27951, 0.951929, 0.125325, -0.752958, 0.652439, 0.0858957, -0.752959,
				0.652438, 0.0858953, -0.989648, 0.142291, 0.018733, -0.989648, 0.14229, 0.0187327, -0.908276,
				-0.414793, -0.0546083, -0.908276, -0.414793, -0.0546083, -0.537354, -0.836142, -0.11008, -0.537356,
				-0.836141, -0.110079, 0.0, -0.991445, -0.130525, 0.0, -0.991445, -0.130525, 0.537354, -0.836142,
				-0.110079, 0.537356, -0.83614, -0.110079, 0.908276, -0.414792, -0.0546082, 0.908276, -0.414792,
				-0.0546082, 0.989648, 0.142291, 0.0187328, 0.989648, 0.14229, 0.0187329, 0.752958, 0.652439, 0.0858955,
				0.752959, 0.652438, 0.0858956, 0.27951, 0.951928, 0.125324, 0.27951, 0.951929, 0.125324, -0.279509,
				0.887057, 0.367431, -0.27951, 0.887056, 0.367431, -0.752956, 0.607979, 0.251833, -0.752958, 0.607976,
				0.251832, -0.989648, 0.132593, 0.0549217, -0.989648, 0.132594, 0.0549221, -0.908275, -0.386526,
				-0.160104, -0.908276, -0.386526, -0.160104, -0.537353, -0.779161, -0.322739, -0.537354, -0.77916,
				-0.322738, 0.0, -0.92388, -0.382683, 0.0, -0.92388, -0.382683, 0.537353, -0.779161, -0.322739,
				0.537354, -0.77916, -0.322738, 0.908276, -0.386526, -0.160104, 0.908276, -0.386525, -0.160104,
				0.989648, 0.132593, 0.0549218, 0.989648, 0.132594, 0.0549219, 0.752955, 0.607979, 0.251833, 0.752958,
				0.607976, 0.251832, 0.279509, 0.887057, 0.367431, 0.27951, 0.887056, 0.367431, -0.279512, 0.761732,
				0.584498, -0.279509, 0.761732, 0.584499, -0.752956, 0.522082, 0.400608, -0.752956, 0.522083, 0.400609,
				-0.989648, 0.113861, 0.0873687, -0.989648, 0.11386, 0.087368, -0.908276, -0.331917, -0.254688,
				-0.908275, -0.331918, -0.254689, -0.537354, -0.66908, -0.513403, -0.537353, -0.66908, -0.513404, 0.0,
				-0.793353, -0.608762, 0.0, -0.793353, -0.608762, 0.537354, -0.66908, -0.513403, 0.537353, -0.66908,
				-0.513403, 0.908276, -0.331916, -0.254688, 0.908275, -0.331917, -0.254689, 0.989648, 0.113861,
				0.0873685, 0.989648, 0.11386, 0.087368, 0.752956, 0.522083, 0.400609, 0.752955, 0.522083, 0.400609,
				0.279512, 0.761732, 0.584498, 0.279509, 0.761733, 0.584498, -0.279514, 0.584498, 0.761731, -0.279512,
				0.584498, 0.761732, -0.752956, 0.400608, 0.522083, -0.752957, 0.400608, 0.522082, -0.989648, 0.0873678,
				0.11386, -0.989648, 0.0873684, 0.113861, -0.908274, -0.25469, -0.33192, -0.908276, -0.254689,
				-0.331917, -0.537353, -0.513404, -0.66908, -0.537354, -0.513403, -0.66908, 0.0, -0.608762, -0.793353,
				0.0, -0.608762, -0.793353, 0.537353, -0.513404, -0.66908, 0.537354, -0.513403, -0.66908, 0.908275,
				-0.25469, -0.331919, 0.908276, -0.254688, -0.331917, 0.989648, 0.0873675, 0.11386, 0.989648, 0.0873685,
				0.113861, 0.752955, 0.400609, 0.522083, 0.752956, 0.400608, 0.522083, 0.279514, 0.584497, 0.761731,
				0.279512, 0.584498, 0.761732, -0.279511, 0.367431, 0.887056, -0.279513, 0.367431, 0.887055, -0.752958,
				0.251832, 0.607976, -0.752956, 0.251833, 0.607978, -0.989648, 0.0549218, 0.132593, -0.989648,
				0.0549217, 0.132593, -0.908275, -0.160105, -0.386528, -0.908274, -0.160105, -0.386528, -0.537354,
				-0.322738, -0.77916, -0.537354, -0.322738, -0.77916, 0.0, -0.382683, -0.92388, 0.0, -0.382683,
				-0.92388, 0.537354, -0.322738, -0.77916, 0.537354, -0.322739, -0.77916, 0.908275, -0.160105, -0.386527,
				0.908275, -0.160105, -0.386528, 0.989648, 0.0549218, 0.132593, 0.989648, 0.0549217, 0.132593, 0.752957,
				0.251832, 0.607977, 0.752956, 0.251833, 0.607979, 0.279511, 0.367431, 0.887056, 0.279513, 0.36743,
				0.887055, -0.279511, 0.125324, 0.951928, -0.279512, 0.125324, 0.951928, -0.752957, 0.0858952, 0.65244,
				-0.752958, 0.0858953, 0.652439, -0.989648, 0.0187328, 0.14229, -0.989648, 0.0187328, 0.14229,
				-0.908275, -0.0546089, -0.414795, -0.908275, -0.0546089, -0.414795, -0.537355, -0.11008, -0.836141,
				-0.537355, -0.11008, -0.836141, 0.0, -0.130526, -0.991445, 0.0, -0.130526, -0.991445, 0.537355,
				-0.11008, -0.836141, 0.537355, -0.11008, -0.836141, 0.908275, -0.0546087, -0.414795, 0.908275,
				-0.0546088, -0.414795, 0.989648, 0.0187328, 0.14229, 0.989648, 0.0187329, 0.14229, 0.752956, 0.0858956,
				0.652441, 0.752957, 0.0858953, 0.65244, 0.279511, 0.125324, 0.951928, 0.279512, 0.125324, 0.951928,
				-0.279512, -0.125324, 0.951928, -0.279511, -0.125324, 0.951928, -0.752956, -0.0858955, 0.65244,
				-0.752957, -0.0858953, 0.65244, -0.989648, -0.0187328, 0.14229, -0.989648, -0.0187328, 0.14229,
				-0.908275, 0.0546087, -0.414795, -0.908275, 0.0546087, -0.414795, -0.537356, 0.11008, -0.83614,
				-0.537355, 0.11008, -0.836141, 0.0, 0.130526, -0.991445, 0.0, 0.130526, -0.991445, 0.537356, 0.11008,
				-0.83614, 0.537355, 0.11008, -0.836141, 0.908275, 0.0546087, -0.414795, 0.908275, 0.0546087, -0.414795,
				0.989648, -0.0187327, 0.14229, 0.989648, -0.0187327, 0.14229, 0.752956, -0.0858954, 0.652441, 0.752956,
				-0.0858954, 0.652441, 0.279512, -0.125324, 0.951928, 0.279511, -0.125324, 0.951928, -0.279512,
				-0.36743, 0.887056, -0.279511, -0.36743, 0.887056, -0.752957, -0.251832, 0.607977, -0.752956,
				-0.251833, 0.607978, -0.989648, -0.0549219, 0.132593, -0.989648, -0.0549219, 0.132593, -0.908274,
				0.160105, -0.386528, -0.908275, 0.160105, -0.386528, -0.537356, 0.322738, -0.779159, -0.537357,
				0.322738, -0.779158, 0.0, 0.382683, -0.92388, 0.0, 0.382683, -0.92388, 0.537356, 0.322738, -0.779159,
				0.537357, 0.322738, -0.779158, 0.908275, 0.160105, -0.386528, 0.908275, 0.160105, -0.386527, 0.989648,
				-0.0549217, 0.132593, 0.989648, -0.0549217, 0.132593, 0.752956, -0.251833, 0.607979, 0.752956,
				-0.251833, 0.607978, 0.279512, -0.36743, 0.887056, 0.279511, -0.36743, 0.887056, -0.279512, -0.584497,
				0.761732, -0.279512, -0.584497, 0.761732, -0.752958, -0.400607, 0.522081, -0.752957, -0.400607,
				0.522082, -0.989648, -0.087368, 0.11386, -0.989648, -0.0873681, 0.11386, -0.908274, 0.254691, -0.33192,
				-0.908274, 0.254691, -0.331919, -0.537355, 0.513403, -0.66908, -0.537356, 0.513402, -0.669079, 0.0,
				0.608761, -0.793354, 0.0, 0.608761, -0.793354, 0.537355, 0.513402, -0.66908, 0.537356, 0.513402,
				-0.669079, 0.908274, 0.254691, -0.331919, 0.908275, 0.25469, -0.331919, 0.989648, -0.0873675, 0.11386,
				0.989648, -0.0873676, 0.11386, 0.752955, -0.400608, 0.522083, 0.752955, -0.400608, 0.522083, 0.279512,
				-0.584497, 0.761732, 0.279512, -0.584497, 0.761732, -0.279514, -0.761731, 0.584497, -0.279512,
				-0.761732, 0.584497, -0.752956, -0.522083, 0.400608, -0.752958, -0.522081, 0.400607, -0.989648,
				-0.11386, 0.0873681, -0.989648, -0.11386, 0.0873681, -0.908274, 0.331919, -0.254691, -0.908274,
				0.33192, -0.254691, -0.537357, 0.669078, -0.513402, -0.537355, 0.66908, -0.513403, 0.0, 0.793353,
				-0.608761, 0.0, 0.793353, -0.608761, 0.537357, 0.669079, -0.513402, 0.537355, 0.669079, -0.513403,
				0.908275, 0.331919, -0.25469, 0.908274, 0.331919, -0.254691, 0.989648, -0.11386, 0.0873681, 0.989648,
				-0.11386, 0.0873675, 0.752956, -0.522083, 0.400608, 0.752956, -0.522083, 0.400608, 0.279514, -0.761732,
				0.584497, 0.279512, -0.761732, 0.584498, -0.27951, -0.887056, 0.367431, -0.279514, -0.887055, 0.367431,
				-0.752958, -0.607976, 0.251833, -0.752955, -0.607979, 0.251833, -0.989648, -0.132593, 0.0549218,
				-0.989648, -0.132593, 0.0549218, -0.908275, 0.386527, -0.160105, -0.908274, 0.386528, -0.160105,
				-0.537354, 0.77916, -0.322739, -0.537357, 0.779158, -0.322738, 0.0, 0.923879, -0.382684, 0.0, 0.923879,
				-0.382684, 0.537354, 0.77916, -0.322739, 0.537357, 0.779158, -0.322738, 0.908275, 0.386527, -0.160105,
				0.908275, 0.386528, -0.160105, 0.989648, -0.132593, 0.0549218, 0.989648, -0.132593, 0.0549219,
				0.752958, -0.607976, 0.251832, 0.752955, -0.607978, 0.251834, 0.27951, -0.887056, 0.367432, 0.279514,
				-0.887055, 0.367431, -0.27951, -0.951929, 0.125323, -0.27951, -0.951929, 0.125324, -0.752956,
				-0.652441, 0.0858953, -0.752958, -0.652439, 0.0858955, -0.989648, -0.14229, 0.0187329, -0.989648,
				-0.14229, 0.0187329, -0.908275, 0.414795, -0.0546091, -0.908275, 0.414795, -0.0546091, -0.537356,
				0.83614, -0.11008, -0.537354, 0.836142, -0.11008, 0.0, 0.991445, -0.130526, 0.0, 0.991445, -0.130526,
				0.537356, 0.83614, -0.11008, 0.537354, 0.836142, -0.110081, 0.908275, 0.414795, -0.054609, 0.908275,
				0.414795, -0.054609, 0.989648, -0.14229, 0.0187329, 0.989648, -0.14229, 0.0187329, 0.752956, -0.652441,
				0.0858957, 0.752958, -0.652439, 0.085895, 0.27951, -0.951929, 0.125324, 0.27951, -0.951929, 0.125323,
				-0.27951, -0.951929, -0.125323, -0.27951, -0.951929, -0.125324, -0.752958, -0.652439, -0.085895,
				-0.752956, -0.652441, -0.0858957, -0.989648, -0.142291, -0.018733, -0.989648, -0.14229, -0.0187327,
				-0.908276, 0.414793, 0.0546083, -0.908275, 0.414795, 0.0546091, -0.537354, 0.836142, 0.110081,
				-0.537356, 0.83614, 0.11008, 0.0, 0.991445, 0.130526, 0.0, 0.991445, 0.130526, 0.537354, 0.836142,
				0.11008, 0.537356, 0.83614, 0.11008, 0.908276, 0.414792, 0.0546087, 0.908275, 0.414795, 0.0546085,
				0.989648, -0.14229, -0.0187327, 0.989648, -0.14229, -0.0187327, 0.752955, -0.652442, -0.0858952,
				0.752956, -0.652441, -0.0858953, 0.27951, -0.951929, -0.125323, 0.27951, -0.951929, -0.125323,
				-0.279514, -0.887055, -0.36743, -0.27951, -0.887056, -0.367431, -0.752955, -0.607979, -0.251833,
				-0.752958, -0.607976, -0.251831, -0.989648, -0.132593, -0.0549217, -0.989648, -0.132594, -0.0549221,
				-0.908274, 0.386528, 0.160105, -0.908276, 0.386526, 0.160104, -0.537357, 0.779159, 0.322737, -0.537354,
				0.77916, 0.322738, 0.0, 0.92388, 0.382683, 0.0, 0.92388, 0.382683, 0.537357, 0.779158, 0.322738,
				0.537354, 0.779161, 0.322738, 0.908275, 0.386528, 0.160104, 0.908276, 0.386525, 0.160104, 0.989648,
				-0.132593, -0.0549219, 0.989648, -0.132593, -0.0549218, 0.752955, -0.607979, -0.251833, 0.752955,
				-0.607979, -0.251833, 0.279514, -0.887055, -0.36743, 0.27951, -0.887056, -0.36743, -0.279512,
				-0.761733, -0.584497, -0.279514, -0.761732, -0.584496, -0.752956, -0.522083, -0.400608, -0.752956,
				-0.522084, -0.400608, -0.989648, -0.11386, -0.0873675, -0.989648, -0.11386, -0.087368, -0.908274,
				0.33192, 0.254691, -0.908274, 0.331919, 0.25469, -0.537355, 0.66908, 0.513402, -0.537357, 0.669079,
				0.513401, 0.0, 0.793354, 0.60876, 0.0, 0.793354, 0.60876, 0.537355, 0.66908, 0.513402, 0.537357,
				0.669079, 0.513401, 0.908274, 0.33192, 0.25469, 0.908275, 0.331919, 0.25469, 0.989648, -0.11386,
				-0.0873676, 0.989648, -0.11386, -0.0873679, 0.752955, -0.522084, -0.400608, 0.752956, -0.522084,
				-0.400608, 0.279512, -0.761733, -0.584497, 0.279514, -0.761732, -0.584497, -0.279511, -0.584498,
				-0.761732, -0.279512, -0.584498, -0.761732, -0.752957, -0.400608, -0.522081, -0.752956, -0.400608,
				-0.522083, -0.989648, -0.0873681, -0.11386, -0.989648, -0.0873679, -0.11386, -0.908275, 0.25469,
				0.331918, -0.908274, 0.254691, 0.33192, -0.537355, 0.513402, 0.669079, -0.537355, 0.513402, 0.66908,
				0.0, 0.608761, 0.793354, 0.0, 0.608761, 0.793354, 0.537355, 0.513402, 0.669079, 0.537355, 0.513403,
				0.66908, 0.908275, 0.254689, 0.331918, 0.908274, 0.254691, 0.331919, 0.989648, -0.087368, -0.11386,
				0.989648, -0.0873676, -0.11386, 0.752957, -0.400607, -0.522082, 0.752956, -0.400609, -0.522083,
				0.279511, -0.584498, -0.761732, 0.279512, -0.584498, -0.761732, -0.279511, -0.367431, -0.887056,
				-0.279511, -0.367431, -0.887056, -0.752957, -0.251832, -0.607977, -0.752957, -0.251833, -0.607977,
				-0.989648, -0.054922, -0.132593, -0.989648, -0.054922, -0.132593, -0.908275, 0.160105, 0.386526,
				-0.908275, 0.160105, 0.386527, -0.537354, 0.322739, 0.77916, -0.537355, 0.322739, 0.779159, 0.0,
				0.382684, 0.923879, 0.0, 0.382684, 0.923879, 0.537354, 0.322739, 0.77916, 0.537355, 0.322738, 0.779159,
				0.908275, 0.160104, 0.386526, 0.908275, 0.160105, 0.386527, 0.989648, -0.0549218, -0.132593, 0.989648,
				-0.0549219, -0.132593, 0.752956, -0.251833, -0.607978, 0.752957, -0.251833, -0.607977, 0.279511,
				-0.367431, -0.887056, 0.279511, -0.367431, -0.887056, -0.279511, -0.125324, -0.951928, -0.279512,
				-0.125324, -0.951928, -0.752957, -0.0858956, -0.65244, -0.752957, -0.0858956, -0.65244, -0.989648,
				-0.0187329, -0.14229, -0.989648, -0.0187329, -0.14229, -0.908275, 0.0546088, 0.414795, -0.908275,
				0.0546089, 0.414794, -0.537355, 0.11008, 0.836141, -0.537355, 0.11008, 0.836141, 0.0, 0.130527,
				0.991445, 0.0, 0.130527, 0.991445, 0.537355, 0.11008, 0.836141, 0.537355, 0.11008, 0.836141, 0.908275,
				0.054609, 0.414795, 0.908275, 0.0546087, 0.414794, 0.989648, -0.0187328, -0.14229, 0.989648,
				-0.0187328, -0.14229, 0.752956, -0.0858955, -0.652441, 0.752956, -0.0858956, -0.652441, 0.279511,
				-0.125324, -0.951928, 0.279512, -0.125324, -0.951928 ],

		"colors" : [],

		"uvs" : [ [ 0.75, 0.0, 0.8, 0.0, 0.85, 0.0, 0.9, 0.0, 0.95, 0.0, 0.0, 0.0, 0.05, 0.0, 0.1, 0.0, 0.15, 0.0, 0.2,
				0.0, 0.25, 0.0, 0.3, 0.0, 0.35, 0.0, 0.4, 0.0, 0.45, 0.0, 0.5, 0.0, 0.55, 0.0, 0.6, 0.0, 0.65, 0.0,
				0.7, 0.0, 0.75, 1.0, 0.8, 1.0, 0.85, 1.0, 0.9, 1.0, 0.95, 1.0, 0.0, 1.0, 0.05, 1.0, 0.1, 1.0, 0.15,
				1.0, 0.2, 1.0, 0.25, 1.0, 0.3, 1.0, 0.35, 1.0, 0.4, 1.0, 0.45, 1.0, 0.5, 1.0, 0.55, 1.0, 0.6, 1.0,
				0.65, 1.0, 0.7, 1.0, 1.0, 0.0, 1.0, 1.0, 0.654508, 0.975528, 0.793892, 0.904509, 0.904508, 0.793893,
				0.975528, 0.654509, 1.0, 0.5, 0.975528, 0.345492, 0.904509, 0.206108, 0.793893, 0.0954917, 0.654509,
				0.0244718, 0.5, 0.0, 0.345492, 0.0244717, 0.206107, 0.0954915, 0.0954915, 0.206107, 0.0244717,
				0.345491, 0.0, 0.5, 0.0244717, 0.654508, 0.0954915, 0.793893, 0.206107, 0.904508, 0.345491, 0.975528,
				0.5, 1.0, 0.5, 1.0, 0.345491, 0.975528, 0.206107, 0.904508, 0.0954915, 0.793893, 0.0244717, 0.654508,
				0.0, 0.5, 0.0244717, 0.345491, 0.0954915, 0.206107, 0.206107, 0.0954915, 0.345492, 0.0244717, 0.5, 0.0,
				0.654509, 0.0244718, 0.793893, 0.0954917, 0.904509, 0.206108, 0.975528, 0.345492, 1.0, 0.5, 0.975528,
				0.654509, 0.904508, 0.793893, 0.793892, 0.904509, 0.654508, 0.975528, 0.4, 1.0, 0.5, 0.647584, 0.7,
				0.647584, 0.9, 0.647584, 0.1, 0.647584, 0.3, 0.647584, 0.6, 0.352416, 0.8, 0.352416, 0.0, 0.352416,
				0.2, 0.352416, 0.4, 0.352416, 0.5, 0.0, 0.6, 1.0, 0.8, 1.0, 0.0, 1.0, -0.1, 0.647584, 0.2, 1.0, -0.1,
				0.647584, -0.2, 0.352416, -0.1, 0.647584, 0.7, 0.0, -0.1, 0.0, -0.2, 0.352416, 0.1, 0.0, 0.3, 0.0, 0.0,
				0.0, 0.0909091, 0.0, 0.181818, 0.0, 0.272727, 0.0, 0.363636, 0.0, 0.454545, 0.0, 0.545455, 0.0,
				0.636364, 0.0, 0.727273, 0.0, 0.818182, 0.0, 0.909091, 0.0, 1.0, 0.0, 0.0, 0.0416667, 0.0909091,
				0.0416667, 0.181818, 0.0416667, 0.272727, 0.0416667, 0.363636, 0.0416667, 0.454545, 0.0416667,
				0.545455, 0.0416667, 0.636364, 0.0416667, 0.727273, 0.0416667, 0.818182, 0.0416667, 0.909091,
				0.0416667, 1.0, 0.0416667, 0.0, 0.0833333, 0.0909091, 0.0833333, 0.181818, 0.0833333, 0.272727,
				0.0833333, 0.363636, 0.0833333, 0.454545, 0.0833333, 0.545455, 0.0833333, 0.636364, 0.0833333,
				0.727273, 0.0833333, 0.818182, 0.0833333, 0.909091, 0.0833333, 1.0, 0.0833333, 0.0, 0.125, 0.0909091,
				0.125, 0.181818, 0.125, 0.272727, 0.125, 0.363636, 0.125, 0.454545, 0.125, 0.545455, 0.125, 0.636364,
				0.125, 0.727273, 0.125, 0.818182, 0.125, 0.909091, 0.125, 1.0, 0.125, 0.0, 0.166667, 0.0909091,
				0.166667, 0.181818, 0.166667, 0.272727, 0.166667, 0.363636, 0.166667, 0.454545, 0.166667, 0.545455,
				0.166667, 0.636364, 0.166667, 0.727273, 0.166667, 0.818182, 0.166667, 0.909091, 0.166667, 1.0,
				0.166667, 0.0, 0.208333, 0.0909091, 0.208333, 0.181818, 0.208333, 0.272727, 0.208333, 0.363636,
				0.208333, 0.454545, 0.208333, 0.545455, 0.208333, 0.636364, 0.208333, 0.727273, 0.208333, 0.818182,
				0.208333, 0.909091, 0.208333, 1.0, 0.208333, 0.0, 0.25, 0.0909091, 0.25, 0.181818, 0.25, 0.272727,
				0.25, 0.363636, 0.25, 0.454545, 0.25, 0.545455, 0.25, 0.636364, 0.25, 0.727273, 0.25, 0.818182, 0.25,
				0.909091, 0.25, 1.0, 0.25, 0.0, 0.291667, 0.0909091, 0.291667, 0.181818, 0.291667, 0.272727, 0.291667,
				0.363636, 0.291667, 0.454545, 0.291667, 0.545455, 0.291667, 0.636364, 0.291667, 0.727273, 0.291667,
				0.818182, 0.291667, 0.909091, 0.291667, 1.0, 0.291667, 0.0, 0.333333, 0.0909091, 0.333333, 0.181818,
				0.333333, 0.272727, 0.333333, 0.363636, 0.333333, 0.454545, 0.333333, 0.545455, 0.333333, 0.636364,
				0.333333, 0.727273, 0.333333, 0.818182, 0.333333, 0.909091, 0.333333, 1.0, 0.333333, 0.0, 0.375,
				0.0909091, 0.375, 0.181818, 0.375, 0.272727, 0.375, 0.363636, 0.375, 0.454545, 0.375, 0.545455, 0.375,
				0.636364, 0.375, 0.727273, 0.375, 0.818182, 0.375, 0.909091, 0.375, 1.0, 0.375, 0.0, 0.416667,
				0.0909091, 0.416667, 0.181818, 0.416667, 0.272727, 0.416667, 0.363636, 0.416667, 0.454545, 0.416667,
				0.545455, 0.416667, 0.636364, 0.416667, 0.727273, 0.416667, 0.818182, 0.416667, 0.909091, 0.416667,
				1.0, 0.416667, 0.0, 0.458333, 0.0909091, 0.458333, 0.181818, 0.458333, 0.272727, 0.458333, 0.363636,
				0.458333, 0.454545, 0.458333, 0.545455, 0.458333, 0.636364, 0.458333, 0.727273, 0.458333, 0.818182,
				0.458333, 0.909091, 0.458333, 1.0, 0.458333, 0.0, 0.5, 0.0909091, 0.5, 0.181818, 0.5, 0.272727, 0.5,
				0.363636, 0.5, 0.454545, 0.5, 0.545455, 0.5, 0.636364, 0.5, 0.727273, 0.5, 0.818182, 0.5, 0.909091,
				0.5, 1.0, 0.5, 0.0, 0.541667, 0.0909091, 0.541667, 0.181818, 0.541667, 0.272727, 0.541667, 0.363636,
				0.541667, 0.454545, 0.541667, 0.545455, 0.541667, 0.636364, 0.541667, 0.727273, 0.541667, 0.818182,
				0.541667, 0.909091, 0.541667, 1.0, 0.541667, 0.0, 0.583333, 0.0909091, 0.583333, 0.181818, 0.583333,
				0.272727, 0.583333, 0.363636, 0.583333, 0.454545, 0.583333, 0.545455, 0.583333, 0.636364, 0.583333,
				0.727273, 0.583333, 0.818182, 0.583333, 0.909091, 0.583333, 1.0, 0.583333, 0.0, 0.625, 0.0909091,
				0.625, 0.181818, 0.625, 0.272727, 0.625, 0.363636, 0.625, 0.454545, 0.625, 0.545455, 0.625, 0.636364,
				0.625, 0.727273, 0.625, 0.818182, 0.625, 0.909091, 0.625, 1.0, 0.625, 0.0, 0.666667, 0.0909091,
				0.666667, 0.181818, 0.666667, 0.272727, 0.666667, 0.363636, 0.666667, 0.454545, 0.666667, 0.545455,
				0.666667, 0.636364, 0.666667, 0.727273, 0.666667, 0.818182, 0.666667, 0.909091, 0.666667, 1.0,
				0.666667, 0.0, 0.708333, 0.0909091, 0.708333, 0.181818, 0.708333, 0.272727, 0.708333, 0.363636,
				0.708333, 0.454545, 0.708333, 0.545455, 0.708333, 0.636364, 0.708333, 0.727273, 0.708333, 0.818182,
				0.708333, 0.909091, 0.708333, 1.0, 0.708333, 0.0, 0.75, 0.0909091, 0.75, 0.181818, 0.75, 0.272727,
				0.75, 0.363636, 0.75, 0.454545, 0.75, 0.545455, 0.75, 0.636364, 0.75, 0.727273, 0.75, 0.818182, 0.75,
				0.909091, 0.75, 1.0, 0.75, 0.0, 0.791667, 0.0909091, 0.791667, 0.181818, 0.791667, 0.272727, 0.791667,
				0.363636, 0.791667, 0.454545, 0.791667, 0.545455, 0.791667, 0.636364, 0.791667, 0.727273, 0.791667,
				0.818182, 0.791667, 0.909091, 0.791667, 1.0, 0.791667, 0.0, 0.833333, 0.0909091, 0.833333, 0.181818,
				0.833333, 0.272727, 0.833333, 0.363636, 0.833333, 0.454545, 0.833333, 0.545455, 0.833333, 0.636364,
				0.833333, 0.727273, 0.833333, 0.818182, 0.833333, 0.909091, 0.833333, 1.0, 0.833333, 0.0, 0.875,
				0.0909091, 0.875, 0.181818, 0.875, 0.272727, 0.875, 0.363636, 0.875, 0.454545, 0.875, 0.545455, 0.875,
				0.636364, 0.875, 0.727273, 0.875, 0.818182, 0.875, 0.909091, 0.875, 1.0, 0.875, 0.0, 0.916667,
				0.0909091, 0.916667, 0.181818, 0.916667, 0.272727, 0.916667, 0.363636, 0.916667, 0.454545, 0.916667,
				0.545455, 0.916667, 0.636364, 0.916667, 0.727273, 0.916667, 0.818182, 0.916667, 0.909091, 0.916667,
				1.0, 0.916667, 0.0, 0.958333, 0.0909091, 0.958333, 0.181818, 0.958333, 0.272727, 0.958333, 0.363636,
				0.958333, 0.454545, 0.958333, 0.545455, 0.958333, 0.636364, 0.958333, 0.727273, 0.958333, 0.818182,
				0.958333, 0.909091, 0.958333, 1.0, 0.958333, 0.0, 1.0, 0.0909091, 1.0, 0.181818, 1.0, 0.272727, 1.0,
				0.363636, 1.0, 0.454545, 1.0, 0.545455, 1.0, 0.636364, 1.0, 0.727273, 1.0, 0.818182, 1.0, 0.909091,
				1.0, 1.0, 1.0, 0.0, 0.0, 0.0909091, 0.0, 0.181818, 0.0, 0.272727, 0.0, 0.363636, 0.0, 0.454545, 0.0,
				0.545455, 0.0, 0.636364, 0.0, 0.727273, 0.0, 0.818182, 0.0, 0.909091, 0.0, 1.0, 0.0, 0.0, 0.0416667,
				0.0909091, 0.0416667, 0.181818, 0.0416667, 0.272727, 0.0416667, 0.363636, 0.0416667, 0.454545,
				0.0416667, 0.545455, 0.0416667, 0.636364, 0.0416667, 0.727273, 0.0416667, 0.818182, 0.0416667,
				0.909091, 0.0416667, 1.0, 0.0416667, 0.0, 0.0833333, 0.0909091, 0.0833333, 0.181818, 0.0833333,
				0.272727, 0.0833333, 0.363636, 0.0833333, 0.454545, 0.0833333, 0.545455, 0.0833333, 0.636364,
				0.0833333, 0.727273, 0.0833333, 0.818182, 0.0833333, 0.909091, 0.0833333, 1.0, 0.0833333, 0.0, 0.125,
				0.0909091, 0.125, 0.181818, 0.125, 0.272727, 0.125, 0.363636, 0.125, 0.454545, 0.125, 0.545455, 0.125,
				0.636364, 0.125, 0.727273, 0.125, 0.818182, 0.125, 0.909091, 0.125, 1.0, 0.125, 0.0, 0.166667,
				0.0909091, 0.166667, 0.181818, 0.166667, 0.272727, 0.166667, 0.363636, 0.166667, 0.454545, 0.166667,
				0.545455, 0.166667, 0.636364, 0.166667, 0.727273, 0.166667, 0.818182, 0.166667, 0.909091, 0.166667,
				1.0, 0.166667, 0.0, 0.208333, 0.0909091, 0.208333, 0.181818, 0.208333, 0.272727, 0.208333, 0.363636,
				0.208333, 0.454545, 0.208333, 0.545455, 0.208333, 0.636364, 0.208333, 0.727273, 0.208333, 0.818182,
				0.208333, 0.909091, 0.208333, 1.0, 0.208333, 0.0, 0.25, 0.0909091, 0.25, 0.181818, 0.25, 0.272727,
				0.25, 0.363636, 0.25, 0.454545, 0.25, 0.545455, 0.25, 0.636364, 0.25, 0.727273, 0.25, 0.818182, 0.25,
				0.909091, 0.25, 1.0, 0.25, 0.0, 0.291667, 0.0909091, 0.291667, 0.181818, 0.291667, 0.272727, 0.291667,
				0.363636, 0.291667, 0.454545, 0.291667, 0.545455, 0.291667, 0.636364, 0.291667, 0.727273, 0.291667,
				0.818182, 0.291667, 0.909091, 0.291667, 1.0, 0.291667, 0.0, 0.333333, 0.0909091, 0.333333, 0.181818,
				0.333333, 0.272727, 0.333333, 0.363636, 0.333333, 0.454545, 0.333333, 0.545455, 0.333333, 0.636364,
				0.333333, 0.727273, 0.333333, 0.818182, 0.333333, 0.909091, 0.333333, 1.0, 0.333333, 0.0, 0.375,
				0.0909091, 0.375, 0.181818, 0.375, 0.272727, 0.375, 0.363636, 0.375, 0.454545, 0.375, 0.545455, 0.375,
				0.636364, 0.375, 0.727273, 0.375, 0.818182, 0.375, 0.909091, 0.375, 1.0, 0.375, 0.0, 0.416667,
				0.0909091, 0.416667, 0.181818, 0.416667, 0.272727, 0.416667, 0.363636, 0.416667, 0.454545, 0.416667,
				0.545455, 0.416667, 0.636364, 0.416667, 0.727273, 0.416667, 0.818182, 0.416667, 0.909091, 0.416667,
				1.0, 0.416667, 0.0, 0.458333, 0.0909091, 0.458333, 0.181818, 0.458333, 0.272727, 0.458333, 0.363636,
				0.458333, 0.454545, 0.458333, 0.545455, 0.458333, 0.636364, 0.458333, 0.727273, 0.458333, 0.818182,
				0.458333, 0.909091, 0.458333, 1.0, 0.458333, 0.0, 0.5, 0.0909091, 0.5, 0.181818, 0.5, 0.272727, 0.5,
				0.363636, 0.5, 0.454545, 0.5, 0.545455, 0.5, 0.636364, 0.5, 0.727273, 0.5, 0.818182, 0.5, 0.909091,
				0.5, 1.0, 0.5, 0.0, 0.541667, 0.0909091, 0.541667, 0.181818, 0.541667, 0.272727, 0.541667, 0.363636,
				0.541667, 0.454545, 0.541667, 0.545455, 0.541667, 0.636364, 0.541667, 0.727273, 0.541667, 0.818182,
				0.541667, 0.909091, 0.541667, 1.0, 0.541667, 0.0, 0.583333, 0.0909091, 0.583333, 0.181818, 0.583333,
				0.272727, 0.583333, 0.363636, 0.583333, 0.454545, 0.583333, 0.545455, 0.583333, 0.636364, 0.583333,
				0.727273, 0.583333, 0.818182, 0.583333, 0.909091, 0.583333, 1.0, 0.583333, 0.0, 0.625, 0.0909091,
				0.625, 0.181818, 0.625, 0.272727, 0.625, 0.363636, 0.625, 0.454545, 0.625, 0.545455, 0.625, 0.636364,
				0.625, 0.727273, 0.625, 0.818182, 0.625, 0.909091, 0.625, 1.0, 0.625, 0.0, 0.666667, 0.0909091,
				0.666667, 0.181818, 0.666667, 0.272727, 0.666667, 0.363636, 0.666667, 0.454545, 0.666667, 0.545455,
				0.666667, 0.636364, 0.666667, 0.727273, 0.666667, 0.818182, 0.666667, 0.909091, 0.666667, 1.0,
				0.666667, 0.0, 0.708333, 0.0909091, 0.708333, 0.181818, 0.708333, 0.272727, 0.708333, 0.363636,
				0.708333, 0.454545, 0.708333, 0.545455, 0.708333, 0.636364, 0.708333, 0.727273, 0.708333, 0.818182,
				0.708333, 0.909091, 0.708333, 1.0, 0.708333, 0.0, 0.75, 0.0909091, 0.75, 0.181818, 0.75, 0.272727,
				0.75, 0.363636, 0.75, 0.454545, 0.75, 0.545455, 0.75, 0.636364, 0.75, 0.727273, 0.75, 0.818182, 0.75,
				0.909091, 0.75, 1.0, 0.75, 0.0, 0.791667, 0.0909091, 0.791667, 0.181818, 0.791667, 0.272727, 0.791667,
				0.363636, 0.791667, 0.454545, 0.791667, 0.545455, 0.791667, 0.636364, 0.791667, 0.727273, 0.791667,
				0.818182, 0.791667, 0.909091, 0.791667, 1.0, 0.791667, 0.0, 0.833333, 0.0909091, 0.833333, 0.181818,
				0.833333, 0.272727, 0.833333, 0.363636, 0.833333, 0.454545, 0.833333, 0.545455, 0.833333, 0.636364,
				0.833333, 0.727273, 0.833333, 0.818182, 0.833333, 0.909091, 0.833333, 1.0, 0.833333, 0.0, 0.875,
				0.0909091, 0.875, 0.181818, 0.875, 0.272727, 0.875, 0.363636, 0.875, 0.454545, 0.875, 0.545455, 0.875,
				0.636364, 0.875, 0.727273, 0.875, 0.818182, 0.875, 0.909091, 0.875, 1.0, 0.875, 0.0, 0.916667,
				0.0909091, 0.916667, 0.181818, 0.916667, 0.272727, 0.916667, 0.363636, 0.916667, 0.454545, 0.916667,
				0.545455, 0.916667, 0.636364, 0.916667, 0.727273, 0.916667, 0.818182, 0.916667, 0.909091, 0.916667,
				1.0, 0.916667, 0.0, 0.958333, 0.0909091, 0.958333, 0.181818, 0.958333, 0.272727, 0.958333, 0.363636,
				0.958333, 0.454545, 0.958333, 0.545455, 0.958333, 0.636364, 0.958333, 0.727273, 0.958333, 0.818182,
				0.958333, 0.909091, 0.958333, 1.0, 0.958333, 0.0, 1.0, 0.0909091, 1.0, 0.181818, 1.0, 0.272727, 1.0,
				0.363636, 1.0, 0.454545, 1.0, 0.545455, 1.0, 0.636364, 1.0, 0.727273, 1.0, 0.818182, 1.0, 0.909091,
				1.0, 1.0, 1.0, 0.0, 0.0, 0.0909091, 0.0, 0.181818, 0.0, 0.272727, 0.0, 0.363636, 0.0, 0.454545, 0.0,
				0.545455, 0.0, 0.636364, 0.0, 0.727273, 0.0, 0.818182, 0.0, 0.909091, 0.0, 1.0, 0.0, 0.0, 0.0416667,
				0.0909091, 0.0416667, 0.181818, 0.0416667, 0.272727, 0.0416667, 0.363636, 0.0416667, 0.454545,
				0.0416667, 0.545455, 0.0416667, 0.636364, 0.0416667, 0.727273, 0.0416667, 0.818182, 0.0416667,
				0.909091, 0.0416667, 1.0, 0.0416667, 0.0, 0.0833333, 0.0909091, 0.0833333, 0.181818, 0.0833333,
				0.272727, 0.0833333, 0.363636, 0.0833333, 0.454545, 0.0833333, 0.545455, 0.0833333, 0.636364,
				0.0833333, 0.727273, 0.0833333, 0.818182, 0.0833333, 0.909091, 0.0833333, 1.0, 0.0833333, 0.0, 0.125,
				0.0909091, 0.125, 0.181818, 0.125, 0.272727, 0.125, 0.363636, 0.125, 0.454545, 0.125, 0.545455, 0.125,
				0.636364, 0.125, 0.727273, 0.125, 0.818182, 0.125, 0.909091, 0.125, 1.0, 0.125, 0.0, 0.166667,
				0.0909091, 0.166667, 0.181818, 0.166667, 0.272727, 0.166667, 0.363636, 0.166667, 0.454545, 0.166667,
				0.545455, 0.166667, 0.636364, 0.166667, 0.727273, 0.166667, 0.818182, 0.166667, 0.909091, 0.166667,
				1.0, 0.166667, 0.0, 0.208333, 0.0909091, 0.208333, 0.181818, 0.208333, 0.272727, 0.208333, 0.363636,
				0.208333, 0.454545, 0.208333, 0.545455, 0.208333, 0.636364, 0.208333, 0.727273, 0.208333, 0.818182,
				0.208333, 0.909091, 0.208333, 1.0, 0.208333, 0.0, 0.25, 0.0909091, 0.25, 0.181818, 0.25, 0.272727,
				0.25, 0.363636, 0.25, 0.454545, 0.25, 0.545455, 0.25, 0.636364, 0.25, 0.727273, 0.25, 0.818182, 0.25,
				0.909091, 0.25, 1.0, 0.25, 0.0, 0.291667, 0.0909091, 0.291667, 0.181818, 0.291667, 0.272727, 0.291667,
				0.363636, 0.291667, 0.454545, 0.291667, 0.545455, 0.291667, 0.636364, 0.291667, 0.727273, 0.291667,
				0.818182, 0.291667, 0.909091, 0.291667, 1.0, 0.291667, 0.0, 0.333333, 0.0909091, 0.333333, 0.181818,
				0.333333, 0.272727, 0.333333, 0.363636, 0.333333, 0.454545, 0.333333, 0.545455, 0.333333, 0.636364,
				0.333333, 0.727273, 0.333333, 0.818182, 0.333333, 0.909091, 0.333333, 1.0, 0.333333, 0.0, 0.375,
				0.0909091, 0.375, 0.181818, 0.375, 0.272727, 0.375, 0.363636, 0.375, 0.454545, 0.375, 0.545455, 0.375,
				0.636364, 0.375, 0.727273, 0.375, 0.818182, 0.375, 0.909091, 0.375, 1.0, 0.375, 0.0, 0.416667,
				0.0909091, 0.416667, 0.181818, 0.416667, 0.272727, 0.416667, 0.363636, 0.416667, 0.454545, 0.416667,
				0.545455, 0.416667, 0.636364, 0.416667, 0.727273, 0.416667, 0.818182, 0.416667, 0.909091, 0.416667,
				1.0, 0.416667, 0.0, 0.458333, 0.0909091, 0.458333, 0.181818, 0.458333, 0.272727, 0.458333, 0.363636,
				0.458333, 0.454545, 0.458333, 0.545455, 0.458333, 0.636364, 0.458333, 0.727273, 0.458333, 0.818182,
				0.458333, 0.909091, 0.458333, 1.0, 0.458333, 0.0, 0.5, 0.0909091, 0.5, 0.181818, 0.5, 0.272727, 0.5,
				0.363636, 0.5, 0.454545, 0.5, 0.545455, 0.5, 0.636364, 0.5, 0.727273, 0.5, 0.818182, 0.5, 0.909091,
				0.5, 1.0, 0.5, 0.0, 0.541667, 0.0909091, 0.541667, 0.181818, 0.541667, 0.272727, 0.541667, 0.363636,
				0.541667, 0.454545, 0.541667, 0.545455, 0.541667, 0.636364, 0.541667, 0.727273, 0.541667, 0.818182,
				0.541667, 0.909091, 0.541667, 1.0, 0.541667, 0.0, 0.583333, 0.0909091, 0.583333, 0.181818, 0.583333,
				0.272727, 0.583333, 0.363636, 0.583333, 0.454545, 0.583333, 0.545455, 0.583333, 0.636364, 0.583333,
				0.727273, 0.583333, 0.818182, 0.583333, 0.909091, 0.583333, 1.0, 0.583333, 0.0, 0.625, 0.0909091,
				0.625, 0.181818, 0.625, 0.272727, 0.625, 0.363636, 0.625, 0.454545, 0.625, 0.545455, 0.625, 0.636364,
				0.625, 0.727273, 0.625, 0.818182, 0.625, 0.909091, 0.625, 1.0, 0.625, 0.0, 0.666667, 0.0909091,
				0.666667, 0.181818, 0.666667, 0.272727, 0.666667, 0.363636, 0.666667, 0.454545, 0.666667, 0.545455,
				0.666667, 0.636364, 0.666667, 0.727273, 0.666667, 0.818182, 0.666667, 0.909091, 0.666667, 1.0,
				0.666667, 0.0, 0.708333, 0.0909091, 0.708333, 0.181818, 0.708333, 0.272727, 0.708333, 0.363636,
				0.708333, 0.454545, 0.708333, 0.545455, 0.708333, 0.636364, 0.708333, 0.727273, 0.708333, 0.818182,
				0.708333, 0.909091, 0.708333, 1.0, 0.708333, 0.0, 0.75, 0.0909091, 0.75, 0.181818, 0.75, 0.272727,
				0.75, 0.363636, 0.75, 0.454545, 0.75, 0.545455, 0.75, 0.636364, 0.75, 0.727273, 0.75, 0.818182, 0.75,
				0.909091, 0.75, 1.0, 0.75, 0.0, 0.791667, 0.0909091, 0.791667, 0.181818, 0.791667, 0.272727, 0.791667,
				0.363636, 0.791667, 0.454545, 0.791667, 0.545455, 0.791667, 0.636364, 0.791667, 0.727273, 0.791667,
				0.818182, 0.791667, 0.909091, 0.791667, 1.0, 0.791667, 0.0, 0.833333, 0.0909091, 0.833333, 0.181818,
				0.833333, 0.272727, 0.833333, 0.363636, 0.833333, 0.454545, 0.833333, 0.545455, 0.833333, 0.636364,
				0.833333, 0.727273, 0.833333, 0.818182, 0.833333, 0.909091, 0.833333, 1.0, 0.833333, 0.0, 0.875,
				0.0909091, 0.875, 0.181818, 0.875, 0.272727, 0.875, 0.363636, 0.875, 0.454545, 0.875, 0.545455, 0.875,
				0.636364, 0.875, 0.727273, 0.875, 0.818182, 0.875, 0.909091, 0.875, 1.0, 0.875, 0.0, 0.916667,
				0.0909091, 0.916667, 0.181818, 0.916667, 0.272727, 0.916667, 0.363636, 0.916667, 0.454545, 0.916667,
				0.545455, 0.916667, 0.636364, 0.916667, 0.727273, 0.916667, 0.818182, 0.916667, 0.909091, 0.916667,
				1.0, 0.916667, 0.0, 0.958333, 0.0909091, 0.958333, 0.181818, 0.958333, 0.272727, 0.958333, 0.363636,
				0.958333, 0.454545, 0.958333, 0.545455, 0.958333, 0.636364, 0.958333, 0.727273, 0.958333, 0.818182,
				0.958333, 0.909091, 0.958333, 1.0, 0.958333, 0.0, 1.0, 0.0909091, 1.0, 0.181818, 1.0, 0.272727, 1.0,
				0.363636, 1.0, 0.454545, 1.0, 0.545455, 1.0, 0.636364, 1.0, 0.727273, 1.0, 0.818182, 1.0, 0.909091,
				1.0, 1.0, 1.0 ] ],

		"faces" : [ 42, 0, 1, 21, 0, 0, 1, 21, 0, 0, 0, 42, 21, 20, 0, 0, 21, 20, 0, 1, 1, 1, 42, 1, 2, 22, 0, 1, 2,
				22, 2, 2, 2, 42, 22, 21, 1, 0, 22, 21, 1, 3, 3, 3, 42, 2, 3, 23, 0, 2, 3, 23, 4, 4, 4, 42, 23, 22, 2,
				0, 23, 22, 2, 5, 5, 5, 42, 3, 4, 24, 0, 3, 4, 24, 6, 6, 6, 42, 24, 23, 3, 0, 24, 23, 3, 7, 7, 7, 42, 4,
				5, 25, 0, 4, 40, 41, 8, 8, 8, 42, 25, 24, 4, 0, 41, 24, 4, 9, 9, 9, 42, 5, 6, 26, 0, 5, 6, 26, 10, 10,
				10, 42, 26, 25, 5, 0, 26, 25, 5, 11, 11, 11, 42, 6, 7, 27, 0, 6, 7, 27, 12, 12, 12, 42, 27, 26, 6, 0,
				27, 26, 6, 13, 13, 13, 42, 7, 8, 28, 0, 7, 8, 28, 14, 14, 14, 42, 28, 27, 7, 0, 28, 27, 7, 15, 15, 15,
				42, 8, 9, 29, 0, 8, 9, 29, 16, 16, 16, 42, 29, 28, 8, 0, 29, 28, 8, 17, 17, 17, 42, 9, 10, 30, 0, 9,
				10, 30, 18, 18, 18, 42, 30, 29, 9, 0, 30, 29, 9, 19, 19, 19, 42, 10, 11, 31, 0, 10, 11, 31, 20, 20, 20,
				42, 31, 30, 10, 0, 31, 30, 10, 21, 21, 21, 42, 11, 12, 32, 0, 11, 12, 32, 22, 22, 22, 42, 32, 31, 11,
				0, 32, 31, 11, 23, 23, 23, 42, 12, 13, 33, 0, 12, 13, 33, 24, 24, 24, 42, 33, 32, 12, 0, 33, 32, 12,
				25, 25, 25, 42, 13, 14, 34, 0, 13, 14, 34, 26, 26, 26, 42, 34, 33, 13, 0, 34, 33, 13, 27, 27, 27, 42,
				14, 15, 35, 0, 14, 15, 35, 28, 28, 28, 42, 35, 34, 14, 0, 35, 34, 14, 29, 29, 29, 42, 15, 16, 36, 0,
				15, 16, 36, 30, 30, 30, 42, 36, 35, 15, 0, 36, 35, 15, 31, 31, 31, 42, 16, 17, 37, 0, 16, 17, 37, 32,
				32, 32, 42, 37, 36, 16, 0, 37, 36, 16, 33, 33, 33, 42, 17, 18, 38, 0, 17, 18, 38, 34, 34, 34, 42, 38,
				37, 17, 0, 38, 37, 17, 35, 35, 35, 42, 18, 19, 39, 0, 18, 19, 39, 36, 36, 36, 42, 39, 38, 18, 0, 39,
				38, 18, 37, 37, 37, 42, 19, 0, 20, 0, 19, 0, 20, 38, 38, 38, 42, 20, 39, 19, 0, 20, 39, 19, 39, 39, 39,
				42, 18, 17, 16, 0, 43, 44, 45, 40, 40, 40, 42, 16, 15, 14, 0, 45, 46, 47, 41, 41, 41, 42, 14, 13, 12,
				0, 47, 48, 49, 42, 42, 42, 42, 16, 14, 12, 0, 45, 47, 49, 43, 43, 43, 42, 12, 11, 10, 0, 49, 50, 51,
				44, 44, 44, 42, 10, 9, 8, 0, 51, 52, 53, 45, 45, 45, 42, 12, 10, 8, 0, 49, 51, 53, 46, 46, 46, 42, 8,
				7, 6, 0, 53, 54, 55, 47, 47, 47, 42, 6, 5, 4, 0, 55, 56, 57, 48, 48, 48, 42, 8, 6, 4, 0, 53, 55, 57,
				49, 49, 49, 42, 4, 3, 2, 0, 57, 58, 59, 50, 50, 50, 42, 2, 1, 0, 0, 59, 60, 61, 51, 51, 51, 42, 4, 2,
				0, 0, 57, 59, 61, 52, 52, 52, 42, 8, 4, 0, 0, 53, 57, 61, 53, 53, 53, 42, 12, 8, 0, 0, 49, 53, 61, 54,
				54, 54, 42, 16, 12, 0, 0, 45, 49, 61, 55, 55, 55, 42, 18, 16, 0, 0, 43, 45, 61, 56, 56, 56, 42, 19, 18,
				0, 0, 42, 43, 61, 57, 57, 57, 42, 21, 22, 23, 0, 63, 64, 65, 58, 58, 58, 42, 23, 24, 25, 0, 65, 66, 67,
				59, 59, 59, 42, 25, 26, 27, 0, 67, 68, 69, 60, 60, 60, 42, 23, 25, 27, 0, 65, 67, 69, 61, 61, 61, 42,
				27, 28, 29, 0, 69, 70, 71, 62, 62, 62, 42, 29, 30, 31, 0, 71, 72, 73, 63, 63, 63, 42, 27, 29, 31, 0,
				69, 71, 73, 64, 64, 64, 42, 31, 32, 33, 0, 73, 74, 75, 65, 65, 65, 42, 33, 34, 35, 0, 75, 76, 77, 66,
				66, 66, 42, 31, 33, 35, 0, 73, 75, 77, 67, 67, 67, 42, 35, 36, 37, 0, 77, 78, 79, 68, 68, 68, 42, 37,
				38, 39, 0, 79, 80, 81, 69, 69, 69, 42, 35, 37, 39, 0, 77, 79, 81, 70, 70, 70, 42, 31, 35, 39, 0, 73,
				77, 81, 71, 71, 71, 42, 27, 31, 39, 0, 69, 73, 81, 72, 72, 72, 42, 23, 27, 39, 0, 65, 69, 81, 73, 73,
				73, 42, 21, 23, 39, 0, 63, 65, 81, 74, 74, 74, 42, 20, 21, 39, 0, 62, 63, 81, 75, 75, 75, 42, 40, 41,
				42, 0, 94, 83, 84, 76, 76, 76, 42, 40, 42, 43, 0, 95, 84, 85, 77, 77, 77, 42, 40, 43, 44, 0, 96, 97,
				86, 78, 78, 78, 42, 40, 44, 45, 0, 98, 86, 87, 79, 79, 79, 42, 40, 45, 41, 0, 82, 87, 83, 80, 80, 80,
				42, 41, 50, 46, 0, 83, 92, 88, 81, 81, 81, 42, 42, 46, 47, 0, 84, 88, 89, 82, 82, 82, 42, 43, 47, 48,
				0, 99, 100, 90, 83, 83, 83, 42, 44, 48, 49, 0, 86, 90, 91, 84, 84, 84, 42, 45, 49, 50, 0, 87, 91, 92,
				85, 85, 85, 42, 46, 42, 41, 0, 88, 84, 83, 86, 86, 86, 42, 47, 43, 42, 0, 89, 85, 84, 87, 87, 87, 42,
				48, 44, 43, 0, 90, 86, 101, 88, 88, 88, 42, 49, 45, 44, 0, 91, 87, 86, 89, 89, 89, 42, 50, 41, 45, 0,
				92, 83, 87, 90, 90, 90, 42, 51, 47, 46, 0, 102, 89, 88, 91, 91, 91, 42, 51, 48, 47, 0, 103, 90, 104,
				92, 92, 92, 42, 51, 49, 48, 0, 105, 91, 90, 93, 93, 93, 42, 51, 50, 49, 0, 106, 92, 91, 94, 94, 94, 42,
				51, 46, 50, 0, 93, 88, 92, 95, 95, 95, 42, 52, 64, 63, 0, 107, 120, 119, 96, 96, 96, 42, 52, 53, 64, 0,
				107, 108, 120, 97, 97, 97, 42, 53, 65, 64, 0, 108, 121, 120, 98, 98, 98, 42, 53, 54, 65, 0, 108, 109,
				121, 99, 99, 99, 42, 54, 66, 65, 0, 109, 122, 121, 100, 100, 100, 42, 54, 55, 66, 0, 109, 110, 122,
				101, 101, 101, 42, 55, 67, 66, 0, 110, 123, 122, 102, 102, 102, 42, 55, 56, 67, 0, 110, 111, 123, 103,
				103, 103, 42, 56, 68, 67, 0, 111, 124, 123, 104, 104, 104, 42, 56, 57, 68, 0, 111, 112, 124, 105, 105,
				105, 42, 57, 69, 68, 0, 112, 125, 124, 106, 106, 106, 42, 57, 58, 69, 0, 112, 113, 125, 107, 107, 107,
				42, 58, 70, 69, 0, 113, 126, 125, 108, 108, 108, 42, 58, 59, 70, 0, 113, 114, 126, 109, 109, 109, 42,
				59, 71, 70, 0, 114, 127, 126, 110, 110, 110, 42, 59, 60, 71, 0, 114, 115, 127, 111, 111, 111, 42, 60,
				72, 71, 0, 115, 128, 127, 112, 112, 112, 42, 60, 61, 72, 0, 115, 116, 128, 113, 113, 113, 42, 61, 73,
				72, 0, 116, 129, 128, 114, 114, 114, 42, 61, 62, 73, 0, 116, 117, 129, 115, 115, 115, 42, 62, 63, 73,
				0, 117, 130, 129, 116, 116, 116, 42, 62, 52, 63, 0, 117, 118, 130, 117, 117, 117, 42, 63, 75, 74, 0,
				119, 132, 131, 118, 118, 118, 42, 63, 64, 75, 0, 119, 120, 132, 119, 119, 119, 42, 64, 76, 75, 0, 120,
				133, 132, 120, 120, 120, 42, 64, 65, 76, 0, 120, 121, 133, 121, 121, 121, 42, 65, 77, 76, 0, 121, 134,
				133, 122, 122, 122, 42, 65, 66, 77, 0, 121, 122, 134, 123, 123, 123, 42, 66, 78, 77, 0, 122, 135, 134,
				124, 124, 124, 42, 66, 67, 78, 0, 122, 123, 135, 125, 125, 125, 42, 67, 79, 78, 0, 123, 136, 135, 126,
				126, 126, 42, 67, 68, 79, 0, 123, 124, 136, 127, 127, 127, 42, 68, 80, 79, 0, 124, 137, 136, 128, 128,
				128, 42, 68, 69, 80, 0, 124, 125, 137, 129, 129, 129, 42, 69, 81, 80, 0, 125, 138, 137, 130, 130, 130,
				42, 69, 70, 81, 0, 125, 126, 138, 131, 131, 131, 42, 70, 82, 81, 0, 126, 139, 138, 132, 132, 132, 42,
				70, 71, 82, 0, 126, 127, 139, 133, 133, 133, 42, 71, 83, 82, 0, 127, 140, 139, 134, 134, 134, 42, 71,
				72, 83, 0, 127, 128, 140, 135, 135, 135, 42, 72, 84, 83, 0, 128, 141, 140, 136, 136, 136, 42, 72, 73,
				84, 0, 128, 129, 141, 137, 137, 137, 42, 73, 74, 84, 0, 129, 142, 141, 138, 138, 138, 42, 73, 63, 74,
				0, 129, 130, 142, 139, 139, 139, 42, 74, 86, 85, 0, 131, 144, 143, 140, 140, 140, 42, 74, 75, 86, 0,
				131, 132, 144, 141, 141, 141, 42, 75, 87, 86, 0, 132, 145, 144, 142, 142, 142, 42, 75, 76, 87, 0, 132,
				133, 145, 143, 143, 143, 42, 76, 88, 87, 0, 133, 146, 145, 144, 144, 144, 42, 76, 77, 88, 0, 133, 134,
				146, 145, 145, 145, 42, 77, 89, 88, 0, 134, 147, 146, 146, 146, 146, 42, 77, 78, 89, 0, 134, 135, 147,
				147, 147, 147, 42, 78, 90, 89, 0, 135, 148, 147, 148, 148, 148, 42, 78, 79, 90, 0, 135, 136, 148, 149,
				149, 149, 42, 79, 91, 90, 0, 136, 149, 148, 150, 150, 150, 42, 79, 80, 91, 0, 136, 137, 149, 151, 151,
				151, 42, 80, 92, 91, 0, 137, 150, 149, 152, 152, 152, 42, 80, 81, 92, 0, 137, 138, 150, 153, 153, 153,
				42, 81, 93, 92, 0, 138, 151, 150, 154, 154, 154, 42, 81, 82, 93, 0, 138, 139, 151, 155, 155, 155, 42,
				82, 94, 93, 0, 139, 152, 151, 156, 156, 156, 42, 82, 83, 94, 0, 139, 140, 152, 157, 157, 157, 42, 83,
				95, 94, 0, 140, 153, 152, 158, 158, 158, 42, 83, 84, 95, 0, 140, 141, 153, 159, 159, 159, 42, 84, 85,
				95, 0, 141, 154, 153, 160, 160, 160, 42, 84, 74, 85, 0, 141, 142, 154, 161, 161, 161, 42, 85, 97, 96,
				0, 143, 156, 155, 162, 162, 162, 42, 85, 86, 97, 0, 143, 144, 156, 163, 163, 163, 42, 86, 98, 97, 0,
				144, 157, 156, 164, 164, 164, 42, 86, 87, 98, 0, 144, 145, 157, 165, 165, 165, 42, 87, 99, 98, 0, 145,
				158, 157, 166, 166, 166, 42, 87, 88, 99, 0, 145, 146, 158, 167, 167, 167, 42, 88, 100, 99, 0, 146, 159,
				158, 168, 168, 168, 42, 88, 89, 100, 0, 146, 147, 159, 169, 169, 169, 42, 89, 101, 100, 0, 147, 160,
				159, 170, 170, 170, 42, 89, 90, 101, 0, 147, 148, 160, 171, 171, 171, 42, 90, 102, 101, 0, 148, 161,
				160, 172, 172, 172, 42, 90, 91, 102, 0, 148, 149, 161, 173, 173, 173, 42, 91, 103, 102, 0, 149, 162,
				161, 174, 174, 174, 42, 91, 92, 103, 0, 149, 150, 162, 175, 175, 175, 42, 92, 104, 103, 0, 150, 163,
				162, 176, 176, 176, 42, 92, 93, 104, 0, 150, 151, 163, 177, 177, 177, 42, 93, 105, 104, 0, 151, 164,
				163, 178, 178, 178, 42, 93, 94, 105, 0, 151, 152, 164, 179, 179, 179, 42, 94, 106, 105, 0, 152, 165,
				164, 180, 180, 180, 42, 94, 95, 106, 0, 152, 153, 165, 181, 181, 181, 42, 95, 96, 106, 0, 153, 166,
				165, 182, 182, 182, 42, 95, 85, 96, 0, 153, 154, 166, 183, 183, 183, 42, 96, 108, 107, 0, 155, 168,
				167, 184, 184, 184, 42, 96, 97, 108, 0, 155, 156, 168, 185, 185, 185, 42, 97, 109, 108, 0, 156, 169,
				168, 186, 186, 186, 42, 97, 98, 109, 0, 156, 157, 169, 187, 187, 187, 42, 98, 110, 109, 0, 157, 170,
				169, 188, 188, 188, 42, 98, 99, 110, 0, 157, 158, 170, 189, 189, 189, 42, 99, 111, 110, 0, 158, 171,
				170, 190, 190, 190, 42, 99, 100, 111, 0, 158, 159, 171, 191, 191, 191, 42, 100, 112, 111, 0, 159, 172,
				171, 192, 192, 192, 42, 100, 101, 112, 0, 159, 160, 172, 193, 193, 193, 42, 101, 113, 112, 0, 160, 173,
				172, 194, 194, 194, 42, 101, 102, 113, 0, 160, 161, 173, 195, 195, 195, 42, 102, 114, 113, 0, 161, 174,
				173, 196, 196, 196, 42, 102, 103, 114, 0, 161, 162, 174, 197, 197, 197, 42, 103, 115, 114, 0, 162, 175,
				174, 198, 198, 198, 42, 103, 104, 115, 0, 162, 163, 175, 199, 199, 199, 42, 104, 116, 115, 0, 163, 176,
				175, 200, 200, 200, 42, 104, 105, 116, 0, 163, 164, 176, 201, 201, 201, 42, 105, 117, 116, 0, 164, 177,
				176, 202, 202, 202, 42, 105, 106, 117, 0, 164, 165, 177, 203, 203, 203, 42, 106, 107, 117, 0, 165, 178,
				177, 204, 204, 204, 42, 106, 96, 107, 0, 165, 166, 178, 205, 205, 205, 42, 107, 119, 118, 0, 167, 180,
				179, 206, 206, 206, 42, 107, 108, 119, 0, 167, 168, 180, 207, 207, 207, 42, 108, 120, 119, 0, 168, 181,
				180, 208, 208, 208, 42, 108, 109, 120, 0, 168, 169, 181, 209, 209, 209, 42, 109, 121, 120, 0, 169, 182,
				181, 210, 210, 210, 42, 109, 110, 121, 0, 169, 170, 182, 211, 211, 211, 42, 110, 122, 121, 0, 170, 183,
				182, 212, 212, 212, 42, 110, 111, 122, 0, 170, 171, 183, 213, 213, 213, 42, 111, 123, 122, 0, 171, 184,
				183, 214, 214, 214, 42, 111, 112, 123, 0, 171, 172, 184, 215, 215, 215, 42, 112, 124, 123, 0, 172, 185,
				184, 216, 216, 216, 42, 112, 113, 124, 0, 172, 173, 185, 217, 217, 217, 42, 113, 125, 124, 0, 173, 186,
				185, 218, 218, 218, 42, 113, 114, 125, 0, 173, 174, 186, 219, 219, 219, 42, 114, 126, 125, 0, 174, 187,
				186, 220, 220, 220, 42, 114, 115, 126, 0, 174, 175, 187, 221, 221, 221, 42, 115, 127, 126, 0, 175, 188,
				187, 222, 222, 222, 42, 115, 116, 127, 0, 175, 176, 188, 223, 223, 223, 42, 116, 128, 127, 0, 176, 189,
				188, 224, 224, 224, 42, 116, 117, 128, 0, 176, 177, 189, 225, 225, 225, 42, 117, 118, 128, 0, 177, 190,
				189, 226, 226, 226, 42, 117, 107, 118, 0, 177, 178, 190, 227, 227, 227, 42, 118, 130, 129, 0, 179, 192,
				191, 228, 228, 228, 42, 118, 119, 130, 0, 179, 180, 192, 229, 229, 229, 42, 119, 131, 130, 0, 180, 193,
				192, 230, 230, 230, 42, 119, 120, 131, 0, 180, 181, 193, 231, 231, 231, 42, 120, 132, 131, 0, 181, 194,
				193, 232, 232, 232, 42, 120, 121, 132, 0, 181, 182, 194, 233, 233, 233, 42, 121, 133, 132, 0, 182, 195,
				194, 234, 234, 234, 42, 121, 122, 133, 0, 182, 183, 195, 235, 235, 235, 42, 122, 134, 133, 0, 183, 196,
				195, 236, 236, 236, 42, 122, 123, 134, 0, 183, 184, 196, 237, 237, 237, 42, 123, 135, 134, 0, 184, 197,
				196, 238, 238, 238, 42, 123, 124, 135, 0, 184, 185, 197, 239, 239, 239, 42, 124, 136, 135, 0, 185, 198,
				197, 240, 240, 240, 42, 124, 125, 136, 0, 185, 186, 198, 241, 241, 241, 42, 125, 137, 136, 0, 186, 199,
				198, 242, 242, 242, 42, 125, 126, 137, 0, 186, 187, 199, 243, 243, 243, 42, 126, 138, 137, 0, 187, 200,
				199, 244, 244, 244, 42, 126, 127, 138, 0, 187, 188, 200, 245, 245, 245, 42, 127, 139, 138, 0, 188, 201,
				200, 246, 246, 246, 42, 127, 128, 139, 0, 188, 189, 201, 247, 247, 247, 42, 128, 129, 139, 0, 189, 202,
				201, 248, 248, 248, 42, 128, 118, 129, 0, 189, 190, 202, 249, 249, 249, 42, 129, 141, 140, 0, 191, 204,
				203, 250, 250, 250, 42, 129, 130, 141, 0, 191, 192, 204, 251, 251, 251, 42, 130, 142, 141, 0, 192, 205,
				204, 252, 252, 252, 42, 130, 131, 142, 0, 192, 193, 205, 253, 253, 253, 42, 131, 143, 142, 0, 193, 206,
				205, 254, 254, 254, 42, 131, 132, 143, 0, 193, 194, 206, 255, 255, 255, 42, 132, 144, 143, 0, 194, 207,
				206, 256, 256, 256, 42, 132, 133, 144, 0, 194, 195, 207, 257, 257, 257, 42, 133, 145, 144, 0, 195, 208,
				207, 258, 258, 258, 42, 133, 134, 145, 0, 195, 196, 208, 259, 259, 259, 42, 134, 146, 145, 0, 196, 209,
				208, 260, 260, 260, 42, 134, 135, 146, 0, 196, 197, 209, 261, 261, 261, 42, 135, 147, 146, 0, 197, 210,
				209, 262, 262, 262, 42, 135, 136, 147, 0, 197, 198, 210, 263, 263, 263, 42, 136, 148, 147, 0, 198, 211,
				210, 264, 264, 264, 42, 136, 137, 148, 0, 198, 199, 211, 265, 265, 265, 42, 137, 149, 148, 0, 199, 212,
				211, 266, 266, 266, 42, 137, 138, 149, 0, 199, 200, 212, 267, 267, 267, 42, 138, 150, 149, 0, 200, 213,
				212, 268, 268, 268, 42, 138, 139, 150, 0, 200, 201, 213, 269, 269, 269, 42, 139, 140, 150, 0, 201, 214,
				213, 270, 270, 270, 42, 139, 129, 140, 0, 201, 202, 214, 271, 271, 271, 42, 140, 152, 151, 0, 203, 216,
				215, 272, 272, 272, 42, 140, 141, 152, 0, 203, 204, 216, 273, 273, 273, 42, 141, 153, 152, 0, 204, 217,
				216, 274, 274, 274, 42, 141, 142, 153, 0, 204, 205, 217, 275, 275, 275, 42, 142, 154, 153, 0, 205, 218,
				217, 276, 276, 276, 42, 142, 143, 154, 0, 205, 206, 218, 277, 277, 277, 42, 143, 155, 154, 0, 206, 219,
				218, 278, 278, 278, 42, 143, 144, 155, 0, 206, 207, 219, 279, 279, 279, 42, 144, 156, 155, 0, 207, 220,
				219, 280, 280, 280, 42, 144, 145, 156, 0, 207, 208, 220, 281, 281, 281, 42, 145, 157, 156, 0, 208, 221,
				220, 282, 282, 282, 42, 145, 146, 157, 0, 208, 209, 221, 283, 283, 283, 42, 146, 158, 157, 0, 209, 222,
				221, 284, 284, 284, 42, 146, 147, 158, 0, 209, 210, 222, 285, 285, 285, 42, 147, 159, 158, 0, 210, 223,
				222, 286, 286, 286, 42, 147, 148, 159, 0, 210, 211, 223, 287, 287, 287, 42, 148, 160, 159, 0, 211, 224,
				223, 288, 288, 288, 42, 148, 149, 160, 0, 211, 212, 224, 289, 289, 289, 42, 149, 161, 160, 0, 212, 225,
				224, 290, 290, 290, 42, 149, 150, 161, 0, 212, 213, 225, 291, 291, 291, 42, 150, 151, 161, 0, 213, 226,
				225, 292, 292, 292, 42, 150, 140, 151, 0, 213, 214, 226, 293, 293, 293, 42, 151, 163, 162, 0, 215, 228,
				227, 294, 294, 294, 42, 151, 152, 163, 0, 215, 216, 228, 295, 295, 295, 42, 152, 164, 163, 0, 216, 229,
				228, 296, 296, 296, 42, 152, 153, 164, 0, 216, 217, 229, 297, 297, 297, 42, 153, 165, 164, 0, 217, 230,
				229, 298, 298, 298, 42, 153, 154, 165, 0, 217, 218, 230, 299, 299, 299, 42, 154, 166, 165, 0, 218, 231,
				230, 300, 300, 300, 42, 154, 155, 166, 0, 218, 219, 231, 301, 301, 301, 42, 155, 167, 166, 0, 219, 232,
				231, 302, 302, 302, 42, 155, 156, 167, 0, 219, 220, 232, 303, 303, 303, 42, 156, 168, 167, 0, 220, 233,
				232, 304, 304, 304, 42, 156, 157, 168, 0, 220, 221, 233, 305, 305, 305, 42, 157, 169, 168, 0, 221, 234,
				233, 306, 306, 306, 42, 157, 158, 169, 0, 221, 222, 234, 307, 307, 307, 42, 158, 170, 169, 0, 222, 235,
				234, 308, 308, 308, 42, 158, 159, 170, 0, 222, 223, 235, 309, 309, 309, 42, 159, 171, 170, 0, 223, 236,
				235, 310, 310, 310, 42, 159, 160, 171, 0, 223, 224, 236, 311, 311, 311, 42, 160, 172, 171, 0, 224, 237,
				236, 312, 312, 312, 42, 160, 161, 172, 0, 224, 225, 237, 313, 313, 313, 42, 161, 162, 172, 0, 225, 238,
				237, 314, 314, 314, 42, 161, 151, 162, 0, 225, 226, 238, 315, 315, 315, 42, 162, 174, 173, 0, 227, 240,
				239, 316, 316, 316, 42, 162, 163, 174, 0, 227, 228, 240, 317, 317, 317, 42, 163, 175, 174, 0, 228, 241,
				240, 318, 318, 318, 42, 163, 164, 175, 0, 228, 229, 241, 319, 319, 319, 42, 164, 176, 175, 0, 229, 242,
				241, 320, 320, 320, 42, 164, 165, 176, 0, 229, 230, 242, 321, 321, 321, 42, 165, 177, 176, 0, 230, 243,
				242, 322, 322, 322, 42, 165, 166, 177, 0, 230, 231, 243, 323, 323, 323, 42, 166, 178, 177, 0, 231, 244,
				243, 324, 324, 324, 42, 166, 167, 178, 0, 231, 232, 244, 325, 325, 325, 42, 167, 179, 178, 0, 232, 245,
				244, 326, 326, 326, 42, 167, 168, 179, 0, 232, 233, 245, 327, 327, 327, 42, 168, 180, 179, 0, 233, 246,
				245, 328, 328, 328, 42, 168, 169, 180, 0, 233, 234, 246, 329, 329, 329, 42, 169, 181, 180, 0, 234, 247,
				246, 330, 330, 330, 42, 169, 170, 181, 0, 234, 235, 247, 331, 331, 331, 42, 170, 182, 181, 0, 235, 248,
				247, 332, 332, 332, 42, 170, 171, 182, 0, 235, 236, 248, 333, 333, 333, 42, 171, 183, 182, 0, 236, 249,
				248, 334, 334, 334, 42, 171, 172, 183, 0, 236, 237, 249, 335, 335, 335, 42, 172, 173, 183, 0, 237, 250,
				249, 336, 336, 336, 42, 172, 162, 173, 0, 237, 238, 250, 337, 337, 337, 42, 173, 185, 184, 0, 239, 252,
				251, 338, 338, 338, 42, 173, 174, 185, 0, 239, 240, 252, 339, 339, 339, 42, 174, 186, 185, 0, 240, 253,
				252, 340, 340, 340, 42, 174, 175, 186, 0, 240, 241, 253, 341, 341, 341, 42, 175, 187, 186, 0, 241, 254,
				253, 342, 342, 342, 42, 175, 176, 187, 0, 241, 242, 254, 343, 343, 343, 42, 176, 188, 187, 0, 242, 255,
				254, 344, 344, 344, 42, 176, 177, 188, 0, 242, 243, 255, 345, 345, 345, 42, 177, 189, 188, 0, 243, 256,
				255, 346, 346, 346, 42, 177, 178, 189, 0, 243, 244, 256, 347, 347, 347, 42, 178, 190, 189, 0, 244, 257,
				256, 348, 348, 348, 42, 178, 179, 190, 0, 244, 245, 257, 349, 349, 349, 42, 179, 191, 190, 0, 245, 258,
				257, 350, 350, 350, 42, 179, 180, 191, 0, 245, 246, 258, 351, 351, 351, 42, 180, 192, 191, 0, 246, 259,
				258, 352, 352, 352, 42, 180, 181, 192, 0, 246, 247, 259, 353, 353, 353, 42, 181, 193, 192, 0, 247, 260,
				259, 354, 354, 354, 42, 181, 182, 193, 0, 247, 248, 260, 355, 355, 355, 42, 182, 194, 193, 0, 248, 261,
				260, 356, 356, 356, 42, 182, 183, 194, 0, 248, 249, 261, 357, 357, 357, 42, 183, 184, 194, 0, 249, 262,
				261, 358, 358, 358, 42, 183, 173, 184, 0, 249, 250, 262, 359, 359, 359, 42, 184, 196, 195, 0, 251, 264,
				263, 360, 360, 360, 42, 184, 185, 196, 0, 251, 252, 264, 361, 361, 361, 42, 185, 197, 196, 0, 252, 265,
				264, 362, 362, 362, 42, 185, 186, 197, 0, 252, 253, 265, 363, 363, 363, 42, 186, 198, 197, 0, 253, 266,
				265, 364, 364, 364, 42, 186, 187, 198, 0, 253, 254, 266, 365, 365, 365, 42, 187, 199, 198, 0, 254, 267,
				266, 366, 366, 366, 42, 187, 188, 199, 0, 254, 255, 267, 367, 367, 367, 42, 188, 200, 199, 0, 255, 268,
				267, 368, 368, 368, 42, 188, 189, 200, 0, 255, 256, 268, 369, 369, 369, 42, 189, 201, 200, 0, 256, 269,
				268, 370, 370, 370, 42, 189, 190, 201, 0, 256, 257, 269, 371, 371, 371, 42, 190, 202, 201, 0, 257, 270,
				269, 372, 372, 372, 42, 190, 191, 202, 0, 257, 258, 270, 373, 373, 373, 42, 191, 203, 202, 0, 258, 271,
				270, 374, 374, 374, 42, 191, 192, 203, 0, 258, 259, 271, 375, 375, 375, 42, 192, 204, 203, 0, 259, 272,
				271, 376, 376, 376, 42, 192, 193, 204, 0, 259, 260, 272, 377, 377, 377, 42, 193, 205, 204, 0, 260, 273,
				272, 378, 378, 378, 42, 193, 194, 205, 0, 260, 261, 273, 379, 379, 379, 42, 194, 195, 205, 0, 261, 274,
				273, 380, 380, 380, 42, 194, 184, 195, 0, 261, 262, 274, 381, 381, 381, 42, 195, 207, 206, 0, 263, 276,
				275, 382, 382, 382, 42, 195, 196, 207, 0, 263, 264, 276, 383, 383, 383, 42, 196, 208, 207, 0, 264, 277,
				276, 384, 384, 384, 42, 196, 197, 208, 0, 264, 265, 277, 385, 385, 385, 42, 197, 209, 208, 0, 265, 278,
				277, 386, 386, 386, 42, 197, 198, 209, 0, 265, 266, 278, 387, 387, 387, 42, 198, 210, 209, 0, 266, 279,
				278, 388, 388, 388, 42, 198, 199, 210, 0, 266, 267, 279, 389, 389, 389, 42, 199, 211, 210, 0, 267, 280,
				279, 390, 390, 390, 42, 199, 200, 211, 0, 267, 268, 280, 391, 391, 391, 42, 200, 212, 211, 0, 268, 281,
				280, 392, 392, 392, 42, 200, 201, 212, 0, 268, 269, 281, 393, 393, 393, 42, 201, 213, 212, 0, 269, 282,
				281, 394, 394, 394, 42, 201, 202, 213, 0, 269, 270, 282, 395, 395, 395, 42, 202, 214, 213, 0, 270, 283,
				282, 396, 396, 396, 42, 202, 203, 214, 0, 270, 271, 283, 397, 397, 397, 42, 203, 215, 214, 0, 271, 284,
				283, 398, 398, 398, 42, 203, 204, 215, 0, 271, 272, 284, 399, 399, 399, 42, 204, 216, 215, 0, 272, 285,
				284, 400, 400, 400, 42, 204, 205, 216, 0, 272, 273, 285, 401, 401, 401, 42, 205, 206, 216, 0, 273, 286,
				285, 402, 402, 402, 42, 205, 195, 206, 0, 273, 274, 286, 403, 403, 403, 42, 206, 218, 217, 0, 275, 288,
				287, 404, 404, 404, 42, 206, 207, 218, 0, 275, 276, 288, 405, 405, 405, 42, 207, 219, 218, 0, 276, 289,
				288, 406, 406, 406, 42, 207, 208, 219, 0, 276, 277, 289, 407, 407, 407, 42, 208, 220, 219, 0, 277, 290,
				289, 408, 408, 408, 42, 208, 209, 220, 0, 277, 278, 290, 409, 409, 409, 42, 209, 221, 220, 0, 278, 291,
				290, 410, 410, 410, 42, 209, 210, 221, 0, 278, 279, 291, 411, 411, 411, 42, 210, 222, 221, 0, 279, 292,
				291, 412, 412, 412, 42, 210, 211, 222, 0, 279, 280, 292, 413, 413, 413, 42, 211, 223, 222, 0, 280, 293,
				292, 414, 414, 414, 42, 211, 212, 223, 0, 280, 281, 293, 415, 415, 415, 42, 212, 224, 223, 0, 281, 294,
				293, 416, 416, 416, 42, 212, 213, 224, 0, 281, 282, 294, 417, 417, 417, 42, 213, 225, 224, 0, 282, 295,
				294, 418, 418, 418, 42, 213, 214, 225, 0, 282, 283, 295, 419, 419, 419, 42, 214, 226, 225, 0, 283, 296,
				295, 420, 420, 420, 42, 214, 215, 226, 0, 283, 284, 296, 421, 421, 421, 42, 215, 227, 226, 0, 284, 297,
				296, 422, 422, 422, 42, 215, 216, 227, 0, 284, 285, 297, 423, 423, 423, 42, 216, 217, 227, 0, 285, 298,
				297, 424, 424, 424, 42, 216, 206, 217, 0, 285, 286, 298, 425, 425, 425, 42, 217, 229, 228, 0, 287, 300,
				299, 426, 426, 426, 42, 217, 218, 229, 0, 287, 288, 300, 427, 427, 427, 42, 218, 230, 229, 0, 288, 301,
				300, 428, 428, 428, 42, 218, 219, 230, 0, 288, 289, 301, 429, 429, 429, 42, 219, 231, 230, 0, 289, 302,
				301, 430, 430, 430, 42, 219, 220, 231, 0, 289, 290, 302, 431, 431, 431, 42, 220, 232, 231, 0, 290, 303,
				302, 432, 432, 432, 42, 220, 221, 232, 0, 290, 291, 303, 433, 433, 433, 42, 221, 233, 232, 0, 291, 304,
				303, 434, 434, 434, 42, 221, 222, 233, 0, 291, 292, 304, 435, 435, 435, 42, 222, 234, 233, 0, 292, 305,
				304, 436, 436, 436, 42, 222, 223, 234, 0, 292, 293, 305, 437, 437, 437, 42, 223, 235, 234, 0, 293, 306,
				305, 438, 438, 438, 42, 223, 224, 235, 0, 293, 294, 306, 439, 439, 439, 42, 224, 236, 235, 0, 294, 307,
				306, 440, 440, 440, 42, 224, 225, 236, 0, 294, 295, 307, 441, 441, 441, 42, 225, 237, 236, 0, 295, 308,
				307, 442, 442, 442, 42, 225, 226, 237, 0, 295, 296, 308, 443, 443, 443, 42, 226, 238, 237, 0, 296, 309,
				308, 444, 444, 444, 42, 226, 227, 238, 0, 296, 297, 309, 445, 445, 445, 42, 227, 228, 238, 0, 297, 310,
				309, 446, 446, 446, 42, 227, 217, 228, 0, 297, 298, 310, 447, 447, 447, 42, 228, 240, 239, 0, 299, 312,
				311, 448, 448, 448, 42, 228, 229, 240, 0, 299, 300, 312, 449, 449, 449, 42, 229, 241, 240, 0, 300, 313,
				312, 450, 450, 450, 42, 229, 230, 241, 0, 300, 301, 313, 451, 451, 451, 42, 230, 242, 241, 0, 301, 314,
				313, 452, 452, 452, 42, 230, 231, 242, 0, 301, 302, 314, 453, 453, 453, 42, 231, 243, 242, 0, 302, 315,
				314, 454, 454, 454, 42, 231, 232, 243, 0, 302, 303, 315, 455, 455, 455, 42, 232, 244, 243, 0, 303, 316,
				315, 456, 456, 456, 42, 232, 233, 244, 0, 303, 304, 316, 457, 457, 457, 42, 233, 245, 244, 0, 304, 317,
				316, 458, 458, 458, 42, 233, 234, 245, 0, 304, 305, 317, 459, 459, 459, 42, 234, 246, 245, 0, 305, 318,
				317, 460, 460, 460, 42, 234, 235, 246, 0, 305, 306, 318, 461, 461, 461, 42, 235, 247, 246, 0, 306, 319,
				318, 462, 462, 462, 42, 235, 236, 247, 0, 306, 307, 319, 463, 463, 463, 42, 236, 248, 247, 0, 307, 320,
				319, 464, 464, 464, 42, 236, 237, 248, 0, 307, 308, 320, 465, 465, 465, 42, 237, 249, 248, 0, 308, 321,
				320, 466, 466, 466, 42, 237, 238, 249, 0, 308, 309, 321, 467, 467, 467, 42, 238, 239, 249, 0, 309, 322,
				321, 468, 468, 468, 42, 238, 228, 239, 0, 309, 310, 322, 469, 469, 469, 42, 239, 251, 250, 0, 311, 324,
				323, 470, 470, 470, 42, 239, 240, 251, 0, 311, 312, 324, 471, 471, 471, 42, 240, 252, 251, 0, 312, 325,
				324, 472, 472, 472, 42, 240, 241, 252, 0, 312, 313, 325, 473, 473, 473, 42, 241, 253, 252, 0, 313, 326,
				325, 474, 474, 474, 42, 241, 242, 253, 0, 313, 314, 326, 475, 475, 475, 42, 242, 254, 253, 0, 314, 327,
				326, 476, 476, 476, 42, 242, 243, 254, 0, 314, 315, 327, 477, 477, 477, 42, 243, 255, 254, 0, 315, 328,
				327, 478, 478, 478, 42, 243, 244, 255, 0, 315, 316, 328, 479, 479, 479, 42, 244, 256, 255, 0, 316, 329,
				328, 480, 480, 480, 42, 244, 245, 256, 0, 316, 317, 329, 481, 481, 481, 42, 245, 257, 256, 0, 317, 330,
				329, 482, 482, 482, 42, 245, 246, 257, 0, 317, 318, 330, 483, 483, 483, 42, 246, 258, 257, 0, 318, 331,
				330, 484, 484, 484, 42, 246, 247, 258, 0, 318, 319, 331, 485, 485, 485, 42, 247, 259, 258, 0, 319, 332,
				331, 486, 486, 486, 42, 247, 248, 259, 0, 319, 320, 332, 487, 487, 487, 42, 248, 260, 259, 0, 320, 333,
				332, 488, 488, 488, 42, 248, 249, 260, 0, 320, 321, 333, 489, 489, 489, 42, 249, 250, 260, 0, 321, 334,
				333, 490, 490, 490, 42, 249, 239, 250, 0, 321, 322, 334, 491, 491, 491, 42, 250, 262, 261, 0, 323, 336,
				335, 492, 492, 492, 42, 250, 251, 262, 0, 323, 324, 336, 493, 493, 493, 42, 251, 263, 262, 0, 324, 337,
				336, 494, 494, 494, 42, 251, 252, 263, 0, 324, 325, 337, 495, 495, 495, 42, 252, 264, 263, 0, 325, 338,
				337, 496, 496, 496, 42, 252, 253, 264, 0, 325, 326, 338, 497, 497, 497, 42, 253, 265, 264, 0, 326, 339,
				338, 498, 498, 498, 42, 253, 254, 265, 0, 326, 327, 339, 499, 499, 499, 42, 254, 266, 265, 0, 327, 340,
				339, 500, 500, 500, 42, 254, 255, 266, 0, 327, 328, 340, 501, 501, 501, 42, 255, 267, 266, 0, 328, 341,
				340, 502, 502, 502, 42, 255, 256, 267, 0, 328, 329, 341, 503, 503, 503, 42, 256, 268, 267, 0, 329, 342,
				341, 504, 504, 504, 42, 256, 257, 268, 0, 329, 330, 342, 505, 505, 505, 42, 257, 269, 268, 0, 330, 343,
				342, 506, 506, 506, 42, 257, 258, 269, 0, 330, 331, 343, 507, 507, 507, 42, 258, 270, 269, 0, 331, 344,
				343, 508, 508, 508, 42, 258, 259, 270, 0, 331, 332, 344, 509, 509, 509, 42, 259, 271, 270, 0, 332, 345,
				344, 510, 510, 510, 42, 259, 260, 271, 0, 332, 333, 345, 511, 511, 511, 42, 260, 261, 271, 0, 333, 346,
				345, 512, 512, 512, 42, 260, 250, 261, 0, 333, 334, 346, 513, 513, 513, 42, 261, 273, 272, 0, 335, 348,
				347, 514, 514, 514, 42, 261, 262, 273, 0, 335, 336, 348, 515, 515, 515, 42, 262, 274, 273, 0, 336, 349,
				348, 516, 516, 516, 42, 262, 263, 274, 0, 336, 337, 349, 517, 517, 517, 42, 263, 275, 274, 0, 337, 350,
				349, 518, 518, 518, 42, 263, 264, 275, 0, 337, 338, 350, 519, 519, 519, 42, 264, 276, 275, 0, 338, 351,
				350, 520, 520, 520, 42, 264, 265, 276, 0, 338, 339, 351, 521, 521, 521, 42, 265, 277, 276, 0, 339, 352,
				351, 522, 522, 522, 42, 265, 266, 277, 0, 339, 340, 352, 523, 523, 523, 42, 266, 278, 277, 0, 340, 353,
				352, 524, 524, 524, 42, 266, 267, 278, 0, 340, 341, 353, 525, 525, 525, 42, 267, 279, 278, 0, 341, 354,
				353, 526, 526, 526, 42, 267, 268, 279, 0, 341, 342, 354, 527, 527, 527, 42, 268, 280, 279, 0, 342, 355,
				354, 528, 528, 528, 42, 268, 269, 280, 0, 342, 343, 355, 529, 529, 529, 42, 269, 281, 280, 0, 343, 356,
				355, 530, 530, 530, 42, 269, 270, 281, 0, 343, 344, 356, 531, 531, 531, 42, 270, 282, 281, 0, 344, 357,
				356, 532, 532, 532, 42, 270, 271, 282, 0, 344, 345, 357, 533, 533, 533, 42, 271, 272, 282, 0, 345, 358,
				357, 534, 534, 534, 42, 271, 261, 272, 0, 345, 346, 358, 535, 535, 535, 42, 272, 284, 283, 0, 347, 360,
				359, 536, 536, 536, 42, 272, 273, 284, 0, 347, 348, 360, 537, 537, 537, 42, 273, 285, 284, 0, 348, 361,
				360, 538, 538, 538, 42, 273, 274, 285, 0, 348, 349, 361, 539, 539, 539, 42, 274, 286, 285, 0, 349, 362,
				361, 540, 540, 540, 42, 274, 275, 286, 0, 349, 350, 362, 541, 541, 541, 42, 275, 287, 286, 0, 350, 363,
				362, 542, 542, 542, 42, 275, 276, 287, 0, 350, 351, 363, 543, 543, 543, 42, 276, 288, 287, 0, 351, 364,
				363, 544, 544, 544, 42, 276, 277, 288, 0, 351, 352, 364, 545, 545, 545, 42, 277, 289, 288, 0, 352, 365,
				364, 546, 546, 546, 42, 277, 278, 289, 0, 352, 353, 365, 547, 547, 547, 42, 278, 290, 289, 0, 353, 366,
				365, 548, 548, 548, 42, 278, 279, 290, 0, 353, 354, 366, 549, 549, 549, 42, 279, 291, 290, 0, 354, 367,
				366, 550, 550, 550, 42, 279, 280, 291, 0, 354, 355, 367, 551, 551, 551, 42, 280, 292, 291, 0, 355, 368,
				367, 552, 552, 552, 42, 280, 281, 292, 0, 355, 356, 368, 553, 553, 553, 42, 281, 293, 292, 0, 356, 369,
				368, 554, 554, 554, 42, 281, 282, 293, 0, 356, 357, 369, 555, 555, 555, 42, 282, 283, 293, 0, 357, 370,
				369, 556, 556, 556, 42, 282, 272, 283, 0, 357, 358, 370, 557, 557, 557, 42, 283, 295, 294, 0, 359, 372,
				371, 558, 558, 558, 42, 283, 284, 295, 0, 359, 360, 372, 559, 559, 559, 42, 284, 296, 295, 0, 360, 373,
				372, 560, 560, 560, 42, 284, 285, 296, 0, 360, 361, 373, 561, 561, 561, 42, 285, 297, 296, 0, 361, 374,
				373, 562, 562, 562, 42, 285, 286, 297, 0, 361, 362, 374, 563, 563, 563, 42, 286, 298, 297, 0, 362, 375,
				374, 564, 564, 564, 42, 286, 287, 298, 0, 362, 363, 375, 565, 565, 565, 42, 287, 299, 298, 0, 363, 376,
				375, 566, 566, 566, 42, 287, 288, 299, 0, 363, 364, 376, 567, 567, 567, 42, 288, 300, 299, 0, 364, 377,
				376, 568, 568, 568, 42, 288, 289, 300, 0, 364, 365, 377, 569, 569, 569, 42, 289, 301, 300, 0, 365, 378,
				377, 570, 570, 570, 42, 289, 290, 301, 0, 365, 366, 378, 571, 571, 571, 42, 290, 302, 301, 0, 366, 379,
				378, 572, 572, 572, 42, 290, 291, 302, 0, 366, 367, 379, 573, 573, 573, 42, 291, 303, 302, 0, 367, 380,
				379, 574, 574, 574, 42, 291, 292, 303, 0, 367, 368, 380, 575, 575, 575, 42, 292, 304, 303, 0, 368, 381,
				380, 576, 576, 576, 42, 292, 293, 304, 0, 368, 369, 381, 577, 577, 577, 42, 293, 294, 304, 0, 369, 382,
				381, 578, 578, 578, 42, 293, 283, 294, 0, 369, 370, 382, 579, 579, 579, 42, 294, 306, 305, 0, 371, 384,
				383, 580, 580, 580, 42, 294, 295, 306, 0, 371, 372, 384, 581, 581, 581, 42, 295, 307, 306, 0, 372, 385,
				384, 582, 582, 582, 42, 295, 296, 307, 0, 372, 373, 385, 583, 583, 583, 42, 296, 308, 307, 0, 373, 386,
				385, 584, 584, 584, 42, 296, 297, 308, 0, 373, 374, 386, 585, 585, 585, 42, 297, 309, 308, 0, 374, 387,
				386, 586, 586, 586, 42, 297, 298, 309, 0, 374, 375, 387, 587, 587, 587, 42, 298, 310, 309, 0, 375, 388,
				387, 588, 588, 588, 42, 298, 299, 310, 0, 375, 376, 388, 589, 589, 589, 42, 299, 311, 310, 0, 376, 389,
				388, 590, 590, 590, 42, 299, 300, 311, 0, 376, 377, 389, 591, 591, 591, 42, 300, 312, 311, 0, 377, 390,
				389, 592, 592, 592, 42, 300, 301, 312, 0, 377, 378, 390, 593, 593, 593, 42, 301, 313, 312, 0, 378, 391,
				390, 594, 594, 594, 42, 301, 302, 313, 0, 378, 379, 391, 595, 595, 595, 42, 302, 314, 313, 0, 379, 392,
				391, 596, 596, 596, 42, 302, 303, 314, 0, 379, 380, 392, 597, 597, 597, 42, 303, 315, 314, 0, 380, 393,
				392, 598, 598, 598, 42, 303, 304, 315, 0, 380, 381, 393, 599, 599, 599, 42, 304, 305, 315, 0, 381, 394,
				393, 600, 600, 600, 42, 304, 294, 305, 0, 381, 382, 394, 601, 601, 601, 42, 305, 53, 52, 0, 383, 396,
				395, 602, 602, 602, 42, 305, 306, 53, 0, 383, 384, 396, 603, 603, 603, 42, 306, 54, 53, 0, 384, 397,
				396, 604, 604, 604, 42, 306, 307, 54, 0, 384, 385, 397, 605, 605, 605, 42, 307, 55, 54, 0, 385, 398,
				397, 606, 606, 606, 42, 307, 308, 55, 0, 385, 386, 398, 607, 607, 607, 42, 308, 56, 55, 0, 386, 399,
				398, 608, 608, 608, 42, 308, 309, 56, 0, 386, 387, 399, 609, 609, 609, 42, 309, 57, 56, 0, 387, 400,
				399, 610, 610, 610, 42, 309, 310, 57, 0, 387, 388, 400, 611, 611, 611, 42, 310, 58, 57, 0, 388, 401,
				400, 612, 612, 612, 42, 310, 311, 58, 0, 388, 389, 401, 613, 613, 613, 42, 311, 59, 58, 0, 389, 402,
				401, 614, 614, 614, 42, 311, 312, 59, 0, 389, 390, 402, 615, 615, 615, 42, 312, 60, 59, 0, 390, 403,
				402, 616, 616, 616, 42, 312, 313, 60, 0, 390, 391, 403, 617, 617, 617, 42, 313, 61, 60, 0, 391, 404,
				403, 618, 618, 618, 42, 313, 314, 61, 0, 391, 392, 404, 619, 619, 619, 42, 314, 62, 61, 0, 392, 405,
				404, 620, 620, 620, 42, 314, 315, 62, 0, 392, 393, 405, 621, 621, 621, 42, 315, 52, 62, 0, 393, 406,
				405, 622, 622, 622, 42, 315, 305, 52, 0, 393, 394, 406, 623, 623, 623, 42, 316, 328, 327, 0, 407, 420,
				419, 624, 624, 624, 42, 316, 317, 328, 0, 407, 408, 420, 625, 625, 625, 42, 317, 329, 328, 0, 408, 421,
				420, 626, 626, 626, 42, 317, 318, 329, 0, 408, 409, 421, 627, 627, 627, 42, 318, 330, 329, 0, 409, 422,
				421, 628, 628, 628, 42, 318, 319, 330, 0, 409, 410, 422, 629, 629, 629, 42, 319, 331, 330, 0, 410, 423,
				422, 630, 630, 630, 42, 319, 320, 331, 0, 410, 411, 423, 631, 631, 631, 42, 320, 332, 331, 0, 411, 424,
				423, 632, 632, 632, 42, 320, 321, 332, 0, 411, 412, 424, 633, 633, 633, 42, 321, 333, 332, 0, 412, 425,
				424, 634, 634, 634, 42, 321, 322, 333, 0, 412, 413, 425, 635, 635, 635, 42, 322, 334, 333, 0, 413, 426,
				425, 636, 636, 636, 42, 322, 323, 334, 0, 413, 414, 426, 637, 637, 637, 42, 323, 335, 334, 0, 414, 427,
				426, 638, 638, 638, 42, 323, 324, 335, 0, 414, 415, 427, 639, 639, 639, 42, 324, 336, 335, 0, 415, 428,
				427, 640, 640, 640, 42, 324, 325, 336, 0, 415, 416, 428, 641, 641, 641, 42, 325, 337, 336, 0, 416, 429,
				428, 642, 642, 642, 42, 325, 326, 337, 0, 416, 417, 429, 643, 643, 643, 42, 326, 327, 337, 0, 417, 430,
				429, 644, 644, 644, 42, 326, 316, 327, 0, 417, 418, 430, 645, 645, 645, 42, 327, 339, 338, 0, 419, 432,
				431, 646, 646, 646, 42, 327, 328, 339, 0, 419, 420, 432, 647, 647, 647, 42, 328, 340, 339, 0, 420, 433,
				432, 648, 648, 648, 42, 328, 329, 340, 0, 420, 421, 433, 649, 649, 649, 42, 329, 341, 340, 0, 421, 434,
				433, 650, 650, 650, 42, 329, 330, 341, 0, 421, 422, 434, 651, 651, 651, 42, 330, 342, 341, 0, 422, 435,
				434, 652, 652, 652, 42, 330, 331, 342, 0, 422, 423, 435, 653, 653, 653, 42, 331, 343, 342, 0, 423, 436,
				435, 654, 654, 654, 42, 331, 332, 343, 0, 423, 424, 436, 655, 655, 655, 42, 332, 344, 343, 0, 424, 437,
				436, 656, 656, 656, 42, 332, 333, 344, 0, 424, 425, 437, 657, 657, 657, 42, 333, 345, 344, 0, 425, 438,
				437, 658, 658, 658, 42, 333, 334, 345, 0, 425, 426, 438, 659, 659, 659, 42, 334, 346, 345, 0, 426, 439,
				438, 660, 660, 660, 42, 334, 335, 346, 0, 426, 427, 439, 661, 661, 661, 42, 335, 347, 346, 0, 427, 440,
				439, 662, 662, 662, 42, 335, 336, 347, 0, 427, 428, 440, 663, 663, 663, 42, 336, 348, 347, 0, 428, 441,
				440, 664, 664, 664, 42, 336, 337, 348, 0, 428, 429, 441, 665, 665, 665, 42, 337, 338, 348, 0, 429, 442,
				441, 666, 666, 666, 42, 337, 327, 338, 0, 429, 430, 442, 667, 667, 667, 42, 338, 350, 349, 0, 431, 444,
				443, 668, 668, 668, 42, 338, 339, 350, 0, 431, 432, 444, 669, 669, 669, 42, 339, 351, 350, 0, 432, 445,
				444, 670, 670, 670, 42, 339, 340, 351, 0, 432, 433, 445, 671, 671, 671, 42, 340, 352, 351, 0, 433, 446,
				445, 672, 672, 672, 42, 340, 341, 352, 0, 433, 434, 446, 673, 673, 673, 42, 341, 353, 352, 0, 434, 447,
				446, 674, 674, 674, 42, 341, 342, 353, 0, 434, 435, 447, 675, 675, 675, 42, 342, 354, 353, 0, 435, 448,
				447, 676, 676, 676, 42, 342, 343, 354, 0, 435, 436, 448, 677, 677, 677, 42, 343, 355, 354, 0, 436, 449,
				448, 678, 678, 678, 42, 343, 344, 355, 0, 436, 437, 449, 679, 679, 679, 42, 344, 356, 355, 0, 437, 450,
				449, 680, 680, 680, 42, 344, 345, 356, 0, 437, 438, 450, 681, 681, 681, 42, 345, 357, 356, 0, 438, 451,
				450, 682, 682, 682, 42, 345, 346, 357, 0, 438, 439, 451, 683, 683, 683, 42, 346, 358, 357, 0, 439, 452,
				451, 684, 684, 684, 42, 346, 347, 358, 0, 439, 440, 452, 685, 685, 685, 42, 347, 359, 358, 0, 440, 453,
				452, 686, 686, 686, 42, 347, 348, 359, 0, 440, 441, 453, 687, 687, 687, 42, 348, 349, 359, 0, 441, 454,
				453, 688, 688, 688, 42, 348, 338, 349, 0, 441, 442, 454, 689, 689, 689, 42, 349, 361, 360, 0, 443, 456,
				455, 690, 690, 690, 42, 349, 350, 361, 0, 443, 444, 456, 691, 691, 691, 42, 350, 362, 361, 0, 444, 457,
				456, 692, 692, 692, 42, 350, 351, 362, 0, 444, 445, 457, 693, 693, 693, 42, 351, 363, 362, 0, 445, 458,
				457, 694, 694, 694, 42, 351, 352, 363, 0, 445, 446, 458, 695, 695, 695, 42, 352, 364, 363, 0, 446, 459,
				458, 696, 696, 696, 42, 352, 353, 364, 0, 446, 447, 459, 697, 697, 697, 42, 353, 365, 364, 0, 447, 460,
				459, 698, 698, 698, 42, 353, 354, 365, 0, 447, 448, 460, 699, 699, 699, 42, 354, 366, 365, 0, 448, 461,
				460, 700, 700, 700, 42, 354, 355, 366, 0, 448, 449, 461, 701, 701, 701, 42, 355, 367, 366, 0, 449, 462,
				461, 702, 702, 702, 42, 355, 356, 367, 0, 449, 450, 462, 703, 703, 703, 42, 356, 368, 367, 0, 450, 463,
				462, 704, 704, 704, 42, 356, 357, 368, 0, 450, 451, 463, 705, 705, 705, 42, 357, 369, 368, 0, 451, 464,
				463, 706, 706, 706, 42, 357, 358, 369, 0, 451, 452, 464, 707, 707, 707, 42, 358, 370, 369, 0, 452, 465,
				464, 708, 708, 708, 42, 358, 359, 370, 0, 452, 453, 465, 709, 709, 709, 42, 359, 360, 370, 0, 453, 466,
				465, 710, 710, 710, 42, 359, 349, 360, 0, 453, 454, 466, 711, 711, 711, 42, 360, 372, 371, 0, 455, 468,
				467, 712, 712, 712, 42, 360, 361, 372, 0, 455, 456, 468, 713, 713, 713, 42, 361, 373, 372, 0, 456, 469,
				468, 714, 714, 714, 42, 361, 362, 373, 0, 456, 457, 469, 715, 715, 715, 42, 362, 374, 373, 0, 457, 470,
				469, 716, 716, 716, 42, 362, 363, 374, 0, 457, 458, 470, 717, 717, 717, 42, 363, 375, 374, 0, 458, 471,
				470, 718, 718, 718, 42, 363, 364, 375, 0, 458, 459, 471, 719, 719, 719, 42, 364, 376, 375, 0, 459, 472,
				471, 720, 720, 720, 42, 364, 365, 376, 0, 459, 460, 472, 721, 721, 721, 42, 365, 377, 376, 0, 460, 473,
				472, 722, 722, 722, 42, 365, 366, 377, 0, 460, 461, 473, 723, 723, 723, 42, 366, 378, 377, 0, 461, 474,
				473, 724, 724, 724, 42, 366, 367, 378, 0, 461, 462, 474, 725, 725, 725, 42, 367, 379, 378, 0, 462, 475,
				474, 726, 726, 726, 42, 367, 368, 379, 0, 462, 463, 475, 727, 727, 727, 42, 368, 380, 379, 0, 463, 476,
				475, 728, 728, 728, 42, 368, 369, 380, 0, 463, 464, 476, 729, 729, 729, 42, 369, 381, 380, 0, 464, 477,
				476, 730, 730, 730, 42, 369, 370, 381, 0, 464, 465, 477, 731, 731, 731, 42, 370, 371, 381, 0, 465, 478,
				477, 732, 732, 732, 42, 370, 360, 371, 0, 465, 466, 478, 733, 733, 733, 42, 371, 383, 382, 0, 467, 480,
				479, 734, 734, 734, 42, 371, 372, 383, 0, 467, 468, 480, 735, 735, 735, 42, 372, 384, 383, 0, 468, 481,
				480, 736, 736, 736, 42, 372, 373, 384, 0, 468, 469, 481, 737, 737, 737, 42, 373, 385, 384, 0, 469, 482,
				481, 738, 738, 738, 42, 373, 374, 385, 0, 469, 470, 482, 739, 739, 739, 42, 374, 386, 385, 0, 470, 483,
				482, 740, 740, 740, 42, 374, 375, 386, 0, 470, 471, 483, 741, 741, 741, 42, 375, 387, 386, 0, 471, 484,
				483, 742, 742, 742, 42, 375, 376, 387, 0, 471, 472, 484, 743, 743, 743, 42, 376, 388, 387, 0, 472, 485,
				484, 744, 744, 744, 42, 376, 377, 388, 0, 472, 473, 485, 745, 745, 745, 42, 377, 389, 388, 0, 473, 486,
				485, 746, 746, 746, 42, 377, 378, 389, 0, 473, 474, 486, 747, 747, 747, 42, 378, 390, 389, 0, 474, 487,
				486, 748, 748, 748, 42, 378, 379, 390, 0, 474, 475, 487, 749, 749, 749, 42, 379, 391, 390, 0, 475, 488,
				487, 750, 750, 750, 42, 379, 380, 391, 0, 475, 476, 488, 751, 751, 751, 42, 380, 392, 391, 0, 476, 489,
				488, 752, 752, 752, 42, 380, 381, 392, 0, 476, 477, 489, 753, 753, 753, 42, 381, 382, 392, 0, 477, 490,
				489, 754, 754, 754, 42, 381, 371, 382, 0, 477, 478, 490, 755, 755, 755, 42, 382, 394, 393, 0, 479, 492,
				491, 756, 756, 756, 42, 382, 383, 394, 0, 479, 480, 492, 757, 757, 757, 42, 383, 395, 394, 0, 480, 493,
				492, 758, 758, 758, 42, 383, 384, 395, 0, 480, 481, 493, 759, 759, 759, 42, 384, 396, 395, 0, 481, 494,
				493, 760, 760, 760, 42, 384, 385, 396, 0, 481, 482, 494, 761, 761, 761, 42, 385, 397, 396, 0, 482, 495,
				494, 762, 762, 762, 42, 385, 386, 397, 0, 482, 483, 495, 763, 763, 763, 42, 386, 398, 397, 0, 483, 496,
				495, 764, 764, 764, 42, 386, 387, 398, 0, 483, 484, 496, 765, 765, 765, 42, 387, 399, 398, 0, 484, 497,
				496, 766, 766, 766, 42, 387, 388, 399, 0, 484, 485, 497, 767, 767, 767, 42, 388, 400, 399, 0, 485, 498,
				497, 768, 768, 768, 42, 388, 389, 400, 0, 485, 486, 498, 769, 769, 769, 42, 389, 401, 400, 0, 486, 499,
				498, 770, 770, 770, 42, 389, 390, 401, 0, 486, 487, 499, 771, 771, 771, 42, 390, 402, 401, 0, 487, 500,
				499, 772, 772, 772, 42, 390, 391, 402, 0, 487, 488, 500, 773, 773, 773, 42, 391, 403, 402, 0, 488, 501,
				500, 774, 774, 774, 42, 391, 392, 403, 0, 488, 489, 501, 775, 775, 775, 42, 392, 393, 403, 0, 489, 502,
				501, 776, 776, 776, 42, 392, 382, 393, 0, 489, 490, 502, 777, 777, 777, 42, 393, 405, 404, 0, 491, 504,
				503, 778, 778, 778, 42, 393, 394, 405, 0, 491, 492, 504, 779, 779, 779, 42, 394, 406, 405, 0, 492, 505,
				504, 780, 780, 780, 42, 394, 395, 406, 0, 492, 493, 505, 781, 781, 781, 42, 395, 407, 406, 0, 493, 506,
				505, 782, 782, 782, 42, 395, 396, 407, 0, 493, 494, 506, 783, 783, 783, 42, 396, 408, 407, 0, 494, 507,
				506, 784, 784, 784, 42, 396, 397, 408, 0, 494, 495, 507, 785, 785, 785, 42, 397, 409, 408, 0, 495, 508,
				507, 786, 786, 786, 42, 397, 398, 409, 0, 495, 496, 508, 787, 787, 787, 42, 398, 410, 409, 0, 496, 509,
				508, 788, 788, 788, 42, 398, 399, 410, 0, 496, 497, 509, 789, 789, 789, 42, 399, 411, 410, 0, 497, 510,
				509, 790, 790, 790, 42, 399, 400, 411, 0, 497, 498, 510, 791, 791, 791, 42, 400, 412, 411, 0, 498, 511,
				510, 792, 792, 792, 42, 400, 401, 412, 0, 498, 499, 511, 793, 793, 793, 42, 401, 413, 412, 0, 499, 512,
				511, 794, 794, 794, 42, 401, 402, 413, 0, 499, 500, 512, 795, 795, 795, 42, 402, 414, 413, 0, 500, 513,
				512, 796, 796, 796, 42, 402, 403, 414, 0, 500, 501, 513, 797, 797, 797, 42, 403, 404, 414, 0, 501, 514,
				513, 798, 798, 798, 42, 403, 393, 404, 0, 501, 502, 514, 799, 799, 799, 42, 404, 416, 415, 0, 503, 516,
				515, 800, 800, 800, 42, 404, 405, 416, 0, 503, 504, 516, 801, 801, 801, 42, 405, 417, 416, 0, 504, 517,
				516, 802, 802, 802, 42, 405, 406, 417, 0, 504, 505, 517, 803, 803, 803, 42, 406, 418, 417, 0, 505, 518,
				517, 804, 804, 804, 42, 406, 407, 418, 0, 505, 506, 518, 805, 805, 805, 42, 407, 419, 418, 0, 506, 519,
				518, 806, 806, 806, 42, 407, 408, 419, 0, 506, 507, 519, 807, 807, 807, 42, 408, 420, 419, 0, 507, 520,
				519, 808, 808, 808, 42, 408, 409, 420, 0, 507, 508, 520, 809, 809, 809, 42, 409, 421, 420, 0, 508, 521,
				520, 810, 810, 810, 42, 409, 410, 421, 0, 508, 509, 521, 811, 811, 811, 42, 410, 422, 421, 0, 509, 522,
				521, 812, 812, 812, 42, 410, 411, 422, 0, 509, 510, 522, 813, 813, 813, 42, 411, 423, 422, 0, 510, 523,
				522, 814, 814, 814, 42, 411, 412, 423, 0, 510, 511, 523, 815, 815, 815, 42, 412, 424, 423, 0, 511, 524,
				523, 816, 816, 816, 42, 412, 413, 424, 0, 511, 512, 524, 817, 817, 817, 42, 413, 425, 424, 0, 512, 525,
				524, 818, 818, 818, 42, 413, 414, 425, 0, 512, 513, 525, 819, 819, 819, 42, 414, 415, 425, 0, 513, 526,
				525, 820, 820, 820, 42, 414, 404, 415, 0, 513, 514, 526, 821, 821, 821, 42, 415, 427, 426, 0, 515, 528,
				527, 822, 822, 822, 42, 415, 416, 427, 0, 515, 516, 528, 823, 823, 823, 42, 416, 428, 427, 0, 516, 529,
				528, 824, 824, 824, 42, 416, 417, 428, 0, 516, 517, 529, 825, 825, 825, 42, 417, 429, 428, 0, 517, 530,
				529, 826, 826, 826, 42, 417, 418, 429, 0, 517, 518, 530, 827, 827, 827, 42, 418, 430, 429, 0, 518, 531,
				530, 828, 828, 828, 42, 418, 419, 430, 0, 518, 519, 531, 829, 829, 829, 42, 419, 431, 430, 0, 519, 532,
				531, 830, 830, 830, 42, 419, 420, 431, 0, 519, 520, 532, 831, 831, 831, 42, 420, 432, 431, 0, 520, 533,
				532, 832, 832, 832, 42, 420, 421, 432, 0, 520, 521, 533, 833, 833, 833, 42, 421, 433, 432, 0, 521, 534,
				533, 834, 834, 834, 42, 421, 422, 433, 0, 521, 522, 534, 835, 835, 835, 42, 422, 434, 433, 0, 522, 535,
				534, 836, 836, 836, 42, 422, 423, 434, 0, 522, 523, 535, 837, 837, 837, 42, 423, 435, 434, 0, 523, 536,
				535, 838, 838, 838, 42, 423, 424, 435, 0, 523, 524, 536, 839, 839, 839, 42, 424, 436, 435, 0, 524, 537,
				536, 840, 840, 840, 42, 424, 425, 436, 0, 524, 525, 537, 841, 841, 841, 42, 425, 426, 436, 0, 525, 538,
				537, 842, 842, 842, 42, 425, 415, 426, 0, 525, 526, 538, 843, 843, 843, 42, 426, 438, 437, 0, 527, 540,
				539, 844, 844, 844, 42, 426, 427, 438, 0, 527, 528, 540, 845, 845, 845, 42, 427, 439, 438, 0, 528, 541,
				540, 846, 846, 846, 42, 427, 428, 439, 0, 528, 529, 541, 847, 847, 847, 42, 428, 440, 439, 0, 529, 542,
				541, 848, 848, 848, 42, 428, 429, 440, 0, 529, 530, 542, 849, 849, 849, 42, 429, 441, 440, 0, 530, 543,
				542, 850, 850, 850, 42, 429, 430, 441, 0, 530, 531, 543, 851, 851, 851, 42, 430, 442, 441, 0, 531, 544,
				543, 852, 852, 852, 42, 430, 431, 442, 0, 531, 532, 544, 853, 853, 853, 42, 431, 443, 442, 0, 532, 545,
				544, 854, 854, 854, 42, 431, 432, 443, 0, 532, 533, 545, 855, 855, 855, 42, 432, 444, 443, 0, 533, 546,
				545, 856, 856, 856, 42, 432, 433, 444, 0, 533, 534, 546, 857, 857, 857, 42, 433, 445, 444, 0, 534, 547,
				546, 858, 858, 858, 42, 433, 434, 445, 0, 534, 535, 547, 859, 859, 859, 42, 434, 446, 445, 0, 535, 548,
				547, 860, 860, 860, 42, 434, 435, 446, 0, 535, 536, 548, 861, 861, 861, 42, 435, 447, 446, 0, 536, 549,
				548, 862, 862, 862, 42, 435, 436, 447, 0, 536, 537, 549, 863, 863, 863, 42, 436, 437, 447, 0, 537, 550,
				549, 864, 864, 864, 42, 436, 426, 437, 0, 537, 538, 550, 865, 865, 865, 42, 437, 449, 448, 0, 539, 552,
				551, 866, 866, 866, 42, 437, 438, 449, 0, 539, 540, 552, 867, 867, 867, 42, 438, 450, 449, 0, 540, 553,
				552, 868, 868, 868, 42, 438, 439, 450, 0, 540, 541, 553, 869, 869, 869, 42, 439, 451, 450, 0, 541, 554,
				553, 870, 870, 870, 42, 439, 440, 451, 0, 541, 542, 554, 871, 871, 871, 42, 440, 452, 451, 0, 542, 555,
				554, 872, 872, 872, 42, 440, 441, 452, 0, 542, 543, 555, 873, 873, 873, 42, 441, 453, 452, 0, 543, 556,
				555, 874, 874, 874, 42, 441, 442, 453, 0, 543, 544, 556, 875, 875, 875, 42, 442, 454, 453, 0, 544, 557,
				556, 876, 876, 876, 42, 442, 443, 454, 0, 544, 545, 557, 877, 877, 877, 42, 443, 455, 454, 0, 545, 558,
				557, 878, 878, 878, 42, 443, 444, 455, 0, 545, 546, 558, 879, 879, 879, 42, 444, 456, 455, 0, 546, 559,
				558, 880, 880, 880, 42, 444, 445, 456, 0, 546, 547, 559, 881, 881, 881, 42, 445, 457, 456, 0, 547, 560,
				559, 882, 882, 882, 42, 445, 446, 457, 0, 547, 548, 560, 883, 883, 883, 42, 446, 458, 457, 0, 548, 561,
				560, 884, 884, 884, 42, 446, 447, 458, 0, 548, 549, 561, 885, 885, 885, 42, 447, 448, 458, 0, 549, 562,
				561, 886, 886, 886, 42, 447, 437, 448, 0, 549, 550, 562, 887, 887, 887, 42, 448, 460, 459, 0, 551, 564,
				563, 888, 888, 888, 42, 448, 449, 460, 0, 551, 552, 564, 889, 889, 889, 42, 449, 461, 460, 0, 552, 565,
				564, 890, 890, 890, 42, 449, 450, 461, 0, 552, 553, 565, 891, 891, 891, 42, 450, 462, 461, 0, 553, 566,
				565, 892, 892, 892, 42, 450, 451, 462, 0, 553, 554, 566, 893, 893, 893, 42, 451, 463, 462, 0, 554, 567,
				566, 894, 894, 894, 42, 451, 452, 463, 0, 554, 555, 567, 895, 895, 895, 42, 452, 464, 463, 0, 555, 568,
				567, 896, 896, 896, 42, 452, 453, 464, 0, 555, 556, 568, 897, 897, 897, 42, 453, 465, 464, 0, 556, 569,
				568, 898, 898, 898, 42, 453, 454, 465, 0, 556, 557, 569, 899, 899, 899, 42, 454, 466, 465, 0, 557, 570,
				569, 900, 900, 900, 42, 454, 455, 466, 0, 557, 558, 570, 901, 901, 901, 42, 455, 467, 466, 0, 558, 571,
				570, 902, 902, 902, 42, 455, 456, 467, 0, 558, 559, 571, 903, 903, 903, 42, 456, 468, 467, 0, 559, 572,
				571, 904, 904, 904, 42, 456, 457, 468, 0, 559, 560, 572, 905, 905, 905, 42, 457, 469, 468, 0, 560, 573,
				572, 906, 906, 906, 42, 457, 458, 469, 0, 560, 561, 573, 907, 907, 907, 42, 458, 459, 469, 0, 561, 574,
				573, 908, 908, 908, 42, 458, 448, 459, 0, 561, 562, 574, 909, 909, 909, 42, 459, 471, 470, 0, 563, 576,
				575, 910, 910, 910, 42, 459, 460, 471, 0, 563, 564, 576, 911, 911, 911, 42, 460, 472, 471, 0, 564, 577,
				576, 912, 912, 912, 42, 460, 461, 472, 0, 564, 565, 577, 913, 913, 913, 42, 461, 473, 472, 0, 565, 578,
				577, 914, 914, 914, 42, 461, 462, 473, 0, 565, 566, 578, 915, 915, 915, 42, 462, 474, 473, 0, 566, 579,
				578, 916, 916, 916, 42, 462, 463, 474, 0, 566, 567, 579, 917, 917, 917, 42, 463, 475, 474, 0, 567, 580,
				579, 918, 918, 918, 42, 463, 464, 475, 0, 567, 568, 580, 919, 919, 919, 42, 464, 476, 475, 0, 568, 581,
				580, 920, 920, 920, 42, 464, 465, 476, 0, 568, 569, 581, 921, 921, 921, 42, 465, 477, 476, 0, 569, 582,
				581, 922, 922, 922, 42, 465, 466, 477, 0, 569, 570, 582, 923, 923, 923, 42, 466, 478, 477, 0, 570, 583,
				582, 924, 924, 924, 42, 466, 467, 478, 0, 570, 571, 583, 925, 925, 925, 42, 467, 479, 478, 0, 571, 584,
				583, 926, 926, 926, 42, 467, 468, 479, 0, 571, 572, 584, 927, 927, 927, 42, 468, 480, 479, 0, 572, 585,
				584, 928, 928, 928, 42, 468, 469, 480, 0, 572, 573, 585, 929, 929, 929, 42, 469, 470, 480, 0, 573, 586,
				585, 930, 930, 930, 42, 469, 459, 470, 0, 573, 574, 586, 931, 931, 931, 42, 470, 482, 481, 0, 575, 588,
				587, 932, 932, 932, 42, 470, 471, 482, 0, 575, 576, 588, 933, 933, 933, 42, 471, 483, 482, 0, 576, 589,
				588, 934, 934, 934, 42, 471, 472, 483, 0, 576, 577, 589, 935, 935, 935, 42, 472, 484, 483, 0, 577, 590,
				589, 936, 936, 936, 42, 472, 473, 484, 0, 577, 578, 590, 937, 937, 937, 42, 473, 485, 484, 0, 578, 591,
				590, 938, 938, 938, 42, 473, 474, 485, 0, 578, 579, 591, 939, 939, 939, 42, 474, 486, 485, 0, 579, 592,
				591, 940, 940, 940, 42, 474, 475, 486, 0, 579, 580, 592, 941, 941, 941, 42, 475, 487, 486, 0, 580, 593,
				592, 942, 942, 942, 42, 475, 476, 487, 0, 580, 581, 593, 943, 943, 943, 42, 476, 488, 487, 0, 581, 594,
				593, 944, 944, 944, 42, 476, 477, 488, 0, 581, 582, 594, 945, 945, 945, 42, 477, 489, 488, 0, 582, 595,
				594, 946, 946, 946, 42, 477, 478, 489, 0, 582, 583, 595, 947, 947, 947, 42, 478, 490, 489, 0, 583, 596,
				595, 948, 948, 948, 42, 478, 479, 490, 0, 583, 584, 596, 949, 949, 949, 42, 479, 491, 490, 0, 584, 597,
				596, 950, 950, 950, 42, 479, 480, 491, 0, 584, 585, 597, 951, 951, 951, 42, 480, 481, 491, 0, 585, 598,
				597, 952, 952, 952, 42, 480, 470, 481, 0, 585, 586, 598, 953, 953, 953, 42, 481, 493, 492, 0, 587, 600,
				599, 954, 954, 954, 42, 481, 482, 493, 0, 587, 588, 600, 955, 955, 955, 42, 482, 494, 493, 0, 588, 601,
				600, 956, 956, 956, 42, 482, 483, 494, 0, 588, 589, 601, 957, 957, 957, 42, 483, 495, 494, 0, 589, 602,
				601, 958, 958, 958, 42, 483, 484, 495, 0, 589, 590, 602, 959, 959, 959, 42, 484, 496, 495, 0, 590, 603,
				602, 960, 960, 960, 42, 484, 485, 496, 0, 590, 591, 603, 961, 961, 961, 42, 485, 497, 496, 0, 591, 604,
				603, 962, 962, 962, 42, 485, 486, 497, 0, 591, 592, 604, 963, 963, 963, 42, 486, 498, 497, 0, 592, 605,
				604, 964, 964, 964, 42, 486, 487, 498, 0, 592, 593, 605, 965, 965, 965, 42, 487, 499, 498, 0, 593, 606,
				605, 966, 966, 966, 42, 487, 488, 499, 0, 593, 594, 606, 967, 967, 967, 42, 488, 500, 499, 0, 594, 607,
				606, 968, 968, 968, 42, 488, 489, 500, 0, 594, 595, 607, 969, 969, 969, 42, 489, 501, 500, 0, 595, 608,
				607, 970, 970, 970, 42, 489, 490, 501, 0, 595, 596, 608, 971, 971, 971, 42, 490, 502, 501, 0, 596, 609,
				608, 972, 972, 972, 42, 490, 491, 502, 0, 596, 597, 609, 973, 973, 973, 42, 491, 492, 502, 0, 597, 610,
				609, 974, 974, 974, 42, 491, 481, 492, 0, 597, 598, 610, 975, 975, 975, 42, 492, 504, 503, 0, 599, 612,
				611, 976, 976, 976, 42, 492, 493, 504, 0, 599, 600, 612, 977, 977, 977, 42, 493, 505, 504, 0, 600, 613,
				612, 978, 978, 978, 42, 493, 494, 505, 0, 600, 601, 613, 979, 979, 979, 42, 494, 506, 505, 0, 601, 614,
				613, 980, 980, 980, 42, 494, 495, 506, 0, 601, 602, 614, 981, 981, 981, 42, 495, 507, 506, 0, 602, 615,
				614, 982, 982, 982, 42, 495, 496, 507, 0, 602, 603, 615, 983, 983, 983, 42, 496, 508, 507, 0, 603, 616,
				615, 984, 984, 984, 42, 496, 497, 508, 0, 603, 604, 616, 985, 985, 985, 42, 497, 509, 508, 0, 604, 617,
				616, 986, 986, 986, 42, 497, 498, 509, 0, 604, 605, 617, 987, 987, 987, 42, 498, 510, 509, 0, 605, 618,
				617, 988, 988, 988, 42, 498, 499, 510, 0, 605, 606, 618, 989, 989, 989, 42, 499, 511, 510, 0, 606, 619,
				618, 990, 990, 990, 42, 499, 500, 511, 0, 606, 607, 619, 991, 991, 991, 42, 500, 512, 511, 0, 607, 620,
				619, 992, 992, 992, 42, 500, 501, 512, 0, 607, 608, 620, 993, 993, 993, 42, 501, 513, 512, 0, 608, 621,
				620, 994, 994, 994, 42, 501, 502, 513, 0, 608, 609, 621, 995, 995, 995, 42, 502, 503, 513, 0, 609, 622,
				621, 996, 996, 996, 42, 502, 492, 503, 0, 609, 610, 622, 997, 997, 997, 42, 503, 515, 514, 0, 611, 624,
				623, 998, 998, 998, 42, 503, 504, 515, 0, 611, 612, 624, 999, 999, 999, 42, 504, 516, 515, 0, 612, 625,
				624, 1000, 1000, 1000, 42, 504, 505, 516, 0, 612, 613, 625, 1001, 1001, 1001, 42, 505, 517, 516, 0,
				613, 626, 625, 1002, 1002, 1002, 42, 505, 506, 517, 0, 613, 614, 626, 1003, 1003, 1003, 42, 506, 518,
				517, 0, 614, 627, 626, 1004, 1004, 1004, 42, 506, 507, 518, 0, 614, 615, 627, 1005, 1005, 1005, 42,
				507, 519, 518, 0, 615, 628, 627, 1006, 1006, 1006, 42, 507, 508, 519, 0, 615, 616, 628, 1007, 1007,
				1007, 42, 508, 520, 519, 0, 616, 629, 628, 1008, 1008, 1008, 42, 508, 509, 520, 0, 616, 617, 629, 1009,
				1009, 1009, 42, 509, 521, 520, 0, 617, 630, 629, 1010, 1010, 1010, 42, 509, 510, 521, 0, 617, 618, 630,
				1011, 1011, 1011, 42, 510, 522, 521, 0, 618, 631, 630, 1012, 1012, 1012, 42, 510, 511, 522, 0, 618,
				619, 631, 1013, 1013, 1013, 42, 511, 523, 522, 0, 619, 632, 631, 1014, 1014, 1014, 42, 511, 512, 523,
				0, 619, 620, 632, 1015, 1015, 1015, 42, 512, 524, 523, 0, 620, 633, 632, 1016, 1016, 1016, 42, 512,
				513, 524, 0, 620, 621, 633, 1017, 1017, 1017, 42, 513, 514, 524, 0, 621, 634, 633, 1018, 1018, 1018,
				42, 513, 503, 514, 0, 621, 622, 634, 1019, 1019, 1019, 42, 514, 526, 525, 0, 623, 636, 635, 1020, 1020,
				1020, 42, 514, 515, 526, 0, 623, 624, 636, 1021, 1021, 1021, 42, 515, 527, 526, 0, 624, 637, 636, 1022,
				1022, 1022, 42, 515, 516, 527, 0, 624, 625, 637, 1023, 1023, 1023, 42, 516, 528, 527, 0, 625, 638, 637,
				1024, 1024, 1024, 42, 516, 517, 528, 0, 625, 626, 638, 1025, 1025, 1025, 42, 517, 529, 528, 0, 626,
				639, 638, 1026, 1026, 1026, 42, 517, 518, 529, 0, 626, 627, 639, 1027, 1027, 1027, 42, 518, 530, 529,
				0, 627, 640, 639, 1028, 1028, 1028, 42, 518, 519, 530, 0, 627, 628, 640, 1029, 1029, 1029, 42, 519,
				531, 530, 0, 628, 641, 640, 1030, 1030, 1030, 42, 519, 520, 531, 0, 628, 629, 641, 1031, 1031, 1031,
				42, 520, 532, 531, 0, 629, 642, 641, 1032, 1032, 1032, 42, 520, 521, 532, 0, 629, 630, 642, 1033, 1033,
				1033, 42, 521, 533, 532, 0, 630, 643, 642, 1034, 1034, 1034, 42, 521, 522, 533, 0, 630, 631, 643, 1035,
				1035, 1035, 42, 522, 534, 533, 0, 631, 644, 643, 1036, 1036, 1036, 42, 522, 523, 534, 0, 631, 632, 644,
				1037, 1037, 1037, 42, 523, 535, 534, 0, 632, 645, 644, 1038, 1038, 1038, 42, 523, 524, 535, 0, 632,
				633, 645, 1039, 1039, 1039, 42, 524, 525, 535, 0, 633, 646, 645, 1040, 1040, 1040, 42, 524, 514, 525,
				0, 633, 634, 646, 1041, 1041, 1041, 42, 525, 537, 536, 0, 635, 648, 647, 1042, 1042, 1042, 42, 525,
				526, 537, 0, 635, 636, 648, 1043, 1043, 1043, 42, 526, 538, 537, 0, 636, 649, 648, 1044, 1044, 1044,
				42, 526, 527, 538, 0, 636, 637, 649, 1045, 1045, 1045, 42, 527, 539, 538, 0, 637, 650, 649, 1046, 1046,
				1046, 42, 527, 528, 539, 0, 637, 638, 650, 1047, 1047, 1047, 42, 528, 540, 539, 0, 638, 651, 650, 1048,
				1048, 1048, 42, 528, 529, 540, 0, 638, 639, 651, 1049, 1049, 1049, 42, 529, 541, 540, 0, 639, 652, 651,
				1050, 1050, 1050, 42, 529, 530, 541, 0, 639, 640, 652, 1051, 1051, 1051, 42, 530, 542, 541, 0, 640,
				653, 652, 1052, 1052, 1052, 42, 530, 531, 542, 0, 640, 641, 653, 1053, 1053, 1053, 42, 531, 543, 542,
				0, 641, 654, 653, 1054, 1054, 1054, 42, 531, 532, 543, 0, 641, 642, 654, 1055, 1055, 1055, 42, 532,
				544, 543, 0, 642, 655, 654, 1056, 1056, 1056, 42, 532, 533, 544, 0, 642, 643, 655, 1057, 1057, 1057,
				42, 533, 545, 544, 0, 643, 656, 655, 1058, 1058, 1058, 42, 533, 534, 545, 0, 643, 644, 656, 1059, 1059,
				1059, 42, 534, 546, 545, 0, 644, 657, 656, 1060, 1060, 1060, 42, 534, 535, 546, 0, 644, 645, 657, 1061,
				1061, 1061, 42, 535, 536, 546, 0, 645, 658, 657, 1062, 1062, 1062, 42, 535, 525, 536, 0, 645, 646, 658,
				1063, 1063, 1063, 42, 536, 548, 547, 0, 647, 660, 659, 1064, 1064, 1064, 42, 536, 537, 548, 0, 647,
				648, 660, 1065, 1065, 1065, 42, 537, 549, 548, 0, 648, 661, 660, 1066, 1066, 1066, 42, 537, 538, 549,
				0, 648, 649, 661, 1067, 1067, 1067, 42, 538, 550, 549, 0, 649, 662, 661, 1068, 1068, 1068, 42, 538,
				539, 550, 0, 649, 650, 662, 1069, 1069, 1069, 42, 539, 551, 550, 0, 650, 663, 662, 1070, 1070, 1070,
				42, 539, 540, 551, 0, 650, 651, 663, 1071, 1071, 1071, 42, 540, 552, 551, 0, 651, 664, 663, 1072, 1072,
				1072, 42, 540, 541, 552, 0, 651, 652, 664, 1073, 1073, 1073, 42, 541, 553, 552, 0, 652, 665, 664, 1074,
				1074, 1074, 42, 541, 542, 553, 0, 652, 653, 665, 1075, 1075, 1075, 42, 542, 554, 553, 0, 653, 666, 665,
				1076, 1076, 1076, 42, 542, 543, 554, 0, 653, 654, 666, 1077, 1077, 1077, 42, 543, 555, 554, 0, 654,
				667, 666, 1078, 1078, 1078, 42, 543, 544, 555, 0, 654, 655, 667, 1079, 1079, 1079, 42, 544, 556, 555,
				0, 655, 668, 667, 1080, 1080, 1080, 42, 544, 545, 556, 0, 655, 656, 668, 1081, 1081, 1081, 42, 545,
				557, 556, 0, 656, 669, 668, 1082, 1082, 1082, 42, 545, 546, 557, 0, 656, 657, 669, 1083, 1083, 1083,
				42, 546, 547, 557, 0, 657, 670, 669, 1084, 1084, 1084, 42, 546, 536, 547, 0, 657, 658, 670, 1085, 1085,
				1085, 42, 547, 559, 558, 0, 659, 672, 671, 1086, 1086, 1086, 42, 547, 548, 559, 0, 659, 660, 672, 1087,
				1087, 1087, 42, 548, 560, 559, 0, 660, 673, 672, 1088, 1088, 1088, 42, 548, 549, 560, 0, 660, 661, 673,
				1089, 1089, 1089, 42, 549, 561, 560, 0, 661, 674, 673, 1090, 1090, 1090, 42, 549, 550, 561, 0, 661,
				662, 674, 1091, 1091, 1091, 42, 550, 562, 561, 0, 662, 675, 674, 1092, 1092, 1092, 42, 550, 551, 562,
				0, 662, 663, 675, 1093, 1093, 1093, 42, 551, 563, 562, 0, 663, 676, 675, 1094, 1094, 1094, 42, 551,
				552, 563, 0, 663, 664, 676, 1095, 1095, 1095, 42, 552, 564, 563, 0, 664, 677, 676, 1096, 1096, 1096,
				42, 552, 553, 564, 0, 664, 665, 677, 1097, 1097, 1097, 42, 553, 565, 564, 0, 665, 678, 677, 1098, 1098,
				1098, 42, 553, 554, 565, 0, 665, 666, 678, 1099, 1099, 1099, 42, 554, 566, 565, 0, 666, 679, 678, 1100,
				1100, 1100, 42, 554, 555, 566, 0, 666, 667, 679, 1101, 1101, 1101, 42, 555, 567, 566, 0, 667, 680, 679,
				1102, 1102, 1102, 42, 555, 556, 567, 0, 667, 668, 680, 1103, 1103, 1103, 42, 556, 568, 567, 0, 668,
				681, 680, 1104, 1104, 1104, 42, 556, 557, 568, 0, 668, 669, 681, 1105, 1105, 1105, 42, 557, 558, 568,
				0, 669, 682, 681, 1106, 1106, 1106, 42, 557, 547, 558, 0, 669, 670, 682, 1107, 1107, 1107, 42, 558,
				570, 569, 0, 671, 684, 683, 1108, 1108, 1108, 42, 558, 559, 570, 0, 671, 672, 684, 1109, 1109, 1109,
				42, 559, 571, 570, 0, 672, 685, 684, 1110, 1110, 1110, 42, 559, 560, 571, 0, 672, 673, 685, 1111, 1111,
				1111, 42, 560, 572, 571, 0, 673, 686, 685, 1112, 1112, 1112, 42, 560, 561, 572, 0, 673, 674, 686, 1113,
				1113, 1113, 42, 561, 573, 572, 0, 674, 687, 686, 1114, 1114, 1114, 42, 561, 562, 573, 0, 674, 675, 687,
				1115, 1115, 1115, 42, 562, 574, 573, 0, 675, 688, 687, 1116, 1116, 1116, 42, 562, 563, 574, 0, 675,
				676, 688, 1117, 1117, 1117, 42, 563, 575, 574, 0, 676, 689, 688, 1118, 1118, 1118, 42, 563, 564, 575,
				0, 676, 677, 689, 1119, 1119, 1119, 42, 564, 576, 575, 0, 677, 690, 689, 1120, 1120, 1120, 42, 564,
				565, 576, 0, 677, 678, 690, 1121, 1121, 1121, 42, 565, 577, 576, 0, 678, 691, 690, 1122, 1122, 1122,
				42, 565, 566, 577, 0, 678, 679, 691, 1123, 1123, 1123, 42, 566, 578, 577, 0, 679, 692, 691, 1124, 1124,
				1124, 42, 566, 567, 578, 0, 679, 680, 692, 1125, 1125, 1125, 42, 567, 579, 578, 0, 680, 693, 692, 1126,
				1126, 1126, 42, 567, 568, 579, 0, 680, 681, 693, 1127, 1127, 1127, 42, 568, 569, 579, 0, 681, 694, 693,
				1128, 1128, 1128, 42, 568, 558, 569, 0, 681, 682, 694, 1129, 1129, 1129, 42, 569, 317, 316, 0, 683,
				696, 695, 1130, 1130, 1130, 42, 569, 570, 317, 0, 683, 684, 696, 1131, 1131, 1131, 42, 570, 318, 317,
				0, 684, 697, 696, 1132, 1132, 1132, 42, 570, 571, 318, 0, 684, 685, 697, 1133, 1133, 1133, 42, 571,
				319, 318, 0, 685, 698, 697, 1134, 1134, 1134, 42, 571, 572, 319, 0, 685, 686, 698, 1135, 1135, 1135,
				42, 572, 320, 319, 0, 686, 699, 698, 1136, 1136, 1136, 42, 572, 573, 320, 0, 686, 687, 699, 1137, 1137,
				1137, 42, 573, 321, 320, 0, 687, 700, 699, 1138, 1138, 1138, 42, 573, 574, 321, 0, 687, 688, 700, 1139,
				1139, 1139, 42, 574, 322, 321, 0, 688, 701, 700, 1140, 1140, 1140, 42, 574, 575, 322, 0, 688, 689, 701,
				1141, 1141, 1141, 42, 575, 323, 322, 0, 689, 702, 701, 1142, 1142, 1142, 42, 575, 576, 323, 0, 689,
				690, 702, 1143, 1143, 1143, 42, 576, 324, 323, 0, 690, 703, 702, 1144, 1144, 1144, 42, 576, 577, 324,
				0, 690, 691, 703, 1145, 1145, 1145, 42, 577, 325, 324, 0, 691, 704, 703, 1146, 1146, 1146, 42, 577,
				578, 325, 0, 691, 692, 704, 1147, 1147, 1147, 42, 578, 326, 325, 0, 692, 705, 704, 1148, 1148, 1148,
				42, 578, 579, 326, 0, 692, 693, 705, 1149, 1149, 1149, 42, 579, 316, 326, 0, 693, 706, 705, 1150, 1150,
				1150, 42, 579, 569, 316, 0, 693, 694, 706, 1151, 1151, 1151, 42, 580, 592, 591, 0, 707, 720, 719, 1152,
				1152, 1152, 42, 580, 581, 592, 0, 707, 708, 720, 1153, 1153, 1153, 42, 581, 593, 592, 0, 708, 721, 720,
				1154, 1154, 1154, 42, 581, 582, 593, 0, 708, 709, 721, 1155, 1155, 1155, 42, 582, 594, 593, 0, 709,
				722, 721, 1156, 1156, 1156, 42, 582, 583, 594, 0, 709, 710, 722, 1157, 1157, 1157, 42, 583, 595, 594,
				0, 710, 723, 722, 1158, 1158, 1158, 42, 583, 584, 595, 0, 710, 711, 723, 1159, 1159, 1159, 42, 584,
				596, 595, 0, 711, 724, 723, 1160, 1160, 1160, 42, 584, 585, 596, 0, 711, 712, 724, 1161, 1161, 1161,
				42, 585, 597, 596, 0, 712, 725, 724, 1162, 1162, 1162, 42, 585, 586, 597, 0, 712, 713, 725, 1163, 1163,
				1163, 42, 586, 598, 597, 0, 713, 726, 725, 1164, 1164, 1164, 42, 586, 587, 598, 0, 713, 714, 726, 1165,
				1165, 1165, 42, 587, 599, 598, 0, 714, 727, 726, 1166, 1166, 1166, 42, 587, 588, 599, 0, 714, 715, 727,
				1167, 1167, 1167, 42, 588, 600, 599, 0, 715, 728, 727, 1168, 1168, 1168, 42, 588, 589, 600, 0, 715,
				716, 728, 1169, 1169, 1169, 42, 589, 601, 600, 0, 716, 729, 728, 1170, 1170, 1170, 42, 589, 590, 601,
				0, 716, 717, 729, 1171, 1171, 1171, 42, 590, 591, 601, 0, 717, 730, 729, 1172, 1172, 1172, 42, 590,
				580, 591, 0, 717, 718, 730, 1173, 1173, 1173, 42, 591, 603, 602, 0, 719, 732, 731, 1174, 1174, 1174,
				42, 591, 592, 603, 0, 719, 720, 732, 1175, 1175, 1175, 42, 592, 604, 603, 0, 720, 733, 732, 1176, 1176,
				1176, 42, 592, 593, 604, 0, 720, 721, 733, 1177, 1177, 1177, 42, 593, 605, 604, 0, 721, 734, 733, 1178,
				1178, 1178, 42, 593, 594, 605, 0, 721, 722, 734, 1179, 1179, 1179, 42, 594, 606, 605, 0, 722, 735, 734,
				1180, 1180, 1180, 42, 594, 595, 606, 0, 722, 723, 735, 1181, 1181, 1181, 42, 595, 607, 606, 0, 723,
				736, 735, 1182, 1182, 1182, 42, 595, 596, 607, 0, 723, 724, 736, 1183, 1183, 1183, 42, 596, 608, 607,
				0, 724, 737, 736, 1184, 1184, 1184, 42, 596, 597, 608, 0, 724, 725, 737, 1185, 1185, 1185, 42, 597,
				609, 608, 0, 725, 738, 737, 1186, 1186, 1186, 42, 597, 598, 609, 0, 725, 726, 738, 1187, 1187, 1187,
				42, 598, 610, 609, 0, 726, 739, 738, 1188, 1188, 1188, 42, 598, 599, 610, 0, 726, 727, 739, 1189, 1189,
				1189, 42, 599, 611, 610, 0, 727, 740, 739, 1190, 1190, 1190, 42, 599, 600, 611, 0, 727, 728, 740, 1191,
				1191, 1191, 42, 600, 612, 611, 0, 728, 741, 740, 1192, 1192, 1192, 42, 600, 601, 612, 0, 728, 729, 741,
				1193, 1193, 1193, 42, 601, 602, 612, 0, 729, 742, 741, 1194, 1194, 1194, 42, 601, 591, 602, 0, 729,
				730, 742, 1195, 1195, 1195, 42, 602, 614, 613, 0, 731, 744, 743, 1196, 1196, 1196, 42, 602, 603, 614,
				0, 731, 732, 744, 1197, 1197, 1197, 42, 603, 615, 614, 0, 732, 745, 744, 1198, 1198, 1198, 42, 603,
				604, 615, 0, 732, 733, 745, 1199, 1199, 1199, 42, 604, 616, 615, 0, 733, 746, 745, 1200, 1200, 1200,
				42, 604, 605, 616, 0, 733, 734, 746, 1201, 1201, 1201, 42, 605, 617, 616, 0, 734, 747, 746, 1202, 1202,
				1202, 42, 605, 606, 617, 0, 734, 735, 747, 1203, 1203, 1203, 42, 606, 618, 617, 0, 735, 748, 747, 1204,
				1204, 1204, 42, 606, 607, 618, 0, 735, 736, 748, 1205, 1205, 1205, 42, 607, 619, 618, 0, 736, 749, 748,
				1206, 1206, 1206, 42, 607, 608, 619, 0, 736, 737, 749, 1207, 1207, 1207, 42, 608, 620, 619, 0, 737,
				750, 749, 1208, 1208, 1208, 42, 608, 609, 620, 0, 737, 738, 750, 1209, 1209, 1209, 42, 609, 621, 620,
				0, 738, 751, 750, 1210, 1210, 1210, 42, 609, 610, 621, 0, 738, 739, 751, 1211, 1211, 1211, 42, 610,
				622, 621, 0, 739, 752, 751, 1212, 1212, 1212, 42, 610, 611, 622, 0, 739, 740, 752, 1213, 1213, 1213,
				42, 611, 623, 622, 0, 740, 753, 752, 1214, 1214, 1214, 42, 611, 612, 623, 0, 740, 741, 753, 1215, 1215,
				1215, 42, 612, 613, 623, 0, 741, 754, 753, 1216, 1216, 1216, 42, 612, 602, 613, 0, 741, 742, 754, 1217,
				1217, 1217, 42, 613, 625, 624, 0, 743, 756, 755, 1218, 1218, 1218, 42, 613, 614, 625, 0, 743, 744, 756,
				1219, 1219, 1219, 42, 614, 626, 625, 0, 744, 757, 756, 1220, 1220, 1220, 42, 614, 615, 626, 0, 744,
				745, 757, 1221, 1221, 1221, 42, 615, 627, 626, 0, 745, 758, 757, 1222, 1222, 1222, 42, 615, 616, 627,
				0, 745, 746, 758, 1223, 1223, 1223, 42, 616, 628, 627, 0, 746, 759, 758, 1224, 1224, 1224, 42, 616,
				617, 628, 0, 746, 747, 759, 1225, 1225, 1225, 42, 617, 629, 628, 0, 747, 760, 759, 1226, 1226, 1226,
				42, 617, 618, 629, 0, 747, 748, 760, 1227, 1227, 1227, 42, 618, 630, 629, 0, 748, 761, 760, 1228, 1228,
				1228, 42, 618, 619, 630, 0, 748, 749, 761, 1229, 1229, 1229, 42, 619, 631, 630, 0, 749, 762, 761, 1230,
				1230, 1230, 42, 619, 620, 631, 0, 749, 750, 762, 1231, 1231, 1231, 42, 620, 632, 631, 0, 750, 763, 762,
				1232, 1232, 1232, 42, 620, 621, 632, 0, 750, 751, 763, 1233, 1233, 1233, 42, 621, 633, 632, 0, 751,
				764, 763, 1234, 1234, 1234, 42, 621, 622, 633, 0, 751, 752, 764, 1235, 1235, 1235, 42, 622, 634, 633,
				0, 752, 765, 764, 1236, 1236, 1236, 42, 622, 623, 634, 0, 752, 753, 765, 1237, 1237, 1237, 42, 623,
				624, 634, 0, 753, 766, 765, 1238, 1238, 1238, 42, 623, 613, 624, 0, 753, 754, 766, 1239, 1239, 1239,
				42, 624, 636, 635, 0, 755, 768, 767, 1240, 1240, 1240, 42, 624, 625, 636, 0, 755, 756, 768, 1241, 1241,
				1241, 42, 625, 637, 636, 0, 756, 769, 768, 1242, 1242, 1242, 42, 625, 626, 637, 0, 756, 757, 769, 1243,
				1243, 1243, 42, 626, 638, 637, 0, 757, 770, 769, 1244, 1244, 1244, 42, 626, 627, 638, 0, 757, 758, 770,
				1245, 1245, 1245, 42, 627, 639, 638, 0, 758, 771, 770, 1246, 1246, 1246, 42, 627, 628, 639, 0, 758,
				759, 771, 1247, 1247, 1247, 42, 628, 640, 639, 0, 759, 772, 771, 1248, 1248, 1248, 42, 628, 629, 640,
				0, 759, 760, 772, 1249, 1249, 1249, 42, 629, 641, 640, 0, 760, 773, 772, 1250, 1250, 1250, 42, 629,
				630, 641, 0, 760, 761, 773, 1251, 1251, 1251, 42, 630, 642, 641, 0, 761, 774, 773, 1252, 1252, 1252,
				42, 630, 631, 642, 0, 761, 762, 774, 1253, 1253, 1253, 42, 631, 643, 642, 0, 762, 775, 774, 1254, 1254,
				1254, 42, 631, 632, 643, 0, 762, 763, 775, 1255, 1255, 1255, 42, 632, 644, 643, 0, 763, 776, 775, 1256,
				1256, 1256, 42, 632, 633, 644, 0, 763, 764, 776, 1257, 1257, 1257, 42, 633, 645, 644, 0, 764, 777, 776,
				1258, 1258, 1258, 42, 633, 634, 645, 0, 764, 765, 777, 1259, 1259, 1259, 42, 634, 635, 645, 0, 765,
				778, 777, 1260, 1260, 1260, 42, 634, 624, 635, 0, 765, 766, 778, 1261, 1261, 1261, 42, 635, 647, 646,
				0, 767, 780, 779, 1262, 1262, 1262, 42, 635, 636, 647, 0, 767, 768, 780, 1263, 1263, 1263, 42, 636,
				648, 647, 0, 768, 781, 780, 1264, 1264, 1264, 42, 636, 637, 648, 0, 768, 769, 781, 1265, 1265, 1265,
				42, 637, 649, 648, 0, 769, 782, 781, 1266, 1266, 1266, 42, 637, 638, 649, 0, 769, 770, 782, 1267, 1267,
				1267, 42, 638, 650, 649, 0, 770, 783, 782, 1268, 1268, 1268, 42, 638, 639, 650, 0, 770, 771, 783, 1269,
				1269, 1269, 42, 639, 651, 650, 0, 771, 784, 783, 1270, 1270, 1270, 42, 639, 640, 651, 0, 771, 772, 784,
				1271, 1271, 1271, 42, 640, 652, 651, 0, 772, 785, 784, 1272, 1272, 1272, 42, 640, 641, 652, 0, 772,
				773, 785, 1273, 1273, 1273, 42, 641, 653, 652, 0, 773, 786, 785, 1274, 1274, 1274, 42, 641, 642, 653,
				0, 773, 774, 786, 1275, 1275, 1275, 42, 642, 654, 653, 0, 774, 787, 786, 1276, 1276, 1276, 42, 642,
				643, 654, 0, 774, 775, 787, 1277, 1277, 1277, 42, 643, 655, 654, 0, 775, 788, 787, 1278, 1278, 1278,
				42, 643, 644, 655, 0, 775, 776, 788, 1279, 1279, 1279, 42, 644, 656, 655, 0, 776, 789, 788, 1280, 1280,
				1280, 42, 644, 645, 656, 0, 776, 777, 789, 1281, 1281, 1281, 42, 645, 646, 656, 0, 777, 790, 789, 1282,
				1282, 1282, 42, 645, 635, 646, 0, 777, 778, 790, 1283, 1283, 1283, 42, 646, 658, 657, 0, 779, 792, 791,
				1284, 1284, 1284, 42, 646, 647, 658, 0, 779, 780, 792, 1285, 1285, 1285, 42, 647, 659, 658, 0, 780,
				793, 792, 1286, 1286, 1286, 42, 647, 648, 659, 0, 780, 781, 793, 1287, 1287, 1287, 42, 648, 660, 659,
				0, 781, 794, 793, 1288, 1288, 1288, 42, 648, 649, 660, 0, 781, 782, 794, 1289, 1289, 1289, 42, 649,
				661, 660, 0, 782, 795, 794, 1290, 1290, 1290, 42, 649, 650, 661, 0, 782, 783, 795, 1291, 1291, 1291,
				42, 650, 662, 661, 0, 783, 796, 795, 1292, 1292, 1292, 42, 650, 651, 662, 0, 783, 784, 796, 1293, 1293,
				1293, 42, 651, 663, 662, 0, 784, 797, 796, 1294, 1294, 1294, 42, 651, 652, 663, 0, 784, 785, 797, 1295,
				1295, 1295, 42, 652, 664, 663, 0, 785, 798, 797, 1296, 1296, 1296, 42, 652, 653, 664, 0, 785, 786, 798,
				1297, 1297, 1297, 42, 653, 665, 664, 0, 786, 799, 798, 1298, 1298, 1298, 42, 653, 654, 665, 0, 786,
				787, 799, 1299, 1299, 1299, 42, 654, 666, 665, 0, 787, 800, 799, 1300, 1300, 1300, 42, 654, 655, 666,
				0, 787, 788, 800, 1301, 1301, 1301, 42, 655, 667, 666, 0, 788, 801, 800, 1302, 1302, 1302, 42, 655,
				656, 667, 0, 788, 789, 801, 1303, 1303, 1303, 42, 656, 657, 667, 0, 789, 802, 801, 1304, 1304, 1304,
				42, 656, 646, 657, 0, 789, 790, 802, 1305, 1305, 1305, 42, 657, 669, 668, 0, 791, 804, 803, 1306, 1306,
				1306, 42, 657, 658, 669, 0, 791, 792, 804, 1307, 1307, 1307, 42, 658, 670, 669, 0, 792, 805, 804, 1308,
				1308, 1308, 42, 658, 659, 670, 0, 792, 793, 805, 1309, 1309, 1309, 42, 659, 671, 670, 0, 793, 806, 805,
				1310, 1310, 1310, 42, 659, 660, 671, 0, 793, 794, 806, 1311, 1311, 1311, 42, 660, 672, 671, 0, 794,
				807, 806, 1312, 1312, 1312, 42, 660, 661, 672, 0, 794, 795, 807, 1313, 1313, 1313, 42, 661, 673, 672,
				0, 795, 808, 807, 1314, 1314, 1314, 42, 661, 662, 673, 0, 795, 796, 808, 1315, 1315, 1315, 42, 662,
				674, 673, 0, 796, 809, 808, 1316, 1316, 1316, 42, 662, 663, 674, 0, 796, 797, 809, 1317, 1317, 1317,
				42, 663, 675, 674, 0, 797, 810, 809, 1318, 1318, 1318, 42, 663, 664, 675, 0, 797, 798, 810, 1319, 1319,
				1319, 42, 664, 676, 675, 0, 798, 811, 810, 1320, 1320, 1320, 42, 664, 665, 676, 0, 798, 799, 811, 1321,
				1321, 1321, 42, 665, 677, 676, 0, 799, 812, 811, 1322, 1322, 1322, 42, 665, 666, 677, 0, 799, 800, 812,
				1323, 1323, 1323, 42, 666, 678, 677, 0, 800, 813, 812, 1324, 1324, 1324, 42, 666, 667, 678, 0, 800,
				801, 813, 1325, 1325, 1325, 42, 667, 668, 678, 0, 801, 814, 813, 1326, 1326, 1326, 42, 667, 657, 668,
				0, 801, 802, 814, 1327, 1327, 1327, 42, 668, 680, 679, 0, 803, 816, 815, 1328, 1328, 1328, 42, 668,
				669, 680, 0, 803, 804, 816, 1329, 1329, 1329, 42, 669, 681, 680, 0, 804, 817, 816, 1330, 1330, 1330,
				42, 669, 670, 681, 0, 804, 805, 817, 1331, 1331, 1331, 42, 670, 682, 681, 0, 805, 818, 817, 1332, 1332,
				1332, 42, 670, 671, 682, 0, 805, 806, 818, 1333, 1333, 1333, 42, 671, 683, 682, 0, 806, 819, 818, 1334,
				1334, 1334, 42, 671, 672, 683, 0, 806, 807, 819, 1335, 1335, 1335, 42, 672, 684, 683, 0, 807, 820, 819,
				1336, 1336, 1336, 42, 672, 673, 684, 0, 807, 808, 820, 1337, 1337, 1337, 42, 673, 685, 684, 0, 808,
				821, 820, 1338, 1338, 1338, 42, 673, 674, 685, 0, 808, 809, 821, 1339, 1339, 1339, 42, 674, 686, 685,
				0, 809, 822, 821, 1340, 1340, 1340, 42, 674, 675, 686, 0, 809, 810, 822, 1341, 1341, 1341, 42, 675,
				687, 686, 0, 810, 823, 822, 1342, 1342, 1342, 42, 675, 676, 687, 0, 810, 811, 823, 1343, 1343, 1343,
				42, 676, 688, 687, 0, 811, 824, 823, 1344, 1344, 1344, 42, 676, 677, 688, 0, 811, 812, 824, 1345, 1345,
				1345, 42, 677, 689, 688, 0, 812, 825, 824, 1346, 1346, 1346, 42, 677, 678, 689, 0, 812, 813, 825, 1347,
				1347, 1347, 42, 678, 679, 689, 0, 813, 826, 825, 1348, 1348, 1348, 42, 678, 668, 679, 0, 813, 814, 826,
				1349, 1349, 1349, 42, 679, 691, 690, 0, 815, 828, 827, 1350, 1350, 1350, 42, 679, 680, 691, 0, 815,
				816, 828, 1351, 1351, 1351, 42, 680, 692, 691, 0, 816, 829, 828, 1352, 1352, 1352, 42, 680, 681, 692,
				0, 816, 817, 829, 1353, 1353, 1353, 42, 681, 693, 692, 0, 817, 830, 829, 1354, 1354, 1354, 42, 681,
				682, 693, 0, 817, 818, 830, 1355, 1355, 1355, 42, 682, 694, 693, 0, 818, 831, 830, 1356, 1356, 1356,
				42, 682, 683, 694, 0, 818, 819, 831, 1357, 1357, 1357, 42, 683, 695, 694, 0, 819, 832, 831, 1358, 1358,
				1358, 42, 683, 684, 695, 0, 819, 820, 832, 1359, 1359, 1359, 42, 684, 696, 695, 0, 820, 833, 832, 1360,
				1360, 1360, 42, 684, 685, 696, 0, 820, 821, 833, 1361, 1361, 1361, 42, 685, 697, 696, 0, 821, 834, 833,
				1362, 1362, 1362, 42, 685, 686, 697, 0, 821, 822, 834, 1363, 1363, 1363, 42, 686, 698, 697, 0, 822,
				835, 834, 1364, 1364, 1364, 42, 686, 687, 698, 0, 822, 823, 835, 1365, 1365, 1365, 42, 687, 699, 698,
				0, 823, 836, 835, 1366, 1366, 1366, 42, 687, 688, 699, 0, 823, 824, 836, 1367, 1367, 1367, 42, 688,
				700, 699, 0, 824, 837, 836, 1368, 1368, 1368, 42, 688, 689, 700, 0, 824, 825, 837, 1369, 1369, 1369,
				42, 689, 690, 700, 0, 825, 838, 837, 1370, 1370, 1370, 42, 689, 679, 690, 0, 825, 826, 838, 1371, 1371,
				1371, 42, 690, 702, 701, 0, 827, 840, 839, 1372, 1372, 1372, 42, 690, 691, 702, 0, 827, 828, 840, 1373,
				1373, 1373, 42, 691, 703, 702, 0, 828, 841, 840, 1374, 1374, 1374, 42, 691, 692, 703, 0, 828, 829, 841,
				1375, 1375, 1375, 42, 692, 704, 703, 0, 829, 842, 841, 1376, 1376, 1376, 42, 692, 693, 704, 0, 829,
				830, 842, 1377, 1377, 1377, 42, 693, 705, 704, 0, 830, 843, 842, 1378, 1378, 1378, 42, 693, 694, 705,
				0, 830, 831, 843, 1379, 1379, 1379, 42, 694, 706, 705, 0, 831, 844, 843, 1380, 1380, 1380, 42, 694,
				695, 706, 0, 831, 832, 844, 1381, 1381, 1381, 42, 695, 707, 706, 0, 832, 845, 844, 1382, 1382, 1382,
				42, 695, 696, 707, 0, 832, 833, 845, 1383, 1383, 1383, 42, 696, 708, 707, 0, 833, 846, 845, 1384, 1384,
				1384, 42, 696, 697, 708, 0, 833, 834, 846, 1385, 1385, 1385, 42, 697, 709, 708, 0, 834, 847, 846, 1386,
				1386, 1386, 42, 697, 698, 709, 0, 834, 835, 847, 1387, 1387, 1387, 42, 698, 710, 709, 0, 835, 848, 847,
				1388, 1388, 1388, 42, 698, 699, 710, 0, 835, 836, 848, 1389, 1389, 1389, 42, 699, 711, 710, 0, 836,
				849, 848, 1390, 1390, 1390, 42, 699, 700, 711, 0, 836, 837, 849, 1391, 1391, 1391, 42, 700, 701, 711,
				0, 837, 850, 849, 1392, 1392, 1392, 42, 700, 690, 701, 0, 837, 838, 850, 1393, 1393, 1393, 42, 701,
				713, 712, 0, 839, 852, 851, 1394, 1394, 1394, 42, 701, 702, 713, 0, 839, 840, 852, 1395, 1395, 1395,
				42, 702, 714, 713, 0, 840, 853, 852, 1396, 1396, 1396, 42, 702, 703, 714, 0, 840, 841, 853, 1397, 1397,
				1397, 42, 703, 715, 714, 0, 841, 854, 853, 1398, 1398, 1398, 42, 703, 704, 715, 0, 841, 842, 854, 1399,
				1399, 1399, 42, 704, 716, 715, 0, 842, 855, 854, 1400, 1400, 1400, 42, 704, 705, 716, 0, 842, 843, 855,
				1401, 1401, 1401, 42, 705, 717, 716, 0, 843, 856, 855, 1402, 1402, 1402, 42, 705, 706, 717, 0, 843,
				844, 856, 1403, 1403, 1403, 42, 706, 718, 717, 0, 844, 857, 856, 1404, 1404, 1404, 42, 706, 707, 718,
				0, 844, 845, 857, 1405, 1405, 1405, 42, 707, 719, 718, 0, 845, 858, 857, 1406, 1406, 1406, 42, 707,
				708, 719, 0, 845, 846, 858, 1407, 1407, 1407, 42, 708, 720, 719, 0, 846, 859, 858, 1408, 1408, 1408,
				42, 708, 709, 720, 0, 846, 847, 859, 1409, 1409, 1409, 42, 709, 721, 720, 0, 847, 860, 859, 1410, 1410,
				1410, 42, 709, 710, 721, 0, 847, 848, 860, 1411, 1411, 1411, 42, 710, 722, 721, 0, 848, 861, 860, 1412,
				1412, 1412, 42, 710, 711, 722, 0, 848, 849, 861, 1413, 1413, 1413, 42, 711, 712, 722, 0, 849, 862, 861,
				1414, 1414, 1414, 42, 711, 701, 712, 0, 849, 850, 862, 1415, 1415, 1415, 42, 712, 724, 723, 0, 851,
				864, 863, 1416, 1416, 1416, 42, 712, 713, 724, 0, 851, 852, 864, 1417, 1417, 1417, 42, 713, 725, 724,
				0, 852, 865, 864, 1418, 1418, 1418, 42, 713, 714, 725, 0, 852, 853, 865, 1419, 1419, 1419, 42, 714,
				726, 725, 0, 853, 866, 865, 1420, 1420, 1420, 42, 714, 715, 726, 0, 853, 854, 866, 1421, 1421, 1421,
				42, 715, 727, 726, 0, 854, 867, 866, 1422, 1422, 1422, 42, 715, 716, 727, 0, 854, 855, 867, 1423, 1423,
				1423, 42, 716, 728, 727, 0, 855, 868, 867, 1424, 1424, 1424, 42, 716, 717, 728, 0, 855, 856, 868, 1425,
				1425, 1425, 42, 717, 729, 728, 0, 856, 869, 868, 1426, 1426, 1426, 42, 717, 718, 729, 0, 856, 857, 869,
				1427, 1427, 1427, 42, 718, 730, 729, 0, 857, 870, 869, 1428, 1428, 1428, 42, 718, 719, 730, 0, 857,
				858, 870, 1429, 1429, 1429, 42, 719, 731, 730, 0, 858, 871, 870, 1430, 1430, 1430, 42, 719, 720, 731,
				0, 858, 859, 871, 1431, 1431, 1431, 42, 720, 732, 731, 0, 859, 872, 871, 1432, 1432, 1432, 42, 720,
				721, 732, 0, 859, 860, 872, 1433, 1433, 1433, 42, 721, 733, 732, 0, 860, 873, 872, 1434, 1434, 1434,
				42, 721, 722, 733, 0, 860, 861, 873, 1435, 1435, 1435, 42, 722, 723, 733, 0, 861, 874, 873, 1436, 1436,
				1436, 42, 722, 712, 723, 0, 861, 862, 874, 1437, 1437, 1437, 42, 723, 735, 734, 0, 863, 876, 875, 1438,
				1438, 1438, 42, 723, 724, 735, 0, 863, 864, 876, 1439, 1439, 1439, 42, 724, 736, 735, 0, 864, 877, 876,
				1440, 1440, 1440, 42, 724, 725, 736, 0, 864, 865, 877, 1441, 1441, 1441, 42, 725, 737, 736, 0, 865,
				878, 877, 1442, 1442, 1442, 42, 725, 726, 737, 0, 865, 866, 878, 1443, 1443, 1443, 42, 726, 738, 737,
				0, 866, 879, 878, 1444, 1444, 1444, 42, 726, 727, 738, 0, 866, 867, 879, 1445, 1445, 1445, 42, 727,
				739, 738, 0, 867, 880, 879, 1446, 1446, 1446, 42, 727, 728, 739, 0, 867, 868, 880, 1447, 1447, 1447,
				42, 728, 740, 739, 0, 868, 881, 880, 1448, 1448, 1448, 42, 728, 729, 740, 0, 868, 869, 881, 1449, 1449,
				1449, 42, 729, 741, 740, 0, 869, 882, 881, 1450, 1450, 1450, 42, 729, 730, 741, 0, 869, 870, 882, 1451,
				1451, 1451, 42, 730, 742, 741, 0, 870, 883, 882, 1452, 1452, 1452, 42, 730, 731, 742, 0, 870, 871, 883,
				1453, 1453, 1453, 42, 731, 743, 742, 0, 871, 884, 883, 1454, 1454, 1454, 42, 731, 732, 743, 0, 871,
				872, 884, 1455, 1455, 1455, 42, 732, 744, 743, 0, 872, 885, 884, 1456, 1456, 1456, 42, 732, 733, 744,
				0, 872, 873, 885, 1457, 1457, 1457, 42, 733, 734, 744, 0, 873, 886, 885, 1458, 1458, 1458, 42, 733,
				723, 734, 0, 873, 874, 886, 1459, 1459, 1459, 42, 734, 746, 745, 0, 875, 888, 887, 1460, 1460, 1460,
				42, 734, 735, 746, 0, 875, 876, 888, 1461, 1461, 1461, 42, 735, 747, 746, 0, 876, 889, 888, 1462, 1462,
				1462, 42, 735, 736, 747, 0, 876, 877, 889, 1463, 1463, 1463, 42, 736, 748, 747, 0, 877, 890, 889, 1464,
				1464, 1464, 42, 736, 737, 748, 0, 877, 878, 890, 1465, 1465, 1465, 42, 737, 749, 748, 0, 878, 891, 890,
				1466, 1466, 1466, 42, 737, 738, 749, 0, 878, 879, 891, 1467, 1467, 1467, 42, 738, 750, 749, 0, 879,
				892, 891, 1468, 1468, 1468, 42, 738, 739, 750, 0, 879, 880, 892, 1469, 1469, 1469, 42, 739, 751, 750,
				0, 880, 893, 892, 1470, 1470, 1470, 42, 739, 740, 751, 0, 880, 881, 893, 1471, 1471, 1471, 42, 740,
				752, 751, 0, 881, 894, 893, 1472, 1472, 1472, 42, 740, 741, 752, 0, 881, 882, 894, 1473, 1473, 1473,
				42, 741, 753, 752, 0, 882, 895, 894, 1474, 1474, 1474, 42, 741, 742, 753, 0, 882, 883, 895, 1475, 1475,
				1475, 42, 742, 754, 753, 0, 883, 896, 895, 1476, 1476, 1476, 42, 742, 743, 754, 0, 883, 884, 896, 1477,
				1477, 1477, 42, 743, 755, 754, 0, 884, 897, 896, 1478, 1478, 1478, 42, 743, 744, 755, 0, 884, 885, 897,
				1479, 1479, 1479, 42, 744, 745, 755, 0, 885, 898, 897, 1480, 1480, 1480, 42, 744, 734, 745, 0, 885,
				886, 898, 1481, 1481, 1481, 42, 745, 757, 756, 0, 887, 900, 899, 1482, 1482, 1482, 42, 745, 746, 757,
				0, 887, 888, 900, 1483, 1483, 1483, 42, 746, 758, 757, 0, 888, 901, 900, 1484, 1484, 1484, 42, 746,
				747, 758, 0, 888, 889, 901, 1485, 1485, 1485, 42, 747, 759, 758, 0, 889, 902, 901, 1486, 1486, 1486,
				42, 747, 748, 759, 0, 889, 890, 902, 1487, 1487, 1487, 42, 748, 760, 759, 0, 890, 903, 902, 1488, 1488,
				1488, 42, 748, 749, 760, 0, 890, 891, 903, 1489, 1489, 1489, 42, 749, 761, 760, 0, 891, 904, 903, 1490,
				1490, 1490, 42, 749, 750, 761, 0, 891, 892, 904, 1491, 1491, 1491, 42, 750, 762, 761, 0, 892, 905, 904,
				1492, 1492, 1492, 42, 750, 751, 762, 0, 892, 893, 905, 1493, 1493, 1493, 42, 751, 763, 762, 0, 893,
				906, 905, 1494, 1494, 1494, 42, 751, 752, 763, 0, 893, 894, 906, 1495, 1495, 1495, 42, 752, 764, 763,
				0, 894, 907, 906, 1496, 1496, 1496, 42, 752, 753, 764, 0, 894, 895, 907, 1497, 1497, 1497, 42, 753,
				765, 764, 0, 895, 908, 907, 1498, 1498, 1498, 42, 753, 754, 765, 0, 895, 896, 908, 1499, 1499, 1499,
				42, 754, 766, 765, 0, 896, 909, 908, 1500, 1500, 1500, 42, 754, 755, 766, 0, 896, 897, 909, 1501, 1501,
				1501, 42, 755, 756, 766, 0, 897, 910, 909, 1502, 1502, 1502, 42, 755, 745, 756, 0, 897, 898, 910, 1503,
				1503, 1503, 42, 756, 768, 767, 0, 899, 912, 911, 1504, 1504, 1504, 42, 756, 757, 768, 0, 899, 900, 912,
				1505, 1505, 1505, 42, 757, 769, 768, 0, 900, 913, 912, 1506, 1506, 1506, 42, 757, 758, 769, 0, 900,
				901, 913, 1507, 1507, 1507, 42, 758, 770, 769, 0, 901, 914, 913, 1508, 1508, 1508, 42, 758, 759, 770,
				0, 901, 902, 914, 1509, 1509, 1509, 42, 759, 771, 770, 0, 902, 915, 914, 1510, 1510, 1510, 42, 759,
				760, 771, 0, 902, 903, 915, 1511, 1511, 1511, 42, 760, 772, 771, 0, 903, 916, 915, 1512, 1512, 1512,
				42, 760, 761, 772, 0, 903, 904, 916, 1513, 1513, 1513, 42, 761, 773, 772, 0, 904, 917, 916, 1514, 1514,
				1514, 42, 761, 762, 773, 0, 904, 905, 917, 1515, 1515, 1515, 42, 762, 774, 773, 0, 905, 918, 917, 1516,
				1516, 1516, 42, 762, 763, 774, 0, 905, 906, 918, 1517, 1517, 1517, 42, 763, 775, 774, 0, 906, 919, 918,
				1518, 1518, 1518, 42, 763, 764, 775, 0, 906, 907, 919, 1519, 1519, 1519, 42, 764, 776, 775, 0, 907,
				920, 919, 1520, 1520, 1520, 42, 764, 765, 776, 0, 907, 908, 920, 1521, 1521, 1521, 42, 765, 777, 776,
				0, 908, 921, 920, 1522, 1522, 1522, 42, 765, 766, 777, 0, 908, 909, 921, 1523, 1523, 1523, 42, 766,
				767, 777, 0, 909, 922, 921, 1524, 1524, 1524, 42, 766, 756, 767, 0, 909, 910, 922, 1525, 1525, 1525,
				42, 767, 779, 778, 0, 911, 924, 923, 1526, 1526, 1526, 42, 767, 768, 779, 0, 911, 912, 924, 1527, 1527,
				1527, 42, 768, 780, 779, 0, 912, 925, 924, 1528, 1528, 1528, 42, 768, 769, 780, 0, 912, 913, 925, 1529,
				1529, 1529, 42, 769, 781, 780, 0, 913, 926, 925, 1530, 1530, 1530, 42, 769, 770, 781, 0, 913, 914, 926,
				1531, 1531, 1531, 42, 770, 782, 781, 0, 914, 927, 926, 1532, 1532, 1532, 42, 770, 771, 782, 0, 914,
				915, 927, 1533, 1533, 1533, 42, 771, 783, 782, 0, 915, 928, 927, 1534, 1534, 1534, 42, 771, 772, 783,
				0, 915, 916, 928, 1535, 1535, 1535, 42, 772, 784, 783, 0, 916, 929, 928, 1536, 1536, 1536, 42, 772,
				773, 784, 0, 916, 917, 929, 1537, 1537, 1537, 42, 773, 785, 784, 0, 917, 930, 929, 1538, 1538, 1538,
				42, 773, 774, 785, 0, 917, 918, 930, 1539, 1539, 1539, 42, 774, 786, 785, 0, 918, 931, 930, 1540, 1540,
				1540, 42, 774, 775, 786, 0, 918, 919, 931, 1541, 1541, 1541, 42, 775, 787, 786, 0, 919, 932, 931, 1542,
				1542, 1542, 42, 775, 776, 787, 0, 919, 920, 932, 1543, 1543, 1543, 42, 776, 788, 787, 0, 920, 933, 932,
				1544, 1544, 1544, 42, 776, 777, 788, 0, 920, 921, 933, 1545, 1545, 1545, 42, 777, 778, 788, 0, 921,
				934, 933, 1546, 1546, 1546, 42, 777, 767, 778, 0, 921, 922, 934, 1547, 1547, 1547, 42, 778, 790, 789,
				0, 923, 936, 935, 1548, 1548, 1548, 42, 778, 779, 790, 0, 923, 924, 936, 1549, 1549, 1549, 42, 779,
				791, 790, 0, 924, 937, 936, 1550, 1550, 1550, 42, 779, 780, 791, 0, 924, 925, 937, 1551, 1551, 1551,
				42, 780, 792, 791, 0, 925, 938, 937, 1552, 1552, 1552, 42, 780, 781, 792, 0, 925, 926, 938, 1553, 1553,
				1553, 42, 781, 793, 792, 0, 926, 939, 938, 1554, 1554, 1554, 42, 781, 782, 793, 0, 926, 927, 939, 1555,
				1555, 1555, 42, 782, 794, 793, 0, 927, 940, 939, 1556, 1556, 1556, 42, 782, 783, 794, 0, 927, 928, 940,
				1557, 1557, 1557, 42, 783, 795, 794, 0, 928, 941, 940, 1558, 1558, 1558, 42, 783, 784, 795, 0, 928,
				929, 941, 1559, 1559, 1559, 42, 784, 796, 795, 0, 929, 942, 941, 1560, 1560, 1560, 42, 784, 785, 796,
				0, 929, 930, 942, 1561, 1561, 1561, 42, 785, 797, 796, 0, 930, 943, 942, 1562, 1562, 1562, 42, 785,
				786, 797, 0, 930, 931, 943, 1563, 1563, 1563, 42, 786, 798, 797, 0, 931, 944, 943, 1564, 1564, 1564,
				42, 786, 787, 798, 0, 931, 932, 944, 1565, 1565, 1565, 42, 787, 799, 798, 0, 932, 945, 944, 1566, 1566,
				1566, 42, 787, 788, 799, 0, 932, 933, 945, 1567, 1567, 1567, 42, 788, 789, 799, 0, 933, 946, 945, 1568,
				1568, 1568, 42, 788, 778, 789, 0, 933, 934, 946, 1569, 1569, 1569, 42, 789, 801, 800, 0, 935, 948, 947,
				1570, 1570, 1570, 42, 789, 790, 801, 0, 935, 936, 948, 1571, 1571, 1571, 42, 790, 802, 801, 0, 936,
				949, 948, 1572, 1572, 1572, 42, 790, 791, 802, 0, 936, 937, 949, 1573, 1573, 1573, 42, 791, 803, 802,
				0, 937, 950, 949, 1574, 1574, 1574, 42, 791, 792, 803, 0, 937, 938, 950, 1575, 1575, 1575, 42, 792,
				804, 803, 0, 938, 951, 950, 1576, 1576, 1576, 42, 792, 793, 804, 0, 938, 939, 951, 1577, 1577, 1577,
				42, 793, 805, 804, 0, 939, 952, 951, 1578, 1578, 1578, 42, 793, 794, 805, 0, 939, 940, 952, 1579, 1579,
				1579, 42, 794, 806, 805, 0, 940, 953, 952, 1580, 1580, 1580, 42, 794, 795, 806, 0, 940, 941, 953, 1581,
				1581, 1581, 42, 795, 807, 806, 0, 941, 954, 953, 1582, 1582, 1582, 42, 795, 796, 807, 0, 941, 942, 954,
				1583, 1583, 1583, 42, 796, 808, 807, 0, 942, 955, 954, 1584, 1584, 1584, 42, 796, 797, 808, 0, 942,
				943, 955, 1585, 1585, 1585, 42, 797, 809, 808, 0, 943, 956, 955, 1586, 1586, 1586, 42, 797, 798, 809,
				0, 943, 944, 956, 1587, 1587, 1587, 42, 798, 810, 809, 0, 944, 957, 956, 1588, 1588, 1588, 42, 798,
				799, 810, 0, 944, 945, 957, 1589, 1589, 1589, 42, 799, 800, 810, 0, 945, 958, 957, 1590, 1590, 1590,
				42, 799, 789, 800, 0, 945, 946, 958, 1591, 1591, 1591, 42, 800, 812, 811, 0, 947, 960, 959, 1592, 1592,
				1592, 42, 800, 801, 812, 0, 947, 948, 960, 1593, 1593, 1593, 42, 801, 813, 812, 0, 948, 961, 960, 1594,
				1594, 1594, 42, 801, 802, 813, 0, 948, 949, 961, 1595, 1595, 1595, 42, 802, 814, 813, 0, 949, 962, 961,
				1596, 1596, 1596, 42, 802, 803, 814, 0, 949, 950, 962, 1597, 1597, 1597, 42, 803, 815, 814, 0, 950,
				963, 962, 1598, 1598, 1598, 42, 803, 804, 815, 0, 950, 951, 963, 1599, 1599, 1599, 42, 804, 816, 815,
				0, 951, 964, 963, 1600, 1600, 1600, 42, 804, 805, 816, 0, 951, 952, 964, 1601, 1601, 1601, 42, 805,
				817, 816, 0, 952, 965, 964, 1602, 1602, 1602, 42, 805, 806, 817, 0, 952, 953, 965, 1603, 1603, 1603,
				42, 806, 818, 817, 0, 953, 966, 965, 1604, 1604, 1604, 42, 806, 807, 818, 0, 953, 954, 966, 1605, 1605,
				1605, 42, 807, 819, 818, 0, 954, 967, 966, 1606, 1606, 1606, 42, 807, 808, 819, 0, 954, 955, 967, 1607,
				1607, 1607, 42, 808, 820, 819, 0, 955, 968, 967, 1608, 1608, 1608, 42, 808, 809, 820, 0, 955, 956, 968,
				1609, 1609, 1609, 42, 809, 821, 820, 0, 956, 969, 968, 1610, 1610, 1610, 42, 809, 810, 821, 0, 956,
				957, 969, 1611, 1611, 1611, 42, 810, 811, 821, 0, 957, 970, 969, 1612, 1612, 1612, 42, 810, 800, 811,
				0, 957, 958, 970, 1613, 1613, 1613, 42, 811, 823, 822, 0, 959, 972, 971, 1614, 1614, 1614, 42, 811,
				812, 823, 0, 959, 960, 972, 1615, 1615, 1615, 42, 812, 824, 823, 0, 960, 973, 972, 1616, 1616, 1616,
				42, 812, 813, 824, 0, 960, 961, 973, 1617, 1617, 1617, 42, 813, 825, 824, 0, 961, 974, 973, 1618, 1618,
				1618, 42, 813, 814, 825, 0, 961, 962, 974, 1619, 1619, 1619, 42, 814, 826, 825, 0, 962, 975, 974, 1620,
				1620, 1620, 42, 814, 815, 826, 0, 962, 963, 975, 1621, 1621, 1621, 42, 815, 827, 826, 0, 963, 976, 975,
				1622, 1622, 1622, 42, 815, 816, 827, 0, 963, 964, 976, 1623, 1623, 1623, 42, 816, 828, 827, 0, 964,
				977, 976, 1624, 1624, 1624, 42, 816, 817, 828, 0, 964, 965, 977, 1625, 1625, 1625, 42, 817, 829, 828,
				0, 965, 978, 977, 1626, 1626, 1626, 42, 817, 818, 829, 0, 965, 966, 978, 1627, 1627, 1627, 42, 818,
				830, 829, 0, 966, 979, 978, 1628, 1628, 1628, 42, 818, 819, 830, 0, 966, 967, 979, 1629, 1629, 1629,
				42, 819, 831, 830, 0, 967, 980, 979, 1630, 1630, 1630, 42, 819, 820, 831, 0, 967, 968, 980, 1631, 1631,
				1631, 42, 820, 832, 831, 0, 968, 981, 980, 1632, 1632, 1632, 42, 820, 821, 832, 0, 968, 969, 981, 1633,
				1633, 1633, 42, 821, 822, 832, 0, 969, 982, 981, 1634, 1634, 1634, 42, 821, 811, 822, 0, 969, 970, 982,
				1635, 1635, 1635, 42, 822, 834, 833, 0, 971, 984, 983, 1636, 1636, 1636, 42, 822, 823, 834, 0, 971,
				972, 984, 1637, 1637, 1637, 42, 823, 835, 834, 0, 972, 985, 984, 1638, 1638, 1638, 42, 823, 824, 835,
				0, 972, 973, 985, 1639, 1639, 1639, 42, 824, 836, 835, 0, 973, 986, 985, 1640, 1640, 1640, 42, 824,
				825, 836, 0, 973, 974, 986, 1641, 1641, 1641, 42, 825, 837, 836, 0, 974, 987, 986, 1642, 1642, 1642,
				42, 825, 826, 837, 0, 974, 975, 987, 1643, 1643, 1643, 42, 826, 838, 837, 0, 975, 988, 987, 1644, 1644,
				1644, 42, 826, 827, 838, 0, 975, 976, 988, 1645, 1645, 1645, 42, 827, 839, 838, 0, 976, 989, 988, 1646,
				1646, 1646, 42, 827, 828, 839, 0, 976, 977, 989, 1647, 1647, 1647, 42, 828, 840, 839, 0, 977, 990, 989,
				1648, 1648, 1648, 42, 828, 829, 840, 0, 977, 978, 990, 1649, 1649, 1649, 42, 829, 841, 840, 0, 978,
				991, 990, 1650, 1650, 1650, 42, 829, 830, 841, 0, 978, 979, 991, 1651, 1651, 1651, 42, 830, 842, 841,
				0, 979, 992, 991, 1652, 1652, 1652, 42, 830, 831, 842, 0, 979, 980, 992, 1653, 1653, 1653, 42, 831,
				843, 842, 0, 980, 993, 992, 1654, 1654, 1654, 42, 831, 832, 843, 0, 980, 981, 993, 1655, 1655, 1655,
				42, 832, 833, 843, 0, 981, 994, 993, 1656, 1656, 1656, 42, 832, 822, 833, 0, 981, 982, 994, 1657, 1657,
				1657, 42, 833, 581, 580, 0, 983, 996, 995, 1658, 1658, 1658, 42, 833, 834, 581, 0, 983, 984, 996, 1659,
				1659, 1659, 42, 834, 582, 581, 0, 984, 997, 996, 1660, 1660, 1660, 42, 834, 835, 582, 0, 984, 985, 997,
				1661, 1661, 1661, 42, 835, 583, 582, 0, 985, 998, 997, 1662, 1662, 1662, 42, 835, 836, 583, 0, 985,
				986, 998, 1663, 1663, 1663, 42, 836, 584, 583, 0, 986, 999, 998, 1664, 1664, 1664, 42, 836, 837, 584,
				0, 986, 987, 999, 1665, 1665, 1665, 42, 837, 585, 584, 0, 987, 1000, 999, 1666, 1666, 1666, 42, 837,
				838, 585, 0, 987, 988, 1000, 1667, 1667, 1667, 42, 838, 586, 585, 0, 988, 1001, 1000, 1668, 1668, 1668,
				42, 838, 839, 586, 0, 988, 989, 1001, 1669, 1669, 1669, 42, 839, 587, 586, 0, 989, 1002, 1001, 1670,
				1670, 1670, 42, 839, 840, 587, 0, 989, 990, 1002, 1671, 1671, 1671, 42, 840, 588, 587, 0, 990, 1003,
				1002, 1672, 1672, 1672, 42, 840, 841, 588, 0, 990, 991, 1003, 1673, 1673, 1673, 42, 841, 589, 588, 0,
				991, 1004, 1003, 1674, 1674, 1674, 42, 841, 842, 589, 0, 991, 992, 1004, 1675, 1675, 1675, 42, 842,
				590, 589, 0, 992, 1005, 1004, 1676, 1676, 1676, 42, 842, 843, 590, 0, 992, 993, 1005, 1677, 1677, 1677,
				42, 843, 580, 590, 0, 993, 1006, 1005, 1678, 1678, 1678, 42, 843, 833, 580, 0, 993, 994, 1006, 1679,
				1679, 1679 ]

	});

	Platformer.Teleporter = {};
	Platformer.Teleporter.geomery = teleporterParsed.geometry;
	Platformer.Teleporter.material = new THREE.MeshPhongMaterial({
		color : 0xff38d1,
		specular : 0xD6D6D6,
		shininess : 10
	});

};
