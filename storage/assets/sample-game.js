// Sample game asset
console.log('Sample Phaser game loaded');

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  console.log('Preloading assets...');
}

function create() {
  console.log('Creating game scene...');
}

function update() {
  // Game loop
}

const game = new Phaser.Game(config);