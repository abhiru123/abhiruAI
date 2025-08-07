const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");
const savedChatsList = document.getElementById("saved-chats-list");
const newChatBtn = document.getElementById("new-chat-btn");

const API_KEY = "AIzaSyAfgnVp8l8znpKFeebXKCrrMHpL1U5zleo";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let controller, typingInterval;
const userData = { message: "", file: {} };

let chatHistory = []; // Current chat messages (user + bot)

// Load saved chat sessions from localStorage
let savedChats = JSON.parse(localStorage.getItem("savedChats") || "[]");

// Save all chats sidebar UI render
function renderSavedChats() {
  savedChatsList.innerHTML = "";
  if (savedChats.length === 0) {
    savedChatsList.innerHTML = "<li>No saved chats yet.</li>";
    return;
  }
  savedChats.forEach((chatSession, index) => {
    const li = document.createElement("li");
    li.classList.add("saved-chat-item");
    li.textContent = chatSession.title || `Chat ${index + 1}`;
    li.style.cursor = "pointer";
    li.title = "Click to load this chat";

    li.addEventListener("click", () => {
      loadChatSession(index);
      // Highlight selected chat
      document.querySelectorAll(".saved-chat-item").forEach(item => item.classList.remove("selected"));
      li.classList.add("selected");
    });

    // Add a delete button to remove saved chat
    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.title = "Delete chat";
    delBtn.classList.add("delete-chat-btn");
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Delete this saved chat?")) {
        savedChats.splice(index, 1);
        saveSavedChats();
        renderSavedChats();
        // If deleted chat is loaded, clear chat UI
        if (chatHistory.length === 0) {
          chatsContainer.innerHTML = "";
          document.body.classList.remove("chats-active");
        }
      }
    });

    li.appendChild(delBtn);
    savedChatsList.appendChild(li);
  });
}

// Save savedChats array to localStorage
function saveSavedChats() {
  localStorage.setItem("savedChats", JSON.stringify(savedChats));
}

// Load a saved chat session into the chat container
function loadChatSession(index) {
  chatHistory = savedChats[index].chatHistory || [];
  renderChatMessages();
  document.body.classList.add("chats-active");
}

