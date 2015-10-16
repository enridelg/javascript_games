//v2

var game = function () {
	var Q = window.Q = Quintus()
		.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
		.enableSound()
		.setup({width: 320, height:  480})
		.controls().touch();

	//Q.assets = {};
    //Q.audio.enableHTML5Sound();

	//Q.input.mouseControls();
	//Q.input.keyboardControls({ENTER: "enter"});


	/**********************************************/
	/*					Mario                     */
	/**********************************************/

		Q.animations('mario', {
			run_right: 		{ frames: [1, 2, 3], rate: 1/10 },
			run_left: 		{ frames: [15, 16, 17], rate: 1/10 },
			stand_right: 	{ frames: [0] },
			stand_left: 	{ frames: [14] },
			jump_right: 	{ frames: [4] },
			jump_left: 		{ frames: [18] },
			dead: 			{ frames: [12] }
		});

		Q.Sprite.extend("Mario", {
		init: function(p) {
			this._super(p, {
			    sheet: "marioR",
			    sprite: "mario",
			    frame: 0,
			    jumpSpeed: -400,
			    speed: 300,
			    isDying: false

		    });

		    this.add('2d, platformerControls, animation, tween');
		},

		step: function(dt) {
			if(this.p.y > 700){
				/*
				this.p.x = 150;
				this.p.y = 380;
				*/
				this.dead(-50);
			}

			if(this.p.vy == 0){
				if(this.p.vx == 0){
					if(this.p.direction == "right")
						this.play("stand_right");
					else
						this.play("stand_left");
				}
				else if(this.p.vx > 0)
					this.play("run_right");
				else if(this.p.vx < 0)
					this.play("run_left");
			}else {
					if(this.p.direction == "right")
						this.play("jump_right");
					else
						this.play("jump_left");
			}
			//console.log(this.p.x + " asdsad " + this.p.y);
		},

		dead: function(des) {
			if(!this.p.isDying){
				this.p.isDying = true;
				Q.audio.stop("music_main.mp3");
				Q.audio.play("music_die.mp3");
				this.p.vy = -300;
				this.play("dead", 1);
				this.animate({ x: this.p.x, y: this.p.y + des}, 0.5, { callback: this.destroy});
				//this.destroy();
				Q.stageScene("endGame",1, { label: "Game Over" });
			}
		}
	});


	/**********************************************/
	/*					Goomba                    */
	/**********************************************/


		Q.animations('goomba', {
			walk: 		{ frames: [0, 1], rate: 1/4 },
			dead: 		{ frames: [2] }
		});

		Q.Sprite.extend("Goomba", {
		init: function(p) {
			this._super(p, {
			    sheet: "goomba",
			    sprite: "goomba",
			    frame: 0,
			    vx: 100
		    });
			this.add('2d, aiBounce, animation, tween, defaultEnemy');

			this.on("bump.left,bump.right", this, "lateralCollision");
			this.on("bump.bottom", this, "bottomCollision");
			this.on("bump.top", this, "topCollision");
		},

		step: function(dt) {
			this.play("walk");
		}
	});



	/**********************************************/
	/*					Bloopa                    */
	/**********************************************/

		Q.animations('bloopa', {
			move: 		{ frames: [0, 1], rate: 1/3 },
			dead: 		{ frames: [2] }
		});


		Q.Sprite.extend("Bloopa", {
		init: function(p) {
			this._super(p, {
			    sheet: "bloopa",
			    sprite: "bloopa",
			    frame: 0,
			    gravity: 1
		    });

		    this.p.maxY = 60;
		    this.p.initY = this.p.y;
			this.add('2d, aiBounce, animation, tween, defaultEnemy');

			this.on("bump.left,bump.right", this, "lateralCollision");
			this.on("bump.bottom", this, "bottomCollision");
			this.on("bump.top", this, "topCollision");
		},

		step: function(dt) {
			this.play("move");

			if(this.p.y >= this.p.initY){
				this.p.gravity = -0.1;
			}else if(this.p.y < this.p.initY - this.p.maxY){
				this.p.gravity = 1;
			}

		}
	});

	/**********************************************/
	/*					Default Enemy             */
	/**********************************************/

	Q.component("defaultEnemy", {
		extend: {
			lateralCollision: function(collision){
				if(collision.obj.isA("Mario")) {
			    	collision.obj.dead(-50);
			    }
			},

			bottomCollision: function(collision){
		    	if(collision.obj.isA("Mario")) { 
		    		collision.obj.dead(50);
		    	}
			},

			topCollision: function(collision){
     			if(collision.obj.isA("Mario")) { 
	      			this.dead();
	       			collision.obj.p.vy = -300;
      			}
			},

			dead: function(){
				this.play("dead", 1);
				this.animate({ x: this.p.x, y: this.p.y }, 0.5, { callback: this.destroy});
			}

		}
	});

	/**********************************************/
	/*					Princess                  */
	/**********************************************/


		Q.Sprite.extend("Princess", {
		init: function(p) {
			this._super(p, {
			    asset: "princess.png",
		    });

		    this.add('2d');


		    this.on("hit",function(collision) {
		    	if(collision.obj.isA("Mario")) {
					Q.audio.stop("music_main.mp3");
					Q.audio.play("music_level_complete.mp3");
		    		Q.stageScene("endGame",1, { label: "Mario Wins" }); 
		    		Q.stage().pause();
		    	}
		    });
		}
	});




	/**********************************************/
	/*					Coins                     */
	/**********************************************/


	Q.animations('coin', {
		shine: { frames: [0, 1, 2], rate: 1/3 }
	});

	Q.Sprite.extend("Coin",{
		init: function(p) {
			this._super(p,{
				sheet: 'coin',
				sprite: 'coin',
				gravity: 0,
				frame: 0,
				sensor: true,
				isTaken: false
			});

			this.add('animation, tween');

			this.on("sensor");
		},

		sensor: function(sensor) {
			if(sensor.isA("Mario") && !this.p.isTaken){
				this.p.isTaken = true;
		    	this.animate({ x: this.p.x, y: this.p.y - 40}, 0.1, { callback: this.addCoin});
		    }
		},

		addCoin: function() {
			Q.audio.play("coin.mp3");
			this.destroy();
			Q.state.inc("coins", 1);
		    //Q.stageScene('hud', 1);  ahora se modifica en Q.state.on("cange.coins...
		},

		step: function(dt) {
			this.play("shine");
		}
	});

	/**********************************************/
	/*					Background                */
	/**********************************************/


	Q.Sprite.extend("Background",{
		init: function(p) {
			this._super(p,{
				x: Q.width/2,
				y: Q.height/2,
				asset: 'mainTitle.png'
			});
			this.on("touch",function() {  
				Q.stageScene("level1"); 
			});
		}
	});


	/**********************************************/
	/*					Stages                    */
	/**********************************************/

	Q.scene('hud',function(stage) {
	  var container = stage.insert(new Q.UI.Container({
	    x: 50, y: 0
	  }));

	  var label = container.insert(new Q.UI.Text({x:100, y: 20,
	    label: "Coins: " + Q.state.get("coins"), color: "Black" }));

	  container.fit(20);


	  //Cuando hay un cambio de valor limpiamos la escena 1 y la volvemos a introducir
	  Q.state.on("change.coins", function() {
	  	Q.clearStage(1);
	  	Q.stageScene('hud', 1);
	  })
	});

//initial scene
	Q.scene('initGame',function(stage) {
		/*
		var background = new Q.TileLayer({ 
			asset: 'mainTitle.png' });
		stage.insert(background);
		*/
		//Q.clearStage(1); 
		var bg = new Q.Background({ type: Q.SPRITE_UI });
		stage.insert(bg);
		Q.audio.stop(); //Stop all the music

		Q.input.on("confirm",function() {
			//si estamos en la escena inicial cargamos el nivel 1
			if(Q.stage().scene.name == "initGame")
				Q.stageScene("level1");  
		});


	});


//level1
	Q.scene("level1",function(stage) {
		Q.stageTMX("level.tmx",stage);

	 	var mario = stage.insert(new Q.Mario({x:150, y:380}));
	 	stage.insert(new Q.Goomba({x:329, y:528}));
	 	stage.insert(new Q.Goomba({x:796, y:528}));
	 	stage.insert(new Q.Goomba({x:852, y:528}));
	 	stage.insert(new Q.Bloopa({x:1553, y:494}));
	 	stage.insert(new Q.Princess({x:1926, y:460}));
	 	stage.insert(new Q.Coin({x:200, y:460}));
	 	stage.insert(new Q.Coin({x:300, y:520}));
	 	stage.insert(new Q.Coin({x:400, y:430}));
	 	stage.insert(new Q.Coin({x:500, y:460}));


	 	Q.state.reset({ coins: 0 });

	 	Q.stageScene('hud', 1);

	 	Q.audio.play('music_main.mp3', {loop: true});
/*
	 	var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0)"
		}));
*/
		//var label = stage.insert(new Q.UI.Text({x: Q.width/2, y: Q.height/2, label: "Coins: " }));

	 	stage.add("viewport").follow(mario);//.follow(Q("Player").first());

	 	stage.viewport.offsetX = -100;
	 	stage.viewport.offsetY = 180;
	 	//stage.add("viewport").centerOn(150, 380);
	});


//End game scene
	Q.scene('endGame',function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Play Again" }))
		var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, label: stage.options.label }));
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('initGame');
		});

		container.fit(20);
	});



	Q.load(["mario_small.png", "mario_small.json", 
			"goomba.png", "goomba.json", 
			"bloopa.png", "bloopa.json", 
			"princess.png",
			"mainTitle.png",
			"coin.png", "coin.json",
			"music_main.ogg", "music_main.mp3",
			"coin.ogg", "coin.mp3",
			"music_die.ogg", "music_die.mp3",
			"music_level_complete.ogg", "music_level_complete.mp3"], function() {
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");
		Q.compileSheets("coin.png","coin.json");

		Q.stageScene("initGame");
	});

	Q.loadTMX("level.tmx, tiles.png", function() {
	  
	});
	
};


