// Network utility functions
export const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return null;
  }
};

export const isOfficeNetwork = (clientIP, officeIPRanges) => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return true;
  }
  
  return officeIPRanges.some(range => clientIP?.startsWith(range));
};

export const validateLinkIP = (currentIP, storedIP) => {
  // This is the core logic for the new functionality.
  // It returns true only if the IPs are an exact match.
  return currentIP === storedIP;
};

export const generateSecureID = () => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};