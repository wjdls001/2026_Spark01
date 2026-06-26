# SPARK Design System

> SPARK 웹앱 구현을 위한 디자인 시스템 문서입니다.
> 기준 화면: 디자인팀 메인페이지 시안 / SPARK Design Assets 이미지

---

## 1. Design Principle

SPARK는 운동을 시작하고, 함께하고, 기록하며, 성장하는 흐름을 빠르게 인지할 수 있어야 한다.

### 핵심 원칙

1. **목적 중심 레이아웃**

   - 사용자가 화면에 진입했을 때 가장 먼저 해야 할 행동을 즉시 인지할 수 있게 구성한다.
   - 홈에서는 `오늘 해야 할 운동/챌린지`, 모임에서는 `참여 대기`, 기록에서는 `운동 시작/기록 확인`을 우선 노출한다.

2. **카드 단위 정보 구조**

   - 혼자 운동, 함께 운동, 모임 관리, 챌린지, 운동 기록처럼 성격이 다른 기능은 카드 단위로 분리한다.
   - 한 카드에는 하나의 목적만 담는다.

3. **CTA 우선순위 명확화**

   - 주요 행동은 Lime 컬러 버튼으로 강조한다.
   - 보조 행동은 Purple 또는 Outline 버튼을 사용한다.
   - 비활성/완료 상태는 연한 Lime, Gray, Dark Card를 사용해 구분한다.

4. **라이트/다크 대비 활용**

   - 기본 화면은 밝고 부드러운 배경을 사용한다.
   - 지도, 운동 타이머, 실시간 운동 기록 등 집중도가 필요한 화면은 Dark UI를 사용할 수 있다.

5. **모바일 우선 설계**
   - 기준 디바이스는 모바일 웹앱 390px 내외 폭을 기준으로 한다.
   - 하단 탭바, 카드형 리스트, 큰 CTA 버튼을 기본 인터랙션 패턴으로 사용한다.

---

## 2. Brand Identity

### 서비스명

**SPARK**

### 브랜드 키워드

- 활동적인
- 가볍게 시작하는
- 함께 운동하는
- 성취감을 주는
- 에너지 있는

### 로고 사용

- 로고는 Lime, Purple, White 조합을 기본으로 한다.
- Dark 배경에서는 White/Lavender 로고 사용을 권장한다.
- App Icon은 라운드 사각형 안에 SPARK 심볼을 배치한다.
- **실제 로고 에셋(2026-06-21 적용)**: `src/assets/spark-logo.png`(174×196, Lime→White→Purple 그라데이션 번개 "S" 심볼, 다크 배경이 이미지에 포함되어 있어 별도 배경 컨테이너 없이 `<img>`로만 사용). 로그인 화면 대형 로고, 홈 헤더 아이콘, 온보딩 약관/전화번호 화면 상단 워드마크(`SPARK` 텍스트 옆 작은 아이콘), 파비콘(`index.html`)에서 모두 이 파일 하나를 공유한다. 새 화면에 로고가 필요하면 이 자산을 재사용하고 임의로 새 SVG/이모지 로고를 만들지 않는다.

### 마스코트 캐릭터 (2026-06-21, 사용자 제공 이미지로 교체 — 같은 날 두 번째 버전)

- 프로필 이미지가 없을 때 쓰는 공통 캐릭터(`SparkCharacter`)는 **사용자가 제공한 귀여운 플랫 일러스트 번개 마스코트**(`src/assets/spark-character.png`)를 사용한다 — 노란 번개 모양 몸체에 동그란 눈·웃는 입·볼터치, 짧은 팔다리가 달린 캐릭터. 원본 ChatGPT 생성 이미지는 체크보드 배경이 그대로 박혀 있어 Pillow 플로드필로 배경을 지우고 투명 PNG로 정리했다 — **캐릭터 이미지는 항상 배경이 투명해야 하며, 배경이 포함된 원본을 그대로 쓰지 않는다.**
- (이전 버전이었던 황금색 3D 사진형 캐릭터는 폐기됨. 같은 이름 파일을 교체하는 식으로 계속 갈아끼워왔으니, 다음에 또 캐릭터를 바꿀 일이 있으면 이 섹션의 날짜/설명도 같이 갱신할 것.)
- 표정/포즈가 고정된 이미지 한 장이므로 `mood` prop(`happy/active/calm`)은 더 이상 시각적으로 구분되지 않는다(API 호환을 위해 prop 자체는 유지). 추후 표정별 이미지가 추가되면 `mood`에 따라 다른 파일을 매핑하도록 확장한다.
- 캐릭터는 **항상 완전한 원형**(`rounded-full`)으로 표시하고, 이미지는 `object-contain`으로 잘리지 않게 전체를 보여준다(캐릭터 실루엣이 세로로 길어 좌우에 약간의 여백이 생기는 것은 정상). 사각형/둥근 사각형 배지로 표시하지 않는다.
- **네온 강조 테두리**: `ring` prop(`'lime' | 'purple' | 'none'`)으로 굵은 네온 테두리(`ring-[3px]` + 같은 색 `box-shadow` 글로우)를 켤 수 있다. 모임장·내 프로필(홈 헤더)·같이 운동 참여 완료 멤버처럼 강조가 필요한 자리에 `ring="lime"`을 쓴다. 일반 참여자는 `ring="none"`(연한 `ring-1 ring-black/5`)로 둔다.
- 구현은 `src/components/common/SparkCharacter.tsx` 한 파일에서만 관리하며, `size`(`sm/md/lg`)·`ring` prop으로 모든 화면(마이페이지 프로필, 운동 종료 결과, 홈 루틴/최근기록, 번개 참여자 리스트, 같이 운동 준비 화면 등)에서 동일한 캐릭터 이미지를 재사용한다. 화면마다 다른 캐릭터를 새로 만들지 않는다.

