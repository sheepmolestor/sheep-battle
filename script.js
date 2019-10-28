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

	Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function Bomb (scene)
    {
		Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'bomb');
        this.xSpeed = 0;
        this.ySpeed = 0;
		this.setScale(2,2);
    },

    fire: function (shooter, val)
    {
		var direction = 0;
		var left = (val % 2 != 0);
		if (left) {val -= 1;}
		switch(val) {
			case 2: // up only
				direction = Math.PI/6;
				break;
			case 4: // side only
				direction = 0;
				break;
			case 6: // up and side
				direction = Math.PI/12;
				break;
			case 8: // down only
				direction = -Math.PI/6;
				break;
			case 12: // down and side
				direction = -Math.PI/12;
				break;
		}
        this.setPosition(shooter.x, shooter.y); // Initial position

		console.log("Speed: " + -1000*Math.sin(direction) + ", " + (left ? -1 : 1)*1000*Math.cos(direction))
		this.setVelocityY(-1000*Math.sin(direction));
        this.setVelocityX((left ? -1 : 1)*1000*Math.cos(direction));
		this.setImmovable(true);

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
		this.setCollideWorldBounds(true);
		this.body.onWorldBounds = true;
		this.body.world.on('worldbounds', function(body) {
			if (body.gameObject === this) {
				this.setActive(false);
				this.setVisible(false);}
		}, this);
    },

    update: function (time, delta) {}

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
    },

    initPos: function(x, y) {
        this.setPosition(x,y);
		this.setScale(2,2);
		this.setImmovable(true);
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
	
	var players = this.physics.add.group({classType: Player});
    player=players.get();
    player.setCollideWorldBounds(true);
    
    player2=players.get();
    player2.setCollideWorldBounds(true);

    player.initPos(150,300);
    player2.initPos(650,300);
	
	physics.add.collider(projectiles, projectiles2, hitProjectile);

    this.input.keyboard.on('keydown-SPACE', function (event) {
        if (!player.attack.active) {
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

    this.input.keyboard.on('keydown-ENTER', function (event) {
        if (!player2.attack.active) {
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

function hitProjectile(p1,p2) {
	console.log("hit");
	if(p1.active && p2.active) {
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
}

function hitPlayer(projectile, p) {
    if (!p.dodge.active && projectile.active === true) {
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
        projectile.setActive(false).setVisible(false);
    }
}