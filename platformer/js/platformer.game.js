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
				var dimension = v3(8, 1, 8);
				var position = v3(dimension.x * tileX, dimension.y * tileHeight, dimension.z * tileY);
				
				if (type == "start") {
					StartPositionX = tileX * dimension.x;
					StartPositionY = tileHeight * dimension.y + 1;
					StartPositionZ = tileY * dimension.z;
				}

				Platformer.AddFloor(position, dimension);

				//console.log("Added floor at " + tileX + " / " + tileY);

			} else {
				console.log("type: " + type);
			}

		}

	});
};


var raycaster = new THREE.Raycaster();
onInit = function() {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));

	Platformer.LoadLevel("level2.json");

	var cube = Platformer.AddBoxMass(v3(0, 5, 0), v3(1, 1, 1), Platformer.DefaultMaterial, 20);

	cube.setCcdMotionThreshold(1);
	cube.setCcdSweptSphereRadius(0.2);
	cube.CanJump = false;
	cube.setAngularFactor(v3z());
	cube.onUpdate = function() {
		controls.camera.position.x = cube.position.x;
		controls.camera.position.y = cube.position.y + 1;
		controls.camera.position.z = cube.position.z;

		if (true) {
			var mag = 20;
			var f = 40;
			var lv = cube.getLinearVelocity();
			var hlv = v3(lv.x, 0, lv.z);
			var len = hlv.length();
			var cv = controls.camera.getWorldDirection();
			var chv = v3(cv.x, 0 ,cv.z);
			// console.log(len);

			raycaster.set(controls.camera.position, v3(0.0, -1.0, 0.0));
			var intersections = raycaster.intersectObjects(sceneobjs, true);
			for (var i = 0; i < intersections.length; i++) {
				var intersection = intersections[i];
				if (intersection.object != cube) {
					// console.log(intersection.distance);
					if (intersection.distance <= 1.5) {
						cube.CanJump = true;
						cube.inAir = false;
					} else {
						cube.CanJump = false;
						cube.inAir = true;
					}
					break;
				}
			}

			var impulse = v3z();
			if (controls.Jump && cube.CanJump) {
				impulse.y += f * 2;
				// console.log("jumping motherfuckers.");
				cube.CanJump = false;
			}


			var spd = ((controls.StrafeLeft || controls.StrafeRight)
					&& !(controls.StrafeLeft && controls.StrafeRight)
					&& ((controls.Forward || controls.Backward) && !(controls.Forward && controls.Backward)) ? 0.5 * f
					: f);

			if(cube.inAir){
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

			cube.applyCentralImpulse(impulse);

			if (cube.position.y < -10) {
				cube.position.y = StartPositionY;
				cube.position.x = StartPositionX;
				cube.position.z = StartPositionZ;
				cube.__dirtyPosition = true;
				cube.__dirtyRotation = true;
			}
		}
	};

};