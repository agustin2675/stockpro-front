import { axiosInstance } from "./axios-instance"

export const postAuth = async (user, password) => {
  try {
        const payload = {
            username: user,
            password: password
        }
        const response = await axiosInstance.post('/auth/login', payload);
        return response.data;
    } catch (error) {
        console.error("Error al autenticar:", error);
        throw error;
    }
};