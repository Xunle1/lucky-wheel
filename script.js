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

function playHiddenPrizeSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    const step = 0.14;

    notes.forEach((freq, i) => {
        const startTime = now + i * step;

        const leadOsc = audioCtx.createOscillator();
        const leadGain = audioCtx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(freq, startTime);
        leadOsc.frequency.exponentialRampToValueAtTime(freq * 1.035, startTime + step * 0.75);
        leadGain.gain.setValueAtTime(0.0001, startTime);
        leadGain.gain.exponentialRampToValueAtTime(0.16, startTime + 0.012);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, startTime + step);
        leadOsc.connect(leadGain);
        leadGain.connect(audioCtx.destination);
        leadOsc.start(startTime);
        leadOsc.stop(startTime + step + 0.02);

        const sparkleOsc = audioCtx.createOscillator();
        const sparkleGain = audioCtx.createGain();
        const sparkleStart = startTime + 0.03;
        sparkleOsc.type = 'triangle';
        sparkleOsc.frequency.setValueAtTime(freq * 2, sparkleStart);
        sparkleOsc.frequency.exponentialRampToValueAtTime(freq * 1.4, sparkleStart + step * 0.65);
        sparkleGain.gain.setValueAtTime(0.0001, sparkleStart);
        sparkleGain.gain.exponentialRampToValueAtTime(0.07, sparkleStart + 0.01);
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, sparkleStart + step * 0.75);
        sparkleOsc.connect(sparkleGain);
        sparkleGain.connect(audioCtx.destination);
        sparkleOsc.start(sparkleStart);
        sparkleOsc.stop(sparkleStart + step * 0.8 + 0.02);
    });

    const finaleStart = now + notes.length * step;
    [1046.50, 1567.98].forEach((freq) => {
        const finaleOsc = audioCtx.createOscillator();
        const finaleGain = audioCtx.createGain();

        finaleOsc.type = 'sawtooth';
        finaleOsc.frequency.setValueAtTime(freq, finaleStart);
        finaleOsc.frequency.exponentialRampToValueAtTime(freq * 1.1, finaleStart + 0.26);

        finaleGain.gain.setValueAtTime(0.0001, finaleStart);
        finaleGain.gain.exponentialRampToValueAtTime(0.11, finaleStart + 0.02);
        finaleGain.gain.exponentialRampToValueAtTime(0.0001, finaleStart + 0.34);

        finaleOsc.connect(finaleGain);
        finaleGain.connect(audioCtx.destination);

        finaleOsc.start(finaleStart);
        finaleOsc.stop(finaleStart + 0.36);
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
const HIDDEN_PRIZE_ID = 'hidden-prize';
const HIDDEN_PRIZE_WEIGHT = 2.5;

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

function getDrinkWeight(drink) {
    if (!drink || typeof drink !== 'object') return 1;
    return drink.id === HIDDEN_PRIZE_ID ? HIDDEN_PRIZE_WEIGHT : 1;
}

function pickWeightedDrinkIndex(catalog) {
    if (!Array.isArray(catalog) || !catalog.length) return 0;

    const weights = catalog.map((drink) => Math.max(getDrinkWeight(drink), 0));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    if (totalWeight <= 0) {
        return Math.floor(Math.random() * catalog.length);
    }

    let threshold = Math.random() * totalWeight;

    for (let index = 0; index < weights.length; index++) {
        threshold -= weights[index];
        if (threshold <= 0) {
            return index;
        }
    }

    return weights.length - 1;
}

function pickWinnerIndexForDrinkInRange(minIndex, maxIndex, selectedDrinkIndex, catalogLength) {
    const fallbackIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;

    if (!Number.isInteger(selectedDrinkIndex) || !Number.isInteger(catalogLength) || catalogLength <= 0) {
        return fallbackIndex;
    }

    if (selectedDrinkIndex < 0 || selectedDrinkIndex >= catalogLength) {
        return fallbackIndex;
    }

    const matchedIndices = [];
    for (let index = minIndex; index <= maxIndex; index++) {
        if (index % catalogLength === selectedDrinkIndex) {
            matchedIndices.push(index);
        }
    }

    if (!matchedIndices.length) {
        return fallbackIndex;
    }

    return matchedIndices[Math.floor(Math.random() * matchedIndices.length)];
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

function getChinaTimestampParts(date = new Date()) {
    const parts = chinaTimeFormatter.formatToParts(date).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    return {
        year: parts.year || '0000',
        month: parts.month || '00',
        day: parts.day || '00',
        hour: parts.hour || '00',
        minute: parts.minute || '00',
        second: parts.second || '00'
    };
}

function getChinaTimestampForFilename(date = new Date()) {
    const parts = getChinaTimestampParts(date);
    return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

function findUserByName(state, name) {
    return state.users.find((user) => user.name === name) || null;
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

function getSortedUsers(state) {
    return [...state.users].sort((a, b) => {
        if (b.spinCount !== a.spinCount) return b.spinCount - a.spinCount;
        return a.name.localeCompare(b.name, 'zh-CN');
    });
}

function buildLeaderboardExportData(state) {
    const sortedUsers = getSortedUsers(state);
    const now = new Date();
    const nowISO = now.toISOString();

    return {
        exportedAtISO: nowISO,
        exportedAtChinaTime: formatChinaTime(nowISO),
        timezone: 'Asia/Shanghai',
        totalUsers: sortedUsers.length,
        leaderboard: sortedUsers.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            name: user.name,
            spinCount: Number(user.spinCount || 0),
            isCurrentUser: user.id === state.currentUserId,
            photo: user.photo || '',
            history: Array.isArray(user.history)
                ? user.history.map((record, recordIndex) => ({
                    index: recordIndex + 1,
                    drinkName: record.drinkName || '未知酒品',
                    timeISO: record.timeISO || '',
                    timeChina: formatChinaTime(record.timeISO)
                }))
                : []
        }))
    };
}

function buildLeaderboardExportHtml(exportData) {
    const users = Array.isArray(exportData.leaderboard) ? exportData.leaderboard : [];

    const userSections = users.map((user) => {
        const safeName = escapeHtml(user.name || '未知用户');
        const safePhoto = escapeHtml(user.photo || SIDEBAR_PLACEHOLDER_IMAGE);
        const safeCount = Number(user.spinCount || 0);
        const history = Array.isArray(user.history) ? user.history : [];

        const historyRows = history.length
            ? history.map((record) => `
                <tr>
                    <td>${escapeHtml(record.drinkName || '未知酒品')}</td>
                    <td>${escapeHtml(record.timeChina || '--')}</td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="2" class="empty">暂无拉杆记录</td>
                </tr>
            `;

        return `
            <section class="user-card">
                <div class="user-head">
                    <img class="user-photo" src="${safePhoto}" alt="${safeName}头像">
                    <div>
                        <div class="user-title">#${user.rank} ${safeName}</div>
                        <div class="user-meta">拉杆 ${safeCount} 次</div>
                    </div>
                </div>
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>酒名</th>
                            <th>时间（中国时区）</th>
                        </tr>
                    </thead>
                    <tbody>${historyRows}</tbody>
                </table>
            </section>
        `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>拉杆榜导出</title>
    <style>
        :root {
            color-scheme: light;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            background: #0b1225;
            color: #f8f9ff;
            line-height: 1.5;
            padding: 24px;
        }
        .wrap {
            max-width: 1024px;
            margin: 0 auto;
        }
        .header {
            background: #151f3f;
            border: 1px solid #35467d;
            border-radius: 12px;
            padding: 16px 18px;
            margin-bottom: 16px;
        }
        .header h1 {
            margin: 0 0 6px;
            font-size: 20px;
        }
        .header p {
            margin: 0;
            opacity: 0.86;
            font-size: 14px;
        }
        .cards {
            display: grid;
            gap: 12px;
        }
        .user-card {
            background: #151f3f;
            border: 1px solid #35467d;
            border-radius: 12px;
            padding: 14px;
        }
        .user-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        .user-photo {
            width: 64px;
            height: 64px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #4b60a8;
            background: #091129;
        }
        .user-title {
            font-weight: 700;
            font-size: 16px;
        }
        .user-meta {
            font-size: 13px;
            opacity: 0.85;
        }
        .history-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            overflow: hidden;
            border-radius: 8px;
        }
        .history-table th,
        .history-table td {
            border: 1px solid #32416f;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
            background: #0f1733;
        }
        .history-table th {
            background: #1a2852;
            font-weight: 600;
        }
        .history-table .empty {
            text-align: center;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="header">
            <h1>拉杆榜导出记录</h1>
            <p>导出时间：${escapeHtml(exportData.exportedAtChinaTime || '--')}（Asia/Shanghai）</p>
            <p>用户数：${Number(exportData.totalUsers || 0)}</p>
        </div>
        <div class="cards">${userSections || '<p>暂无记录</p>'}</div>
    </div>
</body>
</html>`;
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.add('show');
    syncModalOpenState();
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    syncModalOpenState();
    setTimeout(() => {
        modal.classList.add('hidden');
        syncModalOpenState();
    }, 300);
}

function syncModalOpenState() {
    const hasVisibleModal = Boolean(document.querySelector('.modal-overlay.show'));
    document.body.classList.toggle('modal-open', hasVisibleModal);
}

function renderDrinkSidebar(sidebarTrack, drinkCatalog) {
    if (!sidebarTrack) return;

    const sourceList = drinkCatalog.length ? drinkCatalog : [{ name: '酒单待配置' }];
    const loopList = sourceList.concat(sourceList);
    const fragment = document.createDocumentFragment();

    loopList.forEach((drink, index) => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.dataset.drinkIndex = String(index % sourceList.length);

        const thumb = document.createElement('img');
        thumb.className = 'sidebar-thumb';
        thumb.src = resolveDrinkImageSrc(drink);
        thumb.onerror = () => {
            thumb.onerror = null;
            thumb.src = SIDEBAR_PLACEHOLDER_IMAGE;
        };
        thumb.alt = `${drink.name || '酒品'}图片`;
        thumb.width = 64;
        thumb.height = 64;
        thumb.loading = 'lazy';
        thumb.decoding = 'async';
        thumb.fetchPriority = 'low';

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

    leaderboardTrack.innerHTML = '';

    if (!sortedUsers.length) {
        const empty = document.createElement('div');
        empty.className = 'leaderboard-item leaderboard-empty';
        empty.textContent = '暂无拉杆记录';
        leaderboardTrack.appendChild(empty);
        leaderboardTrack.classList.add('static-track');
        return;
    }

    const buildLeaderboardItem = (user, rank) => {
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
        thumb.width = 64;
        thumb.height = 64;
        thumb.loading = 'lazy';
        thumb.decoding = 'async';
        thumb.fetchPriority = 'low';
        thumb.onerror = () => {
            thumb.onerror = null;
            thumb.src = SIDEBAR_PLACEHOLDER_IMAGE;
        };

        const info = document.createElement('div');
        info.className = 'leaderboard-info';

        const rankBadge = document.createElement('span');
        rankBadge.className = 'leaderboard-rank';
        if (rank === 1) {
            rankBadge.classList.add('rank-1');
            rankBadge.textContent = '🏆';
        } else if (rank === 2) {
            rankBadge.classList.add('rank-2');
            rankBadge.textContent = '🥈';
        } else if (rank === 3) {
            rankBadge.classList.add('rank-3');
            rankBadge.textContent = '🥉';
        } else {
            rankBadge.textContent = String(rank);
        }

        const name = document.createElement('p');
        name.className = 'leaderboard-name';
        name.textContent = user.name;

        const count = document.createElement('p');
        count.className = 'leaderboard-count';
        count.textContent = `拉杆 ${user.spinCount} 次`;

        info.appendChild(rankBadge);
        info.appendChild(name);
        info.appendChild(count);
        item.appendChild(thumb);
        item.appendChild(info);
        return item;
    };

    const singleListFragment = document.createDocumentFragment();
    sortedUsers.forEach((user, index) => {
        singleListFragment.appendChild(buildLeaderboardItem(user, index + 1));
    });
    leaderboardTrack.appendChild(singleListFragment);

    const viewport = leaderboardTrack.parentElement;
    const singleListHeight = leaderboardTrack.scrollHeight;
    const viewportHeight = viewport ? viewport.clientHeight : 0;
    const needsLoop = sortedUsers.length > 1 && viewportHeight > 0 && singleListHeight > viewportHeight + 8;

    if (needsLoop) {
        const loopFragment = document.createDocumentFragment();
        sortedUsers.forEach((user, index) => {
            loopFragment.appendChild(buildLeaderboardItem(user, index + 1));
        });
        leaderboardTrack.appendChild(loopFragment);

        const durationSeconds = Math.max(14, sortedUsers.length * 2.4);
        leaderboardTrack.style.setProperty('--leaderboard-duration', `${durationSeconds}s`);
        leaderboardTrack.classList.remove('static-track');
    } else {
        leaderboardTrack.classList.add('static-track');
    }
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

function waitForVideoFrame(videoEl, timeoutMs = 2000) {
    if (!videoEl) return Promise.resolve(false);

    if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        let done = false;
        const finish = (ok) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            videoEl.removeEventListener('loadeddata', onReady);
            videoEl.removeEventListener('canplay', onReady);
            resolve(ok);
        };

        const onReady = () => {
            if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                finish(true);
            }
        };

        const timer = setTimeout(() => finish(false), timeoutMs);
        videoEl.addEventListener('loadeddata', onReady);
        videoEl.addEventListener('canplay', onReady);
    });
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
    const startCameraBtn = document.getElementById('startCameraBtn');
    const capturePhotoBtn = document.getElementById('capturePhotoBtn');
    const retakePhotoBtn = document.getElementById('retakePhotoBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const exportLeaderboardBtn = document.getElementById('exportLeaderboardBtn');

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
    let isUserConfirmedForNextSpin = false;
    let cameraStream = null;
    let capturedPhotoData = '';
    let isCapturingPhoto = false;
    let isCountdownRunning = false;
    let countdownIntervalId = null;
    let countdownTimeoutId = null;
    let countdownResolve = null;
    const PHOTO_COUNTDOWN_SECONDS = 3;

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

    function stopCaptureCountdown() {
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }

        if (countdownTimeoutId) {
            clearTimeout(countdownTimeoutId);
            countdownTimeoutId = null;
        }

        if (typeof countdownResolve === 'function') {
            countdownResolve(false);
            countdownResolve = null;
        }

        isCountdownRunning = false;
    }

    function stopCamera() {
        stopCaptureCountdown();

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
            cameraStatus.textContent = '正在开启摄像头...';
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

    async function capturePhoto() {
        if (isCapturingPhoto || isCountdownRunning) return false;

        if (!cameraStream) {
            cameraStatus.textContent = '请先点击“开启摄像头”。';
            return false;
        }

        isCapturingPhoto = true;

        try {
            const frameReady = await waitForVideoFrame(cameraPreview);
            if (!frameReady) {
                cameraStatus.textContent = '摄像头画面还没准备好，请再试一次。';
                return false;
            }

            const width = cameraPreview.videoWidth;
            const height = cameraPreview.videoHeight;

            if (!width || !height) {
                cameraStatus.textContent = '还没获取到画面，请稍后再拍。';
                return false;
            }

            captureCanvas.width = width;
            captureCanvas.height = height;

            const ctx = captureCanvas.getContext('2d');
            if (!ctx) {
                cameraStatus.textContent = '拍照失败，请重试。';
                return false;
            }

            ctx.drawImage(cameraPreview, 0, 0, width, height);

            capturedPhotoData = captureCanvas.toDataURL('image/jpeg', 0.85);
            capturedPreview.src = capturedPhotoData;
            capturedPreview.classList.remove('hidden');
            cameraPreview.classList.add('hidden');
            capturePhotoBtn.disabled = true;
            retakePhotoBtn.disabled = false;
            updateProfileStatusHint();

            stopCamera();
            return true;
        } finally {
            isCapturingPhoto = false;
        }
    }

    function startPhotoCountdownAndCapture() {
        if (isCapturingPhoto || isCountdownRunning) return Promise.resolve(false);

        if (!cameraStream) {
            cameraStatus.textContent = '请先点击“开启摄像头”。';
            return Promise.resolve(false);
        }

        isCountdownRunning = true;
        capturePhotoBtn.disabled = true;

        let remainingSeconds = PHOTO_COUNTDOWN_SECONDS;
        cameraStatus.textContent = `倒计时 ${remainingSeconds} 秒...`;

        return new Promise((resolve) => {
            countdownResolve = resolve;

            countdownIntervalId = setInterval(() => {
                remainingSeconds -= 1;
                if (remainingSeconds > 0) {
                    cameraStatus.textContent = `倒计时 ${remainingSeconds} 秒...`;
                }
            }, 1000);

            countdownTimeoutId = setTimeout(async () => {
                if (countdownIntervalId) {
                    clearInterval(countdownIntervalId);
                    countdownIntervalId = null;
                }
                countdownTimeoutId = null;
                isCountdownRunning = false;
                countdownResolve = null;

                const captured = await capturePhoto();
                if (!captured && cameraStream) {
                    capturePhotoBtn.disabled = false;
                }
                resolve(captured);
            }, PHOTO_COUNTDOWN_SECONDS * 1000);
        });
    }

    function resetCapturedPreview() {
        capturedPhotoData = '';
        capturedPreview.src = '';
        capturedPreview.classList.add('hidden');
        cameraPreview.classList.remove('hidden');
        retakePhotoBtn.disabled = true;
    }

    function updateProfileStatusHint() {
        const name = sanitizeName(playerNameInput.value);

        if (!name) {
            cameraStatus.textContent = '请输入名字。新用户需拍照，老用户可直接确认。';
            return;
        }

        const existingUser = findUserByName(state, name);
        if (existingUser) {
            cameraStatus.textContent = `已识别用户「${existingUser.name}」，无需拍照可直接确认。`;
        } else if (capturedPhotoData) {
            cameraStatus.textContent = '新用户拍照完成，点击“确认用户”保存。';
        } else {
            cameraStatus.textContent = '新用户需要先拍照后再确认。';
        }
    }

    async function openProfileModal(prefillName = '') {
        isUserConfirmedForNextSpin = false;
        playerNameInput.value = prefillName;
        resetCapturedPreview();
        stopCamera();
        openModal(profileModal);
        capturePhotoBtn.disabled = true;
        startCameraBtn.disabled = false;
        updateProfileStatusHint();
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
        const selectedDrinkIndex = pickWeightedDrinkIndex(drinkCatalog);
        const winnerIndex = pickWinnerIndexForDrinkInRange(
            minIndex,
            maxIndex,
            selectedDrinkIndex,
            drinkCatalog.length
        );
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

        const winnerData = fullList[winnerIndex];
        if (winnerData && winnerData.id === HIDDEN_PRIZE_ID) {
            playHiddenPrizeSound();
        } else {
            playWinSound();
        }

        showDrinkInResultModal(winnerData);

        if (typeof winnerData === 'object') {
            addSpinRecord(winnerData.name);
        } else {
            addSpinRecord('未知酒品');
        }

        setTimeout(() => {
            openModal(resultModal);
        }, 500);
    }

    function showDrinkInResultModal(drinkData) {
        const modalImageSource = (typeof drinkData === 'object') ? drinkData : null;

        if (resultImage) {
            resultImage.src = resolveDrinkImageSrc(modalImageSource);
            resultImage.alt = `${(modalImageSource && modalImageSource.name) || '酒品'}图片`;
            resultImage.onerror = () => {
                resultImage.onerror = null;
                resultImage.src = SIDEBAR_PLACEHOLDER_IMAGE;
            };
        }

        if (typeof drinkData === 'object') {
            resultName.textContent = `《${drinkData.name}》`;
            resultRecipe.innerHTML = drinkData.recipe || '';
        } else {
            resultName.textContent = 'Winner!';
            resultRecipe.textContent = '';
        }
    }

    async function triggerSpin() {
        if (isSpinning) return;
        if (resultModal.classList.contains('show')) return;
        if (profileModal.classList.contains('show')) return;
        if (historyModal.classList.contains('show')) return;

        if (!isUserConfirmedForNextSpin) {
            const currentUser = getCurrentUser(state);
            await openProfileModal(currentUser ? currentUser.name : '');
            return;
        }
        isUserConfirmedForNextSpin = false;

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

    if (exportLeaderboardBtn) {
        exportLeaderboardBtn.addEventListener('click', () => {
            const exportData = buildLeaderboardExportData(state);
            const filename = `leaderboard-export-${getChinaTimestampForFilename()}.html`;
            const htmlReport = buildLeaderboardExportHtml(exportData);
            downloadTextFile(filename, htmlReport, 'text/html;charset=utf-8');

            const originalText = exportLeaderboardBtn.textContent;
            exportLeaderboardBtn.textContent = '已导出';
            exportLeaderboardBtn.disabled = true;

            setTimeout(() => {
                exportLeaderboardBtn.textContent = originalText || '导出记录';
                exportLeaderboardBtn.disabled = false;
            }, 1200);
        });
    }

    sidebarScrollTrack.addEventListener('click', (event) => {
        if (isSpinning) return;
        if (profileModal.classList.contains('show')) return;
        if (historyModal.classList.contains('show')) return;

        const item = event.target.closest('.sidebar-item[data-drink-index]');
        if (!item) return;

        const drinkIndex = Number(item.dataset.drinkIndex);
        const drinkData = drinkCatalog[drinkIndex];
        if (!drinkData) return;

        showDrinkInResultModal(drinkData);
        openModal(resultModal);
    });

    profileCloseBtn.addEventListener('click', () => {
        closeProfileModal();
    });

    profileModal.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            closeProfileModal();
        }
    });

    startCameraBtn.addEventListener('click', async () => {
        const ready = await startCamera();
        if (!ready) {
            return;
        }

        cameraPreview.classList.remove('hidden');
        capturedPreview.classList.add('hidden');
        capturePhotoBtn.disabled = false;
        cameraStatus.textContent = `摄像头已开启，点击“拍照”后将倒计时 ${PHOTO_COUNTDOWN_SECONDS} 秒自动拍照。`;
    });

    capturePhotoBtn.addEventListener('click', async () => {
        await startPhotoCountdownAndCapture();
    });

    retakePhotoBtn.addEventListener('click', () => {
        resetCapturedPreview();
        stopCamera();
        capturePhotoBtn.disabled = true;
        startCameraBtn.disabled = false;
        updateProfileStatusHint();
    });

    playerNameInput.addEventListener('input', updateProfileStatusHint);

    saveProfileBtn.addEventListener('click', () => {
        const name = sanitizeName(playerNameInput.value);

        if (!name) {
            cameraStatus.textContent = '请先填写名字。';
            return;
        }

        const existingUser = findUserByName(state, name);

        if (existingUser) {
            state.currentUserId = existingUser.id;
            if (capturedPhotoData) {
                existingUser.photo = capturedPhotoData;
            }
            persistState();
            isUserConfirmedForNextSpin = true;
            closeProfileModal();
            return;
        }

        if (!capturedPhotoData) {
            cameraStatus.textContent = '请先拍照后再确认。';
            return;
        }

        createUser(state, name, capturedPhotoData);
        persistState();
        isUserConfirmedForNextSpin = true;
        closeProfileModal();
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

    window.addEventListener('resize', () => {
        renderLeaderboard(leaderboardScrollTrack, state);
    });

});
