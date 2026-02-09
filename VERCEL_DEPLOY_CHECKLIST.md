# ✅ Vercel 배포 체크리스트

## 🎯 현재 상태

- ✅ GitHub에 푸시 완료
- ⏳ Vercel 자동 배포 대기 중
- ⚠️ 환경 변수 설정 필요

## 📋 배포 단계

### 1단계: Vercel 대시보드 확인

1. **Vercel 대시보드 접속**
   ```
   https://vercel.com/dashboard
   ```

2. **프로젝트 찾기**
   - `vintage_scan` 또는 연결된 프로젝트 이름

3. **배포 상태 확인**
   - "Building..." → "Ready" 확인
   - 자동 배포가 시작되어야 함

### 2단계: 환경 변수 설정

**경로:** Project → Settings → Environment Variables

#### 필수 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://onfgcewubmfygjnsnrfz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Site URL (배포 후 업데이트)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# eBay API (24시간 후 활성화)
EBAY_APP_ID=-vintage-PRD-62fcafe30-8cc3a843

# Exchange Rate (선택사항)
EXCHANGE_RATE_API_KEY=8d9a168e0784d662864dbcc3
```

#### 설정 방법

1. "Add New" 클릭
2. Name: 변수 이름
3. Value: 변수 값
4. Environment: Production, Preview, Development 모두 체크
5. "Save" 클릭

**각 변수마다 반복!**

### 3단계: 재배포 (환경 변수 설정 후)

환경 변수를 추가한 후:

1. **Deployments 탭**으로 이동
2. 최근 배포 찾기
3. 오른쪽 ⋮ 메뉴 클릭
4. **"Redeploy"** 선택
5. 확인

### 4단계: 배포 URL 확인

배포 완료 후:

1. **Deployments** 탭에서 "Ready" 상태 확인
2. **Visit** 버튼 클릭
3. 배포된 URL 확인 (예: `https://vintage-scan.vercel.app`)

### 5단계: NEXT_PUBLIC_SITE_URL 업데이트

배포 URL을 받은 후:

1. **Settings → Environment Variables**
2. `NEXT_PUBLIC_SITE_URL` 찾기
3. **Edit** 클릭
4. 값을 실제 배포 URL로 변경
   ```
   https://your-actual-app.vercel.app
   ```
5. **Save** 후 **Redeploy**

### 6단계: Supabase 설정 업데이트

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard
   ```

2. **Authentication → URL Configuration**
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`

3. **Save** 클릭

## 🧪 배포 후 테스트

### 1. 기본 기능 테스트

```
✅ 랜딩 페이지 로드
✅ 로그인/회원가입
✅ 이미지 업로드
✅ AI 분석 실행
✅ 결과 페이지 표시
```

### 2. AI 기능 테스트

1. 빈티지 이미지 업로드
2. 분석 결과 확인:
   - ✅ 제품 이름
   - ✅ 연대 (era)
   - ✅ AI 추정 가격
   - ⏰ eBay 시세 (24시간 후 활성화)

### 3. 가격 기능 확인

**현재 (eBay 비활성화):**
```
AI 추정가: ₩466,000 ✅
통합 예상 시세: ₩466,000 ✅
```

**24시간 후 (eBay 활성화):**
```
AI 추정가: ₩466,000 ✅
eBay 시세: ₩420,000 ✅
통합 예상 시세: ₩440,000 ✅
```

## ⚠️ 주의사항

### eBay API 활성화 (24시간 후)

**현재 상태:**
- eBay API가 rate limit으로 차단됨
- `src/config/pricing.ts`에서 `enabled: false`

**24시간 후:**

1. **코드 수정**
   ```typescript
   // src/config/pricing.ts
   ebay: {
     enabled: true,  // false → true
   }
   ```

2. **커밋 & 푸시**
   ```bash
   git add src/config/pricing.ts
   git commit -m "Enable eBay API after rate limit reset"
   git push origin main
   ```

3. **Vercel 자동 재배포** 확인

4. **테스트** (1번만!)
   - 이미지 업로드
   - eBay 시세 표시 확인

## 🔒 보안 체크

### 민감한 정보 확인

```bash
# .env.local은 절대 커밋되지 않음
git ls-files | grep ".env.local"
# (아무것도 출력되지 않아야 함)

# .gitignore 확인
cat .gitignore | grep "env.local"
# (포함되어 있어야 함)
```

### 환경 변수 확인

Vercel에서:
- ✅ `SUPABASE_SERVICE_ROLE_KEY`는 Production만 체크
- ✅ 다른 변수들은 모든 환경에 체크
- ✅ API 키들이 올바르게 입력됨

## 🐛 문제 해결

### 배포 실패 시

1. **Vercel 로그 확인**
   - Deployments → 실패한 배포 → Build Logs

2. **흔한 오류:**
   - ❌ 환경 변수 누락 → Settings에서 추가
   - ❌ 빌드 오류 → 로컬에서 `npm run build` 확인
   - ❌ TypeScript 오류 → 로컬에서 수정 후 푸시

### API 오류 시

1. **브라우저 콘솔 확인** (F12)
2. **Network 탭**에서 실패한 요청 확인
3. **Vercel 함수 로그** 확인

### 환경 변수 문제

```bash
# Vercel CLI로 확인
vercel env ls

# 환경 변수 추가
vercel env add VARIABLE_NAME
```

## 📊 성능 모니터링

### Vercel Analytics

1. **Project → Analytics** 탭
2. 방문자 수, 로딩 시간 확인

### Supabase 사용량

1. **Supabase Dashboard**
2. Project → Database → Usage
3. API 호출 수 확인

## 🎉 배포 완료 체크리스트

배포가 완료되면:

- [ ] 배포 URL 작동 확인
- [ ] 모든 환경 변수 설정됨
- [ ] Supabase URL 업데이트됨
- [ ] 로그인/회원가입 테스트
- [ ] 이미지 분석 테스트
- [ ] AI 가격 추정 작동
- [ ] (24시간 후) eBay API 활성화
- [ ] 프로덕션 모니터링 설정

## 🚀 다음 단계

### 커스텀 도메인 (선택사항)

1. **Vercel → Settings → Domains**
2. "Add Domain" 클릭
3. 도메인 입력 (예: `vintagescan.com`)
4. DNS 설정 완료
5. `NEXT_PUBLIC_SITE_URL` 업데이트

### 성능 최적화

1. **이미지 최적화**: Next.js Image 컴포넌트 사용
2. **캐싱**: API 응답 캐싱 확인
3. **모니터링**: Vercel Analytics 활성화

---

**배포 성공을 기원합니다!** 🎉

문제가 있으면 Vercel 로그와 브라우저 콘솔을 확인하세요.
