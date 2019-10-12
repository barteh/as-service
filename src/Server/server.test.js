 import Server from './Server';
var cs=[];
for(var i=0;i<3;i++)
{
    Server.controller("http://localhost:22659/useraction","fulluserinfo",{x:i},{},c=>{cs[i]=c;console.log(13,c);})
.then(a=>{console.log(55,a.userId)})

}


//c();



