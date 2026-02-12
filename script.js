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
    const duration = 0.12;

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

const STORAGE_KEY = 'lucky-wheel.leaderboard.v1';

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

const chinaTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});

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

function resolveDrinkImageSrc(drink) {
    if (!drink || typeof drink !== 'object' || !drink.image) {
        return SIDEBAR_PLACEHOLDER_IMAGE;
    }

    const image = String(drink.image).trim();
    if (!image) return SIDEBAR_PLACEHOLDER_IMAGE;

    if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
        return image;
    }

    return encodeURI(image);
}

function formatChinaTime(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '--';

    const parts = chinaTimeFormatter.formatToParts(date).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function sanitizeName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
}

function loadAppState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { users: [], currentUserId: null };
        }

        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.users)) {
            return { users: [], currentUserId: null };
        }

        const users = parsed.users
            .map((user) => {
                if (!user || typeof user !== 'object') return null;

                return {
                    id: String(user.id || ''),
                    name: sanitizeName(user.name),
                    photo: String(user.photo || ''),
                    spinCount: Number(user.spinCount || 0),
                    history: Array.isArray(user.history)
                        ? user.history
                            .filter((record) => record && typeof record === 'object')
                            .map((record) => ({
                                drinkName: String(record.drinkName || ''),
                                timeISO: String(record.timeISO || '')
                            }))
                        : []
                };
            })
            .filter((user) => user && user.id && user.name);

        const currentUserId = String(parsed.currentUserId || '');

        return {
            users,
            currentUserId: users.some((user) => user.id === currentUserId) ? currentUserId : null
        };
    } catch (error) {
        return { users: [], currentUserId: null };
    }
}

function saveAppState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        // Ignore storage failures (private mode / quota exceeded)
    }
}

function getUserById(state, userId) {
    if (!userId) return null;
    return state.users.find((user) => user.id === userId) || null;
}

function getCurrentUser(state) {
    return getUserById(state, state.currentUserId);
}

function createUser(state, name, photo) {
    const newUser = {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name,
        photo,
        spinCount: 0,
        history: []
    };

    state.users.push(newUser);
    state.currentUserId = newUser.id;
    return newUser;
}

function upsertUserByName(state, name, photo) {
    const existing = state.users.find((user) => user.name === name);
    if (existing) {
        existing.photo = photo;
        state.currentUserId = existing.id;
        return existing;
    }

    return createUser(state, name, photo);
}

