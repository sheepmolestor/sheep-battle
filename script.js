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
	this.load.image('grass', 'assets/grass.png');
	this.load.image('bomb', 'assets/bomb.png');
	
	this.load.spritesheet('bunny', 
        'assets/bunny2.png',
        { frameWidth: 35, frameHeight: 40, frameEnd: 18 }
    );
	
	this.load.spritesheet('sparkle', 
        'assets/sparkle.png',
        { frameWidth: 32, frameHeight: 32}
    );
}

var physics;
var player;
var player2;
var projectiles;
var projectiles2;
var keys;
var explosions;

function create ()
{
	this.add.tileSprite(400, 300, 800, 600, 'grass');

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
	
	this.anims.create({
		key: 'hurt',
		frames: this.anims.generateFrameNumbers('sparkle', { start: 0, end: 15 }),
		frameRate: 50,
	});
	
	var physics = this.physics;
	
    //player = this.physics.add.staticSprite(150,300,'sky').setSize(100,200).setVisible(false).setData({dodge:false,dodgeTime:40,timer:0});
    //player2 = this.physics.add.staticSprite(650,300,'sky').setSize(100,200).setVisible(false).setData({dodge:false,dodgeTime:40,timer:0});

	keys = this.input.keyboard.addKeys('W,S,UP,DOWN');
	
	player = this.physics.add.sprite(100, 300, 'bunny').setData({dodge:false,dodgeTime:40,timer:0,damage:0,cooldown:false,cooldownTime:100,cooldownTimer:0});
    player.setCollideWorldBounds(true);
	
	player2 = this.physics.add.sprite(650, 300, 'bunny').setData({dodge:false,dodgeTime:40,timer:0,damage:0,cooldown:false,cooldownTime:100,cooldownTimer:0});
    player2.setCollideWorldBounds(true);

    this.input.keyboard.on('keyup-D', function (event) {
        var p=shoot(physics, player.x, player.y, 1000, player2, projectiles);
        //projectiles.add(p);
        Phaser.Actions.Call(projectiles2.getChildren(), function (sprite) {
            //physics.add.collider(p, sprite, hitPlayer);
			physics.add.overlap(p,sprite,hitProjectile,null,game);
        },game);
    });

    this.input.keyboard.on('keydown-A', function (event) {
        if (!player.getData('cooldown')) {
            player.setData('dodge',true);
        }
    });

    this.input.keyboard.on('keydown-RIGHT', function (event) {
        if (!player2.getData('cooldown')) {
            player2.setData('dodge',true);
        }
    });

    this.input.keyboard.on('keyup-LEFT', function (event) {
        var p=shoot(physics,player2.x, player2.y, -1000, player,projectiles2);
        //projectiles2.add(p);
        Phaser.Actions.Call(projectiles.getChildren(), function (sprite) {
			//physics.add.collider(p, sprite, hitPlayer);
            physics.add.overlap(p,sprite,hitProjectile,null,game);
        },game);
    });
	
	explosions = this.physics.add.group({
		defaultKey: 'sparkle',
		maxSize: 30
	});
}


function update() {
    if (player.getData('dodge')) {
        var t = player.getData('timer');
        player.setData('timer', t+1);
		player.alpha = 0.5;
        if (t>=player.getData('dodgeTime')) {
            player.setData('dodge',false);
            player.setData('cooldown',true);
            player.setData('timer',0);
			player.alpha = 1;
        }
    }
    if (player2.getData('dodge')) {
        var t = player2.getData('timer')
        player2.setData('timer', t+1);
		player2.alpha = 0.5;
        if (t>=player2.getData('dodgeTime')) {
            player2.setData('dodge',false);
            player2.setData('cooldown',true);
            player2.setData('timer',0);
			player2.alpha = 1;
        }
    }

    // Cooldowns
    if (player.getData('cooldown')) {
        var t = player.getData('cooldownTimer');
        player.setData('cooldownTimer', t+1);
        player.tint=0x0000ff;
        if (t>=player.getData('cooldownTime')) {
            player.setData('cooldown',false);
            player.setData('cooldownTimer',0);
            player.tint=0xffffff;
        } 
    }
    if (player2.getData('cooldown')) {
        var t = player2.getData('cooldownTimer');
        player2.setData('cooldownTimer', t+1);
        player2.tint=0x0000ff;
        if (t>=player2.getData('cooldownTime')) {
            player2.setData('cooldown',false);
            player2.setData('cooldownTimer',0);
            player2.tint=0xffffff;
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
	//physics.add.collider(p, projectile, hitPlayer);

    return projectile;
}

function hitProjectile(p1,p2) {
	var explosion = explosions.get().setActive(true);
	explosion.setOrigin( 0.5, 0.5 );
	explosion.x = p1.x;
	explosion.y = p1.y;
	explosion.play( 'hurt' );
	explosion.on('animationcomplete', function() {
		explosion.destroy();
		explosion.setActive(false);
	}, this);
	p1.destroy();
    p2.destroy();
}

function hitPlayer(projectile, p) {
    if (!p.getData('dodge')) {
        projectile.destroy();
		p.setData('damage', p.getData('damage')+1);
		p.setTint(0xff0000);
		var explosion = explosions.get().setActive(true);
		explosion.setOrigin( 0.5, 0.5 );
		explosion.x = p.x;
		explosion.y = p.y;
		explosion.play( 'hurt' );
		explosion.on('animationcomplete', function() {
			explosion.destroy();
			explosion.setActive(false);
			p.clearTint();
		}, this);
    }
}