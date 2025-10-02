// src/pages/AdminSucursales.jsx
import { useEffect, useState } from "react";
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
  const [editing, setEditing] = useState(null); // {id, nombre, ...}

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
  const abrirCrear = () => setOpenCreate(true);
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

  // Eliminar (baja lógica o física según tu backend)
  const onEliminar = async (id) => {
    try {
      await deleteSucursal(id);
      await fetchSucursales();
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar la sucursal.");
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sucursales</h2>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Alta, baja y edición de sucursales.
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}>
          Crear sucursal
        </button>
      </header>

      <div className="card p-4 overflow-x-auto">
        {err && (
          <p className="mb-3 text-sm" style={{ color: "var(--graphite)" }}>
            {err}
          </p>
        )}

        {loading ? (
          <p className="text-center py-6" style={{ color: "var(--graphite)" }}>
            Cargando sucursales...
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: "var(--graphite)" }}>
                <th className="py-2">Nombre</th>
                <th className="py-2">Dirección</th>
                <th className="py-2">Teléfono</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--frame)" }}>
                  <td className="py-2">{r.nombre}</td>
                  <td className="py-2">{r.direccion}</td>
                  <td className="py-2">{r.telefono}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={() => onEditar(r)}>
                        Modificar
                      </button>
                      <button className="btn btn-outline" onClick={() => onEliminar(r.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center" style={{ color: "var(--graphite)" }}>
                    No hay sucursales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales */}
      <ModalCrearSucursal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSave={guardarCreacion}
      />

      <ModalEditarSucursal
        open={openEdit}
        sucursal={editing}
        onClose={() => { setOpenEdit(false); setEditing(null); }}
        onSave={guardarEdicion}
      />
    </div>
  );
}

