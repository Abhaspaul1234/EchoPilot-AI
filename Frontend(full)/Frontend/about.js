/* ==========================================================================
   EchoPilot AI - Project About Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Print technical debug specs to console for developer judges
    console.log("=== ECHOPILOT AI DIAGNOSTICS MODULES INGESTED ===");
    console.log("SAMPLING RATE: 44.1 kHz voice channel standard");
    console.log("ACOUSTIC RESOLUTION: Fast Fourier Transform 512 bins");
    console.log("CORRELATION DELAY: 100ms sector synchronization");
    console.log("BUILD: 1.0.4 - RELEASED FOR MOTORSPORT HACKATHON");
    console.log("================================================");

    setupTechItemsInteractivity();
});

// Subtle technical console prints when hovering over student team cards
function setupTechItemsInteractivity() {
    const cards = document.querySelectorAll('.team-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const devName = card.querySelector('.team-name').textContent;
            console.log(`[SYS DEBUG] Active developer profile queried: ${devName}`);
        });
    });
}
