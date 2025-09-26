// API Configuration that works for both local and network access
const getBaseURL = () => {
  // If we're on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // If we're accessing via network IP, use the same IP for backend
  return `http://${window.location.hostname}:5000`;
};

export const API_BASE_URL = getBaseURL();
export default API_BASE_URL;