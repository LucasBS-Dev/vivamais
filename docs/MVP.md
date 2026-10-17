# Escopo e entregas

## Iteração atual

Fase 0 documenta requisitos, riscos, arquitetura, dados e backlog. Fase 1 cria monorepo executável, autenticação e revogação de sessão, clínicas e vínculos persistidos, autorização por recurso, identificação do paciente, painel profissional com contagens reais, contratos, migrações, testes e CI. Os demais módulos devem aparecer com seu estado real e fase planejada. Contas de teste são sintéticas, criadas explicitamente por comando de bootstrap com senha definida localmente; não existe senha padrão versionada.

Aceite da fundação: banco PostgreSQL migra do zero; API inicia com Java 21; login válido permite consultar identidade e organização; senha inválida retorna resposta genérica; sessão encerrada deixa de funcionar; paciente e profissional sem vínculo não leem recursos alheios; web consome a API por sessão protegida e Expo usa o mesmo contrato. Compilação, testes disponíveis e limites de execução ficam registrados em STATUS.md.

## MVP funcional completo posterior

Fases 2–4 entregam cadastro e pressão ponta a ponta, gráficos, medicamentos e diário, notificações e sincronização offline, armazenamento privado e OCR confirmado. Fases 5–6 completam alimentação/atividade, consulta e simulador da pulseira, respeitando os bloqueios clínicos e de hardware. Fase 7 valida operação e publicação. Nenhum desses requisitos foi removido por custo; não está incluído como concluído na Fase 1.

## Wireframe navegável da fundação

Web: login → painel/contagens reais → pacientes autorizados → ficha de identificação e mapa dos módulos. Rotas públicas: privacidade, suporte, solicitação de exclusão. Mobile: boas-vindas/login → início com quatro ações e identificação → estado real do módulo → sair. Telas de fases futuras explicam dependências e não inventam prontuários nem respostas clínicas. Validação visual com responsável e teste com idosos ficam pendentes.
