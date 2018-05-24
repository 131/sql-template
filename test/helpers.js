"use strict";

const expect = require('expect.js');
const SQL    = require('../');


describe("Testing helpers", function() {

  it("Should check SQL.insert_bulk", function() {
    expect(SQL.insert_bulk("foo", ["name", "age"], [["John Doe", 21], ["Edmond Dantès", 41]])).to.eql({
      raw  : "INSERT INTO \"foo\" (\"name\",\"age\") VALUES (?:,?:),(?:,?:)",
      text : "INSERT INTO \"foo\" (\"name\",\"age\") VALUES ($1,$2),($3,$4)",
      values : ["John Doe", 21, "Edmond Dantès", 41],
    });
  });

  it("Should check SQL.insert", function() {
    expect(SQL.insert("foo", {name : "John Doe"})).to.eql({
      raw  : "INSERT INTO \"foo\" (\"name\") VALUES (?:)",
      text : "INSERT INTO \"foo\" (\"name\") VALUES ($1)",
      values : ["John Doe"],
    });
  });



  it("Should check SQL.update", function() {
    expect(SQL.update("foo", {name : "John Doe"}, [false])).to.eql({
      raw  : "UPDATE \"foo\" SET \"name\"=?:  WHERE FALSE",
      text : "UPDATE \"foo\" SET \"name\"=$1  WHERE FALSE",
      values : ["John Doe"],
    });
  });

  it("Should check SQL.update", function() {
    expect(SQL.update("foo", {name : "John Doe"}, [false])).to.eql({
      raw  : "UPDATE \"foo\" SET \"name\"=?:  WHERE FALSE",
      text : "UPDATE \"foo\" SET \"name\"=$1  WHERE FALSE",
      values : ["John Doe"],
    });

    expect(SQL.update("foo", {name : "John Doe"})).to.eql({
      raw  : "UPDATE \"foo\" SET \"name\"=?:  WHERE TRUE",
      text : "UPDATE \"foo\" SET \"name\"=$1  WHERE TRUE",
      values : ["John Doe"],
    });
  });


  it("Should check SQL.select", function() {
    expect(SQL.select("foo", {name : "John Doe"}, "*")).to.eql({
      raw  : "SELECT * FROM \"foo\"  WHERE \"name\"=?: ",
      text : "SELECT * FROM \"foo\"  WHERE \"name\"=$1 ",
      values : ["John Doe"],
    });

    expect(SQL.select("foo")).to.eql({
      raw  : "SELECT * FROM \"foo\"  WHERE TRUE ",
      text : "SELECT * FROM \"foo\"  WHERE TRUE ",
      values : [],
    });
  });



//SQL.update
});
