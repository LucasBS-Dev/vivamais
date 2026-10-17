CREATE TABLE organization (
    id uuid PRIMARY KEY,
    name varchar(160) NOT NULL CHECK (length(trim(name)) > 0),
    demo_only boolean NOT NULL DEFAULT true CHECK (demo_only),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_account (
    id uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organization(id),
    email varchar(254) NOT NULL UNIQUE CHECK (email = lower(trim(email))),
    display_name varchar(160) NOT NULL CHECK (length(trim(display_name)) > 0),
    password_hash varchar(100) NOT NULL,
    role varchar(16) NOT NULL CHECK (role IN ('ADMIN','PROFESSIONAL','PATIENT')),
    enabled boolean NOT NULL DEFAULT true,
    demo_only boolean NOT NULL DEFAULT true CHECK (demo_only),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(id, organization_id),
    UNIQUE(id, organization_id, role)
);

CREATE TABLE professional (
    id uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    account_role varchar(16) NOT NULL DEFAULT 'PROFESSIONAL' CHECK (account_role = 'PROFESSIONAL'),
    FOREIGN KEY(id, organization_id, account_role) REFERENCES user_account(id, organization_id, role),
    UNIQUE(id, organization_id)
);

CREATE TABLE patient (
    id uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organization(id),
    user_account_id uuid UNIQUE,
    account_role varchar(16) NOT NULL DEFAULT 'PATIENT' CHECK (account_role = 'PATIENT'),
    display_name varchar(160) NOT NULL CHECK (length(trim(display_name)) > 0),
    modality varchar(24) NOT NULL CHECK (modality IN ('APP','BRACELET_DIARY')),
    demo_only boolean NOT NULL DEFAULT true CHECK (demo_only),
    created_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY(user_account_id, organization_id, account_role) REFERENCES user_account(id, organization_id, role),
    UNIQUE(id, organization_id)
);
CREATE INDEX patient_organization_idx ON patient(organization_id);

CREATE TABLE patient_professional_assignment (
    patient_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(patient_id, professional_id),
    FOREIGN KEY(patient_id, organization_id) REFERENCES patient(id, organization_id),
    FOREIGN KEY(professional_id, organization_id) REFERENCES professional(id, organization_id)
);
CREATE INDEX assignment_professional_idx ON patient_professional_assignment(professional_id, organization_id);

CREATE TABLE auth_session (
    id uuid PRIMARY KEY,
    user_account_id uuid NOT NULL REFERENCES user_account(id),
    token_hash char(64) NOT NULL UNIQUE,
    created_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL CHECK(expires_at > created_at),
    revoked_at timestamptz
);
CREATE INDEX session_expiry_idx ON auth_session(expires_at);

CREATE TABLE consent_or_legal_basis_record (
    id uuid PRIMARY KEY,
    patient_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    purpose varchar(300) NOT NULL,
    basis_reference varchar(300) NOT NULL,
    recorded_by uuid NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY(patient_id, organization_id) REFERENCES patient(id, organization_id),
    FOREIGN KEY(recorded_by, organization_id) REFERENCES user_account(id, organization_id)
);

CREATE TABLE audit_event (
    id uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organization(id),
    actor_id uuid NOT NULL,
    action varchar(80) NOT NULL,
    resource_type varchar(80) NOT NULL,
    resource_id uuid,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY(actor_id, organization_id) REFERENCES user_account(id, organization_id)
);
CREATE INDEX audit_organization_time_idx ON audit_event(organization_id, occurred_at);
CREATE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'audit_event is append only';
END;
$$;
CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_event
    FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();
CREATE TRIGGER audit_no_truncate BEFORE TRUNCATE ON audit_event
    FOR EACH STATEMENT EXECUTE FUNCTION reject_audit_mutation();
