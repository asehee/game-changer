# 게임 플랫폼 백엔드

보안 게임 세션 관리 및 에셋 스트리밍을 위한 NestJS v10 + TypeScript + TypeORM 백엔드입니다.

## 기능

- **세션 기반 JWT 인증** - 5분 롤링 토큰 방식
- **하트비트 메커니즘** - 세션 지속성 모니터링 (45초 간격)
- **Range 스트리밍** - 세션 검증과 함께 게임 에셋 스트리밍
- **빌링 연동 스텁** - RLUSD API 연동 준비 완료
- **Swagger API 문서화** - `/docs` 경로에서 확인 가능
- **속도 제한** 및 보안 헤더 적용
- **포괄적인 e2e 및 단위 테스트**

## 기술 스택

- NestJS v10
- TypeScript v5
- TypeORM with MySQL
- JWT 세션 토큰
- Helmet (보안 헤더)
- Throttler (속도 제한)

## 설치

```bash
npm install
```

## 환경 설정

`.env` 파일을 생성하세요 (예시는 기존 `.env` 파일 참고):

```env
PORT=3000
SERVER_SEED=sEXXXXXXXXXXXXXXXXXXXX
ISSUER_ADDRESS=rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a
TOKEN_CURRENCY_CODE=USD
TESTNET=wss://s.altnet.rippletest.net:51233
DATABASE_URL=mysql://root@localhost:3306/game_platform
SESSION_JWT_SECRET=replace_me_with_secure_secret_in_production
SESSION_JWT_TTL_SEC=300
HEARTBEAT_INTERVAL_SEC=45
ASSET_STORAGE_ROOT=./storage/assets
NODE_ENV=development
```

## 데이터베이스 설정

```bash
# 마이그레이션 실행
npm run migration:run

# 샘플 데이터 시드
npm run seed
```

## 애플리케이션 실행

```bash
# 개발 모드 (watch 모드)
npm run dev

# 프로덕션 빌드
npm run build
npm run start:prod

# PM2로 실행
npm run start:pm2
```

## API 문서

`http://localhost:3000/docs`에서 Swagger 문서를 확인하세요.

## 주요 API 엔드포인트

### 플레이 세션 관리

- `POST /api/play/start` - 새 플레이 세션 시작
- `POST /api/play/heartbeat` - 세션 유지를 위한 하트비트 전송
- `POST /api/play/stop` - 현재 세션 종료

### 에셋 스트리밍

- `GET /api/assets/:assetId` - Range 지원 에셋 스트리밍 (세션 JWT 필요)

## 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 아키텍처

### 모듈

- **auth** - JWT 세션 전략 및 가드
- **users** - 사용자 관리 (지갑 주소 기반)
- **games** - 게임 메타데이터
- **play** - 세션 라이프사이클 관리
- **assets** - Range 지원 보안 에셋 스트리밍
- **billing** - 결제 스트림 모니터링 (스텁)

### 보안

- 세션 토큰은 5분마다 만료 (설정 가능)
- 45초마다 하트비트 필요
- 유효한 세션으로만 에셋 접근 가능
- 정적 호스팅 없음 - 모든 에셋은 API를 통해 프록시
- 모든 엔드포인트에 속도 제한 적용
- 프론트엔드 도메인에만 CORS 설정

### 데이터베이스 스키마

- **users** - 지갑 주소를 가진 사용자 계정
- **games** - 게임 메타데이터 및 버전
- **play_sessions** - 활성 및 과거 세션
- **assets** - 경로 및 메타데이터를 가진 게임 에셋 레지스트리

## 개발 참고사항

- **클라이언트를 절대 신뢰하지 않음** - 모든 검증은 서버 사이드
- 에셋은 직접 URL이 아닌 프록시를 통해 제공
- 각 하트비트마다 세션 토큰 롤링
- 세션 시작 및 하트비트 시 빌링 확인
- 만료된 세션 자동 정리

## 프로덕션 배포

1. 보안 `SESSION_JWT_SECRET` 설정
2. 프로덕션 데이터베이스 구성
3. SSL/TLS 활성화
4. 적절한 CORS 오리진 설정
5. 서명된 URL을 사용한 CDN 구성 (선택사항)
6. 모니터링 및 로깅 설정
7. 세션 기반 오토스케일링 구성

## 프론트엔드 연동 가이드

### 필요한 정보

프론트엔드에서 이 백엔드와 통신하려면 다음 정보가 필요합니다:

1. **사용자 지갑 주소** (MetaMask 등에서 가져옴)
2. **게임 ID** (플레이할 게임 선택 시)

### 연동 플로우

#### 1단계: 플레이 세션 시작
```javascript
// POST /api/play/start
const response = await fetch('/api/play/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: "0x742d35Cc6635C0532925a3b8D598544e15B9a0E6",
    gameId: "game-uuid-here"
  })
});

const { sessionToken } = await response.json();
// → 받은 토큰을 저장해두기
```

#### 2단계: 게임 에셋 로드
```javascript
// 게임 파일들 요청 (이미지, 사운드, 데이터 파일 등)
const asset = await fetch('/api/assets/some-asset-id', {
  headers: {
    'Authorization': `Bearer ${sessionToken}` // 1단계에서 받은 토큰
  }
});
```

#### 3단계: 하트비트 (자동으로 45초마다)
```javascript
// 45초마다 자동 실행
setInterval(async () => {
  const response = await fetch('/api/play/heartbeat', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const { newToken } = await response.json();
  sessionToken = newToken; // 토큰 갱신
}, 45000);
```

#### 4단계: 게임 종료
```javascript
// 게임 끝날 때
await fetch('/api/play/stop', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${sessionToken}` }
});
```

### 프론트엔드 요약

- **지갑 주소**만 있으면 시작 가능
- **세션 토큰**을 받아서 계속 사용
- **45초마다 자동으로** 서버에 "살아있음" 신호 전송
- **게임 파일들**을 토큰으로 안전하게 다운로드
- 백엔드가 모든 보안을 처리하므로 **단순히 API 호출**만 하면 됨
