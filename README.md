# GameChanger Platform - Backend API

## 🎮 Project Overview
**GameChanger**는 Web3의 복잡한 사용자 경험과, 크라우드펀딩에서 **개발자가 자금을 수령한 뒤 프로젝트를 중단하는 신뢰성 문제**를 동시에 해결하는 **XRPL 기반 게이밍 & 펀딩 플랫폼**입니다.  

- **사용자**는 Web2처럼 편리하게 게임을 즐기면서, 실제로 플레이한 시간만큼만 비용을 지불합니다.  
- **개발자**는 XRPL의 에스크로(Escrow)와 배치(Batch) 기능을 통해 안전하고 투명하게 펀딩을 받고, 수익을 실시간으로 정산받을 수 있습니다.  

GameChanger는 **Pay-Per-Time 결제, 투명한 크라우드펀딩, 광고 기반 수수료 절감**을 통해 기존 게임 플랫폼의 문제를 근본적으로 해결하며, XRPL(XRP Ledger)을 활용해 **공정하고 지속 가능한 게임 생태계**를 만들어 갑니다.  

---

## 🚩 Problems We Solve
1. **사용자 경험 문제**  
   - Web3 게임은 플레이할 때마다 지갑 팝업과 서명이 반복 → 몰입감 저하, 이탈률 증가  

2. **과금 구조 문제**  
   - 기존 게임은 미리 구매해야만 플레이 가능  
   - 재미없으면 금전적·시간적 손실 발생  
   - 부분 유료화 모델은 과금 유도 중심으로 사용자 불만 심화  

3. **개발자 수익 구조 문제**  
   - 스팀 같은 플랫폼은 **30% 수준의 과도한 수수료**  
   - 정산이 수주~수개월 지연되어 인디 개발자의 현금 흐름 악화  

4. **크라우드펀딩 신뢰성 문제**  
   - 개발자가 자금만 받고 프로젝트를 중단하는 사례 발생  
   - 후원자는 진행 상황을 알 수 없고 환불도 불가능  
   - “먹튀” 문제로 크라우드펀딩 신뢰도가 낮음  

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

## Technology Stack

### Blockchain & Payment
- **XRPL (XRP Ledger)** – Blockchain infrastructure  
- **xrpl.js** – XRP Ledger JavaScript library  

### Backend Features
- **세션 기반 JWT 인증** – 5분 롤링 토큰 방식  
- **하트비트 메커니즘** – 세션 지속성 모니터링 (30초 간격)  
- **Range 스트리밍** – 세션 검증과 함께 게임 에셋 스트리밍  
- **빌링 연동** – XRPL 기반 실시간 결제 시스템  

---

## Team & Contributors
- **AHSKNUE**
