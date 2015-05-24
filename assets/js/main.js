
var WIDTH = Math.min(window.innerWidth, window.innerHeight);
var HEIGHT = window.innerHeight;

// moto-g 
// WIDTH = 360;
// HEIGHT = 511;

// alert(WIDTH + '|' + HEIGHT);

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', { 
    preload: preload, create: create, update: update, render: render 
});

var GEM_MIN_SCORE = 3;

var GEM_WIDTH = 91;
var GEM_HEIGHT = 78;

var COL_WIDTH = 100;
var ROW_HEIGHT = 85;

var BOARD_COLS = 6
var BOARD_ROWS = 10;

var BOARD_HEIGHT = HEIGHT - 30;
var SCALE = Math.min((WIDTH/COL_WIDTH/BOARD_COLS), (BOARD_HEIGHT/ROW_HEIGHT/BOARD_ROWS));

var BOARD_WIDTH = BOARD_COLS * COL_WIDTH * SCALE;
var BOARD_HEIGHT = BOARD_ROWS * ROW_HEIGHT * SCALE;

var BOARD_MARGIN_TOP = HEIGHT - BOARD_HEIGHT; 
var BOARD_MARGIN_LEFT = (WIDTH - BOARD_WIDTH)/2;

var gems = {}, fpsText, scoreText, score = 0, selectedGem, selectedRect, gameObject, gemsGroup, pointer;

var countDown = 60, countDownText, countDownTimer;

var pointer = { start : null, end : null };

var STATES = {
    RUNNING : 1,
    PAUSED : 2,
    GAMEOVER : 3,
    FROZEN : 4,
};
var state = STATES.RUNNING;

var textStyle = {
  font: '16px Arial', fill: '#ffffff'//, backgroundColor : 'rgba(0,0,0,0.5)'
}

var gemsData = {
    "frames": [
        { "filename": "gem/0001", "frame": { "x": 112, "y": 3,   "w": GEM_WIDTH, "h": GEM_HEIGHT } },
        { "filename": "gem/0001", "frame": { "x": 220, "y": 106, "w": GEM_WIDTH, "h": GEM_HEIGHT } },
        { "filename": "gem/0002", "frame": { "x": 329, "y": 106, "w": GEM_WIDTH, "h": GEM_HEIGHT } },
        { "filename": "gem/0003", "frame": { "x": 437, "y": 106, "w": GEM_WIDTH, "h": GEM_HEIGHT } },
        { "filename": "gem/0004", "frame": { "x": 220, "y": 209, "w": GEM_WIDTH, "h": GEM_HEIGHT } },
        { "filename": "gem/0005", "frame": { "x": 546, "y": 209, "w": GEM_WIDTH, "h": GEM_HEIGHT } }
    ],

    "meta": {
        "image": "sprites.png",
        "size": {"w": 640, "h": 290},
        "scale": "1"

    }
};

function preload() {
    game.load.atlas('gems', 'assets/img/gems.png', null, gemsData);
}

function create() {

    game.stage.backgroundColor = '#292929'; 
    game.input.addMoveCallback(inputMove, this);
    game.input.onDown.add(function(input, event) {
        pointer.start = {x : input.position.x, y : input.position.y};

        if (state === STATES.PAUSED) {
            return resume();
        }

        if (state === STATES.GAMEOVER) {
            return restart();        
        }

    }, this);

    game.input.onUp.add(function(input, event) {
        pointer.start = null;
        pointer.end = {x : input.position.x, y : input.position.y};
    }, this);

    gameObject = game.add.group();
    gameObject.scale.setTo(SCALE);

    gameObject.x = BOARD_MARGIN_LEFT;
    gameObject.y = BOARD_MARGIN_TOP;

    createGems();

    game.time.advancedTiming = true;
    fpsText = game.add.text(0, 5, '00 FPS', textStyle);
    fpsText.x = game.width - fpsText.width - 5;

    scoreText = game.add.text(5, 5, 'Score: 0', textStyle);

    countDownText = game.add.text(game.world.centerX, 5, countDown, textStyle);
    countDownText.anchor.x = 0.5;
    countDownText.align = 'center';
    countDownText.padding.set(10, 5);

    countDownTimer = game.time.create(false);
    countDownTimer.loop(1000, function() {

        countDown -= 1;
        updateCountDown();

        if (countDown <= 0) {
            gameOver();
        }
    });
    countDownTimer.start();
}

