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
    speed: {
        player: 0.6,
        bullet: 1,
        monster: 0.05,
        monsterX: 0.03
    },
    playerInteraction: {
        down: false,
        up: false,
        shot: false
    },
    bullets: new createjs.Container(),
    bulletTime: 200,
    lastBulletTime: null,
    monsters: new createjs.Container(),
    monsterSpawnTime: 2000,
    monsterLastSpawn: null,
    score: 0,

    init: function(canvas) {
        Ice.stage = new createjs.Stage(canvas);
        Ice.stage.snapToPixel = true;
        Ice.stage.snapToPixelEnabled = true;
        Ice.spritesheet = new createjs.SpriteSheet(Ice.characters);
        Ice.player = new createjs.Sprite(Ice.spritesheet, 'stand');

        //init and position background
        Ice.bg = new createjs.Bitmap('assets/bg.png');

        Ice.player.x = 0;
        Ice.player.y= 0;
        //Ice.player.cache(0,0,64,64);

        Ice.stage.addChild(Ice.bg, Ice.player, Ice.bullets, Ice.monsters);
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", Ice.handleTick);

        Ice.GUI.init();
        window.addEventListener('keydown', Ice.handleKeyDown);
        window.addEventListener('keyup', Ice.handleKeyUp);

        //sound
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin]);
        createjs.Sound.registerSound('assets/sound/attack1.wav', 'attack1');
        createjs.Sound.registerSound('assets/sound/attack2.wav', 'attack2');
        createjs.Sound.registerSound('assets/sound/attack3.wav', 'attack3');
        createjs.Sound.registerSound('assets/sound/attack4.wav', 'attack4');
        createjs.Sound.registerSound('assets/sound/teemodie.wav', 'teemodie');

        Ice.stage.enableMouseOver();
        Ice.stage.on("mouseover", function() {
            Ice.stage.addEventListener("stagemousemove", Ice.handleMouseMove);
            Ice.stage.addEventListener("stagemousedown", Ice.handleMouseClick);
            Ice.stage.addEventListener('stagemouseup', Ice.handleMouseClickRelease);
        });
        Ice.stage.on("mouseout", function() {
            Ice.stage.removeEventListener("stagemousemove", Ice.handleMouseMove);
            Ice.stage.removeEventListener("stagemousedown", Ice.handleMouseClick);
            Ice.stage.removeEventListener('statemouseup', Ice.handleMouseClickRelease);
        });
    },
    handleTick: function(e) {
        if(Ice.playerInteraction.up) {
            Ice.player.y -= Ice.speed.player * e.delta;
        }
        if(Ice.playerInteraction.down) {
            Ice.player.y += Ice.speed.player * e.delta;
        }
        if(Ice.playerInteraction.ctrl) {
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
            m.x -= Ice.speed.monster * e.delta;
            if(m.nextMove <= createjs.Ticker.getTime()) {
                m.direction = Ice.randomRange(-1, 1);
                m.nextMove = Ice.randomRange(100, 2000) + createjs.Ticker.getTime();
            }
            switch(m.direction) {
                case 1:
                    m.y -= Ice.speed.monsterX * e.delta;
                    break;
                case -1:
                    m.y += Ice.speed.monsterX * e.delta;
                    break;
            }

            var mb = m.getBounds();
            if(m.y >= 500-mb.height) {
                m.direction = 1;
                m.nextMove = Ice.randomRange(100, 2000) + createjs.Ticker.getTime();
            }
            if(m.y <= 0) {
                m.direction = -1;
                m.nextMove = Ice.randomRange(100, 2000) + createjs.Ticker.getTime();
            }

            if(m.x <= playerBounds.width) {
                Ice.monsters.removeChild(m);
            }

            //check if hit monster
            for(var k=0; k<Ice.bullets.children.length; k++) {
                var b =  Ice.bullets.children[k];
                var pt = b.localToLocal(0, 0, m.getChildByName('image'));
                if(m.getChildByName('image').hitTest(pt.x, pt.y)) {
                    Ice.bullets.removeChild(b);
                    m.hp--;
                    m.getChildByName('hp').text = m.hp + '/3';
                    if(m.hp == 0) {
                        Ice.monsters.removeChild(m);
                        Ice.score++;
                        Ice.GUI.updateScore();
                        createjs.Sound.play('teemodie');
                    }
                }
            }
        }

        //fire bullets
        for(var i=0; i<Ice.bullets.children.length; i++) {
            var o = Ice.bullets.children[i];
            o.x += Ice.speed.bullet * e.delta;
            if(o.x >= Ice.stage.canvas.width) {
                Ice.bullets.removeChild(o);
            }
        }


        document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS());
        Ice.stage.update(e);
    },
    handleMouseMove: function(event) {
        Ice.player.y = event.stageY -32;
        if(!Ice.runningAnimation) {Ice.player.gotoAndPlay('run'); }
        Ice.runningAnimation = true;
    },
    handleMouseClick: function(event) {
        Ice.playerInteraction.ctrl = true;
        Ice.player.gotoAndPlay('hit')
        setTimeout(function() {Ice.player.gotoAndPlay('stand');}, 500);
    },
    handleMouseClickRelease: function(event) {
        Ice.playerInteraction.ctrl = false;
    },
    spawnMonsters: function() {
        var c = new createjs.Container();
        var b = new createjs.Shape();
        b.graphics.beginFill('blue').drawRect(0,0, 64, 64);
        var hp = new createjs.Text('3/3', 'bold 14px Arial', '#FFFFFF');
        c.x = Ice.stage.canvas.width-64;
        c.y = Ice.randomRange(0, 500-64);
        c.direction = 0;
        c.nextMove = 0;
        c.hp = 3;

        b.name = "image";
        hp.name = "hp";
        b.y = 20;
        hp.y = 0;
        hp.x = (64-hp.getMeasuredWidth())/2;

        c.addChild(b, hp);
        Ice.monsters.addChild(c);
        Ice.stage.update();
    },
    shot: function() {
        var s = new createjs.Shape();
        s.graphics.beginFill('red').drawRect(0, 0, 10, 5);
        s.y = Ice.player.y + 25;
        s.x = Ice.player.x + 50;
        Ice.bullets.addChild(s);
        Ice.stage.update();
        Ice.lastBulletTime = createjs.Ticker.getTime();
        createjs.Sound.play('attack'+Ice.randomRange(1, 4));
    },
    handleKeyDown: function(e) {
        var keyCode = e.which ? e.which: e.keyCode;
        if(keyCode == Ice.KEYS.DOWN) {
            Ice.playerInteraction.down = true;
            if(!Ice.runningAnimation) {Ice.player.gotoAndPlay('run');}
            Ice.runningAnimation = true;

        }
        if(keyCode == Ice.KEYS.UP) {
            Ice.playerInteraction.up = true;
            if(!Ice.runningAnimation) {Ice.player.gotoAndPlay('run'); }
            Ice.runningAnimation = true;
        }
        if(keyCode == Ice.KEYS.CTRL) {
            Ice.playerInteraction.ctrl = true;
            Ice.player.gotoAndPlay('hit')
            setTimeout(function() {Ice.player.gotoAndPlay(((Ice.playerInteraction.up || Ice.playerInteraction.down) ? 'run':'stand'));}, 500);
        }
    },
    handleKeyUp: function(e) {
        var keyCode = e.which ? e.which: e.keyCode;
        if(keyCode == Ice.KEYS.DOWN || keyCode == Ice.KEYS.UP) {
            if(Ice.runningAnimation) {Ice.runningAnimation = false; Ice.player.gotoAndPlay('stand');}
        }
        if(keyCode == Ice.KEYS.UP) {
            Ice.playerInteraction.up = false;
        }
        if(keyCode == Ice.KEYS.DOWN) {
            Ice.playerInteraction.down = false;
        }
        if(keyCode == Ice.KEYS.CTRL) {
            Ice.playerInteraction.ctrl = false;
        }
    },
    GUI: {
        container: null,
        background: null,
        score: null,
        init: function() {
            this.container = new createjs.Container();
            this.container.x = 0;
            this.container.y = 500;
            this.background = new createjs.Shape();
            this.background.graphics.beginFill('rgb(44,44,44)').drawRect(0, 0, Ice.stage.canvas.width, 100);

            this.score = new createjs.Text("Score: " + Ice.score, "18px Arial", "#FFFFFF");
            this.score.x = 10;
            this.score.y = 10;

            this.container.addChild(this.background, this.score);
            Ice.stage.addChild(this.container);
            Ice.stage.update();
        },
        updateScore: function() {
            this.score.text = 'Score: ' + Ice.score;
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
    },
    randomRangeNoFloor: function(min, max) {
        return Math.random() * (max - min) + min;
    }
}