### 신뢰도 BPM 안내 팝업

- 마이페이지/유저 프로필의 신뢰도 Heart+BPM 배지를 탭하면 `TrustScoreInfoModal`(`src/components/common/TrustScoreInfoModal.tsx`)이 뜬다. 중앙 팝업(`spark-modal-panel`)에 BPM 숫자, 운동 횟수·참여 모임·노쇼 횟수·모임 매너 4칸 통계, 확인 버튼으로 구성한다. DB에 집계 컬럼이 없어 현재는 더미 통계를 보여준다.

## 3. Color System

> **실제 구현 변수명 안내 (2026-06-21 추가)**
> 아래 3.1~3.4의 `--color-*` 토큰명은 개념 설명용이며, `src/styles/globals.css`의 `@theme`에는 **`spark-` 접두사가 붙은 변수**로 구현되어 있다(CLAUDE.md 14절 기준).
> CSS에서 `var(--color-card-black)`처럼 이 문서의 표 이름을 그대로 `var()`에 넣으면 변수가 존재하지 않아 배경이 투명해지는 등의 버그가 난다(`.spark-bottom-sheet`에서 실제로 발생했던 버그).
> CSS를 직접 작성할 때는 항상 `var(--color-spark-*)` 실제 변수를, Tailwind 클래스를 쓸 때는 `bg-spark-*`/`text-spark-*`를 사용한다. 매핑 예시:
>
> | 이 문서의 표기 | 실제 변수 / 클래스 |
> | --- | --- |
> | `--color-primary-lime` | `--color-spark-lime` / `bg-spark-lime` |
> | `--color-primary-purple` | `--color-spark-purple` / `bg-spark-purple` |
> | `--color-dark-bg` | `--color-spark-dark` / `bg-spark-dark` |
> | `--color-card-black` | `--color-spark-card` / `bg-spark-card` |
> | `--color-bg-app` | `--color-spark-bg` / `bg-spark-bg` |
> | `--color-bg-soft-lime` / `--color-bg-soft-purple` | `--color-spark-soft-lime` / `--color-spark-soft-purple` |
> | `--color-surface` / `--color-surface-muted` | `--color-spark-surface` / `--color-spark-muted` |
> | `--color-text-secondary` / `--color-text-tertiary` | `--color-spark-text-secondary` / `--color-spark-text-tertiary` |
> | `--color-success` / `--color-warning` / `--color-error` / `--color-info` | `--color-spark-success` / `-warning` / `-error` / `-info` |

### 3.1 Primary Palette

| Token                    | Name           |       Hex | Usage                                          |
| ------------------------ | -------------- | --------: | ---------------------------------------------- |
| `--color-primary-lime`   | Primary Lime   | `#D1FF4C` | 메인 CTA, 활성 상태, 핵심 배지, 강조 카드      |
| `--color-primary-purple` | Primary Purple | `#8C6CFF` | 보조 CTA, 선택 상태, 그래프 강조, 포인트 카드  |
| `--color-lavender`       | Lavender       | `#F3E7FF` | 연한 배경, 보조 카드, Purple 계열 Surface      |
| `--color-dark-bg`        | Dark BG        | `#121212` | 다크 화면 배경, 하단 탭바, 운동 기록 집중 화면 |
| `--color-card-black`     | Card Black     | `#1C1C1E` | 다크 카드, Bottom Sheet, 운동 기록 카드        |
| `--color-white`          | White          | `#FFFFFF` | 기본 카드, 텍스트 반전, 입력창 배경            |
| `--color-neutral-gray`   | Neutral Gray   | `#999999` | 보조 텍스트, 비활성 텍스트, 설명 텍스트        |

### 3.2 Background Colors

| Token                    |       Hex | Usage                                |
| ------------------------ | --------: | ------------------------------------ |
| `--color-bg-app`         | `#F7F7F7` | 앱 전체 기본 배경                    |
| `--color-bg-soft-lime`   | `#F3FFD8` | 홈 상단, 챌린지, 성공/진행 강조 배경 |
| `--color-bg-soft-purple` | `#EEE8FF` | 프로필/보조 섹션 배경                |
| `--color-bg-dark`        | `#121212` | 지도/운동 기록/다크 모드 화면        |
| `--color-surface`        | `#FFFFFF` | 일반 카드, 폼, 섹션                  |
| `--color-surface-muted`  | `#F5F5F5` | 입력창, 비활성 영역                  |

### 3.3 Text Colors

| Token                    |       Hex | Usage                    |
| ------------------------ | --------: | ------------------------ |
| `--color-text-primary`   | `#121212` | 기본 제목/본문           |
| `--color-text-secondary` | `#666666` | 설명, 메타 정보          |
| `--color-text-tertiary`  | `#999999` | 비활성/보조 정보         |
| `--color-text-inverse`   | `#FFFFFF` | 다크 배경 위 텍스트      |
| `--color-text-purple`    | `#8C6CFF` | 링크/보조 강조           |
| `--color-text-lime`      | `#D1FF4C` | 다크 배경 위 강조 텍스트 |

### 3.4 Semantic Colors

