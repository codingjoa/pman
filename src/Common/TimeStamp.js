import React from 'react'
import * as TimeStampAPI from './TimeStampAPI'

function RelativeDayComponent({
  children
}) {
  return TimeStampAPI.getRelativeTimeIntl(children);
}

function TimeComponent({
  children,
  expiry
}) {
  return TimeStampAPI.getTimeIntl(children, expiry);
}

function DDayComponent({
  children,
  expiry
}) {
  return TimeStampAPI.getTimeDDay(children, expiry);
}

function DateComponent({
  children,
  expiry
}) {
  return TimeStampAPI.getDate(children, expiry);
}

export const RelativeDay = React.memo(RelativeDayComponent)
export const Time = React.memo(TimeComponent)
export const DDay = React.memo(DDayComponent)
export const Date = React.memo(DateComponent)
