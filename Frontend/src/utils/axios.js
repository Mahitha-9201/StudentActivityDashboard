import axios from 'axios';
import config from './config';

// Create an Axios instance with baseURL set
const axiosInstance = axios.create({
    baseURL: config.baseURL,
});

export default axiosInstance;