function update() {
    fpsText.setText(game.time.fps + ' FPS');
}

function render() {

}

function createGems() {

    gemsGroup = game.add.group();

    for (var row = 0; row < BOARD_ROWS; row++) {
        gems[row] = {};
        for (var col = 0; col < BOARD_COLS; col++) {
            var gem = createGem(row, col);
        }
    }

    gameObject.add(gemsGroup);
    removeInitialMatches();
}

function createGem(row, col) {

    var gem = gemsGroup.getFirstDead();

    var x = col * COL_WIDTH;
    var y = row * ROW_HEIGHT;

    if (gem) {

        gem.revive();
        gem.x = x;
        gem.y = y;
    } 

    if (!gem) {

        gem = gemsGroup.create(x, y, 'gems');
        gem.inputEnabled = true;
        gem.events.onInputDown.add(select, game);
    }

    gem.dying = false;
    gem.selectable = true;
    gem.width = GEM_WIDTH;
    gem.height = GEM_HEIGHT;

    setRandomFrame(gem);

    gem.row = row;
    gem.col = col;

    gems[row][col] = gem;
    return gem;
}

function removeInitialMatches() {

    var matches = findMatches();

    if (matches.length == 0) {
        return true;
    }

    for (var index = 0, length = matches.length; index < length; index++) {
        setRandomFrame(matches[index]);
    }

    return removeInitialMatches();
}

function findMatches() {

    var matches = [], keys = {};

    for (var row = 0; row < BOARD_ROWS; row++) {

        for (var col = 0; col < BOARD_COLS; col++) {

            var gem = getGem(row, col);
            var gemSameColor = getSameColor(gem);

            if (gemSameColor.length < GEM_MIN_SCORE) {
                continue;
            }

            for (var index = 0, length = gemSameColor.length; index < length; index++) {

                var gemMatch = gemSameColor[index];

                if (!keys[gemMatch.row]) {
                    keys[gemMatch.row] = {};
                }

                if (keys[gemMatch.row] && keys[gemMatch.row][gemMatch.col]) {
                    continue;
                }
                
                keys[gemMatch.row][gemMatch.col] = true;
                matches.push(gemMatch);
            }
        }
    }            

    return matches;
}

function setRandomFrame(gem) {
    gem.frame = game.rnd.integerInRange(0, gem.animations.frameTotal - 1);
}

function select(gem, input) {

    if (!gem.selectable) return false;

    if (selectedGem && selectedGem.selectable) {

        var distRow = Math.abs(selectedGem.row - gem.row);
        var distCol = Math.abs(selectedGem.col - gem.col);

        if (distRow <= 1 && distCol <= 1 && distCol != distRow) {

            swap(selectedGem, gem);
            selectedGem = false;
            selectedRect.kill();
            return true; 
        }
    }

    if (!selectedRect) {

        var graphics = game.add.graphics(-COL_WIDTH * 2, -ROW_HEIGHT * 2);
        graphics.beginFill(0x444444);
        graphics.drawRoundedRect(0, 0, gem.width, gem.height, 5);
        graphics.endFill();
        selectedRect = gameObject.create(gem.x, gem.y, graphics.generateTexture());
    }

    if (!selectedRect.alive) {
        selectedRect.revive();
    }

    gameObject.bringToTop(gemsGroup);

    selectedGem = gem;
    selectedRect.position.setTo(gem.x, gem.y);
}

function inputMove(input, x, y, fromClick) {

    if (!selectedGem || !selectedGem.selectable || !pointer.start) return;
                   
    var distX = x - pointer.start.x;
    var distY = y - pointer.start.y;
    var min = 15;

    if (Math.abs(distX) <= min && Math.abs(distY) <= min) {
        return false;
    }

    var row = selectedGem.row;
    var col = selectedGem.col;

    if (Math.abs(distX) > Math.abs(distY)) {
        col = distX > 0 ? col + 1 : col - 1;
    } else {
        row = distY > 0 ? row + 1 : row - 1;
    }

    var gem = getGem(row, col);

    if (!gem || !gem.alive || !gem.selectable || gem.dying) {
        return false;
    }

    swap(selectedGem, gem);

    selectedGem = false;
    selectedRect.kill();
}

