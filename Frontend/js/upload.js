/* ==========================================================================
   EchoPilot AI - Telemetry Ingest Script (CONNECTED TO BACKEND)
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

// =============================
// Drag & Drop Setup
// =============================

setupDragDropZone(audioZone, audioInput, (file) => {
    if (file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        audioFile = file;
        showFileLoaded('audio-status', `Audio loaded: ${file.name}`);
        checkValidation();
    } else {
        alert('Invalid file format. Please upload a .wav or .mp3 file.');
    }
});

setupDragDropZone(csvZone, csvInput, (file) => {
    if (file.name.endsWith('.csv')) {
        csvFile = file;
        showFileLoaded('csv-status', `CSV loaded: ${file.name}`);
        checkValidation();
    } else {
        alert('Invalid file format. Please upload a .csv file.');
    }
});

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
        showFileLoaded('csv-status', `CSV loaded: ${file.name}`);
        checkValidation();
    }
});

function setupDragDropZone(zone, input, callback) {
    ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
        });
    });

    zone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) callback(file);
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

// =============================
// SUBMIT HANDLER
// =============================

uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!audioFile || !csvFile) return;

    const modal = document.getElementById('process-modal');
    const progressBar = document.getElementById('progress-indicator');
    const progressPercent = document.getElementById('progress-percent');
    const consoleLogs = document.getElementById('console-logs');

    modal.style.display = 'flex';

    const logs = [
        { time: 100, text: '[SYS] Ingesting audio...', type: 'info' },
        { time: 800, text: '[STT] Running Speech-to-Text...', type: 'info' },
        { time: 1500, text: '[CSV] Processing telemetry...', type: 'info' },
        { time: 2500, text: '[SYS] Finalizing session...', type: 'success' }
    ];

    let progress = 0;
    const totalDuration = 3500;
    const intervalTime = 50;
    const totalSteps = totalDuration / intervalTime;

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

    logs.forEach(log => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = `console-line ${log.type}`;
            line.textContent = log.text;
            consoleLogs.appendChild(line);
            consoleLogs.scrollTop = consoleLogs.scrollHeight;
        }, log.time);
    });

    // =============================
    // BACKEND CONNECTION 🔥
    // =============================

    async function saveAndRedirect() {
        try {
            console.log("Sending files:", audioFile, csvFile);

            const formData = new FormData();

            // ✅ MUST match Flask backend
            formData.append("audio", audioFile);
            formData.append("csv", csvFile);

            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                body: formData
            });

            console.log("Status:", response.status);

            let data;
            try {
                data = await response.json();
            } catch {
                alert("Invalid server response");
                return;
            }

            console.log("Response:", data);

            if (!response.ok) {
                alert("Server error: " + (data.error || response.status));
                return;
            }

            // ✅ Use real session ID from backend
            if (data.session_id) {
                const sessionId = data.session_id;

                // Redirect to results page with REAL DB ID
                window.location.href = `results.html?session=${sessionId}`;
            } else {
                alert("Error: Missing session ID");
            }

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Is backend running?");
        }
    }
});

});