"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (obj) {
  var str = "";
  for (var k in obj) {
    str += k + "=" + obj[k] + "&";
  }
  str = str.slice(0, str.length - 1);
  return str;
};