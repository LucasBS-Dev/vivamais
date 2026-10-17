const patients = new Map<string, string>();
export async function rememberPatient(owner: string, id: string) {
  patients.set(owner, id);
}
export async function recalledPatient(owner: string) {
  return patients.get(owner) ?? null;
}
