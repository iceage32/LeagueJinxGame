var Ice = {
    stage: null,
    spritesheet: null,
    animation: null,
    runningAnimation: false,
    KEYS: {
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40,
        CTRL: 17
    },
    KEYHELD: {
        up: false,
        down: false,
        ctrl: false
    },
    bullets: new createjs.Container(),

    init: function(canvas) {
        Ice.stage = new createjs.Stage(canvas);
        Ice.spritesheet = new createjs.SpriteSheet(Ice.characters);
        Ice.animation = new createjs.Sprite(Ice.spritesheet, 'run');
        Ice.animation.gotoAndPlay('stand');
        Ice.animation.x = 0;
        Ice.animation.y= 0;

        Ice.stage.addChild(Ice.animation);
        Ice.stage.addChild(Ice.bullets);
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", Ice.handleTick);

        window.addEventListener('keydown', Ice.handleKeyDown);
        window.addEventListener('keyup', Ice.handleKeyUp);
    },
    handleTick: function(e) {
        if(Ice.KEYHELD.up) {
            Ice.animation.y -= 5;
        }
        if(Ice.KEYHELD.down) {
            Ice.animation.y += 5;
        }
        if(Ice.KEYHELD.ctrl) {
            Ice.shot();
        }

        //fire bullets
        for(var i=0; i<Ice.bullets.children.length; i++) {
            Ice.bullets.children[i].x += 10;
            if(Ice.bullets.children[i].x >= Ice.stage.canvas.width) {
                Ice.bullets.removeChildAt(i);
            }
        }

        document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS());
        Ice.stage.update();
    },
    shot: function() {
        var s = new createjs.Shape();
        s.graphics.beginFill('red').drawCircle(0, 0, 5);
        s.y = Ice.animation.y + 25;
        s.x = Ice.animation.x + 50;
        Ice.bullets.addChild(s);
        Ice.stage.update();
    },
    handleKeyDown: function(e) {
        var keyCode = e.which ? e.which: e.keyCode;
        if(keyCode == Ice.KEYS.DOWN) {
            Ice.KEYHELD.down = true;
            if(!Ice.runningAnimation) {Ice.animation.gotoAndPlay('run');}
            Ice.runningAnimation = true;

        }
        if(keyCode == Ice.KEYS.UP) {
            Ice.KEYHELD.up = true;
            if(!Ice.runningAnimation) {Ice.animation.gotoAndPlay('run'); }
            Ice.runningAnimation = true;
        }
        if(keyCode == Ice.KEYS.CTRL) {
            Ice.KEYHELD.ctrl = true;
            Ice.animation.gotoAndPlay('hit')
            setTimeout(function() {Ice.animation.gotoAndStop((Ice.moving ? 'run':'stand'));}, 500);
        }
    },
    handleKeyUp: function(e) {
        var keyCode = e.which ? e.which: e.keyCode;
        if(keyCode == Ice.KEYS.DOWN || keyCode == Ice.KEYS.UP) {
            if(Ice.runningAnimation) {Ice.runningAnimation = false; Ice.animation.gotoAndPlay('stand');}
        }
        if(keyCode == Ice.KEYS.UP) {
            Ice.KEYHELD.up = false;
        }
        if(keyCode == Ice.KEYS.DOWN) {
            Ice.KEYHELD.down = false;
        }
        if(keyCode == Ice.KEYS.CTRL) {
            Ice.KEYHELD.ctrl = false;
        }
    },
    characters: {
        images: ['Characters.png'],
        frames:[
            [0, 0, 64, 64, 0, 0, 0],
            [64, 0, 64, 64, 0, 0, 0],
            [128, 0, 64, 64, 0, 0, 0],
            [192, 0, 64, 64, 0, 0, 0],
            [256, 0, 64, 64, 0, 0, 0],
            [0, 64, 64, 64, 0, 0, 0],
            [64, 64, 64, 64, 0, 0, 0],
            [128, 64, 64, 64, 0, 0, 0],
            [192, 64, 64, 64, 0, 0, 0],
            [256, 64, 64, 64, 0, 0, 0]
        ],
        animations: {
            stand: {
                frames:[0, 0, 1], speed:0.1, next:true
            },
            run: {
                frames:[2, 3], speed:0.1, next:true
            },
            attack: {
                frames:[4, 5], speed:0.1, next:true
            },
            hit: {
                frames:[6, 7], speed:0.3, next:true
            },
            dead: {
                frames:[8, 9], speed:0.1, next:true
            }
        }
    }
}