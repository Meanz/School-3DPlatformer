// FWD DECL
var Vector2 = THREE.Vector2;
var Vector3 = THREE.Vector3;
var Vector4 = THREE.Vector4;
var Matrix4 = THREE.Matrix4;

THREE.Matrix4.prototype.getPosition = function() {
	return v3(this.elements[12], this.elements[13], this.elements[14]);
};

/**
 * 
 * @param angle
 * @returns
 */
function createYawMatrix(angle) {
	var mat = m4id();
	mat.makeRotationY(angle);
	return mat;
}

/**
 * Construct a Vector2
 * 
 * @param x
 * @param y
 * @returns {Vector2}
 */
function v2(x, y) {
	return new Vector2(x, y);
}

/**
 * Construct a Zero Vector2
 * 
 * @returns {Vector2}
 */
function v2z() {
	return new Vector2(0, 0);
}

/**
 * Construct a Vector3
 * 
 * @param x
 * @param y
 * @param z
 * @returns {Vector3}
 */
function v3(x, y, z) {
	return new Vector3(x, y, z);
}

/**
 * Construct a Zero Vector3
 * 
 * @returns {Vector3}
 */
function v3z() {
	return new Vector3(0, 0, 0);
}

/**
 * Return a Matrix4 in identity form
 * 
 * @returns {Matrix4}
 */
function m4id() {
	var m4 = new Matrix4();
	m4.identity();
	return m4;
}

/**
 * 
 * @param l
 * @param r
 * @returns {Matrix4}
 */
function mMul(l, r) {
	var tmp = new Matrix4();
	tmp.copy(l);
	tmp.multiply(r);
	return tmp;
}

/**
 * Get the global matrix of the given object
 * 
 * @param obj
 * @returns {Matrix4}
 */
function getGlobal(obj) {
	var result = new Matrix4();
	result.identity();

	// We need to iterate recursively back in the tree

	var list = [];
	var it = obj;
	while (it != undefined) {
		list.push(it);
		it = it.parent;
	}

	// Iterate backwards
	for (var i = list.length - 1; i >= 0; i--) {

		list[i].updateMatrix();

		var tmp = new Matrix4();
		tmp.copy(list[i].matrix);

		result.multiply(tmp);
	}

	return result;
}

THREE.Object3D.prototype.getGlobal = getGlobal;

/**
 * Apply matrix of parent to obj obj.local = parent.world * obj.local
 * 
 * @param parent
 * @param obj
 */
function applyParent(parent, obj) {
	var result = getGlobal(parent);

	// Update the matrix
	obj.updateMatrix();
	var tmp = new Matrix4();
	tmp.copy(obj.matrix);

	// Reset the matrix
	var identityMatrix = new Matrix4();
	identityMatrix.identity();
	obj.applyMatrix(identityMatrix);

	// Last multiplication
	result.multiply(tmp);

	obj.applyMatrix(result);
}

/**
 */
var Util = {};

// Returns a texture
Util.NearestPowerOfTwo = function(val) {
	// 125 -> 256
	var tmp = 1;
	while (tmp < val) {
		tmp *= 2;
	}
	return tmp;
};

Util.GetTextWidth = function(text, font)
{
	// Check size
	var ctx = Platformer.Canvas.getContext("2d");
	ctx.font = font;
	var txtWidth = Math.ceil(ctx.measureText(text).width);
	return txtWidth;
};

Util.GetTextHeight = function(text, font)
{
	// Check size
	var ctx = Platformer.Canvas.getContext("2d");
	ctx.font = font;
	var txtHeight = Math.ceil(ctx.measureText("M").width);
	return txtHeight;
};

Util.DrawSysLog = function(lines, texture) {

	var maxLines = 20;
	var fontSize = "48px";
	var fontType = "arial";
	var color = "#00aa00";
	var font = fontSize + " " + fontType;
	var lineHeight = Util.GetTextHeight("", font);

	// Create new canvas
	var cnv = document.createElement("canvas");
	cnv.width = Util.NearestPowerOfTwo(maxLines * lineHeight);
	cnv.height = Util.NearestPowerOfTwo(maxLines * lineHeight);
	var ctx = cnv.getContext("2d");
	ctx.font = font;

	console.log("w: " + cnv.width);

	ctx.beginPath();

	//ctx.fillStyle = "#ffffff";
	//ctx.fillRect(0, 0, cnv.width, cnv.height);
	ctx.stroke();
	ctx.fillStyle = color;
	for(var i=0; i < lines.length; i++) {
		ctx.fillText(lines[i], 10, (i + 1) * lineHeight);
		console.log("drawing: "  + lines[i] + " at: " + (lineHeight * i));
	}
	ctx.stroke();
	ctx.closePath();

	texture.image = cnv;
	texture.needsUpdate = true;
	return texture;
};

Util.DrawTextToTexture = function(text, font, color, texture) {
	// Check size
	var txtWidth = Util.GetTextWidth(text, font);
	var txtHeight = Util.GetTextHeight(text, font);

	// Create new canvas
	var cnv = document.createElement("canvas");
	cnv.width = Util.NearestPowerOfTwo(txtWidth + 2);
	cnv.height = Util.NearestPowerOfTwo(txtHeight + 2);
	var ctx = cnv.getContext("2d");
	ctx.font = font;

	ctx.beginPath();

	//ctx.fillStyle = "#ffffff";
	//ctx.fillRect(0, 0, cnv.width, cnv.height);
	ctx.stroke();
	ctx.fillStyle = color;
	ctx.fillText(text, (cnv.width - txtWidth) / 2, txtHeight + (cnv.height - txtHeight) / 2);
	ctx.stroke();
	ctx.closePath();

	texture.image = cnv;
	texture.needsUpdate = true;
	return texture;
};
