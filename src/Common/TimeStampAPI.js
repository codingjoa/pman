const Now = Math.floor((Date.now() + 3600 * 9 * 1000) / 86400000);
export function getRelativeTimeIntl(jsonTime) {
  const time = Math.floor(((new Date(jsonTime) - 0) + 3600 * 9 * 1000) / 86400000);
  const relative = Now - time;
  if(relative <= 0) {
    return `오늘 ${new Intl.DateTimeFormat('ko-KR', { hourCycle: 'h23', hour: 'numeric', minute: 'numeric' }).format(new Date(jsonTime))}`
  } else if(relative<=6) {
    return `${relative}일전 ${new Intl.DateTimeFormat('ko-KR', { hourCycle: 'h23', hour: 'numeric', minute: 'numeric' }).format(new Date(jsonTime))}`
  } else {
    return (new Intl.DateTimeFormat('ko-KR', { hourCycle: 'h23', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })).format(new Date(jsonTime));
  }
}
export function getTimeIntl(jsonTime, isExpiry = false) {
  const date = isExpiry ? new Date(new Date(jsonTime) - 1) : new Date(jsonTime);
  return new Intl.DateTimeFormat('ko-KR', {
    hourCycle: 'h23',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}
export function getTimeDDay(jsonTime, isExpiry = false) {
  const date = isExpiry ? new Date(new Date(jsonTime) - 1) : new Date(jsonTime);
  const time = Math.floor(((date - 0) + 3600 * 9 * 1000) / 86400000);
  const relative = Now - time;
  if(relative>0) {
    return `D+${relative}`;
  } else if(relative<0) {
    return `D${relative}`;
  } else {
    return 'D-Day';
  }
}
export function getDate(jsonTime, isExpiry = false) {
  const date = isExpiry ? new Date(new Date(jsonTime) - 1) : new Date(jsonTime);
  return new Intl.DateTimeFormat('ja', { hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).replace(/\/{1}/gi, '-');
}
export function getCurrentDate() {
  return getDate(new Date());
}
