import { Application, Graphics, Ticker, Assets, Sprite } from 'pixi.js';
import { useGameStore } from '../store/useGameStore';

export class GameEngine {
  public app: Application;
  private player!: Sprite;
  private playerHpBar!: Graphics;
  private isInitialized = false;
  private assetsLoaded = false;

  private keys: Record<string, boolean> = {};
  
  private playerProjectiles: { sprite: Sprite; vx: number; vy: number }[] = [];
  private enemyProjectiles: { sprite: Sprite; vx: number; vy: number }[] = [];
  private enemies: { sprite: Sprite; hpBar: Graphics; type: 'CHASER' | 'SHOOTER', hp: number, maxHp: number, lastShot: number }[] = [];
  private islands: Sprite[] = [];
  private explosions: { sprite: Sprite; timer: number }[] = [];
  
  private lastShootTime = 0;
  private lastSpawnTime = 0;
  private gameTimer = 0;

  // Textures
  private playerTexture: any;
  private chaserTexture: any;
  private shooterTexture: any;
  private bulletTexture: any;
  private enemyBulletTexture: any;
  private islandTexture: any;
  private explosionTexture: any;

  constructor() {
    this.app = new Application();
  }

  public async init(canvas: HTMLCanvasElement) {
    if (this.isInitialized) return;
    
    await this.app.init({
      canvas: canvas,
      resizeTo: window,
      backgroundColor: 0x1a9ad9,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.isInitialized = true;
    await this.loadAssets();
    this.setupScene();
    this.setupInput();
    this.app.ticker.add(this.update.bind(this));
  }

  private async loadAssets() {
    this.playerTexture = await Assets.load('/assets/png/default/ships/ship_1.png');
    this.chaserTexture = await Assets.load('/assets/png/default/ships/dinghy_large_1.png');
    this.shooterTexture = await Assets.load('/assets/png/default/ships/ship_3.png'); // Using ship_3 for shooter
    this.bulletTexture = await Assets.load('/assets/png/default/ship_parts/cannon_ball.png');
    this.enemyBulletTexture = await Assets.load('/assets/png/default/ship_parts/cannon_ball.png');
    this.islandTexture = await Assets.load('/assets/png/default/tiles/tile_12.png');
    this.explosionTexture = await Assets.load('/assets/png/default/effects/explosion_1.png');
    this.assetsLoaded = true;
  }

  private setupScene() {
    // Spawn an Island in the middle-ish
    const island = new Sprite(this.islandTexture);
    island.anchor.set(0.5);
    island.scale.set(1.5);
    island.x = this.app.screen.width * 0.7;
    island.y = this.app.screen.height * 0.5;
    this.islands.push(island);
    this.app.stage.addChild(island);

    this.player = new Sprite(this.playerTexture);
    this.player.anchor.set(0.5);
    this.player.scale.set(0.6);
    this.player.x = this.app.screen.width * 0.3;
    this.player.y = this.app.screen.height * 0.5;
    this.app.stage.addChild(this.player);

    this.playerHpBar = new Graphics();
    this.app.stage.addChild(this.playerHpBar);
  }

  private setupInput() {
    const downHandler = (e: KeyboardEvent) => { this.keys[e.code] = true; };
    const upHandler = (e: KeyboardEvent) => { this.keys[e.code] = false; };
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    (this as any).cleanupInput = () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }

  private shootBroadside(side: 'left' | 'right') {
    const now = Date.now();
    if (now - this.lastShootTime < 300) return;
    this.lastShootTime = now;

    // We shoot 3 bullets
    const offsets = [-20, 0, 20]; // y offset relative to ship

    offsets.forEach(offset => {
      const bullet = new Sprite(this.bulletTexture);
      bullet.anchor.set(0.5);
      bullet.scale.set(0.5);
      bullet.tint = 0xffaa00; // Orange for lateral

      // Direction depends on side
      const angle = this.player.rotation + (side === 'right' ? Math.PI / 2 : -Math.PI / 2);
      
      // Calculate start position taking offset into account
      // Offset moves the spawn along the forward/backward axis of the ship
      const forwardDx = Math.sin(this.player.rotation);
      const forwardDy = -Math.cos(this.player.rotation);
      
      bullet.x = this.player.x + forwardDx * offset;
      bullet.y = this.player.y + forwardDy * offset;
      
      const speed = 10;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.playerProjectiles.push({ sprite: bullet, vx, vy });
      this.app.stage.addChild(bullet);
    });
  }

  private shoot() {
    const now = Date.now();
    if (now - this.lastShootTime < 300) return;
    this.lastShootTime = now;

    const bullet = new Sprite(this.bulletTexture);
    bullet.anchor.set(0.5);
    bullet.scale.set(0.5);
    bullet.tint = 0xffff00; // Player bullets yellow
    
    bullet.x = this.player.x;
    bullet.y = this.player.y;
    
    const speed = 10;
    const vx = Math.sin(this.player.rotation) * speed;
    const vy = -Math.cos(this.player.rotation) * speed;

    this.playerProjectiles.push({ sprite: bullet, vx, vy });
    this.app.stage.addChild(bullet);
  }

  private enemyShoot(enemy: any) {
    const bullet = new Sprite(this.enemyBulletTexture);
    bullet.anchor.set(0.5);
    bullet.scale.set(0.5);
    bullet.tint = 0xff0000; // Enemy bullets red
    
    bullet.x = enemy.sprite.x;
    bullet.y = enemy.sprite.y;
    
    const speed = 7;
    const vx = Math.sin(enemy.sprite.rotation) * speed;
    const vy = -Math.cos(enemy.sprite.rotation) * speed;

    this.enemyProjectiles.push({ sprite: bullet, vx, vy });
    this.app.stage.addChild(bullet);
  }

  private spawnEnemy() {
    const isShooter = Math.random() > 0.5;
    const sprite = new Sprite(isShooter ? this.shooterTexture : this.chaserTexture);
    sprite.anchor.set(0.5);
    sprite.scale.set(isShooter ? 0.5 : 0.8);
    
    let ex = Math.random() * this.app.screen.width;
    let ey = Math.random() * this.app.screen.height;
    
    if (Math.abs(ex - this.player.x) < 300) ex += 300;
    if (Math.abs(ey - this.player.y) < 300) ey += 300;
    
    sprite.x = ex;
    sprite.y = ey;

    const hpBar = new Graphics();
    this.app.stage.addChild(sprite);
    this.app.stage.addChild(hpBar);

    this.enemies.push({ 
      sprite, 
      hpBar, 
      type: isShooter ? 'SHOOTER' : 'CHASER',
      hp: isShooter ? 40 : 20,
      maxHp: isShooter ? 40 : 20,
      lastShot: 0
    });
  }

  private spawnExplosion(x: number, y: number) {
    const exp = new Sprite(this.explosionTexture);
    exp.anchor.set(0.5);
    exp.x = x;
    exp.y = y;
    this.app.stage.addChild(exp);
    this.explosions.push({ sprite: exp, timer: 20 });
  }

  private drawHpBar(graphics: Graphics, x: number, y: number, hp: number, maxHp: number) {
    graphics.clear();
    if (hp <= 0) return;
    const width = 40;
    const height = 6;
    graphics.rect(x - width/2, y - 40, width, height).fill(0xff0000); // bg
    graphics.rect(x - width/2, y - 40, width * (hp / maxHp), height).fill(0x00ff00); // fg
  }

  private isColliding(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy) < (r1 + r2);
  }

  private checkCollisions() {
    const state = useGameStore.getState();
    let currentScore = state.score;
    let currentHp = state.hp;

    // Player Bullets vs Enemies
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const p = this.playerProjectiles[i];
      let hit = false;
      
      // vs Islands
      for (const island of this.islands) {
        if (this.isColliding(p.sprite.x, p.sprite.y, 5, island.x, island.y, 40)) hit = true;
      }

      // vs Enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (!hit && this.isColliding(p.sprite.x, p.sprite.y, 5, e.sprite.x, e.sprite.y, 30)) {
          hit = true;
          e.hp -= 20; // Player damage
          
          if (e.hp <= 0) {
            this.spawnExplosion(e.sprite.x, e.sprite.y);
            this.app.stage.removeChild(e.sprite);
            this.app.stage.removeChild(e.hpBar);
            e.sprite.destroy();
            e.hpBar.destroy();
            this.enemies.splice(j, 1);
            currentScore += 1;
            state.setScore(currentScore);
          }
        }
      }

