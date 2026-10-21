# Viva+ no Windows — do computador desligado até os testes

**SMS de teste V9:** iniciar `Iniciar-VivaMais.cmd -Producao -SmsLocal`; nenhuma operadora é chamada. Sem `-SmsLocal` ou configuração equivalente, o serviço fica desabilitado por padrão. [Passo a passo da caixa cifrada](CADASTRO_E_ATIVACAO_SMS.md). Novos cadastros exigem celular; dados e fontes V1–V8 foram preservados.

Preparado e verificado na execução de 19–20/10/2026. Os caminhos e comandos abaixo usam PowerShell. A API, o portal e o aplicativo são três processos diferentes; fechar o navegador não encerra esses processos. Use somente pessoas e fotos fictícias.

## 1. Caminho mais rápido nesta máquina

Depois de ligar o computador, abra o VS Code. Use **Arquivo → Abrir Pasta** e escolha:

```text
C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais
```

Abra **Terminal → Novo Terminal**, com perfil **PowerShell**. O atalho abaixo seleciona o PowerShell 7.6.5 já disponível nesta máquina; o modo manual de três terminais também aceita Windows PowerShell. Copie:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
.\infra\executar-local.ps1 -Servico Diagnostico
.\Iniciar-VivaMais.cmd
```

O atalho `Iniciar-VivaMais.cmd` chama `infra/iniciar-local.ps1` com o PowerShell correto. Ele inicia o PostgreSQL existente, a API Java, o Next em desenvolvimento e o Expo Web, aguardando a resposta de cada serviço. A primeira compilação pode levar alguns minutos. Ele executa os serviços por trás de um terminal de controle e informa os arquivos de log; mantenha esse terminal aberto. Não é necessário abrir três terminais neste modo. Não execute também o modo de três terminais sobre as mesmas portas.

Abra:

| Uso | Endereço |
|---|---|
| Entrar como paciente | http://127.0.0.1:8081/acesso |
| Portal profissional | http://127.0.0.1:3000/ |
| Saúde da API | http://127.0.0.1:8080/actuator/health |

Credenciais de **login no Viva+**, somente para consultar no computador:

```powershell
notepad.exe 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\demo-credentials.json'
```

Use a senha privada somente no login profissional (`profissional.a@demo.vivamais.invalid` ou admin). Paciente não entra por e-mail/senha: CPF+nascimento identificam e aparelho autorizado ou código atual concedem acesso. Em navegador novo, regularizar cadastro e seguir [ativação SMS LOCAL](CADASTRO_E_ATIVACAO_SMS.md). Não pressupor que a conta seed autoriza outro aparelho. O arquivo privado não deve ir ao chat,capturas ou Git. Para um clone novo, criar suas próprias credenciais pelo [guia de ambiente](GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md).

Para conferir os três serviços:

```powershell
.\infra\executar-local.ps1 -Servico Verificar
```

Para encerrar, volte ao terminal de controle e pressione **Enter** no prompt de encerramento. Se iniciou com `-AguardarSinal`, solicite o encerramento em outro PowerShell da mesma conta:

```powershell
.\infra\encerrar-local.ps1
```

No ambiente isolado do Codex, processos de uma execução podem não ser visíveis em outra. O modo `-AguardarSinal` mantém o controlador ativo e recebe o pedido de encerramento de outro terminal. No modo interativo, prefira Enter no terminal original. O controlador automático requer PowerShell 7 para encerrar sua árvore pelo .NET, sem WMI. O encerramento dos processos web/API é forçado apenas dentro da árvore conferida; espere os envios terminarem antes de solicitá-lo. Para parada normal pelo teclado, prefira o modo manual com Ctrl+C. O encerramento usa o registro privado `.local/execucao/processos.json`, confere o início do processo para evitar matar um PID reutilizado e encerra somente sua árvore. Se o script iniciou o banco, utiliza `pg_ctl stop -m fast`, que faz checkpoint. Se o banco já estava ligado, deixa-o em execução. Preserve logs, banco e arquivos cifrados. Para desligar manualmente o banco portátil, veja a seção 10.

## 2. Pastas, terminais e ferramentas

No VS Code, **Terminal → Dividir Terminal** abre outro terminal. Cada terminal tem sua própria pasta e suas variáveis de ambiente. Um comando que mantém o servidor ativo não devolve o prompt: isso é esperado. Abra outro terminal para executar outros comandos.

PowerShell usa `$env:NOME='valor'`, `Set-Location` e `&` para chamar executáveis em caminhos com espaços. Git Bash usa outra sintaxe (`export`, `/c/Users/...`); os blocos deste guia não devem ser colados no Git Bash. Não há necessidade de terminal de administrador no percurso portátil.

```powershell
# Raiz: aplicativo Expo, componentes e serviços do paciente
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
# Portal (para voltar à raiz depois, use Set-Location ..)
Set-Location '.\web'
# Backend, partindo novamente da raiz
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais\backend\demo'
```

Também pode abrir o projeto pelo PowerShell:

```powershell
code 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
```

Se `code` não for reconhecido, use o menu Abrir Pasta; isso não impede a execução.

### Versões do código e do ambiente encontrado

| Ferramenta | Versão/configuração real |
|---|---|
| PowerShell do inicializador | 7.6.5, disponível no runtime local do Codex; atalho procura também `pwsh.exe` no PATH |
| Java | Microsoft OpenJDK 21.0.10; `C:\Users\joaos\.jdks\ms-21.0.10` |
| Spring Boot | 3.5.16, fixado em `backend/demo/pom.xml` |
| Maven | Wrapper baixa/usa 3.9.11; não exige Maven global |
| PostgreSQL atual | 17.9 portátil, banco `vivamais`, usuário `viva`, porta **55432** |
| PostgreSQL do Compose | `postgres:17.9-alpine`, porta do computador **5432**, usuário padrão `vivamais` |
| Node | 24.15.0 nesta máquina; projeto exige >=22.16 e <25 |
| pnpm | **10.28.2**, único workspace/lock na raiz; Next também pertence a esse workspace |
| npm | 11.12.1; usado para chamar o pnpm fixado, não para instalar o monorepo com `npm install` |
| Next / React / TypeScript | 16.4.2 / 19.2.3 / 5.9.3 |
| Expo / React Native | 57.0.21 / 0.86.3; CLI instalada no projeto |
| Git | 2.45.1.windows.1 |
| Docker | Não localizado nesta máquina; opcional, o percurso portátil funciona sem Docker |

O pedido menciona PostgreSQL 18, mas o banco preservado e o Compose usam **17**. A retomada não troca a versão do cluster. Um diretório de dados 17 não deve ser aberto com executáveis 18. Para usar 18 futuramente, preparar migração com backup/restore ou `pg_upgrade`, e repetir os testes em um cluster separado. Consulte a [documentação oficial de atualização do PostgreSQL](https://www.postgresql.org/docs/current/upgrading.html).

### Comandos de verificação

Na raiz:

```powershell
Get-Command java -All
java -version
$env:JAVA_HOME
& 'C:\Users\joaos\.jdks\ms-21.0.10\bin\java.exe' -version
.\backend\demo\mvnw.cmd --version
node --version
npm.cmd --version
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm --version
git --version
node .\node_modules\expo\bin\cli --version
& 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\pg-tools\package\native\bin\postgres.exe' --version
& 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\pg-client\psql.exe' --version
```

Se um executável não existe, verifique primeiro seu caminho. A CLI Expo só aparece depois da instalação das dependências; não instale o antigo `expo-cli` global. O Wrapper só precisa da internet no primeiro download do Maven/dependências. Se o pnpm global mostrar 11, use a chamada fixada acima; não altere o lockfile para contornar uma versão global. Instruções oficiais de instalação: [Node.js](https://nodejs.org/en/download), [pnpm](https://pnpm.io/installation), [Microsoft OpenJDK](https://learn.microsoft.com/java/openjdk/download), [PostgreSQL Windows](https://www.postgresql.org/download/windows/). Não reinstale as ferramentas já verificadas.

### Corrigir Java 8 antes do Maven

Nesta máquina `JAVA_HOME` está correto, mas o PATH também contém `Oracle\Java\java8path`. Na sessão atual:

```powershell
$env:JAVA_HOME = 'C:\Users\joaos\.jdks\ms-21.0.10'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
java -version
.\backend\demo\mvnw.cmd --version
```

Os dois últimos comandos devem informar Java **21**. O script `executar-local.ps1` faz essa seleção no processo, sem alterar o Windows. Se o Wrapper ainda falhar, use-o pelo script, que também seleciona o cache de Maven existente em `work/maven-home` e o repositório em `work/m2`.

Para corrigir a prioridade permanentemente, pesquise no menu Iniciar **Editar as variáveis de ambiente da sua conta**. Defina `JAVA_HOME` no diretório do JDK, sem `\bin`. Na lista Path, posicione o diretório `...\ms-21.0.10\bin` antes do Java antigo quando estiverem no mesmo escopo. Um caminho Java 8 no Path do sistema pode continuar precedendo o Path do usuário: nesse caso, mantenha o script de seleção ou peça ao administrador para ajustar a prioridade do sistema. Feche e reabra VS Code/terminais e repita `Get-Command java -All` e `java -version`. Não use `setx PATH`: pode expandir/truncar a configuração existente.

## 3. Dependências JavaScript

Execute na raiz, somente se `node_modules` estiver ausente ou houver mudança no lockfile:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm install --frozen-lockfile
```

