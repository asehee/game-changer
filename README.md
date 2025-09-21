# GameChanger Platform - Frontend
<img width="1276" height="718" alt="image" src="https://github.com/user-attachments/assets/9a50c0cd-f00a-4ec5-a9cb-fd2ec9a605a9" />

## 🎮 Project Overview
게임 플레이 시간당 실시간 과금부터 개발자에게 직접 지급까지! "충전 지갑" 위임을 통해 결제 시 매번 서명해야 하는 번거로움은 줄이고, 자산 유출 위험은 안전하게 차단합니다. 또한 조건 기반 Escrow 트랜잭션으로 먹튀 걱정 없는 신뢰성 높은 크라우드 펀딩을 실현하여, 인디 개발자부터 글로벌 유저까지 아우르는 새로운 기회로 게임 시장을 확 바꿀 Game Changer!

---

## 🚩 Problems We Solve
우리는 게임을 사랑하지만, 그 이면에는 게이머와 개발자 모두가 감수해야 하는 불편한 현실이 존재합니다.

**게이머의 불편함**: 7만 원을 결제한 게임이 30분 만에 실망스러웠던 경험, 누구나 한 번쯤은 겪어봤을 겁니다. 재미있을지 확신도 없는 게임을 '선구매'하고, 복잡한 환불 절차를 거쳐야 하는 불편함은 여전합니다. 해외 플랫폼이라면 비싼 수수료의 해외 결제 장벽까지 넘어야 합니다.

**개발자의 고충**: 이러한 불편함은 사실, 개발자들이 겪는 더 큰 문제에서 시작됩니다. 기존 플랫폼들은 30%에 달하는 높은 수수료를 가져가고, 개발자는 몇 달을 기다려 늦은 정산을 받습니다. 특히 자금을 모으기 어려운 인디 개발자들은 크라우드펀딩에 의존하지만, 후원자들은 언제든 발생할 수 있는 '먹튀' 가능성에 불안해합니다.

결국 이는 게이머와 개발자 모두를 위한 신뢰와 효율성이 부족한 악순환입니다.

---

## 🌟 Key Features & Innovation

### 1. Pay-Per-Time Gaming System  
- 게임을 미리 구매하지 않아도 됨  
- 플레이 시간만큼만 과금 → 재미없으면 중단 가능, 재미있으면 이어갈 수 있음  
- 기존 정액제·패키지 모델을 **근본적으로 대체할 새로운 소비 방식**  

### 2. Instant Settlement for Developers  
- XRPL을 통해 과금이 발생하는 즉시 정산  
- 글로벌 인디 개발자도 **실시간으로 수익 확보 가능**  
- 누구나 지속 가능한 게임 개발 가능  

### 3. Ad-powered Fee Model  
- XRPL 거래 수수료는 **광고 시청**으로 충당  
- 유저는 추가 비용 없이 게임 플레이 가능  
- 수수료 장벽을 제거해 **Web3 대중화** 촉진  

### 4. Trustless Crowdfunding  
- 모든 후원금은 XRPL **TokenEscrow**에 조건부로 잠김  
- 펀딩 종료 3일 전, 개발자는 **중간 산출물 제출**  
- 후원자 투표 결과에 따라 **Finish(지급) 또는 Cancel(환불)** 결정  
- **Batch 처리**로 대량 트랜잭션도 효율적 정산 → “먹튀” 구조적 차단  

---

## Technology 
<img width="1365" height="768" alt="image" src="https://github.com/user-attachments/assets/0a10e4fc-1414-4b51-9d93-123eb350e296" />

### 충전 지갑(charged wallet) 모델
- 사용자는 익스텐션 지갑을 사용하여 단 2번의 서명 (충전 지갑 활성화를 위한 xrp지불, 토큰 충전을 위한 지불)
- 충전지갑은 프론트엔드에서 생성되어, 충전지갑의 시드는 token trust set, signer list set서명에 사용되며, 절대 서버에 전달되지 않음
- signer list set 트랜잭션으로 사용자 지갑, 서버 지갑에게 권한 위임

### 시간당 과금
- 서명 권한 위임 (SignerListSet): 충전 지갑의 서명 권한을 사용자와 서버에게 공동으로 위임하여, 개인키 노출 없이 안전한 자동 결제 가능.
- 세션 토큰 기반 하트비트 결제: 유효한 세션 토큰으로 인증된 프론트엔드의 주기적인 하트비트 신호에 따라, 충전지갑의 남은 잔액을 확인하고, 서버가 위임받은 권한으로 플레이 요금을 자동으로 네트워크에 제출.

### 조건부 토큰 에스크로와 batch를 사용한 크라우드 펀딩
- 후원금은 개발자에게 직접 전달되지 않고, XRPL 에스크로에 투명하게 보관
- 에스크로 Condition, Fulfillment 관리는 서버가 담당
- 중간 결과물을 보고 후원자들이 오프체인 투표를 실행
- 투표 결과에 따라 서버가 후원자들(충전지갑)에게 위임 받은 권한으로 finish or cancel
- escrow의 finish / cancel 는 batch transaction을 활용하여 일괄 처리
---
### Key Screens
**Main**
<br> <img width="768" height="927" alt="image" src="https://github.com/user-attachments/assets/7ac57076-9ac4-4753-9516-d50efd478213" />

**MyPage**
<br> <img width="805" height="768" alt="image" src="https://github.com/user-attachments/assets/79376863-43d2-439c-807a-a0829b5077f9" />

**Game**
<br> <img width="903" height="768" alt="image" src="https://github.com/user-attachments/assets/987986d5-4b90-4bb1-96c3-e21875535d49" />

**AD**
<br> <img width="1209" height="768" alt="image" src="https://github.com/user-attachments/assets/4b279ccf-7c09-459d-a115-6e9adf2a715a" />

**Crowd Funding**
<br> <img width="805" height="531" alt="image" src="https://github.com/user-attachments/assets/d2be2439-3131-4cfd-a91c-026215378f08" />

**Admin**
<br> <img width="1349" height="759" alt="image" src="https://github.com/user-attachments/assets/bcea040d-0b12-4964-ae1e-2863446974fc" />


## Team & Contributors
- **AHSKNUE**
