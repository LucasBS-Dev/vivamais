# Viva+ para pacientes — fundação

App Expo Router/React Native/TypeScript ligado à mesma API Java da plataforma profissional. A Fase 1 oferece boas-vindas, login real, identificação de paciente, modalidade, disponibilidade dos módulos, verificação da API e encerramento com revogação no servidor. Não cria medições, prescrições, notificações nem fila offline. As quatro ações e o histórico descrevem as fases futuras, sem dados clínicos ilustrativos.

## Desenvolvimento

Na raiz do monorepo, instalar com `pnpm install --frozen-lockfile`. Copiar `.env.example` para `.env` nesta pasta, iniciar PostgreSQL/API e provisionar as contas sintéticas conforme o README da raiz. Depois executar `pnpm --filter @viva/mobile start`, `web`, `android` ou `ios`. Não há senha padrão. Para o Android Emulator, usar `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080`; no iOS Simulator/web, `http://127.0.0.1:8080`. A API deve permitir a origem local do Expo web na configuração CORS (normalmente `http://localhost:8081`).

Em aparelho físico, `localhost` aponta para o próprio aparelho. O Compose padrão publica a API somente em `127.0.0.1` do computador, portanto trocar apenas a URL por um IP LAN não basta. Para ensaio local, iniciar a API Java no host em uma interface alcançável, ou aplicar um override Compose local explícito para publicar a porta 8080 na interface LAN; usar então `EXPO_PUBLIC_API_BASE_URL=http://<IP-LAN-do-computador>:8080`. Confirmar rede Wi-Fi compartilhada, firewall e alcance da porta. Essa exposição é somente para a rede de teste confiável com dados sintéticos; não abrir PostgreSQL, não encaminhar a porta no roteador e não versionar credenciais. A alternativa é usar a mesma API pública HTTPS da demo, depois de sua implantação autorizada. O override de rede não é necessário para o navegador ou simuladores locais.

HTTP é autorizado somente no perfil de desenvolvimento, inclusive nas configurações nativas. `APP_ENV=preview` e `production` exigem API pública HTTPS. `EXPO_PUBLIC_*` é configuração pública e nunca deve conter senha, chave ou service-role. A sessão nativa guarda apenas token opaco e validade no Expo SecureStore, acessível com aparelho desbloqueado, sem backup reutilizável. O token web fica somente em memória: recarregar a página exige login. Não há persistência clínica local nesta fase.

## Validação

`pnpm --filter @viva/mobile typecheck`, `test` e `export:web`. Os testes exercitam bloqueio de HTTP fora de desenvolvimento, proteção do destino do bearer token, timeout, respostas de autenticação e validade de sessão. O fluxo Maestro em `.maestro/login.yaml` usa `DEMO_EMAIL`/`DEMO_PASSWORD` fornecidos no ambiente e requer build instalado, API e paciente sintético. Não versionar as credenciais. Leitor de tela, fonte ampliada, teclado e alvos de toque mínimos de 48 pontos foram considerados na implementação; ainda exigem ensaio manual em Android/iOS e validação com idosos.

## Builds e lojas

Expo SDK 57 foi escolhido como versão estável anterior ao SDK 58 (lançado em 15/10/2026), mantendo React 19.2.3 compartilhado com a web. Versões nativas seguem o [mapa oficial SDK 57](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json) e a [referência de compatibilidade Expo](https://docs.expo.dev/versions/latest/). SDK 57: RN 0.86.3, Android 7+ e iOS 16.4+ segundo a documentação; confirmar os mínimos e toolchain no primeiro build. Atualizações de SDK são uma mudança deliberada com build e teste físico, não atualização automática de dependências.

`eas.json` separa desenvolvimento interno (APK/simulador iOS), preview interno e produção (AAB Android/IPA iOS). Configurar no projeto EAS a variável pública `EXPO_PUBLIC_API_BASE_URL` com a URL HTTPS real da API, respeitando o ambiente de cada build. Usar `eas build --profile preview --platform android`, por exemplo, somente depois de configurar contas e credenciais. O perfil development usa o cliente padrão, sem exigir Expo Go ou `expo-dev-client`; reiniciar o bundler não distribui o produto final.

Os identificadores `org.vivamais.academicdemo`, slug e scheme são provisórios. Substituir por identificadores institucionais únicos antes do primeiro registro nas lojas, executar `eas init` com a conta autorizada e adicionar o projectId real. Ícones finais, screenshots, política pública de privacidade, suporte/exclusão, conta de revisão, formulários de saúde/privacidade, revisão clínica/jurídica e aprovação de publicação são pendências da Fase 7. Nenhum envio automático está configurado. Contas e taxas Apple/Google e eventual uso pago EAS precisam da autorização do titular.

Preparação de configuração não significa build nativo validado nem aprovação das lojas. Não foram executados build nativo, instalação física, Maestro ou submissão sem dispositivos/contas/credenciais disponíveis. Consulte o STATUS.md da raiz para resultados efetivamente executados.
