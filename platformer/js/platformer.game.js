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

onInit = function() {
	// Platformer.AddTestBox(v3(0, 0, 0), v3(5, 5, 5));

	Platformer.LoadLevel("level1.json");

	var cube = Platformer.AddBoxMass(v3(0, 5, 0), v3(1, 1, 1), Platformer.DefaultMaterial, 1);

	cube.onUpdate = function() {
		controls.camera.position.x = cube.position.x;
		controls.camera.position.y = cube.position.y + 1;
		controls.camera.position.z = cube.position.z;

		if (true) {
			var mag = 20;
			var f = 4;
			var lv = cube.getLinearVelocity();
			var len = lv.length();
			console.log(len);
			if (len >= mag) {
				// cube.setLinearVelocity(v3(-mag * Math.cos(controls.Yaw), 0.0,
				// -mag * Math.sin(controls.Yaw)));
			} else {
				if (controls.Forward) {
					cube.applyCentralImpulse(v3(-f * Math.cos(controls.Yaw), 0.0, -f * Math.sin(controls.Yaw)));
				}
				if (controls.Backward) {
					cube.applyCentralImpulse(v3(f * Math.cos(controls.Yaw), 0.0, f * Math.sin(controls.Yaw)));
				}
				if (controls.StrafeLeft) {
					cube.applyCentralImpulse(v3(-f * Math.cos(controls.Yaw - Math.PI / 2), 0.0, -f * Math.sin(controls.Yaw - Math.PI / 2)));
				}
				if (controls.StrafeRight) {
					cube.applyCentralImpulse(v3(-f * Math.cos(controls.Yaw + Math.PI / 2), 0.0, -f * Math.sin(controls.Yaw + Math.PI / 2)));
				}
				if (controls.Jump) {
					cube.applyCentralImpulse(v3(0.0, 5.0, 0.0));
				}
			}

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