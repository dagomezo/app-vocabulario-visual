import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { loginAdmin } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(nombre, pin);
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page flex items-center justify-center p-4 sm:p-6 min-h-screen">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 border-2 border-[var(--beige-border)] shadow-lg">
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--green-primary)] rounded-full flex items-center justify-center">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[var(--text-dark)] mb-6 sm:mb-8 m-0">
            Acceso profesores
          </h1>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-[16px] px-4 py-3 mb-6 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <Label htmlFor="nombre" className="text-[var(--text-dark)] mb-2 block">
                Nombre
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: David"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="username"
                className="rounded-[20px] border-2 border-[var(--beige-border)] focus:border-[var(--green-primary)] px-4 py-3 text-base min-h-[var(--touch-min)]"
                required
              />
            </div>

            <div>
              <Label htmlFor="pin" className="text-[var(--text-dark)] mb-2 block">
                PIN de acceso
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete="current-password"
                inputMode="numeric"
                className="rounded-[20px] border-2 border-[var(--beige-border)] focus:border-[var(--green-primary)] px-4 py-3 text-base min-h-[var(--touch-min)]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="touch-target w-full bg-[var(--green-primary)] hover:bg-[#27865f] text-white rounded-[20px] py-5 sm:py-6 text-lg font-bold disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <Link
            to="/"
            className="touch-target flex items-center justify-center gap-2 mt-6 text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-colors no-underline font-semibold"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
