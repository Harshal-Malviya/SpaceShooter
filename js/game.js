const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- IMAGE LOADING ---
const spaceshipImg = new Image();
const droneImg = new Image();
droneImg.src = 'assets/images/drone.png';
const enemyImg = new Image();
enemyImg.src = 'assets/images/enemy.png';

// --- SELECT SHIP BASED ON PLAYER'S CHOICE ---
const selectedShip = localStorage.getItem('selectedShip');
if (selectedShip === 'red') {
    spaceshipImg.src = 'assets/images/red-Falcon.png';
} else if (selectedShip === 'green') {
    spaceshipImg.src = 'assets/images/green-stinger.png';
} else {
    spaceshipImg.src = 'assets/images/spaceship.png';
}

// --- GAME VARIABLES ---
let stars = [];
const NUM_STARS = 200;

let spaceship = { x: canvas.width / 2 - 40, y: canvas.height - 100, width: 80, height: 80, speed: 10, sparkle: false };
let bullets = [];
let enemies = [];
let enemyBullets = [];

// Drone variables using width/height for the image
let droneEnabled = false;
let drone = { x: 0, y: 0, width: 35, height: 35 };
let droneBullets = [];
let lastDroneShot = 0;
let boosted200 = false;
let boosted300 = false;
let boosted500 = false;
let boosted1000 = false;
let score = 0;
let lives = 3;
let gameOver = false;
let keys = {};
let lastShotTime = 0;
let shootInterval = 300;

let difficultyLevel = 1;
let baseEnemySpeed = 1 ;
let baseSpawnRate = 2000;
let enemySpawner;
let powerUps = [];
let activePowerUps = {};

let playerName = localStorage.getItem("playerName") || "Player";
let highscore = localStorage.getItem("highScore") || 0;
let newHighScore = false;

document.getElementById("playerNameDisplay").textContent = `Player: ${playerName}`;
document.getElementById("highScore").textContent = "High Score: " + highscore;

// --- EVENT LISTENERS (CONSOLIDATED) ---
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key.toLowerCase() === "p") {
        droneEnabled = !droneEnabled;
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

window.addEventListener('resize', setCanvasSize);

// --- CORE GAME FUNCTIONS ---
function setCanvasSize() {
    canvas.width = window.innerWidth * 0.3;
    canvas.height = window.innerHeight;
}

function createStars() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * 2 + 0.5
        });
    }
}

function updateDifficulty() {
    // General difficulty scaling
    if (score >= 100) {
        let newLevel = Math.floor((score - 100) / 100) + 1;
        if (newLevel > difficultyLevel) {
            difficultyLevel = newLevel;
            baseEnemySpeed += 1.5;
            enemies.forEach(enemy => enemy.speed += 1.5);

            clearInterval(enemySpawner);
            let newSpawnRate = Math.max(300, baseSpawnRate - (difficultyLevel - 1) * 100);
            enemySpawner = setInterval(() => { if (!gameOver) spawnEnemy(); }, newSpawnRate);

            spaceship.speed += 0.2;
            console.log("⚡ Difficulty increased → Level " + difficultyLevel);
        }
    }

    // Milestone boosts
    if (score >= 200 && !boosted200) {
        baseEnemySpeed += 0.5;
        enemies.forEach(enemy => enemy.speed += 0.5);
        boosted200 = true;
        console.log("⚡ Enemy speed increased at score 200!");
    }
    if (score >= 300 && !boosted300) {
        baseEnemySpeed += 0.5;
        enemies.forEach(enemy => enemy.speed += 0.5);
        boosted300 = true;
        console.log("⚡ Enemy speed increased at score 300!");
    }
    if (score >= 500 && !boosted500) {
        baseEnemySpeed += 1;
        enemies.forEach(enemy => enemy.speed += 1);
        boosted500 = true;
        console.log("⚡ Enemy speed increased at score 500!");
    }
    if (score >= 1000 && !boosted1000) {
        baseEnemySpeed += 1.5;
        enemies.forEach(enemy => enemy.speed += 1.5);
        boosted1000 = true;
        console.log("⚡ Enemy speed increased at score 1000!");
    }

    // Fire rate scaling with score
    if (score >= 500 && shootInterval > 200) {
        shootInterval = 200; 
        console.log("⚡ Fire rate increased!");
    }
    if (score >= 1000 && shootInterval > 150) {
        shootInterval = 150;
    }
}

// --- MOVEMENT AND SHOOTING ---
function handleMovement() {
    let dx = 0;
    let dy = 0;
    if (keys["ArrowLeft"]) dx -= 1;
    if (keys["ArrowRight"]) dx += 1;
    if (keys["ArrowUp"]) dy -= 1;
    if (keys["ArrowDown"]) dy += 1;

    if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * spaceship.speed;
        dy = (dy / length) * spaceship.speed;
        spaceship.x = Math.max(0, Math.min(canvas.width - spaceship.width, spaceship.x + dx));
        spaceship.y = Math.max(0, Math.min(canvas.height - spaceship.height, spaceship.y + dy));
    }
}

