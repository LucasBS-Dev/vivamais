CREATE TABLE account_activation (
 id uuid PRIMARY KEY, user_account_id uuid NOT NULL REFERENCES user_account(id),
 token_hash char(64) NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
 used_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sync_operation (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), actor_id uuid NOT NULL REFERENCES user_account(id),
 kind varchar(40) NOT NULL, payload_hash char(64) NOT NULL, response jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE blood_pressure_reading (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), author_id uuid NOT NULL REFERENCES user_account(id),
 systolic integer NOT NULL CHECK(systolic BETWEEN 1 AND 400), diastolic integer NOT NULL CHECK(diastolic BETWEEN 1 AND 400),
 pulse integer CHECK(pulse BETWEEN 1 AND 300), measured_at timestamptz NOT NULL,
 source varchar(30) NOT NULL CHECK(source IN('MANUAL','PROFESSIONAL','PRINTED_DIARY','OCR_CONFIRMED')),
 ocr_document_id uuid, created_at timestamptz NOT NULL DEFAULT now(), synced_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reading_patient_time ON blood_pressure_reading(patient_id,measured_at DESC,id);
CREATE TABLE medication_plan (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), author_id uuid NOT NULL REFERENCES user_account(id),
 name varchar(160) NOT NULL, instruction varchar(1000) NOT NULL, starts_on date NOT NULL, ends_on date,
 time_zone varchar(80) NOT NULL, version integer NOT NULL DEFAULT 1, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_on IS NULL OR ends_on>=starts_on)
);
CREATE TABLE medication_schedule (
 plan_id uuid NOT NULL REFERENCES medication_plan(id), local_time time NOT NULL, PRIMARY KEY(plan_id,local_time)
);
CREATE TABLE medication_plan_history (
 id uuid PRIMARY KEY, plan_id uuid NOT NULL REFERENCES medication_plan(id), version integer NOT NULL,
 snapshot jsonb NOT NULL, changed_by uuid NOT NULL REFERENCES user_account(id), changed_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(plan_id,version)
);
CREATE TABLE medication_self_report (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), plan_id uuid NOT NULL REFERENCES medication_plan(id),
 author_id uuid NOT NULL REFERENCES user_account(id), scheduled_at timestamptz NOT NULL, reported_at timestamptz NOT NULL,
 status varchar(20) NOT NULL CHECK(status IN('TAKEN','NOT_TAKEN')),
 source varchar(40) NOT NULL CHECK(source IN('SELF_REPORT','PROFESSIONAL_TRANSCRIPTION')),
 created_at timestamptz NOT NULL DEFAULT now(), synced_at timestamptz NOT NULL DEFAULT now(), UNIQUE(plan_id,scheduled_at)
);
CREATE INDEX report_patient_time ON medication_self_report(patient_id,scheduled_at DESC);
CREATE TABLE physical_activity_profile (
 patient_id uuid PRIMARY KEY REFERENCES patient(id), mobility varchar(300) NOT NULL, balance varchar(300) NOT NULL,
 restrictions varchar(2000) NOT NULL, professional_guidance varchar(2000) NOT NULL,
 author_id uuid NOT NULL REFERENCES user_account(id), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE activity_record (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), author_id uuid NOT NULL REFERENCES user_account(id),
 type varchar(160) NOT NULL, duration_minutes integer NOT NULL CHECK(duration_minutes BETWEEN 1 AND 1440),
 occurred_at timestamptz NOT NULL, notes varchar(2000) NOT NULL DEFAULT '',
 feeling varchar(20) NOT NULL CHECK(feeling IN('WELL','TIRED','UNWELL')),
 created_at timestamptz NOT NULL DEFAULT now(), synced_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_patient_time ON activity_record(patient_id,occurred_at DESC,id);
CREATE TABLE printed_diary_entry (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), author_id uuid NOT NULL REFERENCES user_account(id),
 occurred_at timestamptz NOT NULL, systolic integer, diastolic integer, pulse integer,
 medication_report varchar(2000) NOT NULL DEFAULT '', notes varchar(2000) NOT NULL DEFAULT '',
 source varchar(30) NOT NULL DEFAULT 'PRINTED_DIARY' CHECK(source='PRINTED_DIARY'), created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((systolic IS NULL AND diastolic IS NULL) OR (systolic BETWEEN 1 AND 400 AND diastolic BETWEEN 1 AND 400)),
 CHECK(pulse IS NULL OR pulse BETWEEN 1 AND 300)
);
CREATE TABLE consultation (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), author_id uuid NOT NULL REFERENCES user_account(id),
 occurred_at timestamptz NOT NULL, notes varchar(4000) NOT NULL, goals varchar(2000) NOT NULL, care_plan varchar(4000) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE device (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL UNIQUE REFERENCES patient(id), author_id uuid NOT NULL REFERENCES user_account(id),
 label varchar(160) NOT NULL, serial_number varchar(160), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE device_configuration (
 id uuid PRIMARY KEY, device_id uuid NOT NULL REFERENCES device(id), schedules jsonb NOT NULL,
 status varchar(30) NOT NULL CHECK(status IN('NOT_CONFIGURED','PENDING','SYNCED','FAILED','UNSUPPORTED')),
 simulated boolean NOT NULL, adapter varchar(20) NOT NULL, message varchar(500) NOT NULL,
 author_id uuid NOT NULL REFERENCES user_account(id), created_at timestamptz NOT NULL DEFAULT now()
);
