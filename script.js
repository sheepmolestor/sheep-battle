var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug:true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
}

var keyA;
var physics;
var player;
var g;

function create ()
{
    this.add.image(400, 300, 'sky');

    g = this.add.graphics({fillStyle:{color:0x0000ff}});

    var physics = this.physics;
    keyA=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyA.on('up', function (key, event) {
        shoot(physics);
    });

    player = physics.add.staticSprite(150,300,'sky').setSize(100,200).setVisible(false);
}

function update() {
    
}

function shoot(physics) {
    var projectile = physics.add.sprite(250,300,'sky').setSize(100,100).setVisible(false).setVelocityX(1000);
    projectile.body.setAllowGravity(false);

    // Turn on wall collision checking for your sprite
    projectile.setCollideWorldBounds(true);

    // Turning this on will allow you to listen to the 'worldbounds' event
    projectile.body.onWorldBounds = true;

    // 'worldbounds' event listener
    projectile.body.world.on('worldbounds', function(body) {
        // Check if the body's game object is the sprite you are listening for
        if (body.gameObject === this) {this.destroy();}
    }, projectile);
}