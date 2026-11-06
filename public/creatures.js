/**
 * Kutularda Periyodik Olarak Yürüyen Sevimli Orman Hayvanları
 * (Sincap, Kirpi, Minik Tavşan, Tilki)
 */

document.addEventListener('DOMContentLoaded', () => {
  const sourceCreature = document.getElementById('sourceCreature');
  const targetCreature = document.getElementById('targetCreature');

  const creatures = ['🐿️', '🦔', '🐇', '🦊', '🦝'];

  function scheduleWalk(element, minDelaySec, maxDelaySec) {
    const delay = (minDelaySec + Math.random() * (maxDelaySec - minDelaySec)) * 1000;

    setTimeout(() => {
      // Rastgele bir hayvan seç
      const randomIcon = creatures[Math.floor(Math.random() * creatures.length)];
      element.textContent = randomIcon;

      // Rastgele yön (soldan sağa veya sağdan sola)
      const walkDirection = Math.random() > 0.5 ? 'walking-right' : 'walking-left';

      element.classList.remove('walking-right', 'walking-left');
      // Reflow tetikle
      void element.offsetWidth;
      element.classList.add(walkDirection);

      // Yürüyüş bittiğinde (14 saniye animasyon) sınıfı kaldır ve bir sonrakini zamanla
      setTimeout(() => {
        element.classList.remove('walking-right', 'walking-left');
        scheduleWalk(element, 8, 22);
      }, 14500);

    }, delay);
  }

  // İlk yürüyüşleri farklı gecikmelerle başlat
  if (sourceCreature) {
    scheduleWalk(sourceCreature, 3, 8);
  }
  if (targetCreature) {
    scheduleWalk(targetCreature, 10, 18);
  }
});

