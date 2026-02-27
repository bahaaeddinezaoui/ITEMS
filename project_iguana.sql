--
-- PostgreSQL database dump
--

\restrict bkgVmcKt4LV5IVoUhQgKD2brROk6FYxnUug534fTjYSV12lYFhZ0HL9Hnt30mTc

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-02-27 10:15:09

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16385)
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
-- TOC entry 5876 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN administrative_certificate.operation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.operation IS 'Action" can be "entry", "exit" or "transfer';


--
-- TOC entry 5877 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN administrative_certificate.format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administrative_certificate.format IS 'Among the formats is "21x27"';


--
-- TOC entry 220 (class 1259 OID 16394)
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
-- TOC entry 221 (class 1259 OID 16399)
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
-- TOC entry 222 (class 1259 OID 16403)
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
-- TOC entry 223 (class 1259 OID 16410)
-- Name: asset_brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_brand (
    asset_brand_id integer NOT NULL,
    brand_name character varying(48),
    brand_code character varying(16),
    is_active boolean
);


ALTER TABLE public.asset_brand OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16414)
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
-- TOC entry 225 (class 1259 OID 16422)
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
-- TOC entry 5878 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE asset_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_is_assigned_to_person IS 'The first person is the one to whom the asset is assigned, a';


--
-- TOC entry 226 (class 1259 OID 16432)
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
-- TOC entry 320 (class 1259 OID 18181)
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
-- TOC entry 5879 (class 0 OID 0)
-- Dependencies: 320
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_consumable_history_id_seq OWNED BY public.asset_is_composed_of_consumable_history.id;


--
-- TOC entry 227 (class 1259 OID 16438)
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
-- TOC entry 319 (class 1259 OID 18167)
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
-- TOC entry 5880 (class 0 OID 0)
-- Dependencies: 319
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_is_composed_of_stock_item_history_id_seq OWNED BY public.asset_is_composed_of_stock_item_history.id;


--
-- TOC entry 228 (class 1259 OID 16444)
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
-- TOC entry 229 (class 1259 OID 16450)
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
-- TOC entry 325 (class 1259 OID 18234)
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
-- TOC entry 324 (class 1259 OID 18233)
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
-- TOC entry 5881 (class 0 OID 0)
-- Dependencies: 324
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_consumable_id_seq OWNED BY public.asset_model_default_consumable.id;


--
-- TOC entry 323 (class 1259 OID 18210)
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
-- TOC entry 322 (class 1259 OID 18209)
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
-- TOC entry 5882 (class 0 OID 0)
-- Dependencies: 322
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_model_default_stock_item_id_seq OWNED BY public.asset_model_default_stock_item.id;


--
-- TOC entry 230 (class 1259 OID 16457)
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
    movement_datetime timestamp without time zone NOT NULL
);


ALTER TABLE public.asset_movement OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16466)
-- Name: asset_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_type (
    asset_type_id integer NOT NULL,
    asset_type_label character varying(60),
    asset_type_code character varying(18)
);


ALTER TABLE public.asset_type OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16470)
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
-- TOC entry 233 (class 1259 OID 16475)
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
-- TOC entry 234 (class 1259 OID 16480)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16485)
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
-- TOC entry 236 (class 1259 OID 16486)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16492)
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
-- TOC entry 238 (class 1259 OID 16493)
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
-- TOC entry 239 (class 1259 OID 16500)
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
-- TOC entry 240 (class 1259 OID 16501)
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
-- TOC entry 241 (class 1259 OID 16516)
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16522)
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
-- TOC entry 243 (class 1259 OID 16523)
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
-- TOC entry 244 (class 1259 OID 16524)
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16530)
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
-- TOC entry 246 (class 1259 OID 16531)
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
-- TOC entry 5883 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN authentication_log.event_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.event_type IS 'LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PWD_CHANGE, ACCOUNT_LOCK';


--
-- TOC entry 5884 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN authentication_log.failure_reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.authentication_log.failure_reason IS 'e.g., Invalid Password, User Disabled';


--
-- TOC entry 247 (class 1259 OID 16536)
-- Name: bon_de_commande; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bon_de_commande (
    bon_de_commande_id integer NOT NULL,
    supplier_id integer NOT NULL,
    digital_copy bytea,
    is_signed_by_finance boolean,
    bon_de_commande_code character varying(10)
);


ALTER TABLE public.bon_de_commande OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16543)
-- Name: bon_de_livraison; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bon_de_livraison (
    bon_de_livraison_id integer NOT NULL,
    bon_de_commande_id integer NOT NULL,
    bon_de_livraison_date date,
    digital_copy bytea,
    bon_de_livraison_code character varying(10)
);


ALTER TABLE public.bon_de_livraison OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16550)
-- Name: bon_de_reste; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bon_de_reste (
    bon_de_reste_id integer NOT NULL,
    bon_de_commande_id integer NOT NULL,
    bon_de_reste_date date,
    digital_copy bytea
);


ALTER TABLE public.bon_de_reste OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16557)
-- Name: broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broken_item_report (
    broken_item_report_id integer NOT NULL,
    digital_copy bytea
);


ALTER TABLE public.broken_item_report OWNER TO postgres;

--
-- TOC entry 5885 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE broken_item_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.broken_item_report IS 'Equivalent of C5';


--
-- TOC entry 251 (class 1259 OID 16563)
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
-- TOC entry 5886 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE company_asset_request; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.company_asset_request IS 'Demande du mat�riel';


--
-- TOC entry 252 (class 1259 OID 16570)
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
-- TOC entry 253 (class 1259 OID 16575)
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
-- TOC entry 254 (class 1259 OID 16579)
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
-- TOC entry 255 (class 1259 OID 16586)
-- Name: consumable_brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_brand (
    consumable_brand_id integer NOT NULL,
    brand_name character varying(48),
    brand_code character varying(16),
    is_active boolean
);


ALTER TABLE public.consumable_brand OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16590)
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
-- TOC entry 257 (class 1259 OID 16602)
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
-- TOC entry 5887 (class 0 OID 0)
-- Dependencies: 257
-- Name: TABLE consumable_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consumable_is_assigned_to_person IS 'The first person is the one to whom the consumable is assign';


--
-- TOC entry 258 (class 1259 OID 16613)
-- Name: consumable_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_asset (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_a_consumable_model_id_not_null NOT NULL,
    asset_model_id integer CONSTRAINT c_is_compatible_with_a_asset_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 16618)
-- Name: consumable_is_compatible_with_stock_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_is_compatible_with_stock_item (
    consumable_model_id integer CONSTRAINT c_is_compatible_with_si_consumable_model_id_not_null NOT NULL,
    stock_item_model_id integer CONSTRAINT c_is_compatible_with_si_stock_item_model_id_not_null NOT NULL
);


ALTER TABLE public.consumable_is_compatible_with_stock_item OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 16623)
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
-- TOC entry 321 (class 1259 OID 18195)
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
-- TOC entry 5888 (class 0 OID 0)
-- Dependencies: 321
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumable_is_used_in_stock_item_history_id_seq OWNED BY public.consumable_is_used_in_stock_item_history.id;


--
-- TOC entry 261 (class 1259 OID 16629)
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
-- TOC entry 262 (class 1259 OID 16635)
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
-- TOC entry 263 (class 1259 OID 16642)
-- Name: consumable_model_is_found_in_bdc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_model_is_found_in_bdc (
    consumable_model_id integer NOT NULL,
    bon_de_commande_id integer NOT NULL,
    quantity_ordered integer,
    quantity_received integer,
    quantity_invoiced integer,
    unit_price numeric(10,2)
);


ALTER TABLE public.consumable_model_is_found_in_bdc OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 16647)
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
    movement_datetime timestamp without time zone NOT NULL
);


ALTER TABLE public.consumable_movement OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 16656)
-- Name: consumable_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumable_type (
    consumable_type_id integer NOT NULL,
    consumable_type_label character varying(60),
    consumable_type_code character varying(18)
);


ALTER TABLE public.consumable_type OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 16660)
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
-- TOC entry 267 (class 1259 OID 16665)
-- Name: destruction_certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destruction_certificate (
    destruction_certificate_id integer NOT NULL,
    digital_copy bytea,
    destruction_datetime timestamp without time zone
);


ALTER TABLE public.destruction_certificate OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 16671)
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
-- TOC entry 269 (class 1259 OID 16683)
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
-- TOC entry 270 (class 1259 OID 16684)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 16690)
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
-- TOC entry 272 (class 1259 OID 16691)
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
-- TOC entry 273 (class 1259 OID 16700)
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
-- TOC entry 274 (class 1259 OID 16701)
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 16709)
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
-- TOC entry 276 (class 1259 OID 16714)
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
-- TOC entry 277 (class 1259 OID 16721)
-- Name: external_maintenance_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_provider (
    external_maintenance_provider_id integer CONSTRAINT external_maintenance_provid_external_maintenance_provi_not_null NOT NULL,
    external_maintenance_provider_name character varying(48),
    external_maintenance_provider_location character varying(128)
);


ALTER TABLE public.external_maintenance_provider OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 16725)
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
-- TOC entry 279 (class 1259 OID 16732)
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
-- TOC entry 5889 (class 0 OID 0)
-- Dependencies: 279
-- Name: COLUMN external_maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 280 (class 1259 OID 16736)
-- Name: facture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facture (
    facture_id integer NOT NULL,
    bon_de_livraison_id integer NOT NULL,
    digital_copy bytea
);


ALTER TABLE public.facture OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 16743)
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
-- TOC entry 282 (class 1259 OID 16752)
-- Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_inspection_leads_to_broken_item_report (
    maintenance_id integer CONSTRAINT maintenance_inspection_leads_to_broken__maintenance_id_not_null NOT NULL,
    broken_item_report_id integer CONSTRAINT maintenance_inspection_leads_to__broken_item_report_id_not_null NOT NULL
);


ALTER TABLE public.maintenance_inspection_leads_to_broken_item_report OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 16757)
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
-- TOC entry 318 (class 1259 OID 17883)
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
-- TOC entry 284 (class 1259 OID 16764)
-- Name: maintenance_typical_step; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_typical_step (
    maintenance_typical_step_id integer NOT NULL,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    description character varying(256),
    maintenance_type character(8),
    operation_type character varying(24) DEFAULT 'change'::character varying NOT NULL,
    CONSTRAINT maintenance_typical_step_operation_type_check CHECK (((operation_type)::text = ANY ((ARRAY['add'::character varying, 'remove'::character varying, 'change'::character varying, 'replace'::character varying, 'repair'::character varying, 'inspect'::character varying, 'clean'::character varying, 'calibrate'::character varying, 'test'::character varying])::text[])))
);


ALTER TABLE public.maintenance_typical_step OWNER TO postgres;

--
-- TOC entry 5890 (class 0 OID 0)
-- Dependencies: 284
-- Name: COLUMN maintenance_typical_step.maintenance_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.maintenance_typical_step.maintenance_type IS 'Hardware or software';


--
-- TOC entry 285 (class 1259 OID 16768)
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
-- TOC entry 286 (class 1259 OID 16772)
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
-- TOC entry 287 (class 1259 OID 16777)
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
-- TOC entry 288 (class 1259 OID 16786)
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
-- TOC entry 5891 (class 0 OID 0)
-- Dependencies: 288
-- Name: COLUMN person_assignment.employment_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_assignment.employment_type IS 'Permanent, contractual...';


--
-- TOC entry 289 (class 1259 OID 16792)
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
-- TOC entry 290 (class 1259 OID 16800)
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
-- TOC entry 291 (class 1259 OID 16808)
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
-- TOC entry 292 (class 1259 OID 16816)
-- Name: person_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_role_mapping (
    role_id integer NOT NULL,
    person_id integer NOT NULL
);


ALTER TABLE public.person_role_mapping OWNER TO postgres;

--
-- TOC entry 5892 (class 0 OID 0)
-- Dependencies: 292
-- Name: COLUMN person_role_mapping.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.person_role_mapping.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 293 (class 1259 OID 16821)
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
-- TOC entry 294 (class 1259 OID 16825)
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
-- TOC entry 295 (class 1259 OID 16829)
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
-- TOC entry 5893 (class 0 OID 0)
-- Dependencies: 295
-- Name: TABLE receipt_report; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.receipt_report IS 'This represents the "PV de r�ception"';


--
-- TOC entry 296 (class 1259 OID 16835)
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
-- TOC entry 5894 (class 0 OID 0)
-- Dependencies: 296
-- Name: TABLE role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.role IS 'Role is what the person can do in the system';


--
-- TOC entry 5895 (class 0 OID 0)
-- Dependencies: 296
-- Name: COLUMN role.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role.role_id IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';


--
-- TOC entry 297 (class 1259 OID 16839)
-- Name: room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room (
    room_id integer NOT NULL,
    room_name character varying(30),
    room_type_id integer
);


ALTER TABLE public.room OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 16843)
-- Name: room_belongs_to_organizational_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_belongs_to_organizational_structure (
    organizational_structure_id integer CONSTRAINT room_belongs_to_organizatio_organizational_structure_i_not_null NOT NULL,
    room_id integer NOT NULL
);


ALTER TABLE public.room_belongs_to_organizational_structure OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 16848)
-- Name: room_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_type (
    room_type_id integer NOT NULL,
    room_type_label character varying(60) NOT NULL,
    room_type_code character varying(18) NOT NULL
);


ALTER TABLE public.room_type OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 16854)
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
-- TOC entry 5896 (class 0 OID 0)
-- Dependencies: 300
-- Name: room_type_room_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_type_room_type_id_seq OWNED BY public.room_type.room_type_id;


--
-- TOC entry 301 (class 1259 OID 16855)
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
-- TOC entry 302 (class 1259 OID 16860)
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
-- TOC entry 303 (class 1259 OID 16864)
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
-- TOC entry 304 (class 1259 OID 16871)
-- Name: stock_item_brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_brand (
    stock_item_brand_id integer NOT NULL,
    brand_name character varying(48),
    brand_code character varying(16),
    is_active boolean
);


ALTER TABLE public.stock_item_brand OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 16875)
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
-- TOC entry 306 (class 1259 OID 16883)
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
-- TOC entry 5897 (class 0 OID 0)
-- Dependencies: 306
-- Name: TABLE stock_item_is_assigned_to_person; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stock_item_is_assigned_to_person IS 'The first person is the one to whom the stock item is assign';


--
-- TOC entry 307 (class 1259 OID 16894)
-- Name: stock_item_is_compatible_with_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_is_compatible_with_asset (
    stock_item_model_id integer CONSTRAINT stock_item_is_compatible_with_asse_stock_item_model_id_not_null NOT NULL,
    asset_model_id integer NOT NULL
);


ALTER TABLE public.stock_item_is_compatible_with_asset OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 16899)
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
-- TOC entry 309 (class 1259 OID 16905)
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
-- TOC entry 310 (class 1259 OID 16912)
-- Name: stock_item_model_is_found_in_bdc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_model_is_found_in_bdc (
    stock_item_model_id integer NOT NULL,
    bon_de_commande_id integer NOT NULL,
    quantity_ordered integer,
    quantity_received integer,
    quantity_invoiced integer,
    unit_price numeric(10,2)
);


ALTER TABLE public.stock_item_model_is_found_in_bdc OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 16917)
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
    movement_datetime timestamp without time zone NOT NULL
);


ALTER TABLE public.stock_item_movement OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 16926)
-- Name: stock_item_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_item_type (
    stock_item_type_id integer NOT NULL,
    stock_item_type_label character varying(60),
    stock_item_type_code character varying(18)
);


ALTER TABLE public.stock_item_type OWNER TO postgres;

--
-- TOC entry 313 (class 1259 OID 16930)
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
-- TOC entry 314 (class 1259 OID 16935)
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
-- TOC entry 315 (class 1259 OID 16939)
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
-- TOC entry 316 (class 1259 OID 16955)
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
-- TOC entry 317 (class 1259 OID 16963)
-- Name: warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse (
    warehouse_id integer NOT NULL,
    warehouse_name character varying(60),
    warehouse_address character varying(128)
);


ALTER TABLE public.warehouse OWNER TO postgres;

--
-- TOC entry 5898 (class 0 OID 0)
-- Dependencies: 317
-- Name: TABLE warehouse; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.warehouse IS 'Warehouse" is in our case "ERI/2RM';


--
-- TOC entry 5234 (class 2604 OID 18182)
-- Name: asset_is_composed_of_consumable_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_consumable_history_id_seq'::regclass);


--
-- TOC entry 5235 (class 2604 OID 18168)
-- Name: asset_is_composed_of_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.asset_is_composed_of_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5242 (class 2604 OID 18237)
-- Name: asset_model_default_consumable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_consumable_id_seq'::regclass);


--
-- TOC entry 5240 (class 2604 OID 18213)
-- Name: asset_model_default_stock_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item ALTER COLUMN id SET DEFAULT nextval('public.asset_model_default_stock_item_id_seq'::regclass);


--
-- TOC entry 5236 (class 2604 OID 18196)
-- Name: consumable_is_used_in_stock_item_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history ALTER COLUMN id SET DEFAULT nextval('public.consumable_is_used_in_stock_item_history_id_seq'::regclass);


