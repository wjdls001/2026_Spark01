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

## 0. Figma 1페이지 와이어프레임 기준 구현 우선순위

> 기준 Figma 파일: `스파크-플로우` / Page 1 / node `0:1`  
> 분석일: 2026-06-17  
> 이 섹션은 기존 IA·요구사항과 충돌할 경우 **우선 적용**한다. Claude Code는 아래 화면 순서와 라우팅을 기준으로 구현한다.

### 0.1 Page 1 섹션 구조

| Figma 섹션                | 구현 범위                                                                                              | 우선 라우트                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 로그인/사용자 조사 온보딩 | 소셜 로그인, 약관 동의, 전화번호 인증, 7단계 사용자 조사, 운동 레벨 결과                               | `/login`, `/onboarding/terms`, `/onboarding/phone`, `/onboarding/profile`, `/onboarding/result`                                        |
| 홈                        | 로그인 후 홈, 최초 권한 승인 팝업, 운동 상세 팝업, 번개 상세 탭, 알림 전체/읽지 않음                   | `/home`, `/notifications`, `/exercise/:sessionId`, `/sparks/:sparkId`                                                                  |
| 챌린지                    | 챌린지 메인, 전체/운동/모임/이벤트 탭, 이벤트 상세                                                     | `/challenges`, `/challenges/:challengeId`                                                                                              |
| 번개 모임                 | 지도 탐색, 리스트 탐색, 상세 필터, 참여/운영 상세, 내 번개, 번개 생성, 후기                            | `/sparks`, `/sparks/list`, `/sparks/filter`, `/sparks/:sparkId`, `/sparks/new`, `/sparks/:sparkId/review`                              |
| 마이페이지                | 프로필/운동관리/활동관리 탭, 프로필 관리, 피드 상세, 운동 통계, 설정, 기기/건강앱 연결, 문의, 회원탈퇴 | `/mypage`, `/mypage/profile`, `/mypage/workout`, `/mypage/activity`, `/mypage/settings`                                                |
| 운동시작                  | 혼자 운동, 같이 운동, 루틴 불러오기, 종목 직접 입력, 목표 수정, 세션, 종료/결과                        | `/exercise`, `/exercise/solo/setup`, `/exercise/solo/session`, `/exercise/result`, `/exercise/spark/select`, `/exercise/spark/session` |

### 0.2 Figma 기준 핵심 변경점

1. **소셜 로그인 버튼은 Apple / Google / Kakao 순서**로 구현한다. 기존 문서의 Naver 버튼은 구현 대상에서 제외한다.
2. 로그인 후 플로우는 `약관 동의 → 전화번호 인증 → 사용자 조사 7단계 → 운동 레벨 결과 → 홈` 순서다.
3. 온보딩 7단계는 다음 순서를 고정한다.
   1. 기본 정보 입력: 닉네임, 나이, 성별
   2. 운동 목표
   3. 운동 성향 태그
   4. 좋아하는 운동 선택
   5. 자주 하는 운동 선택
   6. 주간 운동 빈도
   7. 회당 평균 운동 시간
4. 홈 최초 진입 시 권한 승인 팝업을 표시한다. 권한 항목은 푸시 알림, 건강 데이터 접근, 위치 데이터 접근이다.
5. 번개 모임 탭의 기본 화면은 **지도 탐색**이다. 리스트는 `리스트로 확인` 액션으로 전환한다.
6. 번개 탐색 필터는 상단 빠른 필터 `전체 / 내 나이 / 내 레벨 / 내 성별`과 상세 필터 `거리 설정`을 제공한다.
7. 운동 시작 화면은 별도 긴 폼이 아니라 **종목 선택 + 목표 입력을 한 화면에서 처리**한다.
8. 혼자 운동은 종목군에 따라 입력 UI를 분기한다.
   - 걷기/러닝/자전거: 거리, 시간, 경로/지도, 목표 수정
   - 헬스/홈트: 루틴/세트 중심 입력, 목표 수정
   - 종목 직접 입력: 직접 입력 팝업 후 동일한 목표 입력 화면으로 합류
9. 같이 운동은 승인된 번개가 있을 때 `모임장 화면`과 `모임원 화면`을 구분한다.
   - 모임장: 미접속 멤버에게 알림 보내기, 운동 시작
   - 모임원: 모임 접속 상태 확인, 운동 시작 대기 또는 참여
10. 운동 세션 화면은 Figma에 하단 탭 영역이 포함되어 있으므로 MVP에서는 세션 중에도 하단 탭을 유지한다. 단, 세션 이탈 시 확인 모달을 띄운다.
11. 운동 종료 후 결과 화면은 `열심히 땀흘린 기록을 남겨보아요` → `OO님, 해낼줄 알았어요!` 흐름으로 기록 저장과 보상 피드백을 제공한다.
12. 마이페이지는 단일 프로필 페이지가 아니라 `프로필 / 운동 관리 / 활동 관리` 3탭 구조로 구현한다.
13. 설정에는 프로필 공개, 소셜 계정, 위치 설정, 기기 연결, 건강 앱 연결, 약관, 고객센터/문의, 회원탈퇴 화면을 포함한다.

### 0.2.1 사용자 조사 상세 구현 기준 (2026-06-18)

