import type { Paciente } from "@viva/contracts";
import { requisicaoAutenticada } from "@/services/api";
import { ListaPacientes } from "@/components/ListaPacientes";
export default async function Relatorios() {
  const pacientes = await requisicaoAutenticada<Paciente[]>("/patients");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Relatórios e resumos</h1>
          <p>
            Escolha um paciente, reúna o resumo dos registros disponíveis e
            exporte os dados em JSON. O acesso fica registrado para auditoria.
          </p>
        </div>
      </div>
      <section className="panel padded">
        <ListaPacientes patients={pacientes} abaInicial="consultations" />
      </section>
    </>
  );
}
