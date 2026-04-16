--
-- PostgreSQL database dump
--

\restrict 3Kg7QpELsJtA8iAIrt89uqxyXAogI7LTeFslOAv7l2XWiGruwVSBhExNKsATkwf

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-04-13 21:19:41

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
-- TOC entry 983 (class 1247 OID 38244)
-- Name: maintenance_domain; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenance_domain AS ENUM (
    'it',
    'network'
);


ALTER TYPE public.maintenance_domain OWNER TO postgres;

--
-- TOC entry 986 (class 1247 OID 38250)
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
-- TOC entry 219 (class 1259 OID 38257)
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
-- TOC entry 220 (class 1259 OID 38264)
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
-- TOC entry 6086 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN administrative_certificate.operation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.operation IS 'Action" can be "entry", "exit" or "transfer';


--
-- TOC entry 6087 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN administrative_certificate.format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.format IS 'Among the formats is "21x27"';


--
-- TOC entry 221 (class 1259 OID 38275)
-- Name: asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset (
    asset_id integer NOT NULL,
    asset_model_id integer NOT NULL,
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
-- TOC entry 222 (class 1259 OID 38280)
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
-- TOC entry 223 (class 1259 OID 38284)
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
-- TOC entry 224 (class 1259 OID 38291)
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
-- TOC entry 225 (class 1259 OID 38295)
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
-- TOC entry 226 (class 1259 OID 38303)
-- Name: asset_destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_destruction_certificate (
    asset_destruction_certificate_id integer CONSTRAINT asset_destruction_certifica_asset_destruction_certific_not_null NOT NULL,
    digital_copy text,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.asset_destruction_certificate OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 38309)
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
-- TOC entry 228 (class 1259 OID 38316)
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
-- TOC entry 6088 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_destruction_certificate_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_destruction_certificate_asset_id_seq OWNED BY public.asset_destruction_certificate_asset.id;


--
-- TOC entry 229 (class 1259 OID 38317)
-- Name: asset_failed_external_maintenance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_failed_external_maintenance (
    asset_id integer NOT NULL,
    external_maintenance_id integer CONSTRAINT asset_failed_external_maintena_external_maintenance_id_not_null NOT NULL,
    failed_datetime timestamp without time zone
);


ALTER TABLE public.asset_failed_external_maintenance OWNER TO postgres;

--
-- TOC entry 345 (class 1259 OID 40322)
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
-- TOC entry 344 (class 1259 OID 40321)
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
-- TOC entry 349 (class 1259 OID 40357)
-- Name: asset_incident_report_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_incident_report_consumable (
    id integer NOT NULL,
    asset_incident_report_id integer CONSTRAINT asset_incident_report_consuma_asset_incident_report_id_not_null NOT NULL,
    consumable_id integer NOT NULL
);


ALTER TABLE public.asset_incident_report_consumable OWNER TO postgres;

--
-- TOC entry 348 (class 1259 OID 40356)
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
-- TOC entry 347 (class 1259 OID 40348)
-- Name: asset_incident_report_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_incident_report_stock_item (
    id integer NOT NULL,
    asset_incident_report_id integer CONSTRAINT asset_incident_report_stock_i_asset_incident_report_id_not_null NOT NULL,
    stock_item_id integer NOT NULL
);


ALTER TABLE public.asset_incident_report_stock_item OWNER TO postgres;

--
-- TOC entry 346 (class 1259 OID 40347)
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
-- TOC entry 230 (class 1259 OID 38322)
-- Name: asset_is_assigned_to_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_is_assigned_to_person (
    person_id integer NOT NULL,
    asset_id integer NOT NULL,
    assigned_by_person_id integer NOT NULL,
    assignment_id integer NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    condition_on_assignment character varying(48) NOT NULL,
    is_active boolean NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.asset_is_assigned_to_person OWNER TO postgres;

--
-- TOC entry 6089 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE asset_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_is_assigned_to_person IS 'The first person is the one to whom the asset is assigned, a';


--
-- TOC entry 231 (class 1259 OID 38332)
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
-- TOC entry 232 (class 1259 OID 38338)
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
-- TOC entry 6090 (class 0 OID 0)
-- Dependencies: 232
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_consumable_history_id_seq OWNED BY public.asset_is_composed_of_consumable_history.id;


--
-- TOC entry 233 (class 1259 OID 38339)
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
-- TOC entry 234 (class 1259 OID 38345)
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
-- TOC entry 6091 (class 0 OID 0)
-- Dependencies: 234
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_stock_item_history_id_seq OWNED BY public.asset_is_composed_of_stock_item_history.id;


--
-- TOC entry 235 (class 1259 OID 38346)
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
    warranty_expiry_in_months integer
);


ALTER TABLE public.asset_model OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 38352)
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
-- TOC entry 237 (class 1259 OID 38359)
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
-- TOC entry 238 (class 1259 OID 38367)
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
-- TOC entry 6092 (class 0 OID 0)
-- Dependencies: 238
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_consumable_id_seq OWNED BY public.asset_model_default_consumable.id;


--
-- TOC entry 239 (class 1259 OID 38368)
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
-- TOC entry 240 (class 1259 OID 38376)
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
-- TOC entry 6093 (class 0 OID 0)
-- Dependencies: 240
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_stock_item_id_seq OWNED BY public.asset_model_default_stock_item.id;


--
-- TOC entry 241 (class 1259 OID 38377)
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
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL
);


ALTER TABLE public.asset_movement OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 38388)
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
-- TOC entry 243 (class 1259 OID 38394)
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
-- TOC entry 244 (class 1259 OID 38399)
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
-- TOC entry 245 (class 1259 OID 38404)
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
-- TOC entry 246 (class 1259 OID 38411)
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
-- TOC entry 6094 (class 0 OID 0)
-- Dependencies: 246
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_consumable_accessory_id_seq OWNED BY public.attribution_order_asset_consumable_accessory.id;


--
-- TOC entry 247 (class 1259 OID 38412)
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
-- TOC entry 248 (class 1259 OID 38419)
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
-- TOC entry 6095 (class 0 OID 0)
-- Dependencies: 248
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_stock_item_accessory_id_seq OWNED BY public.attribution_order_asset_stock_item_accessory.id;


--
-- TOC entry 249 (class 1259 OID 38420)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 38425)
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
-- TOC entry 251 (class 1259 OID 38426)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 38432)
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
-- TOC entry 253 (class 1259 OID 38433)
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
-- TOC entry 254 (class 1259 OID 38440)
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
-- TOC entry 255 (class 1259 OID 38441)
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
-- TOC entry 256 (class 1259 OID 38456)
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 38462)
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
-- TOC entry 258 (class 1259 OID 38463)
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
-- TOC entry 259 (class 1259 OID 38464)
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 38470)
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
-- TOC entry 261 (class 1259 OID 38471)
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
-- TOC entry 6096 (class 0 OID 0)
-- Dependencies: 261
-- Name: COLUMN authentication_log.event_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.event_type IS 'LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PWD_CHANGE, ACCOUNT_LOCK';


--
-- TOC entry 6097 (class 0 OID 0)
-- Dependencies: 261
-- Name: COLUMN authentication_log.failure_reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.failure_reason IS 'e.g., Invalid Password, User Disabled';


--
-- TOC entry 262 (class 1259 OID 38476)
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
-- TOC entry 6098 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE backorder_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.backorder_report IS 'Renamed from bon_de_reste';


--
-- TOC entry 263 (class 1259 OID 38483)
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
-- TOC entry 264 (class 1259 OID 38491)
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
-- TOC entry 265 (class 1259 OID 38499)
-- Name: broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broken_item_report (
    broken_item_report_id integer NOT NULL,
    digital_copy bytea
);


ALTER TABLE public.broken_item_report OWNER TO postgres;

--
-- TOC entry 6099 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE broken_item_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.broken_item_report IS 'Equivalent of C5';


--
-- TOC entry 266 (class 1259 OID 38505)
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
-- TOC entry 6100 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE company_asset_request; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.company_asset_request IS 'Demande du mat�riel';


--
-- TOC entry 267 (class 1259 OID 38512)
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
    consumable_name_in_administrative_certificate character varying(48),
    consumable_arrival_datetime timestamp without time zone,
    consumable_status character varying(30)
);


ALTER TABLE public.consumable OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 38517)
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
-- TOC entry 269 (class 1259 OID 38521)
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
-- TOC entry 270 (class 1259 OID 38528)
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
-- TOC entry 271 (class 1259 OID 38532)
-- Name: consumable_condition_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_condition_history (
    consumable_condition_history_id integer CONSTRAINT consumable_condition_histor_consumable_condition_histo_not_null NOT NULL,
    consumable_id integer NOT NULL,
    notes character varying(256),
    cosmetic_issues character varying(128),
    functional_issues character varying(128),
    recommendation character varying(24),
    created_at timestamp without time zone
);


ALTER TABLE public.consumable_condition_history OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 38539)
-- Name: consumable_is_assigned_to_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_assigned_to_person (
    assignment_id integer NOT NULL,
    consumable_id integer NOT NULL,
    person_id integer NOT NULL,
    assigned_by_person_id integer NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    condition_on_assignment character varying(48) CONSTRAINT consumable_is_assigned_to_pers_condition_on_assignment_not_null NOT NULL,
    is_active boolean NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.consumable_is_assigned_to_person OWNER TO postgres;

--
-- TOC entry 6101 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE consumable_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_is_assigned_to_person IS 'The first person is the one to whom the consumable is assign';


--
-- TOC entry 273 (class 1259 OID 38549)
-- Name: consumable_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_asset (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_a_consumable_model_id_not_null NOT NULL,
    asset_model_id integer CONSTRAINT c_is_compatible_with_a_asset_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 38554)
-- Name: consumable_is_compatible_with_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_stock_item (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_si_consumable_model_id_not_null NOT NULL,
    stock_item_model_id integer CONSTRAINT c_is_compatible_with_si_stock_item_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_stock_item OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 38559)
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
-- TOC entry 276 (class 1259 OID 38565)
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
-- TOC entry 6102 (class 0 OID 0)
-- Dependencies: 276
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_is_used_in_stock_item_history_id_seq OWNED BY public.consumable_is_used_in_stock_item_history.id;


--
-- TOC entry 277 (class 1259 OID 38566)
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
    warranty_expiry_in_months integer
);


ALTER TABLE public.consumable_model OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 38572)
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
-- TOC entry 279 (class 1259 OID 38579)
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
-- TOC entry 6103 (class 0 OID 0)
-- Dependencies: 279
-- Name: TABLE consumable_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_model_is_found_in_purchase_order IS 'Renamed from consumable_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 280 (class 1259 OID 38584)
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
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL
);


ALTER TABLE public.consumable_movement OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 38595)
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
-- TOC entry 282 (class 1259 OID 38601)
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
-- TOC entry 283 (class 1259 OID 38606)
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
-- TOC entry 6104 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE delivery_note; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.delivery_note IS 'Renamed from bon_de_livraison';


--
-- TOC entry 284 (class 1259 OID 38613)
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
-- TOC entry 285 (class 1259 OID 38625)
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
-- TOC entry 286 (class 1259 OID 38626)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 38632)
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
-- TOC entry 288 (class 1259 OID 38633)
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
-- TOC entry 289 (class 1259 OID 38642)
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
-- TOC entry 290 (class 1259 OID 38643)
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 38651)
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
-- TOC entry 292 (class 1259 OID 38657)
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
-- TOC entry 293 (class 1259 OID 38664)
-- Name: external_maintenance_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_provider (
    external_maintenance_provider_id integer CONSTRAINT external_maintenance_provid_external_maintenance_provi_not_null NOT NULL,
    external_maintenance_provider_name character varying(48),
    external_maintenance_provider_location character varying(128)
);


ALTER TABLE public.external_maintenance_provider OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 38668)
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
-- TOC entry 295 (class 1259 OID 38674)
-- Name: external_maintenance_typical_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_typical_step (
    external_maintenance_typical_step_id integer CONSTRAINT external_maintenance_typica_external_maintenance_typic_not_null NOT NULL,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    maintenance_type character(8),
    description character varying(256),
    maintenance_domain public.maintenance_domain NOT NULL
);


ALTER TABLE public.external_maintenance_typical_step OWNER TO postgres;

--
-- TOC entry 6105 (class 0 OID 0)
-- Dependencies: 295
-- Name: COLUMN external_maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 296 (class 1259 OID 38679)
-- Name: invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice (
    invoice_id integer CONSTRAINT facture_facture_id_not_null NOT NULL,
    delivery_note_id integer CONSTRAINT facture_delivery_note_id_not_null NOT NULL,
    digital_copy text
);


ALTER TABLE public.invoice OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 38686)
-- Name: location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location (
    location_id integer CONSTRAINT room_room_id_not_null NOT NULL,
    location_name character varying(30),
    location_type_id integer
);


ALTER TABLE public.location OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 38690)
-- Name: location_belongs_to_organizational_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_belongs_to_organizational_structure (
    organizational_structure_id integer CONSTRAINT room_belongs_to_organizatio_organizational_structure_i_not_null NOT NULL,
    location_id integer CONSTRAINT room_belongs_to_organizational_structure_room_id_not_null NOT NULL
);


ALTER TABLE public.location_belongs_to_organizational_structure OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 38695)
-- Name: location_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_type (
    location_type_id integer CONSTRAINT room_type_room_type_id_not_null NOT NULL,
    location_type_label character varying(60) CONSTRAINT room_type_room_type_label_not_null NOT NULL,
    location_type_code character varying(18) CONSTRAINT room_type_room_type_code_not_null NOT NULL
);


ALTER TABLE public.location_type OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 38701)
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
-- TOC entry 6106 (class 0 OID 0)
-- Dependencies: 300
-- Name: location_type_location_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_type_location_type_id_seq OWNED BY public.location_type.location_type_id;


--
-- TOC entry 301 (class 1259 OID 38702)
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
    maintenance_status character varying(20)
);


ALTER TABLE public.maintenance OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 38710)
-- Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_inspection_leads_to_broken_item_report (
    maintenance_id integer CONSTRAINT maintenance_inspection_leads_to_broken__maintenance_id_not_null NOT NULL,
    broken_item_report_id integer CONSTRAINT maintenance_inspection_leads_to__broken_item_report_id_not_null NOT NULL
);


ALTER TABLE public.maintenance_inspection_leads_to_broken_item_report OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 38715)
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
    maintenance_step_status character varying(60)
);


