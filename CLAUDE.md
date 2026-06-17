# CLAUDE.md

이 문서는 Claude Code가 **SPARK 웹앱**을 개발할 때 따라야 하는 프로젝트 맥락, 기능 범위, IA, 유저플로우, 기술 스펙, Supabase 설계 기준, **Supabase MCP 연결 전제 작업 규칙**을 정의한다.

## 참조 문서

| 문서          | 경로                                                         | 설명                                    |
| ------------- | ------------------------------------------------------------ | --------------------------------------- |
| 원본 기획     | [docs/spec/spec-origin.md](docs/spec/spec-origin.md)         | 서비스 정의, 핵심 제품 원칙 원본        |
| 확정 요구사항 | [docs/spec/spec-fixed.md](docs/spec/spec-fixed.md)           | MVP 구현 대상 요구사항 16개             |
| DB 스키마     | [docs/database/schema.md](docs/database/schema.md)           | 실제 Supabase DB 테이블/컬럼/RLS 정책   |
| 디자인 시스템 | [docs/design/design-system.md](docs/design/design-system.md) | 컬러/타이포/컴포넌트/Tailwind 토큰 기준 |

> DB 관련 작업 시 반드시 [docs/database/schema.md](docs/database/schema.md)를 먼저 확인한다.  
> UI 작업 시 반드시 [docs/design/design-system.md](docs/design/design-system.md)를 먼저 확인한다.  
> 문서와 실제 DB가 다를 경우 **실제 DB(MCP 조회 결과)를 우선**하고, 문서를 갱신한다.

---

## 1. 프로젝트 개요

### 프로젝트명

**SPARK**

### 한 문장 서비스 정의

**10분 거리 이웃과의 부담 없는 연결로 운동의 불씨를 당기는, 하이퍼로컬 운동 행동 유도 플랫폼**

### 서비스가 아닌 것

SPARK는 단순 운동 기록 앱이 아니며, 친목 중심의 동호회 서비스도 아니다.  
핵심은 사용자가 운동을 “잘 기록”하게 만드는 것이 아니라, 실제로 운동을 “시작”하고 “지속”할 수 있게 만드는 것이다.

### 해결하려는 문제

2030 1인 가구 및 혼자 운동하는 사용자는 다음 이유로 운동을 지속하기 어렵다.

1. 운동을 시작하기까지의 심리적 부담이 크다.
2. 함께 운동할 사람이 없어 행동으로 이어지기 어렵다.
3. 정기 동호회는 부담스럽지만, 가볍게 운동할 사람은 필요하다.
4. 가까운 거리에서 지금 참여 가능한 운동 모임을 찾기 어렵다.

### 제공 가치

사용자는 거창한 준비 없이, 지금 내 주변 이웃과 빠르게 연결되어 운동을 시작할 수 있다.  
SPARK는 운동 기록보다 **운동 행동의 계기**를 제공하는 데 집중한다.

### 슬로건

**혼자서는 힘든 운동, 이웃과 함께 운동을 시작할 불씨를 키워볼까요?**

### North Star Metric

**주간 성사된 운동 스파크 수(Weekly Spark Counts)**

가입자 수나 게시글 수가 아니라, 실제 사용자가 이웃과 만나 운동을 시작한 행동의 총량을 핵심 지표로 본다.

---

## 2. 핵심 제품 원칙

### 2.1 운동 시작 우선

홈 화면과 주요 진입점에서 사용자가 가장 빠르게 운동을 시작할 수 있어야 한다.  
`운동 시작하기` CTA는 홈 화면 상단 또는 가장 눈에 띄는 위치에 배치한다.

### 2.2 하이퍼로컬 연결

사용자는 멀리 있는 사람이 아니라, 도보 또는 짧은 이동 거리 내의 이웃과 연결되어야 한다.  
위치 기반 탐색, 지도 보기, 리스트 보기, 거리 기반 필터를 우선 고려한다.

### 2.3 부담 없는 번개형 운동

정기 모임, 동호회, 깊은 친목보다 즉시성 있는 운동 연결에 집중한다.  
사용자는 가볍게 모임을 만들고, 신청하고, 승인받고, 운동을 완료할 수 있어야 한다.

### 2.4 신뢰와 안전

오프라인 만남이 발생하는 서비스이므로 신뢰도, 운동 레벨, 참여 이력, 신고, 후기, 취소 패널티를 고려한다.

### 2.5 기록은 행동 이후의 동기부여

운동 기록은 서비스의 중심 목적이 아니라, 운동 완료 이후 성취감과 재방문을 유도하는 보조 장치다.

### 2.6 모바일 퍼스트

