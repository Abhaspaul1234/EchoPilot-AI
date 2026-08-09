const API_BASE = "http://127.0.0.1:5000";

let telemetryChart = null;
let playInterval = null;
let isPlaying = false;
let playTimeSeconds = 0;
const audioDuration = 30;

document.addEventListener('DOMContentLoaded', async () => {
    hideUnsupportedWidgets();

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');

    if (!sessionId) {
        window.location.href = 'history.html';
        return;
    }

    await populateSessionDropdown(sessionId);
    await loadSession(sessionId);

    document.getElementById('session-dropdown').addEventListener('change', (e) => {
        const newId = e.target.value;
        stopAudioPlayback();
        window.history.pushState({}, '', `results.html?session=${newId}`);
        loadSession(newId);
    });

    createWaveformBars();
    setupAudioPlayer();
});

function hideUnsupportedWidgets() {
    const chartCard = document.querySelector('.chart-card');
    if (chartCard) chartCard.style.display = 'none';

    const driverField = document.getElementById('meta-driver')?.closest('.meta-field');
    if (driverField) driverField.style.display = 'none';

    const eventField = document.getElementById('meta-event')?.closest('.meta-field');
    if (eventField) eventField.style.display = 'none';
}

async function populateSessionDropdown(activeId) {
    const dropdown = document.getElementById('session-dropdown');
    dropdown.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/history`);
        const sessions = await res.json();

        sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = `Session #${session.id} - ${session.audio_file}`;
            dropdown.appendChild(option);
        });

        dropdown.value = activeId;
    } catch (err) {
        console.error('Failed to load session list:', err);
    }
}

async function loadSession(sessionId) {
    try {
        const res = await fetch(`${API_BASE}/results/${sessionId}`);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            document.getElementById('transcripts-container').innerHTML =
                `<p>Could not load session: ${data.error || res.status}</p>`;
            return;
        }

        const session = await res.json();
        renderSession(session);

    } catch (err) {
        console.error('Failed to load session:', err);
        alert('Failed to reach backend. Is the server running?');
    }
}

function renderSession(session) {
    document.getElementById('meta-date').textContent = formatDate(session.created_at);
    document.getElementById('meta-audio').textContent = session.audio_file || 'N/A';
    document.getElementById('meta-csv').textContent = session.csv_file || 'N/A';

    document.getElementById('analysis-summary-text').textContent =
        session.summary && session.summary !== "Not generated yet"
            ? session.summary
            : 'Summary not generated yet.';

    renderTranscript(session.transcript);
    renderCognitiveMarkers(session.sentiment);
    renderRecommendations(session.keywords);
}

function renderTranscript(transcript) {
    const container = document.getElementById('transcripts-container');
    container.innerHTML = '';

    if (!transcript) {
        container.innerHTML = '<p>No transcript available</p>';
        return;
    }

    const row = document.createElement('div');
    row.className = 'transcript-row';
    row.innerHTML = `
        <div class="transcript-row-header">
            <div class="transcript-meta"><span>Full Session</span></div>
            <span class="badge badge-neutral">Transcript</span>
        </div>
        <div class="transcript-text">"${transcript}"</div>
    `;
    row.addEventListener('click', () => startAudioPlaybackSim());
    container.appendChild(row);
}

function renderCognitiveMarkers(sentiment) {
    const gaugeCircle = document.querySelector('.stress-score-gauge');
    const breakdown = document.querySelector('.stress-breakdown');
    const badge = document.getElementById('overall-badge');

    const hasSentiment = sentiment && sentiment !== "Not analyzed";

    if (!hasSentiment) {
        if (gaugeCircle) gaugeCircle.style.display = 'none';
        if (breakdown) breakdown.style.display = 'none';
        badge.textContent = 'PENDING ANALYSIS';
        badge.className = 'badge';
        return;
    }

    if (gaugeCircle) gaugeCircle.style.display = '';
    if (breakdown) breakdown.style.display = '';
    badge.textContent = sentiment;
}

function renderRecommendations(keywords) {
    const box = document.getElementById('recommendations-box');
    box.innerHTML = '';

    if (!keywords || keywords === "N/A") {
        box.innerHTML = '<div class="rec-item">Keyword extraction not yet implemented.</div>';
        return;
    }

    const list = Array.isArray(keywords) ? keywords : String(keywords).split(',');
    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'rec-item';
        div.innerHTML = `<span class="rec-bullet">0${index + 1} //</span><span>${item.trim()}</span>`;
        box.appendChild(div);
    });
}

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
}

function createWaveformBars() {
    const container = document.getElementById('waveform-bars');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.height = `${Math.random() * 80 + 20}%`;
        container.appendChild(bar);
    }
}

function setupAudioPlayer() {
    const playBtn = document.getElementById('play-pause-btn');
    if (!playBtn) return;
    playBtn.addEventListener('click', () => {
        isPlaying ? stopAudioPlayback() : startAudioPlaybackSim();
    });
}

function startAudioPlaybackSim() {
    const player = document.getElementById('mock-player');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const timeDisplay = document.getElementById('player-time');
    if (!player) return;

    isPlaying = true;
    player.classList.add('playing');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';

    clearInterval(playInterval);
    if (playTimeSeconds >= audioDuration) playTimeSeconds = 0;

    playInterval = setInterval(() => {
        playTimeSeconds += 0.5;
        if (playTimeSeconds >= audioDuration) {
            playTimeSeconds = audioDuration;
            stopAudioPlayback();
        }
        const minutes = Math.floor(playTimeSeconds / 60);
        const seconds = Math.floor(playTimeSeconds % 60);
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} / 0:30`;
        modulateWaveformHeights();
    }, 500);
}

function stopAudioPlayback() {
    const player = document.getElementById('mock-player');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    if (!player) return;

    isPlaying = false;
    player.classList.remove('playing');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    clearInterval(playInterval);
}

function modulateWaveformHeights() {
    document.querySelectorAll('.wave-bar').forEach(bar => {
        if (isPlaying) bar.style.height = `${Math.random() * 80 + 20}%`;
    });
}