function swap(selectedGem, gem) {
    
    var rollback = true;
    selectedGem.selectable = false;
    gem.selectable = false;

    function _swapProperties() {

        var _row = selectedGem.row;
        var _col = selectedGem.col;

        gems[selectedGem.row][selectedGem.col] = gem;
        gems[gem.row][gem.col] = selectedGem;

        selectedGem.row = gem.row;
        selectedGem.col = gem.col;
        gem.row = _row;
        gem.col = _col;
    }

    function _animationEnd() {

        if (!rollback) {
            return false;
        }

        var selectedGemSameColor = getSameColor(selectedGem);
        var gemSameColor = getSameColor(gem);
        var gemsMatch = [];

        if (selectedGemSameColor.length >= GEM_MIN_SCORE || gemSameColor.length >= GEM_MIN_SCORE) {

            rollback = false;

            if (selectedGemSameColor.length >= GEM_MIN_SCORE) {
                gemsMatch = gemsMatch.concat(selectedGemSameColor);
            }

            if (gemSameColor.length >= GEM_MIN_SCORE) {
                gemsMatch = gemsMatch.concat(gemSameColor);
            }

            processMatches(gemsMatch);
        }

        if (rollback) {
            rollback = false;
            _move();
        } 
    }

    function _move() {

        _swapProperties();

        move(selectedGem, gem.x, gem.y);
        move(gem, selectedGem.x, selectedGem.y, _animationEnd);
    }

    _move();
}

function getGem(row, col) {

    if (!gems[row] || !gems[row][col]) {
        return false;
    }

    return gems[row][col];
}

function move(gem, x, y, callback, time, ease) {

    gem.selectable = false;
    game.tweens.removeFrom(gem);

    x = gem.col * COL_WIDTH;
    y = gem.row * ROW_HEIGHT;
    
    var tween = game.add.tween(gem);
    var time = time || 200;
    var ease = ease || Phaser.Easing.Linear.None;
    tween.to({ x: x, y: y }, time, ease);

    tween.onComplete.add(function(gem) {

        if (callback) {
            callback();
        }

        gem.selectable = true;
    }, game);

    tween.start();
}

function getSameColor(gem) {

    var result = [gem], horizontal = [], vertical = [];

    horizontal = horizontal.concat(getSameColorByDirection(gem, 0, -1));
    horizontal = horizontal.concat(getSameColorByDirection(gem, 0, 1));

    vertical = vertical.concat(getSameColorByDirection(gem, -1, 0));
    vertical = vertical.concat(getSameColorByDirection(gem, 1, 0));

    if (horizontal.length >= GEM_MIN_SCORE - 1) {
        result = result.concat(horizontal);
    }

    if (vertical.length >= GEM_MIN_SCORE - 1) {
        result = result.concat(vertical);
    }

    return result;
}

function getSameColorByDirection(gem, moveRow, moveCol) {

    var result = [];
    var curRow = gem.row + moveRow;
    var curCol = gem.col + moveCol;

    while (curRow >= 0 && curCol >= 0 && curRow < BOARD_ROWS && curCol < BOARD_COLS) {

        findGem = getGem(curRow, curCol);

        if (!findGem || findGem.frame != gem.frame) {
            break;
        } 

        result.push(findGem);
        curRow += moveRow;
        curCol += moveCol;
    }

    return result;
}

function updateScore() {
    scoreText.setText('Score: ' + score);
}

function updateCountDown() {
    countDownText.setText(countDown);
}

function killGem(gem, callback) {

    gem.dying = true;
    gem.selectable = false;
    var to = { 
        width: gem.width/2,
        height: gem.height/2,
        x : gem.x + (gem.width * 0.25),
        y : gem.y + (gem.height * 0.25)
    };
    var tween = game.add.tween(gem);
    tween.to(to, 100, Phaser.Easing.Linear.None);
    tween.onComplete.add(function() {

        gem.kill();
        gems[gem.row][gem.col] = null;

        if (callback) {
            callback();
        }
    }, game);
    tween.start();
}

