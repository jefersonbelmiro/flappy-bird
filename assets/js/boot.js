;(function(exports) {

    var Boot = function(game) {
        this.game = game;
    }    

    Boot.prototype = {
    
        preload : function() {
            this.stage.backgroundColor = '#70C5CF'; 
        },

        create : function() {

            // set scale options
            this.input.maxPointers = 1;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.setScreenSize(true);

            // start the Preloader state
            this.state.start('preloader');
        }
    
    } 

    exports.Boot = Boot;

})(this);
