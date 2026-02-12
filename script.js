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
    const duration = 0.12; // Slightly slower tempo for the longer win
    
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

const SIDEBAR_PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff4da6"/>
      <stop offset="100%" stop-color="#61e8ff"/>
    </linearGradient>
  </defs>
  <rect width="72" height="72" fill="#14172a"/>
  <rect x="4" y="4" width="64" height="64" fill="url(#g)" opacity="0.28"/>
  <rect x="10" y="10" width="52" height="52" fill="none" stroke="#eaeaea" stroke-width="3"/>
  <text x="36" y="42" text-anchor="middle" font-size="14" fill="#eaeaea" font-family="monospace">DRINK</text>
</svg>
`)}`;

function getDrinkCatalog() {
    if (typeof DRINKS !== 'undefined' && Array.isArray(DRINKS) && DRINKS.length) {
        return DRINKS;
    }

    return [
        {
            id: 'missing-config',
            name: 'Error: No Config',
            recipe: 'Check config.js'
        }
    ];
}

function renderSidebarList(sidebarTrack, drinkCatalog) {
    if (!sidebarTrack) return;

    const sourceList = drinkCatalog.length ? drinkCatalog : [{ name: '酒单待配置' }];
    const loopList = sourceList.concat(sourceList);
    const fragment = document.createDocumentFragment();

    loopList.forEach((drink) => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';

        const thumb = document.createElement('img');
        thumb.className = 'sidebar-thumb';
        thumb.src = SIDEBAR_PLACEHOLDER_IMAGE;
        thumb.alt = `${drink.name || '酒品'}占位图`;
        thumb.loading = 'lazy';
        thumb.decoding = 'async';

        const name = document.createElement('p');
        name.className = 'sidebar-drink-name';
        name.textContent = drink.name || String(drink);

        item.appendChild(thumb);
        item.appendChild(name);
        fragment.appendChild(item);
    });

    sidebarTrack.innerHTML = '';
    sidebarTrack.appendChild(fragment);

    const durationSeconds = Math.max(18, sourceList.length * 2.8);
    sidebarTrack.style.setProperty('--sidebar-duration', `${durationSeconds}s`);
}

// Logic
document.addEventListener('DOMContentLoaded', () => {
    const spinnerList = document.getElementById('spinnerList');
    const sidebarScrollTrack = document.getElementById('sidebarScrollTrack');
    const leverContainer = document.getElementById('leverContainer'); 
    const leverStick = document.querySelector('.lever-stick');
    
    const resultModal = document.getElementById('resultModal');
    const resultName = document.getElementById('resultName');
    const resultRecipe = document.getElementById('resultRecipe');
    const closeBtn = document.querySelector('.close-btn');
    const confirmBtn = document.getElementById('confirmBtn');

    let itemHeight = 240; 
    const REPEAT_COUNT = 150; // Increased for longer duration
    const drinkCatalog = getDrinkCatalog();

    renderSidebarList(sidebarScrollTrack, drinkCatalog);
    
    // 1. Populate List
    let fullList = [];
    for (let i = 0; i < REPEAT_COUNT; i++) {
        fullList = fullList.concat(drinkCatalog);
    }
    
    fullList.forEach(drink => {
        const el = document.createElement('div');
        el.className = 'spinner-item';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'drink-title';
        titleEl.textContent = drink.name || drink;
        
        el.appendChild(titleEl);
        spinnerList.appendChild(el);
    });

    // Calculate actual height after rendering
    setTimeout(() => {
        const firstItem = spinnerList.querySelector('.spinner-item');
        if (firstItem) {
            itemHeight = firstItem.getBoundingClientRect().height;
        }
    }, 100);

    // 2. State
    let isSpinning = false;

    async function triggerSpin() {
        if (isSpinning) return;
        if (!resultModal.classList.contains('hidden')) return;

        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        playLeverSound();
        animateLever();

        setTimeout(() => {
            startSpin();
        }, 300);
    }
    
    leverContainer.addEventListener('click', triggerSpin);

    document.addEventListener('keydown', (event) => {
        if (event.repeat) return;

        const isShortcut = event.code === 'Space' || event.code === 'Enter';
        if (!isShortcut) return;
        if (!resultModal.classList.contains('hidden')) return;

        event.preventDefault();
        triggerSpin();
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
        
        const items = document.querySelectorAll('.spinner-item');
        items.forEach(i => i.classList.remove('winner-pulse'));

        const firstItem = spinnerList.querySelector('.spinner-item');
        if (firstItem) itemHeight = firstItem.getBoundingClientRect().height;

        const minIndex = Math.floor(fullList.length * 0.7); // Start further down
        const maxIndex = fullList.length - 20;
        const winnerIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
        
        const targetTranslateY = -Math.round(winnerIndex * itemHeight);
        
        spinnerList.style.transition = 'none';
        spinnerList.style.transform = 'translateY(0px)';
        
        spinnerList.offsetHeight; 
        
        const duration = 5000; // Increased to 5 seconds
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // EaseOutQuart for a smoother, longer slowdown at the end
            const ease = 1 - Math.pow(1 - progress, 4);
            
            const currentTranslateY = ease * targetTranslateY;
            spinnerList.style.transform = `translateY(${currentTranslateY}px)`;
            
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
        spinnerList.style.transform = `translateY(${finalPosition}px)`;
        
        const items = document.querySelectorAll('.spinner-item');
        if (items[winnerIndex]) {
            items[winnerIndex].classList.add('winner-pulse');
        }
        
        playWinSound();

        const winnerData = fullList[winnerIndex];
        if (typeof winnerData === 'object') {
            resultName.textContent = `《${winnerData.name}》`;
            resultRecipe.innerHTML = winnerData.recipe || '';
        } else {
            resultName.textContent = 'Winner!';
            resultRecipe.textContent = '';
        }

        setTimeout(() => {
            resultModal.classList.remove('hidden');
            void resultModal.offsetWidth;
            resultModal.classList.add('show');
        }, 500);
    }

    function closeModal() {
        resultModal.classList.remove('show');
        setTimeout(() => {
            resultModal.classList.add('hidden');
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', closeModal);
    
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            closeModal();
        }
    });
});
