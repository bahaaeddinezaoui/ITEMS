--
-- PostgreSQL database dump
--

\restrict T7cM7tqqwqTC9SRnew6EPCd8gLedhuhbT8OahjpYX2uaXKAUcAypOg08Bd5WPk0

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-03-06 21:09:23

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
-- TOC entry 1239 (class 1247 OID 41243)
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
-- TOC entry 219 (class 1259 OID 24789)
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
    digital_copy bytea
);


ALTER TABLE public.administrative_certificate OWNER TO postgres;

--
-- TOC entry 5966 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN administrative_certificate.operation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.operation IS 'Action" can be "entry", "exit" or "transfer';


--
-- TOC entry 5967 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN administrative_certificate.format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.format IS 'Among the formats is "21x27"';


--
-- TOC entry 220 (class 1259 OID 24798)
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
-- TOC entry 221 (class 1259 OID 24803)
-- Name: asset_attribute_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_attribute_definition (
    asset_attribute_definition_id integer CONSTRAINT asset_attribute_definition_asset_attribute_definition__not_null NOT NULL,
    data_type character varying(18),
    unit character varying(24),
    description character varying(256)
);


ALTER TABLE public.asset_attribute_definition OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24807)
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
-- TOC entry 223 (class 1259 OID 24814)
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
-- TOC entry 224 (class 1259 OID 24818)
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
-- TOC entry 225 (class 1259 OID 24826)
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
-- TOC entry 5968 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE asset_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_is_assigned_to_person IS 'The first person is the one to whom the asset is assigned, a';


--
-- TOC entry 226 (class 1259 OID 24836)
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
-- TOC entry 227 (class 1259 OID 24842)
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
-- TOC entry 5969 (class 0 OID 0)
-- Dependencies: 227
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_consumable_history_id_seq OWNED BY public.asset_is_composed_of_consumable_history.id;


--
-- TOC entry 228 (class 1259 OID 24843)
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
-- TOC entry 229 (class 1259 OID 24849)
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
-- TOC entry 5970 (class 0 OID 0)
-- Dependencies: 229
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_stock_item_history_id_seq OWNED BY public.asset_is_composed_of_stock_item_history.id;


--
-- TOC entry 230 (class 1259 OID 24850)
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
-- TOC entry 231 (class 1259 OID 24856)
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
-- TOC entry 232 (class 1259 OID 24863)
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
-- TOC entry 233 (class 1259 OID 24871)
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
-- TOC entry 5971 (class 0 OID 0)
-- Dependencies: 233
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_consumable_id_seq OWNED BY public.asset_model_default_consumable.id;


--
-- TOC entry 234 (class 1259 OID 24872)
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
-- TOC entry 235 (class 1259 OID 24880)
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
-- TOC entry 5972 (class 0 OID 0)
-- Dependencies: 235
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_stock_item_id_seq OWNED BY public.asset_model_default_stock_item.id;


--
-- TOC entry 236 (class 1259 OID 24881)
-- Name: asset_movement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_movement (
    asset_movement_id integer NOT NULL,
    asset_id integer NOT NULL,
    source_room_id integer NOT NULL,
    destination_room_id integer NOT NULL,
    maintenance_step_id integer,
    external_maintenance_step_id integer,
    movement_reason character varying(128) NOT NULL,
    movement_datetime timestamp without time zone NOT NULL,
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL
);


ALTER TABLE public.asset_movement OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 24890)
-- Name: asset_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_type (
    asset_type_id integer NOT NULL,
    asset_type_label character varying(60),
    asset_type_code character varying(18)
);


ALTER TABLE public.asset_type OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 24894)
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
-- TOC entry 239 (class 1259 OID 24899)
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
-- TOC entry 331 (class 1259 OID 41208)
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
-- TOC entry 330 (class 1259 OID 41207)
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
-- TOC entry 5973 (class 0 OID 0)
-- Dependencies: 330
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_consumable_accessory_id_seq OWNED BY public.attribution_order_asset_consumable_accessory.id;


--
-- TOC entry 329 (class 1259 OID 41173)
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
-- TOC entry 328 (class 1259 OID 41172)
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
-- TOC entry 5974 (class 0 OID 0)
-- Dependencies: 328
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribution_order_asset_stock_item_accessory_id_seq OWNED BY public.attribution_order_asset_stock_item_accessory.id;


--
-- TOC entry 240 (class 1259 OID 24904)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 24909)
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
-- TOC entry 242 (class 1259 OID 24910)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 24916)
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
-- TOC entry 244 (class 1259 OID 24917)
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
-- TOC entry 245 (class 1259 OID 24924)
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
-- TOC entry 246 (class 1259 OID 24925)
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
-- TOC entry 247 (class 1259 OID 24940)
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 24946)
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
-- TOC entry 249 (class 1259 OID 24947)
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
-- TOC entry 250 (class 1259 OID 24948)
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 24954)
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
-- TOC entry 252 (class 1259 OID 24955)
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
-- TOC entry 5975 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN authentication_log.event_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.event_type IS 'LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PWD_CHANGE, ACCOUNT_LOCK';


--
-- TOC entry 5976 (class 0 OID 0)
-- Dependencies: 252
-- Name: COLUMN authentication_log.failure_reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.failure_reason IS 'e.g., Invalid Password, User Disabled';


--
-- TOC entry 255 (class 1259 OID 24974)
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
-- TOC entry 5977 (class 0 OID 0)
-- Dependencies: 255
-- Name: TABLE backorder_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.backorder_report IS 'Renamed from bon_de_reste';


--
-- TOC entry 256 (class 1259 OID 24981)
-- Name: broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broken_item_report (
    broken_item_report_id integer NOT NULL,
    digital_copy bytea
);


ALTER TABLE public.broken_item_report OWNER TO postgres;

--
-- TOC entry 5978 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE broken_item_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.broken_item_report IS 'Equivalent of C5';


--
-- TOC entry 257 (class 1259 OID 24987)
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
    digital_copy bytea
);


ALTER TABLE public.company_asset_request OWNER TO postgres;

--
-- TOC entry 5979 (class 0 OID 0)
-- Dependencies: 257
-- Name: TABLE company_asset_request; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.company_asset_request IS 'Demande du mat�riel';


--
-- TOC entry 258 (class 1259 OID 24994)
-- Name: consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable (
    consumable_id integer NOT NULL,
    consumable_model_id integer NOT NULL,
    destruction_certificate_id integer,
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
-- TOC entry 259 (class 1259 OID 24999)
-- Name: consumable_attribute_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_attribute_definition (
    consumable_attribute_definition_id integer CONSTRAINT consumable_attribute_defini_consumable_attribute_defin_not_null NOT NULL,
    consumable_type_code character varying(18),
    data_type character varying(18),
    unit character varying(24),
    description character varying(256)
);


ALTER TABLE public.consumable_attribute_definition OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 25003)
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
-- TOC entry 261 (class 1259 OID 25010)
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
-- TOC entry 262 (class 1259 OID 25014)
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
-- TOC entry 263 (class 1259 OID 25021)
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
-- TOC entry 5980 (class 0 OID 0)
-- Dependencies: 263
-- Name: TABLE consumable_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_is_assigned_to_person IS 'The first person is the one to whom the consumable is assign';


--
-- TOC entry 264 (class 1259 OID 25031)
-- Name: consumable_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_asset (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_a_consumable_model_id_not_null NOT NULL,
    asset_model_id integer CONSTRAINT c_is_compatible_with_a_asset_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 25036)
-- Name: consumable_is_compatible_with_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_stock_item (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_si_consumable_model_id_not_null NOT NULL,
    stock_item_model_id integer CONSTRAINT c_is_compatible_with_si_stock_item_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_stock_item OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 25041)
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
-- TOC entry 267 (class 1259 OID 25047)
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
-- TOC entry 5981 (class 0 OID 0)
-- Dependencies: 267
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_is_used_in_stock_item_history_id_seq OWNED BY public.consumable_is_used_in_stock_item_history.id;


--
-- TOC entry 268 (class 1259 OID 25048)
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
-- TOC entry 269 (class 1259 OID 25054)
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
-- TOC entry 270 (class 1259 OID 25061)
-- Name: consumable_model_is_found_in_purchase_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_model_is_found_in_purchase_order (
    consumable_model_id integer CONSTRAINT consumable_model_is_found_in_bdc_consumable_model_id_not_null NOT NULL,
    purchase_order_id integer CONSTRAINT consumable_model_is_found_in_bdc_purchase_order_id_not_null NOT NULL,
    quantity_ordered integer,
    quantity_received integer,
    quantity_invoiced integer,
    unit_price numeric(10,2)
);


ALTER TABLE public.consumable_model_is_found_in_purchase_order OWNER TO postgres;

--
-- TOC entry 5982 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE consumable_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_model_is_found_in_purchase_order IS 'Renamed from consumable_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 271 (class 1259 OID 25066)
-- Name: consumable_movement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_movement (
    consumable_movement_id integer NOT NULL,
    destination_room_id integer NOT NULL,
    source_room_id integer NOT NULL,
    maintenance_step_id integer,
    external_maintenance_step_id integer,
    consumable_id integer NOT NULL,
    movement_reason character varying(128) NOT NULL,
    movement_datetime timestamp without time zone NOT NULL,
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL
);


ALTER TABLE public.consumable_movement OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 25075)
-- Name: consumable_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_type (
    consumable_type_id integer NOT NULL,
    consumable_type_label character varying(60),
    consumable_type_code character varying(18)
);


ALTER TABLE public.consumable_type OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 25079)
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
-- TOC entry 254 (class 1259 OID 24967)
-- Name: delivery_note; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_note (
    delivery_note_id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    delivery_note_date date,
    digital_copy bytea,
    delivery_note_code character varying(10)
);


ALTER TABLE public.delivery_note OWNER TO postgres;

--
-- TOC entry 5983 (class 0 OID 0)
-- Dependencies: 254
-- Name: TABLE delivery_note; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.delivery_note IS 'Renamed from bon_de_livraison';


--
-- TOC entry 274 (class 1259 OID 25084)
-- Name: destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destruction_certificate (
    destruction_certificate_id integer NOT NULL,
    digital_copy bytea,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.destruction_certificate OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 25090)
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
-- TOC entry 276 (class 1259 OID 25102)
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
-- TOC entry 277 (class 1259 OID 25103)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 25109)
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
-- TOC entry 279 (class 1259 OID 25110)
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
-- TOC entry 280 (class 1259 OID 25119)
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
-- TOC entry 281 (class 1259 OID 25120)
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 25128)
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
-- TOC entry 283 (class 1259 OID 25134)
-- Name: external_maintenance_document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_document (
    external_maintenance_document_id integer CONSTRAINT external_maintenance_docume_external_maintenance_docum_not_null NOT NULL,
    external_maintenance_id integer NOT NULL,
    document_is_signed boolean,
    item_is_received_by_maintenance_provider boolean,
    maintenance_provider_final_decision character varying(60),
    digital_copy bytea
);


ALTER TABLE public.external_maintenance_document OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 25141)
-- Name: external_maintenance_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_provider (
    external_maintenance_provider_id integer CONSTRAINT external_maintenance_provid_external_maintenance_provi_not_null NOT NULL,
    external_maintenance_provider_name character varying(48),
    external_maintenance_provider_location character varying(128)
);


ALTER TABLE public.external_maintenance_provider OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 25145)
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
-- TOC entry 286 (class 1259 OID 25151)
-- Name: external_maintenance_typical_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_typical_step (
    external_maintenance_typical_step_id integer CONSTRAINT external_maintenance_typica_external_maintenance_typic_not_null NOT NULL,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    maintenance_type character(8),
    description character varying(256)
);


ALTER TABLE public.external_maintenance_typical_step OWNER TO postgres;

--
-- TOC entry 5984 (class 0 OID 0)
-- Dependencies: 286
-- Name: COLUMN external_maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 287 (class 1259 OID 25155)
-- Name: invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice (
    invoice_id integer NOT NULL,
    delivery_note_id integer NOT NULL,
    digital_copy bytea
);


ALTER TABLE public.invoice OWNER TO postgres;


CREATE TABLE public.acceptance_report (
    acceptance_report_id integer NOT NULL,
    delivery_note_id integer NOT NULL,
    acceptance_report_datetime timestamp without time zone,
    is_signed_by_director_of_administration_and_support boolean,
    is_signed_by_protection_and_security_bureau_chief boolean,
    is_signed_by_information_technilogy_bureau_chief boolean,
    acceptance_report_is_stock_item_and_consumable_responsible boolean,
    is_signed_by_school_headquarter boolean,
    digital_copy text,
    CONSTRAINT acceptance_report_pkey PRIMARY KEY (acceptance_report_id),
    CONSTRAINT acceptance_report_delivery_note_id_key UNIQUE (delivery_note_id),
    CONSTRAINT fk_acceptance_report_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);


ALTER TABLE public.acceptance_report OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 25162)
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
    digital_copy bytea,
    stock_item_id integer,
    consumable_id integer,
    maintenance_status character varying(20)
);


ALTER TABLE public.maintenance OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 25170)
-- Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_inspection_leads_to_broken_item_report (
    maintenance_id integer CONSTRAINT maintenance_inspection_leads_to_broken__maintenance_id_not_null NOT NULL,
    broken_item_report_id integer CONSTRAINT maintenance_inspection_leads_to__broken_item_report_id_not_null NOT NULL
);


ALTER TABLE public.maintenance_inspection_leads_to_broken_item_report OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 25175)
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
-- TOC entry 291 (class 1259 OID 25182)
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
-- TOC entry 292 (class 1259 OID 25192)
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
-- TOC entry 293 (class 1259 OID 25193)
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
    source_room_id integer,
    destination_room_id integer,
    note character varying(256),
    fulfilled_by_person_id integer,
    requested_stock_item_model_id integer,
    requested_consumable_model_id integer,
    rejected_by_person_id integer,
    rejected_at timestamp with time zone
);


ALTER TABLE public.maintenance_step_item_request OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 25202)
-- Name: maintenance_typical_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_typical_step (
    maintenance_typical_step_id integer NOT NULL,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    description character varying(256),
    maintenance_type character(8),
    operation_type character varying(24) DEFAULT 'change'::character varying NOT NULL,
    CONSTRAINT maintenance_typical_step_operation_type_check CHECK (((operation_type)::text = ANY (ARRAY[('add'::character varying)::text, ('remove'::character varying)::text, ('change'::character varying)::text, ('replace'::character varying)::text, ('repair'::character varying)::text, ('inspect'::character varying)::text, ('clean'::character varying)::text, ('calibrate'::character varying)::text, ('test'::character varying)::text])))
);


ALTER TABLE public.maintenance_typical_step OWNER TO postgres;

--
-- TOC entry 5985 (class 0 OID 0)
-- Dependencies: 294
-- Name: COLUMN maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 295 (class 1259 OID 25209)
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
-- TOC entry 296 (class 1259 OID 25213)
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
-- TOC entry 297 (class 1259 OID 25218)
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
-- TOC entry 298 (class 1259 OID 25227)
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
-- TOC entry 5986 (class 0 OID 0)
-- Dependencies: 298
-- Name: COLUMN person_assignment.employment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_assignment.employment_type IS 'Permanent, contractual...';


--
-- TOC entry 299 (class 1259 OID 25233)
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
-- TOC entry 334 (class 1259 OID 49398)
-- Name: person_reports_problem_on_asset_included_consumable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_consumable (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_co_report_id_not_null1 NOT NULL,
    consumable_id integer CONSTRAINT person_reports_problem_on_asset_included_consumable_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_consumabl_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_consumable OWNER TO postgres;

--
-- TOC entry 336 (class 1259 OID 49426)
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
-- TOC entry 5987 (class 0 OID 0)
-- Dependencies: 336
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_consumable_id_seq OWNED BY public.person_reports_problem_on_asset_included_consumable.id;


--
-- TOC entry 332 (class 1259 OID 49364)
-- Name: person_reports_problem_on_asset_included_context; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_context (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_con_report_id_not_null NOT NULL,
    destination_room_id integer CONSTRAINT person_reports_problem_on_asset_in_destination_room_id_not_null NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_context OWNER TO postgres;

--
-- TOC entry 333 (class 1259 OID 49381)
-- Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_reports_problem_on_asset_included_stock_item (
    report_id integer CONSTRAINT person_reports_problem_on_asset_included_sto_report_id_not_null NOT NULL,
    stock_item_id integer CONSTRAINT person_reports_problem_on_asset_included_stock_item_id_not_null NOT NULL,
    id integer CONSTRAINT person_reports_problem_on_asset_included_stock_ite_id_not_null1 NOT NULL
);


ALTER TABLE public.person_reports_problem_on_asset_included_stock_item OWNER TO postgres;

--
-- TOC entry 335 (class 1259 OID 49415)
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
-- TOC entry 5988 (class 0 OID 0)
-- Dependencies: 335
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_reports_problem_on_asset_included_stock_item_id_seq OWNED BY public.person_reports_problem_on_asset_included_stock_item.id;


--
-- TOC entry 300 (class 1259 OID 25241)
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
-- TOC entry 301 (class 1259 OID 25249)
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
-- TOC entry 302 (class 1259 OID 25257)
-- Name: person_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_role_mapping (
    role_id integer NOT NULL,
    person_id integer NOT NULL
);


ALTER TABLE public.person_role_mapping OWNER TO postgres;

--
-- TOC entry 5989 (class 0 OID 0)
-- Dependencies: 302
-- Name: COLUMN person_role_mapping.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_role_mapping.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 303 (class 1259 OID 25262)
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
-- TOC entry 304 (class 1259 OID 25266)
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
-- TOC entry 253 (class 1259 OID 24960)
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
-- TOC entry 5990 (class 0 OID 0)
-- Dependencies: 253
-- Name: TABLE purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.purchase_order IS 'Renamed from bon_de_commande';


--
-- TOC entry 305 (class 1259 OID 25270)
-- Name: receipt_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipt_report (
    receipt_report_id integer NOT NULL,
    report_datetime timestamp without time zone,
    report_full_code character varying(48),
    digital_copy bytea
);


ALTER TABLE public.receipt_report OWNER TO postgres;

--
-- TOC entry 5991 (class 0 OID 0)
-- Dependencies: 305
-- Name: TABLE receipt_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receipt_report IS 'This represents the "PV de r�ception"';


--
-- TOC entry 306 (class 1259 OID 25276)
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
-- TOC entry 5992 (class 0 OID 0)
-- Dependencies: 306
-- Name: TABLE role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.role IS 'Role is what the person can do in the system';


--
-- TOC entry 5993 (class 0 OID 0)
-- Dependencies: 306
-- Name: COLUMN role.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 307 (class 1259 OID 25280)
-- Name: room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room (
    room_id integer NOT NULL,
    room_name character varying(30),
    room_type_id integer
);


ALTER TABLE public.room OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 25284)
-- Name: room_belongs_to_organizational_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_belongs_to_organizational_structure (
    organizational_structure_id integer CONSTRAINT room_belongs_to_organizatio_organizational_structure_i_not_null NOT NULL,
    room_id integer NOT NULL
);


ALTER TABLE public.room_belongs_to_organizational_structure OWNER TO postgres;

--
-- TOC entry 309 (class 1259 OID 25289)
-- Name: room_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_type (
    room_type_id integer NOT NULL,
    room_type_label character varying(60) NOT NULL,
    room_type_code character varying(18) NOT NULL
);


ALTER TABLE public.room_type OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 25295)
-- Name: room_type_room_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_type_room_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_type_room_type_id_seq OWNER TO postgres;

