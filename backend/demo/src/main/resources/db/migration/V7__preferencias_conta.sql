-- Preferências de apresentação: sem credenciais ou dados clínicos.
CREATE TABLE preferencia_conta (
    id_usuario uuid PRIMARY KEY REFERENCES user_account(id),
    texto_ampliado boolean NOT NULL DEFAULT false,
    tamanho_pagina integer NOT NULL DEFAULT 20 CHECK (tamanho_pagina IN (10,20,50)),
    versao integer NOT NULL DEFAULT 1 CHECK (versao > 0),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE preferencia_conta ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE preferencia_conta FROM PUBLIC;
DO $$
DECLARE papel_cliente text;
BEGIN
    FOR papel_cliente IN SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated') LOOP
        EXECUTE format('REVOKE ALL ON TABLE %I.preferencia_conta FROM %I',current_schema(),papel_cliente);
    END LOOP;
END $$;
