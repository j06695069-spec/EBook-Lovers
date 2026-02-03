window.onload = function () {
  // -------------------------------
  // Utility
  // -------------------------------
  function generateSaveCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  // Simple, reliable pagination by character count
  // Tuned to avoid overflow with our page height
  function paginate(text, charsPerPage = 900) {
    const pages = [];
    let current = "";

    for (let i = 0; i < text.length; i++) {
      current += text[i];
      if (current.length >= charsPerPage && text[i] === " ") {
        pages.push(current.trim());
        current = "";
      }
    }
    if (current.trim().length > 0) pages.push(current.trim());
    return pages.length ? pages : [""];
  }

  // -------------------------------
  // State
  // -------------------------------
  let currentPages = [];
  let currentPage = 0;
  let currentDraftCode = null;

  // -------------------------------
  // DOM
  // -------------------------------
  const modeScreen = document.getElementById("mode-screen");
  const writeScreen = document.getElementById("write-screen");
  const readScreen = document.getElementById("read-screen");
  const readerScreen = document.getElementById("reader-screen");

  const writeBtn = document.getElementById("writeModeBtn");
  const readBtn = document.getElementById("readModeBtn");

  const back1 = document.getElementById("backToMenu1");
  const back2 = document.getElementById("backToMenu2");

  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const openDraftBtn = document.getElementById("openDraftBtn");
  const publishBtn = document.getElementById("publishBtn");

  const saveCodeBox = document.getElementById("saveCodeBox");
  const openDraftBox = document.getElementById("openDraftBox");
  const loadDraftBtn = document.getElementById("loadDraftBtn");

  const titleInput = document.getElementById("bookTitle");
  const subtitleInput = document.getElementById("bookSubtitle");
  const authorInput = document.getElementById("bookAuthor");
  const contentInput = document.getElementById("bookContent");

  const fileUpload = document.getElementById("fileUpload");

  const publishedList = document.getElementById("publishedList");

  const readerTitle = document.getElementById("readerTitle");
  const pageBox = document.getElementById("pageBox");
  const pageCountLabel = document.getElementById("pageCountLabel");

  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const goPageBtn = document.getElementById("goPageBtn");
  const pageNumberInput = document.getElementById("pageNumberInput");
  const exitReaderBtn = document.getElementById("exitReaderBtn");

  const unpublishBtn = document.getElementById("unpublishBtn");

  // -------------------------------
  // Navigation
  // -------------------------------
  writeBtn.onclick = () => {
    modeScreen.classList.add("hidden");
    writeScreen.classList.remove("hidden");
  };

  readBtn.onclick = () => {
    modeScreen.classList.add("hidden");
    readScreen.classList.remove("hidden");
    loadPublishedList();
  };

  back1.onclick = back2.onclick = () => {
    writeScreen.classList.add("hidden");
    readScreen.classList.add("hidden");
    readerScreen.classList.add("hidden");
    modeScreen.classList.remove("hidden");
  };

  // -------------------------------
  // File Upload
  // -------------------------------
  fileUpload.onchange = () => {
    const file = fileUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      contentInput.value = e.target.result;
    };
    reader.readAsText(file);
  };

  // -------------------------------
  // Save Draft
  // -------------------------------
  saveDraftBtn.onclick = () => {
    const code = generateSaveCode();

    const draft = {
      title: titleInput.value,
      subtitle: subtitleInput.value,
      author: authorInput.value,
      content: contentInput.value
    };

    localStorage.setItem("draft_" + code, JSON.stringify(draft));
    currentDraftCode = code;

    saveCodeBox.classList.remove("hidden");
    saveCodeBox.innerHTML = `<strong>Your save code:</strong> ${code}<br>Keep this code safe.`;

    showUnpublishButtonIfNeeded();
  };

  // -------------------------------
  // Open Draft
  // -------------------------------
  openDraftBtn.onclick = () => {
    openDraftBox.classList.toggle("hidden");
  };

  loadDraftBtn.onclick = () => {
    const code = document.getElementById("draftCodeInput").value.trim();
    const data = localStorage.getItem("draft_" + code);

    if (!data) {
      alert("No draft found.");
      return;
    }

    const draft = JSON.parse(data);

    titleInput.value = draft.title;
    subtitleInput.value = draft.subtitle;
    authorInput.value = draft.author;
    contentInput.value = draft.content;

    currentDraftCode = code;

    saveCodeBox.classList.remove("hidden");
    saveCodeBox.innerHTML = `<strong>Loaded draft with code:</strong> ${code}`;

    showUnpublishButtonIfNeeded();

    alert("Draft loaded.");
  };

  // -------------------------------
  // Publish Book
  // -------------------------------
  publishBtn.onclick = () => {
    if (!currentDraftCode) {
      const code = generateSaveCode();
      const draft = {
        title: titleInput.value,
        subtitle: subtitleInput.value,
        author: authorInput.value,
        content: contentInput.value
      };
      localStorage.setItem("draft_" + code, JSON.stringify(draft));
      currentDraftCode = code;

      saveCodeBox.classList.remove("hidden");
      saveCodeBox.innerHTML = `<strong>Your save code:</strong> ${code}<br>Keep this code safe.`;
    }

    const book = {
      id: Date.now(),
      title: titleInput.value,
      subtitle: subtitleInput.value,
      author: authorInput.value,
      content: contentInput.value,
      saveCode: currentDraftCode
    };

    const list = JSON.parse(localStorage.getItem("publishedBooks") || "[]");
    list.push(book);
    localStorage.setItem("publishedBooks", JSON.stringify(list));

    showUnpublishButtonIfNeeded();

    alert("Book published!");
  };

  // -------------------------------
  // Unpublish visibility
  // -------------------------------
  function showUnpublishButtonIfNeeded() {
    if (!currentDraftCode) {
      unpublishBtn.classList.add("hidden");
      return;
    }

    const list = JSON.parse(localStorage.getItem("publishedBooks") || "[]");
    const match = list.find(b => b.saveCode === currentDraftCode);

    if (match) {
      unpublishBtn.classList.remove("hidden");
      unpublishBtn.dataset.bookId = match.id;
    } else {
      unpublishBtn.classList.add("hidden");
    }
  }

  // -------------------------------
  // Unpublish
  // -------------------------------
  unpublishBtn.onclick = () => {
    const id = parseInt(unpublishBtn.dataset.bookId);
    let list = JSON.parse(localStorage.getItem("publishedBooks") || "[]");
    list = list.filter(b => b.id !== id);
    localStorage.setItem("publishedBooks", JSON.stringify(list));

    alert("Your book has been unpublished.");

    showUnpublishButtonIfNeeded();
  };

  // -------------------------------
  // Load Published Books
  // -------------------------------
  function loadPublishedList() {
    const list = JSON.parse(localStorage.getItem("publishedBooks") || "[]");

    publishedList.innerHTML = "";

    if (list.length === 0) {
      publishedList.innerHTML = "<p>No books published yet.</p>";
      return;
    }

    list.forEach(book => {
      const container = document.createElement("div");

      const info = document.createElement("div");
      info.style.flex = "1";
      info.innerHTML = `<strong>${book.title}</strong><br>
        <span style="font-size:12px;color:#9ca3af;">
          ${book.author || "Unknown author"}
        </span>`;

      const openBtn = document.createElement("button");
      openBtn.textContent = "Read";
      openBtn.onclick = () => openReader(book);

      container.appendChild(info);
      container.appendChild(openBtn);

      publishedList.appendChild(container);
    });
  }

  // -------------------------------
  // Reader
  // -------------------------------
  function openReader(book) {
    readScreen.classList.add("hidden");
    readerScreen.classList.remove("hidden");

    readerTitle.textContent = book.title;

    currentPages = paginate(book.content);
    currentPage = 0;

    showPage();
  }

  function showPage() {
    pageBox.classList.remove("page");
    void pageBox.offsetWidth;
    pageBox.classList.add("page");

    pageBox.textContent = currentPages[currentPage] || "";
    pageNumberInput.value = currentPage + 1;
    pageCountLabel.textContent = `/ ${currentPages.length || 1}`;
  }

  prevPageBtn.onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      showPage();
    }
  };

  nextPageBtn.onclick = () => {
    if (currentPage < currentPages.length - 1) {
      currentPage++;
      showPage();
    }
  };

  goPageBtn.onclick = () => {
    const num = parseInt(pageNumberInput.value) - 1;
    if (!isNaN(num) && num >= 0 && num < currentPages.length) {
      currentPage = num;
      showPage();
    }
  };

  exitReaderBtn.onclick = () => {
    readerScreen.classList.add("hidden");
    readScreen.classList.remove("hidden");
  };
};