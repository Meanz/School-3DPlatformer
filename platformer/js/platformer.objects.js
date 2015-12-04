


Platformer.AddSysLog = function() {

	Platformer.SysLogLines = [];
	Platformer.SysLogTexture = new THREE.Texture();

	Platformer.SysLogLines.push("Initializing");
	Util.DrawSysLog(Platformer.SysLogLines, Platformer.SysLogTexture);

	Platformer.GabenMaterial = new THREE.SpriteMaterial( { map: Platformer.SysLogTexture, color: 0xffffff, fog: true } );
	var sprite = new THREE.Sprite( Platformer.GabenMaterial  );


	sprite.position.copy(v3(-150, 50, 0));
	var scale = 80;
	sprite.scale.copy(v3(scale, scale, scale));
	sprite.updateMatrix();
	sprite.AccumDelta = 0;
	sprite.thing = 0;
	sprite.onUpdate = function(delta) {
		this.AccumDelta += delta;
		if(this.AccumDelta > 3000) {
			if(this.thing == 0) {
				Platformer.SysLogLines.push("PREPARING THE WORLD FOR TERMINATION");
			} else if (this.thing >= 1 && this.thing != 10) {
				Platformer.SysLogLines.push("TERMINATING: " + (this.thing * 10) + "%");
			} else if(this.thing == 10) {
				Platformer.SysLogLines.push("KAPOOF!!!!");
			}

			Util.DrawSysLog(Platformer.SysLogLines, Platformer.SysLogTexture);
			this.AccumDelta = 0;
			this.thing++;
		}

	}
	SceneManager.Add( sprite );

};

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
	var tracer = new THREE.Mesh(Platformer.Tracer.geometry, Platformer.Tracer.material);
	tracer.position.set(position.x, position.y, position.z);
	tracer.scale.set(0.08, 0.08, 0.08);
	tracer.isActive = false;
	tracer.speed = 1;
	tracer.t = 1;
	tracer.speedVector = v3z();

	tracer.onRender = function(delta) {
		var disVec = v3z();
		disVec.subVectors(Platformer.Player.position, tracer.position);

		if (tracer.isActive) {
			if (disVec.length() < 3.2) {
				Platformer.PlayerDied("tracer");
			} else {
				tracer.speedVector.subVectors(Platformer.Player.position, tracer.position);
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
	var scanner = new THREE.Mesh(Platformer.Scanner.geometry, Platformer.Scanner.material);
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
	scanner.timePenelty = 15;
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
			var vScanToPlay = v3z().subVectors(scanner.position, Platformer.Player.position);
			var angleToY = vScanToPlay.angleTo(v3(0, 1, 0));
			// console.log("To player angle: " + angleToY);
			// console.log("Spot angle: " + scanner.spot.angle);
			if (angleToY < scanner.spot.angle && vScanToPlay.length() < scanner.spot.distance) {
				Platformer.Player.TimeRemaining -= scanner.timePenelty;
				scanner.spot.visible = false;
				if (scanner.sound.source.buffer instanceof AudioBuffer) {
					scanner.sound.play();
				}
				scanner.cooldown = scanner.cooldownTime;
				console.log("Scanner(id" + scanner.id + ") detected player");
			}
		} else {
			scanner.cooldown -= delta;
			if (scanner.cooldown <= 0) {

				// scanner.sound.stop();
			}
		}

		scanner.spot.position.set(scanner.position.x, scanner.position.y + 1.01, scanner.position.z);

	};

	scanner.OnEnd = function(){
		console.log("Scanner(" + scanner.id + ") was ended");
	};
	SceneManager.Add(scanner);
	return scanner;

};

