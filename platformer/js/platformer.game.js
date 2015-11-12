Platformer.LoadLevel = function(levelName) {
	$.getJSON("levels/" + levelName, function(data) {

		for (var i = 0; i < data.objects.length; i++) {

			var obj = data.objects[i];

			var type = obj.type;
			var position = v3(obj.position.x, obj.position.y, obj.position.z);

			if (type == "floor") {
				console.log("flr");
				var dimension = v3(obj.dimensions.x, obj.dimensions.y, obj.dimensions.z);
				Platformer.AddFloor(position, dimension);

			} else {
				console.log("type: " + type);
			}

		}

	});
};

var raycaster = new THREE.Raycaster();
onInit = function() {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));

	Platformer.LoadLevel("level1.json");

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
			var len = lv.length();
			// console.log(len);

			raycaster.set(controls.camera.position, v3(0.0, -1.0, 0.0));
			var intersections = raycaster.intersectObjects(sceneobjs, true);
			for (var i = 0; i < intersections.length; i++) {
				var intersection = intersections[i];
				if (intersection.object != cube) {
					//console.log(intersection.distance);
					if (intersection.distance <= 1.5) {
						cube.CanJump = true;
					} else {
						cube.CanJump = false;
					}
					break;
				}
			}

			var impulse = v3z();
			if (controls.Jump && cube.CanJump) {
				impulse.y += f * 2;
				//console.log("jumping motherfuckers.");
				cube.CanJump = false;
			}

			if (len >= mag) {
				// cube.setLinearVelocity(v3(-mag * Math.cos(controls.Yaw), 0.0,
				// -mag * Math.sin(controls.Yaw)));
			} else {
				var spd = ((controls.StrafeLeft || controls.StrafeRight) && !(controls.StrafeLeft && controls.StrafeRight)
						&& ((controls.Forward || controls.Backward) && !(controls.Forward && controls.Backward)) ? 0.5 * f : f);

				if (controls.Forward) {
					impulse.x += -spd * Math.cos(controls.Yaw);
					impulse.z += -spd * Math.sin(controls.Yaw);
				}
				if (controls.Backward) {
					impulse.x -= -spd * Math.cos(controls.Yaw);
					impulse.z -= -spd * Math.sin(controls.Yaw);
				}
				if (controls.StrafeLeft) {
					impulse.x += -spd * Math.cos(controls.Yaw - Math.PI / 2);
					impulse.z += -spd * Math.sin(controls.Yaw - Math.PI / 2);
				}
				if (controls.StrafeRight) {
					impulse.x += -spd * Math.cos(controls.Yaw + Math.PI / 2);
					impulse.z += -spd * Math.sin(controls.Yaw + Math.PI / 2);
				}
			}
			cube.applyCentralImpulse(impulse);

			if (cube.position.y < -10) {
				cube.position.y = 5;
				cube.position.x = 0;
				cube.position.z = 0;
				cube.__dirtyPosition = true;
				cube.__dirtyRotation = true;
			}
		}
	};

};