const mariadb = require('mariadb');
const config = require('./database.config');
const pool = mariadb.createPool(config);

// concept
// maria('query...', { paramStatements })('query...',{})();
const sym = Symbol('set');
async function* mariaGenerator() {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  let options = null;
  let queryResult = true;
  try {
    options = yield queryResult;
    while(options !== undefined) {
      if(options instanceof Error) {
        throw options;
      }
      const result = await conn.query(options?.query, options?.state);
      queryResult = {
        rows: Array.from(result),
        affectedRows: result?.affectedRows,
        lastID: result?.insertId
      };
      options = yield queryResult;
    }
    queryResult = true;
    await conn.commit();
  } catch(err) {
    queryResult = false;
    await conn.rollback();
  }
  await conn.release();
  console.log('released');
  return queryResult;
}

async function mariaBatchExecute(query, callback, batch) {
  let storage = null;
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    await conn.batch(query, batch);
    storage = {
      ...(callback instanceof Function ? await callback() : null)
    };
    await conn.commit();
  } catch(err) {
    await conn.rollback();
  }
  await conn.release();
  return storage;
}

async function mariaExecute() {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  const resultSet = [];
  let resultSetIndex = 0;
  let queryResult = undefined;
  let storage = {};
  try {
    const iterator = this[sym];
    for(const { param, query, callback } of iterator) {
      if(callback instanceof Function) {
        storage = {
          ...storage,
          ...(await callback(queryResult, storage))
        };
        //resultSet = [];
        //resultSetIndex = 0;
      } else {
        const parameter = (param instanceof Function ? param(storage) : param);
        const usePlaceHolder = (parameter instanceof Array || parameter === undefined);
        const queryType = usePlaceHolder ? query : {
          namedPlaceholders: true,
          sql: query
        };
        const result = await conn.query(queryType, parameter);
        resultSet[resultSetIndex++] = result;
        queryResult = {
          rows: Array.from(result),
          affectedRows: result?.affectedRows,
          lastID: result?.insertId
        };
      }
    }
    await conn.commit();
    await conn.release();
  } catch(err) {
    await conn.rollback();
    await conn.release();
    throw err;
  }
  return resultSet;
}

function mariaBatch(query, callback, ...params) {
  // 첫 호출때는 this에 아무것도 없기 때문에 undefined가 나옵니다.
  // 파라미터가 3개 이상인 경우 batch모드로만 동작합니다.
  if(this?._execute) {
    throw new Error('query가 실행중이므로 새 query를 바인딩 할 수 없다.');
  }
  this._execute = true;
  return mariaBatchExecute(query, callback, params);
}

function mariaQuery(query, param) {
  if(this?._execute) {
    throw new Error('query가 실행중이므로 새 query를 바인딩 할 수 없다.');
  }
  if(query === undefined) {
    if(this[sym] === undefined) {
      throw new Error('query 바인딩 없이는 실행을 할 수 없다.');
    }
    this._execute = true;
    return mariaExecute.bind(this)();
  }
  if(this[sym] === undefined) {
    this[sym] = new Set();
  }
  this[sym].add({
    query,
    param,
    callback: (query instanceof Function && query)
  });
  return mariaQuery.bind(this);
}

function mariaBind(mode) {
  if(mode === 'query') {
    return mariaQuery.bind({});
  } else if(mode === 'batch') {
    return mariaBatch.bind({});
  } else if(mode === 'generator') {
    const generator = mariaGenerator();
    generator.next();
    return {
      async next(options) {
        return await generator.next(options)?.value;
      }
    }
  } else {
    throw new Error('지원되지 않는 작업');
  }
}

module.exports = mariaBind;
// 412code ParameterError
