-- Drop tables if they exist
DROP TABLE IF EXISTS public."Admin" CASCADE;
DROP TABLE IF EXISTS public."Contact" CASCADE;
DROP TABLE IF EXISTS public."EventRequests" CASCADE;
DROP TABLE IF EXISTS public."EventType" CASCADE;
DROP TABLE IF EXISTS public."Events" CASCADE;
DROP TABLE IF EXISTS public."ReferralSource" CASCADE;
DROP TABLE IF EXISTS public."SewingLevel" CASCADE;
DROP TABLE IF EXISTS public."Status" CASCADE;
DROP TABLE IF EXISTS public."UserType" CASCADE;
DROP TABLE IF EXISTS public."Volunteer" CASCADE;
DROP TABLE IF EXISTS public."VolunteerEvents" CASCADE;

-- Create tables
CREATE TABLE public."Admin" (
    "AdminID" integer NOT NULL,
    "Username" character varying(30) NOT NULL,
    "Password" character varying(30) NOT NULL,
    "UserTypeID" integer NOT NULL
);

CREATE SEQUENCE public."Admin_AdminID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."Admin" ALTER COLUMN "AdminID" SET DEFAULT nextval('public."Admin_AdminID_seq"');

CREATE TABLE public."Contact" (
    "EventContactID" integer NOT NULL,
    "ContactPhone" character varying(10),
    "ContactFirstName" character varying(30),
    "ContactLastName" character varying(30)
    "ContactEmail
);

CREATE SEQUENCE public."Contact_EventContactID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."Contact" ALTER COLUMN "EventContactID" SET DEFAULT nextval('public."Contact_EventContactID_seq"');

CREATE TABLE public."EventRequests" (
    "EventID" integer NOT NULL,
    "EventDate" character varying(100),
    "EventAddress" character varying(100),
    "EventCity" character varying(30),
    "EventState" character varying(30),
    "StartTime" timestamp without time zone,
    "Duration" character varying(10),
    "ContactFirstName" character varying(30),
    "ContactLastName" character varying(30),
    "EventType" character varying(15),
    "JenStory" boolean,
    "Participants" integer
);

CREATE SEQUENCE public."EventRequests_EventID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."EventRequests" ALTER COLUMN "EventID" SET DEFAULT nextval('public."EventRequests_EventID_seq"');

CREATE TABLE public."EventType" (
    "TypeID" integer NOT NULL,
    "EventType" character varying NOT NULL
);

CREATE SEQUENCE public."EventType_TypeID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."EventType" ALTER COLUMN "TypeID" SET DEFAULT nextval('public."EventType_TypeID_seq"');

CREATE TABLE public."Events" (
    "EventID" integer NOT NULL,
    "StatusID" integer,
    "EventDate" date,
    "EventAddress" character varying(100),
    "EventCity" character varying(30),
    "EventState" character varying(30),
    "StartTime" timestamp without time zone,
    "Duration" character varying(10),
    "EventContactID" integer,
    "EventType" character varying(15),
    "JenStory" boolean,
    "Participants" integer,
    "Pockets" integer,
    "Vests" integer,
    "Collars" integer,
    "Envelopes" integer
);

CREATE SEQUENCE public."Events_EventID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."Events" ALTER COLUMN "EventID" SET DEFAULT nextval('public."Events_EventID_seq"');

CREATE TABLE public."ReferralSource" (
    "ReferralSourceID" integer NOT NULL,
    "ReferralSourceType" character varying(21)
);

CREATE SEQUENCE public."ReferralSource_ReferralSourceID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."ReferralSource" ALTER COLUMN "ReferralSourceID" SET DEFAULT nextval('public."ReferralSource_ReferralSourceID_seq"');

CREATE TABLE public."SewingLevel" (
    "SewingID" integer NOT NULL,
    "SewingLevel" character varying(12)
);

CREATE SEQUENCE public."SewingLevel_SewingID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."SewingLevel" ALTER COLUMN "SewingID" SET DEFAULT nextval('public."SewingLevel_SewingID_seq"');

CREATE TABLE public."Status" (
    "StatusID" integer NOT NULL,
    "EventStatus" character varying(10)
);

CREATE SEQUENCE public."Status_StatusID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."Status" ALTER COLUMN "StatusID" SET DEFAULT nextval('public."Status_StatusID_seq"');

CREATE TABLE public."UserType" (
    "UserTypeID" integer NOT NULL,
    "UserType" character varying(15) NOT NULL
);

CREATE SEQUENCE public."UserType_UserTypeID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."UserType" ALTER COLUMN "UserTypeID" SET DEFAULT nextval('public."UserType_UserTypeID_seq"');

CREATE TABLE public."Volunteer" (
    "VolunteerID" integer NOT NULL,
    "VolFirstName" character varying(30),
    "VolLastName" character varying(30),
    "VolEmail" character varying(40),
    "VolPhone" character varying(30),
    "HoursAvailable" integer,
    "SewingID" integer,
    "ReferralSourceID" integer
);

CREATE SEQUENCE public."Volunteer_VolunteerID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."Volunteer" ALTER COLUMN "VolunteerID" SET DEFAULT nextval('public."Volunteer_VolunteerID_seq"');

CREATE TABLE public."VolunteerEvents" (
    "EventID" integer NOT NULL,
    "VolunteerID" integer NOT NULL
);

CREATE SEQUENCE public."VolunteerEvents_EventID_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public."VolunteerEvents" ALTER COLUMN "EventID" SET DEFAULT nextval('public."VolunteerEvents_EventID_seq"');