| Token             |       Hex | Usage            |
| ----------------- | --------: | ---------------- |
| `--color-success` | `#D1FF4C` | 성공, 완료, 활성 |
| `--color-warning` | `#FFB84C` | 주의, 마감 임박  |
| `--color-error`   | `#FF5A5F` | 오류, 삭제, 실패 |
| `--color-info`    | `#8C6CFF` | 안내, 선택, 추천 |

---

## 4. Typography

### 4.1 Font Family

```css
font-family: "DM Sans", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR",
  sans-serif;
```

- 영문/숫자: **DM Sans**
- 한글: Pretendard 또는 Noto Sans KR fallback 권장
- 숫자가 많이 들어가는 운동 기록 화면은 DM Sans의 굵은 숫자 표현을 유지한다.

### 4.2 Type Scale

| Token             | Size | Line Height | Weight | Usage                  |
| ----------------- | ---: | ----------: | -----: | ---------------------- |
| `text-display`    | 40px |        48px |    700 | 운동 타이머, 핵심 수치 |
| `text-display-sm` | 32px |        38px |    700 | 홈 인사말, 주요 헤더   |
| `text-title-lg`   | 24px |        32px |    700 | 페이지 타이틀          |
| `text-title`      | 20px |        28px |    700 | 섹션 타이틀, 카드 제목 |
| `text-body-lg`    | 18px |        28px |    500 | 강조 본문              |
| `text-body`       | 16px |        26px |    400 | 기본 본문              |
| `text-body-sm`    | 14px |        20px |    500 | 카드 설명, 버튼 텍스트 |
| `text-caption`    | 12px |        18px |    400 | 메타 정보, 라벨        |
| `text-chip`       | 11px |        16px |    600 | 태그, 상태 칩          |

### 4.3 Typography Usage

```css
.heading-page {
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.heading-section {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.body-default {
  font-size: 16px;
  line-height: 26px;
  font-weight: 400;
}

.caption {
  font-size: 12px;
  line-height: 18px;
  font-weight: 400;
  color: var(--color-text-tertiary);
}
```

---

## 5. Layout System

### 5.0 Global App Background

- 모든 주요 화면은 운동 시작 화면과 동일한 `White → Soft Purple → Soft Lime` 그라데이션을 앱 배경으로 공유한다.
- `html`, `body`, `#root`, `AppLayout`까지 동일 계열 배경을 연결해 iOS/모바일 오버스크롤 시 흰색 단절이 생기지 않게 한다.
- 하단 내비게이션 높이 72px과 콘텐츠 하단 padding을 일치시킨다.

### 5.1 Mobile Frame

| Item                 | Value |
| -------------------- | ----: |
| 기준 화면 폭         | 390px |
| 최소 지원 폭         | 360px |
| 최대 모바일 컨테이너 | 440px |
| 기본 좌우 Padding    |  20px |
| 카드 내부 Padding    |  16px |
| 섹션 간격            |  24px |
| 카드 간격            |  12px |
| 하단 탭바 높이       |  72px |

### 5.2 Grid

- 모바일 기준 4-column grid 사용
- 좌우 margin: 20px
- gutter: 12px
- 카드와 CTA는 대부분 full-width 사용

```css
.app-container {
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  background: var(--color-bg-app);
}

.screen-padding {
  padding: 20px;
  padding-bottom: 96px;
}
```

### 5.3 Spacing Scale

| Token     | Value | Usage                |
| --------- | ----: | -------------------- |
| `space-1` |   4px | 아이콘과 텍스트 사이 |
| `space-2` |   8px | 작은 요소 간격       |
| `space-3` |  12px | 카드 내부 요소 간격  |
| `space-4` |  16px | 카드 padding         |
| `space-5` |  20px | 화면 좌우 margin     |
| `space-6` |  24px | 섹션 간격            |
| `space-8` |  32px | 큰 섹션 간격         |

---

## 6. Radius & Shadow

### 6.1 Radius

| Token         | Value | Usage                    |
| ------------- | ----: | ------------------------ |
| `radius-xs`   |   8px | 칩, 작은 태그            |
| `radius-sm`   |  12px | 입력창, 작은 버튼        |
| `radius-md`   |  16px | 일반 카드                |
| `radius-lg`   |  20px | 큰 카드, 홈 카드         |
| `radius-xl`   |  24px | Bottom Sheet, 큰 Surface |
| `radius-full` | 999px | Pill Button, Chip        |

### 6.2 Shadow

```css
--shadow-card: 0 8px 24px rgba(18, 18, 18, 0.08);
--shadow-bottom-sheet: 0 -8px 32px rgba(18, 18, 18, 0.18);
--shadow-floating: 0 12px 32px rgba(18, 18, 18, 0.16);
```

- 일반 카드에는 강한 그림자를 남발하지 않는다.
- 플로팅 버튼, Bottom Sheet, 지도 위 패널에만 명확한 shadow를 사용한다.

---

## 7. Components

## 7.0 Onboarding Design System

2026-06-18 사용자 조사 화면은 와이어프레임의 구조와 정보 위계를 유지하되 SPARK 공통 디자인 토큰을 그대로 사용한다. 화면 전용 브랜드 컬러를 추가하지 않는다.

| UI | Design token |
| --- | --- |
| 진행 바, 뒤로가기, 보조 강조 | `Primary Purple` |
| 주요 하단 CTA, 확인 CTA | `Primary Lime` + Dark text |
| 선택 카드 배경 | `Soft Purple` |
| 안내/결과 강조 카드 | `Soft Lime`, `Soft Purple`, `Surface Muted` |
| 기본 카드/입력창 | `Surface`, `Surface Muted`, Gray border |
| 주요 radius | 카드 `16~20px`, 입력 `12px`, CTA/칩 `Full` |
| 팝업 | White surface, `24px` radius, `Floating shadow`, dimmed scrim |

