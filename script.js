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
        update: update,
        render: render
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
}

var physics;
var player;
var player2;
var projectiles;
var projectiles2;
var g;

function create ()
{
    this.add.image(400, 300, 'sky');

    g = this.add.graphics({fillStyle:{color:0x0000ff}});

    var physics = this.physics;

    player = physics.add.staticSprite(150,300,'sky').setSize(100,200).setVisible(false).setData({dodge:false,dodgeTime:40,timer:0});
    player2 = physics.add.staticSprite(650,300,'sky').setSize(100,200).setVisible(false).setData({dodge:false,dodgeTime:40,timer:0});

    projectiles = physics.add.group();
    projectiles2 = physics.add.group();

    this.input.keyboard.on('keyup-A', function (event) {
        shoot(physics, 250, 300, 1000, player2,projectiles2);
    });

    this.input.keyboard.on('keydown-S', function (event) {
        player.setData('dodge',true);
    });

    this.input.keyboard.on('keydown-K', function (event) {
        player2.setData('dodge',true);
    });

    this.input.keyboard.on('keyup-L', function (event) {
            shoot(physics,550, 300, -1000, player,projectiles);
    });
}


function update() {
    if (player.getData('dodge')) {
        var t = player.getData('timer');
        player.setData('timer', t+1);
        if (t>=player.getData('dodgeTime')) {
            player.setData('dodge',false);
            player.setData('timer',0);
        }
    }
    if (player2.getData('dodge')) {
        var t = player2.getData('timer')
        player2.setData('timer', t+1);
        if (t>=player2.getData('dodgeTime')) {
            player2.setData('dodge',false);
            player2.setData('timer',0);
        }
    }

    render();
}

function render() {
    g.clear();
    if (player.getData('dodge')) {
        var rect = new Phaser.Geom.Rectangle(100,200,100,200);
        g.fillRectShape(rect);
    }
    if (player2.getData('dodge')) {
        var rect = new Phaser.Geom.Rectangle(600,200,100,200);
        g.fillRectShape(rect);
    }
}

function shoot(physics, x, y, speed, p, pgroup) {
    var projectile = physics.add.sprite(x,y,'sky').setSize(100,100).setVisible(false).setVelocityX(speed);
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

    physics.add.overlap(projectile, p, hitPlayer, null, game);
}

function hitPlayer(projectile, p) {
    if (!p.getData('dodge')) {
        projectile.destroy();
    }
}