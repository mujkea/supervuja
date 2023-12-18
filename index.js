let canv = document.getElementById("canv");
const ctx = canv.getContext("2d");
canv.width = window.innerWidth;
canv.height = window.innerHeight - 40; 

let score = 0;

let isMovingLeft = false;
let isMovingRight = false;

let animationFrameId;
let lastTimestamp;
let lastMoveTimestamp;

let gameState = 'playing'; 

let bullets = [];
let enemies = [];

const playerBulletImage = new Image();
playerBulletImage.src = 'vuja_bullet.png'; 

const player = {
  x: canv.width / 2, 
  y: canv.height - 110, 
  radius: 19, 
  speed: 5, 
  image: new Image()
};

player.image.src = 'vuja.png';

class Enemy {
  constructor(x, y, width, height, speed, enemyImageSrc, bulletImageSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;

    this.shootingTimer = 0;
    this.shootingInterval = 2500;
    
    this.enemyImage = new Image();
    this.enemyImage.src = enemyImageSrc;

    this.bulletImageSrc = bulletImageSrc;
    
    this.bullets = [];
    this.bulletImage = new Image();
    this.bulletImage.src = bulletImageSrc;
  }

  drawEnemyBullet(ctx, bullet) {
    ctx.drawImage(this.bulletImage, bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 8, bullet.radius * 8);
  }

  drawEnemyBullets(ctx) {
    this.bullets.forEach(bullet => {
      this.drawEnemyBullet(ctx, bullet);
    });
  }

  shoot() {
    const bullet = {
      x: this.x + this.width / 2,
      y: this.y + this.height,
      radius: 5,
      speed: 3, 
    };

    this.bullets.push(bullet);
  }

  moveBullets(elapsed) {
    this.bullets = this.bullets.filter(bullet => bullet.y < canv.height); 

    this.bullets.forEach(bullet => {
      bullet.y += bullet.speed * (elapsed / 16);
    });
  }

  updateShootingTimer(elapsed) {
    this.shootingTimer += elapsed;

   
    while (this.shootingTimer >= this.shootingInterval) {
      this.shoot();
      this.shootingTimer -= this.shootingInterval; 
    }
  }

  drawBullets(ctx) {
    this.bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#F00'; 
      ctx.fill();
      ctx.closePath();
    });
  }

  draw(ctx) {
    ctx.drawImage(this.enemyImage, this.x, this.y, this.width, this.height);
    this.drawEnemyBullets(ctx);
  }
}

document.getElementById('leftButton').addEventListener('mousedown', startMoveLeft);
document.getElementById('leftButton').addEventListener('mouseup', stopMoveLeft);
document.getElementById('rightButton').addEventListener('mousedown', startMoveRight);
document.getElementById('rightButton').addEventListener('mouseup', stopMoveRight);

document.getElementById('leftButton').addEventListener('touchstart', startMoveLeft);
document.getElementById('leftButton').addEventListener('touchend', stopMoveLeft);
document.getElementById('rightButton').addEventListener('touchstart', startMoveRight);
document.getElementById('rightButton').addEventListener('touchend', stopMoveRight);

document.getElementById('shootButton').addEventListener('click', shoot);

function shoot() {
  const bullet = {
    x: player.x,
    y: player.y - player.radius, 
    radius: 5,
    speed: 3, 
  };

  bullets.push(bullet);
}
function drawPlayerBullet(ctx, bullet) {
  ctx.drawImage(playerBulletImage, bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 5.5, bullet.radius * 5.5);
}

function moveBullets(elapsed) {
  bullets = bullets.filter(bullet => bullet.y > 0);

  bullets.forEach(bullet => {
    bullet.y -= bullet.speed * (elapsed / 16);

    enemies.forEach(enemy => {
      if (
        bullet.x + bullet.radius > enemy.x &&
        bullet.x - bullet.radius < enemy.x + enemy.width &&
        bullet.y + bullet.radius > enemy.y &&
        bullet.y - bullet.radius < enemy.y + enemy.height
      ) {
       
        bullets = bullets.filter(b => b !== bullet);
        enemies = enemies.filter(e => e !== enemy);
       
        score += 10;
      }
    });
  });
  
  checkPlayerCollision(); 
}