--
-- TOC entry 5239 (class 2604 OID 16967)
-- Name: room_type room_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_type ALTER COLUMN room_type_id SET DEFAULT nextval('public.room_type_room_type_id_seq'::regclass);


--
-- TOC entry 5764 (class 0 OID 16385)
-- Dependencies: 219
-- Data for Name: administrative_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrative_certificate (administrative_certificate_id, warehouse_id, attribution_order_id, receipt_report_id, interested_organization, operation, format, is_signed_by_warehouse_storage_magaziner, is_signed_by_warehouse_storage_accountant, is_signed_by_warehouse_storage_marketer, is_signed_by_warehouse_it_chief, is_signed_by_warehouse_leader, digital_copy) FROM stdin;
1	1	2	1	\N	entry	\N	f	f	f	f	f	\N
2	1	3	2	\N	entry	\N	f	f	f	f	f	\N
\.


--
-- TOC entry 5765 (class 0 OID 16394)
-- Dependencies: 220
-- Data for Name: asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset (asset_id, asset_model_id, attribution_order_id, destruction_certificate_id, asset_serial_number, asset_fabrication_datetime, asset_inventory_number, asset_service_tag, asset_name, asset_name_in_the_administrative_certificate, asset_arrival_datetime, asset_status) FROM stdin;
1	1	\N	\N	ABCD1234	\N	001		Latitude for Test	\N	\N	active
2	1	\N	\N	gggggg	\N	004		Another Latitude for Test	\N	\N	active
3	1	2	\N	eeeeee	\N	0088	\N	Hello	\N	\N	In Stock
4	1	3	\N	testao1	\N	999	\N	ao1	\N	\N	In Stock
5	1	4	\N	777	\N	777	\N	ao_test	\N	\N	In Stock
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
\.


--
-- TOC entry 5766 (class 0 OID 16399)
-- Dependencies: 221
-- Data for Name: asset_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_attribute_definition (asset_attribute_definition_id, data_type, unit, description) FROM stdin;
1	number	Inch	Screen Resolution
2	number	mAh	Battery Capacity
3	string	\N	Disk Type
\.


--
-- TOC entry 5767 (class 0 OID 16403)
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
\.


--
-- TOC entry 5768 (class 0 OID 16410)
-- Dependencies: 223
-- Data for Name: asset_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_brand (asset_brand_id, brand_name, brand_code, is_active) FROM stdin;
1	Acer	ACER	t
2	Fujitsu	FUJITSU	t
3	Condor	CONDOR	t
4	WADOO	WADOO	t
5	DTSIG	DTSIG	t
6	HP	HP	t
7	OKI	OKI	t
8	Epson	EPSON	t
9	Panasonic	PANASONIC	t
10	DELL	DELL	t
11	Kyocera	KYOCERA	t
12	XEROX	XEROX	t
13	EATON	EATON	t
14	Mac-Tech	MACTECH	t
15	CANON	CANON	t
16	TALLY	TALLY	t
17	RICOH	RICOH	t
18	Siemens	SIEMENS	t
99	Test Brand	TEST	t
\.


