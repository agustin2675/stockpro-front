import { axiosInstance } from "./axios-instance"

export const getUnidadesMedida = async () => {
    try {
        const response = await axiosInstance.get('/unidades-medida');
        return response.data
    } catch (error) {
        console.error(error)        
    }
}

export const postUnidad = async (nombre) => {
  try {
    const payload = { nombre };
    const { data } = await axiosInstance.post("/unidades-medida", payload);
    return data;
  } catch (error) {
    console.error("Error al crear unidad:", error);
    throw error;
  }
};

export const putUnidad = async (id, nombre) => {
  const payload = { nombre };
  const { data } = await axiosInstance.put(`/unidades-medida/${id}`, payload);
  return data;
};

export const desactivarUnidad = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/unidades-medida/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al desactivar la unidad con id ${id}:`, error);
    throw error;
  }
};
