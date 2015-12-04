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
    Platformer.Audio.Scanner = new THREE.Audio(Platformer.audioListener);
    Platformer.Audio.Scanner.load("sounds/160421__bigkahuna360__electrical-shock-zap.wav");

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