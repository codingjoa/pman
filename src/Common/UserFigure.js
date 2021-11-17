import React from 'react'
import Figure from 'react-bootstrap/Figure'
import * as Badges from './Badges'
export default React.memo(function UserFigure({
  userName,
  src,
  owner,
  me,
}) {
  return (
    <Figure>
      <Figure.Image
        className="rounded-circle"
        width={32}
        height={32}
        src={src}
      />
      {userName}
      <Badges.OwnerTag owner={owner} />
      <Badges.MeTag me={me} />
    </Figure>
  );
});
