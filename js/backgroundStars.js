// backgroundStars.js

const bgCanvas = document.getElementById('starBackground');
const bgCtx = bgCanvas.getContext('2d');

let bgStars = [];
// Use a larger number of stars to fill the full screen adequately.
const NUM_BG_STARS = 400;

/**
 * Sets the background canvas size to fill the window and recreates the stars.
 */
function resizeBgCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    createBgStars();
}

/**
 * Populates the star array with random positions, sizes, and speeds.
 */
function createBgStars() {
    bgStars = []; // Clear existing stars
    for (let i = 0; i < NUM_BG_STARS; i++) {
        bgStars.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            // Smaller radius for a more subtle, distant look
            radius: Math.random() * 1.5,
            // Slower speed to create a parallax effect against the game stars
            speed: Math.random() * 2 + 0.5
        });
    }
}

/**
 * The main animation loop for the background.
 */
function animateBg() {
    // Clear the canvas for the next frame
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.fillStyle = 'white';

    // Update and draw each star
    for (const star of bgStars) {
        star.y += star.speed;

        // If a star moves off-screen, reset it to the top at a new random x-position
        if (star.y > bgCanvas.height) {
            star.y = 0;
            star.x = Math.random() * bgCanvas.width;
        }

        // Draw the star
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        bgCtx.fill();
    }

    // Request the next frame to continue the animation
    requestAnimationFrame(animateBg);
}

// Set up the event listener for window resizing
window.addEventListener('resize', resizeBgCanvas);

// Initial setup and start of the animation
resizeBgCanvas();
animateBg();