O `postinstall` sincroniza os pacotes compartilhados. Não execute outro `npm install` dentro de `web/`. O comando usa a rede sem trocar as versões do projeto. Uma falha precisa ser resolvida antes de iniciar: não apagar lockfile, ignorar erros ou recriar o projeto. Avisos do npm sobre opções pnpm de `.npmrc` não significam, por si, falha de instalação; confira o código de saída.

## 4. PostgreSQL: reutilizar o banco desta máquina

O banco portátil não é um serviço do Windows. Portanto, ele pode funcionar mesmo sem aparecer no painel Serviços/pgAdmin. Inicie-o uma vez:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
.\infra\executar-local.ps1 -Servico Banco
& '..\..\work\pg-tools\package\native\bin\pg_ctl.exe' status -D '..\..\work\pg-data'
```

Se já estiver ativo, o script não cria outro banco. Se houver conflito de porta, identifique o processo; não exclua `postmaster.pid` nem pastas de dados.

Nesta retomada o acesso TCP local passou a exigir SCRAM. A credencial do **PostgreSQL** está em arquivo privado separado da senha do **login Viva+**:

```powershell
notepad.exe 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\postgres-local-credentials.json'
```

Não confunda esses dois arquivos. Os scripts reconhecem e carregam a credencial PostgreSQL somente quando host, porta, banco e usuário coincidem. Não a imprimem nem a passam na linha de comando. Fora desta máquina, pedem a senha de forma oculta.

### Conferir com psql

```powershell
& 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\pg-client\psql.exe' -X -h 127.0.0.1 -p 55432 -U viva -d vivamais -W
```

Cole a senha PostgreSQL no prompt `Password`; a entrada fica oculta. Dentro do psql:

```sql
SELECT current_database(), current_user, version();
\l vivamais
SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname IN ('viva', 'vivamais');
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;
\q
```

Resultado nesta máquina: banco `vivamais`, papel `viva` com login e seis migrações bem-sucedidas, V1 a V6. `vivamais` é o nome do banco; o usuário com o mesmo nome é o padrão da instalação alternativa, e não existe neste cluster. Não criar esse usuário só para combinar os nomes.

### Conferir no pgAdmin, se já estiver instalado

Em **Servers → Register → Server**, dê um nome como Viva+ local. Em Connection: Host `127.0.0.1`, Port `55432`, Maintenance database `vivamais`, Username `viva`. Informe a senha privada do banco. Não é necessário salvar a senha no pgAdmin. Em Databases → vivamais → Schemas → public → Tables, confira as tabelas; use Query Tool para os SELECT acima. A ausência do pgAdmin não impede os testes pelo navegador.

### Outro computador com PostgreSQL instalado como serviço

Use a versão já instalada compatível com a aplicação e registre a versão testada. Confira:

```powershell
Get-Service '*postgres*'
Test-NetConnection -ComputerName 127.0.0.1 -Port 5432
psql --version
```

Se o serviço estiver parado, inicie-o pelo painel Serviços do Windows, com as permissões necessárias. Se `psql` não está no PATH, chame `C:\Program Files\PostgreSQL\17\bin\psql.exe` (ajuste o diretório à instalação). Consulte bancos e papéis com uma conta administradora antes de criar qualquer coisa. **Somente se ambos estiverem ausentes**, o administrador pode executar no psql:

```sql
CREATE ROLE vivamais LOGIN;
\password vivamais
CREATE DATABASE vivamais OWNER vivamais;
```

`\password` solicita a nova senha sem colocá-la no histórico SQL. Nunca execute DROP DATABASE, DROP TABLE, Flyway clean/repair ou recriação do cluster como parte deste guia. Se o banco já existe, preserve-o e use seu proprietário autorizado.

Para configurar esse cenário, crie `.local/configuracao-local.json` (fora do Git), com **somente dados de conexão sem senha**:

```json
{
  "JavaHome": "C:\\Users\\joaos\\.jdks\\ms-21.0.10",
  "BancoHost": "127.0.0.1",
  "BancoPorta": 5432,
  "BancoNome": "vivamais",
  "BancoUsuario": "vivamais",
  "BancoDiretorio": "",
  "BancoBin": "",
  "Psql": "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe"
}
```

Nesta máquina, **não é necessário criar esse arquivo**: o script encontra o cluster existente. Um arquivo que mude a conexão também muda o banco acessado; confirme os parâmetros antes de iniciar. `.env.example` não é importado automaticamente pelo Maven. `infra/load-env.ps1` existe para carregar um `.env` preenchido, mas não é obrigatório no percurso com scripts.

## 5. Modo didático: três terminais visíveis

Primeiro inicie o banco como na seção 4. Abra três terminais PowerShell no VS Code. Em cada um, execute `Set-Location` para a raiz. Não feche os terminais durante o uso.

### Terminal 1 — backend

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
.\infra\executar-local.ps1 -Servico Backend
```

