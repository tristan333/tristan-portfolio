// ==========================================
// MAIN.JS - Utilities & Additional Features
// ==========================================

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const sections = document.querySelectorAll('.section');
    let currentIndex = 0;
    
    // Find current section in view
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentIndex = index;
        }
    });
    
    // Arrow key navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextSection = sections[currentIndex + 1];
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevSection = sections[currentIndex - 1];
        if (prevSection) {
            prevSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// Preloader (optional - shows loading state)
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate hero content on load
    gsap.fromTo('.hero-content h1', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );
    
    gsap.fromTo('.tagline',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power2.out' }
    );
    
    gsap.fromTo('.scroll-hint',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.6 }
    );
});

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Fun effect when Konami code is entered
        document.body.style.transition = 'filter 0.5s';
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 2000);
        console.log('🎮 Konami Code Activated!');
    }
});

// Console welcome message
console.log('%c👋 Hey there, curious developer!', 'font-size: 16px; font-weight: bold; color: #00d4ff;');
console.log('%cBuilt by Tristan Paton', 'font-size: 12px; color: #8892b0;');
console.log('%cWant to connect? https://linkedin.com/in/yourusername', 'font-size: 12px; color: #8892b0;');

// Visibility API - pause animations when tab not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause auto-rotation when tab is hidden
        if (typeof globe !== 'undefined') {
            globe.autoRotate = false;
        }
    } else {
        // Resume when tab is visible again
        if (typeof globe !== 'undefined' && !globe.isDragging) {
            globe.autoRotate = true;
        }
    }
});

// Mobile detection for touch hints
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // Update scroll hint text for mobile
    const scrollHint = document.querySelector('.scroll-hint span');
    if (scrollHint) {
        scrollHint.textContent = 'Swipe to explore';
    }
}