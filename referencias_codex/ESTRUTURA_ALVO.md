# Estrutura do AgendAqui — evidências e adaptações para o Viva+

O ZIP original tem **110 itens** (incluindo diretórios). Na raiz do exemplo:

```text
app/                           # Expo Router
app/_layout.tsx
app/index.tsx
app/login.tsx
app/admin/                     # telas agrupadas
assets/images/
components/Popup.tsx
contexts/ThemeContext.tsx
hooks/useAuth.ts
hooks/useAgendamentos.ts
services/api.ts
backend/demo/pom.xml
backend/demo/src/main/java/com/senac/demo/
   config/
   controller/
   model/
   repositories/
backend/demo/src/main/resources/application.properties
package.json
app.json
tsconfig.json
```

**Regra:** reproduzir esse PADRÃO DE ORGANIZAÇÃO, mas usar nomes de domínio Viva+ em português, como `PacienteController.java`, `RegistroPressao.java`, `useAutenticacao.ts`, `MinhaPressao.tsx`, `registrarPressao()`. As pastas técnicas e convenções do framework permanecem com seus nomes originais.

**Adaptação obrigatória:** o exemplo não contém Next.js. Adicionar `web/` como projeto Next.js independente, mantendo `app/` da raiz destinado ao Expo.

**Não copiar fragilidades do exemplo:** ele utiliza H2 e inclui IP de rede no cliente, senha em texto puro e CORS irrestrito em partes do código. O Viva+ exige PostgreSQL, segredos por ambiente, senhas com hash, autorização real e tratamento seguro de dados de saúde. O ZIP não substitui a especificação funcional Viva+.
