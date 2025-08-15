/**
 * MetalSlug-DGA Game Engine
 * A minimal Metal Slug-like game with physics, enemies, and shooting mechanics
 */

class MetalSlugGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 960;
        this.height = 540;
        
        // Game state
        this.gameState = 'playing'; // 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.ammo = Infinity;
        
        // Input handling
        this.keys = {};
        this.jumpBuffer = 0;
        this.coyoteTime = 0;
        
        // Game objects
        this.player = new Player(100, 400);
        this.bullets = [];
        this.enemies = [];
        this.spawners = [];
        this.terrain = [];
        
        // Camera
        this.camera = { x: 0, y: 0 };
        this.cameraLerp = 0.1;
        
        // Game timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Level data
        this.levelWidth = 3000;
        this.levelHeight = 540;
        
        this.initLevel();
        this.initSpawners();
        this.setupInput();
    }
    
    initLevel() {
        // Ground segments
        this.terrain = [
            { x: 0, y: 500, w: 3000, h: 40, kind: 'ground' },
            { x: 400, y: 400, w: 200, h: 20, kind: 'platform' },
            { x: 800, y: 350, w: 150, h: 20, kind: 'platform' },
            { x: 1200, y: 300, w: 200, h: 20, kind: 'platform' },
            { x: 1600, y: 400, w: 200, h: 20, kind: 'platform' },
            { x: 2000, y: 350, w: 150, h: 20, kind: 'platform' },
            { x: 2400, y: 400, w: 200, h: 20, kind: 'platform' },
            { x: 2800, y: 300, w: 200, h: 20, kind: 'platform' }
        ];
    }
    
    initSpawners() {
        this.spawners = [
            { x: 500, active: false, lastSpawn: 0 },
            { x: 900, active: false, lastSpawn: 0 },
            { x: 1300, active: false, lastSpawn: 0 },
            { x: 1700, active: false, lastSpawn: 0 },
            { x: 2100, active: false, lastSpawn: 0 },
            { x: 2500, active: false, lastSpawn: 0 }
        ];
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Jump buffering
            if (e.code === 'ArrowUp' || e.code === 'Space') {
                this.jumpBuffer = 0.1;
            }
            
            // Pause
            if (e.code === 'KeyP') {
                this.togglePause();
            }
            
            // Restart
            if (e.code === 'KeyR') {
                this.restart();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    restart() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.player = new Player(100, 400);
        this.bullets = [];
        this.enemies = [];
        this.spawners.forEach(spawner => {
            spawner.active = false;
            spawner.lastSpawn = 0;
        });
    }
    
    update(dt) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(dt, this.keys, this.terrain);
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(dt);
            return bullet.lifetime > 0;
        });
        
        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(dt, this.terrain);
            return enemy.health > 0;
        });
        
        // Check spawners
        this.updateSpawners();
        
        // Update camera
        this.updateCamera();
        
        // Check collisions
        this.checkCollisions();
        
        // Update input buffers
        this.updateInputBuffers(dt);
        
        // Handle shooting
        this.shoot();
    }
    
    updateInputBuffers(dt) {
        if (this.jumpBuffer > 0) {
            this.jumpBuffer -= dt;
        }
        if (this.coyoteTime > 0) {
            this.coyoteTime -= dt;
        }
    }
    
    updateSpawners() {
        this.spawners.forEach(spawner => {
            if (!spawner.active && this.camera.x + this.width > spawner.x) {
                spawner.active = true;
            }
            
            if (spawner.active && this.camera.x + this.width > spawner.x + 200) {
                spawner.active = false;
            }
            
            if (spawner.active && Date.now() - spawner.lastSpawn > 3000) {
                this.enemies.push(new Enemy(spawner.x, 460));
                spawner.lastSpawn = Date.now();
            }
        });
    }
    
    updateCamera() {
        const targetX = this.player.x - this.width / 2;
        this.camera.x += (targetX - this.camera.x) * this.cameraLerp;
        
        // Clamp camera to level bounds
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.levelWidth - this.width));
    }
    
    checkCollisions() {
        // Player vs enemies
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy)) {
                this.player.takeDamage();
                this.lives--;
                if (this.lives <= 0) {
                    this.gameState = 'gameOver';
                }
            }
        });
        
        // Bullets vs enemies
        this.bullets.forEach(bullet => {
            this.enemies.forEach(enemy => {
                if (this.checkCollision(bullet, enemy)) {
                    enemy.takeDamage();
                    this.score += 100;
                    bullet.lifetime = 0;
                }
            });
        });
        
        // Player vs terrain
        this.player.onGround = false;
        this.terrain.forEach(segment => {
            if (this.checkCollision(this.player, segment)) {
                this.player.handleTerrainCollision(segment);
            }
        });
        
        // Set coyote time when player leaves ground
        if (!this.player.onGround && this.player.velY > 0) {
            this.player.coyoteTime = 0.1; // 100ms coyote time
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.w &&
               obj1.x + obj1.w > obj2.x &&
               obj1.y < obj2.y + obj2.h &&
               obj1.y + obj1.h > obj2.y;
    }
    
    render(ctx, camera) {
        // Clear canvas
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Save context for camera transform
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        
        // Render parallax background
        this.renderBackground(ctx);
        
        // Render terrain
        this.renderTerrain(ctx);
        
        // Render game objects
        this.player.render(ctx);
        this.bullets.forEach(bullet => bullet.render(ctx));
        this.enemies.forEach(enemy => enemy.render(ctx));
        
        // Restore context
        ctx.restore();
        
        // Render HUD (not affected by camera)
        this.renderHUD(ctx);
    }
    
    renderBackground(ctx) {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.levelWidth, this.height);
        
        // Parallax clouds (layer 1)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 10; i++) {
            const x = (i * 400 + this.camera.x * 0.3) % (this.levelWidth + 400);
            ctx.beginPath();
            ctx.arc(x, 100 + Math.sin(i) * 20, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Parallax mountains (layer 2)
        ctx.fillStyle = 'rgba(139, 69, 19, 0.6)';
        for (let i = 0; i < 8; i++) {
            const x = (i * 500 + this.camera.x * 0.6) % (this.levelWidth + 500);
            const height = 150 + Math.sin(i * 0.5) * 50;
            ctx.fillRect(x, this.height - height, 200, height);
        }
    }
    
    renderTerrain(ctx) {
        this.terrain.forEach(segment => {
            if (segment.kind === 'ground') {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(segment.x, segment.y, segment.w, segment.h);
                
                // Grass detail
                ctx.fillStyle = '#228B22';
                ctx.fillRect(segment.x, segment.y, segment.w, 5);
            } else if (segment.kind === 'platform') {
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(segment.x, segment.y, segment.w, segment.h);
                
                // Platform shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(segment.x + 2, segment.y + 2, segment.w, segment.h);
            }
        });
    }
    
    renderHUD(ctx) {
        // Lives
        ctx.fillStyle = '#FF0000';
        ctx.font = '24px Arial';
        for (let i = 0; i < this.lives; i++) {
            ctx.fillText('♥', 20 + i * 30, 40);
        }
        
        // Score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${this.score}`, 20, 70);
        
        // Ammo
        ctx.fillText(`Ammo: ${this.ammo === Infinity ? '∞' : this.ammo}`, 20, 100);
        
        // Jumps remaining
        ctx.fillText(`Jumps: ${this.player.jumpsLeft}/2`, 20, 130);
        
        // Game state overlay
        if (this.gameState === 'paused') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', this.width / 2, this.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 50);
        } else if (this.gameState === 'gameOver') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = '#FF0000';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 50);
            ctx.fillText('Press R to restart', this.width / 2, this.height / 2 + 100);
        }
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }
    
    shoot() {
        if (this.keys['KeyX'] && Date.now() / 1000 - this.player.lastShot > this.player.shotCooldown) {
            this.player.lastShot = Date.now() / 1000;
            const bullet = new Bullet(
                this.player.facingRight ? this.player.x + this.player.w : this.player.x,
                this.player.y + this.player.h / 2,
                this.player.facingRight ? 720 : -720, // velocity based on direction
                0.9  // lifetime
            );
            this.bullets.push(bullet);
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 30;
        this.h = 40;
        this.velX = 0;
        this.velY = 0;
        this.accX = 0;
        this.accY = 0;
        this.onGround = false;
        this.facingRight = true;
        this.lastShot = 0;
        this.shotCooldown = 1 / 9; // 9 shots per second
        this.coyoteTime = 0;
        this.jumpsLeft = 2; // Maximum 2 jumps (ground + 1 air jump)
    }
    
    update(dt, keys, terrain) {
        // Input handling
        if (keys['ArrowLeft']) {
            this.accX = -4000;
            this.facingRight = false;
        } else if (keys['ArrowRight']) {
            this.accX = 4000;
            this.facingRight = true;
        } else {
            this.accX = 0;
        }
        
        // Jumping with coyote time and buffering
        if ((keys['ArrowUp'] || keys['Space']) && this.jumpsLeft > 0) {
            this.velY = -500;
            this.onGround = false;
            this.coyoteTime = 0; // Reset coyote time when jumping
            this.jumpsLeft--; // Decrease available jumps
        }
        
        // Physics
        this.velX += this.accX * dt;
        this.velY += 1500 * dt; // Gravity
        
        // Ground friction
        if (this.onGround) {
            this.velX *= 0.85;
        }
        
        // Air resistance
        this.velX *= 0.95;
        
        // Update position
        this.x += this.velX * dt;
        this.y += this.velY * dt;
        
        // Keep player in bounds
        this.x = Math.max(0, Math.min(this.x, 3000 - this.w));
        this.y = Math.max(0, Math.min(this.y, 540 - this.h));
        
        // Cap maximum velocity for better control
        this.velX = Math.max(-1200, Math.min(this.velX, 1200));
    }
    
    handleTerrainCollision(segment) {
        if (this.velY > 0 && this.y < segment.y) {
            // Landing on top
            this.y = segment.y - this.h;
            this.velY = 0;
            this.onGround = true;
            this.jumpsLeft = 2; // Reset jumps when landing on ground
        } else if (this.velY < 0 && this.y + this.h > segment.y + segment.h) {
            // Hitting from below
            this.y = segment.y + segment.h;
            this.velY = 0;
        } else if (this.velX > 0 && this.x < segment.x) {
            // Hitting from left
            this.x = segment.x - this.w;
            this.velX = 0;
        } else if (this.velX < 0 && this.x + this.w > segment.x + segment.w) {
            // Hitting from right
            this.x = segment.x + segment.w;
            this.velX = 0;
        }
    }
    
    takeDamage() {
        // Knockback effect
        this.velX = this.facingRight ? -200 : 200;
        this.velY = -150;
    }
    
    render(ctx) {
        // Player body
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 2, this.y + 2, this.w, this.h);
        
        // Player details
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 5, this.y + 5, 20, 10); // Helmet
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 10, this.y + 20, 10, 15); // Gun
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 25;
        this.h = 35;
        this.velX = -50;
        this.velY = 0;
        this.health = 1;
        this.patrolLeft = x - 100;
        this.patrolRight = x + 100;
        this.knockback = 0;
    }
    
    update(dt, terrain) {
        // Patrol movement
        if (this.x <= this.patrolLeft) {
            this.velX = 50;
        } else if (this.x >= this.patrolRight) {
            this.velX = -50;
        }
        
        // Apply knockback
        if (this.knockback > 0) {
            this.knockback -= dt;
            this.velX = this.knockback > 0 ? -200 : this.velX;
        }
        
        // Gravity
        this.velY += 1200 * dt;
        
        // Update position
        this.x += this.velX * dt;
        this.y += this.velY * dt;
        
        // Ground collision
        if (this.y + this.h > 500) {
            this.y = 500 - this.h;
            this.velY = 0;
        }
    }
    
    takeDamage() {
        this.health--;
        this.knockback = 0.2;
    }
    
    render(ctx) {
        if (this.health <= 0) return;
        
        // Enemy body
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Enemy shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 2, this.y + 2, this.w, this.h);
        
        // Enemy details
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 8, this.y + 8, 9, 9); // Eyes
    }
}

