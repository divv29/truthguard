--
-- PostgreSQL database dump
--

\restrict nMaMWtPqrfoE2YUtoIAC6DzcsBCR4lJC3PANbvNeY9O71cPlsXqb4uIRgnDYiUm

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

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
-- Name: articles; Type: TABLE; Schema: public; Owner: divv
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    text text NOT NULL,
    source text,
    verdict character varying(10),
    confidence integer,
    result jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT articles_confidence_check CHECK (((confidence >= 0) AND (confidence <= 100))),
    CONSTRAINT articles_verdict_check CHECK (((verdict)::text = ANY ((ARRAY['REAL'::character varying, 'FAKE'::character varying, 'UNCERTAIN'::character varying])::text[])))
);


ALTER TABLE public.articles OWNER TO divv;

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: divv
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO divv;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divv
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: divv
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    password_hash text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying, 'moderator'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO divv;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: divv
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO divv;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divv
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: divv
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: divv
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: divv
--

COPY public.articles (id, text, source, verdict, confidence, result, created_at) FROM stdin;
1	The Reserve Bank of India raised its benchmark interest rate by 25 basis points to 6.75% on Wednesday, according to an official statement from Governor Shaktikanta Das. The Monetary Policy Committee voted 4-2 in favor of the hike, citing persistent inflation concerns. Consumer price inflation rose 5.1% year-on-year in October, above the RBI 4% target. Economists at Goldman Sachs and Morgan Stanley had predicted this outcome.	\N	REAL	90	{"id": "mo5nrl2a5a7wd2ub0f", "text": "The Reserve Bank of India raised its benchmark interest rate by 25 basis points to 6.75% on Wednesday, according to an official statement from Governor Shaktikanta Das. The Monetary Policy Committee voted 4-2 in favor of the hike, citing persistent inflation concerns. Consumer price inflation rose 5.1% year-on-year in October, above the RBI 4% target. Economists at Goldman Sachs and Morgan Stanley had predicted this outcome.", "source": "", "userId": "divyanshtiwari75@gmail.com", "verdict": "REAL", "language": "en", "red_flags": [], "timestamp": 1776596635234, "confidence": 90, "risk_level": "LOW", "explanation": "This news appears to be authentic due to the presence of specific details, such as the interest rate hike, voting results, and inflation data, which are consistent with official announcements from central banks. The mention of reputable sources like Goldman Sachs and Morgan Stanley adds credibility. The language used is formal and objective, indicating a genuine news report.", "recommendation": "Verify the information through official RBI channels or reputable news sources to confirm the accuracy of the report.", "credibility_score": 80, "fact_check_queries": ["RBI interest rate hike", "Monetary Policy Committee decision", "India inflation rate"], "linguistic_analysis": {"factual_density": 80, "writing_quality": 80, "source_citations": 10, "emotional_language": 10}, "positive_indicators": ["official statement", "specific data", "reputable sources"], "suspicious_keywords": []}	2026-04-19 16:33:55.271955
2	SHOCKING: Government secretly adds mind-control chemicals to tap water, anonymous insider reveals. Multiple unnamed sources confirm that the deep state has been fluoridating water supplies since 1950 to control population behavior. Experts say this is 1000% true and mainstream media is covering it up. Share this before it gets deleted!!!	\N	FAKE	95	{"id": "mo5nrmvp09qqypeaxcka", "text": "SHOCKING: Government secretly adds mind-control chemicals to tap water, anonymous insider reveals. Multiple unnamed sources confirm that the deep state has been fluoridating water supplies since 1950 to control population behavior. Experts say this is 1000% true and mainstream media is covering it up. Share this before it gets deleted!!!", "source": "", "userId": "divyanshtiwari75@gmail.com", "verdict": "FAKE", "language": "en", "red_flags": ["anonymous sources", "sensational language", "lack of credible evidence"], "timestamp": 1776596637589, "confidence": 95, "risk_level": "EXTREMELY HIGH", "explanation": "This news article lacks credible sources, relies on anonymous insiders, and makes unsubstantiated claims about mind-control chemicals in tap water. The use of sensational language and the call to 'share before it gets deleted' are typical tactics used to spread misinformation. The claim that experts say this is '1000% true' is also a clear indicator of fabrication.", "recommendation": "Do not share this article and instead fact-check the claims through reputable sources.", "credibility_score": 0, "fact_check_queries": ["fluoridation of water supplies", "mind control chemicals in tap water", "government water treatment practices"], "linguistic_analysis": {"factual_density": 5, "writing_quality": 10, "source_citations": 0, "emotional_language": 95}, "positive_indicators": [], "suspicious_keywords": ["mind-control", "deep state", "cover-up"]}	2026-04-19 16:33:57.593909
3	The Reserve Bank of India raised its benchmark interest rate by 25 basis points to 6.75% on Wednesday, according to an official statement from Governor Shaktikanta Das. The Monetary Policy Committee voted 4-2 in favor of the hike, citing persistent inflation concerns. Consumer price inflation rose 5.1% year-on-year in October, above the RBI 4% target. Economists at Goldman Sachs and Morgan Stanley had predicted this outcome.	\N	REAL	90	{"id": "mo8zfyhnw8vkmttf9x", "text": "The Reserve Bank of India raised its benchmark interest rate by 25 basis points to 6.75% on Wednesday, according to an official statement from Governor Shaktikanta Das. The Monetary Policy Committee voted 4-2 in favor of the hike, citing persistent inflation concerns. Consumer price inflation rose 5.1% year-on-year in October, above the RBI 4% target. Economists at Goldman Sachs and Morgan Stanley had predicted this outcome.", "source": "", "userId": "divya@gmail.com", "verdict": "REAL", "language": "en", "red_flags": [], "timestamp": 1776797646683, "confidence": 90, "risk_level": "LOW", "explanation": "The news article appears to be real as it cites specific data and quotes from reputable sources, including the Reserve Bank of India and well-known financial institutions like Goldman Sachs and Morgan Stanley. The language used is formal and objective, indicating a genuine news report. The information provided is also consistent with typical central bank announcements and economic data releases.", "recommendation": "Readers can verify the information by checking the official Reserve Bank of India website or reputable financial news sources.", "credibility_score": 80, "fact_check_queries": ["Reserve Bank of India interest rate hike", "India consumer price inflation October"], "linguistic_analysis": {"factual_density": 80, "writing_quality": 80, "source_citations": 8, "emotional_language": 10}, "positive_indicators": ["official statement", "specific data", "reputable sources"], "suspicious_keywords": []}	2026-04-22 00:24:06.709802
4	SHOCKING: Government secretly adds mind-control chemicals to tap water, anonymous insider reveals. Multiple unnamed sources confirm that the deep state has been fluoridating water supplies since 1950 to control population behavior. Experts say this is 1000% true and mainstream media is covering it up. Share this before it gets deleted!!!	\N	FAKE	95	{"id": "mo8zgkibuuc08a19dwd", "text": "SHOCKING: Government secretly adds mind-control chemicals to tap water, anonymous insider reveals. Multiple unnamed sources confirm that the deep state has been fluoridating water supplies since 1950 to control population behavior. Experts say this is 1000% true and mainstream media is covering it up. Share this before it gets deleted!!!", "source": "", "userId": "divyanshtiwari75@gmail.com", "verdict": "FAKE", "language": "en", "red_flags": ["anonymous sources", "sensational language", "lack of credible evidence"], "timestamp": 1776797675219, "confidence": 95, "risk_level": "EXTREMELY HIGH", "explanation": "This news article lacks credible sources, relies on anonymous insiders, and makes unsubstantiated claims about mind-control chemicals in tap water. The use of sensational language and the call to 'share before it gets deleted' are common tactics used to spread misinformation. The claim that experts say this is '1000% true' is also a clear indicator of fabrication.", "recommendation": "Do not share this article and instead fact-check the claims through reputable sources.", "credibility_score": 0, "fact_check_queries": ["water fluoridation effects", "mind control chemicals in water supplies", "government water treatment practices"], "linguistic_analysis": {"factual_density": 5, "writing_quality": 10, "source_citations": 0, "emotional_language": 95}, "positive_indicators": [], "suspicious_keywords": ["mind-control", "deep state", "cover-up"]}	2026-04-22 00:24:35.233195
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: divv
--

