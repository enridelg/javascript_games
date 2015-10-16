var sprites = {
  frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
  bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
  car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
  car2: { sx: 191, sy: 0, w: 48, h: 48, frames: 1 },  
  car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
  car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
  car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
  trunk: { sx: 288, sy: 383, w: 142, h: 48, frames: 1 },
  death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 },
  water: { sx: 433, sy: 48, w: 320, h: 144, frames: 1 },
  home: { sx: 433, sy: 0, w: 320, h: 48, frames: 1 },
  life: { sx: 144, sy: 288, w: 48, h: 48, frames: 1 , size: 0.3},
  bug: { sx: 104, sy: 300, w: 30, h: 30, frames: 1 },
  snake: { sx: 0, sy: 384, w: 96, h: 48, frames: 3 },
  turtle: { sx: 0, sy: 240, w: 48, h: 48, frames: 5 }
};

var OBJECT_PLAYER = 1,
    OBJECT_CAR = 2,
    OBJECT_TRUNK = 4,
    OBJECT_WATER = 8,
    OBJECT_HOME = 16,
    OBJECT_BUG = 32,
    OBJECT_SNAKE = 64,
    OBJECT_TURTLE = 128;

var FROG_LIFES = 3;                       //VIDAS

var MAX_TIME = 50;                       //TIEMPO

var DELETE_BUG = 6;                       //timpo que dura un bicho antes de desaparecer
var NEW_BUG = 6;                          //tiempo  en el que creamos un nuevo bicho


var level1 = [
//Sprite, row, direction, speed, frecuency(seconds)

 ['car1', 4, 'left', 25, 10],
 ['car2', 3, 'right', 40, 10],
 ['car3', 2, 'left', 20, 10],
 ['car4', 1, 'right', 25, 10],
 ['trunk', 3, 'left', 40, 12],
 ['trunk', 2, 'right', 50, 5],
 ['trunk', 1, 'left', 30, 11],
 ['snake', 0, '', 25, 15],
 ['turtle', 3, '', 40, 3],
 ['turtle', 1, '', 30, 4]
]; 

var startGame = function() {
  
  Game.setBoard(0, new Background());
  
  Game.setBoard(3,new TitleScreen("Frogger", 
                                  "Press enter to start playing",
                                  playGame));
};

var playGame = function() {
  var board = new GameBoard();
  Game.setBoard(1, board);
  var lifes = addLifes(board);
  board.add(new Home());
  board.add(new Water());
  board.add(new Spawner(level1));
  board.add(new Frog(lifes));


  Game.setBoard(3,new TitleScreen("","", false));
  Game.setBoard(4,new GamePoints());
  Game.setBoard(5,new Timer());
};

var addLifes = function(board) {
  var lifes = new Array();
  for (var i = 0; i < FROG_LIFES; i++) {
    var l = new Life(10 + (20 * i), Game.canvas.height - 18);
    board.add(l);
    lifes.push(l);
  }
  return lifes;
} 


/*************************** 
BACKGROUND
****************************/
var Background = function() {
  this.x = 0;
  this.y = 0;
  this.setup('bg', {});

  //this.step = function(dt){};
};

Background.prototype = new Sprite();
Background.prototype.step = function(dt){};

/*************************** 
FROG
****************************/

var Frog = function(l) {
  this.setup('frog', {vx: 0, water: false, life: FROG_LIFES, initX: 0, initY: 0, lifes: l});

  this.x = Game.width/2 - this.w/2; //La mitad de la pantalla
  this.y = Game.height - this.h;
  this.initX = this.x;
  this.initY = this.y;
};

Frog.prototype = new Sprite();
Frog.prototype.step = function(dt) {
    if(Game.keys['left']) {
      Game.keys['left'] = false;
      this.x -= 48;
    }
    else if(Game.keys['right']) {
      Game.keys['right'] = false;
      this.x += 48;
    }
    else if(Game.keys['up']) {
      Game.keys['up'] = false;
      Game.points += 10;          //al movernos hacia arriba sumamos 10 puntos
      this.y -= 48;
    }
    else if(Game.keys['down']) {
      Game.keys['down'] = false;
      this.y += 48;
    }

    this.x += this.vx * dt;

    if(this.vx == 0 && this.water) //Si no hay movimiento probocado por un tronco y estamos en el agua adios rana
      this.hit();
    this.vx = 0;
    this.water = false;             //Eliminamos el movimiento y el contacto con el agua por si salimos de un tronco o del agua

    //Controlamos que no pueda salir por el eje x
    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }
    //Controlamos que no pueda salir por el eje y
    if(this.y < 0) { this.y = 0; }
    else if(this.y > Game.height - this.h) { 
      this.y = Game.height - this.h;
    }

    if(Game.sec == 0){
      this.loseLife();
      if(this.life > 0) {   //Si nos quedan vidas y el tiempo se ha terminado lo restablecemos
        clockRestart();
      }
    }

};

