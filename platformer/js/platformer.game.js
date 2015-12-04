var StartPositionX = 0;
var StartPositionY = 5;
var StartPositionZ = 0;

Platformer.LoadLevel = function(levelName) {
	$.getJSON("levels/" + levelName, function(data) {

		var floorMaterial = Physijs.createMaterial(new THREE.MeshPhongMaterial({
					color: 0xffffff,
					//map: Platformer.Texture,
					blending: THREE.AdditiveBlending,
					shininess: 0,
					// loader.load('images/bg.png')
				}), 5, // high friction
				.1 // low restitution
		);

		var scale = v3(2, 2, 2);

		for (var i = 0; i < data.objects.length; i++) {

			var obj = data.objects[i];

			var tileX = obj.TileX;
			var tileY = obj.TileY;
			var type = obj.TileType;

			if (type == "floor" || type == "start") {
				var tileHeight = obj.TileHeight;
				var dimension = scale;
				var position = v3(dimension.x * tileX, dimension.y * tileHeight, dimension.z * tileY);

				if (type == "start") {
					StartPositionX = tileX * dimension.x;
					StartPositionY = tileHeight * dimension.y + 1;
					StartPositionZ = tileY * dimension.z;
				}

				Platformer.AddFloor(position, dimension, floorMaterial);

				// console.log("Added floor at " + tileX + " / " + tileY);

			} else if (type == "wall") {
				var dimension = v3(scale.x, scale.y * 5, scale.z);
				var position = v3(dimension.x * tileX, 1, dimension.z * tileY);
				Platformer.AddFloor(position, dimension);
			} else if (type == "end") {
				Platformer.AddTeleporter(v3(scale.x * tileX, scale.y * 0.5, scale.z * tileY));
			} else if (type == "tracer") {
				Platformer.AddTracer(v3(0, 2, -20));
			} else if (type == "scanner") {
			} else {
				console.log("type: " + type);
			}

		}
		Platformer.AddTracer(v3(0, 2, -20));

		//Hardcode scanners =D?
		Platformer.AddScanner([ v3(5, 5, 0), v3(10, 5, 0), v3(-5, 5, -20) ]);
		Platformer.AddTeleporter(v3(10, 1, 0));
		Platformer.AddJumppad(v3(-10, 1, -5));
		Platformer.AddPodium(v3(15, 1, 0));
		Platformer.AddFloppyDisk(v3(10, 1, -5));

		//Gaben, syslog
		Platformer.AddSysLog();

	});
};

//TODO(Meanzie): Some objects are not being removed properly.