ALTER TABLE public.maintenance_step OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 38722)
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
-- TOC entry 305 (class 1259 OID 38732)
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
-- TOC entry 306 (class 1259 OID 38733)
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
-- TOC entry 307 (class 1259 OID 38742)
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
-- TOC entry 6107 (class 0 OID 0)
-- Dependencies: 307
-- Name: COLUMN maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 308 (class 1259 OID 38750)
-- Name: organizational_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure (
    organizational_structure_id integer NOT NULL,
    structure_code character varying(50),
    structure_name character varying(255),
    structure_type character varying(30),
    is_active boolean
);


ALTER TABLE public.organizational_structure OWNER TO postgres;

--
-- TOC entry 309 (class 1259 OID 38754)
-- Name: organizational_structure_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure_relation (
    child_organizational_structure_id integer CONSTRAINT organizational_structure_re_organizational_structure_i_not_null NOT NULL,
    parent_organizational_structure_id integer CONSTRAINT organizational_structure_re_parent_organizational_stru_not_null NOT NULL,
    relation_id integer
);


ALTER TABLE public.organizational_structure_relation OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 38759)
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
-- TOC entry 311 (class 1259 OID 38768)
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
-- TOC entry 6108 (class 0 OID 0)
-- Dependencies: 311
-- Name: COLUMN person_assignment.employment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_assignment.employment_type IS 'Permanent, contractual...';


--
-- TOC entry 312 (class 1259 OID 38774)
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
-- TOC entry 313 (class 1259 OID 38782)
-- Name: person_reports_problem_on_asset_included_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_consumable (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_co_report_id_not_null1 NOT NULL,
    consumable_id integer CONSTRAINT person_reports_problem_on_asset_included_consumable_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_consumabl_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_consumable OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 38788)
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
-- TOC entry 6109 (class 0 OID 0)
-- Dependencies: 314
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_consumable_id_seq OWNED BY public.person_reports_problem_on_asset_included_consumable.id;


--
-- TOC entry 315 (class 1259 OID 38789)
-- Name: person_reports_problem_on_asset_included_context; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_context (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_con_report_id_not_null NOT NULL,
    destination_location_id integer CONSTRAINT person_reports_problem_on_asset_in_destination_room_id_not_null NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_context OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 38794)
-- Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_stock_item (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_sto_report_id_not_null NOT NULL,
    stock_item_id integer CONSTRAINT person_reports_problem_on_asset_included_stock_item_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_stock_ite_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_stock_item OWNER TO postgres;

--
-- TOC entry 317 (class 1259 OID 38800)
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
-- TOC entry 6110 (class 0 OID 0)
-- Dependencies: 317
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_stock_item_id_seq OWNED BY public.person_reports_problem_on_asset_included_stock_item.id;


--
-- TOC entry 318 (class 1259 OID 38801)
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
-- TOC entry 319 (class 1259 OID 38809)
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
-- TOC entry 320 (class 1259 OID 38817)
-- Name: person_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_role_mapping (
    role_id integer NOT NULL,
    person_id integer NOT NULL
);


ALTER TABLE public.person_role_mapping OWNER TO postgres;

--
-- TOC entry 6111 (class 0 OID 0)
-- Dependencies: 320
-- Name: COLUMN person_role_mapping.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_role_mapping.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 321 (class 1259 OID 38822)
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
-- TOC entry 322 (class 1259 OID 38826)
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
-- TOC entry 350 (class 1259 OID 40433)
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
-- TOC entry 323 (class 1259 OID 38830)
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
-- TOC entry 6112 (class 0 OID 0)
-- Dependencies: 323
-- Name: TABLE purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.purchase_order IS 'Renamed from bon_de_commande';


--
-- TOC entry 324 (class 1259 OID 38837)
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
-- TOC entry 6113 (class 0 OID 0)
-- Dependencies: 324
-- Name: TABLE receipt_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receipt_report IS 'This represents the "PV de réception" for the assets';


--
-- TOC entry 325 (class 1259 OID 38843)
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
-- TOC entry 6114 (class 0 OID 0)
-- Dependencies: 325
-- Name: TABLE role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.role IS 'Role is what the person can do in the system';


--
-- TOC entry 6115 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN role.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 326 (class 1259 OID 38847)
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
    stock_item_name_in_administrative_certificate character varying(48),
    stock_item_arrival_datetime timestamp without time zone,
    stock_item_status character varying(30)
);


ALTER TABLE public.stock_item OWNER TO postgres;

--
-- TOC entry 327 (class 1259 OID 38852)
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
-- TOC entry 328 (class 1259 OID 38856)
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
-- TOC entry 329 (class 1259 OID 38863)
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
-- TOC entry 330 (class 1259 OID 38867)
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
-- TOC entry 331 (class 1259 OID 38875)
-- Name: stock_item_consumable_destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_consumable_destruction_certificate (
    destruction_certificate_id integer CONSTRAINT destruction_certificate_destruction_certificate_id_not_null NOT NULL,
    digital_copy text,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.stock_item_consumable_destruction_certificate OWNER TO postgres;

--
-- TOC entry 332 (class 1259 OID 38881)
-- Name: stock_item_is_assigned_to_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_assigned_to_person (
    stock_item_id integer NOT NULL,
    person_id integer NOT NULL,
    assigned_by_person_id integer NOT NULL,
    assignment_id integer NOT NULL,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    condition_on_assignment character varying(48) CONSTRAINT stock_item_is_assigned_to_pers_condition_on_assignment_not_null NOT NULL,
    is_active boolean NOT NULL,
    is_confirmed_by_exploitation_chief_id integer
);


ALTER TABLE public.stock_item_is_assigned_to_person OWNER TO postgres;

--
-- TOC entry 6116 (class 0 OID 0)
-- Dependencies: 332
-- Name: TABLE stock_item_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_is_assigned_to_person IS 'The first person is the one to whom the stock item is assign';


--
-- TOC entry 333 (class 1259 OID 38891)
-- Name: stock_item_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_compatible_with_asset (
    stock_item_model_id integer CONSTRAINT stock_item_is_compatible_with_asse_stock_item_model_id_not_null NOT NULL,
    asset_model_id integer NOT NULL
);


ALTER TABLE public.stock_item_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 334 (class 1259 OID 38896)
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
    warranty_expiry_in_months integer
);


ALTER TABLE public.stock_item_model OWNER TO postgres;

--
-- TOC entry 335 (class 1259 OID 38902)
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
-- TOC entry 336 (class 1259 OID 38909)
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
-- TOC entry 6117 (class 0 OID 0)
-- Dependencies: 336
-- Name: TABLE stock_item_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_model_is_found_in_purchase_order IS 'Renamed from stock_item_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 337 (class 1259 OID 38914)
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
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL
);


ALTER TABLE public.stock_item_movement OWNER TO postgres;

--
-- TOC entry 338 (class 1259 OID 38925)
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
-- TOC entry 339 (class 1259 OID 38931)
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
-- TOC entry 340 (class 1259 OID 38936)
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
-- TOC entry 341 (class 1259 OID 38940)
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
    modified_at_datetime timestamp without time zone NOT NULL
);


ALTER TABLE public.user_account OWNER TO postgres;

--
-- TOC entry 342 (class 1259 OID 38956)
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
-- TOC entry 343 (class 1259 OID 38964)
-- Name: warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse (
    warehouse_id integer NOT NULL,
    warehouse_name character varying(60),
    warehouse_address character varying(128)
);


ALTER TABLE public.warehouse OWNER TO postgres;

--
-- TOC entry 6118 (class 0 OID 0)
-- Dependencies: 343
-- Name: TABLE warehouse; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.warehouse IS 'Warehouse" is in our case "ERI/2RM';


--
-- TOC entry 5314 (class 2604 OID 38968)
-- Name: asset_destruction_certificate_asset id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset ALTER COLUMN id SET DEFAULT nextval('public.asset_destruction_certificate_asset_id_seq'::regclass);


--
-- TOC entry 5315 (class 2604 OID 38969)
-- Name: asset_is_composed_of_consumable_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_consumable_history_id_seq'::regclass);


--
-- TOC entry 5316 (class 2604 OID 38970)
-- Name: asset_is_composed_of_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5317 (class 2604 OID 38971)
-- Name: asset_model_default_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_consumable_id_seq'::regclass);


--
-- TOC entry 5319 (class 2604 OID 38972)
-- Name: asset_model_default_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_stock_item_id_seq'::regclass);


--
-- TOC entry 5322 (class 2604 OID 38973)
-- Name: attribution_order_asset_consumable_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_consumable_accessory_id_seq'::regclass);


--
-- TOC entry 5323 (class 2604 OID 38974)
-- Name: attribution_order_asset_stock_item_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_stock_item_accessory_id_seq'::regclass);


--
-- TOC entry 5324 (class 2604 OID 38975)
-- Name: consumable_is_used_in_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.consumable_is_used_in_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5327 (class 2604 OID 38976)
-- Name: location_type location_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type ALTER COLUMN location_type_id SET DEFAULT nextval('public.location_type_location_type_id_seq'::regclass);


--
-- TOC entry 5329 (class 2604 OID 38977)
-- Name: person_reports_problem_on_asset_included_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_consumable_id_seq'::regclass);


--
-- TOC entry 5330 (class 2604 OID 38978)
-- Name: person_reports_problem_on_asset_included_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_stock_item_id_seq'::regclass);


--
-- TOC entry 5949 (class 0 OID 38257)
-- Dependencies: 219
-- Data for Name: acceptance_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acceptance_report (acceptance_report_id, delivery_note_id, acceptance_report_datetime, is_signed_by_director_of_administration_and_support, is_signed_by_protection_and_security_bureau_chief, is_signed_by_information_technilogy_bureau_chief, acceptance_report_is_stock_item_and_consumable_responsible, is_signed_by_school_headquarter, digital_copy) FROM stdin;
1	1	2026-03-07 00:03:30.187286	t	t	f	f	f	acceptance_reports\\delivery_note_1\\acceptance_report_1.pdf
2	3	2026-03-11 21:34:39.16781	t	t	t	t	t	acceptance_reports\\delivery_note_3\\acceptance_report_2.pdf
3	4	2026-03-11 22:19:43.817655	t	t	t	t	t	acceptance_reports\\delivery_note_4\\acceptance_report_3.pdf
4	5	2026-03-11 22:39:53.341002	t	t	t	t	t	acceptance_reports\\delivery_note_5\\acceptance_report_4.pdf
\.


--
-- TOC entry 5950 (class 0 OID 38264)
-- Dependencies: 220
-- Data for Name: administrative_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_certificate (administrative_certificate_id, warehouse_id, attribution_order_id, receipt_report_id, interested_organization, operation, format, is_signed_by_warehouse_storage_magaziner, is_signed_by_warehouse_storage_accountant, is_signed_by_warehouse_storage_marketer, is_signed_by_warehouse_it_chief, is_signed_by_warehouse_leader, digital_copy, are_items_moved) FROM stdin;
\.


--
-- TOC entry 5951 (class 0 OID 38275)
-- Dependencies: 221
-- Data for Name: asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset (asset_id, asset_model_id, attribution_order_id, destruction_certificate_id, asset_serial_number, asset_fabrication_datetime, asset_inventory_number, asset_service_tag, asset_name, asset_name_in_the_administrative_certificate, asset_arrival_datetime, asset_status) FROM stdin;
2	1	\N	\N	7777	\N	\N	\N	\N	\N	\N	\N
1	1	\N	\N	1234	\N	\N	\N	\N	\N	\N	lost
3	1	\N	\N	TEST-ASSET-1775207486	\N	207486	ASVC1775207486	TEST_ASSET_207486	\N	\N	lost
\.


--
-- TOC entry 5952 (class 0 OID 38280)
-- Dependencies: 222
-- Data for Name: asset_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_definition (asset_attribute_definition_id, data_type, unit, description, maintenance_domain) FROM stdin;
2	number	mAh	Battery Capacity	\N
3	string	\N	Disk Type	\N
1	number	Inch	Screen Resolution	network
4	number	mm	Dimension X	\N
\.


--
-- TOC entry 5953 (class 0 OID 38284)
-- Dependencies: 223
-- Data for Name: asset_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_value (asset_attribute_definition_id, asset_id, value_string, value_bool, value_date, value_number) FROM stdin;
\.


