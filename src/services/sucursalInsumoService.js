import { axiosInstance } from "./axios-instance"

export const postSucursalInsumo = async (body) => {
  try {
    const { data } = await axiosInstance.post("/insumos/sucursal", {
      sucursal_id: body.sucursal_id,
      insumo_id: body.insumo_id,
      tipoStock_id: body.tipoStock_id,
      cantidadReal: body.cantidadReal,
      cantidadIdeal: body.cantidadIdeal,
      cantidadMinima: body.cantidadMinima ?? 0, // 👈 agregado
    });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const createOrUpdateSucursalInsumo = async ({
  sucursal_id,
  tipoStock_id,
  insumo_id,
  cantidadReal,
  cantidadIdeal,
  cantidadMinima
}) => {
  const body = {
    sucursal_id: Number(sucursal_id),
    tipoStock_id: Number(tipoStock_id),
    insumo_id: Number(insumo_id),
    cantidadReal: Number(cantidadReal),
    cantidadIdeal: Number(cantidadIdeal),
    cantidadMinima: Number(cantidadMinima),
  };
  // Útil cuando estás debuggeando
  console.log("[svc] POST /insumos/sucursal =>", body);

  const { data } = await axiosInstance.post("/insumos/sucursal", body);
  return data; // ideal: que venga include {insumo, tipoStock, sucursal}
};

/**
 * Listar SucursalInsumo con filtros opcionales
 * Soporta: ?sucursal_id=&insumo_id=&tipoStock_id=
 */
export const getSucursalInsumo = async ({ sucursal_id, insumo_id, tipoStock_id } = {}) => {
  try {
    const params = {};
    if (sucursal_id !== undefined) params.sucursal_id = sucursal_id;
    if (insumo_id   !== undefined) params.insumo_id   = insumo_id;
    if (tipoStock_id!== undefined) params.tipoStock_id= tipoStock_id;

    const { data } = await axiosInstance.get('/insumos/sucursal', { params });
    return data;
  } catch (error) {
    console.error("Error al listar SucursalInsumo:", error);
    throw error;
  }
};

/**
 * Obtener un SucursalInsumo por ID
 */
export const getSucursalInsumoById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/insumos/sucursal/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener SucursalInsumo id=${id}:`, error);
    throw error;
  }
};

/**
 * Actualizar un SucursalInsumo por ID (PUT)
 * Podés pasar sólo los campos a actualizar: { cantidadReal?, cantidadIdeal?, tipoStock_id? }
 */
export const putSucursalInsumo = async (id, payload) => {
  const { data } = await axiosInstance.put(`/insumos/sucursal/${id}`, payload);
  return data;
};

/**
 * Eliminar un SucursalInsumo por ID (DELETE)
 */
export const deleteSucursalInsumo = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/insumos/sucursal/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al eliminar SucursalInsumo id=${id}:`, error);
    throw error;
  }
};

/**
 * Upsert (PUT /insumos/sucursal/upsert)
 * Ojo: depende de la clave única definida en schema.prisma (ver backend).
 */
export const upsertSucursalInsumo = async (body) => {
  try {
    const { data } = await axiosInstance.put(`/insumos/sucursal/upsert`, {
      sucursal_id: body.sucursal_id,
      insumo_id: body.insumo_id,
      tipoStock_id: body.tipoStock_id,
      cantidadReal: body.cantidadReal,
      cantidadIdeal: body.cantidadIdeal,
      cantidadMinima: body.cantidadMinima ?? 0,
    });
    return data;
  } catch (error) {
    console.error(error);
  }
};



