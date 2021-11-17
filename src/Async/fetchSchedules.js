import axios from 'axios'
export default async function fetchTeams({ teamID }) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule`);
    return result.data?.schedules;
  } catch(err) {
    return undefined;
  }
}
