//DIIEEEEEEEEEEEEEEEEEEEEEEEEEEEE

var _sphere = function(pos, radius) {
	this.position = pos;
	this.radius = radius;

	this.derive = function(offset) {
		return new _sphere(v3(this.position.x + offset.x, this.position.y
				+ offset.y, this.position.z + offset.z), radius);
	};
};

function _test_sphere_sphere(sphere1, sphere2) {
	// Distance between points
	var dist = sphere1.position.distanceTo(sphere2.position);
	return dist <= (sphere1.radius + sphere2.radius);
};

function _test_point_sphere(point, sphere) {
	var dist = point.distanceTo(sphere.position);
	return dist <= sphere.radius;
}

var _aabb = function(min, max) {
	this.min = min;
	this.max = max;

	this.derive = function(offset) {
		return new _aabb(v3(this.min.x + offset.x, this.min.y + offset.y,
				this.min.z + offset.z), v3(this.max.x + offset.x, this.max.y
				+ offset.y, this.max.z + offset.z));
	};

	this.closestPoint = function(point) {
		return v3((point.x < this.min.x) ? this.min.x
				: ((point.x > this.max.x) ? this.max.x : point.x),
				(point.y < this.min.y) ? this.min.y
						: ((point.y > this.max.y) ? this.max.y : point.y),
				(point.z < this.min.z) ? this.min.z
						: ((point.z > this.max.z) ? this.max.z : point.z));
	};
}

function _test_point_aabb(point, aabb) {
	if (point.x >= aabb.min.x && point.x <= aabb.max.x && point.y >= aabb.min.y
			&& point.y <= aabb.max.y && point.z >= aabb.min.z
			&& point.z <= aabb.max.z) {
		return true;
	} else {
		return false;
	}
}

function _test_sphere_aab(sphere, aabb) {
	var result = false;
	if (!_test_point_aabb(sphere.position, aabb)) {
		
	} else {
		result = true;
	}
	return result;
}