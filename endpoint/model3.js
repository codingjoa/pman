
function API() {
  this.view = (res, payload) => res.json(payload);
  this.method = new Map();
  this.model = null;
}
API.prototype.getController = function getController() {
  const message = this.message;
  const model = this.model;
  const view = this.view;
  const method = this.method;
  const handlar = {
    get(req, name) {
      if(!method.has(name)) {
        return;
      }
      return method.get(name)(req);
      //const value method.get(name)(req);
      //return method.get(name)(req);
    }
  };
  const binder = function binder() {
    return async (req, res) => {
      const proxy = new Proxy(req, handlar);
      const payload = await model(proxy);
      view(res, payload ?? {});
    };
  };
  const controller = binder.call(null);

  return (req, res, next) => {
    controller(req, res).catch(err => next(err));
  }
};
API.prototype.setParameter = function ({
  name,
  method
}) {
  this.method.set(name, method);
}
API.prototype.setModel = function setModel(model, allowContentTypes) {
  this.model = model;
};
API.prototype.setView = function setView(code = 200) {};

const app = require('../loadModules').app;
BuilderRoot(app, '/api/v1', root => {
  root.child('/test', Parent => {
    Parent.child('/user', Parent2 => {
      Parent2.read(api => {
        api.setModel(async () => ({ message: "안녕하세요" }));
        //api.setMessage('user Page');
      });
      Parent2.child('/me', Parent3 => {
        Parent3.read(API => {
          API.setModel(async () => ({ message: "안녕하세요 당신" }))
        });
      });
      Parent2.child('/:id', Parent3 => {
        Parent3.read(API => {
          API.setParameter({ name: 'id', method: req => req.params.id });
          API.setModel(async params => ({ id: params.id, message: "요청한 ID", pw: params.pw }));
        });
      });
    });
  })
});
app.listen(3500);

function Builder(path, DI) {
  // 메모리 누수 미검사
  this.path = path;
  this.CRUD = {};
  this.children = new Map();

  this.create = function create(worker) {
    const api = new API();
    worker(api);
    this.CRUD.Create = api.getController();
  };
  this.read = function read(worker) {
    const api = new API();
    worker(api);
    this.CRUD.Read = api.getController();
  };
  this.update = function update(worker) {
    const api = new API();
    worker(api);
    this.CRUD.Update = api.getController();
  };
  this.delete = function Delete(worker) {
    const api = new API();
    worker(api);
    this.CRUD.Delete = api.getController();
  };
  this.patch = function patch(worker) {
    const api = new API();
    worker(api);
    this.CRUD.Patch = api.getController();
  };
  this.setMiddlewares = function setMiddlewares(...middlewares) {
    this.CRUD.Middlewares = middlewares;
  }
  this.child = function child(path, model) {
    const child = new Builder(path);
    model(child, DI);
    this.children.set(path, child);
  };
  this.parse = function parse(app) {
    const router = app(this.path, this.CRUD);
    for(const [ key, child ] of this.children) {
      child.parse(router);
    }
  };
}

function BuilderRoot(app, path, model = () => {}, DI) {
  const root = new Builder(path, DI);
  model(root, DI);
  root.parse(app);
}

module.exports = BuilderRoot;