기획 산출물 기준 모바일 앱 형태를 우선한다.  
기본 화면 폭은 **390px 기준**으로 설계하고, 웹앱에서는 반응형으로 확장한다.

---

## 3. 기술 스택

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query 권장
- Zustand 또는 Context API는 필요한 경우에만 사용

### Backend / BaaS

- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Supabase Storage
- Supabase Realtime은 MVP 이후 필요 시 적용
- **Supabase MCP 연결 사용 전제**

### Supabase MCP 사용 전제

Claude Code는 Supabase MCP가 연결되어 있다고 가정하고 작업한다.
DB 스키마 확인, 마이그레이션 작성, SQL 실행 전 검토, 테이블/정책 확인은 Supabase MCP를 우선 사용한다.

MCP 사용 원칙:

- Supabase 프로젝트에 접근할 때는 MCP를 통해 현재 DB 상태를 먼저 확인한다.
- 이미 존재하는 테이블, 컬럼, RLS 정책, 함수, 트리거를 임의로 재생성하지 않는다.
- DB 변경은 가능한 한 SQL migration 파일로 남기고, 변경 이유를 커밋 메시지 또는 작업 로그에 기록한다.
- 운영 데이터에 영향을 줄 수 있는 `drop`, `truncate`, 대량 `delete`, destructive migration은 사용자 확인 없이 실행하지 않는다.
- Supabase Dashboard에서 수동으로 작업했다고 가정하지 말고, MCP 조회 결과를 기준으로 판단한다.
- 프론트엔드 코드 작성 전 실제 테이블/컬럼명과 RLS 정책을 MCP로 확인한다.
- MCP 조회 결과와 문서의 설계안이 다르면, 실제 DB를 우선하되 설계 차이는 TODO로 남긴다.

MCP로 확인해야 하는 항목:

```txt
1. 현재 Supabase 프로젝트 연결 상태
2. public schema의 테이블 목록
3. 각 테이블 컬럼/타입/제약조건
4. auth.users와 profiles 연결 상태
5. RLS 활성화 여부
6. 테이블별 policy 목록
7. storage bucket 목록
8. 필요한 RPC/function/trigger 존재 여부
```

### 지도/위치

- MVP에서는 지도 영역을 placeholder 또는 mock 데이터로 구현 가능
- 이후 Kakao Map, Naver Map, Mapbox 중 하나로 확장 가능
- 지도 제공자는 직접 컴포넌트에 결합하지 말고 `src/lib/map` 또는 `src/features/map`에서 추상화한다.

---

## 4. 개발 기본 명령어

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
```

테스트 환경을 추가한 경우:

```bash
npm run test
```

---

## 5. 환경 변수

`.env.local` 예시:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_ENV=local
VITE_MAP_PROVIDER_KEY=
```

주의:

- Supabase service role key는 프론트엔드에 절대 노출하지 않는다.
- 클라이언트에서는 anon key만 사용한다.
- 민감한 관리자 작업은 Edge Function 또는 서버 환경에서 처리한다.
- Supabase MCP 연결 정보, access token, project ref, DB password는 저장소에 커밋하지 않는다.
- `.env.local`은 로컬 개발 전용이며 Git에 포함하지 않는다.

---

## 6. 권장 폴더 구조

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  assets/
  components/
    common/
    layout/
    ui/
  features/
    auth/
    onboarding/
    home/
    exercise/
    sparks/
    challenges/
    mypage/
    settings/
    notifications/
  lib/
    supabase/
      client.ts
      queries.ts
    map/
    utils/
  pages/
    auth/
    home/
    exercise/
    sparks/
    challenges/
    mypage/
    settings/
  styles/
    globals.css
  types/
    database.ts
    domain.ts
