# BtService
---
## a parametric, observable and  injectable service based on rxjs as a javascript library using axios for connect to http server (XHR) and localforge for cache in indexedDB

### install:

```js
npm i @barteh/btservice --save
```

### usage:
####  import library
```js
import {BtService,BtServer} from "@barteh/btservice"
```

#### 1-  primitive type (number  | string | Array) as service
```js
var srv1=new BtService(5); // number as service
srv1.Observable()
.subscribe(a=>console.log("ser1 data via observable is:",a));

srv1.load().then(a=>console.log("ser1 data via promis:",a));
```


#### 2- pure object  as service
```js
var srv2=new BtService({x:9}); // object as service

srv2.Observable()
.subscribe(a=>console.log("ser2 data via observable is:",a));

srv2.load().then(a=>console.log("ser2 data via promis:",a));
```

#### 3- function as service (parametric observable)
```js
var srv3=new BtService(param=>param*3); // function as service
srv3.Observable(2) //parametric observe
.subscribe(a=>console.log("ser3 data via observable is:",a));

//passing (Number) 2  as parameter
srv3.load(2).then(a=>console.log("ser3 data via promis:",a));
```

#### 4- Promise as service 
```js
var ser4=new BtService(param=>new Promise((res,rej)=>res(`im promise with parameter: ${param}`)));

ser4.Observable("myparam")
.subscribe(a=>console.log("srv4: ",a));

ser4.load("myparam");
```
#### 5- XHR as parameter
 using built in advanced methods name [ BtServer ] wraps axios and localforge for cache data
 can use Btserver as imput of Btservice
if  http://myserver/contacts/getcontact.ctrl http REST service is exist

```js

var server=(x,y)=>new BtServer.controller("contacts","getcontact",{name:x,lname:y});

var srv5=new BtService(server);

srv5.Observable("Ahad","Rafat")
.subscribe(a=>console.log("srv5:",a));
```
#### output:
```


> ser1 data via observable is: 5
> ser2 data via observable is: { x: 9 }
> ser3 data via observable is: 6
> srv4:  im promise with parameter: myparam

```

### Test:
 `npm run test`

## usig Es5
for using this service in ES5 projet need to build and get it from dist folder
 ### Build
 `npm run build`

 ```js
 var {BtService} =require("@barteh/btservice/dist/bt-service");

var t=new BtService(8);

t.Observable()
.subscribe(a=>console.log(a))
 ```


License: MIT
