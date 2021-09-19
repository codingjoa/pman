const mariadb = require('mariadb');
const config = require('./database.config');
const pool = mariadb.createPool(config);

// concept
// maria('query...', { paramStatements })('query...',{})();
const sym = Symbol('set');
async function mariaBatch(query, batch) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    await conn.batch(query, batch);
    await conn.commit();
  } catch(err) {
    await conn.rollback();
  }
  await conn.release();
}

async function mariaExecute() {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  const resultSet = [];
  let resultSetIndex = 0;
  let lastReturn = undefined;
  try {
    const iterator = this[sym];
    for(const { param, query, callback } of iterator) {
      if(callback) {
        lastReturn = callback(lastReturn);
        //resultSet = [];
        //resultSetIndex = 0;
      } else {
        const result = await conn.query(query, param);
        resultSet[resultSetIndex++] = result;
        lastReturn = {
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

function mariaBatch(query, ...params) {
  // 첫 호출때는 this에 아무것도 없기 때문에 undefined가 나옵니다.
  // 파라미터가 3개 이상인 경우 batch모드로만 동작합니다.
  if(this[sym] !== undefined) {
    //  batch명령은 query와 함께 사용할 수 없으므로 this[sym]이 있음은 query 바인딩이 된 적이 있음을 의미합니다.
    throw new Error('batch 명령은 query 명령과 함께 사용할 수 없다.');
  }
  return mariaBatch(query, params);
}

function mariaQuery(query, param) {
  if(query === undefined) {
    if(this[sym] === undefined) {
      throw new Error('query 바인딩 없이는 실행을 할 수 없다.');
    }
    return mariaExecute.bind(this)();
  }
  if(this[sym] === undefined) {
    this[sym] = new Set();
  }
  this[sym].add({
    query: (param instanceof Array || param === undefined) ? query : {
      namedPlaceholders: true,
      sql: query
    },
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
  } else {
    throw new Error('지원되지 않는 작업');
  }
}

module.exports = mariaBind;
// 412code ParameterError
