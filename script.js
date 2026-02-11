// Initialize Audio Context
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Retro 8-bit Sound Synthesis
function playTickSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Short blip
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playWinSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // 8-bit Victory Jingle
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; // C E G C G C
    const duration = 0.1;
    
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.value = freq;
        
        const startTime = now + i * duration;
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration - 0.01);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    });
}

function playLeverSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Mechanical clunk
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

// Logic
document.addEventListener('DOMContentLoaded', () => {
    const spinnerList = document.getElementById('spinnerList');
    const leverContainer = document.getElementById('leverContainer'); // Clickable area
    const leverStick = document.querySelector('.lever-stick'); // The animated part
    const resultDisplay = document.getElementById('result-display');
    const resultText = document.getElementById('result-text');
    
    const ITEM_HEIGHT = 120; // Must match CSS
    const REPEAT_COUNT = 50; 
    
    // 1. Populate List
    let fullList = [];
    if (typeof DRINKS !== 'undefined') {
        for(let i=0; i<REPEAT_COUNT; i++) {
            fullList = fullList.concat(DRINKS);
        }
    } else {
        fullList = ["Error: No Config", "Check config.js"];
    }
    
    fullList.forEach(drink => {
        const el = document.createElement('div');
        el.className = 'spinner-item';
        el.textContent = drink;
        spinnerList.appendChild(el);
    });

    // 2. State
    let isSpinning = false;
    
    leverContainer.addEventListener('click', async () => {
        if (isSpinning) return;
        
        // Init audio
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }
        
        playLeverSound();
        animateLever();
        
        // Small delay to match lever pull
        setTimeout(() => {
            startSpin();
        }, 300);
    });

    function animateLever() {
        // Simple CSS class toggle for animation
        // We'll define .pulled in CSS to rotate the stick
        // Actually, let's just animate via style directly for control or class
        // Let's use a class that triggers a keyframe or transition
        leverStick.style.transformOrigin = "bottom center";
        leverStick.style.transition = "transform 0.2s ease-in";
        leverStick.style.transform = "rotate(45deg)"; // Pull down
        
        setTimeout(() => {
            leverStick.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"; // Spring back
            leverStick.style.transform = "rotate(0deg)";
        }, 300);
    }

    function startSpin() {
        isSpinning = true;
        resultDisplay.classList.add('hidden');
        
        // Remove winner styles
        const items = document.querySelectorAll('.spinner-item');
        items.forEach(i => i.classList.remove('winner-pulse'));

        const minIndex = Math.floor(fullList.length / 2);
        const maxIndex = fullList.length - 10;
        const winnerIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
        
        const targetScrollTop = winnerIndex * ITEM_HEIGHT;
        
        // Reset visually
        spinnerList.style.transition = 'none';
        spinnerList.scrollTop = 0;
        
        // Force Reflow
        spinnerList.offsetHeight; 
        
        const duration = 3000; 
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // EaseOutCubic
            const ease = 1 - Math.pow(1 - progress, 3);
            
            const currentScroll = ease * targetScrollTop;
            spinnerList.scrollTop = currentScroll;
            
            // Audio Tick
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
        
        // Highlight winner
        const items = document.querySelectorAll('.spinner-item');
        if (items[winnerIndex]) {
            items[winnerIndex].classList.add('winner-pulse');
            // Ensure exact alignment
             spinnerList.scrollTop = winnerIndex * ITEM_HEIGHT;
             
             // Show result box
             resultText.textContent = items[winnerIndex].textContent;
             resultDisplay.classList.remove('hidden');
        }
        
        playWinSound();
    }
});
