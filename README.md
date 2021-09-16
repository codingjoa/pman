# 주제
프로젝트 협업툴 (React & Node.js)

# 사용 기술
+ Front: React
+ Back: Node.js

# 작업 계획
## 수업 3주차
1. 회원 DB 구현(OAuth2.0)
  + axios - https://www.npmjs.com/package/axios
  + mariadb - https://www.npmjs.com/package/mariadb
2. Stateless 로그인 구현 (jwt)
  + jsonwebtoken - https://www.npmjs.com/package/jsonwebtoken
  + express-jwt - https://www.npmjs.com/package/express-jwt
3. 그룹 생성 및 관리, 그룹 사용자 초대 기능 구현

## 수업 4~5주차
4. 일정/업무 분배 기능 구현
  + 말머리 목록: 공지, 일정, 리뷰
  + 업무 내용이 변경될 경우 rev1, rev2... 리버전 업
  + react-calendar(예정) - https://www.npmjs.com/package/react-calendar
  + toast-ui react-calendar(예정) - https://github.com/nhn/toast-ui.react-calendar
5. 일정/업무 분배 기능 심화: 이미지 업로드 및 미리보기 구현
  + express-fileupload(예정) - https://www.npmjs.com/package/express-fileupload
  + filepreview(예정) - https://www.npmjs.com/package/filepreview
6. 일정/업무 분배 기능 심화: 개인별 작업 결과 작성 및 업로드
7. 질문 게시판 기능 구현(Conversation Threading)
  + Private Thread는 특정 다수를 초대하여 채팅
  + Public Thread는 팀에 소속된 모든 인원이 채팅 참여
  + Thread는 마지막 채팅 이후로 24시간 이상 지난 경우 자동 폐쇄
  + socket.io(예정) - https://www.npmjs.com/package/socket.io
  + ws(예정) - https://www.npmjs.com/package/ws
  + express-ws(예정) - https://www.npmjs.com/package/express-ws
8. 질문 게시판 기능 심화: 파일 업로드 및 미리보기 구현

## 수업 6주차~7주차
9. markdown 문법을 이용한 에디터 기능 구현
  + toast-ui editor - https://github.com/nhn/tui.editor/tree/master/apps/react-editor#-install
10. markdown 문법을 이용한 에디터 기능 심화: 버전 관리
  + sqlite3 - https://www.npmjs.com/package/sqlite3
  + crypto-random-string - https://www.npmjs.com/package/crypto-random-string
  + jsdiff - https://www.npmjs.com/package/diff
11. 베타 테스트 추진
12. 문서화

## 수업 8주차
13. 퍼블리싱

# 그 외 라이브러리 및 참고자료
+ mariadb JSON - https://bstar36.tistory.com/359
