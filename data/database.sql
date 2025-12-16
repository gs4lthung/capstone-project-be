--
-- PostgreSQL database dump
--

\restrict aUqK7jt6qGrQfKLPi8MrLcJS0zrYVDH6NFdbUMETRAMkrdIPoJY7xt1C6JbyG5k

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 17.6

-- Started on 2025-12-15 08:27:41

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
-- TOC entry 1125 (class 1247 OID 18911)
-- Name: achievements_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.achievements_type_enum AS ENUM (
    'EVENT_COUNT',
    'PROPERTY_CHECK',
    'STREAK'
);


ALTER TYPE public.achievements_type_enum OWNER TO postgres;

--
-- TOC entry 942 (class 1247 OID 20108)
-- Name: ai_subject_generations_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ai_subject_generations_status_enum AS ENUM (
    'PENDING',
    'USED'
);


ALTER TYPE public.ai_subject_generations_status_enum OWNER TO postgres;

--
-- TOC entry 954 (class 1247 OID 19401)
-- Name: attendances_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.attendances_status_enum AS ENUM (
    'PRESENT',
    'ABSENT'
);


ALTER TYPE public.attendances_status_enum OWNER TO postgres;

--
-- TOC entry 957 (class 1247 OID 19421)
-- Name: base_credentials_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.base_credentials_type_enum AS ENUM (
    'CERTIFICATE',
    'PRIZE',
    'ACHIEVEMENT'
);


ALTER TYPE public.base_credentials_type_enum OWNER TO postgres;

--
-- TOC entry 978 (class 1247 OID 18335)
-- Name: coaches_verification_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.coaches_verification_status_enum AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'REJECTED',
    'VERIFIED'
);


ALTER TYPE public.coaches_verification_status_enum OWNER TO postgres;

--
-- TOC entry 1134 (class 1247 OID 18940)
-- Name: configurations_data_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.configurations_data_type_enum AS ENUM (
    'string',
    'number',
    'boolean',
    'json'
);


ALTER TYPE public.configurations_data_type_enum OWNER TO postgres;

--
-- TOC entry 1077 (class 1247 OID 18716)
-- Name: courses_learning_format_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.courses_learning_format_enum AS ENUM (
    'INDIVIDUAL',
    'GROUP'
);


ALTER TYPE public.courses_learning_format_enum OWNER TO postgres;

--
-- TOC entry 1074 (class 1247 OID 18709)
-- Name: courses_level_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.courses_level_enum AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public.courses_level_enum OWNER TO postgres;

--
-- TOC entry 1080 (class 1247 OID 18722)
-- Name: courses_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.courses_status_enum AS ENUM (
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'COMPLETED',
    'FULL',
    'READY_OPENED',
    'ON_GOING'
);


ALTER TYPE public.courses_status_enum OWNER TO postgres;

--
-- TOC entry 972 (class 1247 OID 18316)
-- Name: credentials_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.credentials_type_enum AS ENUM (
    'CERTIFICATE',
    'PRIZE',
    'ACHIEVEMENT'
);


ALTER TYPE public.credentials_type_enum OWNER TO postgres;

--
-- TOC entry 951 (class 1247 OID 19383)
-- Name: enrollments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enrollments_status_enum AS ENUM (
    'PENDING_GROUP',
    'CONFIRMED',
    'LEARNING',
    'UNPAID',
    'CANCELLED',
    'DONE'
);


ALTER TYPE public.enrollments_status_enum OWNER TO postgres;

--
-- TOC entry 1017 (class 1247 OID 18507)
-- Name: learner_progresses_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.learner_progresses_status_enum AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'DROPPED_OUT'
);


ALTER TYPE public.learner_progresses_status_enum OWNER TO postgres;

--
-- TOC entry 1023 (class 1247 OID 18528)
-- Name: learner_videos_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.learner_videos_status_enum AS ENUM (
    'UPLOADING',
    'READY',
    'ERROR',
    'ANALYZING'
);


ALTER TYPE public.learner_videos_status_enum OWNER TO postgres;

--
-- TOC entry 1116 (class 1247 OID 18886)
-- Name: learners_learning_goal_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.learners_learning_goal_enum AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public.learners_learning_goal_enum OWNER TO postgres;

--
-- TOC entry 1113 (class 1247 OID 18878)
-- Name: learners_skill_level_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.learners_skill_level_enum AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public.learners_skill_level_enum OWNER TO postgres;

--
-- TOC entry 939 (class 1247 OID 19369)
-- Name: notifications_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notifications_type_enum AS ENUM (
    'INFO',
    'SUCCESS',
    'ERROR'
);


ALTER TYPE public.notifications_type_enum OWNER TO postgres;

--
-- TOC entry 1005 (class 1247 OID 18446)
-- Name: payments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payments_status_enum AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED',
    'EXPIRED',
    'FAILED'
);


ALTER TYPE public.payments_status_enum OWNER TO postgres;

--
-- TOC entry 984 (class 1247 OID 18357)
-- Name: request_actions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_actions_type_enum AS ENUM (
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.request_actions_type_enum OWNER TO postgres;

--
-- TOC entry 990 (class 1247 OID 18384)
-- Name: requests_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.requests_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.requests_status_enum OWNER TO postgres;

--
-- TOC entry 936 (class 1247 OID 20096)
-- Name: requests_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.requests_type_enum AS ENUM (
    'COURSE-APPROVAL',
    'COURSE-CANCELLATION',
    'COACH-VERIFICATION',
    'COACH-UPDATE-VERIFICATION',
    'COURSE-UPDATE-APPROVAL'
);


ALTER TYPE public.requests_type_enum OWNER TO postgres;

--
-- TOC entry 999 (class 1247 OID 18422)
-- Name: schedules_day_of_week_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.schedules_day_of_week_enum AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);


ALTER TYPE public.schedules_day_of_week_enum OWNER TO postgres;

--
-- TOC entry 1092 (class 1247 OID 18799)
-- Name: sessions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sessions_status_enum AS ENUM (
    'PENDING',
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.sessions_status_enum OWNER TO postgres;

--
-- TOC entry 1056 (class 1247 OID 18647)
-- Name: subjects_level_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subjects_level_enum AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public.subjects_level_enum OWNER TO postgres;

--
-- TOC entry 1059 (class 1247 OID 18654)
-- Name: subjects_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subjects_status_enum AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public.subjects_status_enum OWNER TO postgres;

--
-- TOC entry 996 (class 1247 OID 18404)
-- Name: video_conference_presence_logs_event_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.video_conference_presence_logs_event_type_enum AS ENUM (
    'USER_JOIN',
    'USER_LEAVE',
    'CHANNEL_START',
    'CHANNEL_END'
);


ALTER TYPE public.video_conference_presence_logs_event_type_enum OWNER TO postgres;

--
-- TOC entry 1032 (class 1247 OID 18560)
-- Name: videos_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.videos_status_enum AS ENUM (
    'UPLOADING',
    'READY',
    'ERROR',
    'ANALYZING'
);


ALTER TYPE public.videos_status_enum OWNER TO postgres;

--
-- TOC entry 1101 (class 1247 OID 18843)
-- Name: wallet_transactions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.wallet_transactions_type_enum AS ENUM (
    'CREDIT',
    'DEBIT'
);


ALTER TYPE public.wallet_transactions_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 290 (class 1259 OID 18930)
-- Name: achievement_progresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievement_progresses (
    id integer NOT NULL,
    current_progress integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    achievement_id integer,
    user_id integer
);


ALTER TABLE public.achievement_progresses OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 18929)
-- Name: achievement_progresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.achievement_progresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievement_progresses_id_seq OWNER TO postgres;

--
-- TOC entry 4154 (class 0 OID 0)
-- Dependencies: 289
-- Name: achievement_progresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.achievement_progresses_id_seq OWNED BY public.achievement_progresses.id;


--
-- TOC entry 296 (class 1259 OID 18990)
-- Name: achievement_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievement_tracking (
    id integer NOT NULL,
    event_name character varying(100) NOT NULL,
    event_count integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    last_event_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL,
    achievement_id integer NOT NULL
);


ALTER TABLE public.achievement_tracking OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 18989)
-- Name: achievement_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.achievement_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievement_tracking_id_seq OWNER TO postgres;

--
-- TOC entry 4155 (class 0 OID 0)
-- Dependencies: 295
-- Name: achievement_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.achievement_tracking_id_seq OWNED BY public.achievement_tracking.id;


--
-- TOC entry 288 (class 1259 OID 18918)
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    target_count integer,
    entity_name character varying(25),
    property_name character varying(25),
    comparison_operator character varying(25),
    target_value text,
    target_streak_length integer,
    streak_unit character varying(25),
    type public.achievements_type_enum NOT NULL,
    created_by integer,
    event_name character varying(100)
);


ALTER TABLE public.achievements OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 18917)
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_id_seq OWNER TO postgres;

--
-- TOC entry 4156 (class 0 OID 0)
-- Dependencies: 287
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- TOC entry 304 (class 1259 OID 20145)
-- Name: ai_learner_progress_analyses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_learner_progress_analyses (
    id integer NOT NULL,
    "overallSummary" text NOT NULL,
    progress_percentage integer NOT NULL,
    strengths_identified json NOT NULL,
    areas_for_improvement json NOT NULL,
    quiz_performance_analysis json NOT NULL,
    video_performance_analysis json NOT NULL,
    recommendations_for_next_session json NOT NULL,
    practice_drills json NOT NULL,
    motivational_message text NOT NULL,
    sessions_completed_at_analysis integer NOT NULL,
    total_sessions_at_analysis integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer,
    learner_progress_id integer,
    title character varying(255) NOT NULL
);


ALTER TABLE public.ai_learner_progress_analyses OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 20144)
-- Name: ai_learner_progress_analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_learner_progress_analyses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_learner_progress_analyses_id_seq OWNER TO postgres;

--
-- TOC entry 4157 (class 0 OID 0)
-- Dependencies: 303
-- Name: ai_learner_progress_analyses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_learner_progress_analyses_id_seq OWNED BY public.ai_learner_progress_analyses.id;


--
-- TOC entry 302 (class 1259 OID 20114)
-- Name: ai_subject_generations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_subject_generations (
    id integer NOT NULL,
    prompt text NOT NULL,
    "generatedData" jsonb NOT NULL,
    status public.ai_subject_generations_status_enum DEFAULT 'PENDING'::public.ai_subject_generations_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    requested_by integer,
    created_subject_id integer
);


ALTER TABLE public.ai_subject_generations OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 20113)
-- Name: ai_subject_generations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_subject_generations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_subject_generations_id_seq OWNER TO postgres;

--
-- TOC entry 4158 (class 0 OID 0)
-- Dependencies: 301
-- Name: ai_subject_generations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_subject_generations_id_seq OWNED BY public.ai_subject_generations.id;


--
-- TOC entry 244 (class 1259 OID 18549)
-- Name: ai_video_comparison_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_video_comparison_results (
    id integer NOT NULL,
    summary text,
    learner_score integer,
    "keyDifferents" jsonb,
    details jsonb,
    "recommendationDrills" jsonb,
    coach_note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    learner_video_id integer,
    video_id integer
);


ALTER TABLE public.ai_video_comparison_results OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 18548)
-- Name: ai_video_comparison_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_video_comparison_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_video_comparison_results_id_seq OWNER TO postgres;

--
-- TOC entry 4159 (class 0 OID 0)
-- Dependencies: 243
-- Name: ai_video_comparison_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_video_comparison_results_id_seq OWNED BY public.ai_video_comparison_results.id;


--
-- TOC entry 270 (class 1259 OID 18774)
-- Name: attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendances (
    id integer NOT NULL,
    status public.attendances_status_enum DEFAULT 'PRESENT'::public.attendances_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer,
    session_id integer
);


ALTER TABLE public.attendances OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 18773)
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendances_id_seq OWNER TO postgres;

--
-- TOC entry 4160 (class 0 OID 0)
-- Dependencies: 269
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- TOC entry 280 (class 1259 OID 18858)
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    bin character varying(10) NOT NULL
);


ALTER TABLE public.banks OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 18857)
-- Name: banks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banks_id_seq OWNER TO postgres;

--
-- TOC entry 4161 (class 0 OID 0)
-- Dependencies: 279
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- TOC entry 300 (class 1259 OID 19428)
-- Name: base_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.base_credentials (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    type public.base_credentials_type_enum NOT NULL,
    public_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.base_credentials OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 19427)
-- Name: base_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.base_credentials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.base_credentials_id_seq OWNER TO postgres;

--
-- TOC entry 4162 (class 0 OID 0)
-- Dependencies: 299
-- Name: base_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.base_credentials_id_seq OWNED BY public.base_credentials.id;


--
-- TOC entry 226 (class 1259 OID 18344)
-- Name: coaches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coaches (
    id integer NOT NULL,
    bio text NOT NULL,
    specialties text,
    teaching_methods text,
    year_of_experience integer NOT NULL,
    verification_status public.coaches_verification_status_enum DEFAULT 'UNVERIFIED'::public.coaches_verification_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    user_id integer
);


ALTER TABLE public.coaches OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18343)
-- Name: coaches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coaches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coaches_id_seq OWNER TO postgres;

--
-- TOC entry 4163 (class 0 OID 0)
-- Dependencies: 225
-- Name: coaches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coaches_id_seq OWNED BY public.coaches.id;


--
-- TOC entry 292 (class 1259 OID 18950)
-- Name: configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configurations (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value character varying(255) NOT NULL,
    description text,
    data_type public.configurations_data_type_enum DEFAULT 'string'::public.configurations_data_type_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    updated_by integer
);


ALTER TABLE public.configurations OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 18949)
-- Name: configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configurations_id_seq OWNER TO postgres;

--
-- TOC entry 4164 (class 0 OID 0)
-- Dependencies: 291
-- Name: configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configurations_id_seq OWNED BY public.configurations.id;


--
-- TOC entry 268 (class 1259 OID 18740)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    level public.courses_level_enum DEFAULT 'BEGINNER'::public.courses_level_enum NOT NULL,
    learning_format public.courses_learning_format_enum DEFAULT 'GROUP'::public.courses_learning_format_enum NOT NULL,
    status public.courses_status_enum DEFAULT 'PENDING_APPROVAL'::public.courses_status_enum NOT NULL,
    public_url text,
    min_participants integer DEFAULT 1 NOT NULL,
    max_participants integer DEFAULT 10 NOT NULL,
    price_per_participant numeric(15,3) DEFAULT '0'::numeric NOT NULL,
    current_participants integer DEFAULT 0 NOT NULL,
    total_sessions integer DEFAULT 0 NOT NULL,
    total_earnings numeric(15,3) DEFAULT '0'::numeric NOT NULL,
    start_date date NOT NULL,
    end_date date,
    progress_pct integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    cancelling_reason text,
    created_by integer,
    subject_id integer,
    court_id integer,
    google_meet_link text,
    CONSTRAINT "CHK_14a92d9a7176832922fc808e28" CHECK (((min_participants > 0) AND (max_participants > 0) AND (max_participants >= min_participants))),
    CONSTRAINT "CHK_e895d862abf6224b4e8f94e18b" CHECK ((start_date <= end_date))
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 18739)
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- TOC entry 4165 (class 0 OID 0)
-- Dependencies: 267
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- TOC entry 266 (class 1259 OID 18695)
-- Name: courts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courts (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone_number character varying(25),
    price_per_hour numeric(15,3) DEFAULT '0'::numeric NOT NULL,
    public_url text,
    address text NOT NULL,
    province_id integer,
    district_id integer,
    latitude numeric(10,6),
    longitude numeric(10,6)
);


ALTER TABLE public.courts OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 18694)
-- Name: courts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courts_id_seq OWNER TO postgres;

--
-- TOC entry 4166 (class 0 OID 0)
-- Dependencies: 265
-- Name: courts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courts_id_seq OWNED BY public.courts.id;


--
-- TOC entry 224 (class 1259 OID 18324)
-- Name: credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credentials (
    id integer NOT NULL,
    issued_at date,
    expires_at date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    coach_id integer,
    base_credential_id integer,
    public_url text
);


ALTER TABLE public.credentials OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18323)
-- Name: credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credentials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credentials_id_seq OWNER TO postgres;

--
-- TOC entry 4167 (class 0 OID 0)
-- Dependencies: 223
-- Name: credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credentials_id_seq OWNED BY public.credentials.id;


--
-- TOC entry 262 (class 1259 OID 18680)
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.districts (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    province_id integer
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 18679)
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.districts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.districts_id_seq OWNER TO postgres;

--
-- TOC entry 4168 (class 0 OID 0)
-- Dependencies: 261
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.districts_id_seq OWNED BY public.districts.id;


--
-- TOC entry 236 (class 1259 OID 18486)
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    "paymentAmount" numeric(15,3),
    status public.enrollments_status_enum DEFAULT 'UNPAID'::public.enrollments_status_enum NOT NULL,
    enrolled_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    course_id integer,
    user_id integer
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 18485)
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO postgres;

--
-- TOC entry 4169 (class 0 OID 0)
-- Dependencies: 235
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- TOC entry 218 (class 1259 OID 18273)
-- Name: errors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.errors (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    message text NOT NULL,
    stack character varying(5000),
    url character varying(255),
    body character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone DEFAULT now() NOT NULL,
    "isResolved" boolean DEFAULT false NOT NULL,
    user_id integer
);


ALTER TABLE public.errors OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 18272)
-- Name: errors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.errors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.errors_id_seq OWNER TO postgres;

--
-- TOC entry 4170 (class 0 OID 0)
-- Dependencies: 217
-- Name: errors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.errors_id_seq OWNED BY public.errors.id;


--
-- TOC entry 238 (class 1259 OID 18496)
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedbacks (
    id integer NOT NULL,
    comment text NOT NULL,
    rating integer NOT NULL,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    received_by integer,
    course_id integer
);


ALTER TABLE public.feedbacks OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 18495)
-- Name: feedbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feedbacks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedbacks_id_seq OWNER TO postgres;

--
-- TOC entry 4171 (class 0 OID 0)
-- Dependencies: 237
-- Name: feedbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feedbacks_id_seq OWNED BY public.feedbacks.id;


--
-- TOC entry 286 (class 1259 OID 18903)
-- Name: learner_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learner_achievements (
    id integer NOT NULL,
    earned_at timestamp without time zone DEFAULT now() NOT NULL,
    achievement_id integer,
    user_id integer
);


ALTER TABLE public.learner_achievements OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 18902)
-- Name: learner_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learner_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learner_achievements_id_seq OWNER TO postgres;

--
-- TOC entry 4172 (class 0 OID 0)
-- Dependencies: 285
-- Name: learner_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learner_achievements_id_seq OWNED BY public.learner_achievements.id;


--
-- TOC entry 250 (class 1259 OID 18593)
-- Name: learner_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learner_answers (
    id integer NOT NULL,
    is_correct boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    question_id integer,
    quiz_attempt_id integer,
    question_option_id integer
);


ALTER TABLE public.learner_answers OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 18592)
-- Name: learner_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learner_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learner_answers_id_seq OWNER TO postgres;

--
-- TOC entry 4173 (class 0 OID 0)
-- Dependencies: 249
-- Name: learner_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learner_answers_id_seq OWNED BY public.learner_answers.id;


--
-- TOC entry 240 (class 1259 OID 18514)
-- Name: learner_progresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learner_progresses (
    id integer NOT NULL,
    sessions_completed integer DEFAULT 0 NOT NULL,
    total_sessions integer NOT NULL,
    avg_ai_analysis_score integer DEFAULT 0 NOT NULL,
    avg_quiz_score integer DEFAULT 0 NOT NULL,
    status public.learner_progresses_status_enum DEFAULT 'IN_PROGRESS'::public.learner_progresses_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer,
    course_id integer,
    can_generate_ai_analysis boolean DEFAULT false NOT NULL,
    CONSTRAINT "CHK_43c330dbdaccc59a50de681192" CHECK ((sessions_completed <= total_sessions))
);


ALTER TABLE public.learner_progresses OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 18513)
-- Name: learner_progresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learner_progresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learner_progresses_id_seq OWNER TO postgres;

--
-- TOC entry 4174 (class 0 OID 0)
-- Dependencies: 239
-- Name: learner_progresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learner_progresses_id_seq OWNED BY public.learner_progresses.id;


--
-- TOC entry 242 (class 1259 OID 18538)
-- Name: learner_videos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learner_videos (
    id integer NOT NULL,
    tags text,
    duration integer NOT NULL,
    public_url text NOT NULL,
    thumbnail_url text,
    overlay_video_url text,
    overlay_thumbnail_url text,
    status public.learner_videos_status_enum DEFAULT 'UPLOADING'::public.learner_videos_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer,
    session_id integer,
    video_id integer
);


ALTER TABLE public.learner_videos OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 18537)
-- Name: learner_videos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learner_videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learner_videos_id_seq OWNER TO postgres;

--
-- TOC entry 4175 (class 0 OID 0)
-- Dependencies: 241
-- Name: learner_videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learner_videos_id_seq OWNED BY public.learner_videos.id;


--
-- TOC entry 284 (class 1259 OID 18894)
-- Name: learners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learners (
    id integer NOT NULL,
    skill_level public.learners_skill_level_enum DEFAULT 'BEGINNER'::public.learners_skill_level_enum NOT NULL,
    learning_goal public.learners_learning_goal_enum DEFAULT 'BEGINNER'::public.learners_learning_goal_enum NOT NULL,
    user_id integer
);


ALTER TABLE public.learners OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 18893)
-- Name: learners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learners_id_seq OWNER TO postgres;

--
-- TOC entry 4176 (class 0 OID 0)
-- Dependencies: 283
-- Name: learners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learners_id_seq OWNED BY public.learners.id;


--
-- TOC entry 258 (class 1259 OID 18636)
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    lesson_number integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    subject_id integer
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 18635)
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO postgres;

--
-- TOC entry 4177 (class 0 OID 0)
-- Dependencies: 257
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- TOC entry 298 (class 1259 OID 19349)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 19348)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 4178 (class 0 OID 0)
-- Dependencies: 297
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 222 (class 1259 OID 18304)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    title character varying(50) NOT NULL,
    body text NOT NULL,
    "navigateTo" character varying(50),
    type public.notifications_type_enum DEFAULT 'INFO'::public.notifications_type_enum NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18303)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 4179 (class 0 OID 0)
-- Dependencies: 221
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 234 (class 1259 OID 18458)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    amount numeric(15,3) NOT NULL,
    description text NOT NULL,
    "orderCode" integer NOT NULL,
    "paymentLinkId" text NOT NULL,
    "checkoutUrl" text NOT NULL,
    "qrCode" text NOT NULL,
    status public.payments_status_enum DEFAULT 'PENDING'::public.payments_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    expired_at date,
    enrollment_id integer
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 18457)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- TOC entry 4180 (class 0 OID 0)
-- Dependencies: 233
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 264 (class 1259 OID 18688)
-- Name: provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinces (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.provinces OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 18687)
-- Name: provinces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.provinces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provinces_id_seq OWNER TO postgres;

--
-- TOC entry 4181 (class 0 OID 0)
-- Dependencies: 263
-- Name: provinces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.provinces_id_seq OWNED BY public.provinces.id;


--
-- TOC entry 252 (class 1259 OID 18601)
-- Name: question_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_options (
    id integer NOT NULL,
    content text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    question_id integer
);


ALTER TABLE public.question_options OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 18600)
-- Name: question_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_options_id_seq OWNER TO postgres;

--
-- TOC entry 4182 (class 0 OID 0)
-- Dependencies: 251
-- Name: question_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_options_id_seq OWNED BY public.question_options.id;


--
-- TOC entry 254 (class 1259 OID 18612)
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    explanation text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    quiz_id integer
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 18611)
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO postgres;

--
-- TOC entry 4183 (class 0 OID 0)
-- Dependencies: 253
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- TOC entry 248 (class 1259 OID 18585)
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_attempts (
    id integer NOT NULL,
    attempt_number integer NOT NULL,
    score integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    attempted_by integer,
    session_id integer
);


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 18584)
-- Name: quiz_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attempts_id_seq OWNER TO postgres;

--
-- TOC entry 4184 (class 0 OID 0)
-- Dependencies: 247
-- Name: quiz_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_attempts_id_seq OWNED BY public.quiz_attempts.id;


--
-- TOC entry 256 (class 1259 OID 18622)
-- Name: quizzes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quizzes (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    total_questions integer NOT NULL,
    deleted_at timestamp without time zone,
    "createdById" integer,
    lesson_id integer,
    session_id integer,
    CONSTRAINT "CHK_21dd3b97fa2d529ccb5656b900" CHECK ((((lesson_id IS NOT NULL) AND (session_id IS NULL)) OR ((lesson_id IS NULL) AND (session_id IS NOT NULL))))
);


ALTER TABLE public.quizzes OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 18621)
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quizzes_id_seq OWNER TO postgres;

--
-- TOC entry 4185 (class 0 OID 0)
-- Dependencies: 255
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- TOC entry 228 (class 1259 OID 18362)
-- Name: request_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_actions (
    id integer NOT NULL,
    type public.request_actions_type_enum NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    handled_by integer,
    request_id integer
);


ALTER TABLE public.request_actions OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 18361)
-- Name: request_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_actions_id_seq OWNER TO postgres;

--
-- TOC entry 4186 (class 0 OID 0)
-- Dependencies: 227
-- Name: request_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_actions_id_seq OWNED BY public.request_actions.id;


--
-- TOC entry 230 (class 1259 OID 18392)
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    id integer NOT NULL,
    description text NOT NULL,
    status public.requests_status_enum DEFAULT 'PENDING'::public.requests_status_enum NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    type public.requests_type_enum NOT NULL
);


ALTER TABLE public.requests OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 18391)
-- Name: requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requests_id_seq OWNER TO postgres;

--
-- TOC entry 4187 (class 0 OID 0)
-- Dependencies: 229
-- Name: requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.requests_id_seq OWNED BY public.requests.id;


--
-- TOC entry 220 (class 1259 OID 18285)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 18284)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 4188 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 232 (class 1259 OID 18438)
-- Name: schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    day_of_week public.schedules_day_of_week_enum NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    total_sessions integer DEFAULT 0 NOT NULL,
    course_id integer
);


ALTER TABLE public.schedules OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 18437)
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_id_seq OWNER TO postgres;

--
-- TOC entry 4189 (class 0 OID 0)
-- Dependencies: 231
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- TOC entry 272 (class 1259 OID 18790)
-- Name: session_earnings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session_earnings (
    id integer NOT NULL,
    session_price numeric(15,3) NOT NULL,
    coach_earning_total numeric(15,3) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    paid_at date,
    session_id integer
);


ALTER TABLE public.session_earnings OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 18789)
-- Name: session_earnings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.session_earnings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.session_earnings_id_seq OWNER TO postgres;

--
-- TOC entry 4190 (class 0 OID 0)
-- Dependencies: 271
-- Name: session_earnings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.session_earnings_id_seq OWNED BY public.session_earnings.id;


--
-- TOC entry 274 (class 1259 OID 18808)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    name character varying(100),
    description text,
    session_number integer NOT NULL,
    schedule_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status public.sessions_status_enum DEFAULT 'PENDING'::public.sessions_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    completed_at date,
    course_id integer,
    lesson_id integer,
    schedule_id integer,
    CONSTRAINT "CHK_6fd33f6df357fc20555f03f324" CHECK ((start_time < end_time))
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 18807)
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO postgres;

--
-- TOC entry 4191 (class 0 OID 0)
-- Dependencies: 273
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- TOC entry 260 (class 1259 OID 18660)
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    level public.subjects_level_enum DEFAULT 'BEGINNER'::public.subjects_level_enum NOT NULL,
    status public.subjects_status_enum DEFAULT 'DRAFT'::public.subjects_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    "createdById" integer,
    is_ai_generated boolean DEFAULT false NOT NULL
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 18659)
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO postgres;

--
-- TOC entry 4192 (class 0 OID 0)
-- Dependencies: 259
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- TOC entry 294 (class 1259 OID 18965)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(50) NOT NULL,
    email character varying(50),
    phone_number character varying(25),
    password character varying(255),
    profile_picture text,
    refresh_token text,
    is_email_verified boolean DEFAULT false NOT NULL,
    is_phone_verified boolean DEFAULT false NOT NULL,
    email_verification_token character varying(255),
    reset_password_token character varying(255),
    is_active boolean DEFAULT false NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    role_id integer,
    province_id integer,
    district_id integer,
    CONSTRAINT "CHK_USERS_EMAIL_PHONE_HAVE_AT_LEAST_ONE" CHECK (((email IS NOT NULL) OR (phone_number IS NOT NULL)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 18964)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4193 (class 0 OID 0)
-- Dependencies: 293
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 246 (class 1259 OID 18570)
-- Name: videos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.videos (
    id integer NOT NULL,
    title character varying(50) NOT NULL,
    description text,
    tags text,
    duration integer,
    drill_name character varying(50),
    drill_description text,
    drill_practice_sets text,
    public_url text,
    thumbnail_url text,
    status public.videos_status_enum DEFAULT 'UPLOADING'::public.videos_status_enum NOT NULL,
    "uploadedById" integer,
    lesson_id integer,
    session_id integer,
    CONSTRAINT "CHK_e43b0f0321838320abf6d0aa68" CHECK ((((lesson_id IS NOT NULL) AND (session_id IS NULL)) OR ((lesson_id IS NULL) AND (session_id IS NOT NULL))))
);


ALTER TABLE public.videos OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 18569)
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.videos_id_seq OWNER TO postgres;

--
-- TOC entry 4194 (class 0 OID 0)
-- Dependencies: 245
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- TOC entry 278 (class 1259 OID 18848)
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_transactions (
    id integer NOT NULL,
    amount numeric(15,3) NOT NULL,
    description text,
    type public.wallet_transactions_type_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    wallet_id integer,
    session_id integer,
    withdrawal_request_id integer
);


ALTER TABLE public.wallet_transactions OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 18847)
-- Name: wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallet_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 4195 (class 0 OID 0)
-- Dependencies: 277
-- Name: wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallet_transactions_id_seq OWNED BY public.wallet_transactions.id;


--
-- TOC entry 282 (class 1259 OID 18865)
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    id integer NOT NULL,
    bank_account_number character varying(50),
    current_balance numeric(15,3) DEFAULT '0'::numeric NOT NULL,
    total_income numeric(15,3) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer,
    bank_id integer
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 18864)
-- Name: wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallets_id_seq OWNER TO postgres;

--
-- TOC entry 4196 (class 0 OID 0)
-- Dependencies: 281
-- Name: wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallets_id_seq OWNED BY public.wallets.id;


--
-- TOC entry 276 (class 1259 OID 18832)
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdrawal_requests (
    id integer NOT NULL,
    "referenceId" character varying(255) NOT NULL,
    amount numeric(15,3) NOT NULL,
    payout_details text,
    admin_comment text,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at date,
    wallet_id integer
);


ALTER TABLE public.withdrawal_requests OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 18831)
-- Name: withdrawal_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.withdrawal_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.withdrawal_requests_id_seq OWNER TO postgres;

--
-- TOC entry 4197 (class 0 OID 0)
-- Dependencies: 275
-- Name: withdrawal_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.withdrawal_requests_id_seq OWNED BY public.withdrawal_requests.id;


--
-- TOC entry 3683 (class 2604 OID 18933)
-- Name: achievement_progresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_progresses ALTER COLUMN id SET DEFAULT nextval('public.achievement_progresses_id_seq'::regclass);


--
-- TOC entry 3695 (class 2604 OID 18993)
-- Name: achievement_tracking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_tracking ALTER COLUMN id SET DEFAULT nextval('public.achievement_tracking_id_seq'::regclass);


--
-- TOC entry 3680 (class 2604 OID 18921)
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- TOC entry 3707 (class 2604 OID 20148)
-- Name: ai_learner_progress_analyses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_learner_progress_analyses ALTER COLUMN id SET DEFAULT nextval('public.ai_learner_progress_analyses_id_seq'::regclass);


--
-- TOC entry 3703 (class 2604 OID 20117)
-- Name: ai_subject_generations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_subject_generations ALTER COLUMN id SET DEFAULT nextval('public.ai_subject_generations_id_seq'::regclass);


--
-- TOC entry 3616 (class 2604 OID 18552)
-- Name: ai_video_comparison_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_video_comparison_results ALTER COLUMN id SET DEFAULT nextval('public.ai_video_comparison_results_id_seq'::regclass);


--
-- TOC entry 3656 (class 2604 OID 18777)
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- TOC entry 3669 (class 2604 OID 18861)
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- TOC entry 3700 (class 2604 OID 19431)
-- Name: base_credentials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.base_credentials ALTER COLUMN id SET DEFAULT nextval('public.base_credentials_id_seq'::regclass);


--
-- TOC entry 3582 (class 2604 OID 18347)
-- Name: coaches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coaches ALTER COLUMN id SET DEFAULT nextval('public.coaches_id_seq'::regclass);


--
-- TOC entry 3685 (class 2604 OID 18953)
-- Name: configurations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configurations ALTER COLUMN id SET DEFAULT nextval('public.configurations_id_seq'::regclass);


--
-- TOC entry 3643 (class 2604 OID 18743)
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- TOC entry 3641 (class 2604 OID 18698)
-- Name: courts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courts ALTER COLUMN id SET DEFAULT nextval('public.courts_id_seq'::regclass);


--
-- TOC entry 3579 (class 2604 OID 18327)
-- Name: credentials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials ALTER COLUMN id SET DEFAULT nextval('public.credentials_id_seq'::regclass);


--
-- TOC entry 3639 (class 2604 OID 18683)
-- Name: districts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts ALTER COLUMN id SET DEFAULT nextval('public.districts_id_seq'::regclass);


--
-- TOC entry 3598 (class 2604 OID 18489)
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- TOC entry 3570 (class 2604 OID 18276)
-- Name: errors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errors ALTER COLUMN id SET DEFAULT nextval('public.errors_id_seq'::regclass);


--
-- TOC entry 3602 (class 2604 OID 18499)
-- Name: feedbacks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks ALTER COLUMN id SET DEFAULT nextval('public.feedbacks_id_seq'::regclass);


--
-- TOC entry 3678 (class 2604 OID 18906)
-- Name: learner_achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_achievements ALTER COLUMN id SET DEFAULT nextval('public.learner_achievements_id_seq'::regclass);


--
-- TOC entry 3622 (class 2604 OID 18596)
-- Name: learner_answers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_answers ALTER COLUMN id SET DEFAULT nextval('public.learner_answers_id_seq'::regclass);


--
-- TOC entry 3605 (class 2604 OID 18517)
-- Name: learner_progresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_progresses ALTER COLUMN id SET DEFAULT nextval('public.learner_progresses_id_seq'::regclass);


--
-- TOC entry 3613 (class 2604 OID 18541)
-- Name: learner_videos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_videos ALTER COLUMN id SET DEFAULT nextval('public.learner_videos_id_seq'::regclass);


--
-- TOC entry 3675 (class 2604 OID 18897)
-- Name: learners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learners ALTER COLUMN id SET DEFAULT nextval('public.learners_id_seq'::regclass);


--
-- TOC entry 3630 (class 2604 OID 18639)
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- TOC entry 3699 (class 2604 OID 19352)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3575 (class 2604 OID 18307)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3594 (class 2604 OID 18461)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3640 (class 2604 OID 18691)
-- Name: provinces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces ALTER COLUMN id SET DEFAULT nextval('public.provinces_id_seq'::regclass);


