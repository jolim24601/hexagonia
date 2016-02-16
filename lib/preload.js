var Hexscape = Hexscape || {};
Hexscape.Preload = function () {};

Hexscape.Preload.prototype = {
  preload: function () {
    // background
    this.load.image('background', 'assets/wallpaper.jpg');
    // audio
    this.load.audio('theme', ['assets/audio/theme.ogg', 'assets/audio/theme.m4a']);
    this.load.audio('reverse', 'assets/audio/reverse.ogg');
    // menu
    this.load.image('level', 'assets/level.png');
    this.load.image('play', 'assets/play.png');
    this.load.image('info', 'assets/info.png');
    this.load.image('sound', 'assets/sound.png');
    this.load.image('mute', 'assets/mute.png');
    // level select
    this.load.spritesheet('stars', 'assets/stars.png', 96, 96);
    this.load.image('lock', 'assets/lock.png');
    this.load.bitmapFont('font72', 'assets/font.png', 'assets/font.fnt');
    // main game
    this.load.image('ball', 'assets/ball.png');
    this.load.image('hexagon', 'assets/hexagon.png');
    this.load.image('block', 'assets/block.png');
    this.load.image('bouncy', 'assets/bouncy.png');
    this.load.image('teleport', 'assets/teleport.png');
    this.load.image('gravity_portal', 'assets/gravity_portal.png');
    this.load.image('display', 'assets/display.png');
    this.load.image('menu', 'assets/menu.png');
    this.load.image('reset', 'assets/reset.png');
    // options/game over
    this.load.image('grid', 'assets/grid.png');
    this.load.image('container', 'assets/container.png');
    this.load.image('modal', 'assets/modal.png');
    // physics
    this.load.physics('sprite_physics', 'assets/sprite_physics.json');
  },
  create: function () {
    this.physics.startSystem(Phaser.Physics.P2JS);
    this.state.start('Menu');
  }
}
