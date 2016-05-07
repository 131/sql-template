"use strict";

var expect = require('expect.js');
var SQL = require('../');


describe("Initial test suite", function(){

  it("Shoult check for sql transposition", function(){

    expect(SQL`SELECT * FROM $id${'foo'}`).to.eql({
      raw: 'SELECT * FROM "foo"',
      values: [],
      text: 'SELECT * FROM "foo"' 
    });

    expect(SQL`SELECT * FROM foo WHERE $id${'LOL'} $in${[1,2,3]}`).to.eql({
      raw: 'SELECT * FROM foo WHERE "LOL" IN(?,?,?)',
      values: [ 1, 2, 3 ],
      text: 'SELECT * FROM foo WHERE "LOL" IN($1,$2,$3)'
    });

    expect(SQL`SELECT * FROM foo WHERE $id${'LOL'} $in${[]}`).to.eql({
      raw: 'SELECT * FROM foo WHERE "LOL" IN(\'\')',
      values: [],
      text: 'SELECT * FROM foo WHERE "LOL" IN(\'\')'
    });

    expect(SQL`SELECT * FROM foo $where${false}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE FALSE',
      values: [],
      text: 'SELECT * FROM foo  WHERE FALSE' 
    });

    expect(SQL`SELECT * FROM foo $where${true}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE TRUE',
      values: [],
      text: 'SELECT * FROM foo  WHERE TRUE'
    });

    expect(SQL`SELECT * FROM foo $where${'45=FALSE AND TRUE'}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE 45=FALSE AND TRUE',
      values: [],
      text: 'SELECT * FROM foo  WHERE 45=FALSE AND TRUE'
    });

    expect(SQL`SELECT * FROM foo $where${{joe:'bar'}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe"=?',
      values: [ 'bar' ],
      text: 'SELECT * FROM foo  WHERE "joe"=$1'
    });

    expect(SQL`SELECT * FROM foo $where${{joe:true}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe"',
      values: [],
      text: 'SELECT * FROM foo  WHERE "joe"'
    });

    expect(SQL`SELECT * FROM foo $where${{joe:false,bar:true}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE NOT("joe") AND "bar"',
      values: [],
      text: 'SELECT * FROM foo  WHERE NOT("joe") AND "bar"'
    });

    expect(SQL`SELECT * FROM foo $where${{joe:[1,2,'ok']}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" IN(?,?,?)',
      values: [ 1, 2, 'ok' ],
      text: 'SELECT * FROM foo  WHERE "joe" IN($1,$2,$3)'
    });

    expect(SQL`SELECT * FROM foo $where${{joe:[1,2,'ok'],jane:22}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" IN(?,?,?) AND "jane"=?',
      values: [ 1, 2, 'ok', 22 ],
      text: 'SELECT * FROM foo  WHERE "joe" IN($1,$2,$3) AND "jane"=$4'
    });

    expect(SQL`SELECT * FROM foo $where${{joe:[],jane:22}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE FALSE AND "jane"=?',
      values: [ 22 ],
      text: 'SELECT * FROM foo  WHERE FALSE AND "jane"=$1'
    });

    expect(SQL`SELECT * FROM foo $where${{joe:null,jane:{}}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" IS NULL AND "jane" IS NOT NULL',
      values: [],
      text: 'SELECT * FROM foo  WHERE "joe" IS NULL AND "jane" IS NOT NULL'
    });

    expect(SQL`SELECT * FROM foo $where${[{joe:true},'AND', {jane:false}]}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" AND NOT("jane")',
      values: [],
      text: 'SELECT * FROM foo  WHERE "joe" AND NOT("jane")'
    })

    expect(SQL`SELECT * FROM foo $where${[]}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE FALSE',
      values: [],
      text: 'SELECT * FROM foo  WHERE FALSE'
    });

    expect(SQL`SELECT * FROM foo $where${['ok', 'nope']}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE ok nope',
      values: [],
      text: 'SELECT * FROM foo  WHERE ok nope'
    });
    
    expect(SQL`INSERT INTO foo $set${{joe:22,bar:'ok'}}`).to.eql({
      raw: 'INSERT INTO foo SET "joe"=?,"bar"=?',
      values: [ 22, 'ok' ],
      text: 'INSERT INTO foo SET "joe"=$1,"bar"=$2'
    });


    var sub = SQL`SELECT * FROM foo $where${{joe:[1,2,'ok']}}`;
      
    expect(SQL`SELECT * FROM lol $where${[{joe:22},'AND BAR IN(', sub, ')']}`).to.eql({//, sub

      raw: 'SELECT * FROM lol  WHERE "joe"=? AND BAR IN( SELECT * FROM foo  WHERE "joe" IN(?,?,?) )',
      values: [ 22, 1, 2, 'ok' ],
      text: 'SELECT * FROM lol  WHERE "joe"=$1 AND BAR IN( SELECT * FROM foo  WHERE "joe" IN($2,$3,$4) )'
    });
    
  });
})