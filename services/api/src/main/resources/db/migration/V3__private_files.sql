CREATE TABLE file_object (
 id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patient(id), author_id uuid NOT NULL REFERENCES user_account(id),
 object_key varchar(180) NOT NULL UNIQUE, mime_type varchar(40) NOT NULL CHECK(mime_type='image/png'),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 2097152), sha256 char(64) NOT NULL,
 purpose varchar(20) NOT NULL CHECK(purpose IN('MEAL','PRESSURE_DISPLAY')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX file_patient_time ON file_object(patient_id,created_at DESC);
CREATE TABLE file_download_grant (
 token_hash char(64) PRIMARY KEY,file_id uuid NOT NULL REFERENCES file_object(id),
 session_id uuid NOT NULL REFERENCES auth_session(id),expires_at timestamptz NOT NULL
);
CREATE TABLE pressure_ocr_document (
 id uuid PRIMARY KEY,patient_id uuid NOT NULL REFERENCES patient(id),file_id uuid NOT NULL REFERENCES file_object(id),
 status varchar(30) NOT NULL CHECK(status IN('RECOGNIZED','UNREADABLE','UNAVAILABLE')),
 systolic integer,diastolic integer,pulse integer,confidence real,created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE blood_pressure_reading ADD CONSTRAINT reading_ocr_document_fk FOREIGN KEY(ocr_document_id) REFERENCES pressure_ocr_document(id);
CREATE TABLE meal_photo (
 id uuid PRIMARY KEY,patient_id uuid NOT NULL REFERENCES patient(id),file_id uuid NOT NULL UNIQUE REFERENCES file_object(id),
 author_id uuid NOT NULL REFERENCES user_account(id),occurred_at timestamptz NOT NULL,notes varchar(2000) NOT NULL DEFAULT '',
 analysis_status varchar(50) NOT NULL DEFAULT 'UNAVAILABLE',assessment jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meal_patient_time ON meal_photo(patient_id,occurred_at DESC,id);