--
-- TOC entry 3624 (class 2604 OID 18604)
-- Name: question_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_options ALTER COLUMN id SET DEFAULT nextval('public.question_options_id_seq'::regclass);


--
-- TOC entry 3627 (class 2604 OID 18615)
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- TOC entry 3620 (class 2604 OID 18588)
-- Name: quiz_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN id SET DEFAULT nextval('public.quiz_attempts_id_seq'::regclass);


--
-- TOC entry 3629 (class 2604 OID 18625)
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- TOC entry 3586 (class 2604 OID 18365)
-- Name: request_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_actions ALTER COLUMN id SET DEFAULT nextval('public.request_actions_id_seq'::regclass);


--
-- TOC entry 3588 (class 2604 OID 18395)
-- Name: requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests ALTER COLUMN id SET DEFAULT nextval('public.requests_id_seq'::regclass);


--
-- TOC entry 3574 (class 2604 OID 18288)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3592 (class 2604 OID 18441)
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- TOC entry 3659 (class 2604 OID 18793)
-- Name: session_earnings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_earnings ALTER COLUMN id SET DEFAULT nextval('public.session_earnings_id_seq'::regclass);


--
-- TOC entry 3661 (class 2604 OID 18811)
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- TOC entry 3633 (class 2604 OID 18663)
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- TOC entry 3689 (class 2604 OID 18968)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3618 (class 2604 OID 18573)
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- TOC entry 3667 (class 2604 OID 18851)
-- Name: wallet_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.wallet_transactions_id_seq'::regclass);


--
-- TOC entry 3670 (class 2604 OID 18868)
-- Name: wallets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets ALTER COLUMN id SET DEFAULT nextval('public.wallets_id_seq'::regclass);


--
-- TOC entry 3665 (class 2604 OID 18835)
-- Name: withdrawal_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests ALTER COLUMN id SET DEFAULT nextval('public.withdrawal_requests_id_seq'::regclass);


--
-- TOC entry 4134 (class 0 OID 18930)
-- Dependencies: 290
-- Data for Name: achievement_progresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievement_progresses (id, current_progress, updated_at, achievement_id, user_id) FROM stdin;
6	67	2025-12-14 02:03:03.136676	10	2
12	30	2025-12-14 04:26:02.923381	10	1
8	100	2025-12-05 14:19:19.951228	9	4
4	100	2025-11-27 10:47:58.915872	8	2
2	14	2025-12-06 01:45:55.520881	9	6
3	3	2025-12-06 01:45:55.544481	10	6
7	100	2025-11-30 23:26:55.661875	8	4
5	100	2025-12-01 03:41:39.503156	9	2
30	0	2025-12-08 01:00:12.473907	15	4
31	0	2025-12-08 01:00:12.485735	16	4
32	0	2025-12-08 01:00:12.495929	17	4
1	100	2025-12-01 04:57:23.437467	8	6
13	20	2025-12-01 10:59:58.07616	5	6
15	0	2025-12-01 11:40:57.931628	15	6
16	0	2025-12-01 11:40:57.943363	16	6
17	100	2025-12-01 11:41:01.804505	17	6
14	60	2025-12-08 06:37:58.466649	5	4
10	100	2025-12-03 01:18:35.155152	8	1
11	100	2025-12-12 15:24:27.373597	9	1
9	7	2025-12-14 00:16:03.227888	10	4
\.


--
-- TOC entry 4140 (class 0 OID 18990)
-- Dependencies: 296
-- Data for Name: achievement_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievement_tracking (id, event_name, event_count, metadata, last_event_at, created_at, updated_at, user_id, achievement_id) FROM stdin;
12	DAILY_LOGIN	9	{"maxStreak": 9, "startDate": "2025-12-06T02:47:34.725Z", "currentStreak": 9, "lastBreakDate": "2025-12-06T02:47:34.725Z"}	2025-12-14 04:26:02.89	2025-11-26 12:55:21.972023	2025-12-14 04:26:02.900259	1	10
7	DAILY_LOGIN	3	{"maxStreak": 3, "startDate": "2025-11-29T09:31:26.262Z", "currentStreak": 3, "lastBreakDate": "2025-11-29T09:31:26.262Z"}	2025-12-01 06:26:55.202	2025-11-26 09:36:24.05513	2025-11-30 23:26:55.318002	4	8
4	DAILY_LOGIN	3	{"maxStreak": 3, "startDate": "2025-11-25T19:01:27.060Z", "currentStreak": 3}	2025-11-27 10:47:58.893	2025-11-25 19:01:27.066685	2025-11-27 10:47:58.903737	2	8
5	DAILY_LOGIN	7	{"maxStreak": 7, "startDate": "2025-11-25T19:01:27.082Z", "currentStreak": 7}	2025-12-01 03:41:39.488	2025-11-25 19:01:27.089495	2025-12-01 03:41:39.491299	2	9
10	DAILY_LOGIN	3	{"maxStreak": 3, "startDate": "2025-12-01T04:26:08.090Z", "currentStreak": 3, "lastBreakDate": "2025-12-01T04:26:08.090Z"}	2025-12-03 01:18:35.133	2025-11-26 12:55:20.646518	2025-12-03 01:18:35.143465	1	8
1	DAILY_LOGIN	3	{"maxStreak": 3, "startDate": "2025-11-29T09:28:51.714Z", "currentStreak": 3, "lastBreakDate": "2025-11-29T09:28:51.714Z"}	2025-12-01 04:57:23.424	2025-11-25 18:29:40.430061	2025-12-01 04:57:23.426395	6	8
8	DAILY_LOGIN	7	{"maxStreak": 7, "startDate": "2025-11-29T09:31:26.281Z", "currentStreak": 7, "lastBreakDate": "2025-11-29T09:31:26.281Z"}	2025-12-05 14:19:19.926	2025-11-26 09:36:24.085219	2025-12-05 14:19:19.936859	4	9
2	DAILY_LOGIN	1	{"maxStreak": 4, "startDate": "2025-12-06T01:45:55.493Z", "currentStreak": 1, "lastBreakDate": "2025-12-06T01:45:55.493Z"}	2025-12-06 01:45:55.493	2025-11-25 18:29:40.454331	2025-12-06 01:45:55.506949	6	9
3	DAILY_LOGIN	1	{"maxStreak": 4, "startDate": "2025-12-06T01:45:55.519Z", "currentStreak": 1, "lastBreakDate": "2025-12-06T01:45:55.519Z"}	2025-12-06 01:45:55.519	2025-11-25 18:29:40.472483	2025-12-06 01:45:55.532924	6	10
13	SESSION_ATTENDED	1	\N	2025-12-01 10:59:58.063	2025-12-01 10:59:58.064432	2025-12-01 10:59:58.064432	6	5
14	SESSION_ATTENDED	3	\N	2025-12-08 06:37:58.443	2025-12-01 10:59:58.110099	2025-12-08 06:37:58.453161	4	5
11	DAILY_LOGIN	7	{"maxStreak": 7, "startDate": "2025-12-06T02:47:34.704Z", "currentStreak": 7, "lastBreakDate": "2025-12-06T02:47:34.704Z"}	2025-12-12 15:24:27.353	2025-11-26 12:55:21.302608	2025-12-12 15:24:27.363069	1	9
9	DAILY_LOGIN	2	{"maxStreak": 10, "startDate": "2025-12-13T05:32:32.209Z", "currentStreak": 2, "lastBreakDate": "2025-12-13T05:32:32.209Z"}	2025-12-14 00:16:03.199	2025-11-26 09:36:24.108006	2025-12-14 00:16:03.210221	4	10
6	DAILY_LOGIN	20	{"maxStreak": 20, "startDate": "2025-11-25T19:01:27.100Z", "currentStreak": 20}	2025-12-14 02:03:03.114	2025-11-25 19:01:27.106353	2025-12-14 02:03:03.125111	2	10
\.


--
-- TOC entry 4132 (class 0 OID 18918)
-- Dependencies: 288
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievements (id, name, description, icon_url, is_active, created_at, target_count, entity_name, property_name, comparison_operator, target_value, target_streak_length, streak_unit, type, created_by, event_name) FROM stdin;
1	Bước Đầu Tiên	Hoàn thành bài học đầu tiên của bạn	https://api.dicebear.com/7.x/icons/svg?seed=first-step	t	2025-11-25 18:28:16.884349	1	\N	\N	\N	\N	\N	\N	EVENT_COUNT	1	LESSON_COMPLETED
2	Người Học Chăm Chỉ	Hoàn thành 10 bài học	https://api.dicebear.com/7.x/icons/svg?seed=hard-worker	t	2025-11-25 18:28:17.055028	10	\N	\N	\N	\N	\N	\N	EVENT_COUNT	1	LESSON_COMPLETED
3	Học Giả	Hoàn thành 50 bài học	https://api.dicebear.com/7.x/icons/svg?seed=scholar	t	2025-11-25 18:28:17.221596	50	\N	\N	\N	\N	\N	\N	EVENT_COUNT	1	LESSON_COMPLETED
4	Bậc Thầy Kiến Thức	Hoàn thành 100 bài học	https://api.dicebear.com/7.x/icons/svg?seed=master	t	2025-11-25 18:28:17.380587	100	\N	\N	\N	\N	\N	\N	EVENT_COUNT	1	LESSON_COMPLETED
5	Người Tham Gia Tích Cực	Tham gia 5 buổi học trực tuyến	https://api.dicebear.com/7.x/icons/svg?seed=active-participant	t	2025-11-25 18:28:17.545668	5	\N	\N	\N	\N	\N	\N	EVENT_COUNT	1	SESSION_ATTENDED
6	Chiến Binh Video	Xem 20 video bài giảng	https://api.dicebear.com/7.x/icons/svg?seed=video-warrior	t	2025-11-25 18:28:17.742047	20	\N	\N	\N	\N	\N	\N	EVENT_COUNT	1	VIDEO_WATCHED
7	Người Hoàn Thành Khóa Học	Hoàn thành 3 khóa học	https://api.dicebear.com/7.x/icons/svg?seed=course-finisher	t	2025-11-25 18:28:17.899789	3	\N	\N	\N	\N	\N	\N	EVENT_COUNT	1	COURSE_COMPLETED
8	Đăng Nhập Hàng Ngày	Đăng nhập 3 ngày liên tiếp	https://api.dicebear.com/7.x/icons/svg?seed=daily-login	t	2025-11-25 18:28:18.06205	\N	\N	\N	\N	\N	3	days	STREAK	1	DAILY_LOGIN
9	Chiến Binh Tuần	Đăng nhập 7 ngày liên tiếp	https://api.dicebear.com/7.x/icons/svg?seed=week-warrior	t	2025-11-25 18:28:18.224145	\N	\N	\N	\N	\N	7	days	STREAK	1	DAILY_LOGIN
10	Người Kiên Trì Tháng	Đăng nhập 30 ngày liên tiếp	https://api.dicebear.com/7.x/icons/svg?seed=month-dedication	t	2025-11-25 18:28:18.403381	\N	\N	\N	\N	\N	30	days	STREAK	1	DAILY_LOGIN
11	Học Mỗi Ngày	Hoàn thành bài học 5 ngày liên tiếp	https://api.dicebear.com/7.x/icons/svg?seed=daily-study	t	2025-11-25 18:28:18.556792	\N	\N	\N	\N	\N	5	days	STREAK	1	DAILY_LESSON
12	Luyện Tập Đều Đặn	Làm quiz 7 ngày liên tiếp	https://api.dicebear.com/7.x/icons/svg?seed=daily-practice	t	2025-11-25 18:28:18.710604	\N	\N	\N	\N	\N	7	days	STREAK	1	DAILY_QUIZ
13	Tham Gia Tích Cực	Tham gia session 3 tuần liên tiếp	https://api.dicebear.com/7.x/icons/svg?seed=active-attendance	t	2025-11-25 18:28:18.867995	\N	\N	\N	\N	\N	3	weeks	STREAK	1	WEEKLY_SESSION
14	Video Hàng Ngày	Xem video 10 ngày liên tiếp	https://api.dicebear.com/7.x/icons/svg?seed=daily-video	t	2025-11-25 18:28:19.034916	\N	\N	\N	\N	\N	10	days	STREAK	1	DAILY_VIDEO
15	Học Sinh Giỏi	Đạt điểm trung bình quiz >= 80%	https://api.dicebear.com/7.x/icons/svg?seed=excellent-student	t	2025-11-25 18:28:19.201065	\N	LearnerProgress	avgQuizScore	>=	80	\N	\N	PROPERTY_CHECK	1	QUIZ_COMPLETED
16	Học Sinh Xuất Sắc	Đạt điểm trung bình quiz >= 90%	https://api.dicebear.com/7.x/icons/svg?seed=outstanding-student	t	2025-11-25 18:28:19.358921	\N	LearnerProgress	avgQuizScore	>=	90	\N	\N	PROPERTY_CHECK	1	QUIZ_COMPLETED
17	Hoàn Hảo	Đạt điểm quiz 100%	https://api.dicebear.com/7.x/icons/svg?seed=perfect-score	t	2025-11-25 18:28:19.525562	\N	Quiz	score	==	100	\N	\N	PROPERTY_CHECK	1	QUIZ_COMPLETED
18	Giáo Viên Được Yêu Thích	Coach đạt rating trung bình >= 4.5 sao	https://api.dicebear.com/7.x/icons/svg?seed=beloved-coach	t	2025-11-25 18:28:19.683299	\N	Coach	averageRating	>=	4.5	\N	\N	PROPERTY_CHECK	1	FEEDBACK_RECEIVED
19	Tiến Độ Vững Chắc	Đạt tiến độ khóa học >= 50%	https://api.dicebear.com/7.x/icons/svg?seed=solid-progress	t	2025-11-25 18:28:19.836994	\N	LearnerProgress	progress	>=	50	\N	\N	PROPERTY_CHECK	1	LESSON_COMPLETED
20	Sắp Hoàn Thành	Đạt tiến độ khóa học >= 80%	https://api.dicebear.com/7.x/icons/svg?seed=almost-done	t	2025-11-25 18:28:19.999081	\N	LearnerProgress	progress	>=	80	\N	\N	PROPERTY_CHECK	1	LESSON_COMPLETED
21	Người Tham Gia Tích Cực	Tham dự ít nhất 5 buổi session	https://api.dicebear.com/7.x/icons/svg?seed=active-attendee	t	2025-11-25 18:28:20.157551	\N	Enrollment	sessionCount	>=	5	\N	\N	PROPERTY_CHECK	1	SESSION_ATTENDEDD
\.


--
-- TOC entry 4148 (class 0 OID 20145)
-- Dependencies: 304
-- Data for Name: ai_learner_progress_analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_learner_progress_analyses (id, "overallSummary", progress_percentage, strengths_identified, areas_for_improvement, quiz_performance_analysis, video_performance_analysis, recommendations_for_next_session, practice_drills, motivational_message, sessions_completed_at_analysis, total_sessions_at_analysis, created_at, user_id, learner_progress_id, title) FROM stdin;
2	Lê Văn C đã hoàn thành buổi học đầu tiên của Khóa Nhập môn Pickleball, đạt 25% tiến độ khóa học. Đây là giai đoạn làm quen, học viên đã thể hiện một số điểm tốt về tư thế khởi đầu trong kỹ thuật cú thuận tay nhưng vẫn cần củng cố kiến thức cơ bản về luật và sân thi đấu, đồng thời cải thiện các yếu tố kỹ thuật quan trọng của cú thuận tay để xây dựng nền tảng vững chắc.	25	["Tư thế khởi đầu tốt trong cú thuận tay, cho thấy sự chú ý đến kỹ thuật nền tảng ban đầu.","Mặt vợt có vẻ vuông góc tại điểm tiếp xúc bóng trong cú thuận tay, giúp tạo ra cú đánh thẳng và có kiểm soát.","Vợt vung qua cơ thể một cách tự nhiên, là yếu tố cần thiết để tạo lực và hoàn thành cú đánh."]	["Kiến thức cơ bản về luật chơi, kích thước sân và chiều cao lưới Pickleball.","Kỹ thuật kéo vợt về sau (backswing) cho cú thuận tay, đặc biệt là việc hạ vợt đúng cách.","Điểm tiếp xúc bóng tối ưu trong cú thuận tay để tăng cường kiểm soát và lực đánh.","Sự tham gia của thân dưới và xoay người trong cú thuận tay để truyền lực hiệu quả hơn.","Theo đà vung vợt (follow-through) cần được kéo dài và mở rộng hơn để tối ưu lực và độ chính xác."]	{"averageScore":20,"summary":"Lê Văn C cần ôn lại các kiến thức cơ bản về Pickleball. Mặc dù đã hoàn thành quiz, điểm số 20% cho thấy học viên chưa nắm vững các quy tắc cơ bản, kích thước sân và mục tiêu trò chơi.","topicsMastered":[],"topicsNeedingReview":["Quy tắc cơ bản của Pickleball và đối tượng phù hợp","Mục tiêu và cách tính điểm trong Pickleball","Kích thước sân Pickleball tiêu chuẩn","Chiều cao lưới Pickleball"]}	{"averageScore":68,"summary":"Phân tích cú thuận tay cho thấy Lê Văn C có tư thế chuẩn bị ban đầu tốt nhưng gặp khó khăn ở các giai đoạn sau của cú đánh. Động tác kéo vợt về sau còn cao, điểm tiếp xúc bóng chưa tối ưu và theo đà vung vợt chưa đủ dài, ảnh hưởng đến lực và kiểm soát.","techniqueStrengths":["Tư thế khởi đầu tốt.","Mặt vợt có vẻ vuông góc tại điểm tiếp xúc.","Vợt vung qua cơ thể."],"techniqueWeaknesses":["Đầu vợt giữ quá cao khi kéo vợt về sau (cổ tay cao hơn khuỷu tay).","Phần thân dưới ít tham gia hiệu quả vào việc hạ vợt.","Điểm tiếp xúc bóng cao hơn rõ rệt (ngang eo/ngực).","Xoay người chưa đủ trong suốt cú vung.","Cánh tay vươn ra quá mức so với lý tưởng, giảm truyền lực.","Theo đà vung vợt ngắn hơn và kết thúc cao hơn.","Ít sự linh hoạt trong chuyển động sau khi tiếp xúc bóng."]}	[{"priority":"HIGH","title":"Nắm vững Kiến thức Cơ bản về Pickleball","description":"Dành thời gian ôn tập lại các quy tắc cơ bản, kích thước sân, chiều cao lưới và mục tiêu của trò chơi Pickleball. Việc nắm chắc lý thuyết là nền tảng quan trọng trước khi đi sâu vào kỹ thuật.","focusAreas":["Luật chơi","Kích thước sân","Chiều cao lưới","Mục tiêu trò chơi"]},{"priority":"HIGH","title":"Cải thiện Kỹ thuật Kéo vợt và Điểm Tiếp xúc trong Cú thuận tay","description":"Tập trung thực hành động tác kéo vợt về sau sao cho đầu vợt thấp hơn khuỷu tay và điểm tiếp xúc bóng lý tưởng ở ngang hông hoặc dưới eo để tối ưu hóa lực và kiểm soát.","focusAreas":["Kéo vợt về sau (backswing)","Điểm tiếp xúc bóng (contact point)","Cú thuận tay (forehand)"]},{"priority":"MEDIUM","title":"Tối ưu hóa Theo đà vung vợt và Xoay người","description":"Luyện tập kéo dài theo đà vung vợt qua vai đối diện để truyền hết lực từ cơ thể vào bóng. Đồng thời, chú ý xoay vai và hông nhiều hơn trong suốt cú vung để tăng sức mạnh và sự ổn định.","focusAreas":["Theo đà vung vợt (follow-through)","Xoay người (body rotation)","Truyền lực"]},{"priority":"MEDIUM","title":"Sử dụng Thân dưới hiệu quả","description":"Tích hợp chuyển động của chân và hông vào cú đánh để tạo ra lực đánh mạnh mẽ hơn và giữ thăng bằng tốt hơn. Thực hiện các bài tập di chuyển chân kết hợp với cú đánh.","focusAreas":["Sử dụng thân dưới","Di chuyển chân","Truyền lực"]}]	[{"name":"Quiz 'Pickleball 101'","description":"Thực hiện lại bài quiz về luật chơi, kích thước sân và lưới Pickleball cho đến khi đạt điểm tuyệt đối.","targetArea":"Kiến thức cơ bản, Luật chơi","sets":"1-2 lần mỗi ngày cho đến khi đạt 100%"},{"name":"Shadow Swing 'Lower Backswing'","description":"Đứng trước gương, thực hiện các cú swing không bóng, tập trung vào việc hạ thấp đầu vợt khi kéo vợt về sau, giữ cổ tay thấp hơn khuỷu tay.","targetArea":"Kéo vợt về sau (backswing) cú thuận tay","sets":"3 sets x 15 reps"},{"name":"Drop Ball Forehand Contact","description":"Nhờ bạn hoặc huấn luyện viên thả bóng từ độ cao ngang vai, tập trung đánh bóng khi nó ở điểm tiếp xúc lý tưởng (ngang hông hoặc dưới eo), thực hành giữ mặt vợt vuông góc.","targetArea":"Điểm tiếp xúc bóng cú thuận tay","sets":"3 sets x 20 reps"},{"name":"Wall Dinks & Drives - Follow-through Focus","description":"Đánh bóng vào tường, tập trung thực hiện theo đà vung vợt dài và kết thúc qua vai đối diện cho cả cú dink nhẹ và cú drive mạnh.","targetArea":"Theo đà vung vợt (follow-through), Kiểm soát bóng","sets":"3 sets x 25 reps"},{"name":"Cone Drill - Rotation & Footwork","description":"Đặt 2-3 hình nón tạo thành một đường chéo, di chuyển quanh hình nón, dừng lại và mô phỏng cú thuận tay, tập trung xoay hông và vai cùng với di chuyển chân.","targetArea":"Xoay người, Di chuyển chân, Sử dụng thân dưới","sets":"3 sets x 10 rotations"}]	Lê Văn C, bạn đã có một khởi đầu tuyệt vời với buổi học đầu tiên! Việc nhận diện và cải thiện các kỹ thuật cơ bản ngay từ đầu là chìa khóa để tiến bộ nhanh chóng. Hãy tiếp tục kiên trì luyện tập, và tôi tin rằng bạn sẽ sớm thấy sự khác biệt rõ rệt trên sân. Cố lên!	1	4	2025-12-11 10:00:04.760447	4	6	Phân tích tiến độ buổi 1/4 - Khóa Nhập môn Pickleball của Lê Văn C
\.


--
-- TOC entry 4146 (class 0 OID 20114)
-- Dependencies: 302
-- Data for Name: ai_subject_generations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_subject_generations (id, prompt, "generatedData", status, created_at, updated_at, deleted_at, requested_by, created_subject_id) FROM stdin;
1	Tài liệu về chiến thuật đánh đôi nâng cao trong pickleball. Tài liệu sẽ có 3 bài học.	{"name": "Chiến Thuật Đánh Đôi Nâng Cao Pickleball", "level": "INTERMEDIATE", "lessons": [{"name": "Vị Trí và Di Chuyển Thông Minh Trên Sân Đôi", "quiz": {"title": "Kiểm tra Vị Trí và Di Chuyển Thông Minh Trên Sân Đôi", "questions": [{"title": "Tại sao việc duy trì vị trí ở vạch Kitchen lại quan trọng trong đánh đôi?", "options": [{"content": "Để tránh bị đối thủ đánh bóng qua đầu", "isCorrect": false}, {"content": "Để có thể thực hiện các cú volley và kiểm soát bóng tốt hơn", "isCorrect": false}, {"content": "Để dễ dàng trả bóng từ baseline", "isCorrect": true}, {"content": "Để nghỉ ngơi giữa các điểm", "isCorrect": false}], "explanation": "Duy trì vị trí ở vạch Kitchen (Non-Volley Zone) cho phép bạn có thể thực hiện các cú volley mạnh mẽ và kiểm soát bóng tốt hơn, gây áp lực lên đối thủ và tạo cơ hội tấn công."}, {"title": "Khi đồng đội của bạn thực hiện một cú đánh tấn công sâu, bạn nên di chuyển như thế nào?", "options": [{"content": "Lùi về phía baseline", "isCorrect": false}, {"content": "Đứng yên tại chỗ", "isCorrect": false}, {"content": "Tiến lên phía trước, gần vạch Kitchen", "isCorrect": true}, {"content": "Di chuyển sang một bên", "isCorrect": false}], "explanation": "Khi đồng đội đánh bóng sâu và tạo áp lực, bạn nên di chuyển lên phía trước, gần vạch Kitchen hơn để sẵn sàng cho cú volley tiếp theo hoặc hỗ trợ đồng đội kết thúc điểm."}, {"title": "Điều nào sau đây là nguyên tắc quan trọng nhất trong việc di chuyển đồng bộ của cặp đôi?", "options": [{"content": "Luôn di chuyển cùng lúc với đồng đội", "isCorrect": false}, {"content": "Người chơi mạnh hơn nên di chuyển nhiều hơn", "isCorrect": false}, {"content": "Giữ khoảng cách đều giữa hai người chơi", "isCorrect": true}, {"content": "Chỉ di chuyển khi bóng đi qua mình", "isCorrect": false}], "explanation": "Giữ khoảng cách đều giữa hai người chơi đảm bảo không có khoảng trống lớn nào trên sân bị bỏ ngỏ, giúp che phủ hiệu quả hơn và hỗ trợ lẫn nhau."}, {"title": "Mô hình di chuyển 'side-by-side' (song song) có ý nghĩa gì trong đánh đôi?", "options": [{"content": "Một người ở Kitchen, một người ở baseline", "isCorrect": false}, {"content": "Cả hai người chơi di chuyển lên hoặc xuống sân cùng lúc, giữ vị trí song song", "isCorrect": true}, {"content": "Chỉ người chơi thuận tay phải ở bên phải sân", "isCorrect": false}, {"content": "Hai người chơi đứng chéo nhau trên sân", "isCorrect": false}], "explanation": "Mô hình 'side-by-side' là khi cả hai người chơi di chuyển lên hoặc xuống sân cùng lúc, giữ vị trí tương đối song song với nhau để che phủ sân ngang hiệu quả nhất."}, {"title": "Khi nào thì nên thay đổi vị trí từ 'side-by-side' sang 'up-and-back'?", "options": [{"content": "Khi đối thủ đánh bóng ra ngoài", "isCorrect": false}, {"content": "Khi một người chơi cần lùi về baseline để trả bóng sâu và sau đó tiến lên Kitchen", "isCorrect": true}, {"content": "Khi bạn muốn tạo bất ngờ cho đối thủ", "isCorrect": false}, {"content": "Khi cả hai người chơi đều mệt mỏi", "isCorrect": false}], "explanation": "'Up-and-back' (một người lên Kitchen, một người lùi về) thường được sử dụng khi một trong hai người chơi cần trả bóng sâu từ baseline và cần thời gian để tiến lên Kitchen, trong khi người kia duy trì vị trí ở Kitchen để giữ áp lực."}], "description": "Bài kiểm tra này sẽ đánh giá sự hiểu biết của bạn về vị trí và di chuyển chiến thuật trong đánh đôi pickleball."}, "video": {"tags": ["Vị trí sân", "Di chuyển đôi", "Kitchen line", "Phòng thủ", "Tấn công"], "title": "Nghệ Thuật Vị Trí và Di Chuyển Đôi", "drillName": "Drill Di Chuyển Đồng Bộ Đôi", "description": "Video này sẽ hướng dẫn chi tiết về các vị trí lý tưởng trên sân trong đánh đôi, tập trung vào cách di chuyển hài hòa giữa hai người chơi. Bạn sẽ thấy các ví dụ thực tế về cách duy trì áp lực ở vạch Kitchen, cách phục hồi vị trí sau khi đánh, và cách tránh bị đối thủ khai thác khoảng trống. Video cũng nhấn mạnh tầm quan trọng của việc di chuyển theo cặp và giữ khoảng cách hợp lý để tối ưu hóa khả năng phòng thủ và tấn công.", "drillDescription": "Thực hành di chuyển song song: Hai người chơi đứng ở vạch Kitchen, mô phỏng các cú đánh volley và di chuyển sang ngang, lên xuống đồng bộ để giữ khoảng cách đều. Chú trọng vào việc luôn quay mặt về phía lưới và giữ vợt ở vị trí sẵn sàng. Sau đó, một người lùi về baseline để trả bóng, người kia vẫn ở Kitchen, sau đó người đánh baseline sẽ tiến lên Kitchen ngay lập tức.", "drillPracticeSets": "5 sets x 2 phút mỗi set"}, "description": "Bài học này tập trung vào tầm quan trọng của vị trí và di chuyển hiệu quả trong đánh đôi pickleball. Bạn sẽ học cách duy trì vị trí tối ưu ở vạch Kitchen (Non-Volley Zone), cách di chuyển đồng bộ với đồng đội khi tấn công và phòng thủ, và cách che phủ các khoảng trống trên sân. Chúng ta sẽ khám phá các mô hình di chuyển phổ biến như 'side-by-side' và 'up-and-back' để đảm bảo bạn và đồng đội luôn ở vị trí tốt nhất để kiểm soát trận đấu và phản ứng nhanh với các cú đánh của đối thủ.", "lessonNumber": 1}, {"name": "Lựa Chọn Cú Đánh Tấn Công và Phòng Thủ Nâng Cao", "quiz": {"title": "Kiểm tra Lựa Chọn Cú Đánh Tấn Công và Phòng Thủ Nâng Cao", "questions": [{"title": "Khi đối thủ đang đứng ở vạch Kitchen và bạn có cơ hội, cú đánh nào sau đây hiệu quả nhất để 'mở' sân?", "options": [{"content": "Cú 'dink' thẳng vào lưới", "isCorrect": false}, {"content": "Cú 'drive' mạnh vào khoảng trống trên sân đối thủ", "isCorrect": true}, {"content": "Cú 'lob' cao về cuối sân", "isCorrect": false}, {"content": "Cú 'smash' vào chân đối thủ", "isCorrect": false}], "explanation": "Một cú 'drive' (đánh mạnh, sâu) vào khoảng trống giữa hoặc ra rìa sân đối thủ có thể buộc họ phải di chuyển, tạo ra khoảng trống để tấn công tiếp theo hoặc buộc họ đánh bóng lỗi."}, {"title": "Mục đích chính của cú 'dink' chiến thuật là gì?", "options": [{"content": "Để kết thúc điểm ngay lập tức", "isCorrect": false}, {"content": "Để làm chậm nhịp độ trận đấu và kiểm soát bóng ở vạch Kitchen", "isCorrect": true}, {"content": "Để đánh bóng mạnh qua đối thủ", "isCorrect": false}, {"content": "Để buộc đối thủ phải lùi về baseline", "isCorrect": false}], "explanation": "Cú 'dink' chiến thuật nhằm mục đích giữ bóng thấp, buộc đối thủ phải cúi xuống đánh, gây khó khăn cho việc tấn công ngược lại và có thể tạo cơ hội cho bạn tấn công khi đối thủ mắc lỗi hoặc đánh bóng lên cao."}, {"title": "Khi bạn bị đối thủ tấn công mạnh liên tục ở vạch Kitchen, cú đánh nào là lựa chọn tốt để 'reset' điểm?", "options": [{"content": "Tiếp tục 'smash' trả lại", "isCorrect": false}, {"content": "Cú 'reset' (đánh bóng nhẹ nhàng vào Kitchen đối thủ để giành lại quyền kiểm soát)", "isCorrect": true}, {"content": "Cú 'lob' cao ra ngoài sân", "isCorrect": false}, {"content": "Cố gắng đánh thẳng ra ngoài biên", "isCorrect": false}], "explanation": "Cú 'reset' (thường là một cú 'dink' hoặc 'drop' cao hơn một chút, đủ để rơi vào Kitchen đối thủ mà không bay cao) giúp làm chậm nhịp độ, vô hiệu hóa đà tấn công của đối thủ và cho bạn thời gian để phục hồi vị trí."}, {"title": "Trong tình huống đối thủ đánh bóng 'lob' cao qua đầu bạn khi bạn đang ở Kitchen, phản ứng đầu tiên của bạn nên là gì?", "options": [{"content": "Cố gắng nhảy lên và 'smash' bóng", "isCorrect": false}, {"content": "Lùi nhanh về phía baseline để trả bóng và tiến lên lại", "isCorrect": true}, {"content": "Đứng yên và chờ đồng đội xử lý", "isCorrect": false}, {"content": "Bỏ qua bóng và chờ giao bóng lại", "isCorrect": false}], "explanation": "Khi đối thủ 'lob' qua đầu, điều quan trọng là phải lùi nhanh về phía baseline để có thể trả bóng và sau đó tiến lên lại vạch Kitchen để tái lập vị trí tấn công."}, {"title": "Điểm yếu nào của đối thủ thường được khai thác bằng cú 'drive'?", "options": [{"content": "Khả năng 'dink' tốt", "isCorrect": false}, {"content": "Phản xạ chậm hoặc di chuyển hạn chế", "isCorrect": true}, {"content": "Kỹ năng 'smash' mạnh", "isCorrect": false}, {"content": "Khả năng giao bóng chính xác", "isCorrect": false}], "explanation": "Cú 'drive' mạnh và sâu có thể khai thác điểm yếu của đối thủ nếu họ có phản xạ chậm, khả năng di chuyển hạn chế, hoặc không thoải mái khi xử lý bóng ở tốc độ cao hoặc ở vùng sân giữa."}], "description": "Bài kiểm tra này sẽ đánh giá khả năng của bạn trong việc lựa chọn và thực hiện các cú đánh tấn công và phòng thủ chiến lược trong đánh đôi."}, "video": {"tags": ["Dink", "Drive", "Smash", "Drop shot", "Reset", "Chiến thuật tấn công", "Chiến thuật phòng thủ"], "title": "Kho Vũ Khí Cú Đánh Đôi Tối Ưu", "drillName": "Drill Tấn Công/Phòng Thủ Cú Đánh Đa Dạng", "description": "Video này minh họa các loại cú đánh tấn công và phòng thủ khác nhau trong đánh đôi nâng cao. Bạn sẽ được xem các ví dụ về 'dink' chiến lược để di chuyển đối thủ, 'drive' để tạo khoảng trống, và 'smash' để kết thúc điểm. Video cũng chỉ ra cách sử dụng các cú 'reset' và 'block' để hóa giải áp lực của đối thủ, đồng thời cung cấp mẹo để đọc ý định của đối thủ và chọn cú đánh phản công hiệu quả nhất.", "drillDescription": "Thực hành 'dink' mục tiêu và 'drive' khoảng trống: Hai cặp đôi đứng ở vạch Kitchen. Một cặp thực hiện các cú 'dink' đặt bóng vào các góc cụ thể của sân đối thủ. Cặp còn lại phòng thủ và cố gắng 'dink' trả lại hoặc thực hiện cú 'drive' vào khoảng trống khi có cơ hội. Luân phiên vai trò tấn công/phòng thủ.", "drillPracticeSets": "4 sets x 5 phút mỗi set"}, "description": "Bài học này sẽ đào sâu vào nghệ thuật lựa chọn cú đánh trong đánh đôi. Bạn sẽ học cách phân tích tình huống để quyết định khi nào nên thực hiện một cú 'dink' mềm mại, khi nào nên đánh một cú 'drive' mạnh mẽ, và khi nào là thời điểm thích hợp để 'smash' hoặc 'drop shot'. Chúng ta cũng sẽ xem xét các chiến lược phòng thủ như cách trả giao bóng hiệu quả, cách chặn các cú smash, và cách sử dụng các cú 'reset' để giành lại quyền kiểm soát điểm. Mục tiêu là giúp bạn phát triển một kho vũ khí cú đánh đa dạng và biết cách áp dụng chúng một cách chiến lược.", "lessonNumber": 2}, {"name": "Giao Tiếp, Làm Việc Nhóm và Thích Nghi với Đối Thủ", "quiz": {"title": "Kiểm tra Giao Tiếp, Làm Việc Nhóm và Thích Nghi với Đối Thủ", "questions": [{"title": "Tại sao việc giao tiếp là tối quan trọng trong đánh đôi pickleball?", "options": [{"content": "Để làm phân tâm đối thủ", "isCorrect": false}, {"content": "Để tránh nhầm lẫn, phối hợp tốt hơn và che phủ sân hiệu quả", "isCorrect": true}, {"content": "Để ra hiệu cho trọng tài", "isCorrect": false}, {"content": "Để khoe khoang với khán giả", "isCorrect": false}], "explanation": "Giao tiếp giúp tránh nhầm lẫn về việc ai sẽ đánh bóng, đảm bảo sự phối hợp nhịp nhàng và giúp che phủ sân hiệu quả hơn, giảm thiểu các lỗi không đáng có."}, {"title": "Khi một quả bóng bay giữa hai người chơi, cách tốt nhất để quyết định ai sẽ đánh là gì?", "options": [{"content": "Người chơi gần lưới hơn nên đánh", "isCorrect": false}, {"content": "Người chơi nào thuận tay hơn hoặc ở vị trí tốt hơn nên gọi bóng và đánh", "isCorrect": true}, {"content": "Người chơi nào phát bóng ở điểm trước nên đánh", "isCorrect": false}, {"content": "Không cần quyết định, để bóng tự rơi", "isCorrect": false}], "explanation": "Người chơi nào thuận tay hơn (forehand) hoặc ở vị trí tốt hơn để đánh (ví dụ, đang tiến về phía bóng) nên gọi bóng và thực hiện cú đánh. Điều này cần được thống nhất từ trước hoặc ra hiệu nhanh chóng."}, {"title": "Khi bạn nhận thấy đối thủ có một cú 'dink' yếu ở phía tay trái của họ, chiến thuật thích nghi của bạn nên là gì?", "options": [{"content": "Tránh đánh vào phía tay trái của họ để không làm họ bối rối", "isCorrect": false}, {"content": "Liên tục 'dink' bóng vào phía tay trái của đối thủ để khai thác điểm yếu", "isCorrect": true}, {"content": "Đánh mạnh vào giữa sân", "isCorrect": false}, {"content": "Chỉ tập trung vào cú 'smash'", "isCorrect": false}], "explanation": "Khai thác điểm yếu của đối thủ bằng cách liên tục 'dink' bóng vào phía tay trái yếu của họ sẽ gây áp lực, buộc họ mắc lỗi hoặc đánh bóng lên cao để bạn tấn công."}, {"title": "Một tín hiệu phi lời nói phổ biến để nói với đồng đội rằng bạn sẽ đánh bóng 'lob' qua đầu đối thủ là gì?", "options": [{"content": "Vỗ tay hai lần", "isCorrect": false}, {"content": "Chỉ ngón tay cái lên cao (hoặc nói 'lob')", "isCorrect": true}, {"content": "Lắc đầu qua lại", "isCorrect": false}, {"content": "Giả vờ như bạn sẽ đánh một cú 'smash'", "isCorrect": false}], "explanation": "Chỉ ngón tay cái lên cao hoặc nói 'lob' là những cách hiệu quả để thông báo ý định đánh 'lob' của bạn, giúp đồng đội chuẩn bị di chuyển hoặc che phủ sân sau."}, {"title": "Điều gì quan trọng nhất khi bạn và đồng đội của bạn đang ở trong tình thế phòng thủ kéo dài?", "options": [{"content": "Cố gắng kết thúc điểm bằng một cú 'smash' mạo hiểm", "isCorrect": false}, {"content": "Kêu gọi time-out ngay lập tức", "isCorrect": false}, {"content": "Kiên nhẫn 'reset' điểm, giữ bóng an toàn và chờ cơ hội phản công", "isCorrect": true}, {"content": "Đứng yên và chờ đối thủ mắc lỗi", "isCorrect": false}], "explanation": "Khi ở thế phòng thủ, điều quan trọng nhất là phải kiên nhẫn, cố gắng 'reset' điểm bằng cách đưa bóng an toàn vào Kitchen đối thủ hoặc chờ cơ hội phản công. Hạn chế các cú đánh mạo hiểm có thể dẫn đến lỗi."}], "description": "Bài kiểm tra này sẽ đánh giá kiến thức của bạn về giao tiếp, làm việc nhóm và khả năng thích nghi chiến thuật trong đánh đôi pickleball."}, "video": {"tags": ["Giao tiếp", "Làm việc nhóm", "Thích nghi", "Phân tích đối thủ", "Chiến thuật nâng cao"], "title": "Sức Mạnh Của Teamwork và Thích Nghi", "drillName": "Drill Giao Tiếp và Thích Nghi Chiến Thuật", "description": "Video này trình bày các kỹ thuật giao tiếp hiệu quả giữa các đối tác trong đánh đôi, bao gồm cả tín hiệu tay và các từ ngữ ngắn gọn. Nó cũng khám phá cách phân tích lối chơi của đối thủ ngay trong trận đấu, từ đó điều chỉnh chiến thuật để giành lợi thế. Bạn sẽ học cách làm việc nhóm để che phủ sân, đưa ra quyết định nhanh chóng và cùng nhau vượt qua những tình huống khó khăn, biến điểm yếu của đối thủ thành cơ hội của mình.", "drillDescription": "Thực hành giao tiếp và phân tích: Một cặp đôi chơi đấu với một cặp đôi khác. Sau mỗi 3-5 điểm, cả hai đội tạm dừng để thảo luận về chiến thuật, điểm mạnh/yếu của đối thủ và cách phối hợp tốt hơn. Người hướng dẫn sẽ đưa ra các tình huống khác nhau để các đội phải thích nghi (ví dụ: đối thủ chuyên 'dink', đối thủ chuyên 'smash').", "drillPracticeSets": "3-4 trận đấu thử nghiệm, mỗi trận 10-15 điểm"}, "description": "Bài học cuối cùng này tập trung vào các yếu tố phi kỹ thuật nhưng cực kỳ quan trọng: giao tiếp hiệu quả, tinh thần đồng đội và khả năng thích nghi chiến thuật. Bạn sẽ học các phương pháp giao tiếp phi lời nói và lời nói để phối hợp tốt hơn với đồng đội, từ việc gọi bóng, xác định ai sẽ đánh, cho đến việc động viên lẫn nhau. Chúng ta cũng sẽ tìm hiểu cách đọc trận đấu của đối thủ, nhận diện điểm mạnh, điểm yếu của họ và điều chỉnh chiến thuật của mình một cách linh hoạt. Bài học này sẽ giúp bạn và đồng đội trở thành một đơn vị gắn kết, có khả năng giải quyết mọi thử thách trên sân.", "lessonNumber": 3}], "description": "Khóa học này được thiết kế dành cho những người chơi pickleball muốn nâng cao kỹ năng chiến thuật trong đánh đôi. Bạn sẽ được học các nguyên tắc cơ bản và nâng cao về vị trí trên sân, di chuyển thông minh, lựa chọn cú đánh phù hợp trong từng tình huống, và cách giao tiếp hiệu quả với đồng đội. Khóa học đi sâu vào các chiến lược tấn công và phòng thủ, cách đối phó với những kiểu đối thủ khác nhau, và cách tận dụng điểm yếu của đối phương. Chúng tôi sẽ phân tích các tình huống thực tế, từ đó giúp bạn phát triển khả năng đọc trận đấu, ra quyết định nhanh chóng và tối ưu hóa hiệu suất thi đấu. Với 3 bài học chuyên sâu, bạn sẽ tự tin hơn khi bước vào sân, sẵn sàng áp dụng các chiến thuật phức tạp để giành chiến thắng trong các trận đấu đôi."}	USED	2025-12-10 06:49:44.972282	2025-12-10 10:25:30.184044	\N	2	19
\.