- 모바일 기준 좌우 여백은 24px, 상단 헤더 높이는 64px, 하단 CTA 높이는 52~56px이다.
- 진행률은 `10/24/38/54/68/82/99%`를 사용하며 Purple bar와 Soft Purple track으로 표현한다.
- 선택 카드는 Purple border와 Soft Purple 배경, 선택 칩은 Purple fill과 White text로 표현한다.
- 좋아하는 운동의 선택 순서 배지는 Lime fill과 Dark text를 사용한다.
- 팝업의 단일 확인은 Lime primary, 선택형 보조 행동은 Soft Purple, 변경/추가 행동은 Purple secondary를 사용한다.
- 직접 입력 팝업은 10자 카운터와 취소/추가하기 2열 pill 버튼을 제공한다.
- 결과 화면은 원형 프로필 비주얼, Purple 레벨 배지, Soft Lime 전체 요약 카드와 보조 Surface 카드로 구성한다.

### 레벨 배지 표기 기준 (2026-06-21)

- 숫자 레벨(Lv.1~100)은 5단계 등급명과 함께 `{등급명} · LV.{숫자}` 형식으로 한 줄에 표기한다(예: `러너 · LV.55`). 배지에는 항상 `whitespace-nowrap`을 적용해 줄바꿈으로 잘리지 않게 한다.
- 등급 구간: 비기너 Lv.1~19 / 챌린저 Lv.20~39 / 러너 Lv.40~69 / 마스터 Lv.70~89 / 스파크 Lv.90~100.
- 등급/숫자 계산은 항상 `src/lib/utils/level.ts`(`getLevelTier`, `levelNumberFromExerciseLevel`)를 통해서만 하고, 화면별로 임의의 숫자를 하드코딩하지 않는다.
- 마이페이지 신뢰도(Heart 아이콘 + 점수)의 기본값은 70이다(`profiles.trust_score` 컬럼 기본값과 동일). 더미 신뢰도 데이터를 추가할 때도 70을 기준으로 하고, 과도하게 흩어진 임의 값(50/74/87/92 등)을 새로 만들지 않는다.

## 7.1 Button

### Primary Button

주요 행동에 사용한다.

- 예: `참여 대기`, `모임 참여`, `운동 시작`, `목표 설정`, `레벨업 받기`
- Background: Lime
- Text: Dark
- Radius: Full
- Height: 48px 또는 52px

```css
.btn-primary {
  height: 52px;
  padding: 0 20px;
  border-radius: 999px;
  background: var(--color-primary-lime);
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}
```

### Secondary Button

보조 행동 또는 Purple 강조에 사용한다.

- 예: `목표 설정`, `공유하기`, `레벨업 받기`
- Background: Purple
- Text: White

```css
.btn-secondary {
  height: 52px;
  padding: 0 20px;
  border-radius: 999px;
  background: var(--color-primary-purple);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 700;
}
```

### Dark Button

다크 UI 또는 강한 액션에 사용한다.

```css
.btn-dark {
  height: 52px;
  padding: 0 20px;
  border-radius: 999px;
  background: var(--color-dark-bg);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 700;
}
```

### Outline Button

중요도가 낮은 보조 행동에 사용한다.

```css
.btn-outline {
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--color-primary-purple);
  color: var(--color-primary-purple);
  background: transparent;
  font-size: 14px;
  font-weight: 700;
}
```

### Disabled Button

```css
.btn-disabled {
  height: 52px;
  padding: 0 20px;
  border-radius: 999px;
  background: #eef5d4;
  color: #a8b18d;
  font-size: 14px;
  font-weight: 700;
  cursor: not-allowed;
}
```

---

## 7.2 Card

### Default Card

```css
.card {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--shadow-card);
}
```

사용 위치:

- 홈 추천 모임 카드
- 최근 기록 카드
- 운동 통계 카드
- 프로필 활동 카드

### Soft Lime Card

```css
.card-lime {
  background: var(--color-bg-soft-lime);
  border-radius: 20px;
  padding: 16px;
}
```

사용 위치:

- 오늘 챌린지
- 완료율
- 운동 목표
- 활성 상태 카드

### Purple Card

```css
.card-purple {
  background: var(--color-primary-purple);
  color: var(--color-white);
  border-radius: 20px;
  padding: 16px;
}
```

사용 위치:

- 모임 찾기
- 목표 설정
- 강조 통계 카드

### Dark Card

```css
.card-dark {
  background: var(--color-card-black);
  color: var(--color-white);
  border-radius: 20px;
  padding: 16px;
}
```

사용 위치:

- 지도 화면 Bottom Sheet
- 운동 기록 화면
- 운동 상세 정보

---

## 7.3 Chip / Tag

### Selected Chip

```css
.chip-selected {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--color-primary-lime);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 700;
}
```

### Default Chip

```css
.chip-default {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
}
```

### Category Chip

```css
.chip-purple {
  background: var(--color-lavender);
  color: var(--color-primary-purple);
}
```

사용 예시:

- `전체`, `나의`, `러닝`, `축구`, `헬스`
- `진행 중`, `완료`, `모집 중`
- `1km 이내`, `참여 가능`

---

## 7.4 Input

```css
.input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid #e8e8e8;
  background: var(--color-white);
  font-size: 14px;
  color: var(--color-text-primary);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-purple);
  box-shadow: 0 0 0 3px rgba(140, 108, 255, 0.12);
}
```

사용 위치:

