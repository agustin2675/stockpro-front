import { axiosInstance } from "./axios-instance"


export const getTipoStock = async () => {
    try {
        const response = await axiosInstance.get('/tipo-stocks');
        return response.data
    } catch (error) {
        console.error(error)        
    }
}

export const postTipoStock = async (nombre) => {
    try {
        const payload = {
            nombre
        }
        const response = await axiosInstance.post('/tipo-stocks', payload);
        return response.data;
    } catch (error) {
        console.error("Error al crear tipo de stock:", error);
        throw error;
    }
}

export const desactivarTipoStock = async (id) => {
  try {
    const response = await axiosInstance.delete(`/tipo-stocks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar el tipo de stock con id ${id}:`, error);
    throw error;
  }
};

export const putTipoStock = async (id, nombre) => {
  if (id == null) throw new Error("putTipoStock: id es requerido");
  const { data } = await axiosInstance.put(`/tipo-stocks/${id}`, { nombre });
  return data;
};