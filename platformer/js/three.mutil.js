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