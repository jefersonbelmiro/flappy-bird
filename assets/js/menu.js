;(function(exports) {

    var Menu = function(game) {
        this.game = game;
    }    

    Menu.prototype = {

        create: function() {
            this.state.start('game');
        },

        startGame : function(button, pointer) {
            this.state.start('game');
        }

    } 

    exports.Menu = Menu;

})(this);