var raycaster = new THREE.Raycaster();
OnInit = function() {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));
	// Add main menu object
	SceneManager.Add(new Platformer.MainMenu(false));

	var player = Platformer.AddPlayer(v3(0, 5, 0), v3(1, 1, 1), Platformer.DefaultMaterial, 20);
	Platformer.audioListener = new THREE.AudioListener();
	Platformer.Player = player;
	player.add(Platformer.audioListener);

	player.OnStart = function () {
		player.name = "player";
		player.setCcdMotionThreshold(1);
		player.setCcdSweptSphereRadius(0.2);
		player.CanJump = false;
		player.setAngularFactor(v3z());
		player.LastTimeUpdate = Date.now();
		player.TimeRemaining = 0;
		console.log("Set angular factor");
	};
	player.OnEnd = function() {
		console.log("Player was removed");
	};
	player.onUpdate = function() {

		if (Input.IsKeyReleased(KEY_1)) {
			console.log("SceneObjects: " + SceneManager.SceneObjects.length);
			console.log("LevelObjects: " + SceneManager.LevelObjects.length);
			console.log("TileObjects: " + SceneManager.TileObjects.length);

		}

		if (Platformer.IsPlaying) {

			if (Input.IsKeyReleased(KEY_Q - KEY_LCASE)) {
				Platformer.IsPlaying = false;
				SceneManager.ClearLevel();
				// Spawn the main menu!
				SceneManager.Add(new Platformer.MainMenu(false));
				Platformer.FreeCursor();
				$("#hud-ingame").hide();
			}
			if(Input.IsKeyReleased(KEY_M - KEY_LCASE)) {
				Platformer.IsPlaying = false;
				//Spawn the main menu in pause mode!
				SceneManager.Add(new Platformer.MainMenu(true));
				SceneManager.HideLevel();
				Platformer.FreeCursor();
				$("#hud-ingame").hide();
			}

			if(Date.now() - player.LastTimeUpdate > 1000) {
				player.TimeRemaining--;
				player.LastTimeUpdate = Date.now();
				$("#hud-time").html("" + player.TimeRemaining);
				if(player.TimeRemaining < 0) {
					Platformer.IsPlaying = false;
					SceneManager.ClearLevel();
					// Spawn the main menu!
					SceneManager.Add(new Platformer.LostMenu());
					Platformer.FreeCursor();
					$("#hud-ingame").hide();
				}
			}

			Platformer.Controls.camera.position.x = player.position.x;
			Platformer.Controls.camera.position.y = player.position.y + 1;
			Platformer.Controls.camera.position.z = player.position.z;

			var mag = 20;
			var f = 40;
			var lv = player.getLinearVelocity();
			var hlv = v3(lv.x, 0, lv.z);
			var len = hlv.length();
			var cv = Platformer.Controls.camera.getWorldDirection();
			var chv = v3(cv.x, 0, cv.z);
			// console.log(len);

			raycaster.set(Platformer.Controls.camera.position, v3(0.0, -1.0, 0.0));
			var intersections = raycaster.intersectObjects(SceneManager.TileObjects, true);
			for (var i = 0; i < intersections.length; i++) {
				var intersection = intersections[i];
				if (intersection.object != player) {
					// console.log(intersection.distance);
					if (intersection.distance <= 1.5) {
						player.CanJump = true;
						player.inAir = false;
					} else {
						player.CanJump = false;
						player.inAir = true;
					}
					break;
				}
			}

			var impulse = v3z();
			if (Platformer.Controls.Jump && player.CanJump) {
				impulse.y += f * 2;
				// console.log("jumping motherfuckers.");
				player.CanJump = false;
			}

			var spd = ((Platformer.Controls.StrafeLeft || Platformer.Controls.StrafeRight)
					&& !(Platformer.Controls.StrafeLeft && Platformer.Controls.StrafeRight)
					&& ((Platformer.Controls.Forward || Platformer.Controls.Backward) && !(Platformer.Controls.Forward && Platformer.Controls.Backward)) ? 0.5 * f
					: f);

			if (player.inAir) {
				spd /= 4;
			}

			if (Platformer.Controls.Forward && (len < mag || hlv.dot(chv) <= 0)) {
				impulse.x += -spd * Math.cos(Platformer.Controls.Yaw);
				impulse.z += -spd * Math.sin(Platformer.Controls.Yaw);
			}
			if (Platformer.Controls.Backward && (len < mag || hlv.dot(chv) >= 0)) {
				impulse.x -= -spd * Math.cos(Platformer.Controls.Yaw);
				impulse.z -= -spd * Math.sin(Platformer.Controls.Yaw);
			}
			chv.applyAxisAngle(v3(0, 1, 0), Math.PI / 2);
			if (Platformer.Controls.StrafeLeft && (len < mag || hlv.dot(chv) <= 0)) {
				impulse.x += -spd * Math.cos(Platformer.Controls.Yaw - Math.PI / 2);
				impulse.z += -spd * Math.sin(Platformer.Controls.Yaw - Math.PI / 2);
			}
			if (Platformer.Controls.StrafeRight && (len < mag || hlv.dot(chv) >= 0)) {
				impulse.x += -spd * Math.cos(Platformer.Controls.Yaw + Math.PI / 2);
				impulse.z += -spd * Math.sin(Platformer.Controls.Yaw + Math.PI / 2);
			}

			player.applyCentralImpulse(impulse);

			if (player.position.y < -10) {
				player.position.y = StartPositionY;
				player.position.x = StartPositionX;
				player.position.z = StartPositionZ;
				player.__dirtyPosition = true;
				player.__dirtyRotation = true;
			}
		}
	};
};

Platformer.StartLevel = function(levelName) {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));
	Platformer.ParseJsonObjects();
	Platformer.LoadLevel(levelName);
	Platformer.IsPlaying = true;
	Platformer.Player.TimeRemaining = 300;
	Platformer.Player.LastTimeUpdate = Date.now();
	$("#hud-ingame").show();
};

Platformer.PlayerDied = function(killedBy) {
	console.log("Player killed by " + killedBy);
};

Platformer.PlayerReachedEnd = function() {
	console.log("Player reached end");
};

Platformer.PlayerSeenByScanner = function(id) {
	console.log("Player seen by scanner: " + id);
};