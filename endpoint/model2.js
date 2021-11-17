
class DefaultModel {}
function M2Root(app, path, Model, spreader) {
  const context = {
    MixedModel: DefaultModel,
    children: [],
    CRUD: {},
  };
  const setMixedModel = Model => {
    context.MixedModel = Model;
  };
  Object.setPrototypeOf(setMixedModel, {
    child(path, spreader) {
      context.children.push({
        path,
        spreader
      });
    },
    read() {
      const CloserModel = context.MixedModel;
      context.CRUD.Read = (req, res, next) => new CloserModel(req).read(res).catch(err => next(err));
    },
    create() {
      const CloserModel = context.MixedModel;
      context.CRUD.Create = (req, res, next) => new CloserModel(req).create(res).catch(err => next(err));
    },
    update() {
      const CloserModel = context.MixedModel;
      context.CRUD.Update = (req, res, next) => new CloserModel(req).update(res).catch(err => next(err));
    },
    delete() {
      const CloserModel = context.MixedModel;
      context.CRUD.Delete = (req, res, next) => new CloserModel(req).delete(res).catch(err => next(err));
    },
    patch() {
      const CloserModel = context.MixedModel;
      context.CRUD.Patch = (req, res, next) => new CloserModel(req).patch(res).catch(err => next(err));
    },
    middlewares() {
      context.CRUD.Middlewares = [ ...arguments ];
    }
  })
  spreader(setMixedModel, Model);
  const subapp = app(path, context.CRUD);
  context.children.forEach(row => {
    M2Root(subapp, row.path, context.MixedModel, row.spreader);
  });
}
module.exports = M2Root;
