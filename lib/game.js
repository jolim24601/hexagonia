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

var ball;
var HexCollisionGroup, BouncyCollisionGroup, BallCollisionGroup;
var HexagonGroup, PortalGroup, HelperGroup, MenuGroup, ContainerGroup, OptionsGroup;
var ResetGroup, SoundGroup, InfoGroup, LevelSelectGroup;

Hexscape.Game = function () {};

Hexscape.Game.prototype = {
  preload: function () {
    // clear timeout if this is not the first round of session
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'background');
    this.loadLevel(this._levelNumber);
    this.clickFx = this.add.audio('reverse');
  },
  loadLevel: function (level) {
    var playData = PLAYER_DATA[level - 1];
    playData.attempts = playData.attempts + 1 || 1;
    this.roundWon = false;
    this.levelParams = LEVEL_DATA[level - 1];
    this.movesLeft = this.levelParams.moves;

    this.savePlayerData();
  },
  create: function () {
    var levelParams = this.levelParams;
    this.createMenu();
    this.createMovesInfo(levelParams.moves);
    this.createInfoButton();
    this.createResetButton();

    this.state.backgroundColor = '#0d1f98';
    this.physics.p2.setImpactEvents(true);
    this.physics.p2.restitution = RESTITUTION;
    this.physics.p2.gravity.y = GRAVITY;

    BallCollisionGroup = this.physics.p2.createCollisionGroup();
    HexCollisionGroup = this.physics.p2.createCollisionGroup();
    BouncyCollisionGroup = this.physics.p2.createCollisionGroup();

    this.createBoard(levelParams);
    this.createBall(levelParams.ballPos);
    this.createPortal(levelParams.portalPos);
  },
  update: function () {
    if (ball.x > (PortalGroup.x + BALL_RADIUS)
        && ball.x < (PortalGroup.x + PortalGroup.width - BALL_RADIUS)
        && ball.y > PortalGroup.y
        && ball.inWorld
        && !this.roundWon) {

          this.roundWon = true;
          this.gameWon();

    } else if (!this.roundWon && !ball.inWorld) {
      this.state.restart();
    }
  },
  createResetButton: function () {
    ResetGroup = this.add.group();
    var resetButton = this.add.sprite(0, 0, 'display');
    resetButton.scale.setTo(1/2);
    var resetSym = this.add.sprite(32, 32, 'reset');
    resetSym.scale.setTo(1/8);
    resetSym.alpha = 0.5;
    ResetGroup.add(resetButton);
    ResetGroup.add(resetSym);
    ResetGroup.x = GRID_WIDTH_OFFSET + 100;
    ResetGroup.y = 0;

    resetButton.inputEnabled = true;
    resetButton.events.onInputDown.add(this.restartLevel, this);
  },
  restartLevel: function () {
    var tween = this.add.tween(ResetGroup.scale)
      .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
      .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
      .start();

    tween.onComplete.add(function () {
      this.state.restart();
    }.bind(this));
  },
  createMovesInfo: function (moves) {
    var movesDisplay = this.add.sprite(0, 0, 'display');
    movesDisplay.scale.setTo(1/2);
    MovesGroup = this.add.group();
    MovesGroup.x = 875;
    MovesGroup.y = 0;
    MovesGroup.add(movesDisplay)
    var style = { font: "36px Arial", fill: "#ffffff", align: "center" };
    this.moveText = this.add.text(48, 53, '' + moves, style);
    this.moveText.anchor.set(0.5);
    this.moveText.align = 'center';
    MovesGroup.add(this.moveText);
  },
  createMenu: function () {
    var menuButton = this.add.sprite(0, 0, 'display');
    menuButton.scale.setTo(1/2);
    MenuGroup = this.add.group();
    MenuGroup.x = GRID_WIDTH_OFFSET;
    MenuGroup.y = 0;
    var menuLines = this.add.sprite(35, 37, 'menu');
    menuLines.scale.setTo(1/8, 1/8);
    menuLines.alpha = 0.8;
    MenuGroup.add(menuButton);
    MenuGroup.add(menuLines);

    menuButton.inputEnabled = true;
    menuButton.events.onInputDown.add(this.pauseGame, this);
  },
  createInfoButton: function () {
    var infoGon = this.add.sprite(0, 0, 'display');
    var infoSym = this.add.sprite(-10, 25, 'info');
    infoGon.scale.setTo(1/2);
    infoSym.scale.setTo(1/2);
    infoSym.alpha = 0.5;

    InfoGroup = this.add.group();
    InfoGroup.add(infoGon);
    InfoGroup.add(infoSym);
    InfoGroup.x = GRID_WIDTH_OFFSET + 200;
    InfoGroup.y = 0;
    infoGon.inputEnabled = true;
    infoGon.events.onInputDown.add(this.showInstructions, this);
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
    HexagonGroup = this.add.group();
    HexagonGroup.physicsBodyType = Phaser.Physics.P2JS;

    var hexagonX, hexagonY, hexagon, blockX, blockY, block, bouncy;
    for (var row = 0; row < GRID_SIZE_Y; row++) {
  		for (var col = 0; col < GRID_SIZE_X; col++) {
        if (row % 2 == 0 && col == GRID_SIZE_X - 1) {
          continue;
        } else if (col == 0 || col == GRID_SIZE_X - 1
                  || row % 2 == 0 && col == GRID_SIZE_X - 2
                  || this.contains(params.blockPos, [row, col])) {

          block = this.createSpecialHex(row, col, 'block');
          HexagonGroup.add(block);
          continue;
        } else if (this.contains(params.bouncyPos, [row, col])) {
          bouncy = this.createSpecialHex(row, col, 'bouncy');
          HexagonGroup.add(bouncy);
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
        HexagonGroup.add(hexagon);
  		}
  	}

    HexagonGroup.forEach(function (hex) {
      hex.body.clearShapes();
      if (hex.key == 'hexagon') {
        hex.body.loadPolygon('sprite_physics', 'hexagon');
        hex.inputEnabled = true;
        hex.events.onInputDown.add(this.click, this);
        hex.body.setCollisionGroup(HexCollisionGroup);
      } else if (hex.key == 'block') {
        hex.body.loadPolygon('sprite_physics', 'block');
        hex.body.setCollisionGroup(HexCollisionGroup);
      } else if (hex.key == 'bouncy') {
        hex.body.loadPolygon('sprite_physics', 'bouncy');
        hex.body.setCollisionGroup(BouncyCollisionGroup);
      }
      hex.body.static = true;
      hex.body.collides(BallCollisionGroup);
    }.bind(this));
  },
  click: function (hexagon) {
    if (this.movesLeft > 0) {
      this.clickFx.play();
      hexagon.destroy();
      this.movesLeft -= 1;
      this.moveText.text = '' + this.movesLeft;
    }
  },
  addBounce: function (ball, pointer) {
    ball.velocity.x *= 2.2;
    ball.velocity.y = -2.2;
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
    PortalGroup = this.add.sprite(pos[0], pos[1], 'gravity_portal');
    PortalGroup.scale.setTo(1/3, 1/4);
  },
  createBall: function (pos) {
    ball = this.add.sprite(pos[0], pos[1], 'ball');
    ball.scale.setTo(3/4, 3/4);
    this.physics.p2.enable(ball, false);
    ball.body.setCircle(BALL_RADIUS);
    ball.body.setCollisionGroup(BallCollisionGroup);
    ball.body.collides(HexCollisionGroup);
    ball.body.collides(BouncyCollisionGroup, this.addBounce, this);
  },
  pauseGame: function () {
    this.animateIcon(MenuGroup, function() {
      // disable click events for hexagons
      HexagonGroup.visible = false;
      this.showMenu();
    }.bind(this));
  },
  unPause: function (sprite, pointer) {
    ContainerGroup.destroy();
    OptionsGroup && OptionsGroup.destroy();
    HelperGroup && HelperGroup.destroy();
    HexagonGroup.visible = true;
  },
  createModal: function () {
    ContainerGroup = this.add.group();
    var container = this.add.sprite(0, 0, 'container');
    ContainerGroup.add(container);
    container.alpha = 0.4;
    container.inputEnabled = true;
    container.events.onInputDown.add(this.unPause, this);
  },
  showMenu: function () {
    this.createModal();
    this.createOptions();
  },
  createOptions: function () {
    OptionsGroup = this.add.group();
    var modal = this.add.sprite(0, 0, 'modal');
    OptionsGroup.add(modal);
    OptionsGroup.x = this.world.centerX;
    OptionsGroup.y = this.world.centerY;
    modal.anchor.x = 0.5; modal.anchor.y = 0.5

    var style = { font: "18px Arial", fill: "#ffffff", align: "center" };
    var attempts = PLAYER_DATA[this._levelNumber - 1].attempts;
    var levelText = this.add.text(25, -75, 'Level: ' + this._levelNumber, style);
    var attemptsText = this.add.text(25, -50, 'Attempts: ' + attempts, style);
    levelText.alpha = 0.8;
    attemptsText.alpha = 0.8;
    OptionsGroup.add(levelText);
    OptionsGroup.add(attemptsText);

    this.createBackButton();
    this.createMuteButton();

    // reset is here due to this call being async
    if (this.roundWon) {
      PLAYER_DATA[this._levelNumber - 1].attempts = 0;
    }
  },
  createBackButton: function () {
    LevelSelectGroup = this.add.group();
    var levelSelectGon = this.add.sprite(0, 0, 'display');
    LevelSelectGroup.add(levelSelectGon);
    var levelGridIcon = this.add.sprite(28, 28, 'grid');
    levelGridIcon.scale.setTo(1/3);
    levelSelectGon.scale.setTo(1/2);
    LevelSelectGroup.add(levelGridIcon);
    OptionsGroup.add(LevelSelectGroup);
    LevelSelectGroup.x = -200;
    LevelSelectGroup.y = -100;
    levelSelectGon.inputEnabled = true;
    levelSelectGon.events.onInputDown.add(this.goBack, this);
  },
  createMuteButton: function () {
    var soundGon = this.add.sprite(0, 0, 'display');
    soundGon.scale.setTo(1/2);
    var soundSym;
    if (this.sound.mute) {
      soundSym = this.add.sprite(25, 25, 'mute');
    } else {
      soundSym = this.add.sprite(17, 8, 'sound');
    }
    soundSym.scale.setTo(1/4);
    soundSym.alpha = 0.6;
    SoundGroup = this.add.group();
    SoundGroup.add(soundGon);
    SoundGroup.add(soundSym);
    OptionsGroup.add(SoundGroup);
    SoundGroup.x = -200;
    SoundGroup.y = 0;
    soundGon.inputEnabled = true;
    soundGon.events.onInputDown.add(this.mute, this);
  },
  mute: function () {
    this.animateIcon(SoundGroup);

    if (this.sound.mute) {
      SoundGroup.resetChild(SoundGroup.children[1], null, null, 'sound')
      SoundGroup.children[1].scale.setTo(1/4);
      SoundGroup.children[1].x = 17;
      SoundGroup.children[1].y = 8;
      this.sound.mute = false;
    } else {
      SoundGroup.resetChild(SoundGroup.children[1], null, null, 'mute')
      SoundGroup.children[1].scale.setTo(1/4);
      SoundGroup.children[1].x = 25;
      SoundGroup.children[1].y = 25;
      this.sound.mute = true;
    }
  },
  goBack: function () {
    this.animateIcon(LevelSelectGroup, function() {
      clearTimeout(this.timeout);
      this.timeout = null;
      this.state.start('LevelSelect');
    }.bind(this));
  },
  animateIcon: function (icon, cb) {
    var tween = this.add.tween(icon.scale)
      .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
      .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
      .start();

    tween.onComplete.add(function () { cb && cb() });
  },
  showInstructions: function () {
    this.createModal();

    var style = { font: "18px Arial", fill: "#ffffff", align: "left" };

    var instructions = this.add.text(0, 0,
      'Instructions:\n'
      + 'Guide the ball into the gravity portal by clicking the red-colored hexagons.\n'
      + 'Be aware of how many moves you can play in the top right corner.\n'
      + 'Finally, use any available rainbow hexagons to give the ball extra bounce. Good luck!'
      , style);

    HelperGroup = this.add.group();
    HelperGroup.add(instructions);
    HelperGroup.x = this.world.centerX - HelperGroup.width/2;
    HelperGroup.y = this.world.centerY - HelperGroup.height/2;
    ContainerGroup.add(HelperGroup);
  },
  gameWon: function () {
    var playData = PLAYER_DATA[this._levelNumber - 1];

    var stars;
    if (playData.attempts < 5) {
      stars = 3;
    } else if (playData.attempts < 10) {
      stars = 2;
    } else {
      stars = 1;
    }

    playData.stars = stars;
    if (this._levelNumber < PLAYER_DATA.length) {
      if (PLAYER_DATA[this._levelNumber].stars < 0) {
        PLAYER_DATA[this._levelNumber].stars = 0;
      }
    }

    this.showMenu();

    var style = { font: "18px Arial", fill: "#fffd2a", align: "center" };
    var congrats = this.add.text(0, 30, 'Congrats! You won.', style);
    var award = this.add.sprite(15, 30, 'stars', (2 + stars));
    congrats.anchor.y = 0.5;
    award.anchor.y = 0.5;
    OptionsGroup.add(congrats);
    OptionsGroup.add(award);

    if (!this.timeout) {
      this.timeout = setTimeout(function () {
        this.state.start('LevelSelect')
      }.bind(this), 2500);
    }

    this.savePlayerData();
  },
  savePlayerData: function () {
    window.localStorage.setItem('hexscape_progress', JSON.stringify(PLAYER_DATA));
  }
}