function handleShooting() {
    const currentTime = Date.now();
    if (!activePowerUps.laser && keys[" "] && currentTime - lastShotTime > shootInterval) {
        let bulletSpeed = activePowerUps.rapid ? 15 : 7;
        bullets.push({
            x: spaceship.x + spaceship.width / 2 - 2,
            y: spaceship.y,
            width: 4,
            height: 10,
            speed: bulletSpeed
        });
        lastShotTime = currentTime;
    }
}

function handleDroneShooting() {
    if (!droneEnabled) return;
    const now = Date.now();
    if (now - lastDroneShot > 800) {
        droneBullets.push({
            x: drone.x + drone.width / 2 - 2,
            y: drone.y,
            width: 4,
            height: 10,
            speed: 5
        });
        lastDroneShot = now;
    }
}

// --- DRAWING FUNCTIONS ---
function drawSpaceship() {
    ctx.drawImage(spaceshipImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
    if (spaceship.sparkle) {
        ctx.strokeStyle = "gold";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "gold";
        ctx.strokeRect(spaceship.x - 2, spaceship.y - 2, spaceship.width + 4, spaceship.height + 4);
        ctx.shadowBlur = 0;
    }
}

function drawDrone() {
    if (!droneEnabled) return;
    drone.x = spaceship.x + spaceship.width;
    drone.y = spaceship.y + (spaceship.height / 2) - (drone.height / 2);
    ctx.drawImage(droneImg, drone.x, drone.y, drone.width, drone.height);
}

function drawBullets() {
    if (activePowerUps.laser) {
        ctx.fillStyle = "magenta";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "magenta";
        ctx.fillRect(spaceship.x + spaceship.width / 2 - 5, 0, 10, canvas.height);
        ctx.shadowBlur = 0;
        enemies.forEach((enemy, i) => {
            if (enemy.x < spaceship.x + spaceship.width / 2 + 5 && enemy.x + enemy.width > spaceship.x + spaceship.width / 2 - 5) {
                enemies.splice(i, 1);
                score += 10;
                if (Math.random() < 0.2) spawnPowerUp(enemy.x, enemy.y);
            }
        });
        document.getElementById("score").textContent = "Score: " + score;
        return;
    }
    ctx.fillStyle = "yellow";
    bullets.forEach((bullet, i) => {
        bullet.y -= bullet.speed;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        if (bullet.y < 0) bullets.splice(i, 1);
    });
}

function drawDroneBullets() {
    if (!droneEnabled) return;
    ctx.fillStyle = "cyan";
    droneBullets.forEach((bullet, i) => {
        bullet.y -= bullet.speed;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        if (bullet.y < 0) droneBullets.splice(i, 1);
    });
}

function drawEnemies() {
    const enemyWidth = 80;
    const enemyHeight = 80;
    enemies.forEach((enemy, i) => {
        enemy.y += enemy.speed;
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemyWidth, enemyHeight);
        if (enemy.type === "armored") {
            ctx.beginPath();
            ctx.arc(enemy.x + enemyWidth / 2, enemy.y + enemyHeight / 2, enemyWidth / 2 + 5, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                enemy.x + enemyWidth / 2, enemy.y + enemyHeight / 2, 5,
                enemy.x + enemyWidth / 2, enemy.y + enemyHeight / 2, enemyWidth / 2 + 5
            );
            gradient.addColorStop(0, 'rgba(173, 216, 230, 0.8)');
            gradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'cyan';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            if (!activePowerUps.shield) {
                lives--;
                if (lives <= 0) endGame();
            }
        }
    });
}

function drawAndMoveStars() {
    ctx.fillStyle = "white";
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function spawnEnemy() {
    let x = Math.random() * (canvas.width - 80);
    let enemy = { x, y: 0, width: 80, height: 80, speed: baseEnemySpeed, health: 1, type: "normal" };
    if (score >= 200 && Math.random() < 0.2) {
        Object.assign(enemy, { width: 120, height: 120, speed: baseEnemySpeed * 0.5, health: 3, type: "armored" });
    }
    enemies.push(enemy);
}

function drawEnemyBullets() {
    ctx.fillStyle = "Red";
    enemyBullets.forEach((bullet, i) => {
        bullet.y += bullet.speed;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        if (bullet.x < spaceship.x + spaceship.width && bullet.x + bullet.width > spaceship.x && bullet.y < spaceship.y + spaceship.height && bullet.y + bullet.height > spaceship.y) {
            enemyBullets.splice(i, 1);
            if (!activePowerUps.shield) {
                lives--;
                if (lives <= 0) endGame();
            }
        }
        if (bullet.y > canvas.height) enemyBullets.splice(i, 1);
    });
}

function detectCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            const enemy = enemies[i];
            const bullet = bullets[j];
            if (enemy && bullet && bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                bullets.splice(j, 1);
                enemy.health--;
                if (enemy.health <= 0) {
                    score += (enemy.type === "armored") ? 50 : 10;
                    if (Math.random() < 0.2) spawnPowerUp(enemy.x, enemy.y);
                    enemies.splice(i, 1);
                    break;
                }
            }
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = droneBullets.length - 1; j >= 0; j--) {
            const enemy = enemies[i];
            const bullet = droneBullets[j];
            if (enemy && bullet && bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                droneBullets.splice(j, 1);
                enemy.health--;
                if (enemy.health <= 0) {
                    score += 5;
                    enemies.splice(i, 1);
                    break;
                }
            }
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy && spaceship.x < enemy.x + enemy.width && spaceship.x + spaceship.width > enemy.x && spaceship.y < enemy.y + enemy.height && spaceship.y + spaceship.height > enemy.y) {
            enemies.splice(i, 1);
            if (!activePowerUps.shield) {
                lives--;
                if (lives <= 0) endGame();
            }
        }
    }
}

