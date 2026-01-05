// ==========================================
// SCROLL ANIMATIONS - GSAP ScrollTrigger
// ==========================================

class ScrollAnimations {
    constructor() {
        this.sections = document.querySelectorAll('.country-section');
        this.navDots = document.querySelectorAll('.nav-dot');
        this.progressBar = document.getElementById('progress-bar');
        this.currentSection = 0;
        
        this.init();
    }
    
    init() {
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);
        
        // Setup all animations
        this.setupProgressBar();
        this.setupHeroAnimation();
        this.setupSectionAnimations();
        this.setupNavDots();
        this.setupTodaySection();
    }
    
    setupProgressBar() {
        // Update progress bar on scroll
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            this.progressBar.style.width = `${scrollPercent}%`;
        });
    }
    
    setupHeroAnimation() {
        // Fade out hero content as user scrolls
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            opacity: 0,
            y: -100
        });
    }
    
    setupSectionAnimations() {
        this.sections.forEach((section, index) => {
            const panel = section.querySelector('.content-panel');
            const lat = parseFloat(section.dataset.lat);
            const lng = parseFloat(section.dataset.lng);
            
            // Create scroll trigger for each section
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => this.onSectionEnter(index, lat, lng, panel),
                onEnterBack: () => this.onSectionEnter(index, lat, lng, panel),
                onLeave: () => this.onSectionLeave(panel),
                onLeaveBack: () => this.onSectionLeave(panel)
            });
            
            // Parallax effect for content panels
            gsap.fromTo(panel, 
                { 
                    opacity: 0, 
                    x: -50 
                },
                {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        end: 'top 30%',
                        scrub: 1
                    },
                    opacity: 1,
                    x: 0
                }
            );
        });
    }
    
    onSectionEnter(index, lat, lng, panel) {
        this.currentSection = index;
        
        // Rotate globe to this location
        if (typeof globe !== 'undefined' && globe.rotateTo) {
            globe.rotateTo(lat, lng);
            globe.highlightPin(index);
        }
        
        // Show content panel
        panel.classList.add('visible');
        
        // Update nav dots
        this.updateNavDots(index);
    }
    
    onSectionLeave(panel) {
        panel.classList.remove('visible');
    }
    
    updateNavDots(activeIndex) {
        this.navDots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    setupNavDots() {
        this.navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Get corresponding section
                const sections = [
                    document.getElementById('new-york'),
                    document.getElementById('uzbekistan'),
                    document.getElementById('morocco'),
                    document.getElementById('thailand'),
                    document.getElementById('germany'),
                    document.getElementById('lebanon'),
                    document.getElementById('san-francisco'),
                    document.getElementById('hannover'),
                    document.getElementById('ohio')
                ];
                
                if (sections[index]) {
                    sections[index].scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        });
    }
    
    setupTodaySection() {
        const todaySection = document.getElementById('today');
        
        // Fade in today content
        gsap.fromTo('.today-content',
            {
                opacity: 0,
                y: 50
            },
            {
                scrollTrigger: {
                    trigger: todaySection,
                    start: 'top 60%',
                    end: 'top 30%',
                    scrub: 1
                },
                opacity: 1,
                y: 0
            }
        );
        
        // Animate interest tags
        gsap.fromTo('.interest-tag',
            {
                opacity: 0,
                scale: 0.8
            },
            {
                scrollTrigger: {
                    trigger: '.interests',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 1,
                scale: 1,
                stagger: 0.1,
                duration: 0.5,
                ease: 'back.out(1.7)'
            }
        );
        
        // Animate contact links
        gsap.fromTo('.contact-link',
            {
                opacity: 0,
                y: 20
            },
            {
                scrollTrigger: {
                    trigger: '.contact-links',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 1,
                y: 0,
                stagger: 0.15,
                duration: 0.6,
                ease: 'power2.out'
            }
        );
        
        // Fade out globe on today section
        ScrollTrigger.create({
            trigger: todaySection,
            start: 'top 50%',
            end: 'top 20%',
            scrub: true,
            onUpdate: (self) => {
                const globeContainer = document.getElementById('globe-container');
                globeContainer.style.opacity = 1 - self.progress;
            }
        });
    }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure globe is initialized first
    setTimeout(() => {
        new ScrollAnimations();
    }, 100);
});