Platformer.AddTeleporter = function(position) {
	var teleporter = new THREE.Object3D();
	var telePlatform = new THREE.Mesh(Platformer.Teleporter.geometryPlatform, Platformer.Teleporter.materialPlatform);
	SceneManager.Add(teleporter, telePlatform);
	var teleGimbalX = new THREE.Mesh(Platformer.Teleporter.geometryGimbalX, Platformer.Teleporter.materialGimbalX);
	SceneManager.Add(teleporter, teleGimbalX);
	var teleGimbalY = new THREE.Mesh(Platformer.Teleporter.geometryGimbalY, Platformer.Teleporter.materialGimbalY);
	SceneManager.Add(teleGimbalX, teleGimbalY);
	var teleGimbalZ = new THREE.Mesh(Platformer.Teleporter.geometryGimbalZ, Platformer.Teleporter.materialGimbalZ);
	SceneManager.Add(teleGimbalY, teleGimbalZ);
	var teleIcosahedron = new THREE.Mesh(Platformer.Teleporter.geometryIcosahedron, Platformer.Teleporter.materialIcosahedron);
	SceneManager.Add(teleporter, teleIcosahedron);
	teleporter.position.copy(position);
	teleporter.scale.set(0.09, 0.09, 0.09);
	teleGimbalX.position.y = 60;
	teleIcosahedron.position.y = 60;
	teleporter.gimbalRotationSpeed = 1;

	var tweenGimbalX = new TWEEN.Tween(teleGimbalX.rotation)
			.to({x : Math.PI*2}, 3000 / teleporter.gimbalRotationSpeed)
			.repeat(Infinity)
			.start();
	var tweenGimbalY = new TWEEN.Tween(teleGimbalY.rotation)
			.to({y : Math.PI*2}, 2800 / teleporter.gimbalRotationSpeed)
			.repeat(Infinity)
			.start();
	var tweenGimbalZ = new TWEEN.Tween(teleGimbalZ.rotation)
			.to({z : Math.PI*2}, 2600 / teleporter.gimbalRotationSpeed)
			.repeat(Infinity)
			.start();


	teleporter.onUpdate = function() {
		var difVec = v3z().subVectors(Platformer.Player.position, teleporter.position);
		if (difVec.length() < 1
				&& (Platformer.Player.position.y >= teleporter.position.y && Platformer.Player.position.y < teleporter.position.y + 3)) {
			Platformer.PlayerReachedEnd();
		}
	};

	console.log("Teleporter created");
	SceneManager.Add(teleporter);
	return teleporter;
};

