// Solo UI — sin autenticación
import { useState } from "react";

export default function Login({ onSubmit }) {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Solo diseño: si más adelante pasás onSubmit desde tu integración de auth, lo llamamos
    onSubmit?.({ nombre, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-4">
      <div className="card w-full max-w-md p-6 space-y-6">
        {/* Marca */}
        <div className="text-center">
          <div className="mx-auto mb-2 w-3 h-3 rounded-full" style={{ background: "var(--beige)" }} />
          <h1 className="font-display text-2xl">Estrella StockPro</h1>
          <p className="text-sm mt-1" style={{ color: "var(--graphite)" }}>
            Acceso al panel interno
          </p>
        </div>

        {/* Formulario */}
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
            />
          </div>

        {/* CTA principal */}
          <button type="submit" className="btn btn-primary w-full">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
