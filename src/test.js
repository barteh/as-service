//import {AsService,Server} from "./index"
import AsService from "./AsService"
import Server from "./Server"

//1- primitive type (number | string | Array) as service

var srv1=new AsService(5); // number as service
srv1.Observable()
.subscribe(a=>console.log("ser1 data via observable is:",a));

srv1.load().then(a=>console.log("ser1 data via promis:",a));

//2- pure object as service

var srv2=new AsService({x:9}); // object as service

srv2.Observable()
.subscribe(a=>console.log("ser2 data via observable is:",a));

srv2.load().then(a=>console.log("ser2 data via promis:",a));

//3- function as service (parametric observable)

var srv3=new AsService(param=>param*3); // function as service
srv3.Observable(2) //parametric observe
.subscribe(a=>console.log("ser3 data via observable is:",a));

//passing (Number) 2  as parameter
srv3.load(2).then(a=>console.log("ser3 data via promis:",a));

//4- Promise as service

var ser4=new AsService(param=>new Promise((res/*,rej*/)=>res(`im promise with parameter: ${param}`)));

ser4.Observable("myparam")
.subscribe(a=>console.log("srv4: ",a));

ser4.load("myparam");

//5- XHR as parameter

//using built in advanced methods name [ Server ] wraps axios and localforge for cache data can use Server as imput of AsService if http://myserver/contacts/getcontact.ctrl http REST service is exist

var server=(x,y)=>new Server.controller("contacts","getcontact",{name:x,lname:y});

var srv5=new AsService(server);

srv5.Observable("Ahad","Rafat")
.subscribe(a=>console.log("srv5:",a));