function moveEnemies(elapsed) {

    if (Math.random() < 0.001) {
        generateRandomEnemy();
    }

    enemies.forEach(enemy => {
    enemy.y += enemy.speed * (elapsed / 16);
    enemy.moveBullets(elapsed);
    enemy.updateShootingTimer(elapsed);

    enemy.bullets.forEach(bullet => {
      if (
        bullet.x + bullet.radius > player.x - player.radius &&
        bullet.x - bullet.radius < player.x + player.radius &&
        bullet.y + bullet.radius > player.y - player.radius &&
        bullet.y - bullet.radius < player.y + player.radius
      ) {
        gameState = 'gameOver';
        console.log('Player hit by bullet');
      }
    });

    if (
        enemy.x + enemy.width > player.x - player.radius &&
        enemy.x < player.x + player.radius &&
        enemy.y + enemy.height > player.y - player.radius &&
        enemy.y < player.y + player.radius
    ) {
        gameState = 'gameOver';
        console.log('Player hit by enemy');
    }
  });

    enemies = enemies.filter(enemy => enemy.y < canv.height);
}

function checkPlayerCollision() {
  enemies.forEach(enemy => {
    enemy.bullets.forEach(bullet => {
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < player.radius + bullet.radius) {
            gameState = 'gameOver';
            console.log('Player hit by bullet');
        }
    });

        const dx = player.x - enemy.x - enemy.width / 2;
        const dy = player.y - enemy.y - enemy.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + Math.max(enemy.width, enemy.height) / 2) {
        gameState = 'gameOver';
        console.log('Player hit by enemy');
    }
  });
}

function drawBullets() {
  bullets.forEach(bullet => {
    drawPlayerBullet(ctx, bullet);
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    enemy.draw(ctx);
    enemy.drawEnemyBullets(ctx);
  });
}

function draw() {

  if (gameState === 'playing') {
    
    ctx.drawImage(player.image, player.x - player.radius, player.y - player.radius, player.radius * 2, player.radius * 2);

    drawBullets();

    drawEnemies();

    requestAnimationFrame(draw);
  } else if (gameState === 'gameOver') {
    ctx.clearRect(0, 0, canv.width, canv.height);

    // Save the score in localStorage if it's a new high score
    highScore = parseInt(localStorage.getItem('score'))
    if (score > highScore) {

    // Save the new high score
    localStorage.setItem('score', score);

    // Show game over message, restart button, and congratulations message with an image
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    const gameOverTextHS = 'Osvojili ste redbull Vuja edition';
    ctx.fillText(gameOverTextHS, canv.width / 2 - ctx.measureText(gameOverTextHS).width / 2, canv.height / 2 - 90);

    ctx.font = '15px Arial';
    const scoreTextHS = 'Novi skor: ' + score;
    ctx.fillText(scoreTextHS, canv.width / 2 - ctx.measureText(scoreTextHS).width / 2, canv.height / 2 -70);

    ctx.font = '15px Arial';
    const restartText = 'Pritisni bilo gdje da ponovo igraš'
    ctx.fillText(restartText, canv.width / 2 - ctx.measureText(restartText).width / 2, canv.height / 2 - 30);

    const imageURL = 'rb.png';
    const image = new Image();
    image.src = imageURL;
    image.onload = function () {
        ctx.drawImage(image, canv.width / 2 - 50, canv.height / 2 + 5, 100, 240);
    };

  canv.addEventListener('click', restartGame);
} else {
      
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.fillStyle = '#000';
        ctx.font = '30px Arial';
        const gameOverText = 'Fasovali ste po ušima!';
        ctx.fillText(gameOverText, canv.width / 2 - ctx.measureText(gameOverText).width / 2, canv.height / 2 - 20);

        ctx.font = '20px Arial';
        const scoreText = 'Vaš skor je: ' + score;
        ctx.fillText(scoreText, canv.width / 2 - ctx.measureText(scoreText).width / 2, canv.height / 2 + 10);

        ctx.font = '20px Arial';
        const restartText = 'Pritisni bilo gdje da ponovo igraš'
        ctx.fillText(restartText, canv.width / 2 - ctx.measureText(restartText).width / 2, canv.height / 2 + 30);

        canv.addEventListener('click', restartGame);
 
    }
}
}

function restartGame() {
  canv.removeEventListener('click', restartGame);
  location.reload();
}


function startMoveLeft() {
  isMovingLeft = true;
  move();
}

function stopMoveLeft() {
  isMovingLeft = false;
}

function startMoveRight() {
  isMovingRight = true;
  move();
}

function stopMoveRight() {
  isMovingRight = false;
}

function move() {
  if (gameState === 'playing') {
    if (!lastMoveTimestamp) {
      lastMoveTimestamp = performance.now();
    }

    const timestamp = performance.now();
    const elapsed = timestamp - lastMoveTimestamp;
    lastMoveTimestamp = timestamp;

    const speed = player.speed * (elapsed / 16);

    if (isMovingLeft) {
      player.x -= speed;
      if (player.x - player.radius < 0) {
        player.x = player.radius;
      }
    }

    if (isMovingRight) {
      player.x += speed;
      if (player.x + player.radius > canv.width) {
        player.x = canv.width - player.radius;
      }
    }

    moveBullets(elapsed);

    moveEnemies(elapsed);

    ctx.clearRect(0, 0, canv.width, canv.height);

    ctx.drawImage(player.image, player.x - player.radius, player.y - player.radius, player.radius * 2, player.radius * 2);

    drawBullets();

    drawEnemies();

    animationFrameId = requestAnimationFrame(move);
  }
}

