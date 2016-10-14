"use strict";

const expect = require('expect.js');
const SQL    = require('../');



describe("Search blob tests", function(){

  it("should expand query string properly", function(){

    expect(SQL.search_blob("search_blob", `sun 22, rain`)).to.eql({
      raw: "((search_blob  LIKE ?: AND search_blob  LIKE ?:) OR search_blob  LIKE ?:)",
      text: "((search_blob  LIKE $1 AND search_blob  LIKE $2) OR search_blob  LIKE $3)",
      values: [ "%sun%", "%22%", "%rain%" ],
    });

    expect(SQL.search_blob("search_blob", `sun 22 -rain`)).to.eql({
      raw: "(search_blob  LIKE ?: AND search_blob  LIKE ?: AND search_blob NOT LIKE ?:)",
      text: "(search_blob  LIKE $1 AND search_blob  LIKE $2 AND search_blob NOT LIKE $3)",
      values: [ "%sun%", "%22%", "%rain%" ],
    });

    expect(SQL.search_blob("search_blob", `-rain #35`, 'user_id')).to.eql({
      raw: "(search_blob NOT LIKE ?: AND \"user_id\"=?:)",
      text: "(search_blob NOT LIKE $1 AND \"user_id\"=$2)",
      values: [ "%rain%" , 35],
    });


    expect(SQL.search_blob("search_blob", ' ')).to.eql(false);
  });


})