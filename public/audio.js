/**
 * Orman ve Doğa Ambiyansı Ses Üreticisi (Web Audio API)
 * Harici MP3 veya büyük ses dosyalarına gerek duymadan,
 * tarayıcının yerel ses motoruyla sürekli ve kesintisiz rüzgar,
 * ağaç yaprakları hışırtısı ve su/orman fısıltısı üretir.
 */

class ForestAmbience {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.volume = 0.4;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Ana Ses Düzeyi Düğümü
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);

    // Pembe Gürültü (Yaprak Hışırtısı ve Rüzgar)
    this.createWindAndLeaves();

    // Kuş ve Doğa Cıvıltıları Efekti (Periyodik yumuşak tınılar)
    this.startChirpLoop();
  }

  createWindAndLeaves() {
    // 5 saniyelik pembe gürültü tamponu oluştur (döngüsel rüzgar için)
    const bufferSize = this.audioCtx.sampleRate * 5;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Rüzgar ve yapraklar hissi için düşük geçiren ve bant geçiren filtreler
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

    // Rüzgarın yavaş dalgalanması (LFO)
    const lfo = this.audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.audioCtx.currentTime); // Çok yavaş esinti
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(220, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);

    noiseSource.start();
    lfo.start();
  }

  // Ara sıra çalan hafif ve uzak orman kuşu melodileri
  startChirpLoop() {
    const playRandomChirp = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const chirpGain = this.audioCtx.createGain();

      const startTime = this.audioCtx.currentTime;
      const baseFreq = 2200 + Math.random() * 800; // Doğa tınısı

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, startTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, startTime + 0.18);

      chirpGain.gain.setValueAtTime(0, startTime);
      chirpGain.gain.linearRampToValueAtTime(0.025, startTime + 0.04);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

      osc.connect(chirpGain);
      chirpGain.connect(this.gainNode);

      osc.start(startTime);
      osc.stop(startTime + 0.25);

      // 4 ila 9 saniye arasında rastgele tekrar et
      const nextTime = (4 + Math.random() * 5) * 1000;
      setTimeout(playRandomChirp, nextTime);
    };

    setTimeout(playRandomChirp, 3000);
  }

  start() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.isPlaying = true;
  }

  pause() {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
    }
    this.isPlaying = false;
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    }
  }
}

// Global örnek
const forestAudio = new ForestAmbience();

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleAudioBtn');
  const btnIcon = document.getElementById('btnAudioIcon');
  const btnText = document.getElementById('btnAudioText');
  const soundLabel = document.getElementById('soundLabel');
  const volSlider = document.getElementById('volSlider');

  // Tarayıcıların otomatik ses çalma kısıtlamasına (autoplay policy) karşı:
  // Sayfaya ilk tıklamada veya butona basıldığında ses otomatik devreye girer.
  const tryStartAudio = () => {
    forestAudio.start();
    updateUI(true);
    document.removeEventListener('click', tryStartAudio);
  };

  function updateUI(playing) {
    if (playing) {
      btnIcon.textContent = '⏸️';
      btnText.textContent = 'Sesi Duraklat';
      soundLabel.textContent = 'Orman Fısıltısı (Çalıyor)';
    } else {
      btnIcon.textContent = '▶️';
      btnText.textContent = 'Sesi Başlat';
      soundLabel.textContent = 'Orman Fısıltısı (Sessiz)';
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (forestAudio.isPlaying) {
      forestAudio.pause();
      updateUI(false);
    } else {
      forestAudio.start();
      updateUI(true);
    }
  });

  volSlider.addEventListener('input', (e) => {
    forestAudio.setVolume(parseFloat(e.target.value));
  });

  // Sayfaya ilk tıklama veya tuş basımında ambiyansı başlat
  document.addEventListener('click', tryStartAudio, { once: true });
});