```

개발 시 기능 단위는 `features` 기준으로 분리한다.  
라우팅 페이지는 `pages`에 두고, 실제 비즈니스 UI와 로직은 `features`에서 관리한다.

---

## 7. IA 구조

SPARK의 1Depth IA는 다음 5개 탭을 기준으로 한다.

```txt
홈
운동 시작
번개 모임
챌린지
마이페이지
```

### 7.1 홈

홈은 사용자가 운동을 바로 시작하거나 주변 번개 모임으로 진입하는 허브다.

주요 요소:

- 운동 현황 대시보드
- 운동 통계 요약
- 최근 운동 기록 확인
- 운동 시작 CTA
- 모임 참여 유도
- 추천 번개 모임
- 알림
- 챌린지 달성도 요약

### 7.2 운동 시작

운동 시작은 혼자 운동과 같이 운동을 분기한다.

주요 요소:

- 유형 선택: 혼자 운동 / 같이 운동
- 종목 선택
- 목표 설정: 거리, 칼로리, 시간 등
- 운동 세션: 타이머, 운동 상태, 진행 정보
- 운동 종료
- 보상 확인: 운동 레벨, 신뢰도, XP 등

### 7.3 번개 모임

번개 모임은 탐색, 생성, 참여, 운영 관리를 포함한다.

주요 요소:

- 번개 리스트
- 지도 보기
- 종목/시간/거리 필터
- 번개 상세
- 번개 생성
- 참여 신청
- 호스트 승인/거절
- 참여자 관리
- 모집 마감
- 번개 종료
- 신고/후기

### 7.4 챌린지

챌린지는 운동 행동을 반복하게 만드는 보조 동기부여 영역이다.

주요 요소:

- 챌린지 메인
- 운동 챌린지 목록
- 모임 챌린지 목록
- 이벤트 챌린지 목록
- 달성률 트래킹
- 보상 지급

### 7.5 마이페이지

마이페이지는 프로필, 운동 기록, 활동 관리, 설정을 포함한다.

주요 요소:

- 메인 프로필
- 운동 레벨 / 신뢰도 레벨
- 운동 취향
- 운동 성향 태그
- 운동 기록 피드
- 캘린더
- 통계
- 참여한 번개
- 개설한 번개
- 설정: 계정, 알림, 약관, 문의, 로그아웃, 탈퇴

---

## 8. 라우팅 설계

```txt
/
/login
/signup
/onboarding/terms
/onboarding/profile

/home

/exercise
/exercise/setup
/exercise/session
/exercise/result

/sparks
/sparks/map
/sparks/new
/sparks/:sparkId
/sparks/:sparkId/manage
/sparks/:sparkId/review

/challenges
/challenges/:challengeId

/mypage
/mypage/profile
/mypage/exercise
/mypage/exercise/:sessionId
/mypage/activity
/mypage/settings