- 검색창
- 회원가입/로그인 입력창
- 모임 생성 폼
- 목표 설정 입력폼

---

## 7.5 Bottom Navigation

하단 탭바는 모든 주요 화면에서 고정 사용한다.

### 탭 구성 예시

1. 홈
2. 찜/관심 또는 모임
3. 운동
4. 챌린지
5. 프로필

```css
.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 398px;
  height: 64px;
  border-radius: 24px;
  background: var(--color-dark-bg);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: var(--shadow-floating);
}

.bottom-nav-item {
  color: #6f7682;
  font-size: 11px;
  font-weight: 600;
}

.bottom-nav-item.active {
  color: var(--color-white);
}
```

### 사용 규칙

- 현재 탭은 White 또는 Lime 포인트로 표시한다.
- 아이콘과 라벨을 함께 제공한다.
- 운동 중 화면처럼 몰입이 필요한 경우에는 탭바를 숨기거나 축소할 수 있다.

---

## 7.6 Header

### 기본 Header

```css
.header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
}
```

### Header 패턴

- 홈: 인사말 + 알림 아이콘
- 상세 화면: 뒤로가기 + 타이틀 + 설정/공유 아이콘
- 지도 화면: 검색창 + 필터 버튼
- 운동 기록 화면: 뒤로가기 + 화면명 + 설정 아이콘

---

## 7.7 Progress / Gauge

챌린지 진행률, 레벨업, 운동 목표 달성률에 사용한다.

```css
.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #ededed;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-primary-purple);
}
```

### 색상 규칙

- 목표 달성 진행: Purple
- 챌린지 성공/완료: Lime
- 미달성/비활성: Gray

---

## 8. Screen Patterns

## 8.1 Home Dashboard

홈은 사용자가 오늘 해야 할 운동과 추천 모임을 빠르게 확인하는 화면이다.

### 구조

1. 인사말 영역
2. 오늘 운동/챌린지 요약 카드
3. 추천 모임 카드
4. 자주 하는 루틴/운동 카테고리
5. 최근 기록 카드
6. 하단 탭바

### 구현 규칙

- 상단 인사말은 부드러운 Lime/Purple 그라데이션 배경을 사용할 수 있다.
- 오늘의 핵심 행동 버튼은 카드 우측 또는 하단에 배치한다.
- 기록 카드는 날짜, 거리, 속도, 시간을 작은 카드 형태로 보여준다.

### 2026-06-18 홈 프레임 매핑

1. Soft Purple 헤더와 알림
2. 운동 준비 메시지
3. Soft Lime 성장 요약 카드
4. Lime 운동 시작 CTA
5. 5개 운동 루틴
6. 가로 스크롤 추천 번개 카드
7. Soft Purple 빠른 액션 2열
8. Purple 원형 운동 현황 지표
9. Soft Purple 최근 운동 리스트
10. Dark 탐색 배너

와이어프레임의 파란 버튼과 검정 외곽선은 복제하지 않는다. Primary CTA는 Lime, 보조 액션은 Purple, 콘텐츠 표면은 White/Soft Lime/Soft Purple을 사용한다.

---

## 8.2 Map / Nearby Meetup

주변 번개 모임을 지도 위에서 탐색하는 화면이다.

### 구조

1. 상단 검색창
2. 필터 버튼
3. 지도 영역
4. 위치 핀
5. Bottom Sheet 모임 리스트
6. 하단 탭바

### 구현 규칙

- 지도 위 정보는 최소화한다.
- Bottom Sheet는 Dark Card 스타일을 사용한다.
- 모임 상태는 Lime Chip으로 표시한다.
- 현재 위치/필터/생성 버튼은 Floating Button 형태로 제공한다.

---

## 8.3 Profile

프로필은 사용자의 레벨, 운동 성향, 운동 기록을 요약하는 화면이다.

### 구조

1. 프로필 이미지 / 닉네임 / 레벨
2. 운동 성향 태그
3. 대표 CTA 카드
4. 운동 기록 캘린더/카드 리스트
5. 하단 탭바

### 구현 규칙

- 사용자 레벨과 태그는 Purple/Lime 조합으로 강조한다.
- 기록 카드는 2-column grid로 배치 가능하다.
- 프로필 배경은 Lavender 계열을 사용할 수 있다.

### Profile Home / Management Mapping

- 상단 프로필 카드는 Soft Purple surface를 사용하며 카드 전체가 편집 진입점이다.
- 선호 운동은 Muted chip, 운동 성향은 Soft Purple chip, 레벨 배지는 Purple을 사용한다.
- 운동 요약은 3열 Muted card, 기록 피드는 모바일 3열 grid로 구성할 수 있다.
- 프로필 관리는 20px 화면 여백, 16~20px 카드 radius, pill CTA를 사용한다.
- 닉네임 확인과 서브화면 저장은 Purple secondary, 전체 프로필 저장은 Lime primary다.
- 운동 성향/선호 운동 추가 화면의 선택 상태는 Purple fill + White text를 사용한다.

---

## 8.4 Challenge

챌린지는 진행 상태와 체크리스트가 핵심이다.

### 구조

1. 챌린지 진행률 카드
2. 체크포인트 그래프
3. 챌린지 리스트
4. 개별 챌린지 진행 상태
5. CTA 또는 보상 버튼

### 구현 규칙

- 진행률 숫자는 크게 표시한다.
- 완료한 항목은 Lime으로 표시한다.
- 미완료/잠김 상태는 Gray로 표시한다.
- 챌린지 리스트는 운동화/아이콘 + 제목 + 기간 + 상태 버튼 구조를 사용한다.

