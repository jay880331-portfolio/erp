# RIDGE ERP 시스템 개발 가이드

원주 지역 중소기업을 위한 멀티테넌트 ERP 시스템의 프로젝트 구조와 개발 가이드입니다.

## 프로젝트 구조

### Clean Architecture 레이어

```
src/
├── app/                    # Next.js App Router (Presentation Layer)
│   ├── [locale]/          # 국제화 라우팅 (ko, en)
│   │   ├── layout.tsx     # 메인 레이아웃 + SEO 메타데이터
│   │   ├── page.tsx       # 홈페이지
│   │   ├── auth/          # 로그인/회원가입 페이지
│   │   └── dashboard/     # 대시보드 페이지들
│   ├── api/               # API Routes (Backend)
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 루트 페이지 (한국어로 리다이렉트)
├── common/                # 공통 타입 및 유틸리티
├── components/            # UI 컴포넌트
│   ├── finance/          # 재무 관련 컴포넌트
│   ├── shared/           # 공유 컴포넌트 (Navbar 등)
│   └── ui/               # 기본 UI 컴포넌트
├── core/                  # Clean Architecture 핵심
│   ├── domain/           # 도메인 레이어
│   ├── application/      # 애플리케이션 레이어
│   └── infrastructure/   # 인프라스트럭처 레이어
├── messages/             # 국제화 메시지 파일
├── utils/                # 유틸리티 함수
└── middleware.ts         # Next.js 미들웨어
```

### Core 아키텍처 상세

```
src/core/
├── domain/                # 도메인 레이어 (비즈니스 로직)
│   ├── entities/         # 도메인 엔티티
│   │   ├── Account.ts
│   │   ├── Customer.ts
│   │   ├── Transaction.ts
│   │   └── ...
│   ├── repositories/     # 리포지토리 인터페이스
│   │   ├── IAccountRepository.ts
│   │   └── ...
│   └── services/         # 도메인 서비스
├── application/          # 애플리케이션 레이어 (유즈케이스)
│   ├── dtos/            # 데이터 전송 객체 (Zod 검증)
│   │   ├── auth.dto.ts
│   │   ├── finance.dto.ts
│   │   └── ...
│   └── use-cases/       # 비즈니스 유즈케이스
│       ├── auth/
│       ├── finance/
│       └── ...
└── infrastructure/      # 인프라스트럭처 레이어 (외부 시스템)
    ├── auth/           # 인증 관련 (JWT, bcrypt)
    ├── config/         # 설정 파일
    └── database/       # 데이터베이스 관련
        ├── mongoose/   # Mongoose 모델
        └── repositories/ # 리포지토리 구현체
```

## API 개발 가이드

### API 라우트 구조

```
src/app/api/
├── auth/
│   ├── login/route.ts      # POST: 로그인
│   └── register/route.ts   # POST: 테넌트 등록
├── users/route.ts          # GET, POST: 사용자 관리
├── finance/
│   ├── accounts/
│   │   ├── route.ts        # GET, POST: 계정과목 목록/생성
│   │   └── [id]/route.ts   # GET, PUT, DELETE: 특정 계정과목
│   ├── transactions/
│   │   ├── route.ts        # GET, POST: 거래 목록/생성
│   │   └── [id]/route.ts   # GET, PUT, DELETE: 특정 거래
│   └── reports/route.ts    # GET: 재무보고서
├── scm/
│   ├── items/
│   │   ├── route.ts        # GET, POST: 품목 목록/생성
│   │   └── [id]/route.ts   # GET, PUT, DELETE: 특정 품목
│   └── inventory/
│       ├── stock/route.ts     # GET: 재고현황
│       └── movements/
│           ├── route.ts       # GET, POST: 재고이동 목록/생성
│           └── [id]/route.ts  # GET, PUT, DELETE: 특정 재고이동
└── crm/
    ├── customers/
    │   ├── route.ts        # GET, POST: 고객 목록/생성
    │   └── [id]/route.ts   # GET, PUT, DELETE: 특정 고객
    └── orders/
        ├── route.ts        # GET, POST: 주문 목록/생성
        └── [id]/route.ts   # GET, PUT, DELETE: 특정 주문
```

### API 라우트 개발 패턴

#### 1. Next.js 15 파라미터 처리
```typescript
// src/app/api/finance/accounts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Promise로 처리
  // ...
}
```

