/**
 * المنطق التفاعلي الرئيسي لمنصة مسابقة التاريخ السعودي
 * مبني بالكامل على النسخة الأصلية المتقنة والمضبوطة (شبكة الأسئلة 1 - 8)
 * مع صفحة ترحيبية موجزة وبطاقة ختامية أنيقة لأسماء الطالبتين والمعلمة والمديرة.
 */

document.addEventListener('DOMContentLoaded', () => {
  // حالة التطبيق (State Management)
  const state = {
    answeredQuestions: new Set(), // أرقام الأسئلة المكتملة
    currentQuestionId: null,
    currentAttempt: 1, // 1 أو 2
    attemptsPerQuestion: {},
    correctCount: 0,
    isSoundMuted: false
  };

  // عناصر واجهة المستخدم
  const screens = {
    landing: document.getElementById('landing-screen'),
    board: document.getElementById('board-screen'),
    question: document.getElementById('question-screen'),
    final: document.getElementById('final-screen')
  };

  const nav = {
    btnStart: document.getElementById('btn-start-quiz'),
    btnBackToBoard: document.getElementById('btn-back-to-board'),
    btnRandomPick: document.getElementById('btn-random-pick'),
    btnRestart: document.getElementById('btn-restart-quiz'),
    btnSoundToggle: document.getElementById('sound-toggle-btn'),
    boardProgressText: document.getElementById('board-progress-text'),
    boardProgressBar: document.getElementById('board-progress-bar'),
    questionsGrid: document.getElementById('questions-grid')
  };

  // عناصر صفحة السؤال
  const qElements = {
    badge: document.getElementById('q-number-badge'),
    title: document.getElementById('q-title-text'),
    attemptBadge: document.getElementById('q-attempt-badge'),
    optionsContainer: document.getElementById('q-options-container'),
    feedbackCard: document.getElementById('q-feedback-card'),
    feedbackTitle: document.getElementById('feedback-title'),
    feedbackMessage: document.getElementById('feedback-message'),
    feedbackExplanation: document.getElementById('feedback-explanation'),
    feedbackBtnNext: document.getElementById('feedback-btn-next')
  };

  // ===================== وظائف التنقل بين الشاشات =====================
  function showScreen(screenKey) {
    soundSystem.playClick();
    Object.values(screens).forEach(screen => {
      screen.classList.remove('active');
    });

    if (screens[screenKey]) {
      screens[screenKey].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (screenKey === 'board') {
      renderBoard();
      celebration.stop();
    } else if (screenKey === 'final') {
      renderFinalScreen();
    }
  }

  // ===================== تحديث ورسم شبكة الأسئلة الأصلية =====================
  function renderBoard() {
    nav.questionsGrid.innerHTML = '';
    const total = quizQuestions.length;
    const completedCount = state.answeredQuestions.size;

    // تحديث شريط التقدم
    const percent = Math.round((completedCount / total) * 100);
    nav.boardProgressText.textContent = `تم إنجاز ${completedCount} من أصل ${total} أسئلة (${percent}%)`;
    nav.boardProgressBar.style.width = `${percent}%`;

    quizQuestions.forEach(q => {
      const isCompleted = state.answeredQuestions.has(q.id);
      const card = document.createElement('div');
      card.className = `question-card ${isCompleted ? 'completed disabled' : 'available'}`;
      card.setAttribute('data-id', q.id);
      card.style.setProperty('--card-theme-color', q.colorTheme.primary);
      card.style.setProperty('--card-light-color', q.colorTheme.light);
      card.style.setProperty('--card-accent-color', q.colorTheme.accent);

      const statusBadge = isCompleted 
        ? `<div class="card-status-pill completed"><span class="check-icon">✓</span> مكتمل</div>`
        : `<div class="card-status-pill available"><span class="star-icon">★</span> جاهز</div>`;

      card.innerHTML = `
        <div class="card-inner">
          <div class="card-number-circle">${q.number}</div>
          <div class="card-info">
            <h3 class="card-title">${q.title}</h3>
            <p class="card-subtitle">${isCompleted ? 'تم إنجاز السؤال وتثبيته' : 'انقري لبدء السؤال'}</p>
          </div>
          ${statusBadge}
        </div>
      `;

      if (!isCompleted) {
        card.addEventListener('click', () => {
          openQuestion(q.id);
        });
      }

      nav.questionsGrid.appendChild(card);
    });

    // إذا تم إنجاز جميع الأسئلة ننتقل تلقائياً للشاشة النهائية
    if (completedCount === total) {
      setTimeout(() => {
        showScreen('final');
      }, 900);
    }
  }

  // زر الاختيار العشوائي الذكي
  if (nav.btnRandomPick) {
    nav.btnRandomPick.addEventListener('click', () => {
      const available = quizQuestions.filter(q => !state.answeredQuestions.has(q.id));
      if (available.length === 0) {
        showScreen('final');
        return;
      }
      soundSystem.playClick();
      const randomQ = available[Math.floor(Math.random() * available.length)];
      openQuestion(randomQ.id);
    });
  }

  // ===================== فتح السؤال المختار =====================
  function openQuestion(questionId) {
    const q = quizQuestions.find(item => item.id === questionId);
    if (!q) return;

    state.currentQuestionId = questionId;
    state.currentAttempt = 1;

    // إعداد بطاقة السؤال
    qElements.badge.textContent = `السؤال رقم ${q.number}`;
    qElements.badge.style.backgroundColor = q.colorTheme.primary;
    qElements.title.textContent = q.question;
    updateAttemptBadge(1);

    // إخفاء بطاقة التغذية الراجعة
    qElements.feedbackCard.classList.remove('show', 'correct', 'incorrect-retry', 'incorrect-final');
    qElements.feedbackCard.style.display = 'none';

    // توليد أزرار الخيارات الأربعة
    qElements.optionsContainer.innerHTML = '';
    const letters = ['أ', 'ب', 'ج', 'د'];

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('data-value', optText);
      btn.innerHTML = `
        <span class="option-letter">${letters[index]}</span>
        <span class="option-text">${optText}</span>
      `;

      btn.addEventListener('click', (e) => {
        handleOptionClick(btn, optText, q, e);
      });

      qElements.optionsContainer.appendChild(btn);
    });

    showScreen('question');
  }

  function updateAttemptBadge(attemptNumber) {
    if (attemptNumber === 1) {
      qElements.attemptBadge.innerHTML = `<span class="pulse-dot"></span> المحاولة الأولى (لديكِ محاولتان)`;
      qElements.attemptBadge.className = 'attempt-badge attempt-first';
    } else {
      qElements.attemptBadge.innerHTML = `<span class="pulse-dot warning"></span> المحاولة الثانية والأخيرة 🎯`;
      qElements.attemptBadge.className = 'attempt-badge attempt-second';
    }
  }

  // ===================== معالجة اختيار الإجابة =====================
  function handleOptionClick(btnElement, selectedValue, question, event) {
    if (btnElement.disabled) return;

    soundSystem.playClick();
    const isCorrect = (selectedValue.trim() === question.correctAnswer.trim());

    if (isCorrect) {
      // ----------------- إجابة صحيحة -----------------
      btnElement.classList.add('correct');
      soundSystem.playCorrect();

      const rect = btnElement.getBoundingClientRect();
      celebration.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

      disableAllOptions();

      state.answeredQuestions.add(question.id);
      state.attemptsPerQuestion[question.id] = {
        attempts: state.currentAttempt,
        answeredCorrectly: true
      };
      state.correctCount++;

      showFeedback({
        type: 'correct',
        title: 'أحسنتِ وأبدعتِ يا بطلة! 🌟',
        message: 'إجابة صحيحة وموفقة بارك الله فيكِ.',
        explanation: question.explanation,
        btnText: 'العودة لشبكة الأسئلة ⬅️'
      });

    } else {
      // ----------------- إجابة خاطئة -----------------
      soundSystem.playWrong();
      btnElement.classList.add('incorrect');
      btnElement.disabled = true;

      if (state.currentAttempt === 1) {
        // المحاولة الأولى: إعطاء محاولة ثانية من نفس الشاشة
        state.currentAttempt = 2;
        updateAttemptBadge(2);

        showFeedback({
          type: 'incorrect-retry',
          title: 'حاولي مرة أخرى يا بطلة! ✨',
          message: 'الإجابة المختارة غير صحيحة، أمامكِ فرصة ثانية لاختيار الإجابة الصحيحة.',
          explanation: question.hint ? `💡 تلميح لمساعدتكِ: ${question.hint}` : '',
          btnText: 'متابعة المحاولة الثانية 🎯'
        });

      } else {
        // المحاولة الثانية والأخيرة
        disableAllOptions();
        highlightCorrectOption(question.correctAnswer);

        state.answeredQuestions.add(question.id);
        state.attemptsPerQuestion[question.id] = {
          attempts: 2,
          answeredCorrectly: false
        };

        showFeedback({
          type: 'incorrect-final',
          title: 'محاولة طيبة يا بطلة! 🤍',
          message: `الإجابة الصحيحة هي: «${question.correctAnswer}»`,
          explanation: question.explanation,
          btnText: 'العودة لشبكة الأسئلة ⬅️'
        });
      }
    }
  }

  function disableAllOptions() {
    const buttons = qElements.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
  }

  function highlightCorrectOption(correctVal) {
    const buttons = qElements.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-value').trim() === correctVal.trim()) {
        btn.classList.add('correct');
      }
    });
  }

  function showFeedback({ type, title, message, explanation, btnText }) {
    qElements.feedbackCard.style.display = 'block';
    qElements.feedbackCard.className = `feedback-card show ${type}`;
    qElements.feedbackTitle.innerHTML = title;
    qElements.feedbackMessage.textContent = message;
    qElements.feedbackExplanation.textContent = explanation || '';
    qElements.feedbackBtnNext.textContent = btnText;

    qElements.feedbackCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  qElements.feedbackBtnNext.addEventListener('click', () => {
    soundSystem.playClick();
    if (qElements.feedbackCard.classList.contains('incorrect-retry')) {
      qElements.feedbackCard.classList.remove('show');
      setTimeout(() => {
        qElements.feedbackCard.style.display = 'none';
      }, 300);
    } else {
      if (state.answeredQuestions.size === quizQuestions.length) {
        showScreen('final');
      } else {
        showScreen('board');
      }
    }
  });

  // ===================== شاشة النهاية: البطاقة الختامية الأنيقة =====================
  function renderFinalScreen() {
    soundSystem.playFanfare();
    celebration.startGrandCelebration();

    const scoreSummary = document.getElementById('final-score-summary');
    if (scoreSummary) {
      scoreSummary.textContent = `أتممتِ بنجاح حل جميع الأسئلة الـ (${quizQuestions.length}) وحصلتِ على ${state.correctCount} إجابات صحيحة`;
    }
  }

  // ===================== ربط أزرار التحكم =====================
  nav.btnSoundToggle.addEventListener('click', () => {
    const muted = soundSystem.toggleMute();
    nav.btnSoundToggle.innerHTML = muted 
      ? '<span class="icon">🔇</span> كتم الصوت' 
      : '<span class="icon">🔊</span> تشغيل الصوت';
    nav.btnSoundToggle.classList.toggle('muted', muted);
  });

  nav.btnStart.addEventListener('click', () => {
    showScreen('board');
  });

  nav.btnBackToBoard.addEventListener('click', () => {
    showScreen('board');
  });

  nav.btnRestart.addEventListener('click', () => {
    if (confirm('هل ترغبين في إعادة المسابقة وتصفير الأسئلة من البداية؟')) {
      state.answeredQuestions.clear();
      state.attemptsPerQuestion = {};
      state.correctCount = 0;
      state.currentQuestionId = null;
      state.currentAttempt = 1;
      celebration.stop();
      showScreen('landing');
    }
  });

  // تفعيل الشاشة الافتتاحية
  showScreen('landing');
});
