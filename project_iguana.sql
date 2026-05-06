--
-- PostgreSQL database dump
--

\restrict txhQOXAFJKJBEHou4e9zNW5QmrYJEkqna1diaTnqoMAfQQBZWR9YzFmRtycCbXQ

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-05-06 18:51:13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1082 (class 1247 OID 43506)
-- Name: maintenance_domain; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenance_domain AS ENUM (
    'it',
    'network'
);


ALTER TYPE public.maintenance_domain OWNER TO postgres;

--
-- TOC entry 1085 (class 1247 OID 43512)
-- Name: movement_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.movement_status AS ENUM (
    'pending',
    'rejected',
    'accepted'
);


ALTER TYPE public.movement_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 43519)
-- Name: acceptance_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acceptance_report (
    acceptance_report_id integer NOT NULL,
    delivery_note_id integer NOT NULL,
    acceptance_report_datetime timestamp without time zone,
    is_signed_by_director_of_administration_and_support boolean,
    is_signed_by_protection_and_security_bureau_chief boolean,
    is_signed_by_information_technilogy_bureau_chief boolean,
    acceptance_report_is_stock_item_and_consumable_responsible boolean,
    is_signed_by_school_headquarter boolean,
    digital_copy text
);


ALTER TABLE public.acceptance_report OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 43526)
-- Name: administrative_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrative_certificate (
    administrative_certificate_id integer CONSTRAINT administrative_certificate_administrative_certificate__not_null NOT NULL,
    warehouse_id integer NOT NULL,
    attribution_order_id integer NOT NULL,
    receipt_report_id integer NOT NULL,
    interested_organization character varying(60),
    operation character varying(20),
    format character varying(8),
    is_signed_by_warehouse_storage_magaziner boolean,
    is_signed_by_warehouse_storage_accountant boolean,
    is_signed_by_warehouse_storage_marketer boolean,
    is_signed_by_warehouse_it_chief boolean,
    is_signed_by_warehouse_leader boolean,
    digital_copy text,
    are_items_moved boolean DEFAULT false NOT NULL
);


ALTER TABLE public.administrative_certificate OWNER TO postgres;

--
-- TOC entry 6936 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN administrative_certificate.operation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.operation IS 'Action" can be "entry", "exit" or "transfer';


--
-- TOC entry 6937 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN administrative_certificate.format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.format IS 'Among the formats is "21x27"';


--
-- TOC entry 423 (class 1259 OID 46260)
-- Name: administrative_certificate_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrative_certificate_translation (
    id integer NOT NULL,
    administrative_certificate_id integer CONSTRAINT administrative_certificate__administrative_certificate_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    interested_organization character varying(60),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT administrative_certificate_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.administrative_certificate_translation OWNER TO postgres;

--
-- TOC entry 422 (class 1259 OID 46259)
-- Name: administrative_certificate_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administrative_certificate_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administrative_certificate_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6938 (class 0 OID 0)
-- Dependencies: 422
-- Name: administrative_certificate_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administrative_certificate_translation_id_seq OWNED BY public.administrative_certificate_translation.id;


--
-- TOC entry 221 (class 1259 OID 43537)
-- Name: asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset (
    asset_id integer NOT NULL,
    asset_model_id integer,
    attribution_order_id integer,
    destruction_certificate_id integer,
    asset_serial_number character varying(48),
    asset_fabrication_datetime timestamp without time zone,
    asset_inventory_number character varying(6),
    asset_service_tag character varying(24),
    asset_name character varying(48),
    asset_name_in_the_administrative_certificate character varying(48),
    asset_arrival_datetime timestamp without time zone,
    asset_status character varying(30)
);


ALTER TABLE public.asset OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 43542)
-- Name: asset_attribute_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_attribute_definition (
    asset_attribute_definition_id integer CONSTRAINT asset_attribute_definition_asset_attribute_definition__not_null NOT NULL,
    data_type character varying(18),
    unit character varying(24),
    description character varying(256),
    maintenance_domain character varying(24)
);


ALTER TABLE public.asset_attribute_definition OWNER TO postgres;

--
-- TOC entry 371 (class 1259 OID 45690)
-- Name: asset_attribute_definition_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_attribute_definition_translation (
    id integer NOT NULL,
    asset_attribute_definition_id integer CONSTRAINT asset_attribute_definition__asset_attribute_definition_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    description character varying(256) NOT NULL,
    unit character varying(24),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT asset_attribute_definition_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_attribute_definition_translation OWNER TO postgres;

--
-- TOC entry 370 (class 1259 OID 45689)
-- Name: asset_attribute_definition_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_attribute_definition_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_attribute_definition_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6939 (class 0 OID 0)
-- Dependencies: 370
-- Name: asset_attribute_definition_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_attribute_definition_translation_id_seq OWNED BY public.asset_attribute_definition_translation.id;


--
-- TOC entry 223 (class 1259 OID 43546)
-- Name: asset_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_attribute_value (
    asset_attribute_definition_id integer NOT NULL,
    asset_id integer NOT NULL,
    value_string character varying(1024),
    value_bool boolean,
    value_date date,
    value_number numeric(18,6)
);


ALTER TABLE public.asset_attribute_value OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 43553)
-- Name: asset_brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_brand (
    asset_brand_id integer NOT NULL,
    brand_name character varying(48),
    brand_code character varying(16),
    is_active boolean,
    brand_photo character varying(255)
);


ALTER TABLE public.asset_brand OWNER TO postgres;

--
-- TOC entry 431 (class 1259 OID 46524)
-- Name: asset_brand_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_brand_translation (
    id integer NOT NULL,
    asset_brand_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    brand_name character varying(48) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT asset_brand_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_brand_translation OWNER TO postgres;

--
-- TOC entry 430 (class 1259 OID 46523)
-- Name: asset_brand_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_brand_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_brand_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6940 (class 0 OID 0)
-- Dependencies: 430
-- Name: asset_brand_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_brand_translation_id_seq OWNED BY public.asset_brand_translation.id;


--
-- TOC entry 225 (class 1259 OID 43557)
-- Name: asset_condition_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_condition_history (
    asset_condition_history_id integer NOT NULL,
    asset_id integer NOT NULL,
    condition_id integer NOT NULL,
    notes character varying(256),
    cosmetic_issues character varying(128),
    functional_issues character varying(128),
    recommendation character varying(24),
    created_at timestamp without time zone
);


ALTER TABLE public.asset_condition_history OWNER TO postgres;

--
-- TOC entry 405 (class 1259 OID 46065)
-- Name: asset_condition_history_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_condition_history_translation (
    id integer NOT NULL,
    asset_condition_history_id integer CONSTRAINT asset_condition_history_tra_asset_condition_history_id_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    notes character varying(256),
    cosmetic_issues character varying(128),
    functional_issues character varying(128),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT asset_condition_history_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_condition_history_translation OWNER TO postgres;

--
-- TOC entry 404 (class 1259 OID 46064)
-- Name: asset_condition_history_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_condition_history_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_condition_history_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6941 (class 0 OID 0)
-- Dependencies: 404
-- Name: asset_condition_history_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_condition_history_translation_id_seq OWNED BY public.asset_condition_history_translation.id;


--
-- TOC entry 226 (class 1259 OID 43565)
-- Name: asset_destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_destruction_certificate (
    asset_destruction_certificate_id integer CONSTRAINT asset_destruction_certifica_asset_destruction_certific_not_null NOT NULL,
    digital_copy text,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.asset_destruction_certificate OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 43571)
-- Name: asset_destruction_certificate_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_destruction_certificate_asset (
    id integer NOT NULL,
    asset_destruction_certificate_id integer CONSTRAINT asset_destruction_certific_asset_destruction_certific_not_null1 NOT NULL,
    asset_id integer NOT NULL,
    external_maintenance_id integer CONSTRAINT asset_destruction_certificate__external_maintenance_id_not_null NOT NULL
);


ALTER TABLE public.asset_destruction_certificate_asset OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 43578)
-- Name: asset_destruction_certificate_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_destruction_certificate_asset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_destruction_certificate_asset_id_seq OWNER TO postgres;

--
-- TOC entry 6942 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_destruction_certificate_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_destruction_certificate_asset_id_seq OWNED BY public.asset_destruction_certificate_asset.id;


--
-- TOC entry 229 (class 1259 OID 43579)
-- Name: asset_failed_external_maintenance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_failed_external_maintenance (
    asset_id integer NOT NULL,
    external_maintenance_id integer CONSTRAINT asset_failed_external_maintena_external_maintenance_id_not_null NOT NULL,
    failed_datetime timestamp without time zone
);


ALTER TABLE public.asset_failed_external_maintenance OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 43584)
-- Name: asset_incident_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_incident_report (
    asset_incident_report_id integer NOT NULL,
    asset_id integer NOT NULL,
    owner_person_id integer NOT NULL,
    school_headquarter_person_id integer,
    reason character varying(32) NOT NULL,
    owner_note text,
    digital_copy text,
    is_signed_by_owner boolean DEFAULT false NOT NULL,
    is_signed_by_it_bureau_chief boolean DEFAULT false NOT NULL,
    is_signed_by_exploitation_chief boolean DEFAULT false NOT NULL,
    is_signed_by_protection_and_security_bureau_chief boolean DEFAULT false CONSTRAINT asset_incident_report_is_signed_by_protection_and_secu_not_null NOT NULL,
    is_signed_by_school_headquarter boolean DEFAULT false NOT NULL,
    it_bureau_chief_note text,
    exploitation_chief_note text,
    protection_and_security_bureau_chief_note text,
    school_headquarter_note text,
    report_datetime timestamp without time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    maintenance_id integer,
    CONSTRAINT chk_asset_incident_report_reason CHECK (((reason)::text = ANY (ARRAY['stolen'::text, 'lost'::text, 'irrecoverably_damaged'::text]))),
    CONSTRAINT chk_asset_incident_report_status CHECK (((status)::text = ANY (ARRAY['draft'::text, 'submitted'::text, 'validated'::text, 'rejected'::text])))
);


ALTER TABLE public.asset_incident_report OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 43609)
-- Name: asset_incident_report_asset_incident_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asset_incident_report ALTER COLUMN asset_incident_report_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.asset_incident_report_asset_incident_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 43610)
-- Name: asset_incident_report_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_incident_report_consumable (
    id integer NOT NULL,
    asset_incident_report_id integer CONSTRAINT asset_incident_report_consuma_asset_incident_report_id_not_null NOT NULL,
    consumable_id integer NOT NULL
);


ALTER TABLE public.asset_incident_report_consumable OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 43616)
-- Name: asset_incident_report_consumable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asset_incident_report_consumable ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.asset_incident_report_consumable_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 43617)
-- Name: asset_incident_report_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_incident_report_stock_item (
    id integer NOT NULL,
    asset_incident_report_id integer CONSTRAINT asset_incident_report_stock_i_asset_incident_report_id_not_null NOT NULL,
    stock_item_id integer NOT NULL
);


ALTER TABLE public.asset_incident_report_stock_item OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 43623)
-- Name: asset_incident_report_stock_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asset_incident_report_stock_item ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.asset_incident_report_stock_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 437 (class 1259 OID 46985)
-- Name: asset_incident_report_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_incident_report_translation (
    id integer NOT NULL,
    asset_incident_report_id integer CONSTRAINT asset_incident_report_transla_asset_incident_report_id_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    reason character varying(32),
    status character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT asset_incident_report_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_incident_report_translation OWNER TO postgres;

--
-- TOC entry 436 (class 1259 OID 46984)
-- Name: asset_incident_report_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_incident_report_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_incident_report_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6943 (class 0 OID 0)
-- Dependencies: 436
-- Name: asset_incident_report_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_incident_report_translation_id_seq OWNED BY public.asset_incident_report_translation.id;


--
-- TOC entry 445 (class 1259 OID 47548)
-- Name: asset_is_assigned_to_org_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_is_assigned_to_org_structure (
    assignment_id integer NOT NULL,
    organizational_structure_id integer CONSTRAINT asset_is_assigned_to_org_st_organizational_structure_i_not_null NOT NULL,
    asset_id integer NOT NULL,
    assigned_by_person_id integer CONSTRAINT asset_is_assigned_to_org_structu_assigned_by_person_id_not_null NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.asset_is_assigned_to_org_structure OWNER TO postgres;

--
-- TOC entry 444 (class 1259 OID 47547)
-- Name: asset_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_is_assigned_to_org_structure_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_is_assigned_to_org_structure_assignment_id_seq OWNER TO postgres;

--
-- TOC entry 6944 (class 0 OID 0)
-- Dependencies: 444
-- Name: asset_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_assigned_to_org_structure_assignment_id_seq OWNED BY public.asset_is_assigned_to_org_structure.assignment_id;


--
-- TOC entry 236 (class 1259 OID 43624)
-- Name: asset_is_assigned_to_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_is_assigned_to_person (
    person_id integer NOT NULL,
    asset_id integer NOT NULL,
    assigned_by_person_id integer NOT NULL,
    assignment_id integer NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    is_active boolean NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.asset_is_assigned_to_person OWNER TO postgres;

--
-- TOC entry 6945 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE asset_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_is_assigned_to_person IS 'The first person is the one to whom the asset is assigned, a';


--
-- TOC entry 237 (class 1259 OID 43634)
-- Name: asset_is_composed_of_consumable_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_is_composed_of_consumable_history (
    consumable_id integer NOT NULL,
    asset_id integer NOT NULL,
    maintenance_step_id integer,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    id integer NOT NULL,
    attribution_order_id integer
);


ALTER TABLE public.asset_is_composed_of_consumable_history OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 43640)
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_is_composed_of_consumable_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_is_composed_of_consumable_history_id_seq OWNER TO postgres;

--
-- TOC entry 6946 (class 0 OID 0)
-- Dependencies: 238
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_consumable_history_id_seq OWNED BY public.asset_is_composed_of_consumable_history.id;


--
-- TOC entry 239 (class 1259 OID 43641)
-- Name: asset_is_composed_of_stock_item_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_is_composed_of_stock_item_history (
    stock_item_id integer CONSTRAINT asset_is_composed_of_stock_items_history_stock_item_id_not_null NOT NULL,
    asset_id integer CONSTRAINT asset_is_composed_of_stock_items_history_asset_id_not_null NOT NULL,
    maintenance_step_id integer,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    id integer NOT NULL,
    attribution_order_id integer
);


ALTER TABLE public.asset_is_composed_of_stock_item_history OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 43647)
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_is_composed_of_stock_item_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_is_composed_of_stock_item_history_id_seq OWNER TO postgres;

--
-- TOC entry 6947 (class 0 OID 0)
-- Dependencies: 240
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_stock_item_history_id_seq OWNED BY public.asset_is_composed_of_stock_item_history.id;


--
-- TOC entry 241 (class 1259 OID 43648)
-- Name: asset_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_model (
    asset_model_id integer NOT NULL,
    asset_brand_id integer NOT NULL,
    asset_type_id integer NOT NULL,
    model_name character varying(48),
    model_code character varying(16),
    release_year integer,
    discontinued_year integer,
    is_active boolean,
    notes character varying(256),
    warranty_expiry_in_months integer,
    asset_model_name_in_administrative_certificate character varying(48)
);


ALTER TABLE public.asset_model OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 43654)
-- Name: asset_model_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_model_attribute_value (
    asset_model_id integer NOT NULL,
    asset_attribute_definition_id integer CONSTRAINT asset_model_attribute_value_asset_attribute_definition_not_null NOT NULL,
    value_bool boolean,
    value_string character varying(1024),
    value_number numeric(18,6),
    value_date date
);


ALTER TABLE public.asset_model_attribute_value OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 43661)
-- Name: asset_model_default_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_model_default_consumable (
    id integer NOT NULL,
    asset_model_id integer NOT NULL,
    consumable_model_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    notes character varying(256)
);


ALTER TABLE public.asset_model_default_consumable OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 43669)
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_model_default_consumable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_model_default_consumable_id_seq OWNER TO postgres;

--
-- TOC entry 6948 (class 0 OID 0)
-- Dependencies: 244
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_consumable_id_seq OWNED BY public.asset_model_default_consumable.id;


--
-- TOC entry 245 (class 1259 OID 43670)
-- Name: asset_model_default_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_model_default_stock_item (
    id integer NOT NULL,
    asset_model_id integer NOT NULL,
    stock_item_model_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    notes character varying(256)
);


ALTER TABLE public.asset_model_default_stock_item OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 43678)
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_model_default_stock_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_model_default_stock_item_id_seq OWNER TO postgres;

--
-- TOC entry 6949 (class 0 OID 0)
-- Dependencies: 246
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_stock_item_id_seq OWNED BY public.asset_model_default_stock_item.id;


--
-- TOC entry 417 (class 1259 OID 46197)
-- Name: asset_model_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_model_translation (
    id integer NOT NULL,
    asset_model_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    model_name character varying(48),
    notes character varying(256),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    asset_model_name_in_administrative_certificate character varying(48),
    CONSTRAINT asset_model_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_model_translation OWNER TO postgres;

--
-- TOC entry 416 (class 1259 OID 46196)
-- Name: asset_model_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_model_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_model_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6950 (class 0 OID 0)
-- Dependencies: 416
-- Name: asset_model_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_translation_id_seq OWNED BY public.asset_model_translation.id;


--
-- TOC entry 247 (class 1259 OID 43679)
-- Name: asset_movement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_movement (
    asset_movement_id integer NOT NULL,
    asset_id integer NOT NULL,
    source_location_id integer CONSTRAINT asset_movement_source_room_id_not_null NOT NULL,
    destination_location_id integer CONSTRAINT asset_movement_destination_room_id_not_null NOT NULL,
    maintenance_step_id integer,
    external_maintenance_step_id integer,
    movement_reason character varying(128) NOT NULL,
    movement_datetime timestamp without time zone NOT NULL,
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL,
    maintenance_id integer
);


ALTER TABLE public.asset_movement OWNER TO postgres;

--
-- TOC entry 391 (class 1259 OID 45911)
-- Name: asset_movement_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_movement_translation (
    id integer NOT NULL,
    asset_movement_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    movement_reason character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT asset_movement_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_movement_translation OWNER TO postgres;

--
-- TOC entry 390 (class 1259 OID 45910)
-- Name: asset_movement_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_movement_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_movement_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6951 (class 0 OID 0)
-- Dependencies: 390
-- Name: asset_movement_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_movement_translation_id_seq OWNED BY public.asset_movement_translation.id;


--
-- TOC entry 411 (class 1259 OID 46134)
-- Name: asset_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_translation (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    asset_name character varying(48),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    asset_status character varying(60),
    CONSTRAINT asset_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_translation OWNER TO postgres;

--
-- TOC entry 410 (class 1259 OID 46133)
-- Name: asset_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6952 (class 0 OID 0)
-- Dependencies: 410
-- Name: asset_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_translation_id_seq OWNED BY public.asset_translation.id;


--
-- TOC entry 248 (class 1259 OID 43690)
-- Name: asset_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_type (
    asset_type_id integer NOT NULL,
    asset_type_label character varying(60),
    asset_type_code character varying(18),
    photo character varying(512)
);


ALTER TABLE public.asset_type OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 43696)
-- Name: asset_type_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_type_attribute (
    asset_attribute_definition_id integer NOT NULL,
    asset_type_id integer NOT NULL,
    is_mandatory boolean,
    default_value character varying(255)
);


ALTER TABLE public.asset_type_attribute OWNER TO postgres;

--
-- TOC entry 355 (class 1259 OID 45514)
-- Name: asset_type_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_type_translation (
    id integer NOT NULL,
    asset_type_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    asset_type_label character varying(60) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT asset_type_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.asset_type_translation OWNER TO postgres;

--
-- TOC entry 354 (class 1259 OID 45513)
-- Name: asset_type_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_type_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_type_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6953 (class 0 OID 0)
-- Dependencies: 354
-- Name: asset_type_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_type_translation_id_seq OWNED BY public.asset_type_translation.id;


--
-- TOC entry 250 (class 1259 OID 43701)
-- Name: attribution_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribution_order (
    attribution_order_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    attribution_order_full_code character varying(48),
    attribution_order_date date,
    is_signed_by_central_chief boolean,
    attribution_order_barcode character varying(24)
);


ALTER TABLE public.attribution_order OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 43706)
-- Name: attribution_order_asset_consumable_accessory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribution_order_asset_consumable_accessory (
    id integer NOT NULL,
    attribution_order_id integer CONSTRAINT attribution_order_asset_consumabl_attribution_order_id_not_null NOT NULL,
    asset_id integer NOT NULL,
    consumable_id integer CONSTRAINT attribution_order_asset_consumable_acces_consumable_id_not_null NOT NULL
);


ALTER TABLE public.attribution_order_asset_consumable_accessory OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 43713)
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attribution_order_asset_consumable_accessory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attribution_order_asset_consumable_accessory_id_seq OWNER TO postgres;

--
-- TOC entry 6954 (class 0 OID 0)
-- Dependencies: 252
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_consumable_accessory_id_seq OWNED BY public.attribution_order_asset_consumable_accessory.id;


--
-- TOC entry 253 (class 1259 OID 43714)
-- Name: attribution_order_asset_stock_item_accessory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribution_order_asset_stock_item_accessory (
    id integer NOT NULL,
    attribution_order_id integer CONSTRAINT attribution_order_asset_stock_ite_attribution_order_id_not_null NOT NULL,
    asset_id integer NOT NULL,
    stock_item_id integer CONSTRAINT attribution_order_asset_stock_item_acces_stock_item_id_not_null NOT NULL
);


ALTER TABLE public.attribution_order_asset_stock_item_accessory OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 43721)
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attribution_order_asset_stock_item_accessory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attribution_order_asset_stock_item_accessory_id_seq OWNER TO postgres;

--
-- TOC entry 6955 (class 0 OID 0)
-- Dependencies: 254
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_stock_item_accessory_id_seq OWNED BY public.attribution_order_asset_stock_item_accessory.id;


--
-- TOC entry 255 (class 1259 OID 43722)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 43727)
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 257 (class 1259 OID 43728)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 43734)
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 259 (class 1259 OID 43735)
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 43742)
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 261 (class 1259 OID 43743)
-- Name: auth_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);


ALTER TABLE public.auth_user OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 43758)
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 43764)
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 264 (class 1259 OID 43765)
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 265 (class 1259 OID 43766)
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 43772)
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 267 (class 1259 OID 43773)
-- Name: authentication_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_log (
    log_id integer NOT NULL,
    user_id integer NOT NULL,
    attempted_username character varying(50),
    event_type character varying(24),
    ip_address character varying(45),
    event_timestamp timestamp without time zone,
    failure_reason character varying(60)
);


ALTER TABLE public.authentication_log OWNER TO postgres;

--
-- TOC entry 6956 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN authentication_log.event_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.event_type IS 'LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PWD_CHANGE, ACCOUNT_LOCK';


--
-- TOC entry 6957 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN authentication_log.failure_reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.failure_reason IS 'e.g., Invalid Password, User Disabled';


--
-- TOC entry 268 (class 1259 OID 43778)
-- Name: backorder_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backorder_report (
    backorder_report_id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    backorder_report_date date,
    digital_copy bytea
);


ALTER TABLE public.backorder_report OWNER TO postgres;

--
-- TOC entry 6958 (class 0 OID 0)
-- Dependencies: 268
-- Name: TABLE backorder_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.backorder_report IS 'Renamed from bon_de_reste';


--
-- TOC entry 269 (class 1259 OID 43785)
-- Name: backorder_report_consumable_model_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backorder_report_consumable_model_line (
    backorder_report_id integer CONSTRAINT backorder_report_consumable_model__backorder_report_id_not_null NOT NULL,
    consumable_model_id integer CONSTRAINT backorder_report_consumable_model__consumable_model_id_not_null NOT NULL,
    quantity_ordered integer CONSTRAINT backorder_report_consumable_model_lin_quantity_ordered_not_null NOT NULL,
    quantity_received integer CONSTRAINT backorder_report_consumable_model_li_quantity_received_not_null NOT NULL,
    quantity_remaining integer CONSTRAINT backorder_report_consumable_model_l_quantity_remaining_not_null NOT NULL
);


ALTER TABLE public.backorder_report_consumable_model_line OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 43793)
-- Name: backorder_report_stock_item_model_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backorder_report_stock_item_model_line (
    backorder_report_id integer CONSTRAINT backorder_report_stock_item_model__backorder_report_id_not_null NOT NULL,
    stock_item_model_id integer CONSTRAINT backorder_report_stock_item_model__stock_item_model_id_not_null NOT NULL,
    quantity_ordered integer CONSTRAINT backorder_report_stock_item_model_lin_quantity_ordered_not_null NOT NULL,
    quantity_received integer CONSTRAINT backorder_report_stock_item_model_li_quantity_received_not_null NOT NULL,
    quantity_remaining integer CONSTRAINT backorder_report_stock_item_model_l_quantity_remaining_not_null NOT NULL
);


ALTER TABLE public.backorder_report_stock_item_model_line OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 43801)
-- Name: broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broken_item_report (
    broken_item_report_id integer NOT NULL,
    digital_copy bytea
);


ALTER TABLE public.broken_item_report OWNER TO postgres;

--
-- TOC entry 6959 (class 0 OID 0)
-- Dependencies: 271
-- Name: TABLE broken_item_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.broken_item_report IS 'Equivalent of C5';


--
-- TOC entry 272 (class 1259 OID 43807)
-- Name: company_asset_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_asset_request (
    company_asset_request_id integer NOT NULL,
    attribution_order_id integer NOT NULL,
    is_signed_by_company boolean,
    administrative_serial_number character varying(18),
    title_of_demand character varying(24),
    organization_body_designation character varying(60),
    register_number_or_book_journal_of_corpse character varying(60),
    register_number_or_book_journal_of_establishment character varying(60),
    is_signed_by_company_leader boolean,
    is_signed_by_regional_provider boolean,
    is_signed_by_company_representative boolean,
    digital_copy text
);


ALTER TABLE public.company_asset_request OWNER TO postgres;

--
-- TOC entry 6960 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE company_asset_request; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.company_asset_request IS 'Demande du mat�riel';


--
-- TOC entry 425 (class 1259 OID 46281)
-- Name: company_asset_request_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_asset_request_translation (
    id integer NOT NULL,
    company_asset_request_id integer CONSTRAINT company_asset_request_transla_company_asset_request_id_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    title_of_demand character varying(24),
    organization_body_designation character varying(60),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT company_asset_request_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.company_asset_request_translation OWNER TO postgres;

--
-- TOC entry 424 (class 1259 OID 46280)
-- Name: company_asset_request_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_asset_request_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_asset_request_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6961 (class 0 OID 0)
-- Dependencies: 424
-- Name: company_asset_request_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_asset_request_translation_id_seq OWNED BY public.company_asset_request_translation.id;


--
-- TOC entry 273 (class 1259 OID 43814)
-- Name: consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable (
    consumable_id integer NOT NULL,
    consumable_model_id integer NOT NULL,
    stock_item_consumable_destruction_certificate_id integer,
    consumable_name character varying(48),
    consumable_serial_number character varying(48),
    consumable_fabrication_datetime timestamp without time zone,
    consumable_inventory_number character varying(6),
    consumable_service_tag character varying(48),
    consumable_arrival_datetime timestamp without time zone,
    consumable_status character varying(30),
    purchase_order_id integer
);


ALTER TABLE public.consumable OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 43819)
-- Name: consumable_attribute_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_attribute_definition (
    consumable_attribute_definition_id integer CONSTRAINT consumable_attribute_defini_consumable_attribute_defin_not_null NOT NULL,
    consumable_type_code character varying(18),
    data_type character varying(18),
    unit character varying(24),
    description character varying(256),
    maintenance_domain character varying(24)
);


ALTER TABLE public.consumable_attribute_definition OWNER TO postgres;

--
-- TOC entry 373 (class 1259 OID 45712)
-- Name: consumable_attribute_definition_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_attribute_definition_translation (
    id integer NOT NULL,
    consumable_attribute_definition_id integer CONSTRAINT consumable_attribute_defin_consumable_attribute_defin_not_null1 NOT NULL,
    language_code character varying(5) CONSTRAINT consumable_attribute_definition_translat_language_code_not_null NOT NULL,
    description character varying(256) CONSTRAINT consumable_attribute_definition_translatio_description_not_null NOT NULL,
    unit character varying(24),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT consumable_attribute_definition_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.consumable_attribute_definition_translation OWNER TO postgres;

--
-- TOC entry 372 (class 1259 OID 45711)
-- Name: consumable_attribute_definition_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_attribute_definition_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_attribute_definition_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6962 (class 0 OID 0)
-- Dependencies: 372
-- Name: consumable_attribute_definition_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_attribute_definition_translation_id_seq OWNED BY public.consumable_attribute_definition_translation.id;


--
-- TOC entry 275 (class 1259 OID 43823)
-- Name: consumable_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_attribute_value (
    consumable_id integer NOT NULL,
    consumable_attribute_definition_id integer CONSTRAINT consumable_attribute_value_consumable_attribute_defini_not_null NOT NULL,
    value_string character varying(1024),
    value_bool boolean,
    value_date date,
    value_number numeric(18,6)
);


ALTER TABLE public.consumable_attribute_value OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 43830)
-- Name: consumable_brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_brand (
    consumable_brand_id integer NOT NULL,
    brand_name character varying(48),
    brand_code character varying(16),
    is_active boolean,
    brand_photo character varying(255)
);


ALTER TABLE public.consumable_brand OWNER TO postgres;

--
-- TOC entry 435 (class 1259 OID 46568)
-- Name: consumable_brand_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_brand_translation (
    id integer NOT NULL,
    consumable_brand_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    brand_name character varying(48) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT consumable_brand_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.consumable_brand_translation OWNER TO postgres;

--
-- TOC entry 434 (class 1259 OID 46567)
-- Name: consumable_brand_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_brand_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_brand_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6963 (class 0 OID 0)
-- Dependencies: 434
-- Name: consumable_brand_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_brand_translation_id_seq OWNED BY public.consumable_brand_translation.id;


--
-- TOC entry 277 (class 1259 OID 43834)
-- Name: consumable_condition_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_condition_history (
    consumable_condition_history_id integer CONSTRAINT consumable_condition_histor_consumable_condition_histo_not_null NOT NULL,
    consumable_id integer NOT NULL,
    notes character varying(256),
    cosmetic_issues character varying(128),
    functional_issues character varying(128),
    recommendation character varying(24),
    created_at timestamp without time zone,
    condition_id integer NOT NULL
);


ALTER TABLE public.consumable_condition_history OWNER TO postgres;

--
-- TOC entry 407 (class 1259 OID 46088)
-- Name: consumable_condition_history_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_condition_history_translation (
    id integer NOT NULL,
    consumable_condition_history_id integer CONSTRAINT consumable_condition_histo_consumable_condition_histo_not_null1 NOT NULL,
    language_code character varying(5) NOT NULL,
    notes character varying(256),
    cosmetic_issues character varying(128),
    functional_issues character varying(128),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT consumable_condition_history_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.consumable_condition_history_translation OWNER TO postgres;

--
-- TOC entry 406 (class 1259 OID 46087)
-- Name: consumable_condition_history_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_condition_history_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_condition_history_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6964 (class 0 OID 0)
-- Dependencies: 406
-- Name: consumable_condition_history_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_condition_history_translation_id_seq OWNED BY public.consumable_condition_history_translation.id;


--
-- TOC entry 449 (class 1259 OID 47622)
-- Name: consumable_is_assigned_to_org_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_assigned_to_org_structure (
    assignment_id integer NOT NULL,
    organizational_structure_id integer CONSTRAINT consumable_is_assigned_to_o_organizational_structure_i_not_null NOT NULL,
    consumable_id integer NOT NULL,
    assigned_by_person_id integer CONSTRAINT consumable_is_assigned_to_org_st_assigned_by_person_id_not_null NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.consumable_is_assigned_to_org_structure OWNER TO postgres;

--
-- TOC entry 448 (class 1259 OID 47621)
-- Name: consumable_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_is_assigned_to_org_structure_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_is_assigned_to_org_structure_assignment_id_seq OWNER TO postgres;

--
-- TOC entry 6965 (class 0 OID 0)
-- Dependencies: 448
-- Name: consumable_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_is_assigned_to_org_structure_assignment_id_seq OWNED BY public.consumable_is_assigned_to_org_structure.assignment_id;


--
-- TOC entry 278 (class 1259 OID 43841)
-- Name: consumable_is_assigned_to_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_assigned_to_person (
    assignment_id integer NOT NULL,
    consumable_id integer NOT NULL,
    person_id integer NOT NULL,
    assigned_by_person_id integer NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    is_active boolean NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.consumable_is_assigned_to_person OWNER TO postgres;

--
-- TOC entry 6966 (class 0 OID 0)
-- Dependencies: 278
-- Name: TABLE consumable_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_is_assigned_to_person IS 'The first person is the one to whom the consumable is assign';


--
-- TOC entry 279 (class 1259 OID 43851)
-- Name: consumable_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_asset (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_a_consumable_model_id_not_null NOT NULL,
    asset_model_id integer CONSTRAINT c_is_compatible_with_a_asset_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 43856)
-- Name: consumable_is_compatible_with_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_stock_item (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_si_consumable_model_id_not_null NOT NULL,
    stock_item_model_id integer CONSTRAINT c_is_compatible_with_si_stock_item_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_stock_item OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 43861)
-- Name: consumable_is_used_in_stock_item_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_used_in_stock_item_history (
    consumable_id integer NOT NULL,
    stock_item_id integer NOT NULL,
    maintenance_step_id integer,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    id integer NOT NULL,
    attribution_order_id integer
);


ALTER TABLE public.consumable_is_used_in_stock_item_history OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 43867)
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_is_used_in_stock_item_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_is_used_in_stock_item_history_id_seq OWNER TO postgres;

--
-- TOC entry 6967 (class 0 OID 0)
-- Dependencies: 282
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_is_used_in_stock_item_history_id_seq OWNED BY public.consumable_is_used_in_stock_item_history.id;


--
-- TOC entry 283 (class 1259 OID 43868)
-- Name: consumable_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_model (
    consumable_model_id integer NOT NULL,
    consumable_type_id integer NOT NULL,
    consumable_brand_id integer NOT NULL,
    model_name character varying(48),
    model_code character varying(16),
    release_year integer,
    discontinued_year integer,
    is_active boolean,
    notes character varying(256),
    warranty_expiry_in_months integer,
    consumable_model_name_in_administrative_certificate character varying(48)
);


ALTER TABLE public.consumable_model OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 43874)
-- Name: consumable_model_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_model_attribute_value (
    consumable_model_id integer NOT NULL,
    consumable_attribute_definition_id integer CONSTRAINT consumable_model_attribute__consumable_attribute_defin_not_null NOT NULL,
    value_bool boolean,
    value_string character varying(1024),
    value_number numeric(18,6),
    value_date date
);


ALTER TABLE public.consumable_model_attribute_value OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 43881)
-- Name: consumable_model_is_found_in_purchase_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_model_is_found_in_purchase_order (
    consumable_model_id integer CONSTRAINT consumable_model_is_found_in_bdc_consumable_model_id_not_null NOT NULL,
    purchase_order_id integer CONSTRAINT consumable_model_is_found_in_bdc_purchase_order_id_not_null NOT NULL,
    quantity_ordered integer,
    quantity_received integer,
    unit_price numeric(10,2)
);


ALTER TABLE public.consumable_model_is_found_in_purchase_order OWNER TO postgres;

--
-- TOC entry 6968 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE consumable_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_model_is_found_in_purchase_order IS 'Renamed from consumable_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 419 (class 1259 OID 46218)
-- Name: consumable_model_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_model_translation (
    id integer NOT NULL,
    consumable_model_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    model_name character varying(48),
    notes character varying(256),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    consumable_model_name_in_administrative_certificate character varying(48),
    CONSTRAINT consumable_model_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.consumable_model_translation OWNER TO postgres;

--
-- TOC entry 418 (class 1259 OID 46217)
-- Name: consumable_model_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_model_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_model_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6969 (class 0 OID 0)
-- Dependencies: 418
-- Name: consumable_model_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_model_translation_id_seq OWNED BY public.consumable_model_translation.id;


--
-- TOC entry 286 (class 1259 OID 43886)
-- Name: consumable_movement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_movement (
    consumable_movement_id integer NOT NULL,
    destination_location_id integer CONSTRAINT consumable_movement_destination_room_id_not_null NOT NULL,
    source_location_id integer CONSTRAINT consumable_movement_source_room_id_not_null NOT NULL,
    maintenance_step_id integer,
    external_maintenance_step_id integer,
    consumable_id integer NOT NULL,
    movement_reason character varying(128) NOT NULL,
    movement_datetime timestamp without time zone NOT NULL,
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL,
    maintenance_id integer
);


ALTER TABLE public.consumable_movement OWNER TO postgres;

--
-- TOC entry 393 (class 1259 OID 45933)
-- Name: consumable_movement_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_movement_translation (
    id integer NOT NULL,
    consumable_movement_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    movement_reason character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT consumable_movement_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.consumable_movement_translation OWNER TO postgres;

--
-- TOC entry 392 (class 1259 OID 45932)
-- Name: consumable_movement_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_movement_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_movement_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6970 (class 0 OID 0)
-- Dependencies: 392
-- Name: consumable_movement_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_movement_translation_id_seq OWNED BY public.consumable_movement_translation.id;


--
-- TOC entry 413 (class 1259 OID 46155)
-- Name: consumable_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_translation (
    id integer NOT NULL,
    consumable_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    consumable_name character varying(48),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    consumable_status character varying(60),
    CONSTRAINT consumable_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.consumable_translation OWNER TO postgres;

--
-- TOC entry 412 (class 1259 OID 46154)
-- Name: consumable_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6971 (class 0 OID 0)
-- Dependencies: 412
-- Name: consumable_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_translation_id_seq OWNED BY public.consumable_translation.id;


--
-- TOC entry 287 (class 1259 OID 43897)
-- Name: consumable_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_type (
    consumable_type_id integer NOT NULL,
    consumable_type_label character varying(60),
    consumable_type_code character varying(18),
    photo character varying(512)
);


ALTER TABLE public.consumable_type OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 43903)
-- Name: consumable_type_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_type_attribute (
    consumable_type_id integer NOT NULL,
    consumable_attribute_definition_id integer CONSTRAINT consumable_type_attribute_consumable_attribute_definit_not_null NOT NULL,
    is_mandatory boolean,
    default_value character varying(255)
);


ALTER TABLE public.consumable_type_attribute OWNER TO postgres;

--
-- TOC entry 357 (class 1259 OID 45536)
-- Name: consumable_type_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_type_translation (
    id integer NOT NULL,
    consumable_type_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    consumable_type_label character varying(60) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT consumable_type_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.consumable_type_translation OWNER TO postgres;

--
-- TOC entry 356 (class 1259 OID 45535)
-- Name: consumable_type_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumable_type_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumable_type_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6972 (class 0 OID 0)
-- Dependencies: 356
-- Name: consumable_type_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_type_translation_id_seq OWNED BY public.consumable_type_translation.id;


--
-- TOC entry 289 (class 1259 OID 43908)
-- Name: delivery_note; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_note (
    delivery_note_id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    delivery_note_date date,
    digital_copy text,
    delivery_note_code character varying(10)
);


ALTER TABLE public.delivery_note OWNER TO postgres;

--
-- TOC entry 6973 (class 0 OID 0)
-- Dependencies: 289
-- Name: TABLE delivery_note; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.delivery_note IS 'Renamed from bon_de_livraison';


--
-- TOC entry 290 (class 1259 OID 43915)
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id integer NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 43927)
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 292 (class 1259 OID 43928)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 43934)
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 294 (class 1259 OID 43935)
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 43944)
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 296 (class 1259 OID 43945)
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 43953)
-- Name: external_maintenance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance (
    external_maintenance_id integer NOT NULL,
    maintenance_id integer NOT NULL,
    item_received_by_maintenance_provider_datetime timestamp without time zone,
    item_sent_to_company_datetime timestamp without time zone,
    item_sent_to_external_maintenance_datetime timestamp without time zone,
    item_received_by_company_datetime timestamp without time zone,
    external_maintenance_status character varying(32) DEFAULT 'DRAFT'::character varying,
    external_maintenance_provider_id integer
);


ALTER TABLE public.external_maintenance OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 43959)
-- Name: external_maintenance_document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_document (
    external_maintenance_document_id integer CONSTRAINT external_maintenance_docume_external_maintenance_docum_not_null NOT NULL,
    external_maintenance_id integer NOT NULL,
    document_is_signed boolean,
    item_is_received_by_maintenance_provider boolean,
    maintenance_provider_final_decision character varying(60),
    digital_copy text
);


ALTER TABLE public.external_maintenance_document OWNER TO postgres;

--
-- TOC entry 427 (class 1259 OID 46302)
-- Name: external_maintenance_document_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_document_translation (
    id integer NOT NULL,
    external_maintenance_document_id integer CONSTRAINT external_maintenance_docum_external_maintenance_docum_not_null1 NOT NULL,
    language_code character varying(5) CONSTRAINT external_maintenance_document_translatio_language_code_not_null NOT NULL,
    maintenance_provider_final_decision character varying(60),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT external_maintenance_document_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.external_maintenance_document_translation OWNER TO postgres;

--
-- TOC entry 426 (class 1259 OID 46301)
-- Name: external_maintenance_document_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_maintenance_document_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_maintenance_document_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6974 (class 0 OID 0)
-- Dependencies: 426
-- Name: external_maintenance_document_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_maintenance_document_translation_id_seq OWNED BY public.external_maintenance_document_translation.id;


--
-- TOC entry 299 (class 1259 OID 43966)
-- Name: external_maintenance_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_provider (
    external_maintenance_provider_id integer CONSTRAINT external_maintenance_provid_external_maintenance_provi_not_null NOT NULL,
    external_maintenance_provider_name character varying(48),
    external_maintenance_provider_location character varying(128)
);


ALTER TABLE public.external_maintenance_provider OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 43970)
-- Name: external_maintenance_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_step (
    external_maintenance_step_id integer NOT NULL,
    external_maintenance_id integer NOT NULL,
    external_maintenance_typical_step_id integer CONSTRAINT external_maintenance_step_external_maintenance_typical_not_null NOT NULL,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    is_successful boolean
);


ALTER TABLE public.external_maintenance_step OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 43976)
-- Name: external_maintenance_typical_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_typical_step (
    external_maintenance_typical_step_id integer CONSTRAINT external_maintenance_typica_external_maintenance_typic_not_null NOT NULL,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    maintenance_type character(8),
    description character varying(256),
    maintenance_domain public.maintenance_domain NOT NULL,
    operation_type character varying(24)
);


ALTER TABLE public.external_maintenance_typical_step OWNER TO postgres;

--
-- TOC entry 6975 (class 0 OID 0)
-- Dependencies: 301
-- Name: COLUMN external_maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 379 (class 1259 OID 45778)
-- Name: external_maintenance_typical_step_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_typical_step_translation (
    id integer NOT NULL,
    external_maintenance_typical_step_id integer CONSTRAINT external_maintenance_typic_external_maintenance_typic_not_null1 NOT NULL,
    language_code character varying(5) CONSTRAINT external_maintenance_typical_step_transl_language_code_not_null NOT NULL,
    description character varying(256) CONSTRAINT external_maintenance_typical_step_translat_description_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    maintenance_type character varying(8),
    operation_type character varying(24),
    maintenance_domain character varying(24),
    CONSTRAINT external_maintenance_typical_step_translati_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.external_maintenance_typical_step_translation OWNER TO postgres;

--
-- TOC entry 378 (class 1259 OID 45777)
-- Name: external_maintenance_typical_step_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_maintenance_typical_step_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_maintenance_typical_step_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6976 (class 0 OID 0)
-- Dependencies: 378
-- Name: external_maintenance_typical_step_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_maintenance_typical_step_translation_id_seq OWNED BY public.external_maintenance_typical_step_translation.id;


--
-- TOC entry 302 (class 1259 OID 43981)
-- Name: invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice (
    invoice_id integer CONSTRAINT facture_facture_id_not_null NOT NULL,
    delivery_note_id integer CONSTRAINT facture_delivery_note_id_not_null NOT NULL,
    digital_copy text
);


ALTER TABLE public.invoice OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 43988)
-- Name: location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location (
    location_id integer CONSTRAINT room_room_id_not_null NOT NULL,
    location_name character varying(30),
    location_type_id integer
);


ALTER TABLE public.location OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 43992)
-- Name: location_belongs_to_organizational_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_belongs_to_organizational_structure (
    organizational_structure_id integer CONSTRAINT room_belongs_to_organizatio_organizational_structure_i_not_null NOT NULL,
    location_id integer CONSTRAINT room_belongs_to_organizational_structure_room_id_not_null NOT NULL
);


ALTER TABLE public.location_belongs_to_organizational_structure OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 43997)
-- Name: location_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_relation (
    child_location_id integer NOT NULL,
    parent_location_id integer NOT NULL,
    relation_id integer
);


ALTER TABLE public.location_relation OWNER TO postgres;

--
-- TOC entry 387 (class 1259 OID 45867)
-- Name: location_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_translation (
    id integer NOT NULL,
    location_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    location_name character varying(30) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT location_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.location_translation OWNER TO postgres;

--
-- TOC entry 386 (class 1259 OID 45866)
-- Name: location_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.location_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6977 (class 0 OID 0)
-- Dependencies: 386
-- Name: location_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_translation_id_seq OWNED BY public.location_translation.id;


--
-- TOC entry 306 (class 1259 OID 44002)
-- Name: location_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_type (
    location_type_id integer CONSTRAINT room_type_room_type_id_not_null NOT NULL,
    location_type_label character varying(60) CONSTRAINT room_type_room_type_label_not_null NOT NULL,
    location_type_code character varying(18) CONSTRAINT room_type_room_type_code_not_null NOT NULL
);


ALTER TABLE public.location_type OWNER TO postgres;

--
-- TOC entry 307 (class 1259 OID 44008)
-- Name: location_type_location_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.location_type_location_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_type_location_type_id_seq OWNER TO postgres;

--
-- TOC entry 6978 (class 0 OID 0)
-- Dependencies: 307
-- Name: location_type_location_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_type_location_type_id_seq OWNED BY public.location_type.location_type_id;


--
-- TOC entry 361 (class 1259 OID 45580)
-- Name: location_type_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_type_translation (
    id integer NOT NULL,
    location_type_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    location_type_label character varying(60) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT location_type_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.location_type_translation OWNER TO postgres;

--
-- TOC entry 360 (class 1259 OID 45579)
-- Name: location_type_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.location_type_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_type_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6979 (class 0 OID 0)
-- Dependencies: 360
-- Name: location_type_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_type_translation_id_seq OWNED BY public.location_type_translation.id;


--
-- TOC entry 308 (class 1259 OID 44009)
-- Name: maintenance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance (
    maintenance_id integer NOT NULL,
    asset_id integer,
    performed_by_person_id integer NOT NULL,
    approved_by_maintenance_chief_id integer NOT NULL,
    is_approved_by_maintenance_chief boolean,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    description character varying(256),
    is_successful boolean,
    digital_copy text,
    stock_item_id integer,
    consumable_id integer,
    maintenance_status character varying(20),
    CONSTRAINT chk_maintenance_single_target CHECK ((((((asset_id IS NOT NULL))::integer + ((stock_item_id IS NOT NULL))::integer) + ((consumable_id IS NOT NULL))::integer) = 1))
);


ALTER TABLE public.maintenance OWNER TO postgres;

--
-- TOC entry 309 (class 1259 OID 44017)
-- Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_inspection_leads_to_broken_item_report (
    maintenance_id integer CONSTRAINT maintenance_inspection_leads_to_broken__maintenance_id_not_null NOT NULL,
    broken_item_report_id integer CONSTRAINT maintenance_inspection_leads_to__broken_item_report_id_not_null NOT NULL
);


ALTER TABLE public.maintenance_inspection_leads_to_broken_item_report OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 44022)
-- Name: maintenance_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_step (
    maintenance_step_id integer NOT NULL,
    maintenance_id integer NOT NULL,
    maintenance_typical_step_id integer NOT NULL,
    person_id integer NOT NULL,
    asset_condition_history_id integer,
    stock_item_condition_history_id integer,
    consumable_condition_history_id integer,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    is_successful boolean,
    maintenance_step_status character varying(60),
    note character varying(1024),
    status_id integer
);


ALTER TABLE public.maintenance_step OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 44029)
-- Name: maintenance_step_attribute_change; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_step_attribute_change (
    maintenance_step_attribute_change_id bigint CONSTRAINT maintenance_step_attribute__maintenance_step_attribute_not_null NOT NULL,
    target_type character varying(20) NOT NULL,
    target_id integer,
    attribute_definition_id integer CONSTRAINT maintenance_step_attribute_cha_attribute_definition_id_not_null NOT NULL,
    value_string character varying(1024),
    value_bool boolean,
    value_date date,
    value_number numeric(18,6),
    created_at_datetime timestamp with time zone NOT NULL,
    created_by_user_id integer,
    applied_at_datetime timestamp with time zone,
    maintenance_step_id integer NOT NULL
);


ALTER TABLE public.maintenance_step_attribute_change OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 44039)
-- Name: maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.maintenance_step_attribute_change ALTER COLUMN maintenance_step_attribute_change_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 313 (class 1259 OID 44040)
-- Name: maintenance_step_item_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_step_item_request (
    maintenance_step_item_request_id integer CONSTRAINT maintenance_step_item_reque_maintenance_step_item_requ_not_null NOT NULL,
    maintenance_step_id integer NOT NULL,
    requested_by_person_id integer NOT NULL,
    request_type character varying(24) NOT NULL,
    status character varying(24) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    fulfilled_at timestamp without time zone,
    stock_item_id integer,
    consumable_id integer,
    source_location_id integer,
    destination_location_id integer,
    note character varying(256),
    fulfilled_by_person_id integer,
    requested_stock_item_model_id integer,
    requested_consumable_model_id integer,
    rejected_by_person_id integer,
    rejected_at timestamp with time zone
);


ALTER TABLE public.maintenance_step_item_request OWNER TO postgres;

--
-- TOC entry 429 (class 1259 OID 46323)
-- Name: maintenance_step_item_request_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_step_item_request_translation (
    id integer NOT NULL,
    maintenance_step_item_request_id integer CONSTRAINT maintenance_step_item_requ_maintenance_step_item_requ_not_null1 NOT NULL,
    language_code character varying(5) CONSTRAINT maintenance_step_item_request_translatio_language_code_not_null NOT NULL,
    note character varying(256),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT maintenance_step_item_request_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.maintenance_step_item_request_translation OWNER TO postgres;

--
-- TOC entry 428 (class 1259 OID 46322)
-- Name: maintenance_step_item_request_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_step_item_request_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_step_item_request_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6980 (class 0 OID 0)
-- Dependencies: 428
-- Name: maintenance_step_item_request_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_step_item_request_translation_id_seq OWNED BY public.maintenance_step_item_request_translation.id;


--
-- TOC entry 439 (class 1259 OID 47011)
-- Name: maintenance_step_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_step_status (
    id integer NOT NULL,
    code character varying(60) NOT NULL,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.maintenance_step_status OWNER TO postgres;

--
-- TOC entry 438 (class 1259 OID 47010)
-- Name: maintenance_step_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_step_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_step_status_id_seq OWNER TO postgres;

--
-- TOC entry 6981 (class 0 OID 0)
-- Dependencies: 438
-- Name: maintenance_step_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_step_status_id_seq OWNED BY public.maintenance_step_status.id;


--
-- TOC entry 441 (class 1259 OID 47023)
-- Name: maintenance_step_status_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_step_status_translation (
    id integer NOT NULL,
    maintenance_step_status_id integer CONSTRAINT maintenance_step_status_tra_maintenance_step_status_id_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    maintenance_step_status_label character varying(100) CONSTRAINT maintenance_step_status_tra_maintenance_step_status_la_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maintenance_step_status_translation OWNER TO postgres;

--
-- TOC entry 440 (class 1259 OID 47022)
-- Name: maintenance_step_status_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_step_status_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_step_status_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6982 (class 0 OID 0)
-- Dependencies: 440
-- Name: maintenance_step_status_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_step_status_translation_id_seq OWNED BY public.maintenance_step_status_translation.id;


--
-- TOC entry 403 (class 1259 OID 46043)
-- Name: maintenance_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_translation (
    id integer NOT NULL,
    maintenance_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    description character varying(256) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT maintenance_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.maintenance_translation OWNER TO postgres;

--
-- TOC entry 402 (class 1259 OID 46042)
-- Name: maintenance_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6983 (class 0 OID 0)
-- Dependencies: 402
-- Name: maintenance_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_translation_id_seq OWNED BY public.maintenance_translation.id;


--
-- TOC entry 314 (class 1259 OID 44049)
-- Name: maintenance_typical_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_typical_step (
    maintenance_typical_step_id integer NOT NULL,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    description character varying(256),
    maintenance_type character(8),
    operation_type character varying(24) DEFAULT 'change'::character varying NOT NULL,
    maintenance_domain public.maintenance_domain NOT NULL,
    CONSTRAINT maintenance_typical_step_operation_type_check CHECK (((operation_type)::text = ANY (ARRAY[('add'::character varying)::text, ('remove'::character varying)::text, ('change'::character varying)::text, ('replace'::character varying)::text, ('repair'::character varying)::text, ('inspect'::character varying)::text, ('clean'::character varying)::text, ('calibrate'::character varying)::text, ('test'::character varying)::text])))
);


ALTER TABLE public.maintenance_typical_step OWNER TO postgres;

--
-- TOC entry 6984 (class 0 OID 0)
-- Dependencies: 314
-- Name: COLUMN maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 377 (class 1259 OID 45756)
-- Name: maintenance_typical_step_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_typical_step_translation (
    id integer NOT NULL,
    maintenance_typical_step_id integer CONSTRAINT maintenance_typical_step_tr_maintenance_typical_step_i_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    description character varying(256) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    maintenance_type character varying(8),
    operation_type character varying(24),
    maintenance_domain character varying(24),
    CONSTRAINT maintenance_typical_step_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.maintenance_typical_step_translation OWNER TO postgres;

--
-- TOC entry 376 (class 1259 OID 45755)
-- Name: maintenance_typical_step_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_typical_step_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_typical_step_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6985 (class 0 OID 0)
-- Dependencies: 376
-- Name: maintenance_typical_step_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_typical_step_translation_id_seq OWNED BY public.maintenance_typical_step_translation.id;


--
-- TOC entry 315 (class 1259 OID 44057)
-- Name: organizational_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure (
    organizational_structure_id integer NOT NULL,
    structure_code character varying(50),
    structure_name character varying(255),
    is_active boolean,
    structure_type_id integer
);


ALTER TABLE public.organizational_structure OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 44061)
-- Name: organizational_structure_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure_relation (
    child_organizational_structure_id integer CONSTRAINT organizational_structure_re_organizational_structure_i_not_null NOT NULL,
    parent_organizational_structure_id integer CONSTRAINT organizational_structure_re_parent_organizational_stru_not_null NOT NULL,
    relation_id integer
);


ALTER TABLE public.organizational_structure_relation OWNER TO postgres;

--
-- TOC entry 389 (class 1259 OID 45889)
-- Name: organizational_structure_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure_translation (
    id integer NOT NULL,
    organizational_structure_id integer CONSTRAINT organizational_structure_tr_organizational_structure_i_not_null NOT NULL,
    language_code character varying(5) NOT NULL,
    structure_name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT organizational_structure_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.organizational_structure_translation OWNER TO postgres;

--
-- TOC entry 388 (class 1259 OID 45888)
-- Name: organizational_structure_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizational_structure_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizational_structure_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6986 (class 0 OID 0)
-- Dependencies: 388
-- Name: organizational_structure_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizational_structure_translation_id_seq OWNED BY public.organizational_structure_translation.id;


--
-- TOC entry 317 (class 1259 OID 44066)
-- Name: organizational_structure_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure_type (
    organizational_structure_type_id integer CONSTRAINT organizational_structure_ty_organizational_structure_t_not_null NOT NULL,
    organizational_structure_type character varying(30) CONSTRAINT organizational_structure_t_organizational_structure_t_not_null1 NOT NULL
);


ALTER TABLE public.organizational_structure_type OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 44071)
-- Name: organizational_structure_type_organizational_structure_type_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizational_structure_type_organizational_structure_type_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizational_structure_type_organizational_structure_type_seq OWNER TO postgres;

--
-- TOC entry 6987 (class 0 OID 0)
-- Dependencies: 318
-- Name: organizational_structure_type_organizational_structure_type_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizational_structure_type_organizational_structure_type_seq OWNED BY public.organizational_structure_type.organizational_structure_type_id;


--
-- TOC entry 363 (class 1259 OID 45602)
-- Name: organizational_structure_type_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure_type_translation (
    id integer NOT NULL,
    organizational_structure_type_id integer CONSTRAINT organizational_structure_t_organizational_structure_t_not_null2 NOT NULL,
    language_code character varying(5) CONSTRAINT organizational_structure_type_translatio_language_code_not_null NOT NULL,
    organizational_structure_type character varying(30) CONSTRAINT organizational_structure_t_organizational_structure_t_not_null3 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT organizational_structure_type_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.organizational_structure_type_translation OWNER TO postgres;

--
-- TOC entry 362 (class 1259 OID 45601)
-- Name: organizational_structure_type_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizational_structure_type_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizational_structure_type_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6988 (class 0 OID 0)
-- Dependencies: 362
-- Name: organizational_structure_type_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizational_structure_type_translation_id_seq OWNED BY public.organizational_structure_type_translation.id;


--
-- TOC entry 319 (class 1259 OID 44072)
-- Name: person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person (
    person_id integer NOT NULL,
    first_name character varying(48) NOT NULL,
    last_name character varying(48) NOT NULL,
    sex character(6) NOT NULL,
    birth_date date NOT NULL,
    is_approved boolean NOT NULL
);


ALTER TABLE public.person OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 44081)
-- Name: person_assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_assignment (
    assignment_id integer NOT NULL,
    position_id integer NOT NULL,
    person_id integer NOT NULL,
    assignment_start_date date,
    assignment_end_date date,
    employment_type character varying(48)
);


ALTER TABLE public.person_assignment OWNER TO postgres;

--
-- TOC entry 6989 (class 0 OID 0)
-- Dependencies: 320
-- Name: COLUMN person_assignment.employment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_assignment.employment_type IS 'Permanent, contractual...';


--
-- TOC entry 321 (class 1259 OID 44087)
-- Name: person_reports_problem_on_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset (
    asset_id integer NOT NULL,
    person_id integer NOT NULL,
    report_id integer NOT NULL,
    report_datetime timestamp without time zone NOT NULL,
    owner_observation character varying(256) NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 44095)
-- Name: person_reports_problem_on_asset_included_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_consumable (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_co_report_id_not_null1 NOT NULL,
    consumable_id integer CONSTRAINT person_reports_problem_on_asset_included_consumable_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_consumabl_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_consumable OWNER TO postgres;

--
-- TOC entry 323 (class 1259 OID 44101)
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_reports_problem_on_asset_included_consumable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_reports_problem_on_asset_included_consumable_id_seq OWNER TO postgres;

--
-- TOC entry 6990 (class 0 OID 0)
-- Dependencies: 323
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_consumable_id_seq OWNED BY public.person_reports_problem_on_asset_included_consumable.id;


--
-- TOC entry 324 (class 1259 OID 44102)
-- Name: person_reports_problem_on_asset_included_context; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_context (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_con_report_id_not_null NOT NULL,
    destination_location_id integer CONSTRAINT person_reports_problem_on_asset_in_destination_room_id_not_null NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_context OWNER TO postgres;

--
-- TOC entry 325 (class 1259 OID 44107)
-- Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_stock_item (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_sto_report_id_not_null NOT NULL,
    stock_item_id integer CONSTRAINT person_reports_problem_on_asset_included_stock_item_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_stock_ite_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_stock_item OWNER TO postgres;

--
-- TOC entry 326 (class 1259 OID 44113)
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_reports_problem_on_asset_included_stock_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_reports_problem_on_asset_included_stock_item_id_seq OWNER TO postgres;

--
-- TOC entry 6991 (class 0 OID 0)
-- Dependencies: 326
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_stock_item_id_seq OWNED BY public.person_reports_problem_on_asset_included_stock_item.id;


--
-- TOC entry 397 (class 1259 OID 45977)
-- Name: person_reports_problem_on_asset_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_translation (
    id integer NOT NULL,
    report_id integer NOT NULL,
    language_code character varying(5) CONSTRAINT person_reports_problem_on_asset_translat_language_code_not_null NOT NULL,
    owner_observation character varying(256) CONSTRAINT person_reports_problem_on_asset_tran_owner_observation_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT person_reports_problem_on_asset_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.person_reports_problem_on_asset_translation OWNER TO postgres;

--
-- TOC entry 396 (class 1259 OID 45976)
-- Name: person_reports_problem_on_asset_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_reports_problem_on_asset_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_reports_problem_on_asset_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6992 (class 0 OID 0)
-- Dependencies: 396
-- Name: person_reports_problem_on_asset_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_translation_id_seq OWNED BY public.person_reports_problem_on_asset_translation.id;


--
-- TOC entry 327 (class 1259 OID 44114)
-- Name: person_reports_problem_on_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_consumable (
    person_id integer NOT NULL,
    consumable_id integer NOT NULL,
    report_id integer NOT NULL,
    report_datetime timestamp without time zone NOT NULL,
    owner_observation character varying(256) NOT NULL
);


ALTER TABLE public.person_reports_problem_on_consumable OWNER TO postgres;

--
-- TOC entry 399 (class 1259 OID 45999)
-- Name: person_reports_problem_on_consumable_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_consumable_translation (
    id integer NOT NULL,
    report_id integer CONSTRAINT person_reports_problem_on_consumable_transla_report_id_not_null NOT NULL,
    language_code character varying(5) CONSTRAINT person_reports_problem_on_consumable_tra_language_code_not_null NOT NULL,
    owner_observation character varying(256) CONSTRAINT person_reports_problem_on_consumabl_owner_observation_not_null1 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT person_reports_problem_on_consumable_transl_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.person_reports_problem_on_consumable_translation OWNER TO postgres;

--
-- TOC entry 398 (class 1259 OID 45998)
-- Name: person_reports_problem_on_consumable_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_reports_problem_on_consumable_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_reports_problem_on_consumable_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6993 (class 0 OID 0)
-- Dependencies: 398
-- Name: person_reports_problem_on_consumable_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_consumable_translation_id_seq OWNED BY public.person_reports_problem_on_consumable_translation.id;


--
-- TOC entry 328 (class 1259 OID 44122)
-- Name: person_reports_problem_on_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_stock_item (
    person_id integer NOT NULL,
    stock_item_id integer NOT NULL,
    report_id integer NOT NULL,
    report_datetime timestamp without time zone NOT NULL,
    owner_observation character varying(256) NOT NULL
);


ALTER TABLE public.person_reports_problem_on_stock_item OWNER TO postgres;

--
-- TOC entry 401 (class 1259 OID 46021)
-- Name: person_reports_problem_on_stock_item_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_stock_item_translation (
    id integer NOT NULL,
    report_id integer CONSTRAINT person_reports_problem_on_stock_item_transla_report_id_not_null NOT NULL,
    language_code character varying(5) CONSTRAINT person_reports_problem_on_stock_item_tra_language_code_not_null NOT NULL,
    owner_observation character varying(256) CONSTRAINT person_reports_problem_on_stock_ite_owner_observation_not_null1 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT person_reports_problem_on_stock_item_transl_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.person_reports_problem_on_stock_item_translation OWNER TO postgres;

--
-- TOC entry 400 (class 1259 OID 46020)
-- Name: person_reports_problem_on_stock_item_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_reports_problem_on_stock_item_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_reports_problem_on_stock_item_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6994 (class 0 OID 0)
-- Dependencies: 400
-- Name: person_reports_problem_on_stock_item_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_stock_item_translation_id_seq OWNED BY public.person_reports_problem_on_stock_item_translation.id;


--
-- TOC entry 329 (class 1259 OID 44130)
-- Name: person_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_role_mapping (
    role_id integer NOT NULL,
    person_id integer NOT NULL
);


ALTER TABLE public.person_role_mapping OWNER TO postgres;

--
-- TOC entry 6995 (class 0 OID 0)
-- Dependencies: 329
-- Name: COLUMN person_role_mapping.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_role_mapping.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 381 (class 1259 OID 45800)
-- Name: person_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_translation (
    id integer NOT NULL,
    person_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    first_name character varying(48) NOT NULL,
    last_name character varying(48) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT person_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.person_translation OWNER TO postgres;

--
-- TOC entry 380 (class 1259 OID 45799)
-- Name: person_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6996 (class 0 OID 0)
-- Dependencies: 380
-- Name: person_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_translation_id_seq OWNED BY public.person_translation.id;


--
-- TOC entry 330 (class 1259 OID 44135)
-- Name: physical_condition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.physical_condition (
    condition_id integer NOT NULL,
    condition_code character varying(12),
    condition_label character varying(12),
    description character varying(256)
);


ALTER TABLE public.physical_condition OWNER TO postgres;

--
-- TOC entry 365 (class 1259 OID 45624)
-- Name: physical_condition_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.physical_condition_translation (
    id integer NOT NULL,
    condition_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    condition_label character varying(12) NOT NULL,
    description character varying(256),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT physical_condition_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.physical_condition_translation OWNER TO postgres;

--
-- TOC entry 364 (class 1259 OID 45623)
-- Name: physical_condition_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.physical_condition_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.physical_condition_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6997 (class 0 OID 0)
-- Dependencies: 364
-- Name: physical_condition_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.physical_condition_translation_id_seq OWNED BY public.physical_condition_translation.id;


--
-- TOC entry 331 (class 1259 OID 44139)
-- Name: position; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."position" (
    position_id integer NOT NULL,
    position_code character varying(48),
    position_label character varying(60),
    description character varying(256)
);


ALTER TABLE public."position" OWNER TO postgres;

--
-- TOC entry 332 (class 1259 OID 44143)
-- Name: position_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.position_role_mapping (
    position_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    source character varying(32) DEFAULT 'manual'::character varying NOT NULL
);


ALTER TABLE public.position_role_mapping OWNER TO postgres;

--
-- TOC entry 369 (class 1259 OID 45668)
-- Name: position_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.position_translation (
    id integer NOT NULL,
    position_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    position_label character varying(60) NOT NULL,
    description character varying(256),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT position_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.position_translation OWNER TO postgres;

--
-- TOC entry 368 (class 1259 OID 45667)
-- Name: position_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.position_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.position_translation_id_seq OWNER TO postgres;

--
-- TOC entry 6998 (class 0 OID 0)
-- Dependencies: 368
-- Name: position_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.position_translation_id_seq OWNED BY public.position_translation.id;


--
-- TOC entry 333 (class 1259 OID 44152)
-- Name: purchase_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order (
    purchase_order_id integer NOT NULL,
    supplier_id integer NOT NULL,
    digital_copy bytea,
    is_signed_by_finance boolean,
    purchase_order_code character varying(10)
);


ALTER TABLE public.purchase_order OWNER TO postgres;

--
-- TOC entry 6999 (class 0 OID 0)
-- Dependencies: 333
-- Name: TABLE purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.purchase_order IS 'Renamed from bon_de_commande';


--
-- TOC entry 334 (class 1259 OID 44159)
-- Name: receipt_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipt_report (
    receipt_report_id integer NOT NULL,
    report_datetime timestamp without time zone,
    report_full_code character varying(48),
    digital_copy text
);


ALTER TABLE public.receipt_report OWNER TO postgres;

--
-- TOC entry 7000 (class 0 OID 0)
-- Dependencies: 334
-- Name: TABLE receipt_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receipt_report IS 'This represents the "PV de réception" for the assets';


--
-- TOC entry 335 (class 1259 OID 44165)
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    role_id integer NOT NULL,
    role_code character varying(60),
    role_label character varying(60),
    description character varying(256)
);


ALTER TABLE public.role OWNER TO postgres;

--
-- TOC entry 7001 (class 0 OID 0)
-- Dependencies: 335
-- Name: TABLE role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.role IS 'Role is what the person can do in the system';


--
-- TOC entry 7002 (class 0 OID 0)
-- Dependencies: 335
-- Name: COLUMN role.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 367 (class 1259 OID 45646)
-- Name: role_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_translation (
    id integer NOT NULL,
    role_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    role_label character varying(60) NOT NULL,
    description character varying(256),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT role_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.role_translation OWNER TO postgres;

--
-- TOC entry 366 (class 1259 OID 45645)
-- Name: role_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7003 (class 0 OID 0)
-- Dependencies: 366
-- Name: role_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_translation_id_seq OWNED BY public.role_translation.id;


--
-- TOC entry 336 (class 1259 OID 44169)
-- Name: stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item (
    stock_item_id integer NOT NULL,
    maintenance_step_id integer,
    stock_item_model_id integer NOT NULL,
    stock_item_consumable_destruction_certificate_id integer,
    stock_item_fabrication_datetime timestamp without time zone,
    stock_item_name character varying(48),
    stock_item_inventory_number character varying(6),
    stock_item_warranty_expiry_in_months integer,
    stock_item_arrival_datetime timestamp without time zone,
    stock_item_status character varying(30),
    purchase_order_id integer,
    stock_item_serial_number character varying(48)
);


ALTER TABLE public.stock_item OWNER TO postgres;

--
-- TOC entry 7004 (class 0 OID 0)
-- Dependencies: 336
-- Name: COLUMN stock_item.stock_item_serial_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.stock_item.stock_item_serial_number IS 'Serial number of the stock item';


--
-- TOC entry 337 (class 1259 OID 44174)
-- Name: stock_item_attribute_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_attribute_definition (
    stock_item_attribute_definition_id integer CONSTRAINT stock_item_attribute_defini_stock_item_attribute_defin_not_null NOT NULL,
    unit character varying(24),
    description character varying(256),
    data_type character varying(18),
    maintenance_domain character varying(24)
);


ALTER TABLE public.stock_item_attribute_definition OWNER TO postgres;

--
-- TOC entry 375 (class 1259 OID 45734)
-- Name: stock_item_attribute_definition_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_attribute_definition_translation (
    id integer NOT NULL,
    stock_item_attribute_definition_id integer CONSTRAINT stock_item_attribute_defin_stock_item_attribute_defin_not_null1 NOT NULL,
    language_code character varying(5) CONSTRAINT stock_item_attribute_definition_translat_language_code_not_null NOT NULL,
    description character varying(256) CONSTRAINT stock_item_attribute_definition_translatio_description_not_null NOT NULL,
    unit character varying(24),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT stock_item_attribute_definition_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.stock_item_attribute_definition_translation OWNER TO postgres;

--
-- TOC entry 374 (class 1259 OID 45733)
-- Name: stock_item_attribute_definition_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_attribute_definition_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_attribute_definition_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7005 (class 0 OID 0)
-- Dependencies: 374
-- Name: stock_item_attribute_definition_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_attribute_definition_translation_id_seq OWNED BY public.stock_item_attribute_definition_translation.id;


--
-- TOC entry 338 (class 1259 OID 44178)
-- Name: stock_item_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_attribute_value (
    stock_item_attribute_definition_id integer CONSTRAINT stock_item_attribute_value_stock_item_attribute_defini_not_null NOT NULL,
    stock_item_id integer NOT NULL,
    value_string character varying(1024),
    value_bool boolean,
    value_date date,
    value_number numeric(18,6)
);


ALTER TABLE public.stock_item_attribute_value OWNER TO postgres;

--
-- TOC entry 339 (class 1259 OID 44185)
-- Name: stock_item_brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_brand (
    stock_item_brand_id integer NOT NULL,
    brand_name character varying(48),
    brand_code character varying(16),
    is_active boolean,
    brand_photo character varying(255)
);


ALTER TABLE public.stock_item_brand OWNER TO postgres;

--
-- TOC entry 433 (class 1259 OID 46546)
-- Name: stock_item_brand_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_brand_translation (
    id integer NOT NULL,
    stock_item_brand_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    brand_name character varying(48) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT stock_item_brand_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.stock_item_brand_translation OWNER TO postgres;

--
-- TOC entry 432 (class 1259 OID 46545)
-- Name: stock_item_brand_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_brand_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_brand_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7006 (class 0 OID 0)
-- Dependencies: 432
-- Name: stock_item_brand_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_brand_translation_id_seq OWNED BY public.stock_item_brand_translation.id;


--
-- TOC entry 340 (class 1259 OID 44189)
-- Name: stock_item_condition_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_condition_history (
    stock_item_condition_history_id integer CONSTRAINT stock_item_condition_histor_stock_item_condition_histo_not_null NOT NULL,
    stock_item_id integer NOT NULL,
    condition_id integer NOT NULL,
    notes character varying(256),
    cosmetic_issues character varying(128),
    functional_issues character varying(128),
    recommendation character varying(24),
    created_at timestamp without time zone
);


ALTER TABLE public.stock_item_condition_history OWNER TO postgres;

--
-- TOC entry 409 (class 1259 OID 46111)
-- Name: stock_item_condition_history_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_condition_history_translation (
    id integer NOT NULL,
    stock_item_condition_history_id integer CONSTRAINT stock_item_condition_histo_stock_item_condition_histo_not_null1 NOT NULL,
    language_code character varying(5) NOT NULL,
    notes character varying(256),
    cosmetic_issues character varying(128),
    functional_issues character varying(128),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT stock_item_condition_history_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.stock_item_condition_history_translation OWNER TO postgres;

--
-- TOC entry 408 (class 1259 OID 46110)
-- Name: stock_item_condition_history_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_condition_history_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_condition_history_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7007 (class 0 OID 0)
-- Dependencies: 408
-- Name: stock_item_condition_history_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_condition_history_translation_id_seq OWNED BY public.stock_item_condition_history_translation.id;


--
-- TOC entry 341 (class 1259 OID 44197)
-- Name: stock_item_consumable_destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_consumable_destruction_certificate (
    destruction_certificate_id integer CONSTRAINT destruction_certificate_destruction_certificate_id_not_null NOT NULL,
    digital_copy text,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.stock_item_consumable_destruction_certificate OWNER TO postgres;

--
-- TOC entry 447 (class 1259 OID 47585)
-- Name: stock_item_is_assigned_to_org_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_assigned_to_org_structure (
    assignment_id integer NOT NULL,
    organizational_structure_id integer CONSTRAINT stock_item_is_assigned_to_o_organizational_structure_i_not_null NOT NULL,
    stock_item_id integer NOT NULL,
    assigned_by_person_id integer CONSTRAINT stock_item_is_assigned_to_org_st_assigned_by_person_id_not_null NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.stock_item_is_assigned_to_org_structure OWNER TO postgres;

--
-- TOC entry 446 (class 1259 OID 47584)
-- Name: stock_item_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_is_assigned_to_org_structure_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_is_assigned_to_org_structure_assignment_id_seq OWNER TO postgres;

--
-- TOC entry 7008 (class 0 OID 0)
-- Dependencies: 446
-- Name: stock_item_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_is_assigned_to_org_structure_assignment_id_seq OWNED BY public.stock_item_is_assigned_to_org_structure.assignment_id;


--
-- TOC entry 342 (class 1259 OID 44203)
-- Name: stock_item_is_assigned_to_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_assigned_to_person (
    stock_item_id integer NOT NULL,
    person_id integer NOT NULL,
    assigned_by_person_id integer NOT NULL,
    assignment_id integer NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    is_active boolean NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.stock_item_is_assigned_to_person OWNER TO postgres;

--
-- TOC entry 7009 (class 0 OID 0)
-- Dependencies: 342
-- Name: TABLE stock_item_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_is_assigned_to_person IS 'The first person is the one to whom the stock item is assign';


--
-- TOC entry 343 (class 1259 OID 44213)
-- Name: stock_item_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_compatible_with_asset (
    stock_item_model_id integer CONSTRAINT stock_item_is_compatible_with_asse_stock_item_model_id_not_null NOT NULL,
    asset_model_id integer NOT NULL
);


ALTER TABLE public.stock_item_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 344 (class 1259 OID 44218)
-- Name: stock_item_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_model (
    stock_item_model_id integer NOT NULL,
    stock_item_type_id integer NOT NULL,
    stock_item_brand_id integer NOT NULL,
    model_name character varying(48),
    model_code character varying(16),
    release_year integer,
    discontinued_year integer,
    is_active boolean,
    notes character varying(256),
    warranty_expiry_in_months integer,
    stock_item_model_name_in_administrative_certificate character varying(48)
);


ALTER TABLE public.stock_item_model OWNER TO postgres;

--
-- TOC entry 345 (class 1259 OID 44224)
-- Name: stock_item_model_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_model_attribute_value (
    stock_item_attribute_definition_id integer CONSTRAINT stock_item_model_attribute__stock_item_attribute_defin_not_null NOT NULL,
    stock_item_model_id integer NOT NULL,
    value_bool boolean,
    value_string character varying(1024),
    value_date date,
    value_number numeric(18,6)
);


ALTER TABLE public.stock_item_model_attribute_value OWNER TO postgres;

--
-- TOC entry 443 (class 1259 OID 47066)
-- Name: stock_item_model_default_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_model_default_consumable (
    id integer NOT NULL,
    stock_item_model_id integer CONSTRAINT stock_item_model_default_consumabl_stock_item_model_id_not_null NOT NULL,
    consumable_model_id integer CONSTRAINT stock_item_model_default_consumabl_consumable_model_id_not_null NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    notes character varying(256)
);


ALTER TABLE public.stock_item_model_default_consumable OWNER TO postgres;

--
-- TOC entry 442 (class 1259 OID 47065)
-- Name: stock_item_model_default_consumable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_model_default_consumable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_model_default_consumable_id_seq OWNER TO postgres;

--
-- TOC entry 7010 (class 0 OID 0)
-- Dependencies: 442
-- Name: stock_item_model_default_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_model_default_consumable_id_seq OWNED BY public.stock_item_model_default_consumable.id;


--
-- TOC entry 346 (class 1259 OID 44231)
-- Name: stock_item_model_is_found_in_purchase_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_model_is_found_in_purchase_order (
    stock_item_model_id integer CONSTRAINT stock_item_model_is_found_in_bdc_stock_item_model_id_not_null NOT NULL,
    purchase_order_id integer CONSTRAINT stock_item_model_is_found_in_bdc_purchase_order_id_not_null NOT NULL,
    quantity_ordered integer,
    quantity_received integer,
    unit_price numeric(10,2)
);


ALTER TABLE public.stock_item_model_is_found_in_purchase_order OWNER TO postgres;

--
-- TOC entry 7011 (class 0 OID 0)
-- Dependencies: 346
-- Name: TABLE stock_item_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_model_is_found_in_purchase_order IS 'Renamed from stock_item_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 421 (class 1259 OID 46239)
-- Name: stock_item_model_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_model_translation (
    id integer NOT NULL,
    stock_item_model_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    model_name character varying(48),
    notes character varying(256),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stock_item_model_name_in_administrative_certificate character varying(48),
    CONSTRAINT stock_item_model_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.stock_item_model_translation OWNER TO postgres;

--
-- TOC entry 420 (class 1259 OID 46238)
-- Name: stock_item_model_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_model_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_model_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7012 (class 0 OID 0)
-- Dependencies: 420
-- Name: stock_item_model_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_model_translation_id_seq OWNED BY public.stock_item_model_translation.id;


--
-- TOC entry 347 (class 1259 OID 44236)
-- Name: stock_item_movement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_movement (
    stock_item_movement_id integer NOT NULL,
    stock_item_id integer NOT NULL,
    source_location_id integer CONSTRAINT stock_item_movement_source_room_id_not_null NOT NULL,
    destination_location_id integer CONSTRAINT stock_item_movement_destination_room_id_not_null NOT NULL,
    maintenance_step_id integer,
    external_maintenance_step_id integer,
    movement_reason character varying(128) NOT NULL,
    movement_datetime timestamp without time zone NOT NULL,
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL,
    maintenance_id integer
);


ALTER TABLE public.stock_item_movement OWNER TO postgres;

--
-- TOC entry 395 (class 1259 OID 45955)
-- Name: stock_item_movement_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_movement_translation (
    id integer NOT NULL,
    stock_item_movement_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    movement_reason character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT stock_item_movement_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.stock_item_movement_translation OWNER TO postgres;

--
-- TOC entry 394 (class 1259 OID 45954)
-- Name: stock_item_movement_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_movement_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_movement_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7013 (class 0 OID 0)
-- Dependencies: 394
-- Name: stock_item_movement_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_movement_translation_id_seq OWNED BY public.stock_item_movement_translation.id;


--
-- TOC entry 415 (class 1259 OID 46176)
-- Name: stock_item_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_translation (
    id integer NOT NULL,
    stock_item_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    stock_item_name character varying(48),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stock_item_status character varying(60),
    CONSTRAINT stock_item_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.stock_item_translation OWNER TO postgres;

--
-- TOC entry 414 (class 1259 OID 46175)
-- Name: stock_item_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7014 (class 0 OID 0)
-- Dependencies: 414
-- Name: stock_item_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_translation_id_seq OWNED BY public.stock_item_translation.id;


--
-- TOC entry 348 (class 1259 OID 44247)
-- Name: stock_item_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_type (
    stock_item_type_id integer NOT NULL,
    stock_item_type_label character varying(60),
    stock_item_type_code character varying(18),
    photo character varying(512)
);


ALTER TABLE public.stock_item_type OWNER TO postgres;

--
-- TOC entry 349 (class 1259 OID 44253)
-- Name: stock_item_type_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_type_attribute (
    stock_item_attribute_definition_id integer CONSTRAINT stock_item_type_attribute_stock_item_attribute_definit_not_null NOT NULL,
    stock_item_type_id integer NOT NULL,
    is_mandatory boolean,
    default_value character varying(255)
);


ALTER TABLE public.stock_item_type_attribute OWNER TO postgres;

--
-- TOC entry 359 (class 1259 OID 45558)
-- Name: stock_item_type_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_type_translation (
    id integer NOT NULL,
    stock_item_type_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    stock_item_type_label character varying(60) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT stock_item_type_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.stock_item_type_translation OWNER TO postgres;

--
-- TOC entry 358 (class 1259 OID 45557)
-- Name: stock_item_type_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_item_type_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_item_type_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7015 (class 0 OID 0)
-- Dependencies: 358
-- Name: stock_item_type_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_item_type_translation_id_seq OWNED BY public.stock_item_type_translation.id;


--
-- TOC entry 350 (class 1259 OID 44258)
-- Name: supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier (
    supplier_id integer NOT NULL,
    supplier_name character varying(60),
    supplier_address character varying(128),
    supplier_commercial_register_number character varying(128),
    supplier_rib integer,
    supplier_cpa character varying(128),
    supplier_fiscal_identification_number integer,
    supplier_fiscal_static_number integer
);


ALTER TABLE public.supplier OWNER TO postgres;

--
-- TOC entry 383 (class 1259 OID 45823)
-- Name: supplier_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_translation (
    id integer NOT NULL,
    supplier_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    supplier_name character varying(60) NOT NULL,
    supplier_address character varying(128),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT supplier_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.supplier_translation OWNER TO postgres;

--
-- TOC entry 382 (class 1259 OID 45822)
-- Name: supplier_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.supplier_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.supplier_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7016 (class 0 OID 0)
-- Dependencies: 382
-- Name: supplier_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.supplier_translation_id_seq OWNED BY public.supplier_translation.id;


--
-- TOC entry 351 (class 1259 OID 44262)
-- Name: user_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_account (
    user_id integer NOT NULL,
    person_id integer NOT NULL,
    username character varying(20) NOT NULL,
    password_hash character varying(512) NOT NULL,
    created_at_datetime timestamp without time zone NOT NULL,
    disabled_at_datetime timestamp without time zone NOT NULL,
    last_login timestamp without time zone NOT NULL,
    account_status character varying(24) NOT NULL,
    failed_login_attempts integer NOT NULL,
    password_last_changed_datetime timestamp without time zone NOT NULL,
    created_by_user_id integer,
    modified_by_user_id integer,
    modified_at_datetime timestamp without time zone NOT NULL,
    is_approved boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_account OWNER TO postgres;

--
-- TOC entry 352 (class 1259 OID 44278)
-- Name: user_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_session (
    session_id integer NOT NULL,
    user_id integer NOT NULL,
    ip_address character varying(45) NOT NULL,
    user_agent character varying(60),
    login_datetime timestamp without time zone NOT NULL,
    last_activity timestamp without time zone NOT NULL,
    logout_datetime timestamp without time zone
);


ALTER TABLE public.user_session OWNER TO postgres;

--
-- TOC entry 353 (class 1259 OID 44286)
-- Name: warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse (
    warehouse_id integer NOT NULL,
    warehouse_name character varying(60),
    warehouse_address character varying(128)
);


ALTER TABLE public.warehouse OWNER TO postgres;

--
-- TOC entry 7017 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE warehouse; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.warehouse IS 'Warehouse" is in our case "ERI/2RM';


--
-- TOC entry 385 (class 1259 OID 45845)
-- Name: warehouse_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_translation (
    id integer NOT NULL,
    warehouse_id integer NOT NULL,
    language_code character varying(5) NOT NULL,
    warehouse_name character varying(60) NOT NULL,
    warehouse_address character varying(128),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT warehouse_translation_language_code_check CHECK (((language_code)::text = ANY ((ARRAY['en'::character varying, 'ar'::character varying])::text[])))
);


ALTER TABLE public.warehouse_translation OWNER TO postgres;

--
-- TOC entry 384 (class 1259 OID 45844)
-- Name: warehouse_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouse_translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouse_translation_id_seq OWNER TO postgres;

--
-- TOC entry 7018 (class 0 OID 0)
-- Dependencies: 384
-- Name: warehouse_translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouse_translation_id_seq OWNED BY public.warehouse_translation.id;


--
-- TOC entry 5694 (class 2604 OID 46263)
-- Name: administrative_certificate_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate_translation ALTER COLUMN id SET DEFAULT nextval('public.administrative_certificate_translation_id_seq'::regclass);


--
-- TOC entry 5616 (class 2604 OID 45693)
-- Name: asset_attribute_definition_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_attribute_definition_translation_id_seq'::regclass);


--
-- TOC entry 5706 (class 2604 OID 46527)
-- Name: asset_brand_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_brand_translation_id_seq'::regclass);


--
-- TOC entry 5667 (class 2604 OID 46068)
-- Name: asset_condition_history_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_condition_history_translation_id_seq'::regclass);


--
-- TOC entry 5563 (class 2604 OID 44290)
-- Name: asset_destruction_certificate_asset id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset ALTER COLUMN id SET DEFAULT nextval('public.asset_destruction_certificate_asset_id_seq'::regclass);


--
-- TOC entry 5715 (class 2604 OID 46988)
-- Name: asset_incident_report_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_incident_report_translation_id_seq'::regclass);


--
-- TOC entry 5725 (class 2604 OID 47551)
-- Name: asset_is_assigned_to_org_structure assignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_org_structure ALTER COLUMN assignment_id SET DEFAULT nextval('public.asset_is_assigned_to_org_structure_assignment_id_seq'::regclass);


--
-- TOC entry 5571 (class 2604 OID 44291)
-- Name: asset_is_composed_of_consumable_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_consumable_history_id_seq'::regclass);


--
-- TOC entry 5572 (class 2604 OID 44292)
-- Name: asset_is_composed_of_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5573 (class 2604 OID 44293)
-- Name: asset_model_default_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_consumable_id_seq'::regclass);


--
-- TOC entry 5575 (class 2604 OID 44294)
-- Name: asset_model_default_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_stock_item_id_seq'::regclass);


--
-- TOC entry 5685 (class 2604 OID 46200)
-- Name: asset_model_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_model_translation_id_seq'::regclass);


--
-- TOC entry 5646 (class 2604 OID 45914)
-- Name: asset_movement_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_movement_translation_id_seq'::regclass);


--
-- TOC entry 5676 (class 2604 OID 46137)
-- Name: asset_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_translation_id_seq'::regclass);


--
-- TOC entry 5592 (class 2604 OID 45517)
-- Name: asset_type_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_translation ALTER COLUMN id SET DEFAULT nextval('public.asset_type_translation_id_seq'::regclass);


--
-- TOC entry 5578 (class 2604 OID 44295)
-- Name: attribution_order_asset_consumable_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_consumable_accessory_id_seq'::regclass);


--
-- TOC entry 5579 (class 2604 OID 44296)
-- Name: attribution_order_asset_stock_item_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_stock_item_accessory_id_seq'::regclass);


--
-- TOC entry 5697 (class 2604 OID 46284)
-- Name: company_asset_request_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request_translation ALTER COLUMN id SET DEFAULT nextval('public.company_asset_request_translation_id_seq'::regclass);


--
-- TOC entry 5619 (class 2604 OID 45715)
-- Name: consumable_attribute_definition_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition_translation ALTER COLUMN id SET DEFAULT nextval('public.consumable_attribute_definition_translation_id_seq'::regclass);


--
-- TOC entry 5712 (class 2604 OID 46571)
-- Name: consumable_brand_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand_translation ALTER COLUMN id SET DEFAULT nextval('public.consumable_brand_translation_id_seq'::regclass);


--
-- TOC entry 5670 (class 2604 OID 46091)
-- Name: consumable_condition_history_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history_translation ALTER COLUMN id SET DEFAULT nextval('public.consumable_condition_history_translation_id_seq'::regclass);


--
-- TOC entry 5729 (class 2604 OID 47625)
-- Name: consumable_is_assigned_to_org_structure assignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_org_structure ALTER COLUMN assignment_id SET DEFAULT nextval('public.consumable_is_assigned_to_org_structure_assignment_id_seq'::regclass);


--
-- TOC entry 5580 (class 2604 OID 44297)
-- Name: consumable_is_used_in_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.consumable_is_used_in_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5688 (class 2604 OID 46221)
-- Name: consumable_model_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_translation ALTER COLUMN id SET DEFAULT nextval('public.consumable_model_translation_id_seq'::regclass);


--
-- TOC entry 5649 (class 2604 OID 45936)
-- Name: consumable_movement_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement_translation ALTER COLUMN id SET DEFAULT nextval('public.consumable_movement_translation_id_seq'::regclass);


--
-- TOC entry 5679 (class 2604 OID 46158)
-- Name: consumable_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_translation ALTER COLUMN id SET DEFAULT nextval('public.consumable_translation_id_seq'::regclass);


--
-- TOC entry 5595 (class 2604 OID 45539)
-- Name: consumable_type_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_translation ALTER COLUMN id SET DEFAULT nextval('public.consumable_type_translation_id_seq'::regclass);


--
-- TOC entry 5700 (class 2604 OID 46305)
-- Name: external_maintenance_document_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document_translation ALTER COLUMN id SET DEFAULT nextval('public.external_maintenance_document_translation_id_seq'::regclass);


--
-- TOC entry 5628 (class 2604 OID 45781)
-- Name: external_maintenance_typical_step_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step_translation ALTER COLUMN id SET DEFAULT nextval('public.external_maintenance_typical_step_translation_id_seq'::regclass);


--
-- TOC entry 5640 (class 2604 OID 45870)
-- Name: location_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_translation ALTER COLUMN id SET DEFAULT nextval('public.location_translation_id_seq'::regclass);


--
-- TOC entry 5583 (class 2604 OID 44298)
-- Name: location_type location_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type ALTER COLUMN location_type_id SET DEFAULT nextval('public.location_type_location_type_id_seq'::regclass);


--
-- TOC entry 5601 (class 2604 OID 45583)
-- Name: location_type_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type_translation ALTER COLUMN id SET DEFAULT nextval('public.location_type_translation_id_seq'::regclass);


--
-- TOC entry 5703 (class 2604 OID 46326)
-- Name: maintenance_step_item_request_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request_translation ALTER COLUMN id SET DEFAULT nextval('public.maintenance_step_item_request_translation_id_seq'::regclass);


--
-- TOC entry 5718 (class 2604 OID 47014)
-- Name: maintenance_step_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_status ALTER COLUMN id SET DEFAULT nextval('public.maintenance_step_status_id_seq'::regclass);


--
-- TOC entry 5720 (class 2604 OID 47026)
-- Name: maintenance_step_status_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_status_translation ALTER COLUMN id SET DEFAULT nextval('public.maintenance_step_status_translation_id_seq'::regclass);


--
-- TOC entry 5664 (class 2604 OID 46046)
-- Name: maintenance_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_translation ALTER COLUMN id SET DEFAULT nextval('public.maintenance_translation_id_seq'::regclass);


--
-- TOC entry 5625 (class 2604 OID 45759)
-- Name: maintenance_typical_step_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step_translation ALTER COLUMN id SET DEFAULT nextval('public.maintenance_typical_step_translation_id_seq'::regclass);


--
-- TOC entry 5643 (class 2604 OID 45892)
-- Name: organizational_structure_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_translation ALTER COLUMN id SET DEFAULT nextval('public.organizational_structure_translation_id_seq'::regclass);


--
-- TOC entry 5585 (class 2604 OID 44299)
-- Name: organizational_structure_type organizational_structure_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_type ALTER COLUMN organizational_structure_type_id SET DEFAULT nextval('public.organizational_structure_type_organizational_structure_type_seq'::regclass);


--
-- TOC entry 5604 (class 2604 OID 45605)
-- Name: organizational_structure_type_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_type_translation ALTER COLUMN id SET DEFAULT nextval('public.organizational_structure_type_translation_id_seq'::regclass);


--
-- TOC entry 5586 (class 2604 OID 44300)
-- Name: person_reports_problem_on_asset_included_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_consumable_id_seq'::regclass);


--
-- TOC entry 5587 (class 2604 OID 44301)
-- Name: person_reports_problem_on_asset_included_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_stock_item_id_seq'::regclass);


--
-- TOC entry 5655 (class 2604 OID 45980)
-- Name: person_reports_problem_on_asset_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_translation ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_translation_id_seq'::regclass);


--
-- TOC entry 5658 (class 2604 OID 46002)
-- Name: person_reports_problem_on_consumable_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable_translation ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_consumable_translation_id_seq'::regclass);


--
-- TOC entry 5661 (class 2604 OID 46024)
-- Name: person_reports_problem_on_stock_item_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item_translation ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_stock_item_translation_id_seq'::regclass);


--
-- TOC entry 5631 (class 2604 OID 45803)
-- Name: person_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_translation ALTER COLUMN id SET DEFAULT nextval('public.person_translation_id_seq'::regclass);


--
-- TOC entry 5607 (class 2604 OID 45627)
-- Name: physical_condition_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition_translation ALTER COLUMN id SET DEFAULT nextval('public.physical_condition_translation_id_seq'::regclass);


--
-- TOC entry 5613 (class 2604 OID 45671)
-- Name: position_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_translation ALTER COLUMN id SET DEFAULT nextval('public.position_translation_id_seq'::regclass);


--
-- TOC entry 5610 (class 2604 OID 45649)
-- Name: role_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_translation ALTER COLUMN id SET DEFAULT nextval('public.role_translation_id_seq'::regclass);


--
-- TOC entry 5622 (class 2604 OID 45737)
-- Name: stock_item_attribute_definition_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition_translation ALTER COLUMN id SET DEFAULT nextval('public.stock_item_attribute_definition_translation_id_seq'::regclass);


--
-- TOC entry 5709 (class 2604 OID 46549)
-- Name: stock_item_brand_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand_translation ALTER COLUMN id SET DEFAULT nextval('public.stock_item_brand_translation_id_seq'::regclass);


--
-- TOC entry 5673 (class 2604 OID 46114)
-- Name: stock_item_condition_history_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history_translation ALTER COLUMN id SET DEFAULT nextval('public.stock_item_condition_history_translation_id_seq'::regclass);


--
-- TOC entry 5727 (class 2604 OID 47588)
-- Name: stock_item_is_assigned_to_org_structure assignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_org_structure ALTER COLUMN assignment_id SET DEFAULT nextval('public.stock_item_is_assigned_to_org_structure_assignment_id_seq'::regclass);


--
-- TOC entry 5723 (class 2604 OID 47069)
-- Name: stock_item_model_default_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_default_consumable ALTER COLUMN id SET DEFAULT nextval('public.stock_item_model_default_consumable_id_seq'::regclass);


--
-- TOC entry 5691 (class 2604 OID 46242)
-- Name: stock_item_model_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_translation ALTER COLUMN id SET DEFAULT nextval('public.stock_item_model_translation_id_seq'::regclass);


--
-- TOC entry 5652 (class 2604 OID 45958)
-- Name: stock_item_movement_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement_translation ALTER COLUMN id SET DEFAULT nextval('public.stock_item_movement_translation_id_seq'::regclass);


--
-- TOC entry 5682 (class 2604 OID 46179)
-- Name: stock_item_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_translation ALTER COLUMN id SET DEFAULT nextval('public.stock_item_translation_id_seq'::regclass);


--
-- TOC entry 5598 (class 2604 OID 45561)
-- Name: stock_item_type_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_translation ALTER COLUMN id SET DEFAULT nextval('public.stock_item_type_translation_id_seq'::regclass);


--
-- TOC entry 5634 (class 2604 OID 45826)
-- Name: supplier_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_translation ALTER COLUMN id SET DEFAULT nextval('public.supplier_translation_id_seq'::regclass);


--
-- TOC entry 5637 (class 2604 OID 45848)
-- Name: warehouse_translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_translation ALTER COLUMN id SET DEFAULT nextval('public.warehouse_translation_id_seq'::regclass);


--
-- TOC entry 6700 (class 0 OID 43519)
-- Dependencies: 219
-- Data for Name: acceptance_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acceptance_report (acceptance_report_id, delivery_note_id, acceptance_report_datetime, is_signed_by_director_of_administration_and_support, is_signed_by_protection_and_security_bureau_chief, is_signed_by_information_technilogy_bureau_chief, acceptance_report_is_stock_item_and_consumable_responsible, is_signed_by_school_headquarter, digital_copy) FROM stdin;
1	1	2026-04-23 21:42:49.913658	t	t	t	t	t	acceptance_reports\\delivery_note_1\\acceptance_report_1.pdf
2	3	2026-04-28 17:05:15.078256	t	t	t	t	t	acceptance_reports\\delivery_note_3\\acceptance_report_2.pdf
3	4	2026-04-28 17:39:09.590713	t	t	t	t	t	acceptance_reports\\delivery_note_4\\acceptance_report_3.pdf
4	5	2026-04-28 18:37:12.302514	t	t	t	t	t	acceptance_reports\\delivery_note_5\\acceptance_report_4.pdf
\.


--
-- TOC entry 6701 (class 0 OID 43526)
-- Dependencies: 220
-- Data for Name: administrative_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_certificate (administrative_certificate_id, warehouse_id, attribution_order_id, receipt_report_id, interested_organization, operation, format, is_signed_by_warehouse_storage_magaziner, is_signed_by_warehouse_storage_accountant, is_signed_by_warehouse_storage_marketer, is_signed_by_warehouse_it_chief, is_signed_by_warehouse_leader, digital_copy, are_items_moved) FROM stdin;
2	1	40	10	\N	entry	\N	f	f	f	f	f	\N	f
1	1	40	9	\N	entry	\N	t	t	t	t	t	\N	f
3	1	41	11	\N	entry	\N	t	t	t	t	t	\N	f
\.


--
-- TOC entry 6904 (class 0 OID 46260)
-- Dependencies: 423
-- Data for Name: administrative_certificate_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_certificate_translation (id, administrative_certificate_id, language_code, interested_organization, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6702 (class 0 OID 43537)
-- Dependencies: 221
-- Data for Name: asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset (asset_id, asset_model_id, attribution_order_id, destruction_certificate_id, asset_serial_number, asset_fabrication_datetime, asset_inventory_number, asset_service_tag, asset_name, asset_name_in_the_administrative_certificate, asset_arrival_datetime, asset_status) FROM stdin;
1	78	\N	\N	4785	\N	444		testest	\N	\N	not_delivered_to_company
2	78	\N	\N	333	\N	333		ccc	\N	\N	not_delivered_to_company
3	78	\N	\N	789	\N	789		fff	\N	\N	not_delivered_to_company
\.


--
-- TOC entry 6703 (class 0 OID 43542)
-- Dependencies: 222
-- Data for Name: asset_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_definition (asset_attribute_definition_id, data_type, unit, description, maintenance_domain) FROM stdin;
2	number	mAh	Battery Capacity	\N
3	string	\N	Disk Type	\N
4	number	mm	Dimension X	\N
5	string	\N	IPv4 Address	\N
6	string	\N	IPv6 Address	\N
7	string	\N	MAC Address	\N
8	string	\N	Username	\N
9	number	mm	Dimension Y	\N
10	number	mm	Dimension Z	\N
11	string	\N	NetBIOS	\N
12	string	\N	Password	\N
13	bool	\N	Camera Included	\N
1	number	Inch	Screen Size	network
14	string	\N	Screen Resolution	\N
15	string	\N	Projection Resolution	\N
16	string	\N	Paper Size	\N
17	number	W	Power Capacity	\N
18	number	GB	Default RAM Size	\N
19	string	\N	Default RAM Generation (DDRx)	\N
20	string	\N	Default CPU	\N
21	string	\N	Default Integrated GPU	\N
22	string	\N	Default Dedicated GPU	\N
24	number	\N	Number of Ethernet Ports	\N
25	string	\N	Printing Technology	\N
26	number	DPI	Max Resolution (DPI)	\N
27	string	\N	Wire Type (Ethernet / USB)	\N
28	string	\N	Wireless Connection Type (Bluetooth, Wi-Fi, Both)	\N
29	number	Paper(s)	Paper Capacity	\N
30	number	g	Weight	\N
31	string	\N	Panel Type	\N
32	number	Hz	Refresh Rate	\N
33	bool	\N	Fingerprint Reader Included	\N
34	number	bit(s)	Color Bit Depth	\N
35	string	\N	Display Panel Technology	\N
36	number	mS	Screen Response Time	\N
37	string	\N	Aspect Ratio	\N
38	string	\N	Display Ports	\N
23	bool	\N	Colors Printing?	\N
39	string	\N	Light Source Technology	\N
40	number	MB	Port Speed	\N
41	bool	\N	Management (Managed / Unmanaged)	\N
42	bool	\N	Power Over Ethernet (PoE)	\N
43	number	\N	Layer (2/3)	\N
44	string	\N	Standard Ethernet Category	\N
45	number	Inch	wwwwwwwww	\N
46	number	cccccc	ooooooooooooooooo	\N
\.


--
-- TOC entry 6852 (class 0 OID 45690)
-- Dependencies: 371
-- Data for Name: asset_attribute_definition_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_definition_translation (id, asset_attribute_definition_id, language_code, description, unit, created_at, updated_at) FROM stdin;
1	2	en	Battery Capacity	mAh	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
2	3	en	Disk Type	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
3	4	en	Dimension X	mm	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
4	5	en	IPv4 Address	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
5	6	en	IPv6 Address	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
6	7	en	MAC Address	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
7	8	en	Username	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
8	9	en	Dimension Y	mm	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
9	10	en	Dimension Z	mm	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
10	11	en	NetBIOS	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
11	12	en	Password	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
12	13	en	Camera Included	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
13	1	en	Screen Size	Inch	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
14	14	en	Screen Resolution	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
15	15	en	Projection Resolution	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
16	16	en	Paper Size	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
17	17	en	Power Capacity	W	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
18	18	en	Default RAM Size	GB	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
19	19	en	Default RAM Generation (DDRx)	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
20	20	en	Default CPU	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
21	21	en	Default Integrated GPU	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
22	22	en	Default Dedicated GPU	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
23	24	en	Number of Ethernet Ports	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
24	25	en	Printing Technology	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
25	26	en	Max Resolution (DPI)	DPI	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
26	27	en	Wire Type (Ethernet / USB)	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
27	28	en	Wireless Connection Type (Bluetooth, Wi-Fi, Both)	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
28	29	en	Paper Capacity	Paper(s)	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
29	30	en	Weight	g	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
30	31	en	Panel Type	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
31	32	en	Refresh Rate	Hz	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
32	33	en	Fingerprint Reader Included	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
33	34	en	Color Bit Depth	bit(s)	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
34	35	en	Display Panel Technology	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
35	36	en	Screen Response Time	mS	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
36	37	en	Aspect Ratio	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
37	38	en	Display Ports	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
38	23	en	Colors Printing?	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
39	39	en	Light Source Technology	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
40	40	en	Port Speed	MB	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
41	41	en	Management (Managed / Unmanaged)	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
42	42	en	Power Over Ethernet (PoE)	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
43	43	en	Layer (2/3)	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
44	44	en	Standard Ethernet Category	\N	2026-04-18 20:18:22.176366	2026-04-18 20:18:22.176366
46	2	ar	سعة البطارية	\N	2026-04-20 10:31:27.922462	2026-04-20 10:37:43.28277
48	4	ar	البعد X	\N	2026-04-20 10:31:27.926142	2026-04-20 10:37:43.286278
49	5	ar	عنوان IPv4	\N	2026-04-20 10:31:27.927552	2026-04-20 10:37:43.288187
50	6	ar	عنوان IPv6	\N	2026-04-20 10:31:27.928831	2026-04-20 10:37:43.289889
51	7	ar	عنوان MAC	\N	2026-04-20 10:31:27.929891	2026-04-20 10:37:43.291406
52	8	ar	اسم المستخدم	\N	2026-04-20 10:31:27.930927	2026-04-20 10:37:43.293011
53	9	ar	البعد Y	\N	2026-04-20 10:31:27.93191	2026-04-20 10:37:43.295182
54	10	ar	البعد Z	\N	2026-04-20 10:31:27.932904	2026-04-20 10:37:43.297215
55	11	ar	NetBIOS	\N	2026-04-20 10:31:27.933908	2026-04-20 10:37:43.298739
56	12	ar	كلمة المرور	\N	2026-04-20 10:31:27.934913	2026-04-20 10:37:43.300178
57	13	ar	كاميرا مدمجة	\N	2026-04-20 10:31:27.935898	2026-04-20 10:37:43.301632
58	14	ar	دقة الشاشة	\N	2026-04-20 10:31:27.936873	2026-04-20 10:37:43.303067
59	15	ar	دقة العرض	\N	2026-04-20 10:31:27.938244	2026-04-20 10:37:43.304605
60	16	ar	حجم الورق	\N	2026-04-20 10:31:27.939857	2026-04-20 10:37:43.306009
61	17	ar	سعة الطاقة	\N	2026-04-20 10:31:27.941733	2026-04-20 10:37:43.307351
62	18	ar	حجم الذاكرة الافتراضي	\N	2026-04-20 10:31:27.943317	2026-04-20 10:37:43.308836
63	19	ar	جيل الذاكرة	\N	2026-04-20 10:31:27.944627	2026-04-20 10:37:43.310447
64	20	ar	المعالج الافتراضي	\N	2026-04-20 10:31:27.94573	2026-04-20 10:37:43.312159
65	21	ar	كرت الشاشة المدمج	\N	2026-04-20 10:31:27.946725	2026-04-20 10:37:43.313756
66	22	ar	كرت الشاشة المنفصل	\N	2026-04-20 10:31:27.947743	2026-04-20 10:37:43.315721
67	23	ar	طباعة ملونة؟	\N	2026-04-20 10:31:27.948994	2026-04-20 10:37:43.317519
68	24	ar	عدد منافذ Ethernet	\N	2026-04-20 10:31:27.950079	2026-04-20 10:37:43.31902
69	25	ar	تقنية الطباعة	\N	2026-04-20 10:31:27.951093	2026-04-20 10:37:43.320309
70	26	ar	الدقة القصوى	\N	2026-04-20 10:31:27.952126	2026-04-20 10:37:43.321536
71	27	ar	نوع الكابل	\N	2026-04-20 10:31:27.95311	2026-04-20 10:37:43.323199
72	28	ar	نوع الاتصال اللاسلكي	\N	2026-04-20 10:31:27.954231	2026-04-20 10:37:43.324599
73	29	ar	سعة الورق	\N	2026-04-20 10:31:27.955507	2026-04-20 10:37:43.325966
74	30	ar	الوزن	\N	2026-04-20 10:31:27.956976	2026-04-20 10:37:43.32749
75	31	ar	نوع اللوحة	\N	2026-04-20 10:31:27.958878	2026-04-20 10:37:43.329056
76	32	ar	معدل التحديث	\N	2026-04-20 10:31:27.960896	2026-04-20 10:37:43.330328
77	33	ar	قارئ بصمات	\N	2026-04-20 10:31:27.962478	2026-04-20 10:37:43.331544
78	34	ar	عمق الألوان	\N	2026-04-20 10:31:27.963589	2026-04-20 10:37:43.333109
79	35	ar	تقنية اللوحة	\N	2026-04-20 10:31:27.964625	2026-04-20 10:37:43.334691
80	36	ar	زمن الاستجابة	\N	2026-04-20 10:31:27.965658	2026-04-20 10:37:43.336198
81	37	ar	نسبة العرض	\N	2026-04-20 10:31:27.966681	2026-04-20 10:37:43.337734
82	38	ar	منافذ العرض	\N	2026-04-20 10:31:27.967928	2026-04-20 10:37:43.339324
83	39	ar	تقنية الضوء	\N	2026-04-20 10:31:27.968932	2026-04-20 10:37:43.340763
85	41	ar	الإدارة	\N	2026-04-20 10:31:27.970932	2026-04-20 10:37:43.344001
86	42	ar	PoE	\N	2026-04-20 10:31:27.971929	2026-04-20 10:37:43.346074
87	43	ar	الطبقة	\N	2026-04-20 10:31:27.97293	2026-04-20 10:37:43.347783
88	44	ar	فئة Ethernet	\N	2026-04-20 10:31:27.974744	2026-04-20 10:37:43.349166
90	45	ar	قققققققققق	\N	2026-04-21 13:18:58.47534	2026-04-21 13:18:58.475375
45	1	ar	حجم الشاشة	\N	2026-04-20 10:31:27.920175	2026-04-20 10:37:43.280602
47	3	ar	نوع القرص	\N	2026-04-20 10:31:27.924245	2026-04-20 10:37:43.284699
84	40	ar	سرعة المنفذ	\N	2026-04-20 10:31:27.96994	2026-04-20 10:37:43.342338
93	46	ar	خخخخخخخخخخخخخخخ	ccccc	2026-04-21 13:24:05.329674	2026-04-21 13:24:05.329708
94	46	en	ooooooooooooooooo	cccccc	2026-04-21 13:24:05.344296	2026-04-21 13:24:05.344325
\.


--
-- TOC entry 6704 (class 0 OID 43546)
-- Dependencies: 223
-- Data for Name: asset_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_value (asset_attribute_definition_id, asset_id, value_string, value_bool, value_date, value_number) FROM stdin;
\.


--
-- TOC entry 6705 (class 0 OID 43553)
-- Dependencies: 224
-- Data for Name: asset_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_brand (asset_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	Acer	ACER	t	NULL
2	Fujitsu	FUJITSU	t	NULL
3	Condor	CONDOR	t	NULL
4	WADOO	WADOO	t	NULL
5	DTSIG	DTSIG	t	NULL
6	HP	HP	t	NULL
7	OKI	OKI	t	NULL
8	Epson	EPSON	t	NULL
9	Panasonic	PANASONIC	t	NULL
10	DELL	DELL	t	NULL
11	Kyocera	KYOCERA	t	NULL
12	XEROX	XEROX	t	NULL
13	EATON	EATON	t	NULL
14	Mac-Tech	MACTECH	t	NULL
15	CANON	CANON	t	NULL
16	TALLY	TALLY	t	NULL
17	RICOH	RICOH	t	NULL
18	Siemens	SIEMENS	t	NULL
19	DTSCC	DTSCC	t	NULL
20	Avision	AVISION	t	NULL
21	Lexmark	LEXMARK	t	NULL
22	Pantum	PANTUM	t	NULL
23	Dascom	DASCOM	t	NULL
24	D-Link	D-LINK	t	NULL
25	Cisco	CISCO	t	NULL
26	TP-Link	TPLINK	t	NULL
27	Intex	INTEX	t	NULL
28	AVAYA	AVAYA	t	NULL
29	i2S	I2S	t	NULL
30	TestBrand1	TEST1	t	\N
31	TestBrand2	TEST2	t	\N
32	TestBrand3	TEST3	t	\N
33	Test	TEST	t	\N
34	EnglishBrand	ENBRAND	t	\N
35	brand final test	BRAND_FINAL_TEST	t	\N
\.


--
-- TOC entry 6912 (class 0 OID 46524)
-- Dependencies: 431
-- Data for Name: asset_brand_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_brand_translation (id, asset_brand_id, language_code, brand_name, created_at, updated_at) FROM stdin;
1	1	en	Acer	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
2	2	en	Fujitsu	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
3	3	en	Condor	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
4	4	en	WADOO	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
5	5	en	DTSIG	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
6	6	en	HP	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
7	7	en	OKI	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
8	8	en	Epson	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
9	9	en	Panasonic	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
10	10	en	DELL	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
11	11	en	Kyocera	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
12	12	en	XEROX	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
13	13	en	EATON	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
14	14	en	Mac-Tech	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
15	15	en	CANON	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
16	16	en	TALLY	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
17	17	en	RICOH	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
18	18	en	Siemens	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
19	19	en	DTSCC	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
20	20	en	Avision	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
21	21	en	Lexmark	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
22	22	en	Pantum	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
23	23	en	Dascom	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
24	24	en	D-Link	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
25	25	en	Cisco	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
26	26	en	TP-Link	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
27	27	en	Intex	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
28	28	en	AVAYA	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
29	29	en	i2S	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
30	31	ar	علامة	2026-04-21 12:09:26.007992	2026-04-21 12:09:26.008002
31	32	ar	علامة	2026-04-21 12:09:26.021516	2026-04-21 12:09:26.021524
32	33	ar	تجريب	2026-04-21 12:13:38.541246	2026-04-21 12:13:38.541272
33	34	ar	علامة عربية	2026-04-21 12:19:45.863354	2026-04-21 12:19:45.863365
34	34	en	EnglishBrand	2026-04-21 12:19:45.870081	2026-04-21 12:19:45.870088
35	35	ar	التجربة الأخيرة	2026-04-21 12:20:24.310981	2026-04-21 12:20:24.311016
36	35	en	brand final test	2026-04-21 12:20:24.320327	2026-04-21 12:20:24.320363
\.


--
-- TOC entry 6706 (class 0 OID 43557)
-- Dependencies: 225
-- Data for Name: asset_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_condition_history (asset_condition_history_id, asset_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 6886 (class 0 OID 46065)
-- Dependencies: 405
-- Data for Name: asset_condition_history_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_condition_history_translation (id, asset_condition_history_id, language_code, notes, cosmetic_issues, functional_issues, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6707 (class 0 OID 43565)
-- Dependencies: 226
-- Data for Name: asset_destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_destruction_certificate (asset_destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
1	destruction_certificates\\destruction_certificate_1.pdf	2026-03-07 19:35:07.915855
2	destruction_certificates\\destruction_certificate_2.pdf	2026-03-07 20:37:18.994153
3	\N	2026-03-19 09:32:17.499078
\.


--
-- TOC entry 6708 (class 0 OID 43571)
-- Dependencies: 227
-- Data for Name: asset_destruction_certificate_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_destruction_certificate_asset (id, asset_destruction_certificate_id, asset_id, external_maintenance_id) FROM stdin;
\.


--
-- TOC entry 6710 (class 0 OID 43579)
-- Dependencies: 229
-- Data for Name: asset_failed_external_maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_failed_external_maintenance (asset_id, external_maintenance_id, failed_datetime) FROM stdin;
\.


--
-- TOC entry 6711 (class 0 OID 43584)
-- Dependencies: 230
-- Data for Name: asset_incident_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_incident_report (asset_incident_report_id, asset_id, owner_person_id, school_headquarter_person_id, reason, owner_note, digital_copy, is_signed_by_owner, is_signed_by_it_bureau_chief, is_signed_by_exploitation_chief, is_signed_by_protection_and_security_bureau_chief, is_signed_by_school_headquarter, it_bureau_chief_note, exploitation_chief_note, protection_and_security_bureau_chief_note, school_headquarter_note, report_datetime, status, maintenance_id) FROM stdin;
\.


--
-- TOC entry 6713 (class 0 OID 43610)
-- Dependencies: 232
-- Data for Name: asset_incident_report_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_incident_report_consumable (id, asset_incident_report_id, consumable_id) FROM stdin;
\.


--
-- TOC entry 6715 (class 0 OID 43617)
-- Dependencies: 234
-- Data for Name: asset_incident_report_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_incident_report_stock_item (id, asset_incident_report_id, stock_item_id) FROM stdin;
\.


--
-- TOC entry 6918 (class 0 OID 46985)
-- Dependencies: 437
-- Data for Name: asset_incident_report_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_incident_report_translation (id, asset_incident_report_id, language_code, reason, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6926 (class 0 OID 47548)
-- Dependencies: 445
-- Data for Name: asset_is_assigned_to_org_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_assigned_to_org_structure (assignment_id, organizational_structure_id, asset_id, assigned_by_person_id, start_datetime, end_datetime, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
\.


--
-- TOC entry 6717 (class 0 OID 43624)
-- Dependencies: 236
-- Data for Name: asset_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_assigned_to_person (person_id, asset_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
\.


--
-- TOC entry 6718 (class 0 OID 43634)
-- Dependencies: 237
-- Data for Name: asset_is_composed_of_consumable_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_composed_of_consumable_history (consumable_id, asset_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
\.


--
-- TOC entry 6720 (class 0 OID 43641)
-- Dependencies: 239
-- Data for Name: asset_is_composed_of_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_composed_of_stock_item_history (stock_item_id, asset_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
1	3	\N	2026-05-05 18:56:08.91686	\N	98	\N
\.


--
-- TOC entry 6722 (class 0 OID 43648)
-- Dependencies: 241
-- Data for Name: asset_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model (asset_model_id, asset_brand_id, asset_type_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months, asset_model_name_in_administrative_certificate) FROM stdin;
1	10	1	Latitude 5531	L5531	\N	\N	t	\N	\N	\N
2	1	1	TravelMate P-253-M	P253M	\N	\N	t	\N	\N	\N
3	3	1	P401	P401	\N	\N	t	\N	\N	\N
4	3	1	SENSBook SI LCL-503	LCL503	\N	\N	t	\N	\N	\N
5	3	1	WM15-CCLPRO	WM15CCLPRO	\N	\N	t	\N	\N	\N
6	5	1	LC001	LC001	\N	\N	t	\N	\N	\N
7	19	1	LC002	LC002	\N	\N	t	\N	\N	\N
8	4	3	Hoggar Series 700 Pro	NULL	\N	\N	t	\N	\N	\N
9	4	3	Hoggar Series 700	NULL	\N	\N	t	\N	\N	\N
10	4	3	Hoggar Q7700	NULL	\N	\N	t	\N	\N	\N
11	6	3	Type 01 Z1 G9	NULL	\N	\N	t	\N	\N	\N
12	6	3	Pro 3130MT	NULL	\N	\N	t	\N	\N	\N
13	1	3	M460	NULL	\N	\N	t	\N	\N	\N
14	1	3	M480	NULL	\N	\N	t	\N	\N	\N
15	3	3	D-11	NULL	\N	\N	t	\N	\N	\N
16	3	3	D700	NULL	\N	\N	t	\N	\N	\N
17	2	3	Esprimo P400	NULL	\N	\N	t	\N	\N	\N
18	8	5	GT 20000	NULL	\N	\N	t	\N	\N	\N
19	8	5	GT 15000	NULL	\N	\N	t	\N	\N	\N
20	8	5	1640 XL	NULL	\N	\N	t	\N	\N	\N
21	6	5	officeJet K7103	NULL	\N	\N	t	\N	\N	\N
22	6	5	Scan Jet G2710	NULL	\N	\N	t	\N	\N	\N
23	20	5	AD345GFN	NULL	\N	\N	t	\N	\N	\N
24	8	4	Ligne Printronix P8000	NULL	\N	\N	t	\N	\N	\N
25	8	4	WF AL-300	NULL	\N	\N	t	\N	\N	\N
26	8	4	M2400	NULL	\N	\N	t	\N	\N	\N
27	8	4	LQ 2090	NULL	\N	\N	t	\N	\N	\N
28	8	4	LQ 2080	NULL	\N	\N	t	\N	\N	\N
29	8	4	B1100	NULL	\N	\N	t	\N	\N	\N
30	8	4	ACULASER C4200	NULL	\N	\N	t	\N	\N	\N
31	6	4	MFP MANAGED E877DN	NULL	\N	\N	t	\N	\N	\N
32	6	4	LaserJet P1606dn	NULL	\N	\N	t	\N	\N	\N
33	6	4	officeJet 7612	NULL	\N	\N	t	\N	\N	\N
34	6	4	officeJet K7103	NULL	\N	\N	t	\N	\N	\N
35	21	4	MS 510dn	NULL	\N	\N	t	\N	\N	\N
36	21	4	E260dn	NULL	\N	\N	t	\N	\N	\N
37	7	4	5550	NULL	\N	\N	t	\N	\N	\N
38	7	4	B840 DN	NULL	\N	\N	t	\N	\N	\N
39	7	4	5750	NULL	\N	\N	t	\N	\N	\N
40	7	4	B432 DN	NULL	\N	\N	t	\N	\N	\N
41	7	4	C843 DN	NULL	\N	\N	t	\N	\N	\N
42	7	4	C532 DN	NULL	\N	\N	t	\N	\N	\N
43	7	4	5591 ML	NULL	\N	\N	t	\N	\N	\N
44	17	4	SP 4310n	NULL	\N	\N	t	\N	\N	\N
45	17	4	SP 6430 DN	NULL	\N	\N	t	\N	\N	\N
46	12	4	3330V_DNIM	NULL	\N	\N	t	\N	\N	\N
47	12	4	WorkCentre 3315	NULL	\N	\N	t	\N	\N	\N
48	15	4	LBP 236DW	NULL	\N	\N	t	\N	\N	\N
49	22	4	BP 5200	NULL	\N	\N	t	\N	\N	\N
50	23	4	2610+	NULL	\N	\N	t	\N	\N	\N
51	5	2	AC001	NULL	\N	\N	t	\N	\N	\N
52	10	2	OptiPlex AIO 7420 65W	NULL	\N	\N	t	\N	\N	\N
53	24	8	DES 1024D	NULL	\N	\N	t	\N	\N	\N
54	25	8	Catalyst 3750	NULL	\N	\N	t	\N	\N	\N
55	25	8	Catalyst 3850	NULL	\N	\N	t	\N	\N	\N
56	25	8	Catalyst 2950	NULL	\N	\N	t	\N	\N	\N
57	25	8	TL-SF 1016 16 Ports RJ-45	NULL	\N	\N	t	\N	\N	\N
58	25	8	Telesystem	NULL	\N	\N	t	\N	\N	\N
59	24	8	TLSF 1024D	NULL	\N	\N	t	\N	\N	\N
60	26	8	HP L1750	NULL	\N	\N	t	\N	\N	\N
61	27	8	INTEX	NULL	\N	\N	t	\N	\N	\N
62	25	8	Catalyst 2960	NULL	\N	\N	t	\N	\N	\N
63	28	8	AVAYA	NULL	\N	\N	t	\N	\N	\N
64	28	8	ERS3549GTS	NULL	\N	\N	t	\N	\N	\N
65	1	1	TravelMate 5720G	NULL	\N	\N	t	\N	\N	\N
66	10	1	Latitude L120	NULL	\N	\N	t	\N	\N	\N
67	2	1	Lifebook A530	NULL	\N	\N	t	\N	\N	\N
68	3	1	Condor Unknown Model	NULL	\N	\N	t	\N	\N	\N
69	2	3	Esprimo P410	NULL	\N	\N	t	\N	\N	\N
70	2	3	Esprimo P500	NULL	\N	\N	t	\N	\N	\N
71	2	3	Esprimo P2560	NULL	\N	\N	t	\N	\N	\N
72	2	3	Esprimo P558	NULL	\N	\N	t	\N	\N	\N
73	29	5	i2S	NULL	\N	\N	t	\N	\N	\N
74	6	5	Scanjet G2710	NULL	\N	\N	t	\N	\N	\N
75	6	4	WG MANAGED	NULL	\N	\N	t	\N	\N	\N
76	1	1	TestBilingual	TB1	\N	\N	t	\N	\N	\N
77	1	2	Acer Test	yyy	\N	\N	t	\N	\N	\N
78	10	10	Asset Model Test	ASSETMODELTEST	\N	\N	t	\N	11	\N
\.


--
-- TOC entry 6723 (class 0 OID 43654)
-- Dependencies: 242
-- Data for Name: asset_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_attribute_value (asset_model_id, asset_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
77	1	\N	\N	\N	\N
77	2	\N	\N	\N	\N
77	3	\N	\N	\N	\N
77	4	\N	\N	\N	\N
77	5	\N	\N	\N	\N
77	6	\N	\N	\N	\N
77	7	\N	\N	\N	\N
77	8	\N	\N	\N	\N
77	9	\N	\N	\N	\N
77	10	\N	\N	\N	\N
77	11	\N	\N	\N	\N
77	12	\N	\N	\N	\N
77	13	\N	\N	\N	\N
77	14	\N	\N	\N	\N
77	17	\N	\N	\N	\N
77	18	\N	\N	\N	\N
77	19	\N	\N	\N	\N
77	20	\N	\N	\N	\N
77	21	\N	\N	\N	\N
77	22	\N	\N	\N	\N
77	26	\N	\N	\N	\N
77	30	\N	\N	\N	\N
77	31	\N	\N	\N	\N
77	32	\N	\N	\N	\N
77	34	\N	\N	\N	\N
77	36	\N	\N	\N	\N
77	37	\N	\N	\N	\N
77	38	\N	\N	\N	\N
\.


--
-- TOC entry 6724 (class 0 OID 43661)
-- Dependencies: 243
-- Data for Name: asset_model_default_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_consumable (id, asset_model_id, consumable_model_id, quantity, notes) FROM stdin;
\.


--
-- TOC entry 6726 (class 0 OID 43670)
-- Dependencies: 245
-- Data for Name: asset_model_default_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_stock_item (id, asset_model_id, stock_item_model_id, quantity, notes) FROM stdin;
2	68	1	2	
3	68	2	1	
4	51	1	1	
5	78	1	1	
\.


--
-- TOC entry 6898 (class 0 OID 46197)
-- Dependencies: 417
-- Data for Name: asset_model_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_translation (id, asset_model_id, language_code, model_name, notes, created_at, updated_at, asset_model_name_in_administrative_certificate) FROM stdin;
65	1	en	Latitude 5531	\N	2026-04-20 10:29:40.49525	2026-04-20 10:29:40.495259	\N
66	2	en	TravelMate P-253-M	\N	2026-04-20 10:29:40.501188	2026-04-20 10:29:40.501195	\N
67	3	en	P401	\N	2026-04-20 10:29:40.502041	2026-04-20 10:29:40.502047	\N
68	4	en	SENSBook SI LCL-503	\N	2026-04-20 10:29:40.503046	2026-04-20 10:29:40.50305	\N
69	5	en	WM15-CCLPRO	\N	2026-04-20 10:29:40.50378	2026-04-20 10:29:40.503785	\N
70	6	en	LC001	\N	2026-04-20 10:29:40.504484	2026-04-20 10:29:40.504489	\N
71	7	en	LC002	\N	2026-04-20 10:29:40.505424	2026-04-20 10:29:40.505429	\N
72	8	en	Hoggar Series 700 Pro	\N	2026-04-20 10:29:40.506317	2026-04-20 10:29:40.506323	\N
73	9	en	Hoggar Series 700	\N	2026-04-20 10:29:40.50751	2026-04-20 10:29:40.507516	\N
74	10	en	Hoggar Q7700	\N	2026-04-20 10:29:40.508561	2026-04-20 10:29:40.508566	\N
75	11	en	Type 01 Z1 G9	\N	2026-04-20 10:29:40.509511	2026-04-20 10:29:40.509516	\N
76	12	en	Pro 3130MT	\N	2026-04-20 10:29:40.510347	2026-04-20 10:29:40.510352	\N
77	13	en	M460	\N	2026-04-20 10:29:40.511163	2026-04-20 10:29:40.511167	\N
78	14	en	M480	\N	2026-04-20 10:29:40.511979	2026-04-20 10:29:40.511984	\N
79	15	en	D-11	\N	2026-04-20 10:29:40.512824	2026-04-20 10:29:40.512829	\N
80	16	en	D700	\N	2026-04-20 10:29:40.513533	2026-04-20 10:29:40.513538	\N
81	17	en	Esprimo P400	\N	2026-04-20 10:29:40.514404	2026-04-20 10:29:40.514409	\N
82	18	en	GT 20000	\N	2026-04-20 10:29:40.515089	2026-04-20 10:29:40.515094	\N
83	19	en	GT 15000	\N	2026-04-20 10:29:40.515733	2026-04-20 10:29:40.515737	\N
84	20	en	1640 XL	\N	2026-04-20 10:29:40.516434	2026-04-20 10:29:40.516439	\N
85	21	en	officeJet K7103	\N	2026-04-20 10:29:40.517112	2026-04-20 10:29:40.517117	\N
86	22	en	Scan Jet G2710	\N	2026-04-20 10:29:40.517755	2026-04-20 10:29:40.517759	\N
87	23	en	AD345GFN	\N	2026-04-20 10:29:40.518463	2026-04-20 10:29:40.518467	\N
88	24	en	Ligne Printronix P8000	\N	2026-04-20 10:29:40.519087	2026-04-20 10:29:40.519091	\N
89	25	en	WF AL-300	\N	2026-04-20 10:29:40.519782	2026-04-20 10:29:40.519787	\N
90	26	en	M2400	\N	2026-04-20 10:29:40.520453	2026-04-20 10:29:40.520457	\N
91	27	en	LQ 2090	\N	2026-04-20 10:29:40.521102	2026-04-20 10:29:40.521107	\N
92	28	en	LQ 2080	\N	2026-04-20 10:29:40.521773	2026-04-20 10:29:40.521777	\N
93	29	en	B1100	\N	2026-04-20 10:29:40.522456	2026-04-20 10:29:40.52246	\N
94	30	en	ACULASER C4200	\N	2026-04-20 10:29:40.523462	2026-04-20 10:29:40.523467	\N
95	31	en	MFP MANAGED E877DN	\N	2026-04-20 10:29:40.524642	2026-04-20 10:29:40.524647	\N
96	32	en	LaserJet P1606dn	\N	2026-04-20 10:29:40.525659	2026-04-20 10:29:40.525665	\N
97	33	en	officeJet 7612	\N	2026-04-20 10:29:40.526611	2026-04-20 10:29:40.526617	\N
98	34	en	officeJet K7103	\N	2026-04-20 10:29:40.527485	2026-04-20 10:29:40.52749	\N
99	35	en	MS 510dn	\N	2026-04-20 10:29:40.528202	2026-04-20 10:29:40.528206	\N
100	36	en	E260dn	\N	2026-04-20 10:29:40.529004	2026-04-20 10:29:40.529009	\N
101	37	en	5550	\N	2026-04-20 10:29:40.529774	2026-04-20 10:29:40.529778	\N
102	38	en	B840 DN	\N	2026-04-20 10:29:40.530459	2026-04-20 10:29:40.530463	\N
103	39	en	5750	\N	2026-04-20 10:29:40.531201	2026-04-20 10:29:40.531206	\N
104	40	en	B432 DN	\N	2026-04-20 10:29:40.531854	2026-04-20 10:29:40.531859	\N
105	41	en	C843 DN	\N	2026-04-20 10:29:40.532503	2026-04-20 10:29:40.532507	\N
106	42	en	C532 DN	\N	2026-04-20 10:29:40.533296	2026-04-20 10:29:40.533301	\N
107	43	en	5591 ML	\N	2026-04-20 10:29:40.534047	2026-04-20 10:29:40.534051	\N
108	44	en	SP 4310n	\N	2026-04-20 10:29:40.534738	2026-04-20 10:29:40.534743	\N
109	45	en	SP 6430 DN	\N	2026-04-20 10:29:40.535403	2026-04-20 10:29:40.535408	\N
110	46	en	3330V_DNIM	\N	2026-04-20 10:29:40.536069	2026-04-20 10:29:40.536073	\N
111	47	en	WorkCentre 3315	\N	2026-04-20 10:29:40.536712	2026-04-20 10:29:40.536717	\N
112	48	en	LBP 236DW	\N	2026-04-20 10:29:40.537383	2026-04-20 10:29:40.537388	\N
113	49	en	BP 5200	\N	2026-04-20 10:29:40.538052	2026-04-20 10:29:40.538057	\N
114	50	en	2610+	\N	2026-04-20 10:29:40.538704	2026-04-20 10:29:40.538708	\N
115	51	en	AC001	\N	2026-04-20 10:29:40.539352	2026-04-20 10:29:40.539356	\N
116	52	en	OptiPlex AIO 7420 65W	\N	2026-04-20 10:29:40.54077	2026-04-20 10:29:40.540776	\N
117	53	en	DES 1024D	\N	2026-04-20 10:29:40.541987	2026-04-20 10:29:40.541992	\N
118	54	en	Catalyst 3750	\N	2026-04-20 10:29:40.543108	2026-04-20 10:29:40.543114	\N
119	55	en	Catalyst 3850	\N	2026-04-20 10:29:40.544112	2026-04-20 10:29:40.544117	\N
120	56	en	Catalyst 2950	\N	2026-04-20 10:29:40.545088	2026-04-20 10:29:40.545093	\N
121	57	en	TL-SF 1016 16 Ports RJ-45	\N	2026-04-20 10:29:40.546151	2026-04-20 10:29:40.546156	\N
122	58	en	Telesystem	\N	2026-04-20 10:29:40.547144	2026-04-20 10:29:40.54715	\N
123	59	en	TLSF 1024D	\N	2026-04-20 10:29:40.547905	2026-04-20 10:29:40.54791	\N
124	60	en	HP L1750	\N	2026-04-20 10:29:40.548596	2026-04-20 10:29:40.548601	\N
125	61	en	INTEX	\N	2026-04-20 10:29:40.549295	2026-04-20 10:29:40.5493	\N
126	62	en	Catalyst 2960	\N	2026-04-20 10:29:40.549969	2026-04-20 10:29:40.549974	\N
127	63	en	AVAYA	\N	2026-04-20 10:29:40.550704	2026-04-20 10:29:40.550709	\N
128	64	en	ERS3549GTS	\N	2026-04-20 10:29:40.551678	2026-04-20 10:29:40.551683	\N
129	65	en	TravelMate 5720G	\N	2026-04-20 10:29:40.552472	2026-04-20 10:29:40.552476	\N
130	66	en	Latitude L120	\N	2026-04-20 10:29:40.553125	2026-04-20 10:29:40.553129	\N
131	67	en	Lifebook A530	\N	2026-04-20 10:29:40.553941	2026-04-20 10:29:40.553947	\N
132	68	en	Condor Unknown Model	\N	2026-04-20 10:29:40.554717	2026-04-20 10:29:40.554721	\N
133	69	en	Esprimo P410	\N	2026-04-20 10:29:40.555451	2026-04-20 10:29:40.555456	\N
134	70	en	Esprimo P500	\N	2026-04-20 10:29:40.556336	2026-04-20 10:29:40.556342	\N
135	71	en	Esprimo P2560	\N	2026-04-20 10:29:40.55726	2026-04-20 10:29:40.557265	\N
136	72	en	Esprimo P558	\N	2026-04-20 10:29:40.558521	2026-04-20 10:29:40.558526	\N
137	73	en	i2S	\N	2026-04-20 10:29:40.559388	2026-04-20 10:29:40.559394	\N
138	74	en	Scanjet G2710	\N	2026-04-20 10:29:40.560171	2026-04-20 10:29:40.560175	\N
139	75	en	WG MANAGED	\N	2026-04-20 10:29:40.561061	2026-04-20 10:29:40.561068	\N
140	76	en	TestBilingual	\N	2026-04-22 10:50:23.259763	2026-04-22 10:50:23.259774	\N
141	76	ar	اختبار	\N	2026-04-22 10:50:23.263309	2026-04-22 10:50:23.263317	\N
142	77	en	Acer Test	\N	2026-04-22 10:50:44.452386	2026-04-22 10:50:44.452414	\N
143	77	ar	أسير تيست	\N	2026-04-22 10:50:44.458225	2026-04-22 10:50:44.458244	\N
144	78	en	Asset Model Test	\N	2026-05-05 16:06:22.536286	2026-05-05 16:06:22.536334	Asset Model Test
145	78	ar	أسيت موديل تست	\N	2026-05-05 16:06:22.545779	2026-05-05 16:06:22.545841	أسيت موديل تست
\.


--
-- TOC entry 6728 (class 0 OID 43679)
-- Dependencies: 247
-- Data for Name: asset_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_movement (asset_movement_id, asset_id, source_location_id, destination_location_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status, maintenance_id) FROM stdin;
\.


--
-- TOC entry 6872 (class 0 OID 45911)
-- Dependencies: 391
-- Data for Name: asset_movement_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_movement_translation (id, asset_movement_id, language_code, movement_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6892 (class 0 OID 46134)
-- Dependencies: 411
-- Data for Name: asset_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_translation (id, asset_id, language_code, asset_name, created_at, updated_at, asset_status) FROM stdin;
1	1	en	testest	2026-05-05 18:40:45.935342	2026-05-05 18:40:45.935394	Not Delivered to Company
2	1	ar	testest	2026-05-05 18:40:45.967744	2026-05-05 18:40:45.967802	لم يتم تسليمها للشركة
3	2	ar	ccc	2026-05-05 18:46:51.736035	2026-05-05 18:46:51.736069	لم يتم تسليمها للشركة
4	2	en	ccc	2026-05-05 18:46:51.748719	2026-05-05 18:46:51.748758	Not Delivered to Company
5	3	ar	ببب	2026-05-05 18:56:08.892526	2026-05-05 18:56:08.892585	لم يتم تسليمها للشركة
6	3	en	fff	2026-05-05 18:56:08.910107	2026-05-05 18:56:08.910163	Not Delivered to Company
\.


--
-- TOC entry 6729 (class 0 OID 43690)
-- Dependencies: 248
-- Data for Name: asset_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type (asset_type_id, asset_type_label, asset_type_code, photo) FROM stdin;
2	All-In-One	AIO	\N
3	Central Unit	CU	\N
4	Printer	PRNT	\N
7	Projector	PRJCT	\N
1	Laptop	LPTP	\N
5	Scanner	SCNR	\N
6	Monitor	MNTR	\N
8	Switch	SWC	\N
9	Plotter Table	PLTTBL	\N
10	Asset Test	ASSETTEST	\N
\.


--
-- TOC entry 6730 (class 0 OID 43696)
-- Dependencies: 249
-- Data for Name: asset_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type_attribute (asset_attribute_definition_id, asset_type_id, is_mandatory, default_value) FROM stdin;
1	1	t	15.6
2	1	t	\N
4	1	f	\N
9	1	f	\N
10	1	f	\N
3	1	f	\N
5	1	f	\N
6	1	f	\N
7	1	f	\N
8	1	f	\N
11	1	f	\N
12	1	f	\N
1	2	f	\N
2	2	f	\N
3	2	f	\N
4	2	f	\N
5	2	f	\N
6	2	f	\N
7	2	f	\N
8	2	f	\N
9	2	f	\N
11	2	f	\N
10	2	f	\N
12	2	f	\N
4	6	f	\N
9	6	f	\N
10	6	f	\N
1	6	f	\N
4	5	f	\N
9	5	f	\N
10	5	f	\N
5	5	f	\N
6	5	f	\N
4	3	f	\N
9	3	f	\N
10	3	f	\N
11	3	f	\N
3	3	f	\N
8	3	f	\N
5	3	f	\N
6	3	f	\N
7	3	f	\N
12	3	f	\N
4	4	f	\N
9	4	f	\N
10	4	f	\N
4	8	f	\N
9	8	f	\N
10	8	f	\N
4	7	f	\N
9	7	f	\N
10	7	f	\N
4	9	f	\N
9	9	f	\N
10	9	f	\N
13	2	f	\N
14	1	f	\N
14	2	f	\N
14	6	f	\N
13	1	f	\N
15	7	f	\N
16	4	f	A4
17	1	f	\N
17	2	f	\N
17	3	f	\N
17	4	f	\N
5	4	f	\N
6	4	f	\N
17	5	f	\N
16	5	f	\N
17	6	f	\N
17	7	f	\N
17	8	f	\N
17	9	f	\N
16	9	f	\N
18	1	f	\N
19	1	f	\N
20	1	f	\N
21	1	f	\N
22	1	f	\N
18	2	f	\N
19	2	f	\N
20	2	f	\N
21	2	f	\N
22	2	f	\N
18	3	f	\N
19	3	f	\N
20	3	f	\N
21	3	f	\N
22	3	f	\N
23	4	f	\N
23	5	f	\N
23	9	f	\N
25	4	f	\N
26	1	f	\N
36	1	f	\N
31	1	f	\N
37	1	f	\N
30	1	f	\N
38	1	f	\N
35	1	f	\N
32	1	f	\N
34	1	f	\N
30	2	f	\N
26	2	f	\N
32	2	f	\N
38	2	f	\N
37	2	f	\N
31	2	f	\N
34	2	f	\N
36	2	f	\N
30	3	f	\N
38	3	f	\N
7	4	f	\N
30	4	f	\N
34	4	f	\N
26	4	f	\N
27	4	f	\N
28	4	f	\N
29	4	f	\N
34	5	f	\N
7	5	f	\N
25	5	f	\N
30	5	f	\N
29	5	f	\N
26	5	f	\N
27	5	f	\N
28	5	f	\N
8	5	f	\N
11	5	f	\N
32	6	f	\N
30	6	f	\N
31	6	f	\N
36	6	f	\N
37	6	f	\N
38	6	f	\N
35	6	f	\N
39	7	f	\N
27	7	f	\N
28	7	f	\N
42	8	f	\N
43	8	f	\N
30	8	f	\N
40	8	f	\N
41	8	f	\N
44	8	f	\N
\.


--
-- TOC entry 6836 (class 0 OID 45514)
-- Dependencies: 355
-- Data for Name: asset_type_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type_translation (id, asset_type_id, language_code, asset_type_label, created_at, updated_at) FROM stdin;
1	2	en	All-In-One	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
2	3	en	Central Unit	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
3	4	en	Printer	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
4	7	en	Projector	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
5	1	en	Laptop	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
6	5	en	Scanner	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
7	6	en	Monitor	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
8	8	en	Switch	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
9	9	en	Plotter Table	2026-04-18 20:18:22.145497	2026-04-18 20:18:22.145497
10	1	ar	حاسوب محمول	2026-04-20 10:31:27.818579	2026-04-20 10:37:43.23636
11	2	ar	حاسوب الكل في واحد	2026-04-20 10:31:27.828102	2026-04-20 10:37:43.244715
12	3	ar	وحدة مركزية	2026-04-20 10:31:27.829386	2026-04-20 10:37:43.246629
13	4	ar	طابعة	2026-04-20 10:31:27.830566	2026-04-20 10:37:43.248054
14	5	ar	ماسح ضوئي	2026-04-20 10:31:27.831724	2026-04-20 10:37:43.249585
15	6	ar	شاشة	2026-04-20 10:31:27.832806	2026-04-20 10:37:43.251465
16	7	ar	جهاز عرض	2026-04-20 10:31:27.833958	2026-04-20 10:37:43.252863
17	8	ar	مبدل شبكة	2026-04-20 10:31:27.835047	2026-04-20 10:37:43.254189
18	9	ar	طاولة رسومات	2026-04-20 10:31:27.836078	2026-04-20 10:37:43.255651
19	10	en	Asset Test	2026-05-05 16:05:27.058175	2026-05-05 16:05:27.058224
\.


--
-- TOC entry 6731 (class 0 OID 43701)
-- Dependencies: 250
-- Data for Name: attribution_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order (attribution_order_id, warehouse_id, attribution_order_full_code, attribution_order_date, is_signed_by_central_chief, attribution_order_barcode) FROM stdin;
1	1	OA N°162/2025/DCI/MDN	\N	t	\N
2	1	OA N°66/2025/DCI/MDN	\N	t	\N
3	1	OA/010/2024	\N	t	\N
4	1	OA/029/2009	\N	t	\N
5	1	OA/016/2010	\N	t	\N
6	1	OA/071/2017	\N	t	\N
7	1	OA/009/2016	\N	t	\N
8	1	OA/027/2013	\N	t	\N
9	1	OA/010/2019	\N	t	\N
10	1	OA/060/2011	\N	t	\N
11	1	PV/068/2013	\N	t	\N
12	1	PV/297/2014	\N	t	\N
13	1	OA/032/2014	\N	t	\N
14	1	D3/658/2011	\N	t	\N
15	1	OA/ 039/2014/SI/DRI/2RM	\N	t	\N
16	1	CA 036/ERI/2RM	\N	t	\N
17	1	OA 017/2015/DCI/MDN/G	\N	t	\N
18	1	OA 039/2016/DCI/MDN/J	\N	t	\N
19	1	OA 74/2016/SI/DRI/2RM	\N	t	\N
20	1	OA 06/2018/SI/DRI/2RM	\N	t	\N
21	1	OA 077/2018/DCI/MADN/J	\N	t	\N
22	1	OA 10022/DRI/2RM	\N	t	\N
23	1	D3 N°03/2021/SGA/DRTSIG/2RM	\N	t	\N
24	1	D3N°003/2022/MDN/DTSIG/T15	\N	t	\N
25	1	N°241/2023/SGA/DRTSIG/2RM	\N	t	\N
26	1	OA N°16/2024/DCI/MDN	\N	t	\N
27	1	OA N°10/2024/DCI/MDN	\N	t	\N
28	1	OA/617/2007	\N	t	\N
29	1	OA/005/2015	\N	t	\N
30	1	OA/011/2014	\N	t	\N
31	1	OA/033/2017	\N	t	\N
32	1	OA/042/2016	\N	t	\N
33	1	OA/4859/2013	\N	t	\N
34	1	OA/010/2013	\N	t	\N
35	1	OA/039/2016	\N	t	\N
36	1	OA N°81/2025/DCI/MDN	\N	t	\N
37	1	OA N°147/2025/DCI/MDN	\N	t	\N
38	1	OA/001/2023	\N	t	\N
39	1	CA 2463/2021/ERI/2RM	\N	t	\N
40	1	fffff	2026-05-03	f	fffffff
41	1	test_accessories	2026-05-03	f	test_accessories
42	1	nnnnnnnn	2026-05-03	f	
43	1	www	2026-05-03	f	www
44	1	sss	2026-05-03	f	sss
45	1	sss	2026-05-03	f	sss
46	1	ccc	2026-05-03	f	ccc
47	1	jjj	2026-05-03	f	jjj
48	1	yyy	2026-05-03	f	yyy
49	1	vbn	2026-05-03	f	vbn
50	1	xcv	2026-05-03	f	xcv
51	1	sxc	2026-05-03	f	sxc
52	1	tyu	2026-05-04	f	tyu
53	1	lll	2026-05-04	f	lll
54	1	uiu	2026-05-04	f	uiu
55	1	dfg	2026-05-04	f	dfg
56	1	tttttt	2026-05-05	f	tttttt
57	1	yyyyy	2026-05-05	f	yyyyy
58	1	wwww	2026-05-05	f	wwww
59	1	ccc	2026-05-05	f	ccc
\.


--
-- TOC entry 6732 (class 0 OID 43706)
-- Dependencies: 251
-- Data for Name: attribution_order_asset_consumable_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_consumable_accessory (id, attribution_order_id, asset_id, consumable_id) FROM stdin;
\.


--
-- TOC entry 6734 (class 0 OID 43714)
-- Dependencies: 253
-- Data for Name: attribution_order_asset_stock_item_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_stock_item_accessory (id, attribution_order_id, asset_id, stock_item_id) FROM stdin;
\.


--
-- TOC entry 6736 (class 0 OID 43722)
-- Dependencies: 255
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- TOC entry 6738 (class 0 OID 43728)
-- Dependencies: 257
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- TOC entry 6740 (class 0 OID 43735)
-- Dependencies: 259
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	3	add_permission
6	Can change permission	3	change_permission
7	Can delete permission	3	delete_permission
8	Can view permission	3	view_permission
9	Can add group	2	add_group
10	Can change group	2	change_group
11	Can delete group	2	delete_group
12	Can view group	2	view_group
13	Can add user	4	add_user
14	Can change user	4	change_user
15	Can delete user	4	delete_user
16	Can view user	4	view_user
17	Can add content type	5	add_contenttype
18	Can change content type	5	change_contenttype
19	Can delete content type	5	delete_contenttype
20	Can view content type	5	view_contenttype
21	Can add session	6	add_session
22	Can change session	6	change_session
23	Can delete session	6	delete_session
24	Can view session	6	view_session
25	Can add administrative certificate	7	add_administrativecertificate
26	Can change administrative certificate	7	change_administrativecertificate
27	Can delete administrative certificate	7	delete_administrativecertificate
28	Can view administrative certificate	7	view_administrativecertificate
29	Can add asset	8	add_asset
30	Can change asset	8	change_asset
31	Can delete asset	8	delete_asset
32	Can view asset	8	view_asset
33	Can add asset brand	11	add_assetbrand
34	Can change asset brand	11	change_assetbrand
35	Can delete asset brand	11	delete_assetbrand
36	Can view asset brand	11	view_assetbrand
37	Can add asset condition history	12	add_assetconditionhistory
38	Can change asset condition history	12	change_assetconditionhistory
39	Can delete asset condition history	12	delete_assetconditionhistory
40	Can view asset condition history	12	view_assetconditionhistory
41	Can add asset is assigned to person	13	add_assetisassignedtoperson
42	Can change asset is assigned to person	13	change_assetisassignedtoperson
43	Can delete asset is assigned to person	13	delete_assetisassignedtoperson
44	Can view asset is assigned to person	13	view_assetisassignedtoperson
45	Can add asset is composed of consumable history	14	add_assetiscomposedofconsumablehistory
46	Can change asset is composed of consumable history	14	change_assetiscomposedofconsumablehistory
47	Can delete asset is composed of consumable history	14	delete_assetiscomposedofconsumablehistory
48	Can view asset is composed of consumable history	14	view_assetiscomposedofconsumablehistory
49	Can add asset is composed of stock item history	15	add_assetiscomposedofstockitemhistory
50	Can change asset is composed of stock item history	15	change_assetiscomposedofstockitemhistory
51	Can delete asset is composed of stock item history	15	delete_assetiscomposedofstockitemhistory
52	Can view asset is composed of stock item history	15	view_assetiscomposedofstockitemhistory
53	Can add asset model default consumable	18	add_assetmodeldefaultconsumable
54	Can change asset model default consumable	18	change_assetmodeldefaultconsumable
55	Can delete asset model default consumable	18	delete_assetmodeldefaultconsumable
56	Can view asset model default consumable	18	view_assetmodeldefaultconsumable
57	Can add asset model default stock item	19	add_assetmodeldefaultstockitem
58	Can change asset model default stock item	19	change_assetmodeldefaultstockitem
59	Can delete asset model default stock item	19	delete_assetmodeldefaultstockitem
60	Can view asset model default stock item	19	view_assetmodeldefaultstockitem
61	Can add asset movement	20	add_assetmovement
62	Can change asset movement	20	change_assetmovement
63	Can delete asset movement	20	delete_assetmovement
64	Can view asset movement	20	view_assetmovement
65	Can add asset type	21	add_assettype
66	Can change asset type	21	change_assettype
67	Can delete asset type	21	delete_assettype
68	Can view asset type	21	view_assettype
69	Can add attribution order	23	add_attributionorder
70	Can change attribution order	23	change_attributionorder
71	Can delete attribution order	23	delete_attributionorder
72	Can view attribution order	23	view_attributionorder
73	Can add company asset request	24	add_companyassetrequest
74	Can change company asset request	24	change_companyassetrequest
75	Can delete company asset request	24	delete_companyassetrequest
76	Can view company asset request	24	view_companyassetrequest
77	Can add consumable	25	add_consumable
78	Can change consumable	25	change_consumable
79	Can delete consumable	25	delete_consumable
80	Can view consumable	25	view_consumable
81	Can add consumable brand	28	add_consumablebrand
82	Can change consumable brand	28	change_consumablebrand
83	Can delete consumable brand	28	delete_consumablebrand
84	Can view consumable brand	28	view_consumablebrand
85	Can add consumable is assigned to person	29	add_consumableisassignedtoperson
86	Can change consumable is assigned to person	29	change_consumableisassignedtoperson
87	Can delete consumable is assigned to person	29	delete_consumableisassignedtoperson
88	Can view consumable is assigned to person	29	view_consumableisassignedtoperson
89	Can add consumable is used in stock item history	31	add_consumableisusedinstockitemhistory
90	Can change consumable is used in stock item history	31	change_consumableisusedinstockitemhistory
91	Can delete consumable is used in stock item history	31	delete_consumableisusedinstockitemhistory
92	Can view consumable is used in stock item history	31	view_consumableisusedinstockitemhistory
93	Can add consumable movement	34	add_consumablemovement
94	Can change consumable movement	34	change_consumablemovement
95	Can delete consumable movement	34	delete_consumablemovement
96	Can view consumable movement	34	view_consumablemovement
97	Can add consumable type	35	add_consumabletype
98	Can change consumable type	35	change_consumabletype
99	Can delete consumable type	35	delete_consumabletype
100	Can view consumable type	35	view_consumabletype
101	Can add external maintenance	37	add_externalmaintenance
102	Can change external maintenance	37	change_externalmaintenance
103	Can delete external maintenance	37	delete_externalmaintenance
104	Can view external maintenance	37	view_externalmaintenance
105	Can add external maintenance document	38	add_externalmaintenancedocument
106	Can change external maintenance document	38	change_externalmaintenancedocument
107	Can delete external maintenance document	38	delete_externalmaintenancedocument
108	Can view external maintenance document	38	view_externalmaintenancedocument
109	Can add external maintenance provider	39	add_externalmaintenanceprovider
110	Can change external maintenance provider	39	change_externalmaintenanceprovider
111	Can delete external maintenance provider	39	delete_externalmaintenanceprovider
112	Can view external maintenance provider	39	view_externalmaintenanceprovider
113	Can add external maintenance step	40	add_externalmaintenancestep
114	Can change external maintenance step	40	change_externalmaintenancestep
115	Can delete external maintenance step	40	delete_externalmaintenancestep
116	Can view external maintenance step	40	view_externalmaintenancestep
117	Can add external maintenance typical step	41	add_externalmaintenancetypicalstep
118	Can change external maintenance typical step	41	change_externalmaintenancetypicalstep
119	Can delete external maintenance typical step	41	delete_externalmaintenancetypicalstep
120	Can view external maintenance typical step	41	view_externalmaintenancetypicalstep
121	Can add maintenance	42	add_maintenance
122	Can change maintenance	42	change_maintenance
123	Can delete maintenance	42	delete_maintenance
124	Can view maintenance	42	view_maintenance
125	Can add maintenance step item request	45	add_maintenancestepitemrequest
126	Can change maintenance step item request	45	change_maintenancestepitemrequest
127	Can delete maintenance step item request	45	delete_maintenancestepitemrequest
128	Can view maintenance step item request	45	view_maintenancestepitemrequest
129	Can add maintenance typical step	46	add_maintenancetypicalstep
130	Can change maintenance typical step	46	change_maintenancetypicalstep
131	Can delete maintenance typical step	46	delete_maintenancetypicalstep
132	Can view maintenance typical step	46	view_maintenancetypicalstep
133	Can add person	49	add_person
134	Can change person	49	change_person
135	Can delete person	49	delete_person
136	Can view person	49	view_person
137	Can add person reports problem on asset	50	add_personreportsproblemonasset
138	Can change person reports problem on asset	50	change_personreportsproblemonasset
139	Can delete person reports problem on asset	50	delete_personreportsproblemonasset
140	Can view person reports problem on asset	50	view_personreportsproblemonasset
141	Can add person reports problem on consumable	51	add_personreportsproblemonconsumable
142	Can change person reports problem on consumable	51	change_personreportsproblemonconsumable
143	Can delete person reports problem on consumable	51	delete_personreportsproblemonconsumable
144	Can view person reports problem on consumable	51	view_personreportsproblemonconsumable
145	Can add person reports problem on stock item	52	add_personreportsproblemonstockitem
146	Can change person reports problem on stock item	52	change_personreportsproblemonstockitem
147	Can delete person reports problem on stock item	52	delete_personreportsproblemonstockitem
148	Can view person reports problem on stock item	52	view_personreportsproblemonstockitem
149	Can add physical condition	54	add_physicalcondition
150	Can change physical condition	54	change_physicalcondition
151	Can delete physical condition	54	delete_physicalcondition
152	Can view physical condition	54	view_physicalcondition
153	Can add position	55	add_position
154	Can change position	55	change_position
155	Can delete position	55	delete_position
156	Can view position	55	view_position
157	Can add receipt report	56	add_receiptreport
158	Can change receipt report	56	change_receiptreport
159	Can delete receipt report	56	delete_receiptreport
160	Can view receipt report	56	view_receiptreport
161	Can add room	58	add_room
162	Can change room	58	change_room
163	Can delete room	58	delete_room
164	Can view room	58	view_room
165	Can add room type	59	add_roomtype
166	Can change room type	59	change_roomtype
167	Can delete room type	59	delete_roomtype
168	Can view room type	59	view_roomtype
169	Can add stock item	60	add_stockitem
170	Can change stock item	60	change_stockitem
171	Can delete stock item	60	delete_stockitem
172	Can view stock item	60	view_stockitem
173	Can add stock item brand	63	add_stockitembrand
174	Can change stock item brand	63	change_stockitembrand
175	Can delete stock item brand	63	delete_stockitembrand
176	Can view stock item brand	63	view_stockitembrand
177	Can add stock item is assigned to person	64	add_stockitemisassignedtoperson
178	Can change stock item is assigned to person	64	change_stockitemisassignedtoperson
179	Can delete stock item is assigned to person	64	delete_stockitemisassignedtoperson
180	Can view stock item is assigned to person	64	view_stockitemisassignedtoperson
181	Can add stock item movement	68	add_stockitemmovement
182	Can change stock item movement	68	change_stockitemmovement
183	Can delete stock item movement	68	delete_stockitemmovement
184	Can view stock item movement	68	view_stockitemmovement
185	Can add stock item type	69	add_stockitemtype
186	Can change stock item type	69	change_stockitemtype
187	Can delete stock item type	69	delete_stockitemtype
188	Can view stock item type	69	view_stockitemtype
189	Can add user account	71	add_useraccount
190	Can change user account	71	change_useraccount
191	Can delete user account	71	delete_useraccount
192	Can view user account	71	view_useraccount
193	Can add warehouse	72	add_warehouse
194	Can change warehouse	72	change_warehouse
195	Can delete warehouse	72	delete_warehouse
196	Can view warehouse	72	view_warehouse
197	Can add asset type attribute	22	add_assettypeattribute
198	Can change asset type attribute	22	change_assettypeattribute
199	Can delete asset type attribute	22	delete_assettypeattribute
200	Can view asset type attribute	22	view_assettypeattribute
201	Can add asset attribute value	10	add_assetattributevalue
202	Can change asset attribute value	10	change_assetattributevalue
203	Can delete asset attribute value	10	delete_assetattributevalue
204	Can view asset attribute value	10	view_assetattributevalue
205	Can add asset attribute definition	9	add_assetattributedefinition
206	Can change asset attribute definition	9	change_assetattributedefinition
207	Can delete asset attribute definition	9	delete_assetattributedefinition
208	Can view asset attribute definition	9	view_assetattributedefinition
209	Can add asset model	16	add_assetmodel
210	Can change asset model	16	change_assetmodel
211	Can delete asset model	16	delete_assetmodel
212	Can view asset model	16	view_assetmodel
213	Can add asset model attribute value	17	add_assetmodelattributevalue
214	Can change asset model attribute value	17	change_assetmodelattributevalue
215	Can delete asset model attribute value	17	delete_assetmodelattributevalue
216	Can view asset model attribute value	17	view_assetmodelattributevalue
217	Can add consumable attribute definition	26	add_consumableattributedefinition
218	Can change consumable attribute definition	26	change_consumableattributedefinition
219	Can delete consumable attribute definition	26	delete_consumableattributedefinition
220	Can view consumable attribute definition	26	view_consumableattributedefinition
221	Can add consumable attribute value	27	add_consumableattributevalue
222	Can change consumable attribute value	27	change_consumableattributevalue
223	Can delete consumable attribute value	27	delete_consumableattributevalue
224	Can view consumable attribute value	27	view_consumableattributevalue
225	Can add consumable type attribute	36	add_consumabletypeattribute
226	Can change consumable type attribute	36	change_consumabletypeattribute
227	Can delete consumable type attribute	36	delete_consumabletypeattribute
228	Can view consumable type attribute	36	view_consumabletypeattribute
229	Can add consumable model	32	add_consumablemodel
230	Can change consumable model	32	change_consumablemodel
231	Can delete consumable model	32	delete_consumablemodel
232	Can view consumable model	32	view_consumablemodel
233	Can add consumable is compatible with asset	30	add_consumableiscompatiblewithasset
234	Can change consumable is compatible with asset	30	change_consumableiscompatiblewithasset
235	Can delete consumable is compatible with asset	30	delete_consumableiscompatiblewithasset
236	Can view consumable is compatible with asset	30	view_consumableiscompatiblewithasset
237	Can add consumable model attribute value	33	add_consumablemodelattributevalue
238	Can change consumable model attribute value	33	change_consumablemodelattributevalue
239	Can delete consumable model attribute value	33	delete_consumablemodelattributevalue
240	Can view consumable model attribute value	33	view_consumablemodelattributevalue
241	Can add organizational structure relation	48	add_organizationalstructurerelation
242	Can change organizational structure relation	48	change_organizationalstructurerelation
243	Can delete organizational structure relation	48	delete_organizationalstructurerelation
244	Can view organizational structure relation	48	view_organizationalstructurerelation
245	Can add organizational structure	47	add_organizationalstructure
246	Can change organizational structure	47	change_organizationalstructure
247	Can delete organizational structure	47	delete_organizationalstructure
248	Can view organizational structure	47	view_organizationalstructure
249	Can add person role mapping	53	add_personrolemapping
250	Can change person role mapping	53	change_personrolemapping
251	Can delete person role mapping	53	delete_personrolemapping
252	Can view person role mapping	53	view_personrolemapping
253	Can add role	57	add_role
254	Can change role	57	change_role
255	Can delete role	57	delete_role
256	Can view role	57	view_role
257	Can add stock item type attribute	70	add_stockitemtypeattribute
258	Can change stock item type attribute	70	change_stockitemtypeattribute
259	Can delete stock item type attribute	70	delete_stockitemtypeattribute
260	Can view stock item type attribute	70	view_stockitemtypeattribute
261	Can add stock item attribute definition	61	add_stockitemattributedefinition
262	Can change stock item attribute definition	61	change_stockitemattributedefinition
263	Can delete stock item attribute definition	61	delete_stockitemattributedefinition
264	Can view stock item attribute definition	61	view_stockitemattributedefinition
265	Can add stock item attribute value	62	add_stockitemattributevalue
266	Can change stock item attribute value	62	change_stockitemattributevalue
267	Can delete stock item attribute value	62	delete_stockitemattributevalue
268	Can view stock item attribute value	62	view_stockitemattributevalue
269	Can add stock item is compatible with asset	65	add_stockitemiscompatiblewithasset
270	Can change stock item is compatible with asset	65	change_stockitemiscompatiblewithasset
271	Can delete stock item is compatible with asset	65	delete_stockitemiscompatiblewithasset
272	Can view stock item is compatible with asset	65	view_stockitemiscompatiblewithasset
273	Can add stock item model	66	add_stockitemmodel
274	Can change stock item model	66	change_stockitemmodel
275	Can delete stock item model	66	delete_stockitemmodel
276	Can view stock item model	66	view_stockitemmodel
277	Can add stock item model attribute value	67	add_stockitemmodelattributevalue
278	Can change stock item model attribute value	67	change_stockitemmodelattributevalue
279	Can delete stock item model attribute value	67	delete_stockitemmodelattributevalue
280	Can view stock item model attribute value	67	view_stockitemmodelattributevalue
281	Can add maintenance step	43	add_maintenancestep
282	Can change maintenance step	43	change_maintenancestep
283	Can delete maintenance step	43	delete_maintenancestep
284	Can view maintenance step	43	view_maintenancestep
285	Can add maintenance step attribute change	44	add_maintenancestepattributechange
286	Can change maintenance step attribute change	44	change_maintenancestepattributechange
287	Can delete maintenance step attribute change	44	delete_maintenancestepattributechange
288	Can view maintenance step attribute change	44	view_maintenancestepattributechange
289	Can add attribution order asset consumable accessory	73	add_attributionorderassetconsumableaccessory
290	Can change attribution order asset consumable accessory	73	change_attributionorderassetconsumableaccessory
291	Can delete attribution order asset consumable accessory	73	delete_attributionorderassetconsumableaccessory
292	Can view attribution order asset consumable accessory	73	view_attributionorderassetconsumableaccessory
293	Can add attribution order asset stock item accessory	74	add_attributionorderassetstockitemaccessory
294	Can change attribution order asset stock item accessory	74	change_attributionorderassetstockitemaccessory
295	Can delete attribution order asset stock item accessory	74	delete_attributionorderassetstockitemaccessory
296	Can view attribution order asset stock item accessory	74	view_attributionorderassetstockitemaccessory
297	Can add person reports problem on asset included consumable	75	add_personreportsproblemonassetincludedconsumable
298	Can change person reports problem on asset included consumable	75	change_personreportsproblemonassetincludedconsumable
299	Can delete person reports problem on asset included consumable	75	delete_personreportsproblemonassetincludedconsumable
300	Can view person reports problem on asset included consumable	75	view_personreportsproblemonassetincludedconsumable
301	Can add person reports problem on asset included stock item	77	add_personreportsproblemonassetincludedstockitem
302	Can change person reports problem on asset included stock item	77	change_personreportsproblemonassetincludedstockitem
303	Can delete person reports problem on asset included stock item	77	delete_personreportsproblemonassetincludedstockitem
304	Can view person reports problem on asset included stock item	77	view_personreportsproblemonassetincludedstockitem
305	Can add person reports problem on asset included context	76	add_personreportsproblemonassetincludedcontext
306	Can change person reports problem on asset included context	76	change_personreportsproblemonassetincludedcontext
307	Can delete person reports problem on asset included context	76	delete_personreportsproblemonassetincludedcontext
308	Can view person reports problem on asset included context	76	view_personreportsproblemonassetincludedcontext
309	Can add destruction certificate	78	add_destructioncertificate
310	Can change destruction certificate	78	change_destructioncertificate
311	Can delete destruction certificate	78	delete_destructioncertificate
312	Can view destruction certificate	78	view_destructioncertificate
313	Can add stock item consumable destruction certificate	82	add_stockitemconsumabledestructioncertificate
314	Can change stock item consumable destruction certificate	82	change_stockitemconsumabledestructioncertificate
315	Can delete stock item consumable destruction certificate	82	delete_stockitemconsumabledestructioncertificate
316	Can view stock item consumable destruction certificate	82	view_stockitemconsumabledestructioncertificate
317	Can add asset destruction certificate	79	add_assetdestructioncertificate
318	Can change asset destruction certificate	79	change_assetdestructioncertificate
319	Can delete asset destruction certificate	79	delete_assetdestructioncertificate
320	Can view asset destruction certificate	79	view_assetdestructioncertificate
321	Can add asset failed external maintenance	81	add_assetfailedexternalmaintenance
322	Can change asset failed external maintenance	81	change_assetfailedexternalmaintenance
323	Can delete asset failed external maintenance	81	delete_assetfailedexternalmaintenance
324	Can view asset failed external maintenance	81	view_assetfailedexternalmaintenance
325	Can add asset destruction certificate asset	80	add_assetdestructioncertificateasset
326	Can change asset destruction certificate asset	80	change_assetdestructioncertificateasset
327	Can delete asset destruction certificate asset	80	delete_assetdestructioncertificateasset
328	Can view asset destruction certificate asset	80	view_assetdestructioncertificateasset
329	Can add location	83	add_location
330	Can change location	83	change_location
331	Can delete location	83	delete_location
332	Can view location	83	view_location
333	Can add location type	84	add_locationtype
334	Can change location type	84	change_locationtype
335	Can delete location type	84	delete_locationtype
336	Can view location type	84	view_locationtype
337	Can add asset type translation	85	add_assettypetranslation
338	Can change asset type translation	85	change_assettypetranslation
339	Can delete asset type translation	85	delete_assettypetranslation
340	Can view asset type translation	85	view_assettypetranslation
341	Can add consumable type translation	86	add_consumabletypetranslation
342	Can change consumable type translation	86	change_consumabletypetranslation
343	Can delete consumable type translation	86	delete_consumabletypetranslation
344	Can view consumable type translation	86	view_consumabletypetranslation
345	Can add stock item type translation	93	add_stockitemtypetranslation
346	Can change stock item type translation	93	change_stockitemtypetranslation
347	Can delete stock item type translation	93	delete_stockitemtypetranslation
348	Can view stock item type translation	93	view_stockitemtypetranslation
349	Can add location relation	87	add_locationrelation
350	Can change location relation	87	change_locationrelation
351	Can delete location relation	87	delete_locationrelation
352	Can view location relation	87	view_locationrelation
353	Can add location type translation	88	add_locationtypetranslation
354	Can change location type translation	88	change_locationtypetranslation
355	Can delete location type translation	88	delete_locationtypetranslation
356	Can view location type translation	88	view_locationtypetranslation
357	Can add organizational structure type translation	89	add_organizationalstructuretypetranslation
358	Can change organizational structure type translation	89	change_organizationalstructuretypetranslation
359	Can delete organizational structure type translation	89	delete_organizationalstructuretypetranslation
360	Can view organizational structure type translation	89	view_organizationalstructuretypetranslation
361	Can add physical condition translation	90	add_physicalconditiontranslation
362	Can change physical condition translation	90	change_physicalconditiontranslation
363	Can delete physical condition translation	90	delete_physicalconditiontranslation
364	Can view physical condition translation	90	view_physicalconditiontranslation
365	Can add role translation	92	add_roletranslation
366	Can change role translation	92	change_roletranslation
367	Can delete role translation	92	delete_roletranslation
368	Can view role translation	92	view_roletranslation
369	Can add position translation	91	add_positiontranslation
370	Can change position translation	91	change_positiontranslation
371	Can delete position translation	91	delete_positiontranslation
372	Can view position translation	91	view_positiontranslation
373	Can add organizational structure type	96	add_organizationalstructuretype
374	Can change organizational structure type	96	change_organizationalstructuretype
375	Can delete organizational structure type	96	delete_organizationalstructuretype
376	Can view organizational structure type	96	view_organizationalstructuretype
377	Can add asset brand translation	94	add_assetbrandtranslation
378	Can change asset brand translation	94	change_assetbrandtranslation
379	Can delete asset brand translation	94	delete_assetbrandtranslation
380	Can view asset brand translation	94	view_assetbrandtranslation
381	Can add stock item brand translation	97	add_stockitembrandtranslation
382	Can change stock item brand translation	97	change_stockitembrandtranslation
383	Can delete stock item brand translation	97	delete_stockitembrandtranslation
384	Can view stock item brand translation	97	view_stockitembrandtranslation
385	Can add consumable brand translation	95	add_consumablebrandtranslation
386	Can change consumable brand translation	95	change_consumablebrandtranslation
387	Can delete consumable brand translation	95	delete_consumablebrandtranslation
388	Can view consumable brand translation	95	view_consumablebrandtranslation
389	Can add maintenance typical step translation	99	add_maintenancetypicalsteptranslation
390	Can change maintenance typical step translation	99	change_maintenancetypicalsteptranslation
391	Can delete maintenance typical step translation	99	delete_maintenancetypicalsteptranslation
392	Can view maintenance typical step translation	99	view_maintenancetypicalsteptranslation
393	Can add external maintenance typical step translation	98	add_externalmaintenancetypicalsteptranslation
394	Can change external maintenance typical step translation	98	change_externalmaintenancetypicalsteptranslation
395	Can delete external maintenance typical step translation	98	delete_externalmaintenancetypicalsteptranslation
396	Can view external maintenance typical step translation	98	view_externalmaintenancetypicalsteptranslation
397	Can add asset incident report translation	100	add_assetincidentreporttranslation
398	Can change asset incident report translation	100	change_assetincidentreporttranslation
399	Can delete asset incident report translation	100	delete_assetincidentreporttranslation
400	Can view asset incident report translation	100	view_assetincidentreporttranslation
401	Can add administrative certificate translation	101	add_administrativecertificatetranslation
402	Can change administrative certificate translation	101	change_administrativecertificatetranslation
403	Can delete administrative certificate translation	101	delete_administrativecertificatetranslation
404	Can view administrative certificate translation	101	view_administrativecertificatetranslation
405	Can add asset attribute definition translation	102	add_assetattributedefinitiontranslation
406	Can change asset attribute definition translation	102	change_assetattributedefinitiontranslation
407	Can delete asset attribute definition translation	102	delete_assetattributedefinitiontranslation
408	Can view asset attribute definition translation	102	view_assetattributedefinitiontranslation
409	Can add asset condition history translation	103	add_assetconditionhistorytranslation
410	Can change asset condition history translation	103	change_assetconditionhistorytranslation
411	Can delete asset condition history translation	103	delete_assetconditionhistorytranslation
412	Can view asset condition history translation	103	view_assetconditionhistorytranslation
413	Can add asset incident report	104	add_assetincidentreport
414	Can change asset incident report	104	change_assetincidentreport
415	Can delete asset incident report	104	delete_assetincidentreport
416	Can view asset incident report	104	view_assetincidentreport
417	Can add asset incident report consumable	105	add_assetincidentreportconsumable
418	Can change asset incident report consumable	105	change_assetincidentreportconsumable
419	Can delete asset incident report consumable	105	delete_assetincidentreportconsumable
420	Can view asset incident report consumable	105	view_assetincidentreportconsumable
421	Can add asset incident report stock item	106	add_assetincidentreportstockitem
422	Can change asset incident report stock item	106	change_assetincidentreportstockitem
423	Can delete asset incident report stock item	106	delete_assetincidentreportstockitem
424	Can view asset incident report stock item	106	view_assetincidentreportstockitem
425	Can add asset model translation	107	add_assetmodeltranslation
426	Can change asset model translation	107	change_assetmodeltranslation
427	Can delete asset model translation	107	delete_assetmodeltranslation
428	Can view asset model translation	107	view_assetmodeltranslation
429	Can add asset movement translation	108	add_assetmovementtranslation
430	Can change asset movement translation	108	change_assetmovementtranslation
431	Can delete asset movement translation	108	delete_assetmovementtranslation
432	Can view asset movement translation	108	view_assetmovementtranslation
433	Can add asset translation	109	add_assettranslation
434	Can change asset translation	109	change_assettranslation
435	Can delete asset translation	109	delete_assettranslation
436	Can view asset translation	109	view_assettranslation
437	Can add authentication log	110	add_authenticationlog
438	Can change authentication log	110	change_authenticationlog
439	Can delete authentication log	110	delete_authenticationlog
440	Can view authentication log	110	view_authenticationlog
441	Can add company asset request translation	111	add_companyassetrequesttranslation
442	Can change company asset request translation	111	change_companyassetrequesttranslation
443	Can delete company asset request translation	111	delete_companyassetrequesttranslation
444	Can view company asset request translation	111	view_companyassetrequesttranslation
445	Can add consumable attribute definition translation	112	add_consumableattributedefinitiontranslation
446	Can change consumable attribute definition translation	112	change_consumableattributedefinitiontranslation
447	Can delete consumable attribute definition translation	112	delete_consumableattributedefinitiontranslation
448	Can view consumable attribute definition translation	112	view_consumableattributedefinitiontranslation
449	Can add consumable condition history	113	add_consumableconditionhistory
450	Can change consumable condition history	113	change_consumableconditionhistory
451	Can delete consumable condition history	113	delete_consumableconditionhistory
452	Can view consumable condition history	113	view_consumableconditionhistory
453	Can add consumable condition history translation	114	add_consumableconditionhistorytranslation
454	Can change consumable condition history translation	114	change_consumableconditionhistorytranslation
455	Can delete consumable condition history translation	114	delete_consumableconditionhistorytranslation
456	Can view consumable condition history translation	114	view_consumableconditionhistorytranslation
457	Can add consumable model translation	115	add_consumablemodeltranslation
458	Can change consumable model translation	115	change_consumablemodeltranslation
459	Can delete consumable model translation	115	delete_consumablemodeltranslation
460	Can view consumable model translation	115	view_consumablemodeltranslation
461	Can add consumable movement translation	116	add_consumablemovementtranslation
462	Can change consumable movement translation	116	change_consumablemovementtranslation
463	Can delete consumable movement translation	116	delete_consumablemovementtranslation
464	Can view consumable movement translation	116	view_consumablemovementtranslation
465	Can add consumable translation	117	add_consumabletranslation
466	Can change consumable translation	117	change_consumabletranslation
467	Can delete consumable translation	117	delete_consumabletranslation
468	Can view consumable translation	117	view_consumabletranslation
469	Can add external maintenance document translation	118	add_externalmaintenancedocumenttranslation
470	Can change external maintenance document translation	118	change_externalmaintenancedocumenttranslation
471	Can delete external maintenance document translation	118	delete_externalmaintenancedocumenttranslation
472	Can view external maintenance document translation	118	view_externalmaintenancedocumenttranslation
473	Can add location translation	119	add_locationtranslation
474	Can change location translation	119	change_locationtranslation
475	Can delete location translation	119	delete_locationtranslation
476	Can view location translation	119	view_locationtranslation
477	Can add maintenance step item request translation	120	add_maintenancestepitemrequesttranslation
478	Can change maintenance step item request translation	120	change_maintenancestepitemrequesttranslation
479	Can delete maintenance step item request translation	120	delete_maintenancestepitemrequesttranslation
480	Can view maintenance step item request translation	120	view_maintenancestepitemrequesttranslation
481	Can add maintenance translation	121	add_maintenancetranslation
482	Can change maintenance translation	121	change_maintenancetranslation
483	Can delete maintenance translation	121	delete_maintenancetranslation
484	Can view maintenance translation	121	view_maintenancetranslation
485	Can add organizational structure translation	122	add_organizationalstructuretranslation
486	Can change organizational structure translation	122	change_organizationalstructuretranslation
487	Can delete organizational structure translation	122	delete_organizationalstructuretranslation
488	Can view organizational structure translation	122	view_organizationalstructuretranslation
489	Can add person assignment	123	add_personassignment
490	Can change person assignment	123	change_personassignment
491	Can delete person assignment	123	delete_personassignment
492	Can view person assignment	123	view_personassignment
493	Can add person reports problem on asset translation	124	add_personreportsproblemonassettranslation
494	Can change person reports problem on asset translation	124	change_personreportsproblemonassettranslation
495	Can delete person reports problem on asset translation	124	delete_personreportsproblemonassettranslation
496	Can view person reports problem on asset translation	124	view_personreportsproblemonassettranslation
497	Can add person reports problem on consumable translation	125	add_personreportsproblemonconsumabletranslation
498	Can change person reports problem on consumable translation	125	change_personreportsproblemonconsumabletranslation
499	Can delete person reports problem on consumable translation	125	delete_personreportsproblemonconsumabletranslation
500	Can view person reports problem on consumable translation	125	view_personreportsproblemonconsumabletranslation
501	Can add person reports problem on stock item translation	126	add_personreportsproblemonstockitemtranslation
502	Can change person reports problem on stock item translation	126	change_personreportsproblemonstockitemtranslation
503	Can delete person reports problem on stock item translation	126	delete_personreportsproblemonstockitemtranslation
504	Can view person reports problem on stock item translation	126	view_personreportsproblemonstockitemtranslation
505	Can add person translation	127	add_persontranslation
506	Can change person translation	127	change_persontranslation
507	Can delete person translation	127	delete_persontranslation
508	Can view person translation	127	view_persontranslation
509	Can add position role mapping	128	add_positionrolemapping
510	Can change position role mapping	128	change_positionrolemapping
511	Can delete position role mapping	128	delete_positionrolemapping
512	Can view position role mapping	128	view_positionrolemapping
513	Can add stock item attribute definition translation	129	add_stockitemattributedefinitiontranslation
514	Can change stock item attribute definition translation	129	change_stockitemattributedefinitiontranslation
515	Can delete stock item attribute definition translation	129	delete_stockitemattributedefinitiontranslation
516	Can view stock item attribute definition translation	129	view_stockitemattributedefinitiontranslation
517	Can add stock item condition history	130	add_stockitemconditionhistory
518	Can change stock item condition history	130	change_stockitemconditionhistory
519	Can delete stock item condition history	130	delete_stockitemconditionhistory
520	Can view stock item condition history	130	view_stockitemconditionhistory
521	Can add stock item condition history translation	131	add_stockitemconditionhistorytranslation
522	Can change stock item condition history translation	131	change_stockitemconditionhistorytranslation
523	Can delete stock item condition history translation	131	delete_stockitemconditionhistorytranslation
524	Can view stock item condition history translation	131	view_stockitemconditionhistorytranslation
525	Can add stock item model translation	132	add_stockitemmodeltranslation
526	Can change stock item model translation	132	change_stockitemmodeltranslation
527	Can delete stock item model translation	132	delete_stockitemmodeltranslation
528	Can view stock item model translation	132	view_stockitemmodeltranslation
529	Can add stock item movement translation	133	add_stockitemmovementtranslation
530	Can change stock item movement translation	133	change_stockitemmovementtranslation
531	Can delete stock item movement translation	133	delete_stockitemmovementtranslation
532	Can view stock item movement translation	133	view_stockitemmovementtranslation
533	Can add stock item translation	134	add_stockitemtranslation
534	Can change stock item translation	134	change_stockitemtranslation
535	Can delete stock item translation	134	delete_stockitemtranslation
536	Can view stock item translation	134	view_stockitemtranslation
537	Can add supplier	135	add_supplier
538	Can change supplier	135	change_supplier
539	Can delete supplier	135	delete_supplier
540	Can view supplier	135	view_supplier
541	Can add supplier translation	136	add_suppliertranslation
542	Can change supplier translation	136	change_suppliertranslation
543	Can delete supplier translation	136	delete_suppliertranslation
544	Can view supplier translation	136	view_suppliertranslation
545	Can add user session	137	add_usersession
546	Can change user session	137	change_usersession
547	Can delete user session	137	delete_usersession
548	Can view user session	137	view_usersession
549	Can add warehouse translation	138	add_warehousetranslation
550	Can change warehouse translation	138	change_warehousetranslation
551	Can delete warehouse translation	138	delete_warehousetranslation
552	Can view warehouse translation	138	view_warehousetranslation
553	Can add maintenance step status translation	140	add_maintenancestepstatustranslation
554	Can change maintenance step status translation	140	change_maintenancestepstatustranslation
555	Can delete maintenance step status translation	140	delete_maintenancestepstatustranslation
556	Can view maintenance step status translation	140	view_maintenancestepstatustranslation
557	Can add maintenance step status	139	add_maintenancestepstatus
558	Can change maintenance step status	139	change_maintenancestepstatus
559	Can delete maintenance step status	139	delete_maintenancestepstatus
560	Can view maintenance step status	139	view_maintenancestepstatus
\.


--
-- TOC entry 6742 (class 0 OID 43743)
-- Dependencies: 261
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$1200000$ceTbB0O5bCmm57swQmkEmg$/LZsB44AZf4ZGvXPW6p/4orTP53jVw3AJ38DC/OLrXE=	2026-04-21 05:05:38.408033-07	t	admin			admin@example.com	t	t	2026-02-09 12:42:30.666222-08
\.


--
-- TOC entry 6743 (class 0 OID 43758)
-- Dependencies: 262
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- TOC entry 6746 (class 0 OID 43766)
-- Dependencies: 265
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- TOC entry 6748 (class 0 OID 43773)
-- Dependencies: 267
-- Data for Name: authentication_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_log (log_id, user_id, attempted_username, event_type, ip_address, event_timestamp, failure_reason) FROM stdin;
1	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:04.33671	\N
2	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:05.853258	\N
3	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:07.088565	\N
4	17	manhous	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:12.774499	\N
5	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:21.353955	\N
6	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:36.219664	\N
7	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:37.08422	\N
8	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:01:55.708341	\N
9	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:05:18.409579	\N
10	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:09:44.351095	\N
11	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-13 21:09:58.112815	\N
12	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-14 08:51:09.291132	\N
13	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-14 08:51:56.143568	\N
14	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-16 12:36:44.26655	\N
15	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-17 07:17:38.091468	\N
16	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-17 16:27:41.590504	\N
17	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-17 18:40:32.38649	\N
18	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-17 18:40:38.841717	\N
19	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-17 18:40:55.62648	\N
20	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-17 19:32:06.502073	\N
21	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-17 19:41:09.90892	\N
22	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-18 20:59:22.951385	\N
23	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-19 08:20:43.097554	\N
24	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-20 09:30:36.058055	\N
25	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-20 13:25:22.783909	\N
26	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-20 16:14:53.711042	\N
27	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-20 21:39:56.40598	\N
28	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 06:28:28.735191	\N
29	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 14:38:57.93217	\N
30	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 16:34:41.351935	\N
31	3	mohamedmerine	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:18:43.05284	\N
32	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:19:58.002986	\N
33	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:20:48.206887	\N
34	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:21:57.705405	\N
35	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:22:46.035642	\N
36	3	mohamedmerine	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:23:55.886745	\N
37	3	mohamedmerine	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:24:09.295368	\N
38	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:24:34.128787	\N
39	3	mohamedmerine	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:26:17.68339	\N
40	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-21 17:26:47.222997	\N
41	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 19:42:11.637114	\N
42	3	mohamedmerine	LOGIN_SUCCESS	127.0.0.1	2026-04-21 19:42:43.360103	\N
43	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-21 19:42:58.106129	\N
44	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 19:43:17.522588	\N
45	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-21 19:43:39.972511	\N
46	3	mohamedmerine	LOGIN_SUCCESS	127.0.0.1	2026-04-21 19:44:07.325042	\N
47	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-21 21:04:01.384438	\N
48	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-22 06:58:40.63201	\N
49	6	mohamednedjouh	LOGIN_SUCCESS	127.0.0.1	2026-04-22 10:58:05.3053	\N
50	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 10:58:12.700575	\N
51	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-22 12:47:03.702215	\N
52	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 12:47:13.807983	\N
53	3	mohamedmerine	LOGIN_SUCCESS	127.0.0.1	2026-04-22 12:47:29.985926	\N
54	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-22 12:47:42.43435	\N
55	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-22 12:48:14.638389	\N
56	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 12:48:46.292975	\N
57	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-22 14:54:03.187466	\N
58	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-22 14:54:13.894326	\N
59	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 14:59:12.375182	\N
60	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-22 15:13:07.39739	\N
61	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 15:13:52.746152	\N
62	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-22 15:14:20.668525	\N
63	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 19:13:35.96442	\N
64	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-22 19:13:41.817139	\N
65	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 19:14:32.116594	\N
66	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-22 20:30:22.577087	\N
67	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-22 20:38:38.187711	\N
68	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-23 08:34:37.373335	\N
69	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-23 18:50:22.460267	\N
70	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 07:08:39.285718	\N
71	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-24 08:38:01.444387	\N
72	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 08:44:17.607272	\N
73	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 08:49:19.444147	\N
74	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 10:20:45.940957	\N
75	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 10:26:45.622391	\N
76	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 15:41:22.827192	\N
77	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:23:32.249712	\N
78	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:24:58.580073	\N
79	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:25:17.380846	\N
80	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:30:03.570909	\N
81	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:36:13.004667	\N
82	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:39:44.041061	\N
83	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:40:55.919098	\N
84	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 16:41:39.709849	\N
85	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-24 18:45:48.322339	\N
86	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 20:01:23.830809	\N
87	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 20:11:58.669902	\N
88	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 20:29:04.630665	\N
89	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-24 21:57:51.658794	\N
90	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-25 16:22:07.685935	\N
91	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-25 22:31:54.287194	\N
92	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-26 07:17:35.356942	\N
93	11	asset_resp	LOGIN_SUCCESS	127.0.0.1	2026-04-26 07:18:17.256581	\N
94	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-26 07:25:12.214362	\N
95	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-26 16:18:52.426413	\N
96	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-26 16:51:25.072592	\N
97	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-26 17:05:00.444201	\N
98	1	admin	LOGIN_FAILURE	127.0.0.1	2026-04-26 17:32:19.522192	Invalid Password
99	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-26 19:27:16.083554	\N
100	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-26 19:59:15.039152	\N
101	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 17:45:41.529395	\N
102	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 18:02:37.134258	\N
103	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 18:02:45.071002	\N
104	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 18:03:07.427155	\N
105	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 18:03:15.93929	\N
106	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 18:03:34.685491	\N
107	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 18:03:44.143626	\N
108	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-27 18:31:08.035834	\N
109	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-28 07:00:03.940328	\N
110	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-28 16:56:02.16173	\N
111	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-29 11:04:43.663832	\N
112	4	mohceneamoura	LOGIN_SUCCESS	127.0.0.1	2026-04-29 11:45:46.72863	\N
113	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-29 11:46:12.8378	\N
114	2	bahaaeddinezaoui	LOGIN_SUCCESS	127.0.0.1	2026-04-29 11:47:35.561769	\N
115	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-29 14:21:10.474816	\N
116	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-30 07:05:40.29151	\N
117	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-04-30 09:08:37.522871	\N
118	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 14:35:44.140129	\N
119	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:11:06.64301	\N
120	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:12:03.486181	\N
121	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:12:49.624526	\N
122	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:13:27.817539	\N
123	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:16:45.803176	\N
124	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:27:02.207823	\N
125	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:30:56.177508	\N
126	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-03 22:35:52.773565	\N
127	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-04 15:55:52.248411	\N
128	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-04 16:28:10.49235	\N
129	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-04 16:48:25.363999	\N
130	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-04 16:48:43.038914	\N
131	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-05 15:59:59.815641	\N
132	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-05 18:37:11.466383	\N
133	1	admin	LOGIN_SUCCESS	127.0.0.1	2026-05-06 10:20:23.274472	\N
\.


--
-- TOC entry 6749 (class 0 OID 43778)
-- Dependencies: 268
-- Data for Name: backorder_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report (backorder_report_id, purchase_order_id, backorder_report_date, digital_copy) FROM stdin;
1	6	2026-04-28	\N
2	6	2026-04-28	\N
\.


--
-- TOC entry 6750 (class 0 OID 43785)
-- Dependencies: 269
-- Data for Name: backorder_report_consumable_model_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report_consumable_model_line (backorder_report_id, consumable_model_id, quantity_ordered, quantity_received, quantity_remaining) FROM stdin;
\.


--
-- TOC entry 6751 (class 0 OID 43793)
-- Dependencies: 270
-- Data for Name: backorder_report_stock_item_model_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report_stock_item_model_line (backorder_report_id, stock_item_model_id, quantity_ordered, quantity_received, quantity_remaining) FROM stdin;
1	1	3	2	1
2	1	3	2	1
\.


--
-- TOC entry 6752 (class 0 OID 43801)
-- Dependencies: 271
-- Data for Name: broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broken_item_report (broken_item_report_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 6753 (class 0 OID 43807)
-- Dependencies: 272
-- Data for Name: company_asset_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_asset_request (company_asset_request_id, attribution_order_id, is_signed_by_company, administrative_serial_number, title_of_demand, organization_body_designation, register_number_or_book_journal_of_corpse, register_number_or_book_journal_of_establishment, is_signed_by_company_leader, is_signed_by_regional_provider, is_signed_by_company_representative, digital_copy) FROM stdin;
\.


--
-- TOC entry 6906 (class 0 OID 46281)
-- Dependencies: 425
-- Data for Name: company_asset_request_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_asset_request_translation (id, company_asset_request_id, language_code, title_of_demand, organization_body_designation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6754 (class 0 OID 43814)
-- Dependencies: 273
-- Data for Name: consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable (consumable_id, consumable_model_id, stock_item_consumable_destruction_certificate_id, consumable_name, consumable_serial_number, consumable_fabrication_datetime, consumable_inventory_number, consumable_service_tag, consumable_arrival_datetime, consumable_status, purchase_order_id) FROM stdin;
1	6	\N	Power Cable (included with M1 (included with fff	\N	\N	\N	\N	\N	assigned	\N
2	6	\N	Power Cable (included with M1 (included with fff	\N	\N	\N	\N	\N	assigned	\N
\.


--
-- TOC entry 6755 (class 0 OID 43819)
-- Dependencies: 274
-- Data for Name: consumable_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_definition (consumable_attribute_definition_id, consumable_type_code, data_type, unit, description, maintenance_domain) FROM stdin;
1	\N	number	m	Number of Meters	\N
2	\N	string	\N	Color	\N
3	\N	number	page(s)	Number of pages	\N
\.


--
-- TOC entry 6854 (class 0 OID 45712)
-- Dependencies: 373
-- Data for Name: consumable_attribute_definition_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_definition_translation (id, consumable_attribute_definition_id, language_code, description, unit, created_at, updated_at) FROM stdin;
1	1	en	Number of Meters	m	2026-04-18 20:18:22.179664	2026-04-18 20:18:22.179664
2	2	en	Color	\N	2026-04-18 20:18:22.179664	2026-04-18 20:18:22.179664
3	3	en	Number of pages	page(s)	2026-04-18 20:18:22.179664	2026-04-18 20:18:22.179664
4	1	ar	عدد الأمتار	\N	2026-04-20 10:31:27.979201	2026-04-20 10:37:43.352318
5	2	ar	اللون	\N	2026-04-20 10:31:27.981378	2026-04-20 10:37:43.353739
6	3	ar	عدد الصفحات	\N	2026-04-20 10:31:27.982471	2026-04-20 10:37:43.35499
\.


--
-- TOC entry 6756 (class 0 OID 43823)
-- Dependencies: 275
-- Data for Name: consumable_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_value (consumable_id, consumable_attribute_definition_id, value_string, value_bool, value_date, value_number) FROM stdin;
\.


--
-- TOC entry 6757 (class 0 OID 43830)
-- Dependencies: 276
-- Data for Name: consumable_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_brand (consumable_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	BIC	BIC	t	\N
2	Schneider	SCHNEIDER	t	\N
3	DELL	DELL	t	brands/consumables/Dell_whh9uC9.svg
\.


--
-- TOC entry 6916 (class 0 OID 46568)
-- Dependencies: 435
-- Data for Name: consumable_brand_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_brand_translation (id, consumable_brand_id, language_code, brand_name, created_at, updated_at) FROM stdin;
1	1	en	BIC	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
2	2	en	Schneider	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
3	3	en	DELL	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
\.


--
-- TOC entry 6758 (class 0 OID 43834)
-- Dependencies: 277
-- Data for Name: consumable_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_condition_history (consumable_condition_history_id, consumable_id, notes, cosmetic_issues, functional_issues, recommendation, created_at, condition_id) FROM stdin;
\.


--
-- TOC entry 6888 (class 0 OID 46088)
-- Dependencies: 407
-- Data for Name: consumable_condition_history_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_condition_history_translation (id, consumable_condition_history_id, language_code, notes, cosmetic_issues, functional_issues, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6930 (class 0 OID 47622)
-- Dependencies: 449
-- Data for Name: consumable_is_assigned_to_org_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_assigned_to_org_structure (assignment_id, organizational_structure_id, consumable_id, assigned_by_person_id, start_datetime, end_datetime, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	5	1	1	2026-05-06 16:22:00	\N	t	\N
2	5	2	1	2026-05-06 16:22:00	\N	t	\N
\.


--
-- TOC entry 6759 (class 0 OID 43841)
-- Dependencies: 278
-- Data for Name: consumable_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_assigned_to_person (assignment_id, consumable_id, person_id, assigned_by_person_id, start_datetime, end_datetime, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
\.


--
-- TOC entry 6760 (class 0 OID 43851)
-- Dependencies: 279
-- Data for Name: consumable_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_asset (consumable_model_id, asset_model_id) FROM stdin;
\.


--
-- TOC entry 6761 (class 0 OID 43856)
-- Dependencies: 280
-- Data for Name: consumable_is_compatible_with_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_stock_item (consumable_model_id, stock_item_model_id) FROM stdin;
\.


--
-- TOC entry 6762 (class 0 OID 43861)
-- Dependencies: 281
-- Data for Name: consumable_is_used_in_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_used_in_stock_item_history (consumable_id, stock_item_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
1	1	\N	2026-05-05 18:56:08.982741	\N	9	\N
2	1	\N	2026-05-05 18:56:08.982741	\N	10	\N
\.


--
-- TOC entry 6764 (class 0 OID 43868)
-- Dependencies: 283
-- Data for Name: consumable_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model (consumable_model_id, consumable_type_id, consumable_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months, consumable_model_name_in_administrative_certificate) FROM stdin;
2	2	1	EPSON M450	M450	\N	\N	t	\N	\N	\N
4	1	3	qPen	QPEN	\N	\N	t	\N	\N	\N
5	2	1	BIC TEST	bictest	\N	\N	t	\N	\N	\N
1	1	1	Red Pen 01	RP01	2000	\N	t		8	e1
3	1	2	Blue Pen	BP	\N	\N	t	\N	\N	z1
6	3	3	Power Cable	PWRCBL	\N	\N	t	\N	12	\N
\.


--
-- TOC entry 6765 (class 0 OID 43874)
-- Dependencies: 284
-- Data for Name: consumable_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_attribute_value (consumable_model_id, consumable_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	1	f	\N	500.000000	\N
2	3	\N	\N	1000.000000	\N
3	1	\N	\N	400.000000	\N
4	1	\N	\N	400.000000	\N
5	3	\N	\N	1000.000000	\N
\.


--
-- TOC entry 6766 (class 0 OID 43881)
-- Dependencies: 285
-- Data for Name: consumable_model_is_found_in_purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_is_found_in_purchase_order (consumable_model_id, purchase_order_id, quantity_ordered, quantity_received, unit_price) FROM stdin;
1	1	2	2	100.00
1	5	1	1	10.00
3	5	2	2	20.00
\.


--
-- TOC entry 6900 (class 0 OID 46218)
-- Dependencies: 419
-- Data for Name: consumable_model_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_translation (id, consumable_model_id, language_code, model_name, notes, created_at, updated_at, consumable_model_name_in_administrative_certificate) FROM stdin;
1	1	en	Red Pen 01		2026-04-18 20:18:22.222654	2026-04-18 20:18:22.222654	\N
2	2	en	EPSON M450	\N	2026-04-18 20:18:22.222654	2026-04-18 20:18:22.222654	\N
3	3	en	Blue Pen	\N	2026-04-18 20:18:22.222654	2026-04-18 20:18:22.222654	\N
4	4	en	qPen	\N	2026-04-18 20:18:22.222654	2026-04-18 20:18:22.222654	\N
5	5	en	BIC TEST	\N	2026-04-22 10:52:23.009198	2026-04-22 10:52:23.009226	\N
6	5	ar	بيك تيست	\N	2026-04-22 10:52:23.015983	2026-04-22 10:52:23.016011	\N
7	6	en	Power Cable	\N	2026-05-05 16:04:05.694758	2026-05-05 16:04:05.69482	Power Cable
8	6	ar	باور كابل	\N	2026-05-05 16:04:05.706415	2026-05-05 16:04:05.706461	باور كابل
\.


--
-- TOC entry 6767 (class 0 OID 43886)
-- Dependencies: 286
-- Data for Name: consumable_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_movement (consumable_movement_id, destination_location_id, source_location_id, maintenance_step_id, external_maintenance_step_id, consumable_id, movement_reason, movement_datetime, status, maintenance_id) FROM stdin;
\.


--
-- TOC entry 6874 (class 0 OID 45933)
-- Dependencies: 393
-- Data for Name: consumable_movement_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_movement_translation (id, consumable_movement_id, language_code, movement_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6894 (class 0 OID 46155)
-- Dependencies: 413
-- Data for Name: consumable_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_translation (id, consumable_id, language_code, consumable_name, created_at, updated_at, consumable_status) FROM stdin;
\.


--
-- TOC entry 6768 (class 0 OID 43897)
-- Dependencies: 287
-- Data for Name: consumable_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type (consumable_type_id, consumable_type_label, consumable_type_code, photo) FROM stdin;
1	Pen	PEN	\N
2	Toner	TNR	\N
3	Cable	CBL	\N
\.


--
-- TOC entry 6769 (class 0 OID 43903)
-- Dependencies: 288
-- Data for Name: consumable_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type_attribute (consumable_type_id, consumable_attribute_definition_id, is_mandatory, default_value) FROM stdin;
1	1	f	400
2	3	f	1000
\.


--
-- TOC entry 6838 (class 0 OID 45536)
-- Dependencies: 357
-- Data for Name: consumable_type_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type_translation (id, consumable_type_id, language_code, consumable_type_label, created_at, updated_at) FROM stdin;
1	1	en	Pen	2026-04-18 20:18:22.15264	2026-04-18 20:18:22.15264
2	2	en	Toner	2026-04-18 20:18:22.15264	2026-04-18 20:18:22.15264
3	1	ar	قلم	2026-04-20 10:31:27.838965	2026-04-20 10:37:43.259763
4	2	ar	حبر	2026-04-20 10:31:27.841776	2026-04-20 10:37:43.261757
5	3	ar	كابل	2026-05-05 16:03:30.960014	2026-05-05 16:03:30.960071
6	3	en	Cable	2026-05-05 16:03:30.97671	2026-05-05 16:03:30.976787
\.


--
-- TOC entry 6770 (class 0 OID 43908)
-- Dependencies: 289
-- Data for Name: delivery_note; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_note (delivery_note_id, purchase_order_id, delivery_note_date, digital_copy, delivery_note_code) FROM stdin;
1	1	2026-04-23	delivery_notes\\purchase_order_1\\delivery_note_ooo1.pdf	ooo1
2	4	2026-04-24	delivery_notes\\purchase_order_4\\delivery_note_hhhh.pdf	hhhh
3	6	2026-04-28	delivery_notes\\purchase_order_6\\delivery_note_dxcxcxcv.pdf	dxcxcxcv
4	5	2026-04-28	delivery_notes\\purchase_order_5\\delivery_note_c1.pdf	c1
5	3	2026-04-28	delivery_notes\\purchase_order_3\\delivery_note_eee.pdf	eee
\.


--
-- TOC entry 6771 (class 0 OID 43915)
-- Dependencies: 290
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- TOC entry 6773 (class 0 OID 43928)
-- Dependencies: 292
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	group
3	auth	permission
4	auth	user
5	contenttypes	contenttype
6	sessions	session
7	api	administrativecertificate
8	api	asset
9	api	assetattributedefinition
10	api	assetattributevalue
11	api	assetbrand
12	api	assetconditionhistory
13	api	assetisassignedtoperson
14	api	assetiscomposedofconsumablehistory
15	api	assetiscomposedofstockitemhistory
16	api	assetmodel
17	api	assetmodelattributevalue
18	api	assetmodeldefaultconsumable
19	api	assetmodeldefaultstockitem
20	api	assetmovement
21	api	assettype
22	api	assettypeattribute
23	api	attributionorder
24	api	companyassetrequest
25	api	consumable
26	api	consumableattributedefinition
27	api	consumableattributevalue
28	api	consumablebrand
29	api	consumableisassignedtoperson
30	api	consumableiscompatiblewithasset
31	api	consumableisusedinstockitemhistory
32	api	consumablemodel
33	api	consumablemodelattributevalue
34	api	consumablemovement
35	api	consumabletype
36	api	consumabletypeattribute
37	api	externalmaintenance
38	api	externalmaintenancedocument
39	api	externalmaintenanceprovider
40	api	externalmaintenancestep
41	api	externalmaintenancetypicalstep
42	api	maintenance
43	api	maintenancestep
44	api	maintenancestepattributechange
45	api	maintenancestepitemrequest
46	api	maintenancetypicalstep
47	api	organizationalstructure
48	api	organizationalstructurerelation
49	api	person
50	api	personreportsproblemonasset
51	api	personreportsproblemonconsumable
52	api	personreportsproblemonstockitem
53	api	personrolemapping
54	api	physicalcondition
55	api	position
56	api	receiptreport
57	api	role
58	api	room
59	api	roomtype
60	api	stockitem
61	api	stockitemattributedefinition
62	api	stockitemattributevalue
63	api	stockitembrand
64	api	stockitemisassignedtoperson
65	api	stockitemiscompatiblewithasset
66	api	stockitemmodel
67	api	stockitemmodelattributevalue
68	api	stockitemmovement
69	api	stockitemtype
70	api	stockitemtypeattribute
71	api	useraccount
72	api	warehouse
73	api	attributionorderassetconsumableaccessory
74	api	attributionorderassetstockitemaccessory
75	api	personreportsproblemonassetincludedconsumable
76	api	personreportsproblemonassetincludedcontext
77	api	personreportsproblemonassetincludedstockitem
78	api	destructioncertificate
79	api	assetdestructioncertificate
80	api	assetdestructioncertificateasset
81	api	assetfailedexternalmaintenance
82	api	stockitemconsumabledestructioncertificate
83	api	location
84	api	locationtype
85	api	assettypetranslation
86	api	consumabletypetranslation
87	api	locationrelation
88	api	locationtypetranslation
89	api	organizationalstructuretypetranslation
90	api	physicalconditiontranslation
91	api	positiontranslation
92	api	roletranslation
93	api	stockitemtypetranslation
94	api	assetbrandtranslation
95	api	consumablebrandtranslation
96	api	organizationalstructuretype
97	api	stockitembrandtranslation
98	api	externalmaintenancetypicalsteptranslation
99	api	maintenancetypicalsteptranslation
100	api	assetincidentreporttranslation
101	api	administrativecertificatetranslation
102	api	assetattributedefinitiontranslation
103	api	assetconditionhistorytranslation
104	api	assetincidentreport
105	api	assetincidentreportconsumable
106	api	assetincidentreportstockitem
107	api	assetmodeltranslation
108	api	assetmovementtranslation
109	api	assettranslation
110	api	authenticationlog
111	api	companyassetrequesttranslation
112	api	consumableattributedefinitiontranslation
113	api	consumableconditionhistory
114	api	consumableconditionhistorytranslation
115	api	consumablemodeltranslation
116	api	consumablemovementtranslation
117	api	consumabletranslation
118	api	externalmaintenancedocumenttranslation
119	api	locationtranslation
120	api	maintenancestepitemrequesttranslation
121	api	maintenancetranslation
122	api	organizationalstructuretranslation
123	api	personassignment
124	api	personreportsproblemonassettranslation
125	api	personreportsproblemonconsumabletranslation
126	api	personreportsproblemonstockitemtranslation
127	api	persontranslation
128	api	positionrolemapping
129	api	stockitemattributedefinitiontranslation
130	api	stockitemconditionhistory
131	api	stockitemconditionhistorytranslation
132	api	stockitemmodeltranslation
133	api	stockitemmovementtranslation
134	api	stockitemtranslation
135	api	supplier
136	api	suppliertranslation
137	api	usersession
138	api	warehousetranslation
139	api	maintenancestepstatus
140	api	maintenancestepstatustranslation
\.


--
-- TOC entry 6775 (class 0 OID 43935)
-- Dependencies: 294
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2026-02-09 12:35:13.466942-08
2	auth	0001_initial	2026-02-09 12:35:13.520947-08
3	admin	0001_initial	2026-02-09 12:35:13.536427-08
4	admin	0002_logentry_remove_auto_add	2026-02-09 12:35:13.539875-08
5	admin	0003_logentry_add_action_flag_choices	2026-02-09 12:35:13.543296-08
6	contenttypes	0002_remove_content_type_name	2026-02-09 12:35:13.553676-08
7	auth	0002_alter_permission_name_max_length	2026-02-09 12:35:13.557886-08
8	auth	0003_alter_user_email_max_length	2026-02-09 12:35:13.56232-08
9	auth	0004_alter_user_username_opts	2026-02-09 12:35:13.565955-08
10	auth	0005_alter_user_last_login_null	2026-02-09 12:35:13.570822-08
11	auth	0006_require_contenttypes_0002	2026-02-09 12:35:13.571613-08
12	auth	0007_alter_validators_add_error_messages	2026-02-09 12:35:13.574916-08
13	auth	0008_alter_user_username_max_length	2026-02-09 12:35:13.582377-08
14	auth	0009_alter_user_last_name_max_length	2026-02-09 12:35:13.587288-08
15	auth	0010_alter_group_name_max_length	2026-02-09 12:35:13.592134-08
16	auth	0011_update_proxy_permissions	2026-02-09 12:35:13.595774-08
17	auth	0012_alter_user_first_name_max_length	2026-02-09 12:35:13.600871-08
18	sessions	0001_initial	2026-02-09 12:35:13.606896-08
19	api	0001_initial	2026-02-27 14:50:21.335982-08
20	api	0002_add_movement_status	2026-03-05 03:46:27.050422-08
21	api	0003_movement_status_state	2026-03-05 04:20:25.537862-08
22	api	0004_attribution_order_accessories_state	2026-03-05 04:21:33.410195-08
23	api	0005_problem_report_included_items	2026-03-05 12:48:34.355955-08
24	api	0006_problem_report_included_items_add_id	2026-03-05 12:59:17.864914-08
25	api	0007_rename_bdc_to_purchase_order_tables	2026-03-05 14:46:55.07278-08
26	api	0008_rename_french_order_tables	2026-03-05 14:54:15.333719-08
27	api	0009_remove_quantity_invoiced_from_purchase_order_lines	2026-03-06 12:51:56.72384-08
28	api	0010_add_backorder_report_remaining_snapshots	2026-03-06 13:22:25.824041-08
29	api	0011_delivery_note_digital_copy_path	2026-03-06 15:12:55.879718-08
30	api	0012_rename_facture_to_invoice	2026-03-06 15:27:25.538201-08
31	api	0013_invoice_digital_copy_path	2026-03-06 15:36:54.86352-08
32	api	0014_add_acceptance_report_table	2026-03-06 15:55:29.667095-08
33	api	0015_destruction_certificate_digital_copy_path	2026-03-07 12:14:18.87631-08
34	api	0016_destructioncertificate	2026-03-07 12:46:17.565109-08
35	api	0017_asset_and_stock_destruction_certificates_split	2026-03-08 03:59:41.821767-07
36	api	0018_rename_room_to_location	2026-03-08 06:09:29.726241-07
37	api	0019_rename_room_type_to_location_type	2026-03-08 06:29:12.098972-07
40	api	0020_managed_locations	2026-03-08 06:46:30.729114-07
41	api	0021_admin_cert_and_receipt_report_digital_copy_path	2026-03-09 05:34:34.571281-07
42	api	0022_remaining_digital_copy_paths	2026-03-09 05:34:34.635118-07
43	api	0023_admin_cert_items_moved_flag	2026-03-09 07:12:36.134437-07
44	api	0024_location_location_type	2026-03-11 16:34:58.831837-07
45	api	0025_remove_brand_photos	2026-03-11 16:34:58.849577-07
46	api	0026_location_relation	2026-04-17 03:50:16.696868-07
47	api	0013_add_i18n_translation_tables	2026-04-20 02:29:01.586072-07
48	api	0027_merge_20260420_1028	2026-04-20 02:29:01.594206-07
49	api	0028_add_brand_translation_tables	2026-04-21 09:14:44.859597-07
50	api	0029_add_maintenance_step_note	2026-04-21 10:17:43.776387-07
51	api	0030_add_typical_step_translation_fields	2026-04-22 08:09:34.50931-07
52	api	0031_add_maintenance_id_to_movements	2026-04-22 13:27:01.541208-07
53	api	0032_add_status_to_entity_translations	2026-04-23 14:34:41.668297-07
54	api	0033_add_asset_incident_report_translation	2026-04-24 00:07:27.631165-07
55	api	0034_fix_asset_incident_report_translation	2026-04-24 00:36:17.027504-07
56	api	0035_add_user_account_is_approved_and_person_assignment	2026-04-24 02:22:02.696239-07
57	api	0036_remove_condition_on_assignment	2026-04-26 12:11:28.190063-07
58	api	0037_remove_condition_on_assignment_state	2026-04-26 12:12:46.957317-07
59	api	0038_add_maintenance_step_status_lookup	2026-04-28 01:22:26.241183-07
60	api	0039_add_condition_id_to_consumable_condition_history	2026-04-28 05:16:06.295312-07
61	api	0040_add_purchase_order_id_to_stock_item_and_consumable	2026-04-28 05:16:06.384939-07
62	api	0041_add_stock_item_serial_number	2026-04-28 10:34:53.308729-07
63	api	0042_move_admin_cert_name_to_model	2026-04-29 07:18:02.909418-07
64	api	0043_add_stock_item_model_default_consumable	2026-05-04 10:50:16.173584-07
\.


--
-- TOC entry 6777 (class 0 OID 43945)
-- Dependencies: 296
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
mwube6mtzimgwmghul5d0r6qos8lqeqe	.eJxVjDsOwjAQBe_iGllr_Isp6XMGa-3d4ACypTipEHeHSCmgfTPzXiLitpa4dV7iTOIilDj9bgnzg-sO6I711mRudV3mJHdFHrTLsRE_r4f7d1Cwl2_NGbPT5EgF9FYTZW8QXLA8KRwAskNzBgbwnsGHkAIwDWYCT4Taknh_APYiOC0:1vpY5p:xY5WGtSgTAbInJSRivcUir-NtXutxfuZCHkLUnB8v1k	2026-02-23 12:42:49.784307-08
ij85qiyk6mztfdllu95v0q8aluoponoe	.eJxVjDsOwjAQBe_iGllr_Isp6XMGa-3d4ACypTipEHeHSCmgfTPzXiLitpa4dV7iTOIilDj9bgnzg-sO6I711mRudV3mJHdFHrTLsRE_r4f7d1Cwl2_NGbPT5EgF9FYTZW8QXLA8KRwAskNzBgbwnsGHkAIwDWYCT4Taknh_APYiOC0:1wF9n4:C68isF5juzJMMF6_WOCsxh_DQn9WPTo3fcn3u00qN5c	2026-05-05 05:01:18.926594-07
3xkj0bn0r0aoj02aqdro6j8g3z3ozzyt	.eJxVjLsOgzAMAP_FcxWZkgdh7M43IMc2DW0VJAJT1X-vkBja9e50bxhp3_K4V13HWaCHBi6_LBE_tRxCHlTui-GlbOuczJGY01YzLKKv29n-DTLVDD0oE_tWvDSRgmtFOFhCH51ODXWI7MleURFDUAwxpogqnZ0wiFDrBD5f9iI4LQ:1wF9rG:j0yBRFYiNyHEJicTl9PkbOmxx84gQAjZXHS2j3nuI6c	2026-05-05 05:05:38.410115-07
muxf5myj67nezq818r89ve5z827l7rln	.eJyrVopPLC3JiC8tTi2Kz0xRslIyVNJBFktKTM5OzQNJpGQl5qXn6yXn55UUZSbpgZToQWWL9XzzU1JznKBqUQzISCzOAOpWqgUAGNEmTQ:1wH3Ma:-LfOAnjQVW3WyOgXjj1Ge7Ji5lwAx91zPe6w4hoyBU4	2026-05-10 10:33:48.024958-07
\.


--
-- TOC entry 6778 (class 0 OID 43953)
-- Dependencies: 297
-- Data for Name: external_maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance (external_maintenance_id, maintenance_id, item_received_by_maintenance_provider_datetime, item_sent_to_company_datetime, item_sent_to_external_maintenance_datetime, item_received_by_company_datetime, external_maintenance_status, external_maintenance_provider_id) FROM stdin;
\.


--
-- TOC entry 6779 (class 0 OID 43959)
-- Dependencies: 298
-- Data for Name: external_maintenance_document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_document (external_maintenance_document_id, external_maintenance_id, document_is_signed, item_is_received_by_maintenance_provider, maintenance_provider_final_decision, digital_copy) FROM stdin;
\.


--
-- TOC entry 6908 (class 0 OID 46302)
-- Dependencies: 427
-- Data for Name: external_maintenance_document_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_document_translation (id, external_maintenance_document_id, language_code, maintenance_provider_final_decision, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6780 (class 0 OID 43966)
-- Dependencies: 299
-- Data for Name: external_maintenance_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_provider (external_maintenance_provider_id, external_maintenance_provider_name, external_maintenance_provider_location) FROM stdin;
1	ERMT/2RM	\N
\.


--
-- TOC entry 6781 (class 0 OID 43970)
-- Dependencies: 300
-- Data for Name: external_maintenance_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_step (external_maintenance_step_id, external_maintenance_id, external_maintenance_typical_step_id, start_datetime, end_datetime, is_successful) FROM stdin;
\.


--
-- TOC entry 6782 (class 0 OID 43976)
-- Dependencies: 301
-- Data for Name: external_maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_typical_step (external_maintenance_typical_step_id, estimated_cost, actual_cost, maintenance_type, description, maintenance_domain, operation_type) FROM stdin;
1	\N	\N	Hardware	Removing the motherboard	it	\N
2	\N	\N	Hardware	Removing the RAM	it	\N
\.


--
-- TOC entry 6860 (class 0 OID 45778)
-- Dependencies: 379
-- Data for Name: external_maintenance_typical_step_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_typical_step_translation (id, external_maintenance_typical_step_id, language_code, description, created_at, updated_at, maintenance_type, operation_type, maintenance_domain) FROM stdin;
3	1	ar	إزالة اللوحة الأم	2026-04-20 10:31:28.005189	2026-04-20 10:33:35.406783	\N	\N	\N
4	2	ar	إزالة الذاكرة	2026-04-20 10:31:28.007452	2026-04-20 10:33:35.408299	\N	\N	\N
1	1	en	Removing the motherboard	2026-04-18 20:18:22.188886	2026-04-18 20:18:22.188886	Hardware	\N	it
2	2	en	Removing the RAM	2026-04-18 20:18:22.188886	2026-04-18 20:18:22.188886	Hardware	\N	it
\.


--
-- TOC entry 6783 (class 0 OID 43981)
-- Dependencies: 302
-- Data for Name: invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice (invoice_id, delivery_note_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 6784 (class 0 OID 43988)
-- Dependencies: 303
-- Data for Name: location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location (location_id, location_name, location_type_id) FROM stdin;
1	Teaching Room 1	1
2	Teaching Room 2	1
3	Teaching Room 3	1
4	Teaching Room 4	1
5	Teaching Room 5	1
6	Teaching Room 6	1
7	Teaching Room 7	1
8	Teaching Room 8	1
9	Teaching Room 9	1
10	Teaching Room 10	1
11	Teaching Room 11	1
12	Teaching Room 12	1
13	Teaching Room 13	1
14	Teaching Room 14	1
15	Teaching Room 15	1
16	Teaching Room 16	1
17	Teaching Room 17 (2nd Site)	1
18	Teaching Room 18 (2nd Site)	1
19	Teaching Room 19 (2nd Site)	1
20	Teaching Room 20 (2nd Site)	1
21	Teaching Room 21 (2nd Site)	1
22	Teaching Room 22 (2nd Site)	1
23	IT Main Storage Room	3
25	ERMT/2RM Maintenance Room	4
26	IT Bureau	5
24	IT Bureau: Maintenance Room	2
27	IT Bureau: Server Room	5
28	test	1
29	xqsqsqsq	1
\.


--
-- TOC entry 6785 (class 0 OID 43992)
-- Dependencies: 304
-- Data for Name: location_belongs_to_organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_belongs_to_organizational_structure (organizational_structure_id, location_id) FROM stdin;
\.


--
-- TOC entry 6786 (class 0 OID 43997)
-- Dependencies: 305
-- Data for Name: location_relation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_relation (child_location_id, parent_location_id, relation_id) FROM stdin;
23	26	1
24	26	2
27	26	3
\.


--
-- TOC entry 6868 (class 0 OID 45867)
-- Dependencies: 387
-- Data for Name: location_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_translation (id, location_id, language_code, location_name, created_at, updated_at) FROM stdin;
1	1	en	Teaching Room 1	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
2	2	en	Teaching Room 2	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
3	3	en	Teaching Room 3	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
4	4	en	Teaching Room 4	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
5	5	en	Teaching Room 5	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
6	6	en	Teaching Room 6	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
7	7	en	Teaching Room 7	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
8	8	en	Teaching Room 8	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
9	9	en	Teaching Room 9	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
10	10	en	Teaching Room 10	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
11	11	en	Teaching Room 11	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
12	12	en	Teaching Room 12	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
13	13	en	Teaching Room 13	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
14	14	en	Teaching Room 14	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
15	15	en	Teaching Room 15	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
16	16	en	Teaching Room 16	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
17	17	en	Teaching Room 17 (2nd Site)	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
18	18	en	Teaching Room 18 (2nd Site)	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
19	19	en	Teaching Room 19 (2nd Site)	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
20	20	en	Teaching Room 20 (2nd Site)	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
21	21	en	Teaching Room 21 (2nd Site)	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
22	22	en	Teaching Room 22 (2nd Site)	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
23	23	en	IT Main Storage Room	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
24	25	en	ERMT/2RM Maintenance Room	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
25	26	en	IT Bureau	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
26	24	en	IT Bureau: Maintenance Room	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
27	27	en	IT Bureau: Server Room	2026-04-18 20:18:22.199637	2026-04-18 20:18:22.199637
28	1	ar	قاعة تدريس 1	2026-04-20 10:31:28.011059	2026-04-20 10:33:35.41258
29	2	ar	قاعة تدريس 2	2026-04-20 10:31:28.013318	2026-04-20 10:33:35.413909
30	3	ar	قاعة تدريس 3	2026-04-20 10:31:28.014395	2026-04-20 10:33:35.415251
31	4	ar	قاعة تدريس 4	2026-04-20 10:31:28.015471	2026-04-20 10:33:35.416461
32	5	ar	قاعة تدريس 5	2026-04-20 10:31:28.016532	2026-04-20 10:33:35.417657
33	6	ar	قاعة تدريس 6	2026-04-20 10:31:28.017529	2026-04-20 10:33:35.418738
34	7	ar	قاعة تدريس 7	2026-04-20 10:31:28.018512	2026-04-20 10:33:35.419791
35	8	ar	قاعة تدريس 8	2026-04-20 10:31:28.019489	2026-04-20 10:33:35.420876
36	9	ar	قاعة تدريس 9	2026-04-20 10:31:28.020501	2026-04-20 10:33:35.421965
37	10	ar	قاعة تدريس 10	2026-04-20 10:31:28.021457	2026-04-20 10:33:35.42303
38	11	ar	قاعة تدريس 11	2026-04-20 10:31:28.02244	2026-04-20 10:33:35.424064
39	12	ar	قاعة تدريس 12	2026-04-20 10:31:28.024049	2026-04-20 10:33:35.425579
40	13	ar	قاعة تدريس 13	2026-04-20 10:31:28.026166	2026-04-20 10:33:35.427309
41	14	ar	قاعة تدريس 14	2026-04-20 10:31:28.027751	2026-04-20 10:33:35.428725
42	15	ar	قاعة تدريس 15	2026-04-20 10:31:28.029132	2026-04-20 10:33:35.429964
43	16	ar	قاعة تدريس 16	2026-04-20 10:31:28.030253	2026-04-20 10:33:35.43104
44	17	ar	قاعة تدريس 17 (الموقع 2)	2026-04-20 10:31:28.031269	2026-04-20 10:33:35.432193
45	18	ar	قاعة تدريس 18 (الموقع 2)	2026-04-20 10:31:28.032301	2026-04-20 10:33:35.433235
46	19	ar	قاعة تدريس 19 (الموقع 2)	2026-04-20 10:31:28.033302	2026-04-20 10:33:35.434277
47	20	ar	قاعة تدريس 20 (الموقع 2)	2026-04-20 10:31:28.034301	2026-04-20 10:33:35.435364
48	21	ar	قاعة تدريس 21 (الموقع 2)	2026-04-20 10:31:28.035324	2026-04-20 10:33:35.436439
49	22	ar	قاعة تدريس 22 (الموقع 2)	2026-04-20 10:31:28.036276	2026-04-20 10:33:35.437512
50	23	ar	مخزن تقنية المعلومات الرئيسي	2026-04-20 10:31:28.037278	2026-04-20 10:33:35.438616
51	24	ar	مكتب IT: غرفة الصيانة	2026-04-20 10:40:18.020979	2026-04-20 10:40:18.020989
52	25	ar	ERMT/2RM غرفة الصيانة	2026-04-20 10:40:18.036991	2026-04-20 10:40:18.036999
53	26	ar	مكتب تقنية المعلومات	2026-04-20 10:40:18.038583	2026-04-20 10:40:18.038588
54	27	ar	مكتب IT: غرفة الخوادم	2026-04-20 10:40:18.039782	2026-04-20 10:40:18.039787
\.


--
-- TOC entry 6787 (class 0 OID 44002)
-- Dependencies: 306
-- Data for Name: location_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_type (location_type_id, location_type_label, location_type_code) FROM stdin;
1	Teaching Room	TR
3	Storage Room	SR
4	External Maintenance Center	XMC
2	Maintenance Room	MR
5	Work Room	WR
\.


--
-- TOC entry 6842 (class 0 OID 45580)
-- Dependencies: 361
-- Data for Name: location_type_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_type_translation (id, location_type_id, language_code, location_type_label, created_at, updated_at) FROM stdin;
1	1	en	Teaching Room	2026-04-18 20:18:22.159507	2026-04-18 20:18:22.159507
2	3	en	Storage Room	2026-04-18 20:18:22.159507	2026-04-18 20:18:22.159507
3	4	en	External Maintenance Center	2026-04-18 20:18:22.159507	2026-04-18 20:18:22.159507
4	2	en	Maintenance Room	2026-04-18 20:18:22.159507	2026-04-18 20:18:22.159507
5	5	en	Work Room	2026-04-18 20:18:22.159507	2026-04-18 20:18:22.159507
6	1	ar	قاعة تدريس	2026-04-20 10:31:27.856037	2026-04-20 10:33:35.245304
7	2	ar	غرفة صيانة	2026-04-20 10:31:27.85848	2026-04-20 10:33:35.247722
8	3	ar	غرفة تخزين	2026-04-20 10:31:27.859955	2026-04-20 10:33:35.249705
9	4	ar	مركز صيانة خارجي	2026-04-20 10:31:27.861501	2026-04-20 10:33:35.251677
10	5	ar	غرفة عمل	2026-04-20 10:31:27.862724	2026-04-20 10:33:35.253911
\.


--
-- TOC entry 6789 (class 0 OID 44009)
-- Dependencies: 308
-- Data for Name: maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance (maintenance_id, asset_id, performed_by_person_id, approved_by_maintenance_chief_id, is_approved_by_maintenance_chief, start_datetime, end_datetime, description, is_successful, digital_copy, stock_item_id, consumable_id, maintenance_status) FROM stdin;
\.


--
-- TOC entry 6790 (class 0 OID 44017)
-- Dependencies: 309
-- Data for Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_inspection_leads_to_broken_item_report (maintenance_id, broken_item_report_id) FROM stdin;
\.


--
-- TOC entry 6791 (class 0 OID 44022)
-- Dependencies: 310
-- Data for Name: maintenance_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step (maintenance_step_id, maintenance_id, maintenance_typical_step_id, person_id, asset_condition_history_id, stock_item_condition_history_id, consumable_condition_history_id, start_datetime, end_datetime, is_successful, maintenance_step_status, note, status_id) FROM stdin;
\.


--
-- TOC entry 6792 (class 0 OID 44029)
-- Dependencies: 311
-- Data for Name: maintenance_step_attribute_change; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_attribute_change (maintenance_step_attribute_change_id, target_type, target_id, attribute_definition_id, value_string, value_bool, value_date, value_number, created_at_datetime, created_by_user_id, applied_at_datetime, maintenance_step_id) FROM stdin;
\.


--
-- TOC entry 6794 (class 0 OID 44040)
-- Dependencies: 313
-- Data for Name: maintenance_step_item_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_item_request (maintenance_step_item_request_id, maintenance_step_id, requested_by_person_id, request_type, status, created_at, fulfilled_at, stock_item_id, consumable_id, source_location_id, destination_location_id, note, fulfilled_by_person_id, requested_stock_item_model_id, requested_consumable_model_id, rejected_by_person_id, rejected_at) FROM stdin;
\.


--
-- TOC entry 6910 (class 0 OID 46323)
-- Dependencies: 429
-- Data for Name: maintenance_step_item_request_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_item_request_translation (id, maintenance_step_item_request_id, language_code, note, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6920 (class 0 OID 47011)
-- Dependencies: 439
-- Data for Name: maintenance_step_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_status (id, code, sort_order) FROM stdin;
1	PENDING	10
2	STARTED	20
3	PENDING_STOCK_ITEM	30
4	PENDING_CONSUMABLE	30
5	IN_PROGRESS	40
6	DONE	50
7	FAILED_HIGHER_LEVEL	50
8	CANCELLED	50
\.


--
-- TOC entry 6922 (class 0 OID 47023)
-- Dependencies: 441
-- Data for Name: maintenance_step_status_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_status_translation (id, maintenance_step_status_id, language_code, maintenance_step_status_label, created_at, updated_at) FROM stdin;
1	1	en	Pending	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
2	2	en	Started	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
3	3	en	Pending (waiting for stock item)	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
4	4	en	Pending (waiting for consumable)	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
5	5	en	In Progress	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
6	6	en	Done	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
7	7	en	Failed (to be sent to a higher level)	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
8	8	en	Cancelled	2026-04-28 01:07:15.349982	2026-04-28 01:07:15.349982
9	1	ar	قيد الانتظار	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
10	2	ar	بدأت	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
11	3	ar	قيد الانتظار (في انتظار عنصر المخزون)	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
12	4	ar	قيد الانتظار (في انتظار المستهلك)	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
13	5	ar	قيد التنفيذ	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
14	6	ar	منتهية	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
15	7	ar	فشلت (يجب إرسالها إلى مستوى أعلى)	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
16	8	ar	ملغاة	2026-04-28 01:22:40.611832	2026-04-28 01:22:40.611832
\.


--
-- TOC entry 6884 (class 0 OID 46043)
-- Dependencies: 403
-- Data for Name: maintenance_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_translation (id, maintenance_id, language_code, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6795 (class 0 OID 44049)
-- Dependencies: 314
-- Data for Name: maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_typical_step (maintenance_typical_step_id, estimated_cost, actual_cost, description, maintenance_type, operation_type, maintenance_domain) FROM stdin;
1	1000.00	700.00	Changing the thermal paste	Hardware	change	it
2	\N	\N	Unmounting the old RAM	Hardware	change	it
4	\N	\N	Removing a pen	Hardware	remove	it
5	\N	\N	Network Hardware Diagnostic	Hardware	inspect	network
6	2000.00	1700.00	Network Software Configuration	Software	change	network
3	200.00	220.00	Adding a pen	Hardware	add	it
\.


--
-- TOC entry 6858 (class 0 OID 45756)
-- Dependencies: 377
-- Data for Name: maintenance_typical_step_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_typical_step_translation (id, maintenance_typical_step_id, language_code, description, created_at, updated_at, maintenance_type, operation_type, maintenance_domain) FROM stdin;
7	1	ar	تغيير المعجون الحراري	2026-04-20 10:31:27.995968	2026-04-20 10:33:35.398017	\N	\N	\N
8	2	ar	إزالة الذاكرة القديمة	2026-04-20 10:31:27.998195	2026-04-20 10:33:35.399289	\N	\N	\N
9	3	ar	إضافة قلم	2026-04-20 10:31:27.999264	2026-04-20 10:33:35.400405	\N	\N	\N
10	4	ar	إزالة قلم	2026-04-20 10:31:28.000312	2026-04-20 10:33:35.401455	\N	\N	\N
11	5	ar	تشخيص أجهزة الشبكة	2026-04-20 10:31:28.001386	2026-04-20 10:33:35.402559	\N	\N	\N
12	6	ar	إعداد برمجيات الشبكة	2026-04-20 10:31:28.002421	2026-04-20 10:33:35.403888	\N	\N	\N
1	1	en	Changing the thermal paste	2026-04-18 20:18:22.185046	2026-04-18 20:18:22.185046	Hardware	change	it
2	2	en	Unmounting the old RAM	2026-04-18 20:18:22.185046	2026-04-18 20:18:22.185046	Hardware	change	it
3	4	en	Removing a pen	2026-04-18 20:18:22.185046	2026-04-18 20:18:22.185046	Hardware	remove	it
4	5	en	Network Hardware Diagnostic	2026-04-18 20:18:22.185046	2026-04-18 20:18:22.185046	Hardware	inspect	network
5	6	en	Network Software Configuration	2026-04-18 20:18:22.185046	2026-04-18 20:18:22.185046	Software	change	network
6	3	en	Adding a pen	2026-04-18 20:18:22.185046	2026-04-18 20:18:22.185046	Hardware	add	it
\.


--
-- TOC entry 6796 (class 0 OID 44057)
-- Dependencies: 315
-- Data for Name: organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure (organizational_structure_id, structure_code, structure_name, is_active, structure_type_id) FROM stdin;
2	MNT	Maintenance	t	2
3	EXP	Exploitation Section	t	2
4	HR	Human Resources	t	3
1	IT	Information Technology	t	1
5	PS	Protection & Security	t	1
6	GS	General Secretary	t	1
\.


--
-- TOC entry 6797 (class 0 OID 44061)
-- Dependencies: 316
-- Data for Name: organizational_structure_relation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_relation (child_organizational_structure_id, parent_organizational_structure_id, relation_id) FROM stdin;
2	1	\N
\.


--
-- TOC entry 6870 (class 0 OID 45889)
-- Dependencies: 389
-- Data for Name: organizational_structure_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_translation (id, organizational_structure_id, language_code, structure_name, created_at, updated_at) FROM stdin;
1	2	en	Maintenance	2026-04-18 20:18:22.201992	2026-04-18 20:18:22.201992
2	3	en	Exploitation Section	2026-04-18 20:18:22.201992	2026-04-18 20:18:22.201992
3	4	en	Human Resources	2026-04-18 20:18:22.201992	2026-04-18 20:18:22.201992
4	1	en	Information Technology	2026-04-18 20:18:22.201992	2026-04-18 20:18:22.201992
5	5	en	Protection & Security	2026-04-18 20:18:22.201992	2026-04-18 20:18:22.201992
6	6	en	General Secretary	2026-04-18 20:18:22.201992	2026-04-18 20:18:22.201992
7	1	ar	تكنولوجيا المعلومات	2026-04-20 10:40:18.042755	2026-04-20 10:40:18.042783
8	2	ar	الصيانة	2026-04-20 10:40:18.046148	2026-04-20 10:40:18.046153
9	3	ar	قسم التشغيل	2026-04-20 10:40:18.047462	2026-04-20 10:40:18.047466
10	4	ar	الموارد البشرية	2026-04-20 10:40:18.048562	2026-04-20 10:40:18.048565
11	5	ar	الحماية والأمن	2026-04-20 10:40:18.04976	2026-04-20 10:40:18.049764
12	6	ar	الأمانة العامة	2026-04-20 10:40:18.050912	2026-04-20 10:40:18.050917
\.


--
-- TOC entry 6798 (class 0 OID 44066)
-- Dependencies: 317
-- Data for Name: organizational_structure_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_type (organizational_structure_type_id, organizational_structure_type) FROM stdin;
1	Bureau
2	Section
3	Service
4	Direction
\.


--
-- TOC entry 6844 (class 0 OID 45602)
-- Dependencies: 363
-- Data for Name: organizational_structure_type_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_type_translation (id, organizational_structure_type_id, language_code, organizational_structure_type, created_at, updated_at) FROM stdin;
1	1	en	Bureau	2026-04-18 20:18:22.163047	2026-04-18 20:18:22.163047
2	2	en	Section	2026-04-18 20:18:22.163047	2026-04-18 20:18:22.163047
3	3	en	Service	2026-04-18 20:18:22.163047	2026-04-18 20:18:22.163047
4	4	en	Direction	2026-04-18 20:18:22.163047	2026-04-18 20:18:22.163047
5	1	ar	مكتب	2026-04-20 10:31:27.865804	2026-04-20 10:33:35.259959
6	2	ar	قسم	2026-04-20 10:31:27.867768	2026-04-20 10:33:35.262561
7	3	ar	مصلحة	2026-04-20 10:31:27.868806	2026-04-20 10:33:35.264536
8	4	ar	مديرية	2026-04-20 10:31:27.869899	2026-04-20 10:33:35.266028
\.


--
-- TOC entry 6800 (class 0 OID 44072)
-- Dependencies: 319
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person (person_id, first_name, last_name, sex, birth_date, is_approved) FROM stdin;
1	System	Administrator	Male  	2001-08-21	t
6	Bahaa Eddine	ZAOUI	Male  	2001-08-21	t
7	Mohamed	MERINE	Male  	1990-01-01	t
9	Mohamed	NEDJOUH	Male  	1994-02-05	t
10	Daoud	BEN SI Messaoud	Male  	2002-02-27	t
8	Mohcene	AMOURA	Male  	2001-07-03	t
1009	Charaf Eddine	KEDAYA	Male  	1990-01-01	t
1007	Ibrahim	AIDOUNI	Male  	1990-01-01	t
1008	Daoud	BEN SI MESSAOUD (Asset Responsible)	Male  	1990-01-01	t
1012	Sofiane	BEN AMOR	Male  	1990-01-01	t
1013	M'hamed	BOUREMLA	Male  	1990-01-01	t
777	Random	Person	Male  	2000-01-01	t
1014	Said	SIDI OUIS	Male  	1990-01-01	t
1015	Amal	BOULEFRED	Female	1990-01-01	t
1016	testing	signupt	Male  	2001-08-21	f
1017	fsdfdsf	fdsfdsfsd	Male  	2001-08-21	t
\.


--
-- TOC entry 6801 (class 0 OID 44081)
-- Dependencies: 320
-- Data for Name: person_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_assignment (assignment_id, position_id, person_id, assignment_start_date, assignment_end_date, employment_type) FROM stdin;
1	10099	1016	2026-04-24	\N	Permanent
\.


--
-- TOC entry 6802 (class 0 OID 44087)
-- Dependencies: 321
-- Data for Name: person_reports_problem_on_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset (asset_id, person_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 6803 (class 0 OID 44095)
-- Dependencies: 322
-- Data for Name: person_reports_problem_on_asset_included_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_consumable (report_id, consumable_id, id) FROM stdin;
\.


--
-- TOC entry 6805 (class 0 OID 44102)
-- Dependencies: 324
-- Data for Name: person_reports_problem_on_asset_included_context; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_context (report_id, destination_location_id) FROM stdin;
\.


--
-- TOC entry 6806 (class 0 OID 44107)
-- Dependencies: 325
-- Data for Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_stock_item (report_id, stock_item_id, id) FROM stdin;
\.


--
-- TOC entry 6878 (class 0 OID 45977)
-- Dependencies: 397
-- Data for Name: person_reports_problem_on_asset_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_translation (id, report_id, language_code, owner_observation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6808 (class 0 OID 44114)
-- Dependencies: 327
-- Data for Name: person_reports_problem_on_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_consumable (person_id, consumable_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 6880 (class 0 OID 45999)
-- Dependencies: 399
-- Data for Name: person_reports_problem_on_consumable_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_consumable_translation (id, report_id, language_code, owner_observation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6809 (class 0 OID 44122)
-- Dependencies: 328
-- Data for Name: person_reports_problem_on_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_stock_item (person_id, stock_item_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 6882 (class 0 OID 46021)
-- Dependencies: 401
-- Data for Name: person_reports_problem_on_stock_item_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_stock_item_translation (id, report_id, language_code, owner_observation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6810 (class 0 OID 44130)
-- Dependencies: 329
-- Data for Name: person_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_role_mapping (role_id, person_id) FROM stdin;
1	1
2	6
3	7
3	8
4	10
100	1007
101	1008
102	1009
103	1012
104	1013
105	1014
106	1015
3	1016
\.


--
-- TOC entry 6862 (class 0 OID 45800)
-- Dependencies: 381
-- Data for Name: person_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_translation (id, person_id, language_code, first_name, last_name, created_at, updated_at) FROM stdin;
1	1	en	System	Administrator	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
2	6	en	Bahaa Eddine	ZAOUI	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
3	7	en	Mohamed	MERINE	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
4	9	en	Mohamed	NEDJOUH	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
5	10	en	Daoud	BEN SI Messaoud	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
6	1015	en	Amal	BOULEFRED	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
7	8	en	Mohcene	AMOURA	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
8	1009	en	Charaf Eddine	KEDAYA	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
9	1007	en	Ibrahim	AIDOUNI	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
10	1008	en	Daoud	BEN SI MESSAOUD (Asset Responsible)	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
11	1012	en	Sofiane	BEN AMOR	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
12	1013	en	M'hamed	BOUREMLA	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
13	777	en	Random	Person	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
14	1014	en	Said	SIDI OUIS	2026-04-18 20:18:22.191345	2026-04-18 20:18:22.191345
15	8	ar	محسن	عمورة	2026-04-21 09:43:08.855725	2026-04-21 09:43:08.855725
16	7	ar	محمد	مرين	2026-04-21 13:09:34.626027	2026-04-21 13:09:34.626027
17	1	ar	مسؤول	النظام	2026-04-24 01:31:25.948245	2026-04-24 01:31:25.948245
18	1016	en	testing	signupt	2026-04-24 10:15:24.205334	2026-04-24 10:15:24.205612
19	1016	ar	تحربى	يبسيبسي	2026-04-24 10:15:24.212766	2026-04-24 10:15:24.212779
20	1017	en	fsdfdsf	fdsfdsfsd	2026-04-26 19:59:31.167467	2026-04-26 19:59:31.167523
\.


--
-- TOC entry 6811 (class 0 OID 44135)
-- Dependencies: 330
-- Data for Name: physical_condition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.physical_condition (condition_id, condition_code, condition_label, description) FROM stdin;
1	New	NEW	Never user
2	Very good	VERYGOOD	Used, like new
3	Good	GOOD	Used, good condition
4	Fair	FAIR	Moderate deterioration
5	Poor	POOR	Significant deterioration
6	Failed	FAILED	Asset is no longer functional or is structurally unsafe
\.


--
-- TOC entry 6846 (class 0 OID 45624)
-- Dependencies: 365
-- Data for Name: physical_condition_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.physical_condition_translation (id, condition_id, language_code, condition_label, description, created_at, updated_at) FROM stdin;
1	1	en	NEW	Never user	2026-04-18 20:18:22.166481	2026-04-18 20:18:22.166481
2	2	en	VERYGOOD	Used, like new	2026-04-18 20:18:22.166481	2026-04-18 20:18:22.166481
3	3	en	GOOD	Used, good condition	2026-04-18 20:18:22.166481	2026-04-18 20:18:22.166481
4	4	en	FAIR	Moderate deterioration	2026-04-18 20:18:22.166481	2026-04-18 20:18:22.166481
5	5	en	POOR	Significant deterioration	2026-04-18 20:18:22.166481	2026-04-18 20:18:22.166481
6	6	en	FAILED	Asset is no longer functional or is structurally unsafe	2026-04-18 20:18:22.166481	2026-04-18 20:18:22.166481
7	1	ar	جديد	لم يستخدم أبداً	2026-04-20 10:31:27.872699	2026-04-20 10:33:35.270752
8	2	ar	ممتاز	حالة ممتازة جداً	2026-04-20 10:31:27.87607	2026-04-20 10:33:35.27229
9	3	ar	جيد	حالة جيدة	2026-04-20 10:31:27.877686	2026-04-20 10:33:35.2736
10	4	ar	مقبول	حالة مقبولة	2026-04-20 10:31:27.879037	2026-04-20 10:33:35.275526
11	5	ar	ضعيف	حالة ضعيفة	2026-04-20 10:31:27.88006	2026-04-20 10:33:35.27712
12	6	ar	معطل	لا يعمل	2026-04-20 10:31:27.881115	2026-04-20 10:33:35.278502
\.


--
-- TOC entry 6812 (class 0 OID 44139)
-- Dependencies: 331
-- Data for Name: position; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."position" (position_id, position_code, position_label, description) FROM stdin;
1	HR	Human Resources Service Chief	
2	ITBC	IT Bureau Chief	
10001	SUPERUSER	Superuser	Auto-created from role superuser
10002	MAINTENANCE_CHIEF	Maintenance Chief	Auto-created from role maintenance_chief
10004	EXPLOITATION_CHIEF	Exploitation Chief	Auto-created from role exploitation_chief
10099	TECHNICIAN	Technician	Auto-created from role technician
10100	STOCK_CONSUMABLE_RESPONSIBLE	Stock Items and Consumable Responsible	Auto-created from role stock_consumable_responsible
10101	ASSET_RESPONSIBLE	Asset Responsible	Auto-created from role asset_responsible
10103	DIRECTOR_ADMIN_SUPPORT	Director of Administration and Support	Auto-created from role director_admin_support
10104	PROTECTION_AND_SECURITY_BUREAU_CHIEF	Protection and Security Bureau Chief	Auto-created from role protection_and_security_bureau_chief
10105	SCHOOL_HEADQUARTER	School headquarter	Auto-created from role school_headquarter
10106	NETWORK_MAINTENANCE_TECHNICIAN	Network Maintenance Technician	Auto-created from role network_maintenance_technician
10003	IT_MAINTENANCE_TECHNICIAN	IT Maintenance Technician	Auto-created from role it_maintenance_technician
10107	sdfsdfds	dfdsfdsfd	fsdfdsfsdfsd
\.


--
-- TOC entry 6813 (class 0 OID 44143)
-- Dependencies: 332
-- Data for Name: position_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.position_role_mapping (position_id, role_id, created_at, source) FROM stdin;
2	102	2026-04-07 14:52:59.601896	manual
10001	1	2026-04-07 14:53:06.885301	manual
10106	106	2026-04-07 14:53:12.512375	manual
10105	105	2026-04-07 14:53:21.189257	manual
10004	4	2026-04-07 14:55:36.616315	manual
10003	3	2026-04-07 14:55:42.710316	manual
\.


--
-- TOC entry 6850 (class 0 OID 45668)
-- Dependencies: 369
-- Data for Name: position_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.position_translation (id, position_id, language_code, position_label, description, created_at, updated_at) FROM stdin;
1	1	en	Human Resources Service Chief		2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
2	2	en	IT Bureau Chief		2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
3	10001	en	Superuser	Auto-created from role superuser	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
4	10002	en	Maintenance Chief	Auto-created from role maintenance_chief	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
5	10004	en	Exploitation Chief	Auto-created from role exploitation_chief	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
6	10099	en	Technician	Auto-created from role technician	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
7	10100	en	Stock Items and Consumable Responsible	Auto-created from role stock_consumable_responsible	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
8	10101	en	Asset Responsible	Auto-created from role asset_responsible	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
9	10103	en	Director of Administration and Support	Auto-created from role director_admin_support	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
10	10104	en	Protection and Security Bureau Chief	Auto-created from role protection_and_security_bureau_chief	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
11	10105	en	School headquarter	Auto-created from role school_headquarter	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
12	10106	en	Network Maintenance Technician	Auto-created from role network_maintenance_technician	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
13	10003	en	IT Maintenance Technician	Auto-created from role it_maintenance_technician	2026-04-18 20:18:22.172912	2026-04-18 20:18:22.172912
14	1	ar	رئيس مصلحة الموارد البشرية	إدارة الموارد البشرية	2026-04-20 10:31:27.900446	2026-04-20 10:33:35.30077
15	2	ar	رئيس مكتب تكنولوجيا المعلومات	إدارة مكتب تكنولوجيا المعلومات	2026-04-20 10:31:27.902802	2026-04-20 10:33:35.30244
16	10001	ar	مدير النظام	صلاحيات كاملة	2026-04-20 10:31:27.904024	2026-04-20 10:33:35.303849
17	10002	ar	رئيس الصيانة	إدارة الصيانة	2026-04-20 10:31:27.905193	2026-04-20 10:33:35.305089
18	10003	ar	فني صيانة تكنولوجيا المعلومات	صيانة الأجهزة	2026-04-20 10:31:27.90647	2026-04-20 10:33:35.306472
19	10004	ar	رئيس التشغيل	إدارة التشغيل	2026-04-20 10:31:27.908013	2026-04-20 10:33:35.307833
20	10099	ar	فني	فني متخصص	2026-04-20 10:31:27.909816	2026-04-20 10:33:35.309793
21	10100	ar	مسؤول المخزون	إدارة المخزون	2026-04-20 10:31:27.911437	2026-04-20 10:33:35.311301
22	10101	ar	مسؤول المعدات	إدارة المعدات	2026-04-20 10:31:27.912616	2026-04-20 10:33:35.312697
23	10103	ar	مدير الإدارة والدعم	الإدارة والدعم	2026-04-20 10:31:27.91375	2026-04-20 10:33:35.31402
24	10104	ar	رئيس مكتب الحماية والأمن	الحماية والأمن	2026-04-20 10:31:27.914782	2026-04-20 10:33:35.315317
25	10105	ar	المقر المدرسي	الإدارة المدرسية	2026-04-20 10:31:27.91581	2026-04-20 10:33:35.316554
26	10106	ar	فني صيانة الشبكة	صيانة الشبكة	2026-04-20 10:31:27.916788	2026-04-20 10:33:35.317753
\.


--
-- TOC entry 6814 (class 0 OID 44152)
-- Dependencies: 333
-- Data for Name: purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order (purchase_order_id, supplier_id, digital_copy, is_signed_by_finance, purchase_order_code) FROM stdin;
1	1	\N	f	yyyyy
2	1	\N	f	\N
3	1	\N	f	po1
4	1	\N	t	hhhh
5	1	\N	t	kjkkjk
6	1	\N	t	hhhhhhh
\.


--
-- TOC entry 6815 (class 0 OID 44159)
-- Dependencies: 334
-- Data for Name: receipt_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receipt_report (receipt_report_id, report_datetime, report_full_code, digital_copy) FROM stdin;
1	2026-02-23 18:32:51.676187	rerezrzerze	\N
2	2026-02-23 18:33:11.61638	testiiiiiiiiiiing	\N
3	2026-03-08 21:50:10.234773	aaa	\N
4	2026-03-08 22:03:52.271425	7	\N
5	2026-03-08 22:31:19.451676	444	\N
6	2026-03-11 22:11:20.652234	dsdsds	receipt_reports\\receipt_report_6.pdf
7	2026-03-11 22:13:14.087439	jjjjj	receipt_reports\\receipt_report_7.pdf
8	2026-03-11 22:13:32.574477	ghgfg	receipt_reports\\receipt_report_8.pdf
9	2026-05-03 21:12:35.320541	dddddddddddd	\N
10	2026-05-03 21:13:57.237732	ddddddddddd	\N
11	2026-05-03 21:31:38.203836	test_accessories	\N
\.


--
-- TOC entry 6816 (class 0 OID 44165)
-- Dependencies: 335
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (role_id, role_code, role_label, description) FROM stdin;
1	superuser	Superuser	Full system access
2	maintenance_chief	Maintenance Chief	Responsible for maintenance operations
4	exploitation_chief	Exploitation Chief	\N
100	stock_consumable_responsible	Stock Items and Consumable Responsible	\N
101	asset_responsible	Asset Responsible	\N
102	it_bureau_chief	IT Bureau Chief	IT Bureau Chief
103	director_admin_support	Director of Administration and Support	Director of Administration and Support
104	protection_and_security_bureau_chief	Protection and Security Bureau Chief	Protection and Security Bureau Chief
105	school_headquarter	School headquarter	School headquarter
106	network_maintenance_technician	Network Maintenance Technician	\N
3	it_maintenance_technician	IT Maintenance Technician	Performs maintenance tasks
\.


--
-- TOC entry 6848 (class 0 OID 45646)
-- Dependencies: 367
-- Data for Name: role_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_translation (id, role_id, language_code, role_label, description, created_at, updated_at) FROM stdin;
1	1	en	Superuser	Full system access	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
2	2	en	Maintenance Chief	Responsible for maintenance operations	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
3	4	en	Exploitation Chief	\N	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
4	100	en	Stock Items and Consumable Responsible	\N	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
5	101	en	Asset Responsible	\N	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
6	102	en	IT Bureau Chief	IT Bureau Chief	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
7	103	en	Director of Administration and Support	Director of Administration and Support	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
8	104	en	Protection and Security Bureau Chief	Protection and Security Bureau Chief	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
9	105	en	School headquarter	School headquarter	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
10	106	en	Network Maintenance Technician	\N	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
11	3	en	IT Maintenance Technician	Performs maintenance tasks	2026-04-18 20:18:22.169404	2026-04-18 20:18:22.169404
12	1	ar	مدير النظام	صلاحيات كاملة على النظام	2026-04-20 10:31:27.883955	2026-04-20 10:33:35.282925
13	2	ar	رئيس الصيانة	إدارة عمليات الصيانة	2026-04-20 10:31:27.886261	2026-04-20 10:33:35.28454
15	4	ar	رئيس التشغيل	إدارة عمليات التشغيل	2026-04-20 10:31:27.888407	2026-04-20 10:33:35.287185
16	100	ar	مسؤول المخزون	إدارة القطع والمستهلكات	2026-04-20 10:31:27.88943	2026-04-20 10:33:35.288435
17	101	ar	مسؤول المعدات	إدارة الأصول والمعدات	2026-04-20 10:31:27.891423	2026-04-20 10:33:35.289628
18	102	ar	رئيس مكتب تكنولوجيا المعلومات	إدارة مكتب تكنولوجيا المعلومات	2026-04-20 10:31:27.892911	2026-04-20 10:33:35.290805
19	103	ar	مدير الإدارة والدعم	إدارة الإدارة والدعم	2026-04-20 10:31:27.894375	2026-04-20 10:33:35.292846
20	104	ar	رئيس مكتب الحماية والأمن	إدارة الحماية والأمن	2026-04-20 10:31:27.895575	2026-04-20 10:33:35.29434
21	105	ar	المقر المدرسي	الإدارة المدرسية	2026-04-20 10:31:27.89657	2026-04-20 10:33:35.295568
22	106	ar	فني صيانة الشبكة	صيانة وإدارة الشبكة	2026-04-20 10:31:27.897599	2026-04-20 10:33:35.296959
14	3	ar	صيانة أجهزة تكنولوجيا المعلومات	صيانة أجهزة تكنولوجيا المعلومات	2026-04-20 10:31:27.88734	2026-04-20 10:33:35.285887
\.


--
-- TOC entry 6817 (class 0 OID 44169)
-- Dependencies: 336
-- Data for Name: stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item (stock_item_id, maintenance_step_id, stock_item_model_id, stock_item_consumable_destruction_certificate_id, stock_item_fabrication_datetime, stock_item_name, stock_item_inventory_number, stock_item_warranty_expiry_in_months, stock_item_arrival_datetime, stock_item_status, purchase_order_id, stock_item_serial_number) FROM stdin;
1	\N	1	\N	\N	M1 (included with fff)	\N	\N	\N	assigned	\N	\N
\.


--
-- TOC entry 6818 (class 0 OID 44174)
-- Dependencies: 337
-- Data for Name: stock_item_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_definition (stock_item_attribute_definition_id, unit, description, data_type, maintenance_domain) FROM stdin;
1	\N	Number of Clicks	number	\N
2	mm	Length	number	\N
3	RPM	RPM	number	\N
4	GB	Storage	number	\N
5	V	Voltage Output	number	\N
\.


--
-- TOC entry 6856 (class 0 OID 45734)
-- Dependencies: 375
-- Data for Name: stock_item_attribute_definition_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_definition_translation (id, stock_item_attribute_definition_id, language_code, description, unit, created_at, updated_at) FROM stdin;
1	1	en	Number of Clicks	\N	2026-04-18 20:18:22.182666	2026-04-18 20:18:22.182666
2	2	en	Length	mm	2026-04-18 20:18:22.182666	2026-04-18 20:18:22.182666
3	3	en	RPM	RPM	2026-04-18 20:18:22.182666	2026-04-18 20:18:22.182666
4	4	en	Storage	GB	2026-04-18 20:18:22.182666	2026-04-18 20:18:22.182666
5	5	en	Voltage Output	V	2026-04-18 20:18:22.182666	2026-04-18 20:18:22.182666
6	1	ar	عدد النقرات	\N	2026-04-20 10:31:27.98531	2026-04-20 10:37:43.357681
7	2	ar	الطول	\N	2026-04-20 10:31:27.988186	2026-04-20 10:37:43.359249
8	3	ar	دورة/دقيقة	\N	2026-04-20 10:31:27.98936	2026-04-20 10:37:43.361038
9	4	ar	التخزين	\N	2026-04-20 10:31:27.990515	2026-04-20 10:37:43.36283
10	5	ar	جهد الخرج	\N	2026-04-20 10:31:27.992468	2026-04-20 10:37:43.364362
\.


--
-- TOC entry 6819 (class 0 OID 44178)
-- Dependencies: 338
-- Data for Name: stock_item_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_value (stock_item_attribute_definition_id, stock_item_id, value_string, value_bool, value_date, value_number) FROM stdin;
\.


--
-- TOC entry 6820 (class 0 OID 44185)
-- Dependencies: 339
-- Data for Name: stock_item_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_brand (stock_item_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	ASA	ASA	t	\N
2	HP	HP	t	\N
3	Acer	ACER	t	\N
4	SI Brand	SI_BRAND	t	\N
\.


--
-- TOC entry 6914 (class 0 OID 46546)
-- Dependencies: 433
-- Data for Name: stock_item_brand_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_brand_translation (id, stock_item_brand_id, language_code, brand_name, created_at, updated_at) FROM stdin;
1	1	en	ASA	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
2	2	en	HP	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
3	3	en	Acer	2026-04-21 03:16:58.175251	2026-04-21 03:16:58.175251
4	4	ar	SI تجربة	2026-04-21 12:15:08.983569	2026-04-21 12:15:08.983598
\.


--
-- TOC entry 6821 (class 0 OID 44189)
-- Dependencies: 340
-- Data for Name: stock_item_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_condition_history (stock_item_condition_history_id, stock_item_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 6890 (class 0 OID 46111)
-- Dependencies: 409
-- Data for Name: stock_item_condition_history_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_condition_history_translation (id, stock_item_condition_history_id, language_code, notes, cosmetic_issues, functional_issues, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6822 (class 0 OID 44197)
-- Dependencies: 341
-- Data for Name: stock_item_consumable_destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_consumable_destruction_certificate (destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
1	destruction_certificates\\destruction_certificate_1.pdf	2026-03-07 19:35:07.915855
2	destruction_certificates\\destruction_certificate_2.pdf	2026-03-07 20:37:18.994153
\.


--
-- TOC entry 6928 (class 0 OID 47585)
-- Dependencies: 447
-- Data for Name: stock_item_is_assigned_to_org_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_assigned_to_org_structure (assignment_id, organizational_structure_id, stock_item_id, assigned_by_person_id, start_datetime, end_datetime, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	5	1	1	2026-05-06 16:22:00	\N	t	\N
\.


--
-- TOC entry 6823 (class 0 OID 44203)
-- Dependencies: 342
-- Data for Name: stock_item_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_assigned_to_person (stock_item_id, person_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
\.


--
-- TOC entry 6824 (class 0 OID 44213)
-- Dependencies: 343
-- Data for Name: stock_item_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_compatible_with_asset (stock_item_model_id, asset_model_id) FROM stdin;
1	7
\.


--
-- TOC entry 6825 (class 0 OID 44218)
-- Dependencies: 344
-- Data for Name: stock_item_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model (stock_item_model_id, stock_item_type_id, stock_item_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months, stock_item_model_name_in_administrative_certificate) FROM stdin;
2	3	2	Storage	HPS	\N	\N	t	\N	\N	\N
3	2	1	ASA Test	assa	\N	\N	t	\N	\N	\N
1	1	1	M1	M1	2020	\N	t		12	m41
\.


--
-- TOC entry 6826 (class 0 OID 44224)
-- Dependencies: 345
-- Data for Name: stock_item_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_attribute_value (stock_item_attribute_definition_id, stock_item_model_id, value_bool, value_string, value_date, value_number) FROM stdin;
1	1	f	\N	\N	1200000.000000
2	1	f	\N	\N	150.000000
3	2	\N	\N	\N	\N
4	2	\N	\N	\N	\N
2	2	f	\N	\N	120.000000
\.


--
-- TOC entry 6924 (class 0 OID 47066)
-- Dependencies: 443
-- Data for Name: stock_item_model_default_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_default_consumable (id, stock_item_model_id, consumable_model_id, quantity, notes) FROM stdin;
2	1	6	2	
\.


--
-- TOC entry 6827 (class 0 OID 44231)
-- Dependencies: 346
-- Data for Name: stock_item_model_is_found_in_purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_is_found_in_purchase_order (stock_item_model_id, purchase_order_id, quantity_ordered, quantity_received, unit_price) FROM stdin;
1	1	2	2	100.00
1	4	1	1	120.00
1	6	3	3	100.00
1	3	2	2	100.00
1	2	2	2	10.00
\.


--
-- TOC entry 6902 (class 0 OID 46239)
-- Dependencies: 421
-- Data for Name: stock_item_model_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_translation (id, stock_item_model_id, language_code, model_name, notes, created_at, updated_at, stock_item_model_name_in_administrative_certificate) FROM stdin;
2	2	en	Storage	\N	2026-04-18 20:18:22.225525	2026-04-18 20:18:22.225525	\N
3	3	en	ASA Test	\N	2026-04-22 10:51:38.873075	2026-04-22 10:51:38.873104	\N
4	3	ar	أسا تيست	\N	2026-04-22 10:51:38.878817	2026-04-22 10:51:38.878843	\N
1	1	en	M1		2026-04-18 20:18:22.225525	2026-04-29 14:18:02.822515	k3
\.


--
-- TOC entry 6828 (class 0 OID 44236)
-- Dependencies: 347
-- Data for Name: stock_item_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_movement (stock_item_movement_id, stock_item_id, source_location_id, destination_location_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status, maintenance_id) FROM stdin;
\.


--
-- TOC entry 6876 (class 0 OID 45955)
-- Dependencies: 395
-- Data for Name: stock_item_movement_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_movement_translation (id, stock_item_movement_id, language_code, movement_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6896 (class 0 OID 46176)
-- Dependencies: 415
-- Data for Name: stock_item_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_translation (id, stock_item_id, language_code, stock_item_name, created_at, updated_at, stock_item_status) FROM stdin;
\.


--
-- TOC entry 6829 (class 0 OID 44247)
-- Dependencies: 348
-- Data for Name: stock_item_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type (stock_item_type_id, stock_item_type_label, stock_item_type_code, photo) FROM stdin;
1	Mouse	MS	\N
2	Keyboard	KBRD	\N
4	SSD SATA Disk	SSD	\N
5	SSD NVMe Disk 	NVMe	\N
6	Power Supply Unit	PSU	\N
7	Random Access Memory	RAM	\N
3	HDD Disk	HDD	types/stock_items/hard-disc.png
\.


--
-- TOC entry 6830 (class 0 OID 44253)
-- Dependencies: 349
-- Data for Name: stock_item_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type_attribute (stock_item_attribute_definition_id, stock_item_type_id, is_mandatory, default_value) FROM stdin;
1	1	f	1000000
3	3	f	\N
4	3	f	\N
\.


--
-- TOC entry 6840 (class 0 OID 45558)
-- Dependencies: 359
-- Data for Name: stock_item_type_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type_translation (id, stock_item_type_id, language_code, stock_item_type_label, created_at, updated_at) FROM stdin;
1	1	en	Mouse	2026-04-18 20:18:22.156459	2026-04-18 20:18:22.156459
2	2	en	Keyboard	2026-04-18 20:18:22.156459	2026-04-18 20:18:22.156459
3	4	en	SSD SATA Disk	2026-04-18 20:18:22.156459	2026-04-18 20:18:22.156459
4	5	en	SSD NVMe Disk 	2026-04-18 20:18:22.156459	2026-04-18 20:18:22.156459
5	6	en	Power Supply Unit	2026-04-18 20:18:22.156459	2026-04-18 20:18:22.156459
6	7	en	Random Access Memory	2026-04-18 20:18:22.156459	2026-04-18 20:18:22.156459
7	3	en	HDD Disk	2026-04-18 20:18:22.156459	2026-04-18 20:18:22.156459
8	1	ar	فأرة	2026-04-20 10:31:27.845418	2026-04-20 10:37:43.266018
9	2	ar	لوحة مفاتيح	2026-04-20 10:31:27.847433	2026-04-20 10:37:43.267623
10	3	ar	قرص صلب HDD	2026-04-20 10:31:27.848481	2026-04-20 10:37:43.269166
11	4	ar	قرص SSD SATA	2026-04-20 10:31:27.849684	2026-04-20 10:37:43.27043
12	5	ar	قرص SSD NVMe	2026-04-20 10:31:27.850815	2026-04-20 10:37:43.271621
13	6	ar	وحدة تغذية	2026-04-20 10:31:27.852134	2026-04-20 10:37:43.272745
14	7	ar	ذاكرة عشوائية	2026-04-20 10:31:27.853278	2026-04-20 10:37:43.274433
\.


--
-- TOC entry 6831 (class 0 OID 44258)
-- Dependencies: 350
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (supplier_id, supplier_name, supplier_address, supplier_commercial_register_number, supplier_rib, supplier_cpa, supplier_fiscal_identification_number, supplier_fiscal_static_number) FROM stdin;
1	ERI/2RM	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 6864 (class 0 OID 45823)
-- Dependencies: 383
-- Data for Name: supplier_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_translation (id, supplier_id, language_code, supplier_name, supplier_address, created_at, updated_at) FROM stdin;
1	1	en	ERI/2RM	\N	2026-04-18 20:18:22.194939	2026-04-18 20:18:22.194939
\.


--
-- TOC entry 6832 (class 0 OID 44262)
-- Dependencies: 351
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_account (user_id, person_id, username, password_hash, created_at_datetime, disabled_at_datetime, last_login, account_status, failed_login_attempts, password_last_changed_datetime, created_by_user_id, modified_by_user_id, modified_at_datetime, is_approved) FROM stdin;
11	1008	asset_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:15:48.937778	2026-02-18 09:15:48.937778	2026-04-26 07:18:17.246226	active	0	2026-02-18 09:15:48.937778	\N	\N	2026-02-18 09:15:48.937778	t
15	1014	school_headquarter	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.248902	2026-03-07 20:57:47.248902	2026-03-11 22:40:00.191381	active	0	2026-03-07 20:57:47.248902	\N	\N	2026-03-07 20:57:47.248902	t
13	1012	director_admin_sup	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.236569	2026-03-07 20:57:47.236569	2026-03-11 22:40:12.339554	active	0	2026-03-07 20:57:47.236569	\N	\N	2026-03-07 20:57:47.236569	t
16	1015	network_tech	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-03-13 01:45:58.500981	2026-03-13 01:45:58.500981	2026-03-13 09:56:21.541546	active	0	2026-03-13 01:45:58.500981	\N	\N	2026-03-13 01:45:58.500981	t
12	1009	it_bureau_chief	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:56:05.769516	2026-03-07 20:56:05.769516	2026-04-12 09:00:37.735418	active	0	2026-03-07 20:56:05.769516	\N	\N	2026-03-07 20:56:05.769516	t
5	10	bensimessaouddaoud	1d3005bd778154738f4876dfe5b7815a25dd36ae79eaa68b44b78175c4d5cbf4400073ec6e4ce40ff2d11d981fd06ec421ba71c531dc67133ead14635c9471c9	2026-02-11 10:50:19.833168	2026-02-11 10:50:19.833168	2026-04-13 19:58:47.817023	active	0	2026-02-11 10:50:19.833168	1	1	2026-02-11 10:50:19.833168	t
10	1007	stock_cons_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:06:44.673576	2026-02-18 09:06:44.673576	2026-04-07 10:43:03.045686	active	0	2026-02-18 09:06:44.673576	\N	\N	2026-02-18 09:06:44.673576	t
17	777	manhous	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-04-07 15:15:42.824332	2026-04-07 15:15:42.824332	2026-04-13 21:01:12.769976	active	0	2026-04-07 15:15:42.824332	1	1	2026-04-07 15:15:42.824332	t
14	1013	prot_sec_chief	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.243526	2026-03-07 20:57:47.243526	2026-04-03 07:06:43.144837	active	0	2026-03-07 20:57:47.243526	\N	\N	2026-03-07 20:57:47.243526	t
4	8	mohceneamoura	40c82ecd90443ed156f5e4d3911c9659b6ecc21174a5ac4cb36f1804a45de6bcb2cae9110329419b04145e4d2ba55bd41a44f65c1e5617e592d7ebaf212c524e	2026-02-10 20:18:23.485554	2026-02-10 20:18:23.485554	2026-04-29 11:45:46.716774	active	0	2026-02-10 20:18:23.485554	\N	\N	2026-02-10 20:18:23.485554	t
18	1016	signuptest	022a20b0be46431546c4a4e1cecc8fce0d1b2d7b8007905b62ea63ac5cc265a99a18c820c2d1f56a13b6be176faeab3c1e56c7f12a86de46fbb73ea00090efa3	2026-04-24 10:15:24.169427	2026-04-24 10:15:24.169427	2026-04-24 10:15:24.169427	pending_approval	0	2026-04-24 10:15:24.169427	\N	\N	2026-04-24 10:15:24.169427	t
2	6	bahaaeddinezaoui	9780eb93119bb629dc9062dc2611bd6bd17532b18a3b8a9ad0290e937000901132ce210686a8b3b843c9fa53797369a087c42cb8e3a18bb2d637cb2014c716df	2026-02-10 14:48:08.044751	2026-02-10 14:48:08.044751	2026-04-29 11:47:35.546505	active	0	2026-03-05 11:34:48.189826	\N	\N	2026-02-10 14:48:08.044751	t
1	1	admin	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-09 19:22:17.092734	2026-02-09 19:22:17.092734	2026-05-06 10:20:23.253984	active	0	2026-02-09 19:22:17.092734	\N	\N	2026-02-09 19:22:17.092734	t
6	9	mohamednedjouh	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-02-11 11:50:06.603461	2026-02-11 11:50:06.603461	2026-04-22 10:58:05.294918	active	0	2026-02-11 11:50:06.603461	1	1	2026-02-11 11:50:06.603461	t
3	7	mohamedmerine	430e6b4f4f7d05027d10871fe98484662dd348368c06f7c21c520ea344fdd6bf7a156dba9c0ba468e82fb867f40d39c9bae5f408202c125b772de5aee696007e	2026-02-10 20:18:23.477744	2026-02-10 20:18:23.477744	2026-04-22 12:47:29.982367	active	0	2026-02-10 20:18:23.477744	\N	\N	2026-02-10 20:18:23.477744	t
\.


--
-- TOC entry 6833 (class 0 OID 44278)
-- Dependencies: 352
-- Data for Name: user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_session (session_id, user_id, ip_address, user_agent, login_datetime, last_activity, logout_datetime) FROM stdin;
7	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-17 07:17:38.11284	2026-04-17 15:17:33.154432	\N
13	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-17 19:41:09.914742	2026-04-17 20:17:33.202323	\N
12	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-17 19:32:06.510074	2026-04-17 19:32:49.353051	\N
2	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-13 21:09:44.357828	2026-04-13 21:09:49.354754	2026-04-13 21:10:07.160885
11	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-17 18:40:55.630879	2026-04-17 19:31:59.695223	\N
1	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-13 21:05:18.413617	2026-04-13 21:05:50.529048	2026-04-13 21:10:09.641194
3	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-13 21:09:58.116815	2026-04-13 21:10:09.707345	\N
4	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-14 08:51:09.298375	2026-04-14 08:51:41.131361	\N
5	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-14 08:51:56.147701	2026-04-14 14:08:39.173076	\N
8	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-17 16:27:41.599444	2026-04-17 18:40:21.961184	\N
9	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-17 18:40:32.398301	2026-04-17 18:40:32.39831	\N
6	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-16 12:36:44.27547	2026-04-16 14:51:36.473389	\N
10	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-17 18:40:38.844619	2026-04-17 18:40:40.344344	\N
21	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 14:38:57.954616	2026-04-21 16:34:30.977681	\N
15	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-19 08:20:43.10517	2026-04-19 14:32:00.015291	\N
30	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:24:34.134358	2026-04-21 17:26:16.03176	\N
51	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 14:59:12.379501	2026-04-22 15:12:53.782604	\N
20	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 06:28:28.745282	2026-04-21 14:28:08.850545	\N
49	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 14:54:03.201654	2026-04-22 14:54:05.953462	\N
28	3	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:23:55.892605	2026-04-21 17:23:57.989177	2026-04-21 20:49:48.373304
22	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 16:34:41.360135	2026-04-21 17:17:53.351561	\N
26	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:21:57.71824	2026-04-21 17:22:33.479637	\N
27	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:22:46.040554	2026-04-21 17:23:45.671012	\N
14	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-18 20:59:22.961828	2026-04-18 21:26:45.143839	\N
32	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:26:47.227689	2026-04-21 19:42:03.919068	\N
43	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 12:47:03.7398	2026-04-22 12:47:13.437412	\N
40	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 06:58:40.638322	2026-04-22 10:58:00.822731	\N
16	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-20 09:30:36.065762	2026-04-20 13:24:50.617345	\N
39	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 21:04:01.396903	2026-04-21 23:19:39.31117	\N
35	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 19:42:58.112074	2026-04-21 19:43:03.581671	\N
18	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-20 16:14:53.742792	2026-04-20 21:37:00.675329	\N
23	3	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:18:43.069061	2026-04-21 17:19:51.499808	2026-04-21 20:49:50.670193
29	3	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:24:09.298845	2026-04-21 17:24:28.886917	2026-04-21 20:49:53.03411
44	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 12:47:13.812425	2026-04-22 12:47:17.822678	\N
41	6	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 10:58:05.314478	2026-04-22 10:58:08.057051	\N
25	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:20:48.21372	2026-04-21 17:20:55.422266	\N
24	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:19:58.014664	2026-04-21 17:20:37.418217	\N
17	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-20 13:25:22.790742	2026-04-20 20:03:48.769349	\N
37	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 19:43:39.977371	2026-04-21 19:43:54.669488	\N
36	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 19:43:17.527942	2026-04-21 19:43:23.516657	\N
33	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 19:42:11.648916	2026-04-21 19:42:34.949466	\N
48	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 12:48:46.298787	2026-04-22 14:53:45.572559	\N
45	3	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 12:47:29.994103	2026-04-22 12:47:32.139642	\N
42	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 10:58:12.705897	2026-04-22 12:44:37.244337	\N
34	3	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 19:42:43.364799	2026-04-21 19:42:51.175665	2026-04-21 20:49:43.849337
38	3	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 19:44:07.331147	2026-04-21 21:03:37.151445	\N
31	3	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-21 17:26:17.688988	2026-04-21 17:26:36.559412	2026-04-21 20:49:46.096809
55	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 19:13:35.981729	2026-04-22 19:13:35.981734	\N
47	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 12:48:14.647822	2026-04-22 12:48:28.312496	\N
53	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 15:13:52.749425	2026-04-22 15:14:09.414243	\N
46	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 12:47:42.439177	2026-04-22 12:48:05.573054	\N
50	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 14:54:13.899037	2026-04-22 14:59:06.142435	\N
52	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 15:13:07.409054	2026-04-22 15:13:46.041559	\N
56	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 19:13:41.819574	2026-04-22 19:14:23.895117	\N
54	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 15:14:20.673878	2026-04-22 19:13:30.891352	\N
57	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 19:14:32.121452	2026-04-22 20:30:07.721794	\N
58	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 20:30:22.664464	2026-04-22 20:38:33.329809	\N
59	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-22 20:38:38.1973	2026-04-22 20:53:15.310929	\N
19	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-20 21:39:56.416533	2026-04-20 22:43:32.485742	2026-04-30 09:41:38.920588
65	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 08:49:19.451899	2026-04-24 08:49:29.596908	\N
66	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 10:20:45.96313	2026-04-24 10:20:46.89347	\N
86	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 07:25:12.227619	2026-04-26 13:09:53.847973	\N
61	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-23 18:50:22.479953	2026-04-24 00:13:12.015979	\N
87	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 16:18:52.466829	2026-04-26 16:51:14.032384	\N
75	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:40:55.924093	2026-04-24 16:41:03.261687	\N
72	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:30:03.587183	2026-04-24 16:36:07.451315	\N
83	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-25 22:31:54.332344	2026-04-25 23:26:31.657487	\N
94	1	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowe	2026-04-27 18:02:45.074829	2026-04-27 18:02:45.138576	\N
90	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 19:27:16.115679	2026-04-26 19:59:09.224658	\N
77	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 18:45:48.331356	2026-04-24 19:38:35.163385	\N
88	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 16:51:25.10593	2026-04-26 17:03:58.786461	\N
84	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 07:17:35.374451	2026-04-26 07:17:56.87337	\N
80	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 20:29:04.657039	2026-04-24 21:46:47.439123	\N
76	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:41:39.718822	2026-04-24 18:46:00.601586	\N
73	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:36:13.025275	2026-04-24 16:39:37.483235	\N
82	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-25 16:22:07.712799	2026-04-25 22:27:12.159071	\N
70	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:24:58.585969	2026-04-24 16:25:12.722288	\N
68	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 15:41:22.841555	2026-04-24 16:22:20.700096	\N
62	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 07:08:39.299004	2026-04-24 08:37:49.480939	\N
78	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 20:01:23.84789	2026-04-24 20:06:04.594279	\N
63	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 08:38:01.470933	2026-04-24 08:38:08.715865	\N
64	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 08:44:17.619811	2026-04-24 08:44:17.960779	\N
89	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 17:05:00.470344	2026-04-26 19:27:06.948094	\N
60	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-23 08:34:37.382926	2026-04-23 14:19:29.970355	\N
95	1	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowe	2026-04-27 18:03:07.429959	2026-04-27 18:03:07.480601	\N
96	1	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowe	2026-04-27 18:03:15.941483	2026-04-27 18:03:16.004324	\N
79	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 20:11:58.69053	2026-04-24 20:25:10.003625	\N
71	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:25:17.3858	2026-04-24 16:29:57.598471	\N
97	1	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowe	2026-04-27 18:03:34.687589	2026-04-27 18:03:34.839136	\N
98	1	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowe	2026-04-27 18:03:44.146147	2026-04-27 18:03:44.307855	\N
101	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-28 16:56:02.235284	2026-04-28 21:41:13.009087	\N
67	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 10:26:45.644276	2026-04-24 10:40:58.33413	\N
103	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-29 11:45:46.755003	2026-04-29 11:45:51.496378	\N
69	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:23:32.279327	2026-04-24 16:24:42.628001	\N
74	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 16:39:44.058397	2026-04-24 16:40:06.188679	\N
85	11	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 07:18:17.267381	2026-04-26 07:24:58.692815	\N
92	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-27 17:45:41.561602	2026-04-27 18:30:57.583885	\N
81	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-24 21:57:51.696186	2026-04-24 22:24:43.555125	\N
99	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-27 18:31:08.049427	2026-04-27 21:41:57.316644	\N
107	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-30 07:05:40.418968	2026-04-30 09:03:47.014038	2026-04-30 09:47:13.129219
91	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-26 19:59:15.044077	2026-04-26 20:47:51.950386	\N
100	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-28 07:00:03.985967	2026-04-28 13:01:02.265381	\N
106	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-29 14:21:10.486393	2026-04-30 06:54:53.374355	2026-04-30 09:47:18.875786
93	1	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowe	2026-04-27 18:02:37.141681	2026-04-27 18:02:37.141683	\N
104	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-29 11:46:12.844586	2026-04-29 11:47:15.144663	\N
102	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-29 11:04:43.711107	2026-04-29 11:45:39.979252	\N
105	2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-29 11:47:35.579723	2026-04-29 14:21:09.574131	\N
108	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-04-30 09:08:37.568635	2026-04-30 09:52:06.482087	\N
124	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-05-06 10:20:23.305177	2026-05-06 17:49:14.027279	\N
123	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-05-05 18:37:11.476678	2026-05-05 18:38:07.759905	\N
109	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-05-03 14:35:44.168751	2026-05-03 22:35:36.425204	\N
110	1	127.0.0.1	Python-urllib/3.13	2026-05-03 22:11:06.676832	2026-05-03 22:11:22.514253	\N
111	1	127.0.0.1	Python-urllib/3.13	2026-05-03 22:12:03.49551	2026-05-03 22:12:19.991656	\N
120	1	127.0.0.1	Python-urllib/3.13	2026-05-04 16:48:25.371405	2026-05-04 16:48:27.488885	\N
119	1	127.0.0.1	Python-urllib/3.13	2026-05-04 16:28:10.50405	2026-05-04 16:28:14.855261	\N
112	1	127.0.0.1	Python-urllib/3.13	2026-05-03 22:12:49.633055	2026-05-03 22:13:05.398869	\N
121	1	127.0.0.1	Python-urllib/3.13	2026-05-04 16:48:43.047369	2026-05-04 16:48:45.135349	\N
113	1	127.0.0.1	Python-urllib/3.13	2026-05-03 22:13:27.826199	2026-05-03 22:13:41.393258	\N
122	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-05-05 15:59:59.842333	2026-05-05 21:14:40.456669	\N
117	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-05-03 22:35:52.791785	2026-05-04 06:29:15.75136	\N
114	1	127.0.0.1	Python-urllib/3.13	2026-05-03 22:16:45.81226	2026-05-03 22:16:59.379402	\N
115	1	127.0.0.1	Python-urllib/3.13	2026-05-03 22:27:02.232313	2026-05-03 22:27:16.154136	\N
118	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36	2026-05-04 15:55:52.274603	2026-05-04 18:20:44.793412	\N
116	1	127.0.0.1	Python-urllib/3.13	2026-05-03 22:30:56.191688	2026-05-03 22:31:10.220567	\N
\.


--
-- TOC entry 6834 (class 0 OID 44286)
-- Dependencies: 353
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse (warehouse_id, warehouse_name, warehouse_address) FROM stdin;
1	ERI/2RM	\N
\.


--
-- TOC entry 6866 (class 0 OID 45845)
-- Dependencies: 385
-- Data for Name: warehouse_translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_translation (id, warehouse_id, language_code, warehouse_name, warehouse_address, created_at, updated_at) FROM stdin;
1	1	en	ERI/2RM	\N	2026-04-18 20:18:22.197505	2026-04-18 20:18:22.197505
\.


--
-- TOC entry 7019 (class 0 OID 0)
-- Dependencies: 422
-- Name: administrative_certificate_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administrative_certificate_translation_id_seq', 1, false);


--
-- TOC entry 7020 (class 0 OID 0)
-- Dependencies: 370
-- Name: asset_attribute_definition_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_attribute_definition_translation_id_seq', 94, true);


--
-- TOC entry 7021 (class 0 OID 0)
-- Dependencies: 430
-- Name: asset_brand_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_brand_translation_id_seq', 36, true);


--
-- TOC entry 7022 (class 0 OID 0)
-- Dependencies: 404
-- Name: asset_condition_history_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_condition_history_translation_id_seq', 1, false);


--
-- TOC entry 7023 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_destruction_certificate_asset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_destruction_certificate_asset_id_seq', 1, true);


--
-- TOC entry 7024 (class 0 OID 0)
-- Dependencies: 231
-- Name: asset_incident_report_asset_incident_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_incident_report_asset_incident_report_id_seq', 1, false);


--
-- TOC entry 7025 (class 0 OID 0)
-- Dependencies: 233
-- Name: asset_incident_report_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_incident_report_consumable_id_seq', 2, true);


--
-- TOC entry 7026 (class 0 OID 0)
-- Dependencies: 235
-- Name: asset_incident_report_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_incident_report_stock_item_id_seq', 2, true);


--
-- TOC entry 7027 (class 0 OID 0)
-- Dependencies: 436
-- Name: asset_incident_report_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_incident_report_translation_id_seq', 2, true);


--
-- TOC entry 7028 (class 0 OID 0)
-- Dependencies: 444
-- Name: asset_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_assigned_to_org_structure_assignment_id_seq', 1, false);


--
-- TOC entry 7029 (class 0 OID 0)
-- Dependencies: 238
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_consumable_history_id_seq', 67, true);


--
-- TOC entry 7030 (class 0 OID 0)
-- Dependencies: 240
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_stock_item_history_id_seq', 98, true);


--
-- TOC entry 7031 (class 0 OID 0)
-- Dependencies: 244
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_consumable_id_seq', 3, true);


--
-- TOC entry 7032 (class 0 OID 0)
-- Dependencies: 246
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_stock_item_id_seq', 5, true);


--
-- TOC entry 7033 (class 0 OID 0)
-- Dependencies: 416
-- Name: asset_model_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_translation_id_seq', 139, true);


--
-- TOC entry 7034 (class 0 OID 0)
-- Dependencies: 390
-- Name: asset_movement_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_movement_translation_id_seq', 1, false);


--
-- TOC entry 7035 (class 0 OID 0)
-- Dependencies: 410
-- Name: asset_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_translation_id_seq', 2093, false);


--
-- TOC entry 7036 (class 0 OID 0)
-- Dependencies: 354
-- Name: asset_type_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_type_translation_id_seq', 18, true);


--
-- TOC entry 7037 (class 0 OID 0)
-- Dependencies: 252
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_consumable_accessory_id_seq', 1, true);


--
-- TOC entry 7038 (class 0 OID 0)
-- Dependencies: 254
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_stock_item_accessory_id_seq', 1, true);


--
-- TOC entry 7039 (class 0 OID 0)
-- Dependencies: 256
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- TOC entry 7040 (class 0 OID 0)
-- Dependencies: 258
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- TOC entry 7041 (class 0 OID 0)
-- Dependencies: 260
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 560, true);


--
-- TOC entry 7042 (class 0 OID 0)
-- Dependencies: 263
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- TOC entry 7043 (class 0 OID 0)
-- Dependencies: 264
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 1, true);


--
-- TOC entry 7044 (class 0 OID 0)
-- Dependencies: 266
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- TOC entry 7045 (class 0 OID 0)
-- Dependencies: 424
-- Name: company_asset_request_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_asset_request_translation_id_seq', 1, false);


--
-- TOC entry 7046 (class 0 OID 0)
-- Dependencies: 372
-- Name: consumable_attribute_definition_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_attribute_definition_translation_id_seq', 6, true);


--
-- TOC entry 7047 (class 0 OID 0)
-- Dependencies: 434
-- Name: consumable_brand_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_brand_translation_id_seq', 3, true);


--
-- TOC entry 7048 (class 0 OID 0)
-- Dependencies: 406
-- Name: consumable_condition_history_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_condition_history_translation_id_seq', 1, false);


--
-- TOC entry 7049 (class 0 OID 0)
-- Dependencies: 448
-- Name: consumable_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_is_assigned_to_org_structure_assignment_id_seq', 1, false);


--
-- TOC entry 7050 (class 0 OID 0)
-- Dependencies: 282
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_is_used_in_stock_item_history_id_seq', 10, true);


--
-- TOC entry 7051 (class 0 OID 0)
-- Dependencies: 418
-- Name: consumable_model_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_model_translation_id_seq', 4, true);


--
-- TOC entry 7052 (class 0 OID 0)
-- Dependencies: 392
-- Name: consumable_movement_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_movement_translation_id_seq', 1, false);


--
-- TOC entry 7053 (class 0 OID 0)
-- Dependencies: 412
-- Name: consumable_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_translation_id_seq', 11, false);


--
-- TOC entry 7054 (class 0 OID 0)
-- Dependencies: 356
-- Name: consumable_type_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_type_translation_id_seq', 6, true);


--
-- TOC entry 7055 (class 0 OID 0)
-- Dependencies: 291
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- TOC entry 7056 (class 0 OID 0)
-- Dependencies: 293
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 140, true);


--
-- TOC entry 7057 (class 0 OID 0)
-- Dependencies: 295
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 64, true);


--
-- TOC entry 7058 (class 0 OID 0)
-- Dependencies: 426
-- Name: external_maintenance_document_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_maintenance_document_translation_id_seq', 1, false);


--
-- TOC entry 7059 (class 0 OID 0)
-- Dependencies: 378
-- Name: external_maintenance_typical_step_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_maintenance_typical_step_translation_id_seq', 4, true);


--
-- TOC entry 7060 (class 0 OID 0)
-- Dependencies: 386
-- Name: location_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_translation_id_seq', 54, true);


--
-- TOC entry 7061 (class 0 OID 0)
-- Dependencies: 307
-- Name: location_type_location_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_type_location_type_id_seq', 1, false);


--
-- TOC entry 7062 (class 0 OID 0)
-- Dependencies: 360
-- Name: location_type_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_type_translation_id_seq', 10, true);


--
-- TOC entry 7063 (class 0 OID 0)
-- Dependencies: 312
-- Name: maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq', 3, true);


--
-- TOC entry 7064 (class 0 OID 0)
-- Dependencies: 428
-- Name: maintenance_step_item_request_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_step_item_request_translation_id_seq', 1, false);


--
-- TOC entry 7065 (class 0 OID 0)
-- Dependencies: 438
-- Name: maintenance_step_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_step_status_id_seq', 8, true);


--
-- TOC entry 7066 (class 0 OID 0)
-- Dependencies: 440
-- Name: maintenance_step_status_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_step_status_translation_id_seq', 16, true);


--
-- TOC entry 7067 (class 0 OID 0)
-- Dependencies: 402
-- Name: maintenance_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_translation_id_seq', 1, false);


--
-- TOC entry 7068 (class 0 OID 0)
-- Dependencies: 376
-- Name: maintenance_typical_step_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_typical_step_translation_id_seq', 14, true);


--
-- TOC entry 7069 (class 0 OID 0)
-- Dependencies: 388
-- Name: organizational_structure_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizational_structure_translation_id_seq', 15, true);


--
-- TOC entry 7070 (class 0 OID 0)
-- Dependencies: 318
-- Name: organizational_structure_type_organizational_structure_type_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizational_structure_type_organizational_structure_type_seq', 3, true);


--
-- TOC entry 7071 (class 0 OID 0)
-- Dependencies: 362
-- Name: organizational_structure_type_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizational_structure_type_translation_id_seq', 9, true);


--
-- TOC entry 7072 (class 0 OID 0)
-- Dependencies: 323
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_consumable_id_seq', 1, false);


--
-- TOC entry 7073 (class 0 OID 0)
-- Dependencies: 326
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_stock_item_id_seq', 5, true);


--
-- TOC entry 7074 (class 0 OID 0)
-- Dependencies: 396
-- Name: person_reports_problem_on_asset_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_translation_id_seq', 1, false);


--
-- TOC entry 7075 (class 0 OID 0)
-- Dependencies: 398
-- Name: person_reports_problem_on_consumable_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_consumable_translation_id_seq', 1, false);


--
-- TOC entry 7076 (class 0 OID 0)
-- Dependencies: 400
-- Name: person_reports_problem_on_stock_item_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_stock_item_translation_id_seq', 1, false);


--
-- TOC entry 7077 (class 0 OID 0)
-- Dependencies: 380
-- Name: person_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_translation_id_seq', 19, true);


--
-- TOC entry 7078 (class 0 OID 0)
-- Dependencies: 364
-- Name: physical_condition_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.physical_condition_translation_id_seq', 12, true);


--
-- TOC entry 7079 (class 0 OID 0)
-- Dependencies: 368
-- Name: position_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.position_translation_id_seq', 26, true);


--
-- TOC entry 7080 (class 0 OID 0)
-- Dependencies: 366
-- Name: role_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_translation_id_seq', 22, true);


--
-- TOC entry 7081 (class 0 OID 0)
-- Dependencies: 374
-- Name: stock_item_attribute_definition_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_attribute_definition_translation_id_seq', 10, true);


--
-- TOC entry 7082 (class 0 OID 0)
-- Dependencies: 432
-- Name: stock_item_brand_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_brand_translation_id_seq', 4, true);


--
-- TOC entry 7083 (class 0 OID 0)
-- Dependencies: 408
-- Name: stock_item_condition_history_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_condition_history_translation_id_seq', 1, false);


--
-- TOC entry 7084 (class 0 OID 0)
-- Dependencies: 446
-- Name: stock_item_is_assigned_to_org_structure_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_is_assigned_to_org_structure_assignment_id_seq', 1, false);


--
-- TOC entry 7085 (class 0 OID 0)
-- Dependencies: 442
-- Name: stock_item_model_default_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_model_default_consumable_id_seq', 2, true);


--
-- TOC entry 7086 (class 0 OID 0)
-- Dependencies: 420
-- Name: stock_item_model_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_model_translation_id_seq', 4, true);


--
-- TOC entry 7087 (class 0 OID 0)
-- Dependencies: 394
-- Name: stock_item_movement_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_movement_translation_id_seq', 1, false);


--
-- TOC entry 7088 (class 0 OID 0)
-- Dependencies: 414
-- Name: stock_item_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_translation_id_seq', 5, false);


--
-- TOC entry 7089 (class 0 OID 0)
-- Dependencies: 358
-- Name: stock_item_type_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_item_type_translation_id_seq', 15, true);


--
-- TOC entry 7090 (class 0 OID 0)
-- Dependencies: 382
-- Name: supplier_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supplier_translation_id_seq', 1, true);


--
-- TOC entry 7091 (class 0 OID 0)
-- Dependencies: 384
-- Name: warehouse_translation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouse_translation_id_seq', 1, true);


--
-- TOC entry 5779 (class 2606 OID 44303)
-- Name: acceptance_report acceptance_report_delivery_note_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT acceptance_report_delivery_note_id_key UNIQUE (delivery_note_id);


--
-- TOC entry 5781 (class 2606 OID 44305)
-- Name: acceptance_report acceptance_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT acceptance_report_pkey PRIMARY KEY (acceptance_report_id);


--
-- TOC entry 5783 (class 2606 OID 44307)
-- Name: administrative_certificate administrative_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT administrative_certificate_pkey PRIMARY KEY (administrative_certificate_id);


--
-- TOC entry 6234 (class 2606 OID 46273)
-- Name: administrative_certificate_translation administrative_certificate_tr_administrative_certificate_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate_translation
    ADD CONSTRAINT administrative_certificate_tr_administrative_certificate_id_key UNIQUE (administrative_certificate_id, language_code);


--
-- TOC entry 6236 (class 2606 OID 46271)
-- Name: administrative_certificate_translation administrative_certificate_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate_translation
    ADD CONSTRAINT administrative_certificate_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5787 (class 2606 OID 44309)
-- Name: asset_attribute_definition asset_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition
    ADD CONSTRAINT asset_attribute_definition_pkey PRIMARY KEY (asset_attribute_definition_id);


--
-- TOC entry 6104 (class 2606 OID 45704)
-- Name: asset_attribute_definition_translation asset_attribute_definition_tr_asset_attribute_definition_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition_translation
    ADD CONSTRAINT asset_attribute_definition_tr_asset_attribute_definition_id_key UNIQUE (asset_attribute_definition_id, language_code);


--
-- TOC entry 6106 (class 2606 OID 45702)
-- Name: asset_attribute_definition_translation asset_attribute_definition_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition_translation
    ADD CONSTRAINT asset_attribute_definition_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5789 (class 2606 OID 44311)
-- Name: asset_attribute_value asset_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT asset_attribute_value_pkey PRIMARY KEY (asset_attribute_definition_id, asset_id);


--
-- TOC entry 5791 (class 2606 OID 44313)
-- Name: asset_brand asset_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand
    ADD CONSTRAINT asset_brand_pkey PRIMARY KEY (asset_brand_id);


--
-- TOC entry 6254 (class 2606 OID 46538)
-- Name: asset_brand_translation asset_brand_translation_asset_brand_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand_translation
    ADD CONSTRAINT asset_brand_translation_asset_brand_id_language_code_key UNIQUE (asset_brand_id, language_code);


--
-- TOC entry 6256 (class 2606 OID 46536)
-- Name: asset_brand_translation asset_brand_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand_translation
    ADD CONSTRAINT asset_brand_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5793 (class 2606 OID 44315)
-- Name: asset_condition_history asset_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT asset_condition_history_pkey PRIMARY KEY (asset_condition_history_id);


--
-- TOC entry 6189 (class 2606 OID 46080)
-- Name: asset_condition_history_translation asset_condition_history_trans_asset_condition_history_id_la_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history_translation
    ADD CONSTRAINT asset_condition_history_trans_asset_condition_history_id_la_key UNIQUE (asset_condition_history_id, language_code);


--
-- TOC entry 6191 (class 2606 OID 46078)
-- Name: asset_condition_history_translation asset_condition_history_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history_translation
    ADD CONSTRAINT asset_condition_history_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5797 (class 2606 OID 44317)
-- Name: asset_destruction_certificate_asset asset_destruction_certificate_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT asset_destruction_certificate_asset_pkey PRIMARY KEY (id);


--
-- TOC entry 5795 (class 2606 OID 44319)
-- Name: asset_destruction_certificate asset_destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate
    ADD CONSTRAINT asset_destruction_certificate_pkey PRIMARY KEY (asset_destruction_certificate_id);


--
-- TOC entry 5801 (class 2606 OID 44321)
-- Name: asset_failed_external_maintenance asset_failed_external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT asset_failed_external_maintenance_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5805 (class 2606 OID 44323)
-- Name: asset_incident_report_consumable asset_incident_report_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_consumable
    ADD CONSTRAINT asset_incident_report_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5803 (class 2606 OID 44325)
-- Name: asset_incident_report asset_incident_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT asset_incident_report_pkey PRIMARY KEY (asset_incident_report_id);


--
-- TOC entry 5808 (class 2606 OID 44327)
-- Name: asset_incident_report_stock_item asset_incident_report_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_stock_item
    ADD CONSTRAINT asset_incident_report_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 6269 (class 2606 OID 47000)
-- Name: asset_incident_report_translation asset_incident_report_transla_asset_incident_report_id_lang_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_translation
    ADD CONSTRAINT asset_incident_report_transla_asset_incident_report_id_lang_key UNIQUE (asset_incident_report_id, language_code);


--
-- TOC entry 6271 (class 2606 OID 46998)
-- Name: asset_incident_report_translation asset_incident_report_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_translation
    ADD CONSTRAINT asset_incident_report_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6286 (class 2606 OID 47560)
-- Name: asset_is_assigned_to_org_structure asset_is_assigned_to_org_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_org_structure
    ADD CONSTRAINT asset_is_assigned_to_org_structure_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5811 (class 2606 OID 44329)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5813 (class 2606 OID 44331)
-- Name: asset_is_composed_of_consumable_history asset_is_composed_of_consumable_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT asset_is_composed_of_consumable_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5815 (class 2606 OID 44333)
-- Name: asset_is_composed_of_stock_item_history asset_is_composed_of_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT asset_is_composed_of_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5819 (class 2606 OID 44335)
-- Name: asset_model_attribute_value asset_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT asset_model_attribute_value_pkey PRIMARY KEY (asset_model_id, asset_attribute_definition_id);


--
-- TOC entry 5821 (class 2606 OID 44337)
-- Name: asset_model_default_consumable asset_model_default_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT asset_model_default_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5825 (class 2606 OID 44339)
-- Name: asset_model_default_stock_item asset_model_default_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT asset_model_default_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5817 (class 2606 OID 44341)
-- Name: asset_model asset_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT asset_model_pkey PRIMARY KEY (asset_model_id);


--
-- TOC entry 6219 (class 2606 OID 46210)
-- Name: asset_model_translation asset_model_translation_asset_model_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_translation
    ADD CONSTRAINT asset_model_translation_asset_model_id_language_code_key UNIQUE (asset_model_id, language_code);


--
-- TOC entry 6221 (class 2606 OID 46208)
-- Name: asset_model_translation asset_model_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_translation
    ADD CONSTRAINT asset_model_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5829 (class 2606 OID 44343)
-- Name: asset_movement asset_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT asset_movement_pkey PRIMARY KEY (asset_movement_id);


--
-- TOC entry 6154 (class 2606 OID 45925)
-- Name: asset_movement_translation asset_movement_translation_asset_movement_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement_translation
    ADD CONSTRAINT asset_movement_translation_asset_movement_id_language_code_key UNIQUE (asset_movement_id, language_code);


--
-- TOC entry 6156 (class 2606 OID 45923)
-- Name: asset_movement_translation asset_movement_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement_translation
    ADD CONSTRAINT asset_movement_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5785 (class 2606 OID 44345)
-- Name: asset asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 6204 (class 2606 OID 46147)
-- Name: asset_translation asset_translation_asset_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_translation
    ADD CONSTRAINT asset_translation_asset_id_language_code_key UNIQUE (asset_id, language_code);


--
-- TOC entry 6206 (class 2606 OID 46145)
-- Name: asset_translation asset_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_translation
    ADD CONSTRAINT asset_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5834 (class 2606 OID 44347)
-- Name: asset_type_attribute asset_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT asset_type_attribute_pkey PRIMARY KEY (asset_attribute_definition_id, asset_type_id);


--
-- TOC entry 5832 (class 2606 OID 44349)
-- Name: asset_type asset_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type
    ADD CONSTRAINT asset_type_pkey PRIMARY KEY (asset_type_id);


--
-- TOC entry 6064 (class 2606 OID 45528)
-- Name: asset_type_translation asset_type_translation_asset_type_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_translation
    ADD CONSTRAINT asset_type_translation_asset_type_id_language_code_key UNIQUE (asset_type_id, language_code);


--
-- TOC entry 6066 (class 2606 OID 45526)
-- Name: asset_type_translation asset_type_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_translation
    ADD CONSTRAINT asset_type_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5838 (class 2606 OID 44351)
-- Name: attribution_order_asset_consumable_accessory attribution_order_asset_consumable_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT attribution_order_asset_consumable_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5845 (class 2606 OID 44353)
-- Name: attribution_order_asset_stock_item_accessory attribution_order_asset_stock_item_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT attribution_order_asset_stock_item_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5836 (class 2606 OID 44355)
-- Name: attribution_order attribution_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT attribution_order_pkey PRIMARY KEY (attribution_order_id);


--
-- TOC entry 5853 (class 2606 OID 44357)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- TOC entry 5858 (class 2606 OID 44359)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- TOC entry 5861 (class 2606 OID 44361)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5855 (class 2606 OID 44363)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- TOC entry 5864 (class 2606 OID 44365)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- TOC entry 5866 (class 2606 OID 44367)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- TOC entry 5874 (class 2606 OID 44369)
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5877 (class 2606 OID 44371)
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- TOC entry 5868 (class 2606 OID 44373)
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- TOC entry 5880 (class 2606 OID 44375)
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5883 (class 2606 OID 44377)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- TOC entry 5871 (class 2606 OID 44379)
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- TOC entry 5885 (class 2606 OID 44381)
-- Name: authentication_log authentication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT authentication_log_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5889 (class 2606 OID 44383)
-- Name: backorder_report_consumable_model_line backorder_report_consumable_model_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_consumable_model_line
    ADD CONSTRAINT backorder_report_consumable_model_line_pkey PRIMARY KEY (backorder_report_id, consumable_model_id);


--
-- TOC entry 5887 (class 2606 OID 44385)
-- Name: backorder_report backorder_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT backorder_report_pkey PRIMARY KEY (backorder_report_id);


--
-- TOC entry 5892 (class 2606 OID 44387)
-- Name: backorder_report_stock_item_model_line backorder_report_stock_item_model_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_stock_item_model_line
    ADD CONSTRAINT backorder_report_stock_item_model_line_pkey PRIMARY KEY (backorder_report_id, stock_item_model_id);


--
-- TOC entry 5895 (class 2606 OID 44389)
-- Name: broken_item_report broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broken_item_report
    ADD CONSTRAINT broken_item_report_pkey PRIMARY KEY (broken_item_report_id);


--
-- TOC entry 5912 (class 2606 OID 44391)
-- Name: consumable_is_compatible_with_asset c_is_compatible_with_a_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT c_is_compatible_with_a_pkey PRIMARY KEY (consumable_model_id, asset_model_id);


--
-- TOC entry 5914 (class 2606 OID 44393)
-- Name: consumable_is_compatible_with_stock_item c_is_compatible_with_si_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT c_is_compatible_with_si_pkey PRIMARY KEY (consumable_model_id, stock_item_model_id);


--
-- TOC entry 5897 (class 2606 OID 44395)
-- Name: company_asset_request company_asset_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT company_asset_request_pkey PRIMARY KEY (company_asset_request_id);


--
-- TOC entry 6239 (class 2606 OID 46294)
-- Name: company_asset_request_translation company_asset_request_transla_company_asset_request_id_lang_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request_translation
    ADD CONSTRAINT company_asset_request_transla_company_asset_request_id_lang_key UNIQUE (company_asset_request_id, language_code);


--
-- TOC entry 6241 (class 2606 OID 46292)
-- Name: company_asset_request_translation company_asset_request_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request_translation
    ADD CONSTRAINT company_asset_request_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6109 (class 2606 OID 45726)
-- Name: consumable_attribute_definition_translation consumable_attribute_definiti_consumable_attribute_definiti_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition_translation
    ADD CONSTRAINT consumable_attribute_definiti_consumable_attribute_definiti_key UNIQUE (consumable_attribute_definition_id, language_code);


--
-- TOC entry 5902 (class 2606 OID 44397)
-- Name: consumable_attribute_definition consumable_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition
    ADD CONSTRAINT consumable_attribute_definition_pkey PRIMARY KEY (consumable_attribute_definition_id);


--
-- TOC entry 6111 (class 2606 OID 45724)
-- Name: consumable_attribute_definition_translation consumable_attribute_definition_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition_translation
    ADD CONSTRAINT consumable_attribute_definition_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5904 (class 2606 OID 44399)
-- Name: consumable_attribute_value consumable_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT consumable_attribute_value_pkey PRIMARY KEY (consumable_id, consumable_attribute_definition_id);


--
-- TOC entry 5906 (class 2606 OID 44401)
-- Name: consumable_brand consumable_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand
    ADD CONSTRAINT consumable_brand_pkey PRIMARY KEY (consumable_brand_id);


--
-- TOC entry 6264 (class 2606 OID 46582)
-- Name: consumable_brand_translation consumable_brand_translation_consumable_brand_id_language_c_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand_translation
    ADD CONSTRAINT consumable_brand_translation_consumable_brand_id_language_c_key UNIQUE (consumable_brand_id, language_code);


--
-- TOC entry 6266 (class 2606 OID 46580)
-- Name: consumable_brand_translation consumable_brand_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand_translation
    ADD CONSTRAINT consumable_brand_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6194 (class 2606 OID 46103)
-- Name: consumable_condition_history_translation consumable_condition_history__consumable_condition_history__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history_translation
    ADD CONSTRAINT consumable_condition_history__consumable_condition_history__key UNIQUE (consumable_condition_history_id, language_code);


--
-- TOC entry 5908 (class 2606 OID 44403)
-- Name: consumable_condition_history consumable_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT consumable_condition_history_pkey PRIMARY KEY (consumable_condition_history_id);


--
-- TOC entry 6196 (class 2606 OID 46101)
-- Name: consumable_condition_history_translation consumable_condition_history_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history_translation
    ADD CONSTRAINT consumable_condition_history_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6298 (class 2606 OID 47634)
-- Name: consumable_is_assigned_to_org_structure consumable_is_assigned_to_org_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_org_structure
    ADD CONSTRAINT consumable_is_assigned_to_org_structure_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5910 (class 2606 OID 44405)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5916 (class 2606 OID 44407)
-- Name: consumable_is_used_in_stock_item_history consumable_is_used_in_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT consumable_is_used_in_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5920 (class 2606 OID 44409)
-- Name: consumable_model_attribute_value consumable_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT consumable_model_attribute_value_pkey PRIMARY KEY (consumable_model_id, consumable_attribute_definition_id);


--
-- TOC entry 5922 (class 2606 OID 44411)
-- Name: consumable_model_is_found_in_purchase_order consumable_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT consumable_model_is_found_in_bdc_pkey PRIMARY KEY (consumable_model_id, purchase_order_id);


--
-- TOC entry 5918 (class 2606 OID 44413)
-- Name: consumable_model consumable_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT consumable_model_pkey PRIMARY KEY (consumable_model_id);


--
-- TOC entry 6224 (class 2606 OID 46231)
-- Name: consumable_model_translation consumable_model_translation_consumable_model_id_language_c_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_translation
    ADD CONSTRAINT consumable_model_translation_consumable_model_id_language_c_key UNIQUE (consumable_model_id, language_code);


--
-- TOC entry 6226 (class 2606 OID 46229)
-- Name: consumable_model_translation consumable_model_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_translation
    ADD CONSTRAINT consumable_model_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5924 (class 2606 OID 44415)
-- Name: consumable_movement consumable_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT consumable_movement_pkey PRIMARY KEY (consumable_movement_id);


--
-- TOC entry 6159 (class 2606 OID 45947)
-- Name: consumable_movement_translation consumable_movement_translati_consumable_movement_id_langua_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement_translation
    ADD CONSTRAINT consumable_movement_translati_consumable_movement_id_langua_key UNIQUE (consumable_movement_id, language_code);


--
-- TOC entry 6161 (class 2606 OID 45945)
-- Name: consumable_movement_translation consumable_movement_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement_translation
    ADD CONSTRAINT consumable_movement_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5899 (class 2606 OID 44417)
-- Name: consumable consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT consumable_pkey PRIMARY KEY (consumable_id);


--
-- TOC entry 6209 (class 2606 OID 46168)
-- Name: consumable_translation consumable_translation_consumable_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_translation
    ADD CONSTRAINT consumable_translation_consumable_id_language_code_key UNIQUE (consumable_id, language_code);


--
-- TOC entry 6211 (class 2606 OID 46166)
-- Name: consumable_translation consumable_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_translation
    ADD CONSTRAINT consumable_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5929 (class 2606 OID 44419)
-- Name: consumable_type_attribute consumable_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT consumable_type_attribute_pkey PRIMARY KEY (consumable_type_id, consumable_attribute_definition_id);


--
-- TOC entry 5927 (class 2606 OID 44421)
-- Name: consumable_type consumable_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type
    ADD CONSTRAINT consumable_type_pkey PRIMARY KEY (consumable_type_id);


--
-- TOC entry 6069 (class 2606 OID 45550)
-- Name: consumable_type_translation consumable_type_translation_consumable_type_id_language_cod_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_translation
    ADD CONSTRAINT consumable_type_translation_consumable_type_id_language_cod_key UNIQUE (consumable_type_id, language_code);


--
-- TOC entry 6071 (class 2606 OID 45548)
-- Name: consumable_type_translation consumable_type_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_translation
    ADD CONSTRAINT consumable_type_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5931 (class 2606 OID 44423)
-- Name: delivery_note delivery_note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT delivery_note_pkey PRIMARY KEY (delivery_note_id);


--
-- TOC entry 5934 (class 2606 OID 44425)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5937 (class 2606 OID 44427)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- TOC entry 5939 (class 2606 OID 44429)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- TOC entry 5941 (class 2606 OID 44431)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5944 (class 2606 OID 44433)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- TOC entry 6244 (class 2606 OID 46315)
-- Name: external_maintenance_document_translation external_maintenance_document_external_maintenance_document_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document_translation
    ADD CONSTRAINT external_maintenance_document_external_maintenance_document_key UNIQUE (external_maintenance_document_id, language_code);


--
-- TOC entry 5951 (class 2606 OID 44435)
-- Name: external_maintenance_document external_maintenance_document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT external_maintenance_document_pkey PRIMARY KEY (external_maintenance_document_id);


--
-- TOC entry 6246 (class 2606 OID 46313)
-- Name: external_maintenance_document_translation external_maintenance_document_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document_translation
    ADD CONSTRAINT external_maintenance_document_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5947 (class 2606 OID 44437)
-- Name: external_maintenance external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT external_maintenance_pkey PRIMARY KEY (external_maintenance_id);


--
-- TOC entry 5953 (class 2606 OID 44439)
-- Name: external_maintenance_provider external_maintenance_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_provider
    ADD CONSTRAINT external_maintenance_provider_pkey PRIMARY KEY (external_maintenance_provider_id);


--
-- TOC entry 5955 (class 2606 OID 44441)
-- Name: external_maintenance_step external_maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT external_maintenance_step_pkey PRIMARY KEY (external_maintenance_step_id);


--
-- TOC entry 6124 (class 2606 OID 45792)
-- Name: external_maintenance_typical_step_translation external_maintenance_typical__external_maintenance_typical__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step_translation
    ADD CONSTRAINT external_maintenance_typical__external_maintenance_typical__key UNIQUE (external_maintenance_typical_step_id, language_code);


--
-- TOC entry 5957 (class 2606 OID 44443)
-- Name: external_maintenance_typical_step external_maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step
    ADD CONSTRAINT external_maintenance_typical_step_pkey PRIMARY KEY (external_maintenance_typical_step_id);


--
-- TOC entry 6126 (class 2606 OID 45790)
-- Name: external_maintenance_typical_step_translation external_maintenance_typical_step_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step_translation
    ADD CONSTRAINT external_maintenance_typical_step_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5959 (class 2606 OID 44445)
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 5963 (class 2606 OID 44447)
-- Name: location_belongs_to_organizational_structure location_belongs_to_organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT location_belongs_to_organizational_structure_pkey PRIMARY KEY (organizational_structure_id, location_id);


--
-- TOC entry 5961 (class 2606 OID 44449)
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (location_id);


--
-- TOC entry 5965 (class 2606 OID 44451)
-- Name: location_relation location_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_relation
    ADD CONSTRAINT location_relation_pkey PRIMARY KEY (child_location_id, parent_location_id);


--
-- TOC entry 6145 (class 2606 OID 45881)
-- Name: location_translation location_translation_location_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_translation
    ADD CONSTRAINT location_translation_location_id_language_code_key UNIQUE (location_id, language_code);


--
-- TOC entry 6147 (class 2606 OID 45879)
-- Name: location_translation location_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_translation
    ADD CONSTRAINT location_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5967 (class 2606 OID 44453)
-- Name: location_type location_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type
    ADD CONSTRAINT location_type_pkey PRIMARY KEY (location_type_id);


--
-- TOC entry 6080 (class 2606 OID 45594)
-- Name: location_type_translation location_type_translation_location_type_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type_translation
    ADD CONSTRAINT location_type_translation_location_type_id_language_code_key UNIQUE (location_type_id, language_code);


--
-- TOC entry 6082 (class 2606 OID 45592)
-- Name: location_type_translation location_type_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type_translation
    ADD CONSTRAINT location_type_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5971 (class 2606 OID 44455)
-- Name: maintenance_inspection_leads_to_broken_item_report maintenance_inspection_leads_to_broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT maintenance_inspection_leads_to_broken_item_report_pkey PRIMARY KEY (maintenance_id, broken_item_report_id);


--
-- TOC entry 5969 (class 2606 OID 44457)
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (maintenance_id);


--
-- TOC entry 5976 (class 2606 OID 44459)
-- Name: maintenance_step_attribute_change maintenance_step_attribute_change_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_attribute_change_pkey PRIMARY KEY (maintenance_step_attribute_change_id);


--
-- TOC entry 6250 (class 2606 OID 46336)
-- Name: maintenance_step_item_request_translation maintenance_step_item_request_maintenance_step_item_request_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request_translation
    ADD CONSTRAINT maintenance_step_item_request_maintenance_step_item_request_key UNIQUE (maintenance_step_item_request_id, language_code);


--
-- TOC entry 5978 (class 2606 OID 44461)
-- Name: maintenance_step_item_request maintenance_step_item_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_pkey PRIMARY KEY (maintenance_step_item_request_id);


--
-- TOC entry 6252 (class 2606 OID 46334)
-- Name: maintenance_step_item_request_translation maintenance_step_item_request_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request_translation
    ADD CONSTRAINT maintenance_step_item_request_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5973 (class 2606 OID 44463)
-- Name: maintenance_step maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT maintenance_step_pkey PRIMARY KEY (maintenance_step_id);


--
-- TOC entry 6274 (class 2606 OID 47021)
-- Name: maintenance_step_status maintenance_step_status_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_status
    ADD CONSTRAINT maintenance_step_status_code_key UNIQUE (code);


--
-- TOC entry 6276 (class 2606 OID 47019)
-- Name: maintenance_step_status maintenance_step_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_status
    ADD CONSTRAINT maintenance_step_status_pkey PRIMARY KEY (id);


--
-- TOC entry 6278 (class 2606 OID 47036)
-- Name: maintenance_step_status_translation maintenance_step_status_trans_maintenance_step_status_id_la_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_status_translation
    ADD CONSTRAINT maintenance_step_status_trans_maintenance_step_status_id_la_key UNIQUE (maintenance_step_status_id, language_code);


--
-- TOC entry 6280 (class 2606 OID 47034)
-- Name: maintenance_step_status_translation maintenance_step_status_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_status_translation
    ADD CONSTRAINT maintenance_step_status_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6185 (class 2606 OID 46057)
-- Name: maintenance_translation maintenance_translation_maintenance_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_translation
    ADD CONSTRAINT maintenance_translation_maintenance_id_language_code_key UNIQUE (maintenance_id, language_code);


--
-- TOC entry 6187 (class 2606 OID 46055)
-- Name: maintenance_translation maintenance_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_translation
    ADD CONSTRAINT maintenance_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5982 (class 2606 OID 44465)
-- Name: maintenance_typical_step maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step
    ADD CONSTRAINT maintenance_typical_step_pkey PRIMARY KEY (maintenance_typical_step_id);


--
-- TOC entry 6120 (class 2606 OID 45770)
-- Name: maintenance_typical_step_translation maintenance_typical_step_tran_maintenance_typical_step_id_l_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step_translation
    ADD CONSTRAINT maintenance_typical_step_tran_maintenance_typical_step_id_l_key UNIQUE (maintenance_typical_step_id, language_code);


--
-- TOC entry 6122 (class 2606 OID 45768)
-- Name: maintenance_typical_step_translation maintenance_typical_step_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step_translation
    ADD CONSTRAINT maintenance_typical_step_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5984 (class 2606 OID 44467)
-- Name: organizational_structure organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure
    ADD CONSTRAINT organizational_structure_pkey PRIMARY KEY (organizational_structure_id);


--
-- TOC entry 5986 (class 2606 OID 44469)
-- Name: organizational_structure_relation organizational_structure_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT organizational_structure_relation_pkey PRIMARY KEY (child_organizational_structure_id, parent_organizational_structure_id);


--
-- TOC entry 6150 (class 2606 OID 45903)
-- Name: organizational_structure_translation organizational_structure_tran_organizational_structure_id_l_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_translation
    ADD CONSTRAINT organizational_structure_tran_organizational_structure_id_l_key UNIQUE (organizational_structure_id, language_code);


--
-- TOC entry 6152 (class 2606 OID 45901)
-- Name: organizational_structure_translation organizational_structure_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_translation
    ADD CONSTRAINT organizational_structure_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6085 (class 2606 OID 45616)
-- Name: organizational_structure_type_translation organizational_structure_type_organizational_structure_typ_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_type_translation
    ADD CONSTRAINT organizational_structure_type_organizational_structure_typ_key1 UNIQUE (organizational_structure_type_id, language_code);


--
-- TOC entry 5988 (class 2606 OID 44471)
-- Name: organizational_structure_type organizational_structure_type_organizational_structure_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_type
    ADD CONSTRAINT organizational_structure_type_organizational_structure_type_key UNIQUE (organizational_structure_type);


--
-- TOC entry 5990 (class 2606 OID 44473)
-- Name: organizational_structure_type organizational_structure_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_type
    ADD CONSTRAINT organizational_structure_type_pkey PRIMARY KEY (organizational_structure_type_id);


--
-- TOC entry 6087 (class 2606 OID 45614)
-- Name: organizational_structure_type_translation organizational_structure_type_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_type_translation
    ADD CONSTRAINT organizational_structure_type_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 5994 (class 2606 OID 44475)
-- Name: person_assignment person_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT person_assignment_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5992 (class 2606 OID 44477)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- TOC entry 5998 (class 2606 OID 44479)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 6000 (class 2606 OID 44481)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_report_cons; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_report_cons UNIQUE (report_id, consumable_id);


--
-- TOC entry 6002 (class 2606 OID 44483)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_pkey PRIMARY KEY (report_id);


--
-- TOC entry 6004 (class 2606 OID 44485)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 6006 (class 2606 OID 44487)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_report_stoc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_report_stoc UNIQUE (report_id, stock_item_id);


--
-- TOC entry 5996 (class 2606 OID 44489)
-- Name: person_reports_problem_on_asset person_reports_problem_on_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT person_reports_problem_on_asset_pkey PRIMARY KEY (report_id);


--
-- TOC entry 6170 (class 2606 OID 45991)
-- Name: person_reports_problem_on_asset_translation person_reports_problem_on_asset_tra_report_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_translation
    ADD CONSTRAINT person_reports_problem_on_asset_tra_report_id_language_code_key UNIQUE (report_id, language_code);


--
-- TOC entry 6172 (class 2606 OID 45989)
-- Name: person_reports_problem_on_asset_translation person_reports_problem_on_asset_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_translation
    ADD CONSTRAINT person_reports_problem_on_asset_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6175 (class 2606 OID 46013)
-- Name: person_reports_problem_on_consumable_translation person_reports_problem_on_consumabl_report_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable_translation
    ADD CONSTRAINT person_reports_problem_on_consumabl_report_id_language_code_key UNIQUE (report_id, language_code);


--
-- TOC entry 6008 (class 2606 OID 44491)
-- Name: person_reports_problem_on_consumable person_reports_problem_on_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT person_reports_problem_on_consumable_pkey PRIMARY KEY (report_id);


--
-- TOC entry 6177 (class 2606 OID 46011)
-- Name: person_reports_problem_on_consumable_translation person_reports_problem_on_consumable_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable_translation
    ADD CONSTRAINT person_reports_problem_on_consumable_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6180 (class 2606 OID 46035)
-- Name: person_reports_problem_on_stock_item_translation person_reports_problem_on_stock_ite_report_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item_translation
    ADD CONSTRAINT person_reports_problem_on_stock_ite_report_id_language_code_key UNIQUE (report_id, language_code);


--
-- TOC entry 6010 (class 2606 OID 44493)
-- Name: person_reports_problem_on_stock_item person_reports_problem_on_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT person_reports_problem_on_stock_item_pkey PRIMARY KEY (report_id);


--
-- TOC entry 6182 (class 2606 OID 46033)
-- Name: person_reports_problem_on_stock_item_translation person_reports_problem_on_stock_item_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item_translation
    ADD CONSTRAINT person_reports_problem_on_stock_item_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6012 (class 2606 OID 44495)
-- Name: person_role_mapping person_role_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT person_role_mapping_pkey PRIMARY KEY (role_id, person_id);


--
-- TOC entry 6130 (class 2606 OID 45815)
-- Name: person_translation person_translation_person_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_translation
    ADD CONSTRAINT person_translation_person_id_language_code_key UNIQUE (person_id, language_code);


--
-- TOC entry 6132 (class 2606 OID 45813)
-- Name: person_translation person_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_translation
    ADD CONSTRAINT person_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6014 (class 2606 OID 44497)
-- Name: physical_condition physical_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition
    ADD CONSTRAINT physical_condition_pkey PRIMARY KEY (condition_id);


--
-- TOC entry 6090 (class 2606 OID 45638)
-- Name: physical_condition_translation physical_condition_translation_condition_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition_translation
    ADD CONSTRAINT physical_condition_translation_condition_id_language_code_key UNIQUE (condition_id, language_code);


--
-- TOC entry 6092 (class 2606 OID 45636)
-- Name: physical_condition_translation physical_condition_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition_translation
    ADD CONSTRAINT physical_condition_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6016 (class 2606 OID 44499)
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (position_id);


--
-- TOC entry 6018 (class 2606 OID 44501)
-- Name: position_role_mapping position_role_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_role_mapping
    ADD CONSTRAINT position_role_mapping_pkey PRIMARY KEY (position_id, role_id);


--
-- TOC entry 6100 (class 2606 OID 45680)
-- Name: position_translation position_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_translation
    ADD CONSTRAINT position_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6102 (class 2606 OID 45682)
-- Name: position_translation position_translation_position_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_translation
    ADD CONSTRAINT position_translation_position_id_language_code_key UNIQUE (position_id, language_code);


--
-- TOC entry 6020 (class 2606 OID 44503)
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (purchase_order_id);


--
-- TOC entry 6022 (class 2606 OID 44505)
-- Name: receipt_report receipt_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_report
    ADD CONSTRAINT receipt_report_pkey PRIMARY KEY (receipt_report_id);


--
-- TOC entry 6024 (class 2606 OID 44507)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- TOC entry 6095 (class 2606 OID 45658)
-- Name: role_translation role_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_translation
    ADD CONSTRAINT role_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6097 (class 2606 OID 45660)
-- Name: role_translation role_translation_role_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_translation
    ADD CONSTRAINT role_translation_role_id_language_code_key UNIQUE (role_id, language_code);


--
-- TOC entry 6115 (class 2606 OID 45748)
-- Name: stock_item_attribute_definition_translation stock_item_attribute_definiti_stock_item_attribute_definiti_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition_translation
    ADD CONSTRAINT stock_item_attribute_definiti_stock_item_attribute_definiti_key UNIQUE (stock_item_attribute_definition_id, language_code);


--
-- TOC entry 6029 (class 2606 OID 44509)
-- Name: stock_item_attribute_definition stock_item_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition
    ADD CONSTRAINT stock_item_attribute_definition_pkey PRIMARY KEY (stock_item_attribute_definition_id);


--
-- TOC entry 6117 (class 2606 OID 45746)
-- Name: stock_item_attribute_definition_translation stock_item_attribute_definition_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition_translation
    ADD CONSTRAINT stock_item_attribute_definition_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6031 (class 2606 OID 44511)
-- Name: stock_item_attribute_value stock_item_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT stock_item_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_id);


--
-- TOC entry 6033 (class 2606 OID 44513)
-- Name: stock_item_brand stock_item_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand
    ADD CONSTRAINT stock_item_brand_pkey PRIMARY KEY (stock_item_brand_id);


--
-- TOC entry 6260 (class 2606 OID 46558)
-- Name: stock_item_brand_translation stock_item_brand_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand_translation
    ADD CONSTRAINT stock_item_brand_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6262 (class 2606 OID 46560)
-- Name: stock_item_brand_translation stock_item_brand_translation_stock_item_brand_id_language_c_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand_translation
    ADD CONSTRAINT stock_item_brand_translation_stock_item_brand_id_language_c_key UNIQUE (stock_item_brand_id, language_code);


--
-- TOC entry 6200 (class 2606 OID 46126)
-- Name: stock_item_condition_history_translation stock_item_condition_history__stock_item_condition_history__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history_translation
    ADD CONSTRAINT stock_item_condition_history__stock_item_condition_history__key UNIQUE (stock_item_condition_history_id, language_code);


--
-- TOC entry 6035 (class 2606 OID 44515)
-- Name: stock_item_condition_history stock_item_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT stock_item_condition_history_pkey PRIMARY KEY (stock_item_condition_history_id);


--
-- TOC entry 6202 (class 2606 OID 46124)
-- Name: stock_item_condition_history_translation stock_item_condition_history_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history_translation
    ADD CONSTRAINT stock_item_condition_history_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6037 (class 2606 OID 44517)
-- Name: stock_item_consumable_destruction_certificate stock_item_consumable_destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_consumable_destruction_certificate
    ADD CONSTRAINT stock_item_consumable_destruction_certificate_pkey PRIMARY KEY (destruction_certificate_id);


--
-- TOC entry 6294 (class 2606 OID 47597)
-- Name: stock_item_is_assigned_to_org_structure stock_item_is_assigned_to_org_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_org_structure
    ADD CONSTRAINT stock_item_is_assigned_to_org_structure_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 6039 (class 2606 OID 44519)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 6041 (class 2606 OID 44521)
-- Name: stock_item_is_compatible_with_asset stock_item_is_compatible_with_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT stock_item_is_compatible_with_asset_pkey PRIMARY KEY (stock_item_model_id, asset_model_id);


--
-- TOC entry 6045 (class 2606 OID 44523)
-- Name: stock_item_model_attribute_value stock_item_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT stock_item_model_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_model_id);


--
-- TOC entry 6282 (class 2606 OID 47078)
-- Name: stock_item_model_default_consumable stock_item_model_default_cons_stock_item_model_id_consumabl_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_default_consumable
    ADD CONSTRAINT stock_item_model_default_cons_stock_item_model_id_consumabl_key UNIQUE (stock_item_model_id, consumable_model_id);


--
-- TOC entry 6284 (class 2606 OID 47076)
-- Name: stock_item_model_default_consumable stock_item_model_default_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_default_consumable
    ADD CONSTRAINT stock_item_model_default_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 6047 (class 2606 OID 44525)
-- Name: stock_item_model_is_found_in_purchase_order stock_item_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT stock_item_model_is_found_in_bdc_pkey PRIMARY KEY (stock_item_model_id, purchase_order_id);


--
-- TOC entry 6043 (class 2606 OID 44527)
-- Name: stock_item_model stock_item_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT stock_item_model_pkey PRIMARY KEY (stock_item_model_id);


--
-- TOC entry 6230 (class 2606 OID 46250)
-- Name: stock_item_model_translation stock_item_model_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_translation
    ADD CONSTRAINT stock_item_model_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6232 (class 2606 OID 46252)
-- Name: stock_item_model_translation stock_item_model_translation_stock_item_model_id_language_c_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_translation
    ADD CONSTRAINT stock_item_model_translation_stock_item_model_id_language_c_key UNIQUE (stock_item_model_id, language_code);


--
-- TOC entry 6050 (class 2606 OID 44529)
-- Name: stock_item_movement stock_item_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT stock_item_movement_pkey PRIMARY KEY (stock_item_movement_id);


--
-- TOC entry 6165 (class 2606 OID 45969)
-- Name: stock_item_movement_translation stock_item_movement_translati_stock_item_movement_id_langua_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement_translation
    ADD CONSTRAINT stock_item_movement_translati_stock_item_movement_id_langua_key UNIQUE (stock_item_movement_id, language_code);


--
-- TOC entry 6167 (class 2606 OID 45967)
-- Name: stock_item_movement_translation stock_item_movement_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement_translation
    ADD CONSTRAINT stock_item_movement_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6027 (class 2606 OID 44531)
-- Name: stock_item stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT stock_item_pkey PRIMARY KEY (stock_item_id);


--
-- TOC entry 6215 (class 2606 OID 46187)
-- Name: stock_item_translation stock_item_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_translation
    ADD CONSTRAINT stock_item_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6217 (class 2606 OID 46189)
-- Name: stock_item_translation stock_item_translation_stock_item_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_translation
    ADD CONSTRAINT stock_item_translation_stock_item_id_language_code_key UNIQUE (stock_item_id, language_code);


--
-- TOC entry 6054 (class 2606 OID 44533)
-- Name: stock_item_type_attribute stock_item_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT stock_item_type_attribute_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_type_id);


--
-- TOC entry 6052 (class 2606 OID 44535)
-- Name: stock_item_type stock_item_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type
    ADD CONSTRAINT stock_item_type_pkey PRIMARY KEY (stock_item_type_id);


--
-- TOC entry 6075 (class 2606 OID 45570)
-- Name: stock_item_type_translation stock_item_type_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_translation
    ADD CONSTRAINT stock_item_type_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6077 (class 2606 OID 45572)
-- Name: stock_item_type_translation stock_item_type_translation_stock_item_type_id_language_cod_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_translation
    ADD CONSTRAINT stock_item_type_translation_stock_item_type_id_language_cod_key UNIQUE (stock_item_type_id, language_code);


--
-- TOC entry 6056 (class 2606 OID 44537)
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (supplier_id);


--
-- TOC entry 6135 (class 2606 OID 45835)
-- Name: supplier_translation supplier_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_translation
    ADD CONSTRAINT supplier_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6137 (class 2606 OID 45837)
-- Name: supplier_translation supplier_translation_supplier_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_translation
    ADD CONSTRAINT supplier_translation_supplier_id_language_code_key UNIQUE (supplier_id, language_code);


--
-- TOC entry 5799 (class 2606 OID 44539)
-- Name: asset_destruction_certificate_asset uq_adca_asset; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT uq_adca_asset UNIQUE (asset_id);


--
-- TOC entry 5823 (class 2606 OID 44541)
-- Name: asset_model_default_consumable uq_amdc_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT uq_amdc_composition UNIQUE (asset_model_id, consumable_model_id);


--
-- TOC entry 5827 (class 2606 OID 44543)
-- Name: asset_model_default_stock_item uq_amdsi_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT uq_amdsi_composition UNIQUE (asset_model_id, stock_item_model_id);


--
-- TOC entry 5843 (class 2606 OID 44545)
-- Name: attribution_order_asset_consumable_accessory uq_ao_aca_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT uq_ao_aca_unique UNIQUE (attribution_order_id, asset_id, consumable_id);


--
-- TOC entry 5850 (class 2606 OID 44547)
-- Name: attribution_order_asset_stock_item_accessory uq_ao_assa_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT uq_ao_assa_unique UNIQUE (attribution_order_id, asset_id, stock_item_id);


--
-- TOC entry 6290 (class 2606 OID 47562)
-- Name: asset_is_assigned_to_org_structure uq_asset_org_active; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_org_structure
    ADD CONSTRAINT uq_asset_org_active UNIQUE (asset_id, is_active) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6302 (class 2606 OID 47636)
-- Name: consumable_is_assigned_to_org_structure uq_consumable_org_active; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_org_structure
    ADD CONSTRAINT uq_consumable_org_active UNIQUE (consumable_id, is_active) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6296 (class 2606 OID 47599)
-- Name: stock_item_is_assigned_to_org_structure uq_stock_item_org_active; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_org_structure
    ADD CONSTRAINT uq_stock_item_org_active UNIQUE (stock_item_id, is_active) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6058 (class 2606 OID 44549)
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- TOC entry 6060 (class 2606 OID 44551)
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (session_id);


--
-- TOC entry 6062 (class 2606 OID 44553)
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (warehouse_id);


--
-- TOC entry 6140 (class 2606 OID 45857)
-- Name: warehouse_translation warehouse_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_translation
    ADD CONSTRAINT warehouse_translation_pkey PRIMARY KEY (id);


--
-- TOC entry 6142 (class 2606 OID 45859)
-- Name: warehouse_translation warehouse_translation_warehouse_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_translation
    ADD CONSTRAINT warehouse_translation_warehouse_id_language_code_key UNIQUE (warehouse_id, language_code);


--
-- TOC entry 5851 (class 1259 OID 44554)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- TOC entry 5856 (class 1259 OID 44555)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- TOC entry 5859 (class 1259 OID 44556)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- TOC entry 5862 (class 1259 OID 44557)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- TOC entry 5872 (class 1259 OID 44558)
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- TOC entry 5875 (class 1259 OID 44559)
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- TOC entry 5878 (class 1259 OID 44560)
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- TOC entry 5881 (class 1259 OID 44561)
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- TOC entry 5869 (class 1259 OID 44562)
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- TOC entry 5932 (class 1259 OID 44563)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- TOC entry 5935 (class 1259 OID 44564)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- TOC entry 5942 (class 1259 OID 44565)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- TOC entry 5945 (class 1259 OID 44566)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- TOC entry 6237 (class 1259 OID 46279)
-- Name: idx_admin_cert_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_cert_translation_lang ON public.administrative_certificate_translation USING btree (language_code);


--
-- TOC entry 5839 (class 1259 OID 44567)
-- Name: idx_ao_aca_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_asset ON public.attribution_order_asset_consumable_accessory USING btree (asset_id);


--
-- TOC entry 5840 (class 1259 OID 44568)
-- Name: idx_ao_aca_consumable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_consumable ON public.attribution_order_asset_consumable_accessory USING btree (consumable_id);


--
-- TOC entry 5841 (class 1259 OID 44569)
-- Name: idx_ao_aca_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_order ON public.attribution_order_asset_consumable_accessory USING btree (attribution_order_id);


--
-- TOC entry 5846 (class 1259 OID 44570)
-- Name: idx_ao_assa_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_asset ON public.attribution_order_asset_stock_item_accessory USING btree (asset_id);


--
-- TOC entry 5847 (class 1259 OID 44571)
-- Name: idx_ao_assa_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_order ON public.attribution_order_asset_stock_item_accessory USING btree (attribution_order_id);


--
-- TOC entry 5848 (class 1259 OID 44572)
-- Name: idx_ao_assa_stock_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_stock_item ON public.attribution_order_asset_stock_item_accessory USING btree (stock_item_id);


--
-- TOC entry 6107 (class 1259 OID 45710)
-- Name: idx_asset_attr_def_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_attr_def_translation_lang ON public.asset_attribute_definition_translation USING btree (language_code);


--
-- TOC entry 6257 (class 1259 OID 46544)
-- Name: idx_asset_brand_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_brand_translation_lang ON public.asset_brand_translation USING btree (language_code);


--
-- TOC entry 6192 (class 1259 OID 46086)
-- Name: idx_asset_condition_history_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_condition_history_translation_lang ON public.asset_condition_history_translation USING btree (language_code);


--
-- TOC entry 6272 (class 1259 OID 47006)
-- Name: idx_asset_incident_report_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_incident_report_translation_lang ON public.asset_incident_report_translation USING btree (language_code);


--
-- TOC entry 6222 (class 1259 OID 46216)
-- Name: idx_asset_model_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_model_translation_lang ON public.asset_model_translation USING btree (language_code);


--
-- TOC entry 5830 (class 1259 OID 46760)
-- Name: idx_asset_movement_maintenance_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_movement_maintenance_id ON public.asset_movement USING btree (maintenance_id);


--
-- TOC entry 6157 (class 1259 OID 45931)
-- Name: idx_asset_movement_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_movement_translation_lang ON public.asset_movement_translation USING btree (language_code);


--
-- TOC entry 6287 (class 1259 OID 47659)
-- Name: idx_asset_org_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_org_is_active ON public.asset_is_assigned_to_org_structure USING btree (is_active);


--
-- TOC entry 6288 (class 1259 OID 47658)
-- Name: idx_asset_org_structure_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_org_structure_id ON public.asset_is_assigned_to_org_structure USING btree (organizational_structure_id);


--
-- TOC entry 6207 (class 1259 OID 46153)
-- Name: idx_asset_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_translation_lang ON public.asset_translation USING btree (language_code);


--
-- TOC entry 6067 (class 1259 OID 45534)
-- Name: idx_asset_type_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_type_translation_lang ON public.asset_type_translation USING btree (language_code);


--
-- TOC entry 5890 (class 1259 OID 44573)
-- Name: idx_brcml_backorder_report_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_brcml_backorder_report_id ON public.backorder_report_consumable_model_line USING btree (backorder_report_id);


--
-- TOC entry 5893 (class 1259 OID 44574)
-- Name: idx_brsiml_backorder_report_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_brsiml_backorder_report_id ON public.backorder_report_stock_item_model_line USING btree (backorder_report_id);


--
-- TOC entry 6242 (class 1259 OID 46300)
-- Name: idx_company_asset_request_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_asset_request_translation_lang ON public.company_asset_request_translation USING btree (language_code);


--
-- TOC entry 6112 (class 1259 OID 45732)
-- Name: idx_consumable_attr_def_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_attr_def_translation_lang ON public.consumable_attribute_definition_translation USING btree (language_code);


--
-- TOC entry 6267 (class 1259 OID 46588)
-- Name: idx_consumable_brand_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_brand_translation_lang ON public.consumable_brand_translation USING btree (language_code);


--
-- TOC entry 6197 (class 1259 OID 46109)
-- Name: idx_consumable_condition_history_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_condition_history_translation_lang ON public.consumable_condition_history_translation USING btree (language_code);


--
-- TOC entry 6227 (class 1259 OID 46237)
-- Name: idx_consumable_model_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_model_translation_lang ON public.consumable_model_translation USING btree (language_code);


--
-- TOC entry 5925 (class 1259 OID 46762)
-- Name: idx_consumable_movement_maintenance_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_movement_maintenance_id ON public.consumable_movement USING btree (maintenance_id);


--
-- TOC entry 6162 (class 1259 OID 45953)
-- Name: idx_consumable_movement_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_movement_translation_lang ON public.consumable_movement_translation USING btree (language_code);


--
-- TOC entry 6299 (class 1259 OID 47663)
-- Name: idx_consumable_org_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_org_is_active ON public.consumable_is_assigned_to_org_structure USING btree (is_active);


--
-- TOC entry 6300 (class 1259 OID 47662)
-- Name: idx_consumable_org_structure_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_org_structure_id ON public.consumable_is_assigned_to_org_structure USING btree (organizational_structure_id);


--
-- TOC entry 5900 (class 1259 OID 47064)
-- Name: idx_consumable_purchase_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_purchase_order_id ON public.consumable USING btree (purchase_order_id);


--
-- TOC entry 6212 (class 1259 OID 46174)
-- Name: idx_consumable_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_translation_lang ON public.consumable_translation USING btree (language_code);


--
-- TOC entry 6072 (class 1259 OID 45556)
-- Name: idx_consumable_type_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumable_type_translation_lang ON public.consumable_type_translation USING btree (language_code);


--
-- TOC entry 6247 (class 1259 OID 46321)
-- Name: idx_ext_maintenance_doc_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ext_maintenance_doc_translation_lang ON public.external_maintenance_document_translation USING btree (language_code);


--
-- TOC entry 6127 (class 1259 OID 45798)
-- Name: idx_ext_maintenance_typical_step_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ext_maintenance_typical_step_translation_lang ON public.external_maintenance_typical_step_translation USING btree (language_code);


--
-- TOC entry 5948 (class 1259 OID 44575)
-- Name: idx_external_maintenance_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_provider_id ON public.external_maintenance USING btree (external_maintenance_provider_id);


--
-- TOC entry 5949 (class 1259 OID 44576)
-- Name: idx_external_maintenance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_status ON public.external_maintenance USING btree (external_maintenance_status);


--
-- TOC entry 6143 (class 1259 OID 45887)
-- Name: idx_location_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_translation_lang ON public.location_translation USING btree (language_code);


--
-- TOC entry 6078 (class 1259 OID 45600)
-- Name: idx_location_type_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_type_translation_lang ON public.location_type_translation USING btree (language_code);


--
-- TOC entry 6248 (class 1259 OID 46342)
-- Name: idx_maintenance_step_item_request_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maintenance_step_item_request_translation_lang ON public.maintenance_step_item_request_translation USING btree (language_code);


--
-- TOC entry 6183 (class 1259 OID 46063)
-- Name: idx_maintenance_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maintenance_translation_lang ON public.maintenance_translation USING btree (language_code);


--
-- TOC entry 6118 (class 1259 OID 45776)
-- Name: idx_maintenance_typical_step_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maintenance_typical_step_translation_lang ON public.maintenance_typical_step_translation USING btree (language_code);


--
-- TOC entry 6148 (class 1259 OID 45909)
-- Name: idx_org_structure_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_structure_translation_lang ON public.organizational_structure_translation USING btree (language_code);


--
-- TOC entry 6083 (class 1259 OID 45622)
-- Name: idx_org_structure_type_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_structure_type_translation_lang ON public.organizational_structure_type_translation USING btree (language_code);


--
-- TOC entry 6168 (class 1259 OID 45997)
-- Name: idx_person_reports_problem_asset_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_person_reports_problem_asset_translation_lang ON public.person_reports_problem_on_asset_translation USING btree (language_code);


--
-- TOC entry 6173 (class 1259 OID 46019)
-- Name: idx_person_reports_problem_consumable_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_person_reports_problem_consumable_translation_lang ON public.person_reports_problem_on_consumable_translation USING btree (language_code);


--
-- TOC entry 6178 (class 1259 OID 46041)
-- Name: idx_person_reports_problem_stock_item_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_person_reports_problem_stock_item_translation_lang ON public.person_reports_problem_on_stock_item_translation USING btree (language_code);


--
-- TOC entry 6128 (class 1259 OID 45821)
-- Name: idx_person_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_person_translation_lang ON public.person_translation USING btree (language_code);


--
-- TOC entry 6088 (class 1259 OID 45644)
-- Name: idx_physical_condition_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_physical_condition_translation_lang ON public.physical_condition_translation USING btree (language_code);


--
-- TOC entry 6098 (class 1259 OID 45688)
-- Name: idx_position_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_position_translation_lang ON public.position_translation USING btree (language_code);


--
-- TOC entry 6093 (class 1259 OID 45666)
-- Name: idx_role_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_translation_lang ON public.role_translation USING btree (language_code);


--
-- TOC entry 6113 (class 1259 OID 45754)
-- Name: idx_stock_item_attr_def_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_attr_def_translation_lang ON public.stock_item_attribute_definition_translation USING btree (language_code);


--
-- TOC entry 6258 (class 1259 OID 46566)
-- Name: idx_stock_item_brand_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_brand_translation_lang ON public.stock_item_brand_translation USING btree (language_code);


--
-- TOC entry 6198 (class 1259 OID 46132)
-- Name: idx_stock_item_condition_history_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_condition_history_translation_lang ON public.stock_item_condition_history_translation USING btree (language_code);


--
-- TOC entry 6228 (class 1259 OID 46258)
-- Name: idx_stock_item_model_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_model_translation_lang ON public.stock_item_model_translation USING btree (language_code);


--
-- TOC entry 6048 (class 1259 OID 46761)
-- Name: idx_stock_item_movement_maintenance_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_movement_maintenance_id ON public.stock_item_movement USING btree (maintenance_id);


--
-- TOC entry 6163 (class 1259 OID 45975)
-- Name: idx_stock_item_movement_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_movement_translation_lang ON public.stock_item_movement_translation USING btree (language_code);


--
-- TOC entry 6291 (class 1259 OID 47661)
-- Name: idx_stock_item_org_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_org_is_active ON public.stock_item_is_assigned_to_org_structure USING btree (is_active);


--
-- TOC entry 6292 (class 1259 OID 47660)
-- Name: idx_stock_item_org_structure_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_org_structure_id ON public.stock_item_is_assigned_to_org_structure USING btree (organizational_structure_id);


--
-- TOC entry 6025 (class 1259 OID 47063)
-- Name: idx_stock_item_purchase_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_purchase_order_id ON public.stock_item USING btree (purchase_order_id);


--
-- TOC entry 6213 (class 1259 OID 46195)
-- Name: idx_stock_item_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_translation_lang ON public.stock_item_translation USING btree (language_code);


--
-- TOC entry 6073 (class 1259 OID 45578)
-- Name: idx_stock_item_type_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_item_type_translation_lang ON public.stock_item_type_translation USING btree (language_code);


--
-- TOC entry 6133 (class 1259 OID 45843)
-- Name: idx_supplier_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_supplier_translation_lang ON public.supplier_translation USING btree (language_code);


--
-- TOC entry 6138 (class 1259 OID 45865)
-- Name: idx_warehouse_translation_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_warehouse_translation_lang ON public.warehouse_translation USING btree (language_code);


--
-- TOC entry 5974 (class 1259 OID 44577)
-- Name: maintenance_step_attribute_change_maintenance_step_id_34ad2442; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_attribute_change_maintenance_step_id_34ad2442 ON public.maintenance_step_attribute_change USING btree (maintenance_step_id);


--
-- TOC entry 5979 (class 1259 OID 44578)
-- Name: maintenance_step_item_request_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_status_idx ON public.maintenance_step_item_request USING btree (status);


--
-- TOC entry 5980 (class 1259 OID 44579)
-- Name: maintenance_step_item_request_step_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_step_id_idx ON public.maintenance_step_item_request USING btree (maintenance_step_id);


--
-- TOC entry 5806 (class 1259 OID 44580)
-- Name: uq_airc_report_consumable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_airc_report_consumable ON public.asset_incident_report_consumable USING btree (asset_incident_report_id, consumable_id);


--
-- TOC entry 5809 (class 1259 OID 44581)
-- Name: uq_airsi_report_stock_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_airsi_report_stock_item ON public.asset_incident_report_stock_item USING btree (asset_incident_report_id, stock_item_id);


--
-- TOC entry 6530 (class 2606 OID 46274)
-- Name: administrative_certificate_translation administrative_certificate_tr_administrative_certificate_i_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate_translation
    ADD CONSTRAINT administrative_certificate_tr_administrative_certificate_i_fkey FOREIGN KEY (administrative_certificate_id) REFERENCES public.administrative_certificate(administrative_certificate_id) ON DELETE CASCADE;


--
-- TOC entry 6504 (class 2606 OID 45705)
-- Name: asset_attribute_definition_translation asset_attribute_definition_tr_asset_attribute_definition_i_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition_translation
    ADD CONSTRAINT asset_attribute_definition_tr_asset_attribute_definition_i_fkey FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON DELETE CASCADE;


--
-- TOC entry 6534 (class 2606 OID 46539)
-- Name: asset_brand_translation asset_brand_translation_asset_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand_translation
    ADD CONSTRAINT asset_brand_translation_asset_brand_id_fkey FOREIGN KEY (asset_brand_id) REFERENCES public.asset_brand(asset_brand_id) ON DELETE CASCADE;


--
-- TOC entry 6521 (class 2606 OID 46081)
-- Name: asset_condition_history_translation asset_condition_history_transla_asset_condition_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history_translation
    ADD CONSTRAINT asset_condition_history_transla_asset_condition_history_id_fkey FOREIGN KEY (asset_condition_history_id) REFERENCES public.asset_condition_history(asset_condition_history_id) ON DELETE CASCADE;


--
-- TOC entry 6537 (class 2606 OID 47001)
-- Name: asset_incident_report_translation asset_incident_report_translation_asset_incident_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_translation
    ADD CONSTRAINT asset_incident_report_translation_asset_incident_report_id_fkey FOREIGN KEY (asset_incident_report_id) REFERENCES public.asset_incident_report(asset_incident_report_id) ON DELETE CASCADE;


--
-- TOC entry 6541 (class 2606 OID 47579)
-- Name: asset_is_assigned_to_org_structure asset_is_assigned_to_org_stru_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_org_structure
    ADD CONSTRAINT asset_is_assigned_to_org_stru_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 6542 (class 2606 OID 47564)
-- Name: asset_is_assigned_to_org_structure asset_is_assigned_to_org_struc_organizational_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_org_structure
    ADD CONSTRAINT asset_is_assigned_to_org_struc_organizational_structure_id_fkey FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON DELETE CASCADE;


--
-- TOC entry 6543 (class 2606 OID 47569)
-- Name: asset_is_assigned_to_org_structure asset_is_assigned_to_org_structure_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_org_structure
    ADD CONSTRAINT asset_is_assigned_to_org_structure_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON DELETE CASCADE;


--
-- TOC entry 6544 (class 2606 OID 47574)
-- Name: asset_is_assigned_to_org_structure asset_is_assigned_to_org_structure_assigned_by_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_org_structure
    ADD CONSTRAINT asset_is_assigned_to_org_structure_assigned_by_person_id_fkey FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON DELETE CASCADE;


--
-- TOC entry 6327 (class 2606 OID 44582)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 6527 (class 2606 OID 46211)
-- Name: asset_model_translation asset_model_translation_asset_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_translation
    ADD CONSTRAINT asset_model_translation_asset_model_id_fkey FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 6514 (class 2606 OID 45926)
-- Name: asset_movement_translation asset_movement_translation_asset_movement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement_translation
    ADD CONSTRAINT asset_movement_translation_asset_movement_id_fkey FOREIGN KEY (asset_movement_id) REFERENCES public.asset_movement(asset_movement_id) ON DELETE CASCADE;


--
-- TOC entry 6524 (class 2606 OID 46148)
-- Name: asset_translation asset_translation_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_translation
    ADD CONSTRAINT asset_translation_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON DELETE CASCADE;


--
-- TOC entry 6496 (class 2606 OID 45529)
-- Name: asset_type_translation asset_type_translation_asset_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_translation
    ADD CONSTRAINT asset_type_translation_asset_type_id_fkey FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON DELETE CASCADE;


--
-- TOC entry 6362 (class 2606 OID 44587)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6363 (class 2606 OID 44592)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6364 (class 2606 OID 44597)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6365 (class 2606 OID 44602)
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6366 (class 2606 OID 44607)
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6367 (class 2606 OID 44612)
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6368 (class 2606 OID 44617)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6531 (class 2606 OID 46295)
-- Name: company_asset_request_translation company_asset_request_translation_company_asset_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request_translation
    ADD CONSTRAINT company_asset_request_translation_company_asset_request_id_fkey FOREIGN KEY (company_asset_request_id) REFERENCES public.company_asset_request(company_asset_request_id) ON DELETE CASCADE;


--
-- TOC entry 6505 (class 2606 OID 45727)
-- Name: consumable_attribute_definition_translation consumable_attribute_definiti_consumable_attribute_definit_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition_translation
    ADD CONSTRAINT consumable_attribute_definiti_consumable_attribute_definit_fkey FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON DELETE CASCADE;


--
-- TOC entry 6536 (class 2606 OID 46583)
-- Name: consumable_brand_translation consumable_brand_translation_consumable_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand_translation
    ADD CONSTRAINT consumable_brand_translation_consumable_brand_id_fkey FOREIGN KEY (consumable_brand_id) REFERENCES public.consumable_brand(consumable_brand_id) ON DELETE CASCADE;


--
-- TOC entry 6522 (class 2606 OID 46104)
-- Name: consumable_condition_history_translation consumable_condition_history__consumable_condition_history_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history_translation
    ADD CONSTRAINT consumable_condition_history__consumable_condition_history_fkey FOREIGN KEY (consumable_condition_history_id) REFERENCES public.consumable_condition_history(consumable_condition_history_id) ON DELETE CASCADE;


--
-- TOC entry 6379 (class 2606 OID 47048)
-- Name: consumable_condition_history consumable_condition_history_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT consumable_condition_history_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id);


--
-- TOC entry 6549 (class 2606 OID 47638)
-- Name: consumable_is_assigned_to_org_structure consumable_is_assigned_to_org__organizational_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_org_structure
    ADD CONSTRAINT consumable_is_assigned_to_org__organizational_structure_id_fkey FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON DELETE CASCADE;


--
-- TOC entry 6550 (class 2606 OID 47653)
-- Name: consumable_is_assigned_to_org_structure consumable_is_assigned_to_org_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_org_structure
    ADD CONSTRAINT consumable_is_assigned_to_org_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 6551 (class 2606 OID 47648)
-- Name: consumable_is_assigned_to_org_structure consumable_is_assigned_to_org_struct_assigned_by_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_org_structure
    ADD CONSTRAINT consumable_is_assigned_to_org_struct_assigned_by_person_id_fkey FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON DELETE CASCADE;


--
-- TOC entry 6552 (class 2606 OID 47643)
-- Name: consumable_is_assigned_to_org_structure consumable_is_assigned_to_org_structure_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_org_structure
    ADD CONSTRAINT consumable_is_assigned_to_org_structure_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON DELETE CASCADE;


--
-- TOC entry 6381 (class 2606 OID 44622)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 6528 (class 2606 OID 46232)
-- Name: consumable_model_translation consumable_model_translation_consumable_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_translation
    ADD CONSTRAINT consumable_model_translation_consumable_model_id_fkey FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE;


--
-- TOC entry 6515 (class 2606 OID 45948)
-- Name: consumable_movement_translation consumable_movement_translation_consumable_movement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement_translation
    ADD CONSTRAINT consumable_movement_translation_consumable_movement_id_fkey FOREIGN KEY (consumable_movement_id) REFERENCES public.consumable_movement(consumable_movement_id) ON DELETE CASCADE;


--
-- TOC entry 6525 (class 2606 OID 46169)
-- Name: consumable_translation consumable_translation_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_translation
    ADD CONSTRAINT consumable_translation_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON DELETE CASCADE;


--
-- TOC entry 6497 (class 2606 OID 45551)
-- Name: consumable_type_translation consumable_type_translation_consumable_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_translation
    ADD CONSTRAINT consumable_type_translation_consumable_type_id_fkey FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON DELETE CASCADE;


--
-- TOC entry 6408 (class 2606 OID 44627)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6409 (class 2606 OID 44632)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6532 (class 2606 OID 46316)
-- Name: external_maintenance_document_translation external_maintenance_document_external_maintenance_documen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document_translation
    ADD CONSTRAINT external_maintenance_document_external_maintenance_documen_fkey FOREIGN KEY (external_maintenance_document_id) REFERENCES public.external_maintenance_document(external_maintenance_document_id) ON DELETE CASCADE;


--
-- TOC entry 6508 (class 2606 OID 45793)
-- Name: external_maintenance_typical_step_translation external_maintenance_typical__external_maintenance_typical_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step_translation
    ADD CONSTRAINT external_maintenance_typical__external_maintenance_typical_fkey FOREIGN KEY (external_maintenance_typical_step_id) REFERENCES public.external_maintenance_typical_step(external_maintenance_typical_step_id) ON DELETE CASCADE;


--
-- TOC entry 6303 (class 2606 OID 44637)
-- Name: acceptance_report fk_acceptance_report_delivery_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT fk_acceptance_report_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6314 (class 2606 OID 44642)
-- Name: asset_destruction_certificate_asset fk_adca_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6315 (class 2606 OID 44647)
-- Name: asset_destruction_certificate_asset fk_adca_cert; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_cert FOREIGN KEY (asset_destruction_certificate_id) REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6316 (class 2606 OID 44652)
-- Name: asset_destruction_certificate_asset fk_adca_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6304 (class 2606 OID 44657)
-- Name: administrative_certificate fk_administ_ac_is_lin_receipt_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ac_is_lin_receipt_ FOREIGN KEY (receipt_report_id) REFERENCES public.receipt_report(receipt_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6305 (class 2606 OID 44662)
-- Name: administrative_certificate fk_administ_ad_is_bro_warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ad_is_bro_warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6306 (class 2606 OID 44667)
-- Name: administrative_certificate fk_administ_ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6317 (class 2606 OID 44672)
-- Name: asset_failed_external_maintenance fk_afem_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT fk_afem_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6318 (class 2606 OID 44677)
-- Name: asset_failed_external_maintenance fk_afem_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT fk_afem_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6328 (class 2606 OID 44682)
-- Name: asset_is_assigned_to_person fk_aiatp_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_aiatp_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6331 (class 2606 OID 44687)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6332 (class 2606 OID 44692)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6335 (class 2606 OID 44697)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6336 (class 2606 OID 44702)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6319 (class 2606 OID 44707)
-- Name: asset_incident_report fk_air_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6320 (class 2606 OID 44712)
-- Name: asset_incident_report fk_air_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6321 (class 2606 OID 44717)
-- Name: asset_incident_report fk_air_owner_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_owner_person FOREIGN KEY (owner_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6322 (class 2606 OID 44722)
-- Name: asset_incident_report fk_air_school_hq_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_school_hq_person FOREIGN KEY (school_headquarter_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6323 (class 2606 OID 44727)
-- Name: asset_incident_report_consumable fk_airc_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_consumable
    ADD CONSTRAINT fk_airc_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6324 (class 2606 OID 44732)
-- Name: asset_incident_report_consumable fk_airc_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_consumable
    ADD CONSTRAINT fk_airc_report FOREIGN KEY (asset_incident_report_id) REFERENCES public.asset_incident_report(asset_incident_report_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 6325 (class 2606 OID 44737)
-- Name: asset_incident_report_stock_item fk_airsi_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_stock_item
    ADD CONSTRAINT fk_airsi_report FOREIGN KEY (asset_incident_report_id) REFERENCES public.asset_incident_report(asset_incident_report_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 6326 (class 2606 OID 44742)
-- Name: asset_incident_report_stock_item fk_airsi_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_stock_item
    ADD CONSTRAINT fk_airsi_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6343 (class 2606 OID 44747)
-- Name: asset_model_default_consumable fk_amdc_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 6344 (class 2606 OID 44752)
-- Name: asset_model_default_consumable fk_amdc_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE;


--
-- TOC entry 6345 (class 2606 OID 44757)
-- Name: asset_model_default_stock_item fk_amdsi_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 6346 (class 2606 OID 44762)
-- Name: asset_model_default_stock_item fk_amdsi_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE;


--
-- TOC entry 6356 (class 2606 OID 44767)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6357 (class 2606 OID 44772)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 6358 (class 2606 OID 44777)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6359 (class 2606 OID 44782)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6360 (class 2606 OID 44787)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 6361 (class 2606 OID 44792)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6307 (class 2606 OID 44797)
-- Name: asset fk_asset_asset_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_destruction_certificate FOREIGN KEY (destruction_certificate_id) REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6308 (class 2606 OID 44802)
-- Name: asset fk_asset_asset_is__asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6309 (class 2606 OID 44807)
-- Name: asset fk_asset_asset_is__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6310 (class 2606 OID 44812)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6311 (class 2606 OID 44817)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6312 (class 2606 OID 44822)
-- Name: asset_condition_history fk_asset_co_asset_con_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_con_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6313 (class 2606 OID 44827)
-- Name: asset_condition_history fk_asset_co_asset_has_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_has_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6333 (class 2606 OID 44832)
-- Name: asset_is_composed_of_consumable_history fk_asset_cons_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_cons_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 6334 (class 2606 OID 44837)
-- Name: asset_is_composed_of_consumable_history fk_asset_is_asset_is__consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_is_asset_is__consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6329 (class 2606 OID 44842)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigned FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6330 (class 2606 OID 44847)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigner FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6337 (class 2606 OID 44852)
-- Name: asset_is_composed_of_stock_item_history fk_asset_is_asset_is__stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_is_asset_is__stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6341 (class 2606 OID 44857)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6339 (class 2606 OID 44862)
-- Name: asset_model fk_asset_mo_asset_mod_asset_br; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_br FOREIGN KEY (asset_brand_id) REFERENCES public.asset_brand(asset_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6342 (class 2606 OID 44867)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6347 (class 2606 OID 44872)
-- Name: asset_movement fk_asset_mo_asset_mov_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6348 (class 2606 OID 44877)
-- Name: asset_movement fk_asset_mo_asset_mov_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6349 (class 2606 OID 44882)
-- Name: asset_movement fk_asset_mo_asset_mov_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6350 (class 2606 OID 44887)
-- Name: asset_movement fk_asset_mo_asset_mov_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6351 (class 2606 OID 44892)
-- Name: asset_movement fk_asset_mo_asset_mov_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_maintena FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6340 (class 2606 OID 44897)
-- Name: asset_model fk_asset_mo_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6352 (class 2606 OID 46745)
-- Name: asset_movement fk_asset_movement_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_movement_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON DELETE SET NULL;


--
-- TOC entry 6338 (class 2606 OID 44902)
-- Name: asset_is_composed_of_stock_item_history fk_asset_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 6353 (class 2606 OID 44907)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6354 (class 2606 OID 44912)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6355 (class 2606 OID 44917)
-- Name: attribution_order fk_attribut_shipment__warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT fk_attribut_shipment__warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6369 (class 2606 OID 44922)
-- Name: authentication_log fk_authenti_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT fk_authenti_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6463 (class 2606 OID 44927)
-- Name: purchase_order fk_bon_de_c_bdc_is_ma_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT fk_bon_de_c_bdc_is_ma_supplier FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6370 (class 2606 OID 44932)
-- Name: backorder_report fk_bon_de_r_bdc_has_b_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT fk_bon_de_r_bdc_has_b_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6371 (class 2606 OID 44937)
-- Name: backorder_report_consumable_model_line fk_brcml_backorder_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_consumable_model_line
    ADD CONSTRAINT fk_brcml_backorder_report FOREIGN KEY (backorder_report_id) REFERENCES public.backorder_report(backorder_report_id) ON DELETE CASCADE;


--
-- TOC entry 6372 (class 2606 OID 44942)
-- Name: backorder_report_stock_item_model_line fk_brsiml_backorder_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_stock_item_model_line
    ADD CONSTRAINT fk_brsiml_backorder_report FOREIGN KEY (backorder_report_id) REFERENCES public.backorder_report(backorder_report_id) ON DELETE CASCADE;


--
-- TOC entry 6385 (class 2606 OID 44947)
-- Name: consumable_is_compatible_with_asset fk_c_is_com_c_is_comp_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_c_is_com_c_is_comp_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6387 (class 2606 OID 44952)
-- Name: consumable_is_compatible_with_stock_item fk_c_is_com_c_is_comp_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_c_is_com_c_is_comp_stock_it FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6377 (class 2606 OID 44957)
-- Name: consumable_attribute_value fk_cav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6378 (class 2606 OID 44962)
-- Name: consumable_attribute_value fk_cav_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6382 (class 2606 OID 44967)
-- Name: consumable_is_assigned_to_person fk_ciatp_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_ciatp_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6386 (class 2606 OID 44972)
-- Name: consumable_is_compatible_with_asset fk_cicwa_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_cicwa_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6388 (class 2606 OID 44977)
-- Name: consumable_is_compatible_with_stock_item fk_cicwsi_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_cicwsi_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6389 (class 2606 OID 44982)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6390 (class 2606 OID 44987)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6393 (class 2606 OID 44992)
-- Name: consumable_model fk_cm_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_brand FOREIGN KEY (consumable_brand_id) REFERENCES public.consumable_brand(consumable_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6399 (class 2606 OID 44997)
-- Name: consumable_movement fk_cm_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6400 (class 2606 OID 45002)
-- Name: consumable_movement fk_cm_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6394 (class 2606 OID 45007)
-- Name: consumable_model fk_cm_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6395 (class 2606 OID 45012)
-- Name: consumable_model_attribute_value fk_cmav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6396 (class 2606 OID 45017)
-- Name: consumable_model_attribute_value fk_cmav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6397 (class 2606 OID 45022)
-- Name: consumable_model_is_found_in_purchase_order fk_cmifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_cmifib_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6373 (class 2606 OID 45027)
-- Name: company_asset_request fk_company__ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT fk_company__ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6391 (class 2606 OID 45032)
-- Name: consumable_is_used_in_stock_item_history fk_cons_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_cons_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 6380 (class 2606 OID 45037)
-- Name: consumable_condition_history fk_consumab_associati_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT fk_consumab_associati_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6398 (class 2606 OID 45042)
-- Name: consumable_model_is_found_in_purchase_order fk_consumab_consumabl_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_consumab_consumabl_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6401 (class 2606 OID 45047)
-- Name: consumable_movement fk_consumab_consumabl_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6402 (class 2606 OID 45052)
-- Name: consumable_movement fk_consumab_consumabl_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6403 (class 2606 OID 45057)
-- Name: consumable_movement fk_consumab_consumabl_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6383 (class 2606 OID 45062)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6384 (class 2606 OID 45067)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6392 (class 2606 OID 45072)
-- Name: consumable_is_used_in_stock_item_history fk_consumab_consumabl_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_consumab_consumabl_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6374 (class 2606 OID 45077)
-- Name: consumable fk_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6404 (class 2606 OID 46755)
-- Name: consumable_movement fk_consumable_movement_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumable_movement_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON DELETE SET NULL;


--
-- TOC entry 6375 (class 2606 OID 47058)
-- Name: consumable fk_consumable_purchase_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6376 (class 2606 OID 45082)
-- Name: consumable fk_consumable_stock_item_consumable_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_stock_item_consumable_destruction_certificate FOREIGN KEY (stock_item_consumable_destruction_certificate_id) REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6405 (class 2606 OID 45087)
-- Name: consumable_type_attribute fk_cta_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6406 (class 2606 OID 45092)
-- Name: consumable_type_attribute fk_cta_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6407 (class 2606 OID 45097)
-- Name: delivery_note fk_delivery_note_purchase_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT fk_delivery_note_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6411 (class 2606 OID 45102)
-- Name: external_maintenance_document fk_emd_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT fk_emd_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6412 (class 2606 OID 45107)
-- Name: external_maintenance_step fk_ems_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_ems_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6413 (class 2606 OID 45112)
-- Name: external_maintenance_step fk_external_ems_is_a__external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_external_ems_is_a__external FOREIGN KEY (external_maintenance_typical_step_id) REFERENCES public.external_maintenance_typical_step(external_maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6410 (class 2606 OID 45117)
-- Name: external_maintenance fk_external_maintenan_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT fk_external_maintenan_maintena FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6414 (class 2606 OID 45122)
-- Name: invoice fk_invoice_delivery_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT fk_invoice_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6416 (class 2606 OID 45127)
-- Name: location_belongs_to_organizational_structure fk_location_bel_location_belo_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT fk_location_bel_location_belo_location FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6418 (class 2606 OID 45132)
-- Name: location_relation fk_location_relation_child_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_relation
    ADD CONSTRAINT fk_location_relation_child_location FOREIGN KEY (child_location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- TOC entry 6419 (class 2606 OID 45137)
-- Name: location_relation fk_location_relation_parent_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_relation
    ADD CONSTRAINT fk_location_relation_parent_location FOREIGN KEY (parent_location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- TOC entry 6427 (class 2606 OID 45142)
-- Name: maintenance_step fk_maintena_asset_con_asset_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_asset_con_asset_co FOREIGN KEY (asset_condition_history_id) REFERENCES public.asset_condition_history(asset_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6420 (class 2606 OID 45147)
-- Name: maintenance fk_maintena_asset_is__asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_asset_is__asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6428 (class 2606 OID 45152)
-- Name: maintenance_step fk_maintena_consumabl_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_consumabl_consumab FOREIGN KEY (consumable_condition_history_id) REFERENCES public.consumable_condition_history(consumable_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6425 (class 2606 OID 45157)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_maintena_maintenan_broken_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_maintena_maintenan_broken_i FOREIGN KEY (broken_item_report_id) REFERENCES public.broken_item_report(broken_item_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6421 (class 2606 OID 45162)
-- Name: maintenance fk_maintena_maintenan_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_maintenan_person FOREIGN KEY (performed_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6422 (class 2606 OID 45167)
-- Name: maintenance fk_maintena_person_as_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_person_as_person FOREIGN KEY (approved_by_maintenance_chief_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6429 (class 2606 OID 45172)
-- Name: maintenance_step fk_maintena_stock_ite_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_stock_ite_stock_it FOREIGN KEY (stock_item_condition_history_id) REFERENCES public.stock_item_condition_history(stock_item_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6426 (class 2606 OID 45177)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_milbir_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_milbir_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6430 (class 2606 OID 45182)
-- Name: maintenance_step fk_ms_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6431 (class 2606 OID 45187)
-- Name: maintenance_step fk_ms_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6432 (class 2606 OID 45192)
-- Name: maintenance_step fk_ms_typical_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_typical_step FOREIGN KEY (maintenance_typical_step_id) REFERENCES public.maintenance_typical_step(maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6443 (class 2606 OID 45197)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_child FOREIGN KEY (child_organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6444 (class 2606 OID 45202)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_parent FOREIGN KEY (parent_organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6442 (class 2606 OID 45207)
-- Name: organizational_structure fk_organizational_structure_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure
    ADD CONSTRAINT fk_organizational_structure_type FOREIGN KEY (structure_type_id) REFERENCES public.organizational_structure_type(organizational_structure_type_id);


--
-- TOC entry 6445 (class 2606 OID 45212)
-- Name: person_assignment fk_person_a_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6446 (class 2606 OID 45217)
-- Name: person_assignment fk_person_a_person_is_position; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_is_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6447 (class 2606 OID 45222)
-- Name: person_reports_problem_on_asset fk_person_r_person_re_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_person_r_person_re_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6455 (class 2606 OID 45227)
-- Name: person_reports_problem_on_consumable fk_person_r_person_re_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_person_r_person_re_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6457 (class 2606 OID 45232)
-- Name: person_reports_problem_on_stock_item fk_person_r_person_re_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_person_r_person_re_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6459 (class 2606 OID 45237)
-- Name: person_role_mapping fk_person_role_mapping_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6460 (class 2606 OID 45242)
-- Name: person_role_mapping fk_person_role_mapping_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_role FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6461 (class 2606 OID 45247)
-- Name: position_role_mapping fk_position_role_mapping_position; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_role_mapping
    ADD CONSTRAINT fk_position_role_mapping_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6462 (class 2606 OID 45252)
-- Name: position_role_mapping fk_position_role_mapping_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_role_mapping
    ADD CONSTRAINT fk_position_role_mapping_role FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6448 (class 2606 OID 45257)
-- Name: person_reports_problem_on_asset fk_prpoa_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_prpoa_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6456 (class 2606 OID 45262)
-- Name: person_reports_problem_on_consumable fk_prpoc_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_prpoc_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6458 (class 2606 OID 45267)
-- Name: person_reports_problem_on_stock_item fk_prposi_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_prposi_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6417 (class 2606 OID 45272)
-- Name: location_belongs_to_organizational_structure fk_room_bel_room_belo_organiza; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT fk_room_bel_room_belo_organiza FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6415 (class 2606 OID 45277)
-- Name: location fk_room_room_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT fk_room_room_type FOREIGN KEY (location_type_id) REFERENCES public.location_type(location_type_id);


--
-- TOC entry 6468 (class 2606 OID 45282)
-- Name: stock_item_attribute_value fk_siav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6469 (class 2606 OID 45287)
-- Name: stock_item_attribute_value fk_siav_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6470 (class 2606 OID 45292)
-- Name: stock_item_condition_history fk_sich_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_sich_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6472 (class 2606 OID 45297)
-- Name: stock_item_is_assigned_to_person fk_siiatp_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_siiatp_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6476 (class 2606 OID 45302)
-- Name: stock_item_is_compatible_with_asset fk_siicwa_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_siicwa_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6478 (class 2606 OID 45307)
-- Name: stock_item_model fk_sim_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_brand FOREIGN KEY (stock_item_brand_id) REFERENCES public.stock_item_brand(stock_item_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6484 (class 2606 OID 45312)
-- Name: stock_item_movement fk_sim_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6485 (class 2606 OID 45317)
-- Name: stock_item_movement fk_sim_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6479 (class 2606 OID 45322)
-- Name: stock_item_model fk_sim_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6480 (class 2606 OID 45327)
-- Name: stock_item_model_attribute_value fk_simav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6481 (class 2606 OID 45332)
-- Name: stock_item_model_attribute_value fk_simav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6482 (class 2606 OID 45337)
-- Name: stock_item_model_is_found_in_purchase_order fk_simifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_simifib_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6490 (class 2606 OID 45342)
-- Name: stock_item_type_attribute fk_sita_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6491 (class 2606 OID 45347)
-- Name: stock_item_type_attribute fk_sita_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6477 (class 2606 OID 45352)
-- Name: stock_item_is_compatible_with_asset fk_stock_it_stock_ite_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_stock_it_stock_ite_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6483 (class 2606 OID 45357)
-- Name: stock_item_model_is_found_in_purchase_order fk_stock_it_stock_ite_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_stock_it_stock_ite_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6486 (class 2606 OID 45362)
-- Name: stock_item_movement fk_stock_it_stock_ite_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6487 (class 2606 OID 45367)
-- Name: stock_item_movement fk_stock_it_stock_ite_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6488 (class 2606 OID 45372)
-- Name: stock_item_movement fk_stock_it_stock_ite_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6473 (class 2606 OID 45377)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6474 (class 2606 OID 45382)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6471 (class 2606 OID 45387)
-- Name: stock_item_condition_history fk_stock_it_stock_ite_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_stock_it_stock_ite_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6464 (class 2606 OID 45392)
-- Name: stock_item fk_stock_item_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6465 (class 2606 OID 45397)
-- Name: stock_item fk_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6489 (class 2606 OID 46750)
-- Name: stock_item_movement fk_stock_item_movement_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_item_movement_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON DELETE SET NULL;


--
-- TOC entry 6466 (class 2606 OID 47053)
-- Name: stock_item fk_stock_item_purchase_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6467 (class 2606 OID 45402)
-- Name: stock_item fk_stock_item_stock_item_consumable_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_stock_item_consumable_destruction_certificate FOREIGN KEY (stock_item_consumable_destruction_certificate_id) REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6492 (class 2606 OID 45407)
-- Name: user_account fk_user_acc_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6493 (class 2606 OID 45412)
-- Name: user_account fk_user_acc_modified_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_modified_by_user FOREIGN KEY (modified_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6494 (class 2606 OID 45417)
-- Name: user_account fk_user_acc_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6495 (class 2606 OID 45422)
-- Name: user_session fk_user_ses_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT fk_user_ses_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 6512 (class 2606 OID 45882)
-- Name: location_translation location_translation_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_translation
    ADD CONSTRAINT location_translation_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- TOC entry 6499 (class 2606 OID 45595)
-- Name: location_type_translation location_type_translation_location_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type_translation
    ADD CONSTRAINT location_type_translation_location_type_id_fkey FOREIGN KEY (location_type_id) REFERENCES public.location_type(location_type_id) ON DELETE CASCADE;


--
-- TOC entry 6423 (class 2606 OID 45427)
-- Name: maintenance maintenance_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 6434 (class 2606 OID 45432)
-- Name: maintenance_step_attribute_change maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 6533 (class 2606 OID 46337)
-- Name: maintenance_step_item_request_translation maintenance_step_item_request_maintenance_step_item_reques_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request_translation
    ADD CONSTRAINT maintenance_step_item_request_maintenance_step_item_reques_fkey FOREIGN KEY (maintenance_step_item_request_id) REFERENCES public.maintenance_step_item_request(maintenance_step_item_request_id) ON DELETE CASCADE;


--
-- TOC entry 6435 (class 2606 OID 45437)
-- Name: maintenance_step_item_request maintenance_step_item_request_rejected_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_rejected_by_person_fk FOREIGN KEY (rejected_by_person_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 6433 (class 2606 OID 47042)
-- Name: maintenance_step maintenance_step_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT maintenance_step_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.maintenance_step_status(id);


--
-- TOC entry 6538 (class 2606 OID 47037)
-- Name: maintenance_step_status_translation maintenance_step_status_transla_maintenance_step_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_status_translation
    ADD CONSTRAINT maintenance_step_status_transla_maintenance_step_status_id_fkey FOREIGN KEY (maintenance_step_status_id) REFERENCES public.maintenance_step_status(id) ON DELETE CASCADE;


--
-- TOC entry 6424 (class 2606 OID 45442)
-- Name: maintenance maintenance_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 6520 (class 2606 OID 46058)
-- Name: maintenance_translation maintenance_translation_maintenance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_translation
    ADD CONSTRAINT maintenance_translation_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON DELETE CASCADE;


--
-- TOC entry 6507 (class 2606 OID 45771)
-- Name: maintenance_typical_step_translation maintenance_typical_step_trans_maintenance_typical_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step_translation
    ADD CONSTRAINT maintenance_typical_step_trans_maintenance_typical_step_id_fkey FOREIGN KEY (maintenance_typical_step_id) REFERENCES public.maintenance_typical_step(maintenance_typical_step_id) ON DELETE CASCADE;


--
-- TOC entry 6436 (class 2606 OID 45447)
-- Name: maintenance_step_item_request msir_consumable_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_consumable_fk FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 6437 (class 2606 OID 45452)
-- Name: maintenance_step_item_request msir_destination_location_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_destination_location_fk FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 6438 (class 2606 OID 45457)
-- Name: maintenance_step_item_request msir_maintenance_step_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_maintenance_step_fk FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id);


--
-- TOC entry 6439 (class 2606 OID 45462)
-- Name: maintenance_step_item_request msir_requested_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_requested_by_person_fk FOREIGN KEY (requested_by_person_id) REFERENCES public.person(person_id);


--
-- TOC entry 6440 (class 2606 OID 45467)
-- Name: maintenance_step_item_request msir_source_location_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_source_location_fk FOREIGN KEY (source_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 6441 (class 2606 OID 45472)
-- Name: maintenance_step_item_request msir_stock_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_stock_item_fk FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 6513 (class 2606 OID 45904)
-- Name: organizational_structure_translation organizational_structure_trans_organizational_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_translation
    ADD CONSTRAINT organizational_structure_trans_organizational_structure_id_fkey FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON DELETE CASCADE;


--
-- TOC entry 6500 (class 2606 OID 45617)
-- Name: organizational_structure_type_translation organizational_structure_type_organizational_structure_typ_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_type_translation
    ADD CONSTRAINT organizational_structure_type_organizational_structure_typ_fkey FOREIGN KEY (organizational_structure_type_id) REFERENCES public.organizational_structure_type(organizational_structure_type_id) ON DELETE CASCADE;


--
-- TOC entry 6451 (class 2606 OID 45477)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_includ_destination_location_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_includ_destination_location_id_ FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 6449 (class 2606 OID 45482)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_con_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_con_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 6450 (class 2606 OID 45487)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consuma_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consuma_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 6452 (class 2606 OID 45492)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 6453 (class 2606 OID 45497)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_sto_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_sto_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 6454 (class 2606 OID 45502)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_i_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_i_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 6517 (class 2606 OID 45992)
-- Name: person_reports_problem_on_asset_translation person_reports_problem_on_asset_translation_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_translation
    ADD CONSTRAINT person_reports_problem_on_asset_translation_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 6518 (class 2606 OID 46014)
-- Name: person_reports_problem_on_consumable_translation person_reports_problem_on_consumable_translation_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable_translation
    ADD CONSTRAINT person_reports_problem_on_consumable_translation_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_consumable(report_id) ON DELETE CASCADE;


--
-- TOC entry 6519 (class 2606 OID 46036)
-- Name: person_reports_problem_on_stock_item_translation person_reports_problem_on_stock_item_translation_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item_translation
    ADD CONSTRAINT person_reports_problem_on_stock_item_translation_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_stock_item(report_id) ON DELETE CASCADE;


--
-- TOC entry 6509 (class 2606 OID 45816)
-- Name: person_translation person_translation_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_translation
    ADD CONSTRAINT person_translation_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON DELETE CASCADE;


--
-- TOC entry 6501 (class 2606 OID 45639)
-- Name: physical_condition_translation physical_condition_translation_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition_translation
    ADD CONSTRAINT physical_condition_translation_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON DELETE CASCADE;


--
-- TOC entry 6503 (class 2606 OID 45683)
-- Name: position_translation position_translation_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_translation
    ADD CONSTRAINT position_translation_position_id_fkey FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON DELETE CASCADE;


--
-- TOC entry 6502 (class 2606 OID 45661)
-- Name: role_translation role_translation_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_translation
    ADD CONSTRAINT role_translation_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON DELETE CASCADE;


--
-- TOC entry 6506 (class 2606 OID 45749)
-- Name: stock_item_attribute_definition_translation stock_item_attribute_definiti_stock_item_attribute_definit_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition_translation
    ADD CONSTRAINT stock_item_attribute_definiti_stock_item_attribute_definit_fkey FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON DELETE CASCADE;


--
-- TOC entry 6535 (class 2606 OID 46561)
-- Name: stock_item_brand_translation stock_item_brand_translation_stock_item_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand_translation
    ADD CONSTRAINT stock_item_brand_translation_stock_item_brand_id_fkey FOREIGN KEY (stock_item_brand_id) REFERENCES public.stock_item_brand(stock_item_brand_id) ON DELETE CASCADE;


--
-- TOC entry 6523 (class 2606 OID 46127)
-- Name: stock_item_condition_history_translation stock_item_condition_history__stock_item_condition_history_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history_translation
    ADD CONSTRAINT stock_item_condition_history__stock_item_condition_history_fkey FOREIGN KEY (stock_item_condition_history_id) REFERENCES public.stock_item_condition_history(stock_item_condition_history_id) ON DELETE CASCADE;


--
-- TOC entry 6545 (class 2606 OID 47601)
-- Name: stock_item_is_assigned_to_org_structure stock_item_is_assigned_to_org__organizational_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_org_structure
    ADD CONSTRAINT stock_item_is_assigned_to_org__organizational_structure_id_fkey FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON DELETE CASCADE;


--
-- TOC entry 6546 (class 2606 OID 47616)
-- Name: stock_item_is_assigned_to_org_structure stock_item_is_assigned_to_org_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_org_structure
    ADD CONSTRAINT stock_item_is_assigned_to_org_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 6547 (class 2606 OID 47611)
-- Name: stock_item_is_assigned_to_org_structure stock_item_is_assigned_to_org_struct_assigned_by_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_org_structure
    ADD CONSTRAINT stock_item_is_assigned_to_org_struct_assigned_by_person_id_fkey FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON DELETE CASCADE;


--
-- TOC entry 6548 (class 2606 OID 47606)
-- Name: stock_item_is_assigned_to_org_structure stock_item_is_assigned_to_org_structure_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_org_structure
    ADD CONSTRAINT stock_item_is_assigned_to_org_structure_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON DELETE CASCADE;


--
-- TOC entry 6475 (class 2606 OID 45507)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 6539 (class 2606 OID 47084)
-- Name: stock_item_model_default_consumable stock_item_model_default_consumable_consumable_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_default_consumable
    ADD CONSTRAINT stock_item_model_default_consumable_consumable_model_id_fkey FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE;


--
-- TOC entry 6540 (class 2606 OID 47079)
-- Name: stock_item_model_default_consumable stock_item_model_default_consumable_stock_item_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_default_consumable
    ADD CONSTRAINT stock_item_model_default_consumable_stock_item_model_id_fkey FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE;


--
-- TOC entry 6529 (class 2606 OID 46253)
-- Name: stock_item_model_translation stock_item_model_translation_stock_item_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_translation
    ADD CONSTRAINT stock_item_model_translation_stock_item_model_id_fkey FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE;


--
-- TOC entry 6516 (class 2606 OID 45970)
-- Name: stock_item_movement_translation stock_item_movement_translation_stock_item_movement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement_translation
    ADD CONSTRAINT stock_item_movement_translation_stock_item_movement_id_fkey FOREIGN KEY (stock_item_movement_id) REFERENCES public.stock_item_movement(stock_item_movement_id) ON DELETE CASCADE;


--
-- TOC entry 6526 (class 2606 OID 46190)
-- Name: stock_item_translation stock_item_translation_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_translation
    ADD CONSTRAINT stock_item_translation_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON DELETE CASCADE;


--
-- TOC entry 6498 (class 2606 OID 45573)
-- Name: stock_item_type_translation stock_item_type_translation_stock_item_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_translation
    ADD CONSTRAINT stock_item_type_translation_stock_item_type_id_fkey FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON DELETE CASCADE;


--
-- TOC entry 6510 (class 2606 OID 45838)
-- Name: supplier_translation supplier_translation_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_translation
    ADD CONSTRAINT supplier_translation_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id) ON DELETE CASCADE;


--
-- TOC entry 6511 (class 2606 OID 45860)
-- Name: warehouse_translation warehouse_translation_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_translation
    ADD CONSTRAINT warehouse_translation_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON DELETE CASCADE;


-- Completed on 2026-05-06 18:51:13

--
-- PostgreSQL database dump complete
--

\unrestrict txhQOXAFJKJBEHou4e9zNW5QmrYJEkqna1diaTnqoMAfQQBZWR9YzFmRtycCbXQ

