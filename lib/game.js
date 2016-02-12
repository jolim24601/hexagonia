var HEX_WIDTH = 100;
var HEX_HEIGHT = 86;
var BALL_RADIUS = 15;
var GRAVITY = 900;
var RESTITUTION = 1/5;

var GRID_WIDTH_OFFSET = 25;
var GRID_HEIGHT_OFFSET = 180;
var EVEN_ROW_X_OFFSET = 43;

var GRID_SIZE_X = 12;
var GRID_SIZE_Y = 5;

var LEVEL_DATA = Hexscape.LEVEL_DATA;

Hexscape.Game = function () {};

Hexscape.Game.prototype = {
  preload: function () {
    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'background');
    this.loadLevel(this._levelNumber);
  },
  loadLevel: function (level) {
    var levelParams = LEVEL_DATA[level - 1];
    var playData = PLAYER_DATA[level - 1];
    playData.attempts = playData.attempts || 0;
    console.log("ATTEMPT:", playData.attempts);
    this.roundWon = false;
    this.movesLeft = levelParams.moves;

    this.createLevel(levelParams);
  },
  createLevel: function (levelParams) {
    this.createMenu();
    this.createMovesInfo(levelParams.moves);

    this.state.backgroundColor = '#0d1f98';
    this.physics.p2.setImpactEvents(true);
    this.physics.p2.restitution = RESTITUTION;
    this.physics.p2.gravity.y = GRAVITY;

    ballCollisionGroup = this.physics.p2.createCollisionGroup();
    hexCollisionGroup = this.physics.p2.createCollisionGroup();
    bouncyCollisionGroup = this.physics.p2.createCollisionGroup();

    this.createBoard(levelParams);
    this.createBall(levelParams.ballPos);
    this.createPortal(levelParams.portalPos);

    // var graphics = this.add.graphics(portal.x, portal.y);
    // graphics.boundsPadding = 0;
    // graphics.lineStyle(5, 0xffffff);
    // graphics.drawEllipse(0, -5, 80, 10);
  },
  createMovesInfo: function (moves) {
    var movesDisplay = this.add.sprite(0, 0, 'display');
    movesDisplay.scale.setTo(1/2);
    var MovesGroup = this.add.group();
    MovesGroup.x = 875; MovesGroup.y = 0;
    MovesGroup.add(movesDisplay)
    this.moveText = this.add.bitmapText(48, 53, 'font72', '' + moves, 36);
    this.moveText.anchor.set(0.5);
    this.moveText.align = 'center';
    MovesGroup.add(this.moveText);
  },
  createMenu: function () {
    var menuButton = this.add.sprite(0, 0, 'display');
    menuButton.scale.setTo(1/2, 1/2);
    MenuGroup = this.add.group();
    MenuGroup.x = GRID_WIDTH_OFFSET; MenuGroup.y = 0;
    var menuLines = this.add.sprite(35, 37, 'menu');
    menuLines.scale.setTo(1/8, 1/8);
    menuLines.alpha = 0.8;
    MenuGroup.add(menuButton);
    MenuGroup.add(menuLines);

    menuButton.inputEnabled = true;
    menuButton.events.onInputDown.add(this.openMenu, this);
  },
  contains: function (arrs, arr) {
    for (var i=0; i < arrs.length; i++) {
      if (arrs[i][0] === arr[0] && arrs[i][1] === arr[1]) {
        return true;
      }
    }

    return false;
  },
  createBoard: function (params) {
    var hexagonGroup = this.add.group();
    hexagonGroup.physicsBodyType = Phaser.Physics.P2JS;

    var hexagonX, hexagonY, hexagon, blockX, blockY, block, bouncy;
    for (var row = 0; row < GRID_SIZE_Y; row++) {
  		for (var col = 0; col < GRID_SIZE_X; col++) {
        if (row % 2 == 0 && col == GRID_SIZE_X - 1) {
          continue;
        } else if (col == 0 || col == GRID_SIZE_X - 1
                  || row % 2 == 0 && col == GRID_SIZE_X - 2
                  || this.contains(params.blockPos, [row, col])) {

          block = this.createSpecialHex(row, col, 'block');
          hexagonGroup.add(block);
          continue;
        } else if (this.contains(params.bouncyPos, [row, col])) {
          bouncy = this.createSpecialHex(row, col, 'bouncy');
          hexagonGroup.add(bouncy);
          continue;
        } else if (row % 2 == 0) {
          hexagonX = HEX_WIDTH * col * (6/7) + EVEN_ROW_X_OFFSET;
        } else {
          hexagonX = HEX_WIDTH * col * (6/7);
        }

        hexagonX += GRID_WIDTH_OFFSET;
        hexagonY = HEX_HEIGHT * row * (7/8) + GRID_HEIGHT_OFFSET;
        hexagon = this.add.sprite(hexagonX, hexagonY, 'hexagon');
        this.physics.p2.enable(hexagon, false);
        hexagonGroup.add(hexagon);
  		}
  	}

    hexagonGroup.forEach(function (hex) {
      hex.body.clearShapes();
      if (hex.key == 'hexagon') {
        hex.body.loadPolygon('sprite_physics', 'hexagon');
        hex.inputEnabled = true;
        hex.events.onInputDown.add(this.click, this);
        hex.body.setCollisionGroup(hexCollisionGroup);
      } else if (hex.key == 'block') {
        hex.body.loadPolygon('sprite_physics', 'block');
        hex.body.setCollisionGroup(hexCollisionGroup);
      } else if (hex.key == 'bouncy') {
        hex.body.loadPolygon('sprite_physics', 'bouncy');
        hex.body.setCollisionGroup(bouncyCollisionGroup);
      }
      hex.body.static = true;
      hex.body.collides(ballCollisionGroup);
    }.bind(this));

  },
  click: function (hexagon) {
    if (this.movesLeft > 0) {
      hexagon.kill();
      this.movesLeft -= 1;
      this.moveText.text = '' + this.movesLeft;
    }
  },
  addBounce: function (ball, pointer) {
    // ball.applyImpulse([2, 2]);
    ball.velocity.x *= 2.2; ball.velocity.y = -2.2;
  },
  createSpecialHex: function (row, col, type) {
    if (row % 2 == 0) {
      xPos = HEX_WIDTH * col * (6/7) + EVEN_ROW_X_OFFSET;
    } else {
      xPos = HEX_WIDTH * col * (6/7);
    }
    xPos += GRID_WIDTH_OFFSET;
    yPos = HEX_HEIGHT * row * (7/8) + GRID_HEIGHT_OFFSET;
    var special;
    if (type == 'block') {
      special = this.add.sprite(xPos, yPos, 'block');
    } else {
      special = this.add.sprite(xPos, yPos, 'bouncy');
    }
    this.physics.p2.enable(special, false);
    return special;
  },
  createPortal: function (pos) {
    portal = this.add.sprite(pos[0], pos[1], 'gravity_portal');
    portal.scale.setTo(1/3, 1/4);
  },
    createBall: function (pos) {
    ball = this.add.sprite(pos[0], pos[1], 'ball');
    ball.scale.setTo(3/4, 3/4);
    this.physics.p2.enable(ball, false);
    ball.body.setCircle(BALL_RADIUS);
    ball.body.setCollisionGroup(ballCollisionGroup);
    ball.body.collides(hexCollisionGroup);
    ball.body.collides(bouncyCollisionGroup, this.addBounce, this);
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(this.gameLost, this);
  },
  openMenu: function () {
    var tween = this.add.tween(MenuGroup.scale)
      .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
      .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
      .start();
    tween.onComplete.add(function() {
      PLAYER_DATA[this._levelNumber - 1].attempts += 1;
      this.state.start('LevelSelect');
    }.bind(this));
  },
  update: function () {
    if (ball.x > (portal.x + BALL_RADIUS) && ball.x < (portal.x + portal.width - BALL_RADIUS)
        && ball.y > portal.y) {
          this.roundWon = true;
          console.log("WON");
          this.gameWon();
        }
  },
  gameWon: function () {
    // make the ball 'hover' in place
    // this.gravity.y = 0;
    // this.animations.add('fly', [0,1,2,3,4,5], 30, true);
    var playData = PLAYER_DATA[this._levelNumber - 1];

    var stars;
    if (playData.attempts < 5) {
      stars = 3;
    } else if (playData.attempts < 10) {
      stars = 2;
    } else {
      stars = 1;
    }

    playData.attempts = 0;
    playData.stars = stars;

    if (this._levelNumber < PLAYER_DATA.length) {
      if (PLAYER_DATA[this._levelNumber].stars < 0) {
        PLAYER_DATA[this._levelNumber].stars = 0;
      }
    }
    window.localStorage.setItem('hexscape_progress', JSON.stringify(PLAYER_DATA));
    this.state.start('LevelSelect');
  },
  gameLost: function (ball) {
    if (this.roundWon) { return; }
    PLAYER_DATA[this._levelNumber - 1].attempts += 1;
    this.state.start('LevelSelect');
    console.log("LOST");
  },
}
