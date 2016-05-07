"use strict";
var util = require('util');

var transformMask = new RegExp('\\$([a-zA-Z0-9_-]+)$');

var transformers = {};

function SQL(parts /*, ...values */){
  var values = [].slice.call(arguments, 1),
       parts = [].slice.call(parts); //this     is     javascript

  var str = "", data = [];
  parts.forEach(function(part, i){
    if(transformMask.test(part)) {
      let transformer = transformers[transformMask.exec(part)[1]];
      part = part.replace(transformMask, "");
      if(transformer)
        transformer(values[i], part, function(values, part){
          str += part;
          data = data.concat.apply(data, values);
          //parts[i] = { text : part, values : values };
        });
    } else {
      str += part;
    }
  });

  return  new Fragment(str, data)
}



class Fragment {

  constructor (text, values){
    this.raw = text;
    this.values = values;

    //now, replace all ? with proper $i placeholders
    let  parts = text.split('?');

    if(parts.length - 1 !== values.length) {
      console.error({parts, values});
      throw "nope";
    }

    this.text = parts.map(function(v, i){
      return i == values.length ? v :`${v}$${i+1}`;
    }).join('');

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
  if(type == "number" || type == "string")
    return chain([v], util.format('%s=?', k));

}

transformers["id"] = function(value, str, chain){
  chain([], str + escape(value));
}

transformers["in"] = function(values, str, chain){
  let length = values.length,
      pad = Array.apply(null, {length}).map(function(){return '?'});
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
    return chain(data, conds.join(' '));
  }

  if(type == "string")
    return chain([], vals);
    
  if(type == "object") {
    let conds = [], data = [];
    for(let k in vals)
      cond(k, vals[k], function(vals, txt){

        data.push.apply(data, vals);
        conds.push(txt);
      });
    return chain(data, conds.join(' AND '));
  }

}


transformers["where"] = function(vals, str, chain){
  where(vals, function(data, txt) {
    chain(data, `${str} WHERE ${txt}`);
  });
}


transformers["set"] = function(vals, str, chain){
  var values= [], keys = []; Object.keys(vals).forEach(function(k){
    keys.push(util.format('%s=?', escape(k)));
    values.push(vals[k]);
  });

  chain(values, str + "SET " + keys.join(','));
}

