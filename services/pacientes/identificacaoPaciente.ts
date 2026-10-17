const pacientes = new Map<string, string>();
export async function memorizarPaciente(idTitular: string, id: string) {
  pacientes.set(idTitular, id);
}
export async function recuperarPaciente(idTitular: string) {
  return pacientes.get(idTitular) ?? null;
}