class Bullet {
    constructor(x, y, velocity, lifetime) {
        this.x = x;
        this.y = y;
        this.w = 4;
        this.h = 4;
        this.velX = velocity;
        this.velY = 0;
        this.lifetime = lifetime;
    }
    
    update(dt) {
        this.x += this.velX * dt;
        this.y += this.velY * dt;
        this.lifetime -= dt;
    }
    
    render(ctx) {
        // Bullet
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Bullet trail
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x - 8, this.y + 1, 8, 2);
    }
}

// Game initialization and main loop
let game;
let animationId;

function startGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = 960;
    canvas.height = 540;
    
    // Scale canvas to fit container
    function resizeCanvas() {
        const container = canvas.parentElement;
        const scale = Math.min(
            container.clientWidth / 960,
            container.clientHeight / 540
        );
        canvas.style.width = (960 * scale) + 'px';
        canvas.style.height = (540 * scale) + 'px';
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create game instance
    game = new MetalSlugGame(canvas);
    
    // Game loop
    function gameLoop(currentTime) {
        if (!game) return;
        
        const dt = (currentTime - game.lastTime) / 1000;
        game.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        const clampedDt = Math.min(dt, 1/30);
        
        game.update(clampedDt);
        game.render(game.ctx, game.camera);
        
        animationId = requestAnimationFrame(gameLoop);
    }
    
    game.lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    game = null;
}

// Register game if in hub environment
if (typeof window !== 'undefined' && window.registerGame) {
    window.registerGame('MetalSlug-DGA', startGame);
}