---

## 8.5 Exercise Timer / Record

운동 기록 화면은 다크 테마를 우선 적용한다.

### 구조

1. 운동 시간 타이머
2. 현재 거리/페이스/칼로리 요약
3. 지도 또는 경로
4. 일시정지/재생 버튼
5. 구간 기록 리스트
6. 하단 정보 패널

### 구현 규칙

- 타이머는 `text-display` 크기로 표시한다.
- 주요 CTA는 원형 버튼으로 제공한다.
- 운동 중에는 불필요한 UI를 최소화한다.
- 지도 위 버튼은 반투명 White 또는 Dark 배경을 사용한다.

---

## 8.6 Statistics

통계 화면은 기간별 운동량, 거리, 시간, 칼로리를 비교한다.

### 구조

1. 기간 탭: 월간 / 주간 / 전체
2. 캘린더 또는 운동일 요약
3. 거리 그래프
4. 시간 그래프
5. 칼로리/페이스 요약 카드

### 구현 규칙

- 그래프 막대는 Lime/Purple을 사용한다.
- 평균, 총합, 최고 기록은 카드로 분리한다.
- 숫자는 크게, 설명은 작게 배치한다.

### Workout Management Tabs

- `빠른 기록`: 최근 운동 카드와 자주 하는 운동 chip.
- `기간별 히스토리`: 주간/월간/연간 세그먼트, 날짜 이동, 달력/연간 막대, 거리·시간 차트.
- `통계`: 월 요약 3열, 목표 progress, 운동 종목 분포, 월별 운동시간 bar chart.
- 날짜 이동 화살표는 실제 기준 날짜 상태를 변경한다.
- 임의 데이터는 Purple bar, Soft Purple track, Warning 비교선을 사용한다.
- 주간·월간·연간 모두 거리/시간 차트와 칼로리/Pace 2열 카드를 제공한다.
- 연간 상단에는 12개월 운동 횟수를 4열 카드 그리드로 표시한다.

### Workout Detail

- 상단 메타, 운동 유형 badge, 지도/경로, 3분할 지표, 상세 테이블, 메모 순서다.
- 지도 placeholder는 Muted surface와 Purple route, Lime start point를 사용한다.
- 번개운동의 함께한 사람은 공통 캐릭터와 작은 White card로 표현한다.

### Bottom Sheet / Viewport Modal

- 지도/리스트의 상세 패널처럼 검은 배경의 보조 정보 영역은 화면 하단에서 올라오는 bottom sheet로 구현한다.
- 최대 폭 440px, 최대 높이 78dvh, 상단 radius 28px, Dark Card 배경, 내부 스크롤을 사용한다.
- 상단 drag handle을 표시하고 바깥 dimmed scrim을 누르면 닫힌다.
- 중앙 팝업은 화면에서 16px 이상 여백을 확보하고 최대 높이 `calc(100dvh - 32px)` 내에서 스크롤한다.
- **Dark Card 배경은 반드시 불투명해야 한다.** `.spark-bottom-sheet`(globals.css)가 `var(--color-card-black)`(존재하지 않는 변수)를 참조해 배경이 투명하게 보이던 버그가 있었다(2026-06-21 수정, `var(--color-spark-card)`로 교체). 같은 패턴의 다크 패널을 추가할 때는 반드시 실제 구현 변수(`--color-spark-card`/`bg-spark-card`)를 쓰고, 브라우저에서 실제로 불투명하게 보이는지 확인한다.
- 모임 운동 세션처럼 peek handle(예: `참여자 보기`)로 여는 패널은 텍스트만 쓰고 화살표/세모 아이콘을 덧붙이지 않는다.
- 가로 스크롤 chip 목록(빠른 필터, 종목 필터 등)이 화면 폭을 넘어가면 터치 스와이프뿐 아니라 마우스 드래그로도 스크롤되어야 한다(`src/lib/utils/useDragScroll.ts` 패턴 사용). `overflow-x-auto`만으로는 데스크톱 마우스 드래그가 동작하지 않는다.
- **확인/알림 팝업은 `window.confirm`/`window.alert`를 절대 쓰지 않는다(2026-06-21).** 데스크톱에서 OS 네이티브 다이얼로그가 모바일 UI 위에 끼어들어 디자인을 깨뜨린다. 확인이 필요하면 `ConfirmModal`(중앙 팝업, 취소/확인 2버튼, `danger` prop으로 빨간 확인 버튼), 짧은 완료 메시지는 `Toast`(화면 하단에 잠깐 떴다 사라지는 다크 pill, `useToast` 훅으로 상태 관리)를 쓴다. 둘 다 `src/components/common/`에 있다.

### 지도 마커 요약 카드 (2026-06-21 추가)

- 지도 위 마커를 탭하면 마커 클릭 자체는 선택 강조만 하고, 화면 하단에 작은 요약 카드(White surface, rounded-2xl, shadow-spark-card)를 띄운다.
- 요약 카드는 제목+종목 emoji, 장소·시간, 인원(`n/capacity`), `모임 상세보기` Lime 버튼 1개로 구성하고 지도/다른 영역을 탭하면 닫힌다.
- 풀스크린 리스트 시트(`리스트로 확인`)와는 별개 동작이며, 마커 카드가 리스트 시트를 대신하지 않는다.

### Activity Management

- 상단 탭은 White pill track + Purple selected fill을 사용한다.
- 검색창은 Muted pill input, 정렬은 Muted compact button으로 표현한다.
- 개설 번개 상태 필터는 선택 시 Lime fill을 사용한다.
- 활동 카드는 White surface, Soft Purple 운동 아이콘, Soft Lime 상태 badge를 사용한다.

