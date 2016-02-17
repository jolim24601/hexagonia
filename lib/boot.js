Hexscape = {
  HEX_WIDTH: 100,
  HEX_HEIGHT: 86,
  BALL_RADIUS: 15,
  GRAVITY: 800,
  RESTITUTION: 1/5,
  GRID_WIDTH_OFFSET: 25,
  GRID_HEIGHT_OFFSET: 180,
  EVEN_ROW_X_OFFSET: 43,
  GRID_SIZE_X: 12,
  GRID_SIZE_Y: 5
}

Hexscape.Boot = function() {};

Hexscape.Boot.prototype = {
    preload: function() {
      this.load.image('preloaderBar', 'assets/preload.png');
    },
    create: function() {
      this.input.maxPointers = 1;
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      if (this.game.device.desktop) {
        this.scale.minWidth = 256;
        this.scale.minHeight = 196;
        this.scale.maxWidth = 1000;
        this.scale.maxHeight = 600;
      } else {
        this.scale.minWidth = 480;
        this.scale.minHeight = 260;
        this.scale.maxWidth = 1024;
        this.scale.maxHeight = 768;
      }

      this.state.start('Preload');
    },
    gameResized: function(width, height) {}
}
