/**
 * Created by Meanzie on 03.12.2015.
 */

function AddTitle(p) {
    var text = SceneManager.Add(p, new Platformer.UIText("Inside the Mainframe", "48px Arial", "#ff0000",
        v3z()));
    text.SetPosition(0, Platformer.Camera.top - (text.GetHeight() / 2));
}

function OrthoCamera() {
    // Switch camera
    Platformer.Camera.toOrthographic2(-Platformer.Width / 2, Platformer.Width / 2, Platformer.Height / 2,
        -Platformer.Height / 2);
    Platformer.Camera.toFrontView();
}

Platformer.LostMenu = function(deathMessage) {
    THREE.Object3D.call(this);

    this.OnStart = function() {
        OrthoCamera();
        AddTitle(this);
        var lostMenu = this;
        SceneManager.Add(lostMenu, new Platformer.UIText(deathMessage, "24px Arial", "#ff0000", v3z(
            0.0, -10.0)));
        lostMenu.toMainMenu = SceneManager.Add(lostMenu, new Platformer.UIButton("OK :(", v2(0, -50), function() {
            SceneManager.ClearLevel();
            SceneManager.Add(new Platformer.MainMenu(false));
        }));
    };

};
Platformer.LostMenu.prototype = Object.create(THREE.Object3D.prototype);
Platformer.LostMenu.constructor = Platformer.LostMenu;

Platformer.MainMenu = function(inPauseMode) {
    THREE.Object3D.call(this);
    // Base is THREE.Object3D
    this.Menu = "main";
    this.InPauseMode = inPauseMode;
    this.Clear = function() {
        for (var i = 0; i < this.children.length; i++) {
            SceneManager.Remove(this.children[i]);
        }
    };

    this.DisplayHelp = function() {
        var mainMenu = this;

        AddTitle(mainMenu);

        SceneManager.Add(mainMenu, new Platformer.UIText("I dette spillet må du nå slutten ved å ", "24px Arial", "#ff0000", v2(0.0, 80.0)));
        SceneManager.Add(mainMenu, new Platformer.UIText("overkomme forskjellige hinder før tiden renner ut", "24px Arial", "#ff0000", v2(0.0, 50.0)));

        this.startButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Back", v2(0, -50), function() {
            mainMenu.Clear();
            mainMenu.DisplayMainMenu();
        }));
    };

    this.DisplaySettings = function() {
        var mainMenu = this;

        AddTitle(mainMenu);

        SceneManager.Add(mainMenu, new Platformer.UIText("Particle Amount (" + Platformer.Settings.ParticleAmount + ")", "24px Arial", "#ff0000", v2(
            0.0, 100.0
        )));

        SceneManager.Add(mainMenu, new Platformer.UIButton(Platformer.Settings.ParticleAmount == PARTICLE_AMOUNT_LOW ? "<Low>" : "Low", v2(-260, 60), function() {
            mainMenu.Clear();
            Platformer.Settings.ParticleAmount = PARTICLE_AMOUNT_LOW;
            mainMenu.DisplaySettings();
        }));

        SceneManager.Add(mainMenu, new Platformer.UIButton(Platformer.Settings.ParticleAmount == PARTICLE_AMOUNT_MEDIUM ? "<Medium>" : "Medium", v2(-130, 60), function() {
            mainMenu.Clear();
            Platformer.Settings.ParticleAmount = PARTICLE_AMOUNT_MEDIUM;
            mainMenu.DisplaySettings();
        }));

        SceneManager.Add(mainMenu, new Platformer.UIButton(Platformer.Settings.ParticleAmount == PARTICLE_AMOUNT_HIGH ? "<High>" : "High", v2(10, 60), function() {
            mainMenu.Clear();
            Platformer.Settings.ParticleAmount = PARTICLE_AMOUNT_HIGH;
            mainMenu.DisplaySettings();
        }));

        SceneManager.Add(mainMenu, new Platformer.UIButton(Platformer.Settings.ParticleAmount == PARTICLE_AMOUNT_ULTRA ? "<Ultra>" : "Ultra", v2(120, 60), function() {
            mainMenu.Clear();
            Platformer.Settings.ParticleAmount = PARTICLE_AMOUNT_ULTRA;
            mainMenu.DisplaySettings();
        }));

        SceneManager.Add(mainMenu, new Platformer.UIButton(Platformer.Settings.ParticleAmount == PARTICLE_AMOUNT_INSANE ? "<Insane>" : "Insane", v2(240, 60), function() {
            mainMenu.Clear();
            Platformer.Settings.ParticleAmount = PARTICLE_AMOUNT_INSANE;
            mainMenu.DisplaySettings();
        }));

        SceneManager.Add(mainMenu, new Platformer.UIButton("Back", v2(0, -100), function() {
            mainMenu.Clear();
            mainMenu.DisplayMainMenu();
        }));
    };

    this.DisplayLevelMenu = function() {

        var mainMenu = this;

        AddTitle(mainMenu);

        var levels = [ "level1.json", "level2.json", "level3.json", "leveltest.json", "test.json", "test1.json" ];

        for (var i = 0; i < levels.length; i++) {
            var that = SceneManager.Add(mainMenu, new Platformer.UIButton(levels[i], v2(0, 100 - (i * 50)), function() {

                mainMenu.Clear();
                SceneManager.Remove(mainMenu);
                // Fix camera
                Platformer.Camera.toPerspective();

                Platformer.StartLevel(this.level);
                Platformer.LockCursor();
            }));
            that.level = levels[i];
        }

        SceneManager.Add(mainMenu, new Platformer.UIButton("Back", v2(0, 100 - (levels.length * 50) - 20), function() {
            mainMenu.Clear();
            mainMenu.DisplayMainMenu();
        }));
    };

    this.DisplayMainMenu = function() {

        var mainMenu = this;
        AddTitle(mainMenu);

        if(this.InPauseMode) {
            this.resumeButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Resume", v2(0, 60), function() {
                mainMenu.Clear();
                SceneManager.Remove(mainMenu);
                // Fix camera
                Platformer.Camera.toPerspective();
                Platformer.IsPlaying = true;
                SceneManager.ShowLevel();
                Platformer.LockCursor();
            }));
        } else {
            this.startButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Start", v2(0, 60), function() {

                // Remove everything from zhe scene
                // alert("You clicked buttan");
                mainMenu.Clear();

                mainMenu.DisplayLevelMenu();
            }));
        }

        this.settingsButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Innstillinger", v2(0, 0), function() {
            mainMenu.Clear();
            mainMenu.DisplaySettings();
        }));
        this.helpButton = SceneManager.Add(mainMenu, new Platformer.UIButton("Hjelp", v2(0, -60), function() {
            mainMenu.Clear();
            mainMenu.DisplayHelp();
        }));

    };

    this.OnStart = function() {
        // Switch camera
        OrthoCamera();

        this.DisplayMainMenu();
    };

    this.onUpdate = function() {
        // set camera to ortho
    };

};
Platformer.MainMenu.prototype = Object.create(THREE.Object3D.prototype);
Platformer.MainMenu.constructor = Platformer.MainMenu;

