var KEY_SPACE = 32;
var KEY_LCASE = 32;
var KEY_A = 97;
var KEY_B = 98;
var KEY_C = 99;
var KEY_D = 100;
var KEY_E = 101;
var KEY_F = 102;
var KEY_G = 103;
var KEY_H = 104;
var KEY_I = 105;
var KEY_J = 106;
var KEY_K = 107;
var KEY_L = 108;
var KEY_M = 109;
var KEY_N = 110;
var KEY_O = 111;
var KEY_P = 112;
var KEY_Q = 113;
var KEY_R = 114;
var KEY_S = 115;
var KEY_T = 116;
var KEY_U = 117;
var KEY_V = 118;
var KEY_W = 119;
var KEY_X = 120;
var KEY_Y = 121;
var KEY_Z = 122;

var KEY_1 = 49;
var KEY_2 = 50;
var KEY_3 = 51;
var KEY_4 = 52;
var KEY_5 = 53;
var KEY_6 = 54;
var KEY_7 = 55;
var KEY_8 = 56;
var KEY_9 = 57;
var KEY_0 = 48;

var MOUSE_LMB = 0;
var MOUSE_MMB = 1;
var MOUSE_RMB = 2;

// Input handle

var Input = {};

Input.F_MouseKeysPressed = [];
Input.F_MouseKeysReleased = [];
Input.F_KeysPressed = [];
Input.F_KeysReleased = [];

Input.MouseX = 0;
Input.MouseY = 0;
Input.LastMouseX = 0;
Input.LastMouseY = 0;
Input.DeltaMouseX = 0;
Input.DeltaMouseY = 0;
Input.WheelDelta = 0;
Input.KeysDown = [];
Input.MouseKeysDown = [];
Input.PreventRightClickMenu = false;
Input.IsListenersAdded = false;

Input.AddListeners = function(who) {
	if (Input.IsListenersAdded) {
		console.log("Input::AddListeners() Error: Listeners is already added!");
	} else {
		//ARGH
		document.addEventListener("keyup", Input.OnKeyUp, false);
		document.addEventListener("keydown", Input.OnKeyDown, false);
		who.addEventListener("mouseup", Input.OnMouseUp, false);
		who.addEventListener("mousedown", Input.OnMouseDown, false);
		who.addEventListener("mousemove", Input.OnMouseMove, false);
		who.addEventListener("mousewheel", Input.OnMouseWheelChange, false);

		if (Input.PreventRightClickMenu) {
			who.addEventListener("contextmenu", function(event) {
				event.preventDefault();
			}, false);
		}
		Input.IsListenersAdded = true;
	}
};

Input.Update = function() {

	// Calculate mouse values
	Input.DeltaMouseX = Input.MouseX - Input.LastMouseX;
	Input.DeltaMouseY = Input.MouseY - Input.LastMouseY;

};

Input.Flush = function() {

	// Next frame, update states
	Input.F_MouseKeysPressed = [];
	Input.F_MouseKeysReleased = [];
	Input.F_KeysPressed = [];
	Input.F_KeysReleased = [];

	//
	Input.LastMouseX = Input.MouseX;
	Input.LastMouseY = Input.MouseY;
	
	//
	Input.WheelDelta = 0;

};

Input.OnKeyDown = function(event) {
	var key = event.which;
	Input.KeysDown[key] = true;
	Input.F_KeysPressed.push(key);
};

Input.OnKeyUp = function(event) {
	var key = event.which;
	Input.KeysDown[key] = false;
	Input.F_KeysReleased.push(key);
};

Input.IsKeyDown = function(which) {
	if (Input.KeysDown[which] == undefined) {
		return false;
	}
	return Input.KeysDown[which];
};

Input.IsKeyPressed = function(which) {
	for (var i = 0; i < Input.F_KeysPressed.length; i++) {
		if (Input.F_KeysPressed[i] == which) {
			return true;
		}
	}
	return false;
}

Input.IsKeyReleased = function(which) {
	for (var i = 0; i < Input.F_KeysReleased.length; i++) {
		if (Input.F_KeysReleased[i] == which) {
			return true;
		}
	}
	return false;
}

Input.OnMouseDown = function(event) {
	
	event.preventDefault();
	event.stopPropagation();
	
	Input.MouseKeysDown[event.button] = true;
	Input.F_MouseKeysPressed.push(event.button);
};

Input.OnMouseUp = function(event) {

	event.preventDefault();
	event.stopPropagation();
	
	Input.MouseKeysDown[event.button] = false;
	Input.F_MouseKeysReleased.push(event.button);
};

Input.OnMouseWheelChange = function(event) {
	
	event.preventDefault();
	event.stopPropagation();
	
	var delta = event.wheelDelta;
	
	Input.WheelDelta = delta;
	
};

Input.IsMouseKeyDown = function(which) {
	if (Input.MouseKeysDown[which] == undefined) {
		return false;
	}
	return Input.MouseKeysDown[which];
};

Input.IsMouseKeyPressed = function(which) {
	for (var i = 0; i < Input.F_MouseKeysPressed.length; i++) {
		if (Input.F_MouseKeysPressed[i] == which) {
			return true;
		}
	}
	return false;
}

Input.IsMouseKeyReleased = function(which) {
	for (var i = 0; i < Input.F_MouseKeysReleased.length; i++) {
		if (Input.F_MouseKeysReleased[i] == which) {
			return true;
		}
	}
	return false;
}

Input.OnMouseMove = function(event) {
	Input.MouseX = event.pageX;
	Input.MouseY = event.pageY;

};
