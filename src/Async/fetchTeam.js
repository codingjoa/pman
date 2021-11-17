import axios from 'axios'
export default async function fetchTeam(teamID) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}`);
    return result.data;
  } catch(err) {
    return undefined;
  }
}
