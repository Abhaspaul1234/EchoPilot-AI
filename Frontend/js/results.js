/* ==========================================================================
   EchoPilot AI - Results Script (COMPATIBLE VERSION)
   ========================================================================== */

let telemetryChart = null;
let playInterval = null;
let isPlaying = false;
let playTimeSeconds = 0;
const audioDuration = 30;

document.addEventListener('DOMContentLoaded', () => {

    // =============================
    // Load sessions from localStorage
    // =============================
    const sessions = JSON.parse(localStorage.getItem('echopilot_history')) || [];

    if (sessions.length === 0) {
        document.body.innerHTML = "<h2>No sessions found</h2>";
        return;
    }

    const dropdown = document.getElementById('session-dropdown');

    // Populate dropdown (SAFE)
    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = session.audioFile || "Session";
        dropdown.appendChild(option);
    });

    // Get session from URL
    const urlParams = new URLSearchParams(window.location.search);
    let activeSessionId = urlParams.get('session');

    let activeSession = sessions.find(s => s.id === activeSessionId);

    if (!activeSession) {
        activeSession = sessions[0];
        activeSessionId = activeSession.id;
    }

    dropdown.value = activeSessionId;

    loadSession(activeSession);

    dropdown.addEventListener('change', (e) => {
        const selectedSession = sessions.find(s => s.id === e.target.value);
        if (selectedSession) {
            stopAudioPlayback();
            loadSession(selectedSession);

            const newUrl = `${window.location.pathname}?session=${selectedSession.id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    });

    createWaveformBars();
    setupAudioPlayer();
});


// =============================
// LOAD SESSION (FIXED)
// =============================
function loadSession(session) {

    // Safe headers (no crash)
    document.getElementById('meta-driver').textContent = "Unknown Driver";
    document.getElementById('meta-event').textContent = "Upload Session";
    document.getElementById('meta-date').textContent = new Date().toLocaleString();
    document.getElementById('meta-audio').textContent = session.audioFile || "Unknown";
    document.getElementById('meta-csv').textContent = session.csvFile || "Unknown";

    // Summary placeholder
    document.getElementById('analysis-summary-text').textContent =
        "Analysis not implemented yet.";

    // 🔥 FIX: Convert transcript string → array
    if (!session.transcript) {
        document.getElementById('transcripts-container').innerHTML =
            "<p>No transcript available</p>";
        return;
    }

    const transcriptData = [
        {
            time: "00:00",
            lap: 1,
            emotion: "Neutral",
            text: session.transcript
        }
    ];

    renderTranscripts(transcriptData);

    // ❌ Disabled advanced features (until backend supports them)
    // updateStressGauge(...)
    // updateBreakdownBars(...)
    // updateRecommendations(...)
    // renderTelemetryChart(...)
}


// =============================
// TRANSCRIPT RENDER
// =============================
function renderTranscripts(transcript) {
    const container = document.getElementById('transcripts-container');
    container.innerHTML = '';

    transcript.forEach(line => {
        const row = document.createElement('div');
        row.className = 'transcript-row';

        row.innerHTML = `
            <div class="transcript-row-header">
                <div class="transcript-meta">
                    <span>${line.time}</span>
                    <span>LAP ${line.lap}</span>
                </div>
                <span class="badge badge-neutral">${line.emotion}</span>
            </div>
            <div class="transcript-text">"${line.text}"</div>
        `;

        row.addEventListener('click', () => {
            document.querySelectorAll('.transcript-row')
                .forEach(r => r.classList.remove('active'));
            row.classList.add('active');

            startAudioPlaybackSim();
        });

        container.appendChild(row);
    });
}


// =============================
// WAVEFORM
// =============================
function createWaveformBars() {
    const container = document.getElementById('waveform-bars');
    container.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.height = `${Math.random() * 80 + 20}%`;
        container.appendChild(bar);
    }
}


// =============================
// AUDIO PLAYER
// =============================
function setupAudioPlayer() {
    const playBtn = document.getElementById('play-pause-btn');

    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopAudioPlayback();
        } else {
            startAudioPlaybackSim();
        }
    });
}

function startAudioPlaybackSim() {
    const player = document.getElementById('mock-player');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const timeDisplay = document.getElementById('player-time');

    isPlaying = true;
    player.classList.add('playing');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';

    clearInterval(playInterval);

    if (playTimeSeconds >= audioDuration) {
        playTimeSeconds = 0;
    }

    playInterval = setInterval(() => {
        playTimeSeconds += 0.5;

        if (playTimeSeconds >= audioDuration) {
            playTimeSeconds = audioDuration;
            stopAudioPlayback();
        }

        const minutes = Math.floor(playTimeSeconds / 60);
        const seconds = Math.floor(playTimeSeconds % 60);

        timeDisplay.textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')} / 0:30`;

        modulateWaveformHeights();
    }, 500);
}

function stopAudioPlayback() {
    const player = document.getElementById('mock-player');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    isPlaying = false;
    player.classList.remove('playing');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';

    clearInterval(playInterval);
}

function modulateWaveformHeights() {
    const bars = document.querySelectorAll('.wave-bar');

    bars.forEach(bar => {
        if (isPlaying) {
            bar.style.height = `${Math.random() * 80 + 20}%`;
        }
    });
}