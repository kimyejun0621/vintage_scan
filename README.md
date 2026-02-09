# Vintage Scan

Next.js 프로젝트 템플릿 with Supabase, Tailwind CSS, shadcn/ui

## 빠른 시작 (3단계)

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

그리고 `.env.local` 파일에 Supabase 프로젝트 정보 입력:

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → Settings → API
3. Project URL과 anon public key 복사
4. `.env.local`에 값 입력

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 기술 스택

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **TypeScript**: 5.x

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
├── components/
│   └── ui/             # shadcn/ui 컴포넌트
├── features/           # 기능별 모듈
│   └── landing/        # 랜딩 페이지
├── lib/
│   ├── hooks/          # 커스텀 훅
│   └── supabase/       # Supabase 클라이언트
└── styles/             # 글로벌 스타일
```

## 주요 명령어

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

## 템플릿으로 새 프로젝트 시작하기

이 저장소를 템플릿으로 사용해 새 프로젝트를 만들었다면:

1. 저장소 클론
2. `npm install` - 모든 패키지 자동 설치 ✅
3. `.env.example`을 `.env.local`로 복사 후 Supabase 키 입력
4. `npm run dev` - 끝!

> 💡 **Tip**: `package.json`에 모든 의존성이 명시되어 있어 `npm install` 한 번이면 모든 패키지가 자동으로 설치됩니다.

## Supabase 설정

### 새 프로젝트 생성
1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
4. 프로젝트 생성 완료 (1-2분 소요)

### 환경 변수 가져오기
- Settings → API에서 Project URL과 anon key 복사

## eBay API 설정 (선택사항)

실시간 시장 가격 데이터를 원한다면:

1. **eBay API 키 발급**
   - https://developer.ebay.com/my/keys
   - Production Key의 App ID 복사

2. **환경 변수 추가**
   ```bash
   echo "EBAY_APP_ID=your-app-id" >> .env.local
   ```

3. **자세한 가이드**
   - [EBAY_API_GUIDE.md](./EBAY_API_GUIDE.md) 참고

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

Vercel에 배포할 때 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (서버 전용)
- `GEMINI_API_KEY` - Google Gemini AI API 키
- `NEXT_PUBLIC_SITE_URL` - 배포된 사이트 URL (예: https://your-app.vercel.app)

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.
