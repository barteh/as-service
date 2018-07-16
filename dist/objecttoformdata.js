"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (obj) {
  let str = "";
  for (let k in obj) {
    str += k + "=" + obj[k] + "&";
  }
  str = str.slice(0, str.length - 1);
  return str;
};