- 사용자 조사 화면은 390px 모바일 프레임과 흰 배경을 사용하며, 상단 헤더·`Step n of 7`·퍼센트·Purple 진행 바를 공통으로 유지한다.
- 와이어프레임의 구조는 유지하되 색상과 컴포넌트는 디자인 시스템을 우선한다. 주요 CTA는 Lime, 선택/진행/보조 CTA는 Purple, 선택 배경은 Soft Purple을 사용한다.
- 1단계는 닉네임 2~10자, 닉네임 중복 확인, 연령대 6구간, 성별 `남성/여성/이외`를 한 화면에서 입력한다.
- 닉네임 중복 확인은 실제 `profiles.nickname`을 조회하고, 사용 가능/중복 결과를 각각 전용 팝업으로 안내한다.
- 성별 `이외` 선택 후 진행하면 맞춤 추천 정확도 안내 팝업을 표시하고 `그대로 진행/성별 변경하기`를 제공한다.
- 운동 목표는 `다이어트/벌크업/체력 증진·건강 유지` 중 하나를 선택한다.
- 운동 성향과 좋아하는 운동은 복수 선택 및 10자 이내 직접 입력을 지원한다.
- 자주 하는 운동은 `러닝/사이클링/웨이트/홈 트레이닝` 또는 직접 입력 중 하나를 선택한다.
- 운동 빈도는 `거의 안 함/주 1~2회/주 3~4회/주 5회 이상`, 평균 운동 시간은 `30분 미만/30~60분/60~90분/90분 초과`를 사용한다.
- 7단계 완료 후 응답을 기반으로 운동 레벨을 계산하고, 결과 화면에 레벨·운동 취향·빈도 요약과 `SPARK 시작하기` CTA를 표시한다.
- 현재 DB에 전용 온보딩 컬럼이 없으므로 운동 목표·연령대·자주 하는 운동·빈도·평균 시간·직접 입력 운동은 `workout_traits`에 접두어가 있는 문자열로 저장한다.
- 로그인 분기는 `profiles` 행 존재가 아니라 `workout_traits`의 필수 온보딩 마커 4종 존재 여부로 완료 상태를 판단한다. 기존 프로필이 있어도 마커가 없으면 온보딩으로 이동한다.

### 0.2.2 홈·마이페이지·프로필 관리 프레임 기준 (2026-06-18)

- 첨부 와이어프레임은 정보 구조와 섹션 순서만 참고하고, 시각 표현은 SPARK 디자인 시스템을 우선한다.
- 홈은 `헤더/알림 → 준비 메시지 → 성장 요약 → 운동 시작 CTA → 루틴 → 추천 번개 → 빠른 액션 → 오늘 현황 → 최근 기록 → 탐색 배너` 순서다.
- 마이페이지 프로필 탭은 프로필 요약, 선호 운동, 운동 성향, 운동 요약, 기록 피드 순서로 구성한다.
- 마이페이지 상단 프로필 카드 전체를 누르면 `/mypage/profile`로 이동하며 별도 프로필 편집 메뉴는 두지 않는다.
- 프로필 관리는 이미지/레벨/EXP, 닉네임 중복 확인, 성별, 자기소개, 운동 성향, 선호 운동을 편집한다.
- 운동 성향과 선호 운동의 `+ 추가`는 복수 선택 서브화면과 10자 이내 직접 입력을 지원한다.

### 0.2.3 공통 배경·캐릭터·운동 관리 기준 (2026-06-18)

- 모든 주요 페이지와 오버스크롤 영역은 운동 시작 화면과 동일한 White → Soft Purple → Soft Lime 그라데이션 배경을 사용한다.
- 앱 콘텐츠 하단 padding과 고정 내비게이션 높이를 일치시켜 최하단 스크롤 시 흰 여백이 보이지 않게 한다.
- 사용자 프로필은 실제 이미지가 없을 때 공통 `SparkCharacter` 캐릭터를 사용한다. 캐릭터는 번개 테마로 디자인되어 있다(몸통이 zigzag 번개 실루엣, 2026-06-21 — 상세 스펙은 [docs/design/design-system.md](docs/design/design-system.md) "마스코트 캐릭터" 참고).
- 마이페이지 신뢰도는 Heart 아이콘과 점수로 표시한다. 기본 신뢰도(`profiles.trust_score` 기본값)는 70이다.
- SPARK 레벨 등급(Lv.1~100)은 5단계로 고정한다: 비기너 Lv.1~19, 챌린저 Lv.20~39, 러너 Lv.40~69, 마스터 Lv.70~89, 스파크 Lv.90~100. 숫자 레벨/등급 표시가 필요한 화면은 `src/lib/utils/level.ts`의 `getLevelTier`/`levelNumberFromExerciseLevel`을 사용해 일관되게 계산한다(DB에 아직 숫자 레벨 컬럼이 없어 `exercise_level`에서 대표값을 매핑한다).
- 운동 성향 태그에는 순번을 표시하지 않고 선호 운동에만 선택 순번을 표시한다.
- 운동 기록 카드와 운동 상세에는 공통 `WorkoutMapPreview` 지도/경로 시각화를 사용한다.
- 운동 관리는 `빠른 기록 / 기간별 히스토리 / 통계` 3탭이며 기간별 히스토리는 `주간 / 월간 / 연간` 전환과 이전/다음 기간 이동을 지원한다.
- 주간/월간 달력과 연간 차트는 데이터가 부족해도 임의의 운동 데이터를 표시하며 화살표로 날짜가 실제 변경되어야 한다.
- 운동 상세는 운동 종류에 따라 러닝 거리, 헬스 세트 수, 배드민턴 경기 수와 추가 상세 필드를 분기한다. 번개운동에는 함께한 사람을 표시한다.

### 0.2.4 iPhone 17 프레임·히스토리 지표·Bottom Sheet 기준 (2026-06-18)

- 모바일 앱 최대 프레임은 iPhone 17급 화면을 고려해 440px로 확장하고 `viewport-fit=cover`와 safe area를 적용한다.
- 마이페이지 `운동 관리` 탭을 누르면 중간 요약 없이 `/mypage/workout`으로 이동해 `빠른 기록/기간별 히스토리/통계` 전환 UI가 즉시 보인다.
- 기간별 히스토리의 주간·월간·연간 모두 거리, 시간, 칼로리, 페이스를 제공한다.
- 연간 뷰는 달력 대신 1~12월 월별 운동 횟수 카드 그리드를 우선 표시한 뒤 거리·시간·칼로리·페이스를 표시한다.
- 운동 관리 최초 진입 기본값은 첨부 프레임과 동일하게 `기간별 히스토리/연간`이다.
- 지도 위 검은 정보 영역 등 보조 상세 패널은 화면 하단에서 올라오는 `spark-bottom-sheet` 패턴을 사용한다.
- Bottom sheet는 최대 높이 78dvh, 상단 28px radius, 내부 스크롤, safe-area 하단 padding을 사용한다.
- 중앙 팝업은 `spark-modal-panel`을 사용해 화면 너비와 높이를 벗어나지 않으며 내용이 길면 내부 스크롤한다.

### 0.2.5 활동 관리 기준 (2026-06-18)

- 마이페이지 `활동 관리` 탭은 `/mypage/activity`로 즉시 이동한다.
- 활동 관리는 `참여한 번개/개설한 번개` 탭과 제목 검색, 최신순/오래된순 정렬을 제공한다.
- 개설한 번개는 `전체/모집중/마감` 상태 필터를 추가로 제공한다.
- 참여 카드는 일반 번개 상세, 개설 카드는 운영 관리 상세로 이동한다.

