// Step 1 - Konversi ke JavaScript (p5.js)

// Variabel Global
// 0: Initial Screen
// 1: Game Screen
// 2: Game-over Screen

var gameScreen = 0;
var ballX, ballY;
var ballSize = 20;
var ballColor;
var gravity = 1;
var ballSpeedVert = 0;
var airfriction = 0.0001;
var friction = 0.1;
var racketColor;
var racketWidth = 100;
var racketHeight = 10;
var racketBounceRate = 20;
var ballSpeedHorizon = 7;
var wallSpeed = 5;
var wallInterval = 1000;
var lastAddTime = 0;
var minGapHeight = 200;
var maxGapHeight = 300;
var wallWidth = 80;
var wallColors;
var walls = [];
var maxHealth = 100;
var health = 100;
var healthDecrease = 1;
var healthBarWidth = 60;
var score = 0;

function setup() {
  createCanvas(500, 500);

  // PALET WARNA BARU
  ballColor = color(255, 220, 70);       // kuning lembut
  racketColor = color(0, 40, 110);       // biru gelap
  wallColors = color(0, 200, 170);       // hijau toska

  ballX = width/4;
  ballY = height/5;
}

function draw(){
  if (gameScreen == 0) {
    initScreen();
  } else if (gameScreen == 1) {
    gamePlayScreen();
  } else if (gameScreen == 2) {
    gameOverScreen();
  } 
}

function initScreen() {
  background(180, 220, 255);     // biru muda
  textAlign(CENTER);
  fill(255);
  textSize(20);
  text("Klik untuk memulai", width/2, height/2);
}

function gamePlayScreen() {
  background(200, 230, 255);     // biru muda cerah
  drawBall();
  applyGravity();
  keepInScreen();
  drawRacket();
  watchRacketBounce();
  applyHorizontalSpeed();
  wallAdder();
  wallHandler();
  drawHealthBar();
  printScore();
}

function gameOverScreen() {
  background(40, 60, 100); // biru gelap elegan
  textAlign(CENTER);
  fill(255);
  textSize(30);
  text("Game Over", width/2, height/2 - 40);
  textSize(20);
  text("Score: " + score, width/2, height/2);
  textSize(15);
  text("Click to Restart", width/2, height/2 + 40);
}

function restart() {
  score = 0;
  health = maxHealth;
  ballX = width/4;
  ballY = height/5;
  lastAddTime = 0;
  walls = [];
  gameScreen = 0;
}

function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize, ballSize);
}

function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight, 10);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= (ballSpeedVert * airfriction);
}

function makeBounceBottom(surface) {
  ballY = surface - (ballSize/2);
  ballSpeedVert *= -1;
  ballSpeedVert -= (ballSpeedVert * friction);
}

function makeBounceTop(surface) {
  ballY = surface + (ballSize/2);
  ballSpeedVert *= -1;
  ballSpeedVert -= (ballSpeedVert * friction);
}

function makeBounceLeft(surface) {
  ballX = surface + (ballSize/2);
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

function makeBounceRight(surface) {
  ballX = surface - (ballSize/2);
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= (ballSpeedHorizon * airfriction);
}

function watchRacketBounce() {
  var overhead = mouseY - pmouseY;
  if ((ballX + (ballSize/2) > mouseX - (racketWidth/2)) && (ballX-(ballSize/2) < mouseX + (racketWidth/2))) {
    if (dist(ballX, ballY, ballX, mouseY) <= (ballSize/2) + abs(overhead)) {
      makeBounceBottom(mouseY);
      ballSpeedHorizon = (ballX - mouseX) / 5;
      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
    }
  }
}

function keepInScreen() {
  if (ballY + (ballSize/2) > height) makeBounceBottom(height);
  if (ballY - (ballSize/2) < 0) makeBounceTop(0);
  if (ballX - (ballSize/2) < 0) makeBounceLeft(0);
  if (ballX - (ballSize/2) > width) makeBounceRight(width);
}

function mousePressed() {
  if (gameScreen == 0){
    startGame();
  }
  if (gameScreen == 2) {
    restart();
  }
}

function startGame() {
  gameScreen = 1;
}

function gameOver() {
  gameScreen = 2;
}

function wallAdder() {
  if (millis() - lastAddTime > wallInterval){
    var randHeight = round(random(minGapHeight, maxGapHeight));
    var randY = round(random(0, height-randHeight));

    var randWall = [width, randY, wallWidth, randHeight, 0];
    walls.push(randWall);
    lastAddTime = millis();
  }
}

function wallHandler() {
  for (var i = 0; i < walls.length; i++) {
    wallRemover(i);
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
  }
}

function wallDrawer(index) {
  var wall = walls[index];
  var gapWallX = wall[0];
  var gapWallY = wall[1];
  var gapWallWidth = wall[2];
  var gapWallHeight = wall[3];

  rectMode(CORNER);
  fill(wallColors);
  rect(gapWallX, 0, gapWallWidth, gapWallY, 10);
  rect(gapWallX, gapWallY+gapWallHeight, gapWallWidth, height-(gapWallY+gapWallHeight), 10);
}

function wallMover(index) {
  walls[index][0] -= wallSpeed;
}

function wallRemover(index) {
  if (walls[index][0] + walls[index][2] <= 0) {
    walls.splice(index,1);
  }
}

function watchWallCollision(index) {
  var wall = walls[index];
  
  var gapWallX = wall[0];
  var gapWallY = wall[1];
  var gapWallWidth = wall[2];
  var gapWallHeight = wall[3];
  var wallScored = wall[4];

  var wallTopX = gapWallX;
  var wallTopY = 0;
  var wallTopWidth = gapWallWidth;
  var wallTopHeight = gapWallY;

  var wallBottomX = gapWallX;
  var wallBottomY = gapWallY + gapWallHeight;
  var wallBottomWidth = gapWallWidth;
  var wallBottomHeight = height - (gapWallY + gapWallHeight);

  if (
    (ballX+(ballSize/2) > wallTopX) &&
    (ballX-(ballSize/2) < wallTopX+wallTopWidth) &&
    (ballY+(ballSize/2) > wallTopY) &&
    (ballY-(ballSize/2) < wallTopY+wallTopHeight)
  ) decreaseHealth();

  if (
    (ballX+(ballSize/2) > wallBottomX) &&
    (ballX-(ballSize/2) < wallBottomX+wallBottomWidth) &&
    (ballY+(ballSize/2) > wallBottomY) &&
    (ballY-(ballSize/2) < wallBottomY+wallBottomHeight)
  ) decreaseHealth();

  if (ballX > gapWallX + (gapWallWidth/2) && wallScored == 0) {
    wall[4] = 1;
    addScore();
  }
}

function addScore() {
  score++;
}

function printScore() {
  textAlign(CENTER);
  fill(255);
  textSize(30);
  text(score, width/2, 50);
}

function drawHealthBar() {
  noStroke();
  fill(240);
  rectMode(CORNER);
  rect(ballX-(healthBarWidth/2), ballY-30, healthBarWidth, 5);

  if (health > 60) fill(46,204,113);
  else if (health > 30) fill(230,126,34);
  else fill(231,76,60);

  rect(ballX-(healthBarWidth/2), ballY-30, healthBarWidth*(health/maxHealth), 5);
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) gameOver();
}
