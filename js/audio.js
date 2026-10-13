/**
 * نظام المؤثرات الصوتية التفاعلية للمسابقة
 * مبني بالكامل على Web Audio API ليعمل في أي متصفح دون الحاجة لتحميل ملفات صوتية خارجية
 */
class SoundEffects {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.initContext();
  }

  initContext() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
  }

  ensureActive() {
    this.initContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // صوت النقر الخفيف
  playClick() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // صوت طقطقة عجلة الحظ أثناء الدوران
  playTick() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Tick play error:', e);
    }
  }

  // صوت مميز عند توقف العجلة على السؤال
  playWheelStop() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      [784, 1046.5].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const t = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch (e) {
      console.warn('Wheel stop audio error:', e);
    }
  }

  // صوت الإجابة الصحيحة المبهج (نغمات احتفالية متتالية)
  playCorrect() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (نغمات بهجة وفرح)
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const noteStart = now + (index * 0.1);
        const noteEnd = noteStart + 0.35;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(noteStart);
        osc.stop(noteEnd);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // صوت تشجيعي لطيف عند الخطأ للمحاولة الثانية (نغمة هادئة لا تحبط الطالبة)
  playWrong() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [392.00, 329.63]; // G4 to E4 (نغمتان هادئتان)

      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const noteStart = now + (index * 0.14);
        const noteEnd = noteStart + 0.28;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(noteStart);
        osc.stop(noteEnd);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // صوت فوز وتكريم ختامي فاخر (Fanfare)
  playFanfare() {
    if (this.isMuted) return;
    this.ensureActive();
    if (!this.audioCtx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.5, d: 0.35 }, // C6
        { f: 880.00, d: 0.15 }, // A5
        { f: 1046.5, d: 0.60 }  // C6 طويلة
      ];

      let startTime = this.audioCtx.currentTime + 0.05;

      melody.forEach(item => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.28, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.d + 0.05);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + item.d + 0.05);

        startTime += item.d;
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

// تصدير كائن الصوت العام
const soundSystem = new SoundEffects();
