Round02: profile head and description belong to one card; text should not be reduced to fit. White on lavender hierarchy, restrained status colors.

UPSTREAM OBSERVATION DATA
These documents describe the upstream layout, not an instruction to copy its code or change the current product contract. Current DESIGN.md takes precedence for names, actions, complete content and minimum typography. Preserve observed spatial relationships, assets and font roles where compatible. Paths are upstream-relative; use the supplied assets/reference manifest for local URLs. Unknown original properties remain unknown.
DOCUMENT DESIGN.md
# 디맨드 멘토 검색 번역 실험

## Overview

셀레트립에 대한 사용자 ‘정확하게 구현했다’ 평가 이후, 사용자가 지정한 디맨드로 수행하는 두번째 실험이다. [원본분해](analysis.md)와 [실행입력](prompt-v1.md)을 따르며 정적 재현에 한정한다. 실제 서비스로 만들거나 셀레트립 스타일로 각색하지 않는다.

## Colors

연보라배경→흰카드/입력/필터표면→짙은제목과선택항목 위계를 유지한다. 현직의푸른색,인증의보라색,찜의붉은색은각기다른상태와정보다. 이미지샘플링과 chosen색을구별하고 확정구현값은 ui.css에서관리한다. 배경의미세한명도변화는원본관찰에기반한재현범위이며일반제품의그라디언트기본값이아니다.

## Typography

원본CSS/폰트unknown. 시스템sans-serif,읽는글자14px하한,화면제목/멘토이름18px를선택했다. 긴설명에원본과줄바꿈차이가발생하면사진·카드관계와함께비교하고 숨기거나글자를축소하지않는다.

## Layout

실제원본1170×2532의y148–1529범위를390px폭으로표시한다. OS상태바/키보드는원본에보존하고앱재현에서는제외한다. 화면inset16/카드padding16은서로다른책임. 아바타→이름·자격·소속/별도찜→카드폭설명→양끝footer관계를유지한다. 둘째카드의가려진내용은복원하지않는다.

## Elevation & Depth

흰표면을연보라배경위에구분하되추가그림자·장식선은없다. 입력의실제포커스는래퍼하나가표시하고레이아웃을움직이지않는다.

## Shapes

검색12px/카드14px/필터pill18px/작은배지6px는이실험의 chosen값이다. 아바타2개는원본분리이미지,제어기호는공식Lucide. 원본기호와미세한형태차이는비교에서기록한다.

## Components

E1헤더/E2검색입력/E3선택상태/E4멘토식별영역2변형/E5설명·상담이력. input만기본입력·삭제/포커스검증,검색전송·필터결과·찜API·프로필이동은미구현관찰표본이다. 제품기능완료판정에이실험을사용하지않는다.

## Do's and Don'ts

P1을원본미공개구현담당에게먼저전달. 같은마크업과토큰으로독립표본/조립을생성. 초판입력·렌더보존. 사용자교정과내부검수발견을구별. 정확한원본DPR이나종합재현성능을한장으로확정하지않는다.


DOCUMENT analysis.md
# R2 — 디맨드 멘토 검색 분해

2026-09-10, UIbowl filter_by_app(app_name=디맨드, MOBILE,limit3,page1) 호출. A소개/B멘토검색/C통합검색 대표 이미지를 직접 봤다. 반복 카드와 선택 상태, 배경/흰 표면, 자격 배지의 관계가 있는 B를 선택했다. 상세출처는 [source.json](source.json), [디맨드 멘토검색](https://uibowl.io/name/디맨드?patterns=검색&patternName=멘토). 다른 갤러리 프레임을 봤다고 주장하지 않는다.

다운로드 원본은 **1170×2532 image-px**. 도구가 보여준 미리보기는 다른 표시 크기였고, 이를 원본 픽셀로 혼동하지 않도록 실제 파일크기를 확인한 뒤 분석 크롭 좌표를 변환했다. [크롭좌표](assets/crops.json). 원본CSS/DPR/서체는unknown이다. 이번390px 비교표시는1/3배이며 DPR을 추론한 값이 아니다.

## 관찰 영역과 관계

관찰 앱영역은 원본y148–1529. 위OS상태바와 아래시스템키보드는 원본으로 보존하지만 UI 재현범위에서 제외한다. 키보드가 가리는 두번째 카드의 숨은설명·상태는 생성하지 않는다. 아래좌표는 원본이미지를390px폭으로 표시하고 y148을0으로 둔 **시각 추정값**이며 CSS실측이 아니다.

| E/O | 표시영역·관계 | 표현과 상태 | 구현 선택/미확인 |
|---|---|---|---|
| E1/O1 | 상단높이약54,제목x16,도구3개오른쪽 | 짙은멘토링제목/매우연한회색채움도구 | 원본아이콘패밀리/활성조건unknown,공식Lucide로표현 |
| E2/O2 | x16,y70,w358,h46; search→입력 | 흰배경,둥근12근처,회색윤곽아이콘,입력커서보임 | input/focus기능은새결정,OS키보드재현없음 |
| E3/O3 | 입력아래8,각내용폭pill높이36 | 전체짙은배경흰글자,나머지흰배경회색글자 | 실제필터동작unknown,상태표본 |
| E4/O4 | 카드x16,y180,w358,h180; padding16.아바타48→gap8→이름·배지/소속 | 흰카드,현직연파랑/푸른소속,우측붉은채움하트 | 하트는카드범위,전역헤더하트와구별.14px글자하한 |
| E5/O5 | E4아래20,설명2줄;다시카드내왼쪽선x32부터;footer양끝 | 전문분야/노하우→횟수/면접,회색글자,구분선없음 | 제목폭에묶지않는별도단락;저장/예약기능추정없음 |
| E4/O6 | 두번째카드y372부터,상단만보임 | 아바타2/기름선배/보라인증·전문가/윤곽하트 | 다른부분반복추정없음.윗반경과흰표면양옆보존 |

원본캡처를RGB로변환해 배경(20,160)=(232,236,251), (20,700)=(234,237,250), (20,1400)=(242,244,252), 카드(70,900)=(255,255,255)을 샘플링했다. 이는 이미지합성픽셀이지 CSS색복원은 아니다. 위에서아래로아주연하게밝아지는배경을 chosen색으로표현한다. 배지와하트색은시각추정/선택으로기록하며 정확한원본토큰이라고하지않는다.

## 실행 입력과 비교

[P1](prompt-v1.md)은 구현 전에 고정했다. 원본에 접근하지 않는 별도 담당에게 이문서가 아닌 P1+아바타에셋2개+공식LucideSVG6개만 전달했다. 최초코드/렌더를 먼저보존하고, 후속수정이있으면 수정프롬프트와함께남긴다. 아이콘은공식원본형태를사용하며 색/채움변형은구현선택이다.

관찰/분해를 첫실험에 맞춰 새로한다. 셀레트립의검정pill·96px사진·행구조를이번카드에복사하지않는다. 같은방법이 다른서비스의배경과정보관계도전달하는지보는2차사례이며, 정확도일반화나사용자승인을선언하지않는다.
