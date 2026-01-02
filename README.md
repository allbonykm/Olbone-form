# 올본한의원 복약 피드백 설문

환자용 모바일 최적화 복약 경과 기록 폼

## 파일 구조

```
olbon-medication-survey/
├── index.html              # 메인 설문 페이지
├── styles.css              # 스타일 (Cool Blue 테마)
├── app.js                  # 폼 로직
└── google-apps-script/
    └── Code.gs             # Google Sheets & Telegram 연동
```

## 사용법

### 1. 로컬 테스트
브라우저에서 `index.html` 열기:
- 개발자 도구(F12) → 모바일 뷰 선택

### 2. URL 파라미터
```
index.html?name=홍길동
```
→ "안녕하세요, 홍길동님!" 표시

### 3. Google Apps Script 설정

1. 기존 Web App URL 사용 (이미 설정됨)
2. `Code.gs` 내용 참고하여 추가 기능 설정

### 4. Telegram 알림 설정

1. **봇 생성**: @BotFather 에게 `/newbot` 명령
2. **토큰 복사**: 발급받은 토큰을 `Code.gs`의 `TELEGRAM_BOT_TOKEN`에 입력
3. **Chat ID 확인**: @userinfobot 에게 메시지 보내서 ID 확인
4. **Code.gs 업데이트**: `TELEGRAM_CHAT_ID`에 입력
5. **재배포**: Apps Script에서 새 버전 배포

## 설문 단계

| Step | 내용 |
|------|------|
| 1 | 복약 준수 (2회/1회/놓침) |
| 2 | 복용 시기, 온도, 경험 |
| 3 | 긍정적 변화 (복수 선택) |
| 4 | 불편 반응 + 안심 안내 |
| 5 | 사진 & 건의사항 |

## 배포 방법

### GitHub Pages / Netlify / Vercel
1. 프로젝트 폴더를 Git 저장소에 push
2. 호스팅 서비스에서 배포

### Google Apps Script Web App
기존 Web App에 HTML 삽입하려면 `google-apps-script/Code.gs` 참조
