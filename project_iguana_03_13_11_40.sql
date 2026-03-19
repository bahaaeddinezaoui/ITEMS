--
-- PostgreSQL database dump
--

\restrict v08FJCYeaM9p4HxPEOd2F1anjhIKG0XhU1KKDq1RrCB4zg3fjc9fyKvnM0JHfS9

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-03-13 11:42:48

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
-- TOC entry 1291 (class 1247 OID 84170)
-- Name: maintenance_domain; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenance_domain AS ENUM (
    'it',
    'network'
);


ALTER TYPE public.maintenance_domain OWNER TO postgres;

--
-- TOC entry 976 (class 1247 OID 82313)
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
-- TOC entry 219 (class 1259 OID 82319)
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
-- TOC entry 220 (class 1259 OID 82326)
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
-- TOC entry 6029 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN administrative_certificate.operation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.operation IS 'Action" can be "entry", "exit" or "transfer';


--
-- TOC entry 6030 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN administrative_certificate.format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.format IS 'Among the formats is "21x27"';


--
-- TOC entry 221 (class 1259 OID 82337)
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
-- TOC entry 222 (class 1259 OID 82342)
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
-- TOC entry 223 (class 1259 OID 82346)
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
-- TOC entry 224 (class 1259 OID 82353)
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
-- TOC entry 225 (class 1259 OID 82357)
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
-- TOC entry 226 (class 1259 OID 82365)
-- Name: asset_destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_destruction_certificate (
    asset_destruction_certificate_id integer CONSTRAINT asset_destruction_certifica_asset_destruction_certific_not_null NOT NULL,
    digital_copy text,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.asset_destruction_certificate OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 82371)
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
-- TOC entry 228 (class 1259 OID 82378)
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
-- TOC entry 6031 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_destruction_certificate_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_destruction_certificate_asset_id_seq OWNED BY public.asset_destruction_certificate_asset.id;


--
-- TOC entry 229 (class 1259 OID 82379)
-- Name: asset_failed_external_maintenance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_failed_external_maintenance (
    asset_id integer NOT NULL,
    external_maintenance_id integer CONSTRAINT asset_failed_external_maintena_external_maintenance_id_not_null NOT NULL,
    failed_datetime timestamp without time zone
);


ALTER TABLE public.asset_failed_external_maintenance OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 82384)
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
-- TOC entry 6032 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE asset_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_is_assigned_to_person IS 'The first person is the one to whom the asset is assigned, a';


--
-- TOC entry 231 (class 1259 OID 82394)
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
-- TOC entry 232 (class 1259 OID 82400)
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
-- TOC entry 6033 (class 0 OID 0)
-- Dependencies: 232
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_consumable_history_id_seq OWNED BY public.asset_is_composed_of_consumable_history.id;


--
-- TOC entry 233 (class 1259 OID 82401)
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
-- TOC entry 234 (class 1259 OID 82407)
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
-- TOC entry 6034 (class 0 OID 0)
-- Dependencies: 234
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_stock_item_history_id_seq OWNED BY public.asset_is_composed_of_stock_item_history.id;


--
-- TOC entry 235 (class 1259 OID 82408)
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
-- TOC entry 236 (class 1259 OID 82414)
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
-- TOC entry 237 (class 1259 OID 82421)
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
-- TOC entry 238 (class 1259 OID 82429)
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
-- TOC entry 6035 (class 0 OID 0)
-- Dependencies: 238
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_consumable_id_seq OWNED BY public.asset_model_default_consumable.id;


--
-- TOC entry 239 (class 1259 OID 82430)
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
-- TOC entry 240 (class 1259 OID 82438)
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
-- TOC entry 6036 (class 0 OID 0)
-- Dependencies: 240
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_stock_item_id_seq OWNED BY public.asset_model_default_stock_item.id;


--
-- TOC entry 241 (class 1259 OID 82439)
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
-- TOC entry 242 (class 1259 OID 82450)
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
-- TOC entry 243 (class 1259 OID 82456)
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
-- TOC entry 244 (class 1259 OID 82461)
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
-- TOC entry 245 (class 1259 OID 82466)
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
-- TOC entry 246 (class 1259 OID 82473)
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
-- TOC entry 6037 (class 0 OID 0)
-- Dependencies: 246
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_consumable_accessory_id_seq OWNED BY public.attribution_order_asset_consumable_accessory.id;


--
-- TOC entry 247 (class 1259 OID 82474)
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
-- TOC entry 248 (class 1259 OID 82481)
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
-- TOC entry 6038 (class 0 OID 0)
-- Dependencies: 248
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_stock_item_accessory_id_seq OWNED BY public.attribution_order_asset_stock_item_accessory.id;


--
-- TOC entry 249 (class 1259 OID 82482)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 82487)
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
-- TOC entry 251 (class 1259 OID 82488)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 82494)
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
-- TOC entry 253 (class 1259 OID 82495)
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
-- TOC entry 254 (class 1259 OID 82502)
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
-- TOC entry 255 (class 1259 OID 82503)
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
-- TOC entry 256 (class 1259 OID 82518)
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 82524)
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
-- TOC entry 258 (class 1259 OID 82525)
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
-- TOC entry 259 (class 1259 OID 82526)
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 82532)
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
-- TOC entry 261 (class 1259 OID 82533)
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
-- TOC entry 6039 (class 0 OID 0)
-- Dependencies: 261
-- Name: COLUMN authentication_log.event_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.event_type IS 'LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PWD_CHANGE, ACCOUNT_LOCK';


--
-- TOC entry 6040 (class 0 OID 0)
-- Dependencies: 261
-- Name: COLUMN authentication_log.failure_reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.failure_reason IS 'e.g., Invalid Password, User Disabled';


--
-- TOC entry 262 (class 1259 OID 82538)
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
-- TOC entry 6041 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE backorder_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.backorder_report IS 'Renamed from bon_de_reste';


--
-- TOC entry 263 (class 1259 OID 82545)
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
-- TOC entry 264 (class 1259 OID 82553)
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
-- TOC entry 265 (class 1259 OID 82561)
-- Name: broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broken_item_report (
    broken_item_report_id integer NOT NULL,
    digital_copy bytea
);


ALTER TABLE public.broken_item_report OWNER TO postgres;

--
-- TOC entry 6042 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE broken_item_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.broken_item_report IS 'Equivalent of C5';


--
-- TOC entry 266 (class 1259 OID 82567)
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
-- TOC entry 6043 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE company_asset_request; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.company_asset_request IS 'Demande du mat�riel';


--
-- TOC entry 267 (class 1259 OID 82574)
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
-- TOC entry 268 (class 1259 OID 82579)
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
-- TOC entry 269 (class 1259 OID 82583)
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
-- TOC entry 270 (class 1259 OID 82590)
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
-- TOC entry 271 (class 1259 OID 82594)
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
-- TOC entry 272 (class 1259 OID 82601)
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
-- TOC entry 6044 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE consumable_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_is_assigned_to_person IS 'The first person is the one to whom the consumable is assign';


--
-- TOC entry 273 (class 1259 OID 82611)
-- Name: consumable_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_asset (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_a_consumable_model_id_not_null NOT NULL,
    asset_model_id integer CONSTRAINT c_is_compatible_with_a_asset_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 82616)
-- Name: consumable_is_compatible_with_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_stock_item (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_si_consumable_model_id_not_null NOT NULL,
    stock_item_model_id integer CONSTRAINT c_is_compatible_with_si_stock_item_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_stock_item OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 82621)
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
-- TOC entry 276 (class 1259 OID 82627)
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
-- TOC entry 6045 (class 0 OID 0)
-- Dependencies: 276
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_is_used_in_stock_item_history_id_seq OWNED BY public.consumable_is_used_in_stock_item_history.id;


--
-- TOC entry 277 (class 1259 OID 82628)
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
-- TOC entry 278 (class 1259 OID 82634)
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
-- TOC entry 279 (class 1259 OID 82641)
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
-- TOC entry 6046 (class 0 OID 0)
-- Dependencies: 279
-- Name: TABLE consumable_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_model_is_found_in_purchase_order IS 'Renamed from consumable_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 280 (class 1259 OID 82646)
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
-- TOC entry 281 (class 1259 OID 82657)
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
-- TOC entry 282 (class 1259 OID 82663)
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
-- TOC entry 283 (class 1259 OID 82668)
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
-- TOC entry 6047 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE delivery_note; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.delivery_note IS 'Renamed from bon_de_livraison';


--
-- TOC entry 284 (class 1259 OID 82675)
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
-- TOC entry 285 (class 1259 OID 82687)
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
-- TOC entry 286 (class 1259 OID 82688)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 82694)
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
-- TOC entry 288 (class 1259 OID 82695)
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
-- TOC entry 289 (class 1259 OID 82704)
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
-- TOC entry 290 (class 1259 OID 82705)
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 82713)
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
-- TOC entry 292 (class 1259 OID 82719)
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
-- TOC entry 293 (class 1259 OID 82726)
-- Name: external_maintenance_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_provider (
    external_maintenance_provider_id integer CONSTRAINT external_maintenance_provid_external_maintenance_provi_not_null NOT NULL,
    external_maintenance_provider_name character varying(48),
    external_maintenance_provider_location character varying(128)
);


ALTER TABLE public.external_maintenance_provider OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 82730)
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
-- TOC entry 295 (class 1259 OID 82736)
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
-- TOC entry 6048 (class 0 OID 0)
-- Dependencies: 295
-- Name: COLUMN external_maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 296 (class 1259 OID 82740)
-- Name: invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice (
    invoice_id integer CONSTRAINT facture_facture_id_not_null NOT NULL,
    delivery_note_id integer CONSTRAINT facture_delivery_note_id_not_null NOT NULL,
    digital_copy text
);


ALTER TABLE public.invoice OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 82747)
-- Name: location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location (
    location_id integer CONSTRAINT room_room_id_not_null NOT NULL,
    location_name character varying(30),
    location_type_id integer
);


ALTER TABLE public.location OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 82751)
-- Name: location_belongs_to_organizational_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_belongs_to_organizational_structure (
    organizational_structure_id integer CONSTRAINT room_belongs_to_organizatio_organizational_structure_i_not_null NOT NULL,
    location_id integer CONSTRAINT room_belongs_to_organizational_structure_room_id_not_null NOT NULL
);


ALTER TABLE public.location_belongs_to_organizational_structure OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 82756)
-- Name: location_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_type (
    location_type_id integer CONSTRAINT room_type_room_type_id_not_null NOT NULL,
    location_type_label character varying(60) CONSTRAINT room_type_room_type_label_not_null NOT NULL,
    location_type_code character varying(18) CONSTRAINT room_type_room_type_code_not_null NOT NULL
);


ALTER TABLE public.location_type OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 82762)
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
-- TOC entry 6049 (class 0 OID 0)
-- Dependencies: 300
-- Name: location_type_location_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_type_location_type_id_seq OWNED BY public.location_type.location_type_id;


--
-- TOC entry 301 (class 1259 OID 82763)
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
-- TOC entry 302 (class 1259 OID 82771)
-- Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_inspection_leads_to_broken_item_report (
    maintenance_id integer CONSTRAINT maintenance_inspection_leads_to_broken__maintenance_id_not_null NOT NULL,
    broken_item_report_id integer CONSTRAINT maintenance_inspection_leads_to__broken_item_report_id_not_null NOT NULL
);


ALTER TABLE public.maintenance_inspection_leads_to_broken_item_report OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 82776)
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
-- TOC entry 304 (class 1259 OID 82783)
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
-- TOC entry 305 (class 1259 OID 82793)
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
-- TOC entry 306 (class 1259 OID 82794)
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
-- TOC entry 307 (class 1259 OID 82803)
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
-- TOC entry 6050 (class 0 OID 0)
-- Dependencies: 307
-- Name: COLUMN maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 308 (class 1259 OID 82810)
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
-- TOC entry 309 (class 1259 OID 82814)
-- Name: organizational_structure_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizational_structure_relation (
    organizational_structure_id integer CONSTRAINT organizational_structure_re_organizational_structure_i_not_null NOT NULL,
    parent_organizational_structure_id integer CONSTRAINT organizational_structure_re_parent_organizational_stru_not_null NOT NULL,
    relation_id integer,
    relation_type character varying(60)
);


ALTER TABLE public.organizational_structure_relation OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 82819)
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
-- TOC entry 311 (class 1259 OID 82828)
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
-- TOC entry 6051 (class 0 OID 0)
-- Dependencies: 311
-- Name: COLUMN person_assignment.employment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_assignment.employment_type IS 'Permanent, contractual...';


--
-- TOC entry 312 (class 1259 OID 82834)
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
-- TOC entry 313 (class 1259 OID 82842)
-- Name: person_reports_problem_on_asset_included_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_consumable (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_co_report_id_not_null1 NOT NULL,
    consumable_id integer CONSTRAINT person_reports_problem_on_asset_included_consumable_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_consumabl_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_consumable OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 82848)
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
-- TOC entry 6052 (class 0 OID 0)
-- Dependencies: 314
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_consumable_id_seq OWNED BY public.person_reports_problem_on_asset_included_consumable.id;


--
-- TOC entry 315 (class 1259 OID 82849)
-- Name: person_reports_problem_on_asset_included_context; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_context (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_con_report_id_not_null NOT NULL,
    destination_location_id integer CONSTRAINT person_reports_problem_on_asset_in_destination_room_id_not_null NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_context OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 82854)
-- Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_stock_item (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_sto_report_id_not_null NOT NULL,
    stock_item_id integer CONSTRAINT person_reports_problem_on_asset_included_stock_item_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_stock_ite_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_stock_item OWNER TO postgres;

--
-- TOC entry 317 (class 1259 OID 82860)
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
-- TOC entry 6053 (class 0 OID 0)
-- Dependencies: 317
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_stock_item_id_seq OWNED BY public.person_reports_problem_on_asset_included_stock_item.id;


--
-- TOC entry 318 (class 1259 OID 82861)
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
-- TOC entry 319 (class 1259 OID 82869)
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
-- TOC entry 320 (class 1259 OID 82877)
-- Name: person_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_role_mapping (
    role_id integer NOT NULL,
    person_id integer NOT NULL
);


ALTER TABLE public.person_role_mapping OWNER TO postgres;

--
-- TOC entry 6054 (class 0 OID 0)
-- Dependencies: 320
-- Name: COLUMN person_role_mapping.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_role_mapping.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 321 (class 1259 OID 82882)
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
-- TOC entry 322 (class 1259 OID 82886)
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
-- TOC entry 323 (class 1259 OID 82890)
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
-- TOC entry 6055 (class 0 OID 0)
-- Dependencies: 323
-- Name: TABLE purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.purchase_order IS 'Renamed from bon_de_commande';


--
-- TOC entry 324 (class 1259 OID 82897)
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
-- TOC entry 6056 (class 0 OID 0)
-- Dependencies: 324
-- Name: TABLE receipt_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receipt_report IS 'This represents the "PV de réception" for the assets';


--
-- TOC entry 325 (class 1259 OID 82903)
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
-- TOC entry 6057 (class 0 OID 0)
-- Dependencies: 325
-- Name: TABLE role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.role IS 'Role is what the person can do in the system';


--
-- TOC entry 6058 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN role.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 326 (class 1259 OID 82907)
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
-- TOC entry 327 (class 1259 OID 82912)
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
-- TOC entry 328 (class 1259 OID 82916)
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
-- TOC entry 329 (class 1259 OID 82923)
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
-- TOC entry 330 (class 1259 OID 82927)
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
-- TOC entry 331 (class 1259 OID 82935)
-- Name: stock_item_consumable_destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_consumable_destruction_certificate (
    destruction_certificate_id integer CONSTRAINT destruction_certificate_destruction_certificate_id_not_null NOT NULL,
    digital_copy text,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.stock_item_consumable_destruction_certificate OWNER TO postgres;

--
-- TOC entry 332 (class 1259 OID 82941)
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
-- TOC entry 6059 (class 0 OID 0)
-- Dependencies: 332
-- Name: TABLE stock_item_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_is_assigned_to_person IS 'The first person is the one to whom the stock item is assign';


--
-- TOC entry 333 (class 1259 OID 82951)
-- Name: stock_item_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_compatible_with_asset (
    stock_item_model_id integer CONSTRAINT stock_item_is_compatible_with_asse_stock_item_model_id_not_null NOT NULL,
    asset_model_id integer NOT NULL
);


ALTER TABLE public.stock_item_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 334 (class 1259 OID 82956)
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
-- TOC entry 335 (class 1259 OID 82962)
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
-- TOC entry 336 (class 1259 OID 82969)
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
-- TOC entry 6060 (class 0 OID 0)
-- Dependencies: 336
-- Name: TABLE stock_item_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_model_is_found_in_purchase_order IS 'Renamed from stock_item_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 337 (class 1259 OID 82974)
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
-- TOC entry 338 (class 1259 OID 82985)
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
-- TOC entry 339 (class 1259 OID 82991)
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
-- TOC entry 340 (class 1259 OID 82996)
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
-- TOC entry 341 (class 1259 OID 83000)
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
-- TOC entry 342 (class 1259 OID 83016)
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
-- TOC entry 343 (class 1259 OID 83024)
-- Name: warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse (
    warehouse_id integer NOT NULL,
    warehouse_name character varying(60),
    warehouse_address character varying(128)
);


ALTER TABLE public.warehouse OWNER TO postgres;

--
-- TOC entry 6061 (class 0 OID 0)
-- Dependencies: 343
-- Name: TABLE warehouse; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.warehouse IS 'Warehouse" is in our case "ERI/2RM';


--
-- TOC entry 5295 (class 2604 OID 83028)
-- Name: asset_destruction_certificate_asset id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset ALTER COLUMN id SET DEFAULT nextval('public.asset_destruction_certificate_asset_id_seq'::regclass);


--
-- TOC entry 5296 (class 2604 OID 83029)
-- Name: asset_is_composed_of_consumable_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_consumable_history_id_seq'::regclass);


--
-- TOC entry 5297 (class 2604 OID 83030)
-- Name: asset_is_composed_of_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5298 (class 2604 OID 83031)
-- Name: asset_model_default_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_consumable_id_seq'::regclass);


--
-- TOC entry 5300 (class 2604 OID 83032)
-- Name: asset_model_default_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_stock_item_id_seq'::regclass);


--
-- TOC entry 5303 (class 2604 OID 83033)
-- Name: attribution_order_asset_consumable_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_consumable_accessory_id_seq'::regclass);


--
-- TOC entry 5304 (class 2604 OID 83034)
-- Name: attribution_order_asset_stock_item_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_stock_item_accessory_id_seq'::regclass);


--
-- TOC entry 5305 (class 2604 OID 83035)
-- Name: consumable_is_used_in_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.consumable_is_used_in_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5308 (class 2604 OID 83036)
-- Name: location_type location_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type ALTER COLUMN location_type_id SET DEFAULT nextval('public.location_type_location_type_id_seq'::regclass);


--
-- TOC entry 5310 (class 2604 OID 83037)
-- Name: person_reports_problem_on_asset_included_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_consumable_id_seq'::regclass);


--
-- TOC entry 5311 (class 2604 OID 83038)
-- Name: person_reports_problem_on_asset_included_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_stock_item_id_seq'::regclass);


--
-- TOC entry 5899 (class 0 OID 82319)
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
-- TOC entry 5900 (class 0 OID 82326)
-- Dependencies: 220
-- Data for Name: administrative_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_certificate (administrative_certificate_id, warehouse_id, attribution_order_id, receipt_report_id, interested_organization, operation, format, is_signed_by_warehouse_storage_magaziner, is_signed_by_warehouse_storage_accountant, is_signed_by_warehouse_storage_marketer, is_signed_by_warehouse_it_chief, is_signed_by_warehouse_leader, digital_copy, are_items_moved) FROM stdin;
1	1	2	1	\N	entry	\N	f	f	f	f	f	\N	f
2	1	3	2	\N	entry	\N	f	f	f	f	f	\N	f
3	1	23	3	\N	entry	\N	f	f	f	f	f	\N	f
4	1	24	1	ESAM/2RM	\N	21x27	f	f	f	f	f	\N	f
5	1	25	4	\N	entry	\N	f	f	f	f	f	\N	f
7	1	27	5	\N	entry	\N	f	f	f	f	f	\N	f
9	1	27	5	ESAM/2RM	entry	21x27	t	t	t	f	f	\N	f
6	1	2	2	ESAM/2RM	entry	21x27	t	t	t	t	t	\N	t
8	1	27	5	ESAM/2RM	entry	21x27	t	t	t	t	t	\N	t
10	1	14	6	\N	entry	\N	f	f	f	f	f	\N	f
11	1	28	7	\N	entry	\N	f	f	f	f	f	\N	f
12	1	28	8	\N	entry	\N	f	f	f	f	f	\N	f
13	1	28	7	ESAM/2RM	entry	21x27	t	t	t	t	t	administrative_certificates\\administrative_certificate_13.pdf	f
\.


--
-- TOC entry 5901 (class 0 OID 82337)
-- Dependencies: 221
-- Data for Name: asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset (asset_id, asset_model_id, attribution_order_id, destruction_certificate_id, asset_serial_number, asset_fabrication_datetime, asset_inventory_number, asset_service_tag, asset_name, asset_name_in_the_administrative_certificate, asset_arrival_datetime, asset_status) FROM stdin;
1	1	\N	\N	ABCD1234	\N	001		Latitude for Test	\N	\N	active
2	1	\N	\N	gggggg	\N	004		Another Latitude for Test	\N	\N	active
3	1	2	\N	eeeeee	\N	0088	\N	Hello	\N	\N	In Stock
4	1	3	\N	testao1	\N	999	\N	ao1	\N	\N	In Stock
6	1	5	\N	aaaa	\N	aaa	\N	aaaa	\N	\N	In Stock
8	1	\N	\N	7777z	\N	7777		rrrrrr	\N	\N	active
9	1	7	\N	1	\N	1	\N	l1	\N	\N	In Stock
10	1	7	\N	2	\N	2	\N	l2	\N	\N	In Stock
11	1	7	\N	3	\N	3	\N	l3	\N	\N	In Stock
12	1	7	\N	4	\N	4	\N	l4	\N	\N	In Stock
13	1	7	\N	5	\N	5	\N	l5	\N	\N	In Stock
14	1	8	\N	eeeeeee	\N	eeeeee	\N	eeeeeeeeee	\N	\N	In Stock
15	1	10	\N	xxxx	\N	xxxx	\N	xxxx	\N	\N	In Stock
16	1	11	\N	zzz	\N	zzz	\N	zzzz	\N	\N	In Stock
17	1	12	\N	bbbb	\N	bbbb	\N	bbbb	\N	\N	In Stock
18	1	13	\N	yyy	\N	yyy	\N	yyy	\N	\N	In Stock
19	1	14	\N	ttt	\N	ttt	\N	ttt	\N	\N	In Stock
20	1	15	\N	2222	\N	2222	\N	2222	\N	\N	In Stock
21	1	16	\N	test_accessory	\N	test_a	\N	test_accessory	\N	\N	In Stock
22	1	17	\N	test_accessory	\N	1	\N	test_accessory	\N	\N	In Stock
23	1	18	\N	test_accessory	\N	1	\N	test_accessory	\N	\N	In Stock
24	1	19	\N	test_accessory	\N	321	\N	test_accessory	\N	\N	In Stock
25	1	20	\N	test_a	\N	321	\N	test_a	\N	\N	In Stock
26	1	21	\N	test_a	\N	321	\N	test_a	\N	\N	In Stock
5	1	4	1	777	\N	777	\N	ao_test	\N	\N	destroyed
7	1	\N	2	7777	\N	7777		latest_test_for_attributes	\N	\N	destroyed
27	1	22	\N	test_b	\N	test_b	\N	test_b	\N	\N	failed
28	1	\N	\N	uiyu	\N	\N	\N	testing_deletion	\N	\N	failed
29	1	23	\N	fdf	\N	dfd	\N	dfd	\N	\N	in_stock
30	1	24	\N	888	\N	888	\N	888	\N	\N	in_stock
31	1	25	\N	7	\N	7	\N	7	\N	\N	in_stock
32	1	26	\N	9	\N	9	\N	9	\N	\N	not_delivered_to_company
33	1	27	\N	444	\N	444	\N	444	\N	\N	in_stock
34	1	28	\N	jjjjj	\N	444	\N	jjjjj	\N	\N	in_stock
\.


--
-- TOC entry 5902 (class 0 OID 82342)
-- Dependencies: 222
-- Data for Name: asset_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_definition (asset_attribute_definition_id, data_type, unit, description, maintenance_domain) FROM stdin;
2	number	mAh	Battery Capacity	\N
3	string	\N	Disk Type	\N
1	number	Inch	Screen Resolution	network
\.


--
-- TOC entry 5903 (class 0 OID 82346)
-- Dependencies: 223
-- Data for Name: asset_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_value (asset_attribute_definition_id, asset_id, value_string, value_bool, value_date, value_number) FROM stdin;
2	1	\N	f	\N	84000.000000
2	7	\N	f	\N	90000.000000
3	7	SSD NVMe	f	\N	\N
2	8	\N	f	\N	90000.000000
3	8	SSD NVMe	f	\N	\N
2	9	\N	f	\N	90000.000000
3	9	SSD NVMe	f	\N	\N
2	10	\N	f	\N	90000.000000
3	10	SSD NVMe	f	\N	\N
2	11	\N	f	\N	90000.000000
3	11	SSD NVMe	f	\N	\N
2	12	\N	f	\N	90000.000000
3	12	SSD NVMe	f	\N	\N
2	13	\N	f	\N	90000.000000
3	13	SSD NVMe	f	\N	\N
2	14	\N	f	\N	90000.000000
3	14	SSD NVMe	f	\N	\N
2	15	\N	f	\N	90000.000000
3	15	SSD NVMe	f	\N	\N
2	16	\N	f	\N	90000.000000
3	16	SSD NVMe	f	\N	\N
2	17	\N	f	\N	90000.000000
3	17	SSD NVMe	f	\N	\N
2	18	\N	f	\N	90000.000000
3	18	SSD NVMe	f	\N	\N
2	19	\N	f	\N	90000.000000
3	19	SSD NVMe	f	\N	\N
2	20	\N	f	\N	90000.000000
3	20	SSD NVMe	f	\N	\N
2	21	\N	f	\N	90000.000000
3	21	SSD NVMe	f	\N	\N
2	22	\N	f	\N	90000.000000
3	22	SSD NVMe	f	\N	\N
2	23	\N	f	\N	90000.000000
3	23	SSD NVMe	f	\N	\N
2	24	\N	f	\N	90000.000000
3	24	SSD NVMe	f	\N	\N
2	25	\N	f	\N	90000.000000
3	25	SSD NVMe	f	\N	\N
2	26	\N	f	\N	90000.000000
3	26	SSD NVMe	f	\N	\N
2	27	\N	f	\N	90000.000000
3	27	SSD NVMe	f	\N	\N
2	29	\N	f	\N	90000.000000
3	29	SSD NVMe	f	\N	\N
2	30	\N	f	\N	90000.000000
3	30	SSD NVMe	f	\N	\N
2	31	\N	f	\N	90000.000000
3	31	SSD NVMe	f	\N	\N
2	32	\N	f	\N	90000.000000
3	32	SSD NVMe	f	\N	\N
2	33	\N	f	\N	90000.000000
3	33	SSD NVMe	f	\N	\N
2	34	\N	f	\N	90000.000000
3	34	SSD NVMe	f	\N	\N
\.


--
-- TOC entry 5904 (class 0 OID 82353)
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
99	Test Brand	TEST	t	\N
\.


--
-- TOC entry 5905 (class 0 OID 82357)
-- Dependencies: 225
-- Data for Name: asset_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_condition_history (asset_condition_history_id, asset_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
1	1	1	rtrterte	\N	\N	\N	2026-02-24 16:45:06.487383
\.


--
-- TOC entry 5906 (class 0 OID 82365)
-- Dependencies: 226
-- Data for Name: asset_destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_destruction_certificate (asset_destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
1	destruction_certificates\\destruction_certificate_1.pdf	2026-03-07 19:35:07.915855
2	destruction_certificates\\destruction_certificate_2.pdf	2026-03-07 20:37:18.994153
\.


--
-- TOC entry 5907 (class 0 OID 82371)
-- Dependencies: 227
-- Data for Name: asset_destruction_certificate_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_destruction_certificate_asset (id, asset_destruction_certificate_id, asset_id, external_maintenance_id) FROM stdin;
\.


--
-- TOC entry 5909 (class 0 OID 82379)
-- Dependencies: 229
-- Data for Name: asset_failed_external_maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_failed_external_maintenance (asset_id, external_maintenance_id, failed_datetime) FROM stdin;
\.


--
-- TOC entry 5910 (class 0 OID 82384)
-- Dependencies: 230
-- Data for Name: asset_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_assigned_to_person (person_id, asset_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
9	1	1008	1	2026-02-18 10:43:00	2026-02-18 10:43:39.70789	Good	f	\N
9	1	1008	2	2026-02-18 13:11:00	2026-02-24 18:31:56.830366	Good	f	10
9	1	10	3	2026-02-24 18:47:00	2026-02-25 21:40:04.701229	Good	f	10
9	1	1008	4	2026-02-27 13:22:00	\N	Good	t	\N
\.


--
-- TOC entry 5911 (class 0 OID 82394)
-- Dependencies: 231
-- Data for Name: asset_is_composed_of_consumable_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_composed_of_consumable_history (consumable_id, asset_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
1	1	9	2026-02-24 14:36:44.320341	2026-02-24 14:54:41.833996	1	\N
1	1	11	2026-02-24 15:18:18.900011	2026-02-24 15:18:38.518978	2	\N
1	1	1	2026-02-24 15:18:18.900011	\N	3	\N
3	18	\N	2026-02-26 18:48:24.987492	\N	4	13
4	18	\N	2026-02-26 18:48:24.987492	\N	5	13
5	18	\N	2026-02-26 18:48:24.987492	\N	6	13
6	19	\N	2026-02-26 18:52:01.622721	\N	7	14
7	19	\N	2026-02-26 18:52:01.622721	\N	8	14
8	19	\N	2026-02-26 18:52:01.622721	\N	9	14
9	20	\N	2026-03-05 09:43:47.845016	\N	10	15
10	20	\N	2026-03-05 09:43:47.845016	\N	11	15
11	20	\N	2026-03-05 09:43:47.845016	\N	12	15
12	21	\N	2026-03-05 09:52:35.335618	\N	13	16
13	21	\N	2026-03-05 09:52:35.335618	\N	14	16
14	21	\N	2026-03-05 09:52:35.335618	\N	15	16
15	22	\N	2026-03-05 09:52:45.405337	\N	16	17
16	22	\N	2026-03-05 09:52:45.405337	\N	17	17
17	22	\N	2026-03-05 09:52:45.405337	\N	18	17
18	23	\N	2026-03-05 09:58:06.74593	\N	19	18
19	23	\N	2026-03-05 09:58:06.74593	\N	20	18
20	23	\N	2026-03-05 09:58:06.74593	\N	21	18
21	24	\N	2026-03-05 09:58:19.980049	\N	22	19
22	24	\N	2026-03-05 09:58:19.980049	\N	23	19
23	24	\N	2026-03-05 09:58:19.980049	\N	24	19
24	25	\N	2026-03-05 09:58:38.143718	\N	25	20
25	25	\N	2026-03-05 09:58:38.143718	\N	26	20
26	25	\N	2026-03-05 09:58:38.143718	\N	27	20
27	26	\N	2026-03-05 09:58:49.566797	\N	28	21
28	26	\N	2026-03-05 09:58:49.566797	\N	29	21
29	26	\N	2026-03-05 09:58:49.566797	\N	30	21
30	27	\N	2026-03-05 10:00:24.532552	\N	31	22
31	27	\N	2026-03-05 10:00:24.532552	\N	32	22
32	27	\N	2026-03-05 10:00:24.532552	\N	33	22
34	29	\N	2026-03-08 21:49:50.235485	\N	34	23
35	29	\N	2026-03-08 21:49:50.235485	\N	35	23
36	29	\N	2026-03-08 21:49:50.235485	\N	36	23
37	30	\N	2026-03-08 21:51:59.673037	\N	37	24
38	30	\N	2026-03-08 21:51:59.673037	\N	38	24
39	30	\N	2026-03-08 21:51:59.673037	\N	39	24
40	31	\N	2026-03-08 21:58:19.176273	\N	40	25
41	31	\N	2026-03-08 21:58:19.176273	\N	41	25
42	31	\N	2026-03-08 21:58:19.176273	\N	42	25
43	32	\N	2026-03-08 22:10:31.268079	\N	43	26
44	32	\N	2026-03-08 22:10:31.268079	\N	44	26
45	32	\N	2026-03-08 22:10:31.268079	\N	45	26
46	33	\N	2026-03-08 22:31:08.228783	\N	46	27
47	33	\N	2026-03-08 22:31:08.228783	\N	47	27
48	33	\N	2026-03-08 22:31:08.228783	\N	48	27
49	34	\N	2026-03-11 22:12:57.398369	\N	49	28
50	34	\N	2026-03-11 22:12:57.398369	\N	50	28
51	34	\N	2026-03-11 22:12:57.398369	\N	51	28
\.


--
-- TOC entry 5913 (class 0 OID 82401)
-- Dependencies: 233
-- Data for Name: asset_is_composed_of_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_composed_of_stock_item_history (stock_item_id, asset_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
4	18	\N	2026-02-26 18:48:24.987492	\N	1	13
5	18	\N	2026-02-26 18:48:24.987492	\N	2	13
6	18	\N	2026-02-26 18:48:24.987492	\N	3	13
7	18	\N	2026-02-26 18:48:24.987492	\N	4	13
8	19	\N	2026-02-26 18:52:01.622721	\N	5	14
9	19	\N	2026-02-26 18:52:01.622721	\N	6	14
10	19	\N	2026-02-26 18:52:01.622721	\N	7	14
11	19	\N	2026-02-26 18:52:01.622721	\N	8	14
12	20	\N	2026-03-05 09:43:47.845016	\N	9	15
13	20	\N	2026-03-05 09:43:47.845016	\N	10	15
14	20	\N	2026-03-05 09:43:47.845016	\N	11	15
15	20	\N	2026-03-05 09:43:47.845016	\N	12	15
16	21	\N	2026-03-05 09:52:35.335618	\N	13	16
17	21	\N	2026-03-05 09:52:35.335618	\N	14	16
18	21	\N	2026-03-05 09:52:35.335618	\N	15	16
19	21	\N	2026-03-05 09:52:35.335618	\N	16	16
20	22	\N	2026-03-05 09:52:45.405337	\N	17	17
21	22	\N	2026-03-05 09:52:45.405337	\N	18	17
22	22	\N	2026-03-05 09:52:45.405337	\N	19	17
23	22	\N	2026-03-05 09:52:45.405337	\N	20	17
24	23	\N	2026-03-05 09:58:06.74593	\N	21	18
25	23	\N	2026-03-05 09:58:06.74593	\N	22	18
26	23	\N	2026-03-05 09:58:06.74593	\N	23	18
27	23	\N	2026-03-05 09:58:06.74593	\N	24	18
28	24	\N	2026-03-05 09:58:19.980049	\N	25	19
29	24	\N	2026-03-05 09:58:19.980049	\N	26	19
30	24	\N	2026-03-05 09:58:19.980049	\N	27	19
31	24	\N	2026-03-05 09:58:19.980049	\N	28	19
32	25	\N	2026-03-05 09:58:38.143718	\N	29	20
33	25	\N	2026-03-05 09:58:38.143718	\N	30	20
34	25	\N	2026-03-05 09:58:38.143718	\N	31	20
35	25	\N	2026-03-05 09:58:38.143718	\N	32	20
36	26	\N	2026-03-05 09:58:49.566797	\N	33	21
37	26	\N	2026-03-05 09:58:49.566797	\N	34	21
38	26	\N	2026-03-05 09:58:49.566797	\N	35	21
39	26	\N	2026-03-05 09:58:49.566797	\N	36	21
41	27	\N	2026-03-05 10:00:24.532552	\N	37	22
42	27	\N	2026-03-05 10:00:24.532552	\N	38	22
43	27	\N	2026-03-05 10:00:24.532552	\N	39	22
44	27	\N	2026-03-05 10:00:24.532552	\N	40	22
59	29	\N	2026-03-08 21:49:50.235485	\N	41	23
60	29	\N	2026-03-08 21:49:50.235485	\N	42	23
61	29	\N	2026-03-08 21:49:50.235485	\N	43	23
62	29	\N	2026-03-08 21:49:50.235485	\N	44	23
63	30	\N	2026-03-08 21:51:59.673037	\N	45	24
64	30	\N	2026-03-08 21:51:59.673037	\N	46	24
65	30	\N	2026-03-08 21:51:59.673037	\N	47	24
66	30	\N	2026-03-08 21:51:59.673037	\N	48	24
67	31	\N	2026-03-08 21:58:19.176273	\N	49	25
68	31	\N	2026-03-08 21:58:19.176273	\N	50	25
69	31	\N	2026-03-08 21:58:19.176273	\N	51	25
70	31	\N	2026-03-08 21:58:19.176273	\N	52	25
71	32	\N	2026-03-08 22:10:31.268079	\N	53	26
72	32	\N	2026-03-08 22:10:31.268079	\N	54	26
73	32	\N	2026-03-08 22:10:31.268079	\N	55	26
74	32	\N	2026-03-08 22:10:31.268079	\N	56	26
75	33	\N	2026-03-08 22:31:08.228783	\N	57	27
76	33	\N	2026-03-08 22:31:08.228783	\N	58	27
77	33	\N	2026-03-08 22:31:08.228783	\N	59	27
78	33	\N	2026-03-08 22:31:08.228783	\N	60	27
81	34	\N	2026-03-11 22:12:57.398369	\N	61	28
82	34	\N	2026-03-11 22:12:57.398369	\N	62	28
83	34	\N	2026-03-11 22:12:57.398369	\N	63	28
84	34	\N	2026-03-11 22:12:57.398369	\N	64	28
\.


--
-- TOC entry 5915 (class 0 OID 82408)
-- Dependencies: 235
-- Data for Name: asset_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model (asset_model_id, asset_brand_id, asset_type_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	10	1	Latitude 5531	L5531	2022	\N	t		24
\.


--
-- TOC entry 5916 (class 0 OID 82414)
-- Dependencies: 236
-- Data for Name: asset_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_attribute_value (asset_model_id, asset_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	2	f	\N	90000.000000	\N
1	3	f	SSD NVMe	\N	\N
\.


--
-- TOC entry 5917 (class 0 OID 82421)
-- Dependencies: 237
-- Data for Name: asset_model_default_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_consumable (id, asset_model_id, consumable_model_id, quantity, notes) FROM stdin;
1	1	1	1	\N
3	1	2	2	
\.


--
-- TOC entry 5919 (class 0 OID 82430)
-- Dependencies: 239
-- Data for Name: asset_model_default_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_stock_item (id, asset_model_id, stock_item_model_id, quantity, notes) FROM stdin;
1	1	1	4	
\.


--
-- TOC entry 5921 (class 0 OID 82439)
-- Dependencies: 241
-- Data for Name: asset_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_movement (asset_movement_id, asset_id, source_location_id, destination_location_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status) FROM stdin;
2	1	25	23	\N	15	Received by company from external maintenance	2026-02-25 17:23:00.701309	pending
4	8	1	1	\N	\N	Test	2026-02-24 14:00:00	pending
6	8	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 18:36:10.905642	pending
7	8	25	23	\N	\N	Received by company from external maintenance	2026-02-25 19:10:58.9252	pending
8	1	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 19:12:03.55924	pending
9	1	25	23	\N	\N	Received by company from external maintenance	2026-02-25 19:12:13.122159	pending
10	5	1	1	\N	\N	Test	2026-02-24 14:00:00	pending
12	5	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 19:15:15.144053	pending
13	5	25	23	\N	18	Received by company from external maintenance	2026-02-25 19:48:44.195044	pending
15	5	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 19:49:36.157495	pending
16	5	25	24	\N	\N	Received by company from external maintenance	2026-02-25 21:09:12.749941	pending
17	1	1	2	\N	\N	T	2026-02-24 15:18:18.900011	pending
18	1	2	10	\N	\N	manual_move	2026-02-25 21:43:07.132937	pending
19	1	10	16	\N	\N	manual_move	2026-02-25 21:56:34.143978	pending
21	5	24	25	\N	\N	Sent to external maintenance provider	2026-03-05 10:42:33.143959	pending
22	5	25	24	\N	\N	Received by company from external maintenance	2026-03-05 10:43:00.078978	pending
24	19	1	1	\N	\N	Test	2026-02-24 14:00:00	pending
26	5	24	3	\N	\N	return_to_owner	2026-03-05 19:48:50.361256	accepted
27	5	3	6	\N	\N	return_to_owner	2026-03-05 19:58:13.301479	rejected
25	19	1	24	\N	\N	maintenance_create	2026-03-05 19:07:39.314811	rejected
20	1	16	24	\N	\N	maintenance_create	2026-02-26 10:37:18.829114	rejected
14	5	23	24	\N	\N	maintenance_create	2026-02-25 19:48:59.451954	rejected
11	5	1	24	\N	\N	maintenance_create	2026-02-25 19:14:30.707723	rejected
5	8	1	24	\N	\N	maintenance_create	2026-02-25 18:32:32.441818	rejected
3	1	23	24	\N	\N	maintenance_create	2026-02-25 17:27:15.737894	rejected
28	1	1	24	\N	\N	maintenance_create	2026-03-05 20:21:26.514046	accepted
29	8	23	24	\N	\N	maintenance_create	2026-03-05 20:25:41.255104	accepted
30	8	24	23	\N	\N	return_to_owner	2026-03-05 20:33:25.531498	accepted
23	1	1	1	\N	\N	Maintenance	2026-03-05 14:00:00	rejected
1	1	1	25	\N	\N	Maintenance	2026-02-24 14:00:00	rejected
31	1	24	24	\N	\N	maintenance_create_30	2026-03-05 21:39:34.254958	accepted
32	1	24	24	\N	\N	maintenance_create_31	2026-03-05 21:49:01.078305	accepted
33	5	6	24	\N	\N	maintenance_create	2026-03-05 22:05:21.049463	accepted
34	1	24	10	\N	\N	manual_move	2026-03-08 13:49:05.328438	pending
35	1	10	1	\N	\N	manual_move	2026-03-08 13:49:25.71656	pending
36	3	5	5	\N	\N	manual_move	2026-03-09 12:54:45.410556	pending
37	33	11	11	\N	\N	manual_move	2026-03-09 14:03:42.571173	pending
38	3	5	11	\N	\N	manual_move	2026-03-09 14:04:46.929252	pending
39	3	11	14	\N	\N	manual_move	2026-03-09 14:12:59.526981	pending
40	33	11	2	\N	\N	manual_move	2026-03-09 14:13:10.940877	pending
41	1	1	24	\N	\N	maintenance_create	2026-03-13 09:02:57.74474	pending
42	8	23	24	\N	\N	maintenance_create	2026-03-13 09:45:07.996495	pending
\.


--
-- TOC entry 5922 (class 0 OID 82450)
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
\.


--
-- TOC entry 5923 (class 0 OID 82456)
-- Dependencies: 243
-- Data for Name: asset_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type_attribute (asset_attribute_definition_id, asset_type_id, is_mandatory, default_value) FROM stdin;
1	1	t	15.6
2	1	t	\N
\.


--
-- TOC entry 5924 (class 0 OID 82461)
-- Dependencies: 244
-- Data for Name: attribution_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order (attribution_order_id, warehouse_id, attribution_order_full_code, attribution_order_date, is_signed_by_central_chief, attribution_order_barcode) FROM stdin;
2	1	oooooo	2026-02-23	f	barcode_test
3	1	attribution_order_test	2026-02-23	f	barcode_test
4	1	attribution_order_test	2026-02-23	f	barcode_test
5	1	reeeee	2026-02-23	f	zzzzz
6	1	nyhahahahahaaaaaa	2026-02-24	f	oooooo
7	1	uuuuuuuuuuuu	2026-02-26	f	uuuuuuuuuuuuuu
8	1	eeeeeeeeeeeee	2026-02-26	f	eeeeeeeeeeeeeee
9	1	nnnnnnnnnnnnnnn	2026-02-26	f	nnnnnnnnnnnnnnn
10	1	xxxx	2026-02-26	f	xxxx
11	1	zzzz	2026-02-26	f	zzzz
12	1	bbbb	2026-02-26	f	bbbb
13	1	yyy	2026-02-26	f	yyy
14	1	ttt	2026-02-26	f	ttt
15	1	abcdefg	2026-03-05	f	abcdefg
16	1	test_accessory	2026-03-05	f	test_accessory
17	1	test_accessory	2026-03-05	f	test_accessory
18	1	test_accessory	2026-03-05	f	test_accessory
19	1	test_accessory	2026-03-05	f	test_accessory
20	1	test_a	2026-03-05	f	test_a
21	1	test_a	2026-03-05	f	test_a
22	1	test_b	2026-03-05	f	test_b
23	1	sdfdsfsd	2026-03-08	f	ddd
24	1	888	2026-03-08	f	888
25	1	7	2026-03-08	f	7
26	1	9	2026-03-08	f	9
27	1	444	2026-03-08	f	444
28	1	jjjjj	2026-03-11	f	jjjjj
\.


--
-- TOC entry 5925 (class 0 OID 82466)
-- Dependencies: 245
-- Data for Name: attribution_order_asset_consumable_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_consumable_accessory (id, attribution_order_id, asset_id, consumable_id) FROM stdin;
1	22	27	33
\.


--
-- TOC entry 5927 (class 0 OID 82474)
-- Dependencies: 247
-- Data for Name: attribution_order_asset_stock_item_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_stock_item_accessory (id, attribution_order_id, asset_id, stock_item_id) FROM stdin;
1	21	26	40
\.


--
-- TOC entry 5929 (class 0 OID 82482)
-- Dependencies: 249
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- TOC entry 5931 (class 0 OID 82488)
-- Dependencies: 251
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5933 (class 0 OID 82495)
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
-- TOC entry 5935 (class 0 OID 82503)
-- Dependencies: 255
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$1200000$ceTbB0O5bCmm57swQmkEmg$/LZsB44AZf4ZGvXPW6p/4orTP53jVw3AJ38DC/OLrXE=	2026-02-10 14:11:34.116607+01	t	admin			admin@example.com	t	t	2026-02-09 21:42:30.666222+01
\.


--
-- TOC entry 5936 (class 0 OID 82518)
-- Dependencies: 256
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- TOC entry 5939 (class 0 OID 82526)
-- Dependencies: 259
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5941 (class 0 OID 82533)
-- Dependencies: 261
-- Data for Name: authentication_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_log (log_id, user_id, attempted_username, event_type, ip_address, event_timestamp, failure_reason) FROM stdin;
\.


--
-- TOC entry 5942 (class 0 OID 82538)
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
-- TOC entry 5943 (class 0 OID 82545)
-- Dependencies: 263
-- Data for Name: backorder_report_consumable_model_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report_consumable_model_line (backorder_report_id, consumable_model_id, quantity_ordered, quantity_received, quantity_remaining) FROM stdin;
\.


--
-- TOC entry 5944 (class 0 OID 82553)
-- Dependencies: 264
-- Data for Name: backorder_report_stock_item_model_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report_stock_item_model_line (backorder_report_id, stock_item_model_id, quantity_ordered, quantity_received, quantity_remaining) FROM stdin;
\.


--
-- TOC entry 5945 (class 0 OID 82561)
-- Dependencies: 265
-- Data for Name: broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broken_item_report (broken_item_report_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 5946 (class 0 OID 82567)
-- Dependencies: 266
-- Data for Name: company_asset_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_asset_request (company_asset_request_id, attribution_order_id, is_signed_by_company, administrative_serial_number, title_of_demand, organization_body_designation, register_number_or_book_journal_of_corpse, register_number_or_book_journal_of_establishment, is_signed_by_company_leader, is_signed_by_regional_provider, is_signed_by_company_representative, digital_copy) FROM stdin;
1	3	t	ASN	Hello	ESAM	1234	\N	t	t	t	\N
3	23	f	dsfdsf	sdfdsfsd	zzz	zzz	zzz	f	f	f	\N
4	24	f	888	888	888	888	888	f	f	f	\N
5	25	f	77	77	77	77	77	f	f	f	\N
2	2	f	aaaa	aaaa	aaaa	aaaaaa	\N	f	t	t	\N
7	28	t	jjjjj	jjjjj	jjjjj	44	44	t	t	t	company_asset_requests\\company_asset_request_7.pdf
6	27	t	444	444	444	444	444	t	t	t	\N
\.


--
-- TOC entry 5947 (class 0 OID 82574)
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
\.


--
-- TOC entry 5948 (class 0 OID 82579)
-- Dependencies: 268
-- Data for Name: consumable_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_definition (consumable_attribute_definition_id, consumable_type_code, data_type, unit, description, maintenance_domain) FROM stdin;
1	\N	number	m	Number of Meters	\N
2	\N	string	\N	Color	\N
3	\N	number	page(s)	Number of pages	\N
\.


--
-- TOC entry 5949 (class 0 OID 82583)
-- Dependencies: 269
-- Data for Name: consumable_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_value (consumable_id, consumable_attribute_definition_id, value_string, value_bool, value_date, value_number) FROM stdin;
33	1	\N	f	\N	500.000000
52	1	\N	f	\N	500.000000
53	1	\N	f	\N	500.000000
\.


--
-- TOC entry 5950 (class 0 OID 82590)
-- Dependencies: 270
-- Data for Name: consumable_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_brand (consumable_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	BIC	BIC	t	\N
2	Schneider	SCHNEIDER	t	\N
3	DELL	DELL	t	brands/consumables/Dell_whh9uC9.svg
\.


--
-- TOC entry 5951 (class 0 OID 82594)
-- Dependencies: 271
-- Data for Name: consumable_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_condition_history (consumable_condition_history_id, consumable_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 5952 (class 0 OID 82601)
-- Dependencies: 272
-- Data for Name: consumable_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_assigned_to_person (assignment_id, consumable_id, person_id, assigned_by_person_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	1	9	10	2026-02-24 18:36:00	2026-02-24 18:36:54.831336	Good	f	\N
2	1	9	10	2026-02-24 18:37:00	2026-02-24 19:46:26.047031	Good	f	\N
3	1	9	10	2026-02-24 19:46:00	2026-02-24 19:46:46.34698	Good	f	\N
\.


--
-- TOC entry 5953 (class 0 OID 82611)
-- Dependencies: 273
-- Data for Name: consumable_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_asset (consumable_model_id, asset_model_id) FROM stdin;
1	1
\.


--
-- TOC entry 5954 (class 0 OID 82616)
-- Dependencies: 274
-- Data for Name: consumable_is_compatible_with_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_stock_item (consumable_model_id, stock_item_model_id) FROM stdin;
\.


--
-- TOC entry 5955 (class 0 OID 82621)
-- Dependencies: 275
-- Data for Name: consumable_is_used_in_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_used_in_stock_item_history (consumable_id, stock_item_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
\.


--
-- TOC entry 5957 (class 0 OID 82628)
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
-- TOC entry 5958 (class 0 OID 82634)
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
-- TOC entry 5959 (class 0 OID 82641)
-- Dependencies: 279
-- Data for Name: consumable_model_is_found_in_purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_is_found_in_purchase_order (consumable_model_id, purchase_order_id, quantity_ordered, quantity_received, unit_price) FROM stdin;
1	6	1	1	10.00
1	7	1	1	30.00
\.


--
-- TOC entry 5960 (class 0 OID 82646)
-- Dependencies: 280
-- Data for Name: consumable_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_movement (consumable_movement_id, destination_location_id, source_location_id, maintenance_step_id, external_maintenance_step_id, consumable_id, movement_reason, movement_datetime, status) FROM stdin;
1	2	1	\N	\N	1	Test	2026-02-24 14:00:00	pending
2	24	2	3	\N	1	maintenance_step_fulfill_request	2026-02-24 13:08:52.724791	pending
3	24	24	4	\N	1	maintenance_step_fulfill_request	2026-02-24 13:12:06.094659	pending
4	24	24	3	\N	1	maintenance_step_fulfill_request	2026-02-24 13:12:12.392508	pending
5	2	1	2	\N	2	Maintenance	2026-02-24 14:00:00	pending
6	24	24	6	\N	1	maintenance_step_fulfill_request	2026-02-24 14:22:24.343271	pending
7	24	24	7	\N	1	maintenance_step_fulfill_request	2026-02-24 14:27:20.441491	pending
8	8	24	8	\N	1	maintenance_step_fulfill_request	2026-02-24 14:31:22.629371	pending
9	1	8	9	\N	1	maintenance_step_fulfill_request	2026-02-24 14:36:25.501926	pending
10	24	1	11	\N	1	maintenance_step_fulfill_request	2026-02-24 15:18:04.954874	pending
11	24	24	12	\N	1	maintenance_step_remove	2026-02-24 15:18:38.518978	pending
12	10	24	\N	\N	1	manual_move	2026-02-24 17:38:48.64965	pending
13	16	10	\N	\N	1	manual_move	2026-02-25 21:56:34.152207	pending
14	24	16	\N	\N	1	maintenance_create	2026-02-26 10:37:18.836313	pending
15	24	1	\N	\N	6	maintenance_create	2026-03-05 19:07:39.336409	pending
16	24	1	\N	\N	7	maintenance_create	2026-03-05 19:07:39.336409	pending
17	24	1	\N	\N	8	maintenance_create	2026-03-05 19:07:39.336409	pending
18	10	24	\N	\N	1	manual_move	2026-03-08 13:49:05.350658	pending
19	1	10	\N	\N	1	manual_move	2026-03-08 13:49:25.717796	pending
20	11	11	\N	\N	48	manual_move	2026-03-09 14:07:46.317107	pending
21	11	11	\N	\N	47	manual_move	2026-03-09 14:07:46.366397	pending
22	11	11	\N	\N	46	manual_move	2026-03-09 14:07:46.412386	pending
23	2	11	\N	\N	46	manual_move	2026-03-09 14:13:10.945833	pending
24	2	11	\N	\N	47	manual_move	2026-03-09 14:13:10.945833	pending
25	2	11	\N	\N	48	manual_move	2026-03-09 14:13:10.945833	pending
26	5	5	\N	\N	53	manual_move	2026-03-11 22:47:35.6799	pending
27	2	5	\N	\N	53	manual_move	2026-03-11 22:48:49.445857	pending
28	1	2	\N	\N	53	manual_move	2026-03-11 22:52:30.59455	pending
29	24	1	\N	\N	1	maintenance_create	2026-03-13 09:02:57.77824	pending
\.


--
-- TOC entry 5961 (class 0 OID 82657)
-- Dependencies: 281
-- Data for Name: consumable_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type (consumable_type_id, consumable_type_label, consumable_type_code, photo) FROM stdin;
1	Pen	PEN	\N
2	Toner	TNR	\N
\.


--
-- TOC entry 5962 (class 0 OID 82663)
-- Dependencies: 282
-- Data for Name: consumable_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type_attribute (consumable_type_id, consumable_attribute_definition_id, is_mandatory, default_value) FROM stdin;
1	1	f	400
2	3	f	1000
\.


--
-- TOC entry 5963 (class 0 OID 82668)
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
-- TOC entry 5964 (class 0 OID 82675)
-- Dependencies: 284
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- TOC entry 5966 (class 0 OID 82688)
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
-- TOC entry 5968 (class 0 OID 82695)
-- Dependencies: 288
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2026-02-09 21:35:13.466942+01
2	auth	0001_initial	2026-02-09 21:35:13.520947+01
3	admin	0001_initial	2026-02-09 21:35:13.536427+01
4	admin	0002_logentry_remove_auto_add	2026-02-09 21:35:13.539875+01
5	admin	0003_logentry_add_action_flag_choices	2026-02-09 21:35:13.543296+01
6	contenttypes	0002_remove_content_type_name	2026-02-09 21:35:13.553676+01
7	auth	0002_alter_permission_name_max_length	2026-02-09 21:35:13.557886+01
8	auth	0003_alter_user_email_max_length	2026-02-09 21:35:13.56232+01
9	auth	0004_alter_user_username_opts	2026-02-09 21:35:13.565955+01
10	auth	0005_alter_user_last_login_null	2026-02-09 21:35:13.570822+01
11	auth	0006_require_contenttypes_0002	2026-02-09 21:35:13.571613+01
12	auth	0007_alter_validators_add_error_messages	2026-02-09 21:35:13.574916+01
13	auth	0008_alter_user_username_max_length	2026-02-09 21:35:13.582377+01
14	auth	0009_alter_user_last_name_max_length	2026-02-09 21:35:13.587288+01
15	auth	0010_alter_group_name_max_length	2026-02-09 21:35:13.592134+01
16	auth	0011_update_proxy_permissions	2026-02-09 21:35:13.595774+01
17	auth	0012_alter_user_first_name_max_length	2026-02-09 21:35:13.600871+01
18	sessions	0001_initial	2026-02-09 21:35:13.606896+01
19	api	0001_initial	2026-02-27 23:50:21.335982+01
20	api	0002_add_movement_status	2026-03-05 12:46:27.050422+01
21	api	0003_movement_status_state	2026-03-05 13:20:25.537862+01
22	api	0004_attribution_order_accessories_state	2026-03-05 13:21:33.410195+01
23	api	0005_problem_report_included_items	2026-03-05 21:48:34.355955+01
24	api	0006_problem_report_included_items_add_id	2026-03-05 21:59:17.864914+01
25	api	0007_rename_bdc_to_purchase_order_tables	2026-03-05 23:46:55.07278+01
26	api	0008_rename_french_order_tables	2026-03-05 23:54:15.333719+01
27	api	0009_remove_quantity_invoiced_from_purchase_order_lines	2026-03-06 21:51:56.72384+01
28	api	0010_add_backorder_report_remaining_snapshots	2026-03-06 22:22:25.824041+01
29	api	0011_delivery_note_digital_copy_path	2026-03-07 00:12:55.879718+01
30	api	0012_rename_facture_to_invoice	2026-03-07 00:27:25.538201+01
31	api	0013_invoice_digital_copy_path	2026-03-07 00:36:54.86352+01
32	api	0014_add_acceptance_report_table	2026-03-07 00:55:29.667095+01
33	api	0015_destruction_certificate_digital_copy_path	2026-03-07 21:14:18.87631+01
34	api	0016_destructioncertificate	2026-03-07 21:46:17.565109+01
35	api	0017_asset_and_stock_destruction_certificates_split	2026-03-08 11:59:41.821767+01
36	api	0018_rename_room_to_location	2026-03-08 14:09:29.726241+01
37	api	0019_rename_room_type_to_location_type	2026-03-08 14:29:12.098972+01
40	api	0020_managed_locations	2026-03-08 14:46:30.729114+01
41	api	0021_admin_cert_and_receipt_report_digital_copy_path	2026-03-09 13:34:34.571281+01
42	api	0022_remaining_digital_copy_paths	2026-03-09 13:34:34.635118+01
43	api	0023_admin_cert_items_moved_flag	2026-03-09 15:12:36.134437+01
44	api	0024_location_location_type	2026-03-12 00:34:58.831837+01
45	api	0025_remove_brand_photos	2026-03-12 00:34:58.849577+01
\.


--
-- TOC entry 5970 (class 0 OID 82705)
-- Dependencies: 290
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
mwube6mtzimgwmghul5d0r6qos8lqeqe	.eJxVjDsOwjAQBe_iGllr_Isp6XMGa-3d4ACypTipEHeHSCmgfTPzXiLitpa4dV7iTOIilDj9bgnzg-sO6I711mRudV3mJHdFHrTLsRE_r4f7d1Cwl2_NGbPT5EgF9FYTZW8QXLA8KRwAskNzBgbwnsGHkAIwDWYCT4Taknh_APYiOC0:1vpY5p:xY5WGtSgTAbInJSRivcUir-NtXutxfuZCHkLUnB8v1k	2026-02-23 21:42:49.784307+01
\.


--
-- TOC entry 5971 (class 0 OID 82713)
-- Dependencies: 291
-- Data for Name: external_maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance (external_maintenance_id, maintenance_id, item_received_by_maintenance_provider_datetime, item_sent_to_company_datetime, item_sent_to_external_maintenance_datetime, item_received_by_company_datetime, external_maintenance_status, external_maintenance_provider_id) FROM stdin;
15	6	2026-02-25 19:10:43.248767	2026-02-25 19:10:44.85882	2026-02-25 16:47:48.007051	2026-02-25 17:50:44.506794	SENT_TO_COMPANY	1
20	11	2026-02-25 18:36:14.480341	2026-02-25 19:10:53.140802	2026-02-25 18:36:10.905642	2026-02-25 19:10:58.9252	RECEIVED_BY_COMPANY	\N
19	9	2026-02-25 19:12:04.772794	2026-02-25 19:12:05.275227	2026-02-25 19:12:03.55924	2026-02-25 19:12:13.122159	RECEIVED_BY_COMPANY	1
21	13	2026-02-25 19:25:20.443418	2026-02-25 19:48:38.564456	2026-02-25 19:15:15.144053	2026-02-25 19:48:44.195044	RECEIVED_BY_COMPANY	1
22	14	2026-02-25 21:09:07.141482	2026-02-25 21:09:07.961406	2026-02-25 19:49:36.157495	2026-02-25 21:09:12.749941	RECEIVED_BY_COMPANY	1
12	2	\N	\N	\N	\N	DRAFT	\N
17	9	\N	\N	\N	\N	DRAFT	\N
18	9	\N	\N	\N	\N	DRAFT	\N
1	2	\N	\N	2026-02-25 14:22:54.112201	2026-02-25 17:42:26.6307	RECEIVED_BY_COMPANY	1
2	2	\N	\N	2026-02-25 14:22:56.570189	2026-02-25 17:50:44.489415	RECEIVED_BY_COMPANY	1
3	2	\N	\N	2026-02-25 14:22:57.191263	2026-02-25 17:50:44.498536	RECEIVED_BY_COMPANY	1
4	2	\N	\N	2026-02-25 14:22:57.699601	2026-02-25 17:50:44.499533	RECEIVED_BY_COMPANY	1
5	2	\N	\N	2026-02-25 14:22:58.18353	2026-02-25 17:50:44.500333	RECEIVED_BY_COMPANY	1
6	2	\N	\N	2026-02-25 14:22:58.394858	2026-02-25 17:50:44.501133	RECEIVED_BY_COMPANY	1
7	2	\N	\N	2026-02-25 14:22:58.555811	2026-02-25 17:50:44.501892	RECEIVED_BY_COMPANY	1
8	2	\N	\N	2026-02-25 14:22:58.680769	2026-02-25 17:50:44.502718	RECEIVED_BY_COMPANY	1
9	2	\N	\N	2026-02-25 14:22:58.80651	2026-02-25 17:50:44.503771	RECEIVED_BY_COMPANY	1
10	2	\N	\N	2026-02-25 14:26:31.406191	2026-02-25 17:50:44.504599	RECEIVED_BY_COMPANY	1
11	2	2026-02-25 16:03:54.705252	2026-02-25 16:08:22.50347	2026-02-25 15:58:02.690244	2026-02-25 16:12:21.329171	RECEIVED_BY_COMPANY	1
13	5	\N	\N	2026-02-25 16:39:08.267671	2026-02-25 17:50:44.505289	RECEIVED_BY_COMPANY	1
14	5	2026-02-25 16:46:39.015312	\N	2026-02-25 16:46:33.685796	2026-02-25 17:50:44.506065	RECEIVED_BY_COMPANY	1
16	7	2026-02-25 17:18:33.260457	2026-02-25 17:21:49.599658	2026-02-25 16:48:58.966051	2026-02-25 17:23:00.701309	RECEIVED_BY_COMPANY	1
23	20	2026-03-05 10:42:35.738189	2026-03-05 10:42:56.066583	2026-03-05 10:42:33.143959	2026-03-05 10:43:00.078978	RECEIVED_BY_COMPANY	1
\.


--
-- TOC entry 5972 (class 0 OID 82719)
-- Dependencies: 292
-- Data for Name: external_maintenance_document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_document (external_maintenance_document_id, external_maintenance_id, document_is_signed, item_is_received_by_maintenance_provider, maintenance_provider_final_decision, digital_copy) FROM stdin;
\.


--
-- TOC entry 5973 (class 0 OID 82726)
-- Dependencies: 293
-- Data for Name: external_maintenance_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_provider (external_maintenance_provider_id, external_maintenance_provider_name, external_maintenance_provider_location) FROM stdin;
1	ERMT/2RM	\N
\.


--
-- TOC entry 5974 (class 0 OID 82730)
-- Dependencies: 294
-- Data for Name: external_maintenance_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_step (external_maintenance_step_id, external_maintenance_id, external_maintenance_typical_step_id, start_datetime, end_datetime, is_successful) FROM stdin;
1	1	1	2026-02-25 14:22:54.11489	\N	\N
2	2	1	2026-02-25 14:22:56.572603	\N	\N
3	3	1	2026-02-25 14:22:57.193648	\N	\N
4	4	1	2026-02-25 14:22:57.701708	\N	\N
5	5	1	2026-02-25 14:22:58.185762	\N	\N
6	6	1	2026-02-25 14:22:58.397069	\N	\N
7	7	1	2026-02-25 14:22:58.558559	\N	\N
8	8	1	2026-02-25 14:22:58.682706	\N	\N
9	9	1	2026-02-25 14:22:58.810195	\N	\N
10	10	1	2026-02-25 14:26:31.408041	\N	\N
11	11	1	2026-02-25 15:58:02.690244	\N	\N
12	13	1	2026-02-25 16:39:08.267671	\N	\N
13	14	1	2026-02-25 16:46:33.685796	\N	\N
14	15	1	2026-02-25 16:47:48.007051	\N	\N
15	16	1	2026-02-25 16:48:58.966051	\N	\N
16	21	1	2026-02-25 19:15:37.098518	\N	\N
17	21	1	2026-02-25 19:25:31.697392	\N	\N
18	21	1	2026-02-25 19:47:58.843111	\N	\N
\.


--
-- TOC entry 5975 (class 0 OID 82736)
-- Dependencies: 295
-- Data for Name: external_maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_typical_step (external_maintenance_typical_step_id, estimated_cost, actual_cost, maintenance_type, description, maintenance_domain) FROM stdin;
1	\N	\N	Hardware	Removing the motherboard	it
2	\N	\N	Hardware	Removing the RAM	it
\.


--
-- TOC entry 5976 (class 0 OID 82740)
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
-- TOC entry 5977 (class 0 OID 82747)
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
-- TOC entry 5978 (class 0 OID 82751)
-- Dependencies: 298
-- Data for Name: location_belongs_to_organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_belongs_to_organizational_structure (organizational_structure_id, location_id) FROM stdin;
\.


--
-- TOC entry 5979 (class 0 OID 82756)
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
-- TOC entry 5981 (class 0 OID 82763)
-- Dependencies: 301
-- Data for Name: maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance (maintenance_id, asset_id, performed_by_person_id, approved_by_maintenance_chief_id, is_approved_by_maintenance_chief, start_datetime, end_datetime, description, is_successful, digital_copy, stock_item_id, consumable_id, maintenance_status) FROM stdin;
1	1	8	6	f	2026-02-14 17:07:17.751632	2026-02-14 17:07:17.751644	Not working anymore	\N	\N	\N	\N	pending
2	1	7	6	\N	2026-02-23 22:47:12.21312	2026-02-23 22:47:12.213123	Not working	\N	\N	\N	\N	pending
5	1	8	6	\N	2026-02-25 16:38:01.44123	2026-02-25 16:38:01.441233		\N	\N	\N	\N	pending
6	1	8	6	\N	2026-02-25 16:47:21.838938	2026-02-25 16:47:21.838941		\N	\N	\N	\N	pending
7	1	8	6	\N	2026-02-25 16:48:31.689731	2026-02-25 16:48:31.689734		\N	\N	\N	\N	pending
9	1	8	6	\N	2026-02-25 17:27:15.741927	2026-02-25 17:27:15.741931		\N	\N	\N	\N	pending
11	8	8	6	\N	2026-02-25 18:32:32.44581	2026-02-25 18:32:32.445813		\N	\N	\N	\N	pending
13	5	8	6	\N	2026-02-25 19:14:30.713778	2026-02-25 19:14:30.713783		\N	\N	\N	\N	pending
14	5	8	6	\N	2026-02-25 19:48:59.462099	2026-02-25 19:48:59.462102		\N	\N	\N	\N	pending
16	5	8	6	\N	2026-02-26 10:41:10.479606	2026-02-26 10:42:05.948082		\N	\N	\N	\N	pending
18	5	8	6	\N	2026-02-27 12:45:23.607389	\N		\N	\N	\N	\N	pending
19	1	8	6	\N	2026-03-05 10:35:30.062656	2026-03-05 10:35:57.332713	testing it	\N	\N	\N	\N	pending
22	1	8	6	\N	2026-03-05 13:53:35.073981	2026-03-05 13:53:35.073985	vxcvxcvbcxwbvcxbxcvb	\N	\N	\N	\N	pending
23	19	8	6	\N	2026-03-05 19:07:39.404225	2026-03-05 19:20:24.180518		\N	\N	\N	\N	pending
21	5	8	6	\N	2026-03-05 13:52:14.540741	2026-03-05 19:54:34.126901		t	\N	\N	\N	pending
20	5	8	6	\N	2026-03-05 10:36:05.990421	2026-03-05 19:57:54.111245		t	\N	\N	\N	pending
17	5	8	6	\N	2026-02-26 11:25:21.892116	2026-03-05 20:02:43.392467		t	\N	\N	\N	pending
24	1	8	6	\N	2026-03-05 20:05:04.887608	2026-03-05 20:05:04.887613	vxcvxcvbcxwbvcxbxcvb	\N	\N	\N	\N	pending
25	1	8	6	\N	2026-03-05 20:08:24.497725	2026-03-05 20:08:24.497731	fdgdfgdfgfdgdfg	\N	\N	\N	\N	pending
26	1	8	6	\N	2026-03-05 20:21:26.52105	2026-03-05 20:21:26.521053	fsdfdsfsdfsd	\N	\N	\N	\N	pending
27	8	8	6	\N	2026-03-05 20:25:41.294952	2026-03-05 20:32:54.890332	cccccccccccc	t	\N	\N	\N	pending
28	1	8	6	t	\N	\N	fffffffffffff	\N	\N	\N	\N	pending
29	1	8	6	t	\N	\N	iiiiiiiiiiiiiiiiiiii	\N	\N	\N	\N	pending
30	1	8	6	t	\N	\N	ddddddddddddddddddd	\N	\N	\N	\N	pending
31	1	8	6	t	\N	\N	ppppppppppppppppppppppp	\N	\N	\N	\N	pending
32	5	8	6	\N	2026-03-05 22:06:06.83373	\N		\N	\N	\N	\N	pending
33	1	8	6	\N	\N	\N		\N	\N	\N	\N	pending
34	1	1015	6	\N	\N	\N	gfdgfdgfdgfd	\N	\N	\N	\N	pending
35	1	1015	6	\N	\N	\N		\N	\N	\N	\N	pending
36	8	1015	6	\N	2026-03-13 09:45:35.547097	\N		\N	\N	\N	\N	pending
\.


--
-- TOC entry 5982 (class 0 OID 82771)
-- Dependencies: 302
-- Data for Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_inspection_leads_to_broken_item_report (maintenance_id, broken_item_report_id) FROM stdin;
\.


--
-- TOC entry 5983 (class 0 OID 82776)
-- Dependencies: 303
-- Data for Name: maintenance_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step (maintenance_step_id, maintenance_id, maintenance_typical_step_id, person_id, asset_condition_history_id, stock_item_condition_history_id, consumable_condition_history_id, start_datetime, end_datetime, is_successful, maintenance_step_status) FROM stdin;
16	14	1	8	\N	\N	\N	\N	\N	f	started
1	1	1	8	\N	\N	\N	\N	2026-02-14 17:08:33.856	t	started
2	1	1	7	\N	\N	\N	\N	\N	\N	started
4	2	1	7	\N	\N	\N	\N	\N	\N	started
3	2	1	7	\N	\N	\N	\N	2026-02-24 10:26:50.106	t	started
17	16	1	8	\N	\N	\N	\N	\N	f	started
5	2	2	7	\N	\N	\N	\N	\N	f	started
6	2	3	7	\N	\N	\N	\N	\N	f	done
7	2	3	7	\N	\N	\N	\N	\N	f	In Progress
8	2	3	7	\N	\N	\N	\N	\N	f	In Progress
18	17	2	8	\N	\N	\N	\N	\N	f	done
9	2	3	7	\N	\N	\N	\N	\N	f	done
19	17	3	8	\N	\N	\N	\N	\N	f	done
10	2	4	7	\N	\N	\N	\N	\N	f	done
20	17	1	8	\N	\N	\N	\N	\N	f	done
21	17	3	8	\N	\N	\N	\N	\N	f	done
11	2	3	7	\N	\N	\N	\N	\N	f	done
22	17	1	8	\N	\N	\N	\N	\N	f	done
23	17	1	8	\N	\N	\N	2026-02-26 11:46:25.172882	\N	f	done
24	17	1	8	\N	\N	\N	2026-02-26 11:48:38.635254	\N	f	done
25	17	3	8	\N	\N	\N	2026-02-26 11:55:31.981944	\N	f	done
12	2	4	7	1	\N	\N	\N	\N	f	In Progress
13	2	4	7	\N	\N	\N	\N	\N	f	In Progress
14	9	1	8	\N	\N	\N	\N	\N	f	done
15	14	1	8	\N	\N	\N	\N	\N	f	started
26	18	1	8	\N	\N	\N	\N	\N	f	cancelled
27	18	3	8	\N	\N	\N	\N	\N	f	done
28	18	4	8	\N	\N	\N	\N	\N	f	failed (to be sent to a higher level)
29	18	2	8	\N	\N	\N	2026-02-27 20:32:30.659994	\N	f	started
30	20	2	8	\N	\N	\N	\N	\N	f	cancelled
31	32	3	8	\N	\N	\N	\N	\N	f	started
32	32	2	8	\N	\N	\N	\N	\N	f	done
33	36	6	1015	\N	\N	\N	\N	\N	f	pending
34	32	4	8	\N	\N	\N	\N	\N	f	pending
\.


--
-- TOC entry 5984 (class 0 OID 82783)
-- Dependencies: 304
-- Data for Name: maintenance_step_attribute_change; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_attribute_change (maintenance_step_attribute_change_id, target_type, target_id, attribute_definition_id, value_string, value_bool, value_date, value_number, created_at_datetime, created_by_user_id, applied_at_datetime, maintenance_step_id) FROM stdin;
1	asset	\N	1	\N	\N	\N	17.000000	2026-03-13 10:50:29.990918+01	16	\N	33
2	asset	\N	2	\N	\N	\N	10000.000000	2026-03-13 10:50:41.584347+01	16	\N	33
3	asset	\N	1	\N	\N	\N	120.000000	2026-03-13 10:54:49.639895+01	16	\N	33
\.


--
-- TOC entry 5986 (class 0 OID 82794)
-- Dependencies: 306
-- Data for Name: maintenance_step_item_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_item_request (maintenance_step_item_request_id, maintenance_step_id, requested_by_person_id, request_type, status, created_at, fulfilled_at, stock_item_id, consumable_id, source_location_id, destination_location_id, note, fulfilled_by_person_id, requested_stock_item_model_id, requested_consumable_model_id, rejected_by_person_id, rejected_at) FROM stdin;
1	3	7	consumable	fulfilled	2026-02-24 12:50:47.196758	2026-02-24 13:08:52.726347	\N	1	2	24	\N	1007	\N	1	\N	\N
2	4	7	consumable	fulfilled	2026-02-24 13:09:27.627814	2026-02-24 13:12:06.10286	\N	1	24	24	\N	1007	\N	1	\N	\N
3	3	7	consumable	fulfilled	2026-02-24 13:11:48.091138	2026-02-24 13:12:12.400728	\N	1	24	24	\N	1007	\N	1	\N	\N
7	6	7	consumable	fulfilled	2026-02-24 14:21:57.281028	2026-02-24 14:22:24.351304	\N	1	24	24	\N	1007	\N	1	\N	\N
8	7	7	consumable	fulfilled	2026-02-24 14:27:04.168756	2026-02-24 14:27:20.449556	\N	1	24	24	\N	1007	\N	1	\N	\N
9	8	7	consumable	fulfilled	2026-02-24 14:31:04.101799	2026-02-24 14:31:22.637592	\N	1	24	8	\N	1007	\N	1	\N	\N
10	9	7	consumable	fulfilled	2026-02-24 14:36:14.774264	2026-02-24 14:36:25.510774	\N	1	8	1	\N	1007	\N	1	\N	\N
11	11	7	consumable	fulfilled	2026-02-24 15:17:12.556955	2026-02-24 15:18:04.956704	\N	1	1	24	\N	1007	\N	1	\N	\N
12	16	8	consumable	rejected	2026-02-25 21:09:56.091914	\N	\N	\N	\N	\N	I don't care	\N	\N	1	1007	2026-02-25 22:21:42.041551+01
6	4	7	consumable	rejected	2026-02-24 13:59:33.470765	\N	\N	\N	\N	\N	\N	\N	\N	1	1007	2026-02-25 22:21:45.468259+01
5	3	7	consumable	rejected	2026-02-24 13:51:19.450004	\N	\N	\N	\N	\N	\N	\N	\N	1	1007	2026-02-25 22:21:46.767208+01
4	3	7	consumable	rejected	2026-02-24 13:13:19.565931	\N	\N	\N	\N	\N	\N	\N	\N	1	1007	2026-02-25 22:21:48.310342+01
13	31	8	consumable	rejected	2026-03-05 22:25:01.852688	\N	\N	\N	\N	\N	uu	\N	\N	1	1007	2026-03-05 23:26:31.141574+01
\.


--
-- TOC entry 5987 (class 0 OID 82803)
-- Dependencies: 307
-- Data for Name: maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_typical_step (maintenance_typical_step_id, estimated_cost, actual_cost, description, maintenance_type, operation_type, maintenance_domain) FROM stdin;
1	1000.00	700.00	Changing the thermal paste	Hardware	change	it
2	\N	\N	Unmounting the old RAM	Hardware	change	it
3	\N	\N	Adding a pen	Hardware	add	it
4	\N	\N	Removing a pen	Hardware	remove	it
5	\N	\N	Network Hardware Diagnostic	Hardware	inspect	network
6	\N	\N	Network Software Configuration	Software	change	network
\.


--
-- TOC entry 5988 (class 0 OID 82810)
-- Dependencies: 308
-- Data for Name: organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure (organizational_structure_id, structure_code, structure_name, structure_type, is_active) FROM stdin;
1	IT	Information Technology	Bureau	t
2	MNT	Maintenance	Section	t
\.


--
-- TOC entry 5989 (class 0 OID 82814)
-- Dependencies: 309
-- Data for Name: organizational_structure_relation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_relation (organizational_structure_id, parent_organizational_structure_id, relation_id, relation_type) FROM stdin;
2	1	\N	
\.


--
-- TOC entry 5990 (class 0 OID 82819)
-- Dependencies: 310
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person (person_id, first_name, last_name, sex, birth_date, is_approved) FROM stdin;
1	System	Administrator	Male  	2001-08-21	t
6	Bahaa Eddine	ZAOUI	Male  	2001-08-21	t
7	Mohamed	MERINE	Male  	1990-01-01	t
8	Mohsin	AMOURA	Male  	2001-07-03	t
9	Mohamed	NEDJOUH	Male  	1994-02-05	t
10	Daoud	BEN SI Messaoud	Male  	2002-02-27	t
1002	Main	Tech	M     	1990-01-01	t
1003	Other	Tech	M     	1995-01-01	t
1006	Stock	Responsible	Male  	1990-01-01	t
1007	Stock	Responsible	Male  	1990-01-01	t
1008	Asset	Responsible	Male  	1990-01-01	t
1009	IT	Bureau Chief	Male  	1990-01-01	t
1010	Director	Admin & Support	Male  	1990-01-01	t
1011	Director	Admin & Support	Male  	1990-01-01	t
1012	Director	Admin & Support	Male  	1990-01-01	t
1013	Protection & Security	Bureau Chief	Male  	1990-01-01	t
1014	School	Headquarter	Male  	1990-01-01	t
1015	Amal	BOULEFRED	Male  	1990-01-01	t
\.


--
-- TOC entry 5991 (class 0 OID 82828)
-- Dependencies: 311
-- Data for Name: person_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_assignment (assignment_id, position_id, person_id, assignment_start_date, assignment_end_date, employment_type) FROM stdin;
\.


--
-- TOC entry 5992 (class 0 OID 82834)
-- Dependencies: 312
-- Data for Name: person_reports_problem_on_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset (asset_id, person_id, report_id, report_datetime, owner_observation) FROM stdin;
1	9	2	2026-02-14 17:06:27.445859	Not working
1	9	3	2026-03-05 13:12:13.628346	erfezrferfdsfs
1	9	4	2026-03-05 13:12:43.36963	dsffsdfdsfsd
1	9	5	2026-03-05 13:13:58.762413	fggggggggggggg
1	9	6	2026-03-05 13:14:22.095577	fhfhfhfhfhfhfhfhfhc
1	9	7	2026-03-05 13:52:44.199805	vxcvxcvbcxwbvcxbxcvb
1	9	8	2026-03-05 20:05:44.657487	cvbvcb
1	9	9	2026-03-05 20:07:03.386414	fgfdgdfg
1	9	10	2026-03-05 20:07:49.985744	fdgdfgdfgfdgdfg
1	9	11	2026-03-05 20:15:37.73134	fsdfdsfsdfsd
1	9	12	2026-03-05 20:59:36.606775	fffffffffffff
1	9	13	2026-03-05 21:07:34.676984	zzzzzzzzzzzzzz
1	9	14	2026-03-05 21:31:33.324209	iiiiiiiiiiiiiiiiiiii
1	9	15	2026-03-05 21:39:08.197022	ddddddddddddddddddd
1	9	16	2026-03-05 21:48:37.72482	ppppppppppppppppppppppp
\.


--
-- TOC entry 5993 (class 0 OID 82842)
-- Dependencies: 313
-- Data for Name: person_reports_problem_on_asset_included_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_consumable (report_id, consumable_id, id) FROM stdin;
\.


--
-- TOC entry 5995 (class 0 OID 82849)
-- Dependencies: 315
-- Data for Name: person_reports_problem_on_asset_included_context; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_context (report_id, destination_location_id) FROM stdin;
13	24
\.


--
-- TOC entry 5996 (class 0 OID 82854)
-- Dependencies: 316
-- Data for Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_stock_item (report_id, stock_item_id, id) FROM stdin;
13	1	2
\.


--
-- TOC entry 5998 (class 0 OID 82861)
-- Dependencies: 318
-- Data for Name: person_reports_problem_on_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_consumable (person_id, consumable_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 5999 (class 0 OID 82869)
-- Dependencies: 319
-- Data for Name: person_reports_problem_on_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_stock_item (person_id, stock_item_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 6000 (class 0 OID 82877)
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
-- TOC entry 6001 (class 0 OID 82882)
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
-- TOC entry 6002 (class 0 OID 82886)
-- Dependencies: 322
-- Data for Name: position; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."position" (position_id, position_code, position_label, description) FROM stdin;
1	HR	Human Resources Service Chief	
2	ITBC	IT Bureau Chief	
\.


--
-- TOC entry 6003 (class 0 OID 82890)
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
-- TOC entry 6004 (class 0 OID 82897)
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
-- TOC entry 6005 (class 0 OID 82903)
-- Dependencies: 325
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (role_id, role_code, role_label, description) FROM stdin;
1	superuser	Superuser	Full system access
2	maintenance_chief	Maintenance Chief	Responsible for maintenance operations
4	exploitation_chief	Exploitation Chief	\N
99	technician	Technician	\N
98	maintenance_chief	Maintenance Chief	\N
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
-- TOC entry 6006 (class 0 OID 82907)
-- Dependencies: 326
-- Data for Name: stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item (stock_item_id, maintenance_step_id, stock_item_model_id, stock_item_consumable_destruction_certificate_id, stock_item_fabrication_datetime, stock_item_name, stock_item_inventory_number, stock_item_warranty_expiry_in_months, stock_item_name_in_administrative_certificate, stock_item_arrival_datetime, stock_item_status) FROM stdin;
1	\N	1	\N	\N	m1	001	12		\N	active
2	\N	1	\N	\N	m2	000	\N	\N	\N	active
3	\N	1	\N	\N	m3	003	\N	\N	\N	active
4	\N	1	\N	\N	yyy	yyy	\N	\N	\N	Included with Asset
5	\N	1	\N	\N	yyy	yyy	\N	\N	\N	Included with Asset
6	\N	1	\N	\N	yyy	yyy	\N	\N	\N	Included with Asset
7	\N	1	\N	\N	yyy	yyy	\N	\N	\N	Included with Asset
8	\N	1	\N	\N	ttt	ttt	\N	\N	\N	Included with Asset
9	\N	1	\N	\N	ttt	ttt	\N	\N	\N	Included with Asset
10	\N	1	\N	\N	ttt	ttt	\N	\N	\N	Included with Asset
11	\N	1	\N	\N	ttt	ttt	\N	\N	\N	Included with Asset
12	\N	1	\N	\N	Stock item model 1 (included with 2222)	\N	\N	\N	\N	Included with Asset
13	\N	1	\N	\N	Stock item model 1 (included with 2222)	\N	\N	\N	\N	Included with Asset
14	\N	1	\N	\N	Stock item model 1 (included with 2222)	\N	\N	\N	\N	Included with Asset
15	\N	1	\N	\N	Stock item model 1 (included with 2222)	\N	\N	\N	\N	Included with Asset
16	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
17	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
18	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
19	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
20	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
21	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
22	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
23	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
24	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
25	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
26	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
27	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
28	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
29	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
30	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
31	\N	1	\N	\N	M1 (included with test_accessory)	\N	\N	\N	\N	Included with Asset
32	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
33	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
34	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
35	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
36	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
37	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
38	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
39	\N	1	\N	\N	M1 (included with test_a)	\N	\N	\N	\N	Included with Asset
40	\N	1	\N	\N	test_accessory	test_a	\N	\N	\N	active
41	\N	1	\N	\N	M1 (included with test_b)	\N	\N	\N	\N	Included with Asset
42	\N	1	\N	\N	M1 (included with test_b)	\N	\N	\N	\N	Included with Asset
43	\N	1	\N	\N	M1 (included with test_b)	\N	\N	\N	\N	Included with Asset
44	\N	1	\N	\N	M1 (included with test_b)	\N	\N	\N	\N	Included with Asset
45	\N	1	\N	\N	p1	p1	\N	\N	\N	active
46	\N	1	\N	\N	p2	p2	\N	\N	\N	active
47	\N	1	\N	\N	p3	p3	\N	\N	\N	active
48	\N	1	\N	\N	mmm1	mmm1	\N	\N	\N	active
49	\N	1	\N	\N	mmm2	mmm2	\N	\N	\N	active
50	\N	1	\N	\N	mmm3	mmm3	\N	\N	\N	active
51	\N	1	\N	\N	mmm4	mmm4	\N	\N	\N	active
52	\N	1	\N	\N	mmm5	mmm5	\N	\N	\N	active
53	\N	1	\N	\N	mm1	mm1	\N	\N	\N	active
54	\N	1	\N	\N	d1	d1	\N	\N	\N	active
55	\N	1	\N	\N	e1	e1	\N	\N	\N	active
56	\N	1	\N	\N	u	u	\N	\N	\N	active
57	\N	1	\N	\N	f	d	\N	\N	\N	active
58	\N	1	\N	\N	f	d	\N	\N	\N	active
59	\N	1	\N	\N	M1 (included with dfd)	\N	\N	\N	\N	Included with Asset
60	\N	1	\N	\N	M1 (included with dfd)	\N	\N	\N	\N	Included with Asset
61	\N	1	\N	\N	M1 (included with dfd)	\N	\N	\N	\N	Included with Asset
62	\N	1	\N	\N	M1 (included with dfd)	\N	\N	\N	\N	Included with Asset
63	\N	1	\N	\N	M1 (included with 888)	\N	\N	\N	\N	Included with Asset
64	\N	1	\N	\N	M1 (included with 888)	\N	\N	\N	\N	Included with Asset
65	\N	1	\N	\N	M1 (included with 888)	\N	\N	\N	\N	Included with Asset
66	\N	1	\N	\N	M1 (included with 888)	\N	\N	\N	\N	Included with Asset
67	\N	1	\N	\N	M1 (included with 7)	\N	\N	\N	\N	Included with Asset
68	\N	1	\N	\N	M1 (included with 7)	\N	\N	\N	\N	Included with Asset
69	\N	1	\N	\N	M1 (included with 7)	\N	\N	\N	\N	Included with Asset
70	\N	1	\N	\N	M1 (included with 7)	\N	\N	\N	\N	Included with Asset
71	\N	1	\N	\N	Stock item model 1 (included with 9)	\N	\N	\N	\N	Included with Asset
72	\N	1	\N	\N	Stock item model 1 (included with 9)	\N	\N	\N	\N	Included with Asset
73	\N	1	\N	\N	Stock item model 1 (included with 9)	\N	\N	\N	\N	Included with Asset
74	\N	1	\N	\N	Stock item model 1 (included with 9)	\N	\N	\N	\N	Included with Asset
75	\N	1	\N	\N	M1 (included with 444)	\N	\N	\N	\N	Included with Asset
76	\N	1	\N	\N	M1 (included with 444)	\N	\N	\N	\N	Included with Asset
77	\N	1	\N	\N	M1 (included with 444)	\N	\N	\N	\N	Included with Asset
78	\N	1	\N	\N	M1 (included with 444)	\N	\N	\N	\N	Included with Asset
79	\N	1	\N	\N	azerty2	82	\N	\N	\N	not_delivered_to_company
80	\N	1	\N	\N	azerty1	81	\N	\N	\N	not_delivered_to_company
81	\N	1	\N	\N	jjjjj1	11	\N	\N	\N	Included with Asset
82	\N	1	\N	\N	jjjjj2	12	\N	\N	\N	Included with Asset
83	\N	1	\N	\N	jjjjj3	13	\N	\N	\N	Included with Asset
84	\N	1	\N	\N	jjjjj4	14	\N	\N	\N	Included with Asset
85	\N	1	\N	\N	Bahaddin	0000	\N	\N	\N	not_delivered_to_company
86	\N	1	\N	\N	Veronica	555	\N	\N	\N	not_delivered_to_company
\.


--
-- TOC entry 6007 (class 0 OID 82912)
-- Dependencies: 327
-- Data for Name: stock_item_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_definition (stock_item_attribute_definition_id, unit, description, data_type, maintenance_domain) FROM stdin;
1	\N	Number of Clicks	number	\N
2	mm	Length	number	\N
\.


--
-- TOC entry 6008 (class 0 OID 82916)
-- Dependencies: 328
-- Data for Name: stock_item_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_value (stock_item_attribute_definition_id, stock_item_id, value_string, value_bool, value_date, value_number) FROM stdin;
1	1	\N	f	\N	900000.000000
1	2	\N	f	\N	1200000.000000
1	3	\N	f	\N	1200000.000000
2	3	\N	f	\N	150.000000
1	40	\N	f	\N	1200000.000000
2	40	\N	f	\N	150.000000
1	45	\N	f	\N	1200000.000000
2	45	\N	f	\N	150.000000
1	46	\N	f	\N	1200000.000000
2	46	\N	f	\N	150.000000
1	47	\N	f	\N	1200000.000000
2	47	\N	f	\N	150.000000
1	48	\N	f	\N	1200000.000000
2	48	\N	f	\N	150.000000
1	49	\N	f	\N	1200000.000000
2	49	\N	f	\N	150.000000
1	50	\N	f	\N	1200000.000000
2	50	\N	f	\N	150.000000
1	51	\N	f	\N	1200000.000000
2	51	\N	f	\N	150.000000
1	52	\N	f	\N	1200000.000000
2	52	\N	f	\N	150.000000
1	53	\N	f	\N	1200000.000000
2	53	\N	f	\N	150.000000
1	54	\N	f	\N	1200000.000000
2	54	\N	f	\N	150.000000
1	55	\N	f	\N	1200000.000000
2	55	\N	f	\N	150.000000
1	56	\N	f	\N	1200000.000000
2	56	\N	f	\N	150.000000
1	57	\N	f	\N	1200000.000000
2	57	\N	f	\N	150.000000
1	58	\N	f	\N	1200000.000000
2	58	\N	f	\N	150.000000
1	79	\N	f	\N	1200000.000000
2	79	\N	f	\N	150.000000
1	80	\N	f	\N	1200000.000000
2	80	\N	f	\N	150.000000
1	85	\N	f	\N	1200000.000000
2	85	\N	f	\N	150.000000
1	86	\N	f	\N	1200000.000000
2	86	\N	f	\N	150.000000
\.


--
-- TOC entry 6009 (class 0 OID 82923)
-- Dependencies: 329
-- Data for Name: stock_item_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_brand (stock_item_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	ASA	ASA	t	\N
2	HP	HP	t	\N
3	Acer	ACER	t	\N
\.


--
-- TOC entry 6010 (class 0 OID 82927)
-- Dependencies: 330
-- Data for Name: stock_item_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_condition_history (stock_item_condition_history_id, stock_item_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 6011 (class 0 OID 82935)
-- Dependencies: 331
-- Data for Name: stock_item_consumable_destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_consumable_destruction_certificate (destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
1	destruction_certificates\\destruction_certificate_1.pdf	2026-03-07 19:35:07.915855
2	destruction_certificates\\destruction_certificate_2.pdf	2026-03-07 20:37:18.994153
\.


--
-- TOC entry 6012 (class 0 OID 82941)
-- Dependencies: 332
-- Data for Name: stock_item_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_assigned_to_person (stock_item_id, person_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	9	10	1	2026-02-24 18:35:00	2026-02-24 18:36:03.552901	Good	f	\N
1	9	10	2	2026-02-24 18:37:00	2026-02-24 18:44:53.614377	Good	f	\N
1	9	10	3	2026-02-24 18:52:00	\N	Good	t	\N
\.


--
-- TOC entry 6013 (class 0 OID 82951)
-- Dependencies: 333
-- Data for Name: stock_item_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_compatible_with_asset (stock_item_model_id, asset_model_id) FROM stdin;
\.


--
-- TOC entry 6014 (class 0 OID 82956)
-- Dependencies: 334
-- Data for Name: stock_item_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model (stock_item_model_id, stock_item_type_id, stock_item_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	1	1	M1	M1	2020	\N	t		12
\.


--
-- TOC entry 6015 (class 0 OID 82962)
-- Dependencies: 335
-- Data for Name: stock_item_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_attribute_value (stock_item_attribute_definition_id, stock_item_model_id, value_bool, value_string, value_date, value_number) FROM stdin;
1	1	f	\N	\N	1200000.000000
2	1	f	\N	\N	150.000000
\.


--
-- TOC entry 6016 (class 0 OID 82969)
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
-- TOC entry 6017 (class 0 OID 82974)
-- Dependencies: 337
-- Data for Name: stock_item_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_movement (stock_item_movement_id, stock_item_id, source_location_id, destination_location_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status) FROM stdin;
1	1	1	1	\N	\N	Testing	2026-02-24 14:00:00	accepted
3	1	24	24	\N	\N	problem_report_include	2026-03-05 13:12:43.36963	pending
4	1	24	24	\N	\N	problem_report_include	2026-03-05 13:13:58.762413	pending
5	1	24	24	\N	\N	problem_report_include	2026-03-05 13:14:22.095577	accepted
2	1	1	24	\N	\N	problem_report_include	2026-03-05 13:12:13.628346	rejected
6	1	24	24	\N	\N	problem_report_include	2026-03-05 13:52:44.199805	pending
7	8	1	24	\N	\N	maintenance_create	2026-03-05 19:07:39.336409	pending
8	9	1	24	\N	\N	maintenance_create	2026-03-05 19:07:39.336409	pending
9	10	1	24	\N	\N	maintenance_create	2026-03-05 19:07:39.336409	pending
10	11	1	24	\N	\N	maintenance_create	2026-03-05 19:07:39.336409	pending
11	1	24	24	\N	\N	problem_report_include	2026-03-05 20:05:44.657487	pending
12	1	24	24	\N	\N	problem_report_include	2026-03-05 20:07:03.386414	pending
13	1	24	24	\N	\N	problem_report_include	2026-03-05 20:07:49.985744	pending
14	1	24	24	\N	\N	problem_report_include	2026-03-05 20:15:37.73134	pending
15	1	24	24	\N	\N	problem_report_include_28	2026-03-05 21:00:04.101165	accepted
16	1	24	24	\N	\N	problem_report_include_29	2026-03-05 21:31:55.538547	pending
17	1	24	24	\N	\N	problem_report_include_30	2026-03-05 21:39:34.223698	accepted
18	1	24	24	\N	\N	problem_report_include_31	2026-03-05 21:49:01.049542	accepted
19	78	11	11	\N	\N	manual_move	2026-03-09 14:07:45.941123	pending
20	77	11	11	\N	\N	manual_move	2026-03-09 14:07:46.004159	pending
21	76	11	11	\N	\N	manual_move	2026-03-09 14:07:46.064708	pending
22	75	11	11	\N	\N	manual_move	2026-03-09 14:07:46.244457	pending
23	75	11	2	\N	\N	manual_move	2026-03-09 14:13:10.945833	pending
24	76	11	2	\N	\N	manual_move	2026-03-09 14:13:10.945833	pending
25	77	11	2	\N	\N	manual_move	2026-03-09 14:13:10.945833	pending
26	78	11	2	\N	\N	manual_move	2026-03-09 14:13:10.945833	pending
27	86	5	5	\N	\N	manual_move	2026-03-11 22:47:35.630076	pending
28	86	5	2	\N	\N	manual_move	2026-03-11 22:48:49.380056	pending
29	86	2	1	\N	\N	manual_move	2026-03-11 22:52:30.536373	pending
\.


--
-- TOC entry 6018 (class 0 OID 82985)
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
-- TOC entry 6019 (class 0 OID 82991)
-- Dependencies: 339
-- Data for Name: stock_item_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type_attribute (stock_item_attribute_definition_id, stock_item_type_id, is_mandatory, default_value) FROM stdin;
1	1	f	1000000
\.


--
-- TOC entry 6020 (class 0 OID 82996)
-- Dependencies: 340
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (supplier_id, supplier_name, supplier_address, supplier_commercial_register_number, supplier_rib, supplier_cpa, supplier_fiscal_identification_number, supplier_fiscal_static_number) FROM stdin;
1	ERI/2RM	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 6021 (class 0 OID 83000)
-- Dependencies: 341
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_account (user_id, person_id, username, password_hash, created_at_datetime, disabled_at_datetime, last_login, account_status, failed_login_attempts, password_last_changed_datetime, created_by_user_id, modified_by_user_id, modified_at_datetime) FROM stdin;
3	7	mohamedmerine	430e6b4f4f7d05027d10871fe98484662dd348368c06f7c21c520ea344fdd6bf7a156dba9c0ba468e82fb867f40d39c9bae5f408202c125b772de5aee696007e	2026-02-10 20:18:23.477744	2026-02-10 20:18:23.477744	2026-03-05 10:21:43.325505	active	0	2026-02-10 20:18:23.477744	\N	\N	2026-02-10 20:18:23.477744
6	9	mohamednedjouh	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-02-11 11:50:06.603461	2026-02-11 11:50:06.603461	2026-03-05 21:54:47.307358	active	0	2026-02-11 11:50:06.603461	1	1	2026-02-11 11:50:06.603461
15	1014	school_headquarter	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.248902	2026-03-07 20:57:47.248902	2026-03-11 22:40:00.191381	active	0	2026-03-07 20:57:47.248902	\N	\N	2026-03-07 20:57:47.248902
13	1012	director_admin_sup	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.236569	2026-03-07 20:57:47.236569	2026-03-11 22:40:12.339554	active	0	2026-03-07 20:57:47.236569	\N	\N	2026-03-07 20:57:47.236569
14	1013	prot_sec_chief	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:57:47.243526	2026-03-07 20:57:47.243526	2026-03-11 22:40:20.242644	active	0	2026-03-07 20:57:47.243526	\N	\N	2026-03-07 20:57:47.243526
12	1009	it_bureau_chief	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-03-07 20:56:05.769516	2026-03-07 20:56:05.769516	2026-03-11 22:40:28.514162	active	0	2026-03-07 20:56:05.769516	\N	\N	2026-03-07 20:56:05.769516
1	1	admin	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-09 19:22:17.092734	2026-02-09 19:22:17.092734	2026-03-11 23:30:11.219123	active	0	2026-02-09 19:22:17.092734	\N	\N	2026-02-09 19:22:17.092734
10	1007	stock_cons_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:06:44.673576	2026-02-18 09:06:44.673576	2026-03-11 23:50:10.604509	active	0	2026-02-18 09:06:44.673576	\N	\N	2026-02-18 09:06:44.673576
5	10	bensimessaouddaoud	1d3005bd778154738f4876dfe5b7815a25dd36ae79eaa68b44b78175c4d5cbf4400073ec6e4ce40ff2d11d981fd06ec421ba71c531dc67133ead14635c9471c9	2026-02-11 10:50:19.833168	2026-02-11 10:50:19.833168	2026-03-07 21:18:59.417652	active	0	2026-02-11 10:50:19.833168	1	1	2026-02-11 10:50:19.833168
11	1008	asset_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:15:48.937778	2026-02-18 09:15:48.937778	2026-03-11 22:10:55.808043	active	0	2026-02-18 09:15:48.937778	\N	\N	2026-02-18 09:15:48.937778
2	6	bahaaeddinezaoui	9780eb93119bb629dc9062dc2611bd6bd17532b18a3b8a9ad0290e937000901132ce210686a8b3b843c9fa53797369a087c42cb8e3a18bb2d637cb2014c716df	2026-02-10 14:48:08.044751	2026-02-10 14:48:08.044751	2026-03-13 09:44:52.394616	active	0	2026-03-05 11:34:48.189826	\N	\N	2026-02-10 14:48:08.044751
16	1015	network_tech	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-03-13 01:45:58.500981	2026-03-13 01:45:58.500981	2026-03-13 09:56:21.541546	active	0	2026-03-13 01:45:58.500981	\N	\N	2026-03-13 01:45:58.500981
4	8	mohsinamoura	40c82ecd90443ed156f5e4d3911c9659b6ecc21174a5ac4cb36f1804a45de6bcb2cae9110329419b04145e4d2ba55bd41a44f65c1e5617e592d7ebaf212c524e	2026-02-10 20:18:23.485554	2026-02-10 20:18:23.485554	2026-03-13 10:11:54.060223	active	0	2026-02-10 20:18:23.485554	\N	\N	2026-02-10 20:18:23.485554
\.


--
-- TOC entry 6022 (class 0 OID 83016)
-- Dependencies: 342
-- Data for Name: user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_session (session_id, user_id, ip_address, user_agent, login_datetime, last_activity, logout_datetime) FROM stdin;
\.


--
-- TOC entry 6023 (class 0 OID 83024)
-- Dependencies: 343
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse (warehouse_id, warehouse_name, warehouse_address) FROM stdin;
1	ERI/2RM	\N
\.


--
-- TOC entry 6062 (class 0 OID 0)
-- Dependencies: 228
-- Name: asset_destruction_certificate_asset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_destruction_certificate_asset_id_seq', 1, false);


--
-- TOC entry 6063 (class 0 OID 0)
-- Dependencies: 232
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_consumable_history_id_seq', 51, true);


--
-- TOC entry 6064 (class 0 OID 0)
-- Dependencies: 234
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_stock_item_history_id_seq', 64, true);


--
-- TOC entry 6065 (class 0 OID 0)
-- Dependencies: 238
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_consumable_id_seq', 3, true);


--
-- TOC entry 6066 (class 0 OID 0)
-- Dependencies: 240
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_stock_item_id_seq', 1, true);


--
-- TOC entry 6067 (class 0 OID 0)
-- Dependencies: 246
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_consumable_accessory_id_seq', 1, true);


--
-- TOC entry 6068 (class 0 OID 0)
-- Dependencies: 248
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_stock_item_accessory_id_seq', 1, true);


--
-- TOC entry 6069 (class 0 OID 0)
-- Dependencies: 250
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- TOC entry 6070 (class 0 OID 0)
-- Dependencies: 252
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- TOC entry 6071 (class 0 OID 0)
-- Dependencies: 254
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 336, true);


--
-- TOC entry 6072 (class 0 OID 0)
-- Dependencies: 257
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- TOC entry 6073 (class 0 OID 0)
-- Dependencies: 258
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 1, true);


--
-- TOC entry 6074 (class 0 OID 0)
-- Dependencies: 260
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- TOC entry 6075 (class 0 OID 0)
-- Dependencies: 276
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_is_used_in_stock_item_history_id_seq', 1, false);


--
-- TOC entry 6076 (class 0 OID 0)
-- Dependencies: 285
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- TOC entry 6077 (class 0 OID 0)
-- Dependencies: 287
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 84, true);


--
-- TOC entry 6078 (class 0 OID 0)
-- Dependencies: 289
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 45, true);


--
-- TOC entry 6079 (class 0 OID 0)
-- Dependencies: 300
-- Name: location_type_location_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_type_location_type_id_seq', 1, false);


--
-- TOC entry 6080 (class 0 OID 0)
-- Dependencies: 305
-- Name: maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq', 3, true);


--
-- TOC entry 6081 (class 0 OID 0)
-- Dependencies: 314
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_consumable_id_seq', 1, false);


--
-- TOC entry 6082 (class 0 OID 0)
-- Dependencies: 317
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_stock_item_id_seq', 5, true);


--
-- TOC entry 5316 (class 2606 OID 83040)
-- Name: acceptance_report acceptance_report_delivery_note_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT acceptance_report_delivery_note_id_key UNIQUE (delivery_note_id);


--
-- TOC entry 5318 (class 2606 OID 83042)
-- Name: acceptance_report acceptance_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT acceptance_report_pkey PRIMARY KEY (acceptance_report_id);


--
-- TOC entry 5320 (class 2606 OID 83044)
-- Name: administrative_certificate administrative_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT administrative_certificate_pkey PRIMARY KEY (administrative_certificate_id);


--
-- TOC entry 5324 (class 2606 OID 83046)
-- Name: asset_attribute_definition asset_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition
    ADD CONSTRAINT asset_attribute_definition_pkey PRIMARY KEY (asset_attribute_definition_id);


--
-- TOC entry 5326 (class 2606 OID 83048)
-- Name: asset_attribute_value asset_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT asset_attribute_value_pkey PRIMARY KEY (asset_attribute_definition_id, asset_id);


--
-- TOC entry 5328 (class 2606 OID 83050)
-- Name: asset_brand asset_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand
    ADD CONSTRAINT asset_brand_pkey PRIMARY KEY (asset_brand_id);


--
-- TOC entry 5330 (class 2606 OID 83052)
-- Name: asset_condition_history asset_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT asset_condition_history_pkey PRIMARY KEY (asset_condition_history_id);


--
-- TOC entry 5334 (class 2606 OID 83054)
-- Name: asset_destruction_certificate_asset asset_destruction_certificate_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT asset_destruction_certificate_asset_pkey PRIMARY KEY (id);


--
-- TOC entry 5332 (class 2606 OID 83056)
-- Name: asset_destruction_certificate asset_destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate
    ADD CONSTRAINT asset_destruction_certificate_pkey PRIMARY KEY (asset_destruction_certificate_id);


--
-- TOC entry 5338 (class 2606 OID 83058)
-- Name: asset_failed_external_maintenance asset_failed_external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT asset_failed_external_maintenance_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5340 (class 2606 OID 83060)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5342 (class 2606 OID 83062)
-- Name: asset_is_composed_of_consumable_history asset_is_composed_of_consumable_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT asset_is_composed_of_consumable_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5344 (class 2606 OID 83064)
-- Name: asset_is_composed_of_stock_item_history asset_is_composed_of_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT asset_is_composed_of_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5348 (class 2606 OID 83066)
-- Name: asset_model_attribute_value asset_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT asset_model_attribute_value_pkey PRIMARY KEY (asset_model_id, asset_attribute_definition_id);


--
-- TOC entry 5350 (class 2606 OID 83068)
-- Name: asset_model_default_consumable asset_model_default_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT asset_model_default_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5354 (class 2606 OID 83070)
-- Name: asset_model_default_stock_item asset_model_default_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT asset_model_default_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5346 (class 2606 OID 83072)
-- Name: asset_model asset_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT asset_model_pkey PRIMARY KEY (asset_model_id);


--
-- TOC entry 5358 (class 2606 OID 83074)
-- Name: asset_movement asset_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT asset_movement_pkey PRIMARY KEY (asset_movement_id);


--
-- TOC entry 5322 (class 2606 OID 83076)
-- Name: asset asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5362 (class 2606 OID 83078)
-- Name: asset_type_attribute asset_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT asset_type_attribute_pkey PRIMARY KEY (asset_attribute_definition_id, asset_type_id);


--
-- TOC entry 5360 (class 2606 OID 83080)
-- Name: asset_type asset_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type
    ADD CONSTRAINT asset_type_pkey PRIMARY KEY (asset_type_id);


--
-- TOC entry 5366 (class 2606 OID 83082)
-- Name: attribution_order_asset_consumable_accessory attribution_order_asset_consumable_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT attribution_order_asset_consumable_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5373 (class 2606 OID 83084)
-- Name: attribution_order_asset_stock_item_accessory attribution_order_asset_stock_item_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT attribution_order_asset_stock_item_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5364 (class 2606 OID 83086)
-- Name: attribution_order attribution_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT attribution_order_pkey PRIMARY KEY (attribution_order_id);


--
-- TOC entry 5381 (class 2606 OID 83088)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- TOC entry 5386 (class 2606 OID 83090)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- TOC entry 5389 (class 2606 OID 83092)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5383 (class 2606 OID 83094)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- TOC entry 5392 (class 2606 OID 83096)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- TOC entry 5394 (class 2606 OID 83098)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- TOC entry 5402 (class 2606 OID 83100)
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5405 (class 2606 OID 83102)
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- TOC entry 5396 (class 2606 OID 83104)
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- TOC entry 5408 (class 2606 OID 83106)
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5411 (class 2606 OID 83108)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- TOC entry 5399 (class 2606 OID 83110)
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- TOC entry 5413 (class 2606 OID 83112)
-- Name: authentication_log authentication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT authentication_log_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5417 (class 2606 OID 83114)
-- Name: backorder_report_consumable_model_line backorder_report_consumable_model_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_consumable_model_line
    ADD CONSTRAINT backorder_report_consumable_model_line_pkey PRIMARY KEY (backorder_report_id, consumable_model_id);


--
-- TOC entry 5415 (class 2606 OID 83116)
-- Name: backorder_report backorder_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT backorder_report_pkey PRIMARY KEY (backorder_report_id);


--
-- TOC entry 5420 (class 2606 OID 83118)
-- Name: backorder_report_stock_item_model_line backorder_report_stock_item_model_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_stock_item_model_line
    ADD CONSTRAINT backorder_report_stock_item_model_line_pkey PRIMARY KEY (backorder_report_id, stock_item_model_id);


--
-- TOC entry 5423 (class 2606 OID 83120)
-- Name: broken_item_report broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broken_item_report
    ADD CONSTRAINT broken_item_report_pkey PRIMARY KEY (broken_item_report_id);


--
-- TOC entry 5439 (class 2606 OID 83122)
-- Name: consumable_is_compatible_with_asset c_is_compatible_with_a_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT c_is_compatible_with_a_pkey PRIMARY KEY (consumable_model_id, asset_model_id);


--
-- TOC entry 5441 (class 2606 OID 83124)
-- Name: consumable_is_compatible_with_stock_item c_is_compatible_with_si_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT c_is_compatible_with_si_pkey PRIMARY KEY (consumable_model_id, stock_item_model_id);


--
-- TOC entry 5425 (class 2606 OID 83126)
-- Name: company_asset_request company_asset_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT company_asset_request_pkey PRIMARY KEY (company_asset_request_id);


--
-- TOC entry 5429 (class 2606 OID 83128)
-- Name: consumable_attribute_definition consumable_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition
    ADD CONSTRAINT consumable_attribute_definition_pkey PRIMARY KEY (consumable_attribute_definition_id);


--
-- TOC entry 5431 (class 2606 OID 83130)
-- Name: consumable_attribute_value consumable_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT consumable_attribute_value_pkey PRIMARY KEY (consumable_id, consumable_attribute_definition_id);


--
-- TOC entry 5433 (class 2606 OID 83132)
-- Name: consumable_brand consumable_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand
    ADD CONSTRAINT consumable_brand_pkey PRIMARY KEY (consumable_brand_id);


--
-- TOC entry 5435 (class 2606 OID 83134)
-- Name: consumable_condition_history consumable_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT consumable_condition_history_pkey PRIMARY KEY (consumable_condition_history_id);


--
-- TOC entry 5437 (class 2606 OID 83136)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5443 (class 2606 OID 83138)
-- Name: consumable_is_used_in_stock_item_history consumable_is_used_in_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT consumable_is_used_in_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5447 (class 2606 OID 83140)
-- Name: consumable_model_attribute_value consumable_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT consumable_model_attribute_value_pkey PRIMARY KEY (consumable_model_id, consumable_attribute_definition_id);


--
-- TOC entry 5449 (class 2606 OID 83142)
-- Name: consumable_model_is_found_in_purchase_order consumable_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT consumable_model_is_found_in_bdc_pkey PRIMARY KEY (consumable_model_id, purchase_order_id);


--
-- TOC entry 5445 (class 2606 OID 83144)
-- Name: consumable_model consumable_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT consumable_model_pkey PRIMARY KEY (consumable_model_id);


--
-- TOC entry 5451 (class 2606 OID 83146)
-- Name: consumable_movement consumable_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT consumable_movement_pkey PRIMARY KEY (consumable_movement_id);


--
-- TOC entry 5427 (class 2606 OID 83148)
-- Name: consumable consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT consumable_pkey PRIMARY KEY (consumable_id);


--
-- TOC entry 5455 (class 2606 OID 83150)
-- Name: consumable_type_attribute consumable_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT consumable_type_attribute_pkey PRIMARY KEY (consumable_type_id, consumable_attribute_definition_id);


--
-- TOC entry 5453 (class 2606 OID 83152)
-- Name: consumable_type consumable_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type
    ADD CONSTRAINT consumable_type_pkey PRIMARY KEY (consumable_type_id);


--
-- TOC entry 5457 (class 2606 OID 83154)
-- Name: delivery_note delivery_note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT delivery_note_pkey PRIMARY KEY (delivery_note_id);


--
-- TOC entry 5460 (class 2606 OID 83156)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5463 (class 2606 OID 83158)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- TOC entry 5465 (class 2606 OID 83160)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- TOC entry 5467 (class 2606 OID 83162)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5470 (class 2606 OID 83164)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- TOC entry 5477 (class 2606 OID 83166)
-- Name: external_maintenance_document external_maintenance_document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT external_maintenance_document_pkey PRIMARY KEY (external_maintenance_document_id);


--
-- TOC entry 5473 (class 2606 OID 83168)
-- Name: external_maintenance external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT external_maintenance_pkey PRIMARY KEY (external_maintenance_id);


--
-- TOC entry 5479 (class 2606 OID 83170)
-- Name: external_maintenance_provider external_maintenance_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_provider
    ADD CONSTRAINT external_maintenance_provider_pkey PRIMARY KEY (external_maintenance_provider_id);


--
-- TOC entry 5481 (class 2606 OID 83172)
-- Name: external_maintenance_step external_maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT external_maintenance_step_pkey PRIMARY KEY (external_maintenance_step_id);


--
-- TOC entry 5483 (class 2606 OID 83174)
-- Name: external_maintenance_typical_step external_maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step
    ADD CONSTRAINT external_maintenance_typical_step_pkey PRIMARY KEY (external_maintenance_typical_step_id);


--
-- TOC entry 5485 (class 2606 OID 83176)
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 5489 (class 2606 OID 83178)
-- Name: location_belongs_to_organizational_structure location_belongs_to_organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT location_belongs_to_organizational_structure_pkey PRIMARY KEY (organizational_structure_id, location_id);


--
-- TOC entry 5487 (class 2606 OID 83180)
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (location_id);


--
-- TOC entry 5491 (class 2606 OID 83182)
-- Name: location_type location_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_type
    ADD CONSTRAINT location_type_pkey PRIMARY KEY (location_type_id);


--
-- TOC entry 5495 (class 2606 OID 83184)
-- Name: maintenance_inspection_leads_to_broken_item_report maintenance_inspection_leads_to_broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT maintenance_inspection_leads_to_broken_item_report_pkey PRIMARY KEY (maintenance_id, broken_item_report_id);


--
-- TOC entry 5493 (class 2606 OID 83186)
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (maintenance_id);


--
-- TOC entry 5500 (class 2606 OID 83188)
-- Name: maintenance_step_attribute_change maintenance_step_attribute_change_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_attribute_change_pkey PRIMARY KEY (maintenance_step_attribute_change_id);


--
-- TOC entry 5502 (class 2606 OID 83190)
-- Name: maintenance_step_item_request maintenance_step_item_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_pkey PRIMARY KEY (maintenance_step_item_request_id);


--
-- TOC entry 5497 (class 2606 OID 83192)
-- Name: maintenance_step maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT maintenance_step_pkey PRIMARY KEY (maintenance_step_id);


--
-- TOC entry 5506 (class 2606 OID 83194)
-- Name: maintenance_typical_step maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step
    ADD CONSTRAINT maintenance_typical_step_pkey PRIMARY KEY (maintenance_typical_step_id);


--
-- TOC entry 5508 (class 2606 OID 83196)
-- Name: organizational_structure organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure
    ADD CONSTRAINT organizational_structure_pkey PRIMARY KEY (organizational_structure_id);


--
-- TOC entry 5510 (class 2606 OID 83198)
-- Name: organizational_structure_relation organizational_structure_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT organizational_structure_relation_pkey PRIMARY KEY (organizational_structure_id, parent_organizational_structure_id);


--
-- TOC entry 5514 (class 2606 OID 83200)
-- Name: person_assignment person_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT person_assignment_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5512 (class 2606 OID 83202)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- TOC entry 5518 (class 2606 OID 83204)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5520 (class 2606 OID 83206)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_report_cons; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_report_cons UNIQUE (report_id, consumable_id);


--
-- TOC entry 5522 (class 2606 OID 83208)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5524 (class 2606 OID 83210)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5526 (class 2606 OID 83212)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_report_stoc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_report_stoc UNIQUE (report_id, stock_item_id);


--
-- TOC entry 5516 (class 2606 OID 83214)
-- Name: person_reports_problem_on_asset person_reports_problem_on_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT person_reports_problem_on_asset_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5528 (class 2606 OID 83216)
-- Name: person_reports_problem_on_consumable person_reports_problem_on_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT person_reports_problem_on_consumable_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5530 (class 2606 OID 83218)
-- Name: person_reports_problem_on_stock_item person_reports_problem_on_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT person_reports_problem_on_stock_item_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5532 (class 2606 OID 83220)
-- Name: person_role_mapping person_role_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT person_role_mapping_pkey PRIMARY KEY (role_id, person_id);


--
-- TOC entry 5534 (class 2606 OID 83222)
-- Name: physical_condition physical_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition
    ADD CONSTRAINT physical_condition_pkey PRIMARY KEY (condition_id);


--
-- TOC entry 5536 (class 2606 OID 83224)
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (position_id);


--
-- TOC entry 5538 (class 2606 OID 83226)
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (purchase_order_id);


--
-- TOC entry 5540 (class 2606 OID 83228)
-- Name: receipt_report receipt_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_report
    ADD CONSTRAINT receipt_report_pkey PRIMARY KEY (receipt_report_id);


--
-- TOC entry 5542 (class 2606 OID 83230)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- TOC entry 5546 (class 2606 OID 83232)
-- Name: stock_item_attribute_definition stock_item_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition
    ADD CONSTRAINT stock_item_attribute_definition_pkey PRIMARY KEY (stock_item_attribute_definition_id);


--
-- TOC entry 5548 (class 2606 OID 83234)
-- Name: stock_item_attribute_value stock_item_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT stock_item_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_id);


--
-- TOC entry 5550 (class 2606 OID 83236)
-- Name: stock_item_brand stock_item_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand
    ADD CONSTRAINT stock_item_brand_pkey PRIMARY KEY (stock_item_brand_id);


--
-- TOC entry 5552 (class 2606 OID 83238)
-- Name: stock_item_condition_history stock_item_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT stock_item_condition_history_pkey PRIMARY KEY (stock_item_condition_history_id);


--
-- TOC entry 5554 (class 2606 OID 83240)
-- Name: stock_item_consumable_destruction_certificate stock_item_consumable_destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_consumable_destruction_certificate
    ADD CONSTRAINT stock_item_consumable_destruction_certificate_pkey PRIMARY KEY (destruction_certificate_id);


--
-- TOC entry 5556 (class 2606 OID 83242)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5558 (class 2606 OID 83244)
-- Name: stock_item_is_compatible_with_asset stock_item_is_compatible_with_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT stock_item_is_compatible_with_asset_pkey PRIMARY KEY (stock_item_model_id, asset_model_id);


--
-- TOC entry 5562 (class 2606 OID 83246)
-- Name: stock_item_model_attribute_value stock_item_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT stock_item_model_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_model_id);


--
-- TOC entry 5564 (class 2606 OID 83248)
-- Name: stock_item_model_is_found_in_purchase_order stock_item_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT stock_item_model_is_found_in_bdc_pkey PRIMARY KEY (stock_item_model_id, purchase_order_id);


--
-- TOC entry 5560 (class 2606 OID 83250)
-- Name: stock_item_model stock_item_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT stock_item_model_pkey PRIMARY KEY (stock_item_model_id);


--
-- TOC entry 5566 (class 2606 OID 83252)
-- Name: stock_item_movement stock_item_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT stock_item_movement_pkey PRIMARY KEY (stock_item_movement_id);


--
-- TOC entry 5544 (class 2606 OID 83254)
-- Name: stock_item stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT stock_item_pkey PRIMARY KEY (stock_item_id);


--
-- TOC entry 5570 (class 2606 OID 83256)
-- Name: stock_item_type_attribute stock_item_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT stock_item_type_attribute_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_type_id);


--
-- TOC entry 5568 (class 2606 OID 83258)
-- Name: stock_item_type stock_item_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type
    ADD CONSTRAINT stock_item_type_pkey PRIMARY KEY (stock_item_type_id);


--
-- TOC entry 5572 (class 2606 OID 83260)
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (supplier_id);


--
-- TOC entry 5336 (class 2606 OID 83262)
-- Name: asset_destruction_certificate_asset uq_adca_asset; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT uq_adca_asset UNIQUE (asset_id);


--
-- TOC entry 5352 (class 2606 OID 83264)
-- Name: asset_model_default_consumable uq_amdc_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT uq_amdc_composition UNIQUE (asset_model_id, consumable_model_id);


--
-- TOC entry 5356 (class 2606 OID 83266)
-- Name: asset_model_default_stock_item uq_amdsi_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT uq_amdsi_composition UNIQUE (asset_model_id, stock_item_model_id);


--
-- TOC entry 5371 (class 2606 OID 83268)
-- Name: attribution_order_asset_consumable_accessory uq_ao_aca_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT uq_ao_aca_unique UNIQUE (attribution_order_id, asset_id, consumable_id);


--
-- TOC entry 5378 (class 2606 OID 83270)
-- Name: attribution_order_asset_stock_item_accessory uq_ao_assa_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT uq_ao_assa_unique UNIQUE (attribution_order_id, asset_id, stock_item_id);


--
-- TOC entry 5574 (class 2606 OID 83272)
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5576 (class 2606 OID 83274)
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5578 (class 2606 OID 83276)
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (warehouse_id);


--
-- TOC entry 5379 (class 1259 OID 83277)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- TOC entry 5384 (class 1259 OID 83278)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- TOC entry 5387 (class 1259 OID 83279)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- TOC entry 5390 (class 1259 OID 83280)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- TOC entry 5400 (class 1259 OID 83281)
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- TOC entry 5403 (class 1259 OID 83282)
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- TOC entry 5406 (class 1259 OID 83283)
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- TOC entry 5409 (class 1259 OID 83284)
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- TOC entry 5397 (class 1259 OID 83285)
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- TOC entry 5458 (class 1259 OID 83286)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- TOC entry 5461 (class 1259 OID 83287)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- TOC entry 5468 (class 1259 OID 83288)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- TOC entry 5471 (class 1259 OID 83289)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- TOC entry 5367 (class 1259 OID 83290)
-- Name: idx_ao_aca_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_asset ON public.attribution_order_asset_consumable_accessory USING btree (asset_id);


--
-- TOC entry 5368 (class 1259 OID 83291)
-- Name: idx_ao_aca_consumable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_consumable ON public.attribution_order_asset_consumable_accessory USING btree (consumable_id);


--
-- TOC entry 5369 (class 1259 OID 83292)
-- Name: idx_ao_aca_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_order ON public.attribution_order_asset_consumable_accessory USING btree (attribution_order_id);


--
-- TOC entry 5374 (class 1259 OID 83293)
-- Name: idx_ao_assa_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_asset ON public.attribution_order_asset_stock_item_accessory USING btree (asset_id);


--
-- TOC entry 5375 (class 1259 OID 83294)
-- Name: idx_ao_assa_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_order ON public.attribution_order_asset_stock_item_accessory USING btree (attribution_order_id);


--
-- TOC entry 5376 (class 1259 OID 83295)
-- Name: idx_ao_assa_stock_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_stock_item ON public.attribution_order_asset_stock_item_accessory USING btree (stock_item_id);


--
-- TOC entry 5418 (class 1259 OID 83296)
-- Name: idx_brcml_backorder_report_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_brcml_backorder_report_id ON public.backorder_report_consumable_model_line USING btree (backorder_report_id);


--
-- TOC entry 5421 (class 1259 OID 83297)
-- Name: idx_brsiml_backorder_report_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_brsiml_backorder_report_id ON public.backorder_report_stock_item_model_line USING btree (backorder_report_id);


--
-- TOC entry 5474 (class 1259 OID 83298)
-- Name: idx_external_maintenance_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_provider_id ON public.external_maintenance USING btree (external_maintenance_provider_id);


--
-- TOC entry 5475 (class 1259 OID 83299)
-- Name: idx_external_maintenance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_status ON public.external_maintenance USING btree (external_maintenance_status);


--
-- TOC entry 5498 (class 1259 OID 83300)
-- Name: maintenance_step_attribute_change_maintenance_step_id_34ad2442; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_attribute_change_maintenance_step_id_34ad2442 ON public.maintenance_step_attribute_change USING btree (maintenance_step_id);


--
-- TOC entry 5503 (class 1259 OID 83301)
-- Name: maintenance_step_item_request_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_status_idx ON public.maintenance_step_item_request USING btree (status);


--
-- TOC entry 5504 (class 1259 OID 83302)
-- Name: maintenance_step_item_request_step_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_step_id_idx ON public.maintenance_step_item_request USING btree (maintenance_step_id);


--
-- TOC entry 5595 (class 2606 OID 83303)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5629 (class 2606 OID 83308)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5630 (class 2606 OID 83313)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5631 (class 2606 OID 83318)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5632 (class 2606 OID 83323)
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5633 (class 2606 OID 83328)
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5634 (class 2606 OID 83333)
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5635 (class 2606 OID 83338)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5646 (class 2606 OID 83343)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5672 (class 2606 OID 83348)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5673 (class 2606 OID 83353)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5579 (class 2606 OID 83358)
-- Name: acceptance_report fk_acceptance_report_delivery_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceptance_report
    ADD CONSTRAINT fk_acceptance_report_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5590 (class 2606 OID 83363)
-- Name: asset_destruction_certificate_asset fk_adca_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5591 (class 2606 OID 83368)
-- Name: asset_destruction_certificate_asset fk_adca_cert; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_cert FOREIGN KEY (asset_destruction_certificate_id) REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5592 (class 2606 OID 83373)
-- Name: asset_destruction_certificate_asset fk_adca_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_destruction_certificate_asset
    ADD CONSTRAINT fk_adca_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5580 (class 2606 OID 83378)
-- Name: administrative_certificate fk_administ_ac_is_lin_receipt_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ac_is_lin_receipt_ FOREIGN KEY (receipt_report_id) REFERENCES public.receipt_report(receipt_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5581 (class 2606 OID 83383)
-- Name: administrative_certificate fk_administ_ad_is_bro_warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ad_is_bro_warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5582 (class 2606 OID 83388)
-- Name: administrative_certificate fk_administ_ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5593 (class 2606 OID 83393)
-- Name: asset_failed_external_maintenance fk_afem_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT fk_afem_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5594 (class 2606 OID 83398)
-- Name: asset_failed_external_maintenance fk_afem_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_failed_external_maintenance
    ADD CONSTRAINT fk_afem_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5596 (class 2606 OID 83403)
-- Name: asset_is_assigned_to_person fk_aiatp_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_aiatp_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5599 (class 2606 OID 83408)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5600 (class 2606 OID 83413)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5603 (class 2606 OID 83418)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5604 (class 2606 OID 83423)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5611 (class 2606 OID 83428)
-- Name: asset_model_default_consumable fk_amdc_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5612 (class 2606 OID 83433)
-- Name: asset_model_default_consumable fk_amdc_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE;


--
-- TOC entry 5613 (class 2606 OID 83438)
-- Name: asset_model_default_stock_item fk_amdsi_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5614 (class 2606 OID 83443)
-- Name: asset_model_default_stock_item fk_amdsi_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE;


--
-- TOC entry 5623 (class 2606 OID 83448)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5624 (class 2606 OID 83453)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5625 (class 2606 OID 83458)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5626 (class 2606 OID 83463)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5627 (class 2606 OID 83468)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5628 (class 2606 OID 83473)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5583 (class 2606 OID 83478)
-- Name: asset fk_asset_asset_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_destruction_certificate FOREIGN KEY (destruction_certificate_id) REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5584 (class 2606 OID 83483)
-- Name: asset fk_asset_asset_is__asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5585 (class 2606 OID 83488)
-- Name: asset fk_asset_asset_is__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5586 (class 2606 OID 83493)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5587 (class 2606 OID 83498)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5588 (class 2606 OID 83503)
-- Name: asset_condition_history fk_asset_co_asset_con_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_con_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5589 (class 2606 OID 83508)
-- Name: asset_condition_history fk_asset_co_asset_has_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_has_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5601 (class 2606 OID 83513)
-- Name: asset_is_composed_of_consumable_history fk_asset_cons_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_cons_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5602 (class 2606 OID 83518)
-- Name: asset_is_composed_of_consumable_history fk_asset_is_asset_is__consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_is_asset_is__consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5597 (class 2606 OID 83523)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigned FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5598 (class 2606 OID 83528)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigner FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5605 (class 2606 OID 83533)
-- Name: asset_is_composed_of_stock_item_history fk_asset_is_asset_is__stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_is_asset_is__stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5609 (class 2606 OID 83538)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5607 (class 2606 OID 83543)
-- Name: asset_model fk_asset_mo_asset_mod_asset_br; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_br FOREIGN KEY (asset_brand_id) REFERENCES public.asset_brand(asset_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5610 (class 2606 OID 83548)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5615 (class 2606 OID 83553)
-- Name: asset_movement fk_asset_mo_asset_mov_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5616 (class 2606 OID 83558)
-- Name: asset_movement fk_asset_mo_asset_mov_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5617 (class 2606 OID 83563)
-- Name: asset_movement fk_asset_mo_asset_mov_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5618 (class 2606 OID 83568)
-- Name: asset_movement fk_asset_mo_asset_mov_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5619 (class 2606 OID 83573)
-- Name: asset_movement fk_asset_mo_asset_mov_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_maintena FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5608 (class 2606 OID 83578)
-- Name: asset_model fk_asset_mo_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5606 (class 2606 OID 83583)
-- Name: asset_is_composed_of_stock_item_history fk_asset_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5620 (class 2606 OID 83588)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5621 (class 2606 OID 83593)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5622 (class 2606 OID 83598)
-- Name: attribution_order fk_attribut_shipment__warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT fk_attribut_shipment__warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5636 (class 2606 OID 83603)
-- Name: authentication_log fk_authenti_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT fk_authenti_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5721 (class 2606 OID 83608)
-- Name: purchase_order fk_bon_de_c_bdc_is_ma_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT fk_bon_de_c_bdc_is_ma_supplier FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5637 (class 2606 OID 83613)
-- Name: backorder_report fk_bon_de_r_bdc_has_b_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT fk_bon_de_r_bdc_has_b_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5638 (class 2606 OID 83618)
-- Name: backorder_report_consumable_model_line fk_brcml_backorder_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_consumable_model_line
    ADD CONSTRAINT fk_brcml_backorder_report FOREIGN KEY (backorder_report_id) REFERENCES public.backorder_report(backorder_report_id) ON DELETE CASCADE;


--
-- TOC entry 5639 (class 2606 OID 83623)
-- Name: backorder_report_stock_item_model_line fk_brsiml_backorder_report; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report_stock_item_model_line
    ADD CONSTRAINT fk_brsiml_backorder_report FOREIGN KEY (backorder_report_id) REFERENCES public.backorder_report(backorder_report_id) ON DELETE CASCADE;


--
-- TOC entry 5650 (class 2606 OID 83628)
-- Name: consumable_is_compatible_with_asset fk_c_is_com_c_is_comp_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_c_is_com_c_is_comp_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5652 (class 2606 OID 83633)
-- Name: consumable_is_compatible_with_stock_item fk_c_is_com_c_is_comp_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_c_is_com_c_is_comp_stock_it FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5643 (class 2606 OID 83638)
-- Name: consumable_attribute_value fk_cav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5644 (class 2606 OID 83643)
-- Name: consumable_attribute_value fk_cav_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5647 (class 2606 OID 83648)
-- Name: consumable_is_assigned_to_person fk_ciatp_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_ciatp_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5651 (class 2606 OID 83653)
-- Name: consumable_is_compatible_with_asset fk_cicwa_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_cicwa_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5653 (class 2606 OID 83658)
-- Name: consumable_is_compatible_with_stock_item fk_cicwsi_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_cicwsi_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5654 (class 2606 OID 83663)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5655 (class 2606 OID 83668)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5658 (class 2606 OID 83673)
-- Name: consumable_model fk_cm_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_brand FOREIGN KEY (consumable_brand_id) REFERENCES public.consumable_brand(consumable_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5664 (class 2606 OID 83678)
-- Name: consumable_movement fk_cm_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5665 (class 2606 OID 83683)
-- Name: consumable_movement fk_cm_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5659 (class 2606 OID 83688)
-- Name: consumable_model fk_cm_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5660 (class 2606 OID 83693)
-- Name: consumable_model_attribute_value fk_cmav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5661 (class 2606 OID 83698)
-- Name: consumable_model_attribute_value fk_cmav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5662 (class 2606 OID 83703)
-- Name: consumable_model_is_found_in_purchase_order fk_cmifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_cmifib_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5640 (class 2606 OID 83708)
-- Name: company_asset_request fk_company__ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT fk_company__ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5656 (class 2606 OID 83713)
-- Name: consumable_is_used_in_stock_item_history fk_cons_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_cons_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5645 (class 2606 OID 83718)
-- Name: consumable_condition_history fk_consumab_associati_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT fk_consumab_associati_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5663 (class 2606 OID 83723)
-- Name: consumable_model_is_found_in_purchase_order fk_consumab_consumabl_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_consumab_consumabl_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5666 (class 2606 OID 83728)
-- Name: consumable_movement fk_consumab_consumabl_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5667 (class 2606 OID 83733)
-- Name: consumable_movement fk_consumab_consumabl_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5668 (class 2606 OID 83738)
-- Name: consumable_movement fk_consumab_consumabl_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5648 (class 2606 OID 83743)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5649 (class 2606 OID 83748)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5657 (class 2606 OID 83753)
-- Name: consumable_is_used_in_stock_item_history fk_consumab_consumabl_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_consumab_consumabl_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5641 (class 2606 OID 83758)
-- Name: consumable fk_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5642 (class 2606 OID 83763)
-- Name: consumable fk_consumable_stock_item_consumable_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_stock_item_consumable_destruction_certificate FOREIGN KEY (stock_item_consumable_destruction_certificate_id) REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5669 (class 2606 OID 83768)
-- Name: consumable_type_attribute fk_cta_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5670 (class 2606 OID 83773)
-- Name: consumable_type_attribute fk_cta_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5671 (class 2606 OID 83778)
-- Name: delivery_note fk_delivery_note_purchase_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT fk_delivery_note_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5675 (class 2606 OID 83783)
-- Name: external_maintenance_document fk_emd_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT fk_emd_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5676 (class 2606 OID 83788)
-- Name: external_maintenance_step fk_ems_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_ems_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5677 (class 2606 OID 83793)
-- Name: external_maintenance_step fk_external_ems_is_a__external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_external_ems_is_a__external FOREIGN KEY (external_maintenance_typical_step_id) REFERENCES public.external_maintenance_typical_step(external_maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5674 (class 2606 OID 83798)
-- Name: external_maintenance fk_external_maintenan_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT fk_external_maintenan_maintena FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5678 (class 2606 OID 83803)
-- Name: invoice fk_invoice_delivery_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT fk_invoice_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5680 (class 2606 OID 83808)
-- Name: location_belongs_to_organizational_structure fk_location_bel_location_belo_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT fk_location_bel_location_belo_location FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5689 (class 2606 OID 83813)
-- Name: maintenance_step fk_maintena_asset_con_asset_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_asset_con_asset_co FOREIGN KEY (asset_condition_history_id) REFERENCES public.asset_condition_history(asset_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5682 (class 2606 OID 83818)
-- Name: maintenance fk_maintena_asset_is__asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_asset_is__asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5690 (class 2606 OID 83823)
-- Name: maintenance_step fk_maintena_consumabl_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_consumabl_consumab FOREIGN KEY (consumable_condition_history_id) REFERENCES public.consumable_condition_history(consumable_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5687 (class 2606 OID 83828)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_maintena_maintenan_broken_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_maintena_maintenan_broken_i FOREIGN KEY (broken_item_report_id) REFERENCES public.broken_item_report(broken_item_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5683 (class 2606 OID 83833)
-- Name: maintenance fk_maintena_maintenan_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_maintenan_person FOREIGN KEY (performed_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5684 (class 2606 OID 83838)
-- Name: maintenance fk_maintena_person_as_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_person_as_person FOREIGN KEY (approved_by_maintenance_chief_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5691 (class 2606 OID 83843)
-- Name: maintenance_step fk_maintena_stock_ite_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_stock_ite_stock_it FOREIGN KEY (stock_item_condition_history_id) REFERENCES public.stock_item_condition_history(stock_item_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5688 (class 2606 OID 83848)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_milbir_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_milbir_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5692 (class 2606 OID 83853)
-- Name: maintenance_step fk_ms_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5693 (class 2606 OID 83858)
-- Name: maintenance_step fk_ms_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5694 (class 2606 OID 83863)
-- Name: maintenance_step fk_ms_typical_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_typical_step FOREIGN KEY (maintenance_typical_step_id) REFERENCES public.maintenance_typical_step(maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5703 (class 2606 OID 83868)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_child FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5704 (class 2606 OID 83873)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_parent FOREIGN KEY (parent_organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5705 (class 2606 OID 83878)
-- Name: person_assignment fk_person_a_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5706 (class 2606 OID 83883)
-- Name: person_assignment fk_person_a_person_is_position; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_is_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5707 (class 2606 OID 83888)
-- Name: person_reports_problem_on_asset fk_person_r_person_re_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_person_r_person_re_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5715 (class 2606 OID 83893)
-- Name: person_reports_problem_on_consumable fk_person_r_person_re_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_person_r_person_re_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5717 (class 2606 OID 83898)
-- Name: person_reports_problem_on_stock_item fk_person_r_person_re_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_person_r_person_re_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5719 (class 2606 OID 83903)
-- Name: person_role_mapping fk_person_role_mapping_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5720 (class 2606 OID 83908)
-- Name: person_role_mapping fk_person_role_mapping_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_role FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5708 (class 2606 OID 83913)
-- Name: person_reports_problem_on_asset fk_prpoa_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_prpoa_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5716 (class 2606 OID 83918)
-- Name: person_reports_problem_on_consumable fk_prpoc_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_prpoc_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5718 (class 2606 OID 83923)
-- Name: person_reports_problem_on_stock_item fk_prposi_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_prposi_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5681 (class 2606 OID 83928)
-- Name: location_belongs_to_organizational_structure fk_room_bel_room_belo_organiza; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_belongs_to_organizational_structure
    ADD CONSTRAINT fk_room_bel_room_belo_organiza FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5679 (class 2606 OID 83933)
-- Name: location fk_room_room_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT fk_room_room_type FOREIGN KEY (location_type_id) REFERENCES public.location_type(location_type_id);


--
-- TOC entry 5725 (class 2606 OID 83938)
-- Name: stock_item_attribute_value fk_siav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5726 (class 2606 OID 83943)
-- Name: stock_item_attribute_value fk_siav_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5727 (class 2606 OID 83948)
-- Name: stock_item_condition_history fk_sich_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_sich_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5729 (class 2606 OID 83953)
-- Name: stock_item_is_assigned_to_person fk_siiatp_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_siiatp_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5733 (class 2606 OID 83958)
-- Name: stock_item_is_compatible_with_asset fk_siicwa_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_siicwa_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5735 (class 2606 OID 83963)
-- Name: stock_item_model fk_sim_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_brand FOREIGN KEY (stock_item_brand_id) REFERENCES public.stock_item_brand(stock_item_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5741 (class 2606 OID 83968)
-- Name: stock_item_movement fk_sim_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5742 (class 2606 OID 83973)
-- Name: stock_item_movement fk_sim_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5736 (class 2606 OID 83978)
-- Name: stock_item_model fk_sim_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5737 (class 2606 OID 83983)
-- Name: stock_item_model_attribute_value fk_simav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5738 (class 2606 OID 83988)
-- Name: stock_item_model_attribute_value fk_simav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5739 (class 2606 OID 83993)
-- Name: stock_item_model_is_found_in_purchase_order fk_simifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_simifib_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5746 (class 2606 OID 83998)
-- Name: stock_item_type_attribute fk_sita_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5747 (class 2606 OID 84003)
-- Name: stock_item_type_attribute fk_sita_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5734 (class 2606 OID 84008)
-- Name: stock_item_is_compatible_with_asset fk_stock_it_stock_ite_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_stock_it_stock_ite_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5740 (class 2606 OID 84013)
-- Name: stock_item_model_is_found_in_purchase_order fk_stock_it_stock_ite_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_stock_it_stock_ite_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5743 (class 2606 OID 84018)
-- Name: stock_item_movement fk_stock_it_stock_ite_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5744 (class 2606 OID 84023)
-- Name: stock_item_movement fk_stock_it_stock_ite_location_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_location_dest FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5745 (class 2606 OID 84028)
-- Name: stock_item_movement fk_stock_it_stock_ite_location_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_location_source FOREIGN KEY (source_location_id) REFERENCES public.location(location_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5730 (class 2606 OID 84033)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5731 (class 2606 OID 84038)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5728 (class 2606 OID 84043)
-- Name: stock_item_condition_history fk_stock_it_stock_ite_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_stock_it_stock_ite_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5722 (class 2606 OID 84048)
-- Name: stock_item fk_stock_item_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5723 (class 2606 OID 84053)
-- Name: stock_item fk_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5724 (class 2606 OID 84058)
-- Name: stock_item fk_stock_item_stock_item_consumable_destruction_certificate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_stock_item_consumable_destruction_certificate FOREIGN KEY (stock_item_consumable_destruction_certificate_id) REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5748 (class 2606 OID 84063)
-- Name: user_account fk_user_acc_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5749 (class 2606 OID 84068)
-- Name: user_account fk_user_acc_modified_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_modified_by_user FOREIGN KEY (modified_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5750 (class 2606 OID 84073)
-- Name: user_account fk_user_acc_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5751 (class 2606 OID 84078)
-- Name: user_session fk_user_ses_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT fk_user_ses_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5685 (class 2606 OID 84083)
-- Name: maintenance maintenance_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5695 (class 2606 OID 84088)
-- Name: maintenance_step_attribute_change maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5696 (class 2606 OID 84093)
-- Name: maintenance_step_item_request maintenance_step_item_request_rejected_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_rejected_by_person_fk FOREIGN KEY (rejected_by_person_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 5686 (class 2606 OID 84098)
-- Name: maintenance maintenance_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5697 (class 2606 OID 84103)
-- Name: maintenance_step_item_request msir_consumable_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_consumable_fk FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5698 (class 2606 OID 84108)
-- Name: maintenance_step_item_request msir_destination_location_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_destination_location_fk FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 5699 (class 2606 OID 84113)
-- Name: maintenance_step_item_request msir_maintenance_step_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_maintenance_step_fk FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id);


--
-- TOC entry 5700 (class 2606 OID 84118)
-- Name: maintenance_step_item_request msir_requested_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_requested_by_person_fk FOREIGN KEY (requested_by_person_id) REFERENCES public.person(person_id);


--
-- TOC entry 5701 (class 2606 OID 84123)
-- Name: maintenance_step_item_request msir_source_location_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_source_location_fk FOREIGN KEY (source_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 5702 (class 2606 OID 84128)
-- Name: maintenance_step_item_request msir_stock_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_stock_item_fk FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5711 (class 2606 OID 84133)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_includ_destination_location_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_includ_destination_location_id_ FOREIGN KEY (destination_location_id) REFERENCES public.location(location_id);


--
-- TOC entry 5709 (class 2606 OID 84138)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_con_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_con_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5710 (class 2606 OID 84143)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consuma_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consuma_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5712 (class 2606 OID 84148)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5713 (class 2606 OID 84153)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_sto_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_sto_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5714 (class 2606 OID 84158)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_i_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_i_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5732 (class 2606 OID 84163)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


-- Completed on 2026-03-13 11:42:49

--
-- PostgreSQL database dump complete
--

\unrestrict v08FJCYeaM9p4HxPEOd2F1anjhIKG0XhU1KKDq1RrCB4zg3fjc9fyKvnM0JHfS9

