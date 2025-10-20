// src/services/usersService.js
import { axiosInstance } from "./axios-instance";

/**
 * Obtener todos los usuarios
 */
export const getUsers = async () => {
  try {
    const { data } = await axiosInstance.get("/users");
    return data;
  } catch (error) {
    console.error("Error al traer usuarios:", error);
    throw error;
  }
};

/**
 * Crear usuario
 * payload esperado por el back (CreateUserDto):
 * { username: string, password: string, telefono: string, rol: Rol, sucursal_id: number }
 */
export const postUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/users", payload);
    return data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

/**
 * Cambiar contraseña
 * payload esperado por el back (UpdatePasswordDTO):
 * { user_id: number, password: string }
 * Nota: según tu back, el endpoint es PUT /users con el DTO en el body.
 */
export const updateUserPassword = async ({ user_id, password }) => {
  try {
    const { data } = await axiosInstance.put("/users", { user_id, password });
    return data;
  } catch (error) {
    console.error("Error al modificar contraseña:", error);
    throw error;
  }
};

/**
 * Desactivar usuario
 * Siguiendo el patrón de insumos: DELETE /users/:id
 * (Si en tu controller estuviera como DELETE /users con body { user_id },
 * avisame y te dejo la variante compatible.)
 */
export const desactivarUser = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/users/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al desactivar usuario con id ${id}:`, error);
    throw error;
  }
};
