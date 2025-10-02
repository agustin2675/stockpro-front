import { axiosInstance } from "./axios-instance"


export const getRubro = async () => {
    try {
        const response = await axiosInstance.get('/rubros');
        return response.data
    } catch (error) {
        console.error(error)        
    }
}

export const postRubro = async (nombre) => {
    try {
        const payload = {
            nombre
        }
        const response = await axiosInstance.post('/rubros', payload);
        return response.data;
    } catch (error) {
        console.error("Error al crear rubro:", error);
        throw error;
    }
}

export const getRubroById = async (id) => {
    try {
        const response = await axiosInstance.get(`/rubros/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener rubro con id ${id}:`, error);
        throw error;
    }
}

export const desactivarRubro = async (id) => {
  try {
    const response = await axiosInstance.delete(`/rubros/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar el rubro con id ${id}:`, error);
    throw error;
  }
};

export const putRubro = async (id, nombre) => {
  const payload = { nombre };
  const { data } = await axiosInstance.put(`/rubros/${id}`, payload);
  return data;
};