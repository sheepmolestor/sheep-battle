var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug:false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('background', 'assets/starfield.png');
	this.load.image('bomb', 'assets/bomb.png');
	
	this.load.spritesheet('bunny', 
        'assets/bunny2.png',
        { frameWidth: 35, frameHeight: 40, frameEnd: 18 }
    );
}

var physics;
var player;
var player2;
var projectiles;
var projectiles2;
var keys;
var g;

function create ()
{
    this.add.image(400, 300, 'background');

	g = this.add.graphics({fillStyle:{color:0x0000ff}});

    projectiles = this.physics.add.group();
    projectiles2 = this.physics.add.group();
	
	this.anims.create({
		key: 'up',
		frames: this.anims.generateFrameNumbers('bunny', { start: 8, end: 15 }),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'left',
		frames: [ { key: 'bunny', frame: 17 } ],
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: [ { key: 'bunny', frame: 16 } ],
		frameRate: 20
	});
	this.anims.create({
		key: 'down',
		frames: this.anims.generateFrameNumbers('bunny', { start: 0, end: 7 }),
		frameRate: 10,
		repeat: -1
	});
	
	var physics = this.physics;
	
    //player = this.physics.add.staticSprite(150,300,'sky').setSize(100,200).setVisible(false).setData({dodge:false,dodgeTime:40,timer:0});
    //player2 = this.physics.add.staticSprite(650,300,'sky').setSize(100,200).setVisible(false).setData({dodge:false,dodgeTime:40,timer:0});

	keys = this.input.keyboard.addKeys('W,S,UP,DOWN');
	
	player = this.physics.add.sprite(100, 300, 'bunny').setData({dodge:false,dodgeTime:40,timer:0});
    player.setCollideWorldBounds(true).setData({dodge:false,dodgeTime:40,timer:0});
	
	player2 = this.physics.add.sprite(650, 300, 'bunny');
    player2.setCollideWorldBounds(true).setData({dodge:false,dodgeTime:40,timer:0});

    this.input.keyboard.on('keyup-D', function (event) {
        var p=shoot(physics, player.x, player.y, 1000, player2, projectiles);
        //projectiles.add(p);
        Phaser.Actions.Call(projectiles2.getChildren(), function (sprite) {
            physics.add.overlap(p,sprite,hitProjectile,null,game);
        },game);
    });

    this.input.keyboard.on('keydown-A', function (event) {
        player.setData('dodge',true);
    });

    this.input.keyboard.on('keydown-RIGHT', function (event) {
        player2.setData('dodge',true);
    });

    this.input.keyboard.on('keyup-LEFT', function (event) {
        var p=shoot(physics,player2.x, player2.y, -1000, player,projectiles2);
        //projectiles2.add(p);
        Phaser.Actions.Call(projectiles.getChildren(), function (sprite) {
            physics.add.overlap(p,sprite,hitProjectile,null,game);
        },game);
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

	// Player 1 movement
	if (keys.W.isDown) {
		player.setVelocityY(-160);
		player.anims.play('up', true);
	} else if (keys.S.isDown) {
		player.setVelocityY(160);
		player.anims.play('down', true);
	} else {
		player.setVelocityY(0);
		player.anims.play('right');
	}

	// Player 2 movement
	if (keys.UP.isDown) {
		player2.setVelocityY(-160);
		player2.anims.play('up', true);
	} else if (keys.DOWN.isDown) {
		player2.setVelocityY(160);
		player2.anims.play('down', true);
	} else {
		player2.setVelocityY(0);
		player2.anims.play('left');
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

function shoot(physics, x, y, speed, p,pgroup) {
    var projectile = pgroup.create(x,y,'bomb').setSize(14,14).setVelocityX(speed);

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

    return projectile;
}

function hitProjectile(p1,p2) {
    p1.destroy();
    p2.destroy();
}

function hitPlayer(projectile, p) {
    if (!p.getData('dodge')) {
        projectile.destroy();
    }
}