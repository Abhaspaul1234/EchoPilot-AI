/* ==========================================================================
   EchoPilot AI - Telemetry Dashboard Results Script
   ========================================================================== */

let telemetryChart = null;
let playInterval = null;
let isPlaying = false;
let playTimeSeconds = 0;
const audioDuration = 30; // 30 seconds mock file duration

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch runs from localStorage
    const sessions = JSON.parse(localStorage.getItem('echopilot_history')) || [];
    if (sessions.length === 0) {
        // Fallback safety (should be seeded by main.js)
        window.location.href = 'index.html';
        return;
    }

    const dropdown = document.getElementById('session-dropdown');
    
    // 2. Populate dropdown
    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = `${session.driver} - ${session.event} (${session.date})`;
        dropdown.appendChild(option);
    });

    // 3. Determine active session from URL query param
    const urlParams = new URLSearchParams(window.location.search);
    let activeSessionId = urlParams.get('session');
    
    // Fallback if not matching
    let activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) {
        activeSession = sessions[0];
        activeSessionId = activeSession.id;
    }

    // Set dropdown current selection
    dropdown.value = activeSessionId;

    // Load session details
    loadSession(activeSession);

    // Dropdown change listener
    dropdown.addEventListener('change', (e) => {
        const selectedSession = sessions.find(s => s.id === e.target.value);
        if (selectedSession) {
            // Stop playing if audio is playing
            stopAudioPlayback();
            loadSession(selectedSession);
            // Update URL search param silently
            const newUrl = `${window.location.pathname}?session=${selectedSession.id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    });

    // Setup waveform bars
    createWaveformBars();

    // Play/Pause button event
    setupAudioPlayer();
});

// Load session data into panels
function loadSession(session) {
    // Headers
    document.getElementById('meta-driver').textContent = session.driver;
    document.getElementById('meta-event').textContent = session.event;
    document.getElementById('meta-date').textContent = `${session.date} // ${session.time}`;
    document.getElementById('meta-audio').textContent = session.audioFile;
    document.getElementById('meta-csv').textContent = session.csvFile;

    // Summary Text
    document.getElementById('analysis-summary-text').textContent = session.summary;

    // Stress Dial Gauge
    updateStressGauge(session.avgStress, session.emotion);

    // Breakdown Bars
    updateBreakdownBars(session.stressDistribution);

    // Dynamic Pit Wall Insights
    updateRecommendations(session.emotion);

    // Transcripts List
    renderTranscripts(session.transcript);

    // Render/Update Chart.js Telemetry Graph
    renderTelemetryChart(session.laps);
}

// Update the circular dial gauge
function updateStressGauge(percent, emotion) {
    const gaugeFill = document.getElementById('gauge-fill-bar');
    const gaugePercent = document.getElementById('gauge-percent');
    const sentimentLabel = document.getElementById('overall-sentiment-label');
    const overallBadge = document.getElementById('overall-badge');

    // Circle circumference for r=60 is 2 * PI * 60 = 377
    const circumference = 377;
    const offset = circumference - (percent / 100 * circumference);
    
    // Set stroke styles
    gaugeFill.style.strokeDasharray = `${circumference}`;
    gaugeFill.style.strokeDashoffset = `${offset}`;

    // Text output
    gaugePercent.innerHTML = `${percent}%<span id="overall-sentiment-label">${emotion.toUpperCase()}</span>`;
    
    // Badge status update
    overallBadge.textContent = emotion;
    overallBadge.className = `badge badge-${emotion.toLowerCase()}`;

    // Color adjust of circular progress stroke
    if (emotion === 'Calm') {
        gaugeFill.style.stroke = 'var(--accent-calm)';
    } else if (emotion === 'Stressed') {
        gaugeFill.style.stroke = 'var(--accent-stressed)';
    } else {
        gaugeFill.style.stroke = 'var(--accent-tired)';
    }
}

// Update the distribution bars
function updateBreakdownBars(dist) {
    const calmVal = document.getElementById('breakdown-calm-val');
    const calmBar = document.getElementById('breakdown-calm-bar');
    const stressedVal = document.getElementById('breakdown-stressed-val');
    const stressedBar = document.getElementById('breakdown-stressed-bar');
    const tiredVal = document.getElementById('breakdown-tired-val');
    const tiredBar = document.getElementById('breakdown-tired-bar');

    calmVal.textContent = `${dist.calm}%`;
    calmBar.style.width = `${dist.calm}%`;

    stressedVal.textContent = `${dist.stressed}%`;
    stressedBar.style.width = `${dist.stressed}%`;

    tiredVal.textContent = `${dist.tired}%`;
    tiredBar.style.width = `${dist.tired}%`;
}

// Update pit recommendations dynamically
function updateRecommendations(emotion) {
    const box = document.getElementById('recommendations-box');
    box.innerHTML = ''; // clear

    let items = [];
    if (emotion === 'Calm') {
        items = [
            'Maintain present tire strategy. Pace delta is operating in optimal performance envelope.',
            'Battery deploy instruction: Keep energy store configuration preset to SOC mode 3.',
            'Sector 1 corner speeds are consistent. Advise driver to carry telemetry racing line.'
        ];
    } else if (emotion === 'Stressed') {
        items = [
            'Alert driver of traffic gap (+3.8s Leclerc behind) to reduce verbal pressure indicators.',
            'Re-map wheel differential values dynamically via control knob to prevent snap oversteer.',
            'Instruct pit wall crew to prep front-wing flap adjustment (+0.5deg) for scheduled service.'
        ];
    } else {
        items = [
            'Engage driver audio checklist confirmation every 3 laps to evaluate cognitive alert limits.',
            'Remind cockpit crew to enforce hydration delivery usage on long straight stretches.',
            'Default display cluster configurations to simple mode to limit dashboard attention fatigue.'
        ];
    }

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'rec-item';
        div.innerHTML = `<span class="rec-bullet">0${index+1} //</span><span>${item}</span>`;
        box.appendChild(div);
    });
}

