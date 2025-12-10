-- Instruments 테이블 생성
-- Supabase 공식 문서의 Next.js 퀵스타트 예제를 기반으로 작성
-- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.instruments OWNER TO postgres;

-- 샘플 데이터 삽입 (테이블이 비어있는 경우에만)
INSERT INTO public.instruments (name)
SELECT 'violin'
WHERE NOT EXISTS (SELECT 1 FROM public.instruments WHERE name = 'violin');

INSERT INTO public.instruments (name)
SELECT 'viola'
WHERE NOT EXISTS (SELECT 1 FROM public.instruments WHERE name = 'viola');

INSERT INTO public.instruments (name)
SELECT 'cello'
WHERE NOT EXISTS (SELECT 1 FROM public.instruments WHERE name = 'cello');

-- Row Level Security (RLS) 활성화
-- 개발 환경에서는 비활성화할 수 있지만, 프로덕션에서는 활성화 권장
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (anon 사용자도 읽을 수 있음)
-- Clerk를 사용하는 경우, authenticated 사용자만 접근하도록 정책을 수정할 수 있습니다
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);

-- 인증된 사용자도 읽을 수 있도록 정책 추가
CREATE POLICY "authenticated can read instruments"
ON public.instruments
FOR SELECT
TO authenticated
USING (true);

-- 권한 부여
GRANT ALL ON TABLE public.instruments TO anon;
GRANT ALL ON TABLE public.instruments TO authenticated;
GRANT ALL ON TABLE public.instruments TO service_role;


