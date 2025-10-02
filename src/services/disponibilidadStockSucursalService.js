// src/services/disponibilidadStockSucursalService.js
import { axiosInstance } from "./axios-instance";

/* ---------- Normalizador ---------- */
const normDisp = (row) => ({
  id: Number(row.id),
  sucursalId: Number(row.sucursalId ?? row.sucursal_id ?? row.sucursal?.id),
  tipoStockId: Number(row.tipoStockId ?? row.tipoStock_id ?? row.tipoStock?.id),
  diaSemana: row.diaSemana ?? null,
});

/* ---------- CRUD base ---------- */
export const getDisponibilidad = async (sucursalId) => {
  const url = sucursalId
    ? `/sucursales/disponibilidad?sucursalId=${encodeURIComponent(sucursalId)}`
    : `/sucursales/disponibilidad`;
  const { data } = await axiosInstance.get(url);
  const arr = Array.isArray(data) ? data : [];
  return arr.map(normDisp);
};

export const getDisponibilidadByPar = async (sucursalId, tipoStockId) => {
  // OJO: este endpoint al parecer devuelve una sola fila o la primera.
  // Para multi-días no alcanza; por eso agregamos helpers abajo
  const { data } = await axiosInstance.get(`/sucursales/${sucursalId}/tipo/${tipoStockId}`);
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? normDisp(row) : null;
};

export const addDisponibilidad = async ({ sucursalId, tipoStockId, diaSemana = null }) => {
  // El back/DTO espera snake_case: sucursal_id, tipoStock_id
  const payload = {
    sucursal_id: Number(sucursalId),
    tipoStock_id: Number(tipoStockId),
  };
  if (diaSemana !== null && diaSemana !== undefined) {
    payload.diaSemana = Number(diaSemana);
  }
  const { data } = await axiosInstance.post(`/sucursales/add-disponibilidad`, payload);
  return normDisp(data);
};

export const updateDisponibilidad = async (id, { diaSemana = null }) => {
  const payload = {};
  if (diaSemana !== null && diaSemana !== undefined) payload.diaSemana = Number(diaSemana);
  const { data } = await axiosInstance.put(`/sucursales/update-disponibilidad/${id}`, payload);
  return normDisp(data);
};

export const removeDisponibilidad = async (id) => {
  const { data } = await axiosInstance.delete(`/sucursales/remove-disponibilidad/${id}`);
  return data;
};

/* ---------- Helpers altos existentes (single) ---------- */
export const enableTipoForSucursal = async (sucursalId, tipoStockId, diaSemana = null) => {
  const actual = await getDisponibilidadByPar(sucursalId, tipoStockId);
  if (actual) return actual;
  return addDisponibilidad({ sucursalId, tipoStockId, diaSemana });
};

export const disableTipoForSucursal = async (sucursalId, tipoStockId) => {
  const actual = await getDisponibilidadByPar(sucursalId, tipoStockId);
  if (!actual) return false;
  await removeDisponibilidad(actual.id);
  return true;
};

export const setDiaForTipoSucursal = async (sucursalId, tipoStockId, diaSemana /* number|null */) => {
  const actual = await getDisponibilidadByPar(sucursalId, tipoStockId);
  if (!actual) return addDisponibilidad({ sucursalId, tipoStockId, diaSemana });
  return updateDisponibilidad(actual.id, { diaSemana });
};

/* ---------- NUEVOS Helpers para MULTI-DÍAS ---------- */

/** Lista todos los registros de disponibilidad para {sucursalId, tipoStockId} */
export const listDiasForTipoSucursal = async (sucursalId, tipoStockId) => {
  const all = await getDisponibilidad(sucursalId);
  return (all || []).filter(
    (r) => Number(r.sucursalId) === Number(sucursalId) && Number(r.tipoStockId) === Number(tipoStockId)
  );
};

/**
 * Sincroniza por diferencias:
 * - Agrega registros para los días que falten
 * - Elimina registros para los días que sobren
 * @param {number} sucursalId
 * @param {number} tipoStockId
 * @param {Set<number>|number[]} diasSeleccionados valores 0..6 (0=Domingo)
 * @returns {Promise<Array>} estado final (array de rows normalizadas)
 */
export const syncDiasForTipoSucursal = async (sucursalId, tipoStockId, diasSeleccionados) => {
  const targetSet = new Set(Array.isArray(diasSeleccionados) ? diasSeleccionados : [...diasSeleccionados]);
  const actuales = await listDiasForTipoSucursal(sucursalId, tipoStockId);

  const actualesSet = new Set(
    actuales
      .map((r) => (r.diaSemana === null || r.diaSemana === undefined ? null : Number(r.diaSemana)))
      .filter((v) => v !== null && Number.isFinite(v))
  );

  // Agregar los que faltan
  for (const d of targetSet) {
    if (!actualesSet.has(Number(d))) {
      await addDisponibilidad({ sucursalId, tipoStockId, diaSemana: Number(d) });
    }
  }

  // Eliminar los que sobran
  for (const row of actuales) {
    const d = row.diaSemana;
    if (d === null || d === undefined) continue; // por si existe un 'global' sin día; lo dejamos
    if (!targetSet.has(Number(d))) {
      await removeDisponibilidad(row.id);
    }
  }

  // Devolver estado final
  return listDiasForTipoSucursal(sucursalId, tipoStockId);
};
