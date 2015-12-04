Platformer.AddSymbolParticleCloud = function(){
    var geom = new THREE.Geometry();

    var material = new THREE.PointCloudMaterial({
        size : 0.5,
        transparent : true,
        opacity : 0.5,
        //map : Platformer.GetSymbolCloudTexture(),
        color: 0x00ff00
    });

    var range = 200;
    for (var i = 0; i < 50000; i++) {
        var particle = new THREE.Vector3(Math.random() * range - range / 2,
            Math.random() * range - range / 2, Math.random() * range
            - range / 2);
        geom.vertices.push(particle);
    }

    var cloud = new THREE.PointCloud(geom, material);
    cloud.sortParticles = true;
    cloud.onRender = function(){
        if(cloud.position.distanceTo(Platformer.Player.position) > 25);
    };
    SceneManager.Add(cloud);

};

Platformer.GetSymbolCloudTexture = function(){
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    var ctx = canvas.getContext('2d');
    ctx.font = "48px matrixcode";
    ctx.fillStyle = "#00aa00";
    ctx.fillText('A', canvas.width, canvas.height); // Fylt rektangel
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
};