function drawPowerUps() {
    powerUps.forEach((p, i) => {
        p.y += p.speed;
        switch (p.type) {
            case "rapid": ctx.fillStyle = "orange"; break;
            case "shield": ctx.fillStyle = "blue"; break;
            case "life": ctx.fillStyle = "green"; break;
            case "bomb": ctx.fillStyle = "purple"; break;
            case "laser": ctx.fillStyle = "magenta"; break;
        }
        ctx.fillRect(p.x, p.y, p.width, p.height);
        if (p.x < spaceship.x + spaceship.width && p.x + p.width > spaceship.x && p.y < spaceship.y + spaceship.height && p.y + p.height > spaceship.y) {
            applyPowerUp(p.type);
            powerUps.splice(i, 1);
        }
        if (p.y > canvas.height) powerUps.splice(i, 1);
    });
}

function applyPowerUp(type) {
    if (type === "rapid") { activePowerUps.rapid = Date.now(); shootInterval = 100; spaceship.sparkle = true; }
    if (type === "shield") { activePowerUps.shield = Date.now(); }
    if (type === "life") { lives++; }
    if (type === "laser") { activePowerUps.laser = Date.now(); shootInterval = Infinity; bullets = []; showExplosionText("LASER ACTIVATED!"); }
    if (type === "bomb") {
        score += enemies.length * 10;
        enemies = [];
        const explosion = document.getElementById("explosionEffect");
        explosion.classList.remove("explode");
        void explosion.offsetWidth;
        explosion.classList.add("explode");
        showExplosionText("BOOOMMMM!!!!!");
    }
}

function spawnPowerUp(x, y) {
    const types = ["rapid", "shield", "life", "bomb", "laser"];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push({ x, y, width: 20, height: 20, type, speed: 2 });
}

function showExplosionText(text) {
    const msg = document.createElement("div");
    msg.className = "explosionText";
    msg.innerText = text;
    document.getElementById("gameContainer").appendChild(msg);
    setTimeout(() => msg.remove(), 1500);
}

function endGame() {
    gameOver = true;
    document.getElementById("finalScore").textContent = score;
    document.getElementById("finalHighScoreMessage").textContent = newHighScore ? "Congratulations! New high score!" : "High Score: " + highscore;
    document.getElementById("gameOver").style.display = "flex";
}

function restartGame() {
    score = 0;
    lives = 3;
    enemies = [];
    bullets = [];
    enemyBullets = [];
    powerUps = [];
    activePowerUps = {};
    newHighScore = false;
    shootInterval = 300;
    spaceship.sparkle = false;
    spaceship.x = canvas.width / 2 - spaceship.width / 2;
    spaceship.y = canvas.height - 100;
    gameOver = false;
    difficultyLevel = 1;
    baseEnemySpeed = 2;
    baseSpawnRate = 2000;
    spaceship.speed = 10;
    setCanvasSize();
    createStars();
    clearInterval(enemySpawner);
    enemySpawner = setInterval(() => { if (!gameOver) spawnEnemy(); }, baseSpawnRate);
    document.getElementById("gameOver").style.display = "none";
    animate();
}

function updateScoreboard() {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highScore", highscore);
        newHighScore = true;
    }
    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("highScore").textContent = (newHighScore ? "NEW RECORD! " : "High Score: ") + highscore;
    document.getElementById("lives").textContent = "Lives: " + lives;
}

function animate() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    handleMovement();
    handleShooting();
    handleDroneShooting();
    detectCollisions();
    updateScoreboard();
    updateDifficulty(); 

    drawAndMoveStars();
    drawPowerUps();
    drawSpaceship();
    drawDrone();
    drawEnemies();
    drawBullets();
    drawDroneBullets();
    drawEnemyBullets();
    
    if (activePowerUps.rapid && Date.now() - activePowerUps.rapid > 5000) { delete activePowerUps.rapid; shootInterval = 300; spaceship.sparkle = false; }
    if (activePowerUps.shield && Date.now() - activePowerUps.shield > 5000) { delete activePowerUps.shield; }
    if (activePowerUps.laser && Date.now() - activePowerUps.laser > 3000) { delete activePowerUps.laser; shootInterval = 300; }

    requestAnimationFrame(animate);
}

spaceshipImg.onload = function() {
    restartGame();
};