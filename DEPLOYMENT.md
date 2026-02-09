# Vercel 배포 가이드

이 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 사전 준비

### 1. Supabase 설정
1. [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 생성
2. Settings > API에서 다음 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 절대 공개하지 마세요)

### 2. Google Gemini API 키
1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 생성
2. 생성된 키를 `GEMINI_API_KEY`에 사용

## Vercel 배포 단계

### 방법 1: GitHub 연동 (권장)

1. **GitHub에 코드 푸시**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Vercel에서 프로젝트 import**
   - [Vercel Dashboard](https://vercel.com/new)에서 "Add New" > "Project"
   - GitHub repository 선택
   - Framework Preset: **Next.js** (자동 감지됨)
   - Root Directory: `./` (기본값)

3. **환경 변수 설정**
   - "Environment Variables" 섹션에서 다음 변수들을 추가:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```

4. **Deploy 클릭**

### 방법 2: Vercel CLI

1. **Vercel CLI 설치**
   ```bash
   npm install -g vercel
   ```

2. **로그인**
   ```bash
   vercel login
   ```

3. **배포**
   ```bash
   vercel
   ```

4. **환경 변수 추가**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add GEMINI_API_KEY
   vercel env add NEXT_PUBLIC_SITE_URL
   ```

5. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

## 배포 후 확인사항

### 1. 환경 변수 확인
- Vercel Dashboard > Project > Settings > Environment Variables
- 모든 필수 환경 변수가 설정되어 있는지 확인

### 2. Supabase 설정 확인
- Supabase Dashboard > Authentication > URL Configuration
- Site URL에 Vercel 도메인 추가: `https://your-app.vercel.app`
- Redirect URLs에도 추가: `https://your-app.vercel.app/**`

### 3. 도메인 업데이트
배포 완료 후, `NEXT_PUBLIC_SITE_URL` 환경 변수를 실제 Vercel URL로 업데이트:
```bash
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# 값 입력: https://your-actual-app.vercel.app
```

### 4. 기능 테스트
- [ ] 로그인/회원가입
- [ ] 이미지 업로드 및 분석
- [ ] 가격 정보 표시
- [ ] 결제 기능

## 트러블슈팅

### 빌드 실패
- `npm run build`를 로컬에서 실행하여 빌드 오류 확인
- TypeScript 오류나 lint 오류 해결

### API 호출 실패
- 환경 변수가 올바르게 설정되었는지 확인
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에서 접근 가능
- 없는 변수는 서버 사이드에서만 접근 가능

### Supabase 연결 오류
- Supabase URL과 키가 정확한지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### Gemini API 오류
- API 키가 유효한지 확인
- Google AI Studio에서 API 사용량 한도 확인

## 자동 배포 설정

GitHub에 푸시할 때마다 자동으로 배포되도록 설정:

1. Vercel Dashboard > Project > Settings > Git
2. "Automatically deploy all branches" 활성화 (선택사항)
3. Production Branch를 `main`으로 설정

이제 `main` 브랜치에 푸시하면 자동으로 프로덕션 배포가 시작됩니다.

## 커스텀 도메인 연결 (선택사항)

1. Vercel Dashboard > Project > Settings > Domains
2. "Add Domain" 클릭
3. 도메인 입력 및 DNS 설정 완료
4. `NEXT_PUBLIC_SITE_URL`을 커스텀 도메인으로 업데이트

## 참고 링크

- [Vercel Next.js 배포 가이드](https://vercel.com/docs/frameworks/nextjs)
- [Supabase 문서](https://supabase.com/docs)
- [Google Gemini API 문서](https://ai.google.dev/docs)
