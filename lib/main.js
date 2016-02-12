var Hexscape = Hexscape || {};
Hexscape.game = new Phaser.Game(1000, 600, Phaser.AUTO, '');

// Hexscape.game.state.add('Boot', Hexscape.Boot);
Hexscape.game.state.add('Preload', Hexscape.Preload);
Hexscape.game.state.add('Menu', Hexscape.Menu);
Hexscape.game.state.add('LevelSelect', Hexscape.LevelSelect);
Hexscape.game.state.add('Game', Hexscape.Game);

Hexscape.game.state.start('Preload');
