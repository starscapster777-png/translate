/**
 * Kır Bahçesi Çeviri - Frontend Anlık (Canlı) Çeviri Mantığı
 */

document.addEventListener('DOMContentLoaded', () => {
  const sourceText = document.getElementById('sourceText');
  const targetText = document.getElementById('targetText');
  const sourceLang = document.getElementById('sourceLang');
  const targetLang = document.getElementById('targetLang');
  const domainSelect = document.getElementById('domainSelect');
  const toneSelect = document.getElementById('toneSelect');
  const glossaryText = document.getElementById('glossaryText');
  const sourceCount = document.getElementById('sourceCount');

  const swapLangsBtn = document.getElementById('swapLangsBtn');
  const clearSourceBtn = document.getElementById('clearSourceBtn');
  const copyTargetBtn = document.getElementById('copyTargetBtn');
  const toggleGlossaryBtn = document.getElementById('toggleGlossaryBtn');
  const glossarySection = document.getElementById('glossarySection');
  const glossaryToggleIcon = document.getElementById('glossaryToggleIcon');

  const loadingOverlay = document.getElementById('loadingOverlay');
  const errorBanner = document.getElementById('errorBanner');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const closeErrorBtn = document.getElementById('closeErrorBtn');
  const toast = document.getElementById('toast');

  let debounceTimer = null;
  let activeAbortController = null;

  // Karakter Sayacı ve Anlık Çeviri Tetikleme
  sourceText.addEventListener('input', () => {
    const len = sourceText.value.length;
    sourceCount.textContent = `${len} karakter`;

    if (!sourceText.value.trim()) {
      targetText.value = '';
      hideLoading();
      return;
    }

    // Kullanıcı yazarken klavye duraksadığında (280ms) anında çevir
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performInstantTranslation();
    }, 280);
  });

  // Ayarlar değiştiğinde anında tekrar çevir
  [sourceLang, targetLang, domainSelect, toneSelect].forEach(el => {
    el.addEventListener('change', () => {
      if (sourceText.value.trim()) {
        performInstantTranslation();
      }
    });
  });

  glossaryText.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (sourceText.value.trim()) performInstantTranslation();
    }, 500);
  });

  // Metni Temizle
  clearSourceBtn.addEventListener('click', () => {
    sourceText.value = '';
    targetText.value = '';
    sourceCount.textContent = '0 karakter';
    sourceText.focus();
    hideError();
    hideLoading();
  });

  // Dilleri Değiştir (Swap)
  swapLangsBtn.addEventListener('click', () => {
    const currentSrc = sourceLang.value;
    const currentTgt = targetLang.value;

    if (currentSrc === 'Otomatik') {
      sourceLang.value = currentTgt;
      targetLang.value = 'Türkçe';
    } else {
      sourceLang.value = currentTgt;
      targetLang.value = currentSrc;
    }

    const currentSrcText = sourceText.value;
    const currentTgtText = targetText.value;
    if (currentTgtText) {
      sourceText.value = currentTgtText;
      targetText.value = currentSrcText;
      sourceCount.textContent = `${sourceText.value.length} karakter`;
      performInstantTranslation();
    }
  });

  // Terimce (Glossary) Aç/Kapa
  toggleGlossaryBtn.addEventListener('click', () => {
    const isHidden = glossarySection.style.display === 'none';
    if (isHidden) {
      glossarySection.style.display = 'block';
      glossaryToggleIcon.textContent = '▲';
    } else {
      glossarySection.style.display = 'none';
      glossaryToggleIcon.textContent = '▼';
    }
  });

  // Çeviriyi Panoya Kopyala
  copyTargetBtn.addEventListener('click', async () => {
    const textToCopy = targetText.value.trim();
    if (!textToCopy) {
      showToast('Kopyalanacak çeviri bulunmuyor.');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('🍃 Çeviri panoya kopyalandı!');
    } catch (err) {
      targetText.select();
      document.execCommand('copy');
      showToast('🍃 Çeviri kopyalandı!');
    }
  });

  closeErrorBtn.addEventListener('click', hideError);

  function showError(title, msg) {
    errorTitle.textContent = title;
    errorMessage.textContent = msg;
    errorBanner.style.display = 'flex';
  }

  function hideError() {
    errorBanner.style.display = 'none';
  }

  function showLoading() {
    if (!targetText.value.trim()) {
      loadingOverlay.classList.add('active');
    }
  }

  function hideLoading() {
    loadingOverlay.classList.remove('active');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ANLIK ÇEVİRİ FONKSİYONU
  async function performInstantTranslation() {
    const text = sourceText.value.trim();
    if (!text) {
      targetText.value = '';
      hideLoading();
      return;
    }

    // Önceki geciken istek varsa iptal et
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    hideError();
    showLoading();

    const payload = {
      text: text,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      domain: domainSelect.value,
      tone: toneSelect.value,
      glossary: glossaryText.value
    };

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: activeAbortController.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Çeviri sunucusu ile iletişim kurulamadı.');
      }

      targetText.value = data.translation;
    } catch (err) {
      if (err.name === 'AbortError') {
        // Yeni bir harf yazıldığı için önceki istek iptal edildi, hata gösterme
        return;
      }
      console.error(err);
      showError('Çeviri Hatası', err.message);
    } finally {
      hideLoading();
    }
  }
});
