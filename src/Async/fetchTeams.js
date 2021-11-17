import axios from 'axios'
export default async function fetchTeams() {
  try {
    const result = await axios.get('/api/v1/team');
    return result.data;
  } catch(err) {
    return undefined;
  }
}
