Platformer.AddFloor = function(position, dimension, material) {
	if (material === undefined) {
		material = Platformer.DefaultMaterial;
	}
	var floor = Geometry.StaticBox(position, dimension, material);
	// Floor does not have any update thingies
	Platformer.Add(floor);
	
	return floor;
};

Platformer.AddBoxMass = function(position, dimension, material, mass) {
	if (material === undefined) {
		material = Platformer.DefaultMaterial;
	}
	var floor = Geometry.StaticBoxMass(position, dimension, material, mass);
	// Floor does not have any update thingies
	Platformer.Add(floor);
	
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

	Platformer.Add(box);
}