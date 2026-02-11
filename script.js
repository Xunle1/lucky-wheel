// Initialize Audio Context
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Sound Synthesis Functions
function playTickSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Woodblock-ish sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playWinSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Simple Fanfare Arpeggio
    [440, 554, 659, 880].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.value = freq;
        
        const startTime = now + i * 0.1;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.6);
    });
}

// Logic
document.addEventListener('DOMContentLoaded', () => {
    const spinnerList = document.getElementById('spinnerList');
    const spinBtn = document.getElementById('spinBtn');
    
    const ITEM_HEIGHT = 120; // Must match CSS
    // How many times we repeat the list to ensure we can scroll "forever"
    const REPEAT_COUNT = 50; 
    
    // 1. Populate List
    // We create a massive list so we can just scroll down a huge distance
    let fullList = [];
    for(let i=0; i<REPEAT_COUNT; i++) {
        fullList = fullList.concat(DRINKS);
    }
    
    fullList.forEach(drink => {
        const el = document.createElement('div');
        el.className = 'spinner-item';
        el.textContent = drink;
        spinnerList.appendChild(el);
    });

    // 2. State
    let isSpinning = false;
    
    spinBtn.addEventListener('click', async () => {
        if (isSpinning) return;
        
        // Init audio on first user gesture
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }
        
        startSpin();
    });

    function startSpin() {
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = "转动中...";
        
        // Remove winner styles if any
        const items = document.querySelectorAll('.spinner-item');
        items.forEach(i => i.classList.remove('winner-pulse'));

        // Calculate a random landing spot
        // We want to land somewhere deep in the list (e.g., between 1/2 and 3/4 way down)
        // This ensures the animation is long enough
        const minIndex = Math.floor(fullList.length / 2);
        const maxIndex = fullList.length - 10; // Don't go to very end
        const winnerIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
        
        // The pixel position to scroll to
        // We want the winner to be centered in the 120px window.
        // The window is 120px tall. The item is 120px tall. 
        // So scrolling to (index * 120) puts that item at the top of the container.
        const targetScrollTop = winnerIndex * ITEM_HEIGHT;
        
        // Current position
        const startScrollTop = spinnerList.scrollTop;
        
        // Reset to top if we are too far down (this effectively "loops" it for next time invisibly if needed, 
        // but since we just built the list, we assume we start near 0 or previous end.
        // Actually, to make it simple, let's just animate from current to target.
        // Note: If previous spin ended deep, we might run out of list.
        // BETTER APPROACH for "Spin Again": Reset list to top (visually seamless if we align items) 
        // but for simplicity in this V1, let's just reset to 0 immediately before spinning.
        // It happens so fast the user won't notice, or it looks like a "reset".
        spinnerList.style.transition = 'none';
        spinnerList.scrollTop = 0;
        
        // Force Reflow
        spinnerList.offsetHeight; 
        
        // Animation Paramaters
        const duration = 4000; // 4 seconds
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function: EaseOutCubic (starts fast, slows down)
            const ease = 1 - Math.pow(1 - progress, 3);
            
            const currentScroll = ease * targetScrollTop;
            spinnerList.scrollTop = currentScroll;
            
            // Audio Tick Logic
            // We play a tick every time we cross an item boundary
            // We can approximate this by checking current item index vs previous
            const currentItemIndex = Math.floor(currentScroll / ITEM_HEIGHT);
            if (animate.lastIndex !== currentItemIndex) {
                playTickSound();
                animate.lastIndex = currentItemIndex;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                finishSpin(winnerIndex);
            }
        }
        
        animate.lastIndex = 0;
        requestAnimationFrame(animate);
    }

    function finishSpin(winnerIndex) {
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = "再来一次";
        
        // Highlight winner
        const items = document.querySelectorAll('.spinner-item');
        if (items[winnerIndex]) {
            items[winnerIndex].classList.add('winner-pulse');
            // Ensure exact alignment
             spinnerList.scrollTop = winnerIndex * ITEM_HEIGHT;
        }
        
        playWinSound();
        fireConfetti();
    }

    function fireConfetti() {
        const colors = ['#f2c94c', '#d92027', '#ffffff'];
        for (let i = 0; i < 50; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(conf);
            
            // Cleanup
            setTimeout(() => conf.remove(), 4000);
        }
    }
});
