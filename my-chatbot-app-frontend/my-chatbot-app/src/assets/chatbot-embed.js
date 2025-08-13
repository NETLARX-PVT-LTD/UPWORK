// src/assets/chatbot-embed.js
(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.ChatbotWidget) {
    return;
  }

  window.ChatbotWidget = {
    initialized: false,
    config: null,
    iframe: null,
    container: null,

    init: function(options) {
      if (this.initialized) {
        console.warn('ChatbotWidget already initialized');
        return;
      }

      this.config = Object.assign({
        containerId: 'chatbot-widget',
        widgetUrl: '',
        config: {}
      }, options);

      console.log('Initializing ChatbotWidget with config:', this.config);

      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        console.error('Chatbot container not found:', this.config.containerId);
        return;
      }

      this.createWidget();
      this.setupEventListeners();
      this.initialized = true;
      
      console.log('ChatbotWidget initialized successfully');
    },

    createWidget: function() {
      // Build URL with configuration parameters
      const params = new URLSearchParams();
      Object.keys(this.config.config).forEach(key => {
        if (this.config.config[key] !== null && this.config.config[key] !== undefined) {
          params.append(key, this.config.config[key].toString());
        }
      });

      const widgetUrl = this.config.widgetUrl + '?' + params.toString();
      console.log('Creating widget with URL:', widgetUrl);

      // Create iframe
      this.iframe = document.createElement('iframe');
      this.iframe.src = widgetUrl;
      this.iframe.style.cssText = `
        border: none;
        position: fixed;
        z-index: 10000;
        background: transparent;
        border-radius: 16px;
        
        transition: all 0.3s ease;
      `;

      // Apply initial position and size
      this.applyPosition(this.config.config.position || 'bottom-right');
      this.applySize(this.config.config.size || 'medium');

      // Add to container (which should be in the body)
      if (this.container.tagName.toLowerCase() === 'body' || this.container === document.body) {
        document.body.appendChild(this.iframe);
      } else {
        this.container.appendChild(this.iframe);
      }

      // Show iframe after loading
      this.iframe.onload = () => {
        console.log('Chatbot iframe loaded successfully');
        this.iframe.style.opacity = '1';
      };

      this.iframe.onerror = () => {
        console.error('Failed to load chatbot iframe');
      };
    },

    applyPosition: function(position) {
      const style = this.iframe.style;
      
      // Reset all positions
      style.top = 'auto';
      style.bottom = 'auto';
      style.left = 'auto';
      style.right = 'auto';

      switch (position) {
        case 'bottom-right':
          style.bottom = '20px';
          style.right = '20px';
          break;
        case 'bottom-left':
          style.bottom = '20px';
          style.left = '20px';
          break;
        case 'top-right':
          style.top = '20px';
          style.right = '20px';
          break;
        case 'top-left':
          style.top = '20px';
          style.left = '20px';
          break;
        default:
          style.bottom = '20px';
          style.right = '20px';
      }
    },

    applySize: function(size) {
      const dimensions = {
        small: { width: '320px', height: '500px' },
        medium: { width: '380px', height: '600px' },
        large: { width: '450px', height: '700px' }
      };

      const dim = dimensions[size] || dimensions.medium;
      this.iframe.style.width = dim.width;
      this.iframe.style.height = dim.height;
    },

    setupEventListeners: function() {
      // Listen for messages from the iframe
      window.addEventListener('message', (event) => {
        // Security check - ensure message is from our iframe
        if (event.source !== this.iframe.contentWindow) {
          return;
        }

        console.log('Received message from chatbot:', event.data);
        this.handleMessage(event.data);
      });

      // Handle window resize for responsiveness
      window.addEventListener('resize', () => {
        this.handleResize();
      });

      // Handle visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.sendMessageToWidget({ type: 'page-hidden' });
        } else {
          this.sendMessageToWidget({ type: 'page-visible' });
        }
      });
    },

    handleMessage: function(data) {
      switch (data.type) {
        case 'chatbot-minimize':
          this.minimizeWidget();
          break;
        case 'chatbot-maximize':
          this.maximizeWidget();
          break;
        case 'chatbot-resize':
          this.applySize(data.size);
          break;
        case 'chatbot-notification':
          this.showNotification(data.count);
          break;
        case 'chatbot-ready':
          console.log('Chatbot is ready');
          break;
        case 'chatbot-new-message':
          console.log('New message:', data.message);
          break;
      }
    },

    sendMessageToWidget: function(data) {
      if (this.iframe && this.iframe.contentWindow) {
        this.iframe.contentWindow.postMessage(data, '*');
      }
    },

    handleResize: function() {
      const windowWidth = window.innerWidth;
      
      // Make widget responsive on mobile
      if (windowWidth <= 480) {
        this.iframe.style.width = 'calc(100vw - 20px)';
        this.iframe.style.height = 'calc(100vh - 20px)';
        this.iframe.style.top = '10px';
        this.iframe.style.left = '10px';
        this.iframe.style.right = '10px';
        this.iframe.style.bottom = '10px';
      } else {
        // Restore original size and position
        this.applySize(this.config.config.size || 'medium');
        this.applyPosition(this.config.config.position || 'bottom-right');
      }
    },

    minimizeWidget: function() {
      this.iframe.style.transform = 'scale(0.8)';
      this.iframe.style.opacity = '0';
      setTimeout(() => {
        this.iframe.style.display = 'none';
      }, 300);
    },

    maximizeWidget: function() {
      this.iframe.style.display = 'block';
      setTimeout(() => {
        this.iframe.style.transform = 'scale(1)';
        this.iframe.style.opacity = '1';
      }, 10);
    },

    showNotification: function(count) {
      // This could trigger browser notifications
      if (count > 0 && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New message from chatbot', {
          body: `You have ${count} unread message${count > 1 ? 's' : ''}`,
          icon: '/favicon.ico',
          tag: 'chatbot-notification'
        });
      }
    },

    destroy: function() {
      if (this.iframe && this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
      }
      this.initialized = false;
      this.iframe = null;
      this.container = null;
      this.config = null;
      console.log('ChatbotWidget destroyed');
    }
  };

  // Auto-initialize if config is available
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for chatbot config...');
    
    if (window.ChatbotConfig) {
      console.log('Found ChatbotConfig:', window.ChatbotConfig);
      
      // Find container
      const container = document.querySelector('[id^="chatbot-widget"]');
      if (container) {
        console.log('Found chatbot container:', container.id);
        
        window.ChatbotWidget.init({
          containerId: container.id,
          widgetUrl: window.location.protocol + '//' + window.location.host + '/chatbot-widget',
          config: window.ChatbotConfig
        });
      } else {
        console.error('Chatbot container not found');
      }
    } else {
      console.log('No ChatbotConfig found');
    }
  });

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }

})();