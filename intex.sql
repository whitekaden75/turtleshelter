-- Clear existing tables if they exist
DROP TABLE IF EXISTS public."Admin" CASCADE;
DROP TABLE IF EXISTS public."Contact" CASCADE;
DROP TABLE IF EXISTS public."Event" CASCADE;
DROP TABLE IF EXISTS public."EventType" CASCADE;
DROP TABLE IF EXISTS public."ReferralSource" CASCADE;
DROP TABLE IF EXISTS public."UserType" CASCADE;

-- Clear existing sequences if they exist
DROP SEQUENCE IF EXISTS public."Admin_admin_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Contact_contact_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Event_event_id_seq" CASCADE;

-- Create sequences
CREATE SEQUENCE public."Admin_admin_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."Contact_contact_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."Event_event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create tables
CREATE TABLE public."Admin"
(
    admin_id integer NOT NULL DEFAULT nextval('"Admin_admin_id_seq"'::regclass),
    username character varying(50) COLLATE pg_catalog."default",
    password character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT "Admin_pkey" PRIMARY KEY (admin_id)
);

CREATE TABLE public."Contact"
(
    contact_id integer NOT NULL DEFAULT nextval('"Contact_contact_id_seq"'::regclass),
    first_name character varying(50) COLLATE pg_catalog."default",
    last_name character varying(50) COLLATE pg_catalog."default",
    email character varying(50) COLLATE pg_catalog."default",
    phone character varying(20) COLLATE pg_catalog."default",
    CONSTRAINT "Contact_pkey" PRIMARY KEY (contact_id)
);

CREATE TABLE public."Event"
(
    event_id integer NOT NULL DEFAULT nextval('"Event_event_id_seq"'::regclass),
    event_type_id integer NOT NULL,
    referral_source_id integer,
    contact_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY (event_id),
    CONSTRAINT "Event_event_type_id_fkey" FOREIGN KEY (event_type_id)
        REFERENCES public."EventType" (event_type_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Event_referral_source_id_fkey" FOREIGN KEY (referral_source_id)
        REFERENCES public."ReferralSource" (referral_source_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "Event_contact_id_fkey" FOREIGN KEY (contact_id)
        REFERENCES public."Contact" (contact_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE public."EventType"
(
    event_type_id integer NOT NULL,
    event_name character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT "EventType_pkey" PRIMARY KEY (event_type_id)
);

CREATE TABLE public."ReferralSource"
(
    referral_source_id integer NOT NULL,
    source_name character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT "ReferralSource_pkey" PRIMARY KEY (referral_source_id)
);

CREATE TABLE public."UserType"
(
    user_type_id integer NOT NULL,
    type_name character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT "UserType_pkey" PRIMARY KEY (user_type_id)
);

-- Set sequence values
SELECT pg_catalog.setval('"Admin_admin_id_seq"', 1, true);
SELECT pg_catalog.setval('"Contact_contact_id_seq"', 1, true);
SELECT pg_catalog.setval('"Event_event_id_seq"', 1, true);

-- Insert sample data
INSERT INTO public."EventType" (event_type_id, event_name) VALUES
(1, 'Webinar'),
(2, 'Workshop'),
(3, 'Conference');

INSERT INTO public."ReferralSource" (referral_source_id, source_name) VALUES
(1, 'Website'),
(2, 'Referral'),
(3, 'Advertisement');

INSERT INTO public."UserType" (user_type_id, type_name) VALUES
(1, 'Admin'),
(2, 'User'),
(3, 'Guest');
