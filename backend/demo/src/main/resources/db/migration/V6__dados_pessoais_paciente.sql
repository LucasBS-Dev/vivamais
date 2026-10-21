ALTER TABLE patient
    ADD COLUMN cpf varchar(11),
    ADD COLUMN data_nascimento date,
    ADD COLUMN telefone varchar(11),
    ADD COLUMN email_contato varchar(254),
    ADD COLUMN sexo varchar(30),
    ADD COLUMN endereco varchar(500),
    ADD COLUMN versao_dados integer NOT NULL DEFAULT 0;

ALTER TABLE patient ADD CONSTRAINT paciente_cpf_formato CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$');
CREATE UNIQUE INDEX paciente_cpf_por_unidade ON patient(organization_id, cpf) WHERE cpf IS NOT NULL;
UPDATE patient p SET email_contato=u.email FROM user_account u WHERE u.id=p.user_account_id;
-- RLS e revogações de patient permanecem em vigor. Nenhum acesso direto é concedido.
