import AsService from "../AsService";



var srv=new AsService((p:any)=>p);
var derived=srv.map((data,p2)=>data+p2)

 derived.subscribe(a=>console.log(">>>>>>>>>>>>>>>>>>>",a));
 srv.load(6);