/settings/account
/settings/location
/settings/device
/settings/terms
/settings/help
```

라우팅 규칙:

- 로그인하지 않은 사용자가 보호된 페이지에 접근하면 `/login`으로 이동한다.
- 회원가입 후 약관 동의와 프로필 설정이 완료되지 않으면 온보딩 플로우로 이동한다.
- 하단 탭은 `/home`, `/exercise`, `/sparks`, `/challenges`, `/mypage`에서 유지한다.

---

## 9. 핵심 유저플로우

### 9.1 로그인 / 회원가입 플로우

```txt
앱 진입
→ 로그인 여부 확인
→ 미로그인: 로그인 / 회원가입
→ 약관 동의
→ 프로필 입력
→ 운동 레벨 및 선호 운동 설정
→ 홈 진입
```

필수 프로필 정보:

- 닉네임
- 선호 운동
- 운동 레벨
- 활동 지역

선택 프로필 정보:

- 운동 성향
- 성별
- 출생연도 또는 연령대
- 프로필 이미지

### 9.2 혼자 운동 플로우

```txt
홈
→ 운동 시작
→ 혼자 운동 선택
→ 종목 선택
→ 목표 설정
→ 운동 시작
→ 운동 진행
→ 운동 종료
→ 운동 기록 저장
→ 보상 확인
→ 마이페이지 운동 기록에서 확인
```

구현 기준:

- MVP에서는 실제 GPS 트래킹 없이 타이머 기반 운동 세션으로 구현 가능하다.
- 거리, 칼로리, 페이스 등은 사용자가 직접 입력하거나 mock 값으로 처리할 수 있다.
- 운동 종료 후 `exercise_sessions`에 기록한다.

### 9.3 같이 운동 / 번개 운동 플로우

```txt
홈 또는 운동 시작
→ 같이 운동 선택
→ 가입한 번개 여부 확인
→ 가입한 번개 있음: 번개 선택
→ 가입한 번개 없음: 모임 찾기 또는 모임 만들기
→ 멤버 접속/참여 확인
→ 운동 시작 버튼 클릭
→ 출석 처리
→ 운동 진행
→ 운동 종료
→ 번개 후기 작성
→ 운동 기록 저장
→ 보상 확인
```

분기 기준:

- 참여 중인 번개가 있으면 번개 선택 화면으로 이동한다.
- 참여 중인 번개가 없으면 번개 탐색 또는 번개 생성으로 이동한다.
- 모임장은 번개 종료, 참여자 관리, 모집 마감 기능을 사용할 수 있다.

### 9.4 번개 탐색 / 참여 플로우

```txt
번개 모임 탭 진입
→ 리스트 또는 지도 보기 선택
→ 종목/시간/거리 필터 적용
→ 결과 확인
→ 번개 상세 조회
→ 로그인 여부 확인
→ 참여 조건 확인
→ 참여 신청
→ 호스트 승인 대기
→ 승인: 참여한 번개 상세 진입
→ 거절: 거절 사유 안내
```

참여 조건 예시:

- 모집 상태가 `recruiting`인지 확인
- 정원이 초과되지 않았는지 확인
- 운동 레벨 조건 충족 여부 확인
- 성별/연령 조건이 있는 경우 충족 여부 확인
- 이미 신청 또는 참여한 번개인지 확인

### 9.5 번개 생성 / 운영 플로우

```txt
번개 모임 탭
→ 번개 생성
→ 운동 종류 입력
→ 운동 레벨 조건 입력
→ 장소 입력
→ 날짜/시간 입력
→ 인원 조건 입력
→ 공개 범위 설정
→ 상세 설명 입력
→ 최종 확인
→ 번개 등록 완료
```

운영 관리:

```txt
마이페이지
→ 활동 관리
→ 개설한 번개
→ 모집중 / 마감 / 전체 필터
→ 번개 상세
→ 참여자 관리
→ 승인 / 거절
→ 모집 마감
→ 번개 종료
```

### 9.6 챌린지 플로우

```txt
챌린지 탭 진입
→ 챌린지 메인
→ 운동 / 모임 / 이벤트 탭 선택
→ 챌린지 항목 클릭
→ 규칙 설명 확인
→ 운동 기록 또는 모임 운동 기록 발생
→ 달성률 자동 반영
→ 챌린지 완료
→ XP 또는 보상 지급
→ 메인 화면 달성도 업데이트
```

### 9.7 마이페이지 플로우

```txt
마이페이지 진입
→ 프로필 / 운동 관리 / 활동 관리 탭 선택
```

프로필:

```txt
프로필 홈
→ 편집
→ 닉네임, 선호 운동, 운동 성향 수정
→ 저장
```

운동 관리:

```txt
운동 관리 홈
→ 통계 / 히스토리 / 빠른 기록 선택
→ 주간 / 월간 / 연간 통계 확인
→ 최근 운동 기록 상세 확인
```

활동 관리:

```txt
활동 관리 홈
→ 참여한 번개 또는 개설한 번개 선택
→ 상태 필터 선택
→ 번개 상세 확인
→ 참여 취소 또는 운영 관리
```

설정:

```txt
설정 홈
→ 소셜 계정 / 위치 설정 / 기기 연결 / 약관 / 고객센터 / 로그아웃 / 회원탈퇴
```

---

## 10. MVP 기능 범위

### 반드시 구현

- Supabase Auth 기반 회원가입 / 로그인
- 약관 동의 화면
- 프로필 생성 및 수정
- 홈 대시보드
- 운동 시작: 혼자 운동 / 같이 운동 선택
- 운동 세션 타이머
- 운동 종료 및 기록 저장
- 번개 리스트
- 번개 상세
- 번개 생성
- 번개 참여 신청
- 호스트 승인 / 거절
- 참여한 번개 / 개설한 번개 관리
- 챌린지 목록 및 달성률 기본 표시
- 마이페이지 운동 기록 / 활동 관리 / 설정

### MVP에서 단순화 가능

- 지도는 정적 지도 또는 placeholder로 처리 가능
- GPS 경로 저장은 제외 가능
- 칼로리 계산은 mock 또는 직접 입력으로 처리 가능
- 웨어러블 연동은 설정 화면의 연결 상태 UI까지만 구현 가능
- 리워드 지급은 실제 쿠폰 지급 없이 XP/레벨 UI로 처리 가능

### MVP에서 제외 가능

- 실시간 채팅
- 결제
- 프리미엄 구독
- 실제 기프티콘 지급
- 정교한 AI 추천
- 복잡한 관리자 페이지

---

## 11. Supabase MCP 작업 프로토콜

이 프로젝트는 Supabase MCP 연결을 전제로 한다. Claude Code는 DB 관련 작업을 할 때 아래 순서를 따른다.

### 11.1 작업 시작 전 확인

DB 작업 또는 Supabase 연동 코드를 작성하기 전에 다음을 확인한다.

```txt
1. Supabase MCP 연결 확인
2. 현재 프로젝트의 schema 조회
3. profiles, sports, exercise_sessions, sparks 등 핵심 테이블 존재 여부 확인
4. RLS 활성화 여부 확인
5. 기존 policy와 충돌 여부 확인
6. Storage bucket 필요 여부 확인
```

### 11.2 DB 변경 방식

DB를 변경할 때는 다음 방식을 따른다.

```txt
1. 현재 DB 상태 조회
2. 변경이 필요한 이유 정리
3. migration SQL 작성
4. destructive change 여부 확인
5. 사용자 확인이 필요한 경우 확인 요청
6. MCP를 통해 SQL 실행 또는 실행 안내
7. 실행 후 schema 재조회
8. TypeScript 타입 재생성 필요 여부 확인
```

### 11.3 금지 사항

아래 작업은 사용자 확인 없이 실행하지 않는다.

```txt
- 기존 테이블 drop
- 기존 컬럼 drop
- 기존 데이터 truncate
- 운영 데이터 대량 delete
- RLS 비활성화
- 모든 사용자에게 과도하게 열린 policy 생성
- service role key를 프론트 코드에 삽입
- auth.users를 직접 수정하는 임의 SQL 실행
```

### 11.4 MCP 기반 개발 순서

프론트엔드 기능 개발 시 실제 DB와 불일치가 생기지 않도록 다음 순서를 따른다.

```txt
기능 요구사항 확인
→ Supabase MCP로 테이블/컬럼/RLS 확인
→ 필요한 경우 migration 작성
→ MCP로 schema 반영 확인
→ database type 생성 또는 갱신
→ feature api 작성
→ React UI 연결
→ 로딩/에러/빈 상태 처리
→ 권한 테스트
```

### 11.5 Supabase 타입 관리

`src/types/database.ts`는 Supabase 실제 schema를 기준으로 관리한다.

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > src/types/database.ts
```

