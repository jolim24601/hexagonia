var Hexscape = Hexscape || {};

Hexscape.Menu = function () {};

Hexscape.Menu.prototype = {
  preload: function () {
    this.add.tileSprite(0, 0, this.world.width, this.world.height, 'background');
  },
  create: function () {
    var title = this.add.bitmapText(0, 35, 'font72', 'Hexscape', 72);
    title.x = this.world.centerX - title.width / 2;
    var play = this.add.bitmapText(0, 0, 'font72', 'Play', 36);
    play.x = this.world.centerX - play.width / 2;
    play.y = this.world.centerY;

    play.inputEnabled = true;
    play.events.onInputDown.add(this.play, this);
  },
  play: function () {
    this.state.start('LevelSelect');
  }
}
