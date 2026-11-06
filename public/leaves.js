/**
 * Mevsime Göre Düşen Yaprak/Kar Animasyonu ve 20s Arka Plan Döngüsü
 * Kullanıcı dilediğinde mevsimi manuel seçebilir veya otomatik bırakabilir.
 */

class SeasonalLeavesAnimation {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.leaves = [];
    this.leafCount = 28;
    this.mode = 'auto'; // 'auto' veya 'autumn' / 'winter' / 'spring' / 'summer'
    this.season = this.resolveSeason('auto');
    this.colors = this.getSeasonColors(this.season);
    this.rotatorInterval = null;
    this.activeLayer = 1;
    this.currentIndex = 0;

    // Küratörlü zengin orman galerisi
    this.forestGalleries = {
      autumn: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Altın sonbahar patikası
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', // Güneş ışığı ve sararan ağaçlar
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Sisli sonbahar korusu
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8', // Kızıl yapraklı orman
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86', // Altın sarısı orman
        'https://images.unsplash.com/photo-1509114397022-ed747cca3f65'  // Koyu sonbahar ağaçları
      ],
      winter: [
        'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22', // Karlı orman vadisi
        'https://images.unsplash.com/photo-1491555103944-7c647fd857e6', // Karlı köknar ağaçları
        'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb', // Kış gün batımı ve orman
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09'  // Donmuş kış masalı
      ],
      spring: [
        'https://images.unsplash.com/photo-1511497584788-87676104235f', // Taze yeşil orman
        'https://images.unsplash.com/photo-1448375240586-882707db888b', // İlkbahar filizleri ve güneş
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff', // Yeşil vadi ve dağ korusu
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'  // Sisli yeşil bahar ormanı
      ],
      summer: [
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429', // Güneşli yaz ormanı
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86', // Işık huzmeleri
        'https://images.unsplash.com/photo-1476820865390-c52aeebb9891', // Yoğun yaz yaprakları
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e'  // Zirvede orman örtüsü
      ]
    };
  }

  resolveSeason(mode) {
    if (mode && mode !== 'auto') {
      const map = {
        autumn: { id: 'autumn', name: 'Sonbahar', icon: '🍂' },
        winter: { id: 'winter', name: 'Kış', icon: '❄️' },
        spring: { id: 'spring', name: 'İlkbahar', icon: '🌱' },
        summer: { id: 'summer', name: 'Yaz', icon: '☀️' }
      };
      return map[mode] || map.autumn;
    }

    // Otomatik: Takvim ayına göre belirle
    const month = new Date().getMonth(); // 0: Ocak, 11: Aralık
    if (month >= 2 && month <= 4) {
      return { id: 'spring', name: 'İlkbahar', icon: '🌱' };
    } else if (month >= 5 && month <= 7) {
      return { id: 'summer', name: 'Yaz', icon: '☀️' };
    } else if (month >= 8 && month <= 10) {
      return { id: 'autumn', name: 'Sonbahar', icon: '🍂' };
    } else {
      return { id: 'winter', name: 'Kış', icon: '❄️' };
    }
  }

  getSeasonColors(season) {
    switch (season.id) {
      case 'autumn':
        return ['#d96b27', '#c93b2b', '#e5a93b', '#b33927', '#e88834'];
      case 'winter':
        return ['#ffffff', '#f0f5ff', '#e0ecf8', '#d6e4f0'];
      case 'spring':
        return ['#7cb342', '#8bc34a', '#aed581', '#689f38', '#558b2f'];
      case 'summer':
        return ['#fbc02d', '#fdd835', '#ffee58', '#f57f17', '#e6b800'];
      default:
        return ['#e5a93b', '#c93b2b'];
    }
  }

  setSeason(newMode) {
    this.mode = newMode;
    this.season = this.resolveSeason(newMode);
    this.colors = this.getSeasonColors(this.season);

    // Mevcut yaprakların renklerini ve kış tipini anında güncelle
    for (let i = 0; i < this.leaves.length; i++) {
      this.leaves[i] = this.createLeaf(true);
    }

    // Üst rozeti güncelle
    const seasonBadge = document.getElementById('seasonBadge');
    if (seasonBadge) {
      seasonBadge.textContent = `${this.season.icon} ${this.season.name} Atmosferi`;
    }

    // Arka plan resim döngüsünü hemen yeni mevsime geçir
    this.restartBackgroundCycle();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'leavesCanvas';
    this.ctx = this.canvas.getContext('2d');

    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '2',
      opacity: '0.78'
    });

    document.body.appendChild(this.canvas);
    this.resize();

    window.addEventListener('resize', () => this.resize());

    // Başlangıç yaprakları
    for (let i = 0; i < this.leafCount; i++) {
      this.leaves.push(this.createLeaf(true));
    }

    this.render();
    this.restartBackgroundCycle();
  }

  restartBackgroundCycle() {
    if (this.rotatorInterval) {
      clearInterval(this.rotatorInterval);
    }

    const list = this.forestGalleries[this.season.id] || this.forestGalleries.autumn;
    this.currentIndex = Math.floor(Math.random() * list.length);

    const layer1 = document.getElementById('bgLayer1');
    const layer2 = document.getElementById('bgLayer2');

    const firstUrl = `${list[this.currentIndex]}?auto=format&fit=crop&w=1920&q=80`;
    if (layer1) {
      layer1.style.backgroundImage = `url('${firstUrl}')`;
      layer1.classList.add('active');
    }
    if (layer2) {
      layer2.classList.remove('active');
    }
    this.activeLayer = 1;

    // Her 20 saniyede bir yumuşak çapraz geçiş (cross-fade)
    this.rotatorInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % list.length;
      const nextUrl = `${list[this.currentIndex]}?auto=format&fit=crop&w=1920&q=80`;

      const preloadImg = new Image();
      preloadImg.src = nextUrl;
      preloadImg.onload = () => {
        if (this.activeLayer === 1) {
          if (layer2) {
            layer2.style.backgroundImage = `url('${nextUrl}')`;
            layer2.classList.add('active');
          }
          if (layer1) layer1.classList.remove('active');
          this.activeLayer = 2;
        } else {
          if (layer1) {
            layer1.style.backgroundImage = `url('${nextUrl}')`;
            layer1.classList.add('active');
          }
          if (layer2) layer2.classList.remove('active');
          this.activeLayer = 1;
        }
      };
    }, 20000);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createLeaf(randomY = false) {
    const isWinter = this.season.id === 'winter';
    return {
      x: Math.random() * (this.width || window.innerWidth),
      y: randomY ? Math.random() * (this.height || window.innerHeight) : -20,
      size: isWinter ? 3 + Math.random() * 4 : 10 + Math.random() * 12,
      speedY: 0.6 + Math.random() * 1.2,
      speedX: -0.4 + Math.random() * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      oscillationSpeed: 0.01 + Math.random() * 0.02,
      oscillationDistance: 20 + Math.random() * 40,
      oscillationOffset: Math.random() * Math.PI * 2,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      opacity: 0.5 + Math.random() * 0.4,
      isWinter: isWinter
    };
  }

  drawLeaf(leaf) {
    this.ctx.save();
    this.ctx.translate(leaf.x, leaf.y);
    this.ctx.rotate(leaf.rotation);
    this.ctx.globalAlpha = leaf.opacity;
    this.ctx.fillStyle = leaf.color;

    if (leaf.isWinter) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, leaf.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(0, -leaf.size);
      this.ctx.quadraticCurveTo(leaf.size * 0.8, -leaf.size * 0.2, 0, leaf.size);
      this.ctx.quadraticCurveTo(-leaf.size * 0.8, -leaf.size * 0.2, 0, -leaf.size);
      this.ctx.fill();

      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -leaf.size * 0.85);
      this.ctx.lineTo(0, leaf.size * 0.85);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.leaves.length; i++) {
      const leaf = this.leaves[i];
      leaf.oscillationOffset += leaf.oscillationSpeed;
      leaf.x += leaf.speedX + Math.sin(leaf.oscillationOffset) * 0.6;
      leaf.y += leaf.speedY;
      leaf.rotation += leaf.rotationSpeed;

      this.drawLeaf(leaf);

      if (leaf.y > this.height + 25 || leaf.x < -40 || leaf.x > this.width + 40) {
        this.leaves[i] = this.createLeaf(false);
      }
    }

    requestAnimationFrame(() => this.render());
  }
}

// Global örnek
let leavesAnimInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  leavesAnimInstance = new SeasonalLeavesAnimation();
  leavesAnimInstance.init();

  const seasonBadge = document.getElementById('seasonBadge');
  if (seasonBadge) {
    seasonBadge.textContent = `${leavesAnimInstance.season.icon} ${leavesAnimInstance.season.name} Atmosferi`;
  }

  // Kullanıcı mevsim seçim kutusunu değiştirdiğinde
  const seasonSelect = document.getElementById('seasonSelect');
  if (seasonSelect) {
    seasonSelect.addEventListener('change', (e) => {
      leavesAnimInstance.setSeason(e.target.value);
    });
  }
});
