;(function(global) {

    var 
        currentstate, score = 0, best = 0, sounds, boardScoreNumbers = [],
        states = {
            splash: 1, play: 2, score: 3, gameOver: 4
        },
        fpsText, pipesGroup,
        config = {
            player : {
                gravity : 1500,
                speed : 400,
            },
            pipe : {
                time : 1200
            }
        }
    ;

    var Game = function(game) {
        this.game = game;
    }    

    Game.prototype = {

        create: function() {

            currentstate = states.splash;

            var centerX = this.world.centerX, centerY = this.world.centerY;

            this.createBackground();

            pipesGroup = this.add.group();
            pipesGroup.enableBody = true;

            this.createForeground();

            this.textGetReady = this.add.sprite(centerX, centerY/2, 'sprites', 'text-get-ready');
            this.textGetReady.anchor.setTo(0.5);

            this.player = this.add.sprite(80, centerY - 45, 'sprites', 'player001');
            this.player.anchor.setTo(0.5);
            this.player.animations.add('fly', ['player001', 'player002', 'player003']);
            this.player.animations.play('fly', 10, true);
            this.player.name = 'player';

            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.physics.enable([this.player], Phaser.Physics.ARCADE);

            this.player.body.collideWorldBounds = true;

            this.splash = this.add.sprite(centerX, centerY, 'sprites', 'splash');
            this.splash.anchor.setTo(0.5);

            this.playerTween = this.add.tween(this.player)
                .to({y : this.player.y+10}, 500, Phaser.Easing.Linear.None)
                .to({y : this.player.y}, 500, Phaser.Easing.Linear.None)
                .loop().start()
            ;

            this.game.input.onDown.add(this.inputDown, this);

            sounds = {
                jump : game.add.audio('jump'),
                point : game.add.audio('point'),
                hit : game.add.audio('hit'),
                die : game.add.audio('die'),
                swooshing : game.add.audio('swooshing'),
            }

            best = localStorage.getItem('best') || 0; 
            score = 0;
            this.updateScore();

            // game.time.advancedTiming = true;
            // fpsText = game.add.text(0, 5, '00', {font: '16px Arial', fill: '#333'});
            // fpsText.x = game.width - fpsText.width - 5;

            // debug
            global.player = this.player;
        },

        update : function() { 

            // fpsText.setText(this.time.fps);

            if (currentstate === states.score) {
                return false;
            }

            if (this.player.position.y + this.player.body.height >= this.foreground.position.y) {

                this.player.body.y = this.foreground.y - this.player.body.height;
                this.player.body.gravity.y = 0;
                this.player.body.velocity.y = 0;

                if (currentstate !== states.gameOver) {
                    this.gameOver();
                }

                currentstate = states.score;
            }

            if (currentstate === states.play) {
                this.game.physics.arcade.overlap(this.player, pipesGroup, this.collisionHandler, null, this);
            }

            if (currentstate === states.play && this.player.body.velocity.y <= 350) {

                if (this.player.angle > -30){
                    this.player.angle -= 10;
                }
            } 

            if (this.player.body.velocity.y > 350) {

                this.player.animations.stop();

                if (this.player.angle < 80){
                    this.player.angle += 10;
                }
            }

            pipesGroup.forEachAlive(function(pipe) {

                if (pipe.name == 'pipe-south' || pipe.scored || this.player.position.x < pipe.position.x + pipe.width/2) {
                    return;
                }
                
                pipe.scored = true;
                this.score();

            }.bind(this));

        },

        render : function() {
            // this.game.debug.body(this.player);
            // this.game.debug.body(this.foreground);
            // pipesGroup.forEachAlive(function(pipe) {
            //     this.game.debug.body(pipe);
            // });
        },

        createPipe : function(y, name) {

            var pipe = pipesGroup.getFirstDead();

            if (!pipe) {

                pipe = pipesGroup.create(this.game.width, y, 'sprites', name);
                pipe.name = name;
                pipe.checkWorldBounds = true;
                pipe.outOfBoundsKill = true;
                pipe.body.immovable = true;
                pipe.body.velocity.x -= 150; 
                pipesGroup.add(pipe);
            }

            pipe.position.setTo(this.game.width, y);
            pipe.scored = false;
            pipe.revive();

            return pipe;
        },

        addPipes : function() {

            var random = 200;
            var distance = 100
            var y = this.game.height - (660 + random * Math.random());
            var south = this.createPipe(y, 'pipe-south');
            var north = this.createPipe(y + 400 + distance, 'pipe-north');
        }, 

        score : function() {

            score++;
            sounds.point.play();
            this.updateScore();
        },
        
        updateScore : function() {
            this.drawNumbers(score, this.game.world.centerX, 20, 'number-big', 'center', true);
        },

        drawNumbers : function(numbers, x, y, spritePrefix, align, clear) {

            if (clear) {
                for (var index = 0, length = boardScoreNumbers.length; index < length; index++) {
                    boardScoreNumbers[index].destroy();
                }
            }
            
            boardScoreNumbers = []; 

            var numbers = numbers.toString();

            var width = spritePrefix == 'number-big' ? 16 : 14;
            var totalWidth = numbers.length * width;
            var currentX = 0;

            if (align == 'center') {
                x -= totalWidth/2;
            }

            if (align == 'right') {
                x -= totalWidth;
            }

            for (var index = 0, length = numbers.length; index < length; index++) {

                var number = numbers[index];
                var sprite = this.add.sprite(x + currentX, y, 'sprites', spritePrefix+'-' + number);

                currentX += width;
                boardScoreNumbers.push(sprite);
            }
        },

        collisionHandler : function(player, object) {
            this.gameOver();
        }, 

        hitEffect : function() {

            sounds.hit.play();

            var bg = this.game.add.graphics(0, 0);
            var tween = this.game.add.tween(bg).to({alpha: 0}, 500, Phaser.Easing.Linear.None);

            tween.onComplete.add(function() {
                bg.destroy();
            }); 

            bg.beginFill(0xffffff, 1);
            bg.drawRect(0, 0, this.game.width, this.game.height);
            bg.alpha = 1;
            bg.endFill();

            tween.start();
        },

        gameOver : function() {

            this.hitEffect();
            currentstate = states.gameOver;

            this.foreground.stopScroll();
            this.time.events.remove(this.pipesTimer);

            pipesGroup.forEachAlive(function(pipe) {
                pipe.body.velocity.x = 0;
            });

            /**
             * destroy score numbers from top
             */
            for (var index = 0, length = boardScoreNumbers.length; index < length; index++) {
                boardScoreNumbers[index].destroy();
            }
            boardScoreNumbers = [];

            var data = this.game.cache.getFrameData('sprites');
            var dataGameOver = data.getFrameByName('text-game-over');
            var dataScore = data.getFrameByName('score');
            var dataOk = data.getFrameByName('button-ok');
            var centerX = this.game.world.centerX;

            var sprieteGameover = this.add.sprite(centerX - dataGameOver.width/2, 70, 'sprites', 'text-game-over');
            var sprieteScore = this.add.sprite(centerX - dataScore.width/2, this.game.height+20, 'sprites', 'score');
            var sprieteButtonOk = this.add.sprite(centerX - dataOk.width/2, 280, 'sprites', 'button-ok');

            sprieteButtonOk.inputEnabled = true;
            sprieteButtonOk.events.onInputDown.add(function() {
                this.state.start('game');
            }, this);

            sprieteGameover.alpha = 0;
            sprieteButtonOk.visible = false;

            var gameOverTween = this.game.add.tween(sprieteGameover);
            var scoreTween = this.game.add.tween(sprieteScore);
            
            gameOverTween.to({alpha: 1, y: 80}, 500, Phaser.Easing.Linear.None);
            scoreTween.to({y: 140}, 300, Phaser.Easing.Linear.None);

            best = Math.max(score, best);
            localStorage.setItem('best', best); 

            var timer = this.time.create(this.game);
            timer.add(1000, function() {
                gameOverTween.start();
                sounds.swooshing.play();
            }, this);
            timer.add(2500, function() {

                sounds.swooshing.play();

                this.createMedal(sprieteScore.x+26, sprieteScore.y+42);

                sprieteButtonOk.visible = true;

            }, this);

            timer.start();

            gameOverTween.onComplete.add(function() {
                scoreTween.start();
                sounds.swooshing.play();
            }, this);

            scoreTween.onComplete.add(function() {

                // score
                this.drawNumbers(score, sprieteScore.x + sprieteScore.width-20, 176, 'number-small', 'right', false);
                // best
                this.drawNumbers(best, sprieteScore.x + sprieteScore.width-20, 218, 'number-small', 'right', false);
            
            }, this);
        },

        inputDown : function(input, event) {

            if (currentstate === states.splash) {
                return this.start();
            }
            
            if (currentstate === states.play) {
                return this.jump();
            }
        },

        jump : function() {
            this.player.body.velocity.y = -config.player.speed;
            this.player.animations.play('fly', 10, true);
            sounds.jump.play();
        },

        start : function() {

            currentstate = states.play;

            this.splash.destroy();
            this.textGetReady.destroy();
            this.playerTween.stop();

            // this.player.body.velocity.y = -config.player.speed;
            this.player.body.gravity.y = config.player.gravity;
            this.jump();

            this.pipesTimer = game.time.events.loop(config.pipe.time, this.addPipes, this);  
        },

        createBackground : function() {

            var data = this.game.cache.getFrameData('sprites').getFrameByName('bg');
            var width = 276, y = this.game.height - 276;
            // this.add.sprite(0, y, 'sprites', 'bg');
            // this.add.sprite(width, y, 'sprites', 'bg');

            this.foreground = this.add.tileSprite(0, y, this.game.width, data.height, 'sprites', 'bg');
        },

        createForeground : function() {

            var width = 124, height = 112, y = this.game.height - height/2; 
            this.foreground = this.add.tileSprite(0, y, this.game.width, height, 'sprites', 'fg');
            this.foreground.autoScroll(-150,0);
        },

        createMedal : function(x, y) {

            if(score < 10) {
                return false;
            }

            if(score >= 10) medal = "bronze";
            if(score >= 20) medal = "silver";
            if(score >= 30) medal = "gold";
            if(score >= 40) medal = "platinum"; 

            this.add.sprite(x, y, 'sprites', 'medal-' + medal); 
        }

    } 

    global.Game = Game;

})(this);
