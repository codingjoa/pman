import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

// react-markdown
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// bootstrap
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Figure from 'react-bootstrap/Figure'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'

import Comment from './Comment'
import Delete from './Delete'
import EditContent from './EditContent'
import EditRef from './EditRef'
import File from './File'
import Status from './Status'
import ScheduleStatus from './ScheduleStatus'

import * as TimeStamp from 'Common/TimeStamp'
import * as Badges from 'Common/Badges'
import UserFigure from 'Common/UserFigure'
import DependencyPaginationButtons from 'Common/DependencyPaginationButtons'
import { useFetching } from 'Hook/useFetching'

import fetchSchedule from 'Async/fetchSchedule'

async function fetchScheduleComments(teamID, scheduleID, start, setState) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule/${scheduleID}/comment?start=${start*15}&limit=${15}`);
    setState(result.data);
  } catch(err) {
    setState(undefined);
  }
}

async function fetchScheduleSubmits(teamID, scheduleID, setState) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule/${scheduleID}/submit`);
    return result.data;
  } catch(err) {
    return undefined;
  }
}

async function addScheduleComments(teamID, scheduleID, commentContent) {
  const result = await axios.post(`/api/v1/team/${teamID}/schedule/${scheduleID}/comment`, {
    commentContent
  });
}

function Users(row, index) {
  return (
    <UserFigure userName={row.userProfileName} src={row.userProfileImg} me={!!row.me} key={index} />
  );
}

function ScheduleDetailInfo({
  fetchedData: schedule
}) {
  return (
    <>
      <div className="line"></div>
      <Row>
        <h1>
          {schedule.scheduleName}
        </h1>
      </Row>
      <Row className="mb-3">
        <Col>
          <Badges.ScheduleType>{schedule.scheduleType}</Badges.ScheduleType>
          <Badges.Reversion>{schedule.scheduleReversion}</Badges.Reversion>
        </Col>
      </Row>
      <Row>
        <Col>
          <EditContent
            content={schedule.scheduleContent}
            title={schedule.scheduleName}
            publishDate={schedule.schedulePublishAt}
            expiryDate={schedule.scheduleExpiryAt}
          />
          <Delete />
        </Col>
      </Row>
      <Row className="mb-1">
        <Col xs="2">
          <h6>제안자</h6>
        </Col>
        <Col>
          <UserFigure userName={schedule.scheduleOwnerUserName} src={schedule.scheduleOwnerUserImg} me={!!schedule.owner} />
        </Col>
      </Row>
      <Row className="mb-1">
        <Col xs="2">
          <h6>작업 기한</h6>
        </Col>
        <Col>
          <h6>
            <TimeStamp.Time>{schedule.schedulePublishAt}</TimeStamp.Time> 부터 (<TimeStamp.DDay>{schedule.schedulePublishAt}</TimeStamp.DDay>)<br />
            <TimeStamp.Time expiry>{schedule.scheduleExpiryAt}</TimeStamp.Time> 까지 (<TimeStamp.DDay expiry>{schedule.scheduleExpiryAt}</TimeStamp.DDay>)
          </h6>
        </Col>
      </Row>
      <Row>
        <Col xs="2">
          <h6>작업 대상</h6>
        </Col>
        <Col>
          <h6>{schedule.users.map(Users)}</h6>
          <EditRef users={schedule.users} norefUsers={schedule.norefUsers} />
        </Col>
      </Row>
      <File fileName={schedule.fileName} owner={schedule.owner} />
      {schedule.myjob===1 && <ScheduleStatus />}
      <Row>
        <Col>
          <div className="line"></div>
          <ReactMarkdown remarkPlugins={[ remarkGfm ]} rehypePlugins={[ rehypeRaw ]} className="md-content">
            {schedule.scheduleContent}
          </ReactMarkdown>
        </Col>
      </Row>
      <Row>
        <Col xl="6" className="mb-4">
          <div className="line"></div>
          <h3>의견 작성</h3>
          <ScheduleComments />
        </Col>
        <Col xl="6">
          <div className="line"></div>
          <h3>작업 현황</h3>
          <Status status={schedule?.status} />
        </Col>
      </Row>
    </>
  );
}



function Comments({
  data,
  index,
  setIndex
}) {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();

  const ref = React.useRef(null);
  const handleSubmit = event => {
    event.preventDefault();
    if(ref.current.value === '') {
      return;
    }
    addScheduleComments(params.teamID, params.scheduleID, ref.current.value)
    .then(() => history.go(0))
    .catch(() => alert('오류가 발생했습니다.'));
  };
  return (
    <>
      <Row>
        <Col>
          {data?.comments && data.comments.map(Comment)}
        </Col>
      </Row>
      <Row>
        <Col>
          <DependencyPaginationButtons
            page={index}
            pageSize={data._meta.sizeAll ? Math.ceil(data._meta.sizeAll/15) : 1}
            onClick={setIndex}
          />
        </Col>
      </Row>
      <Row>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Form.Control ref={ref} aria-label="답변 작성하기" placeholder="새 답변..." />
            </Col>
            <Col xs="auto">
              <Button onClick={handleSubmit}>
                저장
              </Button>
            </Col>
          </Row>
        </Form>
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
  const page = useFetching(ScheduleDetailInfo, fetchSchedule, { teamID, scheduleID });
  return page;
}

export default () => (
  <>
    <ScheduleDetail />
  </>
)
