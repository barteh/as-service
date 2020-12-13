import AsService from "../AsService";


const srv=new AsService((a,b)=>2*a+b,d=>3*d);

srv.subscribe((d:any)=>{
    console.log("subscriber",d);
},2,8,9);
  srv.load(2,8)

// var srv=new AsService((r:any)=>r);
// var derived=srv.map((data,p2)=>{
//     console.log("maper function ", data,p2);    
//     return data+p2
// })
// srv.subscribe(a=>console.log("source:",a))

//  derived.subscribe(a=>console.log(">>>>>>>>>>>>>>>>>>>",a),2,7);
//  derived.load(2,7);




