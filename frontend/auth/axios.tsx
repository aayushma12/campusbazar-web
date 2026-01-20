import axios from 'axios';

const axiosApi = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // required for cookies/auth headers
});

export default axiosApi;
