import axios from 'axios'
export default async function fetchTeamMembers(teamID) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/user`);
    return result.data;
  } catch(err) {
    return undefined;
  }
}
