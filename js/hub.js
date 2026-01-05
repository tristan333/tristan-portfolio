// ==========================================
// SPACE HUB - Three.js with Mini Globe & Zoom
// ==========================================

class SpaceBackground {
    constructor() {
        this.canvas = document.getElementById('space-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.shootingStars = [];
        
        this.init();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 30;
        
        this.createStars();
        this.createNebula();
        this.createShootingStars();
        this.addEventListeners();
        this.animate();
    }
    
    createStars() {
        // Layer 1 - Distant stars
        const starsGeometry1 = new THREE.BufferGeometry();
        const starsVertices1 = [];
        
        for (let i = 0; i < 3000; i++) {
            starsVertices1.push(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 100 - 50
            );
        }
        
        starsGeometry1.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices1, 3));
        const starsMaterial1 = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
        this.stars1 = new THREE.Points(starsGeometry1, starsMaterial1);
        this.scene.add(this.stars1);
        
        // Layer 2
        const starsGeometry2 = new THREE.BufferGeometry();
        const starsVertices2 = [];
        
        for (let i = 0; i < 1000; i++) {
            starsVertices2.push(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 80 - 30
            );
        }
        
        starsGeometry2.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices2, 3));
        const starsMaterial2 = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.15, transparent: true, opacity: 0.6 });
        this.stars2 = new THREE.Points(starsGeometry2, starsMaterial2);
        this.scene.add(this.stars2);
        
        // Layer 3
        const starsGeometry3 = new THREE.BufferGeometry();
        const starsVertices3 = [];
        
        for (let i = 0; i < 200; i++) {
            starsVertices3.push(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 50 - 10
            );
        }
        
        starsGeometry3.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices3, 3));
        const starsMaterial3 = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.25, transparent: true, opacity: 0.7 });
        this.stars3 = new THREE.Points(starsGeometry3, starsMaterial3);
        this.scene.add(this.stars3);
    }
    
    createNebula() {
        for (let i = 0; i < 5; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(123, 47, 254, 0.15)');
            gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            
            const sprite = new THREE.Sprite(material);
            sprite.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                -50 + Math.random() * 20
            );
            sprite.scale.setScalar(30 + Math.random() * 40);
            this.scene.add(sprite);
        }
    }
    
    createShootingStars() {
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0 });
            const line = new THREE.Line(geometry, material);
            line.visible = false;
            this.scene.add(line);
            
            this.shootingStars.push({ line, active: false, progress: 0, startX: 0, startY: 0, endX: 0, endY: 0 });
        }
        
        this.triggerShootingStar();
    }
    
    triggerShootingStar() {
        const inactiveStar = this.shootingStars.find(s => !s.active);
        
        if (inactiveStar) {
            inactiveStar.active = true;
            inactiveStar.progress = 0;
            inactiveStar.startX = (Math.random() - 0.5) * 60;
            inactiveStar.startY = 20 + Math.random() * 20;
            inactiveStar.endX = inactiveStar.startX + 30 + Math.random() * 20;
            inactiveStar.endY = inactiveStar.startY - 30 - Math.random() * 20;
            inactiveStar.line.visible = true;
        }
        
        setTimeout(() => this.triggerShootingStar(), 3000 + Math.random() * 5000);
    }
    
    updateShootingStars() {
        this.shootingStars.forEach(star => {
            if (!star.active) return;
            
            star.progress += 0.03;
            
            const positions = star.line.geometry.attributes.position.array;
            const headProgress = Math.min(star.progress, 1);
            const tailProgress = Math.max(star.progress - 0.3, 0);
            
            positions[0] = star.startX + (star.endX - star.startX) * headProgress;
            positions[1] = star.startY + (star.endY - star.startY) * headProgress;
            positions[2] = -20;
            positions[3] = star.startX + (star.endX - star.startX) * tailProgress;
            positions[4] = star.startY + (star.endY - star.startY) * tailProgress;
            positions[5] = -20;
            
            star.line.geometry.attributes.position.needsUpdate = true;
            
            if (star.progress < 0.3) {
                star.line.material.opacity = star.progress / 0.3;
            } else if (star.progress > 0.7) {
                star.line.material.opacity = 1 - (star.progress - 0.7) / 0.3;
            } else {
                star.line.material.opacity = 1;
            }
            
            if (star.progress >= 1.3) {
                star.active = false;
                star.line.visible = false;
            }
        });
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
        
        this.targetX += (this.mouseX - this.targetX) * 0.05;
        this.targetY += (this.mouseY - this.targetY) * 0.05;
        
        this.stars1.rotation.y = this.targetX * 0.05;
        this.stars1.rotation.x = this.targetY * 0.05;
        this.stars2.rotation.y = this.targetX * 0.1;
        this.stars2.rotation.x = this.targetY * 0.1;
        this.stars3.rotation.y = this.targetX * 0.15;
        this.stars3.rotation.x = this.targetY * 0.15;
        
        this.stars1.rotation.z += 0.0001;
        this.stars2.rotation.z += 0.00015;
        
        this.updateShootingStars();
        this.renderer.render(this.scene, this.camera);
    }
}

