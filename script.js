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

var Cooldown = new Phaser.Class({
    initialize: function Cooldown(t=100) {
        this.active=false;
        this.duration=t;
        this.timer=0;
    },

    update: function() {
        if (this.active) {
            this.timer++;
            if (this.timer>=this.duration) {
                this.active=false;
                this.timer=0;
                return true;
            }
        }
        return false;
    }
});

var Player = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize: function Player(scene) {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'bunny');
        this.dodge = new Cooldown(40);
        this.damage=0;
        this.dodgeCooldown = new Cooldown();
        this.attack = new Cooldown();
        //this.dodgeCooldown=false;
        //this.dodgeCooldownTime=100;
        //this.dodgeCooldownTimer=0;
        //this.attack=false;
        //this.attackTime=100;
        //this.attackTimer=0;
    },

    initPos: function(x, y) {
        this.setPosition(x,y);
    },

    update: function () {
        if (this.dodge.update()) {
            this.dodgeCooldown.active=true;this.alpha=1;this.tint=0x0000ff;
        }
        if (this.dodgeCooldown.update()) {this.blue();}
        if (this.attack.update()){this.blue();}
    },

    blue: function () {
        this.tint=0xffffff;
    }
});

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
	
	var players = this.physics.add.group({classType: Player});
    player=players.get();
    player.setCollideWorldBounds(true);
	
	player2=players.get();
    player2.setCollideWorldBounds(true);

    player.initPos(150,300);
    player2.initPos(650,300);

    this.input.keyboard.on('keyup-D', function (event) {
        if (!player.attack.active) {
            var p=shoot(physics, player.x, player.y, 1000, player2, projectiles);
            //projectiles.add(p);
            Phaser.Actions.Call(projectiles2.getChildren(), function (sprite) {
                //physics.add.collider(p, sprite, hitPlayer);
    			physics.add.overlap(p,sprite,hitProjectile,null,game);
            },game);
            player.attack.active=true;
            player.tint=0x0000ff;
        }
    });

    this.input.keyboard.on('keydown-A', function (event) {
        if (!player.dodgeCooldown.active) {
            player.dodge.active=true;
            player.alpha=0.5;
        }
    });

    this.input.keyboard.on('keydown-RIGHT', function (event) {
        if (!player2.dodgeCooldown.active) {
            player2.dodge.active=true;
            player2.alpha=0.5;
        }
    });

    this.input.keyboard.on('keyup-LEFT', function (event) {
        if (!player2.attack.active) {
            var p=shoot(physics,player2.x, player2.y, -1000, player,projectiles2);
            //projectiles2.add(p);
            Phaser.Actions.Call(projectiles.getChildren(), function (sprite) {
    			//physics.add.collider(p, sprite, hitPlayer);
                physics.add.overlap(p,sprite,hitProjectile,null,game);
            },game);
            player2.attack.active=true;
            player2.tint=0x0000ff;
        }
    });
	
	explosions = this.physics.add.group({
		defaultKey: 'sparkle',
		maxSize: 30
	});
}

/*function updateCooldown(p,active,time,timer) {
    if (p.getData(active)) {
        var t = p.getData(timer);
        p.setData(timer, t+1);
        p.tint=0x0000ff;
        if (t>=p.getData(time)) {
            p.setData(active,false);
            p.setData(timer,0);
            p.tint=0xffffff;
        }
    }
}*/

function update() {
    // Cooldowns
    player.update();
    player2.update();

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
    if (!p.dodge.active) {
        projectile.destroy();
		p.damage++;
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