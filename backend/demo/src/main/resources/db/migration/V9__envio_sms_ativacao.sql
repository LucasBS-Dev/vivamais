-- Transição aditiva: cadastros sem celular e dispositivos já autorizados permanecem.
ALTER TABLE patient ALTER COLUMN telefone TYPE varchar(16);
ALTER TABLE patient ADD COLUMN versao_telefone integer NOT NULL DEFAULT 0;
ALTER TABLE patient ADD COLUMN telefone_confirmado_em timestamptz;

CREATE TABLE envio_sms_ativacao (
    id uuid PRIMARY KEY,
    id_paciente uuid NOT NULL REFERENCES patient(id),
    id_codigo uuid UNIQUE REFERENCES codigo_ativacao_paciente(id),
    versao_telefone integer NOT NULL,
    destino_mascarado varchar(24),
    provedor varchar(24) NOT NULL CHECK (provedor IN ('DESABILITADO','LOCAL','TWILIO')),
    estado varchar(32) NOT NULL CHECK (estado IN ('PREPARADO','NAO_CONFIGURADO','TESTE_LOCAL','ACEITO_PROVEDOR','ENTREGUE','FALHA','NAO_ENTREGUE','INDETERMINADO')),
    referencia_provedor varchar(80),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    consultado_em timestamptz
);
CREATE INDEX envio_sms_paciente_criado ON envio_sms_ativacao(id_paciente,criado_em DESC);
ALTER TABLE envio_sms_ativacao ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON envio_sms_ativacao FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON envio_sms_ativacao FROM anon; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON envio_sms_ativacao FROM authenticated; END IF;
END $$;
-- Códigos manuais anteriores não são expostos nem convertidos em SMS fictício.
UPDATE codigo_ativacao_paciente SET utilizado_em=now() WHERE utilizado_em IS NULL;
