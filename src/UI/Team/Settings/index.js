import CreateInviteCode from './CreateInviteCode'
import DeleteTeam from './DeleteTeam'
import RenameTeam from './RenameTeam'
import Leave from './Leave'
import EditWebhook from './EditWebhook'

export default function Settings() {
  // Settings



  return (
    <>
      팀 관리;
      초대 코드 생성
      <CreateInviteCode />
      <DeleteTeam />
      <RenameTeam />
      <Leave />
      <EditWebhook />
    </>
  );
}