O script seleciona o Java 21, configura a conexão, carrega a senha privada local ou a solicita de forma oculta, define o caminho absoluto dos arquivos e executa o Maven Wrapper com `spring-boot:run`. Espere **Started AplicacaoVivaMais** e **Tomcat started on port 8080**. Flyway valida/aplica apenas migrações novas; nesta base deve indicar versão 8 após aplicar a nova V8, sem alterar V1–V7. Falha de checksum deve ser investigada preservando os arquivos, sem repair automático.

Em outro terminal, confirme:

```powershell
Invoke-RestMethod 'http://127.0.0.1:8080/actuator/health'
```

O campo `status` deve ser `UP`. Esse resultado inclui a disponibilidade da conexão de banco, mas não substitui login/persistência.

#### Comando expandido para aprender a configuração do backend

Alternativa ao script acima — não execute os dois ao mesmo tempo:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
$env:JAVA_HOME = 'C:\Users\joaos\.jdks\ms-21.0.10'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:MAVEN_USER_HOME = 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\maven-home'
$env:DATABASE_URL = 'jdbc:postgresql://127.0.0.1:55432/vivamais'
$env:DATABASE_USER = 'viva'
$senhaBancoViva = Read-Host 'Senha PostgreSQL' -AsSecureString
$ponteiroViva = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($senhaBancoViva)
try { $env:DATABASE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ponteiroViva) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ponteiroViva); $senhaBancoViva.Dispose() }
$env:FILES_DIRECTORY = 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais\.local\private-files'
$env:PORT = '8080'
$env:SPRING_PROFILES_ACTIVE = ''
$env:OCR_NODE_SCRIPT = 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais\infra\ocr-worker.mjs'
$env:OCR_DATA_DIRECTORY = 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\ocr-data'
$env:OCR_CACHE_DIRECTORY = 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais\.local\ocr-cache'
try {
  .\backend\demo\mvnw.cmd -f backend/demo/pom.xml '-Dmaven.repo.local=C:\Users\joaos\Documents\Codex\2026-10-16\p\work\m2' spring-boot:run
} finally { $env:DATABASE_PASSWORD = $null }
```

Em outro computador, ajuste os três parâmetros de conexão, o JDK e os diretórios de cache. OCR usa Node/Tesseract.js e o modelo `eng.traineddata.gz` já presente em `work/ocr-data`. Se o modelo estiver ausente, consulte `infra/ocr-worker.mjs`: por padrão o worker Tesseract.js pode obtê-lo pela rede. Alternativamente configure Tesseract nativo e `TESSERACT_COMMAND`, sem apontar `OCR_NODE_SCRIPT` inexistente. Sem motor/modelo operacional, use pressão manual; não tratar OCR indisponível como reconhecido. Chave e objetos cifrados já existentes em `.local/private-files` devem ser preservados juntos.

### Terminal 2 — portal profissional

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
.\infra\executar-local.ps1 -Servico Portal
```

