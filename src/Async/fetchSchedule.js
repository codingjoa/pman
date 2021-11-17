import axios from 'axios'
export default async function fetchSchedule({
  teamID,
  scheduleID
}) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule/${scheduleID}`);
    return result.data;
  } catch(err) {
    return undefined;
  }
}
