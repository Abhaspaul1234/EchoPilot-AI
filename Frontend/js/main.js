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
