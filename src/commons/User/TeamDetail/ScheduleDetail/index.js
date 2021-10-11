import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

// react-markdown
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Figure from 'react-bootstrap/Figure'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Pagination from 'react-bootstrap/Pagination'

function DependencyPaginationButtons({
  onClick,
  page,
  pageSize
}) {
  const BarSize = 5;
  // 불변의 렌더링된 모든 버튼들
  const inActivated = React.useMemo(() => {
    const buttons = [];
    for(let i=0; i<pageSize; i++) {
      buttons[i] = (
        <Pagination.Item
          key={`inActivated:${i}`}
          onClick={e => onClick(i)}
        >
          {i+1}
        </Pagination.Item>
      );
    }
    return buttons;
  }, [
    pageSize
  ]);
  const Activated = React.useMemo(() => {
    const buttons = [];
    for(let i=0; i<pageSize; i++) {
      buttons[i] = (
        <Pagination.Item
          active
          key={`Activated:${i}`}
          onClick={e => onClick(i)}
        >
          {i+1}
        </Pagination.Item>
      );
    }
    return buttons;
  }, [
    pageSize
  ]);
  // pageSize가 없다면 버튼을 그리지 않습니다.
  if(pageSize === null) {
    return null;
  }
  // 버튼 목록 그리기
  const pageLevel = Math.floor(page * (1 / BarSize));
  const pagination = [];
  let i = pageLevel * BarSize;
  while(i < (pageLevel * BarSize) + BarSize && i < pageSize) {
    pagination[i] = (page === i) ? Activated[i] : inActivated[i];
    i++;
  }
  return (
    <Pagination>
      {i-BarSize>0 &&
        <Pagination.Prev
          onClick={e => onClick(i - BarSize - 1)}
        />
      }
      {pagination}
      {i<pageSize &&
        <Pagination.Next
          onClick={e => onClick(i)}
        />
      }
    </Pagination>
  );
}




async function fetchSchedule(teamID, scheduleID, setState) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule/${scheduleID}`);
    setState(result.data);
  } catch(err) {
    setState(undefined);
  }
}

async function fetchScheduleComments(teamID, scheduleID, start, setState) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule/${scheduleID}/comment?start=${start*15}&limit=${start*15+15}`);
    setState(result.data?.fetchResult);
  } catch(err) {
    setState(undefined);
  }
}

async function fetchScheduleSubmits(teamID, scheduleID, setState) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule/${scheduleID}/submit`);
    setState(result.data);
  } catch(err) {
    setState(undefined);
  }
}

function Users(row, index) {
  return (
    <div key={index} style={{ display: 'inline-block' }}>
      <Figure>
        <Figure.Image
          width={64}
          height={64}
          src={row.userProfileImg}
        />
        <Figure.Caption>
          {row.userProfileName}
          {(row.me === 1) ? <Badge bg="secondary">나</Badge> : null}
        </Figure.Caption>
      </Figure>
    </div>
  );
}

const test =
`|테이블|테이블|
|---|---|
|ㅇㅇ|ㅇㅇ|

\`\`\`js
console.log('hello, world!');

\`\`\`

# 안녕하세요

1. 안녕하세요^^
2. hello`;

function ScheduleDetailInfo({
  schedule,
  teamID
}) {
  return (
    <Container>
      <Row>
        <h3>
          <Badge>{schedule.scheduleType === 0 ? '토론' : '과제'}</Badge>
          {schedule.scheduleReversion>0 ? <Badge bg="secondary">rev. {schedule.scheduleReversion}</Badge> : null}
          {schedule.scheduleName}
        </h3>
        <h5>{schedule.scheduleOwnerUserName}</h5>
        <h6>{schedule.schedulePublishAt}~{schedule.scheduleExpiryAt}</h6>

      </Row>
      <Row>
        <ReactMarkdown remarkPlugins={[ remarkGfm ]}>
          {test}
        </ReactMarkdown>
      </Row>
      <Row>
        <div>
          <h5>대상자</h5>
          {schedule.users.map(Users)}
        </div>
      </Row>
    </Container>
  );
}

function Comment({
  row,
  index
}) {
  return (
    <div key={index}>
      <>{row.commentContent}</>
    </div>
  );
}

function Comments({
  data,
  index,
  setIndex
}) {
  const ref = React.useRef(null);
  console.log(data);
  return (
    <>
      <Row>
        <h5>답변</h5>
        {data.comment && data.comment.map(Comment)}
      </Row>
      <Row>
        <Form ref={ref}>
          <Form.Label>
            새 답변 작성
          </Form.Label>
          <Form.Control aria-label="답변 작성하기" placeholder="새 답변..." />
          <Button onClick={e => console.log(ref)}>
            답변 올리기
          </Button>
        </Form>
      </Row>
      <Row>
        <DependencyPaginationButtons
          page={index}
          pageSize={data.sizeAll ? Math.round(data.sizeAll/15) : 1}
          onClick={setIndex}
        />
      </Row>
    </>
  );
}

function ScheduleComments() {
  const params = ReactRouter.useParams();
  const teamID = params.teamID;
  const scheduleID = params.scheduleID;
  const [ index, setIndex ] = React.useState(0);
  const [ data, setData ] = React.useState(null);
  const page = React.useMemo(() => {
    if(data === null) {
      return null;
    } else if(data === undefined) {
      return <>불러오기 실패.</>
    } else {
      return <Comments data={data} index={index} setIndex={setIndex} />
    }
  }, [ data ]);
  React.useLayoutEffect(() => {
    fetchScheduleComments(teamID, scheduleID, index, setData);
  }, [ index ]);
  return <>{page}</>;
}

function ScheduleDetail() {
  const params = ReactRouter.useParams();
  const teamID = params.teamID;
  const scheduleID = params.scheduleID;
  const [ schedule, setSchedule ] = React.useState(null);
  const page = React.useMemo(() => {
    if(schedule === null) {
      return null;
    } else if(schedule === undefined) {
      return <>불러오기 실패.</>
    } else {
      return <ScheduleDetailInfo teamID={teamID} schedule={schedule} />
    }
  }, [ schedule ]);
  React.useLayoutEffect(() => {
    fetchSchedule(teamID, scheduleID, setSchedule);
  }, []);
  return <>{page}</>;
}

export default () => (
  <>
    <ScheduleDetail />
    <ScheduleComments />
  </>
)