--
-- TOC entry 4088 (class 0 OID 18549)
-- Dependencies: 244
-- Data for Name: ai_video_comparison_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_video_comparison_results (id, summary, learner_score, "keyDifferents", details, "recommendationDrills", coach_note, created_at, learner_video_id, video_id) FROM stdin;
22	Cú thuận tay của Học viên có động tác kéo vợt về sau cao, dẫn đến điểm tiếp xúc bóng cao và theo đà vung vợt kém mở rộng hơn so với Huấn luyện viên.	68	[{"aspect": "Hạ vợt (kéo vợt về sau)", "impact": "Giảm lực tiềm năng và chiều cao tiếp xúc tối ưu.", "learnerTechnique": "Đầu vợt giữ cao, cổ tay cao hơn khuỷu tay khi kéo vợt về sau."}, {"aspect": "Điểm tiếp xúc bóng", "impact": "Ảnh hưởng đến khả năng kiểm soát, tính nhất quán và tạo xoáy.", "learnerTechnique": "Tiếp xúc bóng cao hơn, gần ngang eo/ngực, ít xoay người."}, {"aspect": "Độ dài theo đà vung vợt", "impact": "Hạn chế truyền lực và kiểm soát bóng.", "learnerTechnique": "Theo đà vung vợt ngắn hơn, vợt kết thúc cao hơn trên cơ thể."}]	[{"type": "PREPARATION", "advanced": "Huấn luyện viên hạ đầu vợt đáng kể dưới cổ tay và khuỷu tay trong giai đoạn kéo vợt về sau, tạo đường vung vợt mạnh mẽ, hướng lên.", "strengths": ["Tư thế khởi đầu tốt."], "weaknesses": ["Đầu vợt giữ quá cao khi kéo vợt về sau (cổ tay cao hơn khuỷu tay).", "Phần thân dưới ít tham gia hiệu quả vào việc hạ vợt."], "coachTimestamp": 0.5, "learnerTimestamp": 0.5}, {"type": "SWING_AND_CONTACT", "advanced": "Huấn luyện viên tiếp xúc bóng ở điểm thấp hơn, nhất quán hơn (ngang hông) với sự xoay hông và vai mạnh mẽ để đạt lực và kiểm soát tối đa.", "strengths": ["Mặt vợt có vẻ vuông góc tại điểm tiếp xúc."], "weaknesses": ["Điểm tiếp xúc bóng cao hơn rõ rệt (ngang eo/ngực).", "Xoay người chưa đủ trong suốt cú vung.", "Cánh tay vươn ra quá mức so với lý tưởng, giảm truyền lực."], "coachTimestamp": 1, "learnerTimestamp": 1.5}, {"type": "FOLLOW_THROUGH", "advanced": "Huấn luyện viên thể hiện động tác theo đà vung vợt kéo dài, đầy đủ qua cơ thể, đảm bảo truyền lực hoàn chỉnh và kiểm soát quỹ đạo.", "strengths": ["Vợt vung qua cơ thể."], "weaknesses": ["Theo đà vung vợt ngắn hơn và kết thúc cao hơn.", "Ít sự linh hoạt trong chuyển động sau khi tiếp xúc bóng."], "coachTimestamp": 2, "learnerTimestamp": 2}]	[{"name": "Bài tập đánh bóng không có bóng", "description": "Thực hiện động tác vung vợt mà không có bóng, tập trung vào việc thả đầu vợt xuống dưới cổ tay và khuỷu tay trong giai đoạn kéo vợt về sau.", "practiceSets": "3 hiệp x 10 lần, tập trung cảm giác rơi của vợt."}, {"name": "Bài tập tiếp xúc thấp với cone", "description": "Đặt một cái cone hoặc vật nhỏ ở vị trí tiếp xúc thấp mong muốn (ví dụ: ngang hông). Luyện tập đánh bóng sao cho điểm tiếp xúc ở ngang hoặc thấp hơn cone.", "practiceSets": "3 hiệp x 15 lần, ưu tiên tiếp xúc thấp."}, {"name": "Bài tập theo đà vung vợt kéo dài", "description": "Sau khi tiếp xúc bóng, cố gắng kéo dài chuyển động theo đà của vợt xa nhất có thể qua cơ thể, giữ vợt ở vị trí thấp và lỏng tay.", "practiceSets": "3 hiệp x 10 lần, tập trung biên độ chuyển động và thoải mái."}]	Cần cải thiện thêm	2025-12-08 01:02:47.19142	12	65
23	Học viên cần cải thiện tư thế chuẩn bị, động tác xoay hông để tạo lực và hoàn tất cú đánh với theo đà đầy đủ để tăng sức mạnh và kiểm soát.	65	[{"aspect": "Tư thế chuẩn bị", "impact": "Hạn chế khả năng tạo lực và di chuyển linh hoạt.", "learnerTechnique": "Học viên đứng thẳng hơn, ít gập gối và hông so với huấn luyện viên."}, {"aspect": "Xoay thân và tạo lực", "impact": "Giảm sức mạnh và độ ổn định của cú đánh.", "learnerTechnique": "Học viên ít xoay hông và vai, chủ yếu dùng lực cánh tay trong pha vung vợt."}, {"aspect": "Theo đà kết thúc (Follow-Through)", "impact": "Ảnh hưởng đến độ sâu và hướng của bóng.", "learnerTechnique": "Vợt của học viên kết thúc gần thân, không vươn xa và cao như huấn luyện viên."}]	[{"type": "PREPARATION", "advanced": "Huấn luyện viên thể hiện tư thế chuẩn bị thấp và năng động hơn, giúp sẵn sàng cho các pha di chuyển và tạo lực. Học viên có tư thế cao hơn, làm giảm tiềm năng bùng nổ.", "strengths": ["Tay cầm vợt tốt", "Mắt tập trung vào bóng"], "weaknesses": ["Đứng quá thẳng", "Ít gập gối và hông, khiến cơ thể ít được tải lực"], "coachTimestamp": 0, "learnerTimestamp": 0.5}, {"type": "SWING_AND_CONTACT", "advanced": "Huấn luyện viên sử dụng động tác xoay hông và vai hiệu quả để truyền lực vào cú đánh. Học viên dựa nhiều vào lực cánh tay, dẫn đến cú đánh thiếu sức mạnh và kiểm soát.", "strengths": ["Tiếp xúc bóng khá ổn định"], "weaknesses": ["Ít xoay thân dưới", "Điểm tiếp xúc bóng có thể hơi xa cơ thể", "Cổ tay có vẻ gập hơn so với huấn luyện viên"], "coachTimestamp": 1.5, "learnerTimestamp": 2}, {"type": "FOLLOW_THROUGH", "advanced": "Huấn luyện viên hoàn thành cú đánh với vợt vươn dài và cao, đảm bảo kiểm soát và độ sâu của bóng. Học viên có theo đà ngắn hơn, vợt thường kết thúc gần thân.", "strengths": ["Giữ thăng bằng tốt sau cú đánh"], "weaknesses": ["Theo đà kết thúc không đủ dài", "Hạn chế độ xoáy và tốc độ bóng", "Vợt không vươn qua vai một cách tự nhiên"], "coachTimestamp": 2.5, "learnerTimestamp": 4}]	[{"name": "Bài tập tư thế thấp (Low Stance Drill)", "description": "Thực hiện di chuyển và đánh bóng trong khi duy trì tư thế ngồi xổm thấp. Tập trung vào việc gập đầu gối và hông.", "practiceSets": "3 sets, 10 lần mỗi set."}, {"name": "Bài tập xoay hông (Hip Rotation Drill)", "description": "Đặt một cây gậy ngang qua hông và tập xoay hông trước khi vung vợt. Đảm bảo vai xoay theo hông.", "practiceSets": "4 sets, 12 lần mỗi set."}, {"name": "Bài tập theo đà dài (Extended Follow-Through Drill)", "description": "Thực hiện cú đánh với mục tiêu vươn vợt xa nhất có thể qua vai đối diện. Giữ vợt ở vị trí kết thúc trong 2 giây.", "practiceSets": "3 sets, 15 lần mỗi set."}]	Can tap luyen them	2025-12-08 06:40:58.975976	13	63
\.


--
-- TOC entry 4114 (class 0 OID 18774)
-- Dependencies: 270
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendances (id, status, created_at, user_id, session_id) FROM stdin;
4	PRESENT	2025-12-06 05:45:52.034978	4	41
5	PRESENT	2025-12-08 06:37:58.375224	4	58
\.


--
-- TOC entry 4124 (class 0 OID 18858)
-- Dependencies: 280
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, name, bin) FROM stdin;
1	VietcomBank	970436
2	VietinBank	970415
3	Techcombank	970407
4	BIDV	970418
5	AgriBank	970405
6	Navibank	970419
7	Sacombank	970403
8	ACB	970416
9	MBBank	970422
10	TPBank	970423
11	Shinhan Bank	970424
12	VIB Bank	970441
13	VPBank	970432
14	SHB	970443
15	Eximbank	970431
16	BaoVietBank	970438
17	VietcapitalBank	970454
18	SCB	970429
19	VietNam - Russia Bank	970421
20	ABBank	970425
21	PVCombank	970412
22	MBV	970414
23	NamA bank	970428
24	HDBank	970437
25	HDBank	970420
26	VietBank	970433
27	VietCredit	970460
28	Public bank	970439
29	Hongleong Bank	970442
30	PG Bank	970430
31	Co.op Bank	970446
32	CIMB	422589
33	Indovina	970434
34	Vikki Digital Bank	970406
35	GPBank	970408
36	BacABank	970409
37	VietABank	970427
38	SaigonBank	970400
39	MSB	970426
40	LPBank	970449
41	KienLongBank	970452
42	IBK - Ha Noi	970455
43	IBK - TP.HCM	970456
44	Woori bank	970457
45	SeABank	970440
46	UOB	970458
47	OCB	970448
48	Mirae Asset	9777777
49	Keb Hana - Ho Chi Minh	970466
50	Keb Hana - Ha Noi	970467
51	Standard Chartered	970410
52	CAKE	546034
53	Ubank	546035
54	Nonghyup Bank - HN	801011
55	Kookmin - HN	970462
56	Kookmin - HCM	970463
57	DBS - HCM	796500
58	CBBank	970444
59	KBank - HCM	668888
60	HSBC	458761
61	Timo	
62	CITI	533948
63	VNPT Money	971011
64	Viettel Money	971005
65	VBSP	999888
66	PVcomBank Pay	971133
67	BNP PARIBAS HN	963668
68	BNP PARIBAS HCM	963666
69	Cathay -HCM	168999
70	BIDC	555666
71	Tài chính Shinhan	963368
72	Bank of China (HK) - HCM	963688
73	Vikki by HDBank	963311
74	Umee	963399
75	Liobank	963369
76	MVAS	971032
\.


--
-- TOC entry 4144 (class 0 OID 19428)
-- Dependencies: 300
-- Data for Name: base_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.base_credentials (id, name, description, type, public_url, created_at, updated_at, deleted_at) FROM stdin;
2	Giảng viên IPTPA Cấp 2	Chứng chỉ huấn luyện nâng cao về kỹ thuật, chiến thuật và phát triển vận động viên cho trình độ trung cấp đến nâng cao.	CERTIFICATE	https://example.com/credentials/iptpa-level-2	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
3	Vô địch Đôi nam nữ Khu vực 2024	Đoạt hạng nhất tại giải đấu đôi nam nữ cấp khu vực có chứng nhận.	PRIZE	https://example.com/credentials/regional-mixed-2024	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
4	Quán quân Bảng xếp hạng Đơn Câu lạc bộ	Kết thúc mùa giải với vị trí số 1 trên bảng xếp hạng đơn của câu lạc bộ.	ACHIEVEMENT	https://example.com/credentials/club-singles-ladder	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
5	Xếp hạng DUPR 4.5	Đạt xếp hạng DUPR chính thức 4.5 thông qua các trận đấu đã được xác minh.	ACHIEVEMENT	https://example.com/credentials/dupr-4-5	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
6	Hoàn thành SafeSport & Sơ cứu	Hoàn tất các khóa về an toàn vận động viên, SafeSport và sơ cứu cơ bản trong môi trường huấn luyện.	CERTIFICATE	https://example.com/credentials/safesport-first-aid	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
7	Huấn luyện viên chính Chương trình Phát triển Thanh thiếu niên	Đảm nhiệm vai trò huấn luyện viên chính cho một chương trình phát triển pickleball dành cho thanh thiếu niên trong ít nhất một mùa.	ACHIEVEMENT	https://example.com/credentials/youth-program-coach	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
8	Á quân Đôi nam Cúp Bang	Vào tới trận chung kết nội dung đôi nam của giải mở cấp bang.	PRIZE	https://example.com/credentials/state-open-finalist	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
1	Huấn luyện viên được chứng nhận PPR Cấp 1	Hoàn thành chứng chỉ huấn luyện pickleball Cấp 1 được công nhận, tập trung cho người mới bắt đầu và người ở mức cải thiện.	CERTIFICATE	https://vntaacademy.com/wp-content/uploads/2024/10/Chung-chi-quoc-te-PPR-Pickleball-Professional-Pickleball-Registry-Level-1-cua-hoc-vien-VNTA-Academy-Hoc-Vien-VNTA-Academy-scaled.jpg	2025-12-05 05:43:31.18831	2025-12-05 05:43:31.18831	\N
\.


--
-- TOC entry 4070 (class 0 OID 18344)
-- Dependencies: 226
-- Data for Name: coaches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coaches (id, bio, specialties, teaching_methods, year_of_experience, verification_status, created_at, updated_at, deleted_at, user_id) FROM stdin;
2	Huấn luyện viên pickleball chuyên nghiệp với nhiều năm kinh nghiệm	{"Kỹ thuật cơ bản","Chiến thuật thi đấu","Phát bóng","Phòng thủ"}	{"Học qua video","Thực hành trực tiếp","Phân tích kỹ thuật"}	4	VERIFIED	2025-11-22 10:48:22.050085	2025-11-22 10:48:22.050085	\N	3
1	Huấn luyện viên pickleball chuyên nghiệp với nhiều năm kinh nghiệm	{"Kỹ thuật cơ bản","Chiến thuật thi đấu","Phát bóng","Phòng thủ"}	{"Học qua video","Thực hành trực tiếp","Phân tích kỹ thuật"}	6	VERIFIED	2025-11-22 10:48:21.71965	2025-12-02 16:22:08.980833	\N	2
16	Huấn luyện viên pickleball chuyên nghiệp với nhiều năm kinh nghiệm	{"Kỹ thuật cơ bản","Chiến thuật thi đấu","Phát bóng","Phòng thủ"}	{"Học qua video","Thực hành trực tiếp","Phân tích kỹ thuật"}	2	UNVERIFIED	2025-12-13 22:24:41.30516	2025-12-13 22:24:41.30516	\N	22
17	Huấn luyện viên pickleball chuyên nghiệp với nhiều năm kinh nghiệm	{"Kỹ thuật cơ bản","Chiến thuật thi đấu","Phát bóng","Phòng thủ"}	{"Học qua video","Thực hành trực tiếp","Phân tích kỹ thuật"}	3	UNVERIFIED	2025-12-13 22:24:41.30516	2025-12-13 22:24:41.30516	\N	23
\.


--
-- TOC entry 4136 (class 0 OID 18950)
-- Dependencies: 292
-- Data for Name: configurations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configurations (id, key, value, description, data_type, created_at, updated_at, created_by, updated_by) FROM stdin;
5	course_start_before_days	1	Number of days before course start date to automatically start the course	number	2025-11-22 10:47:43.771078	2025-11-22 10:47:43.771078	\N	\N
6	complete_session_before_hours	24	Number of hours before session end time to allow marking session as complete	number	2025-11-22 10:47:43.771078	2025-11-22 10:47:43.771078	\N	\N
7	course_start_date_after_days_from_now	7	Number of days from now that a course can be scheduled to start	number	2025-11-22 10:47:43.771078	2025-11-22 10:47:43.771078	\N	\N
8	max_participants_per_course	12	Maximum number of participants allowed per course	number	2025-11-22 10:47:43.771078	2025-11-22 10:47:43.771078	\N	\N
9	change_schedule_before_hours	48	Number of hours before schedule time to allow changing the schedule	number	2025-11-22 10:47:43.771078	2025-11-22 10:47:43.771078	\N	\N
4	platform_fee_per_percentage	10	Phí nền tảng theo phần trăm	number	2025-11-22 10:47:43.771078	2025-12-06 07:17:46.846546	\N	1
\.


--
-- TOC entry 4112 (class 0 OID 18740)
-- Dependencies: 268
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, name, description, level, learning_format, status, public_url, min_participants, max_participants, price_per_participant, current_participants, total_sessions, total_earnings, start_date, end_date, progress_pct, created_at, updated_at, deleted_at, cancelling_reason, created_by, subject_id, court_id, google_meet_link) FROM stdin;
29	Pickleball Nâng cao -  Khóa 1	Huấn luyên nâng cao các động tác cho môn pickleball	ADVANCED	INDIVIDUAL	COMPLETED	https://file.hstatic.net/200000848145/article/anh-dai-dien-pickleball-la-gi_21c1ca7f9e214633ac03d2415dc87ffa.jpg	1	1	2000.000	1	1	1800.000	2025-12-08	2025-12-08	100	2025-12-08 00:17:33.298811	2025-12-08 06:37:58.375224	\N	\N	2	10	47	abc-xyz-def
32	Nhập môn Pickleball -  Khóa 3	Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.	BEGINNER	INDIVIDUAL	APPROVED	\N	1	1	500000.000	0	4	0.000	2025-12-25	2026-01-15	0	2025-12-12 15:12:50.932808	2025-12-13 05:52:19.685641	\N	\N	2	2	62	asd-gjhk-asd
31	Nhập môn Pickleball -  Khóa 2	Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.	BEGINNER	INDIVIDUAL	APPROVED	https://pz-picklaball.b-cdn.net/course_image/506098/course_image_5581_1765465047085.jpeg	1	1	2000.000	0	4	0.000	2025-12-24	2026-01-14	0	2025-12-11 14:57:27.091465	2025-12-14 02:37:11.411446	\N	\N	2	2	47	asd-dasd-asd
30	Pickleball Nâng cao -  Khóa 2	Huấn luyên nâng cao các động tác cho môn pickleball	ADVANCED	INDIVIDUAL	ON_GOING	https://pz-picklaball.b-cdn.net/course_image/978445/course_image_98382_1765175577637.jpeg	1	1	2000.000	1	1	1800.000	2025-12-16	2025-12-16	0	2025-12-08 06:32:59.1294	2025-12-15 00:00:00.159316	\N	\N	2	10	47	\N
18	Nhập môn Pickleball -  Khóa 1	Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.	BEGINNER	INDIVIDUAL	ON_GOING	https://facolospickleball.com/wp-content/uploads/2025/05/lam-sao-de-choi-pickleball-gioi-2.jpg	1	1	2000.000	1	4	1800.000	2025-12-06	2026-12-22	25	2025-12-06 05:39:35.613804	2025-12-06 05:45:52.034978	\N	\N	2	2	47	abc-def-xyz
\.


--
-- TOC entry 4110 (class 0 OID 18695)
-- Dependencies: 266
-- Data for Name: courts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courts (id, name, phone_number, price_per_hour, public_url, address, province_id, district_id, latitude, longitude) FROM stdin;
1	Sân Pickleball Quận Ba Đình	+84155018242	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	1	21.035200	105.835000
4	Sân Pickleball Quận Long Biên	+84742100327	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	4	21.036700	105.897600
5	Sân Pickleball Quận Cầu Giấy	+84739628844	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	5	21.033300	105.794400
6	Sân Pickleball Quận Đống Đa	+84909844720	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	6	21.014400	105.825700
7	Sân Pickleball Quận Hai Bà Trưng	+84289136655	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	7	21.007900	105.848100
8	Sân Pickleball Quận Hoàng Mai	+84169246885	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	8	20.981700	105.846800
9	Sân Pickleball Quận Thanh Xuân	+84767001932	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	9	20.995200	105.806700
10	Sân Pickleball Huyện Sóc Sơn	+84424780422	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	10	21.254700	105.842300
11	Sân Pickleball Huyện Đông Anh	+84990886294	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	11	21.137200	105.846300
12	Sân Pickleball Huyện Gia Lâm	+84227531262	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	12	20.985500	105.973300
13	Sân Pickleball Quận Nam Từ Liêm	+84296163670	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	13	21.012500	105.744700
14	Sân Pickleball Huyện Thanh Trì	+84387810389	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	14	20.946700	105.803800
15	Sân Pickleball Quận Bắc Từ Liêm	+84443739787	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	15	21.077400	105.734300
16	Sân Pickleball Huyện Mê Linh	+84684454802	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	16	21.174500	105.693100
17	Sân Pickleball Quận Hà Đông	+84746213185	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	17	20.971600	105.779500
18	Sân Pickleball Thị xã Sơn Tây	+84594587821	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	18	21.139200	105.507500
19	Sân Pickleball Huyện Ba Vì	+84748030979	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	19	21.339500	105.374800
20	Sân Pickleball Huyện Phúc Thọ	+84615934024	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	20	21.138300	105.689200
21	Sân Pickleball Huyện Đan Phượng	+84770291175	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	21	21.138300	105.600000
22	Sân Pickleball Huyện Hoài Đức	+84663471984	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	22	21.033300	105.650000
23	Sân Pickleball Huyện Quốc Oai	+84629183909	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	23	21.066700	105.550000
24	Sân Pickleball Huyện Thạch Thất	+84531704469	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	24	21.116700	105.516700
25	Sân Pickleball Huyện Chương Mỹ	+84897618800	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	25	20.866700	105.583300
26	Sân Pickleball Huyện Thanh Oai	+84756355228	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	26	20.850000	105.766700
27	Sân Pickleball Huyện Thường Tín	+84443794846	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	27	20.783300	105.866700
28	Sân Pickleball Huyện Phú Xuyên	+84318750870	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	28	20.683300	105.916700
29	Sân Pickleball Huyện Ứng Hòa	+84616087463	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	29	20.650000	105.750000
30	Sân Pickleball Huyện Mỹ Đức	+84839966695	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	30	20.583300	105.733300
31	Sân Pickleball Thành phố Nha Trang	+84926580179	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	404	12.238800	109.196700
32	Sân Pickleball Thành phố Cam Ranh	+84253164656	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	405	11.921600	109.159400
33	Sân Pickleball Huyện Cam Lâm	+84968281935	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	406	12.033100	109.150000
34	Sân Pickleball Huyện Vạn Ninh	+84508554899	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	407	12.700000	109.383300
35	Sân Pickleball Thị xã Ninh Hòa	+84661040461	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	408	12.483300	109.116700
36	Sân Pickleball Huyện Khánh Vĩnh	+84158249531	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	409	12.266700	108.850000
37	Sân Pickleball Huyện Diên Khánh	+84911490901	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	410	12.183300	109.083300
38	Sân Pickleball Huyện Khánh Sơn	+84788716517	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	411	12.100000	108.933300
39	Sân Pickleball Huyện Trường Sa	+84930250419	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	37	412	8.650000	111.916700
40	Sân Pickleball Quận 1	+84670767163	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	536	10.776900	106.700900
41	Sân Pickleball Quận 12	+84149726036	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	537	10.852500	106.676800
42	Sân Pickleball Quận Gò Vấp	+84721924030	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	538	10.837500	106.666000
43	Sân Pickleball Quận Bình Thạnh	+84579377829	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	539	10.801700	106.710100
44	Sân Pickleball Quận Tân Bình	+84588862816	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	540	10.799100	106.654400
45	Sân Pickleball Quận Tân Phú	+84213335362	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	541	10.786700	106.628600
2	Sân Pickleball Quận Hoàn Kiếm	+84599997059	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	2	21.028500	105.854200
3	Sân Pickleball Quận Tây Hồ	+84929742584	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	1	3	21.053800	105.819200
46	Sân Pickleball Quận Phú Nhuận	+84393585261	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	542	10.797200	106.683100
47	Sân Pickleball Thành phố Thủ Đức	+84631135523	250000.000	\N	Số 46 đường 447, phường Tăng Nhơn Phú A	50	543	10.854200	106.767200
48	Sân Pickleball Quận 3	+84954870569	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	544	10.786700	106.683100
49	Sân Pickleball Quận 10	+84565051256	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	545	10.772800	106.668300
50	Sân Pickleball Quận 11	+84642949799	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	546	10.762600	106.650600
51	Sân Pickleball Quận 4	+84944490282	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	547	10.762200	106.705400
52	Sân Pickleball Quận 5	+84135919754	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	548	10.754200	106.681300
53	Sân Pickleball Quận 6	+84120986247	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	549	10.748700	106.634500
54	Sân Pickleball Quận 8	+84965485868	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	550	10.737800	106.629200
55	Sân Pickleball Quận Bình Tân	+84305597199	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	551	10.741300	106.605500
56	Sân Pickleball Quận 7	+84881817372	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	552	10.732900	106.717200
57	Sân Pickleball Huyện Củ Chi	+84969169732	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	553	11.019400	106.493100
58	Sân Pickleball Huyện Hóc Môn	+84808342741	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	554	10.883300	106.583300
59	Sân Pickleball Huyện Bình Chánh	+84668983287	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	555	10.566700	106.533300
60	Sân Pickleball Huyện Nhà Bè	+84988070075	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	556	10.650000	106.750000
61	Sân Pickleball Huyện Cần Giờ	+84449095473	250000.000	\N	123 Đường Lý Thường Kiệt, Phường 1	50	557	10.416700	106.950000
62	Sân Pickleball Quận 12 - Chi nhánh 2	+84123456789	250000.000	\N	456 Đường Tô Ký, Phường Trung Mỹ Tây	50	537	10.856000	106.682000
\.


--
-- TOC entry 4068 (class 0 OID 18324)
-- Dependencies: 224
-- Data for Name: credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credentials (id, issued_at, expires_at, created_at, updated_at, deleted_at, coach_id, base_credential_id, public_url) FROM stdin;
3	2018-05-12	2027-02-12	2025-12-05 03:29:17.917604	2025-12-05 03:29:17.917604	\N	1	1	\N
7	2018-05-12	2027-02-12	2025-12-13 22:25:57.145387	2025-12-13 22:25:57.145387	\N	16	1	\N
8	2018-05-12	2027-02-12	2025-12-13 22:25:57.145387	2025-12-13 22:25:57.145387	\N	17	1	\N
\.