#### 2. 멀티테넌트 인증 처리
```typescript
import { verifyToken } from '@/core/infrastructure/auth/jwt';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  const tenantId = decoded.tenantId; // 모든 쿼리에 tenantId 포함 필수
}
```

#### 3. 응답 형식 (페이지네이션)
```typescript
// GET 요청 응답 형식
{
  data: [...], // 실제 데이터 배열
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

#### 4. 유즈케이스 호출 패턴
```typescript
// API 라우트에서 유즈케이스 호출
import { CreateAccountUseCase } from '@/core/application/use-cases/finance/CreateAccountUseCase';

export async function POST(request: NextRequest) {
  await connectDB(); // 항상 DB 연결 먼저
  
  const createAccountUseCase = new CreateAccountUseCase();
  const result = await createAccountUseCase.execute(data, tenantId);
  
  return NextResponse.json(result);
}
```

### API 에러 처리

- **401 Unauthorized**: 토큰 없음 또는 만료
- **403 Forbidden**: 권한 없음 (역할 기반)
- **400 Bad Request**: 입력 데이터 검증 실패
- **404 Not Found**: 리소스 없음
- **500 Internal Server Error**: 서버 에러

## Frontend 개발 가이드

### 페이지 구조

```
src/app/[locale]/
├── layout.tsx              # 메인 레이아웃 (SEO, 메타데이터)
├── page.tsx                # 홈페이지
├── auth/
│   ├── login/page.tsx      # 로그인 페이지
│   └── register/page.tsx   # 회원가입 페이지
└── dashboard/
    ├── layout.tsx          # 대시보드 레이아웃 (Navbar 포함)
    ├── page.tsx            # 대시보드 메인
    └── finance/
        ├── layout.tsx      # 재무 모듈 레이아웃
        ├── page.tsx        # 재무 대시보드
        ├── accounts/page.tsx    # 계정과목 관리
        ├── transactions/page.tsx # 거래 관리
        └── reports/page.tsx     # 재무보고서
```

### 컴포넌트 구조

#### 1. UI 컴포넌트 (`src/components/ui/`)
기본 UI 컴포넌트들:
- `Button.tsx`: 버튼 컴포넌트
- `Input.tsx`: 입력 필드
- `Modal.tsx`: 모달 창
- `DataTable.tsx`: 데이터 테이블
- `Select.tsx`: 선택 컴포넌트

#### 2. 도메인별 컴포넌트 (`src/components/[domain]/`)
각 도메인별 특화 컴포넌트:
- `finance/`: 재무 관련 컴포넌트
  - `AccountModal.tsx`: 계정과목 생성/수정 모달
  - `TransactionModal.tsx`: 거래 생성/수정 모달

#### 3. 공유 컴포넌트 (`src/components/shared/`)
전역적으로 사용되는 컴포넌트:
- `Navbar.tsx`: 네비게이션 바
- `LanguageSwitcher.tsx`: 언어 변경 버튼

### 국제화 (i18n) 사용법

#### 1. 번역 메시지 파일
```
messages/
├── ko.json    # 한국어
└── en.json    # 영어
```

#### 2. 컴포넌트에서 사용
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('finance');
  
  return (
    <div>
      <h1>{t('accounts.title')}</h1>
      <button>{t('accounts.create')}</button>
    </div>
  );
}
```

#### 3. 번역 키 구조
```json
{
  "finance": {
    "accounts": {
      "title": "계정과목 관리",
      "create": "새 계정과목",
      "edit": "계정과목 수정"
    },
    "transactions": {
      "title": "거래 관리"
    }
  }
}
```

### API 호출 패턴

#### 1. API 유틸리티 사용
```typescript
import { api } from '@/utils/api';

// GET 요청
const accounts = await api.get('/api/finance/accounts');

// POST 요청
const newAccount = await api.post('/api/finance/accounts', {
  name: '현금',
  type: 'asset'
});

// PUT 요청
const updatedAccount = await api.put(`/api/finance/accounts/${id}`, data);

// DELETE 요청
await api.delete(`/api/finance/accounts/${id}`);
```

#### 2. 페이지네이션 처리
```typescript
const response = await api.get('/api/finance/accounts');
const accountsArray = Array.isArray(response) ? response : (response.data || []);
```

