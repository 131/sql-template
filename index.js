"use strict";
var util = require('util');

var transformMask = new RegExp('\\$([a-zA-Z0-9_-]+)$');

var transformers = {};

function SQL(parts /*, ...values */){
  var values = [].slice.call(arguments, 1),
       parts = [].slice.call(parts); //this     is     javascript

  var str = "", data = [];
  parts.forEach(function(part, i){
    if(i >= values.length) {
      str += part;
      return;
    }
    let value = values[i];

    if(transformMask.test(part)) {
      let name = transformMask.exec(part)[1], transformer = transformers[name];
      part = part.replace(transformMask, "");
      if(!transformer)
        throw `Unknown transformer ${name}`;
      transformer(value, part, function(values, part){
        str += part;
        data.push.apply(data, values);
      });
    } else {
      if(value instanceof Fragment) {
        str += part + value.raw;
        data.push.apply(data, value.values);
      } else {
        str += part + "?:";
        data.push(value);
      }
    }
  });

  return  new Fragment(str, data)
}



class Fragment {

  constructor (text, values){
    this.raw = text;
    this.values = values;

    //now, replace all ? with proper $i placeholders
    let  parts = text.split('?:');

    if(parts.length - 1 !== values.length)
      throw `Unsupported floating modifier`;

    this.text = parts.map(function(v, i){
      return i == values.length ? v :`${v}$${i+1}`;
    }).join('');

  }

  toString(){
    return this.raw;
  }
}


function escape(value){
  return util.format('"%s"', value);
}


function cond(k, v, chain){
  k = escape(k);
  var type = typeof v;

  if(Array.isArray(v) && v.length == 0)
    return chain([], "FALSE");
  if(Array.isArray(v))
    return transformers["in"](v, k + " ", chain);
  if(type == "object")
    return chain([], `${k} IS${v===null?'':' NOT'} NULL`);
  if(type == "boolean")
    return chain([], util.format(v?'%s':'NOT(%s)', k));

  //if(type == "number" || type == "string") //what else..
    return chain([v], util.format('%s=?:', k));
}

var sep = ".";
var id = function(value, str, chain){
  if(Object.keys(id.prefixes).length)
    value = resolve(value);

  chain([], str + value.split(sep).map(escape).join(sep) );
}

id.prefixes = {};

var resolve = function(value) {
  var reg = new RegExp('^(' + Object.keys(id.prefixes).join('|') + ')_');
  value = value.replace(reg, function(){
    return id.prefixes[arguments[1]];
  });
  return value;
}



transformers["id"] = id;
transformers["in"] = function(values, str, chain){
  let length = values.length,
      pad = Array.apply(null, {length}).map(function(){return '?:'});
  if(!length)
    return chain([], str + "IN('')");

  str += util.format('IN(%s)', pad.join(','));
  chain(values, str);
}

function where(vals, chain){

  let type = typeof vals;

  if(vals instanceof Fragment)
    return chain(vals.values, vals.raw);

  if(Array.isArray(vals) && vals.length == 0)
    return chain([], "FALSE");

  if(type == "boolean")
    return chain([], (vals ? "TRUE" : "FALSE" ));

  if(Array.isArray(vals)) {
    let conds = [], data = [];

    vals.forEach(function(val){
      where(val, function(vals, txt){
        data.push.apply(data, vals);
        conds.push(txt);
      });
    });
    return chain(data, conds.join(' AND '));
  }

  if(type == "object") {
    let conds = [], data = [];
    for(let k in vals)
      cond(k, vals[k], function(vals, txt){

        data.push.apply(data, vals);
        conds.push(txt);
      });
    return chain(data, conds.join(' AND '));
  }


//  if(type == "string") //what else
  return chain([], vals);
}


transformers["raw"] = function(vals, str, chain){
  chain([], str + vals);
}

transformers["where"] = function(vals, str, chain){
  where(vals, function(data, txt) {
    chain(data, `${str} WHERE ${txt}`);
  });
}

transformers["set"] = function(vals, str, chain){
  var values= [], keys = []; Object.keys(vals).forEach(function(k){
    keys.push(util.format('%s=?:', escape(k)));
    values.push(vals[k]);
  });

  chain(values, str + "SET " + keys.join(','));
}


transformers["values"] = function(vals, str, chain){
  var values= [], keys = [], place = [];

  Object.keys(vals).forEach(function(k){
    keys.push(escape(k));
    values.push(vals[k]);
    place.push("?:");
  });

  chain(values, util.format('%s (%s) VALUES (%s)', str, keys.join(','), place.join(',')));
}


SQL.insert = function(table, values) {
  return SQL`INSERT INTO $id${table} $values${values}`;
}

SQL.update = function(table, values /* [, where = true] */){
  var args = [].slice.apply(arguments),
      table = args.shift(),
      values = args.shift(),
      where = args.shift() || true;

  return SQL`UPDATE $id${table} $set${values} $where${where}`;
}

SQL.select = function(table, where, cols, extra){
  var args = [].slice.apply(arguments),
      table = args.shift(),
      where = args.shift()|| true,
      cols  = args.shift() || "*",
      extra = args.shift() || "";

  return SQL`SELECT $raw${cols} FROM $id${table} $where${where} $raw${extra}`;
}



module.exports = SQL;
module.exports.Fragment = Fragment;
module.exports.transformers = transformers;
