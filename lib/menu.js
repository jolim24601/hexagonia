Hexscape.Menu = function () {
  this.holdIcons = {};
};

Hexscape.Menu.prototype = {
  preload: function () {
    var bgLayer = this.add.group();
    var bg = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'background');
    var github = this.add.button(this.world.width - 75, this.world.height - 60, 'github', function () {
      window.location.href = "https://github.com/jolim24601"
    });
    var linkedin = this.add.button(this.world.width - 130, this.world.height - 60, 'linkedin', function () {
      window.location.href = "https://www.linkedin.com/in/john-lim-86500358"
    });
    var portfolio = this.add.button(this.world.width - 185, this.world.height - 65, 'portfolio', function () {
      window.location.href = "http://johnlim.me"
    });
    bgLayer.add(bg);
    bgLayer.add(github);
    bgLayer.add(linkedin);
    bgLayer.add(portfolio);
  },
  create: function () {
    var music = this.add.audio('theme');
    music.loop = true;
    music.play();

    var title = this.add.bitmapText(0, this.world.centerY - 120, 'font72', 'Hexscape', 72);
    title.x = this.world.centerX - title.width / 2;

    var soundGon = this.add.sprite(0, 0, 'level');
    var soundSym = this.add.sprite(5, -5, 'sound');
    soundSym.scale.setTo(1/3);
    var playGon = this.add.sprite(0, 0, 'level');
    var playSym = this.add.sprite(20, 20, 'play');
    playSym.scale.setTo(1/2);

    SoundGroup = this.add.group();
    SoundGroup.add(soundGon);
    SoundGroup.add(soundSym);
    SoundGroup.x = this.world.centerX - SoundGroup.width / 2 - 60;
    SoundGroup.y = this.world.centerY - 50;
    soundGon.inputEnabled = true;
    soundGon.events.onInputDown.add(this.mute, this);
    this.holdIcons['SoundGroup'] = SoundGroup;

    PlayGroup = this.add.group();
    PlayGroup.add(playGon);
    PlayGroup.add(playSym);
    PlayGroup.x = this.world.centerX - PlayGroup.width / 2 + 50;
    PlayGroup.y = this.world.centerY - 50;
    playGon.inputEnabled = true;
    playGon.events.onInputDown.add(this.play, this);
    this.holdIcons['PlayGroup'] = PlayGroup;
  },
  animateIcon: function (icon, cb) {
    var tween = this.add.tween(icon.scale)
      .to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None)
      .to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None)
      .start();

    tween.onComplete.add(function () { cb && cb() });
  },
  play: function () {
    var PlayGroup = this.holdIcons.PlayGroup;
    this.animateIcon(PlayGroup, function () {
      this.state.start('LevelSelect');
    }.bind(this));
  },
  mute: function () {
    var SoundGroup = this.holdIcons.SoundGroup;
    this.animateIcon(SoundGroup);

    if (this.sound.mute) {
      SoundGroup.resetChild(SoundGroup.children[1], null, null, 'sound')
      SoundGroup.children[1].scale.setTo(1/3);
      SoundGroup.children[1].x = 5;
      SoundGroup.children[1].y = -5;
      this.sound.mute = false;
    } else {
      SoundGroup.resetChild(SoundGroup.children[1], null, null, 'mute')
      SoundGroup.children[1].scale.setTo(1/4);
      SoundGroup.children[1].x = 22;
      SoundGroup.children[1].y = 22;
      this.sound.mute = true;
    }
  }
}
