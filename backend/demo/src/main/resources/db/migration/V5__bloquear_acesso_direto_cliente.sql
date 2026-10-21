-- O cliente acessa dados pela API Java. A conexão JDBC é privada e proprietária das tabelas.
-- Não criar políticas permissivas para anon/authenticated no Supabase.
-- O histórico técnico do Flyway fica fora: o migrador mantém um bloqueio nessa tabela.
DO $$
DECLARE
    nome_tabela text;
    papel_cliente text;
    nome_esquema text := current_schema();
BEGIN
    FOREACH nome_tabela IN ARRAY ARRAY[
        'organization','user_account','professional','patient','patient_professional_assignment',
        'auth_session','consent_or_legal_basis_record','audit_event','account_activation',
        'sync_operation','blood_pressure_reading','medication_plan','medication_schedule',
        'medication_plan_history','medication_self_report','physical_activity_profile','activity_record',
        'printed_diary_entry','consultation','device','device_configuration','file_object',
        'file_download_grant','pressure_ocr_document','meal_photo','food_analysis_attempt'
    ] LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',nome_esquema,nome_tabela);
        EXECUTE format('REVOKE ALL ON TABLE %I.%I FROM PUBLIC',nome_esquema,nome_tabela);
        FOR papel_cliente IN SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated') LOOP
            EXECUTE format('REVOKE ALL ON TABLE %I.%I FROM %I',nome_esquema,nome_tabela,papel_cliente);
        END LOOP;
    END LOOP;
END $$;
