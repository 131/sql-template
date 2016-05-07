"use strict";

var expect = require('expect.js');

var SQL    = require('../');


describe("Initial test suite", function(){

  it("Should check basic transposition", function(){
    expect(SQL`SELECT * FROM foo`).to.eql({
      raw  : 'SELECT * FROM foo',
      text : 'SELECT * FROM foo',
      values: [],
    });

    expect(SQL`SELECT * FROM foo WHERE age > ${22}`).to.eql({
      raw  : 'SELECT * FROM foo WHERE age > ?',
      text : 'SELECT * FROM foo WHERE age > $1',
      values: [22],
    });
  });

  it("Should allow mixing tag & non tagged values", function(){
  
    expect(SQL`SELECT * FROM foo $where${{id:44}} AND age > ${22} OR $id${'foo'} = ${42}`).to.eql({
      raw  : 'SELECT * FROM foo  WHERE "id"=? AND age > ? OR "foo" = ?',
      text : 'SELECT * FROM foo  WHERE "id"=$1 AND age > $2 OR "foo" = $3',
      values: [44, 22, 42],
    });

  });

  it("Should throw on unknown transformer", function(){
    expect(function(){
      return SQL`SELECT * FROM $optimus${{id:44}}`
    }).to.throwError(/Unknown transformer optimus/);
  });


  it("Should allow mixing tag & non tagged values", function(){
  
    expect(SQL`SELECT * FROM foo $where${{id:44}} AND age > ${22} OR $id${'foo'} = ${42}`).to.eql({
      raw  : 'SELECT * FROM foo  WHERE "id"=? AND age > ? OR "foo" = ?',
      text : 'SELECT * FROM foo  WHERE "id"=$1 AND age > $2 OR "foo" = $3',
      values: [44, 22, 42],
    });

  });


  it("Should check $id$ transposition", function(){

    expect(SQL`SELECT * FROM $id${'foo'}`).to.eql({
      raw: 'SELECT * FROM "foo"',
      text: 'SELECT * FROM "foo"',
      values: [],
    });

    expect(SQL`SELECT * FROM foo WHERE $id${'LOL'} $in${[1,2,3]}`).to.eql({
      raw: 'SELECT * FROM foo WHERE "LOL" IN(?,?,?)',
      text: 'SELECT * FROM foo WHERE "LOL" IN($1,$2,$3)',
      values: [ 1, 2, 3 ],
    });

    expect(SQL`SELECT * FROM foo WHERE $id${'LOL'} $in${[]}`).to.eql({
      raw: 'SELECT * FROM foo WHERE "LOL" IN(\'\')',
      text: 'SELECT * FROM foo WHERE "LOL" IN(\'\')',
      values: [],
    });
  });

  it("Should test $where$ tag transposition", function(){
    expect(SQL`SELECT * FROM foo $where${false}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE FALSE',
      text: 'SELECT * FROM foo  WHERE FALSE',
      values: [],
    });

    expect(SQL`SELECT * FROM foo $where${true}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE TRUE',
      text: 'SELECT * FROM foo  WHERE TRUE',
      values: [],
    });

    expect(SQL`SELECT * FROM foo $where${'45=FALSE AND TRUE'}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE 45=FALSE AND TRUE',
      text: 'SELECT * FROM foo  WHERE 45=FALSE AND TRUE',
      values: [],
    });

    expect(SQL`SELECT * FROM foo $where${{joe:'bar'}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe"=?',
      text: 'SELECT * FROM foo  WHERE "joe"=$1',
      values: [ 'bar' ],
    });

    expect(SQL`SELECT * FROM foo $where${{joe:true}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe"',
      text: 'SELECT * FROM foo  WHERE "joe"',
      values: [],
    });

    expect(SQL`SELECT * FROM foo $where${{joe:false,bar:true}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE NOT("joe") AND "bar"',
      text: 'SELECT * FROM foo  WHERE NOT("joe") AND "bar"',
      values: [],
    });

    expect(SQL`SELECT * FROM foo $where${{joe:[1,2,'ok']}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" IN(?,?,?)',
      text: 'SELECT * FROM foo  WHERE "joe" IN($1,$2,$3)',
      values: [ 1, 2, 'ok' ],
    });

    expect(SQL`SELECT * FROM foo $where${{joe:[1,2,'ok'],jane:22}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" IN(?,?,?) AND "jane"=?',
      text: 'SELECT * FROM foo  WHERE "joe" IN($1,$2,$3) AND "jane"=$4',
      values: [ 1, 2, 'ok', 22 ],
    });

    expect(SQL`SELECT * FROM foo $where${{joe:[],jane:22}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE FALSE AND "jane"=?',
      text: 'SELECT * FROM foo  WHERE FALSE AND "jane"=$1',
      values: [ 22 ],
    });

    expect(SQL`SELECT * FROM foo $where${{joe:null,jane:{}}}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" IS NULL AND "jane" IS NOT NULL',
      text: 'SELECT * FROM foo  WHERE "joe" IS NULL AND "jane" IS NOT NULL',
      values: [],
    });

    expect(SQL`SELECT * FROM foo $where${[{joe:true}, {jane:false}]}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE "joe" AND NOT("jane")',
      text: 'SELECT * FROM foo  WHERE "joe" AND NOT("jane")',
      values: [],
    })

      //nothing smart here
    expect(SQL`SELECT * FROM foo $where${[]}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE FALSE',
      text: 'SELECT * FROM foo  WHERE FALSE',
      values: [],
    });

    expect(SQL`SELECT * FROM foo $where${['ok', 'nope']}`).to.eql({
      raw: 'SELECT * FROM foo  WHERE ok AND nope',
      text: 'SELECT * FROM foo  WHERE ok AND nope',
      values: [],
    });
    
    expect(SQL`INSERT INTO foo $set${{joe:22,bar:'ok'}}`).to.eql({
      raw: 'INSERT INTO foo SET "joe"=?,"bar"=?',
      text: 'INSERT INTO foo SET "joe"=$1,"bar"=$2',
      values: [ 22, 'ok' ],
    });


  });

  it("Cannot support question mark in schema", function(){
      expect(function(){
        return SQL`SELECT '{"a":1, "b":2}'::jsonb ? 'b'`;
      }).to.throwException(/nope/);
  });

  it("Should check recursive transposition", function(){


    var sub = SQL`SELECT * FROM foo $where${{joe:[1,2,'ok']}}`;
      
    expect(SQL`SELECT * FROM lol $where${[{joe:22}, SQL`BAR IN(${sub})`]}`).to.eql({//, sub

      raw: 'SELECT * FROM lol  WHERE "joe"=? AND BAR IN(SELECT * FROM foo  WHERE "joe" IN(?,?,?))',
      text: 'SELECT * FROM lol  WHERE "joe"=$1 AND BAR IN(SELECT * FROM foo  WHERE "joe" IN($2,$3,$4))',
      values: [ 22, 1, 2, 'ok' ],
    });

    expect(SQL`SELECT * FROM lol $where${{joe:22}} AND BAR IN(${sub})`).to.eql({

      raw: 'SELECT * FROM lol  WHERE "joe"=? AND BAR IN(SELECT * FROM foo  WHERE "joe" IN(?,?,?))',
      text: 'SELECT * FROM lol  WHERE "joe"=$1 AND BAR IN(SELECT * FROM foo  WHERE "joe" IN($2,$3,$4))',
      values: [ 22, 1, 2, 'ok' ],
    });
    
  });
})