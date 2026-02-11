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
    
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; 
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
    const leverContainer = document.getElementById('leverContainer'); 
    const leverStick = document.querySelector('.lever-stick'); 
    const resultDisplay = document.getElementById('result-display');
    const resultText = document.getElementById('result-text');
    
    // We will calculate this dynamically to be precise
    let itemHeight = 160; 
    const REPEAT_COUNT = 100; 
    
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
        el.innerHTML = drink; 
        spinnerList.appendChild(el);
    });

    // Calculate actual height after rendering
    // Wait for a frame or force layout
    setTimeout(() => {
        const firstItem = spinnerList.querySelector('.spinner-item');
        if (firstItem) {
            itemHeight = firstItem.getBoundingClientRect().height;
            console.log("Calculated Item Height:", itemHeight);
        }
    }, 100);

    // 2. State
    let isSpinning = false;
    
    leverContainer.addEventListener('click', async () => {
        if (isSpinning) return;
        
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }
        
        playLeverSound();
        animateLever();
        
        setTimeout(() => {
            startSpin();
        }, 300);
    });

    function animateLever() {
        leverStick.style.transformOrigin = "bottom center";
        leverStick.style.transition = "transform 0.2s ease-in";
        leverStick.style.transform = "rotate(45deg)"; 
        
        setTimeout(() => {
            leverStick.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"; 
            leverStick.style.transform = "rotate(0deg)";
        }, 300);
    }

    function startSpin() {
        isSpinning = true;
        resultDisplay.classList.add('hidden');
        
        const items = document.querySelectorAll('.spinner-item');
        items.forEach(i => i.classList.remove('winner-pulse'));

        // Re-calculate height just in case (e.g. window resize)
        const firstItem = spinnerList.querySelector('.spinner-item');
        if (firstItem) itemHeight = firstItem.getBoundingClientRect().height;

        const minIndex = Math.floor(fullList.length / 2);
        const maxIndex = fullList.length - 10;
        const winnerIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
        
        // Calculate target position (negative value to move up)
        // Ensure integer pixel values to avoid blurring
        const targetTranslateY = -Math.round(winnerIndex * itemHeight);
        
        // Reset visually to 0
        spinnerList.style.transition = 'none';
        spinnerList.style.transform = 'translateY(0px)';
        
        // Force Reflow
        spinnerList.offsetHeight; 
        
        const duration = 3500; 
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // EaseOutCubic
            const ease = 1 - Math.pow(1 - progress, 3);
            
            const currentTranslateY = ease * targetTranslateY;
            spinnerList.style.transform = `translateY(${currentTranslateY}px)`;
            
            // Audio Tick logic
            const currentItemIndex = Math.floor(Math.abs(currentTranslateY) / itemHeight);
            if (animate.lastIndex !== currentItemIndex) {
                playTickSound();
                animate.lastIndex = currentItemIndex;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                finishSpin(winnerIndex, targetTranslateY);
            }
        }
        
        animate.lastIndex = 0;
        requestAnimationFrame(animate);
    }

    function finishSpin(winnerIndex, finalPosition) {
        isSpinning = false;
        
        // Snap to exact pixel
        spinnerList.style.transform = `translateY(${finalPosition}px)`;
        
        const items = document.querySelectorAll('.spinner-item');
        
        // Double check which item is actually visible
        // Since we transformed by (winnerIndex * height), item[winnerIndex] should be at top.
        // Let's verify.
        if (items[winnerIndex]) {
            items[winnerIndex].classList.add('winner-pulse');
             resultText.innerHTML = items[winnerIndex].innerHTML;
             resultDisplay.classList.remove('hidden');
        } else {
            console.error("Winner index out of bounds:", winnerIndex);
        }
        
        playWinSound();
    }
});
