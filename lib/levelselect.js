var Hexscape = Hexscape || {};
var PLAYER_DATA;

Hexscape.LevelSelect = function () {
  this.holdIcons = [];
};

Hexscape.LevelSelect.prototype = {
  preload: function () {
    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'background');
    this.initProgressData();
  },
  create: function () {
    this.stage.backgroundColor = 0x000000;

    var title = this.add.bitmapText(0, 35, 'font72', 'Hexscape', 72);
    title.x = this.world.centerX - title.width / 2;

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
        level++;

        PLAYER_DATA[level - 1] = PLAYER_DATA[level - 1] || {};
        if (typeof PLAYER_DATA[level - 1].stars !== 'number') {
          if (level == 1) {
            PLAYER_DATA[level - 1].stars = 0;
          } else {
            PLAYER_DATA[level - 1].stars = -1;
          }
        }

        var playData = PLAYER_DATA[level - 1];

        var isLocked = true;
        var stars = 0;

        if (playData.stars > -1) {
          isLocked = false;
          if (playData.stars < 4) { stars = playData.stars; }
        }
        var xpos = 235 + (x * 128);
        var ypos = 120 + (y * 128);

        this.holdIcons[level - 1] = this.createLevelIcon(xpos, ypos, level, isLocked, stars);
        var backIcon = this.holdIcons[level - 1].getAt(0);
        backIcon.level = level;
        backIcon.inputEnabled = true;
        backIcon.events.onInputDown.add(this.onSpriteDown, this);
      }
    }
  },
  createLevelIcon: function (xpos, ypos, level, isLocked, stars) {
    var IconGroup = this.add.group();
    IconGroup.x = xpos;
    IconGroup.y = ypos;

    var icon1, icon2, icon3, text;
    // icon1 = this.add.sprite(12, 20, 'level');
    if (isLocked === false) {
      text = this.add.bitmapText(60, 70, 'font72', '' + level, 36);
      text.align = 'center';
      text.anchor.set(0.5);
      icon1 = this.add.sprite(12, 20, 'level');
      icon2 = this.add.sprite(2, 40, 'stars', (2 + stars));
      IconGroup.add(icon1);
      IconGroup.add(icon2);
      IconGroup.add(text);
    } else {
      icon3 = this.add.sprite(20, 20, 'lock');
      icon3.scale.setTo(2/3);
      IconGroup.add(icon3);
    }

    return IconGroup;
  },
  onSpriteDown: function (sprite, pointer) {
    var level = sprite.level;
    var IconGroup = this.holdIcons[level - 1];

    if (PLAYER_DATA[level - 1].stars < 0) {
      var xpos = IconGroup.x;
      this.add.tween(IconGroup)
        .to({ x: xpos + 6 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos - 5 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos + 4 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos - 3 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos + 2 }, 20, Phaser.Easing.Linear.None)
        .to({ x: xpos }, 20, Phaser.Easing.Linear.None)
        .start();
    } else {
      var tween = this.add.tween(IconGroup.scale)
        .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
        .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
        .start();

      tween.onComplete.add(function() { this.onLevelSelected(sprite.level) }, this);
    }
  },
  animateLevelIcons: function () {
    for (var i=0; i < this.holdIcons.length; i++) {
      var IconGroup = this.holdIcons[i];
      IconGroup.y = IconGroup.y + 600;
      var y = IconGroup.y

      this.add.tween(IconGroup).to({ y: y - 600 }, 500, Phaser.Easing.Back.Out, true, (i * 25));
    }
  },
  onLevelSelected: function (level) {
    this.state.states['Game']._levelNumber = level;
    this.state.start('Game');
  }
}