Espere **Ready**. Abra http://127.0.0.1:3000. O equivalente expandido é:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais\web'
$env:API_BASE_URL = 'http://127.0.0.1:8080'
$env:APP_ORIGIN = 'http://127.0.0.1:3000'
$env:NEXT_PUBLIC_APLICATIVO_URL = 'http://127.0.0.1:8081'
node .\node_modules\next\dist\bin\next dev --webpack --hostname 127.0.0.1 --port 3000
```

Use o CLI instalado em **web/node_modules**, evitando outra instância de Next/React. `API_BASE_URL` pertence ao servidor Next, que encaminha chamadas autenticadas; nenhuma senha do banco é necessária no frontend. Abra o endereço com `127.0.0.1`, exatamente como `APP_ORIGIN`, para manter origem/cookies consistentes.

### Terminal 3 — aplicativo do paciente

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
.\infra\executar-local.ps1 -Servico Aplicativo
```

Espere **Waiting on http://localhost:8081**. A primeira abertura compila a aplicação; depois abra http://127.0.0.1:8081. O script prioriza resolução IPv4 para que o Metro não atenda apenas em `::1` neste Windows. Equivalente expandido:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
$env:EXPO_PUBLIC_API_BASE_URL = 'http://127.0.0.1:8080'
$env:EXPO_PUBLIC_PORTAL_URL = 'http://127.0.0.1:3000'
$env:APP_ENV = 'development'
node --dns-result-order=ipv4first .\node_modules\expo\bin\cli start --web --localhost --port 8081
```

No terminal interativo, Expo pode oferecer atalhos para abrir o navegador. Não confunda **web** com aplicativo instalado: câmera, notificações, SecureStore e SQLCipher precisam de ensaios nativos próprios. No Expo Web o token curto e a fila ficam em memória: **não atualize nem feche enquanto houver registros pendentes**. Um cookie HttpOnly/Secure do aparelho permite recuperar a sessão após recarregar; Sair exige CPF/nascimento no próximo acesso. Aparelho novo/desautorizado exige o código de quatro números emitido pela equipe. Dados confirmados permanecem no PostgreSQL. Veja [o novo acesso](ACESSO_PACIENTE_SEM_SENHA.md).

## 6. Modo com builds locais

Para testar os pacotes compilados, pare o modo de desenvolvimento antes. Na raiz, em PowerShell 7:

```powershell
.\infra\iniciar-local.ps1 -Producao -Recompilar
```

`-Recompilar` recompila o JAR, o Next e o export web antes de servir. O empacotamento rápido do backend usa `-DskipTests`; isso **não é execução de testes**. Rode a seção 9 para os testes. Sem `-Recompilar`, o script reutiliza artefatos existentes, que podem não refletir fontes alteradas. Expo exportado usa `infra/serve-mobile-preview.mjs`, limitado ao loopback. É uma prévia local, sem publicação.

Na sandbox do Codex, builds Next podem falhar em `mkdir .next/...` com EPERM. Execute `node infra/preparar-build-web.mjs` para preparar apenas diretórios gerados; na mesma sessão PowerShell, use `$env:VIVA_BUILD_DIRETORIOS_PREPARADOS='1'` antes do build. Fora dessa restrição, mantenha o comportamento normal de limpeza do Next. Não excluir código, chave ou banco para resolver EPERM.

## 7. Android, Expo Go e iOS

O projeto configura `expo-sqlite` com `useSQLCipher: true`. Esse recurso não é comprovado pelo Expo Go; o percurso completo requer um **build nativo próprio**. Notificações também dependem de permissões e do SO. Veja [SQLCipher no Expo](https://docs.expo.dev/versions/latest/sdk/sqlite/#sqlcipher) e [builds de desenvolvimento](https://docs.expo.dev/develop/development-builds/introduction/). Não prometa que escanear um QR no Expo Go valida estes recursos.

No Android com Android Studio/SDK/emulador já configurados, preparar um build local a partir da raiz:

```powershell
# Somente para o emulador Android: o endereço do computador é 10.0.2.2.
$env:EXPO_PUBLIC_API_BASE_URL = 'http://10.0.2.2:8080'
$env:EXPO_PUBLIC_PORTAL_URL = 'http://10.0.2.2:3000'
$env:APP_ENV = 'development'
node .\node_modules\expo\bin\cli run:android
```

Esse comando gera o projeto Android se ausente e exige SDK/Gradle; não é necessário para testar no navegador. A instalação de `expo-dev-client` não está no lock atual; um build de desenvolvimento pode operar sem ele, mas não terá o launcher desse pacote. Não executar `prebuild --clean` para resolver problemas sem examinar alterações nativas existentes.

Em aparelho Android físico: use o IP de rede do computador no endereço da API, conecte o USB/depuração e use `run:android --device`. A API precisa estar acessível pela rede, com regra de firewall restrita à rede privada. Os scripts deste guia ficam em loopback para a demonstração no mesmo computador; não abrem portas/firewall automaticamente. `127.0.0.1` no celular se refere ao próprio celular. Reconfigure as URLs antes do build e valide acesso real; não use dados pessoais reais em HTTP.

Windows não executa Xcode nem simulador iOS local. Expo Web testa a interface compartilhada; export iOS verifica o pacote JavaScript, não produz IPA. Compilação iOS exige macOS/Xcode ou EAS com conta, assinatura e autorização. Nenhuma publicação, cobrança, APK/AAB/IPA assinado ou teste físico foi realizado nesta etapa.

## 8. Como conferir os fluxos

Mantenha um navegador com o portal e outra aba com o app. Entre em cada um com o perfil correspondente. Crie uma pessoa fictícia pelo portal e ative com o código no app para testar escrita sem modificar as contas principais. Consulte [Guia de todas as telas](GUIA_TESTES_TODAS_AS_TELAS.md), [Checklist](CHECKLIST_TESTES_MANUAIS.md) e [Inventário](INVENTARIO_TELAS.md).

Exemplo de comprovação: registre uma pressão, aguarde confirmação da API, saia, entre novamente e consulte Histórico. No portal, abra a ficha da mesma pessoa → Pressão arterial. Ver os mesmos valores em uma nova sessão confirma persistência via API; não basta ver uma mensagem verde antes do envio.

## 9. Verificações de código e testes

Na raiz, usando as dependências locais:

```powershell
node .\node_modules\typescript\bin\tsc --noEmit -p tsconfig.json
node .\web\node_modules\typescript\bin\tsc --noEmit -p web/tsconfig.json
node .\node_modules\eslint\bin\eslint.js app components contexts hooks services web packages tests/mobile
node .\node_modules\vitest\vitest.mjs run --config vitest.mobile.config.ts
Push-Location web
node .\node_modules\vitest\vitest.mjs run
Pop-Location
```

Backend: pare a API para liberar o JAR antes de `verify`. Use **banco exclusivo de testes**, por exemplo `viva_test`, já existente nesta máquina. Os testes criam/removem schemas UUID somente nesse banco. Não aponte para `vivamais` nem dados reais.

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
. .\infra\ambiente-local.ps1
$configuracaoTesteViva = Obter-ConfiguracaoViva
Configurar-BackendViva $configuracaoTesteViva
$env:TEST_DATABASE_URL = 'jdbc:postgresql://127.0.0.1:55432/viva_test'
$env:TEST_DATABASE_USER = $env:DATABASE_USER
$env:TEST_DATABASE_PASSWORD = $env:DATABASE_PASSWORD
$env:TEST_OCR_NODE_SCRIPT = Join-Path (Get-Location) 'infra\ocr-worker.mjs'
$env:TEMP = Join-Path (Get-Location) '.local\execucao\temporarios'
$env:TMP = $env:TEMP
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
try {
  .\backend\demo\mvnw.cmd -f backend/demo/pom.xml '-Dmaven.repo.local=C:\Users\joaos\Documents\Codex\2026-10-16\p\work\m2' verify
} finally { $env:TEST_DATABASE_PASSWORD = $null; $env:DATABASE_PASSWORD = $null }
```