MCP로 schema를 변경한 뒤에는 타입 갱신을 TODO로 남기거나 직접 갱신한다.

### 11.6 SQL 작성 규칙

SQL 작성 시 다음 기준을 따른다.

```txt
- 모든 주요 테이블은 uuid primary key 사용
- created_at, updated_at은 필요한 테이블에 포함
- status 값은 check constraint 또는 enum으로 제한
- user_id는 profiles(id)를 참조
- profiles.id는 auth.users(id)를 참조
- RLS는 기본 활성화
- 정책명은 기능을 알 수 있게 작성
- updated_at 자동 갱신 trigger 사용 권장
```

정책명 예시:

```sql
create policy "profiles_select_authenticated"
on profiles for select
to authenticated
using (true);

create policy "profiles_update_own"
on profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

### 11.7 MCP 작업 로그 작성 기준

DB 또는 Supabase 설정을 변경한 경우 작업 결과를 간단히 남긴다.

```txt
작업일:
작업 내용:
변경 테이블:
변경 policy:
실행 migration:
확인 결과:
TODO:
```

---

## 12. Supabase 데이터 모델

### 11.1 profiles

사용자 프로필 테이블. `auth.users`와 1:1로 연결한다.

```sql
profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique not null,
  avatar_url text,
  gender text,
  birth_year int,
  exercise_level text not null default 'beginner',
  trust_score int not null default 50,
  preferred_sports text[] default '{}',
  workout_traits text[] default '{}',
  activity_area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

### 11.2 sports

운동 종목 기준 테이블.

```sql
sports (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
)
```

초기 종목 예시:

- walking
- running
- cycling
- fitness
- racket_sports

### 11.3 exercise_sessions

운동 기록 테이블.

