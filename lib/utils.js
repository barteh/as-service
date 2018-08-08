"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hashcode = hashcode;
exports.objectToFormData = objectToFormData;

function hashcode(inobjin) {
  var inobj = JSON.stringify(inobjin); //console.log(88888,inobj)
  //return;

  var hash = 0;
  if (inobj.length == 0) return hash;

  for (var i = 0; i < inobj.length; i++) {
    var char = inobj.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash.toString();
}

function objectToFormData(obj) {
  var str = "";

  for (var k in obj) {
    str += k + "=" + obj[k] + "&";
  }

  str = str.slice(0, str.length - 1);
  return str;
}