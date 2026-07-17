# 🐻 ZooSik

레거시 웹 퍼블리싱 환경에서 벗어나 React를 활용한 컴포넌트 기반 개발과 비동기 처리 방식을 공부하면서 제작한 토이 프로젝트입니다.

사용자는 회원가입 및 로그인을 통해 계정을 생성하고, 가상의 잔고를 이용해 주식을 매수·매도하며 보유 종목과 거래 내역을 확인할 수 있습니다.

별도의 백엔드 서버 없이 Firebase Authentication과 Cloud Firestore를 이용해 회원 관리와 데이터 저장 기능을 구현했습니다.

실시간 주가를 서버에서 관리할 경우 지속적인 서버 비용이 발생하므로, 사용자별로 독립적인 시세 데이터를 관리하고 클라이언트에서 주가를 계산하도록 구현했습니다.

## 🔧 Tech Stack

- React
- Firebase Authentication
- Cloud Firestore
- CSS

## ✨ Features

- 회원가입 / 로그인
- 주식 매수 / 매도
- 보유 종목 및 잔고 조회
- 거래 내역 조회
- 사용자별 독립적인 주가 데이터 관리
- 실시간 주가 변동 시뮬레이션

## ▶️ Run

```bash
npm install
npm start
```

## 📁 Project Structure

```
public/
src/
```
