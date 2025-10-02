import { axiosInstance } from "./axios-instance";

export const getSucursales = async () => {
  try {
    const { data } = await axiosInstance.get("/sucursales");
    return data;
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    throw error;
  }
};

/**
 * Obtener una sucursal por ID
 * @param {number|string} id
 */
export const getSucursalById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/sucursales/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener sucursal con id ${id}:`, error);
    throw error;
  }
};

/**
 * Crear sucursal
 * @param {object} payload - ej: { nombre, direccion, telefono, activo }
 */
export const postSucursal = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/sucursales", payload);
    return data;
  } catch (error) {
    console.error("Error al crear sucursal:", error);
    throw error;
  }
};

/**
 * Actualizar sucursal (PUT reemplaza/actualiza los campos provistos)
 * @param {number|string} id
 * @param {object} payload - ej: { nombre, direccion, telefono, activo }
 */
export const putSucursal = async (id, payload) => {
  try {
    const { data } = await axiosInstance.put(`/sucursales/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Error al actualizar sucursal con id ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar sucursal
 * - Si tu backend hace baja lógica, este DELETE puede marcar activo=false.
 * - Si hace borrado físico, elimina el registro.
 * @param {number|string} id
 */
export const deleteSucursal = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/sucursales/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al eliminar sucursal con id ${id}:`, error);
    throw error;
  }
};
