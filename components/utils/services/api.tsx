import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Your backend server URL
  timeout: 10000,
});

export default api;
