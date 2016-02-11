var Hexscape = Hexscape || {};
Hexscape.Preload = function () {};

Hexscape.Preload.prototype = {
  preload: function () {
    //background
    this.load.image('background', 'assets/background.png');
    // main game
    this.load.image('ball', 'assets/ball.png');
    this.load.image('hexagon', 'assets/hexagon.png');
    this.load.image('block', 'assets/block.png');
    this.load.image('bouncy', 'assets/bouncy.png');
    this.load.image('teleport', 'assets/teleport.png');
    this.load.image('gravity_portal', 'assets/gravity_portal.png');
    this.load.image('info', 'assets/info.png');
    this.load.image('menu', 'assets/menu.png');
    this.load.physics('sprite_physics', 'assets/sprite_physics.json');

    // level select
    this.load.spritesheet('stars', 'assets/stars.png', 96, 96);
    this.load.image('level', 'assets/level.png');
    this.load.image('lock', 'assets/lock.png');
    this.load.bitmapFont('font72', 'assets/font72.png', 'assets/font72.xml');
  },
  create: function () {
    // later change this to menu
    this.physics.startSystem(Phaser.Physics.P2JS);
    this.state.start('Menu');
  }
}
