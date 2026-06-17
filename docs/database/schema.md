# SPARK 데이터베이스 스키마

> Supabase 프로젝트: `atsblkfxsawvhqrtmlfc`  
> 스키마: `public`  
> 최종 동기화: 2026-06-16  
> 업데이트: 2026-06-17 (와이어프레임 반영 — 더미 데이터, 지도 좌표 활용)  
> 원본: Supabase MCP 실제 조회 결과 기준

## 더미 데이터 레이어

Supabase 연결 전 또는 데이터가 없을 때 사용하는 더미 데이터는 `src/lib/mockData.ts`에서 관리한다.

- `MOCK_SPORTS`: 10개 운동 종목 (emoji 포함)
- `MOCK_PROFILES`: 3개 샘플 프로필
- `MOCK_SPARKS`: 5개 번개 모임 (위도/경도 포함, 지도 표시 가능)
- `MOCK_EXERCISE_SESSIONS`: 3개 운동 기록
- `MOCK_CHALLENGES`: 6개 챌린지 (운동/번개/이벤트 타입)
- `MOCK_NOTIFICATIONS`: 5개 알림
- `MOCK_USER_PROFILE`: 현재 로그인 사용자 프로필 기본값
- `SPORT_EMOJI`: 종목 코드 → emoji 매핑

각 페이지에서 Supabase 쿼리가 빈 결과를 반환하거나 에러가 발생하면 자동으로 더미 데이터로 폴백한다.

---

---

## 테이블 목록

