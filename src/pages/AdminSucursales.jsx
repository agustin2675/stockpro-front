// src/pages/AdminSucursales.jsx
import { useEffect, useState, useRef } from "react";
import {
  getSucursales,
  postSucursal,
  putSucursal,
  deleteSucursal,
} from "../services/sucursalService";

import ModalCrearSucursal from "../components/sucursales/ModalCrearSucursal";
import ModalEditarSucursal from "../components/sucursales/ModalEditarSucursal";

export default function Sucursales() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modales
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  // Modal confirmación eliminar
  const [openConfirm, setOpenConfirm] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const confirmRef = useRef(null);
  const confirmOkRef = useRef(null);

  // Cargar sucursales
  const fetchSucursales = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await getSucursales();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar las sucursales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  // Crear
  const guardarCreacion = async (payload) => {
    try {
      await postSucursal(payload);
      await fetchSucursales();
      setOpenCreate(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo crear la sucursal.");
    }
  };

  // Editar
  const onEditar = (row) => {
    setEditing(row);
    setOpenEdit(true);
  };
  const guardarEdicion = async (payload) => {
    try {
      await putSucursal(payload.id, {
        nombre: payload.nombre,
        direccion: payload.direccion,
        telefono: payload.telefono,
        activo: payload.activo,
      });
      await fetchSucursales();
      setOpenEdit(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar la sucursal.");
    }
  };

  // Abrir confirmación
  const openConfirmModal = (id) => {
    setTargetId(id);
    setOpenConfirm(true);
  };

  // Confirmar eliminación
  const handleConfirmEliminar = async () => {
    if (!targetId) return;
    try {
      setDeleting(true);
      await deleteSucursal(targetId);
      await fetchSucursales();
      setOpenConfirm(false);
      setTargetId(null);
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar la sucursal.");
    } finally {
      setDeleting(false);
    }
  };

  // Helpers UI
  const StatusChip = ({ active }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
        active
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {active ? "Activa" : "Inactiva"}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl">Sucursales</h1>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Alta, baja y edición de sucursales.
          </p>
        </div>
        <div className="sm:min-w-[220px]">
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => setOpenCreate(true)}
          >
            Crear sucursal
          </button>
        </div>
      </header>

      {/* Tabla principal */}
      <section className="card p-0 border overflow-hidden" style={{ borderColor: "var(--frame)" }}>
        {err && (
          <div className="px-4 pt-4">
            <p className="text-sm text-red-600">{err}</p>
          </div>
        )}
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-600">
            Cargando sucursales…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-600">
            No hay sucursales
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50" style={{ color: "var(--graphite)" }}>
                  <th className="py-2.5 px-3">Sucursal</th>
                  <th className="py-2.5 px-3">Dirección</th>
                  <th className="py-2.5 px-3">Teléfono</th>
                  <th className="py-2.5 px-3 w-60">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`align-top ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    } hover:bg-gray-50`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium">{r.nombre}</span>
                        <StatusChip active={!!r.activo} />
                      </div>
                    </td>
                    <td className="py-3.5 px-3">{r.direccion || "—"}</td>
                    <td className="py-3.5 px-3">{r.telefono || "—"}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onEditar(r)}
                        >
                          Modificar
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openConfirmModal(r.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modales */}
      <ModalCrearSucursal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSave={guardarCreacion}
      />

      <ModalEditarSucursal
        open={openEdit}
        sucursal={editing}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        onSave={guardarEdicion}
      />

      {/* Modal Confirmación Eliminar */}
      {openConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenConfirm(false)}
          />
          {/* Modal */}
          <div
            ref={confirmRef}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl border shadow-2xl overflow-hidden"
            style={{ borderColor: "var(--frame)" }}
          >
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--frame)" }}>
              <h3 className="font-semibold text-lg">Confirmar eliminación</h3>
            </div>
            <div className="px-5 py-4 text-sm" style={{ color: "var(--graphite)" }}>
              ¿Seguro que deseas eliminar esta sucursal? Esta acción no se puede deshacer.
            </div>
            <div
              className="px-5 py-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end"
              style={{ borderColor: "var(--frame)" }}
            >
              <button
                className="btn btn-outline w-full sm:w-auto"
                onClick={() => setOpenConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                ref={confirmOkRef}
                className="btn w-full sm:w-auto"
                style={{
                  backgroundColor: "var(--accent-beige)",
                  color: "black",
                  borderColor: "var(--accent-beige)",
                }}
                onClick={handleConfirmEliminar}
                disabled={deleting}
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

