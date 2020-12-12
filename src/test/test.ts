// import AsService from "../AsService"

// //1- primitive type (number | string | Array) as service

// var srv1=new AsService(5); // number as service
// srv1.Observable()
// .subscribe((a:any)=>console.log("ser1 data via observable is:",a));

// // yoop?.load(44)
// srv1.load().then((a:any)=>console.log("ser1 data via promis:",a));


// srv1.load(888)



// //2- pure object as service

// var srv2=new AsService({x:9}); // object as service

// srv2.Observable()
// .subscribe((a:any)=>console.log("ser2 data via observable is:",a));

// srv2.load();

// //3- function as service (parametric observable)

// var srv3=new AsService((param:any)=>param*3); // function as service
// srv3.Observable(2) //parametric observe
// .subscribe((a:any)=>console.log("ser3 data via observable is:",a));

// //or
// srv3.subscribe(a=>console.log("srv3 direct subscribe",a),3)
// //subscribe for all values of parameter
// srv3.subscribe(a=>console.log("srv3 all values subscribe",a))

// //passing (Number) 2  as parameter
// srv3.load(2)
// srv3.load(3)

// //4- Promise as service

// var ser4=new AsService((param:any)=>new Promise((res/*,rej*/)=>res(`im promise with parameter: ${param}`)));

// ser4.Observable("myparam")
// .subscribe((a:any)=>console.log("srv4: ",a));

// ser4.load("myparam");


// //5 map function for change return value to subscribers

// var srv5=new AsService(()=>2,(p)=>p*2);

// srv5.subscribe(a=>console.log("srv5 mapped service:",a));
// srv5.load()


// //6 derived from source service
// var srv6=new AsService((p1:any)=>2*p1);
// var derived=srv6.map((data)=>data);
// srv6.subscribe((a)=>console.log("self=============",a),7)


// derived.subscribe((a)=>console.log("derive=============",a))
// srv6.load(7)
// derived.load(99)
// //5- XHR as parameter

// //using built in advanced methods name [ Server ] wraps axios and localforge for cache data can use Server as imput of AsService if http://myserver/contacts/getcontact.ctrl http REST service is exist

// //---------------------var server=(x:any,y:any)=>new Server.controller("contacts","getcontact",{name:x,lname:y});

// //--------------------------var srv5=new AsService(server);



// //--------------srv5.Observable("param1 value","param2 value")
// //------------------.subscribe((a:any)=>console.log("srv5:",a));


// //6- observe state

// var srv6=new AsService((p:any)=>2*p);

// let subs=srv6.StateObservable(77).subscribe((a:any)=>console.log("current state is: ",a))
// srv6.StateObservable(77).subscribe((a:any)=>console.log(a))
// srv6.load(77);

// subs.unsubscribe()
