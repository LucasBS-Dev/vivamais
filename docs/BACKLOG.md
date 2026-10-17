# Backlog e estimativas

Estimativas de engenharia para uma pessoa, em dias úteis, sem prazo contratual. Revisões clínicas/jurídicas, hardware e lojas têm espera externa não estimável. Cada fase depende do aceite técnico da anterior.

| Fase | Trabalho preservado | Dependências | Esforço | Critério de aceite |
|---|---|---|---|---|
| 0 | Leitura, mapa, riscos, ADR, modelo, plano e wireframes | Kit | 1–2 | Fontes e anexos rastreáveis; bloqueios explícitos |
| 1 | Monorepo, projetos, DB/migrations, auth, clínica, CI, contratos, runbooks | 0 | 4–7 | Build, login/revogação e isolamento exercitados |
| 2 | Cadastro, ativação, pressão manual, histórico/gráfico, autorização e auditoria | 1 e D05 | 6–10 | Profissional e paciente completam fluxo real; E2E e acesso cruzado |
| 3 | Medicamentos/vigência, lembretes/autorrelato, diário transcrito | 2 e D06 | 6–10 | Horários/autor separados; notificações em Android/iOS |
| 4 | Fila offline protegida, idempotência/retries, upload privado e OCR confirmado | 3 e D04 | 8–14 | Reenvio sem duplicata; fotos ilegíveis e leitura cruzada testadas |
| 5 | Alimentação e atividade, perfil e conteúdo aprovado, feature flags | 4 e D01/D03 | 6–12 | Sem orientação não validada; incerteza e bloqueios visíveis |
| 6 | Consultas, histórico, relatórios minimizados, dispositivo e simulador | 5 | 6–10 | Autoria e escopo; SIMULADO inequívoco; hardware depende D02 |
| 7 | Segurança, restauração, disponibilidade, acessibilidade, beta e lojas | 6 e D03/D07–09 | 8–15 | Checklists verificados, testes físicos e aprovação de publicação |

Próxima prioridade após a fundação: ativação de paciente e corte vertical de cadastro → medição manual → histórico, com testes negativos entre duas clínicas, dois profissionais e dois pacientes. Não antecipar IA ou hardware para preencher telas.