### 0.2.6 와이어프레임 8화면 정밀 반영 (2026-06-18)

> 첨부된 8개 스크린샷(홈/번개 지도/프로필/운동 시작·활동/챌린지/번개 운동 세션/운동 관리/운동 종료 결과)을 기준으로 화면 구조와 디자인 토큰을 다시 맞춘 패스. 라우팅과 데이터 연결은 기존 구조를 유지하고 레이아웃만 교체했다.

- **홈(`HomePage`)**: 인사 문구 아래 `연속 N일`/`총 운동 N회` 칩 2개, 다가오는 번개 3건을 2x2 그리드(날짜+화살표+장소+시간) + `새로운 모임 찾기` 카드로 표시, 추천 모임은 캐러셀이 아니라 단일 풀와이드 배너, 자주 하는 루틴은 가로 스크롤 선택형 칩, 최근 기록은 2열 카드 그리드, 최하단 `다른 목표 도전하기` CTA 순서로 재배치했다.
- **번개 지도(`SparksPage`)**: 기본 화면을 다크 지도(46dvh) + 검색바 오버레이 + 콜아웃 카드 + `리스트로 확인` 버튼 + 우하단 FAB(번개 생성/내 번개 모임 펼침 메뉴)로 바꾸고, 지도 아래 라운드 처리된 흰 패널에 빠른 필터·종목 필터·번개 리스트를 이어 붙였다. `/sparks/list`는 같은 데이터를 쓰는 전체화면 리스트로 유지한다.
- **마이페이지 프로필 탭(`MyPage`)**: 총 운동 횟수/연속일/레벨 3분할 통계 박스를 제거하고, `선호 운동` → `운동 성향` → `운동 기록`(이전/다음 화살표 헤더 + 6칸 그리드) 순서로 단순화했다.
- **운동 시작(`ExercisePage`)**: 정적 선택 화면 대신 오늘 참여할 번개(있을 때만, `참여 대기` 상태 표시) → `함께 할 모임 찾기`/`혼자 목표 설정` 2열 액션 → 내가 개설한 번개 모임(가장 빠른 모집중 항목, 없으면 빈 상태 문구) → `새로운 모임 생성하기`/`번개 모임 관리하기` 2열 버튼 순서의 동적 화면으로 바꿨다. 데이터는 `fetchMyParticipations`/`fetchMySparks`를 그대로 재사용한다.
- **챌린지 메인(`ChallengesPage`)**: 상단에 보조용 날짜 스트립을 추가하고, 진행 배너를 단순 바 대신 "오늘도 챌린지 진행중!" + 퍼센트 + 6단계 경로형 도트 그래픽 + 트로피로 바꿨다. 탭 위에 `챌린지 리스트` 보조 헤더를 추가했다.
- **번개 운동 세션(`SparkExerciseSessionPage`)**: 다크 지도를 전체 화면으로 깔고 타이머를 중앙에 오버레이, 참여자 페이스 리스트·거리/칼로리 입력은 기본적으로 숨겨두고 화면 하단 peek 핸들(`참여자 보기 ▲`)을 탭해야 `spark-bottom-sheet` 패턴으로 아래에서 올라오는 모달로 열리게 바꿨다. **검은 배경의 보조 정보 패널은 항상 인라인으로 깔아두지 않고, 반드시 사용자가 슬라이드를 올리는 액션 이후에만 나타나야 한다** — 이 원칙은 다른 화면에서 검은/다크 배경의 상세 정보 패널을 추가할 때도 동일하게 적용한다.
- **운동 관리(`MyExercisePage`/`ExerciseSessionDetailPage`)**: 기존 구현이 이미 빠른 기록(종목 pill + 운동명 + MM.DD/시간/장소)·기간별 히스토리(주/월/연 세그먼트, 주간 요일 점표시, 월간 달력 점표시, 연간 월별 횟수 그리드, 거리/시간 차트 + 칼로리/페이스 카드)·통계 탭, 운동 상세(지도 + 종목별 3분할 지표 + 상세 표 + 메모 + 번개운동 시 함께한 사람) 요구사항과 거의 일치해 차트 "이전 평균" 범례 표기와 날짜 zero-padding만 보완했다.
- **운동 종료 결과(`ExerciseResultPage`)**: 다크 풀스크린 보상 화면을 라이트 그라데이션 배경으로 전면 교체했다. `{닉네임}님, 오늘도 해냈어요!` 인사 → `SparkCharacter` 원형 배지(SPARK Level N) → 소모 칼로리/목표 달성률 2분할 카드 → `NEXT LEVEL` EXP 진행바 → `리워드 받기`(+XP) / `친구에게 공유하기` 버튼 순서로 재구성했다. 이미지 기준 하단 탭이 보이므로 라우트를 `AppLayout`(바텀내비 유지) 그룹으로 이동했다(`/exercise/result`).
- **공통 원칙**: 검은/다크 배경의 보조 상세 패널(지도 위 정보, 세션 중 참여자 정보 등)은 예외 없이 기본 숨김 + 슬라이드업 트리거로 구현한다. 인라인으로 항상 보이는 다크 섹션(예: 홈 하단 프로모션 배너처럼 원래부터 고정 배치된 섹션)은 이 규칙의 대상이 아니다.

### 0.2.7 번개 지도/필터 사용자 피드백 반영 (2026-06-18)

