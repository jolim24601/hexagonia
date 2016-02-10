var PLAYER_DATA;

LevelSelect = function (game) {
  this.game = game;
  this.holdIcons = [];
};

LevelSelect.prototype = {
  preload: function () {
    this.game.load.spritesheet('stars', 'assets/stars.png', 96, 96);
    this.game.load.image('level', 'assets/level.png');
    this.game.load.image('lock', 'assets/lock.png');
    this.game.load.bitmapFont('font72', 'assets/font72.png', 'assets/font72.xml');
    this.initProgressData();
  },
  create: function () {
    this.game.stage.backgroundColor = 0x000000;
    this.title = this.game.add.bitmapText(0, 35, 'font72', 'Hexscape', 72);
    this.title.x = this.game.width / 2 - this.title.textWidth / 2;

    this.createLevelIcons();
    this.animateLevelIcons();
  },
  initProgressData: function () {
    if (!PLAYER_DATA) {
      var str = window.localStorage.getItem('hexscape_progress');
      PLAYER_DATA = JSON.parse(str) || [];
    }
  },
  createLevelIcons: function () {
    var level = 0;

    for (var y=0; y < 3; y++) {
      for (var x=0; x < 4; x++) {
        level = level + 1;

        if (typeof PLAYER_DATA[level - 1] !== 'number') {
          if (level == 1) {
            PLAYER_DATA[level - 1] = 0;
          } else {
            PLAYER_DATA[level - 1] = -1;
          }
        }

        var playData = PLAYER_DATA[level - 1];

        var isLocked = true;
        var stars = 0;

        if (playData > -1) {
          isLocked = false;
          if (playData < 4) { stars = playData; }
        }
        var xpos = 235 + (x * 128);
        var ypos = 120 + (y * 128);

        this.holdIcons[level - 1] = this.createLevelIcon(xpos, ypos, level, isLocked, stars);
        var backIcon = this.holdIcons[level - 1].getAt(0);
        backIcon.health = level;
        backIcon.inputEnabled = true;
        backIcon.events.onInputDown.add(this.onSpriteDown, this);
      }
    }
  },
  createLevelIcon: function (xpos, ypos, level, isLocked, stars) {
    var IconGroup = this.game.add.group();
    IconGroup.x = xpos;
    IconGroup.y = ypos;

    var icon1, icon2, icon3, text;
    if (isLocked === false) {
      text = this.game.add.bitmapText(50, 50, 'font72', '' + level, 36);
      icon1 = this.game.add.sprite(12, 20, 'level');
      icon2 = this.game.add.sprite(2, 40, 'stars', (2 + stars));
      IconGroup.add(icon1);
      IconGroup.add(icon2);
      IconGroup.add(text);
    } else {
      icon3 = this.game.add.sprite(0, 0, 'lock');
      IconGroup.add(icon3);
    }

    return IconGroup;
  },
  onSpriteDown: function (sprite, pointer) {
    var level = sprite.health;
    var IconGroup = this.holdIcons[level - 1];

    if (PLAYER_DATA[level - 1] < 0) {
      var xpos = IconGroup.x;
      this.game.add.tween(IconGroup)
        .to({ x: xpos + 6 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos - 5 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos + 4 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos - 3 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos + 2 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos }, 20, Phaser.Easing.Linear.None)
        .start();
    } else {
      var tween = this.game.add.tween(IconGroup.scale)
        .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
        .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
        .start();


      tween.onComplete.add(function() { this.onLevelSelected(sprite.health) }, this);
    }
  },
  animateLevelIcons: function () {
    for (var i=0; i < this.holdIcons.length; i++) {
      var IconGroup = this.holdIcons[i];
      IconGroup.y = IconGroup.y + 600;
      var y = IconGroup.y

      this.game.add.tween(IconGroup).to({ y: y - 600 }, 500, Phaser.Easing.Back.Out, true, (i * 25));
    }
  },
  onLevelSelected: function (level) {
    this.game.state.states['Game']._levelNumber = level;
    this.state.start('Game');
  }
}