Platformer.AddJumppad = function(position){
	//var jumppad = new Physijs.ConvexMesh(Platformer.Jumppad.geometry, Platformer.Jumppad.material, 0);
	var jumppad = new THREE.Mesh(Platformer.Jumppad.geometry, Platformer.Jumppad.material);
	jumppad.position.copy(position);
	jumppad.scale.set(0.09, 0.09, 0.09);
	jumppad.cooldownTime = 5000;
	jumppad.cooldown = 0;

	jumppad.onUpdate = function(delta) {
		if (jumppad.cooldown <= 0) {
			if (v3z().subVectors(Platformer.Player.position, jumppad.position).length() < 2) {
				Platformer.Player.applyCentralImpulse(v3(0, 500, 0));
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

Platformer.AddFloppyDisk = function(position, extraTime){
	var floppyDisk = new THREE.Mesh(Platformer.FloppyDisk.geometry, Platformer.FloppyDisk.material);
	floppyDisk.position.copy(position);
	floppyDisk.scale.set(0.09, 0.09, 0.09);
	floppyDisk.rotationSpeed = 1;

	if (extraTime === undefined) {
		extraTime = 10;
	}
	floppyDisk.extraTime = extraTime;

	var tweenFloppy = new TWEEN.Tween(floppyDisk.rotation)
			.to({y : Math.PI*2}, 1000 / floppyDisk.rotationSpeed)
			.repeat(Infinity)
			.start();

	floppyDisk.onUpdate = function(){
		if(floppyDisk.position.distanceTo(Platformer.Player.position) < 2){
			Platformer.Player.TimeRemaining += floppyDisk.extraTime;
			SceneManager.Remove(floppyDisk);
			console.log("Floppydisk picked up by player");
		}
	};

	console.log("Floppydisk created");
	SceneManager.Add(floppyDisk);
	return floppyDisk;
};

Platformer.AddPodium = function(position){
	var podium = new THREE.Object3D();
	var podiumBottom = new THREE.Mesh(Platformer.Podium.geometryBottom, Platformer.Podium.materialBase);
	SceneManager.Add(podium, podiumBottom);
	var podiumLeg = new THREE.Mesh(Platformer.Podium.geometryLeg, Platformer.Podium.materialBase);
	SceneManager.Add(podium, podiumLeg);
	var podiumTopp = new THREE.Mesh(Platformer.Podium.geometryTopp, Platformer.Podium.materialBase);
	SceneManager.Add(podium, podiumTopp);
	var podiumIcosahedron = new THREE.Mesh(Platformer.Podium.geometryIcosahedron, Platformer.Podium.materialIcosahedron);
	SceneManager.Add(podium, podiumIcosahedron);
	podium.position.copy(position);
	podium.scale.set(0.06, 0.06, 0.06);


	podium.onUpdate = function() {
		var difVec = v3z().subVectors(Platformer.Player.position, podium.position);
		if (difVec.length() < 2) {
			Platformer.PlayerReachedEnd();
		}
	};

	console.log("Podium created");
	SceneManager.Add(podium);
	return podium;


};

Platformer.ParseJsonObjects = function() {

	var tracerParced = Platformer.jsonLoader.parse(Platformer.jsonModels.GetTracer());
	Platformer.Tracer = {};
	Platformer.Tracer.geometry = tracerParced.geometry;
	Platformer.Tracer.material = new THREE.MeshPhongMaterial({
		color : 0x384040,
		specular : 0xD6D6D6,
		shininess : 10
	});

	var scannerParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetScanner());
	Platformer.Scanner = {};
	Platformer.Scanner.geometry = scannerParsed.geometry;
	Platformer.Scanner.material = new THREE.MeshPhongMaterial({
		color : 0x140404,
		specular : 0xD6D6D6,
		shininess : 10
	});

	var jumppadParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetJumppad());
	Platformer.Jumppad = {};
	Platformer.Jumppad.geometry = jumppadParsed.geometry;
	Platformer.Jumppad.material = new THREE.MeshPhongMaterial();
	Platformer.textureLoader.load("images/jumppadTex.png", function(texture) {
		Platformer.Jumppad.material.setValues({
			map : texture
		});
	});

	var floppyDiskParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetFloppyDisk());
	Platformer.FloppyDisk = {};
	Platformer.FloppyDisk.geometry = floppyDiskParsed.geometry;
	Platformer.FloppyDisk.material = new THREE.MeshPhongMaterial();
	Platformer.textureLoader.load("images/floppydiskTex.png",
			function(texture){
				Platformer.FloppyDisk.material.setValues({map: texture});
			}
	);


	var teleporterPlatformParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetTeleporterPlatform());
	var teleporterGimbalXParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetTeleporterGimbalX());
	var teleporterGimbalYParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetTeleporterGimbalY());
	var teleporterGimbalZParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetTeleporterGimbalZ());
	var icosahedronParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetIcosahedron());

	Platformer.Teleporter = {};
	Platformer.Teleporter.geometryPlatform = teleporterPlatformParsed.geometry;
	//Platformer.Teleporter.geometryPlatform.computeVertexNormals();
	Platformer.Teleporter.geometryGimbalX = teleporterGimbalXParsed.geometry;
	Platformer.Teleporter.geometryGimbalX.computeVertexNormals();
	Platformer.Teleporter.geometryGimbalY = teleporterGimbalYParsed.geometry;
	Platformer.Teleporter.geometryGimbalY.computeVertexNormals();
	Platformer.Teleporter.geometryGimbalZ = teleporterGimbalZParsed.geometry;
	Platformer.Teleporter.geometryGimbalZ.computeVertexNormals();
	Platformer.Teleporter.geometryIcosahedron = icosahedronParsed.geometry;
	//Platformer.Teleporter.geometryIcosahedron.computeFaceNormals();

	Platformer.Teleporter.materialPlatform = new THREE.MeshPhongMaterial({
		color : 0xff38d1,
		specular : 0xD6D6D6,
		shininess : 10
	});
	Platformer.Teleporter.materialGimbalX = new THREE.MeshPhongMaterial({
		color : 0xff0000,
		specular : 0xD6D6D6,
		shininess : 10
	});
	Platformer.Teleporter.materialGimbalY = new THREE.MeshPhongMaterial({
		color : 0x00ff00,
		specular : 0xD6D6D6,
		shininess : 10
	});
	Platformer.Teleporter.materialGimbalZ = new THREE.MeshPhongMaterial({
		color : 0x0000ff,
		specular : 0xD6D6D6,
		shininess : 10
	});
	Platformer.Teleporter.materialIcosahedron = new THREE.MeshPhongMaterial({
		color : 0xffff00,
		specular : 0xD6D6D6,
		shininess : 10
	});

	var podiumBottomParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetPodiumBottom());
	var podiumToppParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetPodiumTopp());
	var podiumLegParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetPodiumLeg());
	var podiumIcosahedronParsed = Platformer.jsonLoader.parse(Platformer.jsonModels.GetPodiumIcosahedron());

	Platformer.Podium = {};
	Platformer.Podium.geometryBottom = podiumBottomParsed.geometry;
	Platformer.Podium.geometryTopp = podiumToppParsed.geometry;
	Platformer.Podium.geometryLeg = podiumLegParsed.geometry;
	Platformer.Podium.geometryLeg.computeVertexNormals();
	Platformer.Podium.geometryIcosahedron = podiumIcosahedronParsed.geometry;

	Platformer.Podium.materialBase = new THREE.MeshPhongMaterial({
		color : 0xffffee,
		specular : 0xD6D6D6,
		shininess : 10
	});

	Platformer.Podium.materialIcosahedron = new THREE.MeshPhongMaterial({
		color : 0xffff00,
		specular : 0xD6D6D6,
		shininess : 10
	});

};
