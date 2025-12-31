import Phaser from 'phaser';
import Game from './scenes/Game';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    backgroundColor: '#000080',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    },
    pixelArt: false,
    scene: [
        Game
    ]
};

const StartGame = (parent: string) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
