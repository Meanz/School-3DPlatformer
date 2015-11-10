
var Geometry = {};

Geometry.StaticBox = function(pos, dim, material) {
	var tb = new Physijs.BoxMesh(new THREE.BoxGeometry(dim.x, dim.y, dim.z), material, 0);
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