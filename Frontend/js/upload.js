/* ==========================================================================
   EchoPilot AI - Telemetry Ingest Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const audioInput = document.getElementById('audio-input');
    const csvInput = document.getElementById('csv-input');
    const audioZone = document.getElementById('audio-dropzone');
    const csvZone = document.getElementById('csv-dropzone');
    const submitBtn = document.getElementById('submit-btn');
    const uploadForm = document.getElementById('upload-form');

    let audioFile = null;
    let csvFile = null;

    // --- Drag and Drop Listeners for Audio Zone ---
    setupDragDropZone(audioZone, audioInput, (file) => {
        if (file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
            audioFile = file;
            showFileLoaded('audio-status', `Audio loaded: ${file.name}`);
            checkValidation();
        } else {
            alert('Invalid file format. Please upload a .wav or .mp3 audio file.');
        }
    });

    // --- Drag and Drop Listeners for CSV Zone ---
    setupDragDropZone(csvZone, csvInput, (file) => {
        if (file.name.endsWith('.csv')) {
            csvFile = file;
            showFileLoaded('csv-status', `CSV telemetry loaded: ${file.name}`);
            checkValidation();
        } else {
            alert('Invalid file format. Please upload a .csv telemetry spreadsheet.');
        }
    });

    // Handle manual browse select
    audioInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            audioFile = file;
            showFileLoaded('audio-status', `Audio loaded: ${file.name}`);
            checkValidation();
        }
    });

    csvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            csvFile = file;
            showFileLoaded('csv-status', `CSV telemetry loaded: ${file.name}`);
            checkValidation();
        }
    });

    // Drag-Drop helpers
    function setupDragDropZone(zone, input, callback) {
        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('drag-over');
            }, false);
        });

        zone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            if (file) {
                callback(file);
            }
        });
    }

    function showFileLoaded(statusId, message) {
        const statusEl = document.getElementById(statusId);
        statusEl.querySelector('span').textContent = message;
        statusEl.style.display = 'inline-flex';
    }

    function checkValidation() {
        if (audioFile && csvFile) {
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.setAttribute('disabled', 'true');
        }
    }

    // Submit / Processing logic
    uploadForm.addEventListener('submit', () => {
        if (!audioFile || !csvFile) return;

        const modal = document.getElementById('process-modal');
        const progressBar = document.getElementById('progress-indicator');
        const progressPercent = document.getElementById('progress-percent');
        const consoleLogs = document.getElementById('console-logs');

        modal.style.display = 'flex';

        const logs = [
            { time: 100, text: '[SYS] Ingesting driver radio raw audio channel...', type: 'info' },
            { time: 400, text: '[FFT] Executing Fast Fourier Transform (FFT)...', type: 'info' },
            { time: 700, text: '[FFT] Filtering ambient cockpit noise: 120Hz HPF & 3kHz LPF.', type: 'info' },
            { time: 1000, text: '[STT] Running Speech-to-Text inference model...', type: 'info' },
            { time: 1300, text: '[STT] Waveform text tokens generated successfully.', type: 'success' },
            { time: 1600, text: '[BIO] Commencing speech acoustics frequency mapping...', type: 'info' },
            { time: 1900, text: '[BIO] Pitch variation coefficient: 4.86 Hz (Anomalous pitch detected).', type: 'warning' },
            { time: 2200, text: '[CSV] Ingesting CSV lap-time metrics...', type: 'info' },
            { time: 2500, text: '[CSV] Detected 5 completed laps. Sector splits mapped.', type: 'info' },
            { time: 2800, text: '[SYS] Correlating biometric logs with throttle charts...', type: 'info' },
            { time: 3100, text: '[SYS] Overlays synchronized. Saving session...', type: 'success' }
        ];

        let progress = 0;
        const totalDuration = 3400; // ms
        const intervalTime = 50;
        const totalSteps = totalDuration / intervalTime;

        // Run progress bar loop
        const progressInterval = setInterval(() => {
            progress += 100 / totalSteps;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                saveAndRedirect();
            }
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.round(progress)}%`;
        }, intervalTime);

        // Run logs typing loop
        logs.forEach(log => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = `console-line ${log.type}`;
                line.textContent = log.text;
                consoleLogs.appendChild(line);
                consoleLogs.scrollTop = consoleLogs.scrollHeight;
            }, log.time);
        });

        function saveAndRedirect() {
            // Pick a random emotion for the user upload session to keep it interactive
            const emotions = ['Calm', 'Stressed', 'Tired'];
            const chosenEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            
            let avgStress = 25;
            let dist = { calm: 80, stressed: 10, tired: 10 };
            let laps = [];
            let transcript = [];
            let summaryText = "";

            if (chosenEmotion === 'Calm') {
                avgStress = 22;
                dist = { calm: 85, stressed: 10, tired: 5 };
                summaryText = 'Telemetry shows highly consistent driver focus. Radio voice signatures indicate steady pitch curves with stable breathing rhythms. Driver response times to engineer instructions were within the optimal 1.5-second range, with lap-time consistency matching track models.';
                laps = [
                    { lap: 1, lapTime: 82.1, stress: 18 },
                    { lap: 2, lapTime: 81.7, stress: 20 },
                    { lap: 3, lapTime: 81.3, stress: 24 },
                    { lap: 4, lapTime: 81.5, stress: 22 },
                    { lap: 5, lapTime: 81.1, stress: 25 }
                ];
                transcript = [
                    { time: '00:18', text: 'Gear shift patterns feeling smooth in sector 3. Keep me posted.', lap: 1, emotion: 'Calm', stress: 18 },
                    { time: '01:35', text: 'Wind direction has changed at the main straight, a bit of headwind.', lap: 2, emotion: 'Calm', stress: 20 },
                    { time: '02:55', text: 'Affirmative. Copied. Adjusting brake balance rearward by two clicks.', lap: 3, emotion: 'Calm', stress: 24 },
                    { time: '04:12', text: 'Tires are holding up fine, let\'s push another lap.', lap: 4, emotion: 'Calm', stress: 22 },
                    { time: '05:30', text: 'Copy that. I am bringing it home, box box.', lap: 5, emotion: 'Calm', stress: 25 }
                ];
            } else if (chosenEmotion === 'Stressed') {
                avgStress = 82;
                dist = { calm: 10, stressed: 80, tired: 10 };
                summaryText = 'Critical stress coefficients triggered during sector transitions. Radio communications reveal elevated acoustic pitch and shortened sentences, typical of high steering resistance or overtaking pressure. Dynamic metrics show driver lockups at Turn 3 matching voice fatigue markers.';
                laps = [
                    { lap: 1, lapTime: 82.5, stress: 65 },
                    { lap: 2, lapTime: 84.1, stress: 88 },
                    { lap: 3, lapTime: 85.3, stress: 94 },
                    { lap: 4, lapTime: 82.0, stress: 75 },
                    { lap: 5, lapTime: 83.2, stress: 86 }
                ];
                transcript = [
                    { time: '00:20', text: 'The pedal feels soft. I have barely any brake response!', lap: 1, emotion: 'Stressed', stress: 65 },
                    { time: '01:40', text: 'Why didn\'t you warn me about traffic? I had to lift at turn 3!', lap: 2, emotion: 'Stressed', stress: 88 },
                    { time: '03:02', text: 'I lost the rear, I\'ve flat-spotted the front-left. Checking damage.', lap: 3, emotion: 'Stressed', stress: 94 },
                    { time: '04:22', text: 'Okay... steering seems straight. Pace is recovering.', lap: 4, emotion: 'Calm', stress: 75 },
                    { time: '05:40', text: 'Get ready for tyres. The vibration is terrible!', lap: 5, emotion: 'Stressed', stress: 86 }
                ];
            } else {
                avgStress = 54;
                dist = { calm: 35, stressed: 15, tired: 50 };
                summaryText = 'Significant vocal weariness detected during latter laps. Analysis demonstrates delayed responses (3.8-second delay to instructions) and vocal compression signs, suggesting high muscle strain. Telemetry shows a gradual 1.8-second loss of speed over the stint.';
                laps = [
                    { lap: 1, lapTime: 82.1, stress: 35 },
                    { lap: 2, lapTime: 82.9, stress: 45 },
                    { lap: 3, lapTime: 83.4, stress: 58 },
                    { lap: 4, lapTime: 83.8, stress: 62 },
                    { lap: 5, lapTime: 84.5, stress: 70 }
                ];
                transcript = [
                    { time: '00:15', text: 'Pace is stable. The track temperatures are rising fast.', lap: 1, emotion: 'Calm', stress: 35 },
                    { time: '01:38', text: 'Copy... yeah, I hear you. The drink bottle tube is blocked.', lap: 2, emotion: 'Tired', stress: 45 },
                    { time: '02:58', text: 'Understood. The steering is getting very heavy in the high-speed curves.', lap: 3, emotion: 'Tired', stress: 58 },
                    { time: '04:18', text: 'Copy... I am having to lift. Running out of energy in the shoulders.', lap: 4, emotion: 'Tired', stress: 62 },
                    { time: '05:38', text: 'Yes, copy that. Box this lap. I\'m spent.', lap: 5, emotion: 'Tired', stress: 70 }
                ];
            }

            const timestamp = new Date();
            const dateStr = timestamp.toISOString().split('T')[0];
            const timeStr = timestamp.toTimeString().split(' ')[0].substring(0, 5);
            
            const newSession = {
                id: `session_custom_${Date.now()}`,
                driver: 'G. Driver (You)',
                event: 'Sim Stint Ingest',
                date: dateStr,
                time: timeStr,
                audioFile: audioFile.name,
                csvFile: csvFile.name,
                emotion: chosenEmotion,
                avgStress: avgStress,
                stressDistribution: dist,
                summary: summaryText,
                laps: laps,
                transcript: transcript
            };

            // Add to localStorage
            const currentHistory = JSON.parse(localStorage.getItem('echopilot_history')) || [];
            currentHistory.unshift(newSession); // add at start
            localStorage.setItem('echopilot_history', JSON.stringify(currentHistory));

            // Redirect
            window.location.href = `results.html?session=${newSession.id}`;
        }
    });
});