--
-- TOC entry 4106 (class 0 OID 18680)
-- Dependencies: 262
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.districts (id, name, province_id) FROM stdin;
1	Quận Ba Đình	1
2	Quận Hoàn Kiếm	1
3	Quận Tây Hồ	1
4	Quận Long Biên	1
5	Quận Cầu Giấy	1
6	Quận Đống Đa	1
7	Quận Hai Bà Trưng	1
8	Quận Hoàng Mai	1
9	Quận Thanh Xuân	1
10	Huyện Sóc Sơn	1
11	Huyện Đông Anh	1
12	Huyện Gia Lâm	1
13	Quận Nam Từ Liêm	1
14	Huyện Thanh Trì	1
15	Quận Bắc Từ Liêm	1
16	Huyện Mê Linh	1
17	Quận Hà Đông	1
18	Thị xã Sơn Tây	1
19	Huyện Ba Vì	1
20	Huyện Phúc Thọ	1
21	Huyện Đan Phượng	1
22	Huyện Hoài Đức	1
23	Huyện Quốc Oai	1
24	Huyện Thạch Thất	1
25	Huyện Chương Mỹ	1
26	Huyện Thanh Oai	1
27	Huyện Thường Tín	1
28	Huyện Phú Xuyên	1
29	Huyện Ứng Hòa	1
30	Huyện Mỹ Đức	1
31	Thành phố Hà Giang	2
32	Huyện Đồng Văn	2
33	Huyện Mèo Vạc	2
34	Huyện Yên Minh	2
35	Huyện Quản Bạ	2
36	Huyện Vị Xuyên	2
37	Huyện Bắc Mê	2
38	Huyện Hoàng Su Phì	2
39	Huyện Xín Mần	2
40	Huyện Bắc Quang	2
41	Huyện Quang Bình	2
42	Thành phố Cao Bằng	3
43	Huyện Bảo Lâm	3
44	Huyện Bảo Lạc	3
45	Huyện Hà Quảng	3
46	Huyện Trùng Khánh	3
47	Huyện Hạ Lang	3
48	Huyện Quảng Hòa	3
49	Huyện Hoà An	3
50	Huyện Nguyên Bình	3
51	Huyện Thạch An	3
52	Thành Phố Bắc Kạn	4
53	Huyện Pác Nặm	4
54	Huyện Ba Bể	4
55	Huyện Ngân Sơn	4
56	Huyện Bạch Thông	4
57	Huyện Chợ Đồn	4
58	Huyện Chợ Mới	4
59	Huyện Na Rì	4
60	Thành phố Tuyên Quang	5
61	Huyện Lâm Bình	5
62	Huyện Na Hang	5
63	Huyện Chiêm Hóa	5
64	Huyện Hàm Yên	5
65	Huyện Yên Sơn	5
66	Huyện Sơn Dương	5
67	Thành phố Lào Cai	6
68	Huyện Bát Xát	6
69	Huyện Mường Khương	6
70	Huyện Si Ma Cai	6
71	Huyện Bắc Hà	6
72	Huyện Bảo Thắng	6
73	Huyện Bảo Yên	6
74	Thị xã Sa Pa	6
75	Huyện Văn Bàn	6
76	Thành phố Điện Biên Phủ	7
77	Thị xã Mường Lay	7
78	Huyện Mường Nhé	7
79	Huyện Mường Chà	7
80	Huyện Tủa Chùa	7
81	Huyện Tuần Giáo	7
82	Huyện Điện Biên	7
83	Huyện Điện Biên Đông	7
84	Huyện Mường Ảng	7
85	Huyện Nậm Pồ	7
86	Thành phố Lai Châu	8
87	Huyện Tam Đường	8
88	Huyện Mường Tè	8
89	Huyện Sìn Hồ	8
90	Huyện Phong Thổ	8
91	Huyện Than Uyên	8
92	Huyện Tân Uyên	8
93	Huyện Nậm Nhùn	8
94	Thành phố Sơn La	9
95	Huyện Quỳnh Nhai	9
96	Huyện Thuận Châu	9
97	Huyện Mường La	9
98	Huyện Bắc Yên	9
99	Huyện Phù Yên	9
100	Huyện Mộc Châu	9
101	Huyện Yên Châu	9
102	Huyện Mai Sơn	9
103	Huyện Sông Mã	9
104	Huyện Sốp Cộp	9
105	Huyện Vân Hồ	9
106	Thành phố Yên Bái	10
107	Thị xã Nghĩa Lộ	10
108	Huyện Lục Yên	10
109	Huyện Văn Yên	10
110	Huyện Mù Căng Chải	10
111	Huyện Trấn Yên	10
112	Huyện Trạm Tấu	10
113	Huyện Văn Chấn	10
114	Huyện Yên Bình	10
115	Thành phố Hòa Bình	11
116	Huyện Đà Bắc	11
117	Huyện Lương Sơn	11
118	Huyện Kim Bôi	11
119	Huyện Cao Phong	11
120	Huyện Tân Lạc	11
121	Huyện Mai Châu	11
122	Huyện Lạc Sơn	11
123	Huyện Yên Thủy	11
124	Huyện Lạc Thủy	11
125	Thành phố Thái Nguyên	12
126	Thành phố Sông Công	12
127	Huyện Định Hóa	12
128	Huyện Phú Lương	12
129	Huyện Đồng Hỷ	12
130	Huyện Võ Nhai	12
131	Huyện Đại Từ	12
132	Thành phố Phổ Yên	12
133	Huyện Phú Bình	12
134	Thành phố Lạng Sơn	13
135	Huyện Tràng Định	13
136	Huyện Bình Gia	13
137	Huyện Văn Lãng	13
138	Huyện Cao Lộc	13
139	Huyện Văn Quan	13
140	Huyện Bắc Sơn	13
141	Huyện Hữu Lũng	13
142	Huyện Chi Lăng	13
143	Huyện Lộc Bình	13
144	Huyện Đình Lập	13
145	Thành phố Hạ Long	14
146	Thành phố Móng Cái	14
147	Thành phố Cẩm Phả	14
148	Thành phố Uông Bí	14
149	Huyện Bình Liêu	14
150	Huyện Tiên Yên	14
151	Huyện Đầm Hà	14
152	Huyện Hải Hà	14
153	Huyện Ba Chẽ	14
154	Huyện Vân Đồn	14
155	Thành phố Đông Triều	14
156	Thị xã Quảng Yên	14
157	Huyện Cô Tô	14
158	Thành phố Bắc Giang	15
159	Huyện Yên Thế	15
160	Huyện Tân Yên	15
161	Huyện Lạng Giang	15
162	Huyện Lục Nam	15
163	Huyện Lục Ngạn	15
164	Huyện Sơn Động	15
165	Thị xã Việt Yên	15
166	Huyện Hiệp Hòa	15
167	Thị xã Chũ	15
168	Thành phố Việt Trì	16
169	Thị xã Phú Thọ	16
170	Huyện Đoan Hùng	16
171	Huyện Hạ Hoà	16
172	Huyện Thanh Ba	16
173	Huyện Phù Ninh	16
174	Huyện Yên Lập	16
175	Huyện Cẩm Khê	16
176	Huyện Tam Nông	16
177	Huyện Lâm Thao	16
178	Huyện Thanh Sơn	16
179	Huyện Thanh Thuỷ	16
180	Huyện Tân Sơn	16
181	Thành phố Vĩnh Yên	17
182	Thành phố Phúc Yên	17
183	Huyện Lập Thạch	17
184	Huyện Tam Dương	17
185	Huyện Tam Đảo	17
186	Huyện Bình Xuyên	17
187	Huyện Yên Lạc	17
188	Huyện Vĩnh Tường	17
189	Huyện Sông Lô	17
190	Thành phố Bắc Ninh	18
191	Huyện Yên Phong	18
192	Thị xã Quế Võ	18
193	Huyện Tiên Du	18
194	Thành phố Từ Sơn	18
195	Thị xã Thuận Thành	18
196	Huyện Gia Bình	18
197	Huyện Lương Tài	18
198	Thành phố Hải Dương	19
199	Thành phố Chí Linh	19
200	Huyện Nam Sách	19
201	Thị xã Kinh Môn	19
202	Huyện Kim Thành	19
203	Huyện Thanh Hà	19
204	Huyện Cẩm Giàng	19
205	Huyện Bình Giang	19
206	Huyện Gia Lộc	19
207	Huyện Tứ Kỳ	19
208	Huyện Ninh Giang	19
209	Huyện Thanh Miện	19
210	Quận Hồng Bàng	20
211	Quận Ngô Quyền	20
212	Quận Lê Chân	20
213	Quận Hải An	20
214	Quận Kiến An	20
215	Quận Đồ Sơn	20
216	Quận Dương Kinh	20
217	Thành phố Thuỷ Nguyên	20
218	Quận An Dương	20
219	Huyện An Lão	20
220	Huyện Kiến Thuỵ	20
221	Huyện Tiên Lãng	20
222	Huyện Vĩnh Bảo	20
223	Huyện Cát Hải	20
224	Thành phố Hưng Yên	21
225	Huyện Văn Lâm	21
226	Huyện Văn Giang	21
227	Huyện Yên Mỹ	21
228	Thị xã Mỹ Hào	21
229	Huyện Ân Thi	21
230	Huyện Khoái Châu	21
231	Huyện Kim Động	21
232	Huyện Tiên Lữ	21
233	Huyện Phù Cừ	21
234	Thành phố Thái Bình	22
235	Huyện Quỳnh Phụ	22
236	Huyện Hưng Hà	22
237	Huyện Đông Hưng	22
238	Huyện Thái Thụy	22
239	Huyện Tiền Hải	22
240	Huyện Kiến Xương	22
241	Huyện Vũ Thư	22
242	Thành phố Phủ Lý	23
243	Thị xã Duy Tiên	23
244	Thị xã Kim Bảng	23
245	Huyện Thanh Liêm	23
246	Huyện Bình Lục	23
247	Huyện Lý Nhân	23
248	Thành phố Nam Định	24
249	Huyện Vụ Bản	24
250	Huyện Ý Yên	24
251	Huyện Nghĩa Hưng	24
252	Huyện Nam Trực	24
253	Huyện Trực Ninh	24
254	Huyện Xuân Trường	24
255	Huyện Giao Thủy	24
256	Huyện Hải Hậu	24
257	Thành phố Tam Điệp	25
258	Huyện Nho Quan	25
259	Huyện Gia Viễn	25
260	Thành phố Hoa Lư	25
261	Huyện Yên Khánh	25
262	Huyện Kim Sơn	25
263	Huyện Yên Mô	25
264	Thành phố Thanh Hóa	26
265	Thị xã Bỉm Sơn	26
266	Thành phố Sầm Sơn	26
267	Huyện Mường Lát	26
268	Huyện Quan Hóa	26
269	Huyện Bá Thước	26
270	Huyện Quan Sơn	26
271	Huyện Lang Chánh	26
272	Huyện Ngọc Lặc	26
273	Huyện Cẩm Thủy	26
274	Huyện Thạch Thành	26
275	Huyện Hà Trung	26
276	Huyện Vĩnh Lộc	26
277	Huyện Yên Định	26
278	Huyện Thọ Xuân	26
279	Huyện Thường Xuân	26
280	Huyện Triệu Sơn	26
281	Huyện Thiệu Hóa	26
282	Huyện Hoằng Hóa	26
283	Huyện Hậu Lộc	26
284	Huyện Nga Sơn	26
285	Huyện Như Xuân	26
286	Huyện Như Thanh	26
287	Huyện Nông Cống	26
288	Huyện Quảng Xương	26
289	Thị xã Nghi Sơn	26
290	Thành phố Vinh	27
291	Thị xã Thái Hoà	27
292	Huyện Quế Phong	27
293	Huyện Quỳ Châu	27
294	Huyện Kỳ Sơn	27
295	Huyện Tương Dương	27
296	Huyện Nghĩa Đàn	27
297	Huyện Quỳ Hợp	27
298	Huyện Quỳnh Lưu	27
299	Huyện Con Cuông	27
300	Huyện Tân Kỳ	27
301	Huyện Anh Sơn	27
302	Huyện Diễn Châu	27
303	Huyện Yên Thành	27
304	Huyện Đô Lương	27
305	Huyện Thanh Chương	27
306	Huyện Nghi Lộc	27
307	Huyện Nam Đàn	27
308	Huyện Hưng Nguyên	27
309	Thị xã Hoàng Mai	27
310	Thành phố Hà Tĩnh	28
311	Thị xã Hồng Lĩnh	28
312	Huyện Hương Sơn	28
313	Huyện Đức Thọ	28
314	Huyện Vũ Quang	28
315	Huyện Nghi Xuân	28
316	Huyện Can Lộc	28
317	Huyện Hương Khê	28
318	Huyện Thạch Hà	28
319	Huyện Cẩm Xuyên	28
320	Huyện Kỳ Anh	28
321	Thị xã Kỳ Anh	28
322	Thành Phố Đồng Hới	29
323	Huyện Minh Hóa	29
324	Huyện Tuyên Hóa	29
325	Huyện Quảng Trạch	29
326	Huyện Bố Trạch	29
327	Huyện Quảng Ninh	29
328	Huyện Lệ Thủy	29
329	Thị xã Ba Đồn	29
330	Thành phố Đông Hà	30
331	Thị xã Quảng Trị	30
332	Huyện Vĩnh Linh	30
333	Huyện Hướng Hóa	30
334	Huyện Gio Linh	30
335	Huyện Đa Krông	30
336	Huyện Cam Lộ	30
337	Huyện Triệu Phong	30
338	Huyện Hải Lăng	30
339	Quận Thuận Hóa	31
340	Quận Phú Xuân	31
341	Thị xã Phong Điền	31
342	Huyện Quảng Điền	31
343	Huyện Phú Vang	31
344	Thị xã Hương Thủy	31
345	Thị xã Hương Trà	31
346	Huyện A Lưới	31
347	Huyện Phú Lộc	31
348	Quận Liên Chiểu	32
349	Quận Thanh Khê	32
350	Quận Hải Châu	32
351	Quận Sơn Trà	32
352	Quận Ngũ Hành Sơn	32
353	Quận Cẩm Lệ	32
354	Huyện Hòa Vang	32
355	Thành phố Tam Kỳ	33
356	Thành phố Hội An	33
357	Huyện Tây Giang	33
358	Huyện Đông Giang	33
359	Huyện Đại Lộc	33
360	Thị xã Điện Bàn	33
361	Huyện Duy Xuyên	33
362	Huyện Quế Sơn	33
363	Huyện Nam Giang	33
364	Huyện Phước Sơn	33
365	Huyện Hiệp Đức	33
366	Huyện Thăng Bình	33
367	Huyện Tiên Phước	33
368	Huyện Bắc Trà My	33
369	Huyện Nam Trà My	33
370	Huyện Núi Thành	33
371	Huyện Phú Ninh	33
372	Thành phố Quảng Ngãi	34
373	Huyện Bình Sơn	34
374	Huyện Trà Bồng	34
375	Huyện Sơn Tịnh	34
376	Huyện Tư Nghĩa	34
377	Huyện Sơn Hà	34
378	Huyện Sơn Tây	34
379	Huyện Minh Long	34
380	Huyện Nghĩa Hành	34
381	Huyện Mộ Đức	34
382	Thị xã Đức Phổ	34
383	Huyện Ba Tơ	34
384	Thành phố Quy Nhơn	35
385	Huyện An Lão	35
386	Thị xã Hoài Nhơn	35
387	Huyện Hoài Ân	35
388	Huyện Phù Mỹ	35
389	Huyện Vĩnh Thạnh	35
390	Huyện Tây Sơn	35
391	Huyện Phù Cát	35
392	Thị xã An Nhơn	35
393	Huyện Tuy Phước	35
394	Huyện Vân Canh	35
395	Thành phố Tuy Hoà	36
396	Thị xã Sông Cầu	36
397	Huyện Đồng Xuân	36
398	Huyện Tuy An	36
399	Huyện Sơn Hòa	36
400	Huyện Sông Hinh	36
401	Huyện Tây Hoà	36
402	Huyện Phú Hoà	36
403	Thị xã Đông Hòa	36
404	Thành phố Nha Trang	37
405	Thành phố Cam Ranh	37
406	Huyện Cam Lâm	37
407	Huyện Vạn Ninh	37
408	Thị xã Ninh Hòa	37
409	Huyện Khánh Vĩnh	37
410	Huyện Diên Khánh	37
411	Huyện Khánh Sơn	37
412	Huyện Trường Sa	37
413	Thành phố Phan Rang-Tháp Chàm	38
414	Huyện Bác Ái	38
415	Huyện Ninh Sơn	38
416	Huyện Ninh Hải	38
417	Huyện Ninh Phước	38
418	Huyện Thuận Bắc	38
419	Huyện Thuận Nam	38
420	Thành phố Phan Thiết	39
421	Thị xã La Gi	39
422	Huyện Tuy Phong	39
423	Huyện Bắc Bình	39
424	Huyện Hàm Thuận Bắc	39
425	Huyện Hàm Thuận Nam	39
426	Huyện Tánh Linh	39
427	Huyện Đức Linh	39
428	Huyện Hàm Tân	39
429	Huyện Phú Quí	39
430	Thành phố Kon Tum	40
431	Huyện Đắk Glei	40
432	Huyện Ngọc Hồi	40
433	Huyện Đắk Tô	40
434	Huyện Kon Plông	40
435	Huyện Kon Rẫy	40
436	Huyện Đắk Hà	40
437	Huyện Sa Thầy	40
438	Huyện Tu Mơ Rông	40
439	Huyện Ia H' Drai	40
440	Thành phố Pleiku	41
441	Thị xã An Khê	41
442	Thị xã Ayun Pa	41
443	Huyện KBang	41
444	Huyện Đăk Đoa	41
445	Huyện Chư Păh	41
446	Huyện Ia Grai	41
447	Huyện Mang Yang	41
448	Huyện Kông Chro	41
449	Huyện Đức Cơ	41
450	Huyện Chư Prông	41
451	Huyện Chư Sê	41
452	Huyện Đăk Pơ	41
453	Huyện Ia Pa	41
454	Huyện Krông Pa	41
455	Huyện Phú Thiện	41
456	Huyện Chư Pưh	41
457	Thành phố Buôn Ma Thuột	42
458	Thị xã Buôn Hồ	42
459	Huyện Ea H'leo	42
460	Huyện Ea Súp	42
461	Huyện Buôn Đôn	42
462	Huyện Cư M'gar	42
463	Huyện Krông Búk	42
464	Huyện Krông Năng	42
465	Huyện Ea Kar	42
466	Huyện M'Đrắk	42
467	Huyện Krông Bông	42
468	Huyện Krông Pắc	42
469	Huyện Krông A Na	42
470	Huyện Lắk	42
471	Huyện Cư Kuin	42
472	Thành phố Gia Nghĩa	43
473	Huyện Đăk Glong	43
474	Huyện Cư Jút	43
475	Huyện Đắk Mil	43
476	Huyện Krông Nô	43
477	Huyện Đắk Song	43
478	Huyện Đắk R'Lấp	43
479	Huyện Tuy Đức	43
480	Thành phố Đà Lạt	44
481	Thành phố Bảo Lộc	44
482	Huyện Đam Rông	44
483	Huyện Lạc Dương	44
484	Huyện Lâm Hà	44
485	Huyện Đơn Dương	44
486	Huyện Đức Trọng	44
487	Huyện Di Linh	44
488	Huyện Bảo Lâm	44
489	Huyện Đạ Huoai	44
490	Thị xã Phước Long	45
491	Thành phố Đồng Xoài	45
492	Thị xã Bình Long	45
493	Huyện Bù Gia Mập	45
494	Huyện Lộc Ninh	45
495	Huyện Bù Đốp	45
496	Huyện Hớn Quản	45
497	Huyện Đồng Phú	45
498	Huyện Bù Đăng	45
499	Thị xã Chơn Thành	45
500	Huyện Phú Riềng	45
501	Thành phố Tây Ninh	46
502	Huyện Tân Biên	46
503	Huyện Tân Châu	46
504	Huyện Dương Minh Châu	46
505	Huyện Châu Thành	46
506	Thị xã Hòa Thành	46
507	Huyện Gò Dầu	46
508	Huyện Bến Cầu	46
509	Thị xã Trảng Bàng	46
510	Thành phố Thủ Dầu Một	47
511	Huyện Bàu Bàng	47
512	Huyện Dầu Tiếng	47
513	Thành phố Bến Cát	47
514	Huyện Phú Giáo	47
515	Thành phố Tân Uyên	47
516	Thành phố Dĩ An	47
517	Thành phố Thuận An	47
518	Huyện Bắc Tân Uyên	47
519	Thành phố Biên Hòa	48
520	Thành phố Long Khánh	48
521	Huyện Tân Phú	48
522	Huyện Vĩnh Cửu	48
523	Huyện Định Quán	48
524	Huyện Trảng Bom	48
525	Huyện Thống Nhất	48
526	Huyện Cẩm Mỹ	48
527	Huyện Long Thành	48
528	Huyện Xuân Lộc	48
529	Huyện Nhơn Trạch	48
530	Thành phố Vũng Tàu	49
531	Thành phố Bà Rịa	49
532	Huyện Châu Đức	49
533	Huyện Xuyên Mộc	49
534	Huyện Long Đất	49
535	Thị xã Phú Mỹ	49
536	Quận 1	50
537	Quận 12	50
538	Quận Gò Vấp	50
539	Quận Bình Thạnh	50
540	Quận Tân Bình	50
541	Quận Tân Phú	50
542	Quận Phú Nhuận	50
543	Thành phố Thủ Đức	50
544	Quận 3	50
545	Quận 10	50
546	Quận 11	50
547	Quận 4	50
548	Quận 5	50
549	Quận 6	50
550	Quận 8	50
551	Quận Bình Tân	50
552	Quận 7	50
553	Huyện Củ Chi	50
554	Huyện Hóc Môn	50
555	Huyện Bình Chánh	50
556	Huyện Nhà Bè	50
557	Huyện Cần Giờ	50
558	Thành phố Tân An	51
559	Thị xã Kiến Tường	51
560	Huyện Tân Hưng	51
561	Huyện Vĩnh Hưng	51
562	Huyện Mộc Hóa	51
563	Huyện Tân Thạnh	51
564	Huyện Thạnh Hóa	51
565	Huyện Đức Huệ	51
566	Huyện Đức Hòa	51
567	Huyện Bến Lức	51
568	Huyện Thủ Thừa	51
569	Huyện Tân Trụ	51
570	Huyện Cần Đước	51
571	Huyện Cần Giuộc	51
572	Huyện Châu Thành	51
573	Thành phố Mỹ Tho	52
574	Thành phố Gò Công	52
575	Thị xã Cai Lậy	52
576	Huyện Tân Phước	52
577	Huyện Cái Bè	52
578	Huyện Cai Lậy	52
579	Huyện Châu Thành	52
580	Huyện Chợ Gạo	52
581	Huyện Gò Công Tây	52
582	Huyện Gò Công Đông	52
583	Huyện Tân Phú Đông	52
584	Thành phố Bến Tre	53
585	Huyện Châu Thành	53
586	Huyện Chợ Lách	53
587	Huyện Mỏ Cày Nam	53
588	Huyện Giồng Trôm	53
589	Huyện Bình Đại	53
590	Huyện Ba Tri	53
591	Huyện Thạnh Phú	53
592	Huyện Mỏ Cày Bắc	53
593	Thành phố Trà Vinh	54
594	Huyện Càng Long	54
595	Huyện Cầu Kè	54
596	Huyện Tiểu Cần	54
597	Huyện Châu Thành	54
598	Huyện Cầu Ngang	54
599	Huyện Trà Cú	54
600	Huyện Duyên Hải	54
601	Thị xã Duyên Hải	54
602	Thành phố Vĩnh Long	55
603	Huyện Long Hồ	55
604	Huyện Mang Thít	55
605	Huyện Vũng Liêm	55
606	Huyện Tam Bình	55
607	Thị xã Bình Minh	55
608	Huyện Trà Ôn	55
609	Huyện Bình Tân	55
610	Thành phố Cao Lãnh	56
611	Thành phố Sa Đéc	56
612	Thành phố Hồng Ngự	56
613	Huyện Tân Hồng	56
614	Huyện Hồng Ngự	56
615	Huyện Tam Nông	56
616	Huyện Tháp Mười	56
617	Huyện Cao Lãnh	56
618	Huyện Thanh Bình	56
619	Huyện Lấp Vò	56
620	Huyện Lai Vung	56
621	Huyện Châu Thành	56
622	Thành phố Long Xuyên	57
623	Thành phố Châu Đốc	57
624	Huyện An Phú	57
625	Thị xã Tân Châu	57
626	Huyện Phú Tân	57
627	Huyện Châu Phú	57
628	Thị xã Tịnh Biên	57
629	Huyện Tri Tôn	57
630	Huyện Châu Thành	57
631	Huyện Chợ Mới	57
632	Huyện Thoại Sơn	57
633	Thành phố Rạch Giá	58
634	Thành phố Hà Tiên	58
635	Huyện Kiên Lương	58
636	Huyện Hòn Đất	58
637	Huyện Tân Hiệp	58
638	Huyện Châu Thành	58
639	Huyện Giồng Riềng	58
640	Huyện Gò Quao	58
641	Huyện An Biên	58
642	Huyện An Minh	58
643	Huyện Vĩnh Thuận	58
644	Thành phố Phú Quốc	58
645	Huyện Kiên Hải	58
646	Huyện U Minh Thượng	58
647	Huyện Giang Thành	58
648	Quận Ninh Kiều	59
649	Quận Ô Môn	59
650	Quận Bình Thuỷ	59
651	Quận Cái Răng	59
652	Quận Thốt Nốt	59
653	Huyện Vĩnh Thạnh	59
654	Huyện Cờ Đỏ	59
655	Huyện Phong Điền	59
656	Huyện Thới Lai	59
657	Thành phố Vị Thanh	60
658	Thành phố Ngã Bảy	60
659	Huyện Châu Thành A	60
660	Huyện Châu Thành	60
661	Huyện Phụng Hiệp	60
662	Huyện Vị Thuỷ	60
663	Huyện Long Mỹ	60
664	Thị xã Long Mỹ	60
665	Thành phố Sóc Trăng	61
666	Huyện Châu Thành	61
667	Huyện Kế Sách	61
668	Huyện Mỹ Tú	61
669	Huyện Cù Lao Dung	61
670	Huyện Long Phú	61
671	Huyện Mỹ Xuyên	61
672	Thị xã Ngã Năm	61
673	Huyện Thạnh Trị	61
674	Thị xã Vĩnh Châu	61
675	Huyện Trần Đề	61
676	Thành phố Bạc Liêu	62
677	Huyện Hồng Dân	62
678	Huyện Phước Long	62
679	Huyện Vĩnh Lợi	62
680	Thị xã Giá Rai	62
681	Huyện Đông Hải	62
682	Huyện Hoà Bình	62
683	Thành phố Cà Mau	63
684	Huyện U Minh	63
685	Huyện Thới Bình	63
686	Huyện Trần Văn Thời	63
687	Huyện Cái Nước	63
688	Huyện Đầm Dơi	63
689	Huyện Năm Căn	63
690	Huyện Phú Tân	63
691	Huyện Ngọc Hiển	63
\.


--
-- TOC entry 4080 (class 0 OID 18486)
-- Dependencies: 236
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, "paymentAmount", status, enrolled_at, updated_at, course_id, user_id) FROM stdin;
34	2000.000	LEARNING	2025-12-06 05:40:48.788928	2025-12-06 05:43:00.054187	18	4
37	2000.000	DONE	2025-12-08 00:21:18.209142	2025-12-08 06:37:58.375224	29	4
39	\N	UNPAID	2025-12-13 05:52:45.439469	2025-12-13 05:52:45.439469	32	4
40	\N	UNPAID	2025-12-14 04:02:24.236897	2025-12-14 04:02:24.236897	31	4
38	2000.000	LEARNING	2025-12-08 06:35:28.880693	2025-12-15 00:00:00.159316	30	4
\.


--
-- TOC entry 4062 (class 0 OID 18273)
-- Dependencies: 218
-- Data for Name: errors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.errors (id, code, message, stack, url, body, created_at, resolved_at, "isResolved", user_id) FROM stdin;
\.


--
-- TOC entry 4082 (class 0 OID 18496)
-- Dependencies: 238
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedbacks (id, comment, rating, "isAnonymous", created_at, created_by, received_by, course_id) FROM stdin;
5	Khá ổn	4	f	2025-12-14 00:45:21.405005	4	2	29
\.


--
-- TOC entry 4130 (class 0 OID 18903)
-- Dependencies: 286
-- Data for Name: learner_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learner_achievements (id, earned_at, achievement_id, user_id) FROM stdin;
1	2025-11-27 10:47:58.915	8	2
2	2025-12-01 06:26:55.839	8	4
3	2025-12-01 03:41:39.511	9	2
4	2025-12-01 04:57:23.443	8	6
5	2025-12-01 11:41:01.81	17	6
6	2025-12-03 01:18:35.154	8	1
7	2025-12-05 14:19:19.952	9	4
8	2025-12-12 15:24:27.372	9	1
\.


--
-- TOC entry 4094 (class 0 OID 18593)
-- Dependencies: 250
-- Data for Name: learner_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learner_answers (id, is_correct, created_at, question_id, quiz_attempt_id, question_option_id) FROM stdin;
13	f	2025-12-08 01:00:12.385438	137	5	525
14	f	2025-12-08 01:00:12.385438	136	5	518
15	f	2025-12-08 01:00:12.385438	135	5	514
16	t	2025-12-08 01:00:12.385438	134	5	512
17	f	2025-12-08 01:00:12.385438	133	5	509
18	t	2025-12-08 06:38:53.995924	186	6	712
19	f	2025-12-08 06:38:53.995924	185	6	708
20	t	2025-12-14 04:10:10.856753	133	7	507
21	f	2025-12-14 04:10:10.856753	134	7	511
22	t	2025-12-14 04:10:10.856753	135	7	515
23	f	2025-12-14 04:10:10.856753	136	7	521
24	f	2025-12-14 04:10:10.856753	137	7	525
\.


--
-- TOC entry 4084 (class 0 OID 18514)
-- Dependencies: 240
-- Data for Name: learner_progresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learner_progresses (id, sessions_completed, total_sessions, avg_ai_analysis_score, avg_quiz_score, status, created_at, updated_at, user_id, course_id, can_generate_ai_analysis) FROM stdin;
8	1	1	65	50	IN_PROGRESS	2025-12-08 00:42:00.048676	2025-12-08 06:40:58.975976	4	29	t
6	1	4	68	30	IN_PROGRESS	2025-12-06 05:43:00.054187	2025-12-14 04:10:10.856753	4	18	f
9	0	1	0	0	IN_PROGRESS	2025-12-15 00:00:00.159316	2025-12-15 00:00:00.159316	4	30	f
\.


--
-- TOC entry 4086 (class 0 OID 18538)
-- Dependencies: 242
-- Data for Name: learner_videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learner_videos (id, tags, duration, public_url, thumbnail_url, overlay_video_url, overlay_thumbnail_url, status, created_at, user_id, session_id, video_id) FROM stdin;
12	\N	5	https://pz-picklaball.b-cdn.net/video/1765154997356/video_10894643_1765154974540.mp4	https://pz-picklaball.b-cdn.net/video_thumbnail/1765154996103/video_10894643_1765154974540-thumbnail.png	\N	\N	READY	2025-12-08 00:49:55.417124	4	41	65
13	\N	5	https://pz-picklaball.b-cdn.net/video/1765175919075/video_14353689_1765175912694.mp4	https://pz-picklaball.b-cdn.net/video_thumbnail/1765175918287/video_14353689_1765175912694-thumbnail.png	\N	\N	READY	2025-12-08 06:38:37.748821	4	58	63
\.


--
-- TOC entry 4128 (class 0 OID 18894)
-- Dependencies: 284
-- Data for Name: learners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learners (id, skill_level, learning_goal, user_id) FROM stdin;
1	BEGINNER	INTERMEDIATE	4
2	BEGINNER	INTERMEDIATE	5
3	BEGINNER	INTERMEDIATE	6
\.


--
-- TOC entry 4102 (class 0 OID 18636)
-- Dependencies: 258
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, name, description, lesson_number, created_at, updated_at, deleted_at, subject_id) FROM stdin;
5	Giới thiệu về Pickleball	TÌm hiểu về các động tác cơ bản và cách chơi Pickleball.	1	2025-11-22 12:12:55.174408	2025-11-22 12:12:55.174408	\N	2
6	Forehand trong Pickleball	Tìm hiểu về động tác Forehand trong Pickleball.	2	2025-11-22 12:12:55.174408	2025-11-22 12:12:55.174408	\N	2
7	Backhand trong Pickleball	Tìm hiểu về động tác Backhand trong Pickleball.	3	2025-11-22 12:12:55.174408	2025-11-22 12:12:55.174408	\N	2
8	Giao bóng trong Pickleball	Tìm hiểu về kỹ thuật giao bóng trong Pickleball.	4	2025-11-22 12:12:55.174408	2025-11-22 12:12:55.174408	\N	2
20	Kỹ thuật Smash	Hướng dẫn chi tiết kỹ thuật Smash	1	2025-12-07 23:20:44.490942	2025-12-07 23:20:44.490942	\N	10
21	Bai hoc 1	1	1	2025-12-08 06:45:07.33452	2025-12-08 06:45:07.33452	\N	11
43	Vị Trí và Di Chuyển Thông Minh Trên Sân Đôi	Bài học này tập trung vào tầm quan trọng của vị trí và di chuyển hiệu quả trong đánh đôi pickleball. Bạn sẽ học cách duy trì vị trí tối ưu ở vạch Kitchen (Non-Volley Zone), cách di chuyển đồng bộ với đồng đội khi tấn công và phòng thủ, và cách che phủ các khoảng trống trên sân. Chúng ta sẽ khám phá các mô hình di chuyển phổ biến như 'side-by-side' và 'up-and-back' để đảm bảo bạn và đồng đội luôn ở vị trí tốt nhất để kiểm soát trận đấu và phản ứng nhanh với các cú đánh của đối thủ.	1	2025-12-10 10:25:30.184044	2025-12-10 10:25:30.184044	\N	19
44	Lựa Chọn Cú Đánh Tấn Công và Phòng Thủ Nâng Cao	Bài học này sẽ đào sâu vào nghệ thuật lựa chọn cú đánh trong đánh đôi. Bạn sẽ học cách phân tích tình huống để quyết định khi nào nên thực hiện một cú 'dink' mềm mại, khi nào nên đánh một cú 'drive' mạnh mẽ, và khi nào là thời điểm thích hợp để 'smash' hoặc 'drop shot'. Chúng ta cũng sẽ xem xét các chiến lược phòng thủ như cách trả giao bóng hiệu quả, cách chặn các cú smash, và cách sử dụng các cú 'reset' để giành lại quyền kiểm soát điểm. Mục tiêu là giúp bạn phát triển một kho vũ khí cú đánh đa dạng và biết cách áp dụng chúng một cách chiến lược.	2	2025-12-10 10:25:30.184044	2025-12-10 10:25:30.184044	\N	19
45	Giao Tiếp, Làm Việc Nhóm và Thích Nghi với Đối Thủ	Bài học cuối cùng này tập trung vào các yếu tố phi kỹ thuật nhưng cực kỳ quan trọng: giao tiếp hiệu quả, tinh thần đồng đội và khả năng thích nghi chiến thuật. Bạn sẽ học các phương pháp giao tiếp phi lời nói và lời nói để phối hợp tốt hơn với đồng đội, từ việc gọi bóng, xác định ai sẽ đánh, cho đến việc động viên lẫn nhau. Chúng ta cũng sẽ tìm hiểu cách đọc trận đấu của đối thủ, nhận diện điểm mạnh, điểm yếu của họ và điều chỉnh chiến thuật của mình một cách linh hoạt. Bài học này sẽ giúp bạn và đồng đội trở thành một đơn vị gắn kết, có khả năng giải quyết mọi thử thách trên sân.	3	2025-12-10 10:25:30.184044	2025-12-10 10:25:30.184044	\N	19
46	Reetf	Xgb	1	2025-12-13 14:56:37.066292	2025-12-13 14:56:37.066292	\N	20
\.