---

## 8.7 Completion / Reward

운동 완료 또는 레벨업 화면이다.

### 구조

1. 완료 메시지
2. SPARK 보상/레벨 카드
3. 오늘의 운동 요약
4. 목표 달성률
5. 다음 레벨 진행률
6. 공유/확인 CTA

### 구현 규칙

- 보상 이미지는 화면 중앙에 크게 배치한다.
- 주요 CTA는 Purple 버튼을 사용한다.
- 보조 CTA는 Gray 또는 Outline 버튼을 사용한다.

---

## 9. Icon System

### 스타일

- Stroke 기반 아이콘 권장
- 기본 두께: 1.8px ~ 2px
- 크기: 20px / 24px / 28px
- 활성 아이콘: White 또는 Lime
- 비활성 아이콘: Gray

### 주요 아이콘

| 기능   | Icon                     |
| ------ | ------------------------ |
| 홈     | Home                     |
| 모임   | Heart / Users / Location |
| 운동   | Play / Activity          |
| 챌린지 | Trophy / Flame           |
| 프로필 | User                     |
| 설정   | Settings                 |
| 알림   | Bell                     |
| 검색   | Search                   |
| 필터   | Sliders                  |
| 지도   | MapPin                   |

---

## 10. Motion & Interaction

### 기본 인터랙션

| Interaction       | Rule                                |
| ----------------- | ----------------------------------- |
| Button Press      | scale 0.98, 100ms                   |
| Card Tap          | background slightly darken, 120ms   |
| Bottom Sheet Open | translateY 100% → 0, 250ms ease-out |
| Tab Change        | icon/text color transition 150ms    |
| Progress Fill     | width animation 400ms ease-out      |

### 사용 규칙

- 운동 중 화면에서는 과한 애니메이션을 피한다.
- 완료/레벨업/챌린지 성공 화면에서는 짧은 강조 모션을 허용한다.

---

## 11. Accessibility

### Color Contrast

- Lime 배경 위에는 Dark Text를 사용한다.
- Purple 배경 위에는 White Text를 사용한다.
- Gray 텍스트는 12px 이하에서 너무 연하지 않게 사용한다.

### Touch Target

| Element         |    Minimum Size |
| --------------- | --------------: |
| Button          |     44px height |
| Icon Button     |     40px × 40px |
| Chip            |     32px height |
| Bottom Nav Item | 48px touch area |

### Text

- 본문 최소 크기는 14px 이상을 권장한다.
- 운동 수치/기록은 최소 16px 이상으로 표시한다.
- 타이머/핵심 기록은 32px 이상으로 표시한다.

---

## 12. Tailwind Theme Tokens

이 프로젝트는 Tailwind CSS v4를 사용하므로 디자인 토큰은 `src/styles/globals.css`의 `@theme`에 반영한다.
`design-system.md`의 색상, 타이포, radius, shadow가 변경되면 `@theme` 토큰도 함께 갱신한다.

```css
@import "tailwindcss";

@theme {
  --font-sans: "DM Sans", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR",
    sans-serif;

  --color-spark-lime: #d1ff4c;
  --color-spark-purple: #8c6cff;
  --color-spark-lavender: #f3e7ff;
  --color-spark-dark: #121212;
  --color-spark-card: #1c1c1e;
  --color-spark-white: #ffffff;
  --color-spark-gray: #999999;
  --color-spark-bg: #f7f7f7;
  --color-spark-soft-lime: #f3ffd8;
  --color-spark-soft-purple: #eee8ff;
  --color-spark-surface: #ffffff;
  --color-spark-muted: #f5f5f5;
  --color-spark-success: #d1ff4c;
  --color-spark-warning: #ffb84c;
  --color-spark-error: #ff5a5f;
  --color-spark-info: #8c6cff;

  --radius-spark-xs: 8px;
  --radius-spark-sm: 12px;
  --radius-spark-md: 16px;
  --radius-spark-lg: 20px;
  --radius-spark-xl: 24px;

  --shadow-spark-card: 0 8px 24px rgba(18, 18, 18, 0.08);
  --shadow-spark-sheet: 0 -8px 32px rgba(18, 18, 18, 0.18);
  --shadow-spark-floating: 0 12px 32px rgba(18, 18, 18, 0.16);

  --text-display: 40px;
  --text-display--line-height: 48px;
  --text-display--font-weight: 700;
  --text-display-sm: 32px;
  --text-display-sm--line-height: 38px;
  --text-display-sm--font-weight: 700;
  --text-title-lg: 24px;
  --text-title-lg--line-height: 32px;
  --text-title-lg--font-weight: 700;
  --text-title: 20px;
  --text-title--line-height: 28px;
  --text-title--font-weight: 700;
  --text-body-lg: 18px;
  --text-body-lg--line-height: 28px;
  --text-body-lg--font-weight: 500;
  --text-body: 16px;
  --text-body--line-height: 26px;
  --text-body--font-weight: 400;
  --text-body-sm: 14px;
  --text-body-sm--line-height: 20px;
  --text-body-sm--font-weight: 500;
  --text-caption: 12px;
  --text-caption--line-height: 18px;
  --text-caption--font-weight: 400;
  --text-chip: 11px;
  --text-chip--line-height: 16px;
  --text-chip--font-weight: 600;
}
```

### Tailwind 사용 규칙

