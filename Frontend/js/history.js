/* ==========================================================================
   EchoPilot AI - Telemetry Logs History Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    renderHistoryTable();
});

function renderHistoryTable() {
    const historyData = JSON.parse(localStorage.getItem('echopilot_history')) || [];
    const tableContainer = document.getElementById('logs-table-container');
    const emptyState = document.getElementById('empty-state');
    const tbody = document.getElementById('history-table-body');

    // Clear old rows
    tbody.innerHTML = '';

    if (historyData.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    historyData.forEach(session => {
        const tr = document.createElement('tr');
        
        // Dynamic emotion badge styling
        const badgeClass = `badge-${session.emotion.toLowerCase()}`;

        tr.innerHTML = `
            <td>
                <div style="font-weight: 600;">${session.driver}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${session.event}</div>
            </td>
            <td class="mono" style="font-size: 0.85rem;">
                ${session.date}<br/>
                <span style="color: var(--text-muted); font-size: 0.75rem;">${session.time}</span>
            </td>
            <td>
                <div class="mono" style="font-size: 0.8rem; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    &#x1F50A; ${session.audioFile}
                </div>
                <div class="mono" style="font-size: 0.8rem; color: var(--text-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px;">
                    &#x1F4C4; ${session.csvFile}
                </div>
            </td>
            <td>
                <span class="badge ${badgeClass}">${session.emotion}</span>
            </td>
            <td class="mono" style="font-weight: 600; font-size: 1rem; color: ${getStressColor(session.emotion)};">
                ${session.avgStress}%
            </td>
            <td style="text-align: right;">
                <div class="table-action-group" style="justify-content: flex-end;">
                    <button class="btn btn-primary btn-table" onclick="viewSession('${session.id}')">View</button>
                    <button class="btn btn-secondary btn-table" onclick="downloadSessionJSON('${session.id}')" title="Download Telemetry JSON">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button class="btn btn-danger btn-table" onclick="deleteSession('${session.id}')" title="Delete Session">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function getStressColor(emotion) {
    if (emotion === 'Calm') return 'var(--accent-calm)';
    if (emotion === 'Stressed') return 'var(--accent-stressed)';
    return 'var(--accent-tired)';
}

// Global actions to bind to dynamically rendered buttons
window.viewSession = function(sessionId) {
    window.location.href = `results.html?session=${sessionId}`;
};

window.deleteSession = function(sessionId) {
    if (confirm('Are you sure you want to delete this telemetry session?')) {
        const historyData = JSON.parse(localStorage.getItem('echopilot_history')) || [];
        const filteredData = historyData.filter(s => s.id !== sessionId);
        localStorage.setItem('echopilot_history', JSON.stringify(filteredData));
        renderHistoryTable();
    }
};

window.downloadSessionJSON = function(sessionId) {
    const historyData = JSON.parse(localStorage.getItem('echopilot_history')) || [];
    const session = historyData.find(s => s.id === sessionId);
    if (!session) return;

    // Create a blob and download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `echopilot_telemetry_${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};
