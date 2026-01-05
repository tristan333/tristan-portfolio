// ==========================================
// SPACE HUB - Three.js Background & Interactions
// ==========================================

class SpaceHub {
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
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Camera
        this.camera.position.z = 30;
        
        // Create scene elements
        this.createStars();
        this.createNebula();
        this.createShootingStars();
        
        // Event listeners
        this.addEventListeners();
        
        // Start animation
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
        
        const starsMaterial1 = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        this.stars1 = new THREE.Points(starsGeometry1, starsMaterial1);
        this.scene.add(this.stars1);
        
        // Layer 2 - Mid stars (slight color)
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
        
        const starsMaterial2 = new THREE.PointsMaterial({
            color: 0x88ccff,
            size: 0.15,
            transparent: true,
            opacity: 0.6
        });
        
        this.stars2 = new THREE.Points(starsGeometry2, starsMaterial2);
        this.scene.add(this.stars2);
        
        // Layer 3 - Close bright stars
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
        
        const starsMaterial3 = new THREE.PointsMaterial({
            color: 0x00d4ff,
            size: 0.25,
            transparent: true,
            opacity: 0.7
        });
        
        this.stars3 = new THREE.Points(starsGeometry3, starsMaterial3);
        this.scene.add(this.stars3);
    }
    
    createNebula() {
        // Create subtle nebula clouds using sprites
        const nebulaColors = [0x7B2FFE, 0x00d4ff, 0x1a0a2e];
        
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
        // Pool of shooting stars
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0
            });
            
            const line = new THREE.Line(geometry, material);
            line.visible = false;
            this.scene.add(line);
            
            this.shootingStars.push({
                line,
                active: false,
                progress: 0,
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0
            });
        }
        
        // Trigger shooting stars randomly
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
        
        // Schedule next shooting star
        setTimeout(() => this.triggerShootingStar(), 3000 + Math.random() * 5000);
    }
    
    updateShootingStars() {
        this.shootingStars.forEach(star => {
            if (!star.active) return;
            
            star.progress += 0.03;
            
            const positions = star.line.geometry.attributes.position.array;
            const headProgress = Math.min(star.progress, 1);
            const tailProgress = Math.max(star.progress - 0.3, 0);
            
            // Head position
            positions[0] = star.startX + (star.endX - star.startX) * headProgress;
            positions[1] = star.startY + (star.endY - star.startY) * headProgress;
            positions[2] = -20;
            
            // Tail position
            positions[3] = star.startX + (star.endX - star.startX) * tailProgress;
            positions[4] = star.startY + (star.endY - star.startY) * tailProgress;
            positions[5] = -20;
            
            star.line.geometry.attributes.position.needsUpdate = true;
            
            // Fade in/out
            if (star.progress < 0.3) {
                star.line.material.opacity = star.progress / 0.3;
            } else if (star.progress > 0.7) {
                star.line.material.opacity = 1 - (star.progress - 0.7) / 0.3;
            } else {
                star.line.material.opacity = 1;
            }
            
            // Reset when complete
            if (star.progress >= 1.3) {
                star.active = false;
                star.line.visible = false;
            }
        });
    }
    
    addEventListeners() {
        // Mouse move for parallax
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Smooth parallax
        this.targetX += (this.mouseX - this.targetX) * 0.05;
        this.targetY += (this.mouseY - this.targetY) * 0.05;
        
        // Move star layers at different speeds (parallax)
        this.stars1.rotation.y = this.targetX * 0.05;
        this.stars1.rotation.x = this.targetY * 0.05;
        
        this.stars2.rotation.y = this.targetX * 0.1;
        this.stars2.rotation.x = this.targetY * 0.1;
        
        this.stars3.rotation.y = this.targetX * 0.15;
        this.stars3.rotation.x = this.targetY * 0.15;
        
        // Slow rotation
        this.stars1.rotation.z += 0.0001;
        this.stars2.rotation.z += 0.00015;
        
        // Update shooting stars
        this.updateShootingStars();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// ==========================================
// MODAL HANDLING
// ==========================================
class ModalHandler {
    constructor() {
        this.modals = {
            projects: document.getElementById('projects-modal'),
            interests: document.getElementById('interests-modal'),
            resume: document.getElementById('resume-modal')
        };
        
        this.init();
    }
    
    init() {
        // Nav object clicks
        document.getElementById('nav-projects').addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('projects');
        });
        
        document.getElementById('nav-interests').addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('interests');
        });
        
        document.getElementById('nav-resume').addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('resume');
        });
        
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Click outside to close
        Object.values(this.modals).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    openModal(name) {
        this.closeAllModals();
        this.modals[name].classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeAllModals() {
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
}

// ==========================================
// GSAP ANIMATIONS
// ==========================================
function initAnimations() {
    // Stagger nav objects
    gsap.fromTo('.nav-object', 
        { opacity: 0, y: 50 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 1,
            stagger: 0.15,
            ease: 'power2.out',
            delay: 0.5
        }
    );
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    new SpaceHub();
    new ModalHandler();
    initAnimations();
});