var StartPositionX = 0;
var StartPositionY = 5;
var StartPositionZ = 0;

Platformer.LoadLevel = function(levelName) {
	$.getJSON("levels/" + levelName, function(data) {

		var floorMaterial = Physijs.createMaterial(new THREE.MeshPhongMaterial({
					color: 0x666666,
					map: Platformer.Texture,
					blending: THREE.AdditiveBlending,
					shininess: 0
				}),.5, // high friction
				.0 // low restitution
		);

		var scale = v3(2, 2, 2);

		for (var i = 0; i < data.objects.length; i++) {

			var obj = data.objects[i];

			var tileX = obj.TileX;
			var tileY = obj.TileY;
			var type = obj.TileType;
			var tileHeight = obj.TileHeight;
			if (type == "floor" || type == "start") {

				var dimension = scale;
				var position = v3(dimension.x * tileX, dimension.y * tileHeight, dimension.z * tileY);

				if (type == "start") {
					StartPositionX = tileX * dimension.x;
					StartPositionY = tileHeight * dimension.y + 2;
					StartPositionZ = tileY * dimension.z;
				}

				Platformer.AddFloor(position, dimension, floorMaterial);

				// console.log("Added floor at " + tileX + " / " + tileY);

			} else if (type == "wall") {
				var dimension = v3(scale.x, scale.y * 5, scale.z);
				var position = v3(dimension.x * tileX, 1, dimension.z * tileY);
				Platformer.AddFloor(position, dimension);
			} else if (type == "end") {
				var position = v3(scale.x * tileX, scale.y * tileHeight, scale.z * tileY);
				Platformer.AddFloor(position, scale, floorMaterial);
				Platformer.AddTeleporter(v3(scale.x * tileX, scale.y * tileHeight + 1, scale.z * tileY));
			}else if (type == "end_final") {
				var position = v3(scale.x * tileX, scale.y * tileHeight, scale.z * tileY);
				Platformer.AddFloor(position, scale, floorMaterial);
				Platformer.AddPodium(v3(scale.x * tileX, scale.y * tileHeight + 1, scale.z * tileY));
			} else if (type == "tracer") {
				if(obj.WithFloor == "true"){
					var position = v3(scale.x * tileX, scale.y, scale.z * tileY);
					Platformer.AddFloor(position, scale, floorMaterial);
				}
				Platformer.AddTracer(v3(scale.x * tileX, (scale.y * tileHeight) + 2.5, scale.z * tileY));
			} else if (type == "scanner") {
				var position = v3(scale.x * tileX, scale.y * tileHeight, scale.z * tileY);
				if(obj.WithFloor == "true") {
					Platformer.AddFloor(position, scale, floorMaterial);
				}
				//Convert all targets into v3's
				if(obj.Targets.length > 0) {
					var targets = [];
					for(var j=0; j < obj.Targets.length; j++) {
						targets.push(v3(obj.Targets[j].x * scale.x, obj.Targets[j].y * scale.y + 5, obj.Targets[j].z * scale.z));
					}
					Platformer.AddScanner(targets);
				} else {
					console.log("could not add targets");
				}
			} else if (type == "floppydisk") {
				if(obj.WithFloor == true){
					var position = v3(scale.x * tileX, scale.y * tileHeight, scale.z * tileY);
					Platformer.AddFloor(position, scale, floorMaterial);
				}
				Platformer.AddFloppyDisk(v3(scale.x * tileX, scale.y * tileHeight + 1, scale.z * tileY));
			} else if (type == "pendulum") {
				var position = v3(scale.x * tileX, scale.y * tileHeight, scale.z * tileY);
				Platformer.AddFloor(position, scale, floorMaterial);
				Platformer.AddPendulum(v3(scale.x * tileX, scale.y * 0.5 + 3, scale.z * tileY), v3(1, 5, 1), floorMaterial);
			}else if (type == "rotcube") {
				Platformer.AddRotatingCube(v3(scale.x * tileX, scale.y * 0.5, scale.z * tileY), v3(8, 1, 2), floorMaterial);
			}else if (type == "jumppad") {
				var position = v3(scale.x * tileX, scale.y * tileHeight, scale.z * tileY);
				Platformer.AddFloor(position, scale, floorMaterial);
				Platformer.AddJumppad(v3(scale.x * tileX, scale.y * tileHeight + 1, scale.z * tileY));
			} else {
				console.log("type: " + type);
			}

		}

		// syslog
		Platformer.AddSysLog();

		Platformer.AddSymbolParticleCloud();

		Platformer.AddWirePlane(v3(0, -40, 0), 1000, 1000);

	});
};
var raycaster = new THREE.Raycaster();
OnInit = function() {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));
	// Add main menu object

	var OnInitComplete = function() {

		SceneManager.Add(new Platformer.MainMenu(false));

		var friction = 1.2;
		var restitution = .0;
		var mass = 50;
		var mag = 5;
		var f = 20;
		var jumpStrength = 21;

		var playerMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({}), friction, restitution);

		//add fog
		Platformer.Scene.fog = new THREE.Fog(Platformer.FogColor, 0.1, 20);

		var player = Platformer.AddPlayer(v3(0, 5, 0), v3(1 ,1 ,1), playerMaterial, mass);
		Platformer.Player = player;
		SceneManager.Add(Platformer.Camera, Platformer.audioListener);


		player.OnStart = function () {
			player.name = "player";
			player.visible = false;
			player.setCcdMotionThreshold(1);
			player.setCcdSweptSphereRadius(0.2);
			player.CanJump = false;
			player.setAngularFactor(v3z());
			player.LastTimeUpdate = Date.now();
			player.TimeRemaining = 0;
			player.InternalJumpCd = 0;
			player.Level = 1;
			player.IsShowingEinstein = false;
			player.GodMode = false;
		};

		player.OnEnd = function() {
			console.log("Player was removed");
		};

		player.OnUpdate = function() {

			//Sound
			var isPlayingAnything = (Platformer.EinsteinSound != null && Platformer.EinsteinSound.isPlaying) || (Platformer.EinsteinEndSound != null && Platformer.EinsteinEndSound.isPlaying);
			if(!isPlayingAnything && Platformer.IsShowingEinstein)  {
				Platformer.ShowEinstein(false);
			}

			if (Input.IsKeyReleased(KEY_1)) {
				console.log("SceneObjects: " + SceneManager.SceneObjects.length);
				console.log("LevelObjects: " + SceneManager.LevelObjects.length);
				console.log("TileObjects: " + SceneManager.TileObjects.length);
			}

			if(Input.IsKeyReleased(KEY_2)) {
				console.log("Ending world");
				Platformer.IsWorldEnding = true;
			}

			if(Input.IsKeyReleased(KEY_3)) {
				for(var i=0; i < SceneManager.SceneObjects.length; i++) {
					console.log("Obj: " + SceneManager.SceneObjects[i].name);
				}
			}

			if (Platformer.IsPlaying) {

				if (Input.IsKeyReleased(KEY_Q - KEY_LCASE)) {
					Platformer.EndLevel();
					// Spawn the main menu!
					SceneManager.Add(new Platformer.MainMenu(false));
				}

				if (Input.IsKeyReleased(KEY_G - KEY_LCASE)) {
					player.GodMode = !player.GodMode;
					player.visible = player.GodMode;
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
						Platformer.EndLevel();
						// Spawn the main menu!
						SceneManager.Add(new Platformer.LostMenu("You ran out of time!"));
					}
				}

				if(player.InternalJumpCd > 0) {
					player.InternalJumpCd--;
				}
				if(!player.GodMode) {
					Platformer.Controls.camera.position.x = player.position.x;
					Platformer.Controls.camera.position.y = player.position.y + 0.5;
					Platformer.Controls.camera.position.z = player.position.z;
				}
				var lv = player.getLinearVelocity();
				var hlv = v3(lv.x, 0, lv.z);
				var len = hlv.length();
				var cv = Platformer.Controls.camera.getWorldDirection();
				var chv = v3(cv.x, 0, cv.z);
				// console.log(len);

				raycaster.set(player.position, v3(0.0, -1.0, 0.0));
				var intersections = raycaster.intersectObjects(SceneManager.TileObjects, true);
				for (var i = 0; i < intersections.length; i++) {
					var intersection = intersections[i];
					if (intersection.object != player) {
						//console.log(intersection.distance);
						if (intersection.distance <= 1.01) {
							if(player.CanJump == false) {
								//console.log("CanJump :: " + intersection.distance);
							}
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
				if (Platformer.Controls.Jump && player.CanJump && player.InternalJumpCd == 0) {
					player.setLinearVelocity(v3(lv.x, 0.1, lv.z));
					impulse.y += f * jumpStrength;
					player.CanJump = false;
					Platformer.PlaySoundOnObject(Platformer.Camera, Platformer.Audio.Jump);
					player.InternalJumpCd = 32; //:D
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

				if(player.GodMode) {
					Platformer.Controls.camera.position.x += impulse.x * 0.01;
					Platformer.Controls.camera.position.y += impulse.y * 0.01;
					Platformer.Controls.camera.position.z += impulse.z * 0.01;
				} else {
					player.applyCentralImpulse(impulse);
				}

				if (player.position.y < -15 && !Platformer.IsWorldEnding) {
					Platformer.PlayerDied("Fell off the world.");
				}
			}
		};
	};

	LoadResources(OnInitComplete);
};

Platformer.IsShowingEinstein = false;
Platformer.EinsteinSound = null;
Platformer.EinsteinEndSound = null;
Platformer.ShowEinstein = function(visible) {
	var einstein = $("#hud-einstein");
	if(visible) {
		Platformer.IsShowingEinstein = true;
		einstein.fadeIn();
	} else {
		Platformer.IsShowingEinstein = false;
		einstein.hide();
	}
};
Platformer.StartLevel = function(levelName) {
	if(Platformer.Player.Level == 1) {
		console.log("Playing supposed audio");
		var einsteinSound = Platformer.PlaySoundOnObject(Platformer.Camera ,Platformer.Audio.Intro);
		if(einsteinSound != null) {
			Platformer.EinsteinSound = einsteinSound;
			Platformer.ShowEinstein(true);
		}
	}

	var snd = Platformer.PlaySoundOnObject(Platformer.Camera ,Platformer.Audio.CyberWind);
	if(snd != null) {
		snd.setLoop(true);
		snd.position.z = -10;
	}
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));
	Platformer.IsWorldEnding = false;
	Platformer.ParseJsonObjects();
	Platformer.LoadLevel(levelName);
	Platformer.IsPlaying = true;
	if(Platformer.Player.Level == 1){
		Platformer.Player.TimeRemaining = 45;
	}else if(Platformer.Player.Level == 2){
		Platformer.Player.TimeRemaining = 30;
	}else if(Platformer.Player.Level == 3){
		Platformer.Player.TimeRemaining = 55;
	}
	Platformer.Player.LastTimeUpdate = Date.now();

	Platformer.Player.position.x = StartPositionX;
	Platformer.Player.position.y = StartPositionY;
	Platformer.Player.position.z = StartPositionZ;
	Platformer.Controls.Yaw = -Math.PI;
	Platformer.Controls.Pitch = -2.24;
	Platformer.Player.__dirtyPosition = true;
	Platformer.Player.__dirtyRotation = true;
	Platformer.Player.setLinearVelocity(v3z());
	Platformer.Player.setAngularVelocity(v3z());
	$("#hud-ingame").show();




};

Platformer.PlayerDied = function(killedBy) {
	console.log("Playing death sound?");
	Platformer.PlaySoundOnObject(Platformer.Camera, Platformer.Audio.Death);
	console.log("Player killed by " + killedBy);
	// End level
	Platformer.EndLevel();
	// Spawn the main menu!
	SceneManager.Add(new Platformer.LostMenu("Player killed by " + killedBy));
};

Platformer.EndLevel = function() {
	Platformer.IsPlaying = false;
	SceneManager.ClearLevel();
	Platformer.FreeCursor();
	$("#hud-ingame").hide();
};

Platformer.PlayerReachedEnd = function() {
	// End level
	Platformer.EndLevel();
	// Spawn the continue menu
	SceneManager.Add(new Platformer.ContinueMenu());
	var snd = Platformer.PlaySoundOnObject(Platformer.Camera, Platformer.Audio.MenuLoop);
	if(snd != null) {
		snd.setLoop(true);
	}
};

Platformer.PlayerReachedPodium = function() {
	console.log("Playing End Sound");
	Platformer.EinsteinEndSound = Platformer.PlaySoundOnObject(Platformer.Camera, Platformer.Audio.End);
	// End level
	Platformer.EndLevel();
	// Spawn the victory menu
	SceneManager.Add(new Platformer.VictoryMenu());
};