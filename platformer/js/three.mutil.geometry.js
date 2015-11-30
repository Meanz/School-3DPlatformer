
var Geometry = {};

Geometry.StaticBox = function(pos, dim, material) {
	var tb = new Physijs.BoxMesh(new THREE.BoxGeometry(dim.x, dim.y, dim.z), material, 0);
	Geometry.UVRelativeToVertices(tb.geometry, v3(1, 1, 1));
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
	var mesh = new THREE.Mesh(new THREE.CubeGeometry(dim.x, dim.y, dim.z),
			new THREE.MeshBasicMaterial({
				color : _clr
			}));
	mesh.position.x = pos.x;
	mesh.position.y = pos.y;
	mesh.position.z = pos.z;
	return mesh;
};

/**
 * Changes the UV coordinates to match the distances between the vertices.
 * Also compensates for scaling
 * @param geometry - The geometry to be changed
 * @param {THREE.Vector3} scaleVector - The scaling that is put on the geometry. Must be uniform
 */
Geometry.UVRelativeToVertices = function(geometry, scaleVector){
	var UVs = geometry.faceVertexUvs[0];
	var vertices = geometry.vertices;
	var faces = geometry.faces;
	var scale = (scaleVector.x == scaleVector.y == scaleVector.z)?scaleVector.x:1;
	for(var i = 0; i < UVs.length; i++){
		var a = vertices[faces[i].a];
		var b = vertices[faces[i].b];
		var c = vertices[faces[i].c];
		var abl = foo(a, b);
		var bcl = foo(b, c);
		var cal = foo(c, a);

		UVs[i][0].multiplyScalar(abl * scale);
		UVs[i][1].multiplyScalar(bcl * scale);
		UVs[i][2].multiplyScalar(cal * scale);
	}
	geometry.uvsNeedUpdate = true;

	function foo(v1, v2){
		var v = v3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
		return v.length();
	}
};



