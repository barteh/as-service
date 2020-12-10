import AsService from "../AsService";

import AObservable from '../AObservable';

var o=new AObservable(8)
var s=o.map(p=>2*p)
var t=s.map(p=>3*p)
o.subscribe(a=>console.log("o",a))
s.subscribe(a=>console.log("s",a))
var ts=t.subscribe(a=>console.log("t",a))

o.next(33)
ts.unsubscribe()
o.next(1)

// var srv=new AsService(()=>5);
// var derived=srv.map((data,p2)=>{
//     console.log("maper function ", data);    
//     return data+p2
// })
// srv.subscribe(a=>console.log("source:",a))
//  derived.subscribe(a=>console.log(">>>>>>>>>>>>>>>>>>>",a));
//  srv.load(6);




