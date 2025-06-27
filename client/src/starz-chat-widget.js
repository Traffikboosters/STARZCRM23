/**
 * Starz Chat Widget with Email Auto-Reply
 * Powered by Traffik Boosters - More Traffik! More Sales!
 * 
 * Email Configuration:
 * - IMAP: imap.ipage.com:993 (SSL/TLS)
 * - SMTP: smtp.ipage.com:465 (SSL/TLS)
 * - Account: starz@traffikboosters.com
 */

(function() {
  'use strict';

  // Widget configuration
  const config = window.TrafficBoostersChat || {
    apiKey: 'demo',
    settings: {
      position: 'bottom-right',
      primaryColor: 'hsl(14, 88%, 55%)',
      accentColor: 'hsl(29, 85%, 58%)',
      welcomeMessage: 'Hi! How can we help boost your business today?',
      collectEmail: true,
      collectPhone: true
    }
  };

  // Check if widget is already loaded
  if (window.starzChatWidgetLoaded) return;
  window.starzChatWidgetLoaded = true;

  // Business hours check (EST: 9 AM - 6 PM, Monday-Friday)
  function isBusinessHours() {
    const now = new Date();
    const est = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hour = est.getHours();
    const day = est.getDay();
    
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  }

  // Create widget HTML
  function createWidget() {
    const widgetHTML = `
      <div id="starz-chat-widget" style="
        position: fixed;
        ${config.settings.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        ${config.settings.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Chat Button -->
        <div id="chat-button" style="
          width: 60px;
          height: 60px;
          background: ${config.settings.primaryColor};
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        ">
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEwLjI0MjlMMTEuNzU3MSAyMUwxMC4yNDI5IDE5LjQ4NTdMMTkuNDg1NyAxMC4yNDI5TDIxIDEwLjI0MjlaTTIxIDEwLjI0MjlMMTkuNDg1NyA4LjcyODU3TDEwLjI0MjkgMTcuOTcxNEw4LjcyODU3IDE5LjQ4NTdMMTcuOTcxNCAyOC43Mjg2TDE5LjQ4NTcgMzAuMjQyOUwyMS4wIDI4LjcyODZMMjEgMTAuMjQyOVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" alt="Chat" style="width: 24px; height: 24px;">
          <div id="status-indicator" style="
            position: absolute;
            top: 8px;
            right: 8px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${isBusinessHours() ? '#10B981' : '#F59E0B'};
            border: 2px solid white;
          "></div>
        </div>

        <!-- Chat Panel -->
        <div id="chat-panel" style="
          display: none;
          position: absolute;
          ${config.settings.position.includes('bottom') ? 'bottom: 70px;' : 'top: 70px;'}
          ${config.settings.position.includes('right') ? 'right: 0;' : 'left: 0;'}
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          overflow: hidden;
        ">
          <!-- Header -->
          <div style="
            background: ${config.settings.primaryColor};
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Traffik Boosters" style="width: 24px; height: 24px; border-radius: 4px;">
            <div>
              <div style="font-weight: 600; font-size: 14px;">Traffik Boosters</div>
              <div style="font-size: 12px; opacity: 0.9;">More Traffik! More Sales!</div>
              <div style="font-size: 11px; opacity: 0.8;">
                ${isBusinessHours() ? 'Online Now' : 'Will Call Within 24hrs'}
              </div>
            </div>
            <button id="close-chat" style="
              background: none;
              border: none;
              color: white;
              font-size: 18px;
              cursor: pointer;
              margin-left: auto;
            ">×</button>
          </div>

          <!-- Form -->
          <div style="padding: 20px;">
            <div style="margin-bottom: 16px; color: #374151; font-size: 14px;">
              ${config.settings.welcomeMessage}
            </div>
            
            <form id="chat-form">
              <div style="margin-bottom: 12px;">
                <input type="text" id="visitor-name" placeholder="Your Name" required style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #D1D5DB;
                  border-radius: 6px;
                  font-size: 14px;
                  box-sizing: border-box;
                ">
              </div>
              
              ${config.settings.collectEmail ? `
              <div style="margin-bottom: 12px;">
                <input type="email" id="visitor-email" placeholder="Business Email" required style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #D1D5DB;
                  border-radius: 6px;
                  font-size: 14px;
                  box-sizing: border-box;
                ">
              </div>
              ` : ''}

              <div style="margin-bottom: 12px;">
                <input type="text" id="company-name" placeholder="Company Name" required style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #D1D5DB;
                  border-radius: 6px;
                  font-size: 14px;
                  box-sizing: border-box;
                ">
              </div>
              
              ${config.settings.collectPhone ? `
              <div style="margin-bottom: 12px;">
                <input type="tel" id="visitor-phone" placeholder="Phone Number" style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #D1D5DB;
                  border-radius: 6px;
                  font-size: 14px;
                  box-sizing: border-box;
                ">
              </div>
              ` : ''}
              
              <div style="margin-bottom: 16px;">
                <textarea id="visitor-message" placeholder="How can we help you?" rows="3" style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #D1D5DB;
                  border-radius: 6px;
                  font-size: 14px;
                  resize: vertical;
                  box-sizing: border-box;
                "></textarea>
              </div>
              
              <button type="submit" id="submit-chat" style="
                width: 100%;
                background: ${config.settings.accentColor};
                color: white;
                border: none;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
              ">
                Start Chat
              </button>
            </form>

            <!-- Success Message -->
            <div id="success-message" style="display: none; text-align: center; padding: 20px;">
              <div style="color: #10B981; font-weight: 600; margin-bottom: 8px;">
                Thank you! Message sent successfully.
              </div>
              <div style="color: #6B7280; font-size: 13px; line-height: 1.4;">
                Auto-reply email sent from starz@traffikboosters.com<br>
                A growth expert will call you within 24 business hours.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  // Submit form with auto-reply
  async function submitForm(formData) {
    try {
      const response = await fetch('/api/chat-widget/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorName: formData.get('name'),
          visitorEmail: formData.get('email'),
          visitorPhone: formData.get('phone'),
          companyName: formData.get('company'),
          message: formData.get('message') || 'Initial contact from chat widget'
        })
      });

      if (response.ok) {
        const result = await response.json();
        showSuccessMessage();
        
        // Track conversion event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'chat_widget_submission', {
            'event_category': 'engagement',
            'event_label': 'chat_widget',
            'value': 1
          });
        }
        
        return true;
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Chat widget submission error:', error);
      alert('Failed to send message. Please try again or call (877) 840-6250 directly.');
      return false;
    }
  }

  // Show success message
  function showSuccessMessage() {
    document.getElementById('chat-form').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';
    
    setTimeout(() => {
      document.getElementById('chat-panel').style.display = 'none';
    }, 5000);
  }

  // Initialize widget
  function initWidget() {
    createWidget();

    const chatButton = document.getElementById('chat-button');
    const chatPanel = document.getElementById('chat-panel');
    const closeButton = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');

    // Toggle chat panel
    chatButton.addEventListener('click', () => {
      const isVisible = chatPanel.style.display === 'block';
      chatPanel.style.display = isVisible ? 'none' : 'block';
    });

    // Close chat
    closeButton.addEventListener('click', () => {
      chatPanel.style.display = 'none';
    });

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = document.getElementById('submit-chat');
      const originalText = submitButton.textContent;
      
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      const formData = new FormData(chatForm);
      formData.set('name', document.getElementById('visitor-name').value);
      formData.set('email', document.getElementById('visitor-email').value);
      formData.set('company', document.getElementById('company-name').value);
      formData.set('phone', document.getElementById('visitor-phone').value);
      formData.set('message', document.getElementById('visitor-message').value);
      
      const success = await submitForm(formData);
      
      if (!success) {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!document.getElementById('starz-chat-widget').contains(e.target)) {
        chatPanel.style.display = 'none';
      }
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();