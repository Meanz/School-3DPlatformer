/**
 * Created by Meanzie on 04.12.2015.
 */

var ResourceWaitCount = 0;
var ResourceCompleteFn = null;
var ResourceLock = true;
var ResourceWaitSounds = [];

function ResourceLog(msg) {
    $("#hud-loading-msg").append(msg + "<br />");
    console.log(msg);
}

function OnResourceLoaded(name) {
    ResourceWaitCount--;
    ResourceLog("Resource " + name + " loaded.");
}

function WaitForResource() {
    ResourceWaitCount++;
}

function LoadAudio(fn) {
    var audio = new THREE.Audio(Platformer.audioListener);
    audio.load(fn);
    ResourceWaitSounds.push(audio);
    return audio;
}

function LoadStaticAudio(fn) {
    var audio = LoadAudio(fn);
    audio.name = fn;
    audio.position.z = -1;
    return audio;
}

function WaitForResources() {
    var donzo = true;
    if(ResourceWaitSounds.length > 0) {
        var toRemove = [];
        for(var i=0; i < ResourceWaitSounds.length; i++) {
            if(ResourceWaitSounds[i].IsLoaded()) {
                ResourceLog("Resource " + ResourceWaitSounds[i].name + " loaded.");
                toRemove.push(ResourceWaitSounds[i]);
            }
        }
        for(var i=0; i < toRemove.length; i++) {
            ResourceWaitSounds.splice(ResourceWaitSounds.indexOf(toRemove[i]), 1);
        }
        donzo = false;
    } else {
        if(ResourceWaitCount != 0) {
            //We are donzo
            donzo = false;
        }
    }
    if(!donzo) {
        requestAnimationFrame(WaitForResources);
    } else {
        $("#hud-loading").fadeOut();
        ResourceCompleteFn();
    }
}

function LoadResources(fn)
{
    ResourceCompleteFn = fn;
    $("#hud-loading").fadeIn();

    //Load all resources

    //SysLogPond
    var file = "data/syslog.txt";
    WaitForResource();
    $.get(file,function(txt, status){
        Platformer.SysLogPond = txt.split("\n");
        OnResourceLoaded("SysLog.txt");
    });

    //Plywood
    WaitForResource();
    Platformer.textureLoader.load("images/plywood.jpg", function(texture) {
        Platformer.Textures.Plywood = texture;
        OnResourceLoaded("images/plywood.jpg");
    });

    //FloppyDisk
    WaitForResource();
    Platformer.textureLoader.load("images/floppydiskTex.png", function(texture) {
        Platformer.Textures.FloppyDisk = texture;
        OnResourceLoaded("images/floppydiskTex.png");
    });

    //
    WaitForResource();
    Platformer.textureLoader.load("images/jumppadTex.png", function(texture) {
        Platformer.Textures.JumpPad = texture;
        OnResourceLoaded("images/jumppadTex.png");
    });

    //Scanner Audio
    Platformer.Audio.Scanner = LoadAudio("sounds/160421__bigkahuna360__electrical-shock-zap.wav");

    //Intro Audio
    Platformer.Audio.Intro = LoadStaticAudio("sounds/cyborgEinstain.mp3");

    //End Audio
    Platformer.Audio.End = LoadStaticAudio("sounds/cyborgEinstainEnd.mp3");

    //Death Audio
    Platformer.Audio.Death = LoadStaticAudio("sounds/death.mp3");

    //Jump Audio
    Platformer.Audio.Jump = LoadStaticAudio("sounds/jump.mp3");

    //JumpPad Audio
    Platformer.Audio.JumpPad = LoadStaticAudio("sounds/jumppad.mp3");

    //CyberWind
    Platformer.Audio.CyberWind = LoadStaticAudio("sounds/92029__urupin__digital-wind.mp3");

    //Menu loop
    Platformer.Audio.MenuLoop = LoadStaticAudio("sounds/329130__dodgyloops__digitaltribal-dodgyloops-dodgy-c.wav");

    //Floppy
    Platformer.Audio.Floppy = LoadStaticAudio("sounds/4761__jovica__ppg-006-digital-mallet-g-2.wav");

    //Unlock
    requestAnimationFrame(WaitForResources);
};