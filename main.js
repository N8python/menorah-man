window.onload = function() {
  var canvas = document.getElementById("menorahCanvas");
  var ctx = canvas.getContext("2d");
  var width = canvas.width;
  var height = canvas.height;
  var BACKGROUND = document.getElementById("back");
  var TITLE_TEXT = document.getElementById("title");
  var MAN_1 = document.getElementById("man1");
  var MAN_2 = document.getElementById("man2");
  var MENORAH = document.getElementById("menorah");
  var CANDLE_NOTLIT = document.getElementById("unlitCandle");
  var CANDLE_1 = document.getElementById("candle1");
  var CANDLE_2 = document.getElementById("candle2");
  var sinRotation = 0;
  var menorahs = []
  var gameInterval = null;
  var cooldown = 0;
  var candles = [];
  var frame = 1;
  var candleSpawnRate = 75;
  var candleBonusSpeed = 0;
  var score = 0;
  var gameState = "play";
  var alertGiven = false;

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  function randFloat(min, max) {
    return min + Math.random() * (max - min)
  }

  function menorahMan(x, y) {
    this.x = x;
    this.y = y;
    this.aniFrame = 0;
    this.aniRate = 15;
    this.yVel = 0;
    this.displayY = this.y;
  }
  menorahMan.prototype.draw = function() {
    if (this.aniFrame % this.aniRate < (Math.floor(this.aniRate / 2)) + 1) {
      ctx.drawImage(MAN_1, this.x, this.y);
    } else {
      ctx.drawImage(MAN_2, this.x, this.y)
    }
    this.aniFrame += 1;
    if (this.aniFrame % this.aniRate === (Math.floor(this.aniRate / 2)) + 1) {
      this.y -= 5;
      this.displayY -= 5;
    }
    if (this.aniFrame % this.aniRate === 0) {
      this.y += 5;
      this.displayY += 5;
    }
    if (this.y < 225) {
      this.y -= this.yVel;
      this.yVel -= 1;
    } else {
      this.yVel = 0;
      this.y = this.displayY;
    }
  };

  function men(x, y) {
    this.x = x;
    this.y = y;
    this.rot = 0;
  }
  men.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.x + MENORAH.width / 2, this.y + MENORAH.height / 2);
    ctx.rotate(this.rot);
    ctx.drawImage(MENORAH, 0, 0);
    ctx.restore();
    this.x += 20;
    this.rot += randFloat(0.05, 0.35);
  }

  function candle(x, y) {
    this.x = x;
    this.y = y;
    this.lit = false;
  }
  candle.prototype.draw = function() {
    if (!this.lit) {
      ctx.drawImage(CANDLE_NOTLIT, this.x, this.y)
    } else {
      if (frame % 10 < 5) {
        ctx.drawImage(CANDLE_1, this.x, this.y)
      } else {
        ctx.drawImage(CANDLE_2, this.x, this.y)
      }
    }
    this.x -= randInt(5 + candleBonusSpeed, 15 + candleBonusSpeed);
  }
  candle.prototype.cc = function() {
    for (var i = 0; i < menorahs.length; i++) {
      if (menorahs[i].x >= this.x - 40 && menorahs[i].y >= this.y - 40 && menorahs[i].x <= this.x + CANDLE_NOTLIT.width && menorahs[i].y <= this.y + CANDLE_NOTLIT.height + 10) {
        if (!this.lit) {
          score += 100;
        }
        this.lit = true;
      }
    }
    if (this.x < 0 && !this.lit) {
      gameState = "over";
    }
  }

  function startScreen() {
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(BACKGROUND, 0, 0);
    ctx.save()
    ctx.translate(width / 2 - TITLE_TEXT.width / 2, height / 2 - 100);
    ctx.rotate(Math.sin(sinRotation) * Math.PI / 180);
    ctx.drawImage(TITLE_TEXT, 0, 0);
    ctx.restore();
    sinRotation += 0.1;
  }

  function spawnCandles(rate) {
    if (frame % rate == 0) {
      candles.push(new candle(800, randInt(75, 200)));
    }
  }

  var startInterval = setInterval(startScreen, 30);
  var theMan = new menorahMan(100, 230)

  function gameLoop() {
    if (gameState == "play") {
      spawnCandles(candleSpawnRate);
      cooldown -= 1;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(BACKGROUND, 0, 0);
      theMan.draw();
      for (var i = 0; i < menorahs.length; i++) {
        menorahs[i].draw();
      }
      for (var i = 0; i < candles.length; i++) {
        candles[i].draw();
        candles[i].cc();
      }
      if (frame % 100 == 0 && candleSpawnRate > 15) {
        candleSpawnRate -= 7;
        candleBonusSpeed += 0.8;
      }
      ctx.textAlign = "left"
      ctx.font = "20px Fantasy";
      ctx.fillStyle = "Black";
      ctx.fillText("Score: " + score, 10, 20);
      frame += 1;
      score += 1;
      if (score > 10000 && !alertGiven) {
        alert("The code is x5x0. Go to potatoz.net. Then, enter the code in the javascript console in potatoz to recieve the first clue.")
        alertGiven = true;
      }
    } else if (gameState == "over") {
      ctx.fillStyle = "Gold";
      ctx.fillRect(0, 0, width, height)
      ctx.font = "75px Fantasy";
      ctx.fillStyle = "Silver";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", width / 2, height / 2);
      ctx.font = "30px Fantasy";
      ctx.fillText("Your score: " + score, width / 2, height / 2 + 75);
      ctx.fillText("Click to Play Again!", width / 2, height / 2 + 125);
    }
  }

  function startGame() {
    clearInterval(startInterval);
    document.getElementById("startButton").remove();
    if (!gameInterval) {
      gameInterval = setInterval(gameLoop, 30);
    }
  }
  document.getElementById("startButton").onclick = startGame;
  document.addEventListener('keydown', function(event) {
    event.preventDefault();
    var keyName = event.key;
    if (keyName == "ArrowUp") {
      if (theMan.y > 224) {
        theMan.y = 224;
        theMan.yVel = 20;
      }
    }
    if (keyName == "ArrowDown") {
      theMan.yVel -= 3;
    }
    if (keyName == " ") {
      if (cooldown < 1) {
        menorahs.push(new men(theMan.x, theMan.y))
        cooldown = 10;
      }
    }
  });
  document.getElementById("menorahCanvas").addEventListener('mousedown', function() {
    if (gameState == "over") {
      menorahs = []
      cooldown = 0;
      candles = [];
      frame = 1;
      candleSpawnRate = 75;
      candleBonusSpeed = 0;
      score = 0;
      theMan.x = 100;
      theMan.y = 230;
      gameState = "play";
    }
  })
}
