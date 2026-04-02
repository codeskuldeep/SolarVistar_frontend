import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // 👈 This tells Axios to automatically send the cookie!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept 401s to handle session expiry during normal use.
// Guard: never redirect when already on /login — avoids infinite reload loop
// on the initial auth check (getCurrentUser) when the user has no session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Instead of redirect, just let Redux handle logout
      console.log("Session expired");
    }
    return Promise.reject(error);
  }
);

export default api;