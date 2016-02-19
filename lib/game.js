Hexscape.Game = function () {
  this.ball;
  this.hexCollisionGroup;
  this.bouncyCollisionGroup;
  this.ballCollisionGroup;
  this.hexagonGroup;
  this.portalGroup;
  this.helperGroup;
  this.menuGroup;
  this.containerGroup;
  this.optionsGroup;
  this.resetGroup;
  this.soundGroup;
  this.infoGroup;
  this.levelSelectGroup;
};

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
    this.teleported = false;
    this.teleports = [];
    this.roundWon = false;
    this.levelParams = Hexscape.LEVEL_DATA[level - 1];
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
    this.physics.p2.restitution = Hexscape.RESTITUTION;
    this.physics.p2.gravity.y = Hexscape.GRAVITY;

    this.ballCollisionGroup = this.physics.p2.createCollisionGroup();
    this.hexCollisionGroup = this.physics.p2.createCollisionGroup();
    this.bouncyCollisionGroup = this.physics.p2.createCollisionGroup();

    this.createBoard(levelParams);
    this.createBall(levelParams.ballPos);
    this.createPortal(levelParams.portalPos);

    if (this._levelNumber === 1
        && PLAYER_DATA[this._levelNumber - 1].attempts === 1) {
      this.showInstructions();
    }
  },
  update: function () {
    this.checkOverlap(this.teleports, this.ball);

    if (this.ball.x > (this.portalGroup.x + Hexscape.BALL_RADIUS)
        && this.ball.x < (this.portalGroup.x + this.portalGroup.width - Hexscape.BALL_RADIUS)
        && this.ball.y > this.portalGroup.y
        && this.ball.inWorld
        && !this.roundWon) {

          this.roundWon = true;
          this.gameWon();

    } else if (!this.roundWon && !this.ball.inWorld) {
      this.state.restart();
    }
  },
  checkOverlap: function (teleports, ball) {
    if (this.teleported) { return; }
    for (var i=0; i < teleports.length; i++) {
      var teleport = teleports[i];
      var destination = i === 0 ? teleports[1] : teleports[0];
      if (ball.x > teleport.xPos - teleport.sprite.width/2
        && ball.x < teleport.xPos + teleport.sprite.width/2
        && ball.y > teleport.yPos
        && ball.y < teleport.yPos + teleport.sprite.height/2) {

          this.teleport(destination);
      }
    }
  },
  createResetButton: function () {
    this.resetGroup = this.add.group();
    var resetButton = this.add.sprite(0, 0, 'display');
    resetButton.scale.setTo(1/2);
    var resetSym = this.add.sprite(32, 32, 'reset');
    resetSym.scale.setTo(1/8);
    resetSym.alpha = 0.5;
    this.resetGroup.add(resetButton);
    this.resetGroup.add(resetSym);
    this.resetGroup.x = Hexscape.GRID_WIDTH_OFFSET + 100;
    this.resetGroup.y = 0;

    resetButton.inputEnabled = true;
    resetButton.events.onInputDown.add(this.restartLevel, this);
  },
  restartLevel: function () {
    var tween = this.add.tween(this.resetGroup.scale)
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
    this.menuGroup = this.add.group();
    this.menuGroup.x = Hexscape.GRID_WIDTH_OFFSET;
    this.menuGroup.y = 0;
    var menuLines = this.add.sprite(35, 37, 'menu');
    menuLines.scale.setTo(1/8, 1/8);
    menuLines.alpha = 0.8;
    this.menuGroup.add(menuButton);
    this.menuGroup.add(menuLines);

    menuButton.inputEnabled = true;
    menuButton.events.onInputDown.add(this.pauseGame, this);
  },
  createInfoButton: function () {
    var infoGon = this.add.sprite(0, 0, 'display');
    var infoSym = this.add.sprite(-10, 25, 'info');
    infoGon.scale.setTo(1/2);
    infoSym.scale.setTo(1/2);
    infoSym.alpha = 0.5;

    this.InfoGroup = this.add.group();
    this.InfoGroup.add(infoGon);
    this.InfoGroup.add(infoSym);
    this.InfoGroup.x = Hexscape.GRID_WIDTH_OFFSET + 200;
    this.InfoGroup.y = 0;
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
    this.hexagonGroup = this.add.group();
    this.hexagonGroup.physicsBodyType = Phaser.Physics.P2JS;

    var hexagonX, hexagonY, hexagon, blockX, blockY, block, bouncy;
    for (var row = 0; row < Hexscape.GRID_SIZE_Y; row++) {
  		for (var col = 0; col < Hexscape.GRID_SIZE_X; col++) {
        if (row % 2 == 0 && col == Hexscape.GRID_SIZE_X - 1) {
          continue;
        } else if (col == 0 || col == Hexscape.GRID_SIZE_X - 1
                  || row % 2 == 0 && col == Hexscape.GRID_SIZE_X - 2
                  || this.contains(params.blockPos, [row, col])) {

          block = this.createSpecialHex(row, col, 'block');
          this.hexagonGroup.add(block);
          continue;
        } else if (this.contains(params.bouncyPos, [row, col])) {
          bouncy = this.createSpecialHex(row, col, 'bouncy');
          this.hexagonGroup.add(bouncy);
          continue;
        } else if (this.contains(params.telePos, [row, col])) {
          tele = this.createSpecialHex(row, col, 'tele');
          this.hexagonGroup.add(tele);
          continue;
        } else if (row % 2 == 0) {
          hexagonX = Hexscape.HEX_WIDTH * col * (6/7) + Hexscape.EVEN_ROW_X_OFFSET;
        } else {
          hexagonX = Hexscape.HEX_WIDTH * col * (6/7);
        }

        hexagonX += Hexscape.GRID_WIDTH_OFFSET;
        hexagonY = Hexscape.HEX_HEIGHT * row * (7/8) + Hexscape.GRID_HEIGHT_OFFSET;
        hexagon = this.add.sprite(hexagonX, hexagonY, 'hexagon');
        this.physics.p2.enable(hexagon, false);
        this.hexagonGroup.add(hexagon);
  		}
  	}

    this.hexagonGroup.forEach(function (hex) {
      hex.body.clearShapes();
      if (hex.key == 'hexagon') {
        hex.body.loadPolygon('sprite_physics', 'hexagon');
        hex.inputEnabled = true;
        hex.events.onInputDown.add(this.click, this);
        hex.body.setCollisionGroup(this.hexCollisionGroup);
      } else if (hex.key == 'block') {
        hex.body.loadPolygon('sprite_physics', 'block');
        hex.body.setCollisionGroup(this.hexCollisionGroup);
      } else if (hex.key == 'bouncy') {
        hex.body.loadPolygon('sprite_physics', 'bouncy');
        hex.body.setCollisionGroup(this.bouncyCollisionGroup);
      } else {
        hex.body.loadPolygon('sprite_physics', 'teleport');
      }
      hex.body.static = true;
      hex.body.collides(this.ballCollisionGroup);
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
  teleport: function (teleport) {
    this.ball.reset(teleport.xPos, teleport.yPos);
    this.teleported = true;
  },
  createSpecialHex: function (row, col, type) {
    if (row % 2 == 0) {
      xPos = Hexscape.HEX_WIDTH * col * (6/7) + Hexscape.EVEN_ROW_X_OFFSET;
    } else {
      xPos = Hexscape.HEX_WIDTH * col * (6/7);
    }
    xPos += Hexscape.GRID_WIDTH_OFFSET;
    yPos = Hexscape.HEX_HEIGHT * row * (7/8) + Hexscape.GRID_HEIGHT_OFFSET;
    var special;
    if (type == 'block') {
      special = this.add.sprite(xPos, yPos, 'block');
    } else if (type == 'bouncy') {
      special = this.add.sprite(xPos, yPos, 'bouncy');
    } else {
      special = this.add.sprite(xPos, yPos, 'teleport');
      var teleport = { xPos: xPos, yPos: yPos, sprite: special }
      this.teleports.push(teleport);
    }
    this.physics.p2.enable(special, false);
    return special;
  },
  createPortal: function (pos) {
    this.portalGroup = this.add.sprite(pos[0], pos[1], 'gravity_portal');
    this.portalGroup.scale.setTo(1/3, 1/4);
  },
  createBall: function (pos) {
    this.ball = this.add.sprite(pos[0], pos[1], 'ball');
    this.ball.scale.setTo(3/4, 3/4);
    this.physics.p2.enable(this.ball, false);
    this.ball.body.setCircle(Hexscape.BALL_RADIUS);
    this.ball.body.setCollisionGroup(this.ballCollisionGroup);
    this.ball.body.collides(this.hexCollisionGroup);
    this.ball.body.collides(this.bouncyCollisionGroup, this.addBounce, this);
  },
  pauseGame: function () {
    this.animateIcon(this.menuGroup, function() {
      // disable click events for hexagons
      this.hexagonGroup.visible = false;
      this.showMenu();
    }.bind(this));
  },
  unPause: function (sprite, pointer) {
    this.containerGroup.destroy();
    this.optionsGroup && this.optionsGroup.destroy();
    this.helperGroup && this.helperGroup.destroy();
    this.hexagonGroup.visible = true;
  },
  createModal: function () {
    this.containerGroup = this.add.group();
    var container = this.add.sprite(0, 0, 'container');
    this.containerGroup.add(container);
    container.alpha = 0.4;
    container.inputEnabled = true;
    container.events.onInputDown.add(this.unPause, this);
  },
  showMenu: function () {
    this.createModal();
    this.createOptions();
  },
  createOptions: function () {
    this.optionsGroup = this.add.group();
    var modal = this.add.sprite(0, 0, 'modal');
    this.optionsGroup.add(modal);
    this.optionsGroup.x = this.world.centerX;
    this.optionsGroup.y = this.world.centerY;
    modal.anchor.x = 0.5; modal.anchor.y = 0.5

    var style = { font: "18px Arial", fill: "#ffffff", align: "center" };
    var attempts = PLAYER_DATA[this._levelNumber - 1].attempts;
    var levelText = this.add.text(25, -75, 'Level: ' + this._levelNumber, style);
    var attemptsText = this.add.text(25, -50, 'Attempts: ' + attempts, style);
    levelText.alpha = 0.8;
    attemptsText.alpha = 0.8;
    this.optionsGroup.add(levelText);
    this.optionsGroup.add(attemptsText);

    this.createBackButton();
    this.createMuteButton();

    // reset is here due to this call being async
    if (this.roundWon) {
      PLAYER_DATA[this._levelNumber - 1].attempts = 0;
    }
  },
  createBackButton: function () {
    this.levelSelectGroup = this.add.group();
    var levelSelectGon = this.add.sprite(0, 0, 'display');
    this.levelSelectGroup.add(levelSelectGon);
    var levelGridIcon = this.add.sprite(28, 28, 'grid');
    levelGridIcon.scale.setTo(1/3);
    levelSelectGon.scale.setTo(1/2);
    this.levelSelectGroup.add(levelGridIcon);
    this.optionsGroup.add(this.levelSelectGroup);
    this.levelSelectGroup.x = -200;
    this.levelSelectGroup.y = -100;
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
    this.soundGroup = this.add.group();
    this.soundGroup.add(soundGon);
    this.soundGroup.add(soundSym);
    this.optionsGroup.add(this.soundGroup);
    this.soundGroup.x = -200;
    this.soundGroup.y = 0;
    soundGon.inputEnabled = true;
    soundGon.events.onInputDown.add(this.mute, this);
  },
  mute: function () {
    this.animateIcon(this.soundGroup);

    if (this.sound.mute) {
      this.soundGroup.resetChild(this.soundGroup.children[1], null, null, 'sound')
      this.soundGroup.children[1].scale.setTo(1/4);
      this.soundGroup.children[1].x = 17;
      this.soundGroup.children[1].y = 8;
      this.sound.mute = false;
    } else {
      this.soundGroup.resetChild(this.soundGroup.children[1], null, null, 'mute')
      this.soundGroup.children[1].scale.setTo(1/4);
      this.soundGroup.children[1].x = 25;
      this.soundGroup.children[1].y = 25;
      this.sound.mute = true;
    }
  },
  goBack: function () {
    this.animateIcon(this.levelSelectGroup, function() {
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
      + 'Use any available rainbow hexagons to give the ball extra bounce.\n'
      + 'Static hexagons allow you to teleport to their nearest neighbor. Good luck!'
      , style);

    this.helperGroup = this.add.group();
    this.helperGroup.add(instructions);
    this.helperGroup.x = this.world.centerX - this.helperGroup.width/2;
    this.helperGroup.y = this.world.centerY - this.helperGroup.height/2;
    this.containerGroup.add(this.helperGroup);
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
    this.optionsGroup.add(congrats);
    this.optionsGroup.add(award);

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
