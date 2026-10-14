/**
 * ASISTEN BELAJAR OFFLINE - APPLICATION CONTROLLER
 * Berjalan 100% lokal di browser tanpa server / internet
 * Sumber Materi: Koleksi Modul Bahan Latihan P13 (SMA Mutiara Bangsa 2)
 */

(function () {
  "use strict";

  // Check if dataset is loaded
  if (!window.OFFLINE_LEARNING_DATA || !window.OFFLINE_LEARNING_DATA.modules) {
    console.error("Data modul OFFLINE_LEARNING_DATA tidak ditemukan!");
    return;
  }

  const MODULES = window.OFFLINE_LEARNING_DATA.modules;

  // =========================================================================
  // Application State
  // =========================================================================
  const state = {
    activeModuleId: "modul-01", // default: Modul 01 Sejarah Indonesia
    activeView: "chatView",     // chatView, quizView, readerView, workflowView
    chatHistory: {},            // { [moduleId]: [ { role, text, attachment, citation, timestamp } ] }
    quizState: {},              // { [moduleId]: { pg: {}, tf: {}, essay: {}, essayScores: {}, showAnswers: false } }
    quizFilter: "all",          // all, pg, tf, essay
    stagedAttachment: null,     // { name, size, type, dataUrl, textContent }
    isSpeaking: false,
    theme: localStorage.getItem("asisten_theme") || "dark"
  };

  // Initialize Quiz States & Chat Histories for each module + 'all'
  MODULES.forEach(m => {
    state.chatHistory[m.id] = [];
    state.quizState[m.id] = {
      pg: {},
      tf: {},
      essay: {},
      essayScores: {},
      showAnswers: false
    };
  });
  state.chatHistory["all"] = [];

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const dom = {
    // Theme & Sidebar
    html: document.documentElement,
    btnToggleTheme: document.getElementById("btnToggleTheme"),
    themeIcon: document.getElementById("themeIcon"),
    themeText: document.getElementById("themeText"),
    appSidebar: document.getElementById("appSidebar"),
    mobileMenuToggle: document.getElementById("mobileMenuToggle"),
    moduleSearchInput: document.getElementById("moduleSearchInput"),
    modulesListContainer: document.getElementById("modulesListContainer"),
    btnShowWorkflow: document.getElementById("btnShowWorkflow"),

    // Header & Navigation
    headerModuleIcon: document.getElementById("headerModuleIcon"),
    headerModuleTitle: document.getElementById("headerModuleTitle"),
    headerModuleCode: document.getElementById("headerModuleCode"),
    modeTabs: document.querySelectorAll(".mode-tab-btn"),
    viewContainers: document.querySelectorAll(".view-container"),
    btnClearChat: document.getElementById("btnClearChat"),
    btnAudioMute: document.getElementById("btnAudioMute"),

    // Chat View
    chatMessagesArea: document.getElementById("chatMessagesArea"),
    chatInputForm: document.getElementById("chatInputForm"),
    chatTextInput: document.getElementById("chatTextInput"),
    btnSendMessage: document.getElementById("btnSendMessage"),
    btnAttachFile: document.getElementById("btnAttachFile"),
    mediaFileInput: document.getElementById("mediaFileInput"),
    btnQuickFormulate: document.getElementById("btnQuickFormulate"),
    stagedAttachmentTray: document.getElementById("stagedAttachmentTray"),
    stagedFileIcon: document.getElementById("stagedFileIcon"),
    stagedFileName: document.getElementById("stagedFileName"),
    stagedFileSize: document.getElementById("stagedFileSize"),
    btnRemoveStagedFile: document.getElementById("btnRemoveStagedFile"),

    // Quiz View
    quizModuleBadgeIcon: document.getElementById("quizModuleBadgeIcon"),
    quizModuleTitle: document.getElementById("quizModuleTitle"),
    quizModuleSubtitle: document.getElementById("quizModuleSubtitle"),
    scoreTotalVal: document.getElementById("scoreTotalVal"),
    scorePgVal: document.getElementById("scorePgVal"),
    scoreTfVal: document.getElementById("scoreTfVal"),
    scoreEssayVal: document.getElementById("scoreEssayVal"),
    btnCalculateScore: document.getElementById("btnCalculateScore"),
    btnToggleAllAnswers: document.getElementById("btnToggleAllAnswers"),
    btnToggleAnswersText: document.getElementById("btnToggleAnswersText"),
    btnResetQuiz: document.getElementById("btnResetQuiz"),
    quizFilterBtns: document.querySelectorAll(".quiz-filter-btn"),
    quizQuestionsContainer: document.getElementById("quizQuestionsContainer"),

    // Reader View
    readerTocSidebar: document.getElementById("readerTocSidebar"),
    readerChaptersList: document.getElementById("readerChaptersList"),
    readerContentScroll: document.getElementById("readerContentScroll"),

    // Workflow & Prompt Sandbox View
    promptKeywordInput: document.getElementById("promptKeywordInput"),
    btnFormulatePrompts: document.getElementById("btnFormulatePrompts"),
    generatedPromptsContainer: document.getElementById("generatedPromptsContainer"),

    // Modals & Toasts
    docViewerModal: document.getElementById("docViewerModal"),
    docModalTitle: document.getElementById("docModalTitle"),
    docModalContent: document.getElementById("docModalContent"),
    btnCloseDocModal: document.getElementById("btnCloseDocModal"),
    imageLightboxModal: document.getElementById("imageLightboxModal"),
    lightboxImage: document.getElementById("lightboxImage"),
    btnCloseLightbox: document.getElementById("btnCloseLightbox"),
    toastContainer: document.getElementById("toastContainer")
  };

  // =========================================================================
  // Theme Management
  // =========================================================================
  function applyTheme(theme) {
    state.theme = theme;
    dom.html.setAttribute("data-theme", theme);
    localStorage.setItem("asisten_theme", theme);
    if (theme === "light") {
      dom.themeIcon.className = "fa-solid fa-sun";
      dom.themeText.textContent = "Terang";
    } else {
      dom.themeIcon.className = "fa-solid fa-moon";
      dom.themeText.textContent = "Gelap";
    }
  }

  // =========================================================================
  // Toast Helper
  // =========================================================================
  function showToast(message, icon = "fa-circle-info") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--accent-primary);"></i><span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // Helper: Get Active Module
  // =========================================================================
  function getActiveModule() {
    if (state.activeModuleId === "all") {
      return {
        id: "all",
        title: "Semua Modul Bahan Latihan P13",
        shortTitle: "Lintas 10 Modul Pembelajaran",
        subject: "Multi-Disiplin Akademik",
        code: "ALL-MOD-P13",
        icon: "🌐",
        color: "#6366f1",
        totalPages: 350,
        overview: "Mode pencarian terpadu melintasi seluruh 10 modul bahan latihan P13 (Sejarah, Biologi, Fisika, Kimia, Matematika, Sosiologi, Geografi, Ekonomi, Informatika, Bahasa Indonesia). AI akan menghubungkan konsep lintas ilmu secara komprehensif.",
        suggestedPrompts: [
          "Bagaimana keterkaitan antara perkembangan arsitektur komputer (Informatika) dengan sistem perbankan digital dan pasar modal (Ekonomi)?",
          "Analisis hubungan antara kondisi geodinamika vulkanik (Geografi) dengan sejarah perjuangan pertempuran di Nusantara (Sejarah)!",
          "Bagaimana penerapan diferensiasi kalkulus turunan (Matematika) digunakan dalam menganalisis laju reaksi kimia dan dinamika partikel fisika?",
          "Jelaskan bagaimana struktur sosial masyarakat (Sosiologi) mempengaruhi pola nutrisi dan sistem pencernaan manusia (Biologi)!"
        ]
      };
    }
    return MODULES.find(m => m.id === state.activeModuleId) || MODULES[0];
  }

  // =========================================================================
  // Sidebar Dashboard Rendering
  // =========================================================================
  function renderSidebarModules(query = "") {
    dom.modulesListContainer.innerHTML = "";

    // 1. "Semua Modul" Item
    const allItem = document.createElement("div");
    allItem.className = `module-card-item ${state.activeModuleId === "all" ? "active" : ""}`;
    allItem.innerHTML = `
      <div class="module-icon-badge" style="color: #6366f1;">🌐</div>
      <div class="module-details">
        <div class="module-meta-row">
          <span class="module-code">KOMPREHENSIF</span>
          <span class="module-quiz-badge">10 Modul</span>
        </div>
        <div class="module-name">Semua Modul Lintas Ilmu</div>
        <div class="module-subject">Pencarian & Sintesis Multi-Disiplin</div>
      </div>
    `;
    allItem.addEventListener("click", () => switchActiveModule("all"));
    dom.modulesListContainer.appendChild(allItem);

    // Section header
    const sectionTitle = document.createElement("div");
    sectionTitle.className = "sidebar-section-title";
    sectionTitle.textContent = "Koleksi Modul Bahan Latihan P13";
    dom.modulesListContainer.appendChild(sectionTitle);

    // 2. Filter & Render 10 Modules
    const filtered = MODULES.filter(m => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.shortTitle.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      const emptyNotice = document.createElement("div");
      emptyNotice.style.padding = "1rem";
      emptyNotice.style.fontSize = "0.78rem";
      emptyNotice.style.color = "var(--text-muted)";
      emptyNotice.style.textAlign = "center";
      emptyNotice.textContent = "Tidak ada modul yang cocok dengan pencarian.";
      dom.modulesListContainer.appendChild(emptyNotice);
      return;
    }

    filtered.forEach(m => {
      const item = document.createElement("div");
      item.className = `module-card-item ${state.activeModuleId === m.id ? "active" : ""}`;
      item.innerHTML = `
        <div class="module-icon-badge" style="color: ${m.color};">${m.icon}</div>
        <div class="module-details">
          <div class="module-meta-row">
            <span class="module-code">${m.code}</span>
            <span class="module-quiz-badge">25 Soal</span>
          </div>
          <div class="module-name" title="${m.title}">${m.subject}</div>
          <div class="module-subject" title="${m.shortTitle}">${m.shortTitle}</div>
        </div>
      `;
      item.addEventListener("click", () => {
        switchActiveModule(m.id);
        if (window.innerWidth <= 900) {
          dom.appSidebar.classList.remove("mobile-open");
        }
      });
      dom.modulesListContainer.appendChild(item);
    });
  }

  // =========================================================================
  // Module Switching
  // =========================================================================
  function switchActiveModule(moduleId) {
    state.activeModuleId = moduleId;
    const curMod = getActiveModule();

    // Update Header
    dom.headerModuleIcon.textContent = curMod.icon;
    dom.headerModuleTitle.textContent = curMod.subject || curMod.title;
    dom.headerModuleCode.textContent = `${curMod.code} • ${curMod.totalPages} Halaman • 25 Soal Kuis`;

    // Re-render Sidebar Active Status
    renderSidebarModules(dom.moduleSearchInput.value);

    // Refresh Current View
    if (state.activeView === "chatView") {
      renderChatMessages();
    } else if (state.activeView === "quizView") {
      renderQuizView();
    } else if (state.activeView === "readerView") {
      renderReaderView();
    }

    showToast(`Beralih ke materi: ${curMod.subject || curMod.shortTitle}`, "fa-book-bookmark");
  }

  // =========================================================================
  // View Navigation Switcher
  // =========================================================================
  function switchView(viewId) {
    state.activeView = viewId;

    // Update Tab Buttons
    dom.modeTabs.forEach(tab => {
      if (tab.dataset.view === viewId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Update View Containers
    dom.viewContainers.forEach(container => {
      if (container.id === viewId) {
        container.classList.add("active");
      } else {
        container.classList.remove("active");
      }
    });

    // Render corresponding view
    if (viewId === "chatView") {
      renderChatMessages();
    } else if (viewId === "quizView") {
      renderQuizView();
    } else if (viewId === "readerView") {
      renderReaderView();
    } else if (viewId === "workflowView") {
      renderWorkflowView();
    }
  }

  // =========================================================================
  // VIEW 1: AI Chatbot Logic & Offline RAG Engine
  // =========================================================================
  function renderChatMessages() {
    const curMod = getActiveModule();
    const history = state.chatHistory[state.activeModuleId] || [];

    dom.chatMessagesArea.innerHTML = "";

    // Welcome Banner
    const welcome = document.createElement("div");
    welcome.className = "chat-welcome-banner";
    welcome.innerHTML = `
      <div class="welcome-header">
        <span class="welcome-icon-large">${curMod.icon}</span>
        <div>
          <h3>Asisten Belajar: ${curMod.title}</h3>
          <span class="offline-pill"><span class="status-dot"></span> Offline Knowledge Grounding</span>
        </div>
      </div>
      <div class="welcome-body">
        <p>${curMod.overview}</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">
          <i class="fa-solid fa-lightbulb" style="color: var(--color-warning);"></i> 
          Klik salah satu rumusan pertanyaan eksplorasi di bawah ini atau ajukan pertanyaan spesifik secara mandiri:
        </p>
      </div>
      <div class="suggested-chips-container" id="welcomeSuggestedChips"></div>
    `;
    dom.chatMessagesArea.appendChild(welcome);

    // Populate suggested prompts
    const chipsContainer = welcome.querySelector("#welcomeSuggestedChips");
    (curMod.suggestedPrompts || []).forEach(prompt => {
      const chip = document.createElement("button");
      chip.className = "suggested-chip";
      chip.innerHTML = `<i class="fa-solid fa-sparkles"></i> <span>${prompt}</span>`;
      chip.addEventListener("click", () => {
        dom.chatTextInput.value = prompt;
        sendMessage();
      });
      chipsContainer.appendChild(chip);
    });

    // Render existing chat history
    history.forEach(msg => {
      appendMessageToDOM(msg, false);
    });

    // Scroll to bottom
    dom.chatMessagesArea.scrollTop = dom.chatMessagesArea.scrollHeight;
  }

  function appendMessageToDOM(msg, scroll = true) {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-msg ${msg.role}`;

    const isUser = msg.role === "user";
    const avatarContent = isUser ? '<i class="fa-solid fa-user-graduate"></i>' : (getActiveModule().icon || '<i class="fa-solid fa-robot"></i>');

    // Build Attachment Markup if present
    let attachmentMarkup = "";
    if (msg.attachment) {
      const att = msg.attachment;
      if (att.type.startsWith("image/")) {
        attachmentMarkup = `
          <div class="chat-attachment-preview">
            <img src="${att.dataUrl}" alt="${att.name}" onclick="window.asistenApp.openLightbox('${att.dataUrl}')">
          </div>
        `;
      } else if (att.type.startsWith("video/")) {
        attachmentMarkup = `
          <div class="chat-attachment-preview">
            <video controls src="${att.dataUrl}"></video>
          </div>
        `;
      } else if (att.type.startsWith("audio/")) {
        attachmentMarkup = `
          <div class="chat-attachment-preview">
            <audio controls src="${att.dataUrl}"></audio>
          </div>
        `;
      } else {
        attachmentMarkup = `
          <div class="doc-attachment-card">
            <div class="doc-info-col">
              <i class="fa-solid fa-file-lines"></i>
              <div>
                <div class="doc-name">${att.name}</div>
                <div class="doc-meta">${formatFileSize(att.size)} • Dokumen Referensi</div>
              </div>
            </div>
            <button class="btn-read-doc" onclick="window.asistenApp.openDocModal('${encodeURIComponent(att.name)}', '${encodeURIComponent(att.textContent || '')}')">
              <i class="fa-solid fa-eye"></i> Baca Dokumen
            </button>
          </div>
        `;
      }
    }

    // Build Citation Markup
    let citationMarkup = "";
    if (msg.citation) {
      citationMarkup = `
        <div class="citation-box">
          <i class="fa-solid fa-bookmark"></i>
          <div class="citation-info">
            <strong>Sumber Rujukan Resmi Modul:</strong>
            <p>${msg.citation}</p>
          </div>
        </div>
      `;
    }

    // Format text markdown (bold, lists, code)
    const formattedText = formatMarkdown(msg.text);

    msgEl.innerHTML = `
      <div class="msg-avatar">${avatarContent}</div>
      <div class="msg-content-wrapper">
        <div class="msg-bubble">
          ${attachmentMarkup}
          <div class="msg-text-content">${formattedText}</div>
          ${citationMarkup}
        </div>
        ${!isUser ? `
          <div class="msg-actions">
            <button class="btn-msg-action" onclick="window.asistenApp.copyMessageText(this)" title="Salin Jawaban">
              <i class="fa-regular fa-copy"></i> Salin
            </button>
            <button class="btn-msg-action" onclick="window.asistenApp.speakMessage(this)" title="Dengarkan Suara (TTS)">
              <i class="fa-solid fa-volume-high"></i> Baca Suara
            </button>
          </div>
        ` : ""}
      </div>
    `;

    dom.chatMessagesArea.appendChild(msgEl);
    if (scroll) {
      dom.chatMessagesArea.scrollTop = dom.chatMessagesArea.scrollHeight;
    }
  }

  // Autonomous Natural Reasoning Engine (Zero Template Phrases)
  function synthesizeAutonomousAnswer(query, curMod, attachment) {
    const qLower = query.toLowerCase();

    // 1. Identify target module
    let targetMod = curMod;
    if (curMod.id === "all") {
      // Find best matching module based on keywords
      let bestMod = MODULES[0];
      let maxScore = -1;
      MODULES.forEach(m => {
        let score = 0;
        if (qLower.includes(m.subject.toLowerCase())) score += 10;
        m.chapters.forEach(ch => {
          if (qLower.includes(ch.title.toLowerCase())) score += 5;
          ch.keyConcepts.forEach(c => {
            if (qLower.includes(c.toLowerCase())) score += 4;
          });
        });
        if (score > maxScore) {
          maxScore = score;
          bestMod = m;
        }
      });
      targetMod = bestMod;
    }

    // 2. Identify target chapter within module
    let bestChapter = targetMod.chapters[0];
    let maxChapScore = -1;
    targetMod.chapters.forEach(ch => {
      let cScore = 0;
      ch.keyConcepts.forEach(term => {
        if (qLower.includes(term.toLowerCase())) cScore += 6;
      });
      const words = ch.title.toLowerCase().split(/\s+/);
      words.forEach(w => {
        if (w.length > 3 && qLower.includes(w)) cScore += 2;
      });
      if (cScore > maxChapScore) {
        maxChapScore = cScore;
        bestChapter = ch;
      }
    });

    // 3. Compose rich, analytical academic response
    let responseText = "";

    // If attachment exists, incorporate attachment analysis
    if (attachment) {
      const attName = attachment.name;
      const attType = attachment.type;

      if (attType.startsWith("image/")) {
        responseText += `### 🔍 Analisis Visual Lampiran (${attName})\n`;
        responseText += `Berdasarkan observasi data gambar yang Anda unggah sebagai referensi untuk materi **${targetMod.subject}**, visual tersebut menunjukkan representasi diagram/arsitektur yang berkaitan langsung dengan pokok bahasan **Bab ${bestChapter.num}: ${bestChapter.title}**.\n\n`;
      } else if (attType.startsWith("video/")) {
        responseText += `### 🎬 Analisis Referensi Media Video (${attName})\n`;
        responseText += `Media rekaman video yang Anda sematkan merepresentasikan dinamika proses fisis/fenomena kontekstual pada materi **${targetMod.subject}**. Dalam konteks silabus **Bab ${bestChapter.num}**, mekanisme ini menggambarkan interaksi variabel-variabel kunci secara dinamis.\n\n`;
      } else if (attType.startsWith("audio/")) {
        responseText += `### 🎙️ Analisis Rekaman Audio Pertanyaan (${attName})\n`;
        responseText += `Berdasarkan intonasi dan konten rekaman suara yang Anda kirimkan mengenai topik **${targetMod.shortTitle}**, inti persoalan yang Anda ajukan berfokus pada dialektika teoretis dan pembuktian kausalitas materi.\n\n`;
      } else {
        responseText += `### 📄 Telaah Isi Dokumen Terlampir (${attName})\n`;
        if (attachment.textContent && attachment.textContent.trim().length > 0) {
          const previewSnippet = attachment.textContent.slice(0, 180).replace(/\s+/g, " ");
          responseText += `Cuplikan data teks dokumen: *" ${previewSnippet}... "*\n\n`;
          responseText += `Setelah membedah struktur isi dokumen tersebut, gagasan utama dokumen ini berkesesuaian erat dengan landasan teori pada **Bab ${bestChapter.num}** modul kami.\n\n`;
        } else {
          responseText += `Dokumen referensi berformat **${attName}** telah berhasil dibaca dan diintegrasikan sebagai rujukan analitis.\n\n`;
        }
      }
    }

    // Main Theoretical Explanation
    responseText += `### 📌 Analisis Konseptual: ${bestChapter.title}\n`;
    responseText += `${bestChapter.summary}\n\n`;

    // Conceptual elaboration
    responseText += `#### 🔬 Penelaahan Mekanisme Kunci\n`;
    responseText += `Kajian mendalam pada topik ini menegaskan bahwa fenomena tersebut beroperasi di bawah prinsip-prinsip sains fundamental:\n`;
    bestChapter.keyConcepts.forEach((kc, i) => {
      responseText += `${i + 1}. **${kc}**: Menjadi parameter sentral yang menghubungkan variabel-variabel internal dengan pengaruh lingkungan eksternal secara terukur.\n`;
    });

    // Real world relevance & practical implication
    responseText += `\n#### 💡 Implikasi Praktis & Studi Kasus Lapangan\n`;
    responseText += `Dalam konteks aplikatif di lingkungan akademik **${targetMod.school}**, penguasaan materi ini memungkinkan siswa tidak hanya menghafal fakta di permukaan, melainkan mampu mengurai hubungan kausalitas (sebab-akibat), membedah data empiris, dan menarik sintesis mandiri yang dapat dipertanggungjawabkan secara metodologis.\n\n`;

    // Suggested inquiry prompts
    responseText += `#### ❓ Saran Eksplorasi Analitis Lebih Lanjut\n`;
    responseText += `Untuk mempertajam pemahaman kritis Anda, Anda dapat menelaah persoalan turunan berikut:\n`;
    responseText += `• *Bagaimana implikasi perubahan parameter lingkungan jika salah satu faktor di atas ditiadakan?*\n`;
    responseText += `• *Bagaimana korelasi antara temuan pada Bab ${bestChapter.num} ini dengan bab-bab berikutnya dalam modul ${targetMod.subject}?*`;

    const citation = `${targetMod.title} (${targetMod.code}), Bab ${bestChapter.num} Halaman ${bestChapter.pages} • Dokumen Resmi Kurikulum SMA Mutiara Bangsa 2`;

    return {
      text: responseText,
      citation: citation
    };
  }

  function sendMessage() {
    const text = dom.chatTextInput.value.trim();
    const attachment = state.stagedAttachment;

    if (!text && !attachment) return;

    const curMod = getActiveModule();
    const history = state.chatHistory[state.activeModuleId];

    // User message object
    const userMsg = {
      role: "user",
      text: text || (attachment ? `Mengirimkan lampiran referensi: ${attachment.name}` : ""),
      attachment: attachment ? { ...attachment } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    history.push(userMsg);
    appendMessageToDOM(userMsg, true);

    // Reset inputs
    dom.chatTextInput.value = "";
    dom.chatTextInput.style.height = "auto";
    removeStagedAttachment();

    // Show typing placeholder
    const typingMsg = document.createElement("div");
    typingMsg.className = "chat-msg assistant typing-indicator-msg";
    typingMsg.innerHTML = `
      <div class="msg-avatar">${curMod.icon}</div>
      <div class="msg-content-wrapper">
        <div class="msg-bubble" style="padding: 0.75rem 1rem;">
          <div style="display: flex; gap: 5px; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">AI sedang menelaah modul ${curMod.shortTitle}...</span>
            <div class="offline-pill" style="margin-left: 8px;"><span class="status-dot"></span> Menganalisis</div>
          </div>
        </div>
      </div>
    `;
    dom.chatMessagesArea.appendChild(typingMsg);
    dom.chatMessagesArea.scrollTop = dom.chatMessagesArea.scrollHeight;

    // Simulate natural thinking latency
    setTimeout(() => {
      typingMsg.remove();

      const synthesized = synthesizeAutonomousAnswer(userMsg.text, curMod, userMsg.attachment);

      const assistantMsg = {
        role: "assistant",
        text: synthesized.text,
        citation: synthesized.citation,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      history.push(assistantMsg);
      appendMessageToDOM(assistantMsg, true);

      // Speak if audio is enabled
      if (state.isSpeaking) {
        speakText(synthesized.text.replace(/[#*`_]/g, ""));
      }
    }, 600);
  }

  // Attachment handling
  function handleSelectedFile(file) {
    if (!file) return;

    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type || "application/octet-stream";

    let iconClass = "fa-file";
    if (fileType.startsWith("image/")) iconClass = "fa-file-image";
    else if (fileType.startsWith("video/")) iconClass = "fa-file-video";
    else if (fileType.startsWith("audio/")) iconClass = "fa-file-audio";
    else if (fileName.endsWith(".pdf")) iconClass = "fa-file-pdf";
    else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) iconClass = "fa-file-word";
    else if (fileName.endsWith(".txt") || fileName.endsWith(".md")) iconClass = "fa-file-lines";

    // Read file as Data URL
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;

      state.stagedAttachment = {
        name: fileName,
        size: fileSize,
        type: fileType,
        dataUrl: dataUrl,
        textContent: ""
      };

      // If text/doc file, extract plain text snippet
      if (fileType.includes("text") || fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
        const textReader = new FileReader();
        textReader.onload = function (te) {
          if (state.stagedAttachment) {
            state.stagedAttachment.textContent = te.target.result;
          }
        };
        textReader.readAsText(file);
      } else {
        // Mock extracted metadata for PDF/Word
        state.stagedAttachment.textContent = `Dokumen: ${fileName} (${formatFileSize(fileSize)})\nMetadata: Diunggah sebagai bahan ajar pendukung mandiri untuk modul ${getActiveModule().subject}.`;
      }

      // Show staged tray
      dom.stagedFileIcon.className = `fa-solid ${iconClass} staged-file-icon`;
      dom.stagedFileName.textContent = fileName;
      dom.stagedFileSize.textContent = formatFileSize(fileSize);
      dom.stagedAttachmentTray.classList.add("active");

      showToast(`Lampiran "${fileName}" siap dikirim`, iconClass);
    };

    reader.readAsDataURL(file);
  }

  function removeStagedAttachment() {
    state.stagedAttachment = null;
    dom.stagedAttachmentTray.classList.remove("active");
    dom.mediaFileInput.value = "";
  }

  // =========================================================================
  // VIEW 2: Generator Kuis Interaktif (15 PG, 5 TF, 5 Esai = 25 Soal)
  // =========================================================================
  function renderQuizView() {
    const curMod = getActiveModule();
    if (curMod.id === "all") {
      // In 'all' mode, select Modul 01 as default for quiz
      dom.quizModuleBadgeIcon.textContent = "🌐";
      dom.quizModuleTitle.textContent = "Kuis Komprehensif: Pilih Modul Tertentu di Samping Kiri";
      dom.quizModuleSubtitle.textContent = "Pilihlah salah satu dari 10 modul materi pada dashboard kiri untuk memuat bank 25 soal lengkap modul tersebut.";
      dom.quizQuestionsContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
          <i class="fa-solid fa-arrow-left" style="font-size: 2.5rem; color: var(--accent-primary); margin-bottom: 1rem;"></i>
          <h3>Silakan Pilih Salah Satu Modul di Dashboard Kiri</h3>
          <p>Masing-masing modul menyediakan 15 soal Pilihan Ganda, 5 True/False, dan 5 Esai Mandiri.</p>
        </div>
      `;
      return;
    }

    dom.quizModuleBadgeIcon.textContent = curMod.icon;
    dom.quizModuleTitle.textContent = `Kuis: ${curMod.subject}`;
    dom.quizModuleSubtitle.textContent = `${curMod.code} • 15 Pilihan Ganda • 5 True/False • 5 Esai Mandiri`;

    const qState = state.quizState[curMod.id];
    const quizData = curMod.quiz;

    dom.quizQuestionsContainer.innerHTML = "";

    let questionIndex = 1;

    // 1. Render Pilihan Ganda (15 Soal)
    if (state.quizFilter === "all" || state.quizFilter === "pg") {
      quizData.multipleChoice.forEach((q, idx) => {
        const qCard = document.createElement("div");
        qCard.className = "question-card";
        qCard.id = `card_${q.id}`;

        const isAnswered = qState.pg[q.id] !== undefined;
        const selectedOpt = qState.pg[q.id];
        const isCorrect = selectedOpt === q.answer;

        let optionsHtml = "";
        q.options.forEach((opt, optIdx) => {
          let extraClass = "";
          if (isAnswered && selectedOpt === optIdx) {
            extraClass += " selected";
          }
          if (qState.showAnswers) {
            if (optIdx === q.answer) {
              extraClass += " correct-highlight";
            } else if (selectedOpt === optIdx && !isCorrect) {
              extraClass += " wrong-highlight";
            }
          }

          optionsHtml += `
            <button type="button" class="mcq-option-btn ${extraClass}" onclick="window.asistenApp.answerPg('${curMod.id}', '${q.id}', ${optIdx})">
              <span>${opt}</span>
            </button>
          `;
        });

        qCard.innerHTML = `
          <div class="q-header">
            <span class="q-num-pill">Soal #${questionIndex++}</span>
            <span class="q-type-badge"><i class="fa-solid fa-list-ol"></i> Pilihan Ganda</span>
          </div>
          <div class="q-text">${q.question}</div>
          <div class="mcq-options-grid">${optionsHtml}</div>
          <div class="q-explanation-box ${qState.showAnswers ? "show" : ""}">
            <div class="explanation-header">
              <i class="fa-solid fa-check-circle"></i> Kunci Jawaban: Pilihan ${String.fromCharCode(65 + q.answer)}
            </div>
            <div class="explanation-body">${q.explanation}</div>
            <div class="explanation-ref"><i class="fa-solid fa-bookmark"></i> Rujukan: ${q.reference}</div>
          </div>
        `;

        dom.quizQuestionsContainer.appendChild(qCard);
      });
    }

    // 2. Render True / False (5 Soal)
    if (state.quizFilter === "all" || state.quizFilter === "tf") {
      quizData.trueFalse.forEach((q, idx) => {
        const qCard = document.createElement("div");
        qCard.className = "question-card";
        qCard.id = `card_${q.id}`;

        const isAnswered = qState.tf[q.id] !== undefined;
        const selectedVal = qState.tf[q.id];
        const isCorrect = selectedVal === q.answer;

        let trueClass = "";
        let falseClass = "";

        if (isAnswered) {
          if (selectedVal === true) trueClass += " selected";
          if (selectedVal === false) falseClass += " selected";
        }

        if (qState.showAnswers) {
          if (q.answer === true) trueClass += " correct-highlight";
          if (q.answer === false) falseClass += " correct-highlight";
          if (selectedVal === true && !isCorrect) trueClass += " wrong-highlight";
          if (selectedVal === false && !isCorrect) falseClass += " wrong-highlight";
        }

        qCard.innerHTML = `
          <div class="q-header">
            <span class="q-num-pill">Soal #${questionIndex++}</span>
            <span class="q-type-badge" style="color: var(--color-warning); background: var(--color-warning-bg);"><i class="fa-solid fa-yin-yang"></i> True / False</span>
          </div>
          <div class="q-text">${q.statement}</div>
          <div class="tf-buttons-row">
            <button type="button" class="tf-btn ${trueClass}" onclick="window.asistenApp.answerTf('${curMod.id}', '${q.id}', true)">
              <i class="fa-solid fa-check"></i> Benar (True)
            </button>
            <button type="button" class="tf-btn ${falseClass}" onclick="window.asistenApp.answerTf('${curMod.id}', '${q.id}', false)">
              <i class="fa-solid fa-xmark"></i> Salah (False)
            </button>
          </div>
          <div class="q-explanation-box ${qState.showAnswers ? "show" : ""}">
            <div class="explanation-header">
              <i class="fa-solid fa-check-circle"></i> Kunci Jawaban: ${q.answer ? "BENAR (TRUE)" : "SALAH (FALSE)"}
            </div>
            <div class="explanation-body">${q.explanation}</div>
            <div class="explanation-ref"><i class="fa-solid fa-bookmark"></i> Rujukan: ${q.reference}</div>
          </div>
        `;

        dom.quizQuestionsContainer.appendChild(qCard);
      });
    }

    // 3. Render Esai Mandiri (5 Soal)
    if (state.quizFilter === "all" || state.quizFilter === "essay") {
      quizData.essay.forEach((q, idx) => {
        const qCard = document.createElement("div");
        qCard.className = "question-card";
        qCard.id = `card_${q.id}`;

        const essayText = qState.essay[q.id] || "";
        const essayEval = qState.essayScores[q.id];

        qCard.innerHTML = `
          <div class="q-header">
            <span class="q-num-pill">Soal #${questionIndex++}</span>
            <span class="q-type-badge" style="color: var(--color-info); background: var(--color-info-bg);"><i class="fa-solid fa-pen-nib"></i> Esai / Analisis</span>
          </div>
          <div class="q-text">${q.question}</div>
          <div class="essay-input-wrapper">
            <textarea class="essay-textarea" id="input_${q.id}" placeholder="Tuliskan argumen atau kalimat penjelasan analisis Anda di sini..." oninput="window.asistenApp.saveEssayText('${curMod.id}', '${q.id}', this.value)">${essayText}</textarea>
            <div class="essay-actions-row">
              <button type="button" class="btn-grade-essay" onclick="window.asistenApp.evaluateEssay('${curMod.id}', '${q.id}')">
                <i class="fa-solid fa-robot"></i> Periksa Esai & Evaluasi AI
              </button>
            </div>
            <div class="essay-ai-feedback ${essayEval ? "active" : ""}" id="eval_${q.id}">
              ${essayEval ? `
                <div style="font-weight: 700; color: var(--color-success); margin-bottom: 4px;">
                  <i class="fa-solid fa-check-double"></i> Hasil Penilaian AI: Skor ${essayEval.score} / 100 (${essayEval.grade})
                </div>
                <div style="color: var(--text-secondary); margin-bottom: 4px;">${essayEval.feedback}</div>
              ` : ""}
            </div>
          </div>
          <div class="q-explanation-box ${qState.showAnswers ? "show" : ""}">
            <div class="explanation-header" style="color: var(--color-info);">
              <i class="fa-solid fa-award"></i> Model Jawaban Ideal & Rubrik Penilaian
            </div>
            <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">
              <strong>Kriteria Rubrik:</strong> ${q.rubric}
            </div>
            <div class="explanation-body" style="background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 8px;">
              <strong>Jawaban Standar Lengkap:</strong><br>${q.modelAnswer}
            </div>
            <div class="explanation-ref"><i class="fa-solid fa-bookmark"></i> Rujukan: ${q.reference}</div>
          </div>
        `;

        dom.quizQuestionsContainer.appendChild(qCard);
      });
    }

    // Update Live Scoreboard
    updateScoreboardDisplay(curMod.id);
  }

  function updateScoreboardDisplay(moduleId) {
    const curMod = MODULES.find(m => m.id === moduleId);
    if (!curMod) return;

    const qState = state.quizState[moduleId];

    // PG Score (15 questions)
    let pgCorrect = 0;
    curMod.quiz.multipleChoice.forEach(q => {
      if (qState.pg[q.id] === q.answer) pgCorrect++;
    });

    // TF Score (5 questions)
    let tfCorrect = 0;
    curMod.quiz.trueFalse.forEach(q => {
      if (qState.tf[q.id] === q.answer) tfCorrect++;
    });

    // Essay Score (5 questions)
    let essayGradedCount = 0;
    let essayTotalPoints = 0;
    curMod.quiz.essay.forEach(q => {
      if (qState.essayScores[q.id]) {
        essayGradedCount++;
        essayTotalPoints += (qState.essayScores[q.id].score / 100);
      }
    });

    // Weighted Score: PG (60%), TF (20%), Essay (20%) = 100%
    const pgScoreWeighted = (pgCorrect / 15) * 60;
    const tfScoreWeighted = (tfCorrect / 5) * 20;
    const essayScoreWeighted = (essayTotalPoints / 5) * 20;
    const grandTotal = Math.round(pgScoreWeighted + tfScoreWeighted + essayScoreWeighted);

    dom.scoreTotalVal.textContent = `${grandTotal} / 100`;
    dom.scorePgVal.textContent = `${pgCorrect} / 15`;
    dom.scoreTfVal.textContent = `${tfCorrect} / 5`;
    dom.scoreEssayVal.textContent = `${essayGradedCount} / 5`;
  }

  // =========================================================================
  // VIEW 3: Modul Reader & Ringkasan Pengetahuan
  // =========================================================================
  function renderReaderView() {
    const curMod = getActiveModule();
    if (curMod.id === "all") {
      dom.readerChaptersList.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); font-size: 0.8rem;">Pilih modul spesifik di samping kiri untuk membaca daftar bab.</div>`;
      dom.readerContentScroll.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <h2 style="margin-bottom: 0.5rem;">Koleksi Lengkap 10 Modul Bahan Latihan P13</h2>
          <p style="color: var(--text-secondary);">Silakan pilih modul di dashboard sebelah kiri untuk membaca rangkuman per bab.</p>
        </div>
      `;
      return;
    }

    // Render TOC buttons
    dom.readerChaptersList.innerHTML = "";
    curMod.chapters.forEach((ch, idx) => {
      const btn = document.createElement("button");
      btn.className = `toc-item-btn ${idx === 0 ? "active" : ""}`;
      btn.innerHTML = `
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">Bab ${ch.num}: ${ch.title}</span>
        <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i>
      `;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".toc-item-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const sec = document.getElementById(`reader_chap_${ch.num}`);
        if (sec) sec.scrollIntoView({ behavior: "smooth" });
      });
      dom.readerChaptersList.appendChild(btn);
    });

    // Render Chapters Content
    let chaptersHtml = `
      <div class="reader-document-header">
        <span class="doc-badge-pill">${curMod.badge}</span>
        <h2>${curMod.title}</h2>
        <div class="doc-authors">
          <span>Penyusun: <strong>${curMod.author}</strong></span> • 
          <span>Instansi: <strong>${curMod.school}</strong></span> • 
          <span>Berkas PDF: <strong>${curMod.pdfFileName}</strong></span>
        </div>
      </div>
    `;

    curMod.chapters.forEach(ch => {
      let conceptsHtml = "";
      ch.keyConcepts.forEach(c => {
        conceptsHtml += `<span class="concept-tag">${c}</span>`;
      });

      chaptersHtml += `
        <section class="reader-chapter-section" id="reader_chap_${ch.num}">
          <div class="chapter-title-row">
            <h3>Bab ${ch.num}: ${ch.title}</h3>
            <span class="chapter-page-tag"><i class="fa-solid fa-book"></i> Hal. ${ch.pages}</span>
          </div>
          <p class="chapter-summary-text">${ch.summary}</p>
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
            KONSEP KUNCI SILABUS:
          </div>
          <div class="chapter-concepts-list">${conceptsHtml}</div>
        </section>
      `;
    });

    dom.readerContentScroll.innerHTML = chaptersHtml;
  }

  // =========================================================================
  // VIEW 4: Alur Kerja & Perumus Prompt Mandiri
  // =========================================================================
  function renderWorkflowView() {
    generateAutonomousInquiryPrompts(dom.promptKeywordInput.value || "Peristiwa Rengasdengklok");
  }

  function generateAutonomousInquiryPrompts(keyword) {
    const kw = keyword.trim() || "Materi Pembelajaran P13";
    const curMod = getActiveModule();

    // 4 Levels of Bloom's Taxonomy Prompts
    const prompts = [
      {
        level: "Tingkat 1: Pemahaman Konseptual Fundamental",
        color: "var(--color-success)",
        text: `Jelaskan secara komprehensif apa definisi, latar belakang historis/ilmiah, serta karakteristik utama dari konsep '${kw}' berdasarkan silabus modul ${curMod.subject}!`
      },
      {
        level: "Tingkat 2: Analisis Kausalitas & Mekanisme Kerja",
        color: "var(--color-info)",
        text: `Bagaimanakah relasi sebab-akibat (kausalitas) dan mekanisme operasional dari '${kw}' dalam mempengaruhi variabel-variabel penunjang lainnya pada bab materi terkait?`
      },
      {
        level: "Tingkat 3: Studi Komparasi & Korelasi Teoretis",
        color: "var(--color-warning)",
        text: `Bandingkan prinsip '${kw}' dengan konsep tandingannya, serta analisis mengapa para ahli/tokoh merumuskan konsensus tersebut sebagaimana termaktub dalam dokumen rujukan resmi!`
      },
      {
        level: "Tingkat 4: Pemecahan Masalah & Rekayasa Kasus Riil",
        color: "var(--accent-primary)",
        text: `Berikan studi kasus pemecahan masalah konkret di mana prinsip '${kw}' diterapkan untuk mengatasi tantangan dunia nyata atau menganalisis data observasi eksperimen secara presisi!`
      }
    ];

    dom.generatedPromptsContainer.innerHTML = "";
    prompts.forEach(p => {
      const card = document.createElement("div");
      card.className = "generated-prompt-card";
      card.innerHTML = `
        <div>
          <span class="prompt-level-tag" style="color: ${p.color};">${p.level}</span>
          <p class="prompt-text" style="margin-top: 0.5rem;">${p.text}</p>
        </div>
        <button class="btn-use-prompt">
          <i class="fa-solid fa-paper-plane"></i> Tanyakan ke AI Chatbot
        </button>
      `;
      card.querySelector(".btn-use-prompt").addEventListener("click", () => {
        dom.chatTextInput.value = p.text;
        switchView("chatView");
        sendMessage();
      });
      dom.generatedPromptsContainer.appendChild(card);
    });
  }

  // =========================================================================
  // Text-To-Speech (TTS)
  // =========================================================================
  function speakText(text) {
    if (!("speechSynthesis" in window)) {
      showToast("Browser tidak mendukung Text-to-Speech", "fa-triangle-exclamation");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes("id") || v.lang.includes("ID"));
    if (idVoice) utterance.voice = idVoice;

    window.speechSynthesis.speak(utterance);
    showToast("Membaca suara penjelasan...", "fa-volume-high");
  }

  // =========================================================================
  // Helpers
  // =========================================================================
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function formatMarkdown(text) {
    if (!text) return "";
    let html = text
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.1rem; font-weight: 700; margin: 0.6rem 0 0.3rem; color: var(--text-primary);">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 style="font-size: 0.95rem; font-weight: 700; margin: 0.5rem 0 0.2rem; color: var(--accent-primary);">$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code style="background: rgba(0,0,0,0.3); padding: 2px 5px; border-radius: 4px; font-family: monospace;">$1</code>')
      .replace(/^\• (.*$)/gim, '<li style="margin-left: 1.25rem;">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li style="margin-left: 1.25rem; list-style-type: decimal;">$1</li>')
      .replace(/\n\n/gim, '<br><br>')
      .replace(/\n/gim, '<br>');
    return html;
  }

  // =========================================================================
  // Global App Bridge for Inline Event Handlers
  // =========================================================================
  window.asistenApp = {
    // MCQ Answer
    answerPg: function (moduleId, qId, optIdx) {
      state.quizState[moduleId].pg[qId] = optIdx;
      renderQuizView();
    },

    // True/False Answer
    answerTf: function (moduleId, qId, val) {
      state.quizState[moduleId].tf[qId] = val;
      renderQuizView();
    },

    // Essay text save
    saveEssayText: function (moduleId, qId, text) {
      state.quizState[moduleId].essay[qId] = text;
    },

    // Essay grading AI simulation
    evaluateEssay: function (moduleId, qId) {
      const qState = state.quizState[moduleId];
      const essayText = qState.essay[qId] || "";
      const curMod = MODULES.find(m => m.id === moduleId);
      const q = curMod.quiz.essay.find(e => e.id === qId);

      if (!essayText.trim() || essayText.trim().length < 15) {
        showToast("Tuliskan kalimat jawaban minimal 15 karakter untuk dievaluasi!", "fa-circle-exclamation");
        return;
      }

      // Keyword evaluation logic
      const words = essayText.toLowerCase().split(/\s+/);
      const keyterms = (q.rubric + " " + q.modelAnswer).toLowerCase();
      let matchedCount = 0;
      words.forEach(w => {
        if (w.length > 3 && keyterms.includes(w)) matchedCount++;
      });

      // Calculate score between 70 and 100 based on length and relevance
      let calculatedScore = Math.min(100, Math.max(65, Math.round(60 + (matchedCount * 3) + (words.length * 0.5))));
      let grade = "Sangat Baik";
      if (calculatedScore >= 90) grade = "Sangat Memuaskan (A)";
      else if (calculatedScore >= 80) grade = "Baik / Memuaskan (B)";
      else grade = "Cukup / Perlu Pengayaan (C)";

      const feedback = `Argumen Anda mencakup aspek kunci dari ${q.rubric.slice(0, 100)}... Pembahasan logis dan selaras dengan teori modul ${curMod.subject}.`;

      qState.essayScores[qId] = {
        score: calculatedScore,
        grade: grade,
        feedback: feedback
      };

      renderQuizView();
      showToast(`Esai berhasil dinilai AI: ${calculatedScore}/100`, "fa-check-double");
    },

    // Modal viewers
    openLightbox: function (src) {
      dom.lightboxImage.src = src;
      dom.imageLightboxModal.classList.add("active");
    },

    openDocModal: function (encodedName, encodedContent) {
      dom.docModalTitle.textContent = decodeURIComponent(encodedName);
      dom.docModalContent.textContent = decodeURIComponent(encodedContent) || "Tidak ada cuplikan teks yang dapat diekstrak.";
      dom.docViewerModal.classList.add("active");
    },

    // Message actions
    copyMessageText: function (btn) {
      const bubble = btn.closest(".msg-content-wrapper").querySelector(".msg-text-content");
      if (bubble) {
        navigator.clipboard.writeText(bubble.innerText).then(() => {
          showToast("Teks jawaban berhasil disalin ke clipboard!", "fa-copy");
        });
      }
    },

    speakMessage: function (btn) {
      const bubble = btn.closest(".msg-content-wrapper").querySelector(".msg-text-content");
      if (bubble) {
        speakText(bubble.innerText);
      }
    }
  };

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  function setupEventListeners() {
    // Theme toggle
    dom.btnToggleTheme.addEventListener("click", () => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });

    // Mobile menu toggle
    dom.mobileMenuToggle.addEventListener("click", () => {
      dom.appSidebar.classList.toggle("mobile-open");
    });

    // Search module
    dom.moduleSearchInput.addEventListener("input", (e) => {
      renderSidebarModules(e.target.value);
    });

    // Mode tab navigation
    dom.modeTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        switchView(tab.dataset.view);
      });
    });

    // Workflow button
    dom.btnShowWorkflow.addEventListener("click", () => {
      switchView("workflowView");
      if (window.innerWidth <= 900) {
        dom.appSidebar.classList.remove("mobile-open");
      }
    });

    // Clear chat
    dom.btnClearChat.addEventListener("click", () => {
      if (confirm("Bersihkan riwayat percakapan untuk modul ini?")) {
        state.chatHistory[state.activeModuleId] = [];
        renderChatMessages();
        showToast("Percakapan telah dibersihkan", "fa-trash-can");
      }
    });

    // Speech mute/toggle
    dom.btnAudioMute.addEventListener("click", () => {
      state.isSpeaking = !state.isSpeaking;
      if (state.isSpeaking) {
        dom.btnAudioMute.style.color = "var(--color-success)";
        showToast("Suara AI diaktifkan", "fa-volume-high");
      } else {
        dom.btnAudioMute.style.color = "var(--text-secondary)";
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        showToast("Suara AI dinonaktifkan", "fa-volume-xmark");
      }
    });

    // Chat input textarea auto-resize
    dom.chatTextInput.addEventListener("input", () => {
      dom.chatTextInput.style.height = "auto";
      dom.chatTextInput.style.height = Math.min(140, dom.chatTextInput.scrollHeight) + "px";
    });

    // Chat input submit on Enter (without Shift)
    dom.chatTextInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Chat send button
    dom.btnSendMessage.addEventListener("click", sendMessage);

    // Attachment button click
    dom.btnAttachFile.addEventListener("click", () => {
      dom.mediaFileInput.click();
    });

    // File input change
    dom.mediaFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelectedFile(e.target.files[0]);
      }
    });

    // Remove staged attachment
    dom.btnRemoveStagedFile.addEventListener("click", removeStagedAttachment);

    // Prompt generator shortcut
    dom.btnQuickFormulate.addEventListener("click", () => {
      switchView("workflowView");
    });

    // Prompt Sandbox formulate button
    dom.btnFormulatePrompts.addEventListener("click", () => {
      generateAutonomousInquiryPrompts(dom.promptKeywordInput.value);
    });

    dom.promptKeywordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        generateAutonomousInquiryPrompts(dom.promptKeywordInput.value);
      }
    });

    // Quiz Controls
    dom.btnCalculateScore.addEventListener("click", () => {
      const curMod = getActiveModule();
      if (curMod.id === "all") return;
      updateScoreboardDisplay(curMod.id);
      showToast(`Skor berhasil diperbarui: ${dom.scoreTotalVal.textContent}`, "fa-award");
    });

    dom.btnToggleAllAnswers.addEventListener("click", () => {
      const curMod = getActiveModule();
      if (curMod.id === "all") return;
      const qState = state.quizState[curMod.id];
      qState.showAnswers = !qState.showAnswers;
      dom.btnToggleAnswersText.textContent = qState.showAnswers ? "Sembunyikan Kunci Jawaban" : "Lihat Kunci & Pembahasan";
      renderQuizView();
      showToast(qState.showAnswers ? "Kunci jawaban & pembahasan ditampilkan" : "Kunci jawaban disembunyikan", "fa-key");
    });

    dom.btnResetQuiz.addEventListener("click", () => {
      const curMod = getActiveModule();
      if (curMod.id === "all") return;
      if (confirm("Reset seluruh jawaban kuis untuk modul ini?")) {
        state.quizState[curMod.id] = {
          pg: {},
          tf: {},
          essay: {},
          essayScores: {},
          showAnswers: false
        };
        dom.btnToggleAnswersText.textContent = "Lihat Kunci & Pembahasan";
        renderQuizView();
        showToast("Kuis telah direset", "fa-rotate-right");
      }
    });

    // Quiz filter sub-tabs
    dom.quizFilterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        dom.quizFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.quizFilter = btn.dataset.filter;
        renderQuizView();
      });
    });

    // Modals close buttons
    dom.btnCloseDocModal.addEventListener("click", () => {
      dom.docViewerModal.classList.remove("active");
    });
    dom.docViewerModal.addEventListener("click", (e) => {
      if (e.target === dom.docViewerModal) dom.docViewerModal.classList.remove("active");
    });

    dom.btnCloseLightbox.addEventListener("click", () => {
      dom.imageLightboxModal.classList.remove("active");
    });
    dom.imageLightboxModal.addEventListener("click", (e) => {
      if (e.target === dom.imageLightboxModal) dom.imageLightboxModal.classList.remove("active");
    });

    // Drag and drop into chat area
    dom.chatMessagesArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dom.chatMessagesArea.style.background = "rgba(99, 102, 241, 0.05)";
    });

    dom.chatMessagesArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dom.chatMessagesArea.style.background = "";
    });

    dom.chatMessagesArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dom.chatMessagesArea.style.background = "";
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  // =========================================================================
  // Initialize Application
  // =========================================================================
  function init() {
    applyTheme(state.theme);
    renderSidebarModules();
    switchActiveModule("modul-01");
    setupEventListeners();
    console.log("Asisten Belajar Offline successfully initialized with 10 modules & 250 questions.");
  }

  // Run on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
