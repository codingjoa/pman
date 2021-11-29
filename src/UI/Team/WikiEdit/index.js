

import React from 'react'
import * as ReactRouter from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'

import axios from 'axios'
async function add({
  teamID,
  wikiID = null,
  wikiContent,
  wikiTitle,
}) {
  const share = {
    method: wikiID ? 'PUT' : 'POST',
    url: wikiID ? `/api/v1/team/${teamID}/wiki/${wikiID}` : `/api/v1/team/${teamID}/wiki`,
  };
  const result = await axios({
    ...share,
    data: {
      wikiContent,
      wikiTitle,
    },
  });
  return wikiID ? `/ui/team/${teamID}/wiki/edit/${wikiID}` : `/ui/team/${teamID}/wiki/edit/${result.data.wikiID}`;
}
async function deleteWiki({
  teamID,
  wikiID,
}) {
  await axios({
    method: 'DELETE',
    url: `/api/v1/team/${teamID}/wiki/${wikiID}`,
  });
}
async function get({
  teamID,
  wikiID,
}) {
  const result = await axios({
    method: 'GET',
    url: `/api/v1/team/${teamID}/wiki/${wikiID}`,
  });
  return result.data;
}

function Preview({
  title,
  content,
}) {
  return (
    <>
      <h1>{title}</h1>
      <ReactMarkdown remarkPlugins={[ remarkGfm ]} rehypePlugins={[ rehypeRaw ]} className="md-content">
        {content}
      </ReactMarkdown>
    </>
  );
}

function Editor({
  content,
  title,
  onChangeContent = () => 0,
  onChangeTitle = () => 0,
  handleSubmit = () => 0,
}) {
  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-2">
          <Col>
            <Form.Control onChange={onChangeTitle} defaultValue={title} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Control as="textarea" onChange={onChangeContent} defaultValue={content} rows={15} />
          </Col>
        </Row>
      </Form>
    </>
  );
}


function Menu({
  menu,
  setMenu,
}) {
  return (
    <>
      <p onClick={e => setMenu(0)}>편집기</p>
      <p onClick={e => setMenu(1)}>미리보기</p>
    </>
  );
}


function WikiEditor({
  fetchedData = {
    wikiTitle: '',
    wikiContent: '',
  },
  onSubmit,
  onDelete,
  editmode,
}) {
  const [ title, setTitle ] = React.useState(fetchedData.wikiTitle);
  const [ content, setContent ] = React.useState(fetchedData.wikiContent);
  const [ menu, setMenu ] = React.useState(1);
  const disabled = React.useMemo(() => {
    console.log(fetchedData.content === content, fetchedData.title === title);
    return fetchedData.wikiContent === content && fetchedData.wikiTitle === title;
  }, [ title, content, fetchedData ]);
  const handleDelete = () => {
    onDelete();
  };
  const handleChangeTitle = e => {
    setTitle(e.target.value);
  }
  const handleChangeContent = e => {
    setContent(e.target.value);
  }
  const handleSubmit = () => {
    onSubmit({
      content,
      title,
    });
  };
  const view = React.useMemo(() => {
    if(menu === 1) {
      return <Preview content={content} title={title} />
    } else if(menu === 0) {
      return <Editor content={content} title={title} onChangeTitle={handleChangeTitle} onChangeContent={handleChangeContent} handleSubmit={handleSubmit} />
    }
    return null;
  }, [ menu, content, title ]);

  return (
    <>
      <Menu menu={menu} setMenu={setMenu} />
      {view}
      {editmode && <Button onClick={handleDelete} >삭제</Button>}
      <Button onClick={handleSubmit} disabled={disabled} >적용</Button>
    </>
  );
}
function EditPage({
  teamID,
  wikiID,
}) {
  const [ fetchedData, setFetchedData ] = React.useState(null);
  const history = ReactRouter.useHistory();
  const handleSubmit = input => {
    add({
      teamID,
      wikiID,
      wikiContent: input.content,
      wikiTitle: input.title,
    }).then(redirectURL => history.go(0));
  };
  const handleDelete = () => {
    deleteWiki({
      teamID,
      wikiID,
    }).then(() => history.push(`/ui/team/${teamID}/wiki`), () => alert('실패했습니다.'));
  }
  React.useLayoutEffect(() => {
    get({
      teamID,
      wikiID,
    }).then(setFetchedData, () => 0);
  }, [ teamID, wikiID ]);
  return fetchedData ? <WikiEditor onSubmit={handleSubmit} fetchedData={fetchedData} editmode onDelete={handleDelete} /> : null;
}
function AddPage({
  teamID,
}) {
  const history = ReactRouter.useHistory();
  const handleSubmit = input => {
    add({
      teamID,
      wikiContent: input.content,
      wikiTitle: input.title,
    }).then(redirectURL => history.push(redirectURL));
  };
  return <WikiEditor onSubmit={handleSubmit} />
}
export default function WikiEdit({
  editmode
}) {
  const params = ReactRouter.useParams();
  if(editmode) {
    return <EditPage wikiID={params.wikiID} teamID={params.teamID} />
  }
  return <AddPage teamID={params.teamID} />
}