Platformer.UIText = function(text, font, color, inPosition) {
    this.Text = text;
    this.Font = font;
    this.Color = color;
    this.TextTexture = new THREE.Texture(null);
    // Create text thing
    Util.DrawTextToTexture(text, font, color, this.TextTexture);
    this.Geometry = new THREE.PlaneGeometry(this.TextTexture.image.width, this.TextTexture.image.height, 1, 1);
    this.Material = new THREE.MeshBasicMaterial({
        color : 0xffffff,
        map : this.TextTexture,
        transparent : true
    });
    THREE.Mesh.call(this, this.Geometry, this.Material);
    if(inPosition instanceof THREE.Vector2) {
        this.position.copy(v3(inPosition.x, inPosition.y, 0.0));
    } else if(inPosition instanceof THREE.Vector3) {
        this.position.copy(inPosition);
    }
    this.SetText = function(text, font, color) {
        this.Text = text;
        this.Font = font;
        this.Color = color;
        Util.DrawTextToTexture(text, font, color, this.TextTexture);
    };
    this.GetWidth = function() {
        return Util.GetTextWidth(this.Text, this.Font);
    };
    this.GetHeight = function() {
        return this.TextTexture.image.height; //5 is to offset
    };
    this.SetPosition = function(x, y) {
        var v = v3(x, y, 0);
        this.position.copy(v);
    }
};
Platformer.UIText.prototype = Object.create(THREE.Mesh.prototype);
Platformer.UIText.constructor = Platformer.UIText;

Platformer.UIButton = function(text, position, onClick) {
    var normalColor = "#ff0000";
    var hoverColor = "#00ff00";
    Platformer.UIText.call(this, text, "36px Arial", normalColor, v3(position.x, position.y, 0.0));
    this.SetPosition(position.x, position.y);
    this.IsHovering = false;
    this.onClick = onClick;
    this.onUpdate = function(delta) {
        // console.log("" + Platformer.MouseX + " / " + Platformer.MouseY + " --
        // " + this.width + " / " + this.height);
        // Get mouse coordinates
        var posX = this.position.x + 5;
        var posY = this.position.y;
        if (Platformer.MouseX >= (posX - (this.GetWidth() / 2))
            && Platformer.MouseX <= (posX + (this.GetWidth() / 2))
            && Platformer.MouseY >= (-posY - (this.GetHeight() / 2))
            && Platformer.MouseY <= (-posY + (this.GetHeight() / 2))) {
            if (!this.IsHovering) {
                this.SetText(this.Text, this.Font, hoverColor);
                this.IsHovering = true;
            }
            if (Input.IsMouseKeyReleased(0)) {
                this.onClick();
            }
        } else {
            if (this.IsHovering) {
                this.SetText(this.Text, this.Font, normalColor);
                this.IsHovering = false;
            }
        }
    };
};
Platformer.UIButton.prototype = Object.create(Platformer.UIText.prototype);
