/**
 * Created by Meanzie on 04.12.2015.
 */

var ResourceWaitCount = 0;
var ResourceCompleteFn = null;
var ResourceLock = true;

function ResourceLog(msg) {
    $("hud-loading-msg").append(msg + "<br />");
}

function OnResourceLoaded(name) {
    ResourceWaitCount--;
    ResourceLog("Resource " + name + " loaded.");
    if(ResourceWaitCount == 0 && ResourceLock == false) {
        if(ResourceCompleteFn != null) {
            ResourceCompleteFn();
        } else {
            ResourceLog("No resource complete function.");
        }
    }
}

function WaitForResource() {
    ResourceWaitCount++;
}

function LoadAudio(fn) {
    var audio = new THREE.Audio(Platformer.audioListener);
    audio.load(fn);
    return audio;
}

function LoadStaticAudio(fn) {
    var audio = LoadAudio(fn);
    audio.position.z = -1;
    return audio;
}

function LoadResources(fn)
{
    ResourceCompleteFn = fn;
    $("hud-loading").show();

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

    //Unlock
    ResourceLock = false;
    if(ResourceWaitCount == 0) {
        if(ResourceCompleteFn != null) {
            ResourceCompleteFn();
        } else {
            ResourceLog("No resource complete function.");
        }
    }
};