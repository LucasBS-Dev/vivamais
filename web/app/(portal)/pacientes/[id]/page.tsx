import Link from "next/link";
import { notFound } from "next/navigation";
import type { EstadoModulo, Paciente } from "@viva/contracts";
import { ErroApi, requisicaoAutenticada, buscarSessao } from "@/services/api";
import { idPacienteValido } from "@/services/validacoes";
import { ModalidadePaciente } from "@/components/ListaPacientes";
import { Modulos } from "@/components/Modulos";
import { Icone } from "@/components/Icones";
import { CuidadoPaciente } from "@/components/CuidadoPaciente";
import { VinculosPaciente } from "@/components/VinculosPaciente";
import { DadosPessoaisPaciente } from "@/components/DadosPessoaisPaciente";
import type { DadosPessoaisPaciente as DadosPaciente } from "@viva/contracts";

export default async function PaginaPaciente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await buscarSessao();
  if (!idPacienteValido(id)) notFound();
  let paciente: Paciente;
  try {
    paciente = await requisicaoAutenticada<Paciente>(`/patients/${id}`);
  } catch (erro) {
    if (erro instanceof ErroApi && [403, 404].includes(erro.estadoResposta))
      notFound();
    throw erro;
  }
  const modules =
    await requisicaoAutenticada<EstadoModulo[]>("/system/modules");
  const visibleModules = modules.filter(
    (modulo) =>
      paciente.modality === "BRACELET_DIARY" ||
      !["bracelet", "diary"].includes(modulo.key),
  );
  return (
    <>
      <Link href="/pacientes" className="back-link">
        ← Voltar para pacientes
      </Link>
      <div className="patient-profile">
        <span className="profile-avatar" aria-hidden="true">
          {paciente.displayName.charAt(0)}
        </span>
        <div>
          <span className="eyebrow">FICHA DE IDENTIFICAÇÃO</span>
          <h1>{paciente.displayName}</h1>
          <ModalidadePaciente value={paciente.modality} />
        </div>
        <span className="access-label">
          <Icone name="shield" size={19} /> Acesso autorizado
        </span>
      </div>
      <DadosPessoaisPaciente
        inicial={await requisicaoAutenticada<DadosPaciente>(
          `/pacientes/${id}/dados-pessoais`,
        )}
      />
      {user.role === "ADMIN" && <VinculosPaciente patientId={id} />}
      <CuidadoPaciente key={id} patient={paciente} />
      <details>
        <summary>Estado das integrações</summary>
        <div className="notice">
          <Icone name="lock" size={21} />
          <div>
            <strong>Disponibilidade das integrações</strong>
            <p>
              Os registros são consultados no acompanhamento do paciente.
              Orientações personalizadas e integração com pulseira dependem de
              validação e configuração.
            </p>
          </div>
        </div>
        <section className="patient-modules">
          <h2>Acompanhamento</h2>
          <p className="section-intro">
            Modalidade:{" "}
            {paciente.modality === "APP"
              ? "aplicativo Viva+."
              : "pulseira de lembretes e diário impresso. Esta modalidade não exige smartphone."}
          </p>
          <Modulos modules={visibleModules} />
        </section>
      </details>
    </>
  );
}
