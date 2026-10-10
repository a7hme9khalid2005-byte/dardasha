import { Router } from 'express';
import https from 'https';
import { GEMINI_API_KEY } from '../config.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Helper function to call Google Gemini API
function callGemini(contents, systemInstruction = null) {
  return new Promise((resolve, reject) => {
    const payload = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const data = JSON.stringify(payload);
    const model = 'gemini-3.8-flash';
    const path = `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const replyText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            resolve(replyText);
          } else {
            console.error('Gemini API Error:', json);
            reject(new Error(json.error?.message || 'فشل الاتصال بنموذج Gemini'));
          }
        } catch (e) {
          reject(new Error('استجابة غير صالحة من خادم الذكاء الاصطناعي'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

// 1. Live Chat with Dardasha AI
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'الرسالة مطلوبة' });
    }

    const systemInstruction = 
      "أنت المساعد الذكي المدمج في منصة (دردشة - Dardasha). " +
      "تتحدث بلغة عربية فصيحة، ودودة، ومحترفة. " +
      "أنت خبير في المساعدة في صياغة الرسائل، الترجمة، تلخيص المحادثات، البرمجة، والرد على الأسئلة بوضوح ودقة.";

    // Build contents array with conversation history
    const contents = [];
    history.slice(-8).forEach(h => {
      if (h.role && h.text) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }
    });

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });

    const reply = await callGemini(contents, systemInstruction);
    res.json({ reply });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: err.message || 'فشلت معالجة رسالة الذكاء الاصطناعي' });
  }
});

// 2. Summarize Chat / Text
router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'النص المطلوب تلخيصه فارغ' });
    }

    const contents = [{
      role: 'user',
      parts: [{
        text: `قم بتلخيص النص التالي أو المحادثة التالية باللغة العربية في نقاط رئيسية واضحة وموجزة تبرز القرارات والمهام والمواعيد إن وجدت:\n\n${text}`
      }]
    }];

    const summary = await callGemini(contents);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message || 'فشل التلخيص' });
  }
});

// 3. Real-time Multi-Language Translation
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang = 'en' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'النص المطلوب ترجمته فارغ' });
    }

    const langNames = {
      en: 'English (الإنجليزية)',
      ar: 'العربية',
      fr: 'Français (الفرنسية)',
      tr: 'Türkçe (التركية)',
      de: 'Deutsch (الألمانية)',
      es: 'Español (الإسبانية)',
      ru: 'Русский (الروسية)',
      zh: '中文 (الصينية)'
    };

    const target = langNames[targetLang] || targetLang;

    const contents = [{
      role: 'user',
      parts: [{
        text: `ترجم النص التالي بدقة وسلاسة إلى لغة (${target}). أعد الترجمة المباشرة فقط بدون أي مقدمات أو تعليقات:\n\n${text}`
      }]
    }];

    const translation = await callGemini(contents);
    res.json({ translation: translation.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message || 'فشلت الترجمة' });
  }
});

// 4. Smart Suggested Replies
router.post('/smart-reply', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'الرسالة مطلوبة' });
    }

    const contents = [{
      role: 'user',
      parts: [{
        text: `بناءً على هذه الرسالة الأخيرة الواردة في المحادثة: "${message}"\nاقترح 3 ردود مختلفة ذكية وطبيعية وسريعة باللغة العربية (رد إيجابي موافق، رد دبلوماسي أو استفسار، رد مرح وودود). ضع كل رد في سطر مستقل مرقم.`
      }]
    }];

    const raw = await callGemini(contents);
    const lines = raw
      .split('\n')
      .map(l => l.replace(/^\d+[\.\-\)]\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(l => l.length > 2)
      .slice(0, 3);

    res.json({ replies: lines });
  } catch (err) {
    res.status(500).json({ error: err.message || 'فشل توليد الردود الذكية' });
  }
});

// 5. Rewrite & Tone Polishing
router.post('/rewrite', async (req, res) => {
  try {
    const { text, tone = 'professional' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'النص مطلوب' });
    }

    const toneDescriptions = {
      professional: 'رسمي واحترافي رفيع المستوى',
      friendly: 'ودود ودافئ مع لمسة مرحة',
      concise: 'موجز ومباشر جداً بدون إطالة',
      persuasive: 'مقنع وحماسي'
    };

    const toneDesc = toneDescriptions[tone] || 'احترافي';

    const contents = [{
      role: 'user',
      parts: [{
        text: `أعد صياغة النص التالي باللغة العربية بأسلوب (${toneDesc}). أعد النص المعاد صياغته فقط:\n\n${text}`
      }]
    }];

    const rewritten = await callGemini(contents);
    res.json({ rewritten: rewritten.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message || 'فشلت إعادة الصياغة' });
  }
});

export default router;
