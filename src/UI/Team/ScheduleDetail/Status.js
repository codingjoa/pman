import UserFigure from 'Common/UserFigure'
import { FileDownload } from 'Common/Preset'
import * as TimeStamp from 'Common/TimeStamp'
import * as ReactRouter from 'react-router-dom'

function Detail(row, index) {
  const params = ReactRouter.useParams();
  const fileUrl = `/api/v1/team/${params.teamID}/schedule/${params.scheduleID}/status/file/${row.userID}`;
  if(!row.createdAt) {
    return (
      <div key={index}>
        <div><UserFigure userName={row.userProfileName} src={row.userProfileImg} /></div>
        <div>미제출</div>
      </div>
    );
  }
  return (
    <div key={index}>
      <div><UserFigure userName={row.userProfileName} src={row.userProfileImg} /></div>
      <div><TimeStamp.Time>{row.createdAt}</TimeStamp.Time></div>
      <div>{row.statusContent}</div>
      <div><FileDownload fileName={row.fileName} fileUrl={fileUrl} /></div>
    </div>
  );
}

export default function Status({
  status
}) {
  return (
    <>{status?.map && status.map(Detail)}</>
  );
}
