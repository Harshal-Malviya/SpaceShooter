window.addEventListener('load', () => {
    const backgroundMusic = document.getElementById('background-music');
    const musicToggleButton = document.getElementById('music-toggle');
    
    // This function handles the logic for playing or pausing the music
    function toggleMusic() {
        if (!backgroundMusic) return; // Safety check

        if (backgroundMusic.paused) {
            backgroundMusic.play();
            localStorage.setItem('musicState', 'playing');
            if (musicToggleButton) musicToggleButton.textContent = 'Mute 🔊';
        } else {
            backgroundMusic.pause();
            localStorage.setItem('musicState', 'paused');
            if (musicToggleButton) musicToggleButton.textContent = 'Unmute 🔇';
        }
    }

    // The clickable button will still work
    if (musicToggleButton) {
        musicToggleButton.addEventListener('click', toggleMusic);
    }

    // --- NEW CODE ADDED HERE ---
    // Add a listener for keyboard presses
    window.addEventListener('keydown', (event) => {
        // Check if the key pressed was 'm' (case-insensitive)
        if (event.key.toLowerCase() === 'm') {
            toggleMusic();
        }
    });
    // --- END OF NEW CODE ---

    // Logic to continue music across pages
    const musicState = localStorage.getItem('musicState');
    const musicTime = localStorage.getItem('musicTime');

    if (musicState === 'playing') {
        if (musicTime) {
            backgroundMusic.currentTime = parseFloat(musicTime);
        }
        backgroundMusic.play().catch(e => console.log("Autoplay was prevented. User must interact first."));
        if (musicToggleButton) {
            musicToggleButton.textContent = 'Mute 🔊';
        }
    } else {
        if (musicToggleButton) {
            musicToggleButton.textContent = 'Unmute 🔇';
        }
    }
    
    // Save the music's current time before the page is closed or reloaded
    window.addEventListener('beforeunload', () => {
        if (backgroundMusic) {
            localStorage.setItem('musicTime', backgroundMusic.currentTime);
        }
    });
});