--
-- TOC entry 5994 (class 0 OID 0)
-- Dependencies: 310
-- Name: room_type_room_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_type_room_type_id_seq OWNED BY public.room_type.room_type_id;


--
-- TOC entry 311 (class 1259 OID 25296)
-- Name: stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item (
    stock_item_id integer NOT NULL,
    maintenance_step_id integer,
    stock_item_model_id integer NOT NULL,
    destruction_certificate_id integer,
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
-- TOC entry 312 (class 1259 OID 25301)
-- Name: stock_item_attribute_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_attribute_definition (
    stock_item_attribute_definition_id integer CONSTRAINT stock_item_attribute_defini_stock_item_attribute_defin_not_null NOT NULL,
    unit character varying(24),
    description character varying(256),
    data_type character varying(18)
);


ALTER TABLE public.stock_item_attribute_definition OWNER TO postgres;

--
-- TOC entry 313 (class 1259 OID 25305)
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
-- TOC entry 314 (class 1259 OID 25312)
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
-- TOC entry 315 (class 1259 OID 25316)
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
-- TOC entry 316 (class 1259 OID 25324)
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
-- TOC entry 5995 (class 0 OID 0)
-- Dependencies: 316
-- Name: TABLE stock_item_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_is_assigned_to_person IS 'The first person is the one to whom the stock item is assign';


--
-- TOC entry 317 (class 1259 OID 25334)
-- Name: stock_item_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_compatible_with_asset (
    stock_item_model_id integer CONSTRAINT stock_item_is_compatible_with_asse_stock_item_model_id_not_null NOT NULL,
    asset_model_id integer NOT NULL
);


ALTER TABLE public.stock_item_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 25339)
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
-- TOC entry 319 (class 1259 OID 25345)
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
-- TOC entry 320 (class 1259 OID 25352)
-- Name: stock_item_model_is_found_in_purchase_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_model_is_found_in_purchase_order (
    stock_item_model_id integer CONSTRAINT stock_item_model_is_found_in_bdc_stock_item_model_id_not_null NOT NULL,
    purchase_order_id integer CONSTRAINT stock_item_model_is_found_in_bdc_purchase_order_id_not_null NOT NULL,
    quantity_ordered integer,
    quantity_received integer,
    quantity_invoiced integer,
    unit_price numeric(10,2)
);


ALTER TABLE public.stock_item_model_is_found_in_purchase_order OWNER TO postgres;

--
-- TOC entry 5996 (class 0 OID 0)
-- Dependencies: 320
-- Name: TABLE stock_item_model_is_found_in_purchase_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_model_is_found_in_purchase_order IS 'Renamed from stock_item_model_is_found_in_bdc (bdc = bon_de_commande)';


--
-- TOC entry 321 (class 1259 OID 25357)
-- Name: stock_item_movement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_movement (
    stock_item_movement_id integer NOT NULL,
    stock_item_id integer NOT NULL,
    source_room_id integer NOT NULL,
    destination_room_id integer NOT NULL,
    maintenance_step_id integer,
    external_maintenance_step_id integer,
    movement_reason character varying(128) NOT NULL,
    movement_datetime timestamp without time zone NOT NULL,
    status public.movement_status DEFAULT 'pending'::public.movement_status NOT NULL
);


ALTER TABLE public.stock_item_movement OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 25366)
-- Name: stock_item_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_type (
    stock_item_type_id integer NOT NULL,
    stock_item_type_label character varying(60),
    stock_item_type_code character varying(18)
);


ALTER TABLE public.stock_item_type OWNER TO postgres;

--
-- TOC entry 323 (class 1259 OID 25370)
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
-- TOC entry 324 (class 1259 OID 25375)
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
-- TOC entry 325 (class 1259 OID 25379)
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
-- TOC entry 326 (class 1259 OID 25395)
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
-- TOC entry 327 (class 1259 OID 25403)
-- Name: warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse (
    warehouse_id integer NOT NULL,
    warehouse_name character varying(60),
    warehouse_address character varying(128)
);


ALTER TABLE public.warehouse OWNER TO postgres;

--
-- TOC entry 5997 (class 0 OID 0)
-- Dependencies: 327
-- Name: TABLE warehouse; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.warehouse IS 'Warehouse" is in our case "ERI/2RM';


--
-- TOC entry 5266 (class 2604 OID 25407)
-- Name: asset_is_composed_of_consumable_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_consumable_history_id_seq'::regclass);


--
-- TOC entry 5267 (class 2604 OID 25408)
-- Name: asset_is_composed_of_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5268 (class 2604 OID 25409)
-- Name: asset_model_default_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_consumable_id_seq'::regclass);


--
-- TOC entry 5270 (class 2604 OID 25410)
-- Name: asset_model_default_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_stock_item_id_seq'::regclass);


--
-- TOC entry 5280 (class 2604 OID 41211)
-- Name: attribution_order_asset_consumable_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_consumable_accessory_id_seq'::regclass);


--
-- TOC entry 5279 (class 2604 OID 41176)
-- Name: attribution_order_asset_stock_item_accessory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory ALTER COLUMN id SET DEFAULT nextval('public.attribution_order_asset_stock_item_accessory_id_seq'::regclass);


--
-- TOC entry 5273 (class 2604 OID 25411)
-- Name: consumable_is_used_in_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.consumable_is_used_in_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5282 (class 2604 OID 49427)
-- Name: person_reports_problem_on_asset_included_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_consumable_id_seq'::regclass);


--
-- TOC entry 5281 (class 2604 OID 49416)
-- Name: person_reports_problem_on_asset_included_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item ALTER COLUMN id SET DEFAULT nextval('public.person_reports_problem_on_asset_included_stock_item_id_seq'::regclass);


--
-- TOC entry 5277 (class 2604 OID 25412)
-- Name: room_type room_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_type ALTER COLUMN room_type_id SET DEFAULT nextval('public.room_type_room_type_id_seq'::regclass);


--
-- TOC entry 5843 (class 0 OID 24789)
-- Dependencies: 219
-- Data for Name: administrative_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_certificate (administrative_certificate_id, warehouse_id, attribution_order_id, receipt_report_id, interested_organization, operation, format, is_signed_by_warehouse_storage_magaziner, is_signed_by_warehouse_storage_accountant, is_signed_by_warehouse_storage_marketer, is_signed_by_warehouse_it_chief, is_signed_by_warehouse_leader, digital_copy) FROM stdin;
1	1	2	1	\N	entry	\N	f	f	f	f	f	\N
2	1	3	2	\N	entry	\N	f	f	f	f	f	\N
\.


--
-- TOC entry 5844 (class 0 OID 24798)
-- Dependencies: 220
-- Data for Name: asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset (asset_id, asset_model_id, attribution_order_id, destruction_certificate_id, asset_serial_number, asset_fabrication_datetime, asset_inventory_number, asset_service_tag, asset_name, asset_name_in_the_administrative_certificate, asset_arrival_datetime, asset_status) FROM stdin;
1	1	\N	\N	ABCD1234	\N	001		Latitude for Test	\N	\N	active
2	1	\N	\N	gggggg	\N	004		Another Latitude for Test	\N	\N	active
3	1	2	\N	eeeeee	\N	0088	\N	Hello	\N	\N	In Stock
4	1	3	\N	testao1	\N	999	\N	ao1	\N	\N	In Stock
6	1	5	\N	aaaa	\N	aaa	\N	aaaa	\N	\N	In Stock
7	1	\N	\N	7777	\N	7777		latest_test_for_attributes	\N	\N	active
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
27	1	22	\N	test_b	\N	test_b	\N	test_b	\N	\N	In Stock
5	1	4	\N	777	\N	777	\N	ao_test	\N	\N	failed
\.


--
-- TOC entry 5845 (class 0 OID 24803)
-- Dependencies: 221
-- Data for Name: asset_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_definition (asset_attribute_definition_id, data_type, unit, description) FROM stdin;
1	number	Inch	Screen Resolution
2	number	mAh	Battery Capacity
3	string	\N	Disk Type
\.


--
-- TOC entry 5846 (class 0 OID 24807)
-- Dependencies: 222
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
\.


