// ===== تكامل Gemini API =====
const GEMINI_API_KEY = 'AQ.Ab8RN6JJ1Np6BZ5Q_FZGelWzQQ-LqUOlZxom2aF06HvP4rKfgQ';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// سياق المساعد الإسلامي
const SYSTEM_PROMPT = `أنت "نور"، مساعد إسلامي ذكي متخصص في:
- الإجابة على الأسئلة الشرعية والفتاوى
- تفسير القرآن الكريم
- شرح الأحاديث النبوية
- أحكام العبادات (الصلاة، الصيام، الزكاة، الحج)
- الأذكار والأدعية
- السيرة النبوية

قواعد مهمة:
1. اجب باللغة العربية الفصحى
2. استند إلى القرآن والسنة والمصادر المعتمدة
3. إذا لم تكن متأكداً من الإجابة، قل ذلك بوضوح
4. استشهد بالأدلة الشرعية عند الإمكان
5. كن لطيفاً ومحترماً في ردودك
6. لا تفتي في مسائل خلافية معقدة، وانصح بسؤال أهل العلم المختصين
7. ابدأ ردودك بالسلام عند الاقتضاء`;

async function callGemini(prompt, history = []) {
    try {
        const contents = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'فهمت. أنا نور، مساعدك الإسلامي. سأجيب على أسئلتك وفقاً للقرآن والسنة. تفضل بسؤالك.' }] }
        ];

        // إضافة تاريخ المحادثة
        history.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        });

        // إضافة الرسالة الحالية
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.9
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'فشل الاتصال بـ Gemini');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الإجابة.';
    } catch (error) {
        console.error('Gemini API Error:', error);
        return `عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.\n\nتفاصيل: ${error.message}`;
    }
}

// طلب فتوى
async function getFatwa(question) {
    const fatwaPrompt = `أجب على السؤال الشرعي التالي بدقة وموضوعية، مع ذكر الأدلة من القرآن والسنة إن أمكن:

السؤال: ${question}

المطلوب:
- حكم شرعي واضح
- الأدلة (آية قرآنية أو حديث نبوي)
- أقوال العلماء إن وجدت
- نصيحة عامة

اكتب الإجابة بشكل منظم ومقروء.`;

    return await callGemini(fatwaPrompt);
}
