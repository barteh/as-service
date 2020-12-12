import AsService from "../AsService";
import { loadavg } from "os";


const srv=new AsService(a=>a);
srv.subscribe((d:any)=>{
    console.log("subscriber",d,d[0],d[1]);
},5);
srv.load(5)
// console.log(srv);

// import AsService from "../AsService";

// // import AObservable from '../AObservable';


// // axios(AObservable(8))

// var srv=new AsService((r:any)=>r);
// var derived=srv.map((data,p2)=>{
//     console.log("maper function ", data,p2);    
//     return data+p2
// })
// srv.subscribe(a=>console.log("source:",a))

//  derived.subscribe(a=>console.log(">>>>>>>>>>>>>>>>>>>",a),2,7);
//  derived.load(2,7);