function removeDuplicates(gemsArray) {

    var result = [], keys = {};

    for (var index = 0, length = gemsArray.length; index < length; index++) {

        var gem = gemsArray[index];
        if (keys[gem.row] && keys[gem.row][gem.col]) {
            continue;
        }
        if (!keys[gem.row]) {
            keys[gem.row] = {};
        }
        keys[gem.row][gem.col] = true;
        result.push(gem);
    }

    return result;
}

function processMatches(gemsArray) {

    if (state !== STATES.RUNNING) {
        return false;
    }

    gemsArray = removeDuplicates(gemsArray);

    var length = gemsArray.length;
    for (var index = 0; index < length; index++) {

        score++;

        var gem = gemsArray[index];
        var callback = false;

        if (index == length - 1) {
            callback = drop;
        }

        killGem(gem, callback)
    }

    countDown += Math.floor(length/2);

    updateCountDown();
    updateScore();
}

function pause() {

    state = STATES.PAUSED;
    frozen();
}

function resume() {

    state = STATES.RUNNING;
    unfrozen();
}

function frozen() {

    gemsGroup.forEachAlive(function(gem) {
        gem.inputEnabled = false;
    });
}

function unfrozen() {

    gemsGroup.forEachAlive(function(gem) {
        gem.inputEnabled = true;
    });
}

function restart() {
    location.reload();
}

function gameOver() {

    state = STATES.FROZEN;
    countDownTimer.stop();

    frozen();

    var text = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER');
    text.fontSize = 33;
    text.align = 'center';
    text.padding.set(10, 5);
    text.stroke = '#000000';
    text.fill = '#ffffff';
    text.strokeThickness = 5;
    text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    text.anchor.setTo(0.5);

    var width = text.width;
    var height = text.height;
    text.width = 0;
    text.height = 0;
    
    var tween = game.add.tween(text);
    tween.to({width: width, height: height}, 1000, Phaser.Easing.Bounce.Out);
    tween.onComplete.add(function() {
        state = STATES.GAMEOVER;
    }, game);
    tween.start();
}

function drop() {

    var time = 300;
    var ease = Phaser.Easing.Bounce.Out;
    var moves = [];

    for (var col = 0; col < BOARD_COLS; col++) {

        var dropRowCount = 0;
        var dropGem = [];

        // detect rows to drop
        for (var row = BOARD_ROWS - 1; row >= 0; row--) {

            var gem = getGem(row, col);

            if (!gem || !gem.alive) {

                dropRowCount++;
                continue;
            }

            if (dropRowCount <= 0) {
                continue;
            }

            gem.dropRowCount = dropRowCount;
            dropGem.push(gem);
        }

        // drop gems
        for (var index = 0, length = dropGem.length; index < length; index++) {

            var gem = dropGem[index];
            var fall = ROW_HEIGHT * gem.dropRowCount
            var lastCallback = false;

            gems[gem.row][gem.col] = null;
            gem.row += gem.dropRowCount;
            gems[gem.row][gem.col] = gem;

            moves.push(gem);
            // move(gem, gem.x, gem.y + fall, lastCallback, time, ease);
        }

        // new gems
        for (var index = dropRowCount - 1; index >= 0; index--) {

            gems[index][col] = null;
            var gem = createGem(index, col);

            gem.y = (ROW_HEIGHT * (4-index)) * -1;
            moves.push(gem);
            // move(gem, gem.x, ROW_HEIGHT * index, false, time, ease);
        }

    }

    for (var index = 0, length = moves.length; index < length; index++) {

        var gem = moves[index];
        var callback = false;
        if (index == length - 1) {
            callback = function() {
                processMatches(findMatches());
            }
        }
        move(gem, gem.x, gem.y, callback, time, ease);
    }

}

function updatePosition() {

    for (var row = 0; row < BOARD_ROWS; row++) {

        for (var col = 0; col < BOARD_COLS; col++) {

            var gem = getGem(row, col);
            gem.x = col * COL_WIDTH;
            gem.y = row * ROW_HEIGHT;
        }
    }
}
