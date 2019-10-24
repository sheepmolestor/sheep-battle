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

var Bomb = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bullet Constructor
    function Bomb (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bomb');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        //this.setSize(12, 12, true);
		this.setScale(2,2);
    },

    // Fires a bullet from the player to the reticle
    fire: function (shooter, val)
    {
		this.direction = 0;
		var left = (val % 2 != 0);
		if (left) {val -= 1;}
		switch(val) {
			case 2: // up only
				this.direction = Math.PI/6;
				break;
			case 4: // side only
				this.direction = 0;
				break;
			case 6: // up and side
				this.direction = Math.PI/12;
				break;
			case 8: // down only
				this.direction = -Math.PI/6;
				break;
			case 12: // down and side
				this.direction = -Math.PI/12;
				break;
		} 
		this.direction -= Math.PI;
		if (left) {this.direction *= -1;}
		this.direction += Math.PI/2;
        this.setPosition(shooter.x, shooter.y); // Initial position

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (left)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    // Updates the position of the bullet each cycle
    update: function (time, delta)
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

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

	projectiles = this.physics.add.group({ classType: Bomb, runChildUpdate: true });
    projectiles2 = this.physics.add.group({ classType: Bomb, runChildUpdate: true });
	
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
	
	keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
	
	player = this.physics.add.sprite(100, 300, 'bunny').setScale(2,2).setData({dodge:false,dodgeTime:40,timer:0,damage:0,dodgeCooldown:false,
        dodgeCooldownTime:100,dodgeCooldownTimer:0,
        attack:false,attackTime:100,attackTimer:0});
    player.setCollideWorldBounds(true);
	
	player2 = this.physics.add.sprite(650, 300, 'bunny').setScale(2,2).setData({dodge:false,dodgeTime:40,timer:0,damage:0,dodgeCooldown:false,
        dodgeCooldownTime:100,dodgeCooldownTimer:0,
        attack:false,attackTime:100,attackTimer:0});
    player2.setCollideWorldBounds(true);

    this.input.keyboard.on('keydown-SPACE', function (event) {
        if (!player.getData('attack')) {
			var bomb = projectiles.get().setActive(true).setVisible(true);
			if (bomb) {
				var val = 0;
				if (keys.W.isDown) {
					val += 2;
				} 
				if (keys.D.isDown) {
					val += 4;
				}
				if (keys.S.isDown)  {
					val += 8;
				}
				bomb.fire(player, val);
				physics.add.collider(bomb, player2, hitPlayer);
				//Phaser.Actions.Call(projectiles2.getChildren(), function (sprite) {
				//	physics.add.collider(bomb, sprite, hitProjectile);
				//}, game);
			}
            player.setData('attack',true);
        }
    });

    this.input.keyboard.on('keydown-A', function (event) {
        if (!player.getData('dodgeCooldown')) {
            player.setData('dodge',true);
        }
    });

    this.input.keyboard.on('keydown-RIGHT', function (event) {
        if (!player2.getData('dodgeCooldown')) {
            player2.setData('dodge',true);
        }
    });

    this.input.keyboard.on('keydown-NUMPAD_ZERO', function (event) {
        if (!player2.getData('attack')) {
			var bomb = projectiles2.get().setActive(true).setVisible(true);
			if (bomb) {
				var val = 1;
				if (keys.UP.isDown) {
					val += 2;
				}
				if (keys.LEFT.isDown) {
					val += 4;
				}
				if (keys.DOWN.isDown)  {
					val += 8;
				}
				bomb.fire(player2, val);
				physics.add.collider(bomb, player, hitPlayer);
				//Phaser.Actions.Call(projectiles.getChildren(), function (sprite) {
				//	physics.add.collider(bomb, sprite, hitProjectile);
				//}, game);
				// Player 2 movement
			}
            player2.setData('attack',true);
        }
    });
	
	explosions = this.physics.add.group({
		defaultKey: 'sparkle',
		maxSize: 30
	});
}

function updateCooldown(p,active,time,timer) {
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
}

function update() {
    if (player.getData('dodge')) {
        var t = player.getData('timer');
        player.setData('timer', t+1);
		player.alpha = 0.5;
        if (t>=player.getData('dodgeTime')) {
            player.setData('dodge',false);
            player.setData('dodgeCooldown',true);
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
            player2.setData('dodgeCooldown',true);
            player2.setData('timer',0);
			player2.alpha = 1;
        }
    }

    // Cooldowns
    updateCooldown(player,'dodgeCooldown','dodgeCooldownTime','dodgeCooldownTimer');
    updateCooldown(player2,'dodgeCooldown','dodgeCooldownTime','dodgeCooldownTimer');
    updateCooldown(player,'attack','attackTime','attackTimer')
    updateCooldown(player2,'attack','attackTime','attackTimer')

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
	p1.setActive(false).setVisible(false);
    p2.setActive(false).setVisible(false);
}

function hitPlayer(projectile, p) {
    if (projectile.active === true && !p.getData('dodge')) {
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
        projectile.setActive(false).setVisible(false);
    }
}