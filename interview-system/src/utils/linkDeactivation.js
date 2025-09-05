// Enhanced Link Deactivation Utilities
// utils/linkDeactivation.js

export const LinkDeactivationManager = {
  // Storage keys
  DEACTIVATED_LINKS_KEY: 'deactivated_interview_links',
  TERMINATED_SESSIONS_KEY: 'terminated_test_sessions',
  
  // Check if a link is deactivated
  isLinkDeactivated(linkId) {
    if (!linkId) return false;
    
    try {
      const deactivatedLinks = JSON.parse(localStorage.getItem(this.DEACTIVATED_LINKS_KEY) || '[]');
      console.log('Checking deactivation for linkId:', linkId);
      console.log('Deactivated links:', deactivatedLinks);
      return deactivatedLinks.includes(linkId);
    } catch (error) {
      console.error('Error checking link deactivation status:', error);
      return false;
    }
  },

  // Deactivate a link permanently with detailed logging
  deactivateLink(linkId, terminationData = {}) {
    if (!linkId) {
      console.error('Cannot deactivate link: linkId is required');
      return false;
    }

    try {
      // Get existing deactivated links
      const deactivatedLinks = JSON.parse(localStorage.getItem(this.DEACTIVATED_LINKS_KEY) || '[]');
      
      // Add link if not already deactivated
      if (!deactivatedLinks.includes(linkId)) {
        deactivatedLinks.push(linkId);
        localStorage.setItem(this.DEACTIVATED_LINKS_KEY, JSON.stringify(deactivatedLinks));
        console.log('Link deactivated:', linkId);
      } else {
        console.log('Link already deactivated:', linkId);
      }

      // Store detailed termination record
      const terminationRecord = {
        linkId,
        reason: terminationData.reason || 'Security violation',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        candidateName: terminationData.candidateName,
        violations: terminationData.violations || [],
        testDuration: terminationData.testDuration || 0,
        autoDeactivated: true,
        ...terminationData
      };

      const terminatedSessions = JSON.parse(localStorage.getItem(this.TERMINATED_SESSIONS_KEY) || '[]');
      terminatedSessions.push(terminationRecord);
      localStorage.setItem(this.TERMINATED_SESSIONS_KEY, JSON.stringify(terminatedSessions));
      console.log('Termination record saved:', terminationRecord);

      // Clear any session-specific data
      this.clearSessionData();

      // Update the original links storage to mark as deactivated
      this.updateLinkStatus(linkId, 'terminated', terminationData.reason || 'Security violation');

      // Notify parent window if in iframe or popup
      this.notifyParentWindow(linkId, terminationRecord);

      return true;
    } catch (error) {
      console.error('Error deactivating link:', error);
      return false;
    }
  },

  // Update link status in the original links storage
  updateLinkStatus(linkId, status, reason = null) {
    try {
      const links = JSON.parse(localStorage.getItem('interview_links') || '[]');
      const updatedLinks = links.map(link => 
        link.id === linkId 
          ? { 
              ...link, 
              status: status,
              terminatedAt: status === 'terminated' ? new Date().toISOString() : link.terminatedAt,
              terminationReason: reason || link.terminationReason,
              deactivatedAt: status === 'deactivated' ? new Date().toISOString() : link.deactivatedAt,
              deactivationReason: reason || link.deactivationReason
            }
          : link
      );
      localStorage.setItem('interview_links', JSON.stringify(updatedLinks));
      console.log('Link status updated in storage:', { linkId, status, reason });
    } catch (error) {
      console.error('Error updating link status:', error);
    }
  },

  // Clear session data to prevent re-entry
  clearSessionData() {
    try {
      sessionStorage.clear();
      // Remove specific test-related items from localStorage if needed
      localStorage.removeItem('test_start_time');
      localStorage.removeItem('current_question');
      localStorage.removeItem('test_answers');
      localStorage.removeItem('test_violations');
      localStorage.removeItem('active_test_link_id');
      localStorage.removeItem('test_candidate');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  },

  // Get termination details for a link
  getTerminationDetails(linkId) {
    try {
      const terminatedSessions = JSON.parse(localStorage.getItem(this.TERMINATED_SESSIONS_KEY) || '[]');
      return terminatedSessions.filter(session => session.linkId === linkId);
    } catch (error) {
      console.error('Error getting termination details:', error);
      return [];
    }
  },

  // Get deactivation info for display
  getDeactivationInfo(linkId) {
    try {
      const terminationDetails = this.getTerminationDetails(linkId);
      if (terminationDetails.length > 0) {
        const latest = terminationDetails[terminationDetails.length - 1];
        return {
          reason: latest.reason,
          details: latest.reason,
          terminatedAt: latest.timestamp,
          violations: latest.violations || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting deactivation info:', error);
      return null;
    }
  },

  // Notify parent window about termination
  notifyParentWindow(linkId, terminationRecord) {
    try {
      // Try to notify parent window if available
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'TEST_TERMINATED',
          linkId: linkId,
          terminationRecord: terminationRecord
        }, '*');
      }

      // Try to notify opener window if available
      if (window.opener) {
        window.opener.postMessage({
          type: 'TEST_TERMINATED',
          linkId: linkId,
          terminationRecord: terminationRecord
        }, '*');
      }

      // Also try global notification handler
      if (window.handleTestTermination) {
        window.handleTestTermination({
          linkId: linkId,
          ...terminationRecord
        });
      }
    } catch (error) {
      console.warn('Could not notify parent window:', error);
    }
  },

  // Reactivate a link (admin function)
  reactivateLink(linkId) {
    if (!linkId) return false;
    
    try {
      // Remove from deactivated links
      const deactivatedLinks = JSON.parse(localStorage.getItem(this.DEACTIVATED_LINKS_KEY) || '[]');
      const updatedLinks = deactivatedLinks.filter(id => id !== linkId);
      localStorage.setItem(this.DEACTIVATED_LINKS_KEY, JSON.stringify(updatedLinks));

      // Update link status in original storage
      this.updateLinkStatus(linkId, 'active');

      console.log('Link reactivated:', linkId);
      return true;
    } catch (error) {
      console.error('Error reactivating link:', error);
      return false;
    }
  },

  // Get all deactivated links (admin function)
  getAllDeactivatedLinks() {
    try {
      return JSON.parse(localStorage.getItem(this.DEACTIVATED_LINKS_KEY) || '[]');
    } catch (error) {
      console.error('Error getting deactivated links:', error);
      return [];
    }
  },

  // Validate link access (comprehensive check)
  validateLinkAccess(linkId) {
    if (!linkId) {
      return { valid: false, reason: 'No link ID provided' };
    }

    // Check if deactivated
    if (this.isLinkDeactivated(linkId)) {
      const terminationDetails = this.getTerminationDetails(linkId);
      const latestTermination = terminationDetails[terminationDetails.length - 1];
      return { 
        valid: false, 
        reason: 'Link permanently deactivated due to security violations', 
        details: latestTermination 
      };
    }

    // Check if link exists in storage
    try {
      const links = JSON.parse(localStorage.getItem('interview_links') || '[]');
      const link = links.find(l => l.id === linkId);
      
      if (!link) {
        return { valid: false, reason: 'Link not found' };
      }

      if (link.status === 'terminated') {
        return { 
          valid: false, 
          reason: 'Link terminated due to security violations',
          details: {
            terminatedAt: link.terminatedAt,
            reason: link.terminationReason
          }
        };
      }

      if (link.status === 'deactivated') {
        return { 
          valid: false, 
          reason: 'Link deactivated',
          details: {
            deactivatedAt: link.deactivatedAt,
            reason: link.deactivationReason
          }
        };
      }

      if (link.status === 'completed') {
        return { valid: false, reason: 'Test already completed' };
      }

      if (link.status !== 'active') {
        return { valid: false, reason: `Link status: ${link.status}` };
      }

      // Check expiry date if set
      if (link.expiryDate && new Date(link.expiryDate) < new Date()) {
        // Auto-update to expired status
        this.updateLinkStatus(linkId, 'expired', 'Link expired');
        return { valid: false, reason: 'Link expired' };
      }

      return { valid: true, link };
    } catch (error) {
      console.error('Error validating link access:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }
};