- 상세 필터 거리 기본값을 10km → **5km**로 변경했다(`getFilterRadiusKm` 기본값, 슬라이더 범위도 0~5km).
- ~~지도 위 핀을 클릭해도 모임 상세 모달이 뜨지 않는다.~~ **(2026-06-21 변경, 0.2.8 참고)** 핀 클릭은 작은 요약 카드(제목/장소/시간/인원 + `모임 상세보기` 버튼)를 띄우고, 다른 곳을 누르면 닫힌다. 풀스크린 리스트는 여전히 `리스트로 확인` 핸들을 탭했을 때만 올라온다(`SparksPage`의 `listOpen` 상태).
- 상세 필터(≡ 아이콘)는 페이지 이동이 아니라 `SparkFilterSheet` 바텀시트 모달로 열리며 거리/카테고리(전체·러닝·걷기·사이클·직접입력)/시간(오늘·이번 주·날짜 설정) 옵션을 제공하고 초기화/적용 버튼이 있다. `/sparks/filter` 라우트는 동일 컴포넌트를 페이지 형태로 감싸 직접 진입 시에도 동작한다.
- 지도 화면은 전체화면 지도 위에 검색바·빠른 필터 chip·현재위치 버튼·FAB(번개 생성/내 번개 바로가기)를 오버레이하고, 리스트는 기본적으로 숨겨진 풀스크린 시트로만 노출한다. 시트 안에는 빠른 필터 + 종목 필터 + 카드 리스트(시간/장소·인원/레벨·성별·나이 chip/소개 2줄)가 있다. ~~하단 고정 다크 배너(`새로운 운동을 찾아볼까요?`)~~는 2026-06-21에 UX 사유로 제거했다(0.2.8 참고).
- 운동 탭(`ExercisePage`)은 "오늘 참여할 번개"/"내가 개설한 모임" 등 동적 섹션을 **제거**하고, 다시 `함께 할 모임 찾기` / `혼자 운동하기` 2개 카드만 보이는 단순 선택 화면으로 되돌렸다(0.2.6의 동적 버전은 폐기).
- `MOCK_EXERCISE_SESSIONS`에 종목·기간이 다양한 더미 운동 기록 9건을 추가(자전거·배드민턴·수영·등산·요가·헬스·테니스 등, 최근 2일~75일 전)해 운동 관리 화면의 히스토리/통계가 비어 보이지 않게 했다.
- `SparkManagePage`(번개 운영 관리)에 **수정**(번개 이름/장소/일시/소요시간/모집인원/소개를 모달로 편집, `updateSpark`)과 **삭제**(`deleteSpark`, `window.confirm` 가드 후 `/mypage/activity`로 이동) 기능을 추가했다. `features/sparks/api.ts`에 `updateSpark`/`deleteSpark` 신규.

### 0.2.8 버그 수정 + 더미데이터/테스트 모드 보강 (2026-06-21)

**번개 지도/리스트**

- `리스트로 확인` 버튼을 하단 탭바 바로 위(`bottom-3`)로 옮기고 텍스트만 남겼다(화살표 아이콘 제거). 풀스크린 리스트 시트의 `지도로 접기` 텍스트/아이콘 버튼은 제거하고, 상단 drag handle(pill)을 탭하면 닫히도록 통합했다.
- 빠른 필터 라벨을 `내 나이/내 레벨/내 성별` → `나이/레벨/성별`로 줄였다(지도 오버레이·리스트 시트 공통).
- 지도 마커: `MOCK_NEARBY_SPARKS`(`src/lib/mockData.ts`) 4건을 추가해 기준 위치(`REFERENCE_LOCATION`, 서울시청) 동서남북 약 4km 지점에 분산 배치했다(겹쳐 보이지 않도록 간격 확보). 지도 중심도 임의 좌표(한강공원) 대신 `REFERENCE_LOCATION`으로 변경. 마커 클릭 시 작은 요약 카드(제목/장소/시간/인원 + `모임 상세보기`)가 뜨고 다른 곳을 누르면 닫힌다(`MapView`의 pin 클릭은 `stopPropagation` 처리).
- 종목 필터 chip 행이 가로로 넘칠 때 마우스 드래그로도 스크롤되도록 `src/lib/utils/useDragScroll.ts` 훅을 추가해 `SparksPage`의 빠른 필터/종목 필터 3곳에 적용했다(터치는 `touch-pan-x`로 이미 동작, 데스크톱 마우스 드래그가 안 되던 문제 보강).
- 리스트 시트 하단의 `새로운 운동을 찾아볼까요?` 다크 배너를 제거했다(UX 사유로 불필요 판단).
- 번개 상세(`SparkDetailPage`) 하단의 `내가 개설한 번개` pill을 제거했다 — 헤더의 `관리` 버튼으로 이미 충분해 중복이었다. 호스트이고 보여줄 내용이 없으면 하단 고정 바 자체를 렌더링하지 않는다.
- 참여자 그리드(`SparkDetailPage`)가 가로로 넘치던 것을 `grid grid-cols-4`로 고정해 화면 안에서 줄바꿈되게 했다.

**번개 관리(`SparkManagePage`)**

- `fetchSparkById`가 빈 값을 반환할 때 `ALL_MOCK_SPARKS` + `buildMockParticipants` 더미 참여자로 폴백하지 않아 mock 번개 관리 화면이 항상 비어 있던 문제를 고쳤다.
- **테스트 구현 단계이므로 `spark.host_id !== user.id` 화면 단 접근 제한 가드를 제거했다.** 누구나 관리 화면에 들어가 모집 마감/운동 시작/번개 취소/삭제, 참여자 승인·거절·취소(제거) 기능 UI를 모두 사용할 수 있다. **이는 프론트엔드 화면 가드만 제거한 것이고, Supabase RLS 정책(13절, 호스트만 sparks/spark_participants 변경 가능)은 그대로 유지된다** — 실제 DB 번개에 다른 사용자가 접근하면 UI는 보이지만 실제 update/delete 호출은 RLS에 막혀 실패한다(mock 번개는 RLS 대상이 아니라 그대로 동작). 실제 호스트 권한 검증 UI가 필요해지면 이 가드를 다시 추가해야 한다(현재는 의도적으로 비활성화된 상태).

**같이 운동(모임장/모임원/세션)**

- mock 번개의 `participants`가 `[{count:N}]` 요약 형태라 모임장 대기 화면(`SparkExerciseHostReadyPage`)의 모임원 목록, 세션 화면의 참여자 리스트가 항상 비어 보였다. `buildMockParticipants(spark)`(`src/lib/mockData.ts`)로 호스트+멤버 더미 참여자(프로필·역할·상태·신청/승인 시각 포함)를 만들어 `SparkDetailPage`/`SparkExerciseSessionPage`/`SparkExerciseHostReadyPage`/`SparkManagePage`의 mock 폴백에 공통으로 사용한다.
- `SparkExerciseSessionPage`의 `참여자 보기` peek handle에서 화살표 아이콘(▲)을 제거하고 텍스트만 남겼다.

**전역 스크롤/레이아웃 버그**