| 테이블 | 설명 | RLS | updated_at 트리거 |
|--------|------|-----|------------------|
| [profiles](#1-profiles) | 사용자 프로필 | ✅ | ✅ |
| [sports](#2-sports) | 운동 종목 기준 데이터 | ✅ | - |
| [exercise_sessions](#3-exercise_sessions) | 운동 기록 | ✅ | ✅ |
| [sparks](#4-sparks) | 번개 모임 | ✅ | ✅ |
| [spark_participants](#5-spark_participants) | 번개 참여자 | ✅ | - |
| [spark_reviews](#6-spark_reviews) | 번개 후기 | ✅ | - |
| [challenges](#7-challenges) | 챌린지 | ✅ | - |
| [challenge_progress](#8-challenge_progress) | 사용자별 챌린지 진행 상태 | ✅ | ✅ |
| [notifications](#9-notifications) | 알림 | ✅ | - |
| [reports](#10-reports) | 신고 | ✅ | - |
| [device_connections](#11-device_connections) | 웨어러블/건강 앱 연결 | ✅ | - |
| [terms_agreements](#12-terms_agreements) | 약관 동의 이력 | ✅ | - |

---

## 테이블 관계도

```
auth.users
    └── profiles (1:1, id → auth.users.id)
            ├── exercise_sessions (1:N, user_id → profiles.id)
            ├── sparks (1:N, host_id → profiles.id)
            ├── spark_participants (1:N, user_id → profiles.id)
            ├── spark_reviews (reviewer_id, reviewee_id → profiles.id)
            ├── challenge_progress (1:N, user_id → profiles.id)
            ├── notifications (1:N, user_id → profiles.id)
            ├── reports (reporter_id, target_user_id → profiles.id)
            ├── device_connections (1:N, user_id → profiles.id)
            └── terms_agreements (1:N, user_id → profiles.id)

sports
    ├── exercise_sessions (sport_id → sports.id)
    └── sparks (sport_id → sports.id)

sparks
    ├── exercise_sessions (spark_id → sparks.id)
    ├── spark_participants (spark_id → sparks.id)
    ├── spark_reviews (spark_id → sparks.id)
    └── reports (spark_id → sparks.id)

challenges
    └── challenge_progress (challenge_id → challenges.id)
```

---

## 1. profiles

사용자 프로필 테이블. `auth.users`와 1:1로 연결된다.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | - | PK, auth.users(id) 참조 |
| `nickname` | text | NO | - | 닉네임 (unique) |
| `avatar_url` | text | YES | - | 프로필 이미지 URL (Storage) |
| `gender` | text | YES | - | 성별 |
| `birth_year` | integer | YES | - | 출생연도 |
| `exercise_level` | text | NO | `'beginner'` | 운동 레벨 |
| `trust_score` | integer | NO | `50` | 신뢰 점수 (0~100) |
| `preferred_sports` | text[] | YES | `'{}'` | 선호 운동 종목 코드 배열 |
| `workout_traits` | text[] | YES | `'{}'` | 운동 성향 태그 배열 |
| `activity_area` | text | YES | - | 활동 지역 |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |
| `updated_at` | timestamptz | NO | `now()` | 수정일시 (트리거 자동 갱신) |

**exercise_level 값:** `beginner` `intermediate` `advanced`

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `profiles_select_authenticated` | SELECT | 인증된 모든 사용자 조회 가능 |
| `profiles_insert_own` | INSERT | `auth.uid() = id` |
| `profiles_update_own` | UPDATE | `auth.uid() = id` |

---

## 2. sports

운동 종목 기준 테이블. 관리자가 관리하는 마스터 데이터.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `code` | text | NO | - | 종목 코드 (unique) |
| `name` | text | NO | - | 종목 한국어 이름 |
| `category` | text | NO | - | 카테고리 (`outdoor` / `indoor`) |
| `is_active` | boolean | NO | `true` | 활성 여부 |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |

**초기 데이터 (8종):**

| code | name | category |
|------|------|----------|
| `walking` | 걷기 | outdoor |
| `running` | 달리기 | outdoor |
| `cycling` | 자전거 | outdoor |
| `fitness` | 헬스 | indoor |
| `racket_sports` | 라켓 스포츠 | indoor |
| `swimming` | 수영 | indoor |
| `yoga` | 요가 | indoor |
| `climbing` | 클라이밍 | indoor |

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `sports_select_authenticated` | SELECT | 인증된 모든 사용자 조회 가능 |

---

## 3. exercise_sessions

사용자의 운동 기록 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | - | profiles(id) 참조 |
| `spark_id` | uuid | YES | - | sparks(id) 참조 (번개 운동인 경우) |
| `sport_id` | uuid | YES | - | sports(id) 참조 |
| `mode` | text | NO | - | `solo` / `spark` |
| `title` | text | YES | - | 운동 제목 |
| `started_at` | timestamptz | NO | - | 운동 시작 일시 |
| `ended_at` | timestamptz | YES | - | 운동 종료 일시 |
| `duration_seconds` | integer | YES | - | 운동 시간 (초) |
| `distance_meters` | numeric | YES | - | 이동 거리 (미터) |
| `calories` | numeric | YES | - | 소모 칼로리 |
| `memo` | text | YES | - | 메모 |
| `status` | text | NO | `'completed'` | `in_progress` / `completed` / `canceled` |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |
| `updated_at` | timestamptz | NO | `now()` | 수정일시 (트리거 자동 갱신) |

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `exercise_sessions_select_own` | SELECT | `auth.uid() = user_id` |
| `exercise_sessions_insert_own` | INSERT | `auth.uid() = user_id` |
| `exercise_sessions_update_own` | UPDATE | `auth.uid() = user_id` |
| `exercise_sessions_delete_own` | DELETE | `auth.uid() = user_id` |

---

## 4. sparks

번개 모임 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `host_id` | uuid | NO | - | profiles(id) 참조, 번개 개설자 |
| `sport_id` | uuid | YES | - | sports(id) 참조 |
| `title` | text | NO | - | 번개 제목 |
| `description` | text | YES | - | 상세 설명 |
| `place_name` | text | YES | - | 장소명 |
| `address` | text | YES | - | 주소 |
| `latitude` | numeric | YES | - | 위도 |
| `longitude` | numeric | YES | - | 경도 |
| `scheduled_at` | timestamptz | NO | - | 운동 예정 일시 |
| `duration_minutes` | integer | YES | - | 예상 소요 시간 (분) |
| `capacity` | integer | NO | `2` | 최대 정원 |
| `min_level` | text | YES | - | 최소 운동 레벨 조건 |
| `max_level` | text | YES | - | 최대 운동 레벨 조건 |
| `gender_condition` | text | YES | `'any'` | 성별 조건 (`any` / `male` / `female`) |
| `age_min` | integer | YES | - | 최소 연령 조건 |
| `age_max` | integer | YES | - | 최대 연령 조건 |
| `status` | text | NO | `'recruiting'` | 모집 상태 |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |
| `updated_at` | timestamptz | NO | `now()` | 수정일시 (트리거 자동 갱신) |

**status 값:**

| 값 | 설명 |
|----|------|
| `recruiting` | 모집 중 |
| `closed` | 모집 마감 |
| `in_progress` | 진행 중 |
| `completed` | 완료 |
| `canceled` | 취소됨 |

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `sparks_select_authenticated` | SELECT | 인증된 모든 사용자 조회 가능 |
| `sparks_insert_own` | INSERT | `auth.uid() = host_id` |
| `sparks_update_own` | UPDATE | `auth.uid() = host_id` |
| `sparks_delete_own` | DELETE | `auth.uid() = host_id` |

---

## 5. spark_participants

번개 모임 참여자 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `spark_id` | uuid | NO | - | sparks(id) 참조 |
| `user_id` | uuid | NO | - | profiles(id) 참조 |
| `role` | text | NO | `'member'` | `host` / `member` |
| `status` | text | NO | `'requested'` | 참여 상태 |
| `requested_at` | timestamptz | NO | `now()` | 신청 일시 |
| `approved_at` | timestamptz | YES | - | 승인 일시 |
| `canceled_at` | timestamptz | YES | - | 취소 일시 |

**UNIQUE 제약:** `(spark_id, user_id)`

**status 값:**

| 값 | 설명 |
|----|------|
| `requested` | 참여 신청 중 |
| `approved` | 호스트 승인 완료 |
| `rejected` | 호스트 거절 |
| `canceled` | 참여자 취소 |
| `attended` | 운동 참여 완료 (출석) |
| `no_show` | 노쇼 |

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `spark_participants_select_own` | SELECT | 본인 행 또는 해당 spark의 host |
| `spark_participants_insert_own` | INSERT | `auth.uid() = user_id` |
| `spark_participants_update_host_or_own` | UPDATE | 본인 행 또는 해당 spark의 host |

---

## 6. spark_reviews

번개 종료 후 참여자 간 후기 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `spark_id` | uuid | NO | - | sparks(id) 참조 |
| `reviewer_id` | uuid | NO | - | profiles(id) 참조, 작성자 |
| `reviewee_id` | uuid | NO | - | profiles(id) 참조, 후기 대상 |
| `keywords` | text[] | YES | `'{}'` | 후기 키워드 태그 배열 |
| `review_type` | text | NO | `'positive'` | `positive` / `negative` |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |

**UNIQUE 제약:** `(spark_id, reviewer_id, reviewee_id)`

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `spark_reviews_select_authenticated` | SELECT | 인증된 모든 사용자 조회 가능 |
| `spark_reviews_insert_participant` | INSERT | `auth.uid() = reviewer_id` + 해당 spark 참여자(`attended`) 조건 |

---

## 7. challenges

챌린지 마스터 테이블. 관리자가 정의하는 챌린지 항목.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `title` | text | NO | - | 챌린지 제목 |
| `description` | text | YES | - | 챌린지 설명 |
| `challenge_type` | text | NO | - | `exercise` / `spark` / `event` |
| `goal_count` | integer | NO | `1` | 달성 목표 횟수 |
| `reward_xp` | integer | NO | `0` | 완료 시 지급 XP |
| `starts_at` | timestamptz | YES | - | 챌린지 시작일시 |
| `ends_at` | timestamptz | YES | - | 챌린지 종료일시 |
| `is_active` | boolean | NO | `true` | 활성 여부 |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `challenges_select_authenticated` | SELECT | 인증된 모든 사용자 조회 가능 |

---

## 8. challenge_progress

사용자별 챌린지 달성 진행 상태 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `challenge_id` | uuid | NO | - | challenges(id) 참조 |
| `user_id` | uuid | NO | - | profiles(id) 참조 |
| `current_count` | integer | NO | `0` | 현재 달성 횟수 |
| `completed_at` | timestamptz | YES | - | 챌린지 완료 일시 |
| `reward_claimed` | boolean | NO | `false` | 보상 수령 여부 |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |
| `updated_at` | timestamptz | NO | `now()` | 수정일시 (트리거 자동 갱신) |

**UNIQUE 제약:** `(challenge_id, user_id)`

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `challenge_progress_select_own` | SELECT | `auth.uid() = user_id` |
| `challenge_progress_insert_own` | INSERT | `auth.uid() = user_id` |
| `challenge_progress_update_own` | UPDATE | `auth.uid() = user_id` |

---

## 9. notifications

사용자 알림 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | - | profiles(id) 참조 |
| `type` | text | NO | - | 알림 유형 (예: `spark_approved`, `spark_requested`) |
| `title` | text | NO | - | 알림 제목 |
| `body` | text | YES | - | 알림 본문 |
| `related_id` | uuid | YES | - | 관련 리소스 ID (spark_id 등) |
| `read_at` | timestamptz | YES | - | 읽은 일시 (null이면 미읽음) |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `notifications_select_own` | SELECT | `auth.uid() = user_id` |
| `notifications_update_own` | UPDATE | `auth.uid() = user_id` |

---

## 10. reports

사용자 신고 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `reporter_id` | uuid | NO | - | profiles(id) 참조, 신고자 |
| `target_user_id` | uuid | YES | - | profiles(id) 참조, 신고 대상 사용자 |
| `spark_id` | uuid | YES | - | sparks(id) 참조, 신고 대상 번개 |
| `reason` | text | NO | - | 신고 사유 |
| `description` | text | YES | - | 상세 내용 |
| `status` | text | NO | `'submitted'` | 처리 상태 |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |

**status 값:** `submitted` `reviewing` `resolved` `rejected`

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `reports_insert_authenticated` | INSERT | `auth.uid() = reporter_id` |
| `reports_select_own` | SELECT | `auth.uid() = reporter_id` |

---

## 11. device_connections

웨어러블 및 건강 앱 연결 상태 테이블. MVP에서는 UI만 구현.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | - | profiles(id) 참조 |
| `provider` | text | NO | - | 연결 제공자 (예: `apple_health`, `galaxy_watch`) |
| `status` | text | NO | `'disconnected'` | `connected` / `disconnected` |
| `connected_at` | timestamptz | YES | - | 연결 일시 |
| `created_at` | timestamptz | NO | `now()` | 생성일시 |

**UNIQUE 제약:** `(user_id, provider)`

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `device_connections_select_own` | SELECT | `auth.uid() = user_id` |
| `device_connections_insert_own` | INSERT | `auth.uid() = user_id` |
| `device_connections_update_own` | UPDATE | `auth.uid() = user_id` |

---

## 12. terms_agreements

약관 동의 이력 테이블.

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | - | profiles(id) 참조 |
| `terms_type` | text | NO | - | 약관 종류 (예: `service`, `privacy`, `location`, `marketing`) |
| `version` | text | NO | - | 약관 버전 (예: `v1.0`) |
| `agreed_at` | timestamptz | NO | `now()` | 동의 일시 |

**UNIQUE 제약:** `(user_id, terms_type, version)`

### RLS 정책

| 정책명 | 명령 | 조건 |
|--------|------|------|
| `terms_agreements_select_own` | SELECT | `auth.uid() = user_id` |
| `terms_agreements_insert_own` | INSERT | `auth.uid() = user_id` |

---

## 공통 트리거

`update_updated_at_column()` 함수가 아래 테이블의 UPDATE 시 `updated_at`을 자동 갱신한다.

| 트리거명 | 대상 테이블 |
|---------|------------|
| `profiles_updated_at` | profiles |
| `exercise_sessions_updated_at` | exercise_sessions |
| `sparks_updated_at` | sparks |
| `challenge_progress_updated_at` | challenge_progress |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-16 | 최초 작성. 테이블 12개, RLS 정책 30개 생성 완료 |
