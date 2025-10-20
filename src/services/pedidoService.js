import { axiosInstance } from "./axios-instance"

export const getPedido = async () => {
    try {
        const response = await axiosInstance.get('/pedidos');
        return response.data
    } catch (error) {
        console.error(error)        
    }
}

export const getPedidoById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/pedidos/${id}`);
    return data; // <-- aquí viene el detalle, como el ejemplo que mandaste
  } catch (error) {
    console.error(`Error al obtener pedido ${id}:`, error);
    throw error;
  }
};

export const postPedido = async (payload) => {
  try {
        const response = await axiosInstance.post('/pedidos', payload);
        return response.data;
    } catch (error) {
        console.error("Error al crear rubro:", error);
        throw error;
    }
};

export const desactivarPedido = async (id) => {
  try {
    const response = await axiosInstance.delete(`/pedidos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar Pedido con id ${id}:`, error);
    throw error;
  }
};

export async function updatePedido(id, payload) {
  try {
    const { data } = await axiosInstance.put(`/pedidos/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Error al actualizar Pedido ${id}:`, error);
    throw error;
  }
}

export const imprimirPedido = async (id) => {
  try {
    const fileURL = `${import.meta.env.VITE_API_URL}/pedidos/imprimir/${id}`

    window.open(fileURL, '_blank');
  } catch (error) {
    console.error(`Error al imprimir Pedido ${id}:`, error);
    throw error;
  }
};