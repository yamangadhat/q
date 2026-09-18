// ===== التهيئة العامة =====
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavigation();
    initQuranSection();
    initAdhkarSection();
    initFatwaSection();
    initChatSection();
    initScrollAnimations();
});

// ===== شاشة التحميل =====
function initPreloader() {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 2800);
}

// ===== التنقل =====
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // تغيير خلفية النافبار عند التمرير
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // قائمة الجوال
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // إغلاق القائمة عند النقر على رابط
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // تفعيل الرابط النشط بناءً على الموقع
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);

            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

// ===== قسم المصحف =====
function initQuranSection() {
    const surahGrid = document.getElementById('surahGrid');
    const audio = document.getElementById('quranAudio');
    const playPause = document.getElementById('playPause');
    const playPrev = document.getElementById('playPrev');
    const playNext = document.getElementById('playNext');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const playerSurah = document.getElementById('playerSurah');
    const playerReciter = document.getElementById('playerReciter');

    let currentSurah = 0;
    let currentReciter = 'yasser';
    let isPlaying = false;

    // عرض السور
    function renderSurahs() {
        surahGrid.innerHTML = SURAHS.map(surah => `
            <div class="surah-card" data-num="${surah.num}">
                <div class="surah-number">${surah.num}</div>
                <div class="surah-info">
                    <h4>${surah.name}</h4>
                    <span>${surah.ayahs} آية • ${surah.type}</span>
                </div>
            </div>
        `).join('');

        // إضافة حدث النقر
        document.querySelectorAll('.surah-card').forEach(card => {
            card.addEventListener('click', () => {
                const num = parseInt(card.dataset.num);
                playSurah(num);
            });
        });
    }

    // تشغيل سورة
    function playSurah(surahNum) {
        currentSurah = surahNum;
        const surah = SURAHS.find(s => s.num === surahNum);
        const reciter = RECITERS[currentReciter];

        playerSurah.textContent = `سورة ${surah.name}`;
        playerReciter.textContent = `بصوت الشيخ ${reciter.name}`;

        // استخدام رابط الآية الأولى للسورة (للتشغيل الكامل نستخدم رابط السورة كاملة إن وجد)
        // هنا نستخدم رابط الآية الأولى كعينة، وفي الواقع يمكن استخدام روابط السور الكاملة
        const audioUrl = getSurahAudioUrl(currentReciter, surahNum);

        audio.src = audioUrl;
        audio.play().then(() => {
            isPlaying = true;
            playPause.innerHTML = '<i class="fas fa-pause"></i>';
        }).catch(err => {
            console.error('خطأ في التشغيل:', err);
            playerSurah.textContent = 'عذراً، تعذر تشغيل التلاوة';
        });
    }

    // الحصول على رابط الصوت
    function getSurahAudioUrl(reciterKey, surahNum) {
        const reciter = RECITERS[reciterKey];
        // للتشغيل الكامل، نستخدم روابط السور الكاملة للقراء المتاحين
        // هنا نستخدم رابط الآية الأولى كعينة
        return reciter.pattern(surahNum, 1);
    }

    // تبديل التشغيل
    playPause.addEventListener('click', () => {
        if (audio.src) {
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
                playPause.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                audio.play();
                isPlaying = true;
                playPause.innerHTML = '<i class="fas fa-pause"></i>';
            }
        }
    });

    // السورة السابقة
    playPrev.addEventListener('click', () => {
        if (currentSurah > 1) playSurah(currentSurah - 1);
    });

    // السورة التالية
    playNext.addEventListener('click', () => {
        if (currentSurah < 114) playSurah(currentSurah + 1);
    });

    // شريط التقدم
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            durationEl.textContent = formatTime(audio.duration);
        }
    });

    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });

    // اختيار القارئ
    document.querySelectorAll('.reciter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.reciter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentReciter = btn.dataset.reciter;
            if (currentSurah) playSurah(currentSurah);
        });
    });

    renderSurahs();
}

// تنسيق الوقت
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ===== قسم الأذكار =====
function initAdhkarSection() {
    const adhkarList = document.getElementById('adhkarList');
    const tabs = document.querySelectorAll('.adhkar-tab');

    function renderAdhkar(category) {
        const data = ADHKAR_DATA[category] || [];
        adhkarList.innerHTML = data.map((dhikr, index) => `
            <div class="adhkar-card" style="animation-delay: ${index * 0.1}s">
                <div class="adhkar-text">${dhikr.text}</div>
                <div class="adhkar-meta">
                    <span class="adhkar-count">${dhikr.count}</span>
                    <span>${dhikr.virtue || ''}</span>
                </div>
            </div>
        `).join('');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderAdhkar(tab.dataset.category);
        });
    });

    // عرض أذكار الصباح افتراضياً
    renderAdhkar('morning');
}

// ===== قسم الفتاوى =====
function initFatwaSection() {
    const fatwaInput = document.getElementById('fatwaInput');
    const fatwaBtn = document.getElementById('fatwaBtn');
    const fatwaAnswer = document.getElementById('fatwaAnswer');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    async function askFatwa(question) {
        if (!question.trim()) return;

        fatwaAnswer.classList.add('show');
        fatwaAnswer.innerHTML = `
            <h3><i class="fas fa-spinner fa-spin"></i> جاري البحث عن الفتوى...</h3>
            <p>يرجى الانتظار، يتم البحث في المصادر الشرعية...</p>
        `;

        const answer = await getFatwa(question);

        fatwaAnswer.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> الإجابة</h3>
            <div style="line-height: 2; white-space: pre-wrap;">${answer}</div>
        `;
    }

    fatwaBtn.addEventListener('click', () => {
        askFatwa(fatwaInput.value);
    });

    fatwaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            askFatwa(fatwaInput.value);
        }
    });

    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            fatwaInput.value = btn.dataset.question;
            askFatwa(btn.dataset.question);
        });
    });
}

// ===== قسم المحادثة =====
function initChatSection() {
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    let chatHistory = [];

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        msgDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">${text}</div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        chatInput.value = '';

        // مؤشر الكتابة
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <i class="fas fa-spinner fa-spin"></i> يكتب...
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const reply = await callGemini(text, chatHistory);

        // إزالة مؤشر الكتابة
        typingDiv.remove();

        addMessage(reply, false);

        // تحديث التاريخ
        chatHistory.push({ role: 'user', text: text });
        chatHistory.push({ role: 'assistant', text: reply });

        // الاحتفاظ بآخر 10 رسائل فقط
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// ===== أنيميشن التمرير =====
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal').forEach(elem => {
        gsap.fromTo(elem,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: elem,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // أنيميشن بطاقات السور
    gsap.utils.toArray('.surah-card').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: i * 0.03,
                scrollTrigger: {
                    trigger: '.surah-grid',
                    start: 'top 80%'
                }
            }
        );
    });
}