// Render chatHistory messages inside chatsContainer
function renderChatMessages() {
  chatsContainer.innerHTML = "";
  chatHistory.forEach((msg) => {
    let html = "";
    if (msg.role === "user") {
      const text = msg.parts[0]?.text || "";
      const fileData = msg.parts[1]?.inline_data || null;
      html = `
        <p class="message-text">${text}</p>
        ${
          fileData
            ? fileData.isImage
              ? `<img src="data:${fileData.mime_type};base64,${fileData.data}" class="img-attachment" />`
              : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${fileData.fileName}</p>`
            : ""
        }
      `;
      const userDiv = document.createElement("div");
      userDiv.classList.add("message", "user-message");
      userDiv.innerHTML = html;
      chatsContainer.appendChild(userDiv);
    } else if (msg.role === "model") {
      const text = msg.parts[0]?.text || "";
      html = `<img class="avatar" src="gemini.svg" /> <p class="message-text">${text}</p>`;
      const botDiv = document.createElement("div");
      botDiv.classList.add("message", "bot-message");
      botDiv.innerHTML = html;
      chatsContainer.appendChild(botDiv);
    }
  });
  scrollToBottom();
}

// Scroll chat to bottom
function scrollToBottom() {
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
}

// Typing effect for bot message
function typingEffect(text, textElement, botMsgDiv) {
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;

  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
      // Save chat session after bot finished typing
      saveCurrentChatSession();
      renderSavedChats();
    }
  }, 40);
}

// Save current chat to savedChats and localStorage
function saveCurrentChatSession() {
  // Create a title based on first user message or timestamp
  let title = "New Chat";
  if (chatHistory.length > 0) {
    const firstUserMsg = chatHistory.find((msg) => msg.role === "user");
    if (firstUserMsg) {
      title = firstUserMsg.parts[0]?.text.slice(0, 30) + "...";
    }
  }
  // Add or update chat in savedChats (for simplicity, always add new)
  savedChats.push({ title, chatHistory: [...chatHistory] });
  saveSavedChats();
}

// Generate bot response
async function generateResponse(botMsgDiv) {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();

  // Add user message + file to chatHistory
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data
        ? [
            {
              inline_data: (({ fileName, isImage, ...rest }) => rest)(userData.file),
              fileName: userData.file.fileName,
              isImage: userData.file.isImage,
            },
          ]
        : []),
    ],
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
      signal: controller.signal,
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error.message);

    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();

    typingEffect(responseText, textElement, botMsgDiv);

    chatHistory.push({ role: "model", parts: [{ text: responseText }] });
  } catch (error) {
    textElement.textContent =
      error.name === "AbortError" ? "Response generation stopped." : error.message;
    textElement.style.color = "#d62939";
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    scrollToBottom();
  } finally {
    userData.file = {};
  }
}

// Handle form submit
function handleFormSubmit(e) {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  if (!userMessage || document.body.classList.contains("bot-responding")) return;
  userData.message = userMessage;
  promptInput.value = "";
  document.body.classList.add("chats-active", "bot-responding");
  fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");

  const userMsgHTML = `
    <p class="message-text"></p>
    ${
      userData.file.data
        ? userData.file.isImage
          ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />`
          : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`
        : ""
    }
  `;

  const userMsgDiv = document.createElement("div");
  userMsgDiv.classList.add("message", "user-message");
  userMsgDiv.innerHTML = userMsgHTML;
  userMsgDiv.querySelector(".message-text").textContent = userData.message;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    const botMsgHTML = `<img class="avatar" src="gemini.webp" /> <p class="message-text">Just a sec...</p>`;
    const botMsgDiv = document.createElement("div");
    botMsgDiv.classList.add("message", "bot-message", "loading");
    botMsgDiv.innerHTML = botMsgHTML;
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
}

// File upload handling
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");
    userData.file = { fileName: file.name, data: base64String, mime_type: file.type, isImage };
  };
});

// Cancel file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
});

// Stop bot response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  controller?.abort();
  userData.file = {};
  clearInterval(typingInterval);
  const loadingBotMsg = chatsContainer.querySelector(".bot-message.loading");
  if (loadingBotMsg) loadingBotMsg.classList.remove("loading");
  document.body.classList.remove("bot-responding");
});

// Toggle theme
themeToggleBtn.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
  themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

// Delete all chats and clear saved chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory = [];
  chatsContainer.innerHTML = "";
  savedChats = [];
  saveSavedChats();
  renderSavedChats();
  document.body.classList.remove("chats-active", "bot-responding");
});

// Suggestion clicks
document.querySelectorAll(".suggestions-item").forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    promptInput.value = suggestion.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

// Mobile controls toggle on input focus
document.addEventListener("click", ({ target }) => {
  const wrapper = document.querySelector(".prompt-wrapper");
  const shouldHide =
    target.classList.contains("prompt-input") ||
    (wrapper.classList.contains("hide-controls") &&
      (target.id === "add-file-btn" || target.id === "stop-response-btn"));
  wrapper.classList.toggle("hide-controls", shouldHide);
});

// Form submit and file add button click
promptForm.addEventListener("submit", handleFormSubmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());

// New Chat button handler
newChatBtn.addEventListener("click", () => {
  chatHistory = [];
  chatsContainer.innerHTML = "";
  promptInput.value = "";
  userData.file = {};
  fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
  document.body.classList.remove("chats-active", "bot-responding");
  document.querySelectorAll(".saved-chat-item").forEach(item => item.classList.remove("selected"));
  promptInput.focus();
});

// On page load, render saved chats and load theme
(() => {
  renderSavedChats();

  const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
  document.body.classList.toggle("light-theme", isLightTheme);
  themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";
})();
