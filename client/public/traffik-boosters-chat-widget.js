(function() {
  'use strict';

  // Traffik Boosters Chat Widget Plugin
  // Version 1.0.0
  // Installation: Add this script to your website before the closing </body> tag

  const WIDGET_CONFIG = {
    apiEndpoint: 'https://your-domain.com/api/leads',
    companyName: 'Traffik Boosters',
    primaryColor: '#e45c2b',
    welcomeMessage: 'Hi! How can we help boost your traffic today?',
    position: 'bottom-right',
    logoUrl: 'https://your-domain.com/logo.png'
  };

  let isWidgetLoaded = false;
  let chatWidget = null;
  let isOpen = false;
  let isMinimized = false;
  let chatPhase = 'greeting'; // greeting, form, chat, video
  let messages = [];
  let leadForm = { name: '', email: '', company: '', phone: '', message: '' };

  // Utility functions
  function createElement(tag, className, styles = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    Object.assign(element.style, styles);
    return element;
  }

  function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  function isBusinessHours() {
    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hour = estTime.getHours();
    const day = estTime.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const isBusinessTime = hour >= 9 && hour < 18;
    return isWeekday && isBusinessTime;
  }

  // Create widget styles
  function injectStyles() {
    const styles = `
      .tb-chat-widget {
        position: fixed;
        ${WIDGET_CONFIG.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        ${WIDGET_CONFIG.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .tb-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${WIDGET_CONFIG.primaryColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        color: white;
        font-size: 24px;
      }
      
      .tb-chat-button:hover {
        transform: scale(1.05);
      }
      
      .tb-chat-window {
        width: 320px;
        height: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .tb-chat-window.video-mode {
        height: 450px;
      }
      
      .tb-chat-header {
        background: ${WIDGET_CONFIG.primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .tb-chat-logo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-weight: bold;
        color: ${WIDGET_CONFIG.primaryColor};
        font-size: 14px;
      }
      
      .tb-chat-controls {
        display: flex;
        gap: 8px;
      }
      
      .tb-chat-control-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tb-chat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .tb-message {
        display: flex;
        gap: 8px;
        max-width: 80%;
      }
      
      .tb-message.user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }
      
      .tb-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      
      .tb-message-content {
        background: #f0f0f0;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .tb-message.user .tb-message-content {
        background: ${WIDGET_CONFIG.primaryColor};
        color: white;
      }
      
      .tb-chat-input {
        padding: 16px;
        border-top: 1px solid #e0e0e0;
        background: #f9f9f9;
      }
      
      .tb-form-group {
        margin-bottom: 12px;
      }
      
      .tb-form-label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 500;
        color: #666;
      }
      
      .tb-form-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
      }
      
      .tb-form-input:focus {
        outline: none;
        border-color: ${WIDGET_CONFIG.primaryColor};
      }
      
      .tb-btn {
        background: ${WIDGET_CONFIG.primaryColor};
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .tb-btn:hover {
        opacity: 0.9;
      }
      
      .tb-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .tb-btn-outline {
        background: transparent;
        color: ${WIDGET_CONFIG.primaryColor};
        border: 1px solid ${WIDGET_CONFIG.primaryColor};
      }
      
      .tb-flex {
        display: flex;
        gap: 8px;
      }
      
      .tb-flex-1 {
        flex: 1;
      }
      
      .tb-video-container {
        background: #000;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 12px;
      }
      
      .tb-video-main {
        position: relative;
        height: 120px;
        background: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      
      .tb-video-local {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 60px;
        height: 45px;
        background: #333;
        border-radius: 4px;
        border: 2px solid white;
      }
      
      .tb-video-controls {
        background: #333;
        padding: 12px;
        display: flex;
        justify-content: center;
        gap: 8px;
      }
      
      .tb-video-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
      }
      
      .tb-hidden {
        display: none !important;
      }
      
      .tb-business-status {
        font-size: 11px;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .tb-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${isBusinessHours() ? '#4ade80' : '#facc15'};
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Create widget HTML
  function createWidget() {
    const widget = createElement('div', 'tb-chat-widget');
    
    // Chat button (initially visible)
    const chatButton = createElement('button', 'tb-chat-button');
    chatButton.innerHTML = '💬';
    chatButton.onclick = () => openWidget();
    
    // Chat window (initially hidden)
    const chatWindow = createElement('div', 'tb-chat-window tb-hidden');
    chatWindow.innerHTML = `
      <div class="tb-chat-header">
        <div style="display: flex; align-items: center;">
          <div class="tb-chat-logo">TB</div>
          <div>
            <div style="font-weight: 600; font-size: 14px;">${WIDGET_CONFIG.companyName}</div>
            <div style="font-weight: 500; font-size: 11px; opacity: 0.9; margin-bottom: 2px;">More Traffik! More Sales!</div>
            <div class="tb-business-status">
              <div class="tb-status-dot"></div>
              ${isBusinessHours() ? 'Online Now' : 'Will Call Within 24hrs'}
            </div>
          </div>
        </div>
        <div class="tb-chat-controls">
          <button class="tb-chat-control-btn" onclick="TrafikBoostersWidget.minimize()">−</button>
          <button class="tb-chat-control-btn" onclick="TrafikBoostersWidget.close()">×</button>
        </div>
      </div>
      <div class="tb-chat-messages" id="tb-messages"></div>
      <div class="tb-chat-input" id="tb-input-area"></div>
    `;

    widget.appendChild(chatButton);
    widget.appendChild(chatWindow);
    
    return widget;
  }

  // Widget functions
  function openWidget() {
    const button = chatWidget.querySelector('.tb-chat-button');
    const window = chatWidget.querySelector('.tb-chat-window');
    
    button.classList.add('tb-hidden');
    window.classList.remove('tb-hidden');
    isOpen = true;
    
    if (messages.length === 0) {
      addMessage(getWelcomeMessage(), false);
      renderInput();
    }
  }

  function closeWidget() {
    const button = chatWidget.querySelector('.tb-chat-button');
    const window = chatWidget.querySelector('.tb-chat-window');
    
    button.classList.remove('tb-hidden');
    window.classList.add('tb-hidden');
    isOpen = false;
  }

  function minimizeWidget() {
    // Simple implementation - just close for now
    closeWidget();
  }

  function getWelcomeMessage() {
    return isBusinessHours() 
      ? WIDGET_CONFIG.welcomeMessage
      : "Hi! Thanks for your interest in Traffik Boosters. We're currently outside business hours (Monday-Friday, 9 AM - 6 PM EST), but a growth expert will call you within 24 business hours. How can we help boost your traffic?";
  }

  function addMessage(text, isUser = false) {
    messages.push({
      id: Date.now(),
      text: text,
      isUser: isUser,
      timestamp: new Date()
    });
    renderMessages();
  }

  function renderMessages() {
    const container = document.getElementById('tb-messages');
    container.innerHTML = messages.map(msg => `
      <div class="tb-message ${msg.isUser ? 'user' : ''}">
        <div class="tb-message-avatar">
          ${msg.isUser ? '👤' : 'TB'}
        </div>
        <div class="tb-message-content">${msg.text}</div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }

  function renderInput() {
    const container = document.getElementById('tb-input-area');
    
    if (chatPhase === 'greeting') {
      container.innerHTML = `
        <div class="tb-flex">
          <button class="tb-btn tb-flex-1" onclick="TrafikBoostersWidget.startForm()">
            Yes, I'm interested in boosting my traffic!
          </button>
        </div>
        <button class="tb-btn-outline" style="width: 100%; margin-top: 8px;" onclick="TrafikBoostersWidget.close()">
          Maybe later
        </button>
      `;
    } else if (chatPhase === 'form') {
      container.innerHTML = `
        <form onsubmit="TrafikBoostersWidget.submitForm(event)">
          <div class="tb-form-group">
            <input type="text" class="tb-form-input" placeholder="Your name *" required 
                   onchange="TrafikBoostersWidget.updateForm('name', this.value)">
          </div>
          <div class="tb-form-group">
            <input type="email" class="tb-form-input" placeholder="Business email *" required
                   onchange="TrafikBoostersWidget.updateForm('email', this.value)">
          </div>
          <div class="tb-form-group">
            <input type="text" class="tb-form-input" placeholder="Company name *" required
                   onchange="TrafikBoostersWidget.updateForm('company', this.value)">
          </div>
          <div class="tb-form-group">
            <input type="tel" class="tb-form-input" placeholder="Phone number"
                   onchange="TrafikBoostersWidget.updateForm('phone', this.value)">
          </div>
          <div class="tb-flex">
            <button type="submit" class="tb-btn tb-flex-1">Start Chat</button>
            <button type="button" class="tb-btn-outline" onclick="TrafikBoostersWidget.startVideo()">📹</button>
          </div>
        </form>
      `;
    } else if (chatPhase === 'chat') {
      container.innerHTML = `
        <div class="tb-flex" style="margin-bottom: 8px;">
          <button class="tb-btn-outline" style="font-size: 12px; padding: 4px 8px;" onclick="TrafikBoostersWidget.startVideo()">
            📹 Video
          </button>
          <button class="tb-btn-outline" style="font-size: 12px; padding: 4px 8px;" onclick="window.open('tel:8778406250')">
            📞 Call
          </button>
        </div>
        <form onsubmit="TrafikBoostersWidget.sendMessage(event)" class="tb-flex">
          <input type="text" class="tb-form-input tb-flex-1" placeholder="Ask us anything..." 
                 id="tb-message-input" required>
          <button type="submit" class="tb-btn">Send</button>
        </form>
      `;
    }
  }

  // Public API
  window.TrafikBoostersWidget = {
    init: function(config = {}) {
      if (isWidgetLoaded) return;
      
      Object.assign(WIDGET_CONFIG, config);
      injectStyles();
      chatWidget = createWidget();
      document.body.appendChild(chatWidget);
      isWidgetLoaded = true;
    },

    open: openWidget,
    close: closeWidget,
    minimize: minimizeWidget,

    startForm: function() {
      chatPhase = 'form';
      addMessage("Great! Let's get some information so we can help you better.", false);
      renderInput();
    },

    updateForm: function(field, value) {
      leadForm[field] = value;
    },

    submitForm: function(event) {
      event.preventDefault();
      
      if (!leadForm.name || !leadForm.email || !leadForm.company) {
        alert('Please fill in all required fields');
        return;
      }

      // Submit lead to API
      fetch(WIDGET_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          source: 'chat_widget',
          timestamp: new Date().toISOString()
        })
      }).then(response => {
        if (response.ok) {
          addMessage(`Thank you ${leadForm.name} from ${leadForm.company}! Our team will contact you within 24 hours to discuss your digital marketing goals.`, false);
        } else {
          addMessage("Sorry, there was an error. Please call us at (877) 840-6250.", false);
        }
        chatPhase = 'chat';
        renderInput();
      }).catch(() => {
        addMessage("Sorry, there was an error. Please call us at (877) 840-6250.", false);
        chatPhase = 'chat';
        renderInput();
      });
    },

    sendMessage: function(event) {
      event.preventDefault();
      const input = document.getElementById('tb-message-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      addMessage(message, true);
      input.value = '';
      
      // Auto-response simulation
      setTimeout(() => {
        const lowerMessage = message.toLowerCase();
        let response = "Thanks for your message! Our team will get back to you shortly.";
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
          response = "Our pricing varies based on your specific needs. I'll have our team prepare a custom quote for you.";
        } else if (lowerMessage.includes('service')) {
          response = "We specialize in digital marketing, SEO, and paid advertising to boost your online traffic and conversions.";
        }
        
        addMessage(response, false);
      }, 1000);
    },

    startVideo: function() {
      alert('Video calling feature requires camera permissions. Our team will call you to set up a video consultation.');
    }
  };

  // Auto-initialize if config is provided
  if (window.TBWidgetConfig) {
    document.addEventListener('DOMContentLoaded', function() {
      TrafikBoostersWidget.init(window.TBWidgetConfig);
    });
  }
})();