--
-- TOC entry 4142 (class 0 OID 19349)
-- Dependencies: 298
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1763808249796	DatabaseMigration1763808249796
\.


--
-- TOC entry 4066 (class 0 OID 18304)
-- Dependencies: 222
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, title, body, "navigateTo", type, "isRead", created_at, user_id) FROM stdin;
129	Xác nhận thanh toán thành công	Thanh toán cho khóa học Pickleball Nâng cao -  Khóa 1 đã được xác nhận thành công.	/(learner)/my-courses	SUCCESS	t	2025-12-08 00:34:00.2691	4
130	Khởi động khóa học	Khóa học Pickleball Nâng cao -  Khóa 1 đã bắt đầu.	/(learner)/my-courses	INFO	t	2025-12-08 00:42:00.087614	4
132	Học viên hoàn thành bài quiz	Một học viên đã hoàn thành bài quiz	/(coach)/course	INFO	t	2025-12-08 01:00:12.48276	2
122	Yêu cầu tạo khóa học mới	Một HLV đã gửi yêu cầu tạo khóa học mới.	/curriculum?request=29	INFO	t	2025-12-08 00:10:41.883049	1
123	Yêu cầu tạo khóa học được duyệt	Yêu cầu tạo khóa học của bạn đã được duyệt.	/(coach)/course	SUCCESS	t	2025-12-08 00:12:46.655897	2
133	Feedback mới nhận được	Khóa học Pickleball Nâng cao -  Khóa 1 vừa nhận được một phản hồi mới.	/(coach)/course	INFO	t	2025-12-08 01:24:02.799116	2
134	Yêu cầu tạo khóa học mới	Một HLV đã gửi yêu cầu tạo khóa học mới.	/curriculum?request=31	INFO	t	2025-12-08 06:33:00.715595	1
136	Xác nhận thanh toán thành công	Thanh toán cho khóa học Pickleball Nâng cao -  Khóa 2 đã được xác nhận thành công.	/(learner)/my-courses	SUCCESS	t	2025-12-08 06:36:00.28885	4
124	Yêu cầu tạo khóa học mới	Một HLV đã gửi yêu cầu tạo khóa học mới.	/curriculum?request=30	INFO	t	2025-12-08 00:17:33.369705	1
127	Đăng ký khóa học thành công	Bạn đã đăng ký thành công khóa học Pickleball Nâng cao -  Khóa 1.	/(learner)/my-courses	INFO	t	2025-12-08 00:21:59.147034	4
137	Buổi học đã hoàn thành	Buổi học Kỹ thuật Smash của khóa học Pickleball Nâng cao -  Khóa 1 đã được hoàn thành. Bạn có thể bắt đầu làm các bài tập liên quan.	/(learner)/my-courses	SUCCESS	t	2025-12-08 06:37:58.496251	4
135	Yêu cầu tạo khóa học được duyệt	Yêu cầu tạo khóa học của bạn đã được duyệt.	/(coach)/course	SUCCESS	t	2025-12-08 06:33:54.000048	2
138	Học viên hoàn thành bài quiz	Một học viên đã hoàn thành bài quiz	/(coach)/course	INFO	t	2025-12-08 06:38:54.095844	2
125	Yêu cầu tạo khóa học được duyệt	Yêu cầu tạo khóa học của bạn đã được duyệt.	/(coach)/course	SUCCESS	t	2025-12-08 00:20:03.215696	2
139	Feedback mới nhận được	Khóa học Pickleball Nâng cao -  Khóa 1 vừa nhận được một phản hồi mới.	/(coach)/course	INFO	t	2025-12-08 06:44:10.371744	2
140	Huấn luyện viên mới đăng ký	Huấn luyện viên Lam Tien Hung đã đăng ký và đang chờ xác minh.	/coaches?coachId=14	INFO	t	2025-12-08 06:50:20.940786	1
126	Học viên đăng ký khóa học	Một học viên đã đăng ký khóa học của bạn.	/(coach)/course	INFO	t	2025-12-08 00:21:59.129477	2
128	Học viên hủy đăng ký khóa học	Một học viên đã hủy đăng ký khóa học của bạn.	/(coach)/course	INFO	t	2025-12-08 00:22:32.360616	2
131	Khóa học đã bắt đầu	Khóa học Pickleball Nâng cao -  Khóa 1 của bạn đã chính thức bắt đầu.	/(coach)/course	INFO	t	2025-12-08 00:42:00.120494	2
142	Yêu cầu tạo khóa học mới	Một HLV đã gửi yêu cầu tạo khóa học mới.	/curriculum?request=32	INFO	t	2025-12-11 14:57:28.096515	1
143	Yêu cầu tạo khóa học mới	Một HLV đã gửi yêu cầu tạo khóa học mới.	/curriculum?request=33	INFO	t	2025-12-12 15:12:51.005433	1
145	Huấn luyện viên mới đăng ký	Huấn luyện viên Nguey Van B đã đăng ký và đang chờ xác minh.	/coaches?coachId=15	INFO	t	2025-12-13 08:42:25.564081	1
144	Yêu cầu tạo khóa học được duyệt	Yêu cầu tạo khóa học của bạn đã được duyệt.	/(coach)/course	SUCCESS	t	2025-12-13 05:52:19.777336	2
146	Feedback mới nhận được	Khóa học Pickleball Nâng cao -  Khóa 1 vừa nhận được một phản hồi mới.	/(coach)/course	INFO	t	2025-12-14 00:45:21.455525	2
147	Yêu cầu tạo khóa học được duyệt	Yêu cầu tạo khóa học của bạn đã được duyệt.	/(coach)/course	SUCCESS	t	2025-12-14 02:37:11.532195	2
148	Học viên hoàn thành bài quiz	Một học viên đã hoàn thành bài quiz	/(coach)/course	INFO	t	2025-12-14 04:10:10.944465	2
149	Khởi động khóa học	Khóa học Pickleball Nâng cao -  Khóa 2 đã bắt đầu.	/(learner)/my-courses	INFO	f	2025-12-15 00:00:00.390257	4
150	Khóa học đã bắt đầu	Khóa học Pickleball Nâng cao -  Khóa 2 của bạn đã chính thức bắt đầu.	/(coach)/course	INFO	f	2025-12-15 00:00:00.513758	2
\.


--
-- TOC entry 4078 (class 0 OID 18458)
-- Dependencies: 234
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, amount, description, "orderCode", "paymentLinkId", "checkoutUrl", "qrCode", status, created_at, updated_at, expired_at, enrollment_id) FROM stdin;
38	2000.000	CS34FCQOO79 Thanh toan khoa hoc	38685	5d92e34c99334f6f97e7f8e515da1a24	https://pay.payos.vn/web/5d92e34c99334f6f97e7f8e515da1a24	00020101021238570010A000000727012700069704480113CAS09050383190208QRIBFTTA5303704540420005802VN62350831CS34FCQOO79 Thanh toan khoa hoc6304A91D	PAID	2025-12-08 06:35:28.880693	2025-12-08 06:36:00.046996	2025-12-09	38
39	500000.000	CSP5RIXLYG3 Thanh toan khoa hoc	15743	5d0b275a88114c1492903a1130be5673	https://pay.payos.vn/web/5d0b275a88114c1492903a1130be5673	00020101021238570010A000000727012700069704480113CAS09050383190208QRIBFTTA530370454065000005802VN62350831CSP5RIXLYG3 Thanh toan khoa hoc63042F22	PENDING	2025-12-13 05:52:45.439469	2025-12-13 05:52:45.439469	2025-12-14	39
40	2000.000	CS19PZP34U8 Thanh toan khoa hoc	86700	4d63e49e1f6647929542b597195f981a	https://pay.payos.vn/web/4d63e49e1f6647929542b597195f981a	00020101021238570010A000000727012700069704480113CAS09050383190208QRIBFTTA5303704540420005802VN62350831CS19PZP34U8 Thanh toan khoa hoc6304835D	PENDING	2025-12-14 04:02:24.236897	2025-12-14 04:02:24.236897	2025-12-15	40
33	2000.000	CSXE5TMB3R0 Thanh toan khoa hoc	90814	85031acc5cd1495d8a0b08784fda0e6c	https://pay.payos.vn/web/85031acc5cd1495d8a0b08784fda0e6c	00020101021238570010A000000727012700069704480113CAS09050383190208QRIBFTTA5303704540420005802VN62350831CSXE5TMB3R0 Thanh toan khoa hoc63049848	PAID	2025-12-06 05:40:48.788928	2025-12-06 05:41:36.509288	2025-12-07	34
36	2000.000	CSEIEFDMQM2 Thanh toan khoa hoc	88595	d960084a39eb4592becdddf931ea8ece	https://pay.payos.vn/web/d960084a39eb4592becdddf931ea8ece	00020101021238570010A000000727012700069704480113CAS09050383190208QRIBFTTA5303704540420005802VN62350831CSEIEFDMQM2 Thanh toan khoa hoc63049F8A	PAID	2025-12-08 00:21:18.209142	2025-12-08 00:21:59.05799	2025-12-09	37
37	2000.000	CSA9F1OA7E8 Thanh toan khoa hoc	10604	cbe8876008f94084a93e5d0f99c3b0a9	https://pay.payos.vn/web/cbe8876008f94084a93e5d0f99c3b0a9	00020101021238570010A000000727012700069704480113CAS09050383190208QRIBFTTA5303704540420005802VN62350831CSA9F1OA7E8 Thanh toan khoa hoc630491CC	PAID	2025-12-08 00:32:39.262833	2025-12-08 00:34:00.059464	2025-12-09	37
\.


--
-- TOC entry 4108 (class 0 OID 18688)
-- Dependencies: 264
-- Data for Name: provinces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provinces (id, name) FROM stdin;
1	Thành phố Hà Nội
2	Tỉnh Hà Giang
3	Tỉnh Cao Bằng
4	Tỉnh Bắc Kạn
5	Tỉnh Tuyên Quang
6	Tỉnh Lào Cai
7	Tỉnh Điện Biên
8	Tỉnh Lai Châu
9	Tỉnh Sơn La
10	Tỉnh Yên Bái
11	Tỉnh Hoà Bình
12	Tỉnh Thái Nguyên
13	Tỉnh Lạng Sơn
14	Tỉnh Quảng Ninh
15	Tỉnh Bắc Giang
16	Tỉnh Phú Thọ
17	Tỉnh Vĩnh Phúc
18	Tỉnh Bắc Ninh
19	Tỉnh Hải Dương
20	Thành phố Hải Phòng
21	Tỉnh Hưng Yên
22	Tỉnh Thái Bình
23	Tỉnh Hà Nam
24	Tỉnh Nam Định
25	Tỉnh Ninh Bình
26	Tỉnh Thanh Hóa
27	Tỉnh Nghệ An
28	Tỉnh Hà Tĩnh
29	Tỉnh Quảng Bình
30	Tỉnh Quảng Trị
31	Thành phố Huế
32	Thành phố Đà Nẵng
33	Tỉnh Quảng Nam
34	Tỉnh Quảng Ngãi
35	Tỉnh Bình Định
36	Tỉnh Phú Yên
37	Tỉnh Khánh Hòa
38	Tỉnh Ninh Thuận
39	Tỉnh Bình Thuận
40	Tỉnh Kon Tum
41	Tỉnh Gia Lai
42	Tỉnh Đắk Lắk
43	Tỉnh Đắk Nông
44	Tỉnh Lâm Đồng
45	Tỉnh Bình Phước
46	Tỉnh Tây Ninh
47	Tỉnh Bình Dương
48	Tỉnh Đồng Nai
49	Tỉnh Bà Rịa - Vũng Tàu
50	Thành phố Hồ Chí Minh
51	Tỉnh Long An
52	Tỉnh Tiền Giang
53	Tỉnh Bến Tre
54	Tỉnh Trà Vinh
55	Tỉnh Vĩnh Long
56	Tỉnh Đồng Tháp
57	Tỉnh An Giang
58	Tỉnh Kiên Giang
59	Thành phố Cần Thơ
60	Tỉnh Hậu Giang
61	Tỉnh Sóc Trăng
62	Tỉnh Bạc Liêu
63	Tỉnh Cà Mau
\.


--
-- TOC entry 4096 (class 0 OID 18601)
-- Dependencies: 252
-- Data for Name: question_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_options (id, content, is_correct, created_at, question_id) FROM stdin;
97	Chỉ dành cho trẻ em	f	2025-11-22 12:12:55.174408	25
98	Mọi lứa tuổi	t	2025-11-22 12:12:55.174408	25
99	Chỉ dành cho người lớn	f	2025-11-22 12:12:55.174408	25
100	Chỉ dành cho vận động viên chuyên nghiệp	f	2025-11-22 12:12:55.174408	25
101	Vợt và bóng	f	2025-11-22 12:12:55.174408	26
102	Bóng và lưới	f	2025-11-22 12:12:55.174408	26
103	Vợt, bóng và lưới	t	2025-11-22 12:12:55.174408	26
104	Chỉ vợt	f	2025-11-22 12:12:55.174408	26
105	Giữ bóng trong sân của mình càng lâu càng tốt	f	2025-11-22 12:12:55.174408	27
106	Ghi điểm bằng cách đánh bóng qua lưới	t	2025-11-22 12:12:55.174408	27
107	Đánh bóng ra ngoài sân đối phương	f	2025-11-22 12:12:55.174408	27
108	Chạm bóng vào lưới	f	2025-11-22 12:12:55.174408	27
109	10 feet rộng và 22 feet dài	f	2025-11-22 12:12:55.174408	28
110	20 feet rộng và 44 feet dài	t	2025-11-22 12:12:55.174408	28
111	30 feet rộng và 60 feet dài	f	2025-11-22 12:12:55.174408	28
112	40 feet rộng và 80 feet dài	f	2025-11-22 12:12:55.174408	28
113	30 inch ở hai bên và 28 inch ở giữa	f	2025-11-22 12:12:55.174408	29
114	36 inch ở hai bên và 34 inch ở giữa	t	2025-11-22 12:12:55.174408	29
115	40 inch ở hai bên và 38 inch ở giữa	f	2025-11-22 12:12:55.174408	29
116	42 inch ở hai bên và 40 inch ở giữa	f	2025-11-22 12:12:55.174408	29
117	Tay trái	f	2025-11-22 12:12:55.174408	30
118	Tay thuận	t	2025-11-22 12:12:55.174408	30
119	Cả hai tay	f	2025-11-22 12:12:55.174408	30
120	Tay không thuận	f	2025-11-22 12:12:55.174408	30
121	Tay thuận	f	2025-11-22 12:12:55.174408	31
122	Tay không thuận	t	2025-11-22 12:12:55.174408	31
123	Cả hai tay	f	2025-11-22 12:12:55.174408	31
124	Tay trái	f	2025-11-22 12:12:55.174408	31
125	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174408	32
126	Khi bóng đến phía không thuận của người chơi	t	2025-11-22 12:12:55.174408	32
127	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174408	32
128	Khi đứng gần lưới	f	2025-11-22 12:12:55.174408	32
129	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174408	33
130	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174408	33
131	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174408	33
132	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174408	33
133	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174408	34
134	Để bắt đầu mỗi điểm	t	2025-11-22 12:12:55.174408	34
135	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174408	34
136	Khi đứng gần lưới	f	2025-11-22 12:12:55.174408	34
137	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174408	35
138	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174408	35
139	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174408	35
140	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174408	35
141	Luyện tập đều đặn và tập trung vào kỹ thuật	t	2025-11-22 12:12:55.174408	36
142	Chỉ cần đánh mạnh hơn	f	2025-11-22 12:12:55.174408	36
143	Không cần luyện tập nhiều	f	2025-11-22 12:12:55.174408	36
144	Chỉ cần thay đổi vợt	f	2025-11-22 12:12:55.174408	36
506	Chỉ dành cho trẻ em	f	2025-11-22 12:12:55.174	133
507	Mọi lứa tuổi	t	2025-11-22 12:12:55.174	133
508	Chỉ dành cho người lớn	f	2025-11-22 12:12:55.174	133
509	Chỉ dành cho vận động viên chuyên nghiệp	f	2025-11-22 12:12:55.174	133
510	Vợt và bóng	f	2025-11-22 12:12:55.174	134
511	Bóng và lưới	f	2025-11-22 12:12:55.174	134
512	Vợt, bóng và lưới	t	2025-11-22 12:12:55.174	134
513	Chỉ vợt	f	2025-11-22 12:12:55.174	134
514	Giữ bóng trong sân của mình càng lâu càng tốt	f	2025-11-22 12:12:55.174	135
515	Ghi điểm bằng cách đánh bóng qua lưới	t	2025-11-22 12:12:55.174	135
516	Đánh bóng ra ngoài sân đối phương	f	2025-11-22 12:12:55.174	135
517	Chạm bóng vào lưới	f	2025-11-22 12:12:55.174	135
518	10 feet rộng và 22 feet dài	f	2025-11-22 12:12:55.174	136
519	20 feet rộng và 44 feet dài	t	2025-11-22 12:12:55.174	136
520	30 feet rộng và 60 feet dài	f	2025-11-22 12:12:55.174	136
521	40 feet rộng và 80 feet dài	f	2025-11-22 12:12:55.174	136
522	30 inch ở hai bên và 28 inch ở giữa	f	2025-11-22 12:12:55.174	137
523	36 inch ở hai bên và 34 inch ở giữa	t	2025-11-22 12:12:55.174	137
524	40 inch ở hai bên và 38 inch ở giữa	f	2025-11-22 12:12:55.174	137
525	42 inch ở hai bên và 40 inch ở giữa	f	2025-11-22 12:12:55.174	137
526	Tay trái	f	2025-11-22 12:12:55.174	138
527	Tay thuận	t	2025-11-22 12:12:55.174	138
528	Cả hai tay	f	2025-11-22 12:12:55.174	138
529	Tay không thuận	f	2025-11-22 12:12:55.174	138
530	Tay thuận	f	2025-11-22 12:12:55.174	139
531	Tay không thuận	t	2025-11-22 12:12:55.174	139
532	Cả hai tay	f	2025-11-22 12:12:55.174	139
533	Tay trái	f	2025-11-22 12:12:55.174	139
534	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174	140
535	Khi bóng đến phía không thuận của người chơi	t	2025-11-22 12:12:55.174	140
536	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174	140
537	Khi đứng gần lưới	f	2025-11-22 12:12:55.174	140
538	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174	141
539	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174	141
540	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174	141
541	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174	141
542	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174	142
543	Để bắt đầu mỗi điểm	t	2025-11-22 12:12:55.174	142
544	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174	142
545	Khi đứng gần lưới	f	2025-11-22 12:12:55.174	142
546	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174	143
547	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174	143
548	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174	143
549	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174	143
550	Luyện tập đều đặn và tập trung vào kỹ thuật	t	2025-11-22 12:12:55.174	144
551	Chỉ cần đánh mạnh hơn	f	2025-11-22 12:12:55.174	144
552	Không cần luyện tập nhiều	f	2025-11-22 12:12:55.174	144
553	Chỉ cần thay đổi vợt	f	2025-11-22 12:12:55.174	144
698	Dồn toàn bộ lực	f	2025-12-07 23:27:06.884187	181
699	Đúng kỹ thuật	t	2025-12-07 23:27:06.884187	181
700	Tay trái	f	2025-12-07 23:27:06.884187	182
701	Tay phải	f	2025-12-07 23:27:06.884187	182
702	Tay thuận	t	2025-12-07 23:27:06.884187	182
708	Dồn toàn bộ lực	f	2025-12-07 23:27:06.884	185
709	Đúng kỹ thuật	t	2025-12-07 23:27:06.884	185
710	Tay trái	f	2025-12-07 23:27:06.884	186
711	Tay phải	f	2025-12-07 23:27:06.884	186
712	Tay thuận	t	2025-12-07 23:27:06.884	186
718	dung	t	2025-12-08 06:45:58.091712	189
719	sai	f	2025-12-08 06:45:58.091712	189
780	Để tránh bị đối thủ đánh bóng qua đầu	f	2025-12-10 10:25:30.184044	205
781	Để có thể thực hiện các cú volley và kiểm soát bóng tốt hơn	f	2025-12-10 10:25:30.184044	205
782	Để dễ dàng trả bóng từ baseline	t	2025-12-10 10:25:30.184044	205
783	Để nghỉ ngơi giữa các điểm	f	2025-12-10 10:25:30.184044	205
784	Lùi về phía baseline	f	2025-12-10 10:25:30.184044	206
785	Đứng yên tại chỗ	f	2025-12-10 10:25:30.184044	206
786	Tiến lên phía trước, gần vạch Kitchen	t	2025-12-10 10:25:30.184044	206
787	Di chuyển sang một bên	f	2025-12-10 10:25:30.184044	206
788	Luôn di chuyển cùng lúc với đồng đội	f	2025-12-10 10:25:30.184044	207
789	Người chơi mạnh hơn nên di chuyển nhiều hơn	f	2025-12-10 10:25:30.184044	207
790	Giữ khoảng cách đều giữa hai người chơi	t	2025-12-10 10:25:30.184044	207
791	Chỉ di chuyển khi bóng đi qua mình	f	2025-12-10 10:25:30.184044	207
792	Một người ở Kitchen, một người ở baseline	f	2025-12-10 10:25:30.184044	208
793	Cả hai người chơi di chuyển lên hoặc xuống sân cùng lúc, giữ vị trí song song	t	2025-12-10 10:25:30.184044	208
794	Chỉ người chơi thuận tay phải ở bên phải sân	f	2025-12-10 10:25:30.184044	208
795	Hai người chơi đứng chéo nhau trên sân	f	2025-12-10 10:25:30.184044	208
796	Khi đối thủ đánh bóng ra ngoài	f	2025-12-10 10:25:30.184044	209
797	Khi một người chơi cần lùi về baseline để trả bóng sâu và sau đó tiến lên Kitchen	t	2025-12-10 10:25:30.184044	209
798	Khi bạn muốn tạo bất ngờ cho đối thủ	f	2025-12-10 10:25:30.184044	209
799	Khi cả hai người chơi đều mệt mỏi	f	2025-12-10 10:25:30.184044	209
800	Cú 'dink' thẳng vào lưới	f	2025-12-10 10:25:30.184044	210
801	Cú 'drive' mạnh vào khoảng trống trên sân đối thủ	t	2025-12-10 10:25:30.184044	210
802	Cú 'lob' cao về cuối sân	f	2025-12-10 10:25:30.184044	210
803	Cú 'smash' vào chân đối thủ	f	2025-12-10 10:25:30.184044	210
804	Để kết thúc điểm ngay lập tức	f	2025-12-10 10:25:30.184044	211
805	Để làm chậm nhịp độ trận đấu và kiểm soát bóng ở vạch Kitchen	t	2025-12-10 10:25:30.184044	211
806	Để đánh bóng mạnh qua đối thủ	f	2025-12-10 10:25:30.184044	211
807	Để buộc đối thủ phải lùi về baseline	f	2025-12-10 10:25:30.184044	211
808	Tiếp tục 'smash' trả lại	f	2025-12-10 10:25:30.184044	212
809	Cú 'reset' (đánh bóng nhẹ nhàng vào Kitchen đối thủ để giành lại quyền kiểm soát)	t	2025-12-10 10:25:30.184044	212
810	Cú 'lob' cao ra ngoài sân	f	2025-12-10 10:25:30.184044	212
811	Cố gắng đánh thẳng ra ngoài biên	f	2025-12-10 10:25:30.184044	212
812	Cố gắng nhảy lên và 'smash' bóng	f	2025-12-10 10:25:30.184044	213
813	Lùi nhanh về phía baseline để trả bóng và tiến lên lại	t	2025-12-10 10:25:30.184044	213
814	Đứng yên và chờ đồng đội xử lý	f	2025-12-10 10:25:30.184044	213
815	Bỏ qua bóng và chờ giao bóng lại	f	2025-12-10 10:25:30.184044	213
816	Khả năng 'dink' tốt	f	2025-12-10 10:25:30.184044	214
817	Phản xạ chậm hoặc di chuyển hạn chế	t	2025-12-10 10:25:30.184044	214
818	Kỹ năng 'smash' mạnh	f	2025-12-10 10:25:30.184044	214
819	Khả năng giao bóng chính xác	f	2025-12-10 10:25:30.184044	214
820	Để làm phân tâm đối thủ	f	2025-12-10 10:25:30.184044	215
821	Để tránh nhầm lẫn, phối hợp tốt hơn và che phủ sân hiệu quả	t	2025-12-10 10:25:30.184044	215
822	Để ra hiệu cho trọng tài	f	2025-12-10 10:25:30.184044	215
823	Để khoe khoang với khán giả	f	2025-12-10 10:25:30.184044	215
824	Người chơi gần lưới hơn nên đánh	f	2025-12-10 10:25:30.184044	216
825	Người chơi nào thuận tay hơn hoặc ở vị trí tốt hơn nên gọi bóng và đánh	t	2025-12-10 10:25:30.184044	216
826	Người chơi nào phát bóng ở điểm trước nên đánh	f	2025-12-10 10:25:30.184044	216
827	Không cần quyết định, để bóng tự rơi	f	2025-12-10 10:25:30.184044	216
828	Tránh đánh vào phía tay trái của họ để không làm họ bối rối	f	2025-12-10 10:25:30.184044	217
829	Liên tục 'dink' bóng vào phía tay trái của đối thủ để khai thác điểm yếu	t	2025-12-10 10:25:30.184044	217
830	Đánh mạnh vào giữa sân	f	2025-12-10 10:25:30.184044	217
831	Chỉ tập trung vào cú 'smash'	f	2025-12-10 10:25:30.184044	217
832	Vỗ tay hai lần	f	2025-12-10 10:25:30.184044	218
833	Chỉ ngón tay cái lên cao (hoặc nói 'lob')	t	2025-12-10 10:25:30.184044	218
834	Lắc đầu qua lại	f	2025-12-10 10:25:30.184044	218
835	Giả vờ như bạn sẽ đánh một cú 'smash'	f	2025-12-10 10:25:30.184044	218
836	Cố gắng kết thúc điểm bằng một cú 'smash' mạo hiểm	f	2025-12-10 10:25:30.184044	219
837	Kêu gọi time-out ngay lập tức	f	2025-12-10 10:25:30.184044	219
838	Kiên nhẫn 'reset' điểm, giữ bóng an toàn và chờ cơ hội phản công	t	2025-12-10 10:25:30.184044	219
839	Đứng yên và chờ đối thủ mắc lỗi	f	2025-12-10 10:25:30.184044	219
888	Chỉ dành cho trẻ em	f	2025-11-22 12:12:55.174	232
889	Mọi lứa tuổi	t	2025-11-22 12:12:55.174	232
890	Chỉ dành cho người lớn	f	2025-11-22 12:12:55.174	232
891	Chỉ dành cho vận động viên chuyên nghiệp	f	2025-11-22 12:12:55.174	232
892	Vợt và bóng	f	2025-11-22 12:12:55.174	233
893	Bóng và lưới	f	2025-11-22 12:12:55.174	233
894	Vợt, bóng và lưới	t	2025-11-22 12:12:55.174	233
895	Chỉ vợt	f	2025-11-22 12:12:55.174	233
896	Giữ bóng trong sân của mình càng lâu càng tốt	f	2025-11-22 12:12:55.174	234
897	Ghi điểm bằng cách đánh bóng qua lưới	t	2025-11-22 12:12:55.174	234
898	Đánh bóng ra ngoài sân đối phương	f	2025-11-22 12:12:55.174	234
899	Chạm bóng vào lưới	f	2025-11-22 12:12:55.174	234
900	10 feet rộng và 22 feet dài	f	2025-11-22 12:12:55.174	235
840	Chỉ dành cho trẻ em	f	2025-11-22 12:12:55.174	220
841	Mọi lứa tuổi	t	2025-11-22 12:12:55.174	220
842	Chỉ dành cho người lớn	f	2025-11-22 12:12:55.174	220
843	Chỉ dành cho vận động viên chuyên nghiệp	f	2025-11-22 12:12:55.174	220
844	Vợt và bóng	f	2025-11-22 12:12:55.174	221
845	Bóng và lưới	f	2025-11-22 12:12:55.174	221
846	Vợt, bóng và lưới	t	2025-11-22 12:12:55.174	221
713	Dồn toàn bộ lực	f	2025-12-07 23:27:06.884	187
714	Đúng kỹ thuật	t	2025-12-07 23:27:06.884	187
715	Tay trái	f	2025-12-07 23:27:06.884	188
716	Tay phải	f	2025-12-07 23:27:06.884	188
717	Tay thuận	t	2025-12-07 23:27:06.884	188
847	Chỉ vợt	f	2025-11-22 12:12:55.174	221
848	Giữ bóng trong sân của mình càng lâu càng tốt	f	2025-11-22 12:12:55.174	222
849	Ghi điểm bằng cách đánh bóng qua lưới	t	2025-11-22 12:12:55.174	222
850	Đánh bóng ra ngoài sân đối phương	f	2025-11-22 12:12:55.174	222
851	Chạm bóng vào lưới	f	2025-11-22 12:12:55.174	222
852	10 feet rộng và 22 feet dài	f	2025-11-22 12:12:55.174	223
853	20 feet rộng và 44 feet dài	t	2025-11-22 12:12:55.174	223
854	30 feet rộng và 60 feet dài	f	2025-11-22 12:12:55.174	223
855	40 feet rộng và 80 feet dài	f	2025-11-22 12:12:55.174	223
856	30 inch ở hai bên và 28 inch ở giữa	f	2025-11-22 12:12:55.174	224
857	36 inch ở hai bên và 34 inch ở giữa	t	2025-11-22 12:12:55.174	224
858	40 inch ở hai bên và 38 inch ở giữa	f	2025-11-22 12:12:55.174	224
859	42 inch ở hai bên và 40 inch ở giữa	f	2025-11-22 12:12:55.174	224
860	Tay trái	f	2025-11-22 12:12:55.174	225
861	Tay thuận	t	2025-11-22 12:12:55.174	225
862	Cả hai tay	f	2025-11-22 12:12:55.174	225
863	Tay không thuận	f	2025-11-22 12:12:55.174	225
864	Tay thuận	f	2025-11-22 12:12:55.174	226
865	Tay không thuận	t	2025-11-22 12:12:55.174	226
866	Cả hai tay	f	2025-11-22 12:12:55.174	226
867	Tay trái	f	2025-11-22 12:12:55.174	226
868	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174	227
869	Khi bóng đến phía không thuận của người chơi	t	2025-11-22 12:12:55.174	227
870	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174	227
871	Khi đứng gần lưới	f	2025-11-22 12:12:55.174	227
872	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174	228
873	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174	228
874	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174	228
875	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174	228
876	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174	229
877	Để bắt đầu mỗi điểm	t	2025-11-22 12:12:55.174	229
878	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174	229
879	Khi đứng gần lưới	f	2025-11-22 12:12:55.174	229
880	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174	230
881	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174	230
882	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174	230
883	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174	230
884	Luyện tập đều đặn và tập trung vào kỹ thuật	t	2025-11-22 12:12:55.174	231
885	Chỉ cần đánh mạnh hơn	f	2025-11-22 12:12:55.174	231
886	Không cần luyện tập nhiều	f	2025-11-22 12:12:55.174	231
887	Chỉ cần thay đổi vợt	f	2025-11-22 12:12:55.174	231
901	20 feet rộng và 44 feet dài	t	2025-11-22 12:12:55.174	235
902	30 feet rộng và 60 feet dài	f	2025-11-22 12:12:55.174	235
903	40 feet rộng và 80 feet dài	f	2025-11-22 12:12:55.174	235
904	30 inch ở hai bên và 28 inch ở giữa	f	2025-11-22 12:12:55.174	236
905	36 inch ở hai bên và 34 inch ở giữa	t	2025-11-22 12:12:55.174	236
906	40 inch ở hai bên và 38 inch ở giữa	f	2025-11-22 12:12:55.174	236
907	42 inch ở hai bên và 40 inch ở giữa	f	2025-11-22 12:12:55.174	236
908	Tay trái	f	2025-11-22 12:12:55.174	237
909	Tay thuận	t	2025-11-22 12:12:55.174	237
910	Cả hai tay	f	2025-11-22 12:12:55.174	237
911	Tay không thuận	f	2025-11-22 12:12:55.174	237
912	Tay thuận	f	2025-11-22 12:12:55.174	238
913	Tay không thuận	t	2025-11-22 12:12:55.174	238
914	Cả hai tay	f	2025-11-22 12:12:55.174	238
915	Tay trái	f	2025-11-22 12:12:55.174	238
916	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174	239
917	Khi bóng đến phía không thuận của người chơi	t	2025-11-22 12:12:55.174	239
918	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174	239
919	Khi đứng gần lưới	f	2025-11-22 12:12:55.174	239
920	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174	240
921	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174	240
922	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174	240
923	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174	240
924	Khi bóng đến phía thuận của người chơi	f	2025-11-22 12:12:55.174	241
925	Để bắt đầu mỗi điểm	t	2025-11-22 12:12:55.174	241
926	Khi không muốn thay đổi hướng đánh	f	2025-11-22 12:12:55.174	241
927	Khi đứng gần lưới	f	2025-11-22 12:12:55.174	241
928	Tư thế cơ thể và vị trí chân	t	2025-11-22 12:12:55.174	242
929	Chỉ cần vung vợt mạnh	f	2025-11-22 12:12:55.174	242
930	Chỉ cần cầm vợt chắc chắn	f	2025-11-22 12:12:55.174	242
931	Không cần chú ý đến tư thế	f	2025-11-22 12:12:55.174	242
932	Luyện tập đều đặn và tập trung vào kỹ thuật	t	2025-11-22 12:12:55.174	243
933	Chỉ cần đánh mạnh hơn	f	2025-11-22 12:12:55.174	243
934	Không cần luyện tập nhiều	f	2025-11-22 12:12:55.174	243
935	Chỉ cần thay đổi vợt	f	2025-11-22 12:12:55.174	243
\.


