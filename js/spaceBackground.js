// spaceBackground.js

const canvas = document.getElementById('spaceBackground');
const ctx = canvas.getContext('2d');

// --- Entity Arrays ---
let stars = [], asteroids = [], nebulas = [], galaxies = [], alienShips = [], meteors = [], planets = [], cosmicDust = [];

// --- Constants ---
const NUM_STARS = 400;
const NUM_ASTEROIDS = 7;
const NUM_NEBULAS = 2; // Less is more for realism
const NUM_GALAXIES = 2;
const NUM_ALIEN_SHIPS = 2; // More subtle and rare
const NUM_DUST = 700;
const NUM_PLANETS = 1;

// --- UTILITY FUNCTIONS ---
function random(min, max) { return Math.random() * (max - min) + min; }

// --- OBJECT CREATION ---

function createStar() {
    const layer = random(1, 4);
    return {
        x: random(0, canvas.width), y: random(0, canvas.height),
        size: random(0.4, layer === 1 ? 2.0 : layer === 2 ? 1.2 : 0.6),
        speed: layer === 1 ? 0.35 : layer === 2 ? 0.2 : 0.1,
        alpha: random(0.5, 1),
        twinkleSpeed: random(0.005, 0.01), twinkleState: 1,
        color: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'rgba(174, 220, 255, 0.9)' : 'rgba(255, 244, 174, 0.9)') : 'rgba(255, 255, 255, 0.9)'
    };
}

function createAsteroid() {
    const size = random(8, 35);
    return {
        x: random(0, canvas.width), y: random(-size, -size * 2),
        size: size, speed: random(0.1, 0.4),
        rotation: random(0, Math.PI * 2), rotationSpeed: random(-0.004, 0.004),
        shape: Array.from({ length: 12 }, () => random(0.7, 1.3)),
        // REWORKED: Added craters for texture
        craters: Array.from({ length: Math.floor(random(1, 4)) }, () => ({
            x: random(-0.6, 0.6), y: random(-0.6, 0.6), r: random(0.1, 0.3)
        }))
    };
}

function createNebula() {
    // REWORKED: Realistic color palettes
    const palettes = [
        { c1: 'rgba(255, 20, 147, 0.08)', c2: 'rgba(0, 0, 0, 0)' }, // Pink/Magenta (Hydrogen-Alpha)
        { c1: 'rgba(0, 191, 255, 0.09)', c2: 'rgba(0, 0, 0, 0)' }  // Blue/Cyan (Oxygen-III)
    ];
    const p = palettes[Math.floor(random(0, palettes.length))];
    return {
        x: random(0, canvas.width), y: random(0, canvas.height),
        radius: random(400, 700), speed: 0.04,
        color1: p.c1, color2: p.c2
    };
}

function createGalaxy() {
    return {
        x: random(0, canvas.width), y: random(0, canvas.height),
        radius: random(40, 120), speed: 0.02,
        rotation: random(0, Math.PI * 2), rotationSpeed: random(0.0001, 0.0002)
    };
}

function createAlienShip() {
    // REWORKED: More subtle, mysterious shapes
    return {
        x: random(canvas.width, canvas.width + 300), y: random(50, canvas.height - 50),
        size: random(15, 25), speed: random(0.3, 0.8),
        flicker: 0
    };
}

function createPlanet() {
    // REWORKED: Procedural planets with realistic types
    const types = ['gas_giant', 'terran', 'ice'];
    const type = types[Math.floor(random(0, types.length))];
    let palettes;
    if (type === 'gas_giant') {
        palettes = [['#D2B48C', '#8B4513'], ['#B0E0E6', '#708090']];
    } else if (type === 'terran') {
        palettes = [['#4682B4', '#228B22'], ['#A0522D', '#D2B48C']];
    } else { // ice
        palettes = [['#F0F8FF', '#ADD8E6'], ['#E0FFFF', '#B0C4DE']];
    }
    const colors = palettes[Math.floor(random(0, palettes.length))];

    return {
        x: random(0, canvas.width), y: random(0, canvas.height),
        size: random(100, 180), speed: 0.06,
        rotation: 0,
        type: type,
        baseColor: colors[0], landColor: colors[1],
        hasRings: Math.random() > 0.6
    };
}

function createDust() {
    return {
        x: random(0, canvas.width), y: random(0, canvas.height),
        size: random(0.2, 1.0), speed: random(0.5, 1.2),
        alpha: random(0.05, 0.3)
    };
}


// --- DRAW FUNCTIONS ---

