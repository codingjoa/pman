import * as ReactRouter from 'react-router-dom'

export default function BackNavigation({
  backUrl
}) {
  const params = ReactRouter.useParams();
  return (
    <>
      <div className="line"></div>
      <ReactRouter.Link
        to={location => ({ ...location, pathname: backUrl(params.teamID) })}
      >
        돌아가기
      </ReactRouter.Link>
    </>
  );
}
