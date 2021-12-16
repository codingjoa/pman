import CreateInviteCode from './CreateInviteCode'
import DeleteTeam from './DeleteTeam'
import RenameTeam from './RenameTeam'
import Leave from './Leave'
import EditWebhook from './EditWebhook'
import { useFetched } from 'Hook/useFetching'

function Owner() {
  return (
    <div>
      <div>
        <div className="line"></div>
        <h3>팀 관리</h3>
        <DeleteTeam />
        <RenameTeam />
        <EditWebhook />
      </div>
      <CreateInviteCode />
    </div>
  );
}

export default function Settings() {
  // Settings
  const fetchedData  = useFetched();
  console.log(fetchedData);
  return (
    <>
      {fetchedData.owned===1 && <Owner />}
      {fetchedData.owned===0 && <Leave />}
    </>
  );
}
