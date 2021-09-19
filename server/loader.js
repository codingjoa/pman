const express = require('express');

function Header(CRUD) {
  const Allow = ['OPTIONS'];
  for(const key in CRUD) {
    if(key === 'Create') {
      Allow.push('POST');
    } else if(key === 'Read') {
      Allow.push('GET');
    } else if(key === 'Update') {
      Allow.push('PUT');
    } else if(key === 'Delete') {
      Allow.push('DELETE');
    } else if(key === 'Patch') {
      Allow.push('PATCH');
    }
  }
  return Allow;
}

function loader(path, CRUD) {
  // 이 함수에 바인딩된 this.init()의 반환값을 가져옵니다.
  parentRouter = this.init();
  // { Create(), Read(), Update(), Delete() }
  CRUD?.Create && parentRouter.post(path, CRUD.Create);
  CRUD?.Read && parentRouter.get(path, CRUD.Read);
  CRUD?.Update && parentRouter.put(path, CRUD.Update);
  CRUD?.Delete && parentRouter.delete(path, CRUD.Delete);
  CRUD?.Patch && parentRouter.patch(path, CRUD.Patch);
  parentRouter.head(path, (req, res) => res.set('Allow', Header(CRUD).toString()))
  // loader(app)('/api', CRUDObject) 형태를 위해 클로저를 사용한 함수 init을 포함한 객체를 this로 바인딩합니다.
  const loaderChild = loader.bind({
    router: null,
    init() {
      if(this.router !== null) {
        // router가 중복으로 use되는 것을 방지하기 위해 기존 라우터 재사용
        return this.router;
      }
      const parentPath = path;
      const router = express.Router();
      this.router = router;
      parentRouter.use(parentPath, router);
      return router;
    }
  })
  return loaderChild;
}
function loaderRoot(app) {
  const loaderChild = loader.bind({
    init() {
      // 첫 바인딩은 express의 app을 그대로 반환합니다.
      return app;
    }
  });
  // 최상위 loader는 유일하게 listen을 수행할 수 있습니다.
  // main 입장에서는 app에 직접 접근이 차단됩니다.
  Object.setPrototypeOf(loaderChild, {
    listen() {
      app.use(require('./errorHandlar'));
      app.listen(...arguments);
    }
  });
  return loaderChild;
}

module.exports = loaderRoot;
