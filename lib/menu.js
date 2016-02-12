var Hexscape = Hexscape || {};

Hexscape.Menu = function () {
  this.holdIcons = [];
};

Hexscape.Menu.prototype = {
  preload: function () {
    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'background');
  },
  create: function () {
    music = this.add.audio('theme');
    music.play();

    var title = this.add.bitmapText(0, 35, 'font72', 'Hexscape', 72);
    title.x = this.world.centerX - title.width / 2;

    var infoGon = this.add.sprite(0, 0, 'level');
    var infoSym = this.add.sprite(-10, 25, 'info');
    infoSym.scale.setTo(1/2);
    var soundGon = this.add.sprite(0, 0, 'level');
    var soundSym = this.add.sprite(5, -5, 'sound');
    soundSym.scale.setTo(1/3);
    var playGon = this.add.sprite(0, 0, 'level');
    var playSym = this.add.sprite(20, 20, 'play');
    playSym.scale.setTo(1/2);

    var infoGroup = this.add.group();
    infoGroup.add(infoGon);
    infoGroup.add(infoSym);
    infoGroup.x = this.world.centerX - infoGroup.width / 2 - 100;
    infoGroup.y = this.world.centerY - 100;
    infoGon.inputEnabled = true;
    infoGon.events.onInputDown.add(this.showInstructions, this);
    this.holdIcons.push(infoGroup);

    var soundGroup = this.add.group();
    soundGroup.add(soundGon);
    soundGroup.add(soundSym);
    soundGroup.x = this.world.centerX - soundGroup.width / 2;
    soundGroup.y = this.world.centerY - 100;
    soundGon.inputEnabled = true;
    soundGon.events.onInputDown.add(this.mute, this);
    this.holdIcons.push(soundGroup);

    var playGroup = this.add.group();
    playGroup.add(playGon);
    playGroup.add(playSym);
    playGroup.x = this.world.centerX - playGroup.width / 2 + 110;
    playGroup.y = this.world.centerY - 100;
    playGon.inputEnabled = true;
    playGon.events.onInputDown.add(this.play, this);
    this.holdIcons.push(playGroup);
  },
  animateIcon: function (icon, cb) {
    var tween = this.add.tween(icon.scale)
      .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
      .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
      .start();

    tween.onComplete.add(function () { cb && cb() });
  },
  play: function () {
    var playIcon = this.holdIcons[2];
    this.animateIcon(playIcon, function () {
      this.state.start('LevelSelect');
    }.bind(this));
  },
  mute: function () {
    var soundIcon = this.holdIcons[1];
    this.animateIcon(soundIcon);

    if (music.mute) {
      soundIcon.resetChild(soundIcon.children[1], null, null, 'sound')
      soundIcon.children[1].scale.setTo(1/3);
      soundIcon.children[1].x = 5;
      soundIcon.children[1].y = -5;
      music.mute = false;
    } else {
      soundIcon.resetChild(soundIcon.children[1], null, null, 'mute')
      soundIcon.children[1].scale.setTo(1/4);
      soundIcon.children[1].x = 22;
      soundIcon.children[1].y = 22;
      music.mute = true;
    }
  },
  showInstructions: function () {
    var infoIcon = this.holdIcons[0];
    this.animateIcon(infoIcon);
    // nothing yet
  }
}
