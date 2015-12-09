/**
 * Adds the symbol particle clouds to the game
 */
Platformer.AddSymbolParticleCloud = function(){

    SceneManager.Add(Platformer.GetSymbolCloud('1', 200, Platformer.Settings.ParticleAmount/3));
    SceneManager.Add(Platformer.GetSymbolCloud('0', 200, Platformer.Settings.ParticleAmount/3));
    SceneManager.Add(Platformer.GetSymbolCloud('¤', 200, Platformer.Settings.ParticleAmount/3));

};

/**
 * Creates a Symbol cloud using the given parameters
 * @param symbol The character that the symbol cloud will consist of
 * @param range The extents of the symbol cloud ( real value )
 * @param amount The number of particles in the cloud ( integer value )
 * @returns {THREE.Points} The Point Cloud object
 */
Platformer.GetSymbolCloud = function(symbol, range, amount){
    var geom = new THREE.Geometry();
    var material = new THREE.PointsMaterial({
        size : 0.3,
        transparent : true,
        opacity : 0.5,
        map : Platformer.GetSymbolCloudTexture(symbol),
        blending: THREE.AdditiveBlending,
        color: 0x00ff00

    });

    for (var i = 0; i < amount; i++) {
        var particle = new THREE.Vector3(Math.random() * range - range / 2,
            Math.random() * range - range / 2, Math.random() * range
            - range / 2);
        geom.vertices.push(particle);
    }

    var cloud = new THREE.Points(geom, material);
    cloud.sortParticles = true;
    cloud.onRender = function(){
        if(cloud.position.distanceTo(Platformer.Player.position) > range/2-20){
            cloud.position.copy(Platformer.Player.position);
        }

    };
    cloud.name = "cloud";
    return cloud;
};

/**
 * Constructs the texture for the Symbol Cloud
 * @param symbol
 * @returns {THREE.Texture}
 */
Platformer.GetSymbolCloudTexture = function(symbol){
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    var ctx = canvas.getContext('2d');

    //Clear background rect
    ctx.beginPath();

    //ctx.fillStyle = "#ffffff";
    //ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.stroke();

    ctx.font = "48px matrixcode";
    ctx.fillStyle = "#00aa00";
    ctx.fillText(symbol, 0, canvas.height); // Fylt rektangelms

    ctx.closePath();

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
};
