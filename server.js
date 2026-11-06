import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bellek İçi Hızlı Önbellek (Aynı metin veya sık tekrarlanan çeviriler için 0 ms anlık yanıt)
const cache = new Map();
const MAX_CACHE_SIZE = 500;

const domainDescriptions = {
  genel: "Genel günlük ve standart dil.",
  hukuk: "Hukuk alanı: yasal terminoloji ve kanun dili.",
  tip: "Tıp ve sağlık alanı: tıbbi terimler ve klinik doğruluk.",
  teknik: "Teknik ve bilişim alanı: teknik jargona sadakat.",
  edebi: "Edebi ve sanatsal alan: akıcı ve edebi anlatım."
};

const toneDescriptions = {
  resmi: "Resmi (Siz dili).",
  gundelik: "Samimi ve günlük (Sen dili)."
};

// 3 Hızlı Modelin Paralel Yarışması (Hedge / Race Request)
// Hangisi ilk ve en hızlı yanıtı dönerse kullanıcıya o aktarılır.
const RACE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-flash-latest'
];

async function callSingleModel(modelName, apiKey, systemInstruction, text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `${modelName} hatası`);
  }

  const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!translatedText) {
    throw new Error("Boş çeviri yanıtı");
  }

  return { translation: translatedText, model: modelName };
}

// Çeviri Endpoint'i
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang, domain, tone, glossary } = req.body;

    if (!text || !text.trim()) {
      return res.json({ translation: "" });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API anahtarı bulunamadı! .env dosyasındaki GEMINI_API_KEY değerini kontrol edin."
      });
    }

    // Önbellek anahtarı
    const cacheKey = `${text.trim()}__${sourceLang}__${targetLang}__${domain}__${tone}__${glossary || ''}`;
    if (cache.has(cacheKey)) {
      return res.json({ translation: cache.get(cacheKey), cached: true });
    }

    // Terimce (Glossary) çözümleme
    let glossaryInstructions = "";
    if (glossary && glossary.trim()) {
      const lines = glossary.split('\n');
      const terms = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed.includes('=')) {
          const [src, tgt] = trimmed.split('=').map(s => s.trim());
          if (src && tgt) terms.push(`- "${src}" -> "${tgt}"`);
        }
      }
      if (terms.length > 0) {
        glossaryInstructions = `ZORUNLU TERİMCE:\n${terms.join('\n')}\n`;
      }
    }

    const systemInstruction = `Sen hızlı ve profesyonel bir çevirmensin. Verilen metni ${sourceLang || 'otomatik dilden'} ${targetLang || 'Türkçe'} diline doğrudan çevir.
Alan: ${domainDescriptions[domain] || domainDescriptions.genel}
Üslup: ${toneDescriptions[tone] || toneDescriptions.resmi}
${glossaryInstructions}
KURAL: Sadece hedef çeviriyi ver. Açıklama, tırnak ya da selamlama ASLA yazma.`;

    // 3 Modeli Aynı Anda Çağır (Hangisi ilk gelirse kazanan odur)
    const modelPromises = RACE_MODELS.map(m => callSingleModel(m, apiKey, systemInstruction, text));
    
    // Promise.any: İlk başarıyla tamamlanan yanıtı anında alır
    const fastestResult = await Promise.any(modelPromises);

    // Yanıtı önbelleğe kaydet
    if (cache.size > MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(cacheKey, fastestResult.translation);

    return res.json({ 
      translation: fastestResult.translation,
      modelUsed: fastestResult.model 
    });

  } catch (err) {
    console.error("Çeviri Hatası:", err);

    let userFriendlyMessage = "Çeviri yapılamadı.";
    const msg = err.message || "";

    if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
      userFriendlyMessage = "API Anahtarı Geçersiz: Lütfen .env dosyasını kontrol edin.";
    } else if (msg.includes("QUOTA_EXCEEDED") || msg.includes("429")) {
      userFriendlyMessage = "Kota Sınırı Aşıldı (429): Lütfen bir süre sonra tekrar deneyin.";
    } else if (msg.includes("fetch failed") || msg.includes("ENOTFOUND")) {
      userFriendlyMessage = "İnternet Bağlantısı Hatası: Google sunucularına ulaşılamadı.";
    } else {
      userFriendlyMessage = `Hata: ${msg}`;
    }

    return res.status(500).json({ error: userFriendlyMessage });
  }
});

app.listen(port, () => {
  console.log(`🌿 Cottagecore Anlık Çeviri Sunucusu hazır: http://localhost:${port}`);
});
