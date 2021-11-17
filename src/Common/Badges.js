import React from 'react'
import PropTypes from 'prop-types'
import Badge from 'react-bootstrap/Badge'

function ReversionComponent({
  children
}) {
  if(children>0);
  else return null;
  return <Badge bg="secondary">rev. {children}</Badge>
}
ReversionComponent.propTypes = {
  children: PropTypes.number
};
function ScheduleTypeComponent({
  children
}) {
  let tag = null;
  if(children===0) {
    tag = <Badge>토론</Badge>
  } else if(children===1) {
    tag = <Badge>과제</Badge>
  }
  if(tag!==null) {
    return <span>{tag}</span>
  }
  return null;
}
ScheduleTypeComponent.propTypes = {
  children: PropTypes.number
};
function MeTagComponent({
  me
}) {
  if(me) {
    return <Badge>나</Badge>
  }
  return null;
}
MeTagComponent.propTypes = {
  me: PropTypes.bool
};
function OwnerTagComponent({
  owner
}) {
  if(owner) {
    return <Badge variant="secondary">팀장</Badge>
  }
  return null;
}
OwnerTagComponent.propTypes = {
  owner: PropTypes.bool
};

export const Reversion = React.memo(ReversionComponent)
export const ScheduleType = React.memo(ScheduleTypeComponent)
export const MeTag = React.memo(MeTagComponent)
export const OwnerTag = React.memo(OwnerTagComponent)
