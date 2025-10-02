import { axiosInstance } from "./axios-instance"

export const getInsumos = async () => {
    try {
        const response = await axiosInstance.get('/insumos');
        return response.data
    } catch (error) {
        console.error(error)        
    }
}

export const postInsumo = async (nombre, unidadDeMedida_id, rubro_id) => {
  try {
        const payload = {
            nombre,
            unidadDeMedida_id,
            rubro_id
        }
        const response = await axiosInstance.post('/insumos', payload);
        return response.data;
    } catch (error) {
        console.error("Error al crear rubro:", error);
        throw error;
    }
};

export const desactivarInsumo = async (id) => {
  try {
    const response = await axiosInstance.delete(`/insumos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar insumo con id ${id}:`, error);
    throw error;
  }
};

export const putInsumo = async (id, { nombre, unidadDeMedida_id, rubro_id }) => {
  const payload = { nombre, unidadDeMedida_id, rubro_id };
  const { data } = await axiosInstance.put(`/insumos/${id}`, payload);
  return data;
};

