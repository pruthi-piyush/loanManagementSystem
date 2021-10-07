
BEGIN;

-- Tables included in this schema are meant for reference purposes
CREATE SCHEMA IF NOT EXISTS ref_schema;

-- For user related tables
CREATE SCHEMA IF NOT EXISTS user_schema;  

-- For some unknown stuff
CREATE SCHEMA IF NOT EXISTS lms_schema;  


-------------------------------------------------------------------------------
--------------------------- CREATE REFERENCE TABLES
-------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ref_schema.loan_application_statuses
(
    id smallint NOT NULL UNIQUE, -- can be primary key?
    description character varying(40)
);

CREATE TABLE IF NOT EXISTS ref_schema.user_roles
(
    id smallint NOT NULL UNIQUE, -- can be primary key?
    description character varying(40)
);

-------------------------------------------------------------------------------
-------------------------- Insert values in reference tables
-------------------------------------------------------------------------------

INSERT INTO ref_schema.user_roles
( id, description )
VALUES
( 0, 'INVALID' ),
( 1, 'ADMIN' ),
( 2, 'AGENT' ),
( 3, 'CUSTOMER' );


INSERT INTO ref_schema.loan_application_statuses
( id, description )
VALUES
( 0, 'INVALID' ),
( 1, 'NEW' ),
( 2, 'APPROVED' ),
( 3, 'REJECTED' );

-------------------------------------------------------------------------------
-------------------------- Create user schema tables
-------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_schema.user_account
(   user_id integer PRIMARY KEY,
    login_id character varying(256) NOT NULL UNIQUE,
    password character varying(64) NOT NULL,
    salt character varying(64) NOT NULL
);

CREATE SEQUENCE user_schema.user_account_seq_userid
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE user_schema.user_account_seq_userid 
OWNED BY user_schema.user_account.user_id;

CREATE TABLE IF NOT EXISTS user_schema.user_basic_details 
(
  uid integer NOT NULL,
  first_name character varying(50) NOT NULL,
  last_name character varying(50) ,
  phone_number character varying(20) DEFAULT '' NOT NULL,
  email character varying(254) DEFAULT '' NOT NULL
);

CREATE TABLE IF NOT EXISTS user_schema.user_current_role
(   user_id integer,
    user_role smallint DEFAULT 0,
    created_at bigint NOT NULL,
    updated_at bigint NOT NULL,
    FOREIGN KEY(user_id) 
        REFERENCES user_schema.user_account(user_id),
    FOREIGN KEY(user_role) 
        REFERENCES ref_schema.user_roles(id)
);

CREATE TABLE IF NOT EXISTS user_schema.user_role_history
(   user_id integer,
    user_role smallint,
    timestamp bigint
);


CREATE TABLE IF NOT EXISTS lms_schema.loan_applications
(   
    reference_id character varying(64) PRIMARY KEY,
    sequence_id smallint NOT NULL DEFAULT 1, 
    customer_id integer,
    agent_id integer,
    application_status smallint NOT NULL DEFAULT 0,
    amount bigint NOT NULL,
    roi smallint NOT NULL,
    tenure smallint NOT NULL,
    created_at  bigint NOT NULL,
    updated_at bigint NOT NULL,
    approved_at bigint,
    remarks character varying(512),
    FOREIGN KEY(application_status) 
        REFERENCES ref_schema.loan_application_statuses(id),
    FOREIGN KEY(customer_id) 
        REFERENCES user_schema.user_account(user_id),
    FOREIGN KEY(agent_id)
        REFERENCES user_schema.user_account(user_id)
);

CREATE TABLE IF NOT EXISTS lms_schema.loan_applications_history
(   
    reference_id character varying(64),
    sequence_id smallint, 
    customer_id integer,
    agent_id integer,
    application_status smallint,
    amount bigint,
    roi smallint,
    tenure smallint,
    timestamp  bigint,
    remarks character varying(512)
);


CREATE TABLE IF NOT EXISTS lms_schema.loan_payments
(   
    reference_id character varying(64),
    amount_paid bigint NOT NULL,
    timestamp bigint NOT NULL,
    FOREIGN KEY(reference_id)
        REFERENCES lms_schema.loan_applications(reference_id)
);

COMMIT;

BEGIN;

-- inserting admin account
INSERT INTO user_schema.user_account 
VALUES
(
 1130506200, 1130506200, '20ca70d58da380a150b1f4cdba60960e919df2c83d05abd502dd3617a963f526',  'fababcd47c87a207fc534e39f5de34fe4d9fa07f165fe9c94140f64910f639b1'
);

INSERT INTO user_schema.user_basic_details
VALUES
(
  1130506200, 'Red', 'Carpet', 1130506200, 'help@redcarpet.cash'
);

INSERT INTO user_schema.user_current_role 
VALUES
(
  1130506200, 1, 1551687857624, 1551687857624
);


COMMIT;