- `#root { overflow-x: hidden }`이 CSS 스펙상 `overflow-y`를 암묵적으로 `auto`로 강제해, `#root`가 의도치 않은 스크롤 컨테이너가 되면서 `AppLayout`(하단 탭바) 밖의 모든 페이지(`SparkDetailPage`, `SparkManagePage`, 온보딩 등)에서 `sticky` 헤더가 스크롤 시 고정되지 않고 그냥 같이 스크롤되어 사라지는 버그가 있었다. 가로 스크롤 방지를 `#root`가 아니라 `html`로 옮겨서 해결했다(`src/styles/globals.css`). 앞으로 비슷한 `overflow-x`/`overflow-y` 조합을 추가할 때는 이 상호작용을 반드시 의식할 것.
- `.spark-bottom-sheet`가 존재하지 않는 CSS 변수(`var(--color-card-black)`, `var(--shadow-bottom-sheet)`)를 참조해 배경이 투명하게 보이고 그림자가 적용되지 않던 버그를 실제 변수(`--color-spark-card`, `--shadow-spark-sheet`)로 교체해 고쳤다. 디자인 토큰 명명 불일치는 [docs/design/design-system.md](docs/design/design-system.md) 3절 안내 참고.

**프로필/레벨/신뢰도**

- `MyPage`/`MyProfilePage`의 `선호 운동` 표시가 실제 DB 종목 UUID를 이름으로 변환하지 못해 UUID 원문이 그대로 보이던 버그를 고쳤다 — 두 페이지 모두 실제 `fetchSports()` 결과를 우선 조회하도록 수정.
- SPARK 레벨 등급(Lv.1~100, 5단계: 비기너/챌린저/러너/마스터/스파크)을 `src/lib/utils/level.ts`로 통일했다. 화면마다 제각각이던 `LV.01/05/10`, `LV.30` 하드코딩, `92/45/12` 임의 매핑을 모두 `getLevelTier`/`levelNumberFromExerciseLevel` 호출로 교체(`OnboardingResultPage`, `MyPage`, `MyProfilePage`, `ExerciseResultPage`).
- 기본 신뢰도(`profiles.trust_score`)를 50 → **70**으로 변경했다. Supabase 마이그레이션(`update_default_trust_score_to_70`)으로 컬럼 기본값과 기존 데모 프로필 값을 모두 70으로 맞췄고, 클라이언트 mock 데이터(`MOCK_PROFILES`, `MOCK_USER_PROFILE`)와 fallback 리터럴(`?? 87` 등)도 `DEFAULT_TRUST_SCORE` 상수로 교체했다.

### 0.2.9 캐릭터/로고 자산 반영 (2026-06-21)

- `SparkCharacter`(`src/components/common/SparkCharacter.tsx`)는 사용자가 제공한 이미지를 쓴다. 처음엔 황금 3D 번개 캐릭터 사진으로 교체했다가, 이후(2026-06-21 같은 날 후속 세션) **귀여운 플랫 일러스트 번개 마스코트**(`src/assets/spark-character.png`, 원본 ChatGPT 생성 이미지에서 체크보드 배경을 Pillow 플로드필로 제거해 투명 PNG로 정리)로 다시 교체했다. `mood` prop은 표정 변화가 더는 없어 API 호환용으로만 유지한다. 상세 스펙은 [docs/design/design-system.md](docs/design/design-system.md) "마스코트 캐릭터" 참고.
- 실제 로고 이미지(`src/assets/spark-logo.png`, 사용자 제공)를 추가하고, 기존에 ⚡ 이모지/임의 SVG로 대체 표현하던 모든 로고 자리를 이 이미지로 교체했다: `LoginPage`(대형 로고), `HomePage`의 `SparkLogoMark`(헤더 아이콘), `OnboardingTermsPage`/`OnboardingPhonePage`의 `⚡ SPARK` 워드마크, `index.html` 파비콘. 새로 로고가 필요한 화면은 이 파일을 import해서 재사용하고 이모지나 새 SVG로 대체하지 않는다.

### 0.2.10 유저 프로필/소셜 기능 + 네이티브 다이얼로그 제거 (2026-06-21 대규모 세션)

**공통 인프라**

- `window.confirm`/`window.alert`는 데스크톱에서 OS 다이얼로그가 모바일 UI를 깨고 끼어드는 문제가 있어 전부 제거했다. 대신 `src/components/common/ConfirmModal.tsx`(확인/취소 인앱 팝업)와 `Toast.tsx`(짧은 완료 메시지, `src/lib/utils/useToast.ts`로 상태 관리)를 만들어 전체 코드베이스(설정 페이지들, 운동 종료, 번개 삭제/취소 등)에 적용했다. **새로운 확인/알림이 필요하면 이 두 컴포넌트를 재사용하고 절대 `window.confirm`/`alert`를 쓰지 않는다.**
- `SparkCharacter`에 `ring` prop(`'lime' | 'purple' | 'none'`)을 추가해 원형 캐릭터에 굵은 네온 테두리를 표시할 수 있게 했다. 모임장·내 프로필·참여 완료 멤버처럼 강조가 필요한 자리는 `ring="lime"`을 쓴다. 캐릭터는 항상 `rounded-full`이며 `object-contain`으로 전체가 잘리지 않게 표시한다.
- 신뢰도 BPM(하트) 탭 시 설명 팝업을 보여주는 `src/components/common/TrustScoreInfoModal.tsx`를 추가했다(운동 횟수/참여 모임/노쇼 횟수/모임 매너 — DB에 집계 컬럼이 없어 현재는 더미 값).
- 운동 실력 등급(`exercise_level`) 한글 표기와 레벨 숫자/등급명 계산을 `src/lib/utils/level.ts`(`exerciseLevelLabel`, `getLevelTier`, `levelNumberFromExerciseLevel`)로 통일했다. 새 화면에서 운동 레벨을 표시할 때는 항상 이 헬퍼를 쓰고 화면마다 다른 매핑 객체를 새로 만들지 않는다.

**신규 페이지/라우트**

- `/users/:userId`(`src/pages/mypage/UserProfilePage.tsx`) 신규 — 다른 유저의 공개 프로필(캐릭터, 나이, 성별, 레벨 등급+숫자, 운동 실력 라벨, 신뢰도 BPM, 운동 성향 태그, 선호 운동 태그). 번개 상세/관리 화면의 참여자 리스트에서 프로필을 탭하면 이 페이지로 이동한다.

