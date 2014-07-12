var Ice = {
    stage: null,
    bg: null,
    spritesheet: null,
    player: null,
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
    bulletTime: 250,
    lastBulletTime: null,
    monsters: new createjs.Container(),
    monsterSpawnTime: 6000,
    monsterLastSpawn: null,
    monsterSpeed: 0.5,

    init: function(canvas) {
        Ice.stage = new createjs.Stage(canvas);
        Ice.spritesheet = new createjs.SpriteSheet(Ice.characters);
        Ice.player = new createjs.Sprite(Ice.spritesheet, 'stand');

        //init and position background
        Ice.bg = new createjs.Bitmap('assets/bg.png');
        Ice.bg.x = Ice.stage.canvas.width - Ice.bg

        Ice.player.x = 0;
        Ice.player.y= 0;

        Ice.stage.addChild(Ice.bg, Ice.player, Ice.bullets, Ice.monsters);
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", Ice.handleTick);

        window.addEventListener('keydown', Ice.handleKeyDown);
        window.addEventListener('keyup', Ice.handleKeyUp);
    },
    handleTick: function(e) {
        if(Ice.KEYHELD.up) {
            Ice.player.y -= 5;
        }
        if(Ice.KEYHELD.down) {
            Ice.player.y += 5;
        }
        if(Ice.KEYHELD.ctrl) {
            if(Ice.lastBulletTime + Ice.bulletTime <= createjs.Ticker.getTime()) {
                Ice.shot();
            }
        }

        var playerBounds = Ice.player.getBounds();
        if(Ice.player.y <= 0) {
            Ice.player.y = 0;
        }
        if(Ice.player.y >= 500 - playerBounds.height) {
            Ice.player.y = 500 - playerBounds.height;
        }

        //do monster thing
        if(Ice.monsterSpawnTime + Ice.monsterLastSpawn <= createjs.Ticker.getTime()) {
            Ice.spawnMonsters();
            Ice.monsterLastSpawn = createjs.Ticker.getTime();
        }

        for(var i = 0; i< Ice.monsters.children.length; i++) {
            var m = Ice.monsters.children[i];
            m.x -= Ice.monsterSpeed;
            if(m.x <= playerBounds.x) {
                Ice.monsters.removeChild(m);
            }

            //check if hit monster
            for(var k=0; k<Ice.bullets.children.length; k++) {
                var b =  Ice.bullets.children[k];
                var pt = b.localToLocal(0, 0, m);
                if(m.hitTest(pt.x, pt.y)) {
                    Ice.bullets.removeChild(b);
                    Ice.monsters.removeChild(m);
                }
            }
        }

        //fire bullets
        for(var i=0; i<Ice.bullets.children.length; i++) {
            var o = Ice.bullets.children[i];
            o.x += 10;
            if(o.x >= Ice.stage.canvas.width) {
                Ice.bullets.removeChild(o);
            }
        }


        document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS());
        Ice.stage.update();
    },
    spawnMonsters: function() {
        var m = new createjs.Shape();
        m.graphics.beginFill('blue').drawRect(0,0, 50, 50);
        m.x = Ice.stage.canvas.width-50;
        m.y = Ice.randomRange(0, 500-50);
        Ice.monsters.addChild(m);
        Ice.stage.update();
    },
    shot: function() {
        var s = new createjs.Shape();
        s.graphics.beginFill('red').drawCircle(0, 0, 5);
        s.y = Ice.player.y + 25;
        s.x = Ice.player.x + 50;
        Ice.bullets.addChild(s);
        Ice.stage.update();
        Ice.lastBulletTime = createjs.Ticker.getTime();
    },
    handleKeyDown: function(e) {
        var keyCode = e.which ? e.which: e.keyCode;
        if(keyCode == Ice.KEYS.DOWN) {
            Ice.KEYHELD.down = true;
            if(!Ice.runningAnimation) {Ice.player.gotoAndPlay('run');}
            Ice.runningAnimation = true;

        }
        if(keyCode == Ice.KEYS.UP) {
            Ice.KEYHELD.up = true;
            if(!Ice.runningAnimation) {Ice.player.gotoAndPlay('run'); }
            Ice.runningAnimation = true;
        }
        if(keyCode == Ice.KEYS.CTRL) {
            Ice.KEYHELD.ctrl = true;
            Ice.player.gotoAndPlay('hit')
            setTimeout(function() {Ice.player.gotoAndPlay(((Ice.KEYHELD.up || Ice.KEYHELD.down) ? 'run':'stand'));}, 500);
        }
    },
    handleKeyUp: function(e) {
        var keyCode = e.which ? e.which: e.keyCode;
        if(keyCode == Ice.KEYS.DOWN || keyCode == Ice.KEYS.UP) {
            if(Ice.runningAnimation) {Ice.runningAnimation = false; Ice.player.gotoAndPlay('stand');}
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
    },
    randomRange: function(min, max) {
        return Math.floor(Math.random() * (max-min+1)) +min;
    }
}