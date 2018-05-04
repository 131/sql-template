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
  {query:'SELECT * FROM foo', values: []} 

pg(SQL`SELECT * FROM foo WHERE age > ${22}`)
  {query:'SELECT * FROM foo WHERE age > $1 ', values: [22]} 

// $where$ tag
pg(SQL`SELECT * FROM foo $where${ {name:'John doe'} }`)
  {query:'SELECT * FROM foo WHERE "name" = $1 ', values: ["John doe"]} 

pg(SQL`SELECT * FROM foo $where${ {id:[1,2,3], type:'snow'} }`)
  {query:'SELECT * FROM foo WHERE "id" IN($1,$2,$3) AND "type"=$4 ', values: [1,2,3,"snow"]} 

```

# Tags (transformers) list
## $where$

## $set$

## $values$

Note that transformers internaly use `?:` as parameter placeholder, per jsonb compliance.


# Static API
## SQL.search_blob (search_field, expression)
Compute a smart query expression.




# TODO
* Get rich or die tryin'

# Shoutbox, keywords, SEO love
pg, sql, sql-string, sql-builder, ES6 template string, prepared statement, escape, "Let's have a beer & talk in Paris"

# Credits
* [131](https://github.com/131)

