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

var MOUSE_LMB = 0;
var MOUSE_MMB = 1;
var MOUSE_RMB = 2;

// Input handle

var MInput = {};

MInput.F_MouseKeysPressed = [];
MInput.F_MouseKeysReleased = [];
MInput.F_KeysPressed = [];
MInput.F_KeysReleased = [];

MInput.MouseX = 0;
MInput.MouseY = 0;
MInput.LastMouseX = 0;
MInput.LastMouseY = 0;
MInput.DeltaMouseX = 0;
MInput.DeltaMouseY = 0;
MInput.KeysDown = [];
MInput.MouseKeysDown = [];
MInput.IsListenersAdded = false;

MInput.AddListeners = function(who) {
	if (MInput.IsListenersAdded) {
		console.log("MInput::AddListeners() Error: Listeners is already added!");
	} else {
		who.addEventListener("keyup", MInput.OnKeyUp, false);
		who.addEventListener("keydown", MInput.OnKeyDown, false);
		who.addEventListener("mouseup", MInput.OnMouseUp, false);
		who.addEventListener("mousedown", MInput.OnMouseDown, false);
		who.addEventListener("mousemove", MInput.OnMouseMove, false);
		MInput.IsListenersAdded = true;
	}
};

MInput.Update = function() {

	// Calculate mouse values
	MInput.DeltaMouseX = MInput.MouseX - MInput.LastMouseX;
	MInput.DeltaMouseY = MInput.MouseY - MInput.LastMouseY;

};

MInput.Flush = function() {

	// Next frame, update states
	MInput.F_MouseKeysPressed = [];
	MInput.F_MouseKeysReleased = [];
	MInput.F_KeysPressed = [];
	MInput.F_KeysReleased = [];

	//
	MInput.LastMouseX = MInput.MouseX;
	MInput.LastMouseY = MInput.MouseY;

};

MInput.OnKeyDown = function(event) {
	var key = event.which;
	MInput.KeysDown[key] = true;
};

MInput.OnKeyUp = function(event) {
	var key = event.which;
	MInput.KeysDown[key] = false;
};

MInput.IsKeyDown = function(which) {
	if (MInput.KeysDown[which] == undefined) {
		return false;
	}
	return MInput.KeysDown[which];
};

MInput.IsKeyPressed = function(which) {
	for (var i = 0; i < MInput.F_KeysPressed.length; i++) {
		if (MInput.F_KeysPressed[i] == which) {
			return true;
		}
	}
	return false;
}

MInput.IsKeyReleased = function(which) {
	for (var i = 0; i < MInput.F_KeysReleased.length; i++) {
		if (MInput.F_KeysReleased[i] == which) {
			return true;
		}
	}
	return false;
}

MInput.OnMouseDown = function(event) {
	MInput.MouseKeysDown[event.button] = true;
	MInput.F_MouseKeysPressed.push(event.button);
};

MInput.OnMouseUp = function(event) {
	MInput.MouseKeysDown[event.button] = false;
	MInput.F_MouseKeysReleased.push(event.button);
};

MInput.IsMouseKeyDown = function(which) {
	if (MInput.MouseKeysDown[which] == undefined) {
		return false;
	}
	return MInput.MouseKeysDown[which];
};

MInput.IsMousePressed = function(which) {
	for (var i = 0; i < MInput.F_MouseKeysPressed.length; i++) {
		if (MInput.F_MouseKeysPressed[i] == which) {
			return true;
		}
	}
	return false;
}

MInput.IsMouseReleased = function(which) {
	for (var i = 0; i < MInput.F_MouseKeysReleased.length; i++) {
		if (MInput.F_MouseKeysReleased[i] == which) {
			return true;
		}
	}
	return false;
}

MInput.OnMouseMove = function(event) {
	MInput.MouseX = event.pageX;
	MInput.MouseY = event.pageY;
	// :D
};
