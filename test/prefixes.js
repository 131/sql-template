"use strict";

const expect = require('expect.js');
const SQL    = require('../');



describe("Initial test suite", function(){

  it("should allow prefix expansion", function(){

    //nothing changed
    expect(SQL`SELECT * FROM $id${'test_foo'}`).to.eql({
      raw: `SELECT * FROM "test_foo"`,
      text: `SELECT * FROM "test_foo"`,
      values: [],
    });


    SQL.transformers.id.prefixes["test"] = "test.test_";


      //id transformer is now patched with a dummy prefix management

    expect(SQL`SELECT * FROM $id${'test_foo'}`).to.eql({
      raw: `SELECT * FROM "test"."test_foo"`,
      text: `SELECT * FROM "test"."test_foo"`,
      values: [],
    });

    expect(SQL.select("test_foo")).to.eql({
      raw: `SELECT * FROM "test"."test_foo"  WHERE TRUE `,
      text: `SELECT * FROM "test"."test_foo"  WHERE TRUE `,
      values: [],
    });


  });

  it("should preserver current behavior", function(){


    //nothing changed
    expect(SQL`SELECT * FROM $id${'bar'}`).to.eql({
      raw: `SELECT * FROM "bar"`,
      text: `SELECT * FROM "bar"`,
      values: [],
    });

  });


})