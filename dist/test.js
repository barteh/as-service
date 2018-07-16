"use strict";

var _btServer = require("./bt-server");

var _btService = require("./bt-service");

//1-  primitive type (number  | string | Array) as service
var srv1 = new _btService.BtService(5); // number as service
srv1.Observable().subscribe(function (a) {
  return console.log("ser1 data via observable is:", a);
});

srv1.load().then(function (a) {
  return console.log("ser1 data via promis:", a);
});

//output:
// ser1 data via observable is: 5
// ser1 data via promis: 5

//2- pure object  as service
var srv2 = new _btService.BtService({ x: 9 }); // number as service

srv2.Observable().subscribe(function (a) {
  return console.log("ser2 data via observable is:", a);
});

srv2.load().then(function (a) {
  return console.log("ser2 data via promis:", a);
});

//3- function as service (parametric observable)
var srv3 = new _btService.BtService(function (param) {
  return param * 3;
}); // function as service
srv3.Observable(2) //parametric observe
.subscribe(function (a) {
  return console.log("ser3 data via observable is:", a);
});
//passing (Number) 2  as parameter
srv3.load(2).then(function (a) {
  return console.log("ser3 data via promis:", a);
});

//4- Promise as service 

var ser4 = new _btService.BtService(function (param) {
  return new Promise(function (res, rej) {
    return res("im promise with parameter: " + param);
  });
});

ser4.Observable("myparam").subscribe(function (a) {
  return console.log("srv4: ", a);
});

ser4.load("myparam");

//5- XHR as parameter
// using built in advanced methods name [ BtServer ] wraps axios and localforge for cache data
// can use Btserver as imput of Btservice

var server = function server(x, y) {
  return new _btServer.BtServer.controller("controller", "method", { name: x, lname: y });
};

var srv5 = new _btService.BtService(server);

srv5.Observable("Ahad", "Rafat").subscribe(function (a) {
  return console.log("srv5:", a);
});