const API_BASE = "http://127.0.0.1:5000";

document.addEventListener('DOMContentLoaded', () => {
    renderHistoryTable();
});

async function renderHistoryTable() {
    const tableContainer = document.getElementById('logs-table-container');
    const emptyState = document.getElementById('empty-state');
    const tbody = document.getElementById('history-table-body');

    let historyData = [];

    try {
        const res = await fetch(`${API_BASE}/history`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        historyData = await res.json();
    } catch (err) {
        console.error('Failed to load history:', err);
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = `<p>Could not reach the backend. Is the server running?</p>`;
        return;
    }

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

        const hasSentiment = session.sentiment && session.sentiment !== "Not analyzed";
        const sentimentLabel = hasSentiment ? session.sentiment : 'Pending';

        tr.innerHTML = `
            <td>
                <div style="font-weight: 600;">Session #${session.id}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    ${formatDate(session.created_at)}
                </div>
            </td>
            <td>
                <div class="mono" style="font-size: 0.8rem; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    &#x1F50A; ${session.audio_file || 'N/A'}
                </div>
                <div class="mono" style="font-size: 0.8rem; color: var(--text-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px;">
                    &#x1F4C4; ${session.csv_file || 'N/A'}
                </div>
            </td>
            <td>
                <span class="badge ${hasSentiment ? '' : 'badge-neutral'}">${sentimentLabel}</span>
            </td>
            <td style="text-align: right;">
                <div class="table-action-group" style="justify-content: flex-end;">
                    <button class="btn btn-primary btn-table" onclick="viewSession(${session.id})">View</button>
                    <button class="btn btn-secondary btn-table" onclick="downloadSessionJSON(${session.id})" title="Download Session JSON">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    window._historyCache = historyData;
}

window.viewSession = function(sessionId) {
    window.location.href = `results.html?session=${sessionId}`;
};

window.downloadSessionJSON = function(sessionId) {
    const session = (window._historyCache || []).find(s => s.id === sessionId);
    if (!session) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `echopilot_session_${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
}