Se `viva_test` não existe em outro computador, o administrador cria esse banco separado, sem alterar o principal. Docker/Testcontainers é uma alternativa já prevista nos testes. Nenhum teste deve ser declarado aprovado se houver skip por falta de PostgreSQL/OCR.

E2E/capturas: o auxiliar `infra/validar-interface-local.ps1` lê a senha privada sem imprimi-la e filtra diagnósticos para evitar divulgação de valores de inputs. Serviços devem estar ativos. Os testes criam registros e pacientes **fictícios** no banco de demonstração; não executá-los contra produção.

```powershell
.\infra\validar-interface-local.ps1
# Capturar a interface real no diretório solicitado:
.\infra\validar-interface-local.ps1 -Capturar
```

O auxiliar precisa do Chromium Playwright. Nesta máquina usa `work/playwright-browsers`. Para instalar se ausente:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\playwright-browsers'
node .\node_modules\@playwright\test\cli.js install chromium
```

## 10. Encerrar e resolver problemas

**Três terminais:** pressione `Ctrl+C` no aplicativo, depois no portal, depois no backend. Espere cada prompt retornar. Desligue o PostgreSQL portátil por último:

```powershell
& 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\pg-tools\package\native\bin\pg_ctl.exe' stop -D 'C:\Users\joaos\Documents\Codex\2026-10-16\p\work\pg-data' -m fast -w
```

`fast` encerra conexões e confirma checkpoint; não é `immediate`. Não feche o computador no meio do desligamento. Dados persistidos permanecem. Antes de fechar o Expo, confirme que não há fila pendente.

| Sintoma | O que fazer |
|---|---|
| ERR_CONNECTION_REFUSED | Confira os três serviços e o banco; serviços não iniciam apenas abrindo o link |
| `java` mostra 1.8 / release 21 unsupported | Execute a seleção de Java 21 da seção 2 no mesmo terminal do Maven |
| Maven pede DATABASE_PASSWORD | Use o script ou o prompt oculto; Maven não lê `.env` automaticamente |
| Banco recusou senha / usuário inexistente | Nesta máquina use `viva` e 55432; não confunda senha PostgreSQL com login Viva+ |
| Banco sem conexão / Connection refused | Inicie o cluster existente; confira porta e `pg_ctl status` |
| Flyway checksum mismatch | Preserve as migrations aplicadas V1–V6; investigue o arquivo e o banco correto, sem clean/repair automático |
| Porta já ocupada | Use `Get-NetTCPConnection -State Listen -LocalPort 8080` e `Get-Process -Id <PID>`; use Ctrl+C no terminal conhecido, não mate PID desconhecido |
| `localhost:8081` abre e `127.0.0.1:8081` não | Use o comando Expo com `--dns-result-order=ipv4first`, já incluído no script |
| Primeiro acesso demora | Next/Metro compilam a rota na primeira visita; confira o terminal e aguarde a compilação |
| Aviso de React Native DevTools/dotslash na sandbox | O download da ferramenta pode falhar por permissão; confira se a página e os testes funcionam. Não indica, sozinho, falha no app; o export estático evita esse componente de desenvolvimento |
| Acesso expirou depois de F5 no Expo Web | Esperado: sessão em memória. Entre novamente; registros confirmados continuam no banco |
| Erro 429 ao entrar | Aguarde a janela de 15 minutos após muitas tentativas. Não reduzir o limitador para testar |
| Código de ativação expirado/usado | Profissional → ficha → Recuperar acesso → confirmar própria senha; usar o novo código uma vez |
| Foto não abre | Confira FILES_DIRECTORY absoluto, chave e objetos preservados; não criar uma chave nova sobre arquivos antigos |
| OCR não reconheceu | Confira modelo/motor, foto PNG/JPEG sintética até 2 MB; digite manualmente e confirme, sem presumir reconhecimento |
| Análise alimentar/vídeo/pulseira indisponível | Limitação real registrada no manual; não é resolvida trocando credenciais de login |
| Script bloqueado por ExecutionPolicy | Para este terminal e arquivos locais conferidos: `Set-ExecutionPolicy -Scope Process Bypass`; não muda a política permanente. Política da organização pode exigir administrador |

Logs do modo automático: `.local/execucao/{backend,portal,aplicativo}.log` e `.erro.log`. Use `Get-Content .local/execucao/backend.log -Tail 30 -Wait` para acompanhar, e Ctrl+C para parar somente a leitura. Não compartilhe logs sem revisão: ferramentas externas podem imprimir campos preenchidos. O script de testes faz filtragem, mas logs privados continuam fora do Git.

Próximos passos operacionais: backup/restore atualizado após V6, revisão dos alertas de dependências e ensaios nativos. A hospedagem econômica anterior permanece; nada foi publicado por este guia.


## 11. Apenas em uma instalação nova: provisionar as contas sintéticas

**Não executar nesta máquina: as contas já existem.** Criar banco vazio não recria automaticamente os usuários Viva+. Primeiro deixe o Flyway aplicar as migrações pelo início normal, pare a API e confira pelo psql `SELECT count(*) FROM user_account;`. Somente se esse banco novo tiver zero contas, provisione explicitamente uma vez:

```powershell
Set-Location 'C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais'
. .\infra\ambiente-local.ps1
Configurar-BackendViva (Obter-ConfiguracaoViva)
$segredoInicialViva = Read-Host 'Escolha a senha das seis contas fictícias (mínimo 12 caracteres; guarde privadamente)' -AsSecureString
$ponteiroInicialViva = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segredoInicialViva)
try { $env:DEMO_BOOTSTRAP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ponteiroInicialViva) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ponteiroInicialViva); $segredoInicialViva.Dispose() }
$env:SPRING_PROFILES_ACTIVE = 'bootstrap'
try {
  .\backend\demo\mvnw.cmd -f backend/demo/pom.xml spring-boot:run
} finally { $env:SPRING_PROFILES_ACTIVE = ''; $env:DEMO_BOOTSTRAP_PASSWORD = $null; $env:DATABASE_PASSWORD = $null }
```

Após a API confirmar saúde, pare-a com Ctrl+C. Inicie novamente por `executar-local.ps1 -Servico Backend`, sem bootstrap. Entre nas seis contas .a/.b de administrador/profissional/paciente com a senha que escolheu. Guarde-a fora do Git, sem valores em logs/capturas. Esse procedimento não redefine senhas existentes e não deve ser usado como recuperação de senha. Se houver qualquer conta preexistente, use o banco/credenciais originais e o fluxo de recuperação autorizado, preservando dados e chave.


## Revisão de 20/10/2026

V7 é aditiva e guarda preferências de apresentação por conta. Na próxima inicialização a API aplica V7 pelo Flyway; nunca edite V1–V7 aplicadas. Conexão PostgreSQL/objetos/chave existentes foram preservados. Não executar seed novamente. Preferências ficam no banco e são retomadas após novo login; autenticação web do aplicativo continua somente em memória.

APP_ENV descreve o ambiente institucional. -Producao do atalho significa executar artefatos otimizados localmente, mantendo APP_ENV=development. APP_ENV=production recusa bootstrap e o modelo sintético vigente; nenhuma configuração isolada libera dados reais. A preparação institucional/modelo produtivo continua pendente.

Para capturas desta revisão, execute validar-interface-local.ps1 -Capturar -Producao -DiretorioCapturas docs/evidencias/profissionalizacao. Para backup/restore atualizado e isolado, siga [o procedimento](operations/BACKUP_RESTORE.md). Não copie arquivos privados para anexos públicos.
