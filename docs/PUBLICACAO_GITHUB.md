# Publicação revisada do fonte no GitHub

Destino autorizado: https://github.com/joaosoares03/vivamais.git, branch main. Não alterar visibilidade, fazer force push, reescrever histórico ou publicar aplicação/lojas. Fonte e documentação foram consolidados e testados; ver [relatório](RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md) e [provas](evidencias/consolidacao-publicacao/validacao-tecnica.json).

## Bloqueio desta execução

O Git no ambiente isolado do Codex falhou ao iniciar sh/credential-manager. A execução nativa direta confirmou `Failed to enumerate credentials [0x5] / Acesso negado`. Isso é uma restrição de acesso ao Gerenciador de Credenciais do Windows; não comprova senha errada nem falta de permissão no repositório. O commit foi preservado localmente e o primeiro push não foi realizado. Não enviar token/senha ao chat e não inserir credencial na URL do remoto.

## Um comando no terminal normal do usuário

Abrir PowerShell7 **pelo Windows/Terminal ou VS Code**, fora do terminal isolado do Codex. O hash deve ser o de40caracteres informado na entrega; conferir `git log -1 --oneline`. Exemplo com placeholder que precisa ser substituído:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
.\Publicar-VivaMais.cmd -CommitRevisado HASH_REVISADO_DE_40_CARACTERES
```

O atalho localiza PowerShell7 instalado ou o runtime existente do Codex, como o inicializador do sistema. Também é possível chamar pwsh -NoProfile -File infra/publicar-github-revisado.ps1 diretamente. Se o Git solicitar autenticação, entrar na conta GitHub autorizada pelo fluxo normal do gerenciador. Não copiar tokens para argumentos, .env ou logs. O parâmetro -VerificarSomente confere branch/remoto/HEAD/árvore local limpa e prova técnica sem push ou leitura de credencial. Se HEAD/arquivos mudaram, o script recusa para impedir envio de conteúdo que não foi revisado.

O script faz fetch, exige que main remota seja ancestral do conteúdo revisado, executa push normal e confere hash por ls-remote. Consulta a árvore pública GitHub para verificar componentes, arquivos internos de web, migrações, manuais e ausência de caminhos privados/submódulos. Depois registra publicação no relatório/JSON/progresso/status/próxima execução, cria **somente um commit documental de fechamento**, faz segundo push e verifica novamente. Não edita código funcional, banco, configurações globais Git, visibilidade ou serviços. A árvore publicada continua contendo as limitações/auditoria, sem afirmar CI verde.

Se o remoto contiver trabalho não integrado, interrompe sem sobrescrever. Se o primeiro push passar e o segundo falhar, conteúdo principal já pode estar publicado: preservar o commit de fechamento e repetir somente o envio após investigar, sem reset. O script exige HEAD revisado e árvore limpa e não deve ser executado novamente com hash antigo após concluir; verificar git status/log e o remoto antes de retomar.

Comprovante final privado: `.local/publicacao/resultado.json` contém somente SHAs/data/status, sem segredos; a publicação em docs/evidencias/consolidacao-publicacao/publicacao.json contém o commit de conteúdo, e o histórico identifica o fechamento. CI deve ser acompanhado separadamente pelo SHA em [Actions](https://github.com/joaosoares03/vivamais/actions); os dois alertas altos e eventual ausência de NVD_API_KEY podem manter jobs com falha. Não suprimir para declarar conclusão produtiva.