// ==========================================
// MINI GLOBE
// ==========================================
class MiniGlobe {
    constructor() {
        this.wrapper = document.getElementById('globe-wrapper');
        this.canvas = document.getElementById('mini-globe');
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        
        this.radius = 5;
        this.autoRotate = true;
        this.rotation = { x: 0, y: 0 };
        
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
        
        this.isJourneyMode = false;
        
        this.init();
    }
    
    init() {
        this.updateSize();
        this.camera.position.z = 15;
        
        this.scene.add(this.globeGroup);
        
        this.createGlobe();
        this.createAtmosphere();
        this.createPins();
        
        this.addEventListeners();
        this.animate();
    }
    
    updateSize() {
        const size = this.wrapper.offsetWidth;
        this.renderer.setSize(size, size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
        const wireframeGeometry = new THREE.SphereGeometry(this.radius + 0.02, 48, 48);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: 0.03
        });
        this.wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.globeGroup.add(this.wireframe);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 5, 10);
        this.scene.add(sunLight);
        
        const accentLight = new THREE.PointLight(0x00d4ff, 0.5, 50);
        accentLight.position.set(-10, 0, 10);
        this.scene.add(accentLight);
    }
    
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.radius + 0.15, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
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
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.globeGroup.add(this.atmosphere);
    }
    
    createPins() {
        this.locations.forEach((location) => {
            const pin = this.createPin(location);
            this.pins.push({ mesh: pin, data: location });
        });
    }
    
    createPin(location) {
        const group = new THREE.Group();
        const position = this.latLngToVector3(location.lat, location.lng);
        
        // Dot
        const dotGeometry = new THREE.SphereGeometry(0.08, 32, 32);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 1 });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        group.add(dot);
        
        // Glow
        const glowGeometry = new THREE.SphereGeometry(0.15, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
        
        group.userData = { glow };
        group.position.copy(position);
        
        this.globeGroup.add(group);
        return group;
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
    
    addEventListeners() {
        window.addEventListener('resize', () => this.updateSize());
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
            const targetScale = isActive ? 2 : 1;
            const targetOpacity = isActive ? 0.5 : 0.3;
            
            gsap.to(pin.mesh.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.5, ease: 'back.out(1.7)' });
            gsap.to(pin.mesh.userData.glow.material, { opacity: targetOpacity, duration: 0.5 });
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.autoRotate && !this.isJourneyMode) {
            this.rotation.y += 0.002;
        } else if (this.autoRotate && this.isJourneyMode) {
            this.rotation.y += 0.0005;
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
// PAGE CONTROLLER
// ==========================================
class PageController {
    constructor(globe) {
        this.globe = globe;
        this.globeWrapper = document.getElementById('globe-wrapper');
        this.hubView = document.getElementById('hub-view');
        this.journeyView = document.getElementById('journey-view');
        this.isJourneyActive = false;
        
        this.init();
    }
    
    init() {
        // Globe click
        this.globeWrapper.addEventListener('click', () => {
            if (!this.isJourneyActive) {
                this.enterJourney();
            }
        });
        
        // Back buttons
        document.getElementById('back-to-hub').addEventListener('click', () => this.exitJourney());
        document.getElementById('back-to-hub-bottom').addEventListener('click', () => this.exitJourney());
        
        // Modal handlers
        this.setupModals();
        
        // Scroll animations for journey
        this.setupScrollAnimations();
    }
    
    enterJourney() {
        this.isJourneyActive = true;
        this.globe.isJourneyMode = true;
        
        // Hide hub
        this.hubView.classList.add('hidden');
        
        // Zoom globe
        this.globeWrapper.classList.add('zooming');
        
        gsap.to(this.globeWrapper, {
            top: '50%',
            left: '50%',
            xPercent: -50,
            yPercent: -50,
            width: '100vmax',
            height: '100vmax',
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
                this.globeWrapper.classList.remove('zooming');
                this.globeWrapper.classList.add('journey-mode');
                
                // Reset to fixed position for journey
                gsap.set(this.globeWrapper, {
                    top: 0,
                    left: 0,
                    xPercent: 0,
                    yPercent: 0,
                    width: '100%',
                    height: '100%'
                });
                
                // Show journey content
                this.journeyView.classList.add('active');
                document.body.classList.add('journey-active');
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Init scroll triggers
                this.initJourneyScrollTriggers();
            }
        });
    }
    
    exitJourney() {
        this.isJourneyActive = false;
        this.globe.isJourneyMode = false;
        this.globe.autoRotate = true;
        
        // Hide journey
        this.journeyView.classList.remove('active');
        document.body.classList.remove('journey-active');
        
        // Kill scroll triggers
        ScrollTrigger.getAll().forEach(st => st.kill());
        
        // Reset globe position
        this.globeWrapper.classList.remove('journey-mode');
        
        gsap.to(this.globeWrapper, {
            top: '50%',
            left: '50%',
            xPercent: -50,
            yPercent: -50,
            x: -180,
            y: 0,
            width: 200,
            height: 200,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.set(this.globeWrapper, { clearProps: 'all' });
                this.hubView.classList.remove('hidden');
            }
        });
        
        // Reset content panels
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('visible');
        });
    }
    
    initJourneyScrollTriggers() {
        gsap.registerPlugin(ScrollTrigger);
        
        const sections = document.querySelectorAll('.country-section');
        const navDots = document.querySelectorAll('.nav-dot');
        const progressBar = document.getElementById('progress-bar');
        
        // Progress bar
        ScrollTrigger.create({
            trigger: '#journey-sections',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                progressBar.style.width = `${self.progress * 100}%`;
            }
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
                    this.globe.rotateTo(lat, lng);
                    this.globe.highlightPin(index);
                    panel.classList.add('visible');
                    this.updateNavDots(navDots, index);
                },
                onEnterBack: () => {
                    this.globe.rotateTo(lat, lng);
                    this.globe.highlightPin(index);
                    panel.classList.add('visible');
                    this.updateNavDots(navDots, index);
                },
                onLeave: () => panel.classList.remove('visible'),
                onLeaveBack: () => panel.classList.remove('visible')
            });
        });
        
        // Nav dot clicks
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const sectionIds = ['new-york', 'tashkent', 'rabat', 'bangkok', 'berlin', 'beirut', 'san-francisco', 'hannover', 'granville'];
                const section = document.getElementById(sectionIds[index]);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
        
        // Globe fade on today section
        ScrollTrigger.create({
            trigger: '#today',
            start: 'top 50%',
            end: 'top 20%',
            scrub: true,
            onUpdate: (self) => {
                this.globeWrapper.style.opacity = 1 - self.progress;
            }
        });
    }
    
    updateNavDots(navDots, activeIndex) {
        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }
    
    setupScrollAnimations() {
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
    }
    
    setupModals() {
        const modals = {
            projects: document.getElementById('projects-modal'),
            interests: document.getElementById('interests-modal'),
            resume: document.getElementById('resume-modal')
        };
        
        document.getElementById('nav-projects').addEventListener('click', (e) => {
            e.preventDefault();
            modals.projects.classList.add('active');
        });
        
        document.getElementById('nav-interests').addEventListener('click', (e) => {
            e.preventDefault();
            modals.interests.classList.add('active');
        });
        
        document.getElementById('nav-resume').addEventListener('click', (e) => {
            e.preventDefault();
            modals.resume.classList.add('active');
        });
        
        // Globe project card
        document.getElementById('globe-project-card').addEventListener('click', () => {
            modals.projects.classList.remove('active');
            this.enterJourney();
        });
        
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                Object.values(modals).forEach(m => m.classList.remove('active'));
            });
        });
        
        // Click outside
        Object.values(modals).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Object.values(modals).forEach(m => m.classList.remove('active'));
            }
        });
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    new SpaceBackground();
    const globe = new MiniGlobe();
    new PageController(globe);
    
    // Animate nav items
    gsap.fromTo('.nav-object:not(#nav-earth-placeholder)', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power2.out', delay: 0.5 }
    );
    
    gsap.fromTo('#globe-wrapper',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', delay: 0.3 }
    );
});