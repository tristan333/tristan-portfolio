// ==========================================
// LENIS SMOOTH SCROLL
// ==========================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ==========================================
// CUSTOM CURSOR
// ==========================================
class Cursor {
    constructor() {
        this.dot = document.querySelector('.cursor-dot');
        this.outline = document.querySelector('.cursor-outline');
        this.posX = 0;
        this.posY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.outlineX = 0;
        this.outlineY = 0;
        
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.render();
    }
    
    render() {
        // Dot follows immediately
        this.posX += (this.mouseX - this.posX) * 0.2;
        this.posY += (this.mouseY - this.posY) * 0.2;
        this.dot.style.left = `${this.posX}px`;
        this.dot.style.top = `${this.posY}px`;
        
        // Outline follows with delay
        this.outlineX += (this.mouseX - this.outlineX) * 0.08;
        this.outlineY += (this.mouseY - this.outlineY) * 0.08;
        this.outline.style.left = `${this.outlineX}px`;
        this.outline.style.top = `${this.outlineY}px`;
        
        requestAnimationFrame(() => this.render());
    }
}

new Cursor();

// ==========================================
// MAGNETIC BUTTONS
// ==========================================
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.4,
            ease: 'power2.out'
        });
    });
    
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.3)'
        });
    });
});

// ==========================================
// PROGRESS LINE
// ==========================================
const progressLine = document.querySelector('.progress-line');

ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
        gsap.to(progressLine, {
            scaleX: self.progress,
            duration: 0.1
        });
    }
});

// ==========================================
// HERO ANIMATIONS
// ==========================================
const heroTimeline = gsap.timeline({ delay: 0.5 });

heroTimeline
    .to('.hero-eyebrow .line', {
        scaleX: 1,
        duration: 1,
        ease: 'power3.out',
        transformOrigin: 'left'
    }, 0)
    .to('.hero-eyebrow .text', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
    }, 0.2)
    .to('.title-word', {
        y: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out'
    }, 0.3)
    .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
    }, 0.6)
    .to('.hero-scroll', {
        opacity: 1,
        duration: 1
    }, 0.8);

// Set initial states
gsap.set('.hero-eyebrow .line', { scaleX: 0 });
gsap.set('.hero-eyebrow .text', { y: 20, opacity: 0 });
gsap.set('.hero-subtitle', { y: 30, opacity: 0 });
gsap.set('.hero-scroll', { opacity: 0 });

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
// Globe section
gsap.from('.globe-content .section-number', {
    scrollTrigger: {
        trigger: '.globe-section',
        start: 'top 70%',
    },
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.globe-content .title-word', {
    scrollTrigger: {
        trigger: '.globe-section',
        start: 'top 70%',
    },
    y: '100%',
    duration: 1.2,
    stagger: 0.1,
    ease: 'power3.out'
});

gsap.from('.globe-content .section-text', {
    scrollTrigger: {
        trigger: '.globe-section',
        start: 'top 60%',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.globe-content .magnetic-btn', {
    scrollTrigger: {
        trigger: '.globe-section',
        start: 'top 50%',
    },
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

// Work section
gsap.from('.work-header .section-number', {
    scrollTrigger: {
        trigger: '.work-section',
        start: 'top 70%',
    },
    y: 30,
    opacity: 0,
    duration: 1
});

gsap.from('.work-header .title-word', {
    scrollTrigger: {
        trigger: '.work-section',
        start: 'top 70%',
    },
    y: '100%',
    duration: 1.2,
    stagger: 0.1,
    ease: 'power3.out'
});

gsap.from('.work-item', {
    scrollTrigger: {
        trigger: '.work-grid',
        start: 'top 70%',
    },
    y: 60,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out'
});

// About section
gsap.from('.about-content .title-word', {
    scrollTrigger: {
        trigger: '.about-section',
        start: 'top 60%',
    },
    y: '100%',
    duration: 1.2,
    stagger: 0.1,
    ease: 'power3.out'
});

gsap.from('.about-text p', {
    scrollTrigger: {
        trigger: '.about-text',
        start: 'top 70%',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
});

gsap.from('.interest', {
    scrollTrigger: {
        trigger: '.about-interests',
        start: 'top 80%',
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
});

// Contact section
gsap.from('.contact-title .title-word', {
    scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 60%',
    },
    y: '100%',
    duration: 1.2,
    stagger: 0.1,
    ease: 'power3.out'
});

gsap.from('.contact-link', {
    scrollTrigger: {
        trigger: '.contact-content',
        start: 'top 60%',
    },
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.social-link', {
    scrollTrigger: {
        trigger: '.contact-social',
        start: 'top 80%',
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
});

// ==========================================
// GLOBE (Simplified for main page)
// ==========================================
class Globe {
    constructor() {
        this.canvas = document.getElementById('globe-canvas');
        if (!this.canvas) return;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true, 
            alpha: true 
        });
        
        this.init();
    }
    
    init() {
        const size = Math.min(600, window.innerWidth - 100);
        this.renderer.setSize(size, size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 12;
        
        this.createGlobe();
        this.createAtmosphere();
        this.createPins();
        
        this.animate();
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    createGlobe() {
        const geometry = new THREE.SphereGeometry(4, 128, 128);
        const textureLoader = new THREE.TextureLoader();
        
        const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg');
        const bumpTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
        
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.05,
            shininess: 5
        });
        
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        // Lighting
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 3, 5);
        this.scene.add(light);
    }
    
    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(4.15, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.3) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        
        this.scene.add(new THREE.Mesh(geometry, material));
    }
    
    createPins() {
        const locations = [
            { lat: 40.7128, lng: -74.0060 },
            { lat: 41.2995, lng: 69.2401 },
            { lat: 34.0209, lng: -6.8416 },
            { lat: 13.7563, lng: 100.5018 },
            { lat: 52.5200, lng: 13.4050 },
            { lat: 33.8938, lng: 35.5018 },
            { lat: 37.7749, lng: -122.4194 },
            { lat: 52.3759, lng: 9.7320 },
            { lat: 40.0681, lng: -82.5193 }
        ];
        
        locations.forEach(loc => {
            const phi = (90 - loc.lat) * (Math.PI / 180);
            const theta = (loc.lng + 180) * (Math.PI / 180);
            
            const x = -4 * Math.sin(phi) * Math.cos(theta);
            const y = 4 * Math.cos(phi);
            const z = 4 * Math.sin(phi) * Math.sin(theta);
            
            const dotGeo = new THREE.SphereGeometry(0.06, 16, 16);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(x, y, z);
            this.scene.add(dot);
        });
    }
    
    onResize() {
        const size = Math.min(600, window.innerWidth - 100);
        this.renderer.setSize(size, size);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.globe.rotation.y += 0.001;
        this.renderer.render(this.scene, this.camera);
    }
}

new Globe();

// ==========================================
// NAV LINK ANIMATION
// ==========================================
document.querySelectorAll('.nav-link').forEach(link => {
    const text = link.textContent;
    link.innerHTML = `<span>${text}</span>`;
});