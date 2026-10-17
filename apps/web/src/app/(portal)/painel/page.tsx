import Link from "next/link";
import type {
  DashboardSummary,
  ModuleStatus,
  PatientSummary,
} from "@viva/contracts";
import { authenticatedRequest, getSession } from "@/lib/api";
import { Icon } from "@/components/icons";
import { PatientList } from "@/components/patient-list";
import { Modules } from "@/components/modules";

export default async function DashboardPage() {
  const [{ user }, dashboard, patients, modules] = await Promise.all([
    getSession(),
    authenticatedRequest<DashboardSummary>("/dashboard"),
    authenticatedRequest<PatientSummary[]>("/patients"),
    authenticatedRequest<ModuleStatus[]>("/system/modules"),
  ]);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">VISÃO GERAL</span>
          <h1>
            Olá, {user.displayName.split(" ")[0]}
            <span className="heading-dot">.</span>
          </h1>
          <p>Bem-vindo ao espaço de acompanhamento da sua equipe.</p>
        </div>
        <Link href="/pacientes/novo" className="button button-primary">
          <Icon name="people" size={20} /> Cadastrar paciente
        </Link>
      </div>
      <section className="welcome-banner" aria-label="Sua organização">
        <div>
          <span className="eyebrow">SUA ORGANIZAÇÃO</span>
          <h2>{dashboard.organizationName}</h2>
          <p>As informações abaixo respeitam as permissões da sua conta.</p>
        </div>
        <span className="banner-symbol">
          <Icon name="heart" size={48} />
        </span>
      </section>
      <section className="stats-grid" aria-label="Pacientes autorizados">
        <article className="stat-card">
          <span className="stat-icon">
            <Icon name="people" size={25} />
          </span>
          <span className="stat-value">{dashboard.patientCount}</span>
          <h2>Pacientes disponíveis</h2>
          <p>No seu escopo de acesso</p>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">
            <Icon name="phone" size={25} />
          </span>
          <span className="stat-value">{dashboard.appCount}</span>
          <h2>Com aplicativo Viva+</h2>
          <p>Modalidade de acompanhamento</p>
        </article>
        <article className="stat-card">
          <span className="stat-icon amber">
            <Icon name="book" size={25} />
          </span>
          <span className="stat-value">{dashboard.diaryCount}</span>
          <h2>Com pulseira e diário</h2>
          <p>Modalidade de acompanhamento</p>
        </article>
      </section>
      <div className="content-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Pacientes</h2>
              <p>Identificações disponíveis para sua conta</p>
            </div>
            <Link href="/pacientes" className="text-link">
              Ver todos <Icon name="arrow" size={17} />
            </Link>
          </div>
          <PatientList patients={patients.slice(0, 4)} />
        </section>
        <aside className="care-note">
          <span className="note-icon">
            <Icon name="shield" size={26} />
          </span>
          <h2>Cuidado com contexto</h2>
          <p>
            Consulte os dados quando necessário, especialmente durante o
            atendimento.
          </p>
          <p>
            A plataforma não pressupõe monitoramento diário nem acompanhamento
            em tempo real.
          </p>
          <span className="small-label">FUNDAÇÃO DO PROJETO</span>
          <p>
            Login, organização e acesso autorizado já se conectam à API e ao
            banco de dados.
          </p>
        </aside>
      </div>
      <section className="panel modules-panel">
        <div className="panel-heading">
          <div>
            <h2>Próximas etapas do cuidado</h2>
            <p>
              Estado dos módulos informado pela API. As próximas funções ainda
              estão indisponíveis.
            </p>
          </div>
          <span className="subtle-tag">Plano de evolução</span>
        </div>
        <Modules modules={modules} compact />
      </section>
    </>
  );
}