// Render dynamic transcript panel rows
function renderTranscripts(transcript) {
    const container = document.getElementById('transcripts-container');
    container.innerHTML = ''; // Clear

    transcript.forEach(line => {
        const row = document.createElement('div');
        row.className = 'transcript-row';
        row.dataset.lap = line.lap;

        const badgeClass = `badge-${line.emotion.toLowerCase()}`;
        
        row.innerHTML = `
            <div class="transcript-row-header">
                <div class="transcript-meta">
                    <span>${line.time}</span>
                    <span>LAP ${line.lap}</span>
                </div>
                <span class="badge ${badgeClass}">${line.emotion}</span>
            </div>
            <div class="transcript-text">"${line.text}"</div>
        `;

        row.addEventListener('click', () => {
            // Remove active classes
            document.querySelectorAll('.transcript-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');

            // Highlight corresponding lap on telemetry chart if chart exists
            highlightChartLap(line.lap);

            // Trigger wave playback simulation
            startAudioPlaybackSim();
        });

        container.appendChild(row);
    });
}

// Setup audio wave bars visually
function createWaveformBars() {
    const container = document.getElementById('waveform-bars');
    container.innerHTML = '';
    const numBars = 50;

    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        // Random visual height
        const heightPercent = Math.floor(Math.random() * 70) + 15;
        bar.style.height = `${heightPercent}%`;
        container.appendChild(bar);
    }
}

// Simulate play/pause operations
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
    
    // If completed previously, reset
    if (playTimeSeconds >= audioDuration) {
        playTimeSeconds = 0;
    }

    playInterval = setInterval(() => {
        playTimeSeconds += 0.5;
        if (playTimeSeconds >= audioDuration) {
            playTimeSeconds = audioDuration;
            stopAudioPlayback();
        }
        
        // Format time string
        const minutes = Math.floor(playTimeSeconds / 60);
        const seconds = Math.floor(playTimeSeconds % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.textContent = `${timeStr} / 0:30`;

        // Modulate waveform heights on each tick to look alive
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
            const h = Math.floor(Math.random() * 80) + 20;
            bar.style.height = `${h}%`;
        }
    });
}

// Telemetry graph creation using Chart.js
function renderTelemetryChart(laps) {
    const ctx = document.getElementById('telemetry-chart').getContext('2d');
    
    const lapLabels = laps.map(l => `Lap ${l.lap}`);
    const lapTimes = laps.map(l => l.lapTime);
    const stressScores = laps.map(l => l.stress);

    // Destroy old instance if switching sessions
    if (telemetryChart) {
        telemetryChart.destroy();
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'JetBrains Mono';

    telemetryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lapLabels,
            datasets: [
                {
                    label: 'Driver Stress (%)',
                    data: stressScores,
                    borderColor: '#e02828',
                    backgroundColor: 'rgba(224, 40, 40, 0.05)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.2,
                    yAxisID: 'yStress',
                    pointBackgroundColor: '#e02828',
                    pointBorderColor: '#0b0c10',
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Lap Time (s)',
                    data: lapTimes,
                    borderColor: '#38bdf8',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'yTime',
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#0b0c10',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1b1c24',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: '#2e303f',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: { color: '#20222e' },
                },
                yStress: {
                    type: 'linear',
                    position: 'left',
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Stress Score %',
                        color: '#e02828'
                    },
                    grid: { color: '#20222e' }
                },
                yTime: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Lap Time Seconds',
                        color: '#38bdf8'
                    },
                    grid: { drawOnChartArea: false } // Only draw grids for left axis
                }
            }
        }
    });
}

// Highlight lap node in chart on transcript click
function highlightChartLap(lapNumber) {
    if (!telemetryChart) return;

    const dataset = telemetryChart.data.datasets[0];
    const index = telemetryChart.data.labels.indexOf(`Lap ${lapNumber}`);
    
    if (index !== -1) {
        // Toggle hover effect/active point in Chart.js
        telemetryChart.setActiveElements([{
            datasetIndex: 0,
            index: index
        }]);
        telemetryChart.update();
    }
}
