/* ==========================================================================
   EchoPilot AI - Shared Main Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Seed initial database if empty
    seedMockDatabase();

    // Highlight active link in header navbar
    highlightActiveNavLink();

    // Setup mobile nav toggles
    setupMobileMenu();
});

// Seed sample telemetry records
function seedMockDatabase() {
    if (!localStorage.getItem('echopilot_history')) {
        const mockHistory = [
            {
                id: 'session_monza_001',
                driver: 'L. Hamilton',
                event: 'Italian GP - FP2',
                date: '2026-08-05',
                time: '14:35',
                audioFile: 'driver_radio_ham_monza.mp3',
                csvFile: 'telemetry_laps_ham.csv',
                emotion: 'Calm',
                avgStress: 24,
                stressDistribution: { calm: 80, stressed: 15, tired: 5 },
                summary: 'Driver maintained highly stable speech frequency and breathing metrics throughout the stint. Minor stress spike detected on Lap 4 during heavy braking zone at Turn 1 (Chicane), correlating with a slight lockup but no significant loss in delta time. Performance output remains optimal.',
                laps: [
                    { lap: 1, lapTime: 81.4, stress: 20 },
                    { lap: 2, lapTime: 80.9, stress: 18 },
                    { lap: 3, lapTime: 80.5, stress: 22 },
                    { lap: 4, lapTime: 80.1, stress: 35 },
                    { lap: 5, lapTime: 80.3, stress: 25 }
                ],
                transcript: [
                    { time: '00:12', text: 'Engine temperatures look good, matching target delta.', lap: 1, emotion: 'Calm', stress: 20 },
                    { time: '01:30', text: 'Gap to Leclerc is widening, we have clear air in sector 2.', lap: 2, emotion: 'Calm', stress: 18 },
                    { time: '02:50', text: 'Tires are operating right in the sweet spot. Balance is solid.', lap: 3, emotion: 'Calm', stress: 22 },
                    { time: '04:15', text: 'Spoke too soon, rear is sliding under braking at turn 1. Box this lap?', lap: 4, emotion: 'Stressed', stress: 35 },
                    { time: '05:35', text: 'Understood. Staying out for one more push lap.', lap: 5, emotion: 'Calm', stress: 25 }
                ]
            },
            {
                id: 'session_monaco_002',
                driver: 'M. Verstappen',
                event: 'Monaco GP - Q3 Stint',
                date: '2026-08-04',
                time: '16:10',
                audioFile: 'radio_ver_monaco_q3.wav',
                csvFile: 'telemetry_laps_ver.csv',
                emotion: 'Stressed',
                avgStress: 78,
                stressDistribution: { calm: 15, stressed: 75, tired: 10 },
                summary: 'Severe stress indicators flagged in speech rate and vocal pitch. Voice analysis showed breath control anomalies, matching high vertical G forces and tight cockpit clearances. Core correlation reveals stress peaks corresponding with slower lap times in sectors 1 & 3 due to tracking traffic congestion.',
                laps: [
                    { lap: 12, lapTime: 75.2, stress: 72 },
                    { lap: 13, lapTime: 76.8, stress: 85 },
                    { lap: 14, lapTime: 78.5, stress: 90 },
                    { lap: 15, lapTime: 74.9, stress: 68 },
                    { lap: 16, lapTime: 75.5, stress: 75 }
                ],
                transcript: [
                    { time: '00:08', text: 'I have zero grip in the rear. What is going on with the differential settings?', lap: 12, emotion: 'Stressed', stress: 72 },
                    { time: '01:22', text: 'Unbelievable. The traffic is backing up through the tunnel, tell the pit wall!', lap: 13, emotion: 'Stressed', stress: 85 },
                    { time: '02:40', text: 'I locked up at the chicane, checking front wing... might have hit the armco.', lap: 14, emotion: 'Stressed', stress: 90 },
                    { time: '03:55', text: 'Okay, tyres are recovering now but we lost three seconds on that run.', lap: 15, emotion: 'Calm', stress: 68 },
                    { time: '05:10', text: 'Tell me the exact gap behind Leclerc, I need to know now!', lap: 16, emotion: 'Stressed', stress: 75 }
                ]
            },
            {
                id: 'session_spa_003',
                driver: 'C. Leclerc',
                event: 'Belgian GP - Late Race',
                date: '2026-08-02',
                time: '15:48',
                audioFile: 'driver_radio_lec_spa.mp3',
                csvFile: 'telemetry_laps_lec.csv',
                emotion: 'Tired',
                avgStress: 48,
                stressDistribution: { calm: 40, stressed: 10, tired: 50 },
                summary: 'Driver voice logs indicate low cognitive alert thresholds and vocal fatigue. Voice dynamics showed lengthened vowels and quiet radio responses, typical of prolonged mental exertion. Lap telemetry shows a steady degradation of sector speed, matching the tiredness curve.',
                laps: [
                    { lap: 35, lapTime: 107.5, stress: 35 },
                    { lap: 36, lapTime: 107.8, stress: 45 },
                    { lap: 37, lapTime: 108.3, stress: 52 },
                    { lap: 38, lapTime: 108.9, stress: 58 },
                    { lap: 39, lapTime: 109.2, stress: 50 }
                ],
                transcript: [
                    { time: '00:25', text: 'Focusing on tyre management now. Let me know when target pace changes.', lap: 35, emotion: 'Calm', stress: 35 },
                    { time: '01:48', text: 'Yes... copy that. I am doing my best to save fuel in the flow zones.', lap: 36, emotion: 'Tired', stress: 45 },
                    { time: '03:10', text: 'Yeah... it is a very long stint. Struggling to keep tyre temps warm on the straight.', lap: 37, emotion: 'Tired', stress: 52 },
                    { time: '04:40', text: 'Copy. How many laps are remaining? The steering is starting to feel very heavy.', lap: 38, emotion: 'Tired', stress: 58 },
                    { time: '06:05', text: 'Understood, box box this lap. Affirmative.', lap: 39, emotion: 'Tired', stress: 50 }
                ]
            }
        ];
        localStorage.setItem('echopilot_history', JSON.stringify(mockHistory));
    }
}

function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Match path ends or default directory index
        if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.nav-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const isVisible = menu.style.display === 'flex';
            if (isVisible) {
                menu.style.display = 'none';
                toggle.innerHTML = '&#9776;';
            } else {
                menu.style.display = 'flex';
                menu.style.flexDirection = 'column';
                menu.style.position = 'absolute';
                menu.style.top = '72px';
                menu.style.left = '0';
                menu.style.width = '100%';
                menu.style.backgroundColor = 'var(--bg-dark)';
                menu.style.borderBottom = '1px solid var(--border-color)';
                menu.style.padding = '20px 24px';
                menu.style.gap = '16px';
                toggle.innerHTML = '&times;';
            }
        });
    }
}