**번개 상세(`SparkDetailPage`)**

- 참여자 리스트를 4열 그리드 아이콘에서 세로 리스트로 바꿔 캐릭터+닉네임+(모임장 배지)+나이/성별/운동레벨을 한 줄에 보여주고, 행을 탭하면 `/users/:userId`로 이동한다. 모임장은 `ring="lime"`로 표시하고, 별도 "모임장" 카드 섹션은 제거해 참여자 리스트에 통합했다.
- 참여 신청 시 "신청이 완료되었습니다" Toast를 띄운다(`applyToSpark` 성공 직후).
- 참여 상태가 `requested`(승인 대기)일 때 하단에 "모임장 승인 전에만 신청을 취소할 수 있어요" 안내 + "참여 신청 취소" 버튼을 추가했다. 누르면 `ConfirmModal`("참여 신청을 취소할까요? / 돌아가기 / 신청취소")이 뜨고 확정 시 `cancelParticipation`(`features/sparks/api.ts` 신규) 호출 후 Toast로 안내한다.
- `fetchSparkById`의 참여자 `profile` select에 `gender`, `birth_year`를 추가했다(나이/성별 표시용).

**번개 운영 관리(`SparkManagePage`)**

- 상단 "모임 상세요약" 카드 + "신청관리" 버튼(대기 인원 수 배지)으로 구조를 바꿨다. 신청관리를 누르면 바텀시트로 대기 중인 신청자 리스트(승인/거절 버튼)가 열린다.
- 거절 버튼은 거절 사유 입력 팝업을 띄우고, 제출하면 `updateParticipantStatus(id, 'rejected')`를 호출해 신청자 리스트에서 사라진다(거절 사유 자체는 `spark_participants`에 컬럼이 없어 현재 DB에 저장되지 않는다 — 필요해지면 컬럼 추가 TODO).
- 승인 버튼을 누르면 바로 "참여 확정" 리스트로 이동한다. 참여 확정 리스트의 각 행도 탭하면 `/users/:userId`로 이동한다.
- 번개 삭제는 `ConfirmModal`로 교체했다(기존 `window.confirm` 제거).

**같이 운동 — 모임장/모임원 준비 화면**

- `SparkExerciseHostReadyPage`: 모임원별 개별 "알림 보내기" 버튼을 없애고, 헤더 우측에 종 모양 아이콘 하나로 모임원 전체에게 알림을 보내는 방식으로 바꿨다(Toast로 전송 안내). 본문에는 "n/m 참여중" 배지와 `ring="lime"` 캐릭터 리스트를 보여준다.
- `SparkExerciseMemberReadyPage`: 기존 모래시계 아이콘 단독 화면에서, 모임장 화면과 동일한 "모임원 준비 현황"(n/m 참여중 + 네온 테두리 캐릭터 리스트)을 추가해 두 화면의 정보 구조를 통일했다.
- 두 화면 모두 `buildMockParticipants`로 만든 더미 참여자가 mock 번개 폴백에 채워진다.

**운동 종료 후기(`SparkReviewPage`, `/sparks/:sparkId/review`)**

- 참여자 카드에 캐릭터 아바타를 쓰고, 프로필 영역을 탭하면 키워드 후기 모달(8개 고정 키워드: 열정적이에요/페이스 잘 맞춰줘요/포기를 모르는 끈기/시간 약속 칼같아요/안전하게 운동해요/말 걸기 편해요/배려심 있어요/분위기 메이커예요)이 뜬다. 카드 우측의 별도 "신고" 버튼은 신고 사유 입력 팝업(`reportUser`, `features/sparks/api.ts` 신규 → `reports` 테이블 insert)을 띄운다.
- 하단 버튼을 "후기 남기기"에서 "후기 저장하기"로 바꾸고, `SparkExerciseSessionPage`의 종료 흐름을 `/exercise/result`로 직행하던 것에서 **반드시 이 후기 화면을 거치도록** 변경했다(`navigate(/sparks/:id/review, { state: 운동기록 })` → 후기 저장 후 같은 state로 `/exercise/result`로 이동).

**번개 생성(`SparkNewPage`/`SparkNewConfirmPage`)**

- 모집 인원(이미 기본값 있었음)·운동 레벨 최소값·참여 가능 나이(`age_min`/`age_max`, 신규 입력 필드)를 필수값으로 만들었다(`handleNext` 검증 추가, 운동 레벨 select 기본 옵션을 "제한 없음"에서 "선택"으로 바꿔 명시적 선택을 요구). `createSpark` 호출과 확인 화면 요약에도 나이 값을 반영했다.

**홈(`HomePage`)**

- "추천 모임"을 단일 배너 1개에서 가로 스크롤 카드 리스트로 바꾸고(`useDragScroll`로 마우스 드래그 지원), `MOCK_NEARBY_SPARKS`를 합쳐 데이터가 적어도 스크롤이 발생하도록 했다.
- "자주 하는 루틴 추천" chip과 "최근 기록" 카드에 아이콘/이니셜 대신 `SparkCharacter`를 넣었다.
- 내 프로필 아바타(헤더 옆 작은 원)에 `ring="lime"` 네온 테두리를 적용했다.

**운동 관리 차트(`MyExercisePage`)**

- 기간 이전/다음 화살표를 눌러도 거리/시간 차트, 칼로리/페이스, 연간 월별 횟수 그리드 값이 전혀 바뀌지 않던 버그를 고쳤다. `cursor`(연/월/주)를 시드로 한 결정적 더미값 생성기(`seededValues`, `periodSeed`)를 추가해 화살표를 누를 때마다 다른(하지만 같은 날짜로 돌아오면 항상 같은) 값이 보이게 했다.

**그 외**

- `docs/database/schema.md`의 `spark_participants.profile` select에 `gender`/`birth_year`가 추가된 것을 반영(스키마 자체는 기존 컬럼 그대로, select 범위만 확장).
- "번개 만들기 버튼 클릭 후 화면이 하단 탭에 가려진다"는 피드백은 `/sparks/new`, `/sparks/new/confirm` 두 화면을 끝까지 스크롤해 직접 확인했지만 재현되지 않았다(둘 다 `AppLayout` 바깥의 독립 라우트라 하단 탭 자체가 렌더되지 않음). 사용자가 다시 보게 되면 정확히 어느 화면/스크롤 위치인지 스크린샷을 받아서 재조사할 것.

