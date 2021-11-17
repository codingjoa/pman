import axios from 'axios'
export default async function fetchSchedulesOption({
  teamID,
  start
}) {
  const result = await axios.get(`/api/v1/team/${teamID}/schedule?start=${start*15}&limit=${start*15+15}`);
  return result.data;
}
