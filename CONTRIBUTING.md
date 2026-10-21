# Contribuir com o Viva+

Comece pelo [manual técnico](docs/MANUAL_TECNICO_COMPLETO_VIVAMAIS.md), [ambiente](docs/GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md), [padrões](docs/PADROES_DESENVOLVIMENTO_VIVAMAIS.md) e [testes](docs/MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md). O projeto é uma demonstração acadêmica; não usar dados reais, decidir protocolos ou contratar/publicar serviços sem autorização do responsável.

Escolha uma pendência Pxx e confira dependências/responsável no [levantamento](docs/LEVANTAMENTO_COMPLETO_PENDENCIAS.md). Exercícios e IA pertencem aos responsáveis dos manuais específicos. Combine a alteração de contratos, componentes compartilhados e a próxima versão Flyway antes de editar.

1. Clone o repositório único e configure suas próprias credenciais privadas, sem arquivos work do autor.
2. Confira git status, fetch e histórico; preserve alterações existentes. Crie branch descritiva para sua tarefa.
3. Use Expo na raiz, web/ Next e backend/demo Java21/JDBC. Não criar Git aninhado nem mudar a stack.
4. Implemente com nomes de domínio em português; preserve paths/JSON/SQL de compatibilidade. V1–V9 são imutáveis.
5. Verifique papel/unidade/vínculo/titular no backend, não apenas na UI. Não adicionar token em localStorage.
6. Teste persistência e acesso negativo, execute tipagem/lint/build e regressões afetadas. Registre o que não foi ensaiado.
7. Atualize PROGRESSO, STATUS, inventário e documentação relevante; capture apenas dados sintéticos sem segredos.
8. Revise diff/stage, scanner de segredos, arquivos grandes e diff cached check antes do commit.
9. Envie sua branch/PR conforme autorização/política do mantenedor. Não sobrescrever main, reescrever histórico ou fazer force push.

Nunca anexar senhas, OTP, cookies/tokens, chaves, telefone/CPF real, logs brutos, banco ou backup ao Git/issue/PR. Auditoria de dependências com alertas não deve ser silenciada; documentar risco e solução verificável. Publicar fonte não equivale a liberar produção. A publicação excepcional da consolidação em main foi expressamente autorizada pelo proprietário; não é autorização permanente para outras mudanças.