COPY public.users (id, name, email, role, password_hash, is_active, created_at, updated_at) FROM stdin;
4	Sneha Patil	sneha@truthguard.dev	user	$2b$10$examplehashUSER44444444444444444444444444444444444444444	t	2026-04-22 00:04:04.591534	2026-04-22 00:04:04.591534
6	New User	newuser@test.com	user	dummy_hash	t	2026-04-22 00:30:16.10287	2026-04-22 00:30:16.10287
7	TestUser	testuser@test.com	user	1234	t	2026-04-22 00:45:13.964214	2026-04-22 00:45:13.964214
8	divya	divyaa@hotmail.com	user	qazwsxedc	t	2026-04-22 00:57:32.526543	2026-04-22 00:57:32.526543
9	divv	divv@gmail.com	user	plmoknijb	t	2026-04-22 00:58:34.213109	2026-04-22 00:58:34.213109
10	jasmine john	jasmine.john@gmail.com	user	qwertyuiop	t	2026-04-22 01:01:04.070064	2026-04-22 01:01:04.070064
1	Amruta Nair	amrutanair29@gmail.com	admin	$2b$10$examplehashADMIN111111111111111111111111111111111111111	t	2026-04-22 00:04:04.591534	2026-04-22 00:04:04.591534
2	Shivram S	shivram.s@gmail.com	admin	$2b$10$examplehashMOD2222222222222222222222222222222222222222222	t	2026-04-22 00:04:04.591534	2026-04-22 00:04:04.591534
3	Abhishek T	abhishek.t@gmail.com	admin	$2b$10$examplehashUSER33333333333333333333333333333333333333333	t	2026-04-22 00:04:04.591534	2026-04-22 00:04:04.591534
\.


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divv
--

SELECT pg_catalog.setval('public.articles_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divv
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: divv
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: divv
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: divv
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_articles_created_at; Type: INDEX; Schema: public; Owner: divv
--

CREATE INDEX idx_articles_created_at ON public.articles USING btree (created_at DESC);


--
-- Name: idx_articles_verdict; Type: INDEX; Schema: public; Owner: divv
--

CREATE INDEX idx_articles_verdict ON public.articles USING btree (verdict);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: divv
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: divv
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- PostgreSQL database dump complete
--

\unrestrict nMaMWtPqrfoE2YUtoIAC6DzcsBCR4lJC3PANbvNeY9O71cPlsXqb4uIRgnDYiUm

