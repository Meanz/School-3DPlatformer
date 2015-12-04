Platformer.AddSymbolParticleCloud = function(){
    var geom = new THREE.Geometry();

    var material = new THREE.PointCloudMaterial({
        size : 0.5,
        transparent : true,
        opacity : 0.5,
        map : Platformer.GetSymbolCloudTexture(),
        color: 0x00ff00
    });

    var range = 200;
    for (var i = 0; i < Platformer.Settings.ParticleAmount; i++) {
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

    //Clear background rect
    ctx.beginPath();

    //ctx.fillStyle = "#ffffff";
    //ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.stroke()

    ctx.font = "48px matrixcode";
    ctx.fillStyle = "#00aa00";
    ctx.fillText('A', 0, canvas.height); // Fylt rektangelms

    ctx.closePath();

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
};
