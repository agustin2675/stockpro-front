// src/pages/UsersPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { getUsers, desactivarUser } from "../services/usersService";
import { getSucursales } from "../services/sucursalService";
import UsersToolbar from "../components/users/UsersToolbar";
import UsersTable from "../components/users/UsersTable";
import ModalAgregarUsuario from "../components/users/ModalAgregarUsuario";
import ModalEditarPassword from "../components/users/ModalEditarPassword";
import ModalEliminarUsuario from "../components/users/ModalEliminarUsuario";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [userEditing, setUserEditing] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [userDeleting, setUserDeleting] = useState(null);

  const sucursalMap = useMemo(() => {
    const map = new Map();
    for (const s of sucursales || []) map.set(Number(s.id), s.nombre);
    return map;
  }, [sucursales]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [usersResp, sucResp] = await Promise.all([getUsers(), getSucursales()]);
      setUsers(Array.isArray(usersResp) ? usersResp : usersResp?.data ?? []);
      setSucursales(Array.isArray(sucResp) ? sucResp : sucResp?.data ?? []);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los usuarios y sucursales.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // 👉 Se llamará cuando agreguemos el modal de “Agregar”
    const handleAgregar = () => setOpenAdd(true);

  // 👉 Editar (abrirá modal con datos del usuario)
  const handleEditar = (user) => {
    setUserEditing(user);
    setOpenEdit(true);
  };

  const handleEliminar = (user) => {
    setUserDeleting(user);
    setOpenDelete(true);
  };

  const sucursalNombreDeleting = useMemo(() => {
    if (!userDeleting) return "";
    return sucursalMap.get(Number(userDeleting.sucursal_id)) ?? "";
   }, [userDeleting, sucursalMap]);

  return (
    <div>
      <section className="mb-4">
        <h1 className="font-display text-2xl">
          Usuarios
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--graphite)" }}>
          Administra los usuarios del sistema.
        </p>
      </section>

      <section className="card p-4 mb-4">
        <UsersToolbar onAgregar={handleAgregar} loading={loading} />
      </section>

      <section className="card p-0 overflow-x-auto">
        {err && (
          <div className="p-3 text-sm rounded-md mb-2" style={{ background: "var(--warn-bg)", color: "var(--warn-ink)" }}>
            {err}
          </div>
        )}

        {loading ? (
          <div className="p-6 text-sm" style={{ color: "var(--graphite)" }}>
            Cargando usuarios…
          </div>
        ) : (
          <UsersTable
            rows={users}
            sucursalMap={sucursalMap}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </section>

      <ModalAgregarUsuario
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchAll}
        sucursales={sucursales}
      />

      <ModalEditarPassword
        open={openEdit}
        user={userEditing}
        onClose={() => setOpenEdit(false)}
        onSuccess={fetchAll}
      />
      <ModalEliminarUsuario
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onSuccess={fetchAll}
        user={userDeleting}
        sucursalNombre={sucursalNombreDeleting}
      />
    </div>
  );
}
