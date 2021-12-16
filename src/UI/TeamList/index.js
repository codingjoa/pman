import axios from 'axios'
import Teams from './Teams'
import CreateTeam from './CreateTeam'

export default function User() {
  return (
    <div>
      <div className="line"></div>
      <CreateTeam />
      <div className="line"></div>
      <Teams />
    </div>
  );
}