Frog.prototype.type = OBJECT_PLAYER;

Frog.prototype.hit = function() {

  this.board.add(new Death(this.x, this.y));
  this.x = this.initX;
  this.y = this.initY;

  this.loseLife();

  if(this.life > 0) {   //Si nos quedan vidas y el tiempo se ha terminado lo restablecemos
    clockRestart();
  }
};

Frog.prototype.onWater = function() {
  this.water = true;
};

Frog.prototype.onTrunk = function(speed) {
  this.vx = speed;
};

Frog.prototype.loseLife= function () {
  this.life--;
  this.board.remove(this.lifes.pop());
  Game.clearCanvas();

  if(this.life == 0) {
    if(this.board.remove(this)) {
      loseGame();
    }
  }
}

Frog.prototype.win = function() {
  this.x = this.initX;
  this.y = this.initY;
  Game.points += 100;
  clockRestart();
  //winGame();

};

/*************************** 
CAR
****************************/

var Car = function (type, row, dir, speed) {

  this.setup(type, {d: dir, s: speed});

  if(this.d == 'right')
    this.x = -this.w;         //oculto a la izquierda de la pantalla
  else{
    this.s = -this.s;
    this.x = Game.width;  //oculto por la derecha
  }
  if(row > 4)
    row = 4;
  else if(row < 1)
    row = 1;

  this.y = (Game.height - this.h) - 48 * row; //Fila min 1 max 4
}

Car.prototype = new Sprite();
Car.prototype.step = function(dt) {

  this.x += this.s * dt;

  if(this.x < -this.w && this.d == 'left')
    this.board.remove(this);
  else if(this.x > Game.width && this.d == 'right')
    this.board.remove(this);


  var collision = this.board.collide(this, OBJECT_PLAYER); //Buscamos la colision con la rana

  if(collision)
    collision.hit();

};

Car.prototype.type = OBJECT_CAR;

/*************************** 
TRUNK
****************************/

var Trunk = function (row, dir, speed) {

  this.setup('trunk', {d: dir, s: speed});

  if(this.d == 'right')
    this.x = -this.w;         //oculto a la izquierda de la pantalla
  else{
    this.s = -this.s;
    this.x = Game.width;  //oculto por la derecha
  }
  if(row > 3)
    row = 3;
  else if(row < 1)
    row = 1;

  this.y = 48 * row; //Fila min 1 max 3
}

Trunk.prototype = new Sprite();

Trunk.prototype.step = function(dt) {

  this.x = this.x + this.s * dt;

  if(this.x < -this.w && this.d == 'left')
    this.board.remove(this);
  else if(this.x > Game.width && this.d == 'right')
    this.board.remove(this);


  var collision = this.board.collide(this, OBJECT_PLAYER); //Buscamos la colision con la rana

  if(collision)
    collision.onTrunk(this.s);

};

Trunk.prototype.type = OBJECT_TRUNK;

/*************************** 
WATER
****************************/

var Water = function () {

  this.setup('water', {});

  this.x = 0;
  this.y = 48;
}

Water.prototype = new Sprite();

Water.prototype.step = function(dt) {
  var collision = this.board.collide(this, OBJECT_PLAYER); //Buscamos la colision con la rana

  if(collision)
    collision.onWater();

};

Water.prototype.draw = function (){}; //Reimplementamos para que no pinte el agua

Water.prototype.type = OBJECT_WATER;


/*************************** 
DEATH
****************************/

var Death = function(X, Y) {
  this.setup('death', { frame: 0, slow: 0.3 });
  this.x = X;
  this.y = Y;
  this.slowDeath = this.slow;                 //this.slow y this.slowDeath son utilizadas para relentizar la animacion de la muerte
};

Death.prototype = new Sprite();

Death.prototype.step = function(dt) {

  this.slowDeath -= dt;

  if(this.slowDeath < 0){
    this.frame++;
    this.slowDeath = this.slow;
  }

  if(this.frame >= 4) {
    this.board.remove(this);
  }
};


/*************************** 
HOME
****************************/

var Home = function () {
  this.setup('home', {});

  this.x = 0;
  this.y = 0;
}

Home.prototype = new Sprite();

Home.prototype.step = function(dt) {

  var collision = this.board.collide(this, OBJECT_PLAYER); //Buscamos la colision con la rana

  if(collision)
    collision.win();

};

Home.prototype.draw = function (){}; //Reimplementamos para que no pinte la zona de home

Home.prototype.type = OBJECT_HOME;

/*************************** 
SPAWNER
****************************/

var Spawner = function(l) {
  this.level = l;
  this.timers = [];
  this.bugsArray = [];
  this.newBug = 0;
  this.deleteBug = DELETE_BUG;

  for (var element in this.level)
    this.timers[element] = 0;
}

Spawner.prototype = new Sprite();