--
-- TOC entry 5954 (class 0 OID 38291)
-- Dependencies: 224
-- Data for Name: asset_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_brand (asset_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	Acer	ACER	t	\N
2	Fujitsu	FUJITSU	t	\N
3	Condor	CONDOR	t	\N
4	WADOO	WADOO	t	\N
5	DTSIG	DTSIG	t	\N
6	HP	HP	t	\N
7	OKI	OKI	t	\N
8	Epson	EPSON	t	\N
9	Panasonic	PANASONIC	t	\N
10	DELL	DELL	t	\N
11	Kyocera	KYOCERA	t	\N
12	XEROX	XEROX	t	\N
13	EATON	EATON	t	\N
14	Mac-Tech	MACTECH	t	\N
15	CANON	CANON	t	\N
16	TALLY	TALLY	t	\N
17	RICOH	RICOH	t	\N
18	Siemens	SIEMENS	t	\N
19	DTSCC	DTSCC	t	\N
\.


--
-- TOC entry 5955 (class 0 OID 38295)
-- Dependencies: 225
-- Data for Name: asset_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_condition_history (asset_condition_history_id, asset_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 5956 (class 0 OID 38303)
-- Dependencies: 226
-- Data for Name: asset_destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_destruction_certificate (asset_destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
1	destruction_certificates\\destruction_certificate_1.pdf	2026-03-07 19:35:07.915855
2	destruction_certificates\\destruction_certificate_2.pdf	2026-03-07 20:37:18.994153
3	\N	2026-03-19 09:32:17.499078
\.


--
-- TOC entry 5957 (class 0 OID 38309)
-- Dependencies: 227
-- Data for Name: asset_destruction_certificate_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_destruction_certificate_asset (id, asset_destruction_certificate_id, asset_id, external_maintenance_id) FROM stdin;
\.


--
-- TOC entry 5959 (class 0 OID 38317)
-- Dependencies: 229
-- Data for Name: asset_failed_external_maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_failed_external_maintenance (asset_id, external_maintenance_id, failed_datetime) FROM stdin;
\.


--
-- TOC entry 6075 (class 0 OID 40322)
-- Dependencies: 345
-- Data for Name: asset_incident_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_incident_report (asset_incident_report_id, asset_id, owner_person_id, school_headquarter_person_id, reason, owner_note, digital_copy, is_signed_by_owner, is_signed_by_it_bureau_chief, is_signed_by_exploitation_chief, is_signed_by_protection_and_security_bureau_chief, is_signed_by_school_headquarter, it_bureau_chief_note, exploitation_chief_note, protection_and_security_bureau_chief_note, school_headquarter_note, report_datetime, status, maintenance_id) FROM stdin;
1	1	10	\N	stolen	dddddd	\N	f	t	t	f	f	ccccccccccccccc	dddddd	\N	\N	2026-04-02 13:19:41.966875	submitted	\N
2	1	10	\N	stolen		\N	f	f	t	f	f	\N		\N	\N	2026-04-03 07:30:23.136921	submitted	\N
3	2	1009	\N	lost	Incident Test	\N	f	f	t	f	f	\N	Incident Test	\N	\N	2026-04-03 07:55:48.302238	submitted	\N
4	1	10	\N	irrecoverably_damaged	Incident Test	\N	f	f	t	f	f	\N	Incident Test	\N	\N	2026-04-03 08:07:45.852384	submitted	\N
5	1	10	\N	irrecoverably_damaged	Incident Test	\N	f	f	t	f	f	\N	Incident Test	\N	\N	2026-04-03 08:10:14.687526	submitted	\N
6	1	10	\N	irrecoverably_damaged	Incident Test	\N	f	f	t	f	f	\N	Incident Test	\N	\N	2026-04-03 08:11:14.19535	submitted	\N
7	1	10	\N	lost	Let exploitation chief decide per item	\N	f	f	t	f	f	\N	Let exploitation chief decide per item	\N	\N	2026-04-03 09:09:01.893008	submitted	\N
8	3	10	\N	irrecoverably_damaged	test	\N	f	f	t	f	f	\N	test	\N	\N	2026-04-03 09:12:30.727609	submitted	\N
9	3	9	\N	lost	bbbbbbbbbbbbb	\N	t	f	t	f	f	\N	tgtgtgtgtgt	\N	\N	2026-04-03 09:24:05.850394	submitted	\N
\.


--
-- TOC entry 6079 (class 0 OID 40357)
-- Dependencies: 349
-- Data for Name: asset_incident_report_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_incident_report_consumable (id, asset_incident_report_id, consumable_id) FROM stdin;
1	8	57
2	9	57
\.


--
-- TOC entry 6077 (class 0 OID 40348)
-- Dependencies: 347
-- Data for Name: asset_incident_report_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_incident_report_stock_item (id, asset_incident_report_id, stock_item_id) FROM stdin;
1	8	9
2	9	9
\.


--
-- TOC entry 5960 (class 0 OID 38322)
-- Dependencies: 230
-- Data for Name: asset_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_assigned_to_person (person_id, asset_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
9	3	10	1	2026-04-03 09:23:00	\N	Needs Repair	t	10
\.


--
-- TOC entry 5961 (class 0 OID 38332)
-- Dependencies: 231
-- Data for Name: asset_is_composed_of_consumable_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_composed_of_consumable_history (consumable_id, asset_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
56	2	\N	\N	\N	1	\N
57	3	\N	2026-04-03 09:11:26.368374	\N	2	\N
\.


--
-- TOC entry 5963 (class 0 OID 38339)
-- Dependencies: 233
-- Data for Name: asset_is_composed_of_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_composed_of_stock_item_history (stock_item_id, asset_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
9	3	\N	2026-04-03 09:11:26.365471	\N	1	\N
\.


--
-- TOC entry 5965 (class 0 OID 38346)
-- Dependencies: 235
-- Data for Name: asset_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model (asset_model_id, asset_brand_id, asset_type_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	10	1	Latitude 5531	L5531	2022	\N	t		24
2	1	1	TravelMate P-253-M	P253M	\N	\N	t	\N	60
3	3	1	P401	P401	\N	\N	t	\N	\N
4	3	1	SENSBook SI LCL-503	LCL503	\N	\N	t	\N	\N
5	3	1	WM15-CCLPRO	WM15CCLPRO	\N	\N	t	\N	\N
6	5	1	LC001	LC001	\N	\N	t	\N	\N
7	19	1	LC002	LC002	\N	\N	t	\N	\N
\.


--
-- TOC entry 5966 (class 0 OID 38352)
-- Dependencies: 236
-- Data for Name: asset_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_attribute_value (asset_model_id, asset_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	2	f	\N	90000.000000	\N
1	3	f	SSD NVMe	\N	\N
\.


--
-- TOC entry 5967 (class 0 OID 38359)
-- Dependencies: 237
-- Data for Name: asset_model_default_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_consumable (id, asset_model_id, consumable_model_id, quantity, notes) FROM stdin;
1	1	1	1	\N
3	1	2	2	
\.


--
-- TOC entry 5969 (class 0 OID 38368)
-- Dependencies: 239
-- Data for Name: asset_model_default_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_stock_item (id, asset_model_id, stock_item_model_id, quantity, notes) FROM stdin;
1	1	1	4	
\.


--
-- TOC entry 5971 (class 0 OID 38377)
-- Dependencies: 241
-- Data for Name: asset_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_movement (asset_movement_id, asset_id, source_location_id, destination_location_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status) FROM stdin;
1	3	24	24	\N	\N	maintenance_create_1	2026-04-07 10:11:39.007186	accepted
2	3	24	24	\N	\N	maintenance_create_2	2026-04-07 19:45:57.021274	pending
\.


--
-- TOC entry 5972 (class 0 OID 38388)
-- Dependencies: 242
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
\.


--
-- TOC entry 5973 (class 0 OID 38394)
-- Dependencies: 243
-- Data for Name: asset_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type_attribute (asset_attribute_definition_id, asset_type_id, is_mandatory, default_value) FROM stdin;
1	1	t	15.6
2	1	t	\N
\.


--
-- TOC entry 5974 (class 0 OID 38399)
-- Dependencies: 244
-- Data for Name: attribution_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order (attribution_order_id, warehouse_id, attribution_order_full_code, attribution_order_date, is_signed_by_central_chief, attribution_order_barcode) FROM stdin;
\.


--
-- TOC entry 5975 (class 0 OID 38404)
-- Dependencies: 245
-- Data for Name: attribution_order_asset_consumable_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_consumable_accessory (id, attribution_order_id, asset_id, consumable_id) FROM stdin;
\.


--
-- TOC entry 5977 (class 0 OID 38412)
-- Dependencies: 247
-- Data for Name: attribution_order_asset_stock_item_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_stock_item_accessory (id, attribution_order_id, asset_id, stock_item_id) FROM stdin;
\.


--
-- TOC entry 5979 (class 0 OID 38420)
-- Dependencies: 249
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- TOC entry 5981 (class 0 OID 38426)
-- Dependencies: 251
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5983 (class 0 OID 38433)
-- Dependencies: 253
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
\.


--
-- TOC entry 5985 (class 0 OID 38441)
-- Dependencies: 255
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$1200000$ceTbB0O5bCmm57swQmkEmg$/LZsB44AZf4ZGvXPW6p/4orTP53jVw3AJ38DC/OLrXE=	2026-02-10 05:11:34.116607-08	t	admin			admin@example.com	t	t	2026-02-09 12:42:30.666222-08
\.


--
-- TOC entry 5986 (class 0 OID 38456)
-- Dependencies: 256
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- TOC entry 5989 (class 0 OID 38464)
-- Dependencies: 259
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5991 (class 0 OID 38471)
-- Dependencies: 261
-- Data for Name: authentication_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_log (log_id, user_id, attempted_username, event_type, ip_address, event_timestamp, failure_reason) FROM stdin;
\.


--
-- TOC entry 5992 (class 0 OID 38476)
-- Dependencies: 262
-- Data for Name: backorder_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report (backorder_report_id, purchase_order_id, backorder_report_date, digital_copy) FROM stdin;
1	3	2026-03-06	\N
2	3	2026-03-06	\N
3	3	2026-03-06	\N
4	3	2026-03-06	\N
5	3	2026-03-06	\N
6	3	2026-03-06	\N
7	3	2026-03-06	\N
8	3	2026-03-06	\N
9	3	2026-03-06	\N
10	3	2026-03-06	\N
\.


--
-- TOC entry 5993 (class 0 OID 38483)
-- Dependencies: 263
-- Data for Name: backorder_report_consumable_model_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report_consumable_model_line (backorder_report_id, consumable_model_id, quantity_ordered, quantity_received, quantity_remaining) FROM stdin;
\.


--
-- TOC entry 5994 (class 0 OID 38491)
-- Dependencies: 264
-- Data for Name: backorder_report_stock_item_model_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report_stock_item_model_line (backorder_report_id, stock_item_model_id, quantity_ordered, quantity_received, quantity_remaining) FROM stdin;
\.


--
-- TOC entry 5995 (class 0 OID 38499)
-- Dependencies: 265
-- Data for Name: broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broken_item_report (broken_item_report_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 5996 (class 0 OID 38505)
-- Dependencies: 266
-- Data for Name: company_asset_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_asset_request (company_asset_request_id, attribution_order_id, is_signed_by_company, administrative_serial_number, title_of_demand, organization_body_designation, register_number_or_book_journal_of_corpse, register_number_or_book_journal_of_establishment, is_signed_by_company_leader, is_signed_by_regional_provider, is_signed_by_company_representative, digital_copy) FROM stdin;
\.


--
-- TOC entry 5997 (class 0 OID 38512)
-- Dependencies: 267
-- Data for Name: consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable (consumable_id, consumable_model_id, stock_item_consumable_destruction_certificate_id, consumable_name, consumable_serial_number, consumable_fabrication_datetime, consumable_inventory_number, consumable_service_tag, consumable_name_in_administrative_certificate, consumable_arrival_datetime, consumable_status) FROM stdin;
1	1	\N	rp01	00001	\N	001	\N		\N	active
2	1	\N	rp02	00002	\N	002	\N	\N	\N	active
3	1	\N	yyy	yyy	\N	yyy	\N	\N	\N	Included with Asset
4	2	\N	yyy	yyy	\N	yyy	\N	\N	\N	Included with Asset
5	2	\N	yyy	yyy	\N	yyy	\N	\N	\N	Included with Asset
6	1	\N	ttt	ttt	\N	ttt	\N	\N	\N	Included with Asset
7	2	\N	ttt	ttt	\N	ttt	\N	\N	\N	Included with Asset
8	2	\N	ttt	ttt	\N	ttt	\N	\N	\N	Included with Asset
9	1	\N	Consumable model 1 (included with 2222)	\N	\N	\N	\N	\N	\N	Included with Asset
10	2	\N	Consumable model 2 (included with 2222)	\N	\N	\N	\N	\N	\N	Included with Asset
11	2	\N	Consumable model 2 (included with 2222)	\N	\N	\N	\N	\N	\N	Included with Asset
12	1	\N	Red Pen 01 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
13	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
14	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
15	1	\N	Red Pen 01 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
16	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
17	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
18	1	\N	Red Pen 01 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
19	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
20	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
21	1	\N	Red Pen 01 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
22	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
23	2	\N	EPSON M450 (included with test_accessory)	\N	\N	\N	\N	\N	\N	Included with Asset
24	1	\N	Red Pen 01 (included with test_a)	\N	\N	\N	\N	\N	\N	Included with Asset
25	2	\N	EPSON M450 (included with test_a)	\N	\N	\N	\N	\N	\N	Included with Asset
26	2	\N	EPSON M450 (included with test_a)	\N	\N	\N	\N	\N	\N	Included with Asset
27	1	\N	Red Pen 01 (included with test_a)	\N	\N	\N	\N	\N	\N	Included with Asset
28	2	\N	EPSON M450 (included with test_a)	\N	\N	\N	\N	\N	\N	Included with Asset
29	2	\N	EPSON M450 (included with test_a)	\N	\N	\N	\N	\N	\N	Included with Asset
30	1	\N	Red Pen 01 (included with test_b)	\N	\N	\N	\N	\N	\N	Included with Asset
31	2	\N	EPSON M450 (included with test_b)	\N	\N	\N	\N	\N	\N	Included with Asset
32	2	\N	EPSON M450 (included with test_b)	\N	\N	\N	\N	\N	\N	Included with Asset
33	1	\N	test_b	test_b	\N	test_b	\N	\N	\N	active
34	1	\N	Red Pen 01 (included with dfd)	\N	\N	\N	\N	\N	\N	Included with Asset
35	2	\N	EPSON M450 (included with dfd)	\N	\N	\N	\N	\N	\N	Included with Asset
36	2	\N	EPSON M450 (included with dfd)	\N	\N	\N	\N	\N	\N	Included with Asset
37	1	\N	Red Pen 01 (included with 888)	\N	\N	\N	\N	\N	\N	Included with Asset
38	2	\N	EPSON M450 (included with 888)	\N	\N	\N	\N	\N	\N	Included with Asset
39	2	\N	EPSON M450 (included with 888)	\N	\N	\N	\N	\N	\N	Included with Asset
40	1	\N	Red Pen 01 (included with 7)	\N	\N	\N	\N	\N	\N	Included with Asset
41	2	\N	EPSON M450 (included with 7)	\N	\N	\N	\N	\N	\N	Included with Asset
42	2	\N	EPSON M450 (included with 7)	\N	\N	\N	\N	\N	\N	Included with Asset
43	1	\N	Consumable model 1 (included with 9)	\N	\N	\N	\N	\N	\N	Included with Asset
44	2	\N	Consumable model 2 (included with 9)	\N	\N	\N	\N	\N	\N	Included with Asset
45	2	\N	Consumable model 2 (included with 9)	\N	\N	\N	\N	\N	\N	Included with Asset
46	1	\N	Red Pen 01 (included with 444)	\N	\N	\N	\N	\N	\N	Included with Asset
47	2	\N	EPSON M450 (included with 444)	\N	\N	\N	\N	\N	\N	Included with Asset
48	2	\N	EPSON M450 (included with 444)	\N	\N	\N	\N	\N	\N	Included with Asset
49	1	\N	jjjjj	77	\N	77	\N	\N	\N	Included with Asset
50	2	\N	jjjjj	88	\N	88	\N	\N	\N	Included with Asset
51	2	\N	jjjjj	99	\N	99	\N	\N	\N	Included with Asset
52	1	\N	Bahaddin	\N	\N	222	\N	\N	\N	not_delivered_to_company
53	1	\N	Veronica	\N	\N	222	\N	\N	\N	not_delivered_to_company
54	1	\N	Composed Consumable	\N	\N	\N	\N	\N	\N	Included with Asset
55	1	\N	Composed Consumable	\N	\N	\N	\N	\N	\N	Included with Asset
56	1	\N	Incident Test	7777	\N	7777	\N	\N	\N	\N
57	1	\N	TEST_CONS_207486	TEST-CONS-1775207486	\N	207486	\N	\N	\N	lost
\.


--
-- TOC entry 5998 (class 0 OID 38517)
-- Dependencies: 268
-- Data for Name: consumable_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_definition (consumable_attribute_definition_id, consumable_type_code, data_type, unit, description, maintenance_domain) FROM stdin;
1	\N	number	m	Number of Meters	\N
2	\N	string	\N	Color	\N
3	\N	number	page(s)	Number of pages	\N
\.


--
-- TOC entry 5999 (class 0 OID 38521)
-- Dependencies: 269
-- Data for Name: consumable_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_value (consumable_id, consumable_attribute_definition_id, value_string, value_bool, value_date, value_number) FROM stdin;
33	1	\N	f	\N	500.000000
52	1	\N	f	\N	500.000000
53	1	\N	f	\N	500.000000
\.


--
-- TOC entry 6000 (class 0 OID 38528)
-- Dependencies: 270
-- Data for Name: consumable_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_brand (consumable_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	BIC	BIC	t	\N
2	Schneider	SCHNEIDER	t	\N
3	DELL	DELL	t	brands/consumables/Dell_whh9uC9.svg
\.


--
-- TOC entry 6001 (class 0 OID 38532)
-- Dependencies: 271
-- Data for Name: consumable_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_condition_history (consumable_condition_history_id, consumable_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 6002 (class 0 OID 38539)
-- Dependencies: 272
-- Data for Name: consumable_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_assigned_to_person (assignment_id, consumable_id, person_id, assigned_by_person_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	1	9	10	2026-02-24 18:36:00	2026-02-24 18:36:54.831336	Good	f	\N
2	1	9	10	2026-02-24 18:37:00	2026-02-24 19:46:26.047031	Good	f	\N
3	1	9	10	2026-02-24 19:46:00	2026-02-24 19:46:46.34698	Good	f	\N
\.


--
-- TOC entry 6003 (class 0 OID 38549)
-- Dependencies: 273
-- Data for Name: consumable_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_asset (consumable_model_id, asset_model_id) FROM stdin;
1	1
\.


--
-- TOC entry 6004 (class 0 OID 38554)
-- Dependencies: 274
-- Data for Name: consumable_is_compatible_with_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_stock_item (consumable_model_id, stock_item_model_id) FROM stdin;
\.


--
-- TOC entry 6005 (class 0 OID 38559)
-- Dependencies: 275
-- Data for Name: consumable_is_used_in_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_used_in_stock_item_history (consumable_id, stock_item_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
\.


--
-- TOC entry 6007 (class 0 OID 38566)
-- Dependencies: 277
-- Data for Name: consumable_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model (consumable_model_id, consumable_type_id, consumable_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	1	1	Red Pen 01	RP01	2000	\N	t		8
2	2	1	EPSON M450	M450	\N	\N	t	\N	\N
3	1	2	Blue Pen	BP	\N	\N	t	\N	\N
4	1	3	qPen	QPEN	\N	\N	t	\N	\N
\.


--
-- TOC entry 6008 (class 0 OID 38572)
-- Dependencies: 278
-- Data for Name: consumable_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_attribute_value (consumable_model_id, consumable_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	1	f	\N	500.000000	\N
2	3	\N	\N	1000.000000	\N
3	1	\N	\N	400.000000	\N
4	1	\N	\N	400.000000	\N
\.


--
-- TOC entry 6009 (class 0 OID 38579)
-- Dependencies: 279
-- Data for Name: consumable_model_is_found_in_purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_is_found_in_purchase_order (consumable_model_id, purchase_order_id, quantity_ordered, quantity_received, unit_price) FROM stdin;
1	6	1	1	10.00
1	7	1	1	30.00
\.


--
-- TOC entry 6010 (class 0 OID 38584)
-- Dependencies: 280
-- Data for Name: consumable_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_movement (consumable_movement_id, destination_location_id, source_location_id, maintenance_step_id, external_maintenance_step_id, consumable_id, movement_reason, movement_datetime, status) FROM stdin;
\.


--
-- TOC entry 6011 (class 0 OID 38595)
-- Dependencies: 281
-- Data for Name: consumable_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type (consumable_type_id, consumable_type_label, consumable_type_code, photo) FROM stdin;
1	Pen	PEN	\N
2	Toner	TNR	\N
\.


--
-- TOC entry 6012 (class 0 OID 38601)
-- Dependencies: 282
-- Data for Name: consumable_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type_attribute (consumable_type_id, consumable_attribute_definition_id, is_mandatory, default_value) FROM stdin;
1	1	f	400
2	3	f	1000
\.


--
-- TOC entry 6013 (class 0 OID 38606)
-- Dependencies: 283
-- Data for Name: delivery_note; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_note (delivery_note_id, purchase_order_id, delivery_note_date, digital_copy, delivery_note_code) FROM stdin;
1	4	2026-03-06	\N	\N
2	2	2026-03-06	delivery_notes\\purchase_order_2\\delivery_note_dfdfdfdf.pdf	dfdfdfdf
3	5	2026-03-11	delivery_notes\\purchase_order_5\\delivery_note_azerty.pdf	azerty
4	6	2026-03-11	delivery_notes\\purchase_order_6\\delivery_note_Bahaddin.pdf	Bahaddin
5	7	2026-03-11	delivery_notes\\purchase_order_7\\delivery_note_Veronica.pdf	Veronica
\.


--
-- TOC entry 6014 (class 0 OID 38613)
-- Dependencies: 284
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- TOC entry 6016 (class 0 OID 38626)
-- Dependencies: 286
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
\.


--
-- TOC entry 6018 (class 0 OID 38633)
-- Dependencies: 288
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
\.


--
-- TOC entry 6020 (class 0 OID 38643)
-- Dependencies: 290
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
mwube6mtzimgwmghul5d0r6qos8lqeqe	.eJxVjDsOwjAQBe_iGllr_Isp6XMGa-3d4ACypTipEHeHSCmgfTPzXiLitpa4dV7iTOIilDj9bgnzg-sO6I711mRudV3mJHdFHrTLsRE_r4f7d1Cwl2_NGbPT5EgF9FYTZW8QXLA8KRwAskNzBgbwnsGHkAIwDWYCT4Taknh_APYiOC0:1vpY5p:xY5WGtSgTAbInJSRivcUir-NtXutxfuZCHkLUnB8v1k	2026-02-23 12:42:49.784307-08
\.


--
-- TOC entry 6021 (class 0 OID 38651)
-- Dependencies: 291
-- Data for Name: external_maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance (external_maintenance_id, maintenance_id, item_received_by_maintenance_provider_datetime, item_sent_to_company_datetime, item_sent_to_external_maintenance_datetime, item_received_by_company_datetime, external_maintenance_status, external_maintenance_provider_id) FROM stdin;
\.


--
-- TOC entry 6022 (class 0 OID 38657)
-- Dependencies: 292
-- Data for Name: external_maintenance_document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_document (external_maintenance_document_id, external_maintenance_id, document_is_signed, item_is_received_by_maintenance_provider, maintenance_provider_final_decision, digital_copy) FROM stdin;
\.


--
-- TOC entry 6023 (class 0 OID 38664)
-- Dependencies: 293
-- Data for Name: external_maintenance_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_provider (external_maintenance_provider_id, external_maintenance_provider_name, external_maintenance_provider_location) FROM stdin;
1	ERMT/2RM	\N
\.


--
-- TOC entry 6024 (class 0 OID 38668)
-- Dependencies: 294
-- Data for Name: external_maintenance_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_step (external_maintenance_step_id, external_maintenance_id, external_maintenance_typical_step_id, start_datetime, end_datetime, is_successful) FROM stdin;
\.


--
-- TOC entry 6025 (class 0 OID 38674)
-- Dependencies: 295
-- Data for Name: external_maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_typical_step (external_maintenance_typical_step_id, estimated_cost, actual_cost, maintenance_type, description, maintenance_domain) FROM stdin;
1	\N	\N	Hardware	Removing the motherboard	it
2	\N	\N	Hardware	Removing the RAM	it
\.


--
-- TOC entry 6026 (class 0 OID 38679)
-- Dependencies: 296
-- Data for Name: invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice (invoice_id, delivery_note_id, digital_copy) FROM stdin;
1	1	invoices\\delivery_note_1\\invoice_1.pdf
2	3	invoices\\delivery_note_3\\invoice_3.pdf
3	4	invoices\\delivery_note_4\\invoice_4.pdf
4	5	invoices\\delivery_note_5\\invoice_5.pdf
\.


--
-- TOC entry 6027 (class 0 OID 38686)
-- Dependencies: 297
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
24	Maintenance Room	2
23	IT Main Storage Room	3
25	ERMT/2RM Maintenance Room	4
\.


--
-- TOC entry 6028 (class 0 OID 38690)
-- Dependencies: 298
-- Data for Name: location_belongs_to_organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_belongs_to_organizational_structure (organizational_structure_id, location_id) FROM stdin;
\.


--
-- TOC entry 6029 (class 0 OID 38695)
-- Dependencies: 299
-- Data for Name: location_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_type (location_type_id, location_type_label, location_type_code) FROM stdin;
1	Teaching Room	TR
3	Storage Room	SR
4	External Maintenance Center	XMC
2	Maintenance Room	MR
\.


--
-- TOC entry 6031 (class 0 OID 38702)
-- Dependencies: 301
-- Data for Name: maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance (maintenance_id, asset_id, performed_by_person_id, approved_by_maintenance_chief_id, is_approved_by_maintenance_chief, start_datetime, end_datetime, description, is_successful, digital_copy, stock_item_id, consumable_id, maintenance_status) FROM stdin;
1	3	8	6	t	\N	2026-04-07 19:42:04.694488	Testing the table person_reports_problem_on_asset_included_context	t	\N	\N	\N	pending
2	3	8	6	t	\N	\N	Maintenance chief note	\N	\N	\N	\N	pending
\.


--
-- TOC entry 6032 (class 0 OID 38710)
-- Dependencies: 302
-- Data for Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_inspection_leads_to_broken_item_report (maintenance_id, broken_item_report_id) FROM stdin;
\.


--
-- TOC entry 6033 (class 0 OID 38715)
-- Dependencies: 303
-- Data for Name: maintenance_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step (maintenance_step_id, maintenance_id, maintenance_typical_step_id, person_id, asset_condition_history_id, stock_item_condition_history_id, consumable_condition_history_id, start_datetime, end_datetime, is_successful, maintenance_step_status) FROM stdin;
\.


--
-- TOC entry 6034 (class 0 OID 38722)
-- Dependencies: 304
-- Data for Name: maintenance_step_attribute_change; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_attribute_change (maintenance_step_attribute_change_id, target_type, target_id, attribute_definition_id, value_string, value_bool, value_date, value_number, created_at_datetime, created_by_user_id, applied_at_datetime, maintenance_step_id) FROM stdin;
\.


--
-- TOC entry 6036 (class 0 OID 38733)
-- Dependencies: 306
-- Data for Name: maintenance_step_item_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_item_request (maintenance_step_item_request_id, maintenance_step_id, requested_by_person_id, request_type, status, created_at, fulfilled_at, stock_item_id, consumable_id, source_location_id, destination_location_id, note, fulfilled_by_person_id, requested_stock_item_model_id, requested_consumable_model_id, rejected_by_person_id, rejected_at) FROM stdin;
\.


--
-- TOC entry 6037 (class 0 OID 38742)
-- Dependencies: 307
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
-- TOC entry 6038 (class 0 OID 38750)
-- Dependencies: 308
-- Data for Name: organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure (organizational_structure_id, structure_code, structure_name, structure_type, is_active) FROM stdin;
1	IT	Information Technology	Bureau	t
2	MNT	Maintenance	Section	t
3	EXP	Exploitation Section	Section	t
4	HR	Human Resources	Service	t
\.


--
-- TOC entry 6039 (class 0 OID 38754)
-- Dependencies: 309
-- Data for Name: organizational_structure_relation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_relation (child_organizational_structure_id, parent_organizational_structure_id, relation_id) FROM stdin;
2	1	\N
\.


--
-- TOC entry 6040 (class 0 OID 38759)
-- Dependencies: 310
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person (person_id, first_name, last_name, sex, birth_date, is_approved) FROM stdin;
1	System	Administrator	Male  	2001-08-21	t
6	Bahaa Eddine	ZAOUI	Male  	2001-08-21	t
7	Mohamed	MERINE	Male  	1990-01-01	t
9	Mohamed	NEDJOUH	Male  	1994-02-05	t
10	Daoud	BEN SI Messaoud	Male  	2002-02-27	t
1002	Main	Tech	M     	1990-01-01	t
1003	Other	Tech	M     	1995-01-01	t
1006	Stock	Responsible	Male  	1990-01-01	t
1007	Stock	Responsible	Male  	1990-01-01	t
1008	Asset	Responsible	Male  	1990-01-01	t
1010	Director	Admin & Support	Male  	1990-01-01	t
1011	Director	Admin & Support	Male  	1990-01-01	t
1012	Director	Admin & Support	Male  	1990-01-01	t
1013	Protection & Security	Bureau Chief	Male  	1990-01-01	t
1014	School	Headquarter	Male  	1990-01-01	t
1015	Amal	BOULEFRED	Male  	1990-01-01	t
8	Mohcene	AMOURA	Male  	2001-07-03	t
1009	Charaf Eddine	KEDAYA	Male  	1990-01-01	t
777	Manhous	HAMAL FANOUS	Male  	2000-01-01	t
\.


--
-- TOC entry 6041 (class 0 OID 38768)
-- Dependencies: 311
-- Data for Name: person_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_assignment (assignment_id, position_id, person_id, assignment_start_date, assignment_end_date, employment_type) FROM stdin;
\.


--
-- TOC entry 6042 (class 0 OID 38774)
-- Dependencies: 312
-- Data for Name: person_reports_problem_on_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset (asset_id, person_id, report_id, report_datetime, owner_observation) FROM stdin;
3	9	1	2026-04-07 07:53:25.936384	Testing the table person_reports_problem_on_asset_included_context
3	9	2	2026-04-07 19:43:26.255575	Owner note
\.


--
-- TOC entry 6043 (class 0 OID 38782)
-- Dependencies: 313
-- Data for Name: person_reports_problem_on_asset_included_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_consumable (report_id, consumable_id, id) FROM stdin;
\.


--
-- TOC entry 6045 (class 0 OID 38789)
-- Dependencies: 315
-- Data for Name: person_reports_problem_on_asset_included_context; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_context (report_id, destination_location_id) FROM stdin;
\.


--
-- TOC entry 6046 (class 0 OID 38794)
-- Dependencies: 316
-- Data for Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_stock_item (report_id, stock_item_id, id) FROM stdin;
\.


--
-- TOC entry 6048 (class 0 OID 38801)
-- Dependencies: 318
-- Data for Name: person_reports_problem_on_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_consumable (person_id, consumable_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 6049 (class 0 OID 38809)
-- Dependencies: 319
-- Data for Name: person_reports_problem_on_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_stock_item (person_id, stock_item_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 6050 (class 0 OID 38817)
-- Dependencies: 320
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
\.


--
-- TOC entry 6051 (class 0 OID 38822)
-- Dependencies: 321
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
-- TOC entry 6052 (class 0 OID 38826)
-- Dependencies: 322
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
\.


--
-- TOC entry 6080 (class 0 OID 40433)
-- Dependencies: 350
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
-- TOC entry 6053 (class 0 OID 38830)
-- Dependencies: 323
-- Data for Name: purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order (purchase_order_id, supplier_id, digital_copy, is_signed_by_finance, purchase_order_code) FROM stdin;
1	1	\N	f	oooooo
2	1	\N	t	zzzzzzzzzz
3	1	\N	t	ffffff
4	1	\N	t	uuu
5	1	\N	t	azerty
6	1	\N	t	Bahaddin
7	1	\N	t	Veronica
\.


--
-- TOC entry 6054 (class 0 OID 38837)
-- Dependencies: 324
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
\.


--
-- TOC entry 6055 (class 0 OID 38843)
-- Dependencies: 325
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
-- TOC entry 6056 (class 0 OID 38847)
-- Dependencies: 326
-- Data for Name: stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item (stock_item_id, maintenance_step_id, stock_item_model_id, stock_item_consumable_destruction_certificate_id, stock_item_fabrication_datetime, stock_item_name, stock_item_inventory_number, stock_item_warranty_expiry_in_months, stock_item_name_in_administrative_certificate, stock_item_arrival_datetime, stock_item_status) FROM stdin;
1	\N	1	\N	\N	Mohamed Nedjouh	0001	\N	\N	\N	\N
2	\N	1	\N	\N	Mohamed Nedjouh Splitted	0002	\N	\N	\N	in_stock
3	\N	1	\N	\N	Mohamed Nedjouh Splitted 2	0003	\N	\N	\N	in_stock
4	\N	1	\N	\N	Mohamed Nedjouh Splitted 3	0004	\N	\N	\N	in_stock
5	\N	1	\N	\N	Mohamed Nedjouh 5	5	\N	\N	\N	in_stock
6	\N	1	\N	\N	Mohamed Nedjouh 10	0101	\N	\N	\N	in_stock
7	\N	1	\N	\N	Mohamed Nedjouh100101	10101	\N	\N	\N	in_stock
8	\N	1	\N	\N	Incident Test	7777	\N	\N	\N	\N
9	\N	1	\N	\N	TEST_STOCK_207486	207486	\N	\N	\N	lost
10	\N	1	\N	\N	Inheritance Test	00002	\N	\N	\N	not_delivered_to_company
11	\N	2	\N	\N	HP Storage Test	00003	\N	\N	\N	not_delivered_to_company
\.


--
-- TOC entry 6057 (class 0 OID 38852)
-- Dependencies: 327
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
-- TOC entry 6058 (class 0 OID 38856)
-- Dependencies: 328
-- Data for Name: stock_item_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_value (stock_item_attribute_definition_id, stock_item_id, value_string, value_bool, value_date, value_number) FROM stdin;
1	6	\N	f	\N	3.000000
2	1	\N	f	\N	17.000000
2	6	\N	f	\N	1.000000
2	7	\N	f	\N	17.000000
1	1	\N	f	\N	2.000000
1	7	\N	f	\N	1.000000
1	10	\N	f	\N	1200000.000000
2	10	\N	f	\N	150.000000
2	11	\N	f	\N	120.000000
3	11	\N	\N	\N	\N
4	11	\N	\N	\N	\N
2	2	\N	f	\N	18.000000
2	3	\N	f	\N	18.000000
2	4	\N	f	\N	18.000000
2	5	\N	f	\N	18.000000
1	2	\N	f	\N	3.000000
1	3	\N	f	\N	3.000000
1	4	\N	f	\N	3.000000
1	5	\N	f	\N	3.000000
\.


--
-- TOC entry 6059 (class 0 OID 38863)
-- Dependencies: 329
-- Data for Name: stock_item_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_brand (stock_item_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	ASA	ASA	t	\N
2	HP	HP	t	\N
3	Acer	ACER	t	\N
\.


--
-- TOC entry 6060 (class 0 OID 38867)
-- Dependencies: 330
-- Data for Name: stock_item_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_condition_history (stock_item_condition_history_id, stock_item_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 6061 (class 0 OID 38875)
-- Dependencies: 331
-- Data for Name: stock_item_consumable_destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_consumable_destruction_certificate (destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
1	destruction_certificates\\destruction_certificate_1.pdf	2026-03-07 19:35:07.915855
2	destruction_certificates\\destruction_certificate_2.pdf	2026-03-07 20:37:18.994153
\.


--
-- TOC entry 6062 (class 0 OID 38881)
-- Dependencies: 332
-- Data for Name: stock_item_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_assigned_to_person (stock_item_id, person_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
\.


--
-- TOC entry 6063 (class 0 OID 38891)
-- Dependencies: 333
-- Data for Name: stock_item_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_compatible_with_asset (stock_item_model_id, asset_model_id) FROM stdin;
\.


--
-- TOC entry 6064 (class 0 OID 38896)
-- Dependencies: 334
-- Data for Name: stock_item_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model (stock_item_model_id, stock_item_type_id, stock_item_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	1	1	M1	M1	2020	\N	t		12
2	3	2	Storage	HPS	\N	\N	t	\N	\N
\.


--
-- TOC entry 6065 (class 0 OID 38902)
-- Dependencies: 335
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
-- TOC entry 6066 (class 0 OID 38909)
-- Dependencies: 336
-- Data for Name: stock_item_model_is_found_in_purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_is_found_in_purchase_order (stock_item_model_id, purchase_order_id, quantity_ordered, quantity_received, unit_price) FROM stdin;
1	1	5	\N	500.00
1	3	10	10	1000.00
1	4	1	1	1.00
1	5	2	2	1000.00
1	6	1	1	1000.00
1	7	1	1	300.00
\.


--
-- TOC entry 6067 (class 0 OID 38914)
-- Dependencies: 337
-- Data for Name: stock_item_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_movement (stock_item_movement_id, stock_item_id, source_location_id, destination_location_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status) FROM stdin;
\.


--
-- TOC entry 6068 (class 0 OID 38925)
-- Dependencies: 338
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
-- TOC entry 6069 (class 0 OID 38931)
-- Dependencies: 339
-- Data for Name: stock_item_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type_attribute (stock_item_attribute_definition_id, stock_item_type_id, is_mandatory, default_value) FROM stdin;
1	1	f	1000000
3	3	f	\N
4	3	f	\N
\.


--
-- TOC entry 6070 (class 0 OID 38936)
-- Dependencies: 340
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (supplier_id, supplier_name, supplier_address, supplier_commercial_register_number, supplier_rib, supplier_cpa, supplier_fiscal_identification_number, supplier_fiscal_static_number) FROM stdin;
1	ERI/2RM	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 6071 (class 0 OID 38940)
-- Dependencies: 341
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_account (user_id, person_id, username, password_hash, created_at_datetime, disabled_at_datetime, last_login, account_status, failed_login_attempts, password_last_changed_datetime, created_by_user_id, modified_by_user_id, modified_at_datetime) FROM stdin;
3	7	mohamedmerine	430e6b4f4f7d05027d10871fe98484662dd348368c06f7c21c520ea344fdd6bf7a156dba9c0ba468e82fb867f40d39c9bae5f408202c125b772de5aee696007e	2026-02-10 20:18:23.477744	2026-02-10 20:18:23.477744	2026-03-05 10:21:43.325505	active	0	2026-02-10 20:18:23.477744	\N	\N	2026-02-10 20:18:23.477744
15	1014	school_headquarter	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.248902	2026-03-07 20:57:47.248902	2026-03-11 22:40:00.191381	active	0	2026-03-07 20:57:47.248902	\N	\N	2026-03-07 20:57:47.248902
13	1012	director_admin_sup	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.236569	2026-03-07 20:57:47.236569	2026-03-11 22:40:12.339554	active	0	2026-03-07 20:57:47.236569	\N	\N	2026-03-07 20:57:47.236569
16	1015	network_tech	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-03-13 01:45:58.500981	2026-03-13 01:45:58.500981	2026-03-13 09:56:21.541546	active	0	2026-03-13 01:45:58.500981	\N	\N	2026-03-13 01:45:58.500981
6	9	mohamednedjouh	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-02-11 11:50:06.603461	2026-02-11 11:50:06.603461	2026-04-07 19:42:55.74939	active	0	2026-02-11 11:50:06.603461	1	1	2026-02-11 11:50:06.603461
12	1009	it_bureau_chief	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:56:05.769516	2026-03-07 20:56:05.769516	2026-04-12 09:00:37.735418	active	0	2026-03-07 20:56:05.769516	\N	\N	2026-03-07 20:56:05.769516
5	10	bensimessaouddaoud	1d3005bd778154738f4876dfe5b7815a25dd36ae79eaa68b44b78175c4d5cbf4400073ec6e4ce40ff2d11d981fd06ec421ba71c531dc67133ead14635c9471c9	2026-02-11 10:50:19.833168	2026-02-11 10:50:19.833168	2026-04-13 19:58:47.817023	active	0	2026-02-11 10:50:19.833168	1	1	2026-02-11 10:50:19.833168
2	6	bahaaeddinezaoui	9780eb93119bb629dc9062dc2611bd6bd17532b18a3b8a9ad0290e937000901132ce210686a8b3b843c9fa53797369a087c42cb8e3a18bb2d637cb2014c716df	2026-02-10 14:48:08.044751	2026-02-10 14:48:08.044751	2026-04-13 20:03:50.033476	active	0	2026-03-05 11:34:48.189826	\N	\N	2026-02-10 14:48:08.044751
4	8	mohceneamoura	40c82ecd90443ed156f5e4d3911c9659b6ecc21174a5ac4cb36f1804a45de6bcb2cae9110329419b04145e4d2ba55bd41a44f65c1e5617e592d7ebaf212c524e	2026-02-10 20:18:23.485554	2026-02-10 20:18:23.485554	2026-04-13 20:13:18.162497	active	0	2026-02-10 20:18:23.485554	\N	\N	2026-02-10 20:18:23.485554
10	1007	stock_cons_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:06:44.673576	2026-02-18 09:06:44.673576	2026-04-07 10:43:03.045686	active	0	2026-02-18 09:06:44.673576	\N	\N	2026-02-18 09:06:44.673576
11	1008	asset_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:15:48.937778	2026-02-18 09:15:48.937778	2026-04-13 20:16:09.249847	active	0	2026-02-18 09:15:48.937778	\N	\N	2026-02-18 09:15:48.937778
17	777	manhous	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-04-07 15:15:42.824332	2026-04-07 15:15:42.824332	2026-04-07 19:07:17.494849	active	0	2026-04-07 15:15:42.824332	1	1	2026-04-07 15:15:42.824332
1	1	admin	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-09 19:22:17.092734	2026-02-09 19:22:17.092734	2026-04-08 07:18:03.36842	active	0	2026-02-09 19:22:17.092734	\N	\N	2026-02-09 19:22:17.092734
14	1013	prot_sec_chief	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.243526	2026-03-07 20:57:47.243526	2026-04-03 07:06:43.144837	active	0	2026-03-07 20:57:47.243526	\N	\N	2026-03-07 20:57:47.243526
\.


--
-- TOC entry 6072 (class 0 OID 38956)
-- Dependencies: 342
-- Data for Name: user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_session (session_id, user_id, ip_address, user_agent, login_datetime, last_activity, logout_datetime) FROM stdin;
\.


--
-- TOC entry 6073 (class 0 OID 38964)
-- Dependencies: 343
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse (warehouse_id, warehouse_name, warehouse_address) FROM stdin;
1	ERI/2RM	\N
\.


--
-- TOC entry 6119 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_destruction_certificate_asset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_destruction_certificate_asset_id_seq', 1, true);


--
-- TOC entry 6120 (class 0 OID 0)
-- Dependencies: 344
-- Name: asset_incident_report_asset_incident_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_incident_report_asset_incident_report_id_seq', 1, false);


--
-- TOC entry 6121 (class 0 OID 0)
-- Dependencies: 348
-- Name: asset_incident_report_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_incident_report_consumable_id_seq', 2, true);


--
-- TOC entry 6122 (class 0 OID 0)
-- Dependencies: 346
-- Name: asset_incident_report_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_incident_report_stock_item_id_seq', 2, true);


--
-- TOC entry 6123 (class 0 OID 0)
-- Dependencies: 232
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_consumable_history_id_seq', 55, true);


--
-- TOC entry 6124 (class 0 OID 0)
-- Dependencies: 234
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_stock_item_history_id_seq', 66, true);


--
-- TOC entry 6125 (class 0 OID 0)
-- Dependencies: 238
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_consumable_id_seq', 3, true);


--
-- TOC entry 6126 (class 0 OID 0)
-- Dependencies: 240
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_stock_item_id_seq', 1, true);


--
-- TOC entry 6127 (class 0 OID 0)
-- Dependencies: 246
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_consumable_accessory_id_seq', 1, true);


--
-- TOC entry 6128 (class 0 OID 0)
-- Dependencies: 248
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_stock_item_accessory_id_seq', 1, true);


--
-- TOC entry 6129 (class 0 OID 0)
-- Dependencies: 250
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- TOC entry 6130 (class 0 OID 0)
-- Dependencies: 252
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- TOC entry 6131 (class 0 OID 0)
-- Dependencies: 254
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 336, true);


--
-- TOC entry 6132 (class 0 OID 0)
-- Dependencies: 257
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- TOC entry 6133 (class 0 OID 0)
-- Dependencies: 258
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 1, true);


--
-- TOC entry 6134 (class 0 OID 0)
-- Dependencies: 260
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- TOC entry 6135 (class 0 OID 0)
-- Dependencies: 276
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_is_used_in_stock_item_history_id_seq', 1, false);


--
-- TOC entry 6136 (class 0 OID 0)
-- Dependencies: 285
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- TOC entry 6137 (class 0 OID 0)
-- Dependencies: 287
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 84, true);


--
-- TOC entry 6138 (class 0 OID 0)
-- Dependencies: 289
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 45, true);


--
-- TOC entry 6139 (class 0 OID 0)
-- Dependencies: 300
-- Name: location_type_location_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_type_location_type_id_seq', 1, false);


--
-- TOC entry 6140 (class 0 OID 0)
-- Dependencies: 305
-- Name: maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq', 3, true);


--
-- TOC entry 6141 (class 0 OID 0)
-- Dependencies: 314
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_consumable_id_seq', 1, false);


--
-- TOC entry 6142 (class 0 OID 0)
-- Dependencies: 317
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_stock_item_id_seq', 5, true);


--
-- TOC entry 5346 (class 2606 OID 38980)
-- Name: acceptance_report acceptance_report_delivery_note_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT acceptance_report_delivery_note_id_key UNIQUE (delivery_note_id);


--
-- TOC entry 5348 (class 2606 OID 38982)
-- Name: acceptance_report acceptance_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT acceptance_report_pkey PRIMARY KEY (acceptance_report_id);


--
-- TOC entry 5350 (class 2606 OID 38984)
-- Name: administrative_certificate administrative_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT administrative_certificate_pkey PRIMARY KEY (administrative_certificate_id);


--
-- TOC entry 5354 (class 2606 OID 38986)
-- Name: asset_attribute_definition asset_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition
    ADD CONSTRAINT asset_attribute_definition_pkey PRIMARY KEY (asset_attribute_definition_id);


--
-- TOC entry 5356 (class 2606 OID 38988)
-- Name: asset_attribute_value asset_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT asset_attribute_value_pkey PRIMARY KEY (asset_attribute_definition_id, asset_id);


--
-- TOC entry 5358 (class 2606 OID 38990)
-- Name: asset_brand asset_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand
    ADD CONSTRAINT asset_brand_pkey PRIMARY KEY (asset_brand_id);


--
-- TOC entry 5360 (class 2606 OID 38992)
-- Name: asset_condition_history asset_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT asset_condition_history_pkey PRIMARY KEY (asset_condition_history_id);


--
-- TOC entry 5364 (class 2606 OID 38994)
-- Name: asset_destruction_certificate_asset asset_destruction_certificate_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT asset_destruction_certificate_asset_pkey PRIMARY KEY (id);


--
-- TOC entry 5362 (class 2606 OID 38996)
-- Name: asset_destruction_certificate asset_destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate
    ADD CONSTRAINT asset_destruction_certificate_pkey PRIMARY KEY (asset_destruction_certificate_id);


--
-- TOC entry 5368 (class 2606 OID 38998)
-- Name: asset_failed_external_maintenance asset_failed_external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT asset_failed_external_maintenance_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5615 (class 2606 OID 40364)
-- Name: asset_incident_report_consumable asset_incident_report_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_consumable
    ADD CONSTRAINT asset_incident_report_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5610 (class 2606 OID 40346)
-- Name: asset_incident_report asset_incident_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT asset_incident_report_pkey PRIMARY KEY (asset_incident_report_id);


--
-- TOC entry 5612 (class 2606 OID 40355)
-- Name: asset_incident_report_stock_item asset_incident_report_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_stock_item
    ADD CONSTRAINT asset_incident_report_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5370 (class 2606 OID 39000)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5372 (class 2606 OID 39002)
-- Name: asset_is_composed_of_consumable_history asset_is_composed_of_consumable_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT asset_is_composed_of_consumable_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5374 (class 2606 OID 39004)
-- Name: asset_is_composed_of_stock_item_history asset_is_composed_of_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT asset_is_composed_of_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5378 (class 2606 OID 39006)
-- Name: asset_model_attribute_value asset_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT asset_model_attribute_value_pkey PRIMARY KEY (asset_model_id, asset_attribute_definition_id);


--
-- TOC entry 5380 (class 2606 OID 39008)
-- Name: asset_model_default_consumable asset_model_default_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT asset_model_default_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5384 (class 2606 OID 39010)
-- Name: asset_model_default_stock_item asset_model_default_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT asset_model_default_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5376 (class 2606 OID 39012)
-- Name: asset_model asset_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT asset_model_pkey PRIMARY KEY (asset_model_id);


--
-- TOC entry 5388 (class 2606 OID 39014)
-- Name: asset_movement asset_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT asset_movement_pkey PRIMARY KEY (asset_movement_id);


--
-- TOC entry 5352 (class 2606 OID 39016)
-- Name: asset asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5392 (class 2606 OID 39018)
-- Name: asset_type_attribute asset_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT asset_type_attribute_pkey PRIMARY KEY (asset_attribute_definition_id, asset_type_id);


--
-- TOC entry 5390 (class 2606 OID 39020)
-- Name: asset_type asset_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type
    ADD CONSTRAINT asset_type_pkey PRIMARY KEY (asset_type_id);


--
-- TOC entry 5396 (class 2606 OID 39022)
-- Name: attribution_order_asset_consumable_accessory attribution_order_asset_consumable_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT attribution_order_asset_consumable_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5403 (class 2606 OID 39024)
-- Name: attribution_order_asset_stock_item_accessory attribution_order_asset_stock_item_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT attribution_order_asset_stock_item_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5394 (class 2606 OID 39026)
-- Name: attribution_order attribution_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT attribution_order_pkey PRIMARY KEY (attribution_order_id);


--
-- TOC entry 5411 (class 2606 OID 39028)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- TOC entry 5416 (class 2606 OID 39030)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- TOC entry 5419 (class 2606 OID 39032)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5413 (class 2606 OID 39034)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- TOC entry 5422 (class 2606 OID 39036)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- TOC entry 5424 (class 2606 OID 39038)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- TOC entry 5432 (class 2606 OID 39040)
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5435 (class 2606 OID 39042)
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- TOC entry 5426 (class 2606 OID 39044)
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- TOC entry 5438 (class 2606 OID 39046)
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5441 (class 2606 OID 39048)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- TOC entry 5429 (class 2606 OID 39050)
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- TOC entry 5443 (class 2606 OID 39052)
-- Name: authentication_log authentication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT authentication_log_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5447 (class 2606 OID 39054)
-- Name: backorder_report_consumable_model_line backorder_report_consumable_model_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_consumable_model_line
    ADD CONSTRAINT backorder_report_consumable_model_line_pkey PRIMARY KEY (backorder_report_id, consumable_model_id);


--
-- TOC entry 5445 (class 2606 OID 39056)
-- Name: backorder_report backorder_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT backorder_report_pkey PRIMARY KEY (backorder_report_id);


--
-- TOC entry 5450 (class 2606 OID 39058)
-- Name: backorder_report_stock_item_model_line backorder_report_stock_item_model_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_stock_item_model_line
    ADD CONSTRAINT backorder_report_stock_item_model_line_pkey PRIMARY KEY (backorder_report_id, stock_item_model_id);


--
-- TOC entry 5453 (class 2606 OID 39060)
-- Name: broken_item_report broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broken_item_report
    ADD CONSTRAINT broken_item_report_pkey PRIMARY KEY (broken_item_report_id);


--
-- TOC entry 5469 (class 2606 OID 39062)
-- Name: consumable_is_compatible_with_asset c_is_compatible_with_a_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT c_is_compatible_with_a_pkey PRIMARY KEY (consumable_model_id, asset_model_id);


--
-- TOC entry 5471 (class 2606 OID 39064)
-- Name: consumable_is_compatible_with_stock_item c_is_compatible_with_si_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT c_is_compatible_with_si_pkey PRIMARY KEY (consumable_model_id, stock_item_model_id);


--
-- TOC entry 5455 (class 2606 OID 39066)
-- Name: company_asset_request company_asset_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT company_asset_request_pkey PRIMARY KEY (company_asset_request_id);


--
-- TOC entry 5459 (class 2606 OID 39068)
-- Name: consumable_attribute_definition consumable_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition
    ADD CONSTRAINT consumable_attribute_definition_pkey PRIMARY KEY (consumable_attribute_definition_id);


--
-- TOC entry 5461 (class 2606 OID 39070)
-- Name: consumable_attribute_value consumable_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT consumable_attribute_value_pkey PRIMARY KEY (consumable_id, consumable_attribute_definition_id);


--
-- TOC entry 5463 (class 2606 OID 39072)
-- Name: consumable_brand consumable_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand
    ADD CONSTRAINT consumable_brand_pkey PRIMARY KEY (consumable_brand_id);


--
-- TOC entry 5465 (class 2606 OID 39074)
-- Name: consumable_condition_history consumable_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT consumable_condition_history_pkey PRIMARY KEY (consumable_condition_history_id);


--
-- TOC entry 5467 (class 2606 OID 39076)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5473 (class 2606 OID 39078)
-- Name: consumable_is_used_in_stock_item_history consumable_is_used_in_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT consumable_is_used_in_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5477 (class 2606 OID 39080)
-- Name: consumable_model_attribute_value consumable_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT consumable_model_attribute_value_pkey PRIMARY KEY (consumable_model_id, consumable_attribute_definition_id);


--
-- TOC entry 5479 (class 2606 OID 39082)
-- Name: consumable_model_is_found_in_purchase_order consumable_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT consumable_model_is_found_in_bdc_pkey PRIMARY KEY (consumable_model_id, purchase_order_id);


--
-- TOC entry 5475 (class 2606 OID 39084)
-- Name: consumable_model consumable_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT consumable_model_pkey PRIMARY KEY (consumable_model_id);


--
-- TOC entry 5481 (class 2606 OID 39086)
-- Name: consumable_movement consumable_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT consumable_movement_pkey PRIMARY KEY (consumable_movement_id);


--
-- TOC entry 5457 (class 2606 OID 39088)
-- Name: consumable consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT consumable_pkey PRIMARY KEY (consumable_id);


--
-- TOC entry 5485 (class 2606 OID 39090)
-- Name: consumable_type_attribute consumable_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT consumable_type_attribute_pkey PRIMARY KEY (consumable_type_id, consumable_attribute_definition_id);


--
-- TOC entry 5483 (class 2606 OID 39092)
-- Name: consumable_type consumable_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type
    ADD CONSTRAINT consumable_type_pkey PRIMARY KEY (consumable_type_id);


--
-- TOC entry 5487 (class 2606 OID 39094)
-- Name: delivery_note delivery_note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT delivery_note_pkey PRIMARY KEY (delivery_note_id);


--
-- TOC entry 5490 (class 2606 OID 39096)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5493 (class 2606 OID 39098)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- TOC entry 5495 (class 2606 OID 39100)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- TOC entry 5497 (class 2606 OID 39102)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5500 (class 2606 OID 39104)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- TOC entry 5507 (class 2606 OID 39106)
-- Name: external_maintenance_document external_maintenance_document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT external_maintenance_document_pkey PRIMARY KEY (external_maintenance_document_id);


--
-- TOC entry 5503 (class 2606 OID 39108)
-- Name: external_maintenance external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT external_maintenance_pkey PRIMARY KEY (external_maintenance_id);


--
-- TOC entry 5509 (class 2606 OID 39110)
-- Name: external_maintenance_provider external_maintenance_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_provider
    ADD CONSTRAINT external_maintenance_provider_pkey PRIMARY KEY (external_maintenance_provider_id);


--
-- TOC entry 5511 (class 2606 OID 39112)
-- Name: external_maintenance_step external_maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT external_maintenance_step_pkey PRIMARY KEY (external_maintenance_step_id);


--
-- TOC entry 5513 (class 2606 OID 39114)
-- Name: external_maintenance_typical_step external_maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step
    ADD CONSTRAINT external_maintenance_typical_step_pkey PRIMARY KEY (external_maintenance_typical_step_id);


--
-- TOC entry 5515 (class 2606 OID 39116)
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 5519 (class 2606 OID 39118)
-- Name: location_belongs_to_organizational_structure location_belongs_to_organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT location_belongs_to_organizational_structure_pkey PRIMARY KEY (organizational_structure_id, location_id);


--
-- TOC entry 5517 (class 2606 OID 39120)
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (location_id);


--
-- TOC entry 5521 (class 2606 OID 39122)
-- Name: location_type location_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type
    ADD CONSTRAINT location_type_pkey PRIMARY KEY (location_type_id);


--
-- TOC entry 5525 (class 2606 OID 39124)
-- Name: maintenance_inspection_leads_to_broken_item_report maintenance_inspection_leads_to_broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT maintenance_inspection_leads_to_broken_item_report_pkey PRIMARY KEY (maintenance_id, broken_item_report_id);


--
-- TOC entry 5523 (class 2606 OID 39126)
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (maintenance_id);


--
-- TOC entry 5530 (class 2606 OID 39128)
-- Name: maintenance_step_attribute_change maintenance_step_attribute_change_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_attribute_change_pkey PRIMARY KEY (maintenance_step_attribute_change_id);


--
-- TOC entry 5532 (class 2606 OID 39130)
-- Name: maintenance_step_item_request maintenance_step_item_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_pkey PRIMARY KEY (maintenance_step_item_request_id);


--
-- TOC entry 5527 (class 2606 OID 39132)
-- Name: maintenance_step maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT maintenance_step_pkey PRIMARY KEY (maintenance_step_id);


--
-- TOC entry 5536 (class 2606 OID 39134)
-- Name: maintenance_typical_step maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step
    ADD CONSTRAINT maintenance_typical_step_pkey PRIMARY KEY (maintenance_typical_step_id);


--
-- TOC entry 5538 (class 2606 OID 39136)
-- Name: organizational_structure organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure
    ADD CONSTRAINT organizational_structure_pkey PRIMARY KEY (organizational_structure_id);


--
-- TOC entry 5540 (class 2606 OID 39138)
-- Name: organizational_structure_relation organizational_structure_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT organizational_structure_relation_pkey PRIMARY KEY (child_organizational_structure_id, parent_organizational_structure_id);


--
-- TOC entry 5544 (class 2606 OID 39140)
-- Name: person_assignment person_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT person_assignment_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5542 (class 2606 OID 39142)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- TOC entry 5548 (class 2606 OID 39144)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5550 (class 2606 OID 39146)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_report_cons; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_report_cons UNIQUE (report_id, consumable_id);


--
-- TOC entry 5552 (class 2606 OID 39148)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5554 (class 2606 OID 39150)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5556 (class 2606 OID 39152)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_report_stoc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_report_stoc UNIQUE (report_id, stock_item_id);


--
-- TOC entry 5546 (class 2606 OID 39154)
-- Name: person_reports_problem_on_asset person_reports_problem_on_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT person_reports_problem_on_asset_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5558 (class 2606 OID 39156)
-- Name: person_reports_problem_on_consumable person_reports_problem_on_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT person_reports_problem_on_consumable_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5560 (class 2606 OID 39158)
-- Name: person_reports_problem_on_stock_item person_reports_problem_on_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT person_reports_problem_on_stock_item_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5562 (class 2606 OID 39160)
-- Name: person_role_mapping person_role_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT person_role_mapping_pkey PRIMARY KEY (role_id, person_id);


--
-- TOC entry 5564 (class 2606 OID 39162)
-- Name: physical_condition physical_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition
    ADD CONSTRAINT physical_condition_pkey PRIMARY KEY (condition_id);


--
-- TOC entry 5566 (class 2606 OID 39164)
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (position_id);


--
-- TOC entry 5618 (class 2606 OID 40443)
-- Name: position_role_mapping position_role_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_role_mapping
    ADD CONSTRAINT position_role_mapping_pkey PRIMARY KEY (position_id, role_id);


--
-- TOC entry 5568 (class 2606 OID 39166)
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (purchase_order_id);


--
-- TOC entry 5570 (class 2606 OID 39168)
-- Name: receipt_report receipt_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_report
    ADD CONSTRAINT receipt_report_pkey PRIMARY KEY (receipt_report_id);


--
-- TOC entry 5572 (class 2606 OID 39170)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- TOC entry 5576 (class 2606 OID 39172)
-- Name: stock_item_attribute_definition stock_item_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition
    ADD CONSTRAINT stock_item_attribute_definition_pkey PRIMARY KEY (stock_item_attribute_definition_id);


--
-- TOC entry 5578 (class 2606 OID 39174)
-- Name: stock_item_attribute_value stock_item_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT stock_item_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_id);


--
-- TOC entry 5580 (class 2606 OID 39176)
-- Name: stock_item_brand stock_item_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand
    ADD CONSTRAINT stock_item_brand_pkey PRIMARY KEY (stock_item_brand_id);


--
-- TOC entry 5582 (class 2606 OID 39178)
-- Name: stock_item_condition_history stock_item_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT stock_item_condition_history_pkey PRIMARY KEY (stock_item_condition_history_id);


--
-- TOC entry 5584 (class 2606 OID 39180)
-- Name: stock_item_consumable_destruction_certificate stock_item_consumable_destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_consumable_destruction_certificate
    ADD CONSTRAINT stock_item_consumable_destruction_certificate_pkey PRIMARY KEY (destruction_certificate_id);


--
-- TOC entry 5586 (class 2606 OID 39182)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5588 (class 2606 OID 39184)
-- Name: stock_item_is_compatible_with_asset stock_item_is_compatible_with_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT stock_item_is_compatible_with_asset_pkey PRIMARY KEY (stock_item_model_id, asset_model_id);


--
-- TOC entry 5592 (class 2606 OID 39186)
-- Name: stock_item_model_attribute_value stock_item_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT stock_item_model_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_model_id);


--
-- TOC entry 5594 (class 2606 OID 39188)
-- Name: stock_item_model_is_found_in_purchase_order stock_item_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT stock_item_model_is_found_in_bdc_pkey PRIMARY KEY (stock_item_model_id, purchase_order_id);


--
-- TOC entry 5590 (class 2606 OID 39190)
-- Name: stock_item_model stock_item_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT stock_item_model_pkey PRIMARY KEY (stock_item_model_id);


--
-- TOC entry 5596 (class 2606 OID 39192)
-- Name: stock_item_movement stock_item_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT stock_item_movement_pkey PRIMARY KEY (stock_item_movement_id);


--
-- TOC entry 5574 (class 2606 OID 39194)
-- Name: stock_item stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT stock_item_pkey PRIMARY KEY (stock_item_id);


--
-- TOC entry 5600 (class 2606 OID 39196)
-- Name: stock_item_type_attribute stock_item_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT stock_item_type_attribute_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_type_id);


--
-- TOC entry 5598 (class 2606 OID 39198)
-- Name: stock_item_type stock_item_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type
    ADD CONSTRAINT stock_item_type_pkey PRIMARY KEY (stock_item_type_id);


--
-- TOC entry 5602 (class 2606 OID 39200)
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (supplier_id);


--
-- TOC entry 5366 (class 2606 OID 39202)
-- Name: asset_destruction_certificate_asset uq_adca_asset; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT uq_adca_asset UNIQUE (asset_id);


--
-- TOC entry 5382 (class 2606 OID 39204)
-- Name: asset_model_default_consumable uq_amdc_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT uq_amdc_composition UNIQUE (asset_model_id, consumable_model_id);


--
-- TOC entry 5386 (class 2606 OID 39206)
-- Name: asset_model_default_stock_item uq_amdsi_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT uq_amdsi_composition UNIQUE (asset_model_id, stock_item_model_id);


--
-- TOC entry 5401 (class 2606 OID 39208)
-- Name: attribution_order_asset_consumable_accessory uq_ao_aca_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT uq_ao_aca_unique UNIQUE (attribution_order_id, asset_id, consumable_id);


--
-- TOC entry 5408 (class 2606 OID 39210)
-- Name: attribution_order_asset_stock_item_accessory uq_ao_assa_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT uq_ao_assa_unique UNIQUE (attribution_order_id, asset_id, stock_item_id);


--
-- TOC entry 5604 (class 2606 OID 39212)
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5606 (class 2606 OID 39214)
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5608 (class 2606 OID 39216)
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (warehouse_id);


--
-- TOC entry 5409 (class 1259 OID 39217)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- TOC entry 5414 (class 1259 OID 39218)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- TOC entry 5417 (class 1259 OID 39219)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- TOC entry 5420 (class 1259 OID 39220)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- TOC entry 5430 (class 1259 OID 39221)
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- TOC entry 5433 (class 1259 OID 39222)
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- TOC entry 5436 (class 1259 OID 39223)
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- TOC entry 5439 (class 1259 OID 39224)
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- TOC entry 5427 (class 1259 OID 39225)
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- TOC entry 5488 (class 1259 OID 39226)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- TOC entry 5491 (class 1259 OID 39227)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- TOC entry 5498 (class 1259 OID 39228)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- TOC entry 5501 (class 1259 OID 39229)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- TOC entry 5397 (class 1259 OID 39230)
-- Name: idx_ao_aca_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_asset ON public.attribution_order_asset_consumable_accessory USING btree (asset_id);


--
-- TOC entry 5398 (class 1259 OID 39231)
-- Name: idx_ao_aca_consumable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_consumable ON public.attribution_order_asset_consumable_accessory USING btree (consumable_id);


--
-- TOC entry 5399 (class 1259 OID 39232)
-- Name: idx_ao_aca_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_order ON public.attribution_order_asset_consumable_accessory USING btree (attribution_order_id);


--
-- TOC entry 5404 (class 1259 OID 39233)
-- Name: idx_ao_assa_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_asset ON public.attribution_order_asset_stock_item_accessory USING btree (asset_id);


--
-- TOC entry 5405 (class 1259 OID 39234)
-- Name: idx_ao_assa_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_order ON public.attribution_order_asset_stock_item_accessory USING btree (attribution_order_id);


--
-- TOC entry 5406 (class 1259 OID 39235)
-- Name: idx_ao_assa_stock_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_stock_item ON public.attribution_order_asset_stock_item_accessory USING btree (stock_item_id);


--
-- TOC entry 5448 (class 1259 OID 39236)
-- Name: idx_brcml_backorder_report_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_brcml_backorder_report_id ON public.backorder_report_consumable_model_line USING btree (backorder_report_id);


--
-- TOC entry 5451 (class 1259 OID 39237)
-- Name: idx_brsiml_backorder_report_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_brsiml_backorder_report_id ON public.backorder_report_stock_item_model_line USING btree (backorder_report_id);


--
-- TOC entry 5504 (class 1259 OID 39238)
-- Name: idx_external_maintenance_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_provider_id ON public.external_maintenance USING btree (external_maintenance_provider_id);


--
-- TOC entry 5505 (class 1259 OID 39239)
-- Name: idx_external_maintenance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_status ON public.external_maintenance USING btree (external_maintenance_status);


--
-- TOC entry 5528 (class 1259 OID 39240)
-- Name: maintenance_step_attribute_change_maintenance_step_id_34ad2442; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_attribute_change_maintenance_step_id_34ad2442 ON public.maintenance_step_attribute_change USING btree (maintenance_step_id);


--
-- TOC entry 5533 (class 1259 OID 39241)
-- Name: maintenance_step_item_request_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_status_idx ON public.maintenance_step_item_request USING btree (status);


--
-- TOC entry 5534 (class 1259 OID 39242)
-- Name: maintenance_step_item_request_step_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_step_id_idx ON public.maintenance_step_item_request USING btree (maintenance_step_id);


--
-- TOC entry 5616 (class 1259 OID 40408)
-- Name: uq_airc_report_consumable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_airc_report_consumable ON public.asset_incident_report_consumable USING btree (asset_incident_report_id, consumable_id);


--
-- TOC entry 5613 (class 1259 OID 40407)
-- Name: uq_airsi_report_stock_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_airsi_report_stock_item ON public.asset_incident_report_stock_item USING btree (asset_incident_report_id, stock_item_id);


--
-- TOC entry 5635 (class 2606 OID 39243)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5669 (class 2606 OID 39248)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5670 (class 2606 OID 39253)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5671 (class 2606 OID 39258)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5672 (class 2606 OID 39263)
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5673 (class 2606 OID 39268)
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5674 (class 2606 OID 39273)
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5675 (class 2606 OID 39278)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5686 (class 2606 OID 39283)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5712 (class 2606 OID 39288)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5713 (class 2606 OID 39293)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5619 (class 2606 OID 39298)
-- Name: acceptance_report fk_acceptance_report_delivery_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT fk_acceptance_report_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5630 (class 2606 OID 39303)
-- Name: asset_destruction_certificate_asset fk_adca_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5631 (class 2606 OID 39308)
-- Name: asset_destruction_certificate_asset fk_adca_cert; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_cert FOREIGN KEY (asset_destruction_certificate_id) REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5632 (class 2606 OID 39313)
-- Name: asset_destruction_certificate_asset fk_adca_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5620 (class 2606 OID 39318)
-- Name: administrative_certificate fk_administ_ac_is_lin_receipt_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ac_is_lin_receipt_ FOREIGN KEY (receipt_report_id) REFERENCES public.receipt_report(receipt_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5621 (class 2606 OID 39323)
-- Name: administrative_certificate fk_administ_ad_is_bro_warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ad_is_bro_warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5622 (class 2606 OID 39328)
-- Name: administrative_certificate fk_administ_ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5633 (class 2606 OID 39333)
-- Name: asset_failed_external_maintenance fk_afem_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT fk_afem_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5634 (class 2606 OID 39338)
-- Name: asset_failed_external_maintenance fk_afem_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT fk_afem_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5636 (class 2606 OID 39343)
-- Name: asset_is_assigned_to_person fk_aiatp_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_aiatp_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5639 (class 2606 OID 39348)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5640 (class 2606 OID 39353)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5643 (class 2606 OID 39358)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5644 (class 2606 OID 39363)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5792 (class 2606 OID 40367)
-- Name: asset_incident_report fk_air_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5793 (class 2606 OID 40382)
-- Name: asset_incident_report fk_air_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5794 (class 2606 OID 40372)
-- Name: asset_incident_report fk_air_owner_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_owner_person FOREIGN KEY (owner_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5795 (class 2606 OID 40377)
-- Name: asset_incident_report fk_air_school_hq_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report
    ADD CONSTRAINT fk_air_school_hq_person FOREIGN KEY (school_headquarter_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5798 (class 2606 OID 40402)
-- Name: asset_incident_report_consumable fk_airc_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_consumable
    ADD CONSTRAINT fk_airc_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5799 (class 2606 OID 40397)
-- Name: asset_incident_report_consumable fk_airc_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_consumable
    ADD CONSTRAINT fk_airc_report FOREIGN KEY (asset_incident_report_id) REFERENCES public.asset_incident_report(asset_incident_report_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5796 (class 2606 OID 40387)
-- Name: asset_incident_report_stock_item fk_airsi_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_stock_item
    ADD CONSTRAINT fk_airsi_report FOREIGN KEY (asset_incident_report_id) REFERENCES public.asset_incident_report(asset_incident_report_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5797 (class 2606 OID 40392)
-- Name: asset_incident_report_stock_item fk_airsi_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_incident_report_stock_item
    ADD CONSTRAINT fk_airsi_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5651 (class 2606 OID 39368)
-- Name: asset_model_default_consumable fk_amdc_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5652 (class 2606 OID 39373)
-- Name: asset_model_default_consumable fk_amdc_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE;


--
-- TOC entry 5653 (class 2606 OID 39378)
-- Name: asset_model_default_stock_item fk_amdsi_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5654 (class 2606 OID 39383)
-- Name: asset_model_default_stock_item fk_amdsi_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE;


--
-- TOC entry 5663 (class 2606 OID 39388)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5664 (class 2606 OID 39393)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5665 (class 2606 OID 39398)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5666 (class 2606 OID 39403)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5667 (class 2606 OID 39408)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5668 (class 2606 OID 39413)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5623 (class 2606 OID 39418)
-- Name: asset fk_asset_asset_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_destruction_certificate FOREIGN KEY (destruction_certificate_id) REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5624 (class 2606 OID 39423)
-- Name: asset fk_asset_asset_is__asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5625 (class 2606 OID 39428)
-- Name: asset fk_asset_asset_is__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5626 (class 2606 OID 39433)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5627 (class 2606 OID 39438)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5628 (class 2606 OID 39443)
-- Name: asset_condition_history fk_asset_co_asset_con_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_con_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5629 (class 2606 OID 39448)
-- Name: asset_condition_history fk_asset_co_asset_has_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_has_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5641 (class 2606 OID 39453)
-- Name: asset_is_composed_of_consumable_history fk_asset_cons_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_cons_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5642 (class 2606 OID 39458)
-- Name: asset_is_composed_of_consumable_history fk_asset_is_asset_is__consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_is_asset_is__consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5637 (class 2606 OID 39463)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigned FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5638 (class 2606 OID 39468)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigner FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5645 (class 2606 OID 39473)
-- Name: asset_is_composed_of_stock_item_history fk_asset_is_asset_is__stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_is_asset_is__stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5649 (class 2606 OID 39478)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5647 (class 2606 OID 39483)
-- Name: asset_model fk_asset_mo_asset_mod_asset_br; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_br FOREIGN KEY (asset_brand_id) REFERENCES public.asset_brand(asset_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5650 (class 2606 OID 39488)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5655 (class 2606 OID 39493)
-- Name: asset_movement fk_asset_mo_asset_mov_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5656 (class 2606 OID 39498)
-- Name: asset_movement fk_asset_mo_asset_mov_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5657 (class 2606 OID 39503)
-- Name: asset_movement fk_asset_mo_asset_mov_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5658 (class 2606 OID 39508)
-- Name: asset_movement fk_asset_mo_asset_mov_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5659 (class 2606 OID 39513)
-- Name: asset_movement fk_asset_mo_asset_mov_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_maintena FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5648 (class 2606 OID 39518)
-- Name: asset_model fk_asset_mo_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5646 (class 2606 OID 39523)
-- Name: asset_is_composed_of_stock_item_history fk_asset_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5660 (class 2606 OID 39528)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5661 (class 2606 OID 39533)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5662 (class 2606 OID 39538)
-- Name: attribution_order fk_attribut_shipment__warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT fk_attribut_shipment__warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5676 (class 2606 OID 39543)
-- Name: authentication_log fk_authenti_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT fk_authenti_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5761 (class 2606 OID 39548)
-- Name: purchase_order fk_bon_de_c_bdc_is_ma_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT fk_bon_de_c_bdc_is_ma_supplier FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5677 (class 2606 OID 39553)
-- Name: backorder_report fk_bon_de_r_bdc_has_b_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT fk_bon_de_r_bdc_has_b_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5678 (class 2606 OID 39558)
-- Name: backorder_report_consumable_model_line fk_brcml_backorder_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_consumable_model_line
    ADD CONSTRAINT fk_brcml_backorder_report FOREIGN KEY (backorder_report_id) REFERENCES public.backorder_report(backorder_report_id) ON DELETE CASCADE;


--
-- TOC entry 5679 (class 2606 OID 39563)
-- Name: backorder_report_stock_item_model_line fk_brsiml_backorder_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_stock_item_model_line
    ADD CONSTRAINT fk_brsiml_backorder_report FOREIGN KEY (backorder_report_id) REFERENCES public.backorder_report(backorder_report_id) ON DELETE CASCADE;


--
-- TOC entry 5690 (class 2606 OID 39568)
-- Name: consumable_is_compatible_with_asset fk_c_is_com_c_is_comp_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_c_is_com_c_is_comp_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5692 (class 2606 OID 39573)
-- Name: consumable_is_compatible_with_stock_item fk_c_is_com_c_is_comp_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_c_is_com_c_is_comp_stock_it FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5683 (class 2606 OID 39578)
-- Name: consumable_attribute_value fk_cav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5684 (class 2606 OID 39583)
-- Name: consumable_attribute_value fk_cav_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5687 (class 2606 OID 39588)
-- Name: consumable_is_assigned_to_person fk_ciatp_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_ciatp_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5691 (class 2606 OID 39593)
-- Name: consumable_is_compatible_with_asset fk_cicwa_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_cicwa_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5693 (class 2606 OID 39598)
-- Name: consumable_is_compatible_with_stock_item fk_cicwsi_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_cicwsi_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5694 (class 2606 OID 39603)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5695 (class 2606 OID 39608)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5698 (class 2606 OID 39613)
-- Name: consumable_model fk_cm_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_brand FOREIGN KEY (consumable_brand_id) REFERENCES public.consumable_brand(consumable_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5704 (class 2606 OID 39618)
-- Name: consumable_movement fk_cm_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5705 (class 2606 OID 39623)
-- Name: consumable_movement fk_cm_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5699 (class 2606 OID 39628)
-- Name: consumable_model fk_cm_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5700 (class 2606 OID 39633)
-- Name: consumable_model_attribute_value fk_cmav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5701 (class 2606 OID 39638)
-- Name: consumable_model_attribute_value fk_cmav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5702 (class 2606 OID 39643)
-- Name: consumable_model_is_found_in_purchase_order fk_cmifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_cmifib_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5680 (class 2606 OID 39648)
-- Name: company_asset_request fk_company__ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT fk_company__ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5696 (class 2606 OID 39653)
-- Name: consumable_is_used_in_stock_item_history fk_cons_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_cons_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5685 (class 2606 OID 39658)
-- Name: consumable_condition_history fk_consumab_associati_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT fk_consumab_associati_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5703 (class 2606 OID 39663)
-- Name: consumable_model_is_found_in_purchase_order fk_consumab_consumabl_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_consumab_consumabl_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5706 (class 2606 OID 39668)
-- Name: consumable_movement fk_consumab_consumabl_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5707 (class 2606 OID 39673)
-- Name: consumable_movement fk_consumab_consumabl_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5708 (class 2606 OID 39678)
-- Name: consumable_movement fk_consumab_consumabl_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5688 (class 2606 OID 39683)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5689 (class 2606 OID 39688)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5697 (class 2606 OID 39693)
-- Name: consumable_is_used_in_stock_item_history fk_consumab_consumabl_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_consumab_consumabl_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5681 (class 2606 OID 39698)
-- Name: consumable fk_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5682 (class 2606 OID 39703)
-- Name: consumable fk_consumable_stock_item_consumable_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_stock_item_consumable_destruction_certificate FOREIGN KEY (stock_item_consumable_destruction_certificate_id) REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5709 (class 2606 OID 39708)
-- Name: consumable_type_attribute fk_cta_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5710 (class 2606 OID 39713)
-- Name: consumable_type_attribute fk_cta_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5711 (class 2606 OID 39718)
-- Name: delivery_note fk_delivery_note_purchase_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT fk_delivery_note_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5715 (class 2606 OID 39723)
-- Name: external_maintenance_document fk_emd_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT fk_emd_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5716 (class 2606 OID 39728)
-- Name: external_maintenance_step fk_ems_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_ems_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5717 (class 2606 OID 39733)
-- Name: external_maintenance_step fk_external_ems_is_a__external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_external_ems_is_a__external FOREIGN KEY (external_maintenance_typical_step_id) REFERENCES public.external_maintenance_typical_step(external_maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5714 (class 2606 OID 39738)
-- Name: external_maintenance fk_external_maintenan_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT fk_external_maintenan_maintena FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5718 (class 2606 OID 39743)
-- Name: invoice fk_invoice_delivery_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT fk_invoice_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5720 (class 2606 OID 39748)
-- Name: location_belongs_to_organizational_structure fk_location_bel_location_belo_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT fk_location_bel_location_belo_location FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5729 (class 2606 OID 39753)
-- Name: maintenance_step fk_maintena_asset_con_asset_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_asset_con_asset_co FOREIGN KEY (asset_condition_history_id) REFERENCES public.asset_condition_history(asset_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5722 (class 2606 OID 39758)
-- Name: maintenance fk_maintena_asset_is__asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_asset_is__asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5730 (class 2606 OID 39763)
-- Name: maintenance_step fk_maintena_consumabl_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_consumabl_consumab FOREIGN KEY (consumable_condition_history_id) REFERENCES public.consumable_condition_history(consumable_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5727 (class 2606 OID 39768)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_maintena_maintenan_broken_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_maintena_maintenan_broken_i FOREIGN KEY (broken_item_report_id) REFERENCES public.broken_item_report(broken_item_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5723 (class 2606 OID 39773)
-- Name: maintenance fk_maintena_maintenan_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_maintenan_person FOREIGN KEY (performed_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5724 (class 2606 OID 39778)
-- Name: maintenance fk_maintena_person_as_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_person_as_person FOREIGN KEY (approved_by_maintenance_chief_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5731 (class 2606 OID 39783)
-- Name: maintenance_step fk_maintena_stock_ite_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_stock_ite_stock_it FOREIGN KEY (stock_item_condition_history_id) REFERENCES public.stock_item_condition_history(stock_item_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5728 (class 2606 OID 39788)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_milbir_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_milbir_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5732 (class 2606 OID 39793)
-- Name: maintenance_step fk_ms_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5733 (class 2606 OID 39798)
-- Name: maintenance_step fk_ms_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5734 (class 2606 OID 39803)
-- Name: maintenance_step fk_ms_typical_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_typical_step FOREIGN KEY (maintenance_typical_step_id) REFERENCES public.maintenance_typical_step(maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5743 (class 2606 OID 39808)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_child FOREIGN KEY (child_organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5744 (class 2606 OID 39813)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_parent FOREIGN KEY (parent_organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5745 (class 2606 OID 39818)
-- Name: person_assignment fk_person_a_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5746 (class 2606 OID 39823)
-- Name: person_assignment fk_person_a_person_is_position; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_is_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5747 (class 2606 OID 39828)
-- Name: person_reports_problem_on_asset fk_person_r_person_re_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_person_r_person_re_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5755 (class 2606 OID 39833)
-- Name: person_reports_problem_on_consumable fk_person_r_person_re_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_person_r_person_re_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5757 (class 2606 OID 39838)
-- Name: person_reports_problem_on_stock_item fk_person_r_person_re_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_person_r_person_re_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5759 (class 2606 OID 39843)
-- Name: person_role_mapping fk_person_role_mapping_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5760 (class 2606 OID 39848)
-- Name: person_role_mapping fk_person_role_mapping_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_role FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5800 (class 2606 OID 40444)
-- Name: position_role_mapping fk_position_role_mapping_position; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_role_mapping
    ADD CONSTRAINT fk_position_role_mapping_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5801 (class 2606 OID 40449)
-- Name: position_role_mapping fk_position_role_mapping_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_role_mapping
    ADD CONSTRAINT fk_position_role_mapping_role FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5748 (class 2606 OID 39853)
-- Name: person_reports_problem_on_asset fk_prpoa_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_prpoa_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5756 (class 2606 OID 39858)
-- Name: person_reports_problem_on_consumable fk_prpoc_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_prpoc_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5758 (class 2606 OID 39863)
-- Name: person_reports_problem_on_stock_item fk_prposi_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_prposi_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5721 (class 2606 OID 39868)
-- Name: location_belongs_to_organizational_structure fk_room_bel_room_belo_organiza; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT fk_room_bel_room_belo_organiza FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5719 (class 2606 OID 39873)
-- Name: location fk_room_room_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT fk_room_room_type FOREIGN KEY (location_type_id) REFERENCES public.location_type(location_type_id);


--
-- TOC entry 5765 (class 2606 OID 39878)
-- Name: stock_item_attribute_value fk_siav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5766 (class 2606 OID 39883)
-- Name: stock_item_attribute_value fk_siav_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5767 (class 2606 OID 39888)
-- Name: stock_item_condition_history fk_sich_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_sich_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5769 (class 2606 OID 39893)
-- Name: stock_item_is_assigned_to_person fk_siiatp_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_siiatp_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5773 (class 2606 OID 39898)
-- Name: stock_item_is_compatible_with_asset fk_siicwa_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_siicwa_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5775 (class 2606 OID 39903)
-- Name: stock_item_model fk_sim_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_brand FOREIGN KEY (stock_item_brand_id) REFERENCES public.stock_item_brand(stock_item_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5781 (class 2606 OID 39908)
-- Name: stock_item_movement fk_sim_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5782 (class 2606 OID 39913)
-- Name: stock_item_movement fk_sim_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5776 (class 2606 OID 39918)
-- Name: stock_item_model fk_sim_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5777 (class 2606 OID 39923)
-- Name: stock_item_model_attribute_value fk_simav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5778 (class 2606 OID 39928)
-- Name: stock_item_model_attribute_value fk_simav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5779 (class 2606 OID 39933)
-- Name: stock_item_model_is_found_in_purchase_order fk_simifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_simifib_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5786 (class 2606 OID 39938)
-- Name: stock_item_type_attribute fk_sita_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5787 (class 2606 OID 39943)
-- Name: stock_item_type_attribute fk_sita_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5774 (class 2606 OID 39948)
-- Name: stock_item_is_compatible_with_asset fk_stock_it_stock_ite_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_stock_it_stock_ite_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5780 (class 2606 OID 39953)
-- Name: stock_item_model_is_found_in_purchase_order fk_stock_it_stock_ite_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_stock_it_stock_ite_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5783 (class 2606 OID 39958)
-- Name: stock_item_movement fk_stock_it_stock_ite_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5784 (class 2606 OID 39963)
-- Name: stock_item_movement fk_stock_it_stock_ite_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5785 (class 2606 OID 39968)
-- Name: stock_item_movement fk_stock_it_stock_ite_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5770 (class 2606 OID 39973)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5771 (class 2606 OID 39978)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5768 (class 2606 OID 39983)
-- Name: stock_item_condition_history fk_stock_it_stock_ite_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_stock_it_stock_ite_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5762 (class 2606 OID 39988)
-- Name: stock_item fk_stock_item_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5763 (class 2606 OID 39993)
-- Name: stock_item fk_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5764 (class 2606 OID 39998)
-- Name: stock_item fk_stock_item_stock_item_consumable_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_stock_item_consumable_destruction_certificate FOREIGN KEY (stock_item_consumable_destruction_certificate_id) REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5788 (class 2606 OID 40003)
-- Name: user_account fk_user_acc_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5789 (class 2606 OID 40008)
-- Name: user_account fk_user_acc_modified_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_modified_by_user FOREIGN KEY (modified_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5790 (class 2606 OID 40013)
-- Name: user_account fk_user_acc_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5791 (class 2606 OID 40018)
-- Name: user_session fk_user_ses_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT fk_user_ses_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5725 (class 2606 OID 40023)
-- Name: maintenance maintenance_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5735 (class 2606 OID 40028)
-- Name: maintenance_step_attribute_change maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5736 (class 2606 OID 40033)
-- Name: maintenance_step_item_request maintenance_step_item_request_rejected_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_rejected_by_person_fk FOREIGN KEY (rejected_by_person_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 5726 (class 2606 OID 40038)
-- Name: maintenance maintenance_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5737 (class 2606 OID 40043)
-- Name: maintenance_step_item_request msir_consumable_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_consumable_fk FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5738 (class 2606 OID 40048)
-- Name: maintenance_step_item_request msir_destination_location_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_destination_location_fk FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 5739 (class 2606 OID 40053)
-- Name: maintenance_step_item_request msir_maintenance_step_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_maintenance_step_fk FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id);


--
-- TOC entry 5740 (class 2606 OID 40058)
-- Name: maintenance_step_item_request msir_requested_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_requested_by_person_fk FOREIGN KEY (requested_by_person_id) REFERENCES public.person(person_id);


--
-- TOC entry 5741 (class 2606 OID 40063)
-- Name: maintenance_step_item_request msir_source_location_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_source_location_fk FOREIGN KEY (source_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 5742 (class 2606 OID 40068)
-- Name: maintenance_step_item_request msir_stock_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_stock_item_fk FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5751 (class 2606 OID 40073)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_includ_destination_location_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_includ_destination_location_id_ FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 5749 (class 2606 OID 40078)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_con_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_con_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5750 (class 2606 OID 40083)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consuma_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consuma_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5752 (class 2606 OID 40088)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5753 (class 2606 OID 40093)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_sto_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_sto_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5754 (class 2606 OID 40098)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_i_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_i_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5772 (class 2606 OID 40103)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


-- Completed on 2026-04-13 21:19:42

--
-- PostgreSQL database dump complete
--

\unrestrict 3Kg7QpELsJtA8iAIrt89uqxyXAogI7LTeFslOAv7l2XWiGruwVSBhExNKsATkwf

