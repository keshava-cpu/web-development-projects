import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000",
});

export const loginUser = async (data) => API.post('/login', data);
export const signupUser = async (data) => API.post('/signup', data);
export const getUser = async () => API.get('/user');
export const getAllUsers = async () => API.get('/user/all');

export default API;