      if (hit) {
        this.app.stage.removeChild(p.sprite);
        p.sprite.destroy();
        this.playerProjectiles.splice(i, 1);
      }
    }

    // Enemy Bullets vs Player
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      let hit = false;
      
      // vs Islands
      for (const island of this.islands) {
        if (this.isColliding(p.sprite.x, p.sprite.y, 5, island.x, island.y, 40)) hit = true;
      }

      // vs Player
      if (!hit && this.isColliding(p.sprite.x, p.sprite.y, 5, this.player.x, this.player.y, 35)) {
        hit = true;
        currentHp -= 10;
        state.setHp(currentHp);
        this.spawnExplosion(this.player.x, this.player.y);
        if (currentHp <= 0) state.setGameState('GAMEOVER', 'DEATH');
      }

      if (hit) {
        this.app.stage.removeChild(p.sprite);
        p.sprite.destroy();
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // Enemies vs Player (Kamikaze Chasers)
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j];
      if (this.isColliding(this.player.x, this.player.y, 35, e.sprite.x, e.sprite.y, 30)) {
        this.spawnExplosion(e.sprite.x, e.sprite.y);
        this.app.stage.removeChild(e.sprite);
        this.app.stage.removeChild(e.hpBar);
        e.sprite.destroy();
        e.hpBar.destroy();
        this.enemies.splice(j, 1);

        currentHp -= 20;
        state.setHp(currentHp);
        if (currentHp <= 0) state.setGameState('GAMEOVER', 'DEATH');
      }
    }

    // Player vs Islands
    for (const island of this.islands) {
      if (this.isColliding(this.player.x, this.player.y, 35, island.x, island.y, 45)) {
        // Physical bounce off the island using collision normals
        const dx = this.player.x - island.x;
        const dy = this.player.y - island.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
          const overlap = (35 + 45) - dist; // Radius sum minus distance
          const nx = dx / dist;
          const ny = dy / dist;
          
          // Push player out of the island exactly by the overlap
          this.player.x += nx * overlap;
          this.player.y += ny * overlap;
        }
      }
    }
  }

  private update(ticker: Ticker) {
    if (!this.assetsLoaded) return;
    
    const state = useGameStore.getState();
    if (state.gameState !== 'PLAYING') return;
    if (state.isPaused) return; // PAUSE logic

    const dt = ticker.deltaTime;
    const moveSpeed = 4 * dt;
    const rotSpeed = 0.05 * dt;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) {
      this.player.x += Math.sin(this.player.rotation) * moveSpeed;
      this.player.y -= Math.cos(this.player.rotation) * moveSpeed;
    }
    if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      this.player.x -= Math.sin(this.player.rotation) * moveSpeed;
      this.player.y += Math.cos(this.player.rotation) * moveSpeed;
    }
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.player.rotation -= rotSpeed;
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.player.rotation += rotSpeed;
    }
    if (this.keys['Space']) {
      this.shoot();
    }
    if (this.keys['KeyQ']) {
      this.shootBroadside('left');
    }
    if (this.keys['KeyE']) {
      this.shootBroadside('right');
    }

    // Move Player Projectiles
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const p = this.playerProjectiles[i];
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      if (p.sprite.x < 0 || p.sprite.x > this.app.screen.width || p.sprite.y < 0 || p.sprite.y > this.app.screen.height) {
        this.app.stage.removeChild(p.sprite);
        p.sprite.destroy();
        this.playerProjectiles.splice(i, 1);
      }
    }

    // Move Enemy Projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      if (p.sprite.x < 0 || p.sprite.x > this.app.screen.width || p.sprite.y < 0 || p.sprite.y > this.app.screen.height) {
        this.app.stage.removeChild(p.sprite);
        p.sprite.destroy();
        this.enemyProjectiles.splice(i, 1);
      }
    }

    const now = Date.now();
    for (const e of this.enemies) {
      const dx = this.player.x - e.sprite.x;
      const dy = this.player.y - e.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      if (e.type === 'CHASER') {
        const speed = 2.5 * dt;
        e.sprite.x += Math.cos(angle) * speed;
        e.sprite.y += Math.sin(angle) * speed;
        e.sprite.rotation = angle + Math.PI / 2;
      } 
      else if (e.type === 'SHOOTER') {
        e.sprite.rotation = angle + Math.PI / 2;
        
        // Keep distance ~250px
        if (dist > 250) {
          const speed = 1.5 * dt;
          e.sprite.x += Math.cos(angle) * speed;
          e.sprite.y += Math.sin(angle) * speed;
        } else if (dist < 200) {
          const speed = 1.5 * dt;
          e.sprite.x -= Math.cos(angle) * speed;
          e.sprite.y -= Math.sin(angle) * speed;
        }
        
        // Shoot
        if (now - e.lastShot > 1500 && dist < 400) { // Shoot every 1.5s
          this.enemyShoot(e);
          e.lastShot = now;
        }
      }

      this.drawHpBar(e.hpBar, e.sprite.x, e.sprite.y, e.hp, e.maxHp);
    }

    this.drawHpBar(this.playerHpBar, this.player.x, this.player.y, state.hp, 100);

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.timer -= dt;
      exp.sprite.alpha = exp.timer / 20; // Fade out
      exp.sprite.scale.set(1 + (20 - exp.timer) * 0.05); // Grow
      if (exp.timer <= 0) {
        this.app.stage.removeChild(exp.sprite);
        exp.sprite.destroy();
        this.explosions.splice(i, 1);
      }
    }

    this.checkCollisions();

    if (now - this.lastSpawnTime > state.enemySpawnTime) {
      this.spawnEnemy();
      this.lastSpawnTime = now;
    }

    this.gameTimer += ticker.deltaMS;
    if (this.gameTimer >= 1000) {
      this.gameTimer -= 1000;
      const newTime = state.timeLeft - 1;
      state.setTimeLeft(newTime);
      if (newTime <= 0) state.setGameState('GAMEOVER', 'TIME');
    }

    this.player.x = Math.max(20, Math.min(this.app.screen.width - 20, this.player.x));
    this.player.y = Math.max(40, Math.min(this.app.screen.height - 40, this.player.y));
  }

  public destroy() {
    if ((this as any).cleanupInput) (this as any).cleanupInput();
    if (this.app) this.app.destroy(true, { children: true });
  }
}
