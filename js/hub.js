// ==========================================
// SPACE HUB - Clean Implementation
// ==========================================

// ==========================================
// SPACE BACKGROUND
// ==========================================
class SpaceBackground {
    constructor() {
        this.canvas = document.getElementById('space-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 30;
        
        this.createStars();
        this.addEventListeners();
        this.animate();
    }
    
    createStars() {
        // Layer 1
        const geo1 = new THREE.BufferGeometry();
        const verts1 = [];
        for (let i = 0; i < 2000; i++) {
            verts1.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100 - 50);
        }
        geo1.setAttribute('position', new THREE.Float32BufferAttribute(verts1, 3));
        this.stars1 = new THREE.Points(geo1, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 }));
        this.scene.add(this.stars1);
        
        // Layer 2
        const geo2 = new THREE.BufferGeometry();
        const verts2 = [];
        for (let i = 0; i < 500; i++) {
            verts2.push((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 80 - 30);
        }
        geo2.setAttribute('position', new THREE.Float32BufferAttribute(verts2, 3));
        this.stars2 = new THREE.Points(geo2, new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.2, transparent: true, opacity: 0.6 }));
        this.scene.add(this.stars2);
    }
    
    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.stars1.rotation.y += (this.mouseX * 0.05 - this.stars1.rotation.y) * 0.05;
        this.stars1.rotation.x += (this.mouseY * 0.05 - this.stars1.rotation.x) * 0.05;
        this.stars2.rotation.y += (this.mouseX * 0.1 - this.stars2.rotation.y) * 0.05;
        this.stars2.rotation.x += (this.mouseY * 0.1 - this.stars2.rotation.x) * 0.05;
        
        this.stars1.rotation.z += 0.0001;
        
        this.renderer.render(this.scene, this.camera);
    }
}

// ==========================================
// GLOBE CLASS (Reusable)
// ==========================================
class Globe {
    constructor(canvas, size = 220) {
        this.canvas = canvas;
        this.size = size;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        
        this.radius = 5;
        this.rotation = { x: 0, y: 0 };
        this.autoRotate = true;
        this.autoRotateSpeed = 0.002;
        
        this.locations = [
            { name: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: 'Tashkent', lat: 41.2995, lng: 69.2401 },
            { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
            { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
            { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
            { name: 'Beirut', lat: 33.8938, lng: 35.5018 },
            { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
            { name: 'Hannover', lat: 52.3759, lng: 9.7320 },
            { name: 'Granville', lat: 40.0681, lng: -82.5193 }
        ];
        
        this.pins = [];
        this.globeGroup = new THREE.Group();
        
        this.init();
    }
    
    init() {
        this.renderer.setSize(this.size, this.size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 15;
        
        this.scene.add(this.globeGroup);
        
        this.createGlobe();
        this.createAtmosphere();
        this.createPins();
        
        this.animate();
    }
    
    resize(newSize) {
        this.size = newSize;
        this.renderer.setSize(this.size, this.size);
    }
    
    createGlobe() {
        const geometry = new THREE.SphereGeometry(this.radius, 128, 128);
        const textureLoader = new THREE.TextureLoader();
        
        const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg');
        const bumpTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
        
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.1,
            shininess: 5
        });
        
        this.globe = new THREE.Mesh(geometry, material);
        this.globeGroup.add(this.globe);
        
        // Wireframe
        const wireframeGeo = new THREE.SphereGeometry(this.radius + 0.02, 48, 48);
        const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.03 });
        this.globeGroup.add(new THREE.Mesh(wireframeGeo, wireframeMat));
        
        // Lighting
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 5, 10);
        this.scene.add(sunLight);
        const accentLight = new THREE.PointLight(0x00d4ff, 0.5, 50);
        accentLight.position.set(-10, 0, 10);
        this.scene.add(accentLight);
    }
    
