# Capturas para seus testes manuais

Capturas de navegador produzidas na execução de 19–20/10/2026, usando API Java e PostgreSQL reais. Somente contas, fotos e registros fictícios. O manifesto `capturas.json` contém o instante UTC e a lista exata de PNG concluídos; não considerar um arquivo parcial como captura final.

- [Guia Windows](../../GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md)
- [Percurso de todas as telas](../../GUIA_TESTES_TODAS_AS_TELAS.md)
- [Checklist para preencher](../../CHECKLIST_TESTES_MANUAIS.md)
- [Inventário de rotas e estados](../../INVENTARIO_TELAS.md)
- [Relatório da execução](../EXECUCAO_LOCAL_2026-10-19.md)

O prefixo `app_` representa telas do aplicativo; `web_`, a ficha e o portal; `atividade_`, etapas do roteiro; `extra_`, estados adicionais sem um recorte próprio entre os 36 protótipos originais. As capturas antigas em `../visual` foram preservadas.

Alguns nomes conservam o nome do protótipo: `app_02_acesso_cpf.png` autentica por e-mail/senha; `atividade_01_inicio_atividade.png` repete a Home; `atividade_12_orientacoes.png` mostra as mensagens da equipe; `web_11_resumo_consulta.png` mostra o formulário de nova consulta. O inventário relaciona esses estados às rotas reais. `extra_orientacoes_atividade.png` registra a rota distinta de orientações gerais.

As comparações lado a lado estão em `comparacoes/`. Elas preservam referências e capturas e não demonstram identidade visual. Dados/limites reais, fontes, dimensões e alguns espaçamentos diferem; veja a matriz e o relatório. Notificação nativa não foi fabricada no navegador.

`recursos/visor-sintetico.png` é um visor artificial para o teste de upload/OCR, sem dados pessoais. Reconhecimento exige motor/modelo em execução e conferência antes de salvar.

Para repetir, com os serviços ativos, execute na raiz `infra/validar-interface-local.ps1 -Capturar`. O script cria novas pessoas e registros fictícios no banco de demonstração e mascara campos de senha/código nas imagens. Não execute contra dados reais; os cadastros do ensaio permanecem para comprovar persistência.

As faixas magenta nas caixas de senha são máscaras de privacidade aplicadas somente às capturas, inclusive em campos vazios. Não fazem parte da interface. Elementos ocultos são excluídos da máscara para não criar faixas artificiais fora do conteúdo visível.
