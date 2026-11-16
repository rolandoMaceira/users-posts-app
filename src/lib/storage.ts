// localStorage puede no existir o lanzar (modo privado, datos bloqueados):
// la app debe funcionar igual, solo sin persistencia.
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Sin persistencia: se ignora.
  }
}