    createAtmosphere() {
        const atmosphereGeo = new THREE.SphereGeometry(this.radius + 0.15, 64, 64);
        const atmosphereMat = new THREE.ShaderMaterial({
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
                    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.0, 0.83, 1.0, 1.0) * intensity * 0.8;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        this.globeGroup.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));
    }
    
    createPins() {
        this.locations.forEach((loc) => {
            const group = new THREE.Group();
            const pos = this.latLngToVector3(loc.lat, loc.lng);
            
            const dotGeo = new THREE.SphereGeometry(0.08, 32, 32);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
            group.add(new THREE.Mesh(dotGeo, dotMat));
            
            const glowGeo = new THREE.SphereGeometry(0.15, 32, 32);
            const glowMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            group.add(glow);
            
            group.userData = { glow };
            group.position.copy(pos);
            
            this.globeGroup.add(group);
            this.pins.push({ mesh: group, data: loc });
        });
    }
    
    latLngToVector3(lat, lng) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -this.radius * Math.sin(phi) * Math.cos(theta),
            this.radius * Math.cos(phi),
            this.radius * Math.sin(phi) * Math.sin(theta)
        );
    }
    
    rotateTo(lat, lng, duration = 1.5) {
        this.autoRotate = false;
        const targetY = -lng * (Math.PI / 180) - Math.PI / 2;
        const targetX = lat * (Math.PI / 180) * 0.3;
        
        gsap.to(this.rotation, {
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'power2.out'
        });
    }
    
    highlightPin(index) {
        this.pins.forEach((pin, i) => {
            const isActive = i === index;
            gsap.to(pin.mesh.scale, { x: isActive ? 2 : 1, y: isActive ? 2 : 1, z: isActive ? 2 : 1, duration: 0.5, ease: 'back.out(1.7)' });
            gsap.to(pin.mesh.userData.glow.material, { opacity: isActive ? 0.5 : 0.3, duration: 0.5 });
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.autoRotate) {
            this.rotation.y += this.autoRotateSpeed;
        }
        
        this.globeGroup.rotation.x = this.rotation.x;
        this.globeGroup.rotation.y = this.rotation.y;
        
        // Animate pins
        const time = Date.now() * 0.001;
        this.pins.forEach((pin, i) => {
            const glow = pin.mesh.userData.glow;
            if (glow) {
                const pulse = Math.sin(time * 2.5 + i * 0.8) * 0.5 + 0.5;
                glow.scale.setScalar(1 + pulse * 0.5);
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// ==========================================
// APP CONTROLLER
// ==========================================
class App {
    constructor() {
        this.hubView = document.getElementById('hub-view');
        this.journeyView = document.getElementById('journey-view');
        this.isJourneyActive = false;
        
        // Create globes
        this.miniGlobe = new Globe(document.getElementById('mini-globe'), 220);
        this.journeyGlobe = null;
        
        this.init();
    }
    
    init() {
        // Globe click -> enter journey
        document.getElementById('globe-container').addEventListener('click', () => this.enterJourney());
        
        // Back buttons
        document.getElementById('back-to-hub').addEventListener('click', () => this.exitJourney());
        document.getElementById('back-to-hub-bottom').addEventListener('click', () => this.exitJourney());
        
        // Modals
        this.setupModals();
        
        // Animate in
        gsap.fromTo('#globe-container', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out', delay: 0.3 });
        gsap.fromTo('.nav-item', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.5 });
    }
    
    enterJourney() {
        if (this.isJourneyActive) return;
        this.isJourneyActive = true;
        
        // Animate out hub
        gsap.to(this.hubView, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                this.hubView.classList.add('hidden');
                
                // Show journey view
                this.journeyView.classList.add('active');
                document.body.classList.add('journey-active');
                
                // Create journey globe
                const journeyCanvas = document.getElementById('journey-globe');
                this.journeyGlobe = new Globe(journeyCanvas, window.innerWidth);
                this.journeyGlobe.autoRotateSpeed = 0.0005;
                
                // Handle resize for journey globe
                this.resizeHandler = () => {
                    if (this.journeyGlobe) {
                        this.journeyGlobe.resize(Math.max(window.innerWidth, window.innerHeight));
                    }
                };
                window.addEventListener('resize', this.resizeHandler);
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Setup scroll triggers
                this.setupScrollTriggers();
                
                // Fade in journey content
                gsap.fromTo('.hero-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.3 });
            }
        });
    }
    
    exitJourney() {
        if (!this.isJourneyActive) return;
        this.isJourneyActive = false;
        
        // Kill scroll triggers
        ScrollTrigger.getAll().forEach(st => st.kill());
        
        // Remove resize handler
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Hide journey
        this.journeyView.classList.remove('active');
        document.body.classList.remove('journey-active');
        
        // Clean up journey globe
        if (this.journeyGlobe) {
            this.journeyGlobe = null;
        }
        
        // Reset scroll
        window.scrollTo(0, 0);
        
        // Reset content panels
        document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('visible'));
        document.querySelectorAll('.nav-dot').forEach((dot, i) => dot.classList.toggle('active', i === 0));
        document.getElementById('progress-bar').style.width = '0%';
        document.getElementById('journey-globe-container').style.opacity = '1';
        
        // Show hub
        this.hubView.classList.remove('hidden');
        gsap.fromTo(this.hubView, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
    
    setupScrollTriggers() {
        gsap.registerPlugin(ScrollTrigger);
        
        const sections = document.querySelectorAll('.country-section');
        const navDots = document.querySelectorAll('.nav-dot');
        const progressBar = document.getElementById('progress-bar');
        const globeContainer = document.getElementById('journey-globe-container');
        
        // Progress bar
        ScrollTrigger.create({
            trigger: '#journey-sections',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                progressBar.style.width = `${self.progress * 100}%`;
            }
        });
        
        // Hero fade
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
        
        // Section animations
        sections.forEach((section, index) => {
            const panel = section.querySelector('.content-panel');
            const lat = parseFloat(section.dataset.lat);
            const lng = parseFloat(section.dataset.lng);
            
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => {
                    if (this.journeyGlobe) {
                        this.journeyGlobe.rotateTo(lat, lng);
                        this.journeyGlobe.highlightPin(index);
                    }
                    panel.classList.add('visible');
                    navDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
                },
                onEnterBack: () => {
                    if (this.journeyGlobe) {
                        this.journeyGlobe.rotateTo(lat, lng);
                        this.journeyGlobe.highlightPin(index);
                    }
                    panel.classList.add('visible');
                    navDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
                },
                onLeave: () => panel.classList.remove('visible'),
                onLeaveBack: () => panel.classList.remove('visible')
            });
        });
        
        // Nav dot clicks
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const sectionIds = ['new-york', 'tashkent', 'rabat', 'bangkok', 'berlin', 'beirut', 'san-francisco', 'hannover', 'granville'];
                document.getElementById(sectionIds[index])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
        
        // Globe fade on today section
        ScrollTrigger.create({
            trigger: '#today',
            start: 'top 60%',
            end: 'top 20%',
            scrub: true,
            onUpdate: (self) => {
                globeContainer.style.opacity = 1 - self.progress;
            }
        });
    }
    
    setupModals() {
        const modals = {
            projects: document.getElementById('projects-modal'),
            interests: document.getElementById('interests-modal'),
            resume: document.getElementById('resume-modal')
        };
        
        document.getElementById('nav-projects').addEventListener('click', (e) => { e.preventDefault(); modals.projects.classList.add('active'); });
        document.getElementById('nav-interests').addEventListener('click', (e) => { e.preventDefault(); modals.interests.classList.add('active'); });
        document.getElementById('nav-resume').addEventListener('click', (e) => { e.preventDefault(); modals.resume.classList.add('active'); });
        
        // Globe project card
        document.getElementById('globe-project-card').addEventListener('click', () => {
            modals.projects.classList.remove('active');
            setTimeout(() => this.enterJourney(), 100);
        });
        
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => Object.values(modals).forEach(m => m.classList.remove('active')));
        });
        
        // Click outside
        Object.values(modals).forEach(modal => {
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
        });
        
        // Escape
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') Object.values(modals).forEach(m => m.classList.remove('active')); });
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    new SpaceBackground();
    new App();
});