--
-- TOC entry 4098 (class 0 OID 18612)
-- Dependencies: 254
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, title, explanation, created_at, quiz_id) FROM stdin;
133	Pickleball phù hợp vói những ai?	 Pickleball là môn thể thao dành cho mọi lứa tuổi và trình độ kỹ năng.	2025-11-22 12:12:55.174	48
134	Dụng cụ cơ bản để chơi Pickleball là gì?	Dụng cụ cơ bản bao gồm vợt, bóng và lưới.	2025-11-22 12:12:55.174	48
135	Mục tiêu chính của trò chơi Pickleball là gì?	Mục tiêu chính là ghi điểm bằng cách đánh bóng qua lưới và vào khu vực đối phương mà họ không thể trả lại.	2025-11-22 12:12:55.174	48
136	Kích thước sân Pickleball tiêu chuẩn là bao nhiêu?	Sân Pickleball tiêu chuẩn có kích thước 20 feet rộng và 44 feet dài.	2025-11-22 12:12:55.174	48
137	Lưới Pickleball được đặt ở độ cao nào?	Lưới Pickleball được đặt ở độ cao 36 inch ở hai bên và 34 inch ở giữa.	2025-11-22 12:12:55.174	48
138	Tay nào thường được sử dụng để đánh forehand?	Forehand thường được đánh bằng tay thuận của người chơi.	2025-11-22 12:12:55.174	49
139	Tay nào thường được sử dụng để đánh backhand?	Backhand thường được đánh bằng tay không thuận của người chơi.	2025-11-22 12:12:55.174	50
140	Khi nào nên sử dụng cú đánh backhand trong trận đấu?	Cú đánh backhand thường được sử dụng khi bóng đến phía không thuận của người chơi hoặc khi cần thay đổi hướng đánh.	2025-11-22 12:12:55.174	50
141	Điều gì là quan trọng nhất khi thực hiện cú đánh backhand?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh backhand hiệu quả.	2025-11-22 12:12:55.174	50
142	Khi nào nên sử dụng cú giao bóng trong trận đấu?	Cú giao bóng được sử dụng để bắt đầu mỗi điểm trong trận đấu Pickleball.	2025-11-22 12:12:55.174	51
143	Điều gì là quan trọng nhất khi thực hiện cú giao bóng?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú giao bóng hiệu quả.	2025-11-22 12:12:55.174	51
144	Làm thế nào để tăng độ chính xác khi giao bóng?	Tăng độ chính xác khi giao bóng có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật.	2025-11-22 12:12:55.174	51
25	Pickleball phù hợp vói những ai?	 Pickleball là môn thể thao dành cho mọi lứa tuổi và trình độ kỹ năng.	2025-11-22 12:12:55.174408	9
26	Dụng cụ cơ bản để chơi Pickleball là gì?	Dụng cụ cơ bản bao gồm vợt, bóng và lưới.	2025-11-22 12:12:55.174408	9
27	Mục tiêu chính của trò chơi Pickleball là gì?	Mục tiêu chính là ghi điểm bằng cách đánh bóng qua lưới và vào khu vực đối phương mà họ không thể trả lại.	2025-11-22 12:12:55.174408	9
28	Kích thước sân Pickleball tiêu chuẩn là bao nhiêu?	Sân Pickleball tiêu chuẩn có kích thước 20 feet rộng và 44 feet dài.	2025-11-22 12:12:55.174408	9
29	Lưới Pickleball được đặt ở độ cao nào?	Lưới Pickleball được đặt ở độ cao 36 inch ở hai bên và 34 inch ở giữa.	2025-11-22 12:12:55.174408	9
30	Tay nào thường được sử dụng để đánh forehand?	Forehand thường được đánh bằng tay thuận của người chơi.	2025-11-22 12:12:55.174408	10
31	Tay nào thường được sử dụng để đánh backhand?	Backhand thường được đánh bằng tay không thuận của người chơi.	2025-11-22 12:12:55.174408	11
32	Khi nào nên sử dụng cú đánh backhand trong trận đấu?	Cú đánh backhand thường được sử dụng khi bóng đến phía không thuận của người chơi hoặc khi cần thay đổi hướng đánh.	2025-11-22 12:12:55.174408	11
33	Điều gì là quan trọng nhất khi thực hiện cú đánh backhand?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh backhand hiệu quả.	2025-11-22 12:12:55.174408	11
34	Khi nào nên sử dụng cú giao bóng trong trận đấu?	Cú giao bóng được sử dụng để bắt đầu mỗi điểm trong trận đấu Pickleball.	2025-11-22 12:12:55.174408	12
35	Điều gì là quan trọng nhất khi thực hiện cú giao bóng?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú giao bóng hiệu quả.	2025-11-22 12:12:55.174408	12
36	Làm thế nào để tăng độ chính xác khi giao bóng?	Tăng độ chính xác khi giao bóng có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật.	2025-11-22 12:12:55.174408	12
181	Làm sao để Smash được nhanh và mạnh	\N	2025-12-07 23:27:06.884187	64
182	Smash nên dùng tay nào	\N	2025-12-07 23:27:06.884187	64
185	Làm sao để Smash được nhanh và mạnh	\N	2025-12-07 23:27:06.884	66
186	Smash nên dùng tay nào	\N	2025-12-07 23:27:06.884	66
187	Làm sao để Smash được nhanh và mạnh	\N	2025-12-07 23:27:06.884	67
188	Smash nên dùng tay nào	\N	2025-12-07 23:27:06.884	67
189	Pickleball la gi ?	\N	2025-12-08 06:45:58.091712	68
205	Tại sao việc duy trì vị trí ở vạch Kitchen lại quan trọng trong đánh đôi?	Duy trì vị trí ở vạch Kitchen (Non-Volley Zone) cho phép bạn có thể thực hiện các cú volley mạnh mẽ và kiểm soát bóng tốt hơn, gây áp lực lên đối thủ và tạo cơ hội tấn công.	2025-12-10 10:25:30.184044	85
206	Khi đồng đội của bạn thực hiện một cú đánh tấn công sâu, bạn nên di chuyển như thế nào?	Khi đồng đội đánh bóng sâu và tạo áp lực, bạn nên di chuyển lên phía trước, gần vạch Kitchen hơn để sẵn sàng cho cú volley tiếp theo hoặc hỗ trợ đồng đội kết thúc điểm.	2025-12-10 10:25:30.184044	85
207	Điều nào sau đây là nguyên tắc quan trọng nhất trong việc di chuyển đồng bộ của cặp đôi?	Giữ khoảng cách đều giữa hai người chơi đảm bảo không có khoảng trống lớn nào trên sân bị bỏ ngỏ, giúp che phủ hiệu quả hơn và hỗ trợ lẫn nhau.	2025-12-10 10:25:30.184044	85
208	Mô hình di chuyển 'side-by-side' (song song) có ý nghĩa gì trong đánh đôi?	Mô hình 'side-by-side' là khi cả hai người chơi di chuyển lên hoặc xuống sân cùng lúc, giữ vị trí tương đối song song với nhau để che phủ sân ngang hiệu quả nhất.	2025-12-10 10:25:30.184044	85
209	Khi nào thì nên thay đổi vị trí từ 'side-by-side' sang 'up-and-back'?	'Up-and-back' (một người lên Kitchen, một người lùi về) thường được sử dụng khi một trong hai người chơi cần trả bóng sâu từ baseline và cần thời gian để tiến lên Kitchen, trong khi người kia duy trì vị trí ở Kitchen để giữ áp lực.	2025-12-10 10:25:30.184044	85
210	Khi đối thủ đang đứng ở vạch Kitchen và bạn có cơ hội, cú đánh nào sau đây hiệu quả nhất để 'mở' sân?	Một cú 'drive' (đánh mạnh, sâu) vào khoảng trống giữa hoặc ra rìa sân đối thủ có thể buộc họ phải di chuyển, tạo ra khoảng trống để tấn công tiếp theo hoặc buộc họ đánh bóng lỗi.	2025-12-10 10:25:30.184044	86
211	Mục đích chính của cú 'dink' chiến thuật là gì?	Cú 'dink' chiến thuật nhằm mục đích giữ bóng thấp, buộc đối thủ phải cúi xuống đánh, gây khó khăn cho việc tấn công ngược lại và có thể tạo cơ hội cho bạn tấn công khi đối thủ mắc lỗi hoặc đánh bóng lên cao.	2025-12-10 10:25:30.184044	86
212	Khi bạn bị đối thủ tấn công mạnh liên tục ở vạch Kitchen, cú đánh nào là lựa chọn tốt để 'reset' điểm?	Cú 'reset' (thường là một cú 'dink' hoặc 'drop' cao hơn một chút, đủ để rơi vào Kitchen đối thủ mà không bay cao) giúp làm chậm nhịp độ, vô hiệu hóa đà tấn công của đối thủ và cho bạn thời gian để phục hồi vị trí.	2025-12-10 10:25:30.184044	86
213	Trong tình huống đối thủ đánh bóng 'lob' cao qua đầu bạn khi bạn đang ở Kitchen, phản ứng đầu tiên của bạn nên là gì?	Khi đối thủ 'lob' qua đầu, điều quan trọng là phải lùi nhanh về phía baseline để có thể trả bóng và sau đó tiến lên lại vạch Kitchen để tái lập vị trí tấn công.	2025-12-10 10:25:30.184044	86
214	Điểm yếu nào của đối thủ thường được khai thác bằng cú 'drive'?	Cú 'drive' mạnh và sâu có thể khai thác điểm yếu của đối thủ nếu họ có phản xạ chậm, khả năng di chuyển hạn chế, hoặc không thoải mái khi xử lý bóng ở tốc độ cao hoặc ở vùng sân giữa.	2025-12-10 10:25:30.184044	86
215	Tại sao việc giao tiếp là tối quan trọng trong đánh đôi pickleball?	Giao tiếp giúp tránh nhầm lẫn về việc ai sẽ đánh bóng, đảm bảo sự phối hợp nhịp nhàng và giúp che phủ sân hiệu quả hơn, giảm thiểu các lỗi không đáng có.	2025-12-10 10:25:30.184044	87
216	Khi một quả bóng bay giữa hai người chơi, cách tốt nhất để quyết định ai sẽ đánh là gì?	Người chơi nào thuận tay hơn (forehand) hoặc ở vị trí tốt hơn để đánh (ví dụ, đang tiến về phía bóng) nên gọi bóng và thực hiện cú đánh. Điều này cần được thống nhất từ trước hoặc ra hiệu nhanh chóng.	2025-12-10 10:25:30.184044	87
217	Khi bạn nhận thấy đối thủ có một cú 'dink' yếu ở phía tay trái của họ, chiến thuật thích nghi của bạn nên là gì?	Khai thác điểm yếu của đối thủ bằng cách liên tục 'dink' bóng vào phía tay trái yếu của họ sẽ gây áp lực, buộc họ mắc lỗi hoặc đánh bóng lên cao để bạn tấn công.	2025-12-10 10:25:30.184044	87
218	Một tín hiệu phi lời nói phổ biến để nói với đồng đội rằng bạn sẽ đánh bóng 'lob' qua đầu đối thủ là gì?	Chỉ ngón tay cái lên cao hoặc nói 'lob' là những cách hiệu quả để thông báo ý định đánh 'lob' của bạn, giúp đồng đội chuẩn bị di chuyển hoặc che phủ sân sau.	2025-12-10 10:25:30.184044	87
219	Điều gì quan trọng nhất khi bạn và đồng đội của bạn đang ở trong tình thế phòng thủ kéo dài?	Khi ở thế phòng thủ, điều quan trọng nhất là phải kiên nhẫn, cố gắng 'reset' điểm bằng cách đưa bóng an toàn vào Kitchen đối thủ hoặc chờ cơ hội phản công. Hạn chế các cú đánh mạo hiểm có thể dẫn đến lỗi.	2025-12-10 10:25:30.184044	87
220	Pickleball phù hợp vói những ai?	 Pickleball là môn thể thao dành cho mọi lứa tuổi và trình độ kỹ năng.	2025-11-22 12:12:55.174	88
221	Dụng cụ cơ bản để chơi Pickleball là gì?	Dụng cụ cơ bản bao gồm vợt, bóng và lưới.	2025-11-22 12:12:55.174	88
222	Mục tiêu chính của trò chơi Pickleball là gì?	Mục tiêu chính là ghi điểm bằng cách đánh bóng qua lưới và vào khu vực đối phương mà họ không thể trả lại.	2025-11-22 12:12:55.174	88
223	Kích thước sân Pickleball tiêu chuẩn là bao nhiêu?	Sân Pickleball tiêu chuẩn có kích thước 20 feet rộng và 44 feet dài.	2025-11-22 12:12:55.174	88
224	Lưới Pickleball được đặt ở độ cao nào?	Lưới Pickleball được đặt ở độ cao 36 inch ở hai bên và 34 inch ở giữa.	2025-11-22 12:12:55.174	88
225	Tay nào thường được sử dụng để đánh forehand?	Forehand thường được đánh bằng tay thuận của người chơi.	2025-11-22 12:12:55.174	89
226	Tay nào thường được sử dụng để đánh backhand?	Backhand thường được đánh bằng tay không thuận của người chơi.	2025-11-22 12:12:55.174	90
227	Khi nào nên sử dụng cú đánh backhand trong trận đấu?	Cú đánh backhand thường được sử dụng khi bóng đến phía không thuận của người chơi hoặc khi cần thay đổi hướng đánh.	2025-11-22 12:12:55.174	90
228	Điều gì là quan trọng nhất khi thực hiện cú đánh backhand?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh backhand hiệu quả.	2025-11-22 12:12:55.174	90
229	Khi nào nên sử dụng cú giao bóng trong trận đấu?	Cú giao bóng được sử dụng để bắt đầu mỗi điểm trong trận đấu Pickleball.	2025-11-22 12:12:55.174	91
230	Điều gì là quan trọng nhất khi thực hiện cú giao bóng?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú giao bóng hiệu quả.	2025-11-22 12:12:55.174	91
231	Làm thế nào để tăng độ chính xác khi giao bóng?	Tăng độ chính xác khi giao bóng có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật.	2025-11-22 12:12:55.174	91
232	Pickleball phù hợp vói những ai?	 Pickleball là môn thể thao dành cho mọi lứa tuổi và trình độ kỹ năng.	2025-11-22 12:12:55.174	92
233	Dụng cụ cơ bản để chơi Pickleball là gì?	Dụng cụ cơ bản bao gồm vợt, bóng và lưới.	2025-11-22 12:12:55.174	92
234	Mục tiêu chính của trò chơi Pickleball là gì?	Mục tiêu chính là ghi điểm bằng cách đánh bóng qua lưới và vào khu vực đối phương mà họ không thể trả lại.	2025-11-22 12:12:55.174	92
235	Kích thước sân Pickleball tiêu chuẩn là bao nhiêu?	Sân Pickleball tiêu chuẩn có kích thước 20 feet rộng và 44 feet dài.	2025-11-22 12:12:55.174	92
236	Lưới Pickleball được đặt ở độ cao nào?	Lưới Pickleball được đặt ở độ cao 36 inch ở hai bên và 34 inch ở giữa.	2025-11-22 12:12:55.174	92
237	Tay nào thường được sử dụng để đánh forehand?	Forehand thường được đánh bằng tay thuận của người chơi.	2025-11-22 12:12:55.174	93
238	Tay nào thường được sử dụng để đánh backhand?	Backhand thường được đánh bằng tay không thuận của người chơi.	2025-11-22 12:12:55.174	94
239	Khi nào nên sử dụng cú đánh backhand trong trận đấu?	Cú đánh backhand thường được sử dụng khi bóng đến phía không thuận của người chơi hoặc khi cần thay đổi hướng đánh.	2025-11-22 12:12:55.174	94
240	Điều gì là quan trọng nhất khi thực hiện cú đánh backhand?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh backhand hiệu quả.	2025-11-22 12:12:55.174	94
241	Khi nào nên sử dụng cú giao bóng trong trận đấu?	Cú giao bóng được sử dụng để bắt đầu mỗi điểm trong trận đấu Pickleball.	2025-11-22 12:12:55.174	95
242	Điều gì là quan trọng nhất khi thực hiện cú giao bóng?	Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú giao bóng hiệu quả.	2025-11-22 12:12:55.174	95
243	Làm thế nào để tăng độ chính xác khi giao bóng?	Tăng độ chính xác khi giao bóng có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật.	2025-11-22 12:12:55.174	95
\.


--
-- TOC entry 4092 (class 0 OID 18585)
-- Dependencies: 248
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempts (id, attempt_number, score, created_at, attempted_by, session_id) FROM stdin;
5	1	20	2025-12-08 01:00:12.385438	4	41
6	1	50	2025-12-08 06:38:53.995924	4	58
7	2	40	2025-12-14 04:10:10.856753	4	41
\.


--
-- TOC entry 4100 (class 0 OID 18622)
-- Dependencies: 256
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quizzes (id, title, description, total_questions, deleted_at, "createdById", lesson_id, session_id) FROM stdin;
64	Bộ câu hỏi về Smash	\N	2	\N	2	20	\N
66	Bộ câu hỏi về Smash	\N	2	\N	2	\N	58
67	Bộ câu hỏi về Smash	\N	2	\N	2	\N	59
68	Quiz cho bai hoc 1	\N	1	\N	2	21	\N
9	Câu hỏi về giới thiệu Pickleball	Đánh giá kiến thức cơ bản về Pickleball.	5	\N	2	5	\N
10	Câu hỏi về forehand	Đánh giá kiến thức về kỹ thuật forehand trong Pickleball.	3	\N	2	6	\N
11	Câu hỏi về backhand	Đánh giá kiến thức về kỹ thuật backhand trong Pickleball.	3	\N	2	7	\N
12	Câu hỏi về giao bóng	Các câu hỏi kiểm tra kiến thức về kỹ thuật giao bóng trong Pickleball.	3	\N	2	8	\N
85	Kiểm tra Vị Trí và Di Chuyển Thông Minh Trên Sân Đôi	Bài kiểm tra này sẽ đánh giá sự hiểu biết của bạn về vị trí và di chuyển chiến thuật trong đánh đôi pickleball.	5	\N	\N	43	\N
86	Kiểm tra Lựa Chọn Cú Đánh Tấn Công và Phòng Thủ Nâng Cao	Bài kiểm tra này sẽ đánh giá khả năng của bạn trong việc lựa chọn và thực hiện các cú đánh tấn công và phòng thủ chiến lược trong đánh đôi.	5	\N	\N	44	\N
87	Kiểm tra Giao Tiếp, Làm Việc Nhóm và Thích Nghi với Đối Thủ	Bài kiểm tra này sẽ đánh giá kiến thức của bạn về giao tiếp, làm việc nhóm và khả năng thích nghi chiến thuật trong đánh đôi pickleball.	5	\N	\N	45	\N
88	Câu hỏi về giới thiệu Pickleball	Đánh giá kiến thức cơ bản về Pickleball.	5	\N	2	\N	60
89	Câu hỏi về forehand	Đánh giá kiến thức về kỹ thuật forehand trong Pickleball.	3	\N	2	\N	61
90	Câu hỏi về backhand	Đánh giá kiến thức về kỹ thuật backhand trong Pickleball.	3	\N	2	\N	62
91	Câu hỏi về giao bóng	Các câu hỏi kiểm tra kiến thức về kỹ thuật giao bóng trong Pickleball.	3	\N	2	\N	63
92	Câu hỏi về giới thiệu Pickleball	Đánh giá kiến thức cơ bản về Pickleball.	5	\N	2	\N	64
93	Câu hỏi về forehand	Đánh giá kiến thức về kỹ thuật forehand trong Pickleball.	3	\N	2	\N	65
94	Câu hỏi về backhand	Đánh giá kiến thức về kỹ thuật backhand trong Pickleball.	3	\N	2	\N	66
95	Câu hỏi về giao bóng	Các câu hỏi kiểm tra kiến thức về kỹ thuật giao bóng trong Pickleball.	3	\N	2	\N	67
48	Câu hỏi về giới thiệu Pickleball	Đánh giá kiến thức cơ bản về Pickleball.	5	\N	2	\N	41
49	Câu hỏi về forehand	Đánh giá kiến thức về kỹ thuật forehand trong Pickleball.	3	\N	2	\N	42
50	Câu hỏi về backhand	Đánh giá kiến thức về kỹ thuật backhand trong Pickleball.	3	\N	2	\N	43
51	Câu hỏi về giao bóng	Các câu hỏi kiểm tra kiến thức về kỹ thuật giao bóng trong Pickleball.	3	\N	2	\N	44
\.


--
-- TOC entry 4072 (class 0 OID 18362)
-- Dependencies: 228
-- Data for Name: request_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_actions (id, type, comment, created_at, handled_by, request_id) FROM stdin;
32	APPROVED	Yêu cầu đã được duyệt	2025-12-13 05:52:19.685641	1	33
33	APPROVED	Yêu cầu đã được duyệt	2025-12-14 02:37:11.411446	1	32
\.


