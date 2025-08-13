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
        return;
      }

      this.config = Object.assign({
        containerId: 'chatbot-widget',
        widgetUrl: '',
        config: {}
      }, options);

      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        console.error('Chatbot container not found:', this.config.containerId);
        return;
      }

      this.createWidget();
      this.setupEventListeners();
      this.initialized = true;
    },

    createWidget: function() {
      // Create iframe
      this.iframe = document.createElement('iframe');
      this.iframe.src = this.config.widgetUrl + '&' + this.buildQueryString(this.config.config);
      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        background: transparent;
        pointer-events: none;
      `;

      // Apply position and size from config
      if (this.config.config.position) {
        this.applyPosition(this.config.config.position);
      }

      if (this.config.config.size) {
        this.applySize(this.config.config.size);
      }

      // Add to container
      this.container.appendChild(this.iframe);

      // Enable pointer events after loading
      this.iframe.onload = () => {
        this.iframe.style.pointerEvents = 'auto';
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

    buildQueryString: function(config) {
      const params = new URLSearchParams();
      
      Object.keys(config).forEach(key => {
        if (typeof config[key] === 'object') {
          params.append(key, JSON.stringify(config[key]));
        } else {
          params.append(key, config[key]);
        }
      });

      return params.toString();
    },

    setupEventListeners: function() {
      // Listen for messages from the iframe
      window.addEventListener('message', (event) => {
        if (event.source !== this.iframe.contentWindow) {
          return;
        }

        this.handleMessage(event.data);
      });

      // Handle window resize
      window.addEventListener('resize', () => {
        this.handleResize();
      });
    },

    handleMessage: function(data) {
      switch (data.type) {
        case 'chatbot-minimize':
          this.minimize();
          break;
        case 'chatbot-maximize':
          this.maximize();
          break;
        case 'chatbot-resize':
          this.resize(data.size);
          break;
        case 'chatbot-notification':
          this.showNotification(data.count);
          break;
      }
    },

    handleResize: function() {
      // Adjust widget position/size on window resize if needed
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Make widget responsive on mobile
      if (windowWidth <= 480) {
        this.iframe.style.width = 'calc(100vw - 40px)';
        this.iframe.style.height = 'calc(100vh - 40px)';
        this.iframe.style.top = '20px';
        this.iframe.style.left = '20px';
        this.iframe.style.right = '20px';
        this.iframe.style.bottom = '20px';
      } else {
        // Restore original size and position
        this.applySize(this.config.config.size || 'medium');
        this.applyPosition(this.config.config.position || 'bottom-right');
      }
    },

    minimize: function() {
      this.iframe.style.transform = 'scale(0)';
      this.iframe.style.opacity = '0';
    },

    maximize: function() {
      this.iframe.style.transform = 'scale(1)';
      this.iframe.style.opacity = '1';
    },

    resize: function(size) {
      this.applySize(size);
    },

    showNotification: function(count) {
      // This could trigger browser notifications or update a badge
      if (count > 0 && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New message from chatbot', {
          body: `You have ${count} unread message${count > 1 ? 's' : ''}`,
          icon: '/favicon.ico'
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
    }
  };

  // Auto-initialize if config is available
  if (window.ChatbotConfig) {
    document.addEventListener('DOMContentLoaded', function() {
      // Find container
      const container = document.querySelector('[id^="chatbot-widget"]');
      if (container) {
        window.ChatbotWidget.init({
          containerId: container.id,
          widgetUrl: window.location.origin + '/chatbot-widget',
          config: window.ChatbotConfig
        });
      }
    });
  }

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

})();