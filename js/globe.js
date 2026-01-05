// ==========================================
// 3D INTERACTIVE GLOBE - Three.js (Earth Texture)
// ==========================================

class Globe {
    constructor() {
        this.container = document.getElementById('globe-container');
        this.canvas = document.getElementById('globe');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true, 
            alpha: true 
        });
        
        // Globe properties
        this.radius = 5;
        this.segments = 128;
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.autoRotate = true;
        this.autoRotateSpeed = 0.0008;
        
        // Locations data - your journey
        this.locations = [
            { name: 'New York', lat: 40.7128, lng: -74.0060, color: 0x00d4ff },
            { name: 'Tashkent', lat: 41.2995, lng: 69.2401, color: 0x00d4ff },
            { name: 'Rabat', lat: 34.0209, lng: -6.8416, color: 0x00d4ff },
            { name: 'Bangkok', lat: 13.7563, lng: 100.5018, color: 0x00d4ff },
            { name: 'Berlin', lat: 52.5200, lng: 13.4050, color: 0x00d4ff },
            { name: 'Beirut', lat: 33.8938, lng: 35.5018, color: 0x00d4ff },
            { name: 'San Francisco', lat: 37.7749, lng: -122.4194, color: 0x00d4ff },
            { name: 'Hannover', lat: 52.3759, lng: 9.7320, color: 0x00d4ff },
            { name: 'Granville', lat: 40.0681, lng: -82.5193, color: 0x00d4ff }
        ];
        
        this.pins = [];
        this.globeGroup = new THREE.Group();
        this.texturesLoaded = false;
        
        this.init();
    }
    
    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Camera position
        this.camera.position.z = 15;
        
        // Add globe group to scene
        this.scene.add(this.globeGroup);
        
        // Create elements
        this.createStars();
        this.createGlobe();
        this.createAtmosphere();
        this.createPins();
        
        // Event listeners
        this.addEventListeners();
        
        // Start animation loop
        this.animate();
    }
    
    createGlobe() {
        const geometry = new THREE.SphereGeometry(this.radius, this.segments, this.segments);
        
        // Texture loader
        const textureLoader = new THREE.TextureLoader();
        
        // Load Earth textures from CDN
        const earthTexture = textureLoader.load(
            'https://unpkg.com/three-globe/example/img/earth-night.jpg',
            () => { this.texturesLoaded = true; }
        );
        
        // Load bump map for terrain depth
        const bumpTexture = textureLoader.load(
            'https://unpkg.com/three-globe/example/img/earth-topology.png'
        );
        
        // Create material with dark Earth texture
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.1,
            shininess: 5,
            transparent: false,
            opacity: 1
        });
        
        this.globe = new THREE.Mesh(geometry, material);
        this.globeGroup.add(this.globe);
        
        // Add a subtle cyan wireframe overlay
        const wireframeGeometry = new THREE.SphereGeometry(this.radius + 0.02, 48, 48);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: 0.03
        });
        this.wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.globeGroup.add(this.wireframe);
        
        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Main light - simulates sun
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 5, 10);
        this.scene.add(sunLight);
        
        // Accent light - cyan tint
        const accentLight = new THREE.PointLight(0x00d4ff, 0.5, 50);
        accentLight.position.set(-10, 0, 10);
        this.scene.add(accentLight);
        
        // Back light for rim effect
        const backLight = new THREE.PointLight(0x4a00e0, 0.3, 50);
        backLight.position.set(0, 0, -15);
        this.scene.add(backLight);
    }
    
    createAtmosphere() {
        // Inner atmosphere glow
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
        
        // Outer glow
        const outerGlowGeometry = new THREE.SphereGeometry(this.radius + 0.4, 64, 64);
        const outerGlowMaterial = new THREE.ShaderMaterial({
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
                    float intensity = pow(0.4 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.0, 0.6, 1.0, 0.4) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        this.globeGroup.add(outerGlow);
    }
    
    createStars() {
        // Main star field
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        
        for (let i = 0; i < 4000; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            
            if (Math.sqrt(x*x + y*y + z*z) > 30) {
                starsVertices.push(x, y, z);
            }
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.08,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
        
        // Accent colored stars
        const accentStarsGeometry = new THREE.BufferGeometry();
        const accentStarsVertices = [];
        
        for (let i = 0; i < 150; i++) {
            const x = (Math.random() - 0.5) * 350;
            const y = (Math.random() - 0.5) * 350;
            const z = (Math.random() - 0.5) * 350;
            
            if (Math.sqrt(x*x + y*y + z*z) > 35) {
                accentStarsVertices.push(x, y, z);
            }
        }
        
        accentStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(accentStarsVertices, 3));
        
        const accentStarsMaterial = new THREE.PointsMaterial({
            color: 0x00d4ff,
            size: 0.12,
            transparent: true,
            opacity: 0.5
        });
        
        this.accentStars = new THREE.Points(accentStarsGeometry, accentStarsMaterial);
        this.scene.add(this.accentStars);
    }
    
    createPins() {
        this.locations.forEach((location, index) => {
            const pin = this.createPin(location, index);
            this.pins.push({ mesh: pin, data: location, index });
        });
    }
        
    createPin(location, index) {
        const group = new THREE.Group();
        
        // Convert lat/lng to 3D position
        const position = this.latLngToVector3(location.lat, location.lng);
        
        // Main dot
        const dotGeometry = new THREE.SphereGeometry(0.08, 32, 32);
        const dotMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00d4ff,
            transparent: true,
            opacity: 1
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        group.add(dot);
        
        // Inner glow
        const innerGlowGeometry = new THREE.SphereGeometry(0.12, 32, 32);
        const innerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.4
        });
        const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
        group.add(innerGlow);
        
        // Outer pulsing glow
        const outerGlowGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.2
        });
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        group.add(outerGlow);
        
        // Store for animations
        group.userData = {
            dot,
            innerGlow,
            outerGlow
        };
        
        // Position on globe surface
        group.position.copy(position);
        
        this.globeGroup.add(group);
        return group;
    }    
    
    latLngToVector3(lat, lng) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        const x = -this.radius * Math.sin(phi) * Math.cos(theta);
        const y = this.radius * Math.cos(phi);
        const z = this.radius * Math.sin(phi) * Math.sin(theta);
        
        return new THREE.Vector3(x, y, z);
    }
    
    addEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
        
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
        window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
        window.addEventListener('touchend', () => this.onTouchEnd());
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.autoRotate = false;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        
        this.rotation.y += deltaX * 0.005;
        this.rotation.x += deltaY * 0.005;
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
    
    onMouseUp() {
        this.isDragging = false;
        setTimeout(() => {
            if (!this.isDragging) this.autoRotate = true;
        }, 3000);
    }
    
    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.autoRotate = false;
            this.previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        }
    }
    
    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;
        
        this.rotation.y += deltaX * 0.005;
        this.rotation.x += deltaY * 0.005;
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        
        this.previousMousePosition = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    }
    
    onTouchEnd() {
        this.isDragging = false;
        setTimeout(() => {
            if (!this.isDragging) this.autoRotate = true;
        }, 3000);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    rotateTo(lat, lng, duration = 1.5) {
        this.autoRotate = false;
        
        const targetY = -lng * (Math.PI / 180) - Math.PI / 2;
        const targetX = lat * (Math.PI / 180) * 0.3;
        
        if (typeof gsap !== 'undefined') {
            gsap.to(this.rotation, {
                x: targetX,
                y: targetY,
                duration: duration,
                ease: 'power2.out'
            });
        }
    }
    
    highlightPin(index) {
        this.pins.forEach((pin, i) => {
            const isActive = i === index;
            const targetScale = isActive ? 2 : 1;
            const targetOpacity = isActive ? 0.5 : 0.2;
            
            if (typeof gsap !== 'undefined') {
                gsap.to(pin.mesh.scale, { 
                    x: targetScale, 
                    y: targetScale, 
                    z: targetScale, 
                    duration: 0.5,
                    ease: 'back.out(1.7)'
                });
                gsap.to(pin.mesh.userData.outerGlow.material, { 
                    opacity: targetOpacity, 
                    duration: 0.5 
                });
            }
        });
    }    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.autoRotate) {
            this.rotation.y += this.autoRotateSpeed;
        }
        
        // Apply rotation
        this.globeGroup.rotation.x = this.rotation.x;
        this.globeGroup.rotation.y = this.rotation.y;
        
        // Animate pins - pulsing effect
        const time = Date.now() * 0.001;
        this.pins.forEach((pin, i) => {
            const outerGlow = pin.mesh.userData.outerGlow;
            const innerGlow = pin.mesh.userData.innerGlow;
            
            if (outerGlow) {
                const pulse = Math.sin(time * 2.5 + i * 0.8) * 0.5 + 0.5;
                outerGlow.scale.setScalar(1 + pulse * 0.5);
                outerGlow.material.opacity = 0.15 + pulse * 0.1;
            }
            
            if (innerGlow) {
                const pulse = Math.sin(time * 2.5 + i * 0.8 + 0.5) * 0.5 + 0.5;
                innerGlow.material.opacity = 0.3 + pulse * 0.2;
            }
        });   
        
        // Rotate stars slowly
        this.stars.rotation.y += 0.00008;
        this.accentStars.rotation.y -= 0.0001;
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
let globe;
document.addEventListener('DOMContentLoaded', () => {
    globe = new Globe();
});