--
-- TOC entry 4074 (class 0 OID 18392)
-- Dependencies: 230
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requests (id, description, status, metadata, created_at, updated_at, created_by, type) FROM stdin;
33	Tạo khóa học: Nhập môn Pickleball - Khóa 3	APPROVED	{"id": 32, "type": "course", "details": {"id": 32, "name": "Nhập môn Pickleball -  Khóa 3", "court": {"id": 62}, "level": "BEGINNER", "status": "PENDING_APPROVAL", "endDate": "2026-01-15T00:00:00.000Z", "subject": {"id": 2, "name": "Nhập môn Pickleball", "level": "BEGINNER", "status": "PUBLISHED", "courses": [{"id": 31, "name": "Nhập môn Pickleball -  Khóa 2", "level": "BEGINNER", "status": "PENDING_APPROVAL", "endDate": "2026-01-14", "createdAt": "2025-12-11T14:57:27.091Z", "deletedAt": null, "publicUrl": "https://pz-picklaball.b-cdn.net/course_image/506098/course_image_5581_1765465047085.jpeg", "startDate": "2025-12-24", "updatedAt": "2025-12-11T14:57:27.091Z", "description": "Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.", "progressPct": 0, "totalEarnings": "0.000", "totalSessions": 4, "googleMeetLink": "asd-dasd-asd", "learningFormat": "INDIVIDUAL", "maxParticipants": 1, "minParticipants": 1, "cancellingReason": null, "currentParticipants": 0, "pricePerParticipant": "2000.000"}, {"id": 18, "name": "Nhập môn Pickleball -  Khóa 1", "level": "BEGINNER", "status": "ON_GOING", "endDate": "2026-12-22", "createdAt": "2025-12-06T05:39:35.613Z", "deletedAt": null, "publicUrl": "https://facolospickleball.com/wp-content/uploads/2025/05/lam-sao-de-choi-pickleball-gioi-2.jpg", "startDate": "2025-12-06", "updatedAt": "2025-12-06T05:45:52.034Z", "description": "Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.", "progressPct": 25, "totalEarnings": "1800.000", "totalSessions": 4, "googleMeetLink": "abc-def-xyz", "learningFormat": "INDIVIDUAL", "maxParticipants": 1, "minParticipants": 1, "cancellingReason": null, "currentParticipants": 1, "pricePerParticipant": "2000.000"}], "lessons": [{"id": 5, "name": "Giới thiệu về Pickleball", "quiz": {"id": 9, "title": "Câu hỏi về giới thiệu Pickleball", "deletedAt": null, "questions": [{"id": 25, "title": "Pickleball phù hợp vói những ai?", "options": [{"id": 97, "content": "Chỉ dành cho trẻ em", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 98, "content": "Mọi lứa tuổi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 99, "content": "Chỉ dành cho người lớn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 100, "content": "Chỉ dành cho vận động viên chuyên nghiệp", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": " Pickleball là môn thể thao dành cho mọi lứa tuổi và trình độ kỹ năng."}, {"id": 26, "title": "Dụng cụ cơ bản để chơi Pickleball là gì?", "options": [{"id": 101, "content": "Vợt và bóng", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 102, "content": "Bóng và lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 103, "content": "Vợt, bóng và lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 104, "content": "Chỉ vợt", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Dụng cụ cơ bản bao gồm vợt, bóng và lưới."}, {"id": 27, "title": "Mục tiêu chính của trò chơi Pickleball là gì?", "options": [{"id": 105, "content": "Giữ bóng trong sân của mình càng lâu càng tốt", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 106, "content": "Ghi điểm bằng cách đánh bóng qua lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 107, "content": "Đánh bóng ra ngoài sân đối phương", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 108, "content": "Chạm bóng vào lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Mục tiêu chính là ghi điểm bằng cách đánh bóng qua lưới và vào khu vực đối phương mà họ không thể trả lại."}, {"id": 28, "title": "Kích thước sân Pickleball tiêu chuẩn là bao nhiêu?", "options": [{"id": 109, "content": "10 feet rộng và 22 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 110, "content": "20 feet rộng và 44 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 111, "content": "30 feet rộng và 60 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 112, "content": "40 feet rộng và 80 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Sân Pickleball tiêu chuẩn có kích thước 20 feet rộng và 44 feet dài."}, {"id": 29, "title": "Lưới Pickleball được đặt ở độ cao nào?", "options": [{"id": 113, "content": "30 inch ở hai bên và 28 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 114, "content": "36 inch ở hai bên và 34 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 115, "content": "40 inch ở hai bên và 38 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 116, "content": "42 inch ở hai bên và 40 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Lưới Pickleball được đặt ở độ cao 36 inch ở hai bên và 34 inch ở giữa."}], "description": "Đánh giá kiến thức cơ bản về Pickleball.", "totalQuestions": 5}, "video": {"id": 6, "tags": "{\\"pickleball\\",\\"giới thiệu\\",\\"thể thao\\"}", "title": "Video giới thiệu về Pickleball", "status": "READY", "duration": 3, "drillName": "Tập luyện cơ bản", "publicUrl": "https://pz-picklaball.b-cdn.net/video/193908/video_9452234_1764564239741.mov", "description": "Video này cung cấp cái nhìn tổng quan về môn thể thao Pickleball, bao gồm lịch sử, luật chơi và những lợi ích khi tham gia.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/598410/video_9452234_1764564239741-thumbnail.png", "drillDescription": "Các bài tập cơ bản để làm quen với Pickleball", "drillPracticeSets": "3 set, mỗi set 10 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "TÌm hiểu về các động tác cơ bản và cách chơi Pickleball.", "lessonNumber": 1}, {"id": 6, "name": "Forehand trong Pickleball", "quiz": {"id": 10, "title": "Câu hỏi về forehand", "deletedAt": null, "questions": [{"id": 30, "title": "Tay nào thường được sử dụng để đánh forehand?", "options": [{"id": 117, "content": "Tay trái", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 118, "content": "Tay thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 119, "content": "Cả hai tay", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 120, "content": "Tay không thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Forehand thường được đánh bằng tay thuận của người chơi."}], "description": "Đánh giá kiến thức về kỹ thuật forehand trong Pickleball.", "totalQuestions": 3}, "video": {"id": 7, "tags": "{\\"pickleball\\",\\"forehand\\",\\"kỹ thuật\\"}", "title": "Kỹ thuật đánh forehand", "status": "READY", "duration": 2, "drillName": "Tập luyện forehand", "publicUrl": "https://pz-picklaball.b-cdn.net/video/899989/video_8279162_1764564270276.mov", "description": "Hướng dẫn chi tiết về kỹ thuật đánh forehand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/295629/video_8279162_1764564270276-thumbnail.png", "drillDescription": "Các bài tập để cải thiện kỹ thuật đánh forehand", "drillPracticeSets": "4 set, mỗi set 8 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Tìm hiểu về động tác Forehand trong Pickleball.", "lessonNumber": 2}, {"id": 7, "name": "Backhand trong Pickleball", "quiz": {"id": 11, "title": "Câu hỏi về backhand", "deletedAt": null, "questions": [{"id": 31, "title": "Tay nào thường được sử dụng để đánh backhand?", "options": [{"id": 121, "content": "Tay thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 122, "content": "Tay không thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 123, "content": "Cả hai tay", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 124, "content": "Tay trái", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Backhand thường được đánh bằng tay không thuận của người chơi."}, {"id": 32, "title": "Khi nào nên sử dụng cú đánh backhand trong trận đấu?", "options": [{"id": 125, "content": "Khi bóng đến phía thuận của người chơi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 126, "content": "Khi bóng đến phía không thuận của người chơi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 127, "content": "Khi không muốn thay đổi hướng đánh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 128, "content": "Khi đứng gần lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Cú đánh backhand thường được sử dụng khi bóng đến phía không thuận của người chơi hoặc khi cần thay đổi hướng đánh."}, {"id": 33, "title": "Điều gì là quan trọng nhất khi thực hiện cú đánh backhand?", "options": [{"id": 129, "content": "Tư thế cơ thể và vị trí chân", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 130, "content": "Chỉ cần vung vợt mạnh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 131, "content": "Chỉ cần cầm vợt chắc chắn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 132, "content": "Không cần chú ý đến tư thế", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh backhand hiệu quả."}], "description": "Đánh giá kiến thức về kỹ thuật backhand trong Pickleball.", "totalQuestions": 3}, "video": {"id": 8, "tags": "{\\"pickleball\\",\\"backhand\\",\\"kỹ thuật\\"}", "title": "Kỹ thuật đánh backhand", "status": "READY", "duration": 2, "drillName": "Tập luyện backhand", "publicUrl": "https://pz-picklaball.b-cdn.net/video/774427/video_8279162_1764564285444.mov", "description": "Hướng dẫn chi tiết về kỹ thuật đánh backhand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/468987/video_8279162_1764564285444-thumbnail.png", "drillDescription": "Các bài tập để cải thiện kỹ thuật đánh backhand", "drillPracticeSets": "4 set, mỗi set 8 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Tìm hiểu về động tác Backhand trong Pickleball.", "lessonNumber": 3}, {"id": 8, "name": "Giao bóng trong Pickleball", "quiz": {"id": 12, "title": "Câu hỏi về giao bóng", "deletedAt": null, "questions": [{"id": 34, "title": "Khi nào nên sử dụng cú giao bóng trong trận đấu?", "options": [{"id": 133, "content": "Khi bóng đến phía thuận của người chơi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 134, "content": "Để bắt đầu mỗi điểm", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 135, "content": "Khi không muốn thay đổi hướng đánh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 136, "content": "Khi đứng gần lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Cú giao bóng được sử dụng để bắt đầu mỗi điểm trong trận đấu Pickleball."}, {"id": 35, "title": "Điều gì là quan trọng nhất khi thực hiện cú giao bóng?", "options": [{"id": 137, "content": "Tư thế cơ thể và vị trí chân", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 138, "content": "Chỉ cần vung vợt mạnh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 139, "content": "Chỉ cần cầm vợt chắc chắn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 140, "content": "Không cần chú ý đến tư thế", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú giao bóng hiệu quả."}, {"id": 36, "title": "Làm thế nào để tăng độ chính xác khi giao bóng?", "options": [{"id": 141, "content": "Luyện tập đều đặn và tập trung vào kỹ thuật", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 142, "content": "Chỉ cần đánh mạnh hơn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 143, "content": "Không cần luyện tập nhiều", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 144, "content": "Chỉ cần thay đổi vợt", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Tăng độ chính xác khi giao bóng có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật."}], "description": "Các câu hỏi kiểm tra kiến thức về kỹ thuật giao bóng trong Pickleball.", "totalQuestions": 3}, "video": {"id": 9, "tags": "{\\"pickleball\\",\\"giao bóng\\",\\"kỹ thuật\\"}", "title": "Kỹ thuật giao bóng", "status": "READY", "duration": 3, "drillName": "Tập luyện giao bóng", "publicUrl": "https://pz-picklaball.b-cdn.net/video/768962/video_6934776_1764564299237.mov", "description": "Hướng dẫn chi tiết về kỹ thuật giao bóng trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/435190/video_6934776_1764564299237-thumbnail.png", "drillDescription": "Các bài tập để cải thiện kỹ thuật giao bóng", "drillPracticeSets": "4 set, mỗi set 8 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Tìm hiểu về kỹ thuật giao bóng trong Pickleball.", "lessonNumber": 4}], "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.", "isAIGenerated": false}, "createdAt": "2025-12-12T15:12:50.932Z", "createdBy": {"id": 2}, "deletedAt": null, "publicUrl": null, "schedules": [{"id": 35, "endTime": "11:00:00", "dayOfWeek": "Thursday", "startTime": "09:00:00", "totalSessions": 4}], "startDate": "2025-12-25T00:00:00.000Z", "updatedAt": "2025-12-12T15:12:50.932Z", "description": "Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.", "progressPct": 0, "totalEarnings": "0.000", "totalSessions": 4, "googleMeetLink": "asd-gjhk-asd", "learningFormat": "INDIVIDUAL", "maxParticipants": 1, "minParticipants": 1, "cancellingReason": null, "currentParticipants": 0, "pricePerParticipant": "500000.000"}}	2025-12-12 15:12:50.932808	2025-12-13 05:52:19.685641	2	COURSE-APPROVAL
32	Tạo khóa học: Nhập môn Pickleball - Khóa 2	APPROVED	{"id": 31, "type": "course", "details": {"id": 31, "name": "Nhập môn Pickleball -  Khóa 2", "court": {"id": 47}, "level": "BEGINNER", "status": "PENDING_APPROVAL", "endDate": "2026-01-14T00:00:00.000Z", "subject": {"id": 2, "name": "Nhập môn Pickleball", "level": "BEGINNER", "status": "PUBLISHED", "courses": [{"id": 18, "name": "Nhập môn Pickleball -  Khóa 1", "level": "BEGINNER", "status": "ON_GOING", "endDate": "2026-12-22", "createdAt": "2025-12-06T05:39:35.613Z", "deletedAt": null, "publicUrl": "https://facolospickleball.com/wp-content/uploads/2025/05/lam-sao-de-choi-pickleball-gioi-2.jpg", "startDate": "2025-12-06", "updatedAt": "2025-12-06T05:45:52.034Z", "description": "Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.", "progressPct": 25, "totalEarnings": "1800.000", "totalSessions": 4, "googleMeetLink": "abc-def-xyz", "learningFormat": "INDIVIDUAL", "maxParticipants": 1, "minParticipants": 1, "cancellingReason": null, "currentParticipants": 1, "pricePerParticipant": "2000.000"}], "lessons": [{"id": 5, "name": "Giới thiệu về Pickleball", "quiz": {"id": 9, "title": "Câu hỏi về giới thiệu Pickleball", "deletedAt": null, "questions": [{"id": 25, "title": "Pickleball phù hợp vói những ai?", "options": [{"id": 97, "content": "Chỉ dành cho trẻ em", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 98, "content": "Mọi lứa tuổi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 99, "content": "Chỉ dành cho người lớn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 100, "content": "Chỉ dành cho vận động viên chuyên nghiệp", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": " Pickleball là môn thể thao dành cho mọi lứa tuổi và trình độ kỹ năng."}, {"id": 26, "title": "Dụng cụ cơ bản để chơi Pickleball là gì?", "options": [{"id": 101, "content": "Vợt và bóng", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 102, "content": "Bóng và lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 103, "content": "Vợt, bóng và lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 104, "content": "Chỉ vợt", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Dụng cụ cơ bản bao gồm vợt, bóng và lưới."}, {"id": 27, "title": "Mục tiêu chính của trò chơi Pickleball là gì?", "options": [{"id": 105, "content": "Giữ bóng trong sân của mình càng lâu càng tốt", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 106, "content": "Ghi điểm bằng cách đánh bóng qua lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 107, "content": "Đánh bóng ra ngoài sân đối phương", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 108, "content": "Chạm bóng vào lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Mục tiêu chính là ghi điểm bằng cách đánh bóng qua lưới và vào khu vực đối phương mà họ không thể trả lại."}, {"id": 28, "title": "Kích thước sân Pickleball tiêu chuẩn là bao nhiêu?", "options": [{"id": 109, "content": "10 feet rộng và 22 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 110, "content": "20 feet rộng và 44 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 111, "content": "30 feet rộng và 60 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 112, "content": "40 feet rộng và 80 feet dài", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Sân Pickleball tiêu chuẩn có kích thước 20 feet rộng và 44 feet dài."}, {"id": 29, "title": "Lưới Pickleball được đặt ở độ cao nào?", "options": [{"id": 113, "content": "30 inch ở hai bên và 28 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 114, "content": "36 inch ở hai bên và 34 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 115, "content": "40 inch ở hai bên và 38 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 116, "content": "42 inch ở hai bên và 40 inch ở giữa", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Lưới Pickleball được đặt ở độ cao 36 inch ở hai bên và 34 inch ở giữa."}], "description": "Đánh giá kiến thức cơ bản về Pickleball.", "totalQuestions": 5}, "video": {"id": 6, "tags": "{\\"pickleball\\",\\"giới thiệu\\",\\"thể thao\\"}", "title": "Video giới thiệu về Pickleball", "status": "READY", "duration": 3, "drillName": "Tập luyện cơ bản", "publicUrl": "https://pz-picklaball.b-cdn.net/video/193908/video_9452234_1764564239741.mov", "description": "Video này cung cấp cái nhìn tổng quan về môn thể thao Pickleball, bao gồm lịch sử, luật chơi và những lợi ích khi tham gia.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/598410/video_9452234_1764564239741-thumbnail.png", "drillDescription": "Các bài tập cơ bản để làm quen với Pickleball", "drillPracticeSets": "3 set, mỗi set 10 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "TÌm hiểu về các động tác cơ bản và cách chơi Pickleball.", "lessonNumber": 1}, {"id": 6, "name": "Forehand trong Pickleball", "quiz": {"id": 10, "title": "Câu hỏi về forehand", "deletedAt": null, "questions": [{"id": 30, "title": "Tay nào thường được sử dụng để đánh forehand?", "options": [{"id": 117, "content": "Tay trái", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 118, "content": "Tay thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 119, "content": "Cả hai tay", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 120, "content": "Tay không thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Forehand thường được đánh bằng tay thuận của người chơi."}], "description": "Đánh giá kiến thức về kỹ thuật forehand trong Pickleball.", "totalQuestions": 3}, "video": {"id": 7, "tags": "{\\"pickleball\\",\\"forehand\\",\\"kỹ thuật\\"}", "title": "Kỹ thuật đánh forehand", "status": "READY", "duration": 2, "drillName": "Tập luyện forehand", "publicUrl": "https://pz-picklaball.b-cdn.net/video/899989/video_8279162_1764564270276.mov", "description": "Hướng dẫn chi tiết về kỹ thuật đánh forehand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/295629/video_8279162_1764564270276-thumbnail.png", "drillDescription": "Các bài tập để cải thiện kỹ thuật đánh forehand", "drillPracticeSets": "4 set, mỗi set 8 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Tìm hiểu về động tác Forehand trong Pickleball.", "lessonNumber": 2}, {"id": 7, "name": "Backhand trong Pickleball", "quiz": {"id": 11, "title": "Câu hỏi về backhand", "deletedAt": null, "questions": [{"id": 31, "title": "Tay nào thường được sử dụng để đánh backhand?", "options": [{"id": 121, "content": "Tay thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 122, "content": "Tay không thuận", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 123, "content": "Cả hai tay", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 124, "content": "Tay trái", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Backhand thường được đánh bằng tay không thuận của người chơi."}, {"id": 32, "title": "Khi nào nên sử dụng cú đánh backhand trong trận đấu?", "options": [{"id": 125, "content": "Khi bóng đến phía thuận của người chơi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 126, "content": "Khi bóng đến phía không thuận của người chơi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 127, "content": "Khi không muốn thay đổi hướng đánh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 128, "content": "Khi đứng gần lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Cú đánh backhand thường được sử dụng khi bóng đến phía không thuận của người chơi hoặc khi cần thay đổi hướng đánh."}, {"id": 33, "title": "Điều gì là quan trọng nhất khi thực hiện cú đánh backhand?", "options": [{"id": 129, "content": "Tư thế cơ thể và vị trí chân", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 130, "content": "Chỉ cần vung vợt mạnh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 131, "content": "Chỉ cần cầm vợt chắc chắn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 132, "content": "Không cần chú ý đến tư thế", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú đánh backhand hiệu quả."}], "description": "Đánh giá kiến thức về kỹ thuật backhand trong Pickleball.", "totalQuestions": 3}, "video": {"id": 8, "tags": "{\\"pickleball\\",\\"backhand\\",\\"kỹ thuật\\"}", "title": "Kỹ thuật đánh backhand", "status": "READY", "duration": 2, "drillName": "Tập luyện backhand", "publicUrl": "https://pz-picklaball.b-cdn.net/video/774427/video_8279162_1764564285444.mov", "description": "Hướng dẫn chi tiết về kỹ thuật đánh backhand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/468987/video_8279162_1764564285444-thumbnail.png", "drillDescription": "Các bài tập để cải thiện kỹ thuật đánh backhand", "drillPracticeSets": "4 set, mỗi set 8 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Tìm hiểu về động tác Backhand trong Pickleball.", "lessonNumber": 3}, {"id": 8, "name": "Giao bóng trong Pickleball", "quiz": {"id": 12, "title": "Câu hỏi về giao bóng", "deletedAt": null, "questions": [{"id": 34, "title": "Khi nào nên sử dụng cú giao bóng trong trận đấu?", "options": [{"id": 133, "content": "Khi bóng đến phía thuận của người chơi", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 134, "content": "Để bắt đầu mỗi điểm", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 135, "content": "Khi không muốn thay đổi hướng đánh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 136, "content": "Khi đứng gần lưới", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Cú giao bóng được sử dụng để bắt đầu mỗi điểm trong trận đấu Pickleball."}, {"id": 35, "title": "Điều gì là quan trọng nhất khi thực hiện cú giao bóng?", "options": [{"id": 137, "content": "Tư thế cơ thể và vị trí chân", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 138, "content": "Chỉ cần vung vợt mạnh", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 139, "content": "Chỉ cần cầm vợt chắc chắn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 140, "content": "Không cần chú ý đến tư thế", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Tư thế cơ thể và vị trí chân đóng vai trò quan trọng trong việc thực hiện cú giao bóng hiệu quả."}, {"id": 36, "title": "Làm thế nào để tăng độ chính xác khi giao bóng?", "options": [{"id": 141, "content": "Luyện tập đều đặn và tập trung vào kỹ thuật", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": true}, {"id": 142, "content": "Chỉ cần đánh mạnh hơn", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 143, "content": "Không cần luyện tập nhiều", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}, {"id": 144, "content": "Chỉ cần thay đổi vợt", "createdAt": "2025-11-22T12:12:55.174Z", "isCorrect": false}], "createdAt": "2025-11-22T12:12:55.174Z", "explanation": "Tăng độ chính xác khi giao bóng có thể đạt được thông qua việc luyện tập đều đặn và tập trung vào kỹ thuật."}], "description": "Các câu hỏi kiểm tra kiến thức về kỹ thuật giao bóng trong Pickleball.", "totalQuestions": 3}, "video": {"id": 9, "tags": "{\\"pickleball\\",\\"giao bóng\\",\\"kỹ thuật\\"}", "title": "Kỹ thuật giao bóng", "status": "READY", "duration": 3, "drillName": "Tập luyện giao bóng", "publicUrl": "https://pz-picklaball.b-cdn.net/video/768962/video_6934776_1764564299237.mov", "description": "Hướng dẫn chi tiết về kỹ thuật giao bóng trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.", "thumbnailUrl": "https://pz-picklaball.b-cdn.net/video_thumbnail/435190/video_6934776_1764564299237-thumbnail.png", "drillDescription": "Các bài tập để cải thiện kỹ thuật giao bóng", "drillPracticeSets": "4 set, mỗi set 8 phút"}, "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Tìm hiểu về kỹ thuật giao bóng trong Pickleball.", "lessonNumber": 4}], "createdAt": "2025-11-22T12:12:55.174Z", "deletedAt": null, "updatedAt": "2025-11-22T12:12:55.174Z", "description": "Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.", "isAIGenerated": false}, "createdAt": "2025-12-11T14:57:27.091Z", "createdBy": {"id": 2}, "deletedAt": null, "publicUrl": "https://pz-picklaball.b-cdn.net/course_image/506098/course_image_5581_1765465047085.jpeg", "schedules": [{"id": 34, "endTime": "11:00:00", "dayOfWeek": "Wednesday", "startTime": "09:00:00", "totalSessions": 4}], "startDate": "2025-12-24T00:00:00.000Z", "updatedAt": "2025-12-11T14:57:27.091Z", "description": "Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.", "progressPct": 0, "totalEarnings": "0.000", "totalSessions": 4, "googleMeetLink": "asd-dasd-asd", "learningFormat": "INDIVIDUAL", "maxParticipants": 1, "minParticipants": 1, "cancellingReason": null, "currentParticipants": 0, "pricePerParticipant": "2000.000"}}	2025-12-11 14:57:27.091465	2025-12-14 02:37:11.411446	2	COURSE-APPROVAL
\.


--
-- TOC entry 4064 (class 0 OID 18285)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	ADMIN
2	COACH
3	LEARNER
\.


--
-- TOC entry 4076 (class 0 OID 18438)
-- Dependencies: 232
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedules (id, day_of_week, start_time, end_time, total_sessions, course_id) FROM stdin;
21	Monday	09:00:00	11:00:00	4	18
32	Monday	05:00:00	07:00:00	1	29
33	Tuesday	09:00:00	11:00:00	1	30
34	Wednesday	09:00:00	11:00:00	4	31
35	Thursday	09:00:00	11:00:00	4	32
\.


--
-- TOC entry 4116 (class 0 OID 18790)
-- Dependencies: 272
-- Data for Name: session_earnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session_earnings (id, session_price, coach_earning_total, created_at, paid_at, session_id) FROM stdin;
3	450.000	450.000	2025-12-06 05:45:52.034978	2025-12-06	41
4	1800.000	1800.000	2025-12-08 06:37:58.375224	2025-12-08	58
\.


--
-- TOC entry 4118 (class 0 OID 18808)
-- Dependencies: 274
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, name, description, session_number, schedule_date, start_time, end_time, status, created_at, updated_at, "deletedAt", completed_at, course_id, lesson_id, schedule_id) FROM stdin;
42	Forehand trong Pickleball	Tìm hiểu về động tác Forehand trong Pickleball.	2	2025-12-22	09:00:00	11:00:00	SCHEDULED	2025-12-06 05:39:54.071369	2025-12-06 05:43:00.054187	\N	\N	18	6	21
43	Backhand trong Pickleball	Tìm hiểu về động tác Backhand trong Pickleball.	3	2025-12-29	09:00:00	11:00:00	SCHEDULED	2025-12-06 05:39:54.071369	2025-12-06 05:43:00.054187	\N	\N	18	7	21
44	Giao bóng trong Pickleball	Tìm hiểu về kỹ thuật giao bóng trong Pickleball.	4	2026-01-05	09:00:00	11:00:00	SCHEDULED	2025-12-06 05:39:54.071369	2025-12-06 05:43:00.054187	\N	\N	18	8	21
41	Giới thiệu về Pickleball	TÌm hiểu về các động tác cơ bản và cách chơi Pickleball.	1	2025-12-06	09:00:00	11:00:00	COMPLETED	2025-12-06 05:39:54.071369	2025-12-06 05:45:52.034978	\N	2025-12-06	18	5	21
58	Kỹ thuật Smash	Hướng dẫn chi tiết kỹ thuật Smash	1	2025-12-08	05:00:00	07:00:00	COMPLETED	2025-12-08 00:20:03.162417	2025-12-08 06:37:58.375224	\N	2025-12-08	29	20	32
60	Giới thiệu về Pickleball	TÌm hiểu về các động tác cơ bản và cách chơi Pickleball.	1	2025-12-25	09:00:00	11:00:00	PENDING	2025-12-13 05:52:19.685641	2025-12-13 05:52:19.685641	\N	\N	32	5	35
61	Forehand trong Pickleball	Tìm hiểu về động tác Forehand trong Pickleball.	2	2026-01-01	09:00:00	11:00:00	PENDING	2025-12-13 05:52:19.685641	2025-12-13 05:52:19.685641	\N	\N	32	6	35
62	Backhand trong Pickleball	Tìm hiểu về động tác Backhand trong Pickleball.	3	2026-01-08	09:00:00	11:00:00	PENDING	2025-12-13 05:52:19.685641	2025-12-13 05:52:19.685641	\N	\N	32	7	35
63	Giao bóng trong Pickleball	Tìm hiểu về kỹ thuật giao bóng trong Pickleball.	4	2026-01-15	09:00:00	11:00:00	PENDING	2025-12-13 05:52:19.685641	2025-12-13 05:52:19.685641	\N	\N	32	8	35
64	Giới thiệu về Pickleball	TÌm hiểu về các động tác cơ bản và cách chơi Pickleball.	1	2025-12-24	09:00:00	11:00:00	PENDING	2025-12-14 02:37:11.411446	2025-12-14 02:37:11.411446	\N	\N	31	5	34
65	Forehand trong Pickleball	Tìm hiểu về động tác Forehand trong Pickleball.	2	2025-12-31	09:00:00	11:00:00	PENDING	2025-12-14 02:37:11.411446	2025-12-14 02:37:11.411446	\N	\N	31	6	34
66	Backhand trong Pickleball	Tìm hiểu về động tác Backhand trong Pickleball.	3	2026-01-07	09:00:00	11:00:00	PENDING	2025-12-14 02:37:11.411446	2025-12-14 02:37:11.411446	\N	\N	31	7	34
67	Giao bóng trong Pickleball	Tìm hiểu về kỹ thuật giao bóng trong Pickleball.	4	2026-01-14	09:00:00	11:00:00	PENDING	2025-12-14 02:37:11.411446	2025-12-14 02:37:11.411446	\N	\N	31	8	34
59	Kỹ thuật Smash	Hướng dẫn chi tiết kỹ thuật Smash	1	2025-12-16	09:00:00	11:00:00	SCHEDULED	2025-12-08 06:33:53.916403	2025-12-15 00:00:00.159316	\N	\N	30	20	33
\.


--
-- TOC entry 4104 (class 0 OID 18660)
-- Dependencies: 260
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, name, description, level, status, created_at, updated_at, deleted_at, "createdById", is_ai_generated) FROM stdin;
2	Nhập môn Pickleball	Khám phá thế giới Pickleball từ những bước đầu tiên. Khóa học này sẽ giúp bạn hiểu rõ về luật chơi, kỹ thuật cơ bản và cách tham gia vào cộng đồng Pickleball sôi động.	BEGINNER	PUBLISHED	2025-11-22 12:12:55.174408	2025-11-22 12:12:55.174408	\N	2	f
10	Pickleball Nâng cao	Huấn luyên nâng cao các động tác cho môn pickleball	ADVANCED	PUBLISHED	2025-12-07 23:20:13.312128	2025-12-07 23:27:18.926994	\N	2	f
11	Test 0144	abc	INTERMEDIATE	PUBLISHED	2025-12-08 06:44:49.216759	2025-12-08 06:47:59.125653	\N	2	f
19	Chiến Thuật Đánh Đôi Nâng Cao Pickleball	Khóa học này được thiết kế dành cho những người chơi pickleball muốn nâng cao kỹ năng chiến thuật trong đánh đôi. Bạn sẽ được học các nguyên tắc cơ bản và nâng cao về vị trí trên sân, di chuyển thông minh, lựa chọn cú đánh phù hợp trong từng tình huống, và cách giao tiếp hiệu quả với đồng đội. Khóa học đi sâu vào các chiến lược tấn công và phòng thủ, cách đối phó với những kiểu đối thủ khác nhau, và cách tận dụng điểm yếu của đối phương. Chúng tôi sẽ phân tích các tình huống thực tế, từ đó giúp bạn phát triển khả năng đọc trận đấu, ra quyết định nhanh chóng và tối ưu hóa hiệu suất thi đấu. Với 3 bài học chuyên sâu, bạn sẽ tự tin hơn khi bước vào sân, sẵn sàng áp dụng các chiến thuật phức tạp để giành chiến thắng trong các trận đấu đôi.	INTERMEDIATE	DRAFT	2025-12-10 10:25:30.184044	2025-12-10 10:25:30.184044	\N	2	t
20	Aaa	Aaa	INTERMEDIATE	DRAFT	2025-12-13 14:56:26.780299	2025-12-13 14:57:02.722194	2025-12-13 14:57:02.722194	2	f
\.


--
-- TOC entry 4138 (class 0 OID 18965)
-- Dependencies: 294
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, phone_number, password, profile_picture, refresh_token, is_email_verified, is_phone_verified, email_verification_token, reset_password_token, is_active, last_login_at, created_at, updated_at, deleted_at, role_id, province_id, district_id) FROM stdin;
6	Lam Tien Hung	\N	+84832428278	$2b$10$BjTEQ0OziLbM9cVBFmCSDuhMvIfb8J6OWpvE63nX1nvy2kBvGCVY6	\N	$2b$10$21u0pxhNlVEzE3Wk1uZkWuLWjsWMJzvBi2RGt8p/U8HN2Rbsl7Am6	f	t	\N	\N	t	2025-12-06 01:47:56.924	2025-11-22 12:19:04.449069	2025-12-06 01:47:56.946445	\N	3	50	543
4	Lê Văn C	Learner001@gmail.com	+84904234567	$2b$10$WYqqdl.nFLVraBLldmRDUOnBPAeBGQOgBO59b0wJyUdDc1fuSNqNy	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTboSsJG0-rhiwwJq0K6Nt0-9T2IM6aASzXLg&s	$2b$10$83/gvj/fBPBu7xP1ISpmX.bHG1dv1L19cXTiiE8bx9jLVhMqNOzOC	t	t	\N	\N	t	2025-12-14 13:55:14.551	2025-11-22 10:48:22.167172	2025-12-14 13:55:14.55858	\N	3	50	543
8	Nguyen Learner	nguyenanhtuan.170164@gmail.com	+84905269595	$2a$10$DjdMsFhFUZnFILpMbHZNwuARaDl81ZuJcIEQ5r/iMqt5pZ/iBSJyS	\N		t	t	\N	\N	t	2025-11-23 10:29:49.836	2025-11-22 10:48:21.502417	2025-11-23 03:29:51.582063	\N	3	50	543
3	Trần Văn B	coach.b@pickleball.vn	+84903234567	$2b$10$2ddh1gMCe86EYLubTMYbwuCP6BuZ16DyyKXj.g6pcR08kNO4Rhc5.	https://pickleballplus.vn/uploads/2025/03/hlv-huynh-phu-qui-nguoi-tien-phong-trong-lang-pickleball-viet-nam1.jpg	\N	t	t	\N	\N	t	\N	2025-11-22 10:48:21.831728	2025-11-22 10:48:21.831728	\N	2	50	543
7	Nguyen Tuan	tuan@gmail.com	+84905038319	$2a$10$DjdMsFhFUZnFILpMbHZNwuARaDl81ZuJcIEQ5r/iMqt5pZ/iBSJyS	https://cdn.shopvnb.com/uploads/images/bai_viet/huan-luyen-vien-pickleball-5-1759196340.webp	$2b$10$qiLMA0McaPW/1RP2V7S4TeZhyVml1bKfyRzkFWdNwdCuiOzs2Ywda	t	t	\N	\N	t	2025-11-23 14:30:37.872	2025-11-22 10:48:21.502417	2025-11-26 13:25:34.217679	2025-11-26 13:25:34.217679	2	50	543
2	Nguyễn Văn A	Coach001@gmail.com	+84902234567	$2b$10$U0k.rXKi4SZDg6Olom84qe6kuTQ1xkOnOy5tk1AAJlGW4Lg5RBUEu	https://cdn.shopvnb.com/uploads/images/bai_viet/huan-luyen-vien-pickleball-3-1759197344.webp	$2b$10$f8AVeEeeMf5EWljKfUcEeO4i/DAeBSFJhe9PrrbenTJ7KkuGJlM5m	t	t	\N	\N	t	2025-12-14 06:32:16.112	2025-11-22 10:48:21.502417	2025-12-14 06:32:16.132816	\N	2	50	543
1	Quản trị viên	Admin001@gmail.com	+84901234567	$2b$10$qZTEazHUYmxRuGscdNMgUuMMVvgMK1t5OwyxEnB0KktR8gAiM7Uu2	\N	$2b$10$I42mfrsIn5.dJuE1vlHfGuTTn7vvvnW97qTICP4sfZdiYlGWWxTiC	t	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY1MTE4ODc5LCJleHAiOjE3NjUxMjI0Nzl9.vLyXJjQArsRY12Bt1z7Y4BhDUumtwAIXzDi3HpHo0ls	t	2025-12-14 08:54:03.215	2025-11-22 10:48:21.088763	2025-12-14 08:54:03.231459	\N	1	50	543
22	Đỗ Minh Quang	\N	+84832428222	$2b$10$U0k.rXKi4SZDg6Olom84qe6kuTQ1xkOnOy5tk1AAJlGW4Lg5RBUEu	\N	\N	t	t	\N	\N	t	\N	2025-12-13 22:23:22.040661	2025-12-13 22:23:22.040661	\N	2	50	543
5	Phạm Thị D	learner.d@pickleball.vn	+84905234567	$2b$10$hBp7DeKLiF5hiB4G9xvH/eEIM4Tt4joG7Q.QCUAohH7Kn5rIHBIJe	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkug-K-5r6x-1j7HTFtMOcXN4rERPYXbWLQA&s	\N	t	t	\N	\N	t	\N	2025-11-22 10:48:22.490669	2025-11-22 10:48:22.490669	\N	3	50	543
23	Nguyễn Thị Thu Hoài	\N	+84832428223	$2b$10$U0k.rXKi4SZDg6Olom84qe6kuTQ1xkOnOy5tk1AAJlGW4Lg5RBUEu	\N	\N	t	t	\N	\N	t	\N	2025-12-13 22:23:22.040661	2025-12-13 22:23:22.040661	\N	2	50	543
\.


--
-- TOC entry 4090 (class 0 OID 18570)
-- Dependencies: 246
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.videos (id, title, description, tags, duration, drill_name, drill_description, drill_practice_sets, public_url, thumbnail_url, status, "uploadedById", lesson_id, session_id) FROM stdin;
61	Smash	Video về kỹ thuật smash	\N	3				https://pz-picklaball.b-cdn.net/video/65967/video_6934541_1765149768638.mp4	https://pz-picklaball.b-cdn.net/video_thumbnail/60258/video_6934541_1765149768638-thumbnail.png	READY	2	20	\N
65	Video giới thiệu về Pickleball	Video này cung cấp cái nhìn tổng quan về môn thể thao Pickleball, bao gồm lịch sử, luật chơi và những lợi ích khi tham gia.	{"pickleball","giới thiệu","thể thao"}	3	Tập luyện cơ bản	Các bài tập cơ bản để làm quen với Pickleball	3 set, mỗi set 10 phút	https://pz-picklaball.b-cdn.net/video/193908/video_9452234_1764564239741.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/598410/video_9452234_1764564239741-thumbnail.png	READY	2	\N	41
69	Nghệ Thuật Vị Trí và Di Chuyển Đôi	Video này sẽ hướng dẫn chi tiết về các vị trí lý tưởng trên sân trong đánh đôi, tập trung vào cách di chuyển hài hòa giữa hai người chơi. Bạn sẽ thấy các ví dụ thực tế về cách duy trì áp lực ở vạch Kitchen, cách phục hồi vị trí sau khi đánh, và cách tránh bị đối thủ khai thác khoảng trống. Video cũng nhấn mạnh tầm quan trọng của việc di chuyển theo cặp và giữ khoảng cách hợp lý để tối ưu hóa khả năng phòng thủ và tấn công.	{"Vị trí sân","Di chuyển đôi","Kitchen line","Phòng thủ","Tấn công"}	\N	Drill Di Chuyển Đồng Bộ Đôi	Thực hành di chuyển song song: Hai người chơi đứng ở vạch Kitchen, mô phỏng các cú đánh volley và di chuyển sang ngang, lên xuống đồng bộ để giữ khoảng cách đều. Chú trọng vào việc luôn quay mặt về phía lưới và giữ vợt ở vị trí sẵn sàng. Sau đó, một người lùi về baseline để trả bóng, người kia vẫn ở Kitchen, sau đó người đánh baseline sẽ tiến lên Kitchen ngay lập tức.	5 sets x 2 phút mỗi set	\N	\N	UPLOADING	\N	43	\N
70	Kho Vũ Khí Cú Đánh Đôi Tối Ưu	Video này minh họa các loại cú đánh tấn công và phòng thủ khác nhau trong đánh đôi nâng cao. Bạn sẽ được xem các ví dụ về 'dink' chiến lược để di chuyển đối thủ, 'drive' để tạo khoảng trống, và 'smash' để kết thúc điểm. Video cũng chỉ ra cách sử dụng các cú 'reset' và 'block' để hóa giải áp lực của đối thủ, đồng thời cung cấp mẹo để đọc ý định của đối thủ và chọn cú đánh phản công hiệu quả nhất.	{"Dink","Drive","Smash","Drop shot","Reset","Chiến thuật tấn công","Chiến thuật phòng thủ"}	\N	Drill Tấn Công/Phòng Thủ Cú Đánh Đa Dạng	Thực hành 'dink' mục tiêu và 'drive' khoảng trống: Hai cặp đôi đứng ở vạch Kitchen. Một cặp thực hiện các cú 'dink' đặt bóng vào các góc cụ thể của sân đối thủ. Cặp còn lại phòng thủ và cố gắng 'dink' trả lại hoặc thực hiện cú 'drive' vào khoảng trống khi có cơ hội. Luân phiên vai trò tấn công/phòng thủ.	4 sets x 5 phút mỗi set	\N	\N	UPLOADING	\N	44	\N
71	Sức Mạnh Của Teamwork và Thích Nghi	Video này trình bày các kỹ thuật giao tiếp hiệu quả giữa các đối tác trong đánh đôi, bao gồm cả tín hiệu tay và các từ ngữ ngắn gọn. Nó cũng khám phá cách phân tích lối chơi của đối thủ ngay trong trận đấu, từ đó điều chỉnh chiến thuật để giành lợi thế. Bạn sẽ học cách làm việc nhóm để che phủ sân, đưa ra quyết định nhanh chóng và cùng nhau vượt qua những tình huống khó khăn, biến điểm yếu của đối thủ thành cơ hội của mình.	{"Giao tiếp","Làm việc nhóm","Thích nghi","Phân tích đối thủ","Chiến thuật nâng cao"}	\N	Drill Giao Tiếp và Thích Nghi Chiến Thuật	Thực hành giao tiếp và phân tích: Một cặp đôi chơi đấu với một cặp đôi khác. Sau mỗi 3-5 điểm, cả hai đội tạm dừng để thảo luận về chiến thuật, điểm mạnh/yếu của đối thủ và cách phối hợp tốt hơn. Người hướng dẫn sẽ đưa ra các tình huống khác nhau để các đội phải thích nghi (ví dụ: đối thủ chuyên 'dink', đối thủ chuyên 'smash').	3-4 trận đấu thử nghiệm, mỗi trận 10-15 điểm	\N	\N	UPLOADING	\N	45	\N
7	Kỹ thuật đánh forehand	Hướng dẫn chi tiết về kỹ thuật đánh forehand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","forehand","kỹ thuật"}	2	Tập luyện forehand	Các bài tập để cải thiện kỹ thuật đánh forehand	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/899989/video_8279162_1764564270276.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/295629/video_8279162_1764564270276-thumbnail.png	READY	2	6	\N
6	Video giới thiệu về Pickleball	Video này cung cấp cái nhìn tổng quan về môn thể thao Pickleball, bao gồm lịch sử, luật chơi và những lợi ích khi tham gia.	{"pickleball","giới thiệu","thể thao"}	3	Tập luyện cơ bản	Các bài tập cơ bản để làm quen với Pickleball	3 set, mỗi set 10 phút	https://pz-picklaball.b-cdn.net/video/193908/video_9452234_1764564239741.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/598410/video_9452234_1764564239741-thumbnail.png	READY	2	5	\N
8	Kỹ thuật đánh backhand	Hướng dẫn chi tiết về kỹ thuật đánh backhand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","backhand","kỹ thuật"}	2	Tập luyện backhand	Các bài tập để cải thiện kỹ thuật đánh backhand	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/774427/video_8279162_1764564285444.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/468987/video_8279162_1764564285444-thumbnail.png	READY	2	7	\N
9	Kỹ thuật giao bóng	Hướng dẫn chi tiết về kỹ thuật giao bóng trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","giao bóng","kỹ thuật"}	3	Tập luyện giao bóng	Các bài tập để cải thiện kỹ thuật giao bóng	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/768962/video_6934776_1764564299237.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/435190/video_6934776_1764564299237-thumbnail.png	READY	2	8	\N
66	Smash	Video về kỹ thuật smash	\N	3				https://pz-picklaball.b-cdn.net/video/65967/video_6934541_1765149768638.mp4	https://pz-picklaball.b-cdn.net/video_thumbnail/60258/video_6934541_1765149768638-thumbnail.png	READY	2	\N	59
72	Video giới thiệu về Pickleball	Video này cung cấp cái nhìn tổng quan về môn thể thao Pickleball, bao gồm lịch sử, luật chơi và những lợi ích khi tham gia.	{"pickleball","giới thiệu","thể thao"}	3	Tập luyện cơ bản	Các bài tập cơ bản để làm quen với Pickleball	3 set, mỗi set 10 phút	https://pz-picklaball.b-cdn.net/video/193908/video_9452234_1764564239741.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/598410/video_9452234_1764564239741-thumbnail.png	READY	2	\N	60
73	Kỹ thuật đánh forehand	Hướng dẫn chi tiết về kỹ thuật đánh forehand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","forehand","kỹ thuật"}	2	Tập luyện forehand	Các bài tập để cải thiện kỹ thuật đánh forehand	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/899989/video_8279162_1764564270276.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/295629/video_8279162_1764564270276-thumbnail.png	READY	2	\N	61
74	Kỹ thuật đánh backhand	Hướng dẫn chi tiết về kỹ thuật đánh backhand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","backhand","kỹ thuật"}	2	Tập luyện backhand	Các bài tập để cải thiện kỹ thuật đánh backhand	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/774427/video_8279162_1764564285444.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/468987/video_8279162_1764564285444-thumbnail.png	READY	2	\N	62
75	Kỹ thuật giao bóng	Hướng dẫn chi tiết về kỹ thuật giao bóng trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","giao bóng","kỹ thuật"}	3	Tập luyện giao bóng	Các bài tập để cải thiện kỹ thuật giao bóng	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/768962/video_6934776_1764564299237.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/435190/video_6934776_1764564299237-thumbnail.png	READY	2	\N	63
63	Smash	Video về kỹ thuật smash	\N	3				https://pz-picklaball.b-cdn.net/video/65967/video_6934541_1765149768638.mp4	https://pz-picklaball.b-cdn.net/video_thumbnail/60258/video_6934541_1765149768638-thumbnail.png	READY	2	\N	58
67	Video cho bai học 1	Test	\N	3	Test	Test	Test	https://pz-picklaball.b-cdn.net/video/78775/video_9451843_1765176431849.mp4	https://pz-picklaball.b-cdn.net/video_thumbnail/35156/video_9451843_1765176431849-thumbnail.png	READY	2	21	\N
76	Video giới thiệu về Pickleball	Video này cung cấp cái nhìn tổng quan về môn thể thao Pickleball, bao gồm lịch sử, luật chơi và những lợi ích khi tham gia.	{"pickleball","giới thiệu","thể thao"}	3	Tập luyện cơ bản	Các bài tập cơ bản để làm quen với Pickleball	3 set, mỗi set 10 phút	https://pz-picklaball.b-cdn.net/video/193908/video_9452234_1764564239741.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/598410/video_9452234_1764564239741-thumbnail.png	READY	2	\N	64
77	Kỹ thuật đánh forehand	Hướng dẫn chi tiết về kỹ thuật đánh forehand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","forehand","kỹ thuật"}	2	Tập luyện forehand	Các bài tập để cải thiện kỹ thuật đánh forehand	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/899989/video_8279162_1764564270276.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/295629/video_8279162_1764564270276-thumbnail.png	READY	2	\N	65
78	Kỹ thuật đánh backhand	Hướng dẫn chi tiết về kỹ thuật đánh backhand trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","backhand","kỹ thuật"}	2	Tập luyện backhand	Các bài tập để cải thiện kỹ thuật đánh backhand	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/774427/video_8279162_1764564285444.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/468987/video_8279162_1764564285444-thumbnail.png	READY	2	\N	66
79	Kỹ thuật giao bóng	Hướng dẫn chi tiết về kỹ thuật giao bóng trong Pickleball, bao gồm cách cầm vợt, tư thế và chuyển động cơ thể.	{"pickleball","giao bóng","kỹ thuật"}	3	Tập luyện giao bóng	Các bài tập để cải thiện kỹ thuật giao bóng	4 set, mỗi set 8 phút	https://pz-picklaball.b-cdn.net/video/768962/video_6934776_1764564299237.mov	https://pz-picklaball.b-cdn.net/video_thumbnail/435190/video_6934776_1764564299237-thumbnail.png	READY	2	\N	67
\.


--
-- TOC entry 4122 (class 0 OID 18848)
-- Dependencies: 278
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_transactions (id, amount, description, type, created_at, wallet_id, session_id, withdrawal_request_id) FROM stdin;
5	2000.000	\N	CREDIT	2025-12-01 07:02:17.521963	6	\N	\N
6	2000.000	\N	CREDIT	2025-12-01 07:06:33.4308	6	\N	\N
7	2000.000	\N	CREDIT	2025-12-01 07:08:30.283598	6	\N	\N
8	1800.000	\N	CREDIT	2025-12-01 10:59:58.106309	2	\N	\N
9	450.000	\N	CREDIT	2025-12-06 05:45:52.114673	2	\N	\N
10	2000.000	\N	CREDIT	2025-12-08 00:22:32.326483	4	\N	\N
11	1800.000	\N	CREDIT	2025-12-08 06:37:58.466974	2	\N	\N
12	2000.000	\N	DEBIT	2025-12-11 16:25:27.315481	4	\N	\N
13	2000.000	\N	DEBIT	2025-12-13 13:56:18.644816	2	\N	\N
\.


--
-- TOC entry 4126 (class 0 OID 18865)
-- Dependencies: 282
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallets (id, bank_account_number, current_balance, total_income, created_at, updated_at, "userId", bank_id) FROM stdin;
1	\N	0.000	0.000	2025-11-22 10:48:21.219195	2025-11-22 10:48:21.219195	1	\N
3	\N	0.000	0.000	2025-11-22 10:48:21.939549	2025-11-22 10:48:21.939549	3	\N
5	\N	0.000	0.000	2025-11-22 10:48:22.602019	2025-11-22 10:48:22.602019	5	\N
6	\N	6000.000	6000.000	2025-11-22 12:19:04.449069	2025-12-01 07:08:30.283598	6	\N
2	9832428279	2050.000	4050.000	2025-11-22 10:48:21.610874	2025-12-13 14:04:04.981876	2	1
4	1031081680	0.000	2000.000	2025-11-22 10:48:22.277096	2025-12-14 13:56:39.153613	4	68
\.


--
-- TOC entry 4120 (class 0 OID 18832)
-- Dependencies: 276
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.withdrawal_requests (id, "referenceId", amount, payout_details, admin_comment, requested_at, completed_at, wallet_id) FROM stdin;
\.


--
-- TOC entry 4198 (class 0 OID 0)
-- Dependencies: 289
-- Name: achievement_progresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievement_progresses_id_seq', 32, true);


--
-- TOC entry 4199 (class 0 OID 0)
-- Dependencies: 295
-- Name: achievement_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievement_tracking_id_seq', 26, true);


--
-- TOC entry 4200 (class 0 OID 0)
-- Dependencies: 287
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievements_id_seq', 21, true);


--
-- TOC entry 4201 (class 0 OID 0)
-- Dependencies: 303
-- Name: ai_learner_progress_analyses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_learner_progress_analyses_id_seq', 2, true);


--
-- TOC entry 4202 (class 0 OID 0)
-- Dependencies: 301
-- Name: ai_subject_generations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_subject_generations_id_seq', 1, true);


--
-- TOC entry 4203 (class 0 OID 0)
-- Dependencies: 243
-- Name: ai_video_comparison_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_video_comparison_results_id_seq', 23, true);


--
-- TOC entry 4204 (class 0 OID 0)
-- Dependencies: 269
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendances_id_seq', 5, true);


--
-- TOC entry 4205 (class 0 OID 0)
-- Dependencies: 279
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banks_id_seq', 76, true);


--
-- TOC entry 4206 (class 0 OID 0)
-- Dependencies: 299
-- Name: base_credentials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.base_credentials_id_seq', 8, true);


--
-- TOC entry 4207 (class 0 OID 0)
-- Dependencies: 225
-- Name: coaches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coaches_id_seq', 17, true);


--
-- TOC entry 4208 (class 0 OID 0)
-- Dependencies: 291
-- Name: configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configurations_id_seq', 9, true);


--
-- TOC entry 4209 (class 0 OID 0)
-- Dependencies: 267
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 32, true);


--
-- TOC entry 4210 (class 0 OID 0)
-- Dependencies: 265
-- Name: courts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courts_id_seq', 62, true);


--
-- TOC entry 4211 (class 0 OID 0)
-- Dependencies: 223
-- Name: credentials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credentials_id_seq', 8, true);


--
-- TOC entry 4212 (class 0 OID 0)
-- Dependencies: 261
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.districts_id_seq', 691, true);


--
-- TOC entry 4213 (class 0 OID 0)
-- Dependencies: 235
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 40, true);


--
-- TOC entry 4214 (class 0 OID 0)
-- Dependencies: 217
-- Name: errors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.errors_id_seq', 1, false);


--
-- TOC entry 4215 (class 0 OID 0)
-- Dependencies: 237
-- Name: feedbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feedbacks_id_seq', 5, true);


--
-- TOC entry 4216 (class 0 OID 0)
-- Dependencies: 285
-- Name: learner_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learner_achievements_id_seq', 8, true);


--
-- TOC entry 4217 (class 0 OID 0)
-- Dependencies: 249
-- Name: learner_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learner_answers_id_seq', 24, true);


--
-- TOC entry 4218 (class 0 OID 0)
-- Dependencies: 239
-- Name: learner_progresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learner_progresses_id_seq', 9, true);


--
-- TOC entry 4219 (class 0 OID 0)
-- Dependencies: 241
-- Name: learner_videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learner_videos_id_seq', 13, true);


--
-- TOC entry 4220 (class 0 OID 0)
-- Dependencies: 283
-- Name: learners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learners_id_seq', 3, true);


--
-- TOC entry 4221 (class 0 OID 0)
-- Dependencies: 257
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_id_seq', 46, true);


--
-- TOC entry 4222 (class 0 OID 0)
-- Dependencies: 297
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- TOC entry 4223 (class 0 OID 0)
-- Dependencies: 221
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 150, true);


--
-- TOC entry 4224 (class 0 OID 0)
-- Dependencies: 233
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 40, true);


--
-- TOC entry 4225 (class 0 OID 0)
-- Dependencies: 263
-- Name: provinces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.provinces_id_seq', 63, true);


--
-- TOC entry 4226 (class 0 OID 0)
-- Dependencies: 251
-- Name: question_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_options_id_seq', 935, true);


--
-- TOC entry 4227 (class 0 OID 0)
-- Dependencies: 253
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 243, true);


--
-- TOC entry 4228 (class 0 OID 0)
-- Dependencies: 247
-- Name: quiz_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_attempts_id_seq', 7, true);


--
-- TOC entry 4229 (class 0 OID 0)
-- Dependencies: 255
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 95, true);


--
-- TOC entry 4230 (class 0 OID 0)
-- Dependencies: 227
-- Name: request_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_actions_id_seq', 33, true);


--
-- TOC entry 4231 (class 0 OID 0)
-- Dependencies: 229
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requests_id_seq', 33, true);


--
-- TOC entry 4232 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- TOC entry 4233 (class 0 OID 0)
-- Dependencies: 231
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedules_id_seq', 35, true);


--
-- TOC entry 4234 (class 0 OID 0)
-- Dependencies: 271
-- Name: session_earnings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.session_earnings_id_seq', 4, true);


--
-- TOC entry 4235 (class 0 OID 0)
-- Dependencies: 273
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sessions_id_seq', 67, true);


--
-- TOC entry 4236 (class 0 OID 0)
-- Dependencies: 259
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_id_seq', 20, true);


--
-- TOC entry 4237 (class 0 OID 0)
-- Dependencies: 293
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 23, true);


--
-- TOC entry 4238 (class 0 OID 0)
-- Dependencies: 245
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.videos_id_seq', 79, true);


--
-- TOC entry 4239 (class 0 OID 0)
-- Dependencies: 277
-- Name: wallet_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wallet_transactions_id_seq', 13, true);


--
-- TOC entry 4240 (class 0 OID 0)
-- Dependencies: 281
-- Name: wallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wallets_id_seq', 19, true);


--
-- TOC entry 4241 (class 0 OID 0)
-- Dependencies: 275
-- Name: withdrawal_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.withdrawal_requests_id_seq', 1, false);


--
-- TOC entry 3732 (class 2606 OID 18402)
-- Name: requests PK_0428f484e96f9e6a55955f29b5f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY (id);


--
-- TOC entry 3761 (class 2606 OID 18620)
-- Name: questions PK_08a6d4b0f49ff300bf3a0ca60ac; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY (id);


--
-- TOC entry 3789 (class 2606 OID 18797)
-- Name: session_earnings PK_1361efc1c3be2389de251f0edca; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_earnings
    ADD CONSTRAINT "PK_1361efc1c3be2389de251f0edca" PRIMARY KEY (id);


--
-- TOC entry 3759 (class 2606 OID 18610)
-- Name: question_options PK_13be20e51c0738def32f00cf7d5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT "PK_13be20e51c0738def32f00cf7d5" PRIMARY KEY (id);


--
-- TOC entry 3837 (class 2606 OID 19435)
-- Name: base_credentials PK_1528f9daeb202938173b42704b6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.base_credentials
    ADD CONSTRAINT "PK_1528f9daeb202938173b42704b6" PRIMARY KEY (id);


--
-- TOC entry 3736 (class 2606 OID 18468)
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 18671)
-- Name: subjects PK_1a023685ac2b051b4e557b0b280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY (id);


--
-- TOC entry 3810 (class 2606 OID 18927)
-- Name: achievements PK_1bc19c37c6249f70186f318d71d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY (id);


--
-- TOC entry 3839 (class 2606 OID 20124)
-- Name: ai_subject_generations PK_1c22ce54c18e1d296b0128a943e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_subject_generations
    ADD CONSTRAINT "PK_1c22ce54c18e1d296b0128a943e" PRIMARY KEY (id);


--
-- TOC entry 3725 (class 2606 OID 18333)
-- Name: credentials PK_1e38bc43be6697cdda548ad27a6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT "PK_1e38bc43be6697cdda548ad27a6" PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 18526)
-- Name: learner_progresses PK_216fd40aa70de57727260a9ad38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_progresses
    ADD CONSTRAINT "PK_216fd40aa70de57727260a9ad38" PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 18370)
-- Name: request_actions PK_21ba286e9bb7bac92b0917135be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_actions
    ADD CONSTRAINT "PK_21ba286e9bb7bac92b0917135be" PRIMARY KEY (id);


--
-- TOC entry 3776 (class 2606 OID 18693)
-- Name: provinces PK_2e4260eedbcad036ec53222e0c7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT "PK_2e4260eedbcad036ec53222e0c7" PRIMARY KEY (id);


--
-- TOC entry 3793 (class 2606 OID 18819)
-- Name: sessions PK_3238ef96f18b355b671619111bc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY (id);


--
-- TOC entry 3799 (class 2606 OID 18863)
-- Name: banks PK_3975b5f684ec241e3901db62d77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY (id);


--
-- TOC entry 3805 (class 2606 OID 18901)
-- Name: learners PK_3e7273fda51b35b9c8e4f096d91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learners
    ADD CONSTRAINT "PK_3e7273fda51b35b9c8e4f096d91" PRIMARY KEY (id);


--
-- TOC entry 3785 (class 2606 OID 18761)
-- Name: courses PK_3f70a487cc718ad8eda4e6d58c9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY (id);


--
-- TOC entry 3787 (class 2606 OID 18781)
-- Name: attendances PK_483ed97cd4cd43ab4a117516b69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY (id);


--
-- TOC entry 3797 (class 2606 OID 18856)
-- Name: wallet_transactions PK_5120f131bde2cda940ec1a621db; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 18547)
-- Name: learner_videos PK_52a8044314439f8e2a30c41971a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_videos
    ADD CONSTRAINT "PK_52a8044314439f8e2a30c41971a" PRIMARY KEY (id);


--
-- TOC entry 3833 (class 2606 OID 19000)
-- Name: achievement_tracking PK_6a4b5a5dc99728dd056e2bdbbd3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_tracking
    ADD CONSTRAINT "PK_6a4b5a5dc99728dd056e2bdbbd3" PRIMARY KEY (id);


--
-- TOC entry 3723 (class 2606 OID 18314)
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- TOC entry 3843 (class 2606 OID 20153)
-- Name: ai_learner_progress_analyses PK_6b9a533699195298969124902dc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_learner_progress_analyses
    ADD CONSTRAINT "PK_6b9a533699195298969124902dc" PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 18505)
-- Name: feedbacks PK_79affc530fdd838a9f1e0cc30be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 18494)
-- Name: enrollments PK_7c0f752f9fb68bf6ed7367ab00f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY (id);


--
-- TOC entry 3757 (class 2606 OID 18599)
-- Name: learner_answers PK_7d1aac32b5f70cd42928c34ce07; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_answers
    ADD CONSTRAINT "PK_7d1aac32b5f70cd42928c34ce07" PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 18444)
-- Name: schedules PK_7e33fc2ea755a5765e3564e66dd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY (id);


--
-- TOC entry 3801 (class 2606 OID 18874)
-- Name: wallets PK_8402e5df5a30a229380e83e4f7e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY (id);


--
-- TOC entry 3814 (class 2606 OID 18936)
-- Name: achievement_progresses PK_89689173498872805e03d0906b2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_progresses
    ADD CONSTRAINT "PK_89689173498872805e03d0906b2" PRIMARY KEY (id);


--
-- TOC entry 3835 (class 2606 OID 19356)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3780 (class 2606 OID 18703)
-- Name: courts PK_948a5d356c3083f3237ecbf9897; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT "PK_948a5d356c3083f3237ecbf9897" PRIMARY KEY (id);


--
-- TOC entry 3774 (class 2606 OID 18685)
-- Name: districts PK_972a72ff4e3bea5c7f43a2b98af; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY (id);


--
-- TOC entry 3769 (class 2606 OID 18645)
-- Name: lessons PK_9b9a8d455cac672d262d7275730; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY (id);


--
-- TOC entry 3827 (class 2606 OID 18978)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 3755 (class 2606 OID 18591)
-- Name: quiz_attempts PK_a84a93fb092359516dc5b325b90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT "PK_a84a93fb092359516dc5b325b90" PRIMARY KEY (id);


--
-- TOC entry 3763 (class 2606 OID 18630)
-- Name: quizzes PK_b24f0f7662cf6b3a0e7dba0a1b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "PK_b24f0f7662cf6b3a0e7dba0a1b4" PRIMARY KEY (id);


--
-- TOC entry 3719 (class 2606 OID 18290)
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- TOC entry 3807 (class 2606 OID 18909)
-- Name: learner_achievements PK_d291ec40db72205b3bbf7454771; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_achievements
    ADD CONSTRAINT "PK_d291ec40db72205b3bbf7454771" PRIMARY KEY (id);


--
-- TOC entry 3747 (class 2606 OID 18557)
-- Name: ai_video_comparison_results PK_ddf10ff4d55464810ebd2849048; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_video_comparison_results
    ADD CONSTRAINT "PK_ddf10ff4d55464810ebd2849048" PRIMARY KEY (id);


--
-- TOC entry 3795 (class 2606 OID 18841)
-- Name: withdrawal_requests PK_e1b3734a3f3cbd46bf0ad7eedb6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT "PK_e1b3734a3f3cbd46bf0ad7eedb6" PRIMARY KEY (id);


--
-- TOC entry 3749 (class 2606 OID 18579)
-- Name: videos PK_e4c86c0cf95aff16e9fb8220f6b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY (id);


--
-- TOC entry 3728 (class 2606 OID 18354)
-- Name: coaches PK_eddaece1a1f1b197fa39e6864a1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coaches
    ADD CONSTRAINT "PK_eddaece1a1f1b197fa39e6864a1" PRIMARY KEY (id);


--
-- TOC entry 3817 (class 2606 OID 18960)
-- Name: configurations PK_ef9fc29709cc5fc66610fc6a664; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configurations
    ADD CONSTRAINT "PK_ef9fc29709cc5fc66610fc6a664" PRIMARY KEY (id);


--
-- TOC entry 3717 (class 2606 OID 18283)
-- Name: errors PK_f1ab2df89a11cd21f48ff90febb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errors
    ADD CONSTRAINT "PK_f1ab2df89a11cd21f48ff90febb" PRIMARY KEY (id);


--
-- TOC entry 3751 (class 2606 OID 18583)
-- Name: videos REL_182fec06ccc92340dd1f2b7c48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT "REL_182fec06ccc92340dd1f2b7c48" UNIQUE (session_id);


--
-- TOC entry 3765 (class 2606 OID 18634)
-- Name: quizzes REL_20e0cf0d34e0caedaa8739f632; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "REL_20e0cf0d34e0caedaa8739f632" UNIQUE (session_id);


--
-- TOC entry 3767 (class 2606 OID 18632)
-- Name: quizzes REL_2cf4e4b5b533af8dc6b38d4fa9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "REL_2cf4e4b5b533af8dc6b38d4fa9" UNIQUE (lesson_id);


--
-- TOC entry 3803 (class 2606 OID 18876)
-- Name: wallets REL_2ecdb33f23e9a6fc392025c0b9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId");


--
-- TOC entry 3753 (class 2606 OID 18581)
-- Name: videos REL_d97c673372cd82feba22a5895b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT "REL_d97c673372cd82feba22a5895b" UNIQUE (lesson_id);


--
-- TOC entry 3841 (class 2606 OID 20126)
-- Name: ai_subject_generations REL_e89bdb39804ae889b1c2ef34c7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_subject_generations
    ADD CONSTRAINT "REL_e89bdb39804ae889b1c2ef34c7" UNIQUE (created_subject_id);


--
-- TOC entry 3782 (class 2606 OID 18705)
-- Name: courts UQ_12ded811608969783e5aefa7bc2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT "UQ_12ded811608969783e5aefa7bc2" UNIQUE (phone_number);


--
-- TOC entry 3829 (class 2606 OID 18982)
-- Name: users UQ_17d1817f241f10a3dbafb169fd2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2" UNIQUE (phone_number);


--
-- TOC entry 3819 (class 2606 OID 18962)
-- Name: configurations UQ_3c658898252e3694655de8a07e7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configurations
    ADD CONSTRAINT "UQ_3c658898252e3694655de8a07e7" UNIQUE (key);


--
-- TOC entry 3721 (class 2606 OID 18292)
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- TOC entry 3831 (class 2606 OID 18980)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 3783 (class 1259 OID 18764)
-- Name: IDX_16fcd8ab8bc042688984d5b393; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_16fcd8ab8bc042688984d5b393" ON public.courses USING btree (created_by);


--
-- TOC entry 3820 (class 1259 OID 18984)
-- Name: IDX_17d1817f241f10a3dbafb169fd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_17d1817f241f10a3dbafb169fd" ON public.users USING btree (phone_number);


--
-- TOC entry 3821 (class 1259 OID 18985)
-- Name: IDX_1abbfecef5aefa239aca51ccc5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1abbfecef5aefa239aca51ccc5" ON public.users USING btree (is_email_verified);


--
-- TOC entry 3822 (class 1259 OID 18987)
-- Name: IDX_20c7aea6112bef71528210f631; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_20c7aea6112bef71528210f631" ON public.users USING btree (is_active);


--
-- TOC entry 3790 (class 1259 OID 18820)
-- Name: IDX_3551ca028263550d0a96b2e480; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3551ca028263550d0a96b2e480" ON public.sessions USING btree (schedule_date);


--
-- TOC entry 3815 (class 1259 OID 18963)
-- Name: IDX_3c658898252e3694655de8a07e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_3c658898252e3694655de8a07e" ON public.configurations USING btree (key);


--
-- TOC entry 3777 (class 1259 OID 18707)
-- Name: IDX_5a9e891f75558d9eff3ea25fc7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5a9e891f75558d9eff3ea25fc7" ON public.courts USING btree (district_id);


--
-- TOC entry 3811 (class 1259 OID 18938)
-- Name: IDX_5c049bcfd1bdc064529502cea6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5c049bcfd1bdc064529502cea6" ON public.achievement_progresses USING btree (user_id);


--
-- TOC entry 3808 (class 1259 OID 18928)
-- Name: IDX_6261fe3636483beee9db8fd370; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6261fe3636483beee9db8fd370" ON public.achievements USING btree (type);


--
-- TOC entry 3812 (class 1259 OID 18937)
-- Name: IDX_7bbff2ff7709c4bfe2ec171cb0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7bbff2ff7709c4bfe2ec171cb0" ON public.achievement_progresses USING btree (achievement_id);


--
-- TOC entry 3823 (class 1259 OID 18983)
-- Name: IDX_97672ac88f789774dd47f7c8be; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON public.users USING btree (email);


--
-- TOC entry 3772 (class 1259 OID 18686)
-- Name: IDX_9d451638507b11822dc411a2df; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9d451638507b11822dc411a2df" ON public.districts USING btree (province_id);


--
-- TOC entry 3824 (class 1259 OID 18988)
-- Name: IDX_a2cecd1a3531c0b041e29ba46e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a2cecd1a3531c0b041e29ba46e" ON public.users USING btree (role_id);


--
-- TOC entry 3726 (class 1259 OID 18355)
-- Name: IDX_bd9923ac72efde2d5895e118fa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bd9923ac72efde2d5895e118fa" ON public.coaches USING btree (user_id);


--
-- TOC entry 3825 (class 1259 OID 18986)
-- Name: IDX_bebf1fbe5e53ca226f1eaecf89; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bebf1fbe5e53ca226f1eaecf89" ON public.users USING btree (is_phone_verified);


--
-- TOC entry 3778 (class 1259 OID 18706)
-- Name: IDX_c4cf3edb31229f04612c833e48; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c4cf3edb31229f04612c833e48" ON public.courts USING btree (province_id);


--
-- TOC entry 3745 (class 1259 OID 18558)
-- Name: IDX_ce6caf58efab20a6485b1e465e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ce6caf58efab20a6485b1e465e" ON public.ai_video_comparison_results USING btree (learner_video_id);


--
-- TOC entry 3791 (class 1259 OID 18821)
-- Name: IDX_d57f1751111f794b17f4dd9a64; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d57f1751111f794b17f4dd9a64" ON public.sessions USING btree (status);


--
-- TOC entry 3884 (class 2606 OID 19206)
-- Name: courses FK_05f921ecf5310e1204a95d824a9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_05f921ecf5310e1204a95d824a9" FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- TOC entry 3905 (class 2606 OID 19311)
-- Name: configurations FK_06000e3d345edfed86dde6d4b28; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configurations
    ADD CONSTRAINT "FK_06000e3d345edfed86dde6d4b28" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3893 (class 2606 OID 19251)
-- Name: withdrawal_requests FK_09ba365288c710bc15432553fcd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT "FK_09ba365288c710bc15432553fcd" FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE;


--
-- TOC entry 3879 (class 2606 OID 19176)
-- Name: lessons FK_0a4d6534fe0b7cd9470041389cb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "FK_0a4d6534fe0b7cd9470041389cb" FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- TOC entry 3912 (class 2606 OID 20128)
-- Name: ai_subject_generations FK_10ac614c7b60c7b87ec8bc20d94; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_subject_generations
    ADD CONSTRAINT "FK_10ac614c7b60c7b87ec8bc20d94" FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- TOC entry 3866 (class 2606 OID 19111)
-- Name: videos FK_159f8e5c7959016a0863ec419a3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT "FK_159f8e5c7959016a0863ec419a3" FOREIGN KEY ("uploadedById") REFERENCES public.users(id);


--
-- TOC entry 3885 (class 2606 OID 19201)
-- Name: courses FK_16fcd8ab8bc042688984d5b3934; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_16fcd8ab8bc042688984d5b3934" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3867 (class 2606 OID 19121)
-- Name: videos FK_182fec06ccc92340dd1f2b7c48a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT "FK_182fec06ccc92340dd1f2b7c48a" FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- TOC entry 3853 (class 2606 OID 19046)
-- Name: payments FK_1a390dc6ab65942f1ab577b7b65; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_1a390dc6ab65942f1ab577b7b65" FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 3886 (class 2606 OID 19216)
-- Name: courses FK_20a93d6e031c4139388696927e7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_20a93d6e031c4139388696927e7" FOREIGN KEY (court_id) REFERENCES public.courts(id);


--
-- TOC entry 3876 (class 2606 OID 19171)
-- Name: quizzes FK_20e0cf0d34e0caedaa8739f6322; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "FK_20e0cf0d34e0caedaa8739f6322" FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- TOC entry 3849 (class 2606 OID 19021)
-- Name: request_actions FK_28fe00d6aca3eb711eae98f8cc6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_actions
    ADD CONSTRAINT "FK_28fe00d6aca3eb711eae98f8cc6" FOREIGN KEY (handled_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3890 (class 2606 OID 19246)
-- Name: sessions FK_2af6797a45b0470e28accc8a201; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_2af6797a45b0470e28accc8a201" FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE SET NULL;


--
-- TOC entry 3877 (class 2606 OID 19166)
-- Name: quizzes FK_2cf4e4b5b533af8dc6b38d4fa9b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "FK_2cf4e4b5b533af8dc6b38d4fa9b" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- TOC entry 3851 (class 2606 OID 19031)
-- Name: requests FK_2d487b151e34f5924c3d8adb5da; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT "FK_2d487b151e34f5924c3d8adb5da" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3897 (class 2606 OID 19271)
-- Name: wallets FK_2ecdb33f23e9a6fc392025c0b97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3891 (class 2606 OID 19241)
-- Name: sessions FK_36fcb4c47cd68e624fd5911eda9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_36fcb4c47cd68e624fd5911eda9" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;


--
-- TOC entry 3861 (class 2606 OID 19091)
-- Name: learner_videos FK_37fb5e426810144dcbbbc4ab2b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_videos
    ADD CONSTRAINT "FK_37fb5e426810144dcbbbc4ab2b2" FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- TOC entry 3910 (class 2606 OID 19341)
-- Name: achievement_tracking FK_3b969edab73c3cd88c0dc030689; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_tracking
    ADD CONSTRAINT "FK_3b969edab73c3cd88c0dc030689" FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- TOC entry 3869 (class 2606 OID 19126)
-- Name: quiz_attempts FK_3c151c1db4d493cee059d94aeb8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT "FK_3c151c1db4d493cee059d94aeb8" FOREIGN KEY (attempted_by) REFERENCES public.users(id);


--
-- TOC entry 3862 (class 2606 OID 19096)
-- Name: learner_videos FK_4591a94b323626ab13890a5214b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_videos
    ADD CONSTRAINT "FK_4591a94b323626ab13890a5214b" FOREIGN KEY (video_id) REFERENCES public.videos(id);


--
-- TOC entry 3875 (class 2606 OID 19156)
-- Name: questions FK_46b3c125e02f7242662e4ccb307; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "FK_46b3c125e02f7242662e4ccb307" FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- TOC entry 3859 (class 2606 OID 19076)
-- Name: learner_progresses FK_47edc74266d1ccf71687a8b5d96; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_progresses
    ADD CONSTRAINT "FK_47edc74266d1ccf71687a8b5d96" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3871 (class 2606 OID 19146)
-- Name: learner_answers FK_57238eb2290f2081def653b4ac1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_answers
    ADD CONSTRAINT "FK_57238eb2290f2081def653b4ac1" FOREIGN KEY (question_option_id) REFERENCES public.question_options(id) ON DELETE CASCADE;


--
-- TOC entry 3914 (class 2606 OID 20164)
-- Name: ai_learner_progress_analyses FK_582d55704ca951e2fc71fa002e1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_learner_progress_analyses
    ADD CONSTRAINT "FK_582d55704ca951e2fc71fa002e1" FOREIGN KEY (learner_progress_id) REFERENCES public.learner_progresses(id) ON DELETE CASCADE;


--
-- TOC entry 3907 (class 2606 OID 19326)
-- Name: users FK_58838300035602d7b58c5e60b04; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_58838300035602d7b58c5e60b04" FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 3882 (class 2606 OID 19196)
-- Name: courts FK_5a9e891f75558d9eff3ea25fc71; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT "FK_5a9e891f75558d9eff3ea25fc71" FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 3903 (class 2606 OID 19306)
-- Name: achievement_progresses FK_5c049bcfd1bdc064529502cea6b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_progresses
    ADD CONSTRAINT "FK_5c049bcfd1bdc064529502cea6b" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3894 (class 2606 OID 19261)
-- Name: wallet_transactions FK_5c9c1f45c2ecec8d6cc8b8691e3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_5c9c1f45c2ecec8d6cc8b8691e3" FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3906 (class 2606 OID 19316)
-- Name: configurations FK_5e0eaa5b677fd4a19ce7b213738; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configurations
    ADD CONSTRAINT "FK_5e0eaa5b677fd4a19ce7b213738" FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 3856 (class 2606 OID 19066)
-- Name: feedbacks FK_6d546ce04387d6771f8b8741ae4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT "FK_6d546ce04387d6771f8b8741ae4" FOREIGN KEY (received_by) REFERENCES public.users(id);


--
-- TOC entry 3857 (class 2606 OID 19061)
-- Name: feedbacks FK_7b22ba79bc96412a7315accda1e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT "FK_7b22ba79bc96412a7315accda1e" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3904 (class 2606 OID 19301)
-- Name: achievement_progresses FK_7bbff2ff7709c4bfe2ec171cb08; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_progresses
    ADD CONSTRAINT "FK_7bbff2ff7709c4bfe2ec171cb08" FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- TOC entry 3850 (class 2606 OID 19026)
-- Name: request_actions FK_8c6c5b31c8d9f2571c99dd4550b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_actions
    ADD CONSTRAINT "FK_8c6c5b31c8d9f2571c99dd4550b" FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;


--
-- TOC entry 3846 (class 2606 OID 19011)
-- Name: credentials FK_8cbbe3785bbd0c6af75acac1bfe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT "FK_8cbbe3785bbd0c6af75acac1bfe" FOREIGN KEY (coach_id) REFERENCES public.coaches(id) ON DELETE CASCADE;


--
-- TOC entry 3864 (class 2606 OID 19106)
-- Name: ai_video_comparison_results FK_8f9dd918b2f5f9b0f701e9f3a58; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_video_comparison_results
    ADD CONSTRAINT "FK_8f9dd918b2f5f9b0f701e9f3a58" FOREIGN KEY (video_id) REFERENCES public.videos(id);


--
-- TOC entry 3845 (class 2606 OID 19006)
-- Name: notifications FK_9a8a82462cab47c73d25f49261f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3881 (class 2606 OID 19186)
-- Name: districts FK_9d451638507b11822dc411a2dfe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "FK_9d451638507b11822dc411a2dfe" FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 3844 (class 2606 OID 19001)
-- Name: errors FK_9ebca22261064ed68a1c894017e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errors
    ADD CONSTRAINT "FK_9ebca22261064ed68a1c894017e" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3908 (class 2606 OID 19321)
-- Name: users FK_a2cecd1a3531c0b041e29ba46e1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 3900 (class 2606 OID 19286)
-- Name: learner_achievements FK_a77d3e9606c8288f6bc5a148132; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_achievements
    ADD CONSTRAINT "FK_a77d3e9606c8288f6bc5a148132" FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- TOC entry 3872 (class 2606 OID 19141)
-- Name: learner_answers FK_a88a71b4134638af1e0b211db36; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_answers
    ADD CONSTRAINT "FK_a88a71b4134638af1e0b211db36" FOREIGN KEY (quiz_attempt_id) REFERENCES public.quiz_attempts(id) ON DELETE CASCADE;


--
-- TOC entry 3887 (class 2606 OID 19221)
-- Name: attendances FK_aa902e05aeb5fde7c1dd4ced2b7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_aa902e05aeb5fde7c1dd4ced2b7" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3852 (class 2606 OID 19041)
-- Name: schedules FK_b1e10ac4dc72412af1c3f4d736d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "FK_b1e10ac4dc72412af1c3f4d736d" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 3860 (class 2606 OID 19081)
-- Name: learner_progresses FK_b21b5f43200685ef0309fc36a5e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_progresses
    ADD CONSTRAINT "FK_b21b5f43200685ef0309fc36a5e" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 3858 (class 2606 OID 19071)
-- Name: feedbacks FK_b46afcad144f370d8a4c55ea498; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT "FK_b46afcad144f370d8a4c55ea498" FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- TOC entry 3854 (class 2606 OID 19051)
-- Name: enrollments FK_b79d0bf01779fdf9cfb6b092af3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 3892 (class 2606 OID 19236)
-- Name: sessions FK_b8cfc5397ec5c262e83f2bf5fbe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_b8cfc5397ec5c262e83f2bf5fbe" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 3873 (class 2606 OID 19136)
-- Name: learner_answers FK_b93f29c3adfa47910e5cbc741b6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_answers
    ADD CONSTRAINT "FK_b93f29c3adfa47910e5cbc741b6" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- TOC entry 3848 (class 2606 OID 19016)
-- Name: coaches FK_bd9923ac72efde2d5895e118fa8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coaches
    ADD CONSTRAINT "FK_bd9923ac72efde2d5895e118fa8" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3898 (class 2606 OID 19276)
-- Name: wallets FK_c01e18c6a4c6407cfdb1a14a09c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "FK_c01e18c6a4c6407cfdb1a14a09c" FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- TOC entry 3899 (class 2606 OID 19281)
-- Name: learners FK_c0b73ed1f75467ac6b3d5a208b0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learners
    ADD CONSTRAINT "FK_c0b73ed1f75467ac6b3d5a208b0" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3883 (class 2606 OID 19191)
-- Name: courts FK_c4cf3edb31229f04612c833e483; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT "FK_c4cf3edb31229f04612c833e483" FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 3895 (class 2606 OID 19256)
-- Name: wallet_transactions FK_c57d19129968160f4db28fc8b28; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_c57d19129968160f4db28fc8b28" FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE;


--
-- TOC entry 3888 (class 2606 OID 19226)
-- Name: attendances FK_ccb4752e27a2927234e1f3dc960; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_ccb4752e27a2927234e1f3dc960" FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3865 (class 2606 OID 19101)
-- Name: ai_video_comparison_results FK_ce6caf58efab20a6485b1e465e2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_video_comparison_results
    ADD CONSTRAINT "FK_ce6caf58efab20a6485b1e465e2" FOREIGN KEY (learner_video_id) REFERENCES public.learner_videos(id);


--
-- TOC entry 3863 (class 2606 OID 19086)
-- Name: learner_videos FK_cf04457186a977ccc49446bec52; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_videos
    ADD CONSTRAINT "FK_cf04457186a977ccc49446bec52" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3889 (class 2606 OID 19231)
-- Name: session_earnings FK_d0660e6799fc1ee26ffd3c3c381; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_earnings
    ADD CONSTRAINT "FK_d0660e6799fc1ee26ffd3c3c381" FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3870 (class 2606 OID 19131)
-- Name: quiz_attempts FK_d244675816bf64833d8ecd67830; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT "FK_d244675816bf64833d8ecd67830" FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- TOC entry 3868 (class 2606 OID 19116)
-- Name: videos FK_d97c673372cd82feba22a5895ba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT "FK_d97c673372cd82feba22a5895ba" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- TOC entry 3880 (class 2606 OID 19181)
-- Name: subjects FK_dde0f93208e57c8603673bfdf46; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT "FK_dde0f93208e57c8603673bfdf46" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3901 (class 2606 OID 19291)
-- Name: learner_achievements FK_df9cac0ea1f4f223ad48efdb119; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_achievements
    ADD CONSTRAINT "FK_df9cac0ea1f4f223ad48efdb119" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3878 (class 2606 OID 19161)
-- Name: quizzes FK_e3eb6001c54316dd29d4ba32de4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "FK_e3eb6001c54316dd29d4ba32de4" FOREIGN KEY ("createdById") REFERENCES public.users(id);


--
-- TOC entry 3847 (class 2606 OID 19454)
-- Name: credentials FK_e593742660d085b1c7e8434c808; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT "FK_e593742660d085b1c7e8434c808" FOREIGN KEY (base_credential_id) REFERENCES public.base_credentials(id) ON DELETE SET NULL;


--
-- TOC entry 3913 (class 2606 OID 20133)
-- Name: ai_subject_generations FK_e89bdb39804ae889b1c2ef34c7b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_subject_generations
    ADD CONSTRAINT "FK_e89bdb39804ae889b1c2ef34c7b" FOREIGN KEY (created_subject_id) REFERENCES public.subjects(id);


--
-- TOC entry 3909 (class 2606 OID 19331)
-- Name: users FK_efc03fc2a5902ef17fb8a2bdcc2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_efc03fc2a5902ef17fb8a2bdcc2" FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 3902 (class 2606 OID 19296)
-- Name: achievements FK_f013825ee12ed3dbe4503bd8b68; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT "FK_f013825ee12ed3dbe4503bd8b68" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3874 (class 2606 OID 19151)
-- Name: question_options FK_f0b7aaabd3f88e700daf0fe681c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT "FK_f0b7aaabd3f88e700daf0fe681c" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- TOC entry 3911 (class 2606 OID 19336)
-- Name: achievement_tracking FK_f24eb621ff0f8c3126adea9b244; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_tracking
    ADD CONSTRAINT "FK_f24eb621ff0f8c3126adea9b244" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3896 (class 2606 OID 19266)
-- Name: wallet_transactions FK_fcca97f70af59b1dcd047024c3c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "FK_fcca97f70af59b1dcd047024c3c" FOREIGN KEY (withdrawal_request_id) REFERENCES public.withdrawal_requests(id) ON DELETE CASCADE;


--
-- TOC entry 3915 (class 2606 OID 20154)
-- Name: ai_learner_progress_analyses FK_fefcbf4ff637e3de8b3d8c73d0b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_learner_progress_analyses
    ADD CONSTRAINT "FK_fefcbf4ff637e3de8b3d8c73d0b" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3855 (class 2606 OID 19056)
-- Name: enrollments FK_ff997f5a39cd24a491b9aca45c9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-12-15 08:27:53

--
-- PostgreSQL database dump complete
--

\unrestrict aUqK7jt6qGrQfKLPi8MrLcJS0zrYVDH6NFdbUMETRAMkrdIPoJY7xt1C6JbyG5k

