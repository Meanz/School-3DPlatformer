Platformer.VK_W = 87;
Platformer.VK_A = 65;
Platformer.VK_S = 83;
Platformer.VK_D = 68;
Platformer.VK_SPACE = 32;

Platformer.FirstPersonControls = function(camera) {

	this.camera = camera;
	this.domElement = document;
	this.Yaw = -2.45;
	this.Pitch = -2.24;
	this.DeltaX = 0;
	this.DeltaY = 0;
	this.LastMouseX = 0;
	this.LastMouseY = 0;
	this.PointerLock = false;
	this.viewHalfX = window.innerWidth / 2;
	this.viewHalfY = window.innerHeight / 2;
	this.Init = false;
	this.Forward = false;
	this.Backward = false;
	this.StrafeLeft = false;
	this.StrafeRight = false;
	this.Speed = 0.5;

	this.onMouseMove = function(event) {

		// Middle
		var mx = event.pageX - this.viewHalfX;
		var my = event.pageY - this.viewHalfY;

		if (!this.Init) {
			this.LastMouseX = mx;
			this.LastMouseY = my;
			this.Init = !this.Init;
		}

		if (this.PointerLock) {
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			this.DeltaX = movementX;
			this.DeltaY = movementY;
		} else {
			this.DeltaX = mx - this.LastMouseX;
			this.DeltaY = my - this.LastMouseY;
		}

		this.LastMouseX = mx;
		this.LastMouseY = my;

	};

	this.onMouseDown = function(event) {

	};

	this.onMouseUp = function(event) {

	};

	this.onKeyDown = function(event) {
		var key = event.which;

		if (key == Platformer.VK_W) {
			this.Forward = true;
		} else if (key == Platformer.VK_A) {
			this.StrafeLeft = true;
		} else if (key == Platformer.VK_D) {
			this.StrafeRight = true;
		} else if (key == Platformer.VK_S) {
			this.Backward = true;
		}
	};

	this.onKeyUp = function(event) {
		var key = event.which;

		if (key == Platformer.VK_W) {
			this.Forward = false;
		} else if (key == Platformer.VK_A) {
			this.StrafeLeft = false;
		} else if (key == Platformer.VK_D) {
			this.StrafeRight = false;
		} else if (key == Platformer.VK_S) {
			this.Backward = false;
		}
	};

	this.Update = function(delta) {

		//
		this.Yaw += this.DeltaX * 0.001;
		this.Pitch -= this.DeltaY * 0.001;

		// console.log("Yaw:" + this.Yaw);
		// console.log("Pitch: " + this.Pitch);
		this.DeltaX = 0;
		this.DeltaY = 0;

		//
		if (false) {
			var spd = ((this.StrafeLeft || this.StrafeRight) && !(this.StrafeLeft && this.StrafeRight)
					&& ((this.Forward || this.Backward) && !(this.Forward && this.Backward)) ? 0.5 * this.Speed : this.Speed);
			if (this.Forward) {
				this.camera.position.x -= spd * Math.cos(this.Yaw);
				this.camera.position.z -= spd * Math.sin(this.Yaw);
			}
			if (this.Backward) {
				this.camera.position.x += spd * Math.cos(this.Yaw);
				this.camera.position.z += spd * Math.sin(this.Yaw);
			}
			if (this.StrafeLeft) {
				this.camera.position.x -= spd * Math.cos(this.Yaw - Math.PI / 2);
				this.camera.position.z -= spd * Math.sin(this.Yaw - Math.PI / 2);
			}
			if (this.StrafeRight) {
				this.camera.position.x -= spd * Math.cos(this.Yaw + Math.PI / 2);
				this.camera.position.z -= spd * Math.sin(this.Yaw + Math.PI / 2);
			}
		}

		var targetPosition = v3z();
		var position = this.camera.position;

		targetPosition.x = position.x + 10 * Math.sin(this.Pitch) * Math.cos(this.Yaw);
		targetPosition.y = position.y + 10 * Math.cos(this.Pitch);
		targetPosition.z = position.z + 10 * Math.sin(this.Pitch) * Math.sin(this.Yaw);

		// console.log("LookAt: " + targetPosition.x + " / " + targetPosition.y
		// + " / "
		// + targetPosition.z );

		this.camera.lookAt(targetPosition);

	};

	this.domElement.addEventListener('contextmenu', function(event) {
		event.preventDefault();
	}, false);

	this.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);
	this.domElement.addEventListener('mousedown', bind(this, this.onMouseDown), false);
	this.domElement.addEventListener('mouseup', bind(this, this.onMouseUp), false);
	this.domElement.addEventListener('keydown', bind(this, this.onKeyDown), false);
	this.domElement.addEventListener('keyup', bind(this, this.onKeyUp), false);

	function bind(scope, fn) {

		return function() {

			fn.apply(scope, arguments);

		};

	}
	;
};