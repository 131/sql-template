"use strict";




console.log(SQL`SELECT * FROM $id${'foo'}`);
console.log(SQL`SELECT * FROM foo WHERE $id${'LOL'} $in${[1,2,3]}`);
console.log(SQL`SELECT * FROM foo WHERE $id${'LOL'} $in${[]}`);
console.log(SQL`SELECT * FROM foo $where${false}`);
console.log(SQL`SELECT * FROM foo $where${true}`);
console.log(SQL`SELECT * FROM foo $where${'45=FALSE AND TRUE'}`);
console.log(SQL`SELECT * FROM foo $where${{joe:'bar'}}`);
console.log(SQL`SELECT * FROM foo $where${{joe:true}}`);
console.log(SQL`SELECT * FROM foo $where${{joe:false,bar:true}}`);
console.log(SQL`SELECT * FROM foo $where${{joe:[1,2,'ok']}}`);
console.log(SQL`SELECT * FROM foo $where${{joe:[1,2,'ok'],jane:22}}`);
console.log(SQL`SELECT * FROM foo $where${{joe:[],jane:22}}`);
console.log(SQL`SELECT * FROM foo $where${{joe:null,jane:{}}}`);
console.log(SQL`SELECT * FROM foo $where${[{joe:true},'AND', {jane:false}]}`);
console.log(SQL`SELECT * FROM foo $where${[]}`);
console.log(SQL`SELECT * FROM foo $where${['ok', 'nope']}`);
console.log(SQL`INSERT INTO foo $set${{joe:22,bar:'ok'}}`);

var sub = SQL`SELECT * FROM foo $where${{joe:[1,2,'ok']}}`;
  
console.log(SQL`SELECT * FROM lol $where${[{joe:22},'AND BAR IN(', sub, ')']}`);//, sub

//console.log(SQL`SELECT * FROM foo $where${where} GROUP BY $id${group}`);