function drawStars() {
    stars.forEach(star => {
        // REWORKED: Use a radial gradient for a soft glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size);
        gradient.addColorStop(0, star.color.replace('0.9', '1')); // Opaque center
        gradient.addColorStop(1, star.color.replace('0.9', '0')); // Transparent edge
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawAsteroids() {
    asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -a.size * a.shape[0]);
        for (let i = 1; i < a.shape.length; i++) {
            const angle = (Math.PI * 2 / a.shape.length) * i;
            ctx.lineTo(Math.sin(angle) * a.size * a.shape[i], -Math.cos(angle) * a.size * a.shape[i]);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.9)';
        ctx.fillStyle = '#444';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // REWORKED: Draw craters
        a.craters.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x * a.size, c.y * a.size, c.r * a.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fill();
        });
        ctx.restore();
    });
}

function drawNebulas(n) { /* No changes needed */ }
function drawGalaxies(g) { /* No changes needed */ }

function drawAlienShips() {
    alienShips.forEach(s => {
        // REWORKED: Draw a subtle, dark silhouette
        ctx.fillStyle = `rgba(10, 10, 15, 0.8)`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.size, s.y + s.size / 4);
        ctx.lineTo(s.x - s.size * 1.2, s.y);
        ctx.lineTo(s.x - s.size, s.y - s.size / 4);
        ctx.closePath();
        ctx.fill();

        // A very faint, flickering light
        if (s.flicker > 95) {
            ctx.fillStyle = `rgba(180, 220, 255, ${random(0.5, 1)})`;
            ctx.beginPath();
            ctx.arc(s.x - s.size * 0.8, s.y, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// REWORKED: Planet drawing with procedural textures
function drawPlanets() {
    planets.forEach(p => {
        // Planet body and base color
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.baseColor;
        ctx.fill();

        // Procedural texture (clouds/continents)
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.clip(); // Confine texture drawing to the planet's circle

        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.strokeStyle = p.landColor;
            ctx.lineWidth = random(1, p.size * 0.1);
            ctx.globalAlpha = random(0.2, 0.5);

            const startX = p.x - p.size;
            const endX = p.x + p.size;
            const y = (p.y - p.size) + (i * p.size / 7) + Math.sin(i) * 10;
            const cp1x = startX + (endX - startX) * 0.3;
            const cp2x = startX + (endX - startX) * 0.7;
            
            ctx.moveTo(startX, y);
            ctx.bezierCurveTo(cp1x, y + random(-20, 20), cp2x, y + random(-20, 20), endX, y);
            ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        // Lighting gradient for 3D effect
        const light = ctx.createRadialGradient(p.x - p.size / 2, p.y - p.size / 2, p.size * 0.1, p.x, p.y, p.size * 1.5);
        light.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        light.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        light.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Rings
        if (p.hasRings) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(0.25);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = p.size * 0.05;
            ctx.beginPath();
            ctx.scale(1, 0.2);
            ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    });
}

function drawMeteors() { /* No changes */ }
function drawCosmicDust() { /* No changes */ }


// --- UPDATE FUNCTIONS ---

function update() {
    stars.forEach(s => {
        s.x -= s.speed;
        if (s.x + s.size < 0) s.x = canvas.width + s.size;
        s.alpha += s.twinkleSpeed * s.twinkleState;
        if (s.alpha > 1 || s.alpha < 0.5) s.twinkleState *= -1;
    });

    asteroids.forEach(a => {
        a.y += a.speed; a.rotation += a.rotationSpeed;
        if (a.y - a.size > canvas.height) { a.y = -a.size; a.x = random(0, canvas.width); }
    });

    [...nebulas, ...planets, ...galaxies].forEach(item => {
        const radius = item.radius || item.size || 0;
        item.x -= item.speed;
        if (item.x + radius < 0) item.x = canvas.width + radius;
    });

    alienShips.forEach(s => {
        s.x -= s.speed;
        s.flicker = (s.flicker + 1) % 100;
        if (s.x < -s.size) { s.x = canvas.width + s.size; s.y = random(50, canvas.height - 50); }
    });
    
    cosmicDust.forEach(d => {
        d.x -= d.speed;
        if (d.x < 0) d.x = canvas.width;
    });
}


// --- MAIN LOOP ---

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawNebulas();
    drawGalaxies();
    drawPlanets();
    drawStars();
    drawAsteroids();
    drawAlienShips();
    drawCosmicDust();
    
    update();
    requestAnimationFrame(animate);
}

// --- INITIALIZATION ---

function init() {
   
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stars = Array.from({ length: NUM_STARS }, createStar);
    asteroids = Array.from({ length: NUM_ASTEROIDS }, createAsteroid);
    nebulas = Array.from({ length: NUM_NEBULAS }, createNebula);
    galaxies = Array.from({ length: NUM_GALAXIES }, createGalaxy);
    alienShips = Array.from({ length: NUM_ALIEN_SHIPS }, createAlienShip);
    planets = Array.from({ length: NUM_PLANETS }, createPlanet);
    cosmicDust = Array.from({ length: NUM_DUST }, createDust);
}

window.addEventListener('resize', init);
init();
animate();