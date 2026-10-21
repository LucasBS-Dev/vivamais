export interface DadosPessoaisPaciente {
  idPaciente: string;
  nomeCompleto: string;
  cpf: string | null;
  dataNascimento: string | null;
  emailContato: string | null;
  telefone: string | null;
  sexo: string | null;
  endereco: string | null;
  versao: number;
}

export function validarCpf(cpf: string): boolean {
  if (!cpf.trim()) return true;
  if (!/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(cpf.trim())) return false;
  const numeros = cpf.replace(/\D/g, "");
  if (numeros.length !== 11 || new Set(numeros).size === 1) return false;
  for (let posicao = 9; posicao < 11; posicao++) {
    let soma = 0;
    for (let indice = 0; indice < posicao; indice++)
      soma += Number(numeros[indice]) * (posicao + 1 - indice);
    if (((soma * 10) % 11) % 10 !== Number(numeros[posicao])) return false;
  }
  return true;
}

const codigosDdd = new Set(
  "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(
    " ",
  ),
);

// Validação de formato; não comprova linha ativa, titularidade ou identidade.
export function normalizarCelularBrasileiro(valor: string): string | null {
  const texto = valor.trim();
  if (
    !/^\+?[\d ()-]+$/.test(texto) ||
    (texto.startsWith("+") && !texto.startsWith("+55"))
  )
    return null;
  let numeros = texto.replace(/\D/g, "");
  if (numeros.length === 13 && numeros.startsWith("55"))
    numeros = numeros.slice(2);
  if (!/^\d{2}9\d{8}$/.test(numeros) || !codigosDdd.has(numeros.slice(0, 2)))
    return null;
  return "+55" + numeros;
}

export function mascararCelularBrasileiro(valor: string): string {
  let numeros = valor.replace(/\D/g, "");
  if (
    (valor.startsWith("+55") || numeros.length > 11) &&
    numeros.startsWith("55")
  )
    numeros = numeros.slice(2);
  numeros = numeros.slice(0, 11);
  if (!numeros) return "";
  if (numeros.length <= 2) return "(" + numeros;
  const assinante = numeros.slice(2);
  return `(${numeros.slice(0, 2)}) ${assinante.slice(0, 5)}${assinante.length > 5 ? "-" + assinante.slice(5) : ""}`;
}

export function formatarCelularBrasileiro(valor: string | null): string {
  return valor && normalizarCelularBrasileiro(valor)
    ? mascararCelularBrasileiro(valor)
    : valor || "Não informado";
}
