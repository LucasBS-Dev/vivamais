import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
const require = createRequire(import.meta.url);
const consulta = require("query-string");
assert.equal(consulta.parse("nome=Jo%C3%A3o").nome, "João");
assert.deepEqual([...consulta.parse("a=1&a=2").a], ["1", "2"]);
assert.equal(
  consulta.parse(consulta.stringify({ nome: "São Paulo", espaco: "a b" })).nome,
  "São Paulo",
);
const inicio = performance.now();
consulta.parse(`invalido=${"%FE%FF%FA".repeat(1500)}`);
assert.ok(
  performance.now() - inicio < 2000,
  "Entrada malformada deve ser limitada sem decodificação exponencial",
);
const projeto = require("xcode").project("ensaio-nao-gravado.pbxproj");
projeto.hash = { project: { objects: {} } };
const ids = Array.from({ length: 100 }, () => projeto.generateUuid());
assert.equal(new Set(ids).size, 100);
assert.ok(ids.every((id) => /^[A-F0-9]{24}$/.test(id)));
console.log(
  "APROVADO: importação CJS/ESM, consultas acentuadas/repetidas, entrada malformada e UUIDs do projeto iOS.",
);

// Exercita os consumidores reais das dependências atualizadas do Expo CLI.
const carregarExpo = createRequire(require.resolve("@expo/cli/package.json"));
const compararVersao = carregarExpo("semver");
assert.ok(
  compararVersao.gte(carregarExpo("node-forge/package.json").version, "1.4.2"),
);
assert.ok(
  compararVersao.gte(carregarExpo("zod/package.json").version, "4.6.6"),
);
const { PluginSchema, DevToolsPluginOutputSchema } = carregarExpo(
  "./build/src/start/server/DevToolsPlugin.schema.js",
);
const { createMCPDevToolsExtensionSchema } = carregarExpo(
  "./build/src/start/server/createMCPDevToolsExtensionSchema.js",
);
const plugin = PluginSchema.parse({
  packageName: "plugin-local-teste",
  packageRoot: process.cwd(),
  cliExtensions: {
    description: "Validação local de compatibilidade",
    entryPoint: "index.js",
    commands: [
      {
        name: "exibir",
        title: "Exibir informação de teste",
        environments: ["cli", "mcp"],
        parameters: [{ name: "quantidade", type: "number" }],
      },
    ],
  },
});
assert.equal(PluginSchema.safeParse({}).success, false);
const esquemaComando = createMCPDevToolsExtensionSchema(plugin);
assert.equal(
  esquemaComando.safeParse({ command: "exibir", quantidade: 2 }).success,
  true,
);
assert.equal(
  esquemaComando.safeParse({ command: "exibir", quantidade: "2" }).success,
  false,
);
assert.equal(
  esquemaComando.safeParse({ command: "inexistente" }).success,
  false,
);
assert.equal(
  DevToolsPluginOutputSchema.safeParse([
    { type: "text", text: "Informação de teste", level: "info" },
  ]).success,
  true,
);
assert.equal(
  DevToolsPluginOutputSchema.safeParse([{ type: "audio", url: "invalida" }])
    .success,
  false,
);
const zod = carregarExpo("zod").z;
let elementosProcessados = 0;
const colecaoLimitada = zod
  .array(
    zod.string().transform((valor) => {
      elementosProcessados++;
      return valor;
    }),
  )
  .max(2);
assert.equal(
  colecaoLimitada.safeParse(Array(1000).fill("teste")).success,
  false,
);
assert.equal(
  elementosProcessados,
  0,
  "Coleção acima do limite deve ser recusada antes de processar os elementos",
);
const forge = carregarExpo("node-forge");
const chavesTemporarias = forge.pki.rsa.generateKeyPair({
  bits: 2048,
  e: 65537,
});
const resumo = forge.md.sha256.create();
resumo.update("Verificação local do consumidor", "utf8");
const assinatura = chavesTemporarias.privateKey.sign(resumo);
assert.equal(
  chavesTemporarias.publicKey.verify(resumo.digest().bytes(), assinatura),
  true,
);
const resumoDivergente = forge.md.sha256.create();
resumoDivergente.update("Outro conteúdo", "utf8");
assert.equal(
  chavesTemporarias.publicKey.verify(
    resumoDivergente.digest().bytes(),
    assinatura,
  ),
  false,
);
console.log(
  "APROVADO: schemas reais do Expo CLI, parâmetros inválidos, limites Zod e assinatura com node-forge atualizado.",
);