#### 3. 에러 처리
```typescript
try {
  const result = await api.post('/api/finance/accounts', data);
} catch (error) {
  console.error('계정과목 생성 실패:', error.message);
  // 사용자에게 에러 메시지 표시
}
```

### 상태 관리

#### 1. 로컬 상태 (useState, useReducer)
컴포넌트 내부 상태 관리

#### 2. Zustand (클라이언트 상태)
전역 상태 관리가 필요한 경우

#### 3. React Query (서버 상태)
API 데이터 캐싱 및 동기화

## 화면별 수정 위치 가이드

### 대시보드 메인 화면
- **파일**: `src/app/[locale]/dashboard/page.tsx`
- **목적**: 전체 현황 요약, 주요 지표 표시

### 재무 관리
- **계정과목 목록**: `src/app/[locale]/dashboard/finance/accounts/page.tsx`
- **거래 목록**: `src/app/[locale]/dashboard/finance/transactions/page.tsx`
- **재무보고서**: `src/app/[locale]/dashboard/finance/reports/page.tsx`
- **계정과목 모달**: `src/components/finance/AccountModal.tsx`
- **거래 모달**: `src/components/finance/TransactionModal.tsx`

### 재고 관리 (SCM)
- **품목 관리**: `src/app/[locale]/dashboard/scm/items/page.tsx`
- **재고 현황**: `src/app/[locale]/dashboard/scm/inventory/page.tsx`
- **재고 이동**: `src/app/[locale]/dashboard/scm/movements/page.tsx`

### 고객 관리 (CRM)
- **고객 목록**: `src/app/[locale]/dashboard/crm/customers/page.tsx`
- **주문 관리**: `src/app/[locale]/dashboard/crm/orders/page.tsx`

### 공통 UI 수정
- **네비게이션**: `src/components/shared/Navbar.tsx`
- **언어 변경**: `src/components/shared/LanguageSwitcher.tsx`
- **레이아웃**: `src/app/[locale]/dashboard/layout.tsx`

### 로그인/인증
- **로그인 페이지**: `src/app/[locale]/auth/login/page.tsx`
- **회원가입 페이지**: `src/app/[locale]/auth/register/page.tsx`

### 번역 수정
- **한국어**: `messages/ko.json`
- **영어**: `messages/en.json`

### SEO 및 메타데이터
- **메인 메타데이터**: `src/app/[locale]/layout.tsx`
- **파비콘**: `public/favicon.ico`
- **로고**: `public/logo.svg`

## 개발 워크플로우

### 1. 새로운 기능 추가 시
1. **도메인 엔티티** 생성: `src/core/domain/entities/`
2. **리포지토리 인터페이스** 정의: `src/core/domain/repositories/`
3. **DTO 및 검증** 스키마: `src/core/application/dtos/`
4. **유즈케이스** 구현: `src/core/application/use-cases/`
5. **리포지토리 구현**: `src/core/infrastructure/database/repositories/`
6. **API 라우트** 생성: `src/app/api/`
7. **프론트엔드 페이지/컴포넌트** 구현
8. **번역 메시지** 추가

### 2. 기존 기능 수정 시
1. **API 수정**: `src/app/api/` 또는 `src/core/` 관련 파일
2. **화면 수정**: 해당 페이지 또는 컴포넌트 파일
3. **번역 업데이트**: `messages/` 파일들

### 3. UI/UX 개선 시
1. **컴포넌트 수정**: `src/components/`
2. **스타일 수정**: `src/app/globals.css` 또는 Tailwind 클래스
3. **레이아웃 수정**: 각 `layout.tsx` 파일들

## 주요 개발 규칙

### 멀티테넌트 필수 사항
- 모든 데이터베이스 쿼리에 `tenantId` 포함
- JWT 토큰에서 `tenantId` 추출하여 검증
- API 응답에 타 테넌트 데이터 노출 금지

### 코드 품질
- TypeScript 타입 안정성 확보
- Zod를 통한 입력 데이터 검증
- Clean Architecture 레이어 분리 준수
- 일관된 에러 처리 패턴

### 보안
- 모든 API 엔드포인트 인증 필수
- 역할 기반 권한 검사
- 민감 정보 로깅 금지
- 환경 변수를 통한 시크릿 관리