### 0.3 화면 구현 순서

Claude Code는 한 번에 전체를 만들기보다 아래 순서로 구현한다.

```txt
1. 공통 모바일 레이아웃 + 하단 탭
2. 로그인/약관/전화번호 인증/온보딩 7단계/결과
3. 홈 + 권한 팝업 + 알림
4. 번개 지도 탐색 + 리스트 전환 + 상세 + 생성
5. 운동 시작: 혼자 운동 전체 플로우
6. 운동 시작: 같이 운동 모임장/모임원 플로우
7. 마이페이지 3탭 + 운동 관리/활동 관리
8. 챌린지 메인 + 이벤트 상세
9. 설정/기기 연결/문의/회원탈퇴
```

### 0.4 Figma 화면명 → 컴포넌트명 권장 매핑

| Figma 화면명                                | React 컴포넌트                 |
| ------------------------------------------- | ------------------------------ |
| 소셜로그인-로그인 시작                      | `LoginPage`                    |
| 소셜로그인-약관 동의 및 프로필 확인         | `TermsAgreementPage`           |
| 소셜로그인-전화번호 인증                    | `PhoneVerificationPage`        |
| 사용자조사-기본 정보 입력                   | `OnboardingBasicInfoStep`      |
| 사용자조사-운동목표                         | `OnboardingGoalStep`           |
| 사용자조사-운동 성향 조사                   | `OnboardingTraitStep`          |
| 사용자조사-좋아하는 운동 선택               | `OnboardingFavoriteSportsStep` |
| 사용자조사-자주하는 운동 선택               | `OnboardingFrequentSportStep`  |
| 사용자조사-운동 빈도 조사                   | `OnboardingFrequencyStep`      |
| 사용자조사-평균 운동 시간                   | `OnboardingDurationStep`       |
| 운동 레벨 결과                              | `OnboardingResultPage`         |
| 홈 - 로그인 후 - 화면                       | `HomePage`                     |
| 홈-권한 승인 팝업-처음 로그인 했을때만 표시 | `PermissionPromptModal`        |
| 알람창-전체보기 / 읽지않음                  | `NotificationsPage`            |
| **_ 번개 위치 지도 _** / 번개 위치 지도     | `SparksMapPage`                |
| 번개 리스트                                 | `SparksListPage`               |
| 지도 상세 필터 / 리스트 상세 필터           | `SparkFilterSheet`             |
| 번개 이름, 운동 종류 입력                   | `SparkCreateStepPage`          |
| 가입 입력 확인                              | `SparkCreateConfirmPage`       |
| 참여한 번개 상세 페이지                     | `JoinedSparkDetailPage`        |
| 운영중 번개 상세 페이지                     | `HostedSparkDetailPage`        |
| 운동 종료 및 후기 / 키워드 후기             | `SparkReviewPage`              |
| \*\*\*Pages/MyPage/Home                     | `MyPageHome`                   |
| Pages/MyPage/ProfileManagement              | `ProfileManagementPage`        |
| Pages/Workout/QuickRecord                   | `WorkoutQuickRecordPage`       |
| Pages/Workout/Statistics                    | `WorkoutStatisticsPage`        |
| Pages/Activity/JoinedLightning              | `JoinedLightningPage`          |
| Pages/Activity/HostedLightning              | `HostedLightningPage`          |
| Pages/Settings/Home                         | `SettingsHomePage`             |
| 혼자 운동-종목 선택+목표 입력               | `SoloExerciseSetupPage`        |
| 혼자 운동-루틴 불러오기                     | `SoloRoutineLoadPage`          |
| 혼자 운동 화면-시작 전/후                   | `SoloExerciseSessionPage`      |
| 같이 운동-소속 모임 있음, 모임장 화면       | `SparkExerciseHostReadyPage`   |
| 같이 운동-소속 모임 있음, 모임원 화면       | `SparkExerciseMemberReadyPage` |
| 모임장/모임원 운동세션 화면                 | `SparkExerciseSessionPage`     |
| 혼자 운동 종료 후 화면                      | `ExerciseResultPage`           |

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

- Figma 와이어프레임 기준 번개 모임 탭은 지도 탐색이 기본 진입 화면이다.
- MVP 지도는 **Leaflet + OpenStreetMap(OSM)** 으로 구현한다. API 키가 필요 없는 구성을 우선한다.
- 각 번개는 `sparks.latitude`, `sparks.longitude`를 사용해 네온 핀 또는 커스텀 마커로 표시한다.
- 마커 클릭 시 하단 미리보기 카드가 열리고, `상세 보기`로 `/sparks/:sparkId`에 진입한다.
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

Figma 1페이지 와이어프레임 기준으로 라우팅을 재정의한다. 기존 라우트와 충돌할 경우 아래 라우트를 우선한다.

```txt
/
/login
/onboarding/terms
/onboarding/phone
/onboarding/profile
/onboarding/result

/home
/notifications

/exercise
/exercise/solo/setup
/exercise/solo/routine
/exercise/solo/session
/exercise/result
/exercise/spark/select
/exercise/spark/host-ready/:sparkId
/exercise/spark/member-ready/:sparkId
/exercise/spark/session/:sparkId

/sparks
/sparks/list
/sparks/filter
/sparks/new
/sparks/new/confirm
/sparks/:sparkId
/sparks/:sparkId/manage
/sparks/:sparkId/review

/challenges
/challenges/:challengeId

/mypage
/mypage/profile
/mypage/workout
/mypage/workout/:sessionId
/mypage/activity
/mypage/settings
/mypage/settings/profile-visibility
/mypage/settings/social
/mypage/settings/location
/mypage/settings/device
/mypage/settings/health
/mypage/settings/terms
/mypage/settings/help
/mypage/settings/help/new
/mypage/settings/delete-account
```

라우팅 규칙:

