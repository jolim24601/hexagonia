var game = new Phaser.Game(1000, 600, Phaser.AUTO, '');

game.state.add('LevelSelect', LevelSelect);
game.state.add('Game', Main);
game.state.start('LevelSelect');
