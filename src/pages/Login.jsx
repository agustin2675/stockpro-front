// src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { postAuth } from "../services/authService"; // ajustá la ruta si difiere
import { role } from "../ROLE";
import { AuthContext } from "../context/AuthContext"; // o donde exportes tu ContextProvider

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const { handleProfileMode } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !password) {
      setErr("Completá usuario y contraseña.");
      return;
    }

    try {
      setErr("");
      setLoading(true);

      // Respuesta esperada: { access_token, rol }
      const data = await postAuth(nombre, password);

      // 1) token
      localStorage.setItem("access_token", data.access_token);

      // 2) profileMode (coherente con tu Context)
      localStorage.setItem("profileMode", data.rol);
      localStorage.setItem("sucursalId", String(data.sucursalId)); // ej: 3
      localStorage.setItem("sucursalName", String(data.sucursalName)); // ej: BarrioSur

      
      // 3) actualizar contexto (clave para que RootRoutes re-renderice)
      handleProfileMode(data.rol);

      // 4) redirigir según rol
      switch (data.rol) {
        case role.admin:
          navigate("/admin", { replace: true });
          break;
        case role.encargado:
          navigate("/encargado", { replace: true });
          break;
        case role.sucursal:
          navigate("/sucursal", { replace: true });
          break;
        default:
          setErr("Rol no reconocido. Contactá al administrador.");
      }
    } catch (error) {
      console.error(error);
      setErr("Usuario o contraseña inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-4">
      <div className="card w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-2 w-3 h-3 rounded-full" style={{ background: "var(--beige)" }} />
          <h1 className="font-display text-2xl">Estrella StockPro</h1>
          <p className="text-sm mt-1" style={{ color: "var(--graphite)" }}>
            Acceso al panel interno
          </p>
        </div>

        {err && (
          <div className="text-sm p-3 rounded bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulario de inicio de sesión">
          <div>
            <label htmlFor="usuario" className="text-sm" style={{ color: "var(--graphite)" }}>
              Usuario
            </label>
            <input
              id="usuario"
              className="input mt-1"
              placeholder="Tu usuario"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm" style={{ color: "var(--graphite)" }}>
              Contraseña
            </label>
            <input
              id="password"
              className="input mt-1"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
