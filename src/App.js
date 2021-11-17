import * as ReactRouter from 'react-router-dom'
import AccessToken from 'Router/AccessToken'

export default function App() {
  return (
    <ReactRouter.BrowserRouter>
      <AccessToken />
    </ReactRouter.BrowserRouter>
  );
}
