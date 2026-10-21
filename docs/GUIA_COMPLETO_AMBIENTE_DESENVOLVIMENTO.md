# Ambiente de desenvolvimento — do clone à execução

Windows11, PowerShell7, Java21, Node24 e pnpm10.28.2. Os comandos partem da raiz do clone, salvo indicação. Não precisam dos arquivos privados de quem iniciou o projeto. O percurso existente do autor continua em [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md); não reinicializar seu cluster para seguir este guia.

## 1. Ferramentas e clone

Instalar Git, Node24, JDK21, PowerShell7 e PostgreSQL17 pelos fornecedores. VS Code abre a raiz; IntelliJ pode importar `backend/demo/pom.xml` com Project SDK21. Android Studio é necessário somente para compilação/emulador Android; Windows não executa Xcode/iOS Simulator. Links oficiais: [OpenJDK no Windows](https://learn.microsoft.com/en-us/windows/dev-environment/java), [Node](https://nodejs.org/en/download), [PostgreSQL Windows](https://www.postgresql.org/download/windows/), [Expo CLI](https://docs.expo.dev/more/expo-cli/). Escolher as versões do projeto, não atualizar o lock automaticamente para a versão global mais recente.

```powershell
git --version
node --version
pwsh --version
git clone https://github.com/joaosoares03/vivamais.git
Set-Location .\vivamais
git status --short
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm --version
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm install --frozen-lockfile
```

Não executar npm install em web nem criar outro Git. O workspace inclui web e packages; postinstall sincroniza os pacotes file:. `web/package-lock.json` é um remanescente anterior, não o lock ativo; não usá-lo para instalar o portal. Se a instalação falhar, guardar diagnóstico privado, conferir Node e a primeira mensagem; não remover o lock para contornar.

Selecionar o JDK21 neste terminal (informar caminho da pasta que contém bin/java.exe):

```powershell
$jdkViva = Read-Host 'Caminho absoluto do JDK 21 instalado'
$env:JAVA_HOME = $jdkViva
$env:PATH = "$jdkViva\bin;$env:PATH"
java -version
.\backend\demo\mvnw.cmd --version
```

Maven Wrapper baixa3.9.11 e verifica SHA, sem Maven global. Nesta máquina `java` no PATH original era Java8; o helper seleciona Microsoft21.0.10. Configurar JAVA_HOME permanentemente nas variáveis do usuário é opcional; reiniciar terminais depois. Não copiar o caminho de outra máquina sem conferir.

## 2. Banco: escolher conscientemente uma instância

| Ambiente | Servidor/porta | Banco/usuário | Procedimento |
| --- | --- | --- | --- |
| Máquina original preservada | PostgreSQL17.9 portátil,127.0.0.1:55432 | vivamais / viva | Reutilizar work privado existente; não executar initdb ou trocar senha |
| Clone novo, percurso recomendado abaixo | PostgreSQL17 instalado,127.0.0.1:55432 escolhido no instalador | vivamais / viva | Criar sua própria role/bancos e senha |
| Compose opcional | postgres:17.9-alpine,host5432 | vivamais / vivamais padrão | Volume próprio; não compartilhar pg-data do host |
| Outra instalação já encontrada | PostgreSQL18,5432 | Não é a demonstração17/55432 | Não conectar por engano ou reutilizar diretório de dados17 |

A porta55432 no novo instalador evita colidir com18/5432. Se escolher outra porta, atualizar JDBC e configuração local juntos. No menu Serviços do Windows/pgAdmin iniciar **a instância17 escolhida**; o nome do serviço pode variar. No portátil existente, `infra/executar-local.ps1 -Servico Banco` usa pg_ctl apenas no diretório17 já existente. O helper não instala PostgreSQL nem executa initdb.

Em clone novo, com `psql`17 no PATH, abrir como administrador **do banco**, com prompt de senha (sem senha no comando):

```powershell
psql -h 127.0.0.1 -p 55432 -U postgres -d postgres -W
```

Executar dentro do psql, **apenas se esses nomes ainda não existem nessa nova instância**:

```sql
CREATE ROLE viva LOGIN;
\password viva
CREATE DATABASE vivamais OWNER viva;
CREATE DATABASE vivamais_testes OWNER viva;
\q
```

Escolher senha própria forte no prompt. Não usar role postgres no aplicativo. Role viva precisa ser dona de seus bancos/schemas para Flyway; não precisa de superusuário. Não conceder acesso a clientes Supabase anon/authenticated. Confirmar:

```powershell
psql -h 127.0.0.1 -p 55432 -U viva -d vivamais -W -c 'select current_database(), current_user, version();'
```

O banco inicialmente vazio recebe V1–V9 na primeira execução da API. Não rodar SQL manual duplicando migrations. Criação de nova migração, contagens e proteção estão no [dicionário](ARQUITETURA_BANCO_DADOS.md).

## 3. Configuração local sem senha no arquivo versionável

Na raiz, criar `.local/configuracao-local.json`. O arquivo é ignorado; contém caminhos/porta, **não senha**:

```powershell
New-Item -ItemType Directory -Force .local | Out-Null
@{
  JavaHome = $env:JAVA_HOME
  BancoHost = '127.0.0.1'
  BancoPorta = 55432
  BancoNome = 'vivamais'
  BancoUsuario = 'viva'
  BancoDiretorio = ''
  BancoBin = ''
  Psql = 'psql'
} | ConvertTo-Json | Set-Content .local/configuracao-local.json -Encoding utf8
```

BancoDiretorio/Bin vazios indicam servidor instalado e iniciado por você. Para cluster portátil existente utilizar valores reais; não apontar para outra versão de PG. Obter senhas em entrada protegida e mantê-las somente no ambiente do processo:

```powershell
$env:DATABASE_URL = 'jdbc:postgresql://127.0.0.1:55432/vivamais'
$env:DATABASE_USER = 'viva'
$env:DATABASE_PASSWORD = [Net.NetworkCredential]::new('', (Read-Host 'Senha PostgreSQL da role viva' -AsSecureString)).Password
$env:FILES_DIRECTORY = Join-Path (Get-Location) '.local\private-files'
$env:APP_ENV = 'development'
$env:SMS_PROVIDER = 'LOCAL'
$env:SMS_LOCAL_TEST_ENABLED = 'true'
$env:SMS_REAL_AUTHORIZED = 'false'
$env:FOOD_ANALYSIS_ENABLED = 'false'
```

Nunca exibir `$env:DATABASE_PASSWORD` ou listar todas as variáveis. Maven não carrega `.env` automaticamente. `.env.example` é uma lista de variáveis; `infra/load-env.ps1` é o carregador explícito para quem optou por `.env` privado. Inicializador pode pedir senha no terminal se não estiver no ambiente; ele só reutiliza a credencial privada do autor quando o endereço/usuário coincidem.

## 4. Primeiro bootstrap de um clone novo

Este bloco é **somente para banco novo sintético**. Escolher senha de login Viva+ distinta da senha PostgreSQL,12 caracteres a72bytes; guardá-la no seu gerenciador privado:

```powershell
$env:SPRING_PROFILES_ACTIVE = 'bootstrap'
$env:DEMO_BOOTSTRAP_PASSWORD = [Net.NetworkCredential]::new('', (Read-Host 'Nova senha das contas sintéticas Viva+' -AsSecureString)).Password
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml spring-boot:run
```

Esperar API8080 saudável. Em outro terminal, `Invoke-RestMethod http://127.0.0.1:8080/actuator/health` deve indicar UP. Voltar ao primeiro,Ctrl+C, e retirar bootstrap:

```powershell
Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
Remove-Item Env:DEMO_BOOTSTRAP_PASSWORD -ErrorAction SilentlyContinue
```

Seed `DadosDemonstracao` cria duas unidades A/B, contas `profissional.a@demo.vivamais.invalid`, `admin.a@demo.vivamais.invalid` e equivalentes b, mais pacientes/diários sintéticos. Não há senha distribuída no repositório. Seed não redefine senha existente. Paciente não usa e-mail/senha: cadastros APP sem CPF/nascimento/celular precisam de regularização na ficha profissional ou novo cadastro fictício antes da ativação. Não assumir que o seed já autoriza seu navegador.

## 5. Inicialização conjunta

PostgreSQL deve estar disponível e dependências instaladas. No terminal com DATABASE_PASSWORD configurada:

```powershell
.\infra\executar-local.ps1 -Servico Diagnostico
.\Iniciar-VivaMais.cmd -Producao -SmsLocal -Recompilar
```

Na primeira vez, `-Recompilar` gera JAR, Next e Expo web; nas seguintes pode omitir. `-Producao` usa build otimizado **local**, APP_ENV development. O controlador requer PowerShell7, aguarda health de cada servidor e mantém terminal aberto; logs privados em `.local/execucao`. Não iniciar conjunto paralelo nas mesmas portas. O script foi executado nesta máquina; seu uso em outra instalação exige a configuração anterior e foi documentado a partir do código, não alegado como ensaio em outro computador.

| Serviço | URL | Verificação |
| --- | --- | --- |
| API | http://127.0.0.1:8080 | GET /actuator/health retorna UP |
| Portal | http://127.0.0.1:3000 | Login profissional com sua senha de bootstrap |
| Paciente | http://127.0.0.1:8081/acesso | CPF+nascimento e ativação/aparelho |
| PostgreSQL |127.0.0.1:55432| psql/SELECT, não URL de navegador |

Cadastro APP exige celular brasileiro com DDD, CPF estrutural e nascimento; validação matemática não é consulta Receita. Profissional abre ficha, **Ativar ou recuperar acesso**, confirma identidade/celular e própria senha e solicita código. Para demonstração sem operadora, copiar a referência UUID e usar:

```powershell
node infra/caixa-sms-local.cjs REFERENCIA_DO_TESTE
notepad .local\private-files\sms-teste\consulta-privada.json
```

Código privado de quatro números vale10min/uso único; não vai ao portal/API normal nem ao Git. No paciente informar CPF/nascimento e código. O [guia SMS](CADASTRO_E_ATIVACAO_SMS.md) explica estados, limites e homologação real futura. Não substituir por código fixo.

## 6. Comandos separados

Cada servidor ocupa um terminal; configurar variáveis em cada terminal necessário. Partindo da raiz, são alternativas ao controlador, nunca simultâneas a ele:

```powershell
# Banco já instalado: iniciar serviço17 correto pelo Windows/pgAdmin.
# Portátil17 já configurado:
.\infra\executar-local.ps1 -Servico Banco
# Terminal da API, com DATABASE_* e SMS_* configurados:
.\infra\executar-local.ps1 -Servico Backend
# Outro terminal:
.\infra\executar-local.ps1 -Servico Portal
# Outro terminal:
.\infra\executar-local.ps1 -Servico Aplicativo
```

Comandos expandidos para trabalhar em cada ferramenta:

```powershell
# Compilar API sem pular a verificação: veja banco de teste no manual de testes.
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml verify
# Executar API manualmente, com Java21 e DATABASE_* já configurados:
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml spring-boot:run
# Portal em outro terminal:
$env:API_BASE_URL='http://127.0.0.1:8080'
$env:APP_ORIGIN='http://127.0.0.1:3000'
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm dev:web
# Build do portal com servidor encerrado:
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm build:web
# Expo em outro terminal, development para URL local:
$env:APP_ENV='development'
$env:EXPO_PUBLIC_API_BASE_URL='http://127.0.0.1:8080'
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm web:mobile
# Prévia estática, com Metro encerrado:
npm.cmd exec --yes --package=pnpm@10.28.2 -- pnpm export:mobile
node infra/serve-mobile-preview.mjs
```

As linhas de servidores são alternativas bloqueantes; não colar tudo esperando retornar ao prompt. Para testar/buildar, seguir o [manual de testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md). Na sandbox Windows, TEMP/TMP precisam de pasta gravável e Next pode exigir `infra/preparar-build-web.mjs`/VIVA_BUILD_DIRETORIOS_PREPARADOS; isso é contorno local documentado, não configuração geral obrigatória.

## 7. OCR, mobile nativo e serviços opcionais

OCR: instalar Tesseract com idioma eng e configurar `TESSERACT_COMMAND` para o executável, ou usar `OCR_NODE_SCRIPT` com caminho absoluto de infra/ocr-worker.mjs e modelo eng em `OCR_DATA_DIRECTORY`. O worker existe e foi testado com fixture; obter o modelo por fonte autorizada, manter cache fora do Git. Sem runtime/modelo, reconhecer falha explicitamente. Não exigir serviço de IA pago para executar o cadastro/pressão manual.

Android: ambiente Android Studio/SDK/emulador e configuração de API10.0.2.2 para o host. `pnpm android` inicia Metro/abre alvo, não comprova build SQLCipher. Desenvolvimento nativo pode usar `pnpm exec expo run:android` após preparar SDK; cria artefatos nativos e exige revisão. iOS: compilação local/simulador exigem macOS/Xcode; no Windows usar EAS autorizado ou outro host. [Documentação Expo](https://docs.expo.dev/develop/development-builds/introduction/) diferencia development build e Expo Go. Permissões, SecureStore, SQLCipher e notificações exigem build/aparelho; não houve ensaio físico nesta entrega.

Preview/production Expo exige API pública HTTPS; não usar localhost no pacote distribuído. Variáveis de build entram no bundle. Identificadores org.vivamais.academicdemo são provisórios; acordar os definitivos antes de assinar/lojas. Não executar EAS pago/submissão por seguir este guia sem autorização.

Compose é alternativa opcional para quem tem Docker: copiar `.env.example` para `.env`, definir DATABASE_PASSWORD e bootstrap explicitamente e executar `docker compose up --build -d`. A configuração existente usa postgres17.9,host5432,volumes persistentes; o backend vê postgres:5432. Não equivale ao cluster portátil55432. O compose atual não encaminha automaticamente todas as opções SMS/OCR do shell; para SMS LOCAL seguir o backend no host acima ou adicionar override privado revisado. Docker não foi ensaiado nesta máquina.

## 8. Encerrar, preservar e diagnosticar

No controlador interativo,Enter encerra o conjunto. Se iniciou com `-AguardarSinal`,em outro terminal `infra/encerrar-local.ps1` sinaliza o controlador. Modo manual:Ctrl+C em cada servidor. Banco só é parado pelo controlador se foi iniciado por ele; banco preexistente permanece ligado. Não apagar volumes, diretórios ou chaves.

```powershell
.\infra\executar-local.ps1 -Servico Verificar
.\infra\encerrar-local.ps1
```

Erro de porta ocupada: verificar controlador existente, não matar processo desconhecido. Erro de checksum: comparar histórico/migração aplicada, não editar SQL/usar repair.401 profissional: conferir senha criada por você e não a do PG; seed não altera conta antiga.409 na ativação: regularizar dados/versão.503 SMS: conferir LOCAL explícito; não presumir entrega.429: aguardar janela; não limpar contador no banco principal. Foto indecifrável: recuperar chave/objeto correspondentes. O [manual do banco](ARQUITETURA_BANCO_DADOS.md) orienta backup/restore isolado; [manual de testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md) descreve diagnóstico sem publicar dados sensíveis.
