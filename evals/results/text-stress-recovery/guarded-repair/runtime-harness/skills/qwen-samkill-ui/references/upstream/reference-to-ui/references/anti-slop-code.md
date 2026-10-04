# 코드 작성 기준: anti-slop

사용자 요청에 따라 [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop/tree/e8c4880471b23ab7f216fba7b27d173a6ef07d4c)의 일반 규칙을 TS/JS 코드 기준으로 적용한다. 확인 revision `e8c4880471b23ab7f216fba7b27d173a6ef07d4c`: README, src/index.ts, 설치 스킬. 시각 디자인 판별 도구와 혼동하지 않는다.

## 일반 규칙

| 규칙 | 작성 기준 |
|---|---|
| no-chained-type-assertions | 연속 타입 단언으로 증거를 만들지 않는다. |
| no-conditional-empty-object-spread | 조건부 빈 객체 spread로 필드 생략을 숨기지 않는다. 생략과 undefined는 다르다. |
| no-known-value-widening | 이미 아는 타입·키 정보를 넓은 타입으로 지우지 않는다. |
| no-module-mocking | 모듈 전체 mocking 대신 실제 의존 경계로 검증한다. |
| no-object-parameters | 느슨한 `object` 입력 타입을 피한다. 구조화된 매개변수 전체를 금지한다는 뜻은 아니다. |
| no-reflect-apply / no-reflect-get | 타입이 있는 호출·속성 접근을 사용한다. |
| no-runtime-typeof | 임의 런타임 축소 대신 경계에서 파싱한다. 존재 확인 등 원본의 허용 조건은 보존한다. |
| no-shape-in-symbol-names | 소유한 심볼 이름의 shape를 피한다. 외부 API 멤버까지 바꾸지 않는다. |
| no-unknown-parameters / no-unknown-returns / no-unknown-type-aliases | 명확한 소유 계약을 사용한다. 원본의 cause·타입 가드 예외를 확인한다. |
| no-unsafe-dictionary-type | 느슨한 사전 값 계약 대신 구체적인 값/유한 키를 사용한다. |
| no-widen-then-assert | 타입을 넓혔다가 단언으로 복원하지 않는다. |
| require-safety-comment-for-type-assertion | 필요한 단언에는 확인 가능한 불변 조건을 SAFETY 주석으로 설명한다. |

추론, `as const`, `satisfies`, 명명된 계약, 경계 파싱을 우선한다. 경고를 없애기 위한 타입 세탁·빈 주석·규칙 약화로 통과시키지 않는다.

## 프로젝트에 적용

[공식 설치 지침](https://github.com/dmmulroy/anti-slop/blob/e8c4880471b23ab7f216fba7b27d173a6ef07d4c/skills/install-anti-slop/guide.md)을 현재 대상 프로젝트에서 확인한다. 공식 npm 패키지가 있다고 가정하지 않는다. 기존 로컬 복사본/설정·패키지 관리자를 보존하고 원본 소스를 프로젝트에 복사해 관리하는 방식이다. 복사 시 MIT 라이선스를 보존한다.

TS/JS 구현에서는 기존 anti-slop이 있으면 그 검사를 실행한다. 없으면 호환 Oxlint 설정에 통합한다. oxlint와 @oxlint/plugins는 설치된 정확한 버전을 맞추고 기존 lint·ignore 설정을 병합한다. 모든 일반 규칙을 error로 적용하고 lint와 typecheck를 실행한다. Effect 전용 규칙은 직접 Effect 의존 또는 명시 요청이 있을 때만 적용한다. 관련 없는 패키지 버전·프레임워크를 바꾸지 않는다.

환경상 실행하지 못하면 수동 검토와 자동 lint 미실행을 구분하고 코드 게이트를 미검증으로 남긴다. 비 TS/JS 작업에는 Oxlint를 억지로 설치하지 않고 해당 언어의 타입/경계·명확한 계약·실제 동작 검사를 사용한다. 현재 samkill의 Python 게이트 테스트 통과를 anti-slop lint 통과라고 보고하지 않는다.