- 로그인하지 않은 사용자가 보호된 페이지에 접근하면 `/login`으로 이동한다.
- 회원가입/소셜 로그인 후 약관 동의, 전화번호 인증, 사용자 조사 7단계가 완료되지 않으면 온보딩 플로우로 이동한다.
- 하단 탭은 `/home`, `/exercise`, `/sparks`, `/challenges`, `/mypage` 계열에서 유지한다.
- Figma 기준 운동 세션 화면에도 하단 탭이 있으므로 `/exercise/solo/session`, `/exercise/spark/session/:sparkId`에서도 하단 탭을 유지하되, 이탈 액션에는 확인 모달을 띄운다.
- `/exercise/result`도 와이어프레임 기준 하단 탭이 보이므로 `AppLayout`(바텀내비) 그룹에 포함한다(2026-06-18 변경).
- `/sparks`는 지도 탐색 기본 화면이고, `/sparks/list`는 리스트 전환 화면이다.

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
  trust_score int not null default 70,
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

- 디자인 시스템 토큰은 Tailwind CSS v4 기준 `src/styles/globals.css`의 `@theme`에 반영한다.
- `docs/design/design-system.md`의 색상, 타이포, radius, shadow 토큰이 변경되면 `src/styles/globals.css`의 `@theme` 토큰도 함께 갱신한다.
- UI 작성 시 `bg-spark-lime`, `text-spark-dark`, `rounded-spark-lg`, `shadow-spark-card`처럼 design-system.md에 정의된 `spark-*` 유틸리티를 우선 사용한다.
- 공통 스타일은 컴포넌트화한다.
- 반복되는 버튼, 카드, 탭, 바텀내비는 `components/ui` 또는 `components/layout`으로 분리한다.
- **임의 색상(예: `bg-orange-500`, `bg-[#111111]`)을 사용하지 않는다.** 반드시 design-system.md의 브랜드 토큰을 사용한다.
- 모바일 우선 클래스를 작성한 뒤 `sm`, `md`, `lg` 순서로 확장한다.

#### 브랜드 컬러 토큰 (design-system.md 기준)

| 용도             | 클래스 (커스텀 토큰)                  | Hex       |
| ---------------- | ------------------------------------- | --------- |
| Primary CTA 배경 | `bg-spark-lime`                       | `#D1FF4C` |
| Secondary 강조   | `text-spark-purple` / `bg-spark-purple` | `#8C6CFF` |
| 앱 배경          | `bg-spark-bg`                         | `#F7F7F7` |
| 다크 배경        | `bg-spark-dark`                       | `#121212` |
| 다크 카드 배경   | `bg-spark-card`                       | `#1C1C1E` |
| 기본 텍스트      | `text-spark-dark`                     | `#121212` |

#### 홈 화면 듀얼톤 구조

- 상단 라이트 구역: `bg-spark-bg`, `bg-spark-soft-lime`, `bg-spark-soft-purple`, `bg-spark-lavender` 조합을 사용한다.
- 하단 다크 구역: `bg-spark-dark` 또는 `bg-spark-card`를 사용한다.

#### 컴포넌트별 클래스 기준

```tsx
// Primary CTA 버튼
<button className="h-[52px] w-full rounded-full bg-spark-lime px-5 text-sm font-bold text-spark-dark">
  운동 시작하기
</button>

// Chip / Tag (아웃라인)
<span className="rounded-full border border-spark-gray/30 px-3 py-1 text-sm text-spark-gray">
  연속 50일
</span>

// 모임 카드 (라이트 배경)
<div className="rounded-spark-lg bg-white p-4 shadow-spark-card">
  ...
</div>

// 다크 섹션 배경
<section className="bg-spark-dark px-5 py-6 text-white">
  ...
</section>

// 하이라이트 테이블 셀
<td className="rounded-spark-xs bg-spark-lime px-3 py-2 text-sm font-bold text-spark-dark">
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

---

## 16. Figma 플로우 구현 체크리스트

Claude Code가 구현 결과를 검수할 때 아래 항목을 반드시 확인한다.

### 인증/온보딩

- [ ] 로그인 시작 화면에 Apple / Google / Kakao 버튼이 순서대로 노출된다.
- [ ] 약관 동의 화면에서 필수 약관 미동의 시 다음으로 진행할 수 없다.
- [ ] 전화번호 인증 화면이 약관 동의 다음에 존재한다.
- [ ] 사용자 조사 7단계가 Figma 순서와 동일하다.
- [ ] 온보딩 결과 화면에서 운동 레벨, 프로필 요약, 시작 CTA가 보인다.

### 홈

- [ ] 최초 로그인 시 권한 승인 팝업이 뜬다.
- [ ] 홈에서 알림 전체/읽지 않음 화면으로 이동 가능하다.
- [ ] 홈의 운동 기록 카드 클릭 시 운동 상세 팝업 또는 상세 페이지가 열린다.
- [ ] 홈의 번개 카드 클릭 시 번개 상세로 이동한다.

### 번개

- [ ] `/sparks` 기본 화면은 지도 보기다.
- [ ] `리스트로 확인` 액션으로 리스트 화면 전환이 가능하다.
- [ ] 빠른 필터 `전체 / 내 나이 / 내 레벨 / 내 성별`이 보인다.
- [ ] 상세 필터에서 거리 설정을 조정할 수 있다.
- [ ] 번개 생성은 입력 → 확인 → 생성 완료 순서다.
- [ ] 참여한 번개와 운영중 번개 상세 UI를 구분한다.
- [ ] 번개 종료 후 후기 작성 화면과 키워드 후기 화면이 연결된다.

### 운동 시작

- [ ] 혼자 운동은 종목 선택과 목표 입력이 한 화면에서 처리된다.
- [ ] 걷기/러닝/자전거와 헬스/홈트 UI가 분기된다.
- [ ] 종목 직접 입력 팝업이 있다.
- [ ] 루틴 불러오기 화면이 있다.
- [ ] 세션 시작 전 목표 수정 바텀시트 또는 팝업이 있다.
- [ ] 같이 운동은 모임장/모임원 화면을 구분한다.
- [ ] 운동 종료 후 기록 저장과 결과/칭찬 화면으로 이동한다.

### 마이페이지/설정

- [ ] 마이페이지는 프로필 / 운동 관리 / 활동 관리 3탭이다.
- [ ] 운동 관리에는 빠른 기록, 기간별 히스토리, 통계가 있다.
- [ ] 활동 관리는 참여한 번개와 개설한 번개를 분리한다.
- [ ] 설정에는 프로필 공개, 소셜 계정, 위치, 기기 연결, 건강 앱 연결, 약관, 문의, 회원탈퇴가 있다.