Spawner.prototype.step = function (dt) {
  this.newBug -= dt;
  this.deleteBug -= dt;

  for(var timer in this.timers){
    this.timers[timer] -= dt;
    if(this.timers[timer] < 0) {
      this.timers[timer] = this.level[timer][4];
      this.createElement(this.level[timer]);
    }
  }

  if(this.newBug < 0){
      var aux = new Bug();  //creamos un bicho
      this.board.add(aux);
      this.bugsArray.push(aux);
      this.newBug = NEW_BUG;
  }
  if(this.deleteBug < 0) {
    this.board.remove(this.bugsArray.shift());
    this.deleteBug = DELETE_BUG;
  }

};

Spawner.prototype.draw = function() {};

Spawner.prototype.createElement = function(element) {
  if(element[0] == 'trunk') {
    this.board.addToBegin(new Trunk(element[1], element[2], element[3]));
  }
  else if(element[0] == 'snake') {
    this.board.addToBegin(new Snake(element[3]));
  }
  else  if(element[0] == 'turtle') {
    this.board.addToBegin(new Turtle(element[1], element[3]));
  }
  else {
    this.board.addToBegin(new Car(element[0], element[1], element[2], element[3]));
  }
}
/*************************** 
LIFE
****************************/
var Life = function (xpos, ypos) {

  this.setup('life', {});

  this.x = xpos;
  this.y = ypos;
};

Life.prototype = new Sprite();

Life.prototype.step = function(dt) {};



/*************************** 
BUG
****************************/


var Bug = function () {

  this.setup('bug', {});

    this.x = Math.floor((Math.random() * 6)) * 48 + 18;//Lo colocamos en alguna casilla aleaotria que no sea la de salida ni la de home
    this.y = Math.floor((Math.random() * 8)) * 48 + (18 + 48);  //+18 para compensar el tamaño del bicho 30x30

};

Bug.prototype = new Sprite();
Bug.prototype.step = function(dt) {

  var collision = this.board.collide(this, OBJECT_PLAYER); //Buscamos la colision con la rana

  if(collision) {
    Game.points += 50;
    this.board.remove(this);
  };

};

Bug.prototype.type = OBJECT_BUG;

/*************************** 
SNAKE
****************************/


var Snake = function (speed) {

  this.setup('snake', {frame: 0, s: speed, f: 0.40});

  this.animation = this.f;
  //this.auxf = 1;

  this.s = -this.s;
  this.x = Game.width;  //oculto por la derecha

  this.y = 192; //Camino entre agua y carretera
};

Snake.prototype = new Sprite();
Snake.prototype.step = function(dt) {

  this.animation -=dt;


  if(this.animation < 0){
    this.frame++;
    this.animation = this.f;
  }

  if(this.frame == 3)
    this.frame = 0;
/*
  if(this.animation < 0){
    this.frame += this.auxf;
    this.animation = this.f;
  }

  if(this.frame == 2 || this.frame == 0)
    this.auxf*=(-1);
*/
  this.x += this.s * dt;

  if(this.x < -this.w)
    this.board.remove(this);


  var collision = this.board.collide(this, OBJECT_PLAYER); //Buscamos la colision con la rana

  if(collision)
    collision.hit();

};

Snake.prototype.type = OBJECT_SNAKE;


/*************************** 
Turtle
****************************/

var Turtle = function (row, speed) {

  this.setup('turtle', {frame: 0, s: speed, f: 0.80});

  this.animation = this.f;

  this.s = -this.s;
  this.x = Game.width;  //oculto por la derecha

  if(row > 3)
    row = 4;
  else if(row < 1)
    row = 1;

  this.y = 48 * row; //Fila min 1 max 3
}

Turtle.prototype = new Sprite();

Turtle.prototype.step = function(dt) {

  this.animation -=dt;

  if(this.animation < 0){
    this.frame++;
    this.animation = this.f;
  }

  if(this.frame == 5)
    this.frame = 0;

  this.x = this.x + this.s * dt;

  if(this.x < -this.w && this.d)
    this.board.remove(this);


  var collision = this.board.collide(this, OBJECT_PLAYER); //Buscamos la colision con la rana

  if(collision && this.frame < 4)
    collision.onTrunk(this.s);


  var collision = this.board.collide(this, OBJECT_TRUNK); //Buscamos la colision con la rana

  if(collision)
    this.board.remove(this);      //Si chocamos con un tronco eliminamos la tortuga

};

Turtle.prototype.type = OBJECT_TURTLE;

/*************************** 
OTHER
****************************/

/*
var winGame = function() {

  Game.setBoard(3,new TitleScreen("You win", 
                                  "Press enter to play again",
                                  playGame));
};
*/
var loseGame = function() {
  if(Game.points > Game.maxPoints)
      Game.maxPoints = Game.points;
  Game.setBoard(3,new TitleScreen("You loose", 
                                  "Max points: " + Game.maxPoints + "   Enter to continue",
                                  playGame));
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

var clockRestart = function () { 
  Game.sec = MAX_TIME;
  Game.oneSec = 1;
};