window.addEventListener('resize', () => {
  canv.width = window.innerWidth;
  canv.height = window.innerHeight - 40; 
});

function startGame() {
  document.getElementById('welcomePopup').style.display = 'none';
  document.getElementById('legendPopup').style.display = 'none';
  enableButtons();
  draw();
}

function generateRandomEnemy() {
  if (enemies.length < 7) {
    const x = Math.random() * (canv.width - 30); 
    const y = 0; 
    const width = 40;
    const height = 40;
    const speed = Math.random() * (1.5 - 0.5) + 0.5; 

    const enemyImages = ['neira.png', 'elko.png', 'sara.png', 'amar.png', 'ada.png', 'samira.png', 'novo.png', 'nejla.png', 'limo.png'];
    
    const randomEnemyImage = enemyImages[Math.floor(Math.random() * enemyImages.length)];

    const bulletImageSrc = randomEnemyImage.replace('.png', '_bullet.png');
    
    const newEnemy = new Enemy(x, y, width, height, speed, randomEnemyImage, bulletImageSrc);
    enemies.push(newEnemy);
  }
}

function showWelcomePopup() {
    disableButtons()
      document.getElementById('welcomePopup').style.display = 'block';
       if (localStorage.getItem('score') != null) {
        document.getElementById('highscore').innerHTML = 'Highscore: ' + parseInt(localStorage.getItem('score'));
       } else {
         document.getElementById('highscore').innerHTML = 'Highscore: 0';
       }
    }

    function hideWelcomePopup() {
      document.getElementById('welcomePopup').style.display = 'none';
    }

    function showLegend() {
  const legendPopup = document.getElementById('legendPopup');
  legendPopup.innerHTML = '<h2>Dušmani</h2> \n <hr>';
  
  const enemyDescriptions = {
    'neira.png': 'Opasna daska - ako te zakači, fraktura lakta zagarantovana al\' imaš ljude u vojnoj.',
    'elko.png': 'Brzi kawasaki - od prebrze vožnje umreš od straha!',
    'sara.png': 'Zarazni mikroskop - ako te udari fasuješ neotkrivenu bolešćugu.',
    'amar.png': 'Siromašni laptop - ako te pogodi ostaneš bez para eventualno izazove kratki spoj.',
    'ada.png': 'Leteća diploma - regrutuje Muju da te pošalje za Kanadu.',
    'samira.png': 'Vješto klupko - isplete ti džemper, umreš od vrućine.',
    'novo.png': 'Šampionski joystick - primiš joystick u sljepočnicu, još mu nabaviš novi.',
    'nejla.png': 'Precizni uglomjer - projektuje ti smrt pod savršenim uglom.',
    'limo.png': 'LV torbica - torbicom ga Fuade.'
  };

  for (const enemyImage in enemyDescriptions) {
    const bulletImage = enemyImage.replace('.png', '_bullet.png');
    legendPopup.innerHTML += `<img src="${enemyImage}" alt="Enemy" />`;
    legendPopup.innerHTML += `<img src="${bulletImage}" alt="Enemy Weapon" />`;
    legendPopup.innerHTML += `<p>${enemyDescriptions[enemyImage]}</p>`;
    legendPopup.innerHTML += `<hr>`
  }

  legendPopup.innerHTML += '  <button class="button-53" role="button" onclick="closeLegend()" style="background-color: #e44a4a; margin-top:10%">Zatvori</button>';

  legendPopup.style.height = '400px'; 
  legendPopup.style.overflowY = 'auto';

  legendPopup.style.display = 'block';
}

function hideLegend() {
    document.getElementById('legendPopup').style.display = 'none';
}
    function disableButtons() {
    document.getElementById('leftButton').disabled = true;
    document.getElementById('shootButton').disabled = true;
    document.getElementById('rightButton').disabled = true;
    document.getElementById('buttons').style.display = 'none';
}

function enableButtons() {
    document.getElementById('leftButton').disabled = false;
    document.getElementById('shootButton').disabled = false;
    document.getElementById('rightButton').disabled = false;
    document.getElementById('buttons').style.display = 'flex';
}

function closeLegend() {
    document.getElementById('legendPopup').style.display = 'none';
}

showWelcomePopup();
