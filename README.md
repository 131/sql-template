# Motivation
Template string (ES6) builder for SQL.


[![Build Status](https://travis-ci.org/131/sql-template.svg?branch=master)](https://travis-ci.org/131/sql-template)
[![Coverage Status](https://coveralls.io/repos/github/131/sql-template/badge.svg?branch=master)](https://coveralls.io/github/131/sql-template?branch=master)
[![NPM version](https://img.shields.io/npm/v/sql-template.svg)](https://www.npmjs.com/package/sql-template)
[![Code style](https://img.shields.io/badge/code%2fstyle-ivs-green.svg)](https://www.npmjs.com/package/eslint-plugin-ivs)


## Key features
* tag based (easily extensible)
* made with love
* very simple
* drop in compatible with pg
* strongly tested with 100% code coverage


# API/Usage
```
var SQL = require('sql-template');

pg(SQL`SELECT * FROM foo`)
  {text: 'SELECT * FROM foo', values: []} 

pg(SQL`SELECT * FROM foo WHERE age > ${22}`)
  {text: 'SELECT * FROM foo WHERE age > $1 ', values: [22]} 
```

# Tags (transformers) list
## $where$
```
pg(SQL`SELECT * FROM foo $where${ {name:'John doe'} }`)
  {text: 'SELECT * FROM foo WHERE "name" = $1 ', values: ["John doe"]} 

pg(SQL`SELECT * FROM foo $where${ {id: [1,2,3], type:'snow'} }`)
  {text: 'SELECT * FROM foo WHERE "id" IN($1,$2,$3) AND "type"=$4 ', values: [1,2,3,"snow"]} 
```

## $set$
```
pg(SQL`UPDATE foo $set${ {joe: 22, bar: 'ok'} }`)
  {text: 'UPDATE foo SET "joe"=$1,"bar"=$2', values: [22, 'ok']}
```

## $keys$
```
pg(SQL`INSERT INTO foo $keys${["joe", "bar"]} VALUES (${22}, ${'ok'})}`)
  {text: 'INSERT INTO foo ("joe", "bar") VALUES ($1,$2), values: [22, 'ok']}
```

## $values$
```
pg(SQL`INSERT INTO foo (joe, bar) $values${ {joe: 22, bar: 'ok'} }`)
  {text: 'INSERT INTO foo (joe, bar) VALUES ($1,$2), values: [22, 'ok']}
  
const obj = {joe: 22, bar: 'ok'};
pg(SQL`INSERT INTO foo $keys${Object.keys(obj)} $values${obj}`)
  {text: 'INSERT INTO foo ("joe","bar") VALUES ($1,$2), values: [22, 'ok']}
```
or use the `SQL.insert` static api.

## $id$
```
pg(SQL`SELECT * FROM $id${'foo'}`)
  {text: 'SELECT * FROM "foo"', values: []}
```

## $in$
```
pg(SQL`SELECT * FROM foo WHERE id $in${[1,2,3]}`)
  {text: `SELECT * FROM foo WHERE id IN($1,$2,$3)', values: [1,2,3]}
```

Note that transformers internaly use `?:` as parameter placeholder, per jsonb compliance.


# Static API

## SQL.insert
```
pq(SQL.insert('foo', {joe: 22, bar: 'ok'}))
  {text: 'INSERT INTO foo ("joe","bar") VALUES ($1,$2), values: [22, 'ok']}
```

## SQL.search_blob (search_field, expression)
Compute a smart query expression.




# TODO
* Get rich or die tryin'

# Shoutbox, keywords, SEO love
pg, sql, sql-string, sql-builder, ES6 template string, prepared statement, escape, "Let's have a beer & talk in Paris"

# Credits
* [131](https://github.com/131)

