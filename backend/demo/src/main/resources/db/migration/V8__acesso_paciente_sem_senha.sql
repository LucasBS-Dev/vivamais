-- Preserva cadastros e registros. Somente credenciais antigas de pacientes são invalidadas.
CREATE TABLE dispositivo_acesso_paciente (
 id uuid PRIMARY KEY, id_usuario uuid NOT NULL REFERENCES user_account(id),
 hash_credencial char(64) NOT NULL UNIQUE, criado_em timestamptz NOT NULL DEFAULT now(),
 expira_em timestamptz NOT NULL, ultimo_uso timestamptz NOT NULL DEFAULT now(),
 revogado_em timestamptz, manter_sessao boolean NOT NULL DEFAULT true,
 tipo varchar(6) NOT NULL CHECK(tipo IN ('WEB','NATIVO'))
);
CREATE INDEX dispositivo_por_usuario ON dispositivo_acesso_paciente(id_usuario);
ALTER TABLE auth_session ADD COLUMN id_dispositivo_paciente uuid REFERENCES dispositivo_acesso_paciente(id);
CREATE TABLE codigo_ativacao_paciente (
 id uuid PRIMARY KEY, id_paciente uuid NOT NULL REFERENCES patient(id),
 hash_codigo char(64) NOT NULL, criado_em timestamptz NOT NULL DEFAULT now(),
 expira_em timestamptz NOT NULL, utilizado_em timestamptz,
 id_emissor uuid NOT NULL REFERENCES user_account(id)
);
CREATE INDEX codigo_por_paciente ON codigo_ativacao_paciente(id_paciente,criado_em DESC);
CREATE TABLE desafio_acesso_paciente (
 hash_desafio char(64) PRIMARY KEY, id_paciente uuid REFERENCES patient(id), chave_identidade char(64) NOT NULL,
 criado_em timestamptz NOT NULL DEFAULT now(), expira_em timestamptz NOT NULL,
 utilizado_em timestamptz, tentativas integer NOT NULL DEFAULT 0 CHECK(tentativas BETWEEN 0 AND 5),
 tipo varchar(6) NOT NULL CHECK(tipo IN ('WEB','NATIVO'))
);
CREATE TABLE limite_acesso_paciente (
 chave char(64) PRIMARY KEY, inicio_janela timestamptz NOT NULL,
 tentativas integer NOT NULL CHECK(tentativas > 0)
);
DO $$
DECLARE nome text; papel text;
BEGIN
 FOREACH nome IN ARRAY ARRAY['dispositivo_acesso_paciente','codigo_ativacao_paciente','desafio_acesso_paciente','limite_acesso_paciente'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',nome);
  EXECUTE format('REVOKE ALL ON TABLE %I FROM PUBLIC',nome);
  FOREACH papel IN ARRAY ARRAY['anon','authenticated'] LOOP
   IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=papel) THEN
    EXECUTE format('REVOKE ALL ON TABLE %I FROM %I',nome,papel);
   END IF;
  END LOOP;
 END LOOP;
END $$;
UPDATE account_activation SET used_at=now() WHERE used_at IS NULL;
UPDATE auth_session s SET revoked_at=now() FROM user_account u
 WHERE s.user_account_id=u.id AND u.role='PATIENT' AND s.revoked_at IS NULL;
