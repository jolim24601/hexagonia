var hexagonWidth = 100;
var hexagonHeight = 86;
var ballRadius = 20;

var GRID_WIDTH_OFFSET = 25;
var GRID_HEIGHT_OFFSET = 180;
var EVEN_ROW_X_OFFSET = 43;

var gridSizeX = 12;
var gridSizeY = 5;

var Main = function (game) {
  this.attempts = 0;
  this.movesLeft = 8;
  this._levelNumber = 1;
  this.moveText;
  this.menuGroup;
  this.hexagons = [];
};

Main.prototype = {
  preload: function () {
    game.load.image('ball', 'assets/ball.png');
    game.load.image('hexagon', 'assets/hexagon.png');
    game.load.image('block', 'assets/block.png');
    game.load.image('bouncy', 'assets/bouncy.png');
    game.load.image('teleport', 'assets/teleport.png');
    game.load.image('gravity_portal', 'assets/gravity_portal.png');
    game.load.image('info', 'assets/info.png');
    game.load.image('menu', 'assets/menu.png');
    game.load.physics('sprite_physics', 'assets/sprite_physics.json');
  },
  create: function () {
    var menuButton = game.add.sprite(0, 0, 'info');
    menuButton.scale.setTo(1/2, 1/2);
    var infoGon = game.add.sprite(0, 0, 'info');
    infoGon.scale.setTo(1/2, 1/2);

    this.menuGroup = game.add.group();
    this.menuGroup.x = 25; this.menuGroup.y = 0;
    var menuLines = game.add.sprite(35, 37, 'menu');
    menuLines.scale.setTo(1/8, 1/8);
    menuLines.alpha = 0.8;
    this.menuGroup.add(menuButton);
    this.menuGroup.add(menuLines);

    menuButton.inputEnabled = true;
    menuButton.events.onInputDown.add(this.openMenu, this);

    var MovesGroup = game.add.group();
    MovesGroup.x = 875; MovesGroup.y = 0;
    MovesGroup.add(infoGon)
    this.moveText = game.add.bitmapText(40, 35, 'font72', '' + this.movesLeft, 36);
    MovesGroup.add(this.moveText);

    game.state.backgroundColor = '#0d1f98';
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = 1/2;
    game.physics.p2.gravity.y = 300;

    ballCollisionGroup = game.physics.p2.createCollisionGroup();
    hexCollisionGroup = game.physics.p2.createCollisionGroup();
    bounceCollisionGroup = game.physics.p2.createCollisionGroup();
    portalCollisionGroup = game.physics.p2.createCollisionGroup();

    var hexagonGroup = game.add.group();
    hexagonGroup.physicsBodyType = Phaser.Physics.P2JS;

    var hexagonX, hexagonY, hexagon, blockX, blockY, block;
    for (var row = 0; row < gridSizeY; row++) {
  		for (var col = 0; col < gridSizeX; col++) {
        if (row % 2 == 0 && col == gridSizeX - 1) {
          continue;
        } else if (col == 0 || col == gridSizeX - 1
                  || row % 2 == 0 && col == gridSizeX - 2) {

          block = this.createBlock(row, col);
          hexagonGroup.add(block);
          continue;
        } else if (row % 2 == 0) {
          hexagonX = hexagonWidth * col * (6/7) + EVEN_ROW_X_OFFSET;
        } else {
          hexagonX = hexagonWidth * col * (6/7);
        }
        hexagonX += GRID_WIDTH_OFFSET;
        hexagonY = hexagonHeight * row * (7/8) + GRID_HEIGHT_OFFSET;
        hexagon = game.add.sprite(hexagonX, hexagonY, 'hexagon');
        game.physics.p2.enable(hexagon, false);
        hexagonGroup.add(hexagon);
  		}
  	}

    hexagonGroup.forEach(function (hex) {
      hex.body.clearShapes();
      if (hex.key == 'hexagon') {
        hex.body.loadPolygon('sprite_physics', 'hexagon');
        hex.inputEnabled = true;
        hex.events.onInputDown.add(this.click, this);
      } else if (hex.key == 'block') {
        hex.body.loadPolygon('sprite_physics', 'block');
      }
      hex.body.static = true;
      hex.body.setCollisionGroup(hexCollisionGroup);
      hex.body.collides(ballCollisionGroup);
    }.bind(this));

    this.createBall();
    this.createPortal();

    // var graphics = game.add.graphics(portal.x, portal.y);
    // graphics.boundsPadding = 0;
    // graphics.lineStyle(5, 0xffffff);
    // graphics.drawEllipse(0, -5, 80, 10);
  },
  createBlock: function (row, col) {
    if (row % 2 == 0) {
      blockX = hexagonWidth * col * (6/7) + EVEN_ROW_X_OFFSET;
    } else {
      blockX = hexagonWidth * col * (6/7);
    }
    blockX += GRID_WIDTH_OFFSET;
    blockY = hexagonHeight * row * (7/8) + GRID_HEIGHT_OFFSET;
    block = game.add.sprite(blockX, blockY, 'block');
    game.physics.p2.enable(block, false);
    return block;
  },
  createPortal: function () {
    portal = game.add.sprite(500, 575, 'gravity_portal');
    game.physics.p2.enable(portal, true);
    portal.body.static = true;
    portal.scale.setTo(3/5, 1/4);
    portal.body.clearShapes();
    portal.body.setCircle(80, 0, 60);
    portal.body.setCollisionGroup(portalCollisionGroup);
    portal.body.collides(ballCollisionGroup);
  },
  click: function (hexagon) {
    if (this.movesLeft > 0) {
      hexagon.kill();
      this.movesLeft -= 1;
      this.moveText.text = '' + this.movesLeft;
    }
  },
  gameOver: function (ball) {
    this.attempts += 1;
    console.log("LOST");
  },
  createBall: function () {
    ball = game.add.sprite(300, 0, 'ball');
    game.physics.p2.enable(ball, false);
    ball.body.setCircle(20);
    ball.body.setCollisionGroup(ballCollisionGroup);
    ball.body.collides(hexCollisionGroup);
    ball.body.collides(portalCollisionGroup, this.isWon, this);
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(this.gameOver, this);
  },
  openMenu: function (sprite, pointer) {
    var tween = this.game.add.tween(this.menuGroup.scale)
      .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
      .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
      .start();
    tween.onComplete.add(function() { game.state.start('LevelSelect') });
  },
  restart: function () {

  },
  isWon: function (obj, goal) {
    // make the ball 'hover' in place
    // game.gravity.y = 0;
    // game.animations.add('fly', [0,1,2,3,4,5], 30, true);

    if (obj.x >= goal.x - 50
        && obj.x <= goal.x + 50) {

      var stars;
      if (this.attempts < 10) {
        stars = 3;
      } else if (this.attempts < 15) {
        stars = 2;
      } else {
        stars = 1;
      }

      PLAYER_DATA[this._levelNumber - 1] = stars;
      if (this._levelNumber < PLAYER_DATA.length) {
        if (PLAYER_DATA[this._levelNumber] < 0) {
          PLAYER_DATA[this._levelNumber] = 0;
        }
      }
      window.localStorage.setItem('hexscape_progress', JSON.stringify(PLAYER_DATA));
      debugger
      console.log("WON");
    }
  }
}