- UI 구현 전 이 문서의 토큰을 확인하고 `spark-*` 유틸리티를 우선 사용한다.
- `bg-orange-500`, `bg-[#111111]`처럼 임의 색상 또는 하드코딩 hex 색상은 피한다.
- 반복되는 버튼, 카드, 칩, 하단 탭, 헤더는 토큰 기반 컴포넌트로 만든다.
- 새 토큰이 필요하면 먼저 이 문서에 용도와 값을 추가한 뒤 `src/styles/globals.css`의 `@theme`에 반영한다.

---

## 13. CSS Variables

컴포넌트 내부에서 CSS 변수 직접 참조가 필요한 경우에만 아래 변수를 사용한다. 일반 UI 구현은 Tailwind `spark-*` 유틸리티를 우선한다.

```css
:root {
  --color-primary-lime: #d1ff4c;
  --color-primary-purple: #8c6cff;
  --color-lavender: #f3e7ff;
  --color-dark-bg: #121212;
  --color-card-black: #1c1c1e;
  --color-white: #ffffff;
  --color-neutral-gray: #999999;

  --color-bg-app: #f7f7f7;
  --color-bg-soft-lime: #f3ffd8;
  --color-bg-soft-purple: #eee8ff;
  --color-surface: #ffffff;
  --color-surface-muted: #f5f5f5;

  --color-text-primary: #121212;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-text-inverse: #ffffff;

  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-full: 999px;

  --shadow-card: 0 8px 24px rgba(18, 18, 18, 0.08);
  --shadow-bottom-sheet: 0 -8px 32px rgba(18, 18, 18, 0.18);
  --shadow-floating: 0 12px 32px rgba(18, 18, 18, 0.16);
}
```

---

## 14. React Component Naming Guide

### 기본 컴포넌트

```txt
components/
  common/
    Button.tsx
    Card.tsx
    Chip.tsx
    Input.tsx
    Header.tsx
    BottomNav.tsx
    ProgressBar.tsx
  layout/
    AppShell.tsx
    MobileContainer.tsx
  feature/
    HomeSummaryCard.tsx
    MeetupCard.tsx
    ChallengeCard.tsx
    ExerciseRecordCard.tsx
    StatCard.tsx
    RewardCard.tsx
```

### Variant 예시

```ts
type ButtonVariant =
  | "primary"
  | "secondary"
  | "dark"
  | "outline"
  | "ghost"
  | "disabled";
type CardVariant = "default" | "lime" | "purple" | "dark" | "muted";
type ChipVariant = "selected" | "default" | "purple" | "dark" | "disabled";
```

---

## 15. UI Implementation Rules

### 해야 하는 것

- 모바일 기준 390px 화면에서 먼저 구현한다.
- 버튼은 Pill 형태를 기본으로 한다.
- 주요 CTA는 Lime 또는 Purple만 사용한다.
- 카드 간격은 12px~16px을 유지한다.
- 하단 탭바는 Dark 배경으로 고정한다.
- 운동 기록/타이머 화면에서는 숫자 가독성을 최우선으로 한다.

### 피해야 하는 것

- 한 카드에 여러 CTA를 과하게 넣지 않는다.
- Lime과 Purple을 같은 중요도로 남발하지 않는다.
- Gray 텍스트를 너무 작거나 연하게 사용하지 않는다.
- 화면마다 radius, shadow, button height가 달라지지 않게 한다.
- 지도 화면 위에 너무 많은 텍스트 정보를 올리지 않는다.

---

## 16. Page Checklist

화면 구현 전 아래 항목을 확인한다.

```txt
[ ] 이 화면에서 사용자의 1순위 행동이 명확한가?
[ ] Primary CTA가 하나로 정리되어 있는가?
[ ] 카드 단위로 정보가 분리되어 있는가?
[ ] 하단 탭바 현재 위치가 표시되는가?
[ ] 390px 모바일 기준에서 좌우 여백이 유지되는가?
[ ] Lime/Purple 컬러가 역할에 맞게 사용되었는가?
[ ] 제목/본문/캡션의 위계가 명확한가?
[ ] 터치 영역이 최소 44px 이상인가?
[ ] 운동 기록 수치가 충분히 크게 보이는가?
[ ] 다크 화면에서 텍스트 대비가 충분한가?
```

---

## 17. Recommended Starter Class Patterns

### Page Wrapper

```tsx
<div className="min-h-dvh bg-spark-bg text-spark-dark">
  <main className="mx-auto max-w-[430px] px-5 pb-24 pt-5">{/* content */}</main>
</div>
```

### Primary CTA

```tsx
<button className="h-[52px] w-full rounded-full bg-spark-lime px-5 text-sm font-bold text-spark-dark">
  참여 대기
</button>
```

### Card

```tsx
<section className="rounded-spark-lg bg-white p-4 shadow-spark-card">
  <h2 className="text-title">오늘의 운동</h2>
  <p className="mt-2 text-body-sm text-spark-gray">오늘도 챌린지 진행중!</p>
</section>
```

### Dark Bottom Sheet

```tsx
<section className="rounded-t-spark-xl bg-spark-card p-4 text-white shadow-spark-sheet">
  <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/30" />
  {/* content */}
</section>
```

---

## 18. Summary

SPARK 디자인 시스템은 `Lime + Purple + Dark` 조합을 중심으로 한다.
사용자는 운동을 빠르게 시작하고, 주변 모임을 찾고, 챌린지를 수행하고, 기록을 확인해야 하므로 모든 화면은 **행동 우선순위**, **카드형 정보 구조**, **명확한 CTA**, **모바일 최적화**를 기준으로 구현한다.