--
-- TOC entry 5847 (class 0 OID 24814)
-- Dependencies: 223
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
-- TOC entry 5848 (class 0 OID 24818)
-- Dependencies: 224
-- Data for Name: asset_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_condition_history (asset_condition_history_id, asset_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
1	1	1	rtrterte	\N	\N	\N	2026-02-24 16:45:06.487383
\.


--
-- TOC entry 5849 (class 0 OID 24826)
-- Dependencies: 225
-- Data for Name: asset_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_assigned_to_person (person_id, asset_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
9	1	1008	1	2026-02-18 10:43:00	2026-02-18 10:43:39.70789	Good	f	\N
9	1	1008	2	2026-02-18 13:11:00	2026-02-24 18:31:56.830366	Good	f	10
9	1	10	3	2026-02-24 18:47:00	2026-02-25 21:40:04.701229	Good	f	10
9	1	1008	4	2026-02-27 13:22:00	\N	Good	t	\N
\.


--
-- TOC entry 5850 (class 0 OID 24836)
-- Dependencies: 226
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
\.


--
-- TOC entry 5852 (class 0 OID 24843)
-- Dependencies: 228
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
\.


--
-- TOC entry 5854 (class 0 OID 24850)
-- Dependencies: 230
-- Data for Name: asset_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model (asset_model_id, asset_brand_id, asset_type_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	10	1	Latitude 5531	L5531	2022	\N	t		24
\.


--
-- TOC entry 5855 (class 0 OID 24856)
-- Dependencies: 231
-- Data for Name: asset_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_attribute_value (asset_model_id, asset_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	2	f	\N	90000.000000	\N
1	3	f	SSD NVMe	\N	\N
\.


--
-- TOC entry 5856 (class 0 OID 24863)
-- Dependencies: 232
-- Data for Name: asset_model_default_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_consumable (id, asset_model_id, consumable_model_id, quantity, notes) FROM stdin;
1	1	1	1	\N
3	1	2	2	
\.


--
-- TOC entry 5858 (class 0 OID 24872)
-- Dependencies: 234
-- Data for Name: asset_model_default_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_stock_item (id, asset_model_id, stock_item_model_id, quantity, notes) FROM stdin;
1	1	1	4	
\.


--
-- TOC entry 5860 (class 0 OID 24881)
-- Dependencies: 236
-- Data for Name: asset_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_movement (asset_movement_id, asset_id, source_room_id, destination_room_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status) FROM stdin;
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
\.


--
-- TOC entry 5861 (class 0 OID 24890)
-- Dependencies: 237
-- Data for Name: asset_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type (asset_type_id, asset_type_label, asset_type_code) FROM stdin;
2	All-In-One	AIO
3	Central Unit	CU
4	Printer	PRNT
7	Projector	PRJCT
1	Laptop	LPTP
5	Scanner	SCNR
6	Monitor	MNTR
\.


--
-- TOC entry 5862 (class 0 OID 24894)
-- Dependencies: 238
-- Data for Name: asset_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type_attribute (asset_attribute_definition_id, asset_type_id, is_mandatory, default_value) FROM stdin;
1	1	t	15.6
2	1	t	\N
\.


--
-- TOC entry 5863 (class 0 OID 24899)
-- Dependencies: 239
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
\.


--
-- TOC entry 5955 (class 0 OID 41208)
-- Dependencies: 331
-- Data for Name: attribution_order_asset_consumable_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_consumable_accessory (id, attribution_order_id, asset_id, consumable_id) FROM stdin;
1	22	27	33
\.


--
-- TOC entry 5953 (class 0 OID 41173)
-- Dependencies: 329
-- Data for Name: attribution_order_asset_stock_item_accessory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribution_order_asset_stock_item_accessory (id, attribution_order_id, asset_id, stock_item_id) FROM stdin;
1	21	26	40
\.


--
-- TOC entry 5864 (class 0 OID 24904)
-- Dependencies: 240
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- TOC entry 5866 (class 0 OID 24910)
-- Dependencies: 242
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5868 (class 0 OID 24917)
-- Dependencies: 244
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
\.


--
-- TOC entry 5870 (class 0 OID 24925)
-- Dependencies: 246
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$1200000$ceTbB0O5bCmm57swQmkEmg$/LZsB44AZf4ZGvXPW6p/4orTP53jVw3AJ38DC/OLrXE=	2026-02-10 14:11:34.116607+01	t	admin			admin@example.com	t	t	2026-02-09 21:42:30.666222+01
\.


--
-- TOC entry 5871 (class 0 OID 24940)
-- Dependencies: 247
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- TOC entry 5874 (class 0 OID 24948)
-- Dependencies: 250
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5876 (class 0 OID 24955)
-- Dependencies: 252
-- Data for Name: authentication_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_log (log_id, user_id, attempted_username, event_type, ip_address, event_timestamp, failure_reason) FROM stdin;
\.


--
-- TOC entry 5879 (class 0 OID 24974)
-- Dependencies: 255
-- Data for Name: backorder_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backorder_report (backorder_report_id, purchase_order_id, backorder_report_date, digital_copy) FROM stdin;
\.


--
-- TOC entry 5880 (class 0 OID 24981)
-- Dependencies: 256
-- Data for Name: broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broken_item_report (broken_item_report_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 5881 (class 0 OID 24987)
-- Dependencies: 257
-- Data for Name: company_asset_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_asset_request (company_asset_request_id, attribution_order_id, is_signed_by_company, administrative_serial_number, title_of_demand, organization_body_designation, register_number_or_book_journal_of_corpse, register_number_or_book_journal_of_establishment, is_signed_by_company_leader, is_signed_by_regional_provider, is_signed_by_company_representative, digital_copy) FROM stdin;
1	3	t	ASN	Hello	ESAM	1234	\N	t	t	t	\N
2	2	f	aaaa	aaaa	aaaa	aaaaaa	\N	f	f	f	\N
\.


--
-- TOC entry 5882 (class 0 OID 24994)
-- Dependencies: 258
-- Data for Name: consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable (consumable_id, consumable_model_id, destruction_certificate_id, consumable_name, consumable_serial_number, consumable_fabrication_datetime, consumable_inventory_number, consumable_service_tag, consumable_name_in_administrative_certificate, consumable_arrival_datetime, consumable_status) FROM stdin;
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
\.


--
-- TOC entry 5883 (class 0 OID 24999)
-- Dependencies: 259
-- Data for Name: consumable_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_definition (consumable_attribute_definition_id, consumable_type_code, data_type, unit, description) FROM stdin;
1	\N	number	m	Number of Meters
2	\N	string	\N	Color
3	\N	number	page(s)	Number of pages
\.


--
-- TOC entry 5884 (class 0 OID 25003)
-- Dependencies: 260
-- Data for Name: consumable_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_value (consumable_id, consumable_attribute_definition_id, value_string, value_bool, value_date, value_number) FROM stdin;
33	1	\N	f	\N	500.000000
\.


--
-- TOC entry 5885 (class 0 OID 25010)
-- Dependencies: 261
-- Data for Name: consumable_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_brand (consumable_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	BIC	BIC	t	\N
2	Schneider	SCHNEIDER	t	\N
3	DELL	DELL	t	brands/consumables/Dell_whh9uC9.svg
\.


--
-- TOC entry 5886 (class 0 OID 25014)
-- Dependencies: 262
-- Data for Name: consumable_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_condition_history (consumable_condition_history_id, consumable_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 5887 (class 0 OID 25021)
-- Dependencies: 263
-- Data for Name: consumable_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_assigned_to_person (assignment_id, consumable_id, person_id, assigned_by_person_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	1	9	10	2026-02-24 18:36:00	2026-02-24 18:36:54.831336	Good	f	\N
2	1	9	10	2026-02-24 18:37:00	2026-02-24 19:46:26.047031	Good	f	\N
3	1	9	10	2026-02-24 19:46:00	2026-02-24 19:46:46.34698	Good	f	\N
\.


--
-- TOC entry 5888 (class 0 OID 25031)
-- Dependencies: 264
-- Data for Name: consumable_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_asset (consumable_model_id, asset_model_id) FROM stdin;
1	1
\.


--
-- TOC entry 5889 (class 0 OID 25036)
-- Dependencies: 265
-- Data for Name: consumable_is_compatible_with_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_stock_item (consumable_model_id, stock_item_model_id) FROM stdin;
\.


--
-- TOC entry 5890 (class 0 OID 25041)
-- Dependencies: 266
-- Data for Name: consumable_is_used_in_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_used_in_stock_item_history (consumable_id, stock_item_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
\.


--
-- TOC entry 5892 (class 0 OID 25048)
-- Dependencies: 268
-- Data for Name: consumable_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model (consumable_model_id, consumable_type_id, consumable_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	1	1	Red Pen 01	RP01	2000	\N	t		8
2	2	1	EPSON M450	M450	\N	\N	t	\N	\N
3	1	2	Blue Pen	BP	\N	\N	t	\N	\N
4	1	3	qPen	QPEN	\N	\N	t	\N	\N
\.


--
-- TOC entry 5893 (class 0 OID 25054)
-- Dependencies: 269
-- Data for Name: consumable_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_attribute_value (consumable_model_id, consumable_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	1	f	\N	500.000000	\N
2	3	\N	\N	1000.000000	\N
3	1	\N	\N	400.000000	\N
4	1	\N	\N	400.000000	\N
\.


--
-- TOC entry 5894 (class 0 OID 25061)
-- Dependencies: 270
-- Data for Name: consumable_model_is_found_in_purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_is_found_in_purchase_order (consumable_model_id, purchase_order_id, quantity_ordered, quantity_received, quantity_invoiced, unit_price) FROM stdin;
\.


--
-- TOC entry 5895 (class 0 OID 25066)
-- Dependencies: 271
-- Data for Name: consumable_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_movement (consumable_movement_id, destination_room_id, source_room_id, maintenance_step_id, external_maintenance_step_id, consumable_id, movement_reason, movement_datetime, status) FROM stdin;
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
\.


--
-- TOC entry 5896 (class 0 OID 25075)
-- Dependencies: 272
-- Data for Name: consumable_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type (consumable_type_id, consumable_type_label, consumable_type_code) FROM stdin;
1	Pen	PEN
2	Toner	TNR
\.


--
-- TOC entry 5897 (class 0 OID 25079)
-- Dependencies: 273
-- Data for Name: consumable_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type_attribute (consumable_type_id, consumable_attribute_definition_id, is_mandatory, default_value) FROM stdin;
1	1	f	400
2	3	f	1000
\.


--
-- TOC entry 5878 (class 0 OID 24967)
-- Dependencies: 254
-- Data for Name: delivery_note; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_note (delivery_note_id, purchase_order_id, delivery_note_date, digital_copy, delivery_note_code) FROM stdin;
\.


--
-- TOC entry 5898 (class 0 OID 25084)
-- Dependencies: 274
-- Data for Name: destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destruction_certificate (destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
\.


--
-- TOC entry 5899 (class 0 OID 25090)
-- Dependencies: 275
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- TOC entry 5901 (class 0 OID 25103)
-- Dependencies: 277
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
\.


--
-- TOC entry 5903 (class 0 OID 25110)
-- Dependencies: 279
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
\.


--
-- TOC entry 5905 (class 0 OID 25120)
-- Dependencies: 281
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
mwube6mtzimgwmghul5d0r6qos8lqeqe	.eJxVjDsOwjAQBe_iGllr_Isp6XMGa-3d4ACypTipEHeHSCmgfTPzXiLitpa4dV7iTOIilDj9bgnzg-sO6I711mRudV3mJHdFHrTLsRE_r4f7d1Cwl2_NGbPT5EgF9FYTZW8QXLA8KRwAskNzBgbwnsGHkAIwDWYCT4Taknh_APYiOC0:1vpY5p:xY5WGtSgTAbInJSRivcUir-NtXutxfuZCHkLUnB8v1k	2026-02-23 21:42:49.784307+01
\.


--
-- TOC entry 5906 (class 0 OID 25128)
-- Dependencies: 282
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
-- TOC entry 5907 (class 0 OID 25134)
-- Dependencies: 283
-- Data for Name: external_maintenance_document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_document (external_maintenance_document_id, external_maintenance_id, document_is_signed, item_is_received_by_maintenance_provider, maintenance_provider_final_decision, digital_copy) FROM stdin;
\.


--
-- TOC entry 5908 (class 0 OID 25141)
-- Dependencies: 284
-- Data for Name: external_maintenance_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_provider (external_maintenance_provider_id, external_maintenance_provider_name, external_maintenance_provider_location) FROM stdin;
1	ERMT/2RM	\N
\.


--
-- TOC entry 5909 (class 0 OID 25145)
-- Dependencies: 285
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
-- TOC entry 5910 (class 0 OID 25151)
-- Dependencies: 286
-- Data for Name: external_maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_typical_step (external_maintenance_typical_step_id, estimated_cost, actual_cost, maintenance_type, description) FROM stdin;
1	\N	\N	Hardware	Removing the motherboard
2	\N	\N	Hardware	Removing the RAM
\.


--
-- TOC entry 5911 (class 0 OID 25155)
-- Dependencies: 287
-- Data for Name: invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice (invoice_id, delivery_note_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 5912 (class 0 OID 25162)
-- Dependencies: 288
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
\.


--
-- TOC entry 5913 (class 0 OID 25170)
-- Dependencies: 289
-- Data for Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_inspection_leads_to_broken_item_report (maintenance_id, broken_item_report_id) FROM stdin;
\.


--
-- TOC entry 5914 (class 0 OID 25175)
-- Dependencies: 290
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
\.


--
-- TOC entry 5915 (class 0 OID 25182)
-- Dependencies: 291
-- Data for Name: maintenance_step_attribute_change; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_attribute_change (maintenance_step_attribute_change_id, target_type, target_id, attribute_definition_id, value_string, value_bool, value_date, value_number, created_at_datetime, created_by_user_id, applied_at_datetime, maintenance_step_id) FROM stdin;
\.


--
-- TOC entry 5917 (class 0 OID 25193)
-- Dependencies: 293
-- Data for Name: maintenance_step_item_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_step_item_request (maintenance_step_item_request_id, maintenance_step_id, requested_by_person_id, request_type, status, created_at, fulfilled_at, stock_item_id, consumable_id, source_room_id, destination_room_id, note, fulfilled_by_person_id, requested_stock_item_model_id, requested_consumable_model_id, rejected_by_person_id, rejected_at) FROM stdin;
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
-- TOC entry 5918 (class 0 OID 25202)
-- Dependencies: 294
-- Data for Name: maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_typical_step (maintenance_typical_step_id, estimated_cost, actual_cost, description, maintenance_type, operation_type) FROM stdin;
1	1000.00	700.00	Changing the thermal paste	Hardware	change
2	\N	\N	Unmounting the old RAM	Hardware	change
3	\N	\N	Adding a pen	Hardware	add
4	\N	\N	Removing a pen	Hardware	remove
\.


--
-- TOC entry 5919 (class 0 OID 25209)
-- Dependencies: 295
-- Data for Name: organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure (organizational_structure_id, structure_code, structure_name, structure_type, is_active) FROM stdin;
1	IT	Information Technology	Bureau	t
2	MNT	Maintenance	Section	t
\.


--
-- TOC entry 5920 (class 0 OID 25213)
-- Dependencies: 296
-- Data for Name: organizational_structure_relation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_relation (organizational_structure_id, parent_organizational_structure_id, relation_id, relation_type) FROM stdin;
2	1	\N	
\.


--
-- TOC entry 5921 (class 0 OID 25218)
-- Dependencies: 297
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
\.


--
-- TOC entry 5922 (class 0 OID 25227)
-- Dependencies: 298
-- Data for Name: person_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_assignment (assignment_id, position_id, person_id, assignment_start_date, assignment_end_date, employment_type) FROM stdin;
\.


--
-- TOC entry 5923 (class 0 OID 25233)
-- Dependencies: 299
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
-- TOC entry 5958 (class 0 OID 49398)
-- Dependencies: 334
-- Data for Name: person_reports_problem_on_asset_included_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_consumable (report_id, consumable_id, id) FROM stdin;
\.


--
-- TOC entry 5956 (class 0 OID 49364)
-- Dependencies: 332
-- Data for Name: person_reports_problem_on_asset_included_context; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_context (report_id, destination_room_id) FROM stdin;
13	24
\.


--
-- TOC entry 5957 (class 0 OID 49381)
-- Dependencies: 333
-- Data for Name: person_reports_problem_on_asset_included_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset_included_stock_item (report_id, stock_item_id, id) FROM stdin;
13	1	2
\.


--
-- TOC entry 5924 (class 0 OID 25241)
-- Dependencies: 300
-- Data for Name: person_reports_problem_on_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_consumable (person_id, consumable_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 5925 (class 0 OID 25249)
-- Dependencies: 301
-- Data for Name: person_reports_problem_on_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_stock_item (person_id, stock_item_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 5926 (class 0 OID 25257)
-- Dependencies: 302
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
\.


--
-- TOC entry 5927 (class 0 OID 25262)
-- Dependencies: 303
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
-- TOC entry 5928 (class 0 OID 25266)
-- Dependencies: 304
-- Data for Name: position; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."position" (position_id, position_code, position_label, description) FROM stdin;
1	HR	Human Resources Service Chief	
2	ITBC	IT Bureau Chief	
\.


--
-- TOC entry 5877 (class 0 OID 24960)
-- Dependencies: 253
-- Data for Name: purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order (purchase_order_id, supplier_id, digital_copy, is_signed_by_finance, purchase_order_code) FROM stdin;
1	1	\N	f	oooooo
\.


--
-- TOC entry 5929 (class 0 OID 25270)
-- Dependencies: 305
-- Data for Name: receipt_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receipt_report (receipt_report_id, report_datetime, report_full_code, digital_copy) FROM stdin;
1	2026-02-23 18:32:51.676187	rerezrzerze	\N
2	2026-02-23 18:33:11.61638	testiiiiiiiiiiing	\\x255044462d312e360d25e2e3cfd30d0a31362030206f626a0d3c3c2f4c696e656172697a656420312f4c2031363738382f4f2031382f452031313539352f4e20312f542031363438342f48205b20343537203135325d3e3e0d656e646f626a0d2020202020202020202020202020202020200d0a32332030206f626a0d3c3c2f4465636f64655061726d733c3c2f436f6c756d6e7320342f507265646963746f722031323e3e2f46696c7465722f466c6174654465636f64652f49445b3c43393243453441423737383344453443383437394632333530414136313432463e3c31373837463243394333463833333437393245423031444533373044373942323e5d2f496e6465785b31362031315d2f496e666f203135203020522f4c656e6774682035342f507265762031363438352f526f6f74203137203020522f53697a652032372f547970652f585265662f575b31203220315d3e3e73747265616d0d0a68de62626410606062600a04120c538004e32e10711524360148a83e021257eb18981819168094303032fd67dcfa1f20c000af0c08e20d0a656e6473747265616d0d656e646f626a0d7374617274787265660d0a300d0a2525454f460d0a20202020202020200d0a32362030206f626a0d3c3c2f432037322f46696c7465722f466c6174654465636f64652f492039342f4c656e6774682036382f532033383e3e73747265616d0d0a68de626060606560608a650002ad300654c008c42c0c1c0d024862ac50ccc0b08b810fa86483e9520da61ca86a5d6f08cd7800ae9e8581c1de062aaa0910600031e4065a0d0a656e6473747265616d0d656e646f626a0d31372030206f626a0d3c3c2f4c616e6728feff00460052002d00460052292f4d61726b496e666f3c3c2f4d61726b656420747275653e3e2f4d657461646174612032203020522f506167654c61796f75742f4f6e65436f6c756d6e2f5061676573203134203020522f53747275637454726565526f6f742036203020522f547970652f436174616c6f673e3e0d656e646f626a0d31382030206f626a0d3c3c2f436f6e74656e7473203139203020522f43726f70426f785b302e3020302e30203631322e30203739322e305d2f4d65646961426f785b302e3020302e30203631322e30203739322e305d2f506172656e74203134203020522f5265736f75726365733c3c2f466f6e743c3c2f545430203235203020523e3e3e3e2f526f7461746520302f537472756374506172656e747320302f546162732f532f547970652f506167653e3e0d656e646f626a0d31392030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f4c656e677468203134333e3e73747265616d0d0a48891c4ecb0ac24010bbcf57e438036e7776b5b442e9a10f50a1e0616ee2c9ea412a8297febebb85404212423a237f45d3f8a93f0f50b46d37f4206fa608b017392d5423ec812c0eb01521c269ea26ae12b42e12d9876e7c7a2e5283177111fc95588277e20218ab1c93f313b7dfe20a3ccbdd2ea4db725e2d8b509559cec4107bd338a523a3d15f800100115522a50d0a656e6473747265616d0d656e646f626a0d32302030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f46697273742031322f4c656e677468203330352f4e20322f547970652f4f626a53746d3e3e73747265616d0d0a68de9c50514bc33018fc2b79546424f9dab41d8c42372d0a3264ab4e187b885d68036d5a920cdcbf374bebc64011e47b08b9bbdc7717081141c010408266339c9952288b28a1042f78ff2864555b14b118df8b819a40cc70def0caa00070de293b9f779fdb0923c47388d204bcc1ceb3396f6573bcc97adb99db01918d0004d42d5e7960c95b811759b15abedc799d47d7560b5bd678d9e996371eda0c714242f093e58d2c3355350211bcb6a27d4349888b632fbcf414574b67a6f1fbd8229c9234751de7dc8893e47ae5832abbbd5415de48952923cff75c6a631735d7df7d2fd608425fe2998f0a4aa7787df8b0a714853e081fa7e85e957466c27db2979f43ba5d7b5b9b2d90c0113f0d24d12fcc5f1393f89f2f59441183ebd7108d1c037f064178d9047497a65f020c00f9549d0a0d0a656e6473747265616d0d656e646f626a0d32312030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f4c656e67746820393631332f4c656e677468312031393539313e3e73747265616d0d0a48896496795c54d715c77fe79c3b13a2185070577c3330a0a282e0062a1a1477635250c1154410159420455c52b5b8444ddc6ada68da44d37ea26255dc13eb8269a28d8de69f9a1a11901904545c1195284cef8cc6c4f4becfbbf79c7397b9f37df79ddf03016882a510bc392636246c44dd0eb38e5cd17762724652a647ceb20a80fa018d55724eb661f94bf33380e740dd5f989a392363fc5a2f6fd7028057de8cf405a9f1d13507807679801c4a4b499a1ef069ed56c0e8ad07f44ad301cfa74d4ab49fa1fd80b48cecdce8c0e317b5bf11f06d973e3739e933af1d1f013df6008dbc339272333d967bebdf8f3aa1c71b73923252d4aeb1a3b45facf7b32873eebc6ce727080346c4bbfa33b352323357387db49f0bb017945a4c1b608287295c9dd723b63e6bf93c52b948b78da1d85594015ea5fb05cfcbe858c340219ad43f7d25affe14e0e1cbe106e813579f5c3045bb7ecd3d9a74ed22e809d5e8b1763db4f30a3c34901044e077b48496d14a5a439b68336da1ed544087e828155325dd2427b7e570eecd713c9e13782227731eafe54d7c968b4589a73493b6e22f1da597c4c87c59226be43dd920db659714c837aa8df257916a90729ada9b6ca6f5e6c6afd634bad7b8eeb5012d8bfc92fd56f87dec57677819cd0d3fc36a041add8c5023dc8834a28cc146a6b1c05862ac360a2d268b8fa5a5c5b0582d81966e96704b9c658a658b65a795ad66ab97b599b5b9b58db583b59335d8dacb3acc9a644df1677f6f7f4bc04c1b6c6cf3b479db7c6dad6cdb6dbb6ddfdabeb35504360df2094a0d5a12743df8e413ae7fea74bacf96815044629b9bc46a5aa7497c48db681f1d7093a8a01bf4985b71982611cbe35e2271862f09c4fc9c44a0f4d4243265a12cd724d6c946f9abe4cb7e39a7daaa00d5570d36b53105b849dc7f41629adf524d629be169f8182d0d4393e8ac49841911463f37896c4d62a9b1cd4da2c52f48c45ac65a36bc20d15493686df57b4122d13add4dc20848fc15897cdb3937096f37899ca0aae0134fc84542cee993d3c1757e1ab636d4b95a67ab9f4e5bc34a67305e9486dbeebaa0215f5f790d350db9dcfa590feda75df4a966b799329e459c93f4ddd719a9eb04a0be40cff379becac6069f1f43eac21e77a9adac1eee8a943d001c671d575db6e384e36fe5f1e5ca7149dba98e38475c590f875ec511e2e8a86b8ba3a923c1e1656f6b4fb04f04ecd5f63cfb427b96b6625db3ed71f6587d85ba578d2ad37b2855a53b4a77966e2dfd405f1b4aa944ffc3920b25c74a5a16b7b8f2555179512d602e30fbbbde15d2f985ac94ef7e97a64baaaed3658e7eae59ee4896644b8e7ec26bb4ad4f3c5e2ab254c736bd14d924db24df956ddc9eaee524a0f49ed44ad35333bf3cdff4d0a4df52b3db36ef351fffb9c77ce4177681bbae7e79aef9ea0beb86ebfeb9df5c61ae7ad6e2ff8af9fb5ff9df3edff70f52ae7ce4961aae56a9aeca579e4abddc50197255ee49a9dc9132b1ab6cf5b69a2715aa8be6d606ed604547446120866038c6211e139184699889e5588955588b3fe043ecc65e1cc4219c5490bb8ad42279a8aee03c2a5085db78408dc9937ca8050550100553770aa3481a4be3299e26510acda27774ce5a4e2b68bd34a83ee2540be4b25c53316a9a1aa65255840a519755281d525e6aa1dc57dd55b9eaa9e6cb1939ab8ad572d54daad435f99a0e2b6fd92bbb659f54a22918afa225bcd01cadd0013dd1095d74d67e0b23311a6f200033908d5948c7ef91a5e66a2dfa185bf011fe8cc35841c928c6055c8403452843396e12a1168fd1407ed48ada505bdca13e14437da93fc5d22095496f5126cda60c9aa3f3cd387a173e28d559fa3bf8e22adae3bace47d5b0e016fc700336dc4520eea137093ae321c2e1441f5208c6230c226fbc4eaf21869a613035c5306a8ea1e48bb1e48f58b26014b5461c5931865a620419184f8148a08ed40993a80ba650374ca6ae984a2148a45024533852a817a6534fea81348ac03bf406666b655d4ca3914771789712b0862662354dc07b3419eb2911eb682adea729f823a5e1039a81cd948a7c5a8c1db4005b291dbb68113ea35ceca48528a0653842ab7014a7b4ea9da64d28a48d341dfe08d2f9b79fd6a301aa35265067e4d0509d8fb3b007c7682da2c94b2bd518a4526fb4801dad710dcbe837d84049f813cdc4717a1f95f4266a705f95a922655715caa14ad4e7ea0b755c15aad3eaa43aaa8ea82fd529754c9de05bd28d6f4b88cecaedf88e84ca68e92e61122e57f8dfeaa03acce552c4d7b8822bf93adf101bdfe46a09962ed2d5ad760112249d74aeefccb512297df9213fe2c7d24ffa4b04df951e7c4f7af27de9c535d29b1f481fad0f438464a8b00c1391e15a39478849466ad5182551324006caeb5c27d1aa3dff2883f8093f95c112c3f5dcc04e3a4d5f6af53946762aa372baa6b5a894ae6a6d3e4767e93f544447b4427d4e5fd0292aa47fd257f4359da16fe8227d4f97e8bff4035da612ad6057c84155749d233892fb723f8ee6413c8487f2301ecea338dead681378124fe6244ee4a99ccab3399d07730c67707f4ee1e93c83d378264fd3ba378b47f308fd3d30856ef21caae6b9748b33e936bf4d77388beef23cbac7d9749f7f4b359c430f783ed5722e3de405f48817aa4a55a5aeab1beaa6aae6103ea0bf11f6a8bd6a9f2a50fbd56ef577fa178fe4503ec8ddf910fd83a3e8040fa4ff315ea5df6d1557fcced5c892970425a540fba079ea20955676ce694fdb93002711b6a5c47648e425c97b0e86a7cd4e08d9891db280b3908447d84acbd60265ebde320a5f6cba1cf21f74a7ed877eede929f0b587d5fdcd3cc9590eeda934ef69ee3af7deb9f7cee8377c1bcedf23e27d3e2a3ee063e243be5f7cc40f888f79567cc2c7714b39c184f398f9418ef169967c86e37c96dbf8214e70c8499cd4ed7c8e3bf811eee447b98b1fe325fc382fe5ab7082a7f8495ec6dfe6e5fc1dfe0c3fc557f3d3fc597e869fe06bf859be969fc3c9ff5dfe1c7f8f3fcfcfe33ef4025fcf2ff20dfc7dfe02bfc42bf86576f9154ef3abfc457e8d15ff806fe41f72867fc459fe317f897fc237f14fc5af782d7f997fc65fe19f738e7fc1ddfc3af7b0e695dc60c1a7e80951a1f3e224bd2e66a9214e500af7dbe5f477eaa03fe3e6f617dc51fe4a4be96fd4496f93a4dfe280f83d6e717fc03dee8fb83dfe8ebe8e63eb9b82e91691a01e7a1f77bb0f71a7f988be4a1fd34afa8046c40a2a891be880e8a783a248bbc41ada23f2b457dc46fb442fed166b6946aca7fbc4201d164374446ca04362809e177be845b18f5e1207e81571905e15d3f49a98a197c5bd342f429a130fd12fc539fab57834f66fd92597c8a45c2a3b64a76cc7ddefd6d83f63ff8abd137b4fde2e8b729ddc28c7a4277db94dde29eb32908372831c9135392437c93b6449f6ca61d92fb7c8b2accabbe466392eb7ca09398a3be4bb728dfc9a7c5c86f29c7c547e4b3e299f900fcb47e463f284dc2da7e44979549e96fbe50e392d0fca9df26ef9927c41be2873726dbcd77c69f9c29f16fe117b07bd9e16de6b3d9f3cb7f06efc5a44dac274948ed32e7c67a886af991fa6bd344da354a783e8fe53e0d889f7019c056fe3641ba7fd34068e293a02eed3b41d12d378ef037c8a02da034d4770828ce224341acae0bc07d469683f663519fe11403b403d099d9ba1b306ec7e9c3d5b69021cfbf283cf3ef3f453674e3f78eae489e3b30fdc7fece891c3f71d9a993e78ef81fdfbf6eed9bdeb9e9d77efd83e3559af552be5e0ae3b27eed836ee7b5bb76c1e1b1d2e6dda78fb86a1c181f5eb8a37ad4875b4778b4667479feaab77f47453a3a313d3ce9e6ea1dbfa74c222f5a69cabf3c35e7a68c42bf43be9b4efa8b4ce6b992998a75c0bab2d820f1590822c540c8daaa1e171cf2d8481250233761914d1572dd29a33cd7d639e2ee6005d02afb3f022b8fe0af2408bac5c4da530ac352896013eef34849dc4fb1ef6e189af7425a7d2caab83b791a4aef458d08759576b26dc75d0e8cea5a882a7ba55cd89e66cdcd36e30e9af07377146db313a47df5087a279a0ddaaebeab68caa94bc30ad45a09c263ce22162a2ec846995767d7f6ee1c2f5865ba5a18ba9b7a1c4d9e1465e9c1d1df7e653f8977676cc3b8f1ed017f4fa8d1b41f3e65da2bcc5b2c11aa4015c03d090c0ce9c474f33fcce7c9e68d652a54558b80a2f2c2ed9c209aace71844b450b65ed4279dc7baa7332a2e45bdc12b864849b8db86f6a7227414919ca9bc4683896187d1025ec4cbe239e4fe6dbf35de8afd80b833a0fcc9be06d17f4469758229c06748e58f49c986db4e79d79ab69a4c9390b4e839b5dc4c172c3768922ac1739bef9a2079bc7bd37ba08faed1b1cbde6d3d35d68f0c69cba98d6c31e76afd0101b730152db80b14cc1455aebfca867780307398feceeefe936d9e57aaaee28bf71f5d5e1de422395ea1b0afb90c8c8359b608d725b36c88551ca994453a99b91a6b1cc40551503b028940dc60050d52d6ea02b410e5337550c8b262bca869bae69702cd3103283aebc06716bebd21daadeab3b55ef22652dad8d286d869250bd5a5c1345bda00aee753bc2aaaa2003f3256fca99f4cbd0adf3aaaca5ea751a927a512fd709b85468d0c61c7c1b420e6eca95b6a1484d30dc30ec771b79992d57cb06ee4fa3eec32649f5f7fb974814dc50e7cbd5001c05df32a312812ca8b25b4394e12e2237aa301d1f373263e35ed85553358508e7f361196e3b6ed57742bf6a230e7998463dddf18bdda9d99cd8d47ca63a89d79c4b9540552284a9ce2b7153572226c175294e0d9ae5ecafb0bfe1a02ad4c0619e724dc7907169b7e647294325db37fe2b93b884c9c59e5ae561ea9616249a10008c504f5d0e6e5f048be60910b59551ae68993599e7a5f5dd8ebec7cf2db294f56cc50ddd94ba599997155e679e40c73199ad964d736a33b907c42010ae57412e436131085b190731995d5c49efce5da6122d558c6169ce1877f46cc90d7c37088045f5a41d57c7f1eb4e964d7299b65b8afc29a1f7e3a71c8e42964c01393a811360b25c5769746b6d8a368abeb151c23a1af5343961a8422d6062a60866a8cfeab6ec80f9c1d89b53e53a36d1ace796eb56b608736d748c36a7a0d23e5838636389c0a15b54ccab1a221bf504aa2d9e59162e0fddd521bad6041aaecc56b7043816dc945b74ed569791c926080306f2a128626ccf1846c8db91d5bb728d8944e622c68e3db9883969b5c2b2114f975a2c093b30d997d37ced2a108df36204fd43da8d32c18b670610de3cb2ca31d2aee631afb93d567ec0883aad0d8bc480b16dd71c8be996bd9d91bdd1a26d7674d9d19ed1c90c365a4bd8109113c69d8b4980398c8e6462d6dcc801ccb194dba458478226203375eb53741cbaa67de2a25056e671e616de2aa14706ca3cbe6f964fda858c84551d468a4db8da0cf1d342d15c291a9d660c58172e4577d891b0361b5ae452fcf2c037a337bff01645914b373f26678c97679a55d9acbbbaa3b7fbb95a24d5d6ece02e3a2a3a7775d8de36b6a11a543a813e06f75155ae1ecde110b1be9d89a23a1875079395a2a8a8881c6a4ef02756935a2fcc8b505a6abd66808b33759e4924d52af3d3ae56e12f4202ddde34a3d4922e34fab01ad4a2831a51a655ceade66ad46637baddeeedb4694d635edc91be4d99ac9ec935b3387a4fe716e933a62613ad48260d2d5c24c6adba992837b2cdf7742ef9a95261f2ff5b2cd9dc4ddd6e69a61b6593ff7ba958b44183d1760d72a47930ea13c066ab61685a5b6362a9a9d0aeec32e097c3b4d5307275d34ac4e6284c2999a593166341945bc298136d5ba6138414782f44a9dd09620ad65c70222e8cf985059aceb5b8a320c0ee8e4c94e74d72533acace999c8f59f13fb4576b7053c7153ef7295932b6253f7899225b462e18b091b0ccab8c8b1b48200d60330c860cb60bb8c8f69460420910f31c374421210162482810670830644a04253c321d778694b694471a527eb44303c4054a3a858499a694c856bfb3f7cac842b8f0a31e7fda7b77cf3d7bf6ec9eef9c6554436422c38c24bb19a5c971ac6faa37f634a9fba0bb4b19277a7797467e3b2425a30656fb6b98d1e34a83bbc6087f7a602ade83630e49168f29a0b1803c684c30688ff23fd3ff0914a0248a4baa0cc677849ab01fd8eb5e8947acf1bdbd44b7b9cbbdba5aee34c3c15616b29771fdc2b929890fc070ec6fd3299373443911e318d1c5a118dbdb877d6f8952c2a282e8b751bfd58a9036bf8deb9d31ab09bdeca9539c4942125acd93c3e8cfae13b3f1195f546016ba4dbcbbeb84ba75052e5700755699846a0b8932c0a9cac5d2568f20b9200a9e404d8de021718de9835aaa9cab63dc00dc692e691c8d332e436ef39e811ca00e9a35aeffe84adc2b8e476e66571a542523c90333822e579a0343419713178d50b370af39e6167dc8e2bac794e2153423380d39b63e590e4ea98013f846661bd5dfc6b7bce8056b7b414fc32efe1e2c15aa72bf90c3ae08cd742f47b150e60eb95ccf8212d13929bb3218443a0dbaf926357396f1cb43d2d06cae0cb88a3165fb67e38e76ff35399b8f5bcdf1c82fb3f9bad435dbcae86c8d988d1f82d1e942f312cec6a74c9a639c35fc0bf30ff9c96dccaf7acc4983cf0667e37e98131ac0139b76e03525bb52688025dbd912302dfe9453da64522895d269181596f61bd2dbd52f5fcb536d19019b9a96367c405e7aba243792b5910a0abc69bff53a7cf82970387b8f2e1ab1d891e31894eb291ee9f779b33233742dc7912379fc257e7ff1488f3b57cf7447472cba6e514e75f6cd2b2acacbf37a3bbfaf8c0f9f9416a863c78ef197cf9c51f5dcbb6bd7ed98565692ab6a93ef1dbd5c989757c8f8b97a32fc4d79fdb0a193fc63a7ce9ad6b4e1c5fa69f347164c29265cff42287bbed126909dfa96262b361be930d42a2cf516781da30b7d452396387cb0d1e770e3377444be72f870874b9bd071462ebed7262feed8845b1ad5456e2997a0c749036940695a8aadb11735f6b35b2d8de96964676d5efe2f281af144ae8717cb6beacd4af3753ddfeb2f7178c46233b2a45bcb0e562d38deb4f0edc27dbb9246eef961fd6b4307372f687e69b5b3b17ddfdecf17cf79464ebed7f6daa4ca97174c929695d7b77df0619b69c159e532f5a31c5890d23f8b525369201b60cc2f56e31cedeb66017b35e73bb20f06f8526429471821fb779ff951d5c72dbffb42963b264b63d7049e5ba5bca7cc3fd2592367281b96af78c5d97c6dd39bed6bbeba9a3a38a96a777560de8fdf9c2e576e787d133cda02b77e0d4f2453ca518d1a6d6413b3178da8e169b1e28c2c9f2f533ab16cd5f0bd8595c3a6bc3a4fb584a539d51bc41abe5249b98a933490d28ef581f16951e3bb99cd76b3d7f888b0c5ecb72cb968d3d9fafab39b367fb268d1279b1bd68c1ab5a621b0d2ef5f99b6fcea8edded2b56b4efde71757973d5beba86033535071aeaf655f10968c5f66d50fe422994596a4f52744ba3a4370aa37156bd62f77b63525f26cf6371b4eed4076f5e9ad1fba99f94bb94f37b9fae7dcb5336b463066bb21369c795f358f9c0d234bba22b64b56a1ab4457d80736f9cf91ac9979eceff925b51a4099da70fdeb879e29fd7f6749e0eddbea59c0fdf529ce1db8a23ec55fa866f40f39ace2fa5f7e80e39c8798c24c9ae6a4e71a4a0b0684445bedf5fd23b2682f40343c6cc4ab28f9a3c7954c993658b3bbf9cdb6f6ea9eda9e29249cf4caf7aa51afab0647953d8e76eaa4a1df72fb25b3988e9af7b96dee3f68b85dee2b0d4712e69a93503af3af685fff095657dc7af896c9eb074f70e46a9fb9f86e044341d23ebff0b966591cb0cf52285b48de4d482d490104d186f824506c4b3ee23a7ba84423d60f4ff1837f006cd559fa7003f6b07a9415d4be5aa17fd5e92b5f7317722ec87ec7ed88b56ce84ecaf8c56ce8cdc02ae0061bcb71a885c42bb07ed7fd00e437b43de4b8318ea467c6b42892404e9e5986b6f0fb8047b1e137a6e6274930b526decbb75257cb30bb6ee32e654ff8ce758bc444f3f0cda6cace54fe48c87b68476f704dd9a188964d50f70a68692959f2d6e92e3a136508a3a1de739119e8f7b77517e2c14078d7a54a8a554f718901e475e3f69406da256011f9e13e145a0ce6c19dbcdb6a42744eef63c6e40f93755c9b648a7f95ecf4096ca9703e452aed013ca21d40fdcc6410dc0de00e5722bdda48d00b72dd2cdc8df81b37826b31f889c42fbaa7241bcbb8154f45d00fe66e2ac728d5a6381d86a01369b6d8bfca46849ff4ccc6be05ca4adeb391675a6bf1e84e5a163cb1f8258199f68679ba8b3e4c5ec1df643fe05ec36500bbcacb453edc3a056603dc3c925b73c08f505dad6234e3f040964955d38ff5b699bf61bb2c7430952128f2782ba2aae6f2dfd201618af7b44381f45cea21ae83ae3f1b800bf949b5885b3f93afd54594415ca16aa10f9073987a11c7d00a469e0b899e488cd13fa3fc0216f507937eefdc37dfed64ac921b87abfc9c95b4dae44fe62ae53ab3127a05da6a9cc459a0ede3a4121cb546029e4b61af6e833846ea7e5f7e4b0bc6bf0aac8819ba9c1cc3161ce1dda75c86c17dc5b2a9eeba9599b4829963a7c3f1eb9d58df60e4996cf213387ca7537ad16bc7d15760049123558261a6b52af77ad83b40078f91cec584f21eb08e8808dda79230f8b754439f2434ad177407628d6a10b1cd23f42bc016ca7f017f46af3c9217c7206809cbe18f3c4e4ff68de65447dcc3938617e830fa27e14be647df0977231f2adba10fcce7e851cf3bdb614b2edb093f7a00a7b89fca0dda699ecbf07f8ba1eb229e011250ebdc0574588d52d58770c076aa7237795eb34457d1b63511cb9cf45d099851b54abda6c72cbe2fb7cad8cc7593463449b8b77c4945a45abc0d1adfa3ee08f9083bc729b5ab50a3cbf4f2eed1a65e943d0c73c6072bcc99361e643e655bd18b212d68367c42ae1fb743d1d7d0ae66983ae4191bbfa45e8f888a6683b11eb6c17aa3c86e510f28acd5c9317325f8b75e4aa9f2276c04f5a03ecda0a5d6f013b8df963d7a17c4c4938072ef5675807af8539f50a745f31ce02fb0b71d88a7398257cb21b809cb640f8aa2bb7c5e694a88f39b774f9388e5bbbf10febabe07dc377ef80a7d8afe001e62df5bb90d720c37b30995ab0b65a31c673b4437f2cfff11eb23eac41e48e77681bda6dfab700fbb85ef89ee2b948d47326af308fa8c769ace00ed40f514e10b522c719ce62b4ae53d75120962fb01ff9d1388b728588ddcbb099f52f89acd6f64756e31c239e2387d5e91155bb1c39cce79abf51a643472d8d8dc68efa19c0f52cfbe053f289f9ab617f7544e556c8983c256cda88bacfa8bb6b2d5ed455c7682af3a1ba0367036bd2d641fe7ba8df387eb644f68b185a0fdd73e157f65bdd7fd9affa1829ce32feecc7ed514aabc186da403b2f573eeeb8bb5d3e0af4680b5c0f0e81e37ade61a185c2cdceccee0eecce2c33b35cce844a526968f1e30f5a8cdab4544d5b4a5163d26893365463fc8418939aa68a1f51ffd056fdc7584d63197fcf33b3b7cbf1611b89d1e4eecd6fdfe77dde679eeff79db9e81b21b5950ce903936ac9594d793d18cdf0d3903abe80be3980fd32e82fe3d922d687f0fee1b3f155f8875ecd14e911d6919c15be05fc96f727001dbccf3eb05db6993c07bb043d5f98f48dc4be7d1138011fdec4faafc8c7b3a8137c673fd9a6f8c33cf8149db3f0f7a9eba3f7b69ce903348ffb01760ee37dff747a2615d30bf17e33a1f710dd91fc319d9bbe00f9eaa751e055e001200fdc0eec8ef93c9bf15ea5e53ceef8ab88f4767ca37d9366a7fbf0aeeba341b1bd81b6a577d2aed44fe9e6f46af8b083eec5bde6267f456b21bf4f7cdc4e774df8388cb96fc2c7f71a0bcf6f027a2cb7e25272c96fd112601c580eac00e6002b63fe226059bcf79ee412f3ce7f3b7323ead20a3c46cb5b4e61be9356b4fc235a032b8039f17a652cc7bc9578772ebadafed025ffc273c0f6683e7f9a39e8474a1c8f90dc8cff113be860f27bb45fb011eb8d58c773e608e6ed740a72cfe04e1f66f05eea3bf44cea39e4be874ea5e7803f40cbf9dca0fe370a5e2283c1bcd69d119816991fd15e467d0ffa3f096c4aeea056603370389e0f5d920f7f534f014fd2219eb13e2431604e8dd0fd8cc45f2224ff460f27be460f5fc4b7299d3e4b9b412f61c839eda75f66de91791e7ad2c3bca3d5c537743fbdd6f28ef49297211a65a0df8f6616d22ecca3adedb8b7e6e3b98fd300f252e0b3903a8d7b9ecfc4329add9ac23dfd27ea497c9d1e4efe1ae8a0338cd457b0ff03fa05cf996374601aee7079e6386c7d9e96e33e9dcbe714be8c600e648e681b1804bd671a7f6bf4d30db89336639d946fc39fe1ae3c0e38f8ae29c839dc06acc67e0edf974fb52cc3fdf129ba35f3bcc47403f8b3f86c4dbb4fee8f5d994e7ab6e5cff0a39f86003ed75bf13f049fa305a9bf271e447d6f02bd2fd549a3a9cec4dd4c37e195496b860f6c00fae3f5fc184c3fdef2066c7c965e647df2bee1fbfeb1e89dd4f2207c3c28efe021c81ccb3c41a3d7f4b0df891750bf2781d7809df1fc74f3ba7519e67511dec73d765a7afbd3d4c37506fd1cf07c9ac2b7d39478399aeb74e265a277f701f7e034cdc6d17a379aeb74782cbd27f1bbf48be12730cf007f21700680eac4ebc01a747f1fe6eb806b810ec0026602f3017c5125be0f3d5f023e07fa87c0a3c011e86f8bce37ef4fe86d057e13e9157d8c9b26e9fc09d00b98f069217006c800af036b80eb806b810ec0026602f381478123b8b7cae9c3f8f6e0ef7e7887ef7e99b94f10f2871af86708bc0d24e2f92ddc3f6f208e57e4ddddf41d13f9c9cfd01faef43c6cbc0499ddff43e3a1a97155c7771b2331edbf3a165c718cfe07e3d0551ddf981a53636a4c8dffdbf1f3a93135aed6207c1db6b4d2abf441aad2344a62ce8195480e7ce021ac41d20c3a2633fe52b7f3077344d20cac223a0d7a5d4c67400fc5742bf5a476423291be061bd5d4e3319da00f4f6f89e9245d3ffde6984e81df19d369d07d319d01bd23a65bc99bee9f504b172fbd4d6db10dcff5dd42a0fa5cafea7a7a60bb4e56f596cb6ad82e96025f0d5bbee5edb7ccacda5ab254db5ecb73da54a0e7cb96720b2a28d9be2ab84ea0c6745f99d67eabec562d53d98eaaea5ea06abeed1495aefca0668eabfcb8ea754cef33aabf66947ce53a78de529e55b6f6eb8e210a593f3f52d56dcf57eda520a8faab72b9a21d946af9ace156723a3458dd05d6908ba5bb453a972fbbf95c45f703cbcb0d6cec5b3f38b23e5b313bb288ad3aee7138087a494fb30f5935647915dbf711b6422825cbb3e065d1d39dc032bb54c1b3c42da3a47b45ab4b05aed29d7155b53c1f0fb8f940b79d284203362632c2191dd33d0bc2a6d27ddf356c1dfa94e91ab58ae504926655b0cb1662e41cb48dc44fb4758811d3d2cb9c44deab6fa93124c1ad0548981f78b6c13aba2064946b26fb50df2edb153bb620e98dea08a5351f11b09f5daae29a7681674bc2aad6f265db2f7529d366d5f95a00a6cf4cc372f829c491733de55b680c68b0e1b7c4daf04e64d84a95131ac42912bb6325b7726124dc343594ce2f59f28ce9226562718f6504cc61f1825b2ebb631c9ae13aa6cd11f9aba40df5bcbbdf9250a2b23a6e004f230f38ffd54651e32dbfa4c3f5bc15e72b6a51bd291a8fadfb01ea6e23f5380a626e7294d9bedeadc383439dbdd5c0f52f47cb0fc7a8abc0d34daba27b7beb8a1a07aee8b9b5aaf4965ba9ea0e9cc8d20952b4941603b781da423619e4914b3e50a000bc3e501e2e1afed5c1b1413994c54e2f9531140d8357a412f67c5959982d48efc7af29925bb16b616ea3bdb2e3805290d7290f0dbcc3d69853822ed652102b6c7f0c52cc3121c71acbd8a98a66055907bf554878225b8324f38aa075c007b706c971d079f9edc5ae09e93f82eec79e018bbed87762fbec8d2776d89e0ebed1e461ddffba15b66d83c33ada250701783eada21c46117bacb306eb59e871a902ae1efb60513774d67dc84dd2dddda43b277972f19b83065de262d91c0dd04654683d0dd2087eb3d835a94372de27791a8754bd3a51a59750cf65f3c0cf0d89e68ad4c18fabade2aa9464cf8a7359948e70c41793baa46abcdbc8166be5da14c1eb92fcba5219479eaf8a363fb6c0d10512b173410d8d388e8b7ba4dea36362c38a359b32fbb26b40528ffde30e624e0db159e275a39bd9735b2a1ed53198e8d7914936da90dd4624dc93ba9c01fb82fe99fc147771d4092eec07718771153d3971753fba624d067472dfd6f330f9e932d615e135c7d0e8dee6f318795a9333d9d5944fa62ba0d94a61626d3555ab2a7d5b966c9784630a1d799d175f22497f42d290dcd66d45f5c8c9dda1841bdd18910f769cef465d2f95bbaea6ba46b154273a3498d4458d78c7245b952bd6a47ed3d4e253e78b64c38e29bfacb911e31e4818623792a96be7fbaa2c67746ca26a86f8648a9f76ecdfaaa6db906f3f57eeb446559a4fab035e10e7b43907f5fe6fe4a1f9a45ef8942f2730ca7a3e8ebad15fcdb7a87e99da7813b1fbd26f8e688fba3e7a2b34a2fb77b5cce256ea45fcc3b8af86a8137455f2e8cb5ba3082b6591bc9cd4fbe537a87ab575f18eef2d8ebe22d6f65ee4f7a5de834559d7a0b171bb718755252751beb2f8e095bff009dcb597f85b1bee5e1c6abb9684da03394fdb993baaedc885dafdd950bb2f7b56dbde156adbba43eddeeeb3dac73a436d6bc7266da423d4861785da47179dd4863a94764ffb7a6db0fda4b6a53dd4061686dae605a1b66941a7b6715e51fbc8bcb3da8679a1d63f3fd4d6cf3fa9adbb35d4fada42edeeb967b5deb9a1b676ee496d8d3aabad56a176973aaadda972da1db778daaa5bc27f5149363b0903411cdfb6502a22568c85962ea328075c347e515d94a4c1632f7cb8499712af7aee137831e102e13dbc144ffa103c53dd4a359af9c86fe63fc91c6680420c37f002d7380407c7d0c62bb8b2577069c77061bfc1f95908a7ad2e9cb442386e3e4243ec3ab2aae6e4b0ee425db1ccc981d585fd3b01507b825ab3624c703906db88a1da363b41c5313a81e5f6132e27bc67de1acfe35d5a623b546725aef32d5a60592ab38c8802df768a6c93e6598eaaacc8f35ce5886f508d2942d5b8cc75a4b86e56fa9416e881781fb978e8455a3f88a469d41825d91d8c23751a21360efca524cdf9eb6c8670cf8b1623ff5d1c0af7f85296ef07fe32a3cc794f7c0e2104a5f68d694d88f4c79088c41159c35a4fc753fe2dc8cf68daffa754be04180055cbb7000d0a656e6473747265616d0d656e646f626a0d32322030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f4c656e677468203237313e3e73747265616d0d0a48895c91cd6ac3300cc7ef7e0a1ddb43711ada7403131819851cf6c1b23d40622b9961b18de31cf2f693edd2c10cb67e42fa5b92cd9bf6b9353a007ff756761860d446795cecea25c2809336ec5882d232dcbc74cab9778c93b8db9680736b46cb8400fe41c125f80d764fca0eb867fccd2bf4da4cb0fb6aba3df06e75ee076734010aa86b5038d2452fbd7bed67049e648756515c87ed409abf8ccfcd2194c93fe666a455b8b85ea2efcd844c14b46a10575a3543a3fec51fb36a18e577ef9928636e5190216e3237c4a787c46498a84e89c9109f339f23e7fc2ae657d7cc54535ccac464882f992fa9975bd5d8153d1edc4796abf7346d7ae134661c501bbc7f82b30e481537fb156000c0a7822c0d0a656e6473747265616d0d656e646f626a0d312030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f46697273742035302f4c656e677468203335342f4e20382f547970652f4f626a53746d3e3e73747265616d0d0a68de4c51cb6ec23010fc953dc2a1dd38443c2a1489a754d1d228a127d4830926b10ab6e53812fc7dd721845e62cdec6676767608018c8005218c8145114c800d0784613009813188820058085144e400a21183e91437f44b00296ef9455486e7a2da5391981f4cb815caedac1024e87b9ec4565cdd46dc8061aacfe2931b1ae63b7637233073b6ce9bb6546b17c7cd141adc8cc9e02e8f090c9b37c3a5ceeb0b09379ddbfa52ed03efda7b68a89952da7127b5c2cc708533ebe489e70e139ccbc359eac27253de3c5829676fb828b975b896456d052e25a7faa583569b05370fb852471217b8f59f35d97da27775964a6425a795daeeafda79ee6e83d694bf42d7ae85f5a1caad341d34c2fe277614d95c5fbd7bfc5647613ba538ded375fcba4d52017e7055f4d6e9cb3aed534c6d7249016cdc26963c42656d94a3b69089bc8d31eb95ce99374459e9576d0b34c7538855a5faf72375f78ee33f0106002f1eafb40d0a656e6473747265616d0d656e646f626a0d322030206f626a0d3c3c2f4c656e67746820333932362f537562747970652f584d4c2f547970652f4d657461646174613e3e73747265616d0d0a3c3f787061636b657420626567696e3d22efbbbf222069643d2257354d304d7043656869487a7265537a4e54637a6b633964223f3e0a3c783a786d706d65746120786d6c6e733a783d2261646f62653a6e733a6d6574612f2220783a786d70746b3d2241646f626520584d5020436f726520392e312d633030312037392e363735643066372c20323032332f30362f31312d31393a32313a31362020202020202020223e0a2020203c7264663a52444620786d6c6e733a7264663d22687474703a2f2f7777772e77332e6f72672f313939392f30322f32322d7264662d73796e7461782d6e7323223e0a2020202020203c7264663a4465736372697074696f6e207264663a61626f75743d22220a202020202020202020202020786d6c6e733a786d703d22687474703a2f2f6e732e61646f62652e636f6d2f7861702f312e302f220a202020202020202020202020786d6c6e733a786d704d4d3d22687474703a2f2f6e732e61646f62652e636f6d2f7861702f312e302f6d6d2f220a202020202020202020202020786d6c6e733a64633d22687474703a2f2f7075726c2e6f72672f64632f656c656d656e74732f312e312f220a202020202020202020202020786d6c6e733a7064663d22687474703a2f2f6e732e61646f62652e636f6d2f7064662f312e332f220a202020202020202020202020786d6c6e733a706466783d22687474703a2f2f6e732e61646f62652e636f6d2f706466782f312e332f223e0a2020202020202020203c786d703a4d6f64696679446174653e323032362d30322d32335431393a33323a34332b30313a30303c2f786d703a4d6f64696679446174653e0a2020202020202020203c786d703a437265617465446174653e323032362d30322d32335431393a33323a33302b30313a30303c2f786d703a437265617465446174653e0a2020202020202020203c786d703a4d65746164617461446174653e323032362d30322d32335431393a33323a34332b30313a30303c2f786d703a4d65746164617461446174653e0a2020202020202020203c786d703a43726561746f72546f6f6c3e4163726f626174205044464d616b657220323520666f7220576f72643c2f786d703a43726561746f72546f6f6c3e0a2020202020202020203c786d704d4d3a446f63756d656e7449443e757569643a62366233326335362d396665612d343234332d623961632d3632376135626135383031393c2f786d704d4d3a446f63756d656e7449443e0a2020202020202020203c786d704d4d3a496e7374616e636549443e757569643a32353131336539312d333365622d343962332d393163612d6535386537633133636261623c2f786d704d4d3a496e7374616e636549443e0a2020202020202020203c786d704d4d3a7375626a6563743e0a2020202020202020202020203c7264663a5365713e0a2020202020202020202020202020203c7264663a6c693e323c2f7264663a6c693e0a2020202020202020202020203c2f7264663a5365713e0a2020202020202020203c2f786d704d4d3a7375626a6563743e0a2020202020202020203c64633a666f726d61743e6170706c69636174696f6e2f7064663c2f64633a666f726d61743e0a2020202020202020203c64633a7469746c653e0a2020202020202020202020203c7264663a416c743e0a2020202020202020202020202020203c7264663a6c6920786d6c3a6c616e673d22782d64656661756c74222f3e0a2020202020202020202020203c2f7264663a416c743e0a2020202020202020203c2f64633a7469746c653e0a2020202020202020203c64633a6465736372697074696f6e3e0a2020202020202020202020203c7264663a416c743e0a2020202020202020202020202020203c7264663a6c6920786d6c3a6c616e673d22782d64656661756c74222f3e0a2020202020202020202020203c2f7264663a416c743e0a2020202020202020203c2f64633a6465736372697074696f6e3e0a2020202020202020203c64633a63726561746f723e0a2020202020202020202020203c7264663a5365713e0a2020202020202020202020202020203c7264663a6c693e426168616120456464696e65205a414f55493c2f7264663a6c693e0a2020202020202020202020203c2f7264663a5365713e0a2020202020202020203c2f64633a63726561746f723e0a2020202020202020203c7064663a50726f64756365723e41646f626520504446204c6962726172792032352e312e32303c2f7064663a50726f64756365723e0a2020202020202020203c7064663a4b6579776f7264732f3e0a2020202020202020203c706466783a536f757263654d6f6469666965643e443a32303236303232333138333231383c2f706466783a536f757263654d6f6469666965643e0a2020202020202020203c706466783a436f6d70616e792f3e0a2020202020202020203c706466783a436f6d6d656e74732f3e0a2020202020203c2f7264663a4465736372697074696f6e3e0a2020203c2f7264663a5244463e0a3c2f783a786d706d6574613e0a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a2020202020202020202020202020202020202020202020202020200a3c3f787061636b657420656e643d2277223f3e0d0a656e6473747265616d0d656e646f626a0d332030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f466972737420352f4c656e6774682035302f4e20312f547970652f4f626a53746d3e3e73747265616d0d0a68de3234513050b0b1d177ce2fcd2b5130d4f7ce4c298e36b4000a06c5ea875416a4ea0724a6a716dbd901041800e7a60be00d0a656e6473747265616d0d656e646f626a0d342030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f466972737420352f4c656e677468203230342f4e20312f547970652f4f626a53746d3e3e73747265616d0d0a68de6ccd4d6bc24010c6f1af3237130a665faa5809426c2a942a15b408de26d911b7ad19996e907c7b37458a87defe8787dfa347a020cfb3a20d4796648e47447871ce3704fbe2fde335cd9ef974a226fc24bf79c6a6eb4b0883e7a6c440493935ca8c9531563f5963d583d203a506b755648b5ab8c200eb72b1c22f12302338b0c08ec5a5d91b759718fdc18add3fe2a3fd13d7c2aead29928e2bea4158fa4a50ba680ef5d0a834db702b3545ca1f3cb97b6b628d9ec4415b7d521de2dfd6876f4ad2d9ec2ac000c1e34daa0d0a656e6473747265616d0d656e646f626a0d352030206f626a0d3c3c2f4465636f64655061726d733c3c2f436f6c756d6e7320342f507265646963746f722031323e3e2f46696c7465722f466c6174654465636f64652f49445b3c43393243453441423737383344453443383437394632333530414136313432463e3c31373837463243394333463833333437393245423031444533373044373942323e5d2f496e666f203135203020522f4c656e6774682034392f526f6f74203137203020522f53697a652031362f547970652f585265662f575b31203220315d3e3e73747265616d0d0a68de6262000226465d6f062606a60340827f319060ec03119a40890373802c0606468204d34f20c1c800106000f59c05270d0a656e6473747265616d0d656e646f626a0d7374617274787265660d0a3131360d0a2525454f460d0a
\.


--
-- TOC entry 5930 (class 0 OID 25276)
-- Dependencies: 306
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (role_id, role_code, role_label, description) FROM stdin;
1	superuser	Superuser	Full system access
2	maintenance_chief	Maintenance Chief	Responsible for maintenance operations
3	maintenance_technician	Maintenance Technician	Performs maintenance tasks
4	exploitation_chief	Exploitation Chief	\N
99	technician	Technician	\N
98	maintenance_chief	Maintenance Chief	\N
100	stock_consumable_responsible	Stock Items and Consumable Responsible	\N
101	asset_responsible	Asset Responsible	\N
\.


--
-- TOC entry 5931 (class 0 OID 25280)
-- Dependencies: 307
-- Data for Name: room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room (room_id, room_name, room_type_id) FROM stdin;
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
-- TOC entry 5932 (class 0 OID 25284)
-- Dependencies: 308
-- Data for Name: room_belongs_to_organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_belongs_to_organizational_structure (organizational_structure_id, room_id) FROM stdin;
\.


--
-- TOC entry 5933 (class 0 OID 25289)
-- Dependencies: 309
-- Data for Name: room_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_type (room_type_id, room_type_label, room_type_code) FROM stdin;
1	Teaching Room	TR
2	Maintenance Room	MR
3	Storage Room	SR
4	External Maintenance Center	XMC
\.


--
-- TOC entry 5935 (class 0 OID 25296)
-- Dependencies: 311
-- Data for Name: stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item (stock_item_id, maintenance_step_id, stock_item_model_id, destruction_certificate_id, stock_item_fabrication_datetime, stock_item_name, stock_item_inventory_number, stock_item_warranty_expiry_in_months, stock_item_name_in_administrative_certificate, stock_item_arrival_datetime, stock_item_status) FROM stdin;
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
\.


--
-- TOC entry 5936 (class 0 OID 25301)
-- Dependencies: 312
-- Data for Name: stock_item_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_definition (stock_item_attribute_definition_id, unit, description, data_type) FROM stdin;
1	\N	Number of Clicks	number
2	mm	Length	number
\.


--
-- TOC entry 5937 (class 0 OID 25305)
-- Dependencies: 313
-- Data for Name: stock_item_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_value (stock_item_attribute_definition_id, stock_item_id, value_string, value_bool, value_date, value_number) FROM stdin;
1	1	\N	f	\N	900000.000000
1	2	\N	f	\N	1200000.000000
1	3	\N	f	\N	1200000.000000
2	3	\N	f	\N	150.000000
1	40	\N	f	\N	1200000.000000
2	40	\N	f	\N	150.000000
\.


--
-- TOC entry 5938 (class 0 OID 25312)
-- Dependencies: 314
-- Data for Name: stock_item_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_brand (stock_item_brand_id, brand_name, brand_code, is_active, brand_photo) FROM stdin;
1	ASA	ASA	t	\N
2	HP	HP	t	\N
3	Acer	ACER	t	\N
\.


--
-- TOC entry 5939 (class 0 OID 25316)
-- Dependencies: 315
-- Data for Name: stock_item_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_condition_history (stock_item_condition_history_id, stock_item_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 5940 (class 0 OID 25324)
-- Dependencies: 316
-- Data for Name: stock_item_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_assigned_to_person (stock_item_id, person_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	9	10	1	2026-02-24 18:35:00	2026-02-24 18:36:03.552901	Good	f	\N
1	9	10	2	2026-02-24 18:37:00	2026-02-24 18:44:53.614377	Good	f	\N
1	9	10	3	2026-02-24 18:52:00	\N	Good	t	\N
\.


--
-- TOC entry 5941 (class 0 OID 25334)
-- Dependencies: 317
-- Data for Name: stock_item_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_compatible_with_asset (stock_item_model_id, asset_model_id) FROM stdin;
\.


--
-- TOC entry 5942 (class 0 OID 25339)
-- Dependencies: 318
-- Data for Name: stock_item_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model (stock_item_model_id, stock_item_type_id, stock_item_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	1	1	M1	M1	2020	\N	t		12
\.


--
-- TOC entry 5943 (class 0 OID 25345)
-- Dependencies: 319
-- Data for Name: stock_item_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_attribute_value (stock_item_attribute_definition_id, stock_item_model_id, value_bool, value_string, value_date, value_number) FROM stdin;
1	1	f	\N	\N	1200000.000000
2	1	f	\N	\N	150.000000
\.


--
-- TOC entry 5944 (class 0 OID 25352)
-- Dependencies: 320
-- Data for Name: stock_item_model_is_found_in_purchase_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_is_found_in_purchase_order (stock_item_model_id, purchase_order_id, quantity_ordered, quantity_received, quantity_invoiced, unit_price) FROM stdin;
1	1	5	\N	\N	500.00
\.


--
-- TOC entry 5945 (class 0 OID 25357)
-- Dependencies: 321
-- Data for Name: stock_item_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_movement (stock_item_movement_id, stock_item_id, source_room_id, destination_room_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime, status) FROM stdin;
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
\.


--
-- TOC entry 5946 (class 0 OID 25366)
-- Dependencies: 322
-- Data for Name: stock_item_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type (stock_item_type_id, stock_item_type_label, stock_item_type_code) FROM stdin;
1	Mouse	MS
2	Keyboard	KBRD
3	HDD Disk	HDD
4	SSD SATA Disk	SSD
5	SSD NVMe Disk 	NVMe
6	Power Supply Unit	PSU
7	Random Access Memory	RAM
\.


--
-- TOC entry 5947 (class 0 OID 25370)
-- Dependencies: 323
-- Data for Name: stock_item_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type_attribute (stock_item_attribute_definition_id, stock_item_type_id, is_mandatory, default_value) FROM stdin;
1	1	f	1000000
\.


--
-- TOC entry 5948 (class 0 OID 25375)
-- Dependencies: 324
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (supplier_id, supplier_name, supplier_address, supplier_commercial_register_number, supplier_rib, supplier_cpa, supplier_fiscal_identification_number, supplier_fiscal_static_number) FROM stdin;
1	ERI/2RM	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5949 (class 0 OID 25379)
-- Dependencies: 325
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_account (user_id, person_id, username, password_hash, created_at_datetime, disabled_at_datetime, last_login, account_status, failed_login_attempts, password_last_changed_datetime, created_by_user_id, modified_by_user_id, modified_at_datetime) FROM stdin;
5	10	bensimessaouddaoud	1d3005bd778154738f4876dfe5b7815a25dd36ae79eaa68b44b78175c4d5cbf4400073ec6e4ce40ff2d11d981fd06ec421ba71c531dc67133ead14635c9471c9	2026-02-11 10:50:19.833168	2026-02-11 10:50:19.833168	2026-02-27 22:15:02.177787	active	0	2026-02-11 10:50:19.833168	1	1	2026-02-11 10:50:19.833168
3	7	technician1	430e6b4f4f7d05027d10871fe98484662dd348368c06f7c21c520ea344fdd6bf7a156dba9c0ba468e82fb867f40d39c9bae5f408202c125b772de5aee696007e	2026-02-10 20:18:23.477744	2026-02-10 20:18:23.477744	2026-03-05 10:21:43.325505	active	0	2026-02-10 20:18:23.477744	\N	\N	2026-02-10 20:18:23.477744
6	9	mohamednedjouh	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-02-11 11:50:06.603461	2026-02-11 11:50:06.603461	2026-03-05 21:54:47.307358	active	0	2026-02-11 11:50:06.603461	1	1	2026-02-11 11:50:06.603461
2	6	bahaaeddinezaoui	9780eb93119bb629dc9062dc2611bd6bd17532b18a3b8a9ad0290e937000901132ce210686a8b3b843c9fa53797369a087c42cb8e3a18bb2d637cb2014c716df	2026-02-10 14:48:08.044751	2026-02-10 14:48:08.044751	2026-03-05 22:04:54.512632	active	0	2026-03-05 11:34:48.189826	\N	\N	2026-02-10 14:48:08.044751
11	1008	asset_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:15:48.937778	2026-02-18 09:15:48.937778	2026-03-05 22:05:31.147986	active	0	2026-02-18 09:15:48.937778	\N	\N	2026-02-18 09:15:48.937778
1	1	admin	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-09 19:22:17.092734	2026-02-09 19:22:17.092734	2026-03-05 10:33:19.506133	active	0	2026-02-09 19:22:17.092734	\N	\N	2026-02-09 19:22:17.092734
4	8	technician2	40c82ecd90443ed156f5e4d3911c9659b6ecc21174a5ac4cb36f1804a45de6bcb2cae9110329419b04145e4d2ba55bd41a44f65c1e5617e592d7ebaf212c524e	2026-02-10 20:18:23.485554	2026-02-10 20:18:23.485554	2026-03-05 22:20:52.785506	active	0	2026-02-10 20:18:23.485554	\N	\N	2026-02-10 20:18:23.485554
10	1007	stock_cons_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:06:44.673576	2026-02-18 09:06:44.673576	2026-03-06 19:32:51.277261	active	0	2026-02-18 09:06:44.673576	\N	\N	2026-02-18 09:06:44.673576
\.


--
-- TOC entry 5950 (class 0 OID 25395)
-- Dependencies: 326
-- Data for Name: user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_session (session_id, user_id, ip_address, user_agent, login_datetime, last_activity, logout_datetime) FROM stdin;
\.


--
-- TOC entry 5951 (class 0 OID 25403)
-- Dependencies: 327
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse (warehouse_id, warehouse_name, warehouse_address) FROM stdin;
1	ERI/2RM	\N
\.


--
-- TOC entry 5998 (class 0 OID 0)
-- Dependencies: 227
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_consumable_history_id_seq', 33, true);


--
-- TOC entry 5999 (class 0 OID 0)
-- Dependencies: 229
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_stock_item_history_id_seq', 40, true);


--
-- TOC entry 6000 (class 0 OID 0)
-- Dependencies: 233
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_consumable_id_seq', 3, true);


--
-- TOC entry 6001 (class 0 OID 0)
-- Dependencies: 235
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_stock_item_id_seq', 1, true);


--
-- TOC entry 6002 (class 0 OID 0)
-- Dependencies: 330
-- Name: attribution_order_asset_consumable_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_consumable_accessory_id_seq', 1, true);


--
-- TOC entry 6003 (class 0 OID 0)
-- Dependencies: 328
-- Name: attribution_order_asset_stock_item_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribution_order_asset_stock_item_accessory_id_seq', 1, true);


--
-- TOC entry 6004 (class 0 OID 0)
-- Dependencies: 241
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- TOC entry 6005 (class 0 OID 0)
-- Dependencies: 243
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- TOC entry 6006 (class 0 OID 0)
-- Dependencies: 245
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 308, true);


--
-- TOC entry 6007 (class 0 OID 0)
-- Dependencies: 248
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- TOC entry 6008 (class 0 OID 0)
-- Dependencies: 249
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 1, true);


--
-- TOC entry 6009 (class 0 OID 0)
-- Dependencies: 251
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- TOC entry 6010 (class 0 OID 0)
-- Dependencies: 267
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_is_used_in_stock_item_history_id_seq', 1, false);


--
-- TOC entry 6011 (class 0 OID 0)
-- Dependencies: 276
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- TOC entry 6012 (class 0 OID 0)
-- Dependencies: 278
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 77, true);


--
-- TOC entry 6013 (class 0 OID 0)
-- Dependencies: 280
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 26, true);


--
-- TOC entry 6014 (class 0 OID 0)
-- Dependencies: 292
-- Name: maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_step_attribute_ch_maintenance_step_attribute_ch_seq', 1, false);


--
-- TOC entry 6015 (class 0 OID 0)
-- Dependencies: 336
-- Name: person_reports_problem_on_asset_included_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_consumable_id_seq', 1, false);


--
-- TOC entry 6016 (class 0 OID 0)
-- Dependencies: 335
-- Name: person_reports_problem_on_asset_included_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_reports_problem_on_asset_included_stock_item_id_seq', 5, true);


--
-- TOC entry 6017 (class 0 OID 0)
-- Dependencies: 310
-- Name: room_type_room_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_type_room_type_id_seq', 1, false);


--
-- TOC entry 5286 (class 2606 OID 25415)
-- Name: administrative_certificate administrative_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT administrative_certificate_pkey PRIMARY KEY (administrative_certificate_id);


--
-- TOC entry 5290 (class 2606 OID 25417)
-- Name: asset_attribute_definition asset_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition
    ADD CONSTRAINT asset_attribute_definition_pkey PRIMARY KEY (asset_attribute_definition_id);


--
-- TOC entry 5292 (class 2606 OID 25419)
-- Name: asset_attribute_value asset_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT asset_attribute_value_pkey PRIMARY KEY (asset_attribute_definition_id, asset_id);


--
-- TOC entry 5294 (class 2606 OID 25421)
-- Name: asset_brand asset_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand
    ADD CONSTRAINT asset_brand_pkey PRIMARY KEY (asset_brand_id);


--
-- TOC entry 5296 (class 2606 OID 25423)
-- Name: asset_condition_history asset_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT asset_condition_history_pkey PRIMARY KEY (asset_condition_history_id);


--
-- TOC entry 5298 (class 2606 OID 25425)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5300 (class 2606 OID 25427)
-- Name: asset_is_composed_of_consumable_history asset_is_composed_of_consumable_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT asset_is_composed_of_consumable_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5302 (class 2606 OID 25429)
-- Name: asset_is_composed_of_stock_item_history asset_is_composed_of_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT asset_is_composed_of_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5306 (class 2606 OID 25431)
-- Name: asset_model_attribute_value asset_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT asset_model_attribute_value_pkey PRIMARY KEY (asset_model_id, asset_attribute_definition_id);


--
-- TOC entry 5308 (class 2606 OID 25433)
-- Name: asset_model_default_consumable asset_model_default_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT asset_model_default_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5312 (class 2606 OID 25435)
-- Name: asset_model_default_stock_item asset_model_default_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT asset_model_default_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5304 (class 2606 OID 25437)
-- Name: asset_model asset_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT asset_model_pkey PRIMARY KEY (asset_model_id);


--
-- TOC entry 5316 (class 2606 OID 25439)
-- Name: asset_movement asset_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT asset_movement_pkey PRIMARY KEY (asset_movement_id);


--
-- TOC entry 5288 (class 2606 OID 25441)
-- Name: asset asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5320 (class 2606 OID 25443)
-- Name: asset_type_attribute asset_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT asset_type_attribute_pkey PRIMARY KEY (asset_attribute_definition_id, asset_type_id);


--
-- TOC entry 5318 (class 2606 OID 25445)
-- Name: asset_type asset_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type
    ADD CONSTRAINT asset_type_pkey PRIMARY KEY (asset_type_id);


--
-- TOC entry 5515 (class 2606 OID 41221)
-- Name: attribution_order_asset_consumable_accessory attribution_order_asset_consumable_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT attribution_order_asset_consumable_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5508 (class 2606 OID 41186)
-- Name: attribution_order_asset_stock_item_accessory attribution_order_asset_stock_item_accessory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT attribution_order_asset_stock_item_accessory_pkey PRIMARY KEY (id);


--
-- TOC entry 5322 (class 2606 OID 25447)
-- Name: attribution_order attribution_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT attribution_order_pkey PRIMARY KEY (attribution_order_id);


--
-- TOC entry 5325 (class 2606 OID 25449)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- TOC entry 5330 (class 2606 OID 25451)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- TOC entry 5333 (class 2606 OID 25453)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5327 (class 2606 OID 25455)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- TOC entry 5336 (class 2606 OID 25457)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- TOC entry 5338 (class 2606 OID 25459)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- TOC entry 5346 (class 2606 OID 25461)
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5349 (class 2606 OID 25463)
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- TOC entry 5340 (class 2606 OID 25465)
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- TOC entry 5352 (class 2606 OID 25467)
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5355 (class 2606 OID 25469)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- TOC entry 5343 (class 2606 OID 25471)
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- TOC entry 5357 (class 2606 OID 25473)
-- Name: authentication_log authentication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT authentication_log_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5363 (class 2606 OID 25479)
-- Name: backorder_report backorder_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT backorder_report_pkey PRIMARY KEY (backorder_report_id);


--
-- TOC entry 5365 (class 2606 OID 25481)
-- Name: broken_item_report broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broken_item_report
    ADD CONSTRAINT broken_item_report_pkey PRIMARY KEY (broken_item_report_id);


--
-- TOC entry 5381 (class 2606 OID 25483)
-- Name: consumable_is_compatible_with_asset c_is_compatible_with_a_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT c_is_compatible_with_a_pkey PRIMARY KEY (consumable_model_id, asset_model_id);


--
-- TOC entry 5383 (class 2606 OID 25485)
-- Name: consumable_is_compatible_with_stock_item c_is_compatible_with_si_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT c_is_compatible_with_si_pkey PRIMARY KEY (consumable_model_id, stock_item_model_id);


--
-- TOC entry 5367 (class 2606 OID 25487)
-- Name: company_asset_request company_asset_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT company_asset_request_pkey PRIMARY KEY (company_asset_request_id);


--
-- TOC entry 5371 (class 2606 OID 25489)
-- Name: consumable_attribute_definition consumable_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition
    ADD CONSTRAINT consumable_attribute_definition_pkey PRIMARY KEY (consumable_attribute_definition_id);


--
-- TOC entry 5373 (class 2606 OID 25491)
-- Name: consumable_attribute_value consumable_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT consumable_attribute_value_pkey PRIMARY KEY (consumable_id, consumable_attribute_definition_id);


--
-- TOC entry 5375 (class 2606 OID 25493)
-- Name: consumable_brand consumable_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand
    ADD CONSTRAINT consumable_brand_pkey PRIMARY KEY (consumable_brand_id);


--
-- TOC entry 5377 (class 2606 OID 25495)
-- Name: consumable_condition_history consumable_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT consumable_condition_history_pkey PRIMARY KEY (consumable_condition_history_id);


--
-- TOC entry 5379 (class 2606 OID 25497)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5385 (class 2606 OID 25499)
-- Name: consumable_is_used_in_stock_item_history consumable_is_used_in_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT consumable_is_used_in_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5389 (class 2606 OID 25501)
-- Name: consumable_model_attribute_value consumable_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT consumable_model_attribute_value_pkey PRIMARY KEY (consumable_model_id, consumable_attribute_definition_id);


--
-- TOC entry 5391 (class 2606 OID 25503)
-- Name: consumable_model_is_found_in_purchase_order consumable_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT consumable_model_is_found_in_bdc_pkey PRIMARY KEY (consumable_model_id, purchase_order_id);


--
-- TOC entry 5387 (class 2606 OID 25505)
-- Name: consumable_model consumable_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT consumable_model_pkey PRIMARY KEY (consumable_model_id);


--
-- TOC entry 5393 (class 2606 OID 25507)
-- Name: consumable_movement consumable_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT consumable_movement_pkey PRIMARY KEY (consumable_movement_id);


--
-- TOC entry 5369 (class 2606 OID 25509)
-- Name: consumable consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT consumable_pkey PRIMARY KEY (consumable_id);


--
-- TOC entry 5397 (class 2606 OID 25511)
-- Name: consumable_type_attribute consumable_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT consumable_type_attribute_pkey PRIMARY KEY (consumable_type_id, consumable_attribute_definition_id);


--
-- TOC entry 5395 (class 2606 OID 25513)
-- Name: consumable_type consumable_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type
    ADD CONSTRAINT consumable_type_pkey PRIMARY KEY (consumable_type_id);


--
-- TOC entry 5361 (class 2606 OID 25477)
-- Name: delivery_note delivery_note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT delivery_note_pkey PRIMARY KEY (delivery_note_id);


--
-- TOC entry 5399 (class 2606 OID 25515)
-- Name: destruction_certificate destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destruction_certificate
    ADD CONSTRAINT destruction_certificate_pkey PRIMARY KEY (destruction_certificate_id);


--
-- TOC entry 5402 (class 2606 OID 25517)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5405 (class 2606 OID 25519)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- TOC entry 5407 (class 2606 OID 25521)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- TOC entry 5409 (class 2606 OID 25523)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5412 (class 2606 OID 25525)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- TOC entry 5419 (class 2606 OID 25527)
-- Name: external_maintenance_document external_maintenance_document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT external_maintenance_document_pkey PRIMARY KEY (external_maintenance_document_id);


--
-- TOC entry 5415 (class 2606 OID 25529)
-- Name: external_maintenance external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT external_maintenance_pkey PRIMARY KEY (external_maintenance_id);


--
-- TOC entry 5421 (class 2606 OID 25531)
-- Name: external_maintenance_provider external_maintenance_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_provider
    ADD CONSTRAINT external_maintenance_provider_pkey PRIMARY KEY (external_maintenance_provider_id);


--
-- TOC entry 5423 (class 2606 OID 25533)
-- Name: external_maintenance_step external_maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT external_maintenance_step_pkey PRIMARY KEY (external_maintenance_step_id);


--
-- TOC entry 5425 (class 2606 OID 25535)
-- Name: external_maintenance_typical_step external_maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step
    ADD CONSTRAINT external_maintenance_typical_step_pkey PRIMARY KEY (external_maintenance_typical_step_id);


--
-- TOC entry 5427 (class 2606 OID 25537)
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 5431 (class 2606 OID 25539)
-- Name: maintenance_inspection_leads_to_broken_item_report maintenance_inspection_leads_to_broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT maintenance_inspection_leads_to_broken_item_report_pkey PRIMARY KEY (maintenance_id, broken_item_report_id);


--
-- TOC entry 5429 (class 2606 OID 25541)
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (maintenance_id);


--
-- TOC entry 5436 (class 2606 OID 25543)
-- Name: maintenance_step_attribute_change maintenance_step_attribute_change_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_attribute_change_pkey PRIMARY KEY (maintenance_step_attribute_change_id);


--
-- TOC entry 5438 (class 2606 OID 25545)
-- Name: maintenance_step_item_request maintenance_step_item_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_pkey PRIMARY KEY (maintenance_step_item_request_id);


--
-- TOC entry 5433 (class 2606 OID 25547)
-- Name: maintenance_step maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT maintenance_step_pkey PRIMARY KEY (maintenance_step_id);


--
-- TOC entry 5442 (class 2606 OID 25549)
-- Name: maintenance_typical_step maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step
    ADD CONSTRAINT maintenance_typical_step_pkey PRIMARY KEY (maintenance_typical_step_id);


--
-- TOC entry 5444 (class 2606 OID 25551)
-- Name: organizational_structure organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure
    ADD CONSTRAINT organizational_structure_pkey PRIMARY KEY (organizational_structure_id);


--
-- TOC entry 5446 (class 2606 OID 25553)
-- Name: organizational_structure_relation organizational_structure_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT organizational_structure_relation_pkey PRIMARY KEY (organizational_structure_id, parent_organizational_structure_id);


--
-- TOC entry 5450 (class 2606 OID 25555)
-- Name: person_assignment person_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT person_assignment_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5448 (class 2606 OID 25557)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- TOC entry 5528 (class 2606 OID 49434)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5530 (class 2606 OID 49436)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consumable_report_cons; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_report_cons UNIQUE (report_id, consumable_id);


--
-- TOC entry 5522 (class 2606 OID 49370)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5524 (class 2606 OID 49423)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5526 (class 2606 OID 49425)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_item_report_stoc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_report_stoc UNIQUE (report_id, stock_item_id);


--
-- TOC entry 5452 (class 2606 OID 25559)
-- Name: person_reports_problem_on_asset person_reports_problem_on_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT person_reports_problem_on_asset_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5454 (class 2606 OID 25561)
-- Name: person_reports_problem_on_consumable person_reports_problem_on_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT person_reports_problem_on_consumable_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5456 (class 2606 OID 25563)
-- Name: person_reports_problem_on_stock_item person_reports_problem_on_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT person_reports_problem_on_stock_item_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5458 (class 2606 OID 25565)
-- Name: person_role_mapping person_role_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT person_role_mapping_pkey PRIMARY KEY (role_id, person_id);


--
-- TOC entry 5460 (class 2606 OID 25567)
-- Name: physical_condition physical_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition
    ADD CONSTRAINT physical_condition_pkey PRIMARY KEY (condition_id);


--
-- TOC entry 5462 (class 2606 OID 25569)
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (position_id);


--
-- TOC entry 5359 (class 2606 OID 25475)
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (purchase_order_id);


--
-- TOC entry 5464 (class 2606 OID 25571)
-- Name: receipt_report receipt_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_report
    ADD CONSTRAINT receipt_report_pkey PRIMARY KEY (receipt_report_id);


--
-- TOC entry 5466 (class 2606 OID 25573)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- TOC entry 5470 (class 2606 OID 25575)
-- Name: room_belongs_to_organizational_structure room_belongs_to_organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_belongs_to_organizational_structure
    ADD CONSTRAINT room_belongs_to_organizational_structure_pkey PRIMARY KEY (organizational_structure_id, room_id);


--
-- TOC entry 5468 (class 2606 OID 25577)
-- Name: room room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT room_pkey PRIMARY KEY (room_id);


--
-- TOC entry 5472 (class 2606 OID 25579)
-- Name: room_type room_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_type
    ADD CONSTRAINT room_type_pkey PRIMARY KEY (room_type_id);


--
-- TOC entry 5476 (class 2606 OID 25581)
-- Name: stock_item_attribute_definition stock_item_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition
    ADD CONSTRAINT stock_item_attribute_definition_pkey PRIMARY KEY (stock_item_attribute_definition_id);


--
-- TOC entry 5478 (class 2606 OID 25583)
-- Name: stock_item_attribute_value stock_item_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT stock_item_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_id);


--
-- TOC entry 5480 (class 2606 OID 25585)
-- Name: stock_item_brand stock_item_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand
    ADD CONSTRAINT stock_item_brand_pkey PRIMARY KEY (stock_item_brand_id);


--
-- TOC entry 5482 (class 2606 OID 25587)
-- Name: stock_item_condition_history stock_item_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT stock_item_condition_history_pkey PRIMARY KEY (stock_item_condition_history_id);


--
-- TOC entry 5484 (class 2606 OID 25589)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5486 (class 2606 OID 25591)
-- Name: stock_item_is_compatible_with_asset stock_item_is_compatible_with_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT stock_item_is_compatible_with_asset_pkey PRIMARY KEY (stock_item_model_id, asset_model_id);


--
-- TOC entry 5490 (class 2606 OID 25593)
-- Name: stock_item_model_attribute_value stock_item_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT stock_item_model_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_model_id);


--
-- TOC entry 5492 (class 2606 OID 25595)
-- Name: stock_item_model_is_found_in_purchase_order stock_item_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT stock_item_model_is_found_in_bdc_pkey PRIMARY KEY (stock_item_model_id, purchase_order_id);


--
-- TOC entry 5488 (class 2606 OID 25597)
-- Name: stock_item_model stock_item_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT stock_item_model_pkey PRIMARY KEY (stock_item_model_id);


--
-- TOC entry 5494 (class 2606 OID 25599)
-- Name: stock_item_movement stock_item_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT stock_item_movement_pkey PRIMARY KEY (stock_item_movement_id);


--
-- TOC entry 5474 (class 2606 OID 25601)
-- Name: stock_item stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT stock_item_pkey PRIMARY KEY (stock_item_id);


--
-- TOC entry 5498 (class 2606 OID 25603)
-- Name: stock_item_type_attribute stock_item_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT stock_item_type_attribute_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_type_id);


--
-- TOC entry 5496 (class 2606 OID 25605)
-- Name: stock_item_type stock_item_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type
    ADD CONSTRAINT stock_item_type_pkey PRIMARY KEY (stock_item_type_id);


--
-- TOC entry 5500 (class 2606 OID 25607)
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (supplier_id);


--
-- TOC entry 5310 (class 2606 OID 25609)
-- Name: asset_model_default_consumable uq_amdc_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT uq_amdc_composition UNIQUE (asset_model_id, consumable_model_id);


--
-- TOC entry 5314 (class 2606 OID 25611)
-- Name: asset_model_default_stock_item uq_amdsi_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT uq_amdsi_composition UNIQUE (asset_model_id, stock_item_model_id);


--
-- TOC entry 5520 (class 2606 OID 41223)
-- Name: attribution_order_asset_consumable_accessory uq_ao_aca_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT uq_ao_aca_unique UNIQUE (attribution_order_id, asset_id, consumable_id);


--
-- TOC entry 5513 (class 2606 OID 41188)
-- Name: attribution_order_asset_stock_item_accessory uq_ao_assa_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT uq_ao_assa_unique UNIQUE (attribution_order_id, asset_id, stock_item_id);


--
-- TOC entry 5502 (class 2606 OID 25613)
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5504 (class 2606 OID 25615)
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5506 (class 2606 OID 25617)
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (warehouse_id);


--
-- TOC entry 5323 (class 1259 OID 25618)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- TOC entry 5328 (class 1259 OID 25619)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- TOC entry 5331 (class 1259 OID 25620)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- TOC entry 5334 (class 1259 OID 25621)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- TOC entry 5344 (class 1259 OID 25622)
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- TOC entry 5347 (class 1259 OID 25623)
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- TOC entry 5350 (class 1259 OID 25624)
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- TOC entry 5353 (class 1259 OID 25625)
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- TOC entry 5341 (class 1259 OID 25626)
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- TOC entry 5400 (class 1259 OID 25627)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- TOC entry 5403 (class 1259 OID 25628)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- TOC entry 5410 (class 1259 OID 25629)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- TOC entry 5413 (class 1259 OID 25630)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- TOC entry 5516 (class 1259 OID 41240)
-- Name: idx_ao_aca_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_asset ON public.attribution_order_asset_consumable_accessory USING btree (asset_id);


--
-- TOC entry 5517 (class 1259 OID 41241)
-- Name: idx_ao_aca_consumable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_consumable ON public.attribution_order_asset_consumable_accessory USING btree (consumable_id);


--
-- TOC entry 5518 (class 1259 OID 41239)
-- Name: idx_ao_aca_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_aca_order ON public.attribution_order_asset_consumable_accessory USING btree (attribution_order_id);


--
-- TOC entry 5509 (class 1259 OID 41205)
-- Name: idx_ao_assa_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_asset ON public.attribution_order_asset_stock_item_accessory USING btree (asset_id);


--
-- TOC entry 5510 (class 1259 OID 41204)
-- Name: idx_ao_assa_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_order ON public.attribution_order_asset_stock_item_accessory USING btree (attribution_order_id);


--
-- TOC entry 5511 (class 1259 OID 41206)
-- Name: idx_ao_assa_stock_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ao_assa_stock_item ON public.attribution_order_asset_stock_item_accessory USING btree (stock_item_id);


--
-- TOC entry 5416 (class 1259 OID 25631)
-- Name: idx_external_maintenance_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_provider_id ON public.external_maintenance USING btree (external_maintenance_provider_id);


--
-- TOC entry 5417 (class 1259 OID 25632)
-- Name: idx_external_maintenance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_status ON public.external_maintenance USING btree (external_maintenance_status);


--
-- TOC entry 5434 (class 1259 OID 25633)
-- Name: maintenance_step_attribute_change_maintenance_step_id_34ad2442; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_attribute_change_maintenance_step_id_34ad2442 ON public.maintenance_step_attribute_change USING btree (maintenance_step_id);


--
-- TOC entry 5439 (class 1259 OID 25634)
-- Name: maintenance_step_item_request_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_status_idx ON public.maintenance_step_item_request USING btree (status);


--
-- TOC entry 5440 (class 1259 OID 25635)
-- Name: maintenance_step_item_request_step_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_step_id_idx ON public.maintenance_step_item_request USING btree (maintenance_step_id);


--
-- TOC entry 5541 (class 2606 OID 25636)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5569 (class 2606 OID 25641)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5570 (class 2606 OID 25646)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5571 (class 2606 OID 25651)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5572 (class 2606 OID 25656)
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5573 (class 2606 OID 25661)
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5574 (class 2606 OID 25666)
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5575 (class 2606 OID 25671)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5586 (class 2606 OID 25676)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5611 (class 2606 OID 25681)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5612 (class 2606 OID 25686)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5531 (class 2606 OID 25691)
-- Name: administrative_certificate fk_administ_ac_is_lin_receipt_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ac_is_lin_receipt_ FOREIGN KEY (receipt_report_id) REFERENCES public.receipt_report(receipt_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5532 (class 2606 OID 25696)
-- Name: administrative_certificate fk_administ_ad_is_bro_warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ad_is_bro_warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5533 (class 2606 OID 25701)
-- Name: administrative_certificate fk_administ_ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5542 (class 2606 OID 25706)
-- Name: asset_is_assigned_to_person fk_aiatp_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_aiatp_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5545 (class 2606 OID 25711)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5546 (class 2606 OID 25716)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5549 (class 2606 OID 25721)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5550 (class 2606 OID 25726)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5557 (class 2606 OID 25731)
-- Name: asset_model_default_consumable fk_amdc_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5558 (class 2606 OID 25736)
-- Name: asset_model_default_consumable fk_amdc_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE;


--
-- TOC entry 5559 (class 2606 OID 25741)
-- Name: asset_model_default_stock_item fk_amdsi_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5560 (class 2606 OID 25746)
-- Name: asset_model_default_stock_item fk_amdsi_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE;


--
-- TOC entry 5687 (class 2606 OID 41229)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5688 (class 2606 OID 41224)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5689 (class 2606 OID 41234)
-- Name: attribution_order_asset_consumable_accessory fk_ao_aca_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_consumable_accessory
    ADD CONSTRAINT fk_ao_aca_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5684 (class 2606 OID 41194)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5685 (class 2606 OID 41189)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- TOC entry 5686 (class 2606 OID 41199)
-- Name: attribution_order_asset_stock_item_accessory fk_ao_assa_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order_asset_stock_item_accessory
    ADD CONSTRAINT fk_ao_assa_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5534 (class 2606 OID 25751)
-- Name: asset fk_asset_asset_is__asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5535 (class 2606 OID 25756)
-- Name: asset fk_asset_asset_is__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5536 (class 2606 OID 25761)
-- Name: asset fk_asset_asset_is__destruct; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__destruct FOREIGN KEY (destruction_certificate_id) REFERENCES public.destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5537 (class 2606 OID 25766)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5538 (class 2606 OID 25771)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5539 (class 2606 OID 25776)
-- Name: asset_condition_history fk_asset_co_asset_con_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_con_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5540 (class 2606 OID 25781)
-- Name: asset_condition_history fk_asset_co_asset_has_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_has_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5547 (class 2606 OID 25786)
-- Name: asset_is_composed_of_consumable_history fk_asset_cons_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_cons_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5548 (class 2606 OID 25791)
-- Name: asset_is_composed_of_consumable_history fk_asset_is_asset_is__consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_is_asset_is__consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5543 (class 2606 OID 25796)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigned FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5544 (class 2606 OID 25801)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigner FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5551 (class 2606 OID 25806)
-- Name: asset_is_composed_of_stock_item_history fk_asset_is_asset_is__stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_is_asset_is__stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5555 (class 2606 OID 25811)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5553 (class 2606 OID 25816)
-- Name: asset_model fk_asset_mo_asset_mod_asset_br; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_br FOREIGN KEY (asset_brand_id) REFERENCES public.asset_brand(asset_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5556 (class 2606 OID 25821)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5561 (class 2606 OID 25826)
-- Name: asset_movement fk_asset_mo_asset_mov_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5562 (class 2606 OID 25831)
-- Name: asset_movement fk_asset_mo_asset_mov_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5563 (class 2606 OID 25836)
-- Name: asset_movement fk_asset_mo_asset_mov_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_maintena FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5564 (class 2606 OID 25841)
-- Name: asset_movement fk_asset_mo_asset_mov_room_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_room_dest FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5565 (class 2606 OID 25846)
-- Name: asset_movement fk_asset_mo_asset_mov_room_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_room_source FOREIGN KEY (source_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5554 (class 2606 OID 25851)
-- Name: asset_model fk_asset_mo_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5552 (class 2606 OID 25856)
-- Name: asset_is_composed_of_stock_item_history fk_asset_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5566 (class 2606 OID 25861)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5567 (class 2606 OID 25866)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5568 (class 2606 OID 25871)
-- Name: attribution_order fk_attribut_shipment__warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT fk_attribut_shipment__warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5576 (class 2606 OID 25876)
-- Name: authentication_log fk_authenti_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT fk_authenti_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5577 (class 2606 OID 25881)
-- Name: purchase_order fk_bon_de_c_bdc_is_ma_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT fk_bon_de_c_bdc_is_ma_supplier FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5579 (class 2606 OID 25891)
-- Name: backorder_report fk_bon_de_r_bdc_has_b_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backorder_report
    ADD CONSTRAINT fk_bon_de_r_bdc_has_b_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5590 (class 2606 OID 25896)
-- Name: consumable_is_compatible_with_asset fk_c_is_com_c_is_comp_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_c_is_com_c_is_comp_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5592 (class 2606 OID 25901)
-- Name: consumable_is_compatible_with_stock_item fk_c_is_com_c_is_comp_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_c_is_com_c_is_comp_stock_it FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5583 (class 2606 OID 25906)
-- Name: consumable_attribute_value fk_cav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5584 (class 2606 OID 25911)
-- Name: consumable_attribute_value fk_cav_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5587 (class 2606 OID 25916)
-- Name: consumable_is_assigned_to_person fk_ciatp_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_ciatp_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5591 (class 2606 OID 25921)
-- Name: consumable_is_compatible_with_asset fk_cicwa_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_cicwa_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5593 (class 2606 OID 25926)
-- Name: consumable_is_compatible_with_stock_item fk_cicwsi_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_cicwsi_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5594 (class 2606 OID 25931)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5595 (class 2606 OID 25936)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5598 (class 2606 OID 25941)
-- Name: consumable_model fk_cm_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_brand FOREIGN KEY (consumable_brand_id) REFERENCES public.consumable_brand(consumable_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5604 (class 2606 OID 25946)
-- Name: consumable_movement fk_cm_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5605 (class 2606 OID 25951)
-- Name: consumable_movement fk_cm_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5599 (class 2606 OID 25956)
-- Name: consumable_model fk_cm_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5600 (class 2606 OID 25961)
-- Name: consumable_model_attribute_value fk_cmav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5601 (class 2606 OID 25966)
-- Name: consumable_model_attribute_value fk_cmav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5602 (class 2606 OID 25971)
-- Name: consumable_model_is_found_in_purchase_order fk_cmifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_cmifib_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5580 (class 2606 OID 25976)
-- Name: company_asset_request fk_company__ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT fk_company__ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5596 (class 2606 OID 25981)
-- Name: consumable_is_used_in_stock_item_history fk_cons_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_cons_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5585 (class 2606 OID 25986)
-- Name: consumable_condition_history fk_consumab_associati_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT fk_consumab_associati_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5603 (class 2606 OID 25991)
-- Name: consumable_model_is_found_in_purchase_order fk_consumab_consumabl_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_consumab_consumabl_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5581 (class 2606 OID 25996)
-- Name: consumable fk_consumab_consumabl_destruct; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumab_consumabl_destruct FOREIGN KEY (destruction_certificate_id) REFERENCES public.destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5606 (class 2606 OID 26001)
-- Name: consumable_movement fk_consumab_consumabl_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5588 (class 2606 OID 26006)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5589 (class 2606 OID 26011)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5607 (class 2606 OID 26016)
-- Name: consumable_movement fk_consumab_consumabl_room_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_room_dest FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5608 (class 2606 OID 26021)
-- Name: consumable_movement fk_consumab_consumabl_room_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_room_source FOREIGN KEY (source_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5597 (class 2606 OID 26026)
-- Name: consumable_is_used_in_stock_item_history fk_consumab_consumabl_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_consumab_consumabl_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5582 (class 2606 OID 26031)
-- Name: consumable fk_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5609 (class 2606 OID 26036)
-- Name: consumable_type_attribute fk_cta_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5610 (class 2606 OID 26041)
-- Name: consumable_type_attribute fk_cta_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5578 (class 2606 OID 25886)
-- Name: delivery_note fk_delivery_note_purchase_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT fk_delivery_note_purchase_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5614 (class 2606 OID 26046)
-- Name: external_maintenance_document fk_emd_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT fk_emd_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5615 (class 2606 OID 26051)
-- Name: external_maintenance_step fk_ems_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_ems_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5616 (class 2606 OID 26056)
-- Name: external_maintenance_step fk_external_ems_is_a__external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_external_ems_is_a__external FOREIGN KEY (external_maintenance_typical_step_id) REFERENCES public.external_maintenance_typical_step(external_maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5613 (class 2606 OID 26061)
-- Name: external_maintenance fk_external_maintenan_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT fk_external_maintenan_maintena FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5617 (class 2606 OID 26066)
-- Name: invoice fk_invoice_delivery_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT fk_invoice_delivery_note FOREIGN KEY (delivery_note_id) REFERENCES public.delivery_note(delivery_note_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5625 (class 2606 OID 26071)
-- Name: maintenance_step fk_maintena_asset_con_asset_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_asset_con_asset_co FOREIGN KEY (asset_condition_history_id) REFERENCES public.asset_condition_history(asset_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5618 (class 2606 OID 26076)
-- Name: maintenance fk_maintena_asset_is__asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_asset_is__asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5626 (class 2606 OID 26081)
-- Name: maintenance_step fk_maintena_consumabl_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_consumabl_consumab FOREIGN KEY (consumable_condition_history_id) REFERENCES public.consumable_condition_history(consumable_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5623 (class 2606 OID 26086)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_maintena_maintenan_broken_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_maintena_maintenan_broken_i FOREIGN KEY (broken_item_report_id) REFERENCES public.broken_item_report(broken_item_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5619 (class 2606 OID 26091)
-- Name: maintenance fk_maintena_maintenan_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_maintenan_person FOREIGN KEY (performed_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5620 (class 2606 OID 26096)
-- Name: maintenance fk_maintena_person_as_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_person_as_person FOREIGN KEY (approved_by_maintenance_chief_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5627 (class 2606 OID 26101)
-- Name: maintenance_step fk_maintena_stock_ite_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_stock_ite_stock_it FOREIGN KEY (stock_item_condition_history_id) REFERENCES public.stock_item_condition_history(stock_item_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5624 (class 2606 OID 26106)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_milbir_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_milbir_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5628 (class 2606 OID 26111)
-- Name: maintenance_step fk_ms_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5629 (class 2606 OID 26116)
-- Name: maintenance_step fk_ms_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5630 (class 2606 OID 26121)
-- Name: maintenance_step fk_ms_typical_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_typical_step FOREIGN KEY (maintenance_typical_step_id) REFERENCES public.maintenance_typical_step(maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5639 (class 2606 OID 26126)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_child FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5640 (class 2606 OID 26131)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_parent FOREIGN KEY (parent_organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5641 (class 2606 OID 26136)
-- Name: person_assignment fk_person_a_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5642 (class 2606 OID 26141)
-- Name: person_assignment fk_person_a_person_is_position; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_is_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5643 (class 2606 OID 26146)
-- Name: person_reports_problem_on_asset fk_person_r_person_re_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_person_r_person_re_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5645 (class 2606 OID 26151)
-- Name: person_reports_problem_on_consumable fk_person_r_person_re_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_person_r_person_re_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5647 (class 2606 OID 26156)
-- Name: person_reports_problem_on_stock_item fk_person_r_person_re_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_person_r_person_re_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5649 (class 2606 OID 26161)
-- Name: person_role_mapping fk_person_role_mapping_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5650 (class 2606 OID 26166)
-- Name: person_role_mapping fk_person_role_mapping_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_role FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5644 (class 2606 OID 26171)
-- Name: person_reports_problem_on_asset fk_prpoa_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_prpoa_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5646 (class 2606 OID 26176)
-- Name: person_reports_problem_on_consumable fk_prpoc_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_prpoc_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5648 (class 2606 OID 26181)
-- Name: person_reports_problem_on_stock_item fk_prposi_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_prposi_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5652 (class 2606 OID 26186)
-- Name: room_belongs_to_organizational_structure fk_room_bel_room_belo_organiza; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_belongs_to_organizational_structure
    ADD CONSTRAINT fk_room_bel_room_belo_organiza FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5653 (class 2606 OID 26191)
-- Name: room_belongs_to_organizational_structure fk_room_bel_room_belo_room; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_belongs_to_organizational_structure
    ADD CONSTRAINT fk_room_bel_room_belo_room FOREIGN KEY (room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5651 (class 2606 OID 26196)
-- Name: room fk_room_room_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT fk_room_room_type FOREIGN KEY (room_type_id) REFERENCES public.room_type(room_type_id);


--
-- TOC entry 5657 (class 2606 OID 26201)
-- Name: stock_item_attribute_value fk_siav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5658 (class 2606 OID 26206)
-- Name: stock_item_attribute_value fk_siav_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5659 (class 2606 OID 26211)
-- Name: stock_item_condition_history fk_sich_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_sich_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5661 (class 2606 OID 26216)
-- Name: stock_item_is_assigned_to_person fk_siiatp_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_siiatp_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5665 (class 2606 OID 26221)
-- Name: stock_item_is_compatible_with_asset fk_siicwa_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_siicwa_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5667 (class 2606 OID 26226)
-- Name: stock_item_model fk_sim_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_brand FOREIGN KEY (stock_item_brand_id) REFERENCES public.stock_item_brand(stock_item_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5673 (class 2606 OID 26231)
-- Name: stock_item_movement fk_sim_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5674 (class 2606 OID 26236)
-- Name: stock_item_movement fk_sim_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5668 (class 2606 OID 26241)
-- Name: stock_item_model fk_sim_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5669 (class 2606 OID 26246)
-- Name: stock_item_model_attribute_value fk_simav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5670 (class 2606 OID 26251)
-- Name: stock_item_model_attribute_value fk_simav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5671 (class 2606 OID 26256)
-- Name: stock_item_model_is_found_in_purchase_order fk_simifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_simifib_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5678 (class 2606 OID 26261)
-- Name: stock_item_type_attribute fk_sita_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5679 (class 2606 OID 26266)
-- Name: stock_item_type_attribute fk_sita_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5666 (class 2606 OID 26271)
-- Name: stock_item_is_compatible_with_asset fk_stock_it_stock_ite_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_stock_it_stock_ite_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5672 (class 2606 OID 26276)
-- Name: stock_item_model_is_found_in_purchase_order fk_stock_it_stock_ite_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_purchase_order
    ADD CONSTRAINT fk_stock_it_stock_ite_bon_de_c FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5654 (class 2606 OID 26281)
-- Name: stock_item fk_stock_it_stock_ite_destruct; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_it_stock_ite_destruct FOREIGN KEY (destruction_certificate_id) REFERENCES public.destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5675 (class 2606 OID 26286)
-- Name: stock_item_movement fk_stock_it_stock_ite_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5662 (class 2606 OID 26291)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5663 (class 2606 OID 26296)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5660 (class 2606 OID 26301)
-- Name: stock_item_condition_history fk_stock_it_stock_ite_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_stock_it_stock_ite_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5676 (class 2606 OID 26306)
-- Name: stock_item_movement fk_stock_it_stock_ite_room_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_room_dest FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5677 (class 2606 OID 26311)
-- Name: stock_item_movement fk_stock_it_stock_ite_room_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_room_source FOREIGN KEY (source_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5655 (class 2606 OID 26316)
-- Name: stock_item fk_stock_item_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5656 (class 2606 OID 26321)
-- Name: stock_item fk_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5680 (class 2606 OID 26326)
-- Name: user_account fk_user_acc_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5681 (class 2606 OID 26331)
-- Name: user_account fk_user_acc_modified_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_modified_by_user FOREIGN KEY (modified_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5682 (class 2606 OID 26336)
-- Name: user_account fk_user_acc_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5683 (class 2606 OID 26341)
-- Name: user_session fk_user_ses_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT fk_user_ses_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5621 (class 2606 OID 26346)
-- Name: maintenance maintenance_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5631 (class 2606 OID 26351)
-- Name: maintenance_step_attribute_change maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_attribute_change
    ADD CONSTRAINT maintenance_step_att_maintenance_step_id_34ad2442_fk_maintenan FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5632 (class 2606 OID 26356)
-- Name: maintenance_step_item_request maintenance_step_item_request_rejected_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_rejected_by_person_fk FOREIGN KEY (rejected_by_person_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 5622 (class 2606 OID 26361)
-- Name: maintenance maintenance_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5633 (class 2606 OID 26366)
-- Name: maintenance_step_item_request msir_consumable_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_consumable_fk FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5634 (class 2606 OID 26371)
-- Name: maintenance_step_item_request msir_destination_room_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_destination_room_fk FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id);


--
-- TOC entry 5635 (class 2606 OID 26376)
-- Name: maintenance_step_item_request msir_maintenance_step_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_maintenance_step_fk FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id);


--
-- TOC entry 5636 (class 2606 OID 26381)
-- Name: maintenance_step_item_request msir_requested_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_requested_by_person_fk FOREIGN KEY (requested_by_person_id) REFERENCES public.person(person_id);


--
-- TOC entry 5637 (class 2606 OID 26386)
-- Name: maintenance_step_item_request msir_source_room_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_source_room_fk FOREIGN KEY (source_room_id) REFERENCES public.room(room_id);


--
-- TOC entry 5638 (class 2606 OID 26391)
-- Name: maintenance_step_item_request msir_stock_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_stock_item_fk FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5690 (class 2606 OID 49376)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_includ_destination_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_includ_destination_room_id_fkey FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id);


--
-- TOC entry 5694 (class 2606 OID 49410)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_con_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_con_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5695 (class 2606 OID 49405)
-- Name: person_reports_problem_on_asset_included_consumable person_reports_problem_on_asset_included_consuma_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_consumable
    ADD CONSTRAINT person_reports_problem_on_asset_included_consuma_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5691 (class 2606 OID 49371)
-- Name: person_reports_problem_on_asset_included_context person_reports_problem_on_asset_included_context_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_context
    ADD CONSTRAINT person_reports_problem_on_asset_included_context_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5692 (class 2606 OID 49393)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_sto_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_sto_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5693 (class 2606 OID 49388)
-- Name: person_reports_problem_on_asset_included_stock_item person_reports_problem_on_asset_included_stock_i_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset_included_stock_item
    ADD CONSTRAINT person_reports_problem_on_asset_included_stock_i_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE;


--
-- TOC entry 5664 (class 2606 OID 26396)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


-- Completed on 2026-03-06 21:09:23

--
-- PostgreSQL database dump complete
--

\unrestrict T7cM7tqqwqTC9SRnew6EPCd8gLedhuhbT8OahjpYX2uaXKAUcAypOg08Bd5WPk0

