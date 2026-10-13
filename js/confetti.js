/**
 * محرك الاحتفال الرقمي: قصاصات ملونة (Confetti) وبالونات باستيل طافية (Pastel Balloons)
 */
class CelebrationEffects {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.balloons = [];
    this.animationId = null;
    this.isActive = false;

    // تشكيلة ألوان باستيل مبهجة
    this.pastelColors = [
      '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7',
      '#C7CEEA', '#F3C4FB', '#FF9AA2', '#85E3FF',
      '#ACE7FF', '#FFDAC1', '#D0F4DE', '#A9DEF9'
    ];
  }

  initCanvas() {
    if (!this.canvas) {
      this.canvas = document.getElementById('celebration-canvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'celebration-canvas';
        document.body.appendChild(this.canvas);
      }
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  // إطلاق دفعة قصاصات صغيرة احتفالاً بالإجابة الصحيحة
  burstAt(x, y) {
    this.initCanvas();
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 8 + 6,
        color: this.pastelColors[Math.floor(Math.random() * this.pastelColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012
      });
    }

    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }

  // إطلاق احتفال متكامل وكبير للشاشة الختامية (قصاصات + بالونات)
  startGrandCelebration() {
    this.initCanvas();
    this.particles = [];
    this.balloons = [];
    this.isActive = true;

    // إضافة بالونات طافية للأعلى
    const balloonCount = 18;
    for (let i = 0; i < balloonCount; i++) {
      this.balloons.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 300,
        vy: -(Math.random() * 1.6 + 1.2),
        vx: Math.sin(i) * 0.5,
        radius: Math.random() * 16 + 22,
        color: this.pastelColors[Math.floor(Math.random() * this.pastelColors.length)],
        stringLength: Math.random() * 30 + 40,
        swaySpeed: Math.random() * 0.04 + 0.02,
        swayOffset: Math.random() * 10
      });
    }

    // إضافة قصاصات مستمرة
    const confettiCount = 100;
    for (let i = 0; i < confettiCount; i++) {
      this.particles.push(this.createConfettiParticle(true));
    }

    this.animate();
  }

  createConfettiParticle(isInitial = false) {
    return {
      x: Math.random() * window.innerWidth,
      y: isInitial ? Math.random() * window.innerHeight : -20,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 9 + 6,
      color: this.pastelColors[Math.floor(Math.random() * this.pastelColors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.3 ? 'rect' : 'circle',
      alpha: 1,
      decay: 0 // مستمر أثناء الاحتفال النهائي
    };
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.particles = [];
    this.balloons = [];
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // رسم وتحديث البالونات
    for (let i = 0; i < this.balloons.length; i++) {
      const b = this.balloons[i];
      b.y += b.vy;
      b.x += Math.sin(Date.now() * 0.002 * b.swaySpeed + b.swayOffset) * 0.8;

      // إذا تجاوزت أعلى الشاشة نعيد تدويرها من الأسفل
      if (b.y + b.radius < -100) {
        b.y = window.innerHeight + 50;
        b.x = Math.random() * window.innerWidth;
      }

      this.drawBalloon(b);
    }

    // رسم وتحديث القصاصات (Confetti)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (p.decay > 0) {
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      } else {
        // قصاصات مستمرة للشاشة الختامية
        if (p.y > window.innerHeight + 20) {
          p.y = -20;
          p.x = Math.random() * window.innerWidth;
        }
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.7);
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0 || this.balloons.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isActive = false;
    }
  }

  drawBalloon(b) {
    this.ctx.save();
    this.ctx.fillStyle = b.color;

    // جسم البالون (بيضاوي لطيف)
    this.ctx.beginPath();
    this.ctx.ellipse(b.x, b.y, b.radius * 0.85, b.radius * 1.1, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // لمعة البالون الرقيقة
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.beginPath();
    this.ctx.ellipse(b.x - b.radius * 0.3, b.y - b.radius * 0.35, b.radius * 0.22, b.radius * 0.38, -Math.PI / 6, 0, Math.PI * 2);
    this.ctx.fill();

    // عقدة البالون
    this.ctx.fillStyle = b.color;
    this.ctx.beginPath();
    this.ctx.moveTo(b.x - 4, b.y + b.radius * 1.08);
    this.ctx.lineTo(b.x + 4, b.y + b.radius * 1.08);
    this.ctx.lineTo(b.x, b.y + b.radius * 1.18);
    this.ctx.closePath();
    this.ctx.fill();

    // خيط البالون
    this.ctx.strokeStyle = 'rgba(160, 160, 160, 0.6)';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(b.x, b.y + b.radius * 1.15);
    this.ctx.quadraticCurveTo(
      b.x + Math.sin(b.y * 0.05) * 8,
      b.y + b.radius + b.stringLength * 0.5,
      b.x + Math.cos(b.y * 0.05) * 5,
      b.y + b.radius + b.stringLength
    );
    this.ctx.stroke();

    this.ctx.restore();
  }
}

const celebration = new CelebrationEffects();
