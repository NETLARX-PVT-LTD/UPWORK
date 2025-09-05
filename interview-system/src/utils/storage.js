// Local storage utilities for data persistence
const STORAGE_KEYS = {
  QUESTIONS: 'interview_questions',
  LINKS: 'interview_links',
  INTERVIEWS: 'completed_interviews'
};

export const storage = {
  // Questions management
  getQuestions: () => {
    const questions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return questions ? JSON.parse(questions) : [];
  },
  
  saveQuestions: (questions) => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },
  
  // Links management
  getLinks: () => {
    const links = localStorage.getItem(STORAGE_KEYS.LINKS);
    return links ? JSON.parse(links) : [];
  },
  
  saveLinks: (links) => {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  },
  
  // Interviews management
  getInterviews: () => {
    const interviews = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    return interviews ? JSON.parse(interviews) : [];
  },
  
  saveInterview: (interview) => {
    const interviews = storage.getInterviews();
    interviews.push({
      ...interview,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
  },
  // New methods for IP ranges
  getOfficeIPRanges: () => {
    const saved = localStorage.getItem('office_ip_ranges');
    return saved ? JSON.parse(saved) : ['192.168.1.', '10.0.0.', '172.16.']; // Default values
  },
  saveOfficeIPRanges: (ranges) => {
    localStorage.setItem('office_ip_ranges', JSON.stringify(ranges));
  }
};