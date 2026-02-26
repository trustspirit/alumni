# BYUH Alumni Korea Chapter Website - Design Document

**Date:** 2026-02-26
**Status:** Approved (v2 — with Auth, RBAC, Admin CRUD)

## Overview

BYU-Hawaii Alumni Korea Chapter를 위한 웹 애플리케이션.
기존 동문 네트워킹/소식 전달 + 신규 동문 모집/홍보 + 콘텐츠 관리(Admin/Manager) 기능을 수행한다.

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vite | Build tool |
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| React Router v7 | Routing (hybrid SPA) |
| TanStack Query v5 | Data fetching & caching |
| Firebase Auth | Google SSO 인증 |
| Cloud Firestore | 데이터베이스 (events, news, users, gallery) |
| Firebase Storage | 이미지 업로드/관리 |
| Firebase Hosting | Deployment |

## Design References

- https://www.byuh.edu/ (BYUH 공식 사이트)
- https://alumni.byu.edu/ (BYU Alumni 공식 사이트)

## Branding

- **Primary:** BYUH Crimson `#BA0C2F`
- **Primary Dark:** `#8E0A24` (hover states)
- **Accent:** Gold `#946F0A`
- **Accent Light:** `#C4A035`
- **Background:** `#F6F6F8`
- **Text:** `#1A1A2E`
- **Typography:** Montserrat (headings) + Public Sans (body)

## Authentication & Role System

### Google SSO Flow

1. 사용자가 "Google로 로그인" 클릭
2. Firebase Auth Google Provider로 인증
3. 최초 로그인 시 → 프로필 완성 페이지로 리다이렉트
4. 프로필 완성 후 → member 역할로 Firestore에 사용자 문서 생성
5. 이후 로그인 → 기존 프로필로 진입

### Role Hierarchy

| Role | 권한 | 부여 방식 |
|------|------|----------|
| **admin** | 전체 CRUD + 역할 관리 + 모든 기능 | Firebase에서 수동 등록 |
| **manager** | Events/News/Gallery CRUD + 회원 조회 | Admin이 지정 |
| **member** | 프로필 수정 + 콘텐츠 열람 + 동문 명부 열람 + 행사 참석 신청 | Google SSO 가입 시 기본 |

### User Profile Schema

**Required:**
- `name` (string) — 이름
- `email` (string) — 이메일 (Google 계정에서 자동)
- `phone` (string) — 연락처

**Optional:**
- `company` (string) — 직장명
- `position` (string) — 직위/포지션
- `linkedIn` (string) — LinkedIn URL
- `socialLinks` (Record<string, string>) — 기타 소셜 미디어 URL
- `graduationYear` (string) — 졸업 연도
- `profileImageUrl` (string) — 프로필 사진

## Project Structure

```
byuh-alumni-korea/
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/          # Button, Card, SectionHeading, Container, ExternalLink, Modal, LoadingSpinner
│   │   ├── layout/          # Header, Footer, Layout
│   │   ├── sections/        # Hero, About, Events, News, Gallery, Join, Give, Contact
│   │   ├── auth/            # GoogleSignInButton, ProtectedRoute, RoleGuard
│   │   └── admin/           # EventForm, NewsForm, GalleryUploader, MemberTable, RoleManager
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── GalleryPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ProfileSetupPage.tsx
│   │   ├── DirectoryPage.tsx       # 동문 명부
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminEvents.tsx
│   │       ├── AdminNews.tsx
│   │       ├── AdminGallery.tsx
│   │       └── AdminMembers.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useData.ts
│   │   ├── useScrollToSection.ts
│   │   └── useImageUpload.ts
│   ├── lib/
│   │   ├── cn.ts
│   │   ├── queryClient.ts
│   │   ├── firebase.ts            # Firebase app init
│   │   ├── auth.ts                # Auth helpers
│   │   ├── firestore.ts           # Firestore CRUD helpers
│   │   └── storage.ts             # Storage upload helpers
│   ├── data/                      # Seed/fallback static data
│   │   └── navigation.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── firestore.rules
├── storage.rules
├── firebase.json
├── .firebaserc
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Design Principles

- **common/** — DRY: 재사용 컴포넌트 집중 관리
- **auth/** — 인증 관련 컴포넌트 격리 (ProtectedRoute, RoleGuard)
- **admin/** — Admin/Manager 전용 CRUD 폼 컴포넌트
- **lib/** — Firebase SDK 래퍼를 한 곳에 집중, 컴포넌트에서 직접 SDK 호출 금지
- **hooks/** — 비즈니스 로직을 커스텀 훅으로 추출, 컴포넌트는 표시만 담당
- **types/** — 모든 데이터 구조를 타입으로 정의

## Routing

### Public Routes (비로그인 접근 가능)

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | 모든 섹션 요약 |
| `/about` | AboutPage | 챕터 소개 상세 + 리더십 |
| `/events` | EventsPage | 전체 행사 목록 |
| `/gallery` | GalleryPage | 사진 갤러리 전체 |
| `/login` | LoginPage | Google SSO 로그인 |

### Member Routes (로그인 필요)

| Route | Page | Description |
|-------|------|-------------|
| `/profile` | ProfilePage | 내 프로필 수정 |
| `/profile/setup` | ProfileSetupPage | 최초 가입 시 프로필 완성 |
| `/directory` | DirectoryPage | 동문 명부 열람 |
| `/events/:id/rsvp` | — | 행사 참석 신청/취소 (EventsPage 내 기능) |

### Admin/Manager Routes (role 필요)

| Route | Page | Role |
|-------|------|------|
| `/admin` | AdminDashboard | admin, manager |
| `/admin/events` | AdminEvents | admin, manager |
| `/admin/news` | AdminNews | admin, manager |
| `/admin/gallery` | AdminGallery | admin, manager |
| `/admin/members` | AdminMembers | admin only |

## Firestore Collections

### `users`
```
users/{uid}
  - name: string (required)
  - email: string (required)
  - phone: string (required)
  - company?: string
  - position?: string
  - linkedIn?: string
  - socialLinks?: { [platform: string]: string }
  - graduationYear?: string
  - profileImageUrl?: string
  - role: 'admin' | 'manager' | 'member'
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### `events`
```
events/{eventId}
  - title: string
  - date: Timestamp
  - location: string
  - description: string
  - imageUrl: string
  - attendees: string[] (uid 배열)
  - createdBy: string (uid)
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### `news`
```
news/{newsId}
  - title: string
  - date: Timestamp
  - summary: string
  - content: string
  - imageUrl: string
  - link?: string
  - createdBy: string (uid)
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### `gallery`
```
gallery/{imageId}
  - src: string (Storage URL)
  - alt: string
  - category: string
  - uploadedBy: string (uid)
  - createdAt: Timestamp
```

## Security

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }
    function getUserRole() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
    function isAdmin() { return isSignedIn() && getUserRole() == 'admin'; }
    function isManager() { return isSignedIn() && getUserRole() in ['admin', 'manager']; }

    // Users
    match /users/{uid} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isOwner(uid);
      allow update: if isSignedIn() && (isOwner(uid) || isAdmin());
      // role field update restricted to admin only
    }

    // Events
    match /events/{eventId} {
      allow read: if true;
      allow create, update, delete: if isManager();
      // attendees array update allowed for members
      allow update: if isSignedIn() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['attendees']);
    }

    // News
    match /news/{newsId} {
      allow read: if true;
      allow create, update, delete: if isManager();
    }

    // Gallery
    match /gallery/{imageId} {
      allow read: if true;
      allow create, delete: if isManager();
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /news/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /profiles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### HTTP Security Headers (firebase.json)

- `Content-Security-Policy` — XSS 방지, Firebase + Google Auth 도메인 허용
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — 불필요한 브라우저 API 차단
- `Strict-Transport-Security` — HTTPS 강제

### Code-Level Security

- Firebase SDK 호출은 lib/ 레이어에서만
- 모든 외부 링크에 `rel="noopener noreferrer"`
- 입력값 검증 (sanitization) — 클라이언트 + Firestore Rules 이중 검증
- `.env` 환경 변수 분리 + `.gitignore`
- `dangerouslySetInnerHTML` 사용 금지
- 이미지 업로드 시 파일 타입 + 크기 검증 (클라이언트 + Storage Rules)
- RBAC는 Firestore user document의 role 필드 기반, 클라이언트 가드 + 서버 룰 이중 보호

## Tailwind Strategy

- **cn() utility** — `clsx` + `tailwind-merge`로 클래스 안전 병합
- **Component variants** — 스타일을 variants 객체로 분리, 인라인 최소화
- **@layer directives** — base/components/utilities 레이어 분리로 CSS 우선순위 보장
- **Design tokens** — Tailwind config에 BYUH 브랜드 토큰 정의

## Performance Optimization

- **Code splitting** — `React.lazy` + `Suspense`로 페이지별 분할 (특히 admin 페이지)
- **TanStack Query** — 데이터 성격별 staleTime 차등 적용:
  - `Infinity`: navigation, leadership (거의 변경 없는 정적 데이터)
  - `5분`: events, news (정기 업데이트 가능)
  - `10분`: gallery (사진 추가 가능하나 빈번하지 않음)
- **TanStack Query mutations** — CRUD 후 관련 쿼리 자동 invalidation
- **Image optimization** — `loading="lazy"` + 업로드 시 리사이즈 고려
- **React.memo** — 순수 표시 컴포넌트의 불필요한 리렌더 방지
- **Bundle analysis** — Vite `manualChunks`로 vendor/firebase/admin 분리
- **Firebase SDK tree-shaking** — modular SDK (v9+) 사용으로 미사용 모듈 제거

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | 단일 컬럼, 햄버거 메뉴 |
| Tablet (640-1024px) | 2컬럼 그리드 |
| Desktop (>1024px) | 3-4컬럼 그리드, 풀 네비게이션 |
