import * as ReactRouter from 'react-router-dom'

export default function TeamInfo() {
  return <>
    <div className="line"></div>
    <div>
      <ReactRouter.Link
        to="/ui/user"
      >
        돌아가기
      </ReactRouter.Link>
      <br />
      <ReactRouter.Link
        to={{
          hash: '#open-topic'
        }}
      >
        열린 일정
      </ReactRouter.Link>
      <br />
      <ReactRouter.Link
        to={{
          hash: '#open-topic'
        }}
      >
        팀원 목록
      </ReactRouter.Link>
      <br />
      <ReactRouter.Link
        to={{
          hash: '#open-topic'
        }}
      >
        팀 관리
      </ReactRouter.Link>
    </div>
  </>;
}
