function createBoxMesh(dim)
{
	var geom = new THREE.BoxGeometry(dim.x, dim.y, dim.z);
	/*
	for(var i=0; i < geom.vertices.length; i++)
		{
			var vert = geom.vertices[i];
			var pos = vert;
			geom.vertices[i] = new Vector3(
					pos.x - dim.x / 2, 
					pos.y - dim.y / 2, 
					pos.z - dim.z / 2
			);
		}
	geom.__dirtyVertices = true;
	*/
	
	//geom.translate(dim.x / 2, dim.y / 2, dim.z / 2);
	return geom;
}

function debugBox(pos, dim, clr) {
	var _clr;
	if(clr === undefined) {
		_clr = 0xff0000;
	} else {
		_clr = clr;
	}
	var mesh = new THREE.Mesh( new THREE.CubeGeometry( dim.x, dim.y, dim.z), new THREE.MeshBasicMaterial( { color: _clr } ) );
	mesh.position.x = pos.x;
	mesh.position.y = pos.y;
	mesh.position.z = pos.z;
	return mesh;
}

function staticBox(pos, dim, material) {
	var tb = new Physijs.BoxMesh(createBoxMesh(dim),
			material, 0);
	tb.position.x = pos.x;
	tb.position.y = pos.y;
	tb.position.z = pos.z;

	return tb;
}

function staticBoxMass(pos, dim, material, mass) {
	var tb = new Physijs.BoxMesh(createBoxMesh(dim),
			material, mass);
	tb.position.x = pos.x;
	tb.position.y = pos.y;
	tb.position.z = pos.z;

	return tb;
}