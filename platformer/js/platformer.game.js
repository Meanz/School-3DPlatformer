var StartPositionX = 0;
var StartPositionY = 5;
var StartPositionZ = 0;

Platformer.LoadLevel = function(levelName) {
	$.getJSON("levels/" + levelName, function(data) {

		for (var i = 0; i < data.objects.length; i++) {

			var obj = data.objects[i];

			var tileX = obj.TileX;
			var tileY = obj.TileY;
			var type = obj.TileType;

			if (type == "floor" || type == "start") {
				var tileHeight = obj.TileHeight;
				var dimension = v3(1, 1, 1);
				var position = v3(dimension.x * tileX, dimension.y * tileHeight, dimension.z * tileY);

				if (type == "start") {
					StartPositionX = tileX * dimension.x;
					StartPositionY = tileHeight * dimension.y + 1;
					StartPositionZ = tileY * dimension.z;
				}

				Platformer.AddFloor(position, dimension);

				// console.log("Added floor at " + tileX + " / " + tileY);

			} else if (type == "wall") {
				var dimension = v3(1, 5, 1);
				var position = v3(dimension.x * tileX, 1, dimension.z * tileY);
				Platformer.AddFloor(position, dimension);
			} else {
				console.log("type: " + type);
			}

		}
		Platformer.AddTracer(v3(20, 2, 0));
		Platformer.AddScanner([v3(5, 5, 0)]);
	});
};

var raycaster = new THREE.Raycaster();
OnInit = function() {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));

	// Start menu
	Platformer.State = "MainMenu";

	// Add main menu object
	Platformer.Add(new Platformer.MainMenu());

};

Platformer.StartLevel = function(levelName) {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));

	Platformer.ParseJsonObjects();

	
	Platformer.LoadLevel(levelName);

	var player = Platformer.AddBoxMass(v3(0, 5, 0), v3(1, 1, 1), Platformer.DefaultMaterial, 20);
	player.name = "player";
	player.setCcdMotionThreshold(1);
	player.setCcdSweptSphereRadius(0.2);
	player.CanJump = false;
	player.setAngularFactor(v3z());
	player.onUpdate = function() {
		controls.camera.position.x = player.position.x;
		controls.camera.position.y = player.position.y + 1;
		controls.camera.position.z = player.position.z;

		if (true) {
			var mag = 20;
			var f = 40;
			var lv = player.getLinearVelocity();
			var hlv = v3(lv.x, 0, lv.z);
			var len = hlv.length();
			var cv = controls.camera.getWorldDirection();
			var chv = v3(cv.x, 0 ,cv.z);
			// console.log(len);

			raycaster.set(controls.camera.position, v3(0.0, -1.0, 0.0));
			var intersections = raycaster.intersectObjects(sceneobjs, true);
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
			if (controls.Jump && player.CanJump) {
				impulse.y += f * 2;
				// console.log("jumping motherfuckers.");
				player.CanJump = false;
			}


			var spd = ((controls.StrafeLeft || controls.StrafeRight)
					&& !(controls.StrafeLeft && controls.StrafeRight)
					&& ((controls.Forward || controls.Backward) && !(controls.Forward && controls.Backward)) ? 0.5 * f
					: f);

			if(player.inAir){
				spd /= 4;
			}

			if (controls.Forward && (len < mag || hlv.dot(chv) <= 0 )) {
				impulse.x += -spd * Math.cos(controls.Yaw);
				impulse.z += -spd * Math.sin(controls.Yaw);
			}
			if (controls.Backward && (len < mag || hlv.dot(chv) >= 0 )) {
				impulse.x -= -spd * Math.cos(controls.Yaw);
				impulse.z -= -spd * Math.sin(controls.Yaw);
			}
			chv.applyAxisAngle(v3(0, 1, 0), Math.PI/2);
			if (controls.StrafeLeft && (len < mag || hlv.dot(chv) <= 0 )) {
				impulse.x += -spd * Math.cos(controls.Yaw - Math.PI / 2);
				impulse.z += -spd * Math.sin(controls.Yaw - Math.PI / 2);
			}
			if (controls.StrafeRight && (len < mag || hlv.dot(chv) >= 0 )) {
				impulse.x += -spd * Math.cos(controls.Yaw + Math.PI / 2);
				impulse.z += -spd * Math.sin(controls.Yaw + Math.PI / 2);
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


Platformer.PlayerDied = function(killedBy){
	console.log("Player killed by " + killedBy);
};