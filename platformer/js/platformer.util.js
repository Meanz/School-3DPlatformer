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

Util.GetTextHeight = function(font)
{
	// Check size
	var ctx = Platformer.Canvas.getContext("2d");
	ctx.font = font;
	var txtHeight = Math.ceil(ctx.measureText("M").width);
	return txtHeight;
};

Util.DrawMatrixTexture = function(clrx, clry, clrz, delta) {
	var x, y;
	// Do some fancy magic
	var ctx = Platformer.Canvas.getContext("2d");
	// Make some data
	var blockX = 0;
	var blockY = 0;
	var w = 512;
	var h = 512;
	/*
	 * for (x = 0; x < w; x++) { for (y = 0; y < h; y++) { blockX = Math.floor(x /
	 * 32); blockY = Math.floor(y / 32);
	 *
	 * //var r = 255; var r = clrx; var g = clry; var b = clrz;
	 *
	 * if (blockY % 2 == 0) { if (blockX % 2 == 0) { r = 0; b = 0; } } else if
	 * (blockY % 2 == 1) { if (blockX % 2 == 1) { r = 0; b = 0; } }
	 *
	 * var idx = (x + (y * w)) * 4; imgd.data[idx] = r; imgd.data[idx + 1] = g;
	 * imgd.data[idx + 2] = b; imgd.data[idx + 3] = 255; } }
	 * ctx.putImageData(imgd, 0, 0);
	 */

	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, w, h);
	ctx.font = "48px matrixcode";
	ctx.fillStyle = "#00aa00";

	var txtwidth = Math.ceil(ctx.measureText("9").width);
	var txtheight = Math.ceil(ctx.measureText("M").width);

	var elems = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
		'u', 'v', 'w', 'x', 'y', 'z' ];

	for (var i = 0; i < Math.floor(w / txtwidth) + 1; i++) {
		for (var j = 0; j < Math.ceil(h / txtheight) + 1; j++) {
			// var ran = Math.floor(Math.random() * 2);
			// var ran = Math.round((noise.simplex2(i, j - delta) + 1) / 2);
			var ran = Math.round(((noise.simplex2(i, j - delta) + 1) / 2) * elems.length);
			// 0.111
			// -1, 1
			// +1
			// 0, 2

			ctx.fillText("" + elems[ran], i * txtwidth, j * txtheight);
		}
	}

	ctx.lineWidth = 5;
	ctx.strokeStyle = "#ff0000";
	ctx.beginPath();

	ctx.moveTo(0, 0);
	ctx.lineTo(0, h);
	ctx.lineTo(w, h);

	ctx.stroke();
	ctx.closePath();

	Platformer.Texture.needsUpdate = true;
	return Platformer.Texture;
};

Util.DrawSysLog = function(lines, texture) {
	var maxLines = 29;
	var fontSize = "bold 48px";
	var fontType = "courier new";
	var color = "#00aa00";
	var font = fontSize + " " + fontType;
	var lineHeight = Util.GetTextHeight("", font) + 4;
	// Create new canvas
	var cnv = document.createElement("canvas");
	cnv.width = Util.NearestPowerOfTwo(maxLines * lineHeight);
	cnv.height = Util.NearestPowerOfTwo(maxLines * lineHeight);
	var ctx = cnv.getContext("2d");
	ctx.font = font;
	ctx.beginPath();
	ctx.fillStyle = "#00aa0066";
	ctx.fillRect(0, 0, cnv.width, cnv.height);
	ctx.stroke();
	ctx.fillStyle = color;
	var offset = 0;
	if(lines.length > maxLines) { //40 - 20 = 20 [20, 40]
		offset = lines.length - maxLines - 1;
	}
	for(var i=0; i < (lines.length > 20 ? 20 : lines.length); i++) {
		var line = lines[i + offset];
		var y = (i + 1) * lineHeight;
		ctx.fillText(line, 10, y);
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
	var txtHeight = Util.GetTextHeight(font);

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
