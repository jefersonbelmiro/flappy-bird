;(function(exports) {

    /**
     * @todo - tirar os * 2
     */
    var spriteData = {
        "frames": [

            // player
            { "filename": "player001", "frame": { "x": 312, "y": 230, "w": 34, "h": 24 } },
            { "filename": "player002", "frame": { "x": 312, "y": 256, "w": 34, "h": 24 } },
            { "filename": "player003", "frame": { "x": 312, "y": 282, "w": 34, "h": 24 } },

            // bg 
            { "filename": "bg", "frame": { "x": 0, "y": 0, "w": 138*2, "h": 114*2 } },

            // fg 
            { "filename": "fg", "frame": { "x": 138*2, "y": 0, "w": 112*2, "h": 56*2 } },

            // pipes 
            { "filename": "pipe-north", "frame": { "x": 251*2, "y": 0, "w": 26*2, "h": 200*2 } },
            { "filename": "pipe-south", "frame": { "x": 277*2, "y": 0, "w": 26*2, "h": 200*2 } },

            // buttons
		    { "filename": 'button-rate'  ,"frame" : { "x":  79*2, "y": 177*2, "w": 40*2, "h": 14*2} },
		    { "filename": 'button-menu'  ,"frame" : { "x": 119*2, "y": 177*2, "w": 40*2, "h": 14*2} },
		    { "filename": 'button-share' ,"frame" : { "x": 159*2, "y": 177*2, "w": 40*2, "h": 14*2} },
		    { "filename": 'button-score' ,"frame" : { "x":  79*2, "y": 191*2, "w": 40*2, "h": 14*2} },
		    { "filename": 'button-ok'    ,"frame" : { "x": 119*2, "y": 191*2, "w": 40*2, "h": 14*2} },
		    { "filename": 'button-start' ,"frame" : { "x": 159*2, "y": 191*2, "w": 40*2, "h": 14*2} },

            // texts
		    { "filename": 'text-flappy' ,"frame" : { "x": 59*2, "y": 114*2, "w": 96*2, "h": 22*2} },
		    { "filename": 'text-game-over' ,"frame" : { "x": 59*2, "y": 136*2, "w": 94*2, "h": 19*2} },
		    { "filename": 'text-get-ready' ,"frame" : { "x": 59*2, "y": 155*2, "w": 87*2, "h": 22*2} },

            // score
            { "filename": "score", "frame": { "x": 138*2, "y": 56*2, "w": 113*2, "h": 58*2 } },

            // splash
            { "filename": "splash", "frame": { "x": 0, "y": 114*2, "w": 59*2, "h": 49*2 } },

            // numbers
            { "filename": "number-small", "frame": { "x": 0, "y": 354, "w": 6*2, "h": 7*2 } },
            { "filename": "number-big", "frame": { "x": 0, "y": 376, "w": 7*2, "h": 10*2 } },

            // number small
            { "filename": "number-small-0", "frame": { "x": 0, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-1", "frame": { "x": 14, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-2", "frame": { "x": 28, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-3", "frame": { "x": 42, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-4", "frame": { "x": 56, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-5", "frame": { "x": 70, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-6", "frame": { "x": 84, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-7", "frame": { "x": 98, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-8", "frame": { "x": 112, "y": 354, "w": 12, "h": 14 } },
            { "filename": "number-small-9", "frame": { "x": 126, "y": 354, "w": 12, "h": 14 } },

            // number big
            { "filename": "number-big-0", "frame": { "x": 0, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-1", "frame": { "x": 16, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-2", "frame": { "x": 32, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-3", "frame": { "x": 48, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-4", "frame": { "x": 64, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-5", "frame": { "x": 80, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-6", "frame": { "x": 96, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-7", "frame": { "x": 112, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-8", "frame": { "x": 128, "y": 376, "w": 14, "h": 20 } },
            { "filename": "number-big-9", "frame": { "x": 144, "y": 376, "w": 14, "h": 20 } },

            // medals
            { "filename": "medal-bronze", "frame": { "x": 396, "y": 274, "w": 44, "h": 44 } },
            { "filename": "medal-silver", "frame": { "x": 396, "y": 228, "w": 44, "h": 44 } },
            { "filename": "medal-gold", "frame": { "x": 348, "y": 274, "w": 44, "h": 44 } },
            { "filename": "medal-platinum", "frame": { "x": 348, "y": 228, "w": 44, "h": 44 } },

        ],

        "meta": {
            "image": "sprites.png",
            "size": {"w": 640, "h": 410},
            "scale": "1"
        }
    };

    var Preloader = function(game) {
        this.game = game;
    }    

    Preloader.prototype = {

        preload: function(){
            this.load.atlas('sprites', 'assets/img/sheet.png', null, spriteData);
            this.load.audio('jump', 'assets/sound/jump.ogg');  
            this.load.audio('die', 'assets/sound/die.ogg');  
            this.load.audio('hit', 'assets/sound/hit.ogg');  
            this.load.audio('point', 'assets/sound/point.ogg');  
            this.load.audio('swooshing', 'assets/sound/swooshing.ogg');  
        },

        create: function(){
            this.state.start('menu');
        }

    } 

    exports.Preloader = Preloader;

})(this);
