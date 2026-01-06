// ==========================================
// STARS BACKGROUND
// ==========================================
class StarsBackground {
    constructor() {
        this.canvas = document.getElementById('stars-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 200;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createStars();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                speed: Math.random() * 0.5 + 0.1,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.stars.forEach(star => {
            // Twinkle effect
            star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
            star.opacity = Math.max(0.1, Math.min(0.7, star.opacity));
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================
// GLOBE CLASS
// ==========================================
class Globe {
    constructor(canvasId, size = 500) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.size = size;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true, 
            alpha: true 
        });
        
        this.locations = [
            { lat: 40.7128, lng: -74.0060 },    // New York
            { lat: 41.2995, lng: 69.2401 },    // Tashkent
            { lat: 34.0209, lng: -6.8416 },    // Rabat
            { lat: 13.7563, lng: 100.5018 },   // Bangkok
            { lat: 52.5200, lng: 13.4050 },    // Berlin
            { lat: 33.8938, lng: 35.5018 },    // Beirut
            { lat: 37.7749, lng: -122.4194 },  // San Francisco
            { lat: 52.3759, lng: 9.7320 },     // Hannover
            { lat: 40.0681, lng: -82.5193 }    // Granville
        ];
        
        this.pins = [];
        this.rotation = 0;
        
        this.init();
    }
    
    init() {
        this.renderer.setSize(this.size, this.size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 12;
        
        this.createGlobe();
        this.createAtmosphere();
        this.createPins();
        this.animate();
    }
    
    createGlobe() {
        const geometry = new THREE.SphereGeometry(4, 64, 64);
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg', (texture) => {
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                shininess: 5
            });
            this.globe = new THREE.Mesh(geometry, material);
            this.scene.add(this.globe);
        });
        
        // Fallback while loading
        const fallbackMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            shininess: 5
        });
        this.globe = new THREE.Mesh(geometry, fallbackMaterial);
        this.scene.add(this.globe);
        
        // Lighting
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 3, 5);
        this.scene.add(light);
        
        const blueLight = new THREE.PointLight(0x3b82f6, 0.5, 50);
        blueLight.position.set(-5, 0, 5);
        this.scene.add(blueLight);
    }
    
    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(4.2, 64, 64);
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
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 0.4) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        this.scene.add(new THREE.Mesh(geometry, material));
    }
    
    createPins() {
        this.locations.forEach((loc, index) => {
            const phi = (90 - loc.lat) * (Math.PI / 180);
            const theta = (loc.lng + 180) * (Math.PI / 180);
            
            const x = -4 * Math.sin(phi) * Math.cos(theta);
            const y = 4 * Math.cos(phi);
            const z = 4 * Math.sin(phi) * Math.sin(theta);
            
            // Pin dot
            const dotGeo = new THREE.SphereGeometry(0.08, 16, 16);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(x, y, z);
            
            // Glow
            const glowGeo = new THREE.SphereGeometry(0.12, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({ 
                color: 0x00d4ff, 
                transparent: true, 
                opacity: 0.4 
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.set(x, y, z);
            
            this.scene.add(dot);
            this.scene.add(glow);
            
            this.pins.push({ dot, glow, index });
        });
    }
    
    rotateTo(index) {
        const loc = this.locations[index];
        if (!loc) return;
        
        const targetRotation = (loc.lng + 90) * (Math.PI / 180);
        
        gsap.to(this, {
            rotation: targetRotation,
            duration: 1.5,
            ease: 'power2.out'
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.rotation += 0.001;
        
        if (this.globe) {
            this.globe.rotation.y = this.rotation;
        }
        
        // Animate pin glow
        const time = Date.now() * 0.001;
        this.pins.forEach((pin, i) => {
            const pulse = Math.sin(time * 2 + i * 0.5) * 0.3 + 0.7;
            pin.glow.material.opacity = 0.3 * pulse;
            pin.glow.scale.setScalar(1 + (pulse - 0.7) * 0.5);
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero content
    gsap.from('.hero-label', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.2
    });
    
    gsap.from('.hero-title .line', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        delay: 0.4
    });
    
    gsap.from('.hero-description', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.7
    });
    
    gsap.from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.9
    });
    
    gsap.from('.hero-globe', {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        delay: 0.3,
        ease: 'power2.out'
    });
    
    // Section animations
    const sections = ['.journey-section', '.work-section', '.about-section', '.contact-section'];
    
    sections.forEach(section => {
        gsap.from(`${section} .section-label`, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%'
            },
            y: 20,
            opacity: 0,
            duration: 0.8
        });
        
        gsap.from(`${section} .section-title`, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%'
            },
            y: 40,
            opacity: 0,
            duration: 1,
            delay: 0.1
        });
    });
    
    // Work cards
    gsap.from('.work-card', {
        scrollTrigger: {
            trigger: '.work-grid',
            start: 'top 80%'
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15
    });
    
    // Location items
    gsap.from('.location', {
        scrollTrigger: {
            trigger: '.journey-locations',
            start: 'top 80%'
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08
    });
    
    // Interest tags
    gsap.from('.interest-tag, .skill-tag', {
        scrollTrigger: {
            trigger: '.about-interests',
            start: 'top 80%'
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05
    });
    
    // Contact section
    gsap.from('.contact-title', {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 70%'
        },
        y: 50,
        opacity: 0,
        duration: 1
    });
    
    gsap.from('.contact-email', {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 60%'
        },
        y: 30,
        opacity: 0,
        duration: 0.8
    });
}

// ==========================================
// LOCATION HOVER EFFECTS
// ==========================================
function initLocationHovers(journeyGlobe) {
    const locations = document.querySelectorAll('.location');
    
    locations.forEach((loc) => {
        loc.addEventListener('mouseenter', () => {
            const index = parseInt(loc.dataset.index);
            if (journeyGlobe) {
                journeyGlobe.rotateTo(index);
            }
            
            locations.forEach(l => l.classList.remove('active'));
            loc.classList.add('active');
        });
    });
}

// ==========================================
// SMOOTH SCROLL FOR NAV LINKS
// ==========================================
function initSmoothScroll() {
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
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Stars background
    new StarsBackground();
    
    // Globes
    new Globe('hero-globe', 550);
    const journeyGlobe = new Globe('journey-globe', 450);
    
    // Scroll animations
    initScrollAnimations();
    
    // Location hovers
    initLocationHovers(journeyGlobe);
    
    // Smooth scroll
    initSmoothScroll();
});