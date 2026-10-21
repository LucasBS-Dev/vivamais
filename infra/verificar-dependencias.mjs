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