function getSortedUsers(state) {
    return [...state.users].sort((a, b) => {
        if (b.spinCount !== a.spinCount) return b.spinCount - a.spinCount;
        return a.name.localeCompare(b.name, 'zh-CN');
    });
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.add('show');
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function renderDrinkSidebar(sidebarTrack, drinkCatalog) {
    if (!sidebarTrack) return;

    const sourceList = drinkCatalog.length ? drinkCatalog : [{ name: '酒单待配置' }];
    const loopList = sourceList.concat(sourceList);
    const fragment = document.createDocumentFragment();

    loopList.forEach((drink) => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';

        const thumb = document.createElement('img');
        thumb.className = 'sidebar-thumb';
        thumb.src = resolveDrinkImageSrc(drink);
        thumb.onerror = () => {
            thumb.onerror = null;
            thumb.src = SIDEBAR_PLACEHOLDER_IMAGE;
        };
        thumb.alt = `${drink.name || '酒品'}图片`;
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

function renderLeaderboard(leaderboardTrack, state) {
    if (!leaderboardTrack) return;

    const sortedUsers = getSortedUsers(state);

    if (!sortedUsers.length) {
        leaderboardTrack.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'leaderboard-item leaderboard-empty';
        empty.textContent = '暂无拉杆记录';
        leaderboardTrack.appendChild(empty);
        leaderboardTrack.classList.add('static-track');
        return;
    }

    const loopList = sortedUsers.length > 1 ? sortedUsers.concat(sortedUsers) : sortedUsers;
    const fragment = document.createDocumentFragment();

    loopList.forEach((user) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.dataset.userId = user.id;

        if (user.id === state.currentUserId) {
            item.classList.add('is-current-user');
        }

        const thumb = document.createElement('img');
        thumb.className = 'leaderboard-thumb';
        thumb.src = user.photo || SIDEBAR_PLACEHOLDER_IMAGE;
        thumb.alt = `${user.name}头像`;
        thumb.loading = 'lazy';
        thumb.decoding = 'async';
        thumb.onerror = () => {
            thumb.onerror = null;
            thumb.src = SIDEBAR_PLACEHOLDER_IMAGE;
        };

        const info = document.createElement('div');
        info.className = 'leaderboard-info';

        const name = document.createElement('p');
        name.className = 'leaderboard-name';
        name.textContent = user.name;

        const count = document.createElement('p');
        count.className = 'leaderboard-count';
        count.textContent = `拉杆 ${user.spinCount} 次`;

        info.appendChild(name);
        info.appendChild(count);
        item.appendChild(thumb);
        item.appendChild(info);
        fragment.appendChild(item);
    });

    leaderboardTrack.innerHTML = '';
    leaderboardTrack.appendChild(fragment);

    const durationSeconds = Math.max(14, sortedUsers.length * 2.4);
    leaderboardTrack.style.setProperty('--leaderboard-duration', `${durationSeconds}s`);
    leaderboardTrack.classList.toggle('static-track', sortedUsers.length <= 1);
}

function renderUserHistory(recordsContainer, user) {
    if (!recordsContainer) return;

    recordsContainer.innerHTML = '';

    if (!user || !Array.isArray(user.history) || !user.history.length) {
        const empty = document.createElement('p');
        empty.className = 'history-empty';
        empty.textContent = '暂无拉杆记录';
        recordsContainer.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();

    user.history.forEach((record, index) => {
        const row = document.createElement('div');
        row.className = 'history-record-item';

        const left = document.createElement('div');
        left.className = 'history-record-drink';
        left.textContent = `${index + 1}. ${record.drinkName || '未知酒品'}`;

        const right = document.createElement('div');
        right.className = 'history-record-time';
        right.textContent = formatChinaTime(record.timeISO);

        row.appendChild(left);
        row.appendChild(right);
        fragment.appendChild(row);
    });

    recordsContainer.appendChild(fragment);
}

// Logic
document.addEventListener('DOMContentLoaded', () => {
    const spinnerList = document.getElementById('spinnerList');
    const sidebarScrollTrack = document.getElementById('sidebarScrollTrack');
    const leaderboardScrollTrack = document.getElementById('leaderboardScrollTrack');

    const leverContainer = document.getElementById('leverContainer');
    const leverStick = document.querySelector('.lever-stick');

    const resultModal = document.getElementById('resultModal');
    const resultCloseBtn = document.getElementById('resultCloseBtn');
    const resultName = document.getElementById('resultName');
    const resultImage = document.getElementById('resultImage');
    const resultRecipe = document.getElementById('resultRecipe');
    const confirmBtn = document.getElementById('confirmBtn');

    const profileModal = document.getElementById('profileModal');
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    const cameraStatus = document.getElementById('cameraStatus');
    const cameraPreview = document.getElementById('cameraPreview');
    const capturedPreview = document.getElementById('capturedPreview');
    const captureCanvas = document.getElementById('captureCanvas');
    const capturePhotoBtn = document.getElementById('capturePhotoBtn');
    const retakePhotoBtn = document.getElementById('retakePhotoBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const switchUserBtn = document.getElementById('switchUserBtn');

    const historyModal = document.getElementById('historyModal');
    const historyCloseBtn = document.getElementById('historyCloseBtn');
    const historyUserImage = document.getElementById('historyUserImage');
    const historyUserName = document.getElementById('historyUserName');
    const historyUserCount = document.getElementById('historyUserCount');
    const historyRecords = document.getElementById('historyRecords');

    const state = loadAppState();

    let itemHeight = 240;
    const REPEAT_COUNT = 150;
    const drinkCatalog = getDrinkCatalog();

    let isSpinning = false;
    let pendingSpinAfterProfile = false;
    let cameraStream = null;
    let capturedPhotoData = '';

    renderDrinkSidebar(sidebarScrollTrack, drinkCatalog);
    renderLeaderboard(leaderboardScrollTrack, state);

    const fullList = [];
    for (let i = 0; i < REPEAT_COUNT; i++) {
        fullList.push(...drinkCatalog);
    }

    fullList.forEach((drink) => {
        const el = document.createElement('div');
        el.className = 'spinner-item';

        const titleEl = document.createElement('div');
        titleEl.className = 'drink-title';
        titleEl.textContent = drink.name || drink;

        el.appendChild(titleEl);
        spinnerList.appendChild(el);
    });

    setTimeout(() => {
        const firstItem = spinnerList.querySelector('.spinner-item');
        if (firstItem) {
            itemHeight = firstItem.getBoundingClientRect().height;
        }
    }, 100);

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            cameraStream = null;
        }
        if (cameraPreview) {
            cameraPreview.srcObject = null;
        }
    }

    async function startCamera() {
        stopCamera();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            cameraStatus.textContent = '当前浏览器不支持摄像头，请换 Chrome / Safari。';
            return false;
        }

        try {
            cameraStatus.textContent = '摄像头已开启，请点击“拍照”。';
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });

            cameraPreview.srcObject = cameraStream;
            await cameraPreview.play();
            return true;
        } catch (error) {
            cameraStatus.textContent = '摄像头权限被拒绝，请在浏览器地址栏允许访问后重试。';
            return false;
        }
    }

    function resetCapturedPreview() {
        capturedPhotoData = '';
        capturedPreview.src = '';
        capturedPreview.classList.add('hidden');
        cameraPreview.classList.remove('hidden');
        retakePhotoBtn.disabled = true;
    }

    async function openProfileModal(prefillName = '') {
        playerNameInput.value = prefillName;
        resetCapturedPreview();
        openModal(profileModal);
        await startCamera();
        capturePhotoBtn.disabled = false;
    }

    function closeProfileModal() {
        closeModal(profileModal);
        stopCamera();
    }

    function openHistoryModalForUser(userId) {
        const user = getUserById(state, userId);
        if (!user) return;

        historyUserImage.src = user.photo || SIDEBAR_PLACEHOLDER_IMAGE;
        historyUserImage.alt = `${user.name}头像`;
        historyUserName.textContent = user.name;
        historyUserCount.textContent = `拉杆 ${user.spinCount} 次`;
        renderUserHistory(historyRecords, user);
        openModal(historyModal);
    }

    function closeHistoryModal() {
        closeModal(historyModal);
    }

    function persistState() {
        saveAppState(state);
        renderLeaderboard(leaderboardScrollTrack, state);
    }

    function addSpinRecord(drinkName) {
        const currentUser = getCurrentUser(state);
        if (!currentUser) return;

        currentUser.spinCount = Number(currentUser.spinCount || 0) + 1;
        if (!Array.isArray(currentUser.history)) {
            currentUser.history = [];
        }

        currentUser.history.unshift({
            drinkName: drinkName || '未知酒品',
            timeISO: new Date().toISOString()
        });

        persistState();
    }

    function animateLever() {
        leverStick.style.transformOrigin = 'bottom center';
        leverStick.style.transition = 'transform 0.2s ease-in';
        leverStick.style.transform = 'rotate(45deg)';

        setTimeout(() => {
            leverStick.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            leverStick.style.transform = 'rotate(0deg)';
        }, 300);
    }

    function startSpin() {
        isSpinning = true;

        const items = document.querySelectorAll('.spinner-item');
        items.forEach((item) => item.classList.remove('winner-pulse'));

        const firstItem = spinnerList.querySelector('.spinner-item');
        if (firstItem) itemHeight = firstItem.getBoundingClientRect().height;

        const minIndex = Math.floor(fullList.length * 0.7);
        const maxIndex = fullList.length - 20;
        const winnerIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
        const targetTranslateY = -Math.round(winnerIndex * itemHeight);

        spinnerList.style.transition = 'none';
        spinnerList.style.transform = 'translateY(0px)';

        spinnerList.offsetHeight;

        const duration = 5000;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
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
        const modalImageSource = (typeof winnerData === 'object') ? winnerData : null;

        if (resultImage) {
            resultImage.src = resolveDrinkImageSrc(modalImageSource);
            resultImage.alt = `${(modalImageSource && modalImageSource.name) || '酒品'}图片`;
            resultImage.onerror = () => {
                resultImage.onerror = null;
                resultImage.src = SIDEBAR_PLACEHOLDER_IMAGE;
            };
        }

        if (typeof winnerData === 'object') {
            resultName.textContent = `《${winnerData.name}》`;
            resultRecipe.innerHTML = winnerData.recipe || '';
            addSpinRecord(winnerData.name);
        } else {
            resultName.textContent = 'Winner!';
            resultRecipe.textContent = '';
            addSpinRecord('未知酒品');
        }

        setTimeout(() => {
            openModal(resultModal);
        }, 500);
    }

    async function triggerSpin() {
        if (isSpinning) return;
        if (resultModal.classList.contains('show')) return;
        if (profileModal.classList.contains('show')) return;
        if (historyModal.classList.contains('show')) return;

        if (!getCurrentUser(state)) {
            pendingSpinAfterProfile = true;
            await openProfileModal('');
            return;
        }

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

    function closeResultModal() {
        closeModal(resultModal);
    }

    leverContainer.addEventListener('click', triggerSpin);

    document.addEventListener('keydown', (event) => {
        if (event.repeat) return;

        const isShortcut = event.code === 'Space' || event.code === 'Enter';
        if (!isShortcut) return;
        if (resultModal.classList.contains('show')) return;

        event.preventDefault();
        triggerSpin();
    });

    resultCloseBtn.addEventListener('click', closeResultModal);
    confirmBtn.addEventListener('click', closeResultModal);

    resultModal.addEventListener('click', (event) => {
        if (event.target === resultModal) {
            closeResultModal();
        }
    });

    switchUserBtn.addEventListener('click', async () => {
        pendingSpinAfterProfile = false;
        const currentUser = getCurrentUser(state);
        await openProfileModal(currentUser ? currentUser.name : '');
    });

    profileCloseBtn.addEventListener('click', () => {
        pendingSpinAfterProfile = false;
        closeProfileModal();
    });

    profileModal.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            pendingSpinAfterProfile = false;
            closeProfileModal();
        }
    });

    capturePhotoBtn.addEventListener('click', async () => {
        if (!cameraStream) {
            const ready = await startCamera();
            if (!ready) return;
        }

        const width = cameraPreview.videoWidth || 640;
        const height = cameraPreview.videoHeight || 480;

        if (!width || !height) {
            cameraStatus.textContent = '还没获取到画面，请稍后再拍。';
            return;
        }

        captureCanvas.width = width;
        captureCanvas.height = height;

        const ctx = captureCanvas.getContext('2d');
        ctx.drawImage(cameraPreview, 0, 0, width, height);

        capturedPhotoData = captureCanvas.toDataURL('image/jpeg', 0.85);
        capturedPreview.src = capturedPhotoData;
        capturedPreview.classList.remove('hidden');
        cameraPreview.classList.add('hidden');
        retakePhotoBtn.disabled = false;
        cameraStatus.textContent = '拍照完成，请点击“确认并开始”。';

        stopCamera();
    });

    retakePhotoBtn.addEventListener('click', async () => {
        resetCapturedPreview();
        await startCamera();
        capturePhotoBtn.disabled = false;
    });

    saveProfileBtn.addEventListener('click', async () => {
        const name = sanitizeName(playerNameInput.value);

        if (!name) {
            cameraStatus.textContent = '请先填写名字。';
            return;
        }

        if (!capturedPhotoData) {
            cameraStatus.textContent = '请先拍照后再确认。';
            return;
        }

        upsertUserByName(state, name, capturedPhotoData);
        persistState();
        closeProfileModal();

        if (pendingSpinAfterProfile) {
            pendingSpinAfterProfile = false;
            setTimeout(() => {
                triggerSpin();
            }, 120);
        }
    });

    leaderboardScrollTrack.addEventListener('click', (event) => {
        const item = event.target.closest('.leaderboard-item[data-user-id]');
        if (!item) return;
        openHistoryModalForUser(item.dataset.userId);
    });

    historyCloseBtn.addEventListener('click', closeHistoryModal);

    historyModal.addEventListener('click', (event) => {
        if (event.target === historyModal) {
            closeHistoryModal();
        }
    });

});