--
-- TOC entry 5769 (class 0 OID 16414)
-- Dependencies: 224
-- Data for Name: asset_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_condition_history (asset_condition_history_id, asset_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
1	1	1	rtrterte	\N	\N	\N	2026-02-24 16:45:06.487383
\.


--
-- TOC entry 5770 (class 0 OID 16422)
-- Dependencies: 225
-- Data for Name: asset_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_is_assigned_to_person (person_id, asset_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
9	1	1008	1	2026-02-18 10:43:00	2026-02-18 10:43:39.70789	Good	f	\N
9	1	1008	2	2026-02-18 13:11:00	2026-02-24 18:31:56.830366	Good	f	10
9	1	10	3	2026-02-24 18:47:00	2026-02-25 21:40:04.701229	Good	f	10
\.


--
-- TOC entry 5771 (class 0 OID 16432)
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
\.


--
-- TOC entry 5772 (class 0 OID 16438)
-- Dependencies: 227
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
\.


--
-- TOC entry 5773 (class 0 OID 16444)
-- Dependencies: 228
-- Data for Name: asset_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model (asset_model_id, asset_brand_id, asset_type_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	10	1	Latitude 5531	L5531	2022	\N	t		24
\.


--
-- TOC entry 5774 (class 0 OID 16450)
-- Dependencies: 229
-- Data for Name: asset_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_attribute_value (asset_model_id, asset_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	2	f	\N	90000.000000	\N
1	3	f	SSD NVMe	\N	\N
\.


--
-- TOC entry 5870 (class 0 OID 18234)
-- Dependencies: 325
-- Data for Name: asset_model_default_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_consumable (id, asset_model_id, consumable_model_id, quantity, notes) FROM stdin;
1	1	1	1	\N
3	1	2	2	
\.


--
-- TOC entry 5868 (class 0 OID 18210)
-- Dependencies: 323
-- Data for Name: asset_model_default_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_model_default_stock_item (id, asset_model_id, stock_item_model_id, quantity, notes) FROM stdin;
1	1	1	4	
\.


--
-- TOC entry 5775 (class 0 OID 16457)
-- Dependencies: 230
-- Data for Name: asset_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_movement (asset_movement_id, asset_id, source_room_id, destination_room_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime) FROM stdin;
1	1	1	25	\N	\N	Maintenance	2026-02-24 14:00:00
2	1	25	23	\N	15	Received by company from external maintenance	2026-02-25 17:23:00.701309
3	1	23	24	\N	\N	maintenance_create	2026-02-25 17:27:15.737894
4	8	1	1	\N	\N	Test	2026-02-24 14:00:00
5	8	1	24	\N	\N	maintenance_create	2026-02-25 18:32:32.441818
6	8	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 18:36:10.905642
7	8	25	23	\N	\N	Received by company from external maintenance	2026-02-25 19:10:58.9252
8	1	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 19:12:03.55924
9	1	25	23	\N	\N	Received by company from external maintenance	2026-02-25 19:12:13.122159
10	5	1	1	\N	\N	Test	2026-02-24 14:00:00
11	5	1	24	\N	\N	maintenance_create	2026-02-25 19:14:30.707723
12	5	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 19:15:15.144053
13	5	25	23	\N	18	Received by company from external maintenance	2026-02-25 19:48:44.195044
14	5	23	24	\N	\N	maintenance_create	2026-02-25 19:48:59.451954
15	5	24	25	\N	\N	Sent to external maintenance provider	2026-02-25 19:49:36.157495
16	5	25	24	\N	\N	Received by company from external maintenance	2026-02-25 21:09:12.749941
17	1	1	2	\N	\N	T	2026-02-24 15:18:18.900011
18	1	2	10	\N	\N	manual_move	2026-02-25 21:43:07.132937
19	1	10	16	\N	\N	manual_move	2026-02-25 21:56:34.143978
20	1	16	24	\N	\N	maintenance_create	2026-02-26 10:37:18.829114
\.


--
-- TOC entry 5776 (class 0 OID 16466)
-- Dependencies: 231
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
-- TOC entry 5777 (class 0 OID 16470)
-- Dependencies: 232
-- Data for Name: asset_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_type_attribute (asset_attribute_definition_id, asset_type_id, is_mandatory, default_value) FROM stdin;
1	1	t	15.6
2	1	t	\N
\.


--
-- TOC entry 5778 (class 0 OID 16475)
-- Dependencies: 233
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
\.


--
-- TOC entry 5779 (class 0 OID 16480)
-- Dependencies: 234
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- TOC entry 5781 (class 0 OID 16486)
-- Dependencies: 236
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5783 (class 0 OID 16493)
-- Dependencies: 238
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
\.


--
-- TOC entry 5785 (class 0 OID 16501)
-- Dependencies: 240
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$1200000$ceTbB0O5bCmm57swQmkEmg$/LZsB44AZf4ZGvXPW6p/4orTP53jVw3AJ38DC/OLrXE=	2026-02-10 14:11:34.116607+01	t	admin			admin@example.com	t	t	2026-02-09 21:42:30.666222+01
\.


--
-- TOC entry 5786 (class 0 OID 16516)
-- Dependencies: 241
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- TOC entry 5789 (class 0 OID 16524)
-- Dependencies: 244
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5791 (class 0 OID 16531)
-- Dependencies: 246
-- Data for Name: authentication_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_log (log_id, user_id, attempted_username, event_type, ip_address, event_timestamp, failure_reason) FROM stdin;
\.


--
-- TOC entry 5792 (class 0 OID 16536)
-- Dependencies: 247
-- Data for Name: bon_de_commande; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bon_de_commande (bon_de_commande_id, supplier_id, digital_copy, is_signed_by_finance, bon_de_commande_code) FROM stdin;
\.


--
-- TOC entry 5793 (class 0 OID 16543)
-- Dependencies: 248
-- Data for Name: bon_de_livraison; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bon_de_livraison (bon_de_livraison_id, bon_de_commande_id, bon_de_livraison_date, digital_copy, bon_de_livraison_code) FROM stdin;
\.


--
-- TOC entry 5794 (class 0 OID 16550)
-- Dependencies: 249
-- Data for Name: bon_de_reste; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bon_de_reste (bon_de_reste_id, bon_de_commande_id, bon_de_reste_date, digital_copy) FROM stdin;
\.


--
-- TOC entry 5795 (class 0 OID 16557)
-- Dependencies: 250
-- Data for Name: broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broken_item_report (broken_item_report_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 5796 (class 0 OID 16563)
-- Dependencies: 251
-- Data for Name: company_asset_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_asset_request (company_asset_request_id, attribution_order_id, is_signed_by_company, administrative_serial_number, title_of_demand, organization_body_designation, register_number_or_book_journal_of_corpse, register_number_or_book_journal_of_establishment, is_signed_by_company_leader, is_signed_by_regional_provider, is_signed_by_company_representative, digital_copy) FROM stdin;
1	3	t	ASN	Hello	ESAM	1234	\N	t	t	t	\N
2	2	f	aaaa	aaaa	aaaa	aaaaaa	\N	f	f	f	\N
\.


--
-- TOC entry 5797 (class 0 OID 16570)
-- Dependencies: 252
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
\.


--
-- TOC entry 5798 (class 0 OID 16575)
-- Dependencies: 253
-- Data for Name: consumable_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_definition (consumable_attribute_definition_id, consumable_type_code, data_type, unit, description) FROM stdin;
1	\N	number	m	Number of Meters
2	\N	string	\N	Color
3	\N	number	page(s)	Number of pages
\.


--
-- TOC entry 5799 (class 0 OID 16579)
-- Dependencies: 254
-- Data for Name: consumable_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_attribute_value (consumable_id, consumable_attribute_definition_id, value_string, value_bool, value_date, value_number) FROM stdin;
\.


--
-- TOC entry 5800 (class 0 OID 16586)
-- Dependencies: 255
-- Data for Name: consumable_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_brand (consumable_brand_id, brand_name, brand_code, is_active) FROM stdin;
1	BIC	BIC	t
\.


--
-- TOC entry 5801 (class 0 OID 16590)
-- Dependencies: 256
-- Data for Name: consumable_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_condition_history (consumable_condition_history_id, consumable_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 5802 (class 0 OID 16602)
-- Dependencies: 257
-- Data for Name: consumable_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_assigned_to_person (assignment_id, consumable_id, person_id, assigned_by_person_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	1	9	10	2026-02-24 18:36:00	2026-02-24 18:36:54.831336	Good	f	\N
2	1	9	10	2026-02-24 18:37:00	2026-02-24 19:46:26.047031	Good	f	\N
3	1	9	10	2026-02-24 19:46:00	2026-02-24 19:46:46.34698	Good	f	\N
\.


--
-- TOC entry 5803 (class 0 OID 16613)
-- Dependencies: 258
-- Data for Name: consumable_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_asset (consumable_model_id, asset_model_id) FROM stdin;
1	1
\.


--
-- TOC entry 5804 (class 0 OID 16618)
-- Dependencies: 259
-- Data for Name: consumable_is_compatible_with_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_compatible_with_stock_item (consumable_model_id, stock_item_model_id) FROM stdin;
\.


--
-- TOC entry 5805 (class 0 OID 16623)
-- Dependencies: 260
-- Data for Name: consumable_is_used_in_stock_item_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_is_used_in_stock_item_history (consumable_id, stock_item_id, maintenance_step_id, start_datetime, end_datetime, id, attribution_order_id) FROM stdin;
\.


--
-- TOC entry 5806 (class 0 OID 16629)
-- Dependencies: 261
-- Data for Name: consumable_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model (consumable_model_id, consumable_type_id, consumable_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	1	1	Red Pen 01	RP01	2000	\N	t		8
2	2	1	EPSON M450	M450	\N	\N	t	\N	\N
\.


--
-- TOC entry 5807 (class 0 OID 16635)
-- Dependencies: 262
-- Data for Name: consumable_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_attribute_value (consumable_model_id, consumable_attribute_definition_id, value_bool, value_string, value_number, value_date) FROM stdin;
1	1	f	\N	500.000000	\N
2	3	\N	\N	1000.000000	\N
\.


--
-- TOC entry 5808 (class 0 OID 16642)
-- Dependencies: 263
-- Data for Name: consumable_model_is_found_in_bdc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_model_is_found_in_bdc (consumable_model_id, bon_de_commande_id, quantity_ordered, quantity_received, quantity_invoiced, unit_price) FROM stdin;
\.


--
-- TOC entry 5809 (class 0 OID 16647)
-- Dependencies: 264
-- Data for Name: consumable_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_movement (consumable_movement_id, destination_room_id, source_room_id, maintenance_step_id, external_maintenance_step_id, consumable_id, movement_reason, movement_datetime) FROM stdin;
1	2	1	\N	\N	1	Test	2026-02-24 14:00:00
2	24	2	3	\N	1	maintenance_step_fulfill_request	2026-02-24 13:08:52.724791
3	24	24	4	\N	1	maintenance_step_fulfill_request	2026-02-24 13:12:06.094659
4	24	24	3	\N	1	maintenance_step_fulfill_request	2026-02-24 13:12:12.392508
5	2	1	2	\N	2	Maintenance	2026-02-24 14:00:00
6	24	24	6	\N	1	maintenance_step_fulfill_request	2026-02-24 14:22:24.343271
7	24	24	7	\N	1	maintenance_step_fulfill_request	2026-02-24 14:27:20.441491
8	8	24	8	\N	1	maintenance_step_fulfill_request	2026-02-24 14:31:22.629371
9	1	8	9	\N	1	maintenance_step_fulfill_request	2026-02-24 14:36:25.501926
10	24	1	11	\N	1	maintenance_step_fulfill_request	2026-02-24 15:18:04.954874
11	24	24	12	\N	1	maintenance_step_remove	2026-02-24 15:18:38.518978
12	10	24	\N	\N	1	manual_move	2026-02-24 17:38:48.64965
13	16	10	\N	\N	1	manual_move	2026-02-25 21:56:34.152207
14	24	16	\N	\N	1	maintenance_create	2026-02-26 10:37:18.836313
\.


--
-- TOC entry 5810 (class 0 OID 16656)
-- Dependencies: 265
-- Data for Name: consumable_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type (consumable_type_id, consumable_type_label, consumable_type_code) FROM stdin;
1	Pen	PEN
2	Toner	TNR
\.


--
-- TOC entry 5811 (class 0 OID 16660)
-- Dependencies: 266
-- Data for Name: consumable_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumable_type_attribute (consumable_type_id, consumable_attribute_definition_id, is_mandatory, default_value) FROM stdin;
1	1	f	400
2	3	f	1000
\.


--
-- TOC entry 5812 (class 0 OID 16665)
-- Dependencies: 267
-- Data for Name: destruction_certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destruction_certificate (destruction_certificate_id, digital_copy, destruction_datetime) FROM stdin;
\.


--
-- TOC entry 5813 (class 0 OID 16671)
-- Dependencies: 268
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- TOC entry 5815 (class 0 OID 16684)
-- Dependencies: 270
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	group
3	auth	permission
4	auth	user
5	contenttypes	contenttype
6	sessions	session
\.


--
-- TOC entry 5817 (class 0 OID 16691)
-- Dependencies: 272
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
\.


--
-- TOC entry 5819 (class 0 OID 16701)
-- Dependencies: 274
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
mwube6mtzimgwmghul5d0r6qos8lqeqe	.eJxVjDsOwjAQBe_iGllr_Isp6XMGa-3d4ACypTipEHeHSCmgfTPzXiLitpa4dV7iTOIilDj9bgnzg-sO6I711mRudV3mJHdFHrTLsRE_r4f7d1Cwl2_NGbPT5EgF9FYTZW8QXLA8KRwAskNzBgbwnsGHkAIwDWYCT4Taknh_APYiOC0:1vpY5p:xY5WGtSgTAbInJSRivcUir-NtXutxfuZCHkLUnB8v1k	2026-02-23 21:42:49.784307+01
\.


--
-- TOC entry 5820 (class 0 OID 16709)
-- Dependencies: 275
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
\.


--
-- TOC entry 5821 (class 0 OID 16714)
-- Dependencies: 276
-- Data for Name: external_maintenance_document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_document (external_maintenance_document_id, external_maintenance_id, document_is_signed, item_is_received_by_maintenance_provider, maintenance_provider_final_decision, digital_copy) FROM stdin;
\.


--
-- TOC entry 5822 (class 0 OID 16721)
-- Dependencies: 277
-- Data for Name: external_maintenance_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_provider (external_maintenance_provider_id, external_maintenance_provider_name, external_maintenance_provider_location) FROM stdin;
1	ERMT/2RM	\N
\.


--
-- TOC entry 5823 (class 0 OID 16725)
-- Dependencies: 278
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
-- TOC entry 5824 (class 0 OID 16732)
-- Dependencies: 279
-- Data for Name: external_maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_typical_step (external_maintenance_typical_step_id, estimated_cost, actual_cost, maintenance_type, description) FROM stdin;
1	\N	\N	Hardware	Removing the motherboard
2	\N	\N	Hardware	Removing the RAM
\.


--
-- TOC entry 5825 (class 0 OID 16736)
-- Dependencies: 280
-- Data for Name: facture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facture (facture_id, bon_de_livraison_id, digital_copy) FROM stdin;
\.


--
-- TOC entry 5826 (class 0 OID 16743)
-- Dependencies: 281
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
17	5	8	6	\N	2026-02-26 11:25:21.892116	\N		\N	\N	\N	\N	pending
\.


--
-- TOC entry 5827 (class 0 OID 16752)
-- Dependencies: 282
-- Data for Name: maintenance_inspection_leads_to_broken_item_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_inspection_leads_to_broken_item_report (maintenance_id, broken_item_report_id) FROM stdin;
\.


--
-- TOC entry 5828 (class 0 OID 16757)
-- Dependencies: 283
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
\.


--
-- TOC entry 5863 (class 0 OID 17883)
-- Dependencies: 318
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
\.


--
-- TOC entry 5829 (class 0 OID 16764)
-- Dependencies: 284
-- Data for Name: maintenance_typical_step; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_typical_step (maintenance_typical_step_id, estimated_cost, actual_cost, description, maintenance_type, operation_type) FROM stdin;
1	1000.00	700.00	Changing the thermal paste	Hardware	change
2	\N	\N	Unmounting the old RAM	Hardware	change
3	\N	\N	Adding a pen	Hardware	add
4	\N	\N	Removing a pen	Hardware	remove
\.


--
-- TOC entry 5830 (class 0 OID 16768)
-- Dependencies: 285
-- Data for Name: organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure (organizational_structure_id, structure_code, structure_name, structure_type, is_active) FROM stdin;
1	IT	Information Technology	Bureau	t
2	MNT	Maintenance	Section	t
\.


--
-- TOC entry 5831 (class 0 OID 16772)
-- Dependencies: 286
-- Data for Name: organizational_structure_relation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizational_structure_relation (organizational_structure_id, parent_organizational_structure_id, relation_id, relation_type) FROM stdin;
2	1	\N	
\.


--
-- TOC entry 5832 (class 0 OID 16777)
-- Dependencies: 287
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
1004	Chief	Tester	Male  	1980-01-01	t
1006	Stock	Responsible	Male  	1990-01-01	t
1007	Stock	Responsible	Male  	1990-01-01	t
1008	Asset	Responsible	Male  	1990-01-01	t
1001	Chief	User	Male  	1980-01-01	t
\.


--
-- TOC entry 5833 (class 0 OID 16786)
-- Dependencies: 288
-- Data for Name: person_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_assignment (assignment_id, position_id, person_id, assignment_start_date, assignment_end_date, employment_type) FROM stdin;
\.


--
-- TOC entry 5834 (class 0 OID 16792)
-- Dependencies: 289
-- Data for Name: person_reports_problem_on_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_asset (asset_id, person_id, report_id, report_datetime, owner_observation) FROM stdin;
1	9	2	2026-02-14 17:06:27.445859	Not working
\.


--
-- TOC entry 5835 (class 0 OID 16800)
-- Dependencies: 290
-- Data for Name: person_reports_problem_on_consumable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_consumable (person_id, consumable_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 5836 (class 0 OID 16808)
-- Dependencies: 291
-- Data for Name: person_reports_problem_on_stock_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_reports_problem_on_stock_item (person_id, stock_item_id, report_id, report_datetime, owner_observation) FROM stdin;
\.


--
-- TOC entry 5837 (class 0 OID 16816)
-- Dependencies: 292
-- Data for Name: person_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_role_mapping (role_id, person_id) FROM stdin;
1	1
2	6
3	7
3	8
4	10
98	1001
99	1002
99	1003
2	1004
100	1007
101	1008
\.


--
-- TOC entry 5838 (class 0 OID 16821)
-- Dependencies: 293
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
-- TOC entry 5839 (class 0 OID 16825)
-- Dependencies: 294
-- Data for Name: position; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."position" (position_id, position_code, position_label, description) FROM stdin;
1	HR	Human Resources Service Chief	
2	ITBC	IT Bureau Chief	
\.


--
-- TOC entry 5840 (class 0 OID 16829)
-- Dependencies: 295
-- Data for Name: receipt_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receipt_report (receipt_report_id, report_datetime, report_full_code, digital_copy) FROM stdin;
1	2026-02-23 18:32:51.676187	rerezrzerze	\N
2	2026-02-23 18:33:11.61638	testiiiiiiiiiiing	\\x255044462d312e360d25e2e3cfd30d0a31362030206f626a0d3c3c2f4c696e656172697a656420312f4c2031363738382f4f2031382f452031313539352f4e20312f542031363438342f48205b20343537203135325d3e3e0d656e646f626a0d2020202020202020202020202020202020200d0a32332030206f626a0d3c3c2f4465636f64655061726d733c3c2f436f6c756d6e7320342f507265646963746f722031323e3e2f46696c7465722f466c6174654465636f64652f49445b3c43393243453441423737383344453443383437394632333530414136313432463e3c31373837463243394333463833333437393245423031444533373044373942323e5d2f496e6465785b31362031315d2f496e666f203135203020522f4c656e6774682035342f507265762031363438352f526f6f74203137203020522f53697a652032372f547970652f585265662f575b31203220315d3e3e73747265616d0d0a68de62626410606062600a04120c538004e32e10711524360148a83e021257eb18981819168094303032fd67dcfa1f20c000af0c08e20d0a656e6473747265616d0d656e646f626a0d7374617274787265660d0a300d0a2525454f460d0a20202020202020200d0a32362030206f626a0d3c3c2f432037322f46696c7465722f466c6174654465636f64652f492039342f4c656e6774682036382f532033383e3e73747265616d0d0a68de626060606560608a650002ad300654c008c42c0c1c0d024862ac50ccc0b08b810fa86483e9520da61ca86a5d6f08cd7800ae9e8581c1de062aaa0910600031e4065a0d0a656e6473747265616d0d656e646f626a0d31372030206f626a0d3c3c2f4c616e6728feff00460052002d00460052292f4d61726b496e666f3c3c2f4d61726b656420747275653e3e2f4d657461646174612032203020522f506167654c61796f75742f4f6e65436f6c756d6e2f5061676573203134203020522f53747275637454726565526f6f742036203020522f547970652f436174616c6f673e3e0d656e646f626a0d31382030206f626a0d3c3c2f436f6e74656e7473203139203020522f43726f70426f785b302e3020302e30203631322e30203739322e305d2f4d65646961426f785b302e3020302e30203631322e30203739322e305d2f506172656e74203134203020522f5265736f75726365733c3c2f466f6e743c3c2f545430203235203020523e3e3e3e2f526f7461746520302f537472756374506172656e747320302f546162732f532f547970652f506167653e3e0d656e646f626a0d31392030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f4c656e677468203134333e3e73747265616d0d0a48891c4ecb0ac24010bbcf57e438036e7776b5b442e9a10f50a1e0616ee2c9ea412a8297febebb85404212423a237f45d3f8a93f0f50b46d37f4206fa608b017392d5423ec812c0eb01521c269ea26ae12b42e12d9876e7c7a2e5283177111fc95588277e20218ab1c93f313b7dfe20a3ccbdd2ea4db725e2d8b509559cec4107bd338a523a3d15f800100115522a50d0a656e6473747265616d0d656e646f626a0d32302030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f46697273742031322f4c656e677468203330352f4e20322f547970652f4f626a53746d3e3e73747265616d0d0a68de9c50514bc33018fc2b79546424f9dab41d8c42372d0a3264ab4e187b885d68036d5a920cdcbf374bebc64011e47b08b9bbdc7717081141c010408266339c9952288b28a1042f78ff2864555b14b118df8b819a40cc70def0caa00070de293b9f779fdb0923c47388d204bcc1ceb3396f6573bcc97adb99db01918d0004d42d5e7960c95b811759b15abedc799d47d7560b5bd678d9e996371eda0c714242f093e58d2c3355350211bcb6a27d4349888b632fbcf414574b67a6f1fbd8229c9234751de7dc8893e47ae5832abbbd5415de48952923cff75c6a631735d7df7d2fd608425fe2998f0a4aa7787df8b0a714853e081fa7e85e957466c27db2979f43ba5d7b5b9b2d90c0113f0d24d12fcc5f1393f89f2f59441183ebd7108d1c037f064178d9047497a65f020c00f9549d0a0d0a656e6473747265616d0d656e646f626a0d32312030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f4c656e67746820393631332f4c656e677468312031393539313e3e73747265616d0d0a48896496795c54d715c77fe79c3b13a2185070577c3330a0a282e0062a1a1477635250c1154410159420455c52b5b8444ddc6ada68da44d37ea26255dc13eb8269a28d8de69f9a1a11901904545c1195284cef8cc6c4f4becfbbf79c7397b9f37df79ddf03016882a510bc392636246c44dd0eb38e5cd17762724652a647ceb20a80fa018d55724eb661f94bf33380e740dd5f989a392363fc5a2f6fd7028057de8cf405a9f1d13507807679801c4a4b499a1ef069ed56c0e8ad07f44ad301cfa74d4ab49fa1fd80b48cecdce8c0e317b5bf11f06d973e3739e933af1d1f013df6008dbc339272333d967bebdf8f3aa1c71b73923252d4aeb1a3b45facf7b32873eebc6ce727080346c4bbfa33b352323357387db49f0bb017945a4c1b608287295c9dd723b63e6bf93c52b948b78da1d85594015ea5fb05cfcbe858c340219ad43f7d25affe14e0e1cbe106e813579f5c3045bb7ecd3d9a74ed22e809d5e8b1763db4f30a3c34901044e077b48496d14a5a439b68336da1ed544087e828155325dd2427b7e570eecd713c9e13782227731eafe54d7c968b4589a73493b6e22f1da597c4c87c59226be43dd920db659714c837aa8df257916a90729ada9b6ca6f5e6c6afd634bad7b8eeb5012d8bfc92fd56f87dec57677819cd0d3fc36a041add8c5023dc8834a28cc146a6b1c05862ac360a2d268b8fa5a5c5b0582d81966e96704b9c658a658b65a795ad66ab97b599b5b9b58db583b59335d8dacb3acc9a644df1677f6f7f4bc04c1b6c6cf3b479db7c6dad6cdb6dbb6ddfdabeb35504360df2094a0d5a12743df8e413ae7fea74bacf96815044629b9bc46a5aa7497c48db681f1d7093a8a01bf4985b71982611cbe35e2271862f09c4fc9c44a0f4d4243265a12cd724d6c946f9abe4cb7e39a7daaa00d5570d36b53105b849dc7f41629adf524d629be169f8182d0d4393e8ac49841911463f37896c4d62a9b1cd4da2c52f48c45ac65a36bc20d15493686df57b4122d13add4dc20848fc15897cdb3937096f37899ca0aae0134fc84542cee993d3c1757e1ab636d4b95a67ab9f4e5bc34a67305e9486dbeebaa0215f5f790d350db9dcfa590feda75df4a966b799329e459c93f4ddd719a9eb04a0be40cff379becac6069f1f43eac21e77a9adac1eee8a943d001c671d575db6e384e36fe5f1e5ca7149dba98e38475c590f875ec511e2e8a86b8ba3a923c1e1656f6b4fb04f04ecd5f63cfb427b96b6625db3ed71f6587d85ba578d2ad37b2855a53b4a77966e2dfd405f1b4aa944ffc3920b25c74a5a16b7b8f2555179512d602e30fbbbde15d2f985ac94ef7e97a64baaaed3658e7eae59ee4896644b8e7ec26bb4ad4f3c5e2ab254c736bd14d924db24df956ddc9eaee524a0f49ed44ad35333bf3cdff4d0a4df52b3db36ef351fffb9c77ce4177681bbae7e79aef9ea0beb86ebfeb9df5c61ae7ad6e2ff8af9fb5ff9df3edff70f52ae7ce4961aae56a9aeca579e4abddc50197255ee49a9dc9132b1ab6cf5b69a2715aa8be6d606ed604547446120866038c6211e139184699889e5588955588b3fe043ecc65e1cc4219c5490bb8ad42279a8aee03c2a5085db78408dc9937ca8050550100553770aa3481a4be3299e26510acda27774ce5a4e2b68bd34a83ee2540be4b25c53316a9a1aa65255840a519755281d525e6aa1dc57dd55b9eaa9e6cb1939ab8ad572d54daad435f99a0e2b6fd92bbb659f54a22918afa225bcd01cadd0013dd1095d74d67e0b23311a6f200033908d5948c7ef91a5e66a2dfa185bf011fe8cc35841c928c6055c8403452843396e12a1168fd1407ed48ada505bdca13e14437da93fc5d22095496f5126cda60c9aa3f3cd387a173e28d559fa3bf8e22adae3bace47d5b0e016fc700336dc4520eea137093ae321c2e1441f5208c6230c226fbc4eaf21869a613035c5306a8ea1e48bb1e48f58b26014b5461c5931865a620419184f8148a08ed40993a80ba650374ca6ae984a2148a45024533852a817a6534fea81348ac03bf406666b655d4ca3914771789712b0862662354dc07b3419eb2911eb682adea729f823a5e1039a81cd948a7c5a8c1db4005b291dbb68113ea35ceca48528a0653842ab7014a7b4ea9da64d28a48d341dfe08d2f9b79fd6a301aa35265067e4d0509d8fb3b007c7682da2c94b2bd518a4526fb4801dad710dcbe837d84049f813cdc4717a1f95f4266a705f95a922655715caa14ad4e7ea0b755c15aad3eaa43aaa8ea82fd529754c9de05bd28d6f4b88cecaedf88e84ca68e92e61122e57f8dfeaa03acce552c4d7b8822bf93adf101bdfe46a09962ed2d5ad760112249d74aeefccb512297df9213fe2c7d24ffa4b04df951e7c4f7af27de9c535d29b1f481fad0f438464a8b00c1391e15a39478849466ad5182551324006caeb5c27d1aa3dff2883f8093f95c112c3f5dcc04e3a4d5f6af53946762aa372baa6b5a894ae6a6d3e4767e93f544447b4427d4e5fd0292aa47fd257f4359da16fe8227d4f97e8bff4035da612ad6057c84155749d233892fb723f8ee6413c8487f2301ecea338dead681378124fe6244ee4a99ccab3399d07730c67707f4ee1e93c83d378264fd3ba378b47f308fd3d30856ef21caae6b9748b33e936bf4d77388beef23cbac7d9749f7f4b359c430f783ed5722e3de405f48817aa4a55a5aeab1beaa6aae6103ea0bf11f6a8bd6a9f2a50fbd56ef577fa178fe4503ec8ddf910fd83a3e8040fa4ff315ea5df6d1557fcced5c892970425a540fba079ea20955676ce694fdb93002711b6a5c47648e425c97b0e86a7cd4e08d9891db280b3908447d84acbd60265ebde320a5f6cba1cf21f74a7ed877eede929f0b587d5fdcd3cc9590eeda934ef69ee3af7deb9f7cee8377c1bcedf23e27d3e2a3ee063e243be5f7cc40f888f79567cc2c7714b39c184f398f9418ef169967c86e37c96dbf8214e70c8499cd4ed7c8e3bf811eee447b98b1fe325fc382fe5ab7082a7f8495ec6dfe6e5fc1dfe0c3fc557f3d3fc597e869fe06bf859be969fc3c9ff5dfe1c7f8f3fcfcfe33ef4025fcf2ff20dfc7dfe02bfc42bf86576f9154ef3abfc457e8d15ff806fe41f72867fc459fe317f897fc237f14fc5af782d7f997fc65fe19f738e7fc1ddfc3af7b0e695dc60c1a7e80951a1f3e224bd2e66a9214e500af7dbe5f477eaa03fe3e6f617dc51fe4a4be96fd4496f93a4dfe280f83d6e717fc03dee8fb83dfe8ebe8e63eb9b82e91691a01e7a1f77bb0f71a7f988be4a1fd34afa8046c40a2a891be880e8a783a248bbc41ada23f2b457dc46fb442fed166b6946aca7fbc4201d164374446ca04362809e177be845b18f5e1207e81571905e15d3f49a98a197c5bd342f429a130fd12fc539fab57834f66fd92597c8a45c2a3b64a76cc7ddefd6d83f63ff8abd137b4fde2e8b729ddc28c7a4277db94dde29eb32908372831c9135392437c93b6449f6ca61d92fb7c8b2accabbe466392eb7ca09398a3be4bb728dfc9a7c5c86f29c7c547e4b3e299f900fcb47e463f284dc2da7e44979549e96fbe50e392d0fca9df26ef9927c41be2873726dbcd77c69f9c29f16fe117b07bd9e16de6b3d9f3cb7f06efc5a44dac274948ed32e7c67a886af991fa6bd344da354a783e8fe53e0d889f7019c056fe3641ba7fd34068e293a02eed3b41d12d378ef037c8a02da034d4770828ce224341acae0bc07d469683f663519fe11403b403d099d9ba1b306ec7e9c3d5b69021cfbf283cf3ef3f453674e3f78eae489e3b30fdc7fece891c3f71d9a993e78ef81fdfbf6eed9bdeb9e9d77efd83e3559af552be5e0ae3b27eed836ee7b5bb76c1e1b1d2e6dda78fb86a1c181f5eb8a37ad4875b4778b4667479feaab77f47453a3a313d3ce9e6ea1dbfa74c222f5a69cabf3c35e7a68c42bf43be9b4efa8b4ce6b992998a75c0bab2d820f1590822c540c8daaa1e171cf2d8481250233761914d1572dd29a33cd7d639e2ee6005d02afb3f022b8fe0af2408bac5c4da530ac352896013eef34849dc4fb1ef6e189af7425a7d2caab83b791a4aef458d08759576b26dc75d0e8cea5a882a7ba55cd89e66cdcd36e30e9af07377146db313a47df5087a279a0ddaaebeab68caa94bc30ad45a09c263ce22162a2ec846995767d7f6ee1c2f5865ba5a18ba9b7a1c4d9e1465e9c1d1df7e653f8977676cc3b8f1ed017f4fa8d1b41f3e65da2bcc5b2c11aa4015c03d090c0ce9c474f33fcce7c9e68d652a54558b80a2f2c2ed9c209aace71844b450b65ed4279dc7baa7332a2e45bdc12b864849b8db86f6a7227414919ca9bc4683896187d1025ec4cbe239e4fe6dbf35de8afd80b833a0fcc9be06d17f4469758229c06748e58f49c986db4e79d79ab69a4c9390b4e839b5dc4c172c3768922ac1739bef9a2079bc7bd37ba08faed1b1cbde6d3d35d68f0c69cba98d6c31e76afd0101b730152db80b14cc1455aebfca867780307398feceeefe936d9e57aaaee28bf71f5d5e1de422395ea1b0afb90c8c8359b608d725b36c88551ca994453a99b91a6b1cc40551503b028940dc60050d52d6ea02b410e5337550c8b262bca869bae69702cd3103283aebc06716bebd21daadeab3b55ef22652dad8d286d869250bd5a5c1345bda00aee753bc2aaaa2003f3256fca99f4cbd0adf3aaaca5ea751a927a512fd709b85468d0c61c7c1b420e6eca95b6a1484d30dc30ec771b79992d57cb06ee4fa3eec32649f5f7fb974814dc50e7cbd5001c05df32a312812ca8b25b4394e12e2237aa301d1f373263e35ed85553358508e7f361196e3b6ed57742bf6a230e7998463dddf18bdda9d99cd8d47ca63a89d79c4b9540552284a9ce2b7153572226c175294e0d9ae5ecafb0bfe1a02ad4c0619e724dc7907169b7e647294325db37fe2b93b884c9c59e5ae561ea9616249a10008c504f5d0e6e5f048be60910b59551ae68993599e7a5f5dd8ebec7cf2db294f56cc50ddd94ba599997155e679e40c73199ad964d736a33b907c42010ae57412e436131085b190731995d5c49efce5da6122d558c6169ce1877f46cc90d7c37088045f5a41d57c7f1eb4e964d7299b65b8afc29a1f7e3a71c8e42964c01393a811360b25c5769746b6d8a368abeb151c23a1af5343961a8422d6062a60866a8cfeab6ec80f9c1d89b53e53a36d1ace796eb56b608736d748c36a7a0d23e5838636389c0a15b54ccab1a221bf504aa2d9e59162e0fddd521bad6041aaecc56b7043816dc945b74ed569791c926080306f2a128626ccf1846c8db91d5bb728d8944e622c68e3db9883969b5c2b2114f975a2c093b30d997d37ced2a108df36204fd43da8d32c18b670610de3cb2ca31d2aee631afb93d567ec0883aad0d8bc480b16dd71c8be996bd9d91bdd1a26d7674d9d19ed1c90c365a4bd8109113c69d8b4980398c8e6462d6dcc801ccb194dba458478226203375eb53741cbaa67de2a25056e671e616de2aa14706ca3cbe6f964fda858c84551d468a4db8da0cf1d342d15c291a9d660c58172e4577d891b0361b5ae452fcf2c037a337bff01645914b373f26678c97679a55d9acbbbaa3b7fbb95a24d5d6ece02e3a2a3a7775d8de36b6a11a543a813e06f75155ae1ecde110b1be9d89a23a1875079395a2a8a8881c6a4ef02756935a2fcc8b505a6abd66808b33759e4924d52af3d3ae56e12f4202ddde34a3d4922e34fab01ad4a2831a51a655ceade66ad46637baddeeedb4694d635edc91be4d99ac9ec935b3387a4fe716e933a62613ad48260d2d5c24c6adba992837b2cdf7742ef9a95261f2ff5b2cd9dc4ddd6e69a61b6593ff7ba958b44183d1760d72a47930ea13c066ab61685a5b6362a9a9d0aeec32e097c3b4d5307275d34ac4e6284c2999a593166341945bc298136d5ba6138414782f44a9dd09620ad65c70222e8cf985059aceb5b8a320c0ee8e4c94e74d72533acace999c8f59f13fb4576b7053c7153ef7295932b6253f7899225b462e18b091b0ccab8c8b1b48200d60330c860cb60bb8c8f69460420910f31c374421210162482810670830644a04253c321d778694b694471a527eb44303c4054a3a858499a694c856bfb3f7cac842b8f0a31e7fda7b77cf3d7bf6ec9eef9c6554436422c38c24bb19a5c971ac6faa37f634a9fba0bb4b19277a7797467e3b2425a30656fb6b98d1e34a83bbc6087f7a602ade83630e49168f29a0b1803c684c30688ff23fd3ff0914a0248a4baa0cc677849ab01fd8eb5e8947acf1bdbd44b7b9cbbdba5aee34c3c15616b29771fdc2b929890fc070ec6fd3299373443911e318d1c5a118dbdb877d6f8952c2a282e8b751bfd58a9036bf8deb9d31ab09bdeca9539c4942125acd93c3e8cfae13b3f1195f546016ba4dbcbbeb84ba75052e5700755699846a0b8932c0a9cac5d2568f20b9200a9e404d8de021718de9835aaa9cab63dc00dc692e691c8d332e436ef39e811ca00e9a35aeffe84adc2b8e476e66571a542523c90333822e579a0343419713178d50b370af39e6167dc8e2bac794e2153423380d39b63e590e4ea98013f846661bd5dfc6b7bce8056b7b414fc32efe1e2c15aa72bf90c3ae08cd742f47b150e60eb95ccf8212d13929bb3218443a0dbaf926357396f1cb43d2d06cae0cb88a3165fb67e38e76ff35399b8f5bcdf1c82fb3f9bad435dbcae86c8d988d1f82d1e942f312cec6a74c9a639c35fc0bf30ff9c96dccaf7acc4983cf0667e37e98131ac0139b76e03525bb52688025dbd912302dfe9453da64522895d269181596f61bd2dbd52f5fcb536d19019b9a96367c405e7aba243792b5910a0abc69bff53a7cf82970387b8f2e1ab1d891e31894eb291ee9f779b33233742dc7912379fc257e7ff1488f3b57cf7447472cba6e514e75f6cd2b2acacbf37a3bbfaf8c0f9f9416a863c78ef197cf9c51f5dcbb6bd7ed98565692ab6a93ef1dbd5c989757c8f8b97a32fc4d79fdb0a193fc63a7ce9ad6b4e1c5fa69f347164c29265cff42287bbed126909dfa96262b361be930d42a2cf516781da30b7d452396387cb0d1e770e3377444be72f870874b9bd071462ebed7262feed8845b1ad5456e2997a0c749036940695a8aadb11735f6b35b2d8de96964676d5efe2f281af144ae8717cb6beacd4af3753ddfeb2f7178c46233b2a45bcb0e562d38deb4f0edc27dbb9246eef961fd6b4307372f687e69b5b3b17ddfdecf17cf79464ebed7f6daa4ca97174c929695d7b77df0619b69c159e532f5a31c5890d23f8b525369201b60cc2f56e31cedeb66017b35e73bb20f06f8526429471821fb779ff951d5c72dbffb42963b264b63d7049e5ba5bca7cc3fd2592367281b96af78c5d97c6dd39bed6bbeba9a3a38a96a777560de8fdf9c2e576e787d133cda02b77e0d4f2453ca518d1a6d6413b3178da8e169b1e28c2c9f2f533ab16cd5f0bd8595c3a6bc3a4fb584a539d51bc41abe5249b98a933490d28ef581f16951e3bb99cd76b3d7f888b0c5ecb72cb968d3d9fafab39b367fb268d1279b1bd68c1ab5a621b0d2ef5f99b6fcea8edded2b56b4efde71757973d5beba86033535071aeaf655f10968c5f66d50fe422994596a4f52744ba3a4370aa37156bd62f77b63525f26cf6371b4eed4076f5e9ad1fba99f94bb94f37b9fae7dcb5336b463066bb21369c795f358f9c0d234bba22b64b56a1ab4457d80736f9cf91ac9979eceff925b51a4099da70fdeb879e29fd7f6749e0eddbea59c0fdf529ce1db8a23ec55fa866f40f39ace2fa5f7e80e39c8798c24c9ae6a4e71a4a0b0684445bedf5fd23b2682f40343c6cc4ab28f9a3c7954c993658b3bbf9cdb6f6ea9eda9e29249cf4caf7aa51afab0647953d8e76eaa4a1df72fb25b3988e9af7b96dee3f68b85dee2b0d4712e69a93503af3af685fff095657dc7af896c9eb074f70e46a9fb9f86e044341d23ebff0b966591cb0cf52285b48de4d482d490104d186f824506c4b3ee23a7ba84423d60f4ff1837f006cd559fa7003f6b07a9415d4be5aa17fd5e92b5f7317722ec87ec7ed88b56ce84ecaf8c56ce8cdc02ae0061bcb71a885c42bb07ed7fd00e437b43de4b8318ea467c6b42892404e9e5986b6f0fb8047b1e137a6e6274930b526decbb75257cb30bb6ee32e654ff8ce758bc444f3f0cda6cace54fe48c87b68476f704dd9a188964d50f70a68692959f2d6e92e3a136508a3a1de739119e8f7b77517e2c14078d7a54a8a554f718901e475e3f69406da256011f9e13e145a0ce6c19dbcdb6a42744eef63c6e40f93755c9b648a7f95ecf4096ca9703e452aed013ca21d40fdcc6410dc0de00e5722bdda48d00b72dd2cdc8df81b37826b31f889c42fbaa7241bcbb8154f45d00fe66e2ac728d5a6381d86a01369b6d8bfca46849ff4ccc6be05ca4adeb391675a6bf1e84e5a163cb1f8258199f68679ba8b3e4c5ec1df643fe05ec36500bbcacb453edc3a056603dc3c925b73c08f505dad6234e3f040964955d38ff5b699bf61bb2c7430952128f2782ba2aae6f2dfd201618af7b44381f45cea21ae83ae3f1b800bf949b5885b3f93afd54594415ca16aa10f9073987a11c7d00a469e0b899e488cd13fa3fc0216f507937eefdc37dfed64ac921b87abfc9c95b4dae44fe62ae53ab3127a05da6a9cc459a0ede3a4121cb546029e4b61af6e833846ea7e5f7e4b0bc6bf0aac8819ba9c1cc3161ce1dda75c86c17dc5b2a9eeba9599b4829963a7c3f1eb9d58df60e4996cf213387ca7537ad16bc7d15760049123558261a6b52af77ad83b40078f91cec584f21eb08e8808dda79230f8b754439f2434ad177407628d6a10b1cd23f42bc016ca7f017f46af3c9217c7206809cbe18f3c4e4ff68de65447dcc3938617e830fa27e14be647df0977231f2adba10fcce7e851cf3bdb614b2edb093f7a00a7b89fca0dda699ecbf07f8ba1eb229e011250ebdc0574588d52d58770c076aa7237795eb34457d1b63511cb9cf45d099851b54abda6c72cbe2fb7cad8cc7593463449b8b77c4945a45abc0d1adfa3ee08f9083bc729b5ab50a3cbf4f2eed1a65e943d0c73c6072bcc99361e643e655bd18b212d68367c42ae1fb743d1d7d0ae66983ae4191bbfa45e8f888a6683b11eb6c17aa3c86e510f28acd5c9317325f8b75e4aa9f2276c04f5a03ecda0a5d6f013b8df963d7a17c4c4938072ef5675807af8539f50a745f31ce02fb0b71d88a7398257cb21b809cb640f8aa2bb7c5e694a88f39b774f9388e5bbbf10febabe07dc377ef80a7d8afe001e62df5bb90d720c37b30995ab0b65a31c673b4437f2cfff11eb23eac41e48e77681bda6dfab700fbb85ef89ee2b948d47326af308fa8c769ace00ed40f514e10b522c719ce62b4ae53d75120962fb01ff9d1388b728588ddcbb099f52f89acd6f64756e31c239e2387d5e91155bb1c39cce79abf51a643472d8d8dc68efa19c0f52cfbe053f289f9ab617f7544e556c8983c256cda88bacfa8bb6b2d5ed455c7682af3a1ba0367036bd2d641fe7ba8df387eb644f68b185a0fdd73e157f65bdd7fd9affa1829ce32feecc7ed514aabc186da403b2f573eeeb8bb5d3e0af4680b5c0f0e81e37ade61a185c2cdceccee0eecce2c33b35cce844a526968f1e30f5a8cdab4544d5b4a5163d26893365463fc8418939aa68a1f51ffd056fdc7584d63197fcf33b3b7cbf1611b89d1e4eecd6fdfe77dde679eeff79db9e81b21b5950ce903936ac9594d793d18cdf0d3903abe80be3980fd32e82fe3d922d687f0fee1b3f155f8875ecd14e911d6919c15be05fc96f727001dbccf3eb05db6993c07bb043d5f98f48dc4be7d1138011fdec4faafc8c7b3a8137c673fd9a6f8c33cf8149db3f0f7a9eba3f7b69ce903348ffb01760ee37dff747a2615d30bf17e33a1f710dd91fc319d9bbe00f9eaa751e055e001200fdc0eec8ef93c9bf15ea5e53ceef8ab88f4767ca37d9366a7fbf0aeeba341b1bd81b6a577d2aed44fe9e6f46af8b083eec5bde6267f456b21bf4f7cdc4e774df8388cb96fc2c7f71a0bcf6f027a2cb7e25272c96fd112601c580eac00e6002b63fe226059bcf79ee412f3ce7f3b7323ead20a3c46cb5b4e61be9356b4fc235a032b8039f17a652cc7bc9578772ebadafed025ffc273c0f6683e7f9a39e8474a1c8f90dc8cff113be860f27bb45fb011eb8d58c773e608e6ed740a72cfe04e1f66f05eea3bf44cea39e4be874ea5e7803f40cbf9dca0fe370a5e2283c1bcd69d119816991fd15e467d0ffa3f096c4aeea056603370389e0f5d920f7f534f014fd2219eb13e2431604e8dd0fd8cc45f2224ff460f27be460f5fc4b7299d3e4b9b412f61c839eda75f66de91791e7ad2c3bca3d5c537743fbdd6f28ef49297211a65a0df8f6616d22ecca3adedb8b7e6e3b98fd300f252e0b3903a8d7b9ecfc4329add9ac23dfd27ea497c9d1e4efe1ae8a0338cd457b0ff03fa05cf996374601aee7079e6386c7d9e96e33e9dcbe714be8c600e648e681b1804bd671a7f6bf4d30db89336639d946fc39fe1ae3c0e38f8ae29c839dc06acc67e0edf974fb52cc3fdf129ba35f3bcc47403f8b3f86c4dbb4fee8f5d994e7ab6e5cff0a39f86003ed75bf13f049fa305a9bf271e447d6f02bd2fd549a3a9cec4dd4c37e195496b860f6c00fae3f5fc184c3fdef2066c7c965e647df2bee1fbfeb1e89dd4f2207c3c28efe021c81ccb3c41a3d7f4b0df891750bf2781d7809df1fc74f3ba7519e67511dec73d765a7afbd3d4c37506fd1cf07c9ac2b7d39478399aeb74e265a277f701f7e034cdc6d17a379aeb74782cbd27f1bbf48be12730cf007f21700680eac4ebc01a747f1fe6eb806b810ec0026602f3017c5125be0f3d5f023e07fa87c0a3c011e86f8bce37ef4fe86d057e13e9157d8c9b26e9fc09d00b98f069217006c800af036b80eb806b810ec0026602f381478123b8b7cae9c3f8f6e0ef7e7887ef7e99b94f10f2871af86708bc0d24e2f92ddc3f6f208e57e4ddddf41d13f9c9cfd01faef43c6cbc0499ddff43e3a1a97155c7771b2331edbf3a165c718cfe07e3d0551ddf981a53636a4c8dffdbf1f3a93135aed6207c1db6b4d2abf441aad2344a62ce8195480e7ce021ac41d20c3a2633fe52b7f3077344d20cac223a0d7a5d4c67400fc5742bf5a476423291be061bd5d4e3319da00f4f6f89e9245d3ffde6984e81df19d369d07d319d01bd23a65bc99bee9f504b172fbd4d6db10dcff5dd42a0fa5cafea7a7a60bb4e56f596cb6ad82e96025f0d5bbee5edb7ccacda5ab254db5ecb73da54a0e7cb96720b2a28d9be2ab84ea0c6745f99d67eabec562d53d98eaaea5ea06abeed1495aefca0668eabfcb8ea754cef33aabf66947ce53a78de529e55b6f6eb8e210a593f3f52d56dcf57eda520a8faab72b9a21d946af9ace156723a3458dd05d6908ba5bb453a972fbbf95c45f703cbcb0d6cec5b3f38b23e5b313bb288ad3aee7138087a494fb30f5935647915dbf711b6422825cbb3e065d1d39dc032bb54c1b3c42da3a47b45ab4b05aed29d7155b53c1f0fb8f940b79d284203362632c2191dd33d0bc2a6d27ddf356c1dfa94e91ab58ae504926655b0cb1662e41cb48dc44fb4758811d3d2cb9c44deab6fa93124c1ad0548981f78b6c13aba2064946b26fb50df2edb153bb620e98dea08a5351f11b09f5daae29a7681674bc2aad6f265db2f7529d366d5f95a00a6cf4cc372f829c491733de55b680c68b0e1b7c4daf04e64d84a95131ac42912bb6325b7726124dc343594ce2f59f28ce9226562718f6504cc61f1825b2ebb631c9ae13aa6cd11f9aba40df5bcbbdf9250a2b23a6e004f230f38ffd54651e32dbfa4c3f5bc15e72b6a51bd291a8fadfb01ea6e23f5380a626e7294d9bedeadc383439dbdd5c0f52f47cb0fc7a8abc0d34daba27b7beb8a1a07aee8b9b5aaf4965ba9ea0e9cc8d20952b4941603b781da423619e4914b3e50a000bc3e501e2e1afed5c1b1413994c54e2f9531140d8357a412f67c5959982d48efc7af29925bb16b616ea3bdb2e3805290d7290f0dbcc3d69853822ed652102b6c7f0c52cc3121c71acbd8a98a66055907bf554878225b8324f38aa075c007b706c971d079f9edc5ae09e93f82eec79e018bbed87762fbec8d2776d89e0ebed1e461ddffba15b66d83c33ada250701783eada21c46117bacb306eb59e871a902ae1efb60513774d67dc84dd2dddda43b277972f19b83065de262d91c0dd04654683d0dd2087eb3d835a94372de27791a8754bd3a51a59750cf65f3c0cf0d89e68ad4c18fabade2aa9464cf8a7359948e70c41793baa46abcdbc8166be5da14c1eb92fcba5219479eaf8a363fb6c0d10512b173410d8d388e8b7ba4dea36362c38a359b32fbb26b40528ffde30e624e0db159e275a39bd9735b2a1ed53198e8d7914936da90dd4624dc93ba9c01fb82fe99fc147771d4092eec07718771153d3971753fba624d067472dfd6f330f9e932d615e135c7d0e8dee6f318795a9333d9d5944fa62ba0d94a61626d3555ab2a7d5b966c9784630a1d799d175f22497f42d290dcd66d45f5c8c9dda1841bdd18910f769cef465d2f95bbaea6ba46b154273a3498d4458d78c7245b952bd6a47ed3d4e253e78b64c38e29bfacb911e31e4818623792a96be7fbaa2c67746ca26a86f8648a9f76ecdfaaa6db906f3f57eeb446559a4fab035e10e7b43907f5fe6fe4a1f9a45ef8942f2730ca7a3e8ebad15fcdb7a87e99da7813b1fbd26f8e688fba3e7a2b34a2fb77b5cce256ea45fcc3b8af86a8137455f2e8cb5ba3082b6591bc9cd4fbe537a87ab575f18eef2d8ebe22d6f65ee4f7a5de834559d7a0b171bb718755252751beb2f8e095bff009dcb597f85b1bee5e1c6abb9684da03394fdb993baaedc885dafdd950bb2f7b56dbde156adbba43eddeeeb3dac73a436d6bc7266da423d4861785da47179dd4863a94764ffb7a6db0fda4b6a53dd4061686dae605a1b66941a7b6715e51fbc8bcb3da8679a1d63f3fd4d6cf3fa9adbb35d4fada42edeeb967b5deb9a1b676ee496d8d3aabad56a176973aaadda972da1db778daaa5bc27f5149363b0903411cdfb6502a22568c85962ea328075c347e515d94a4c1632f7cb8499712af7aee137831e102e13dbc144ffa103c53dd4a359af9c86fe63fc91c6680420c37f002d7380407c7d0c62bb8b2577069c77061bfc1f95908a7ad2e9cb442386e3e4243ec3ab2aae6e4b0ee425db1ccc981d585fd3b01507b825ab3624c703906db88a1da363b41c5313a81e5f6132e27bc67de1acfe35d5a623b546725aef32d5a60592ab38c8802df768a6c93e6598eaaacc8f35ce5886f508d2942d5b8cc75a4b86e56fa9416e881781fb978e8455a3f88a469d41825d91d8c23751a21360efca524cdf9eb6c8670cf8b1623ff5d1c0af7f85296ef07fe32a3cc794f7c0e2104a5f68d694d88f4c79088c41159c35a4fc753fe2dc8cf68daffa754be04180055cbb7000d0a656e6473747265616d0d656e646f626a0d32322030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f4c656e677468203237313e3e73747265616d0d0a48895c91cd6ac3300cc7ef7e0a1ddb43711ada7403131819851cf6c1b23d40622b9961b18de31cf2f693edd2c10cb67e42fa5b92cd9bf6b9353a007ff756761860d446795cecea25c2809336ec5882d232dcbc74cab9778c93b8db9680736b46cb8400fe41c125f80d764fca0eb867fccd2bf4da4cb0fb6aba3df06e75ee076734010aa86b5038d2452fbd7bed67049e648756515c87ed409abf8ccfcd2194c93fe666a455b8b85ea2efcd844c14b46a10575a3543a3fec51fb36a18e577ef9928636e5190216e3237c4a787c46498a84e89c9109f339f23e7fc2ae657d7cc54535ccac464882f992fa9975bd5d8153d1edc4796abf7346d7ae134661c501bbc7f82b30e481537fb156000c0a7822c0d0a656e6473747265616d0d656e646f626a0d312030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f46697273742035302f4c656e677468203335342f4e20382f547970652f4f626a53746d3e3e73747265616d0d0a68de4c51cb6ec23010fc953dc2a1dd38443c2a1489a754d1d228a127d4830926b10ab6e53812fc7dd721845e62cdec6676767608018c8005218c8145114c800d0784613009813188820058085144e400a21183e91437f44b00296ef9455486e7a2da5391981f4cb815caedac1024e87b9ec4565cdd46dc8061aacfe2931b1ae63b7637233073b6ce9bb6546b17c7cd141adc8cc9e02e8f090c9b37c3a5ceeb0b09379ddbfa52ed03efda7b68a89952da7127b5c2cc708533ebe489e70e139ccbc359eac27253de3c5829676fb828b975b896456d052e25a7faa583569b05370fb852471217b8f59f35d97da27775964a6425a795daeeafda79ee6e83d694bf42d7ae85f5a1caad341d34c2fe277614d95c5fbd7bfc5647613ba538ded375fcba4d52017e7055f4d6e9cb3aed534c6d7249016cdc26963c42656d94a3b69089bc8d31eb95ce99374459e9576d0b34c7538855a5faf72375f78ee33f0106002f1eafb40d0a656e6473747265616d0d656e646f626a0d322030206f626a0d3c3c2f4c656e67746820333932362f537562747970652f584d4c2f547970652f4d657461646174613e3e73747265616d0d0a3c3f787061636b657420626567696e3d22efbbbf222069643d2257354d304d7043656869487a7265537a4e54637a6b633964223f3e0a3c783a786d706d65746120786d6c6e733a783d2261646f62653a6e733a6d6574612f2220783a786d70746b3d2241646f626520584d5020436f726520392e312d633030312037392e363735643066372c20323032332f30362f31312d31393a32313a31362020202020202020223e0a2020203c7264663a52444620786d6c6e733a7264663d22687474703a2f2f7777772e77332e6f72672f313939392f30322f32322d7264662d73796e7461782d6e7323223e0a2020202020203c7264663a4465736372697074696f6e207264663a61626f75743d22220a202020202020202020202020786d6c6e733a786d703d22687474703a2f2f6e732e61646f62652e636f6d2f7861702f312e302f220a202020202020202020202020786d6c6e733a786d704d4d3d22687474703a2f2f6e732e61646f62652e636f6d2f7861702f312e302f6d6d2f220a202020202020202020202020786d6c6e733a64633d22687474703a2f2f7075726c2e6f72672f64632f656c656d656e74732f312e312f220a202020202020202020202020786d6c6e733a7064663d22687474703a2f2f6e732e61646f62652e636f6d2f7064662f312e332f220a202020202020202020202020786d6c6e733a706466783d22687474703a2f2f6e732e61646f62652e636f6d2f706466782f312e332f223e0a2020202020202020203c786d703a4d6f64696679446174653e323032362d30322d32335431393a33323a34332b30313a30303c2f786d703a4d6f64696679446174653e0a2020202020202020203c786d703a437265617465446174653e323032362d30322d32335431393a33323a33302b30313a30303c2f786d703a437265617465446174653e0a2020202020202020203c786d703a4d65746164617461446174653e323032362d30322d32335431393a33323a34332b30313a30303c2f786d703a4d65746164617461446174653e0a2020202020202020203c786d703a43726561746f72546f6f6c3e4163726f626174205044464d616b657220323520666f7220576f72643c2f786d703a43726561746f72546f6f6c3e0a2020202020202020203c786d704d4d3a446f63756d656e7449443e757569643a62366233326335362d396665612d343234332d623961632d3632376135626135383031393c2f786d704d4d3a446f63756d656e7449443e0a2020202020202020203c786d704d4d3a496e7374616e636549443e757569643a32353131336539312d333365622d343962332d393163612d6535386537633133636261623c2f786d704d4d3a496e7374616e636549443e0a2020202020202020203c786d704d4d3a7375626a6563743e0a2020202020202020202020203c7264663a5365713e0a2020202020202020202020202020203c7264663a6c693e323c2f7264663a6c693e0a2020202020202020202020203c2f7264663a5365713e0a2020202020202020203c2f786d704d4d3a7375626a6563743e0a2020202020202020203c64633a666f726d61743e6170706c69636174696f6e2f7064663c2f64633a666f726d61743e0a2020202020202020203c64633a7469746c653e0a2020202020202020202020203c7264663a416c743e0a2020202020202020202020202020203c7264663a6c6920786d6c3a6c616e673d22782d64656661756c74222f3e0a2020202020202020202020203c2f7264663a416c743e0a2020202020202020203c2f64633a7469746c653e0a2020202020202020203c64633a6465736372697074696f6e3e0a2020202020202020202020203c7264663a416c743e0a2020202020202020202020202020203c7264663a6c6920786d6c3a6c616e673d22782d64656661756c74222f3e0a2020202020202020202020203c2f7264663a416c743e0a2020202020202020203c2f64633a6465736372697074696f6e3e0a2020202020202020203c64633a63726561746f723e0a2020202020202020202020203c7264663a5365713e0a2020202020202020202020202020203c7264663a6c693e426168616120456464696e65205a414f55493c2f7264663a6c693e0a2020202020202020202020203c2f7264663a5365713e0a2020202020202020203c2f64633a63726561746f723e0a2020202020202020203c7064663a50726f64756365723e41646f626520504446204c6962726172792032352e312e32303c2f7064663a50726f64756365723e0a2020202020202020203c7064663a4b6579776f7264732f3e0a2020202020202020203c706466783a536f757263654d6f6469666965643e443a32303236303232333138333231383c2f706466783a536f757263654d6f6469666965643e0a2020202020202020203c706466783a436f6d70616e792f3e0a2020202020202020203c706466783a436f6d6d656e74732f3e0a2020202020203c2f7264663a4465736372697074696f6e3e0a2020203c2f7264663a5244463e0a3c2f783a786d706d6574613e0a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020200a2020202020202020202020202020202020202020202020202020200a3c3f787061636b657420656e643d2277223f3e0d0a656e6473747265616d0d656e646f626a0d332030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f466972737420352f4c656e6774682035302f4e20312f547970652f4f626a53746d3e3e73747265616d0d0a68de3234513050b0b1d177ce2fcd2b5130d4f7ce4c298e36b4000a06c5ea875416a4ea0724a6a716dbd901041800e7a60be00d0a656e6473747265616d0d656e646f626a0d342030206f626a0d3c3c2f46696c7465722f466c6174654465636f64652f466972737420352f4c656e677468203230342f4e20312f547970652f4f626a53746d3e3e73747265616d0d0a68de6ccd4d6bc24010c6f1af3237130a665faa5809426c2a942a15b408de26d911b7ad19996e907c7b37458a87defe8787dfa347a020cfb3a20d4796648e47447871ce3704fbe2fde335cd9ef974a226fc24bf79c6a6eb4b0883e7a6c440493935ca8c9531563f5963d583d203a506b755648b5ab8c200eb72b1c22f12302338b0c08ec5a5d91b759718fdc18add3fe2a3fd13d7c2aead29928e2bea4158fa4a50ba680ef5d0a834db702b3545ca1f3cb97b6b628d9ec4415b7d521de2dfd6876f4ad2d9ec2ac000c1e34daa0d0a656e6473747265616d0d656e646f626a0d352030206f626a0d3c3c2f4465636f64655061726d733c3c2f436f6c756d6e7320342f507265646963746f722031323e3e2f46696c7465722f466c6174654465636f64652f49445b3c43393243453441423737383344453443383437394632333530414136313432463e3c31373837463243394333463833333437393245423031444533373044373942323e5d2f496e666f203135203020522f4c656e6774682034392f526f6f74203137203020522f53697a652031362f547970652f585265662f575b31203220315d3e3e73747265616d0d0a68de6262000226465d6f062606a60340827f319060ec03119a40890373802c0606468204d34f20c1c800106000f59c05270d0a656e6473747265616d0d656e646f626a0d7374617274787265660d0a3131360d0a2525454f460d0a
\.


--
-- TOC entry 5841 (class 0 OID 16835)
-- Dependencies: 296
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
-- TOC entry 5842 (class 0 OID 16839)
-- Dependencies: 297
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
-- TOC entry 5843 (class 0 OID 16843)
-- Dependencies: 298
-- Data for Name: room_belongs_to_organizational_structure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_belongs_to_organizational_structure (organizational_structure_id, room_id) FROM stdin;
\.


--
-- TOC entry 5844 (class 0 OID 16848)
-- Dependencies: 299
-- Data for Name: room_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_type (room_type_id, room_type_label, room_type_code) FROM stdin;
1	Teaching Room	TR
2	Maintenance Room	MR
3	Storage Room	SR
4	External Maintenance Center	XMC
\.


--
-- TOC entry 5846 (class 0 OID 16855)
-- Dependencies: 301
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
\.


--
-- TOC entry 5847 (class 0 OID 16860)
-- Dependencies: 302
-- Data for Name: stock_item_attribute_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_definition (stock_item_attribute_definition_id, unit, description, data_type) FROM stdin;
1	\N	Number of Clicks	number
2	mm	Length	number
\.


--
-- TOC entry 5848 (class 0 OID 16864)
-- Dependencies: 303
-- Data for Name: stock_item_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_attribute_value (stock_item_attribute_definition_id, stock_item_id, value_string, value_bool, value_date, value_number) FROM stdin;
1	1	\N	f	\N	900000.000000
1	2	\N	f	\N	1200000.000000
1	3	\N	f	\N	1200000.000000
2	3	\N	f	\N	150.000000
\.


--
-- TOC entry 5849 (class 0 OID 16871)
-- Dependencies: 304
-- Data for Name: stock_item_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_brand (stock_item_brand_id, brand_name, brand_code, is_active) FROM stdin;
1	ASA	ASA	t
\.


--
-- TOC entry 5850 (class 0 OID 16875)
-- Dependencies: 305
-- Data for Name: stock_item_condition_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_condition_history (stock_item_condition_history_id, stock_item_id, condition_id, notes, cosmetic_issues, functional_issues, recommendation, created_at) FROM stdin;
\.


--
-- TOC entry 5851 (class 0 OID 16883)
-- Dependencies: 306
-- Data for Name: stock_item_is_assigned_to_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_assigned_to_person (stock_item_id, person_id, assigned_by_person_id, assignment_id, start_datetime, end_datetime, condition_on_assignment, is_active, is_confirmed_by_exploitation_chief_id) FROM stdin;
1	9	10	1	2026-02-24 18:35:00	2026-02-24 18:36:03.552901	Good	f	\N
1	9	10	2	2026-02-24 18:37:00	2026-02-24 18:44:53.614377	Good	f	\N
1	9	10	3	2026-02-24 18:52:00	\N	Good	t	\N
\.


--
-- TOC entry 5852 (class 0 OID 16894)
-- Dependencies: 307
-- Data for Name: stock_item_is_compatible_with_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_is_compatible_with_asset (stock_item_model_id, asset_model_id) FROM stdin;
\.


--
-- TOC entry 5853 (class 0 OID 16899)
-- Dependencies: 308
-- Data for Name: stock_item_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model (stock_item_model_id, stock_item_type_id, stock_item_brand_id, model_name, model_code, release_year, discontinued_year, is_active, notes, warranty_expiry_in_months) FROM stdin;
1	1	1	M1	M1	2020	\N	t		12
\.


--
-- TOC entry 5854 (class 0 OID 16905)
-- Dependencies: 309
-- Data for Name: stock_item_model_attribute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_attribute_value (stock_item_attribute_definition_id, stock_item_model_id, value_bool, value_string, value_date, value_number) FROM stdin;
1	1	f	\N	\N	1200000.000000
2	1	f	\N	\N	150.000000
\.


--
-- TOC entry 5855 (class 0 OID 16912)
-- Dependencies: 310
-- Data for Name: stock_item_model_is_found_in_bdc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_model_is_found_in_bdc (stock_item_model_id, bon_de_commande_id, quantity_ordered, quantity_received, quantity_invoiced, unit_price) FROM stdin;
\.


--
-- TOC entry 5856 (class 0 OID 16917)
-- Dependencies: 311
-- Data for Name: stock_item_movement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_movement (stock_item_movement_id, stock_item_id, source_room_id, destination_room_id, maintenance_step_id, external_maintenance_step_id, movement_reason, movement_datetime) FROM stdin;
\.


--
-- TOC entry 5857 (class 0 OID 16926)
-- Dependencies: 312
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
-- TOC entry 5858 (class 0 OID 16930)
-- Dependencies: 313
-- Data for Name: stock_item_type_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_item_type_attribute (stock_item_attribute_definition_id, stock_item_type_id, is_mandatory, default_value) FROM stdin;
1	1	f	1000000
\.


--
-- TOC entry 5859 (class 0 OID 16935)
-- Dependencies: 314
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (supplier_id, supplier_name, supplier_address, supplier_commercial_register_number, supplier_rib, supplier_cpa, supplier_fiscal_identification_number, supplier_fiscal_static_number) FROM stdin;
\.


--
-- TOC entry 5860 (class 0 OID 16939)
-- Dependencies: 315
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_account (user_id, person_id, username, password_hash, created_at_datetime, disabled_at_datetime, last_login, account_status, failed_login_attempts, password_last_changed_datetime, created_by_user_id, modified_by_user_id, modified_at_datetime) FROM stdin;
10	1007	stock_cons_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:06:44.673576	2026-02-18 09:06:44.673576	2026-02-25 22:34:44.536066	active	0	2026-02-18 09:06:44.673576	\N	\N	2026-02-18 09:06:44.673576
1	1	admin	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-09 19:22:17.092734	2026-02-09 19:22:17.092734	2026-02-25 22:50:19.657463	active	0	2026-02-09 19:22:17.092734	\N	\N	2026-02-09 19:22:17.092734
3	7	technician1	430e6b4f4f7d05027d10871fe98484662dd348368c06f7c21c520ea344fdd6bf7a156dba9c0ba468e82fb867f40d39c9bae5f408202c125b772de5aee696007e	2026-02-10 20:18:23.477744	2026-02-10 20:18:23.477744	2026-02-26 10:40:05.269496	active	0	2026-02-10 20:18:23.477744	\N	\N	2026-02-10 20:18:23.477744
6	9	mohamednedjouh	ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413	2026-02-11 11:50:06.603461	2026-02-11 11:50:06.603461	2026-02-25 20:19:35.90291	active	0	2026-02-11 11:50:06.603461	1	1	2026-02-11 11:50:06.603461
4	8	technician2	40c82ecd90443ed156f5e4d3911c9659b6ecc21174a5ac4cb36f1804a45de6bcb2cae9110329419b04145e4d2ba55bd41a44f65c1e5617e592d7ebaf212c524e	2026-02-10 20:18:23.485554	2026-02-10 20:18:23.485554	2026-02-26 11:25:28.518101	active	0	2026-02-10 20:18:23.485554	\N	\N	2026-02-10 20:18:23.485554
2	6	bahaaeddinezaoui	9780eb93119bb629dc9062dc2611bd6bd17532b18a3b8a9ad0290e937000901132ce210686a8b3b843c9fa53797369a087c42cb8e3a18bb2d637cb2014c716df	2026-02-10 14:48:08.044751	2026-02-10 14:48:08.044751	2026-02-26 12:38:12.140776	active	0	2026-02-10 14:48:08.044751	\N	\N	2026-02-10 14:48:08.044751
5	10	bensimessaouddaoud	1d3005bd778154738f4876dfe5b7815a25dd36ae79eaa68b44b78175c4d5cbf4400073ec6e4ce40ff2d11d981fd06ec421ba71c531dc67133ead14635c9471c9	2026-02-11 10:50:19.833168	2026-02-11 10:50:19.833168	2026-02-26 12:40:17.622942	active	0	2026-02-11 10:50:19.833168	1	1	2026-02-11 10:50:19.833168
11	1008	asset_resp	bed4efa1d4fdbd954bd3705d6a2a78270ec9a52ecfbfb010c61862af5c76af1761ffeb1aef6aca1bf5d02b3781aa854fabd2b69c790de74e17ecfec3cb6ac4bf	2026-02-18 09:15:48.937778	2026-02-18 09:15:48.937778	2026-02-26 14:51:49.960144	active	0	2026-02-18 09:15:48.937778	\N	\N	2026-02-18 09:15:48.937778
\.


--
-- TOC entry 5861 (class 0 OID 16955)
-- Dependencies: 316
-- Data for Name: user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_session (session_id, user_id, ip_address, user_agent, login_datetime, last_activity, logout_datetime) FROM stdin;
\.


--
-- TOC entry 5862 (class 0 OID 16963)
-- Dependencies: 317
-- Data for Name: warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse (warehouse_id, warehouse_name, warehouse_address) FROM stdin;
1	ERI/2RM	\N
\.


--
-- TOC entry 5899 (class 0 OID 0)
-- Dependencies: 320
-- Name: asset_is_composed_of_consumable_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_consumable_history_id_seq', 9, true);


--
-- TOC entry 5900 (class 0 OID 0)
-- Dependencies: 319
-- Name: asset_is_composed_of_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_is_composed_of_stock_item_history_id_seq', 8, true);


--
-- TOC entry 5901 (class 0 OID 0)
-- Dependencies: 324
-- Name: asset_model_default_consumable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_consumable_id_seq', 3, true);


--
-- TOC entry 5902 (class 0 OID 0)
-- Dependencies: 322
-- Name: asset_model_default_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_model_default_stock_item_id_seq', 1, true);


--
-- TOC entry 5903 (class 0 OID 0)
-- Dependencies: 235
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- TOC entry 5904 (class 0 OID 0)
-- Dependencies: 237
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- TOC entry 5905 (class 0 OID 0)
-- Dependencies: 239
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 24, true);


--
-- TOC entry 5906 (class 0 OID 0)
-- Dependencies: 242
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- TOC entry 5907 (class 0 OID 0)
-- Dependencies: 243
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 1, true);


--
-- TOC entry 5908 (class 0 OID 0)
-- Dependencies: 245
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- TOC entry 5909 (class 0 OID 0)
-- Dependencies: 321
-- Name: consumable_is_used_in_stock_item_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumable_is_used_in_stock_item_history_id_seq', 1, false);


--
-- TOC entry 5910 (class 0 OID 0)
-- Dependencies: 269
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- TOC entry 5911 (class 0 OID 0)
-- Dependencies: 271
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 6, true);


--
-- TOC entry 5912 (class 0 OID 0)
-- Dependencies: 273
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 18, true);


--
-- TOC entry 5913 (class 0 OID 0)
-- Dependencies: 300
-- Name: room_type_room_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_type_room_type_id_seq', 1, false);


--
-- TOC entry 5247 (class 2606 OID 16969)
-- Name: administrative_certificate administrative_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT administrative_certificate_pkey PRIMARY KEY (administrative_certificate_id);


--
-- TOC entry 5251 (class 2606 OID 16971)
-- Name: asset_attribute_definition asset_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_definition
    ADD CONSTRAINT asset_attribute_definition_pkey PRIMARY KEY (asset_attribute_definition_id);


--
-- TOC entry 5253 (class 2606 OID 16973)
-- Name: asset_attribute_value asset_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT asset_attribute_value_pkey PRIMARY KEY (asset_attribute_definition_id, asset_id);


--
-- TOC entry 5255 (class 2606 OID 16975)
-- Name: asset_brand asset_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_brand
    ADD CONSTRAINT asset_brand_pkey PRIMARY KEY (asset_brand_id);


--
-- TOC entry 5257 (class 2606 OID 16977)
-- Name: asset_condition_history asset_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT asset_condition_history_pkey PRIMARY KEY (asset_condition_history_id);


--
-- TOC entry 5259 (class 2606 OID 16979)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5261 (class 2606 OID 18185)
-- Name: asset_is_composed_of_consumable_history asset_is_composed_of_consumable_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT asset_is_composed_of_consumable_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5263 (class 2606 OID 18171)
-- Name: asset_is_composed_of_stock_item_history asset_is_composed_of_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT asset_is_composed_of_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5267 (class 2606 OID 16985)
-- Name: asset_model_attribute_value asset_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT asset_model_attribute_value_pkey PRIMARY KEY (asset_model_id, asset_attribute_definition_id);


--
-- TOC entry 5462 (class 2606 OID 18244)
-- Name: asset_model_default_consumable asset_model_default_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT asset_model_default_consumable_pkey PRIMARY KEY (id);


--
-- TOC entry 5458 (class 2606 OID 18220)
-- Name: asset_model_default_stock_item asset_model_default_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT asset_model_default_stock_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5265 (class 2606 OID 16987)
-- Name: asset_model asset_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT asset_model_pkey PRIMARY KEY (asset_model_id);


--
-- TOC entry 5269 (class 2606 OID 16989)
-- Name: asset_movement asset_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT asset_movement_pkey PRIMARY KEY (asset_movement_id);


--
-- TOC entry 5249 (class 2606 OID 16991)
-- Name: asset asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5273 (class 2606 OID 16993)
-- Name: asset_type_attribute asset_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT asset_type_attribute_pkey PRIMARY KEY (asset_attribute_definition_id, asset_type_id);


--
-- TOC entry 5271 (class 2606 OID 16995)
-- Name: asset_type asset_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type
    ADD CONSTRAINT asset_type_pkey PRIMARY KEY (asset_type_id);


--
-- TOC entry 5275 (class 2606 OID 16997)
-- Name: attribution_order attribution_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT attribution_order_pkey PRIMARY KEY (attribution_order_id);


--
-- TOC entry 5278 (class 2606 OID 16999)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- TOC entry 5283 (class 2606 OID 17001)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- TOC entry 5286 (class 2606 OID 17003)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5280 (class 2606 OID 17005)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- TOC entry 5289 (class 2606 OID 17007)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- TOC entry 5291 (class 2606 OID 17009)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- TOC entry 5299 (class 2606 OID 17011)
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5302 (class 2606 OID 17013)
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- TOC entry 5293 (class 2606 OID 17015)
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- TOC entry 5305 (class 2606 OID 17017)
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5308 (class 2606 OID 17019)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- TOC entry 5296 (class 2606 OID 17021)
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- TOC entry 5310 (class 2606 OID 17023)
-- Name: authentication_log authentication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT authentication_log_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5312 (class 2606 OID 17025)
-- Name: bon_de_commande bon_de_commande_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bon_de_commande
    ADD CONSTRAINT bon_de_commande_pkey PRIMARY KEY (bon_de_commande_id);


--
-- TOC entry 5314 (class 2606 OID 17027)
-- Name: bon_de_livraison bon_de_livraison_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bon_de_livraison
    ADD CONSTRAINT bon_de_livraison_pkey PRIMARY KEY (bon_de_livraison_id);


--
-- TOC entry 5316 (class 2606 OID 17029)
-- Name: bon_de_reste bon_de_reste_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bon_de_reste
    ADD CONSTRAINT bon_de_reste_pkey PRIMARY KEY (bon_de_reste_id);


--
-- TOC entry 5318 (class 2606 OID 17031)
-- Name: broken_item_report broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broken_item_report
    ADD CONSTRAINT broken_item_report_pkey PRIMARY KEY (broken_item_report_id);


--
-- TOC entry 5334 (class 2606 OID 17033)
-- Name: consumable_is_compatible_with_asset c_is_compatible_with_a_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT c_is_compatible_with_a_pkey PRIMARY KEY (consumable_model_id, asset_model_id);


--
-- TOC entry 5336 (class 2606 OID 17035)
-- Name: consumable_is_compatible_with_stock_item c_is_compatible_with_si_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT c_is_compatible_with_si_pkey PRIMARY KEY (consumable_model_id, stock_item_model_id);


--
-- TOC entry 5320 (class 2606 OID 17037)
-- Name: company_asset_request company_asset_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT company_asset_request_pkey PRIMARY KEY (company_asset_request_id);


--
-- TOC entry 5324 (class 2606 OID 17039)
-- Name: consumable_attribute_definition consumable_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_definition
    ADD CONSTRAINT consumable_attribute_definition_pkey PRIMARY KEY (consumable_attribute_definition_id);


--
-- TOC entry 5326 (class 2606 OID 17041)
-- Name: consumable_attribute_value consumable_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT consumable_attribute_value_pkey PRIMARY KEY (consumable_id, consumable_attribute_definition_id);


--
-- TOC entry 5328 (class 2606 OID 17043)
-- Name: consumable_brand consumable_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_brand
    ADD CONSTRAINT consumable_brand_pkey PRIMARY KEY (consumable_brand_id);


--
-- TOC entry 5330 (class 2606 OID 17047)
-- Name: consumable_condition_history consumable_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT consumable_condition_history_pkey PRIMARY KEY (consumable_condition_history_id);


--
-- TOC entry 5332 (class 2606 OID 17049)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5338 (class 2606 OID 18199)
-- Name: consumable_is_used_in_stock_item_history consumable_is_used_in_stock_item_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT consumable_is_used_in_stock_item_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5342 (class 2606 OID 17053)
-- Name: consumable_model_attribute_value consumable_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT consumable_model_attribute_value_pkey PRIMARY KEY (consumable_model_id, consumable_attribute_definition_id);


--
-- TOC entry 5344 (class 2606 OID 17055)
-- Name: consumable_model_is_found_in_bdc consumable_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_bdc
    ADD CONSTRAINT consumable_model_is_found_in_bdc_pkey PRIMARY KEY (consumable_model_id, bon_de_commande_id);


--
-- TOC entry 5340 (class 2606 OID 17057)
-- Name: consumable_model consumable_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT consumable_model_pkey PRIMARY KEY (consumable_model_id);


--
-- TOC entry 5346 (class 2606 OID 17059)
-- Name: consumable_movement consumable_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT consumable_movement_pkey PRIMARY KEY (consumable_movement_id);


--
-- TOC entry 5322 (class 2606 OID 17061)
-- Name: consumable consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT consumable_pkey PRIMARY KEY (consumable_id);


--
-- TOC entry 5350 (class 2606 OID 17063)
-- Name: consumable_type_attribute consumable_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT consumable_type_attribute_pkey PRIMARY KEY (consumable_type_id, consumable_attribute_definition_id);


--
-- TOC entry 5348 (class 2606 OID 17065)
-- Name: consumable_type consumable_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type
    ADD CONSTRAINT consumable_type_pkey PRIMARY KEY (consumable_type_id);


--
-- TOC entry 5352 (class 2606 OID 17067)
-- Name: destruction_certificate destruction_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destruction_certificate
    ADD CONSTRAINT destruction_certificate_pkey PRIMARY KEY (destruction_certificate_id);


--
-- TOC entry 5355 (class 2606 OID 17069)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5358 (class 2606 OID 17071)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- TOC entry 5360 (class 2606 OID 17073)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- TOC entry 5362 (class 2606 OID 17075)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5365 (class 2606 OID 17077)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- TOC entry 5372 (class 2606 OID 17079)
-- Name: external_maintenance_document external_maintenance_document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT external_maintenance_document_pkey PRIMARY KEY (external_maintenance_document_id);


--
-- TOC entry 5368 (class 2606 OID 17081)
-- Name: external_maintenance external_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT external_maintenance_pkey PRIMARY KEY (external_maintenance_id);


--
-- TOC entry 5374 (class 2606 OID 17083)
-- Name: external_maintenance_provider external_maintenance_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_provider
    ADD CONSTRAINT external_maintenance_provider_pkey PRIMARY KEY (external_maintenance_provider_id);


--
-- TOC entry 5376 (class 2606 OID 17085)
-- Name: external_maintenance_step external_maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT external_maintenance_step_pkey PRIMARY KEY (external_maintenance_step_id);


--
-- TOC entry 5378 (class 2606 OID 17087)
-- Name: external_maintenance_typical_step external_maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_typical_step
    ADD CONSTRAINT external_maintenance_typical_step_pkey PRIMARY KEY (external_maintenance_typical_step_id);


--
-- TOC entry 5380 (class 2606 OID 17089)
-- Name: facture facture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facture
    ADD CONSTRAINT facture_pkey PRIMARY KEY (facture_id);


--
-- TOC entry 5384 (class 2606 OID 17091)
-- Name: maintenance_inspection_leads_to_broken_item_report maintenance_inspection_leads_to_broken_item_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT maintenance_inspection_leads_to_broken_item_report_pkey PRIMARY KEY (maintenance_id, broken_item_report_id);


--
-- TOC entry 5382 (class 2606 OID 17093)
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (maintenance_id);


--
-- TOC entry 5454 (class 2606 OID 17895)
-- Name: maintenance_step_item_request maintenance_step_item_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_pkey PRIMARY KEY (maintenance_step_item_request_id);


--
-- TOC entry 5386 (class 2606 OID 17095)
-- Name: maintenance_step maintenance_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT maintenance_step_pkey PRIMARY KEY (maintenance_step_id);


--
-- TOC entry 5388 (class 2606 OID 17097)
-- Name: maintenance_typical_step maintenance_typical_step_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_typical_step
    ADD CONSTRAINT maintenance_typical_step_pkey PRIMARY KEY (maintenance_typical_step_id);


--
-- TOC entry 5390 (class 2606 OID 17099)
-- Name: organizational_structure organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure
    ADD CONSTRAINT organizational_structure_pkey PRIMARY KEY (organizational_structure_id);


--
-- TOC entry 5392 (class 2606 OID 17101)
-- Name: organizational_structure_relation organizational_structure_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT organizational_structure_relation_pkey PRIMARY KEY (organizational_structure_id, parent_organizational_structure_id);


--
-- TOC entry 5396 (class 2606 OID 17103)
-- Name: person_assignment person_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT person_assignment_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5394 (class 2606 OID 17105)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- TOC entry 5398 (class 2606 OID 17107)
-- Name: person_reports_problem_on_asset person_reports_problem_on_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT person_reports_problem_on_asset_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5400 (class 2606 OID 17109)
-- Name: person_reports_problem_on_consumable person_reports_problem_on_consumable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT person_reports_problem_on_consumable_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5402 (class 2606 OID 17111)
-- Name: person_reports_problem_on_stock_item person_reports_problem_on_stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT person_reports_problem_on_stock_item_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5404 (class 2606 OID 17113)
-- Name: person_role_mapping person_role_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT person_role_mapping_pkey PRIMARY KEY (role_id, person_id);


--
-- TOC entry 5406 (class 2606 OID 17115)
-- Name: physical_condition physical_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_condition
    ADD CONSTRAINT physical_condition_pkey PRIMARY KEY (condition_id);


--
-- TOC entry 5408 (class 2606 OID 17117)
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (position_id);


--
-- TOC entry 5410 (class 2606 OID 17119)
-- Name: receipt_report receipt_report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_report
    ADD CONSTRAINT receipt_report_pkey PRIMARY KEY (receipt_report_id);


--
-- TOC entry 5412 (class 2606 OID 17121)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- TOC entry 5416 (class 2606 OID 17123)
-- Name: room_belongs_to_organizational_structure room_belongs_to_organizational_structure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_belongs_to_organizational_structure
    ADD CONSTRAINT room_belongs_to_organizational_structure_pkey PRIMARY KEY (organizational_structure_id, room_id);


--
-- TOC entry 5414 (class 2606 OID 17125)
-- Name: room room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT room_pkey PRIMARY KEY (room_id);


--
-- TOC entry 5418 (class 2606 OID 17127)
-- Name: room_type room_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_type
    ADD CONSTRAINT room_type_pkey PRIMARY KEY (room_type_id);


--
-- TOC entry 5422 (class 2606 OID 17129)
-- Name: stock_item_attribute_definition stock_item_attribute_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_definition
    ADD CONSTRAINT stock_item_attribute_definition_pkey PRIMARY KEY (stock_item_attribute_definition_id);


--
-- TOC entry 5424 (class 2606 OID 17131)
-- Name: stock_item_attribute_value stock_item_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT stock_item_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_id);


--
-- TOC entry 5426 (class 2606 OID 17133)
-- Name: stock_item_brand stock_item_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_brand
    ADD CONSTRAINT stock_item_brand_pkey PRIMARY KEY (stock_item_brand_id);


--
-- TOC entry 5428 (class 2606 OID 17135)
-- Name: stock_item_condition_history stock_item_condition_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT stock_item_condition_history_pkey PRIMARY KEY (stock_item_condition_history_id);


--
-- TOC entry 5430 (class 2606 OID 17137)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_person_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 5432 (class 2606 OID 17139)
-- Name: stock_item_is_compatible_with_asset stock_item_is_compatible_with_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT stock_item_is_compatible_with_asset_pkey PRIMARY KEY (stock_item_model_id, asset_model_id);


--
-- TOC entry 5436 (class 2606 OID 17141)
-- Name: stock_item_model_attribute_value stock_item_model_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT stock_item_model_attribute_value_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_model_id);


--
-- TOC entry 5438 (class 2606 OID 17143)
-- Name: stock_item_model_is_found_in_bdc stock_item_model_is_found_in_bdc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_bdc
    ADD CONSTRAINT stock_item_model_is_found_in_bdc_pkey PRIMARY KEY (stock_item_model_id, bon_de_commande_id);


--
-- TOC entry 5434 (class 2606 OID 17145)
-- Name: stock_item_model stock_item_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT stock_item_model_pkey PRIMARY KEY (stock_item_model_id);


--
-- TOC entry 5440 (class 2606 OID 17147)
-- Name: stock_item_movement stock_item_movement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT stock_item_movement_pkey PRIMARY KEY (stock_item_movement_id);


--
-- TOC entry 5420 (class 2606 OID 17149)
-- Name: stock_item stock_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT stock_item_pkey PRIMARY KEY (stock_item_id);


--
-- TOC entry 5444 (class 2606 OID 17151)
-- Name: stock_item_type_attribute stock_item_type_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT stock_item_type_attribute_pkey PRIMARY KEY (stock_item_attribute_definition_id, stock_item_type_id);


--
-- TOC entry 5442 (class 2606 OID 17153)
-- Name: stock_item_type stock_item_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type
    ADD CONSTRAINT stock_item_type_pkey PRIMARY KEY (stock_item_type_id);


--
-- TOC entry 5446 (class 2606 OID 17155)
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (supplier_id);


--
-- TOC entry 5464 (class 2606 OID 18246)
-- Name: asset_model_default_consumable uq_amdc_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT uq_amdc_composition UNIQUE (asset_model_id, consumable_model_id);


--
-- TOC entry 5460 (class 2606 OID 18222)
-- Name: asset_model_default_stock_item uq_amdsi_composition; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT uq_amdsi_composition UNIQUE (asset_model_id, stock_item_model_id);


--
-- TOC entry 5448 (class 2606 OID 17157)
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5450 (class 2606 OID 17159)
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5452 (class 2606 OID 17161)
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (warehouse_id);


--
-- TOC entry 5276 (class 1259 OID 17162)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- TOC entry 5281 (class 1259 OID 17163)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- TOC entry 5284 (class 1259 OID 17164)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- TOC entry 5287 (class 1259 OID 17165)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- TOC entry 5297 (class 1259 OID 17166)
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- TOC entry 5300 (class 1259 OID 17167)
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- TOC entry 5303 (class 1259 OID 17168)
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- TOC entry 5306 (class 1259 OID 17169)
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- TOC entry 5294 (class 1259 OID 17170)
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- TOC entry 5353 (class 1259 OID 17171)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- TOC entry 5356 (class 1259 OID 17172)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- TOC entry 5363 (class 1259 OID 17173)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- TOC entry 5366 (class 1259 OID 17174)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- TOC entry 5369 (class 1259 OID 17933)
-- Name: idx_external_maintenance_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_provider_id ON public.external_maintenance USING btree (external_maintenance_provider_id);


--
-- TOC entry 5370 (class 1259 OID 17932)
-- Name: idx_external_maintenance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_external_maintenance_status ON public.external_maintenance USING btree (external_maintenance_status);


--
-- TOC entry 5455 (class 1259 OID 17897)
-- Name: maintenance_step_item_request_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_status_idx ON public.maintenance_step_item_request USING btree (status);


--
-- TOC entry 5456 (class 1259 OID 17896)
-- Name: maintenance_step_item_request_step_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_step_item_request_step_id_idx ON public.maintenance_step_item_request USING btree (maintenance_step_id);


--
-- TOC entry 5475 (class 2606 OID 17175)
-- Name: asset_is_assigned_to_person asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT asset_is_assigned_to_person_is_confirmed_by_exploitation_c_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5499 (class 2606 OID 17180)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5500 (class 2606 OID 17185)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5501 (class 2606 OID 17190)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5502 (class 2606 OID 17195)
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5503 (class 2606 OID 17200)
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5504 (class 2606 OID 17205)
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5505 (class 2606 OID 17210)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5516 (class 2606 OID 17215)
-- Name: consumable_is_assigned_to_person consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT consumable_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


--
-- TOC entry 5541 (class 2606 OID 17220)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5542 (class 2606 OID 17225)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 5465 (class 2606 OID 17230)
-- Name: administrative_certificate fk_administ_ac_is_lin_receipt_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ac_is_lin_receipt_ FOREIGN KEY (receipt_report_id) REFERENCES public.receipt_report(receipt_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5466 (class 2606 OID 17235)
-- Name: administrative_certificate fk_administ_ad_is_bro_warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ad_is_bro_warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5467 (class 2606 OID 17240)
-- Name: administrative_certificate fk_administ_ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrative_certificate
    ADD CONSTRAINT fk_administ_ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5476 (class 2606 OID 17245)
-- Name: asset_is_assigned_to_person fk_aiatp_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_aiatp_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5479 (class 2606 OID 17250)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5480 (class 2606 OID 17255)
-- Name: asset_is_composed_of_consumable_history fk_aicoc_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_aicoc_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5483 (class 2606 OID 17260)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5484 (class 2606 OID 17265)
-- Name: asset_is_composed_of_stock_item_history fk_aicosi_maintenance_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_aicosi_maintenance_step FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5615 (class 2606 OID 18247)
-- Name: asset_model_default_consumable fk_amdc_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5616 (class 2606 OID 18252)
-- Name: asset_model_default_consumable fk_amdc_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_consumable
    ADD CONSTRAINT fk_amdc_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE;


--
-- TOC entry 5613 (class 2606 OID 18223)
-- Name: asset_model_default_stock_item fk_amdsi_asset_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_asset_model FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE;


--
-- TOC entry 5614 (class 2606 OID 18228)
-- Name: asset_model_default_stock_item fk_amdsi_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_default_stock_item
    ADD CONSTRAINT fk_amdsi_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE;


--
-- TOC entry 5468 (class 2606 OID 17270)
-- Name: asset fk_asset_asset_is__asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5469 (class 2606 OID 17275)
-- Name: asset fk_asset_asset_is__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5470 (class 2606 OID 17280)
-- Name: asset fk_asset_asset_is__destruct; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset
    ADD CONSTRAINT fk_asset_asset_is__destruct FOREIGN KEY (destruction_certificate_id) REFERENCES public.destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5471 (class 2606 OID 17285)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5472 (class 2606 OID 17290)
-- Name: asset_attribute_value fk_asset_at_asset_att_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_attribute_value
    ADD CONSTRAINT fk_asset_at_asset_att_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5473 (class 2606 OID 17295)
-- Name: asset_condition_history fk_asset_co_asset_con_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_con_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5474 (class 2606 OID 17300)
-- Name: asset_condition_history fk_asset_co_asset_has_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_condition_history
    ADD CONSTRAINT fk_asset_co_asset_has_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5481 (class 2606 OID 18190)
-- Name: asset_is_composed_of_consumable_history fk_asset_cons_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_cons_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5482 (class 2606 OID 17305)
-- Name: asset_is_composed_of_consumable_history fk_asset_is_asset_is__consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_consumable_history
    ADD CONSTRAINT fk_asset_is_asset_is__consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5477 (class 2606 OID 17310)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigned FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5478 (class 2606 OID 17315)
-- Name: asset_is_assigned_to_person fk_asset_is_asset_is__person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_assigned_to_person
    ADD CONSTRAINT fk_asset_is_asset_is__person_assigner FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5485 (class 2606 OID 17320)
-- Name: asset_is_composed_of_stock_item_history fk_asset_is_asset_is__stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_is_asset_is__stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5489 (class 2606 OID 17325)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5487 (class 2606 OID 17330)
-- Name: asset_model fk_asset_mo_asset_mod_asset_br; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_br FOREIGN KEY (asset_brand_id) REFERENCES public.asset_brand(asset_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5490 (class 2606 OID 17335)
-- Name: asset_model_attribute_value fk_asset_mo_asset_mod_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model_attribute_value
    ADD CONSTRAINT fk_asset_mo_asset_mod_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5491 (class 2606 OID 17340)
-- Name: asset_movement fk_asset_mo_asset_mov_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5492 (class 2606 OID 17345)
-- Name: asset_movement fk_asset_mo_asset_mov_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5493 (class 2606 OID 17350)
-- Name: asset_movement fk_asset_mo_asset_mov_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_maintena FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5494 (class 2606 OID 17355)
-- Name: asset_movement fk_asset_mo_asset_mov_room_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_room_dest FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5495 (class 2606 OID 17360)
-- Name: asset_movement fk_asset_mo_asset_mov_room_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movement
    ADD CONSTRAINT fk_asset_mo_asset_mov_room_source FOREIGN KEY (source_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5488 (class 2606 OID 17365)
-- Name: asset_model fk_asset_mo_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_model
    ADD CONSTRAINT fk_asset_mo_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5486 (class 2606 OID 18176)
-- Name: asset_is_composed_of_stock_item_history fk_asset_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_is_composed_of_stock_item_history
    ADD CONSTRAINT fk_asset_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5496 (class 2606 OID 17370)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_at; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_at FOREIGN KEY (asset_attribute_definition_id) REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5497 (class 2606 OID 17375)
-- Name: asset_type_attribute fk_asset_ty_asset_typ_asset_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_type_attribute
    ADD CONSTRAINT fk_asset_ty_asset_typ_asset_ty FOREIGN KEY (asset_type_id) REFERENCES public.asset_type(asset_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5498 (class 2606 OID 17380)
-- Name: attribution_order fk_attribut_shipment__warehous; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribution_order
    ADD CONSTRAINT fk_attribut_shipment__warehous FOREIGN KEY (warehouse_id) REFERENCES public.warehouse(warehouse_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5506 (class 2606 OID 17385)
-- Name: authentication_log fk_authenti_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_log
    ADD CONSTRAINT fk_authenti_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5507 (class 2606 OID 17390)
-- Name: bon_de_commande fk_bon_de_c_bdc_is_ma_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bon_de_commande
    ADD CONSTRAINT fk_bon_de_c_bdc_is_ma_supplier FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5508 (class 2606 OID 17395)
-- Name: bon_de_livraison fk_bon_de_l_bon_de_co_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bon_de_livraison
    ADD CONSTRAINT fk_bon_de_l_bon_de_co_bon_de_c FOREIGN KEY (bon_de_commande_id) REFERENCES public.bon_de_commande(bon_de_commande_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5509 (class 2606 OID 17400)
-- Name: bon_de_reste fk_bon_de_r_bdc_has_b_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bon_de_reste
    ADD CONSTRAINT fk_bon_de_r_bdc_has_b_bon_de_c FOREIGN KEY (bon_de_commande_id) REFERENCES public.bon_de_commande(bon_de_commande_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5520 (class 2606 OID 17405)
-- Name: consumable_is_compatible_with_asset fk_c_is_com_c_is_comp_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_c_is_com_c_is_comp_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5522 (class 2606 OID 17410)
-- Name: consumable_is_compatible_with_stock_item fk_c_is_com_c_is_comp_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_c_is_com_c_is_comp_stock_it FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5513 (class 2606 OID 17415)
-- Name: consumable_attribute_value fk_cav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5514 (class 2606 OID 17420)
-- Name: consumable_attribute_value fk_cav_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_attribute_value
    ADD CONSTRAINT fk_cav_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5517 (class 2606 OID 17430)
-- Name: consumable_is_assigned_to_person fk_ciatp_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_ciatp_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5521 (class 2606 OID 17435)
-- Name: consumable_is_compatible_with_asset fk_cicwa_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_asset
    ADD CONSTRAINT fk_cicwa_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5523 (class 2606 OID 17440)
-- Name: consumable_is_compatible_with_stock_item fk_cicwsi_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_compatible_with_stock_item
    ADD CONSTRAINT fk_cicwsi_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5524 (class 2606 OID 17445)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5525 (class 2606 OID 17450)
-- Name: consumable_is_used_in_stock_item_history fk_ciuisih_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_ciuisih_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5528 (class 2606 OID 17455)
-- Name: consumable_model fk_cm_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_brand FOREIGN KEY (consumable_brand_id) REFERENCES public.consumable_brand(consumable_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5534 (class 2606 OID 17460)
-- Name: consumable_movement fk_cm_consumable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_consumable FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5535 (class 2606 OID 17465)
-- Name: consumable_movement fk_cm_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_cm_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5529 (class 2606 OID 17470)
-- Name: consumable_model fk_cm_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model
    ADD CONSTRAINT fk_cm_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5530 (class 2606 OID 17475)
-- Name: consumable_model_attribute_value fk_cmav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5531 (class 2606 OID 17480)
-- Name: consumable_model_attribute_value fk_cmav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_attribute_value
    ADD CONSTRAINT fk_cmav_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5532 (class 2606 OID 17485)
-- Name: consumable_model_is_found_in_bdc fk_cmifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_bdc
    ADD CONSTRAINT fk_cmifib_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5510 (class 2606 OID 17490)
-- Name: company_asset_request fk_company__ao_leads__attribut; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_asset_request
    ADD CONSTRAINT fk_company__ao_leads__attribut FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5526 (class 2606 OID 18204)
-- Name: consumable_is_used_in_stock_item_history fk_cons_si_attribution_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_cons_si_attribution_order FOREIGN KEY (attribution_order_id) REFERENCES public.attribution_order(attribution_order_id);


--
-- TOC entry 5515 (class 2606 OID 17495)
-- Name: consumable_condition_history fk_consumab_associati_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_condition_history
    ADD CONSTRAINT fk_consumab_associati_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5533 (class 2606 OID 17500)
-- Name: consumable_model_is_found_in_bdc fk_consumab_consumabl_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_model_is_found_in_bdc
    ADD CONSTRAINT fk_consumab_consumabl_bon_de_c FOREIGN KEY (bon_de_commande_id) REFERENCES public.bon_de_commande(bon_de_commande_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5511 (class 2606 OID 17505)
-- Name: consumable fk_consumab_consumabl_destruct; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumab_consumabl_destruct FOREIGN KEY (destruction_certificate_id) REFERENCES public.destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5536 (class 2606 OID 17510)
-- Name: consumable_movement fk_consumab_consumabl_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5518 (class 2606 OID 17515)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5519 (class 2606 OID 17520)
-- Name: consumable_is_assigned_to_person fk_consumab_consumabl_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_assigned_to_person
    ADD CONSTRAINT fk_consumab_consumabl_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5537 (class 2606 OID 17530)
-- Name: consumable_movement fk_consumab_consumabl_room_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_room_dest FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5538 (class 2606 OID 17535)
-- Name: consumable_movement fk_consumab_consumabl_room_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_movement
    ADD CONSTRAINT fk_consumab_consumabl_room_source FOREIGN KEY (source_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5527 (class 2606 OID 17540)
-- Name: consumable_is_used_in_stock_item_history fk_consumab_consumabl_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_is_used_in_stock_item_history
    ADD CONSTRAINT fk_consumab_consumabl_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5512 (class 2606 OID 17545)
-- Name: consumable fk_consumable_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable
    ADD CONSTRAINT fk_consumable_model FOREIGN KEY (consumable_model_id) REFERENCES public.consumable_model(consumable_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5539 (class 2606 OID 17550)
-- Name: consumable_type_attribute fk_cta_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_attribute_def FOREIGN KEY (consumable_attribute_definition_id) REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5540 (class 2606 OID 17555)
-- Name: consumable_type_attribute fk_cta_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumable_type_attribute
    ADD CONSTRAINT fk_cta_type FOREIGN KEY (consumable_type_id) REFERENCES public.consumable_type(consumable_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5544 (class 2606 OID 17560)
-- Name: external_maintenance_document fk_emd_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_document
    ADD CONSTRAINT fk_emd_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5545 (class 2606 OID 17565)
-- Name: external_maintenance_step fk_ems_external_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_ems_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5546 (class 2606 OID 17575)
-- Name: external_maintenance_step fk_external_ems_is_a__external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_step
    ADD CONSTRAINT fk_external_ems_is_a__external FOREIGN KEY (external_maintenance_typical_step_id) REFERENCES public.external_maintenance_typical_step(external_maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5543 (class 2606 OID 17580)
-- Name: external_maintenance fk_external_maintenan_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance
    ADD CONSTRAINT fk_external_maintenan_maintena FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5547 (class 2606 OID 17585)
-- Name: facture fk_facture_bon_de_li_bon_de_l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facture
    ADD CONSTRAINT fk_facture_bon_de_li_bon_de_l FOREIGN KEY (bon_de_livraison_id) REFERENCES public.bon_de_livraison(bon_de_livraison_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5555 (class 2606 OID 17590)
-- Name: maintenance_step fk_maintena_asset_con_asset_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_asset_con_asset_co FOREIGN KEY (asset_condition_history_id) REFERENCES public.asset_condition_history(asset_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5548 (class 2606 OID 17595)
-- Name: maintenance fk_maintena_asset_is__asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_asset_is__asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5556 (class 2606 OID 17600)
-- Name: maintenance_step fk_maintena_consumabl_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_consumabl_consumab FOREIGN KEY (consumable_condition_history_id) REFERENCES public.consumable_condition_history(consumable_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5553 (class 2606 OID 17605)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_maintena_maintenan_broken_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_maintena_maintenan_broken_i FOREIGN KEY (broken_item_report_id) REFERENCES public.broken_item_report(broken_item_report_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5549 (class 2606 OID 17610)
-- Name: maintenance fk_maintena_maintenan_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_maintenan_person FOREIGN KEY (performed_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5550 (class 2606 OID 17615)
-- Name: maintenance fk_maintena_person_as_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT fk_maintena_person_as_person FOREIGN KEY (approved_by_maintenance_chief_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5557 (class 2606 OID 17620)
-- Name: maintenance_step fk_maintena_stock_ite_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_maintena_stock_ite_stock_it FOREIGN KEY (stock_item_condition_history_id) REFERENCES public.stock_item_condition_history(stock_item_condition_history_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5554 (class 2606 OID 17625)
-- Name: maintenance_inspection_leads_to_broken_item_report fk_milbir_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_inspection_leads_to_broken_item_report
    ADD CONSTRAINT fk_milbir_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5558 (class 2606 OID 17630)
-- Name: maintenance_step fk_ms_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_maintenance FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5559 (class 2606 OID 17635)
-- Name: maintenance_step fk_ms_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5560 (class 2606 OID 17640)
-- Name: maintenance_step fk_ms_typical_step; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step
    ADD CONSTRAINT fk_ms_typical_step FOREIGN KEY (maintenance_typical_step_id) REFERENCES public.maintenance_typical_step(maintenance_typical_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5561 (class 2606 OID 17645)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_child FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5562 (class 2606 OID 17650)
-- Name: organizational_structure_relation fk_organiza_organizat_organiza_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizational_structure_relation
    ADD CONSTRAINT fk_organiza_organizat_organiza_parent FOREIGN KEY (parent_organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5563 (class 2606 OID 17655)
-- Name: person_assignment fk_person_a_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5564 (class 2606 OID 17660)
-- Name: person_assignment fk_person_a_person_is_position; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_assignment
    ADD CONSTRAINT fk_person_a_person_is_position FOREIGN KEY (position_id) REFERENCES public."position"(position_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5565 (class 2606 OID 17665)
-- Name: person_reports_problem_on_asset fk_person_r_person_re_asset; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_person_r_person_re_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5567 (class 2606 OID 17670)
-- Name: person_reports_problem_on_consumable fk_person_r_person_re_consumab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_person_r_person_re_consumab FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5569 (class 2606 OID 17675)
-- Name: person_reports_problem_on_stock_item fk_person_r_person_re_stock_it; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_person_r_person_re_stock_it FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5571 (class 2606 OID 17680)
-- Name: person_role_mapping fk_person_role_mapping_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5572 (class 2606 OID 17685)
-- Name: person_role_mapping fk_person_role_mapping_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_role_mapping
    ADD CONSTRAINT fk_person_role_mapping_role FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5566 (class 2606 OID 17690)
-- Name: person_reports_problem_on_asset fk_prpoa_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_asset
    ADD CONSTRAINT fk_prpoa_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5568 (class 2606 OID 17695)
-- Name: person_reports_problem_on_consumable fk_prpoc_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_consumable
    ADD CONSTRAINT fk_prpoc_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5570 (class 2606 OID 17700)
-- Name: person_reports_problem_on_stock_item fk_prposi_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_reports_problem_on_stock_item
    ADD CONSTRAINT fk_prposi_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5574 (class 2606 OID 17705)
-- Name: room_belongs_to_organizational_structure fk_room_bel_room_belo_organiza; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_belongs_to_organizational_structure
    ADD CONSTRAINT fk_room_bel_room_belo_organiza FOREIGN KEY (organizational_structure_id) REFERENCES public.organizational_structure(organizational_structure_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5575 (class 2606 OID 17710)
-- Name: room_belongs_to_organizational_structure fk_room_bel_room_belo_room; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_belongs_to_organizational_structure
    ADD CONSTRAINT fk_room_bel_room_belo_room FOREIGN KEY (room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5573 (class 2606 OID 17715)
-- Name: room fk_room_room_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT fk_room_room_type FOREIGN KEY (room_type_id) REFERENCES public.room_type(room_type_id);


--
-- TOC entry 5579 (class 2606 OID 17720)
-- Name: stock_item_attribute_value fk_siav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5580 (class 2606 OID 17725)
-- Name: stock_item_attribute_value fk_siav_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_attribute_value
    ADD CONSTRAINT fk_siav_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5581 (class 2606 OID 17730)
-- Name: stock_item_condition_history fk_sich_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_sich_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5583 (class 2606 OID 17735)
-- Name: stock_item_is_assigned_to_person fk_siiatp_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_siiatp_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5587 (class 2606 OID 17740)
-- Name: stock_item_is_compatible_with_asset fk_siicwa_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_siicwa_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5589 (class 2606 OID 17745)
-- Name: stock_item_model fk_sim_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_brand FOREIGN KEY (stock_item_brand_id) REFERENCES public.stock_item_brand(stock_item_brand_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5595 (class 2606 OID 17750)
-- Name: stock_item_movement fk_sim_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5596 (class 2606 OID 17755)
-- Name: stock_item_movement fk_sim_stock_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_sim_stock_item FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5590 (class 2606 OID 17760)
-- Name: stock_item_model fk_sim_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model
    ADD CONSTRAINT fk_sim_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5591 (class 2606 OID 17765)
-- Name: stock_item_model_attribute_value fk_simav_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5592 (class 2606 OID 17770)
-- Name: stock_item_model_attribute_value fk_simav_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_attribute_value
    ADD CONSTRAINT fk_simav_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5593 (class 2606 OID 17775)
-- Name: stock_item_model_is_found_in_bdc fk_simifib_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_bdc
    ADD CONSTRAINT fk_simifib_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5600 (class 2606 OID 17780)
-- Name: stock_item_type_attribute fk_sita_attribute_def; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_attribute_def FOREIGN KEY (stock_item_attribute_definition_id) REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5601 (class 2606 OID 17785)
-- Name: stock_item_type_attribute fk_sita_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_type_attribute
    ADD CONSTRAINT fk_sita_type FOREIGN KEY (stock_item_type_id) REFERENCES public.stock_item_type(stock_item_type_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5588 (class 2606 OID 17790)
-- Name: stock_item_is_compatible_with_asset fk_stock_it_stock_ite_asset_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_compatible_with_asset
    ADD CONSTRAINT fk_stock_it_stock_ite_asset_mo FOREIGN KEY (asset_model_id) REFERENCES public.asset_model(asset_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5594 (class 2606 OID 17795)
-- Name: stock_item_model_is_found_in_bdc fk_stock_it_stock_ite_bon_de_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_model_is_found_in_bdc
    ADD CONSTRAINT fk_stock_it_stock_ite_bon_de_c FOREIGN KEY (bon_de_commande_id) REFERENCES public.bon_de_commande(bon_de_commande_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5576 (class 2606 OID 17800)
-- Name: stock_item fk_stock_it_stock_ite_destruct; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_it_stock_ite_destruct FOREIGN KEY (destruction_certificate_id) REFERENCES public.destruction_certificate(destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5597 (class 2606 OID 17805)
-- Name: stock_item_movement fk_stock_it_stock_ite_external; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_external FOREIGN KEY (external_maintenance_step_id) REFERENCES public.external_maintenance_step(external_maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5584 (class 2606 OID 17810)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigned; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigned FOREIGN KEY (assigned_by_person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5585 (class 2606 OID 17815)
-- Name: stock_item_is_assigned_to_person fk_stock_it_stock_ite_person_assigner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT fk_stock_it_stock_ite_person_assigner FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5582 (class 2606 OID 17820)
-- Name: stock_item_condition_history fk_stock_it_stock_ite_physical; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_condition_history
    ADD CONSTRAINT fk_stock_it_stock_ite_physical FOREIGN KEY (condition_id) REFERENCES public.physical_condition(condition_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5598 (class 2606 OID 17825)
-- Name: stock_item_movement fk_stock_it_stock_ite_room_dest; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_room_dest FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5599 (class 2606 OID 17830)
-- Name: stock_item_movement fk_stock_it_stock_ite_room_source; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_movement
    ADD CONSTRAINT fk_stock_it_stock_ite_room_source FOREIGN KEY (source_room_id) REFERENCES public.room(room_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5577 (class 2606 OID 17835)
-- Name: stock_item fk_stock_item_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_maintenance FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5578 (class 2606 OID 17840)
-- Name: stock_item fk_stock_item_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item
    ADD CONSTRAINT fk_stock_item_model FOREIGN KEY (stock_item_model_id) REFERENCES public.stock_item_model(stock_item_model_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5602 (class 2606 OID 17845)
-- Name: user_account fk_user_acc_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5603 (class 2606 OID 17850)
-- Name: user_account fk_user_acc_modified_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_modified_by_user FOREIGN KEY (modified_by_user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5604 (class 2606 OID 17855)
-- Name: user_account fk_user_acc_person_ha_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_acc_person_ha_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5605 (class 2606 OID 17860)
-- Name: user_session fk_user_ses_user_has__user_acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT fk_user_ses_user_has__user_acc FOREIGN KEY (user_id) REFERENCES public.user_account(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 5551 (class 2606 OID 17865)
-- Name: maintenance maintenance_consumable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_consumable_id_fkey FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5606 (class 2606 OID 17934)
-- Name: maintenance_step_item_request maintenance_step_item_request_rejected_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT maintenance_step_item_request_rejected_by_person_fk FOREIGN KEY (rejected_by_person_id) REFERENCES public.person(person_id) ON DELETE SET NULL;


--
-- TOC entry 5552 (class 2606 OID 17870)
-- Name: maintenance maintenance_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5607 (class 2606 OID 17913)
-- Name: maintenance_step_item_request msir_consumable_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_consumable_fk FOREIGN KEY (consumable_id) REFERENCES public.consumable(consumable_id);


--
-- TOC entry 5608 (class 2606 OID 17923)
-- Name: maintenance_step_item_request msir_destination_room_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_destination_room_fk FOREIGN KEY (destination_room_id) REFERENCES public.room(room_id);


--
-- TOC entry 5609 (class 2606 OID 17898)
-- Name: maintenance_step_item_request msir_maintenance_step_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_maintenance_step_fk FOREIGN KEY (maintenance_step_id) REFERENCES public.maintenance_step(maintenance_step_id);


--
-- TOC entry 5610 (class 2606 OID 17903)
-- Name: maintenance_step_item_request msir_requested_by_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_requested_by_person_fk FOREIGN KEY (requested_by_person_id) REFERENCES public.person(person_id);


--
-- TOC entry 5611 (class 2606 OID 17918)
-- Name: maintenance_step_item_request msir_source_room_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_source_room_fk FOREIGN KEY (source_room_id) REFERENCES public.room(room_id);


--
-- TOC entry 5612 (class 2606 OID 17908)
-- Name: maintenance_step_item_request msir_stock_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_step_item_request
    ADD CONSTRAINT msir_stock_item_fk FOREIGN KEY (stock_item_id) REFERENCES public.stock_item(stock_item_id);


--
-- TOC entry 5586 (class 2606 OID 17875)
-- Name: stock_item_is_assigned_to_person stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_item_is_assigned_to_person
    ADD CONSTRAINT stock_item_is_assigned_to_per_is_confirmed_by_exploitation_fkey FOREIGN KEY (is_confirmed_by_exploitation_chief_id) REFERENCES public.person(person_id);


-- Completed on 2026-02-27 10:15:09

--
-- PostgreSQL database dump complete
--

\unrestrict bkgVmcKt4LV5IVoUhQgKD2brROk6FYxnUug534fTjYSV12lYFhZ0HL9Hnt30mTc