```sql
exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  spark_id uuid references sparks(id) on delete set null,
  sport_id uuid references sports(id),
  mode text not null check (mode in ('solo', 'spark')),
  title text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds int,
  distance_meters numeric,
  calories numeric,
  memo text,
  status text not null default 'completed' check (status in ('in_progress', 'completed', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

### 11.4 sparks

번개 모임 테이블.

```sql
sparks (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  sport_id uuid references sports(id),
  title text not null,
  description text,
  place_name text,
  address text,
  latitude numeric,
  longitude numeric,
  scheduled_at timestamptz not null,
  duration_minutes int,
  capacity int not null default 2,
  min_level text,
  max_level text,
  gender_condition text default 'any',
  age_min int,
  age_max int,
  status text not null default 'recruiting' check (status in ('recruiting', 'closed', 'in_progress', 'completed', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

### 11.5 spark_participants

번개 참여자 테이블.

```sql
spark_participants (
  id uuid primary key default gen_random_uuid(),
  spark_id uuid not null references sparks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('host', 'member')),
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'canceled', 'attended', 'no_show')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  canceled_at timestamptz,
  unique (spark_id, user_id)
)
```

### 11.6 spark_reviews

번개 종료 후 후기 테이블.

```sql
spark_reviews (
  id uuid primary key default gen_random_uuid(),
  spark_id uuid not null references sparks(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewee_id uuid not null references profiles(id) on delete cascade,
  keywords text[] default '{}',
  review_type text not null default 'positive' check (review_type in ('positive', 'negative')),
  created_at timestamptz not null default now(),
  unique (spark_id, reviewer_id, reviewee_id)
)
```

### 11.7 challenges

챌린지 테이블.

```sql
challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  challenge_type text not null check (challenge_type in ('exercise', 'spark', 'event')),
  goal_count int not null default 1,
  reward_xp int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
)
```

### 11.8 challenge_progress

사용자별 챌린지 진행 상태.

```sql
challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  current_count int not null default 0,
  completed_at timestamptz,
  reward_claimed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, user_id)
)
```

### 11.9 notifications

알림 테이블.

```sql
notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
)
```

### 11.10 reports

신고 테이블.

```sql
reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_user_id uuid references profiles(id) on delete set null,
  spark_id uuid references sparks(id) on delete set null,
  reason text not null,
  description text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default now()
)
```

### 11.11 device_connections

웨어러블/건강 앱 연결 상태. MVP에서는 연결 상태 UI만 구현해도 된다.

```sql
device_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected')),
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
)
```

### 11.12 terms_agreements

약관 동의 이력.

```sql
terms_agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  terms_type text not null,
  version text not null,
  agreed_at timestamptz not null default now(),
  unique (user_id, terms_type, version)
)
```

---

## 13. Supabase RLS 기준

모든 테이블은 기본적으로 RLS를 활성화한다.

```sql
alter table profiles enable row level security;
alter table sports enable row level security;
alter table exercise_sessions enable row level security;
alter table sparks enable row level security;
alter table spark_participants enable row level security;
alter table spark_reviews enable row level security;
alter table challenges enable row level security;
alter table challenge_progress enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table device_connections enable row level security;
alter table terms_agreements enable row level security;
```

### RLS 정책 방향

#### profiles

- 로그인 사용자는 공개 프로필을 조회할 수 있다.
- 사용자는 자신의 프로필만 수정할 수 있다.
- 민감한 필드는 공개 조회에서 제외하거나 별도 view로 분리한다.

#### exercise_sessions

- 사용자는 자신의 운동 기록만 생성/수정/삭제할 수 있다.
- 개인 운동 기록은 본인만 조회한다.
- 번개 운동 기록은 필요한 경우 해당 번개 참여자에게 요약 정보만 노출한다.

#### sparks

- 로그인 사용자는 모집 중인 번개를 조회할 수 있다.
- 번개 생성자는 자신의 번개만 수정/삭제할 수 있다.
- 상태 변경은 호스트만 가능하다.

#### spark_participants

- 사용자는 자신의 참여 신청을 생성할 수 있다.
- 사용자는 자신의 참여 상태를 조회할 수 있다.
- 호스트는 자신의 번개에 대한 참여 신청을 승인/거절할 수 있다.

#### spark_reviews

- 번개 참여자만 후기를 작성할 수 있다.
- 동일한 대상에게 중복 후기를 작성할 수 없다.
- 후기 작성 가능 시간은 번개 종료 후 24시간 이내로 제한하는 것을 권장한다.

#### notifications

- 사용자는 자신의 알림만 조회하고 읽음 처리할 수 있다.

#### reports

- 로그인 사용자는 신고를 생성할 수 있다.
- 신고 내용은 작성자와 관리자만 조회할 수 있다.

---

## 14. UI/UX 기준

### 디자인 방향

- 모바일 앱처럼 동작하는 웹앱
- 390px 기준에서 먼저 완성
- 깔끔하고 직관적인 카드형 UI
- 운동 시작 CTA를 가장 명확하게 노출
- 지도/리스트 전환은 사용자가 쉽게 이해할 수 있게 구성

### 주요 UX 원칙

- 사용자가 앱에 들어오자마자 운동 시작 경로를 이해해야 한다.
- 번개 탐색 화면에서는 거리, 시간, 종목이 빠르게 보여야 한다.
- 번개 상세에서는 참여 조건, 위치, 시간, 호스트 신뢰 정보를 우선 노출한다.
- 운동 종료 후에는 기록 저장, XP, 레벨, 신뢰도 변화 등 보상 피드백을 제공한다.
- 마이페이지는 프로필보다 운동 기록과 활동 관리 접근성이 중요하다.

### Tailwind 작성 규칙

> **UI 작업 전 [docs/design/design-system.md](docs/design/design-system.md)를 반드시 확인한다.**  
> 컬러, 타이포, 컴포넌트 스펙, Tailwind 토큰 매핑이 해당 문서에 정의되어 있다.

- 공통 스타일은 컴포넌트화한다.
- 반복되는 버튼, 카드, 탭, 바텀내비는 `components/ui` 또는 `components/layout`으로 분리한다.
- **임의 색상(예: `bg-orange-500`)을 사용하지 않는다.** 반드시 design-system.md의 브랜드 토큰을 사용한다.
- 모바일 우선 클래스를 작성한 뒤 `sm`, `md`, `lg` 순서로 확장한다.

#### 브랜드 컬러 토큰 (design-system.md 기준)

| 용도             | 클래스 (커스텀 토큰)                    | Hex       |
| ---------------- | --------------------------------------- | --------- |
| Primary CTA 배경 | `bg-brand-neon`                         | `#C8FF3E` |
| Secondary 강조   | `text-brand-purple` / `bg-brand-purple` | `#9B8FFF` |
| 다크 배경        | `bg-brand-black`                        | `#111111` |
| 다크 카드 배경   | `bg-brand-dark-card`                    | `#2A2A2A` |
| CTA 텍스트       | `text-brand-black`                      | `#111111` |

#### 홈 화면 듀얼톤 구조

- 상단 라이트 구역: 파스텔 그라데이션 배경 (`bg-gradient-to-br from-white via-[#E8E0FF] to-[#FFF8D6]`)
- 하단 다크 구역: `bg-brand-black` 또는 `bg-[#111111]`

#### 컴포넌트별 클래스 기준

```tsx
// Primary CTA 버튼
<button className="w-full rounded-full bg-brand-neon py-4 text-base font-bold text-brand-black">
  운동 시작하기
</button>

// Chip / Tag (아웃라인)
<span className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">
  연속 50일
</span>

// 모임 카드 (라이트 배경)
<div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
  ...
</div>

// 다크 섹션 배경
<section className="bg-brand-black px-5 py-6">
  ...
</section>

// 하이라이트 테이블 셀
<td className="rounded-lg bg-brand-neon px-3 py-2 text-sm font-bold text-brand-black">
  12.4
</td>
```

---

## 15. 컴포넌트 설계 기준

### 공통 컴포넌트 예시

```txt
AppLayout
BottomNavigation
PageHeader
PrimaryButton
SecondaryButton
TabBar
StatCard
SparkCard
ExerciseRecordCard
ChallengeCard
EmptyState
ConfirmModal
Toast
```

### 기능별 컴포넌트 예시

#### home

```txt
HomeDashboard
TodayExerciseSummary
QuickStartCTA
RecommendedSparkList
ChallengeProgressSummary
```

#### exercise

```txt
ExerciseTypeSelector
SportSelector
GoalSettingForm
ExerciseTimer
ExerciseSummary
RewardResult
```

#### sparks

```txt
SparkList
SparkMapView
SparkFilterBar
SparkDetail
SparkCreateForm
SparkParticipantList
SparkManagePanel
SparkReviewForm
```

#### challenges

```txt
ChallengeTabs
ChallengeList
ChallengeDetailModal
ChallengeProgressBar
RewardBadge
```

#### mypage

```txt
ProfileSummary
ProfileEditForm
ExerciseHistoryList
ExerciseStats
ActivityManageTabs
SettingsList
```

---

## 16. 데이터 접근 규칙

### Supabase Client

`src/lib/supabase/client.ts`에서 단일 클라이언트를 생성한다.
Supabase MCP는 개발/관리 작업에 사용하고, 실제 웹앱 런타임에서는 `@supabase/supabase-js` 클라이언트를 사용한다.

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Query 분리

DB 접근 코드는 컴포넌트에 직접 작성하지 않는다.  
각 feature 내부에 `api.ts` 또는 `queries.ts`를 만든다.

예시:

```txt
features/sparks/api.ts
features/exercise/api.ts
features/mypage/api.ts
```

### 상태 관리

- 서버 데이터: TanStack Query 권장
- 화면 내 임시 상태: React state
- 여러 화면에서 공유되는 클라이언트 상태: Zustand 또는 Context

---

## 17. 코드 작성 규칙

### TypeScript

- 가능하면 `any`를 사용하지 않는다.
- Supabase 타입은 generated type을 사용한다.
- API 응답 타입과 UI 타입을 분리한다.

### React

- 페이지 컴포넌트는 라우팅과 레이아웃 중심으로 유지한다.
- 실제 로직은 feature hook 또는 api 함수로 분리한다.
- form 처리는 MVP에서는 React state로 가능하지만, 복잡해지면 react-hook-form을 고려한다.

### Naming

- 컴포넌트: PascalCase
- 함수: camelCase
- 상수: UPPER_SNAKE_CASE
- 파일명: 컴포넌트는 PascalCase, 일반 유틸은 camelCase

### UI Copy

- 서비스의 톤은 가볍고 행동을 유도하는 문장으로 작성한다.
- “운동을 기록하세요”보다 “지금 운동을 시작해볼까요?”처럼 행동 중심으로 작성한다.

---

## 18. 주요 화면별 구현 기준

### 홈

필수 표시:

- 사용자 닉네임
- 오늘의 운동 상태
- 운동 시작 CTA
- 주변 추천 번개
- 챌린지 진행률
- 최근 운동 기록 요약

### 운동 시작

필수 기능:

- 혼자 운동 / 같이 운동 선택
- 종목 선택
- 목표 설정
- 운동 세션 시작
- 타이머 표시
- 운동 종료
- 결과 저장

### 번개 모임

필수 기능:

- 리스트 보기
- 지도 보기 placeholder
- 필터
- 상세 조회
- 참여 신청
- 번개 생성
- 호스트 승인/거절
- 모집 마감

### 챌린지

필수 기능:

- 운동 / 모임 / 이벤트 탭
- 챌린지 카드 목록
- 달성률 표시
- 완료 상태 표시

### 마이페이지

필수 기능:

- 프로필 조회/수정
- 운동 기록 피드
- 운동 통계 요약
- 참여한 번개
- 개설한 번개
- 설정

---

## 19. 에러/빈 상태 처리

모든 주요 화면에는 로딩, 에러, 빈 상태를 구현한다.

예시:

- 주변 번개가 없을 때: “근처에 열린 번개가 아직 없어요. 직접 만들어볼까요?”
- 참여한 번개가 없을 때: “아직 참여한 번개가 없어요.”
- 운동 기록이 없을 때: “첫 운동 기록을 만들어보세요.”
- 로그인 필요: “로그인 후 이용할 수 있어요.”

---

## 20. 보안/개인정보 기준

- 정확한 위치 정보는 필요한 경우에만 저장한다.
- 사용자 위치는 화면 표시 목적과 번개 탐색 목적에 한정한다.
- 공개 프로필에는 최소 정보만 노출한다.
- 성별, 나이, 운동 레벨 조건은 사용자가 입력한 참여 조건 확인에만 사용한다.
- 탈퇴 시 개인정보와 프로필 데이터 삭제 정책을 고려한다.
- 신고/후기 데이터는 악용 방지를 위해 본인과 관련된 범위로 제한한다.

---

## 21. Claude 작업 시 주의사항

### 반드시 지킬 것

- 첨부 기획 문서의 서비스 정의, IA, 유저플로우를 우선한다.
- 임의로 서비스 방향을 “운동 기록 앱” 또는 “커뮤니티 앱” 중심으로 바꾸지 않는다.
- 하단 탭 구조는 홈 / 운동 시작 / 번개 모임 / 챌린지 / 마이페이지를 기준으로 유지한다.
- 운동 시작 CTA를 주요 화면에서 명확히 유지한다.
- Supabase RLS를 고려하지 않은 DB 작업을 만들지 않는다.
- 프론트엔드에 service role key를 사용하지 않는다.
- Supabase 관련 작업은 MCP 연결 상태와 현재 schema를 먼저 확인한 뒤 진행한다.
- DB 설계안과 실제 MCP 조회 결과가 다르면 실제 DB 기준으로 구현하고 차이는 TODO로 남긴다.

### 임의로 추가하지 말 것

- 채팅 기능
- 결제 기능
- 복잡한 관리자 기능
- 무거운 SNS 피드
- 댓글/좋아요 중심 커뮤니티 기능
- 실제 웨어러블 API 연동

### 불확실할 때

다음 형식으로 먼저 질문하거나 TODO로 남긴다.

```txt
TODO: 이 기능은 정책 정의가 필요합니다.
확인 필요: 번개 취소 패널티 기준, 후기 작성 가능 시간, 신뢰도 점수 계산식
```

---

## 22. 1차 개발 우선순위

### P0

- 프로젝트 세팅
- 라우터 구성
- 공통 레이아웃 / 바텀내비
- Supabase 연결
- Supabase MCP 기반 schema 확인
- Auth
- 프로필 생성
- 홈
- 운동 시작 기본 플로우
- 운동 기록 저장

### P1

- 번개 리스트
- 번개 상세
- 번개 생성
- 참여 신청
- 참여자 승인/거절
- 마이페이지 활동 관리

### P2

- 챌린지
- 후기
- 신고
- 알림
- 설정

### P3

- 지도 고도화
- 위치 기반 추천
- 신뢰도 계산 고도화
- 웨어러블 연동
- 리워드/보상 고도화

---

## 23. 완료 기준

기능 구현 완료 시 다음을 확인한다.

- `npm run build` 통과
- TypeScript 에러 없음
- 주요 라우트 정상 접근
- 로그인/비로그인 접근 제어 정상 작동
- Supabase RLS 기준 반영
- 390px 모바일 화면에서 깨짐 없음
- 빈 상태/로딩/에러 상태 구현
- 핵심 유저플로우가 끊기지 않음
- 서비스 정의와 IA에서 벗어난 기능 추가 없음
