var Geometry = {};

Geometry.StaticBox = function(pos, dim, material) {
	var tb = new Physijs.BoxMesh(new THREE.BoxGeometry(dim.x, dim.y, dim.z), material, 0);
	Geometry.FancyRotationFunction(tb.geometry, v3(1, 1, 1));
	//Geometry.UVRelativeToVertices(tb.geometry, v3(1, 1, 1));
	tb.position.x = pos.x;
	tb.position.y = pos.y;
	tb.position.z = pos.z;
	return tb;
};

Geometry.StaticBoxMass = function(pos, dim, material, mass) {
	var tb = new Physijs.BoxMesh(new THREE.BoxGeometry(dim.x, dim.y, dim.z), material, mass);
	tb.position.x = pos.x;
	tb.position.y = pos.y;
	tb.position.z = pos.z;

	return tb;
};

Geometry.DebugBox = function(pos, dim, clr) {
	var _clr;
	if (clr === undefined) {
		_clr = 0xff0000;
	} else {
		_clr = clr;
	}
	var mesh = new THREE.Mesh(new THREE.CubeGeometry(dim.x, dim.y, dim.z), new THREE.MeshBasicMaterial({
		color : _clr
	}));
	mesh.position.x = pos.x;
	mesh.position.y = pos.y;
	mesh.position.z = pos.z;
	return mesh;
};

function clone(obj) {
	if (null == obj || "object" != typeof obj)
		return obj;
	var copy = obj.constructor();
	for ( var attr in obj) {
		if (obj.hasOwnProperty(attr))
			copy[attr] = obj[attr];
	}
	return copy;
}

/**
 * Changes the UV coordinates to match the distances between the vertices. Also
 * compensates for scaling
 * 
 * @param geometry -
 *            The geometry to be changed
 * @param {THREE.Vector3}
 *            scaleVector - The scaling that is put on the geometry. Must be
 *            uniform
 */

THREE.Vector2.prototype.toString = function() {

	return "Vector2[" + this.x + ", " + this.y + "]";

};

THREE.Vector3.prototype.toString = function() {

	return "Vector3[" + this.x + ", " + this.y + ", " + this.z + "]";

};

Geometry.FancyRotationFunction = function(geometry, scaleVector)
{
	
	var UVs = geometry.faceVertexUvs[0];
	var vertices = geometry.vertices;
	var faces = geometry.faces;
	// Assume uniform scaling?
	var scale = (scaleVector.x == scaleVector.y == scaleVector.z) ? scaleVector.x : 1;
	for (var faceIndex = 0; faceIndex < UVs.length; faceIndex++) {
		var a = vertices[faces[faceIndex].a];
		var b = vertices[faces[faceIndex].b];
		var c = vertices[faces[faceIndex].c];
		
		//
		var ab = v3z().subVectors(b, a);
		var ac = v3z().subVectors(c, a);
		var faceNormal = v3z().crossVectors(ab, ac).normalize();
		
		//
		var zAxis = v3(0, 0, 1);
		var angle = faceNormal.angleTo(zAxis);
		var axis = v3z().crossVectors(faceNormal, zAxis).normalize();
		//faceNormal.applyAxisAngle(axis, angle);
		
		var euler = new THREE.Euler(
				axis.x * angle,
				axis.y * angle,
				axis.z * angle,
				"XYZ"
		);
		var newa = v3z().copy(a).applyEuler(euler);
		var newb = v3z().copy(b).applyEuler(euler);
		var newc = v3z().copy(c).applyEuler(euler);
		
		//
		var ab2 = v3z().subVectors(newb, newa);
		var ac2 = v3z().subVectors(newc, newa);
		var faceNormal2 = v3z().crossVectors(ab2, ac2).normalize();
		
		//
		//console.log("n0: " + faceNormal + " n1: " + faceNormal2);
		//console.log("v0: " + a + " v1: " + b + " v2: " + c);
		//console.log("v0: " + newa + " v1: " + newb + " v2: " + newc);
		
		
		//Transform to origo
		var minX = 100000, minY = 100000;
		
		if(newa.x < minX) {
			minX = newa.x;
		}
		if(newb.x < minX) {
			minX = newb.x;
		}
		if(newc.x < minX) {
			minX = newc.x;
		}
		if(newa.y < minY) {
			minY = newa.y;
		}
		if(newb.y < minY) {
			minY = newb.y;
		}
		if(newc.y < minY) {
			minY = newc.y;
		}
		
		//Transform to origo 0, 0
		var ta = v2(newa.x - minX, newa.y - minY);
		var tb = v2(newb.x - minX, newb.y - minY);
		var tc = v2(newc.x - minX, newc.y - minY);
		
		//a
		UVs[faceIndex][0].set(ta.x, ta.y);
		
		//b
		UVs[faceIndex][1].set(tb.x, tb.y);
	
		//c
		UVs[faceIndex][2].set(tc.x, tc.y);
		
		//console.log("------------------------------------------");
		
	}
	
};

Geometry.UVRelativeToVertices = function(geometry, scaleVector) {
	var UVs = geometry.faceVertexUvs[0];
	var vertices = geometry.vertices;
	var faces = geometry.faces;
	// Assume uniform scaling?
	var scale = (scaleVector.x == scaleVector.y == scaleVector.z) ? scaleVector.x : 1;
	for (var faceIndex = 0; faceIndex < UVs.length; faceIndex++) {
		var a = vertices[faces[faceIndex].a];
		var b = vertices[faces[faceIndex].b];
		var c = vertices[faces[faceIndex].c];
		var abl = distBetween(a, b);
		var bcl = distBetween(b, c);
		var cal = distBetween(c, a);
		
		//console.log("fuv0: " + a + " fuv1: " + b + " c:" + c);
		//console.log("abl: " + abl + " bcl: " + bcl + " cal: " + cal);

		UVs[faceIndex][0].multiplyScalar(abl * scale);
		UVs[faceIndex][1].multiplyScalar(bcl * scale);
		UVs[faceIndex][2].multiplyScalar(cal * scale);
	}
	geometry.uvsNeedUpdate = true;
	function distBetween(v1, v2) {
		var v = v3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
		return v.length();
	}
};
