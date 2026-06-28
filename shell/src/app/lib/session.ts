import { crearSesion, registrarPalabraSesion, registrarJuegoSesion, obtenerStatsSesion } from "./api";

function getDeviceId(): string {
  let id = localStorage.getItem("senas_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("senas_device_id", id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem("senas_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("senas_session_id", id);
    crearSesion(id, getDeviceId()).catch(() => {});
  }
  return id;
}

export async function registrarPalabraVista(acertada: boolean, palabraId?: string, juegoTipo?: string) {
  const sessionId = getSessionId();
  if (palabraId && juegoTipo) {
    try {
      await registrarPalabraSesion(sessionId, palabraId, acertada, juegoTipo);
    } catch {}
  }
}

export async function registrarJuegoCompletado(tipo?: string, categoriaId?: string, total?: number, correctas?: number) {
  const sessionId = getSessionId();
  if (tipo && categoriaId) {
    try {
      await registrarJuegoSesion(sessionId, tipo, categoriaId, total, correctas);
    } catch {}
  }
}

export async function obtenerStats(): Promise<{
  palabrasVistas: number;
  palabrasAcertadas: number;
  juegosCompletados: number;
  rachaActual: number;
  mejorRacha: number;
}> {
  try {
    return await obtenerStatsSesion(getSessionId());
  } catch {
    return { palabrasVistas: 0, palabrasAcertadas: 0, juegosCompletados: 0, rachaActual: 0, mejorRacha: 0 };
  }
}
