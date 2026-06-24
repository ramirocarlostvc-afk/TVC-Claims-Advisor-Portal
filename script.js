(function (window) {
  "use strict";

  const VERSION = "1.0.2";

  const WaitWellChatbot = {
    config: {
      apiUrl: "",
      siteId: "",
      botId: null,
      enableBooking: true,
      primaryColor: "#3880ff",
      secondaryColor: "#0cd1e8",
      position: "bottom-right",
      zIndex: 9999,
      botName: "Waillo",
      welcomeMessage: "Welcome to Patriot Compass. How may I assist you?",
      placeholder: "Disclaimer: Please do not enter personally identifiable information (PII), sensitive, or proprietary information into the Chatbot. By using this service, you consent to the collection and analysis of your inputs to improve our services, in accordance with our privacy policy.",
      locale: "en"
    },

    state: {
      isOpen: false,
      isMinimized: false,
      isTyping: false,
      messages: [],
      conversationHistory: [],
      activeServiceTypeId: null,
      activeSiteId: null,
      conversationId: null
    },

    elements: {},

    i18n: {
      en: {
        title: "Chat Assistant",
        online: "Online",
        placeholder: "Type your message...",
        send: "Send",
        clear: "Clear",
        minimize: "Minimize",
        close: "Close",
        sources: "Sources:",
        error: "Sorry, I encountered an error. Please try again.",
        typing: "Typing...",
        openChatbot: "Open chatbot",
        assistantTyping: "Assistant is typing",
        chatMessages: "Chat messages",
        youSaid: "You",
        assistantSaid: "Assistant"
      },
      fr: {
        title: "Assistant de Chat",
        online: "En ligne",
        placeholder: "Tapez votre message...",
        send: "Envoyer",
        clear: "Effacer",
        minimize: "Réduire",
        close: "Fermer",
        sources: "Sources:",
        error: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        typing: "En train d'écrire...",
        openChatbot: "Ouvrir le clavardage",
        assistantTyping: "L'assistant est en train d'écrire",
        chatMessages: "Messages du clavardage",
        youSaid: "Vous",
        assistantSaid: "Assistant"
      },
      es: {
        title: "Asistente de Chat",
        online: "En línea",
        placeholder: "Escribe tu mensaje...",
        send: "Enviar",
        clear: "Limpiar",
        minimize: "Minimizar",
        close: "Cerrar",
        sources: "Fuentes:",
        error: "Lo siento, encontré un error. Por favor, inténtalo de nuevo.",
        typing: "Escribiendo...",
        openChatbot: "Abrir chatbot",
        assistantTyping: "El asistente está escribiendo",
        chatMessages: "Mensajes del chat",
        youSaid: "Usted",
        assistantSaid: "Asistente"
      }
    },

    init(options) {
      this.config = Object.assign({}, this.config, options);

      if (!this.config.apiUrl || !this.config.siteId) {
        console.error("WaitWellChatbot: apiUrl and siteId are required");
        return;
      }

      if (!this.config.botId) {
        console.warn("WaitWellChatbot: botId not configured, widget will not be displayed");
        return;
      }

      this.createElements();
      this.loadConversation();

      if (this.state.messages.length === 0) {
        this.addWelcomeMessage();
      }

      if (this.state.isOpen) {
        this.elements.fab.style.display = "none";
        this.elements.chatWindow.style.display = "flex";
        if (this.state.isMinimized) {
          this.elements.chatWindow.classList.add("ww-minimized");
        }
        setTimeout(() => this.forceScrollToBottom(), 100);
      }

      this.setupEventListeners();

      console.log(`Waillo Initialized - Version ${VERSION}`);
    },

    t(key) {
      const locale = this.config.locale || "en";
      return this.i18n[locale]?.[key] || this.i18n.en[key] || key;
    },

    createElements() {
      const container = document.createElement("div");
      container.className = "ww-chatbot-widget";
      container.style.cssText = `z-index: ${this.config.zIndex};`;
      this.applyPosition(container);

      const fab = document.createElement("div");
      fab.className = "ww-chat-fab";
      fab.setAttribute("role", "button");
      fab.setAttribute("tabindex", "0");
      fab.setAttribute("aria-label", this.t("openChatbot"));
      fab.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256.35 201.82" width="32" height="32" aria-hidden="true" focusable="false">
          <path fill="white" d="M128.18,0C57.39,0,0,45.18,0,100.91s57.39,100.91,128.18,100.91,128.18-45.18,128.18-100.91S198.97,0,128.18,0ZM128.18,120.96c-52.11,0-94.35-21.07-94.35-47.07s42.24-47.07,94.35-47.07,94.35,21.07,94.35,47.07-42.24,47.07-94.35,47.07Z"/>
          <path fill="rgba(255,255,255,0.85)" d="M152.33,160.84l.17.06c1.07.4,1.07,1.92,0,2.31l-.06.02c-10.69,3.96-19.13,12.39-23.08,23.08l-.02.06c-.4,1.07-1.92,1.07-2.31,0h0c-3.97-10.73-12.43-19.19-23.16-23.16h0c-1.07-.4-1.07-1.92,0-2.31l.67-.25c10.31-3.81,18.44-11.94,22.25-22.25l.25-.67c.4-1.07,1.92-1.07,2.31,0l.06.17c3.93,10.62,12.31,19,22.93,22.93Z"/>
          <rect fill="white" x="73.51" y="63.33" width="44.95" height="21.11" rx="8.72" ry="8.72" transform="translate(169.87 -22.1) rotate(90)"/>
          <rect fill="white" x="137.89" y="63.33" width="44.95" height="21.11" rx="8.72" ry="8.72" transform="translate(234.25 -86.48) rotate(90)"/>
        </svg>
      `;

      const chatWindow = document.createElement("div");
      chatWindow.className = "ww-chat-window";
      chatWindow.style.display = "none";
      chatWindow.setAttribute("role", "dialog");
      chatWindow.setAttribute("aria-modal", "true");
      chatWindow.setAttribute("aria-labelledby", "ww-dialog-title");

      const header = document.createElement("div");
      header.className = "ww-chat-header";
      const botName = this.config.botName || this.t("title");
      header.innerHTML = `
        <div class="ww-header-info">
          <div class="ww-header-avatar" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256.35 201.82" width="28" height="28" aria-hidden="true" focusable="false">
              <path fill="white" d="M128.18,0C57.39,0,0,45.18,0,100.91s57.39,100.91,128.18,100.91,128.18-45.18,128.18-100.91S198.97,0,128.18,0ZM128.18,120.96c-52.11,0-94.35-21.07-94.35-47.07s42.24-47.07,94.35-47.07,94.35,21.07,94.35,47.07-42.24,47.07-94.35,47.07Z"/>
              <path fill="rgba(255,255,255,0.85)" d="M152.33,160.84l.17.06c1.07.4,1.07,1.92,0,2.31l-.06.02c-10.69,3.96-19.13,12.39-23.08,23.08l-.02.06c-.4,1.07-1.92,1.07-2.31,0h0c-3.97-10.73-12.43-19.19-23.16-23.16h0c-1.07-.4-1.07-1.92,0-2.31l.67-.25c10.31-3.81,18.44-11.94,22.25-22.25l.25-.67c.4-1.07,1.92-1.07,2.31,0l.06.17c3.93,10.62,12.31,19,22.93,22.93Z"/>
              <rect fill="white" x="73.51" y="63.33" width="44.95" height="21.11" rx="8.72" ry="8.72" transform="translate(169.87 -22.1) rotate(90)"/>
              <rect fill="white" x="137.89" y="63.33" width="44.95" height="21.11" rx="8.72" ry="8.72" transform="translate(234.25 -86.48) rotate(90)"/>
            </svg>
          </div>
          <div class="ww-header-text">
            <div class="ww-header-name" id="ww-dialog-title">${botName}</div>
            <div class="ww-header-status" aria-hidden="true"><span class="ww-status-dot"></span>${this.t("online")}</div>
          </div>
        </div>
        <div class="ww-header-actions">
          <button class="ww-minimize-btn" aria-label="${this.t("minimize")}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
              <line x1="400" y1="256" x2="112" y2="256" stroke="white" stroke-linecap="round" stroke-width="32"/>
            </svg>
          </button>
          <button class="ww-close-btn" aria-label="${this.t("close")}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
              <line x1="368" y1="368" x2="144" y2="144" stroke="white" stroke-linecap="round" stroke-width="32"/>
              <line x1="368" y1="144" x2="144" y2="368" stroke="white" stroke-linecap="round" stroke-width="32"/>
            </svg>
          </button>
        </div>
      `;

      const messagesContainer = document.createElement("div");
      messagesContainer.className = "ww-chat-messages";
      messagesContainer.setAttribute("role", "log");
      messagesContainer.setAttribute("aria-live", "polite");
      messagesContainer.setAttribute("aria-atomic", "false");
      messagesContainer.setAttribute("aria-label", this.t("chatMessages"));

      const placeholderText = this.config.placeholder || this.t("placeholder");
      const inputArea = document.createElement("div");
      inputArea.className = "ww-chat-input";
      inputArea.innerHTML = `
        <textarea
          class="ww-input-field"
          placeholder="${placeholderText}"
          aria-label="${placeholderText}"
          rows="2"
        ></textarea>
        <button class="ww-send-btn" disabled aria-label="${this.t("send")}">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
            <path fill="white" d="M470.3 271.15L43.16 447.31a7.83 7.83 0 01-11.16-7V327a8 8 0 016.51-7.86l247.62-47c17.36-3.29 17.36-28.15 0-31.44l-247.63-47a8 8 0 01-6.5-7.85V72.59c0-5.74 5.88-10.26 11.16-8L470.3 240.85a16 16 0 010 30.3z"/>
          </svg>
        </button>
      `;

      const footer = document.createElement("div");
      footer.className = "ww-chat-footer";
      footer.innerHTML = `
        <button class="ww-clear-btn">${this.t("clear")}</button>
      `;

      const srAnnouncement = document.createElement("div");
      srAnnouncement.className = "ww-sr-only";
      srAnnouncement.setAttribute("aria-live", "polite");
      srAnnouncement.setAttribute("aria-atomic", "true");

      const srStatus = document.createElement("div");
      srStatus.className = "ww-sr-only";
      srStatus.setAttribute("role", "status");
      srStatus.setAttribute("aria-live", "polite");

      chatWindow.appendChild(header);
      chatWindow.appendChild(messagesContainer);
      chatWindow.appendChild(inputArea);
      chatWindow.appendChild(footer);
      chatWindow.appendChild(srAnnouncement);
      chatWindow.appendChild(srStatus);

      container.appendChild(fab);
      container.appendChild(chatWindow);

      document.body.appendChild(container);

      this.elements = {
        container: container,
        fab: fab,
        chatWindow: chatWindow,
        header: header,
        messagesContainer: messagesContainer,
        inputArea: inputArea,
        inputField: inputArea.querySelector(".ww-input-field"),
        sendBtn: inputArea.querySelector(".ww-send-btn"),
        minimizeBtn: header.querySelector(".ww-minimize-btn"),
        closeBtn: header.querySelector(".ww-close-btn"),
        clearBtn: footer.querySelector(".ww-clear-btn"),
        footer: footer,
        srAnnouncement: srAnnouncement,
        srStatus: srStatus
      };

      this.applyColors();
    },

    applyPosition(container) {
      const positions = {
        "bottom-right": "bottom: 20px; right: 20px;",
        "bottom-left": "bottom: 20px; left: 20px;",
        "top-right": "top: 20px; right: 20px;",
        "top-left": "top: 20px; left: 20px;"
      };
      container.style.cssText += positions[this.config.position] || positions["bottom-right"];
    },

    applyColors() {
      const { primaryColor, secondaryColor } = this.config;
      document.documentElement.style.setProperty("--ww-primary-color", primaryColor);
      document.documentElement.style.setProperty("--ww-secondary-color", secondaryColor);
    },

    setupEventListeners() {
      this.elements.fab.addEventListener("click", () => this.toggleChat());
      this.elements.fab.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.toggleChat();
        }
      });
      this.elements.closeBtn.addEventListener("click", () => this.toggleChat());
      this.elements.minimizeBtn.addEventListener("click", () => this.minimizeChat());
      this.elements.clearBtn.addEventListener("click", () => this.clearConversation());
      this.elements.sendBtn.addEventListener("click", () => this.sendMessage());
      this.elements.inputField.addEventListener("input", e => {
        this.elements.sendBtn.disabled = !e.target.value.trim();
      });
      this.elements.inputField.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    },

    toggleChat() {
      this.state.isOpen = !this.state.isOpen;
      if (this.state.isOpen) {
        this.elements.fab.style.display = "none";
        this.elements.chatWindow.style.display = "flex";
        this.elements.chatWindow.classList.add("ww-slide-in");
        this.state.isMinimized = false;
        this.elements.chatWindow.classList.remove("ww-minimized");
        setTimeout(() => {
          this.elements.inputField.focus();
          this.forceScrollToBottom();
        }, 300);
      } else {
        this.elements.chatWindow.classList.remove("ww-slide-in");
        this.elements.chatWindow.style.display = "none";
        this.elements.fab.style.display = "flex";
      }
      this.saveConversation();
    },

    minimizeChat() {
      this.state.isMinimized = !this.state.isMinimized;
      if (this.state.isMinimized) {
        this.elements.chatWindow.classList.add("ww-minimized");
      } else {
        this.elements.chatWindow.classList.remove("ww-minimized");
        this.forceScrollToBottom();
      }
      this.saveConversation();
    },

    addWelcomeMessage() {
      this.addMessage({
        role: "assistant",
        content: this.config.welcomeMessage,
        timestamp: new Date()
      });
    },

    addMessage(message, save = true, stream = false) {
      this.state.messages.push(message);
      const messageElement = document.createElement("div");
      messageElement.className = `ww-message ww-${message.role}`;
      const messageContent = document.createElement("div");
      messageContent.className = "ww-message-content";
      const messageTime = document.createElement("div");
      messageTime.className = "ww-message-time";
      messageTime.textContent = this.formatTime(message.timestamp);
      messageElement.appendChild(messageContent);
      messageElement.appendChild(messageTime);
      this.elements.messagesContainer.appendChild(messageElement);
      const srPrefix = `<span class="ww-sr-only">${message.role === "user" ? this.t("youSaid") : this.t("assistantSaid")}: </span>`;
      const parsedContent = this.parseMarkdown(message.content);
      if (stream && message.role === "assistant") {
        messageElement.setAttribute("aria-hidden", "true");
        this.streamContent(srPrefix + parsedContent, messageContent, {
          onWord: () => {
            const containerRect = this.elements.messagesContainer.getBoundingClientRect();
            const messageRect = messageElement.getBoundingClientRect();
            const scrollAmount = messageRect.top - containerRect.top - 8;
            if (scrollAmount > 0) {
              this.elements.messagesContainer.scrollTop += scrollAmount;
            }
          }
        }).then(() => {
          messageElement.removeAttribute("aria-hidden");
          if (this.elements.srAnnouncement) {
            const cleanContent = message.content.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\n/g, " ");
            this.elements.srAnnouncement.textContent = cleanContent;
            setTimeout(() => {
              this.elements.srAnnouncement.textContent = "";
            }, 5000);
          }
          if (save) {
            this.saveConversation();
          }
        });
      } else {
        messageContent.innerHTML = srPrefix + parsedContent;
        this.scrollToBottom();
        if (save) {
          this.saveConversation();
        }
      }
    },

    isExternalUrl(url) {
      try {
        return new URL(url, window.location.href).hostname !== window.location.hostname;
      } catch (e) {
        return true;
      }
    },

    parseMarkdown(content) {
      if (!content) return "";
      let html = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        const cleanUrl = url.replace(/&amp;/g, "&");
        if (!cleanUrl.startsWith("http")) {
          return `<a href="#" class="ww-relative-link" data-path="${cleanUrl}">${text}</a>`;
        }
        return this.isExternalUrl(cleanUrl) ? `<a href="${cleanUrl}" class="ww-external-link" target="_blank" rel="noopener noreferrer">${text}</a>` : `<a href="${cleanUrl}">${text}</a>`;
      });
      html = html.replace(/(?<!href=["']|href=)https?:\/\/[^\s*<>\[\]]+/gi, url => {
        return this.isExternalUrl(url) ? `<a href="${url}" class="ww-external-link" target="_blank" rel="noopener noreferrer">${url}</a>` : `<a href="${url}">${url}</a>`;
      });
      html = html.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\*([^\*]+)\*/g, "<em>$1</em>");
      html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
      {
        const lines = html.split("\n");
        const result = [];
        let inUl = false;
        let inOl = false;
        for (const line of lines) {
          const ulMatch = line.match(/^[\-\*]\s+(.+)$/);
          const olMatch = line.match(/^\d+\.\s+(.+)$/);
          if (ulMatch) {
            if (inOl) {
              result.push("</ol>");
              inOl = false;
            }
            if (!inUl) {
              result.push("<ul>");
              inUl = true;
            }
            result.push(`<li>${ulMatch[1]}</li>`);
          } else if (olMatch) {
            if (inUl) {
              result.push("</ul>");
              inUl = false;
            }
            if (!inOl) {
              result.push("<ol>");
              inOl = true;
            }
            result.push(`<li>${olMatch[1]}</li>`);
          } else {
            if (line.trim() || !inUl && !inOl) {
              if (inUl) {
                result.push("</ul>");
                inUl = false;
              }
              if (inOl) {
                result.push("</ol>");
                inOl = false;
              }
              result.push(line.startsWith("<ul>") || line.startsWith("<ol>") || line.startsWith("<li>") || /<(ul|ol)[^>]*>/i.test(line) ? line : `<p>${line.replace(/\n/g, "<br>")}</p>`);
            }
          }
        }
        if (inUl) result.push("</ul>");
        if (inOl) result.push("</ol>");
        html = result.join("\n");
      }
      html = html.replace(/([^>])\n([^<])/g, "$1<br>$2");
      return html;
    },

    showTypingIndicator() {
      this.state.isTyping = true;
      const indicator = document.createElement("div");
      indicator.className = "ww-typing-indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.innerHTML = "<span></span><span></span><span></span>";
      this.elements.messagesContainer.appendChild(indicator);
      this.scrollToBottom();
      if (this.elements.srStatus) {
        this.elements.srStatus.textContent = this.t("assistantTyping");
      }
    },

    hideTypingIndicator() {
      this.state.isTyping = false;
      const indicator = this.elements.messagesContainer.querySelector(".ww-typing-indicator");
      if (indicator) {
        indicator.remove();
      }
      if (this.elements.srStatus) {
        this.elements.srStatus.textContent = "";
      }
    },

    async sendMessage() {
      const message = this.elements.inputField.value.trim();
      if (message) {
        this.addMessage({
          role: "user",
          content: message,
          timestamp: new Date()
        });
        this.forceScrollToBottom();
        this.elements.inputField.value = "";
        this.elements.sendBtn.disabled = true;
        this.showTypingIndicator();
        try {
          const response = await this.callAPI(message);
          this.hideTypingIndicator();
          this.addMessage({
            role: "assistant",
            content: response.response,
            timestamp: new Date(),
            sources: response.sources
          }, true, true);
          this.state.conversationHistory.push({
            role: "user",
            content: message
          });
          this.state.conversationHistory.push({
            role: "assistant",
            content: response.response
          });
        } catch (error) {
          console.error("WaitWellChatbot error:", error);
          this.hideTypingIndicator();
          this.addMessage({
            role: "assistant",
            content: error.serverMessage ? error.message : this.t("error"),
            timestamp: new Date()
          }, true, true);
        }
      }
    },

    async callAPI(message) {
      const siteId = this.state.activeSiteId || this.config.siteId;
      const url = `${this.config.apiUrl}/api/${siteId}/client/chatbot/query`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AppName": `WaitWellChatBotWidget ${VERSION}`
        },
        body: JSON.stringify({
          message: message,
          history: this.state.conversationHistory,
          enable_booking: this.config.enableBooking,
          activeServiceTypeId: this.state.activeServiceTypeId,
          botId: this.config.botId,
          conversationId: this.state.conversationId
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        const error = new Error(data.error || "Unknown error");
        error.serverMessage = true;
        throw error;
      }
      if (data.activeServiceTypeId !== undefined) {
        this.state.activeServiceTypeId = data.activeServiceTypeId;
      }
      if (data.activeSiteId !== undefined) {
        this.state.activeSiteId = data.activeSiteId;
      }
      return data;
    },

    clearConversation() {
      this.state.messages = [];
      this.state.conversationHistory = [];
      this.state.activeServiceTypeId = null;
      this.state.activeSiteId = null;
      this.state.conversationId = crypto.randomUUID();
      this.elements.messagesContainer.innerHTML = "";
      try {
        localStorage.removeItem(this.getStorageKey());
      } catch (e) {
        console.warn("Failed to clear conversation from localStorage:", e);
      }
      this.addWelcomeMessage();
    },

    scrollToBottom() {
      setTimeout(() => {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
      }, 50);
    },

    forceScrollToBottom() {
      this.scrollToBottom();
    },

    streamContent(content, element, options = {}) {
      const wordDelay = options.wordDelay ?? 28;
      const paragraphDelay = options.paragraphDelay ?? 260;
      const onWord = options.onWord || null;
      return new Promise(resolve => {
        if (!content) {
          resolve();
          return;
        }
        const tokens = [];
        const regex = /(<[^>]+>)|([^<]+)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          if (match[1]) {
            tokens.push({ type: "tag", value: match[1] });
          } else {
            for (const part of match[2].split(/(\s+)/)) {
              if (part) {
                tokens.push({ type: "text", value: part, isWord: part.trim().length > 0 });
              }
            }
          }
        }
        let index = 0;
        let currentHtml = "";
        let currentDelay = wordDelay;
        function next() {
          for (; index < tokens.length; ) {
            const token = tokens[index];
            if (token.type === "tag") {
              currentHtml += token.value;
              if (/^<\/(p|ul|ol|blockquote|h[1-6])>/i.test(token.value)) {
                currentDelay = paragraphDelay;
              }
              index++;
            } else {
              if (token.isWord) break;
              currentHtml += token.value;
              index++;
            }
          }
          if (index >= tokens.length) {
            element.innerHTML = currentHtml;
            resolve();
            return;
          }
          currentHtml += tokens[index++].value;
          element.innerHTML = currentHtml;
          if (onWord) onWord();
          const delay = currentDelay;
          currentDelay = wordDelay;
          setTimeout(next, delay);
        }
        next();
      });
    },

    getStorageKey() {
      return `ww_chatbot_${this.config.siteId}_${this.config.botId}`;
    },

    getBookingBaseUrl() {
      const siteId = this.state.activeSiteId || this.config.siteId;
      const region = this.config.apiUrl.includes(".us") ? "us" : "ca";
      return `https://${siteId}.${this.config.apiUrl.includes("sandbox") ? "sandbox." : ""}waitwell.${region}`;
    },

    saveConversation() {
      try {
        const data = {
          messages: this.state.messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          conversationHistory: this.state.conversationHistory,
          activeServiceTypeId: this.state.activeServiceTypeId,
          activeSiteId: this.state.activeSiteId,
          conversationId: this.state.conversationId,
          isOpen: this.state.isOpen,
          isMinimized: this.state.isMinimized,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
      } catch (e) {
        console.warn("Failed to save conversation to localStorage:", e);
      }
    },

    loadConversation() {
      try {
        const key = this.getStorageKey();
        const data = localStorage.getItem(key);
        if (!data) {
          this.state.conversationId = crypto.randomUUID();
          return;
        }
        const parsed = JSON.parse(data);
        const savedAt = new Date(parsed.savedAt);
        if ((new Date() - savedAt) / 36e5 > 24) {
          localStorage.removeItem(key);
          this.state.conversationId = crypto.randomUUID();
          return;
        }
        this.state.conversationHistory = parsed.conversationHistory || [];
        this.state.activeServiceTypeId = parsed.activeServiceTypeId || null;
        this.state.activeSiteId = parsed.activeSiteId || null;
        this.state.conversationId = parsed.conversationId || crypto.randomUUID();
        this.state.isOpen = parsed.isOpen || false;
        this.state.isMinimized = parsed.isMinimized || false;
        parsed.messages.forEach(m => {
          this.addMessage({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp)
          }, false);
        });
        console.log("Conversation restored from localStorage");
      } catch (e) {
        console.warn("Failed to load conversation from localStorage:", e);
      }
    },

    formatTime(date) {
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
  };

  window.WaitWellChatbot = WaitWellChatbot;

  document.addEventListener("DOMContentLoaded", function() {
    const script = document.querySelector("script[data-ww-chatbot]");
    if (script) {
      const config = {
        apiUrl: script.getAttribute("data-api-url"),
        siteId: script.getAttribute("data-site-id"),
        botId: parseInt(script.getAttribute("data-bot-id")) || null,
        enableBooking: script.getAttribute("data-enable-booking") !== "false",
        primaryColor: script.getAttribute("data-primary-color"),
        secondaryColor: script.getAttribute("data-secondary-color"),
        position: script.getAttribute("data-position"),
        placeholder: script.getAttribute("data-placeholder"),
        welcomeMessage: script.getAttribute("data-welcome-message")
      };
      Object.keys(config).forEach(key => {
        if (config[key] == null || config[key] === "") {
          delete config[key];
        }
      });
      if (config.apiUrl && config.siteId) {
        WaitWellChatbot.init(config);
      }
    }
  });

  document.addEventListener("click", function(e) {
    if (e.target.classList.contains("ww-relative-link")) {
      e.preventDefault();
      const path = e.target.getAttribute("data-path");
      const event = new CustomEvent("ww-chatbot-navigate", {
        detail: { path: path },
        bubbles: true
      });
      document.dispatchEvent(event);
      if (path && window !== undefined) {
        window.location.href = path.startsWith("http") ? path : `${WaitWellChatbot.getBookingBaseUrl()}/${path}`;
      }
    }
  });

})(window);
