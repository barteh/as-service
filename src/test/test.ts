import AsService from "../AsService"

import process from "process"


//1- primitive type (number | string | Array) as service

var srv1=new AsService(5); // number as service
srv1.Observable()
.subscribe((a:any)=>console.log("ser1 data via observable is:",a));

srv1.load().then((a:any)=>console.log("ser1 data via promis:",a));

//2- pure object as service

var srv2=new AsService({x:9}); // object as service

srv2.Observable()
.subscribe((a:any)=>console.log("ser2 data via observable is:",a));

srv2.load().then((a:any)=>console.log("ser2 data via promis:",a));

//3- function as service (parametric observable)

var srv3=new AsService((param:any)=>param*3); // function as service
srv3.Observable(2) //parametric observe
.subscribe((a:any)=>console.log("ser3 data via observable is:",a));

//passing (Number) 2  as parameter
srv3.load(2).then((a:any)=>console.log("ser3 data via promis:",a));

//4- Promise as service

var ser4=new AsService((param:any)=>new Promise((res/*,rej*/)=>res(`im promise with parameter: ${param}`)));

ser4.Observable("myparam")
.subscribe((a:any)=>console.log("srv4: ",a));

ser4.load("myparam");

//5- XHR as parameter

//using built in advanced methods name [ Server ] wraps axios and localforge for cache data can use Server as imput of AsService if http://myserver/contacts/getcontact.ctrl http REST service is exist

//---------------------var server=(x:any,y:any)=>new Server.controller("contacts","getcontact",{name:x,lname:y});

//--------------------------var srv5=new AsService(server);



//--------------srv5.Observable("param1 value","param2 value")
//------------------.subscribe((a:any)=>console.log("srv5:",a));


//6- observe state

var srv6=new AsService((p:any)=>2*p);

let subs=srv6.StateObservable(77).subscribe((a:any)=>console.log("current state is: ",a))
srv6.StateObservable(77).subscribe((a:any)=>console.log(a))
srv6.load(77);

subs.unsubscribe()

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));