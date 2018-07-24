[![Build Status](https://travis-ci.org/barteh/as-service.svg?branch=master)](https://travis-ci.org/barteh/as-service)

# AsService
---
## a parametric, observable and  injectable service based on rxjs as a javascript library using axios for connect to http server (XHR) and localforge for cache in indexedDB

### install:

```
npm i @barteh/as-service --save
```

### usage:
####  import library
```js
import {AsService,Server} from "@barteh/as-service"
```

#### 1-  primitive type (number  | string | Array) as service
```js
var srv1=new AsService(5); // number as service
srv1.Observable()
.subscribe(a=>console.log("ser1 data via observable is:",a));

srv1.load().then(a=>console.log("ser1 data via promis:",a));
```


#### 2- pure object as service
```js
var srv2=new AsService({x:9}); // object as service

srv2.Observable()
.subscribe(a=>console.log("ser2 data via observable is:",a));

srv2.load().then(a=>console.log("ser2 data via promis:",a));
```

#### 3- function as service (parametric observable)
```js
var srv3=new AsService(param=>param*3); // function as service
srv3.Observable(2) //parametric observe
.subscribe(a=>console.log("ser3 data via observable is:",a));

//passing (Number) 2  as parameter
srv3.load(2).then(a=>console.log("ser3 data via promis:",a));
```

#### 4- Promise as service 
```js
var ser4=new AsService(param=>new Promise((res,rej)=>res(`im promise with parameter: ${param}`)));

ser4.Observable("myparam")
.subscribe(a=>console.log("srv4: ",a));

ser4.load("myparam");
```
#### 5- XHR as Service
 >using built in advanced methods name [ Server ] wraps axios for retrive data from http server and localforge for cache data.
 following sample uses class [ Server ]  as input of AsService. you can use your own xhr library insteed of this.

 
if  http://myserver/contacts/getcontact.ctrl http REST service is exist

```js
import {AsService,Server} from "@barteh/as-service"

var controller1=(x,y)=>Server Server.controller("contacts","getcontact",{name:x,lname:y});

var srv5=new AsService(controller1);

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
 `npm  test`

## usig Both for web and browsers

### Build
 `npm run build`


### use in ES5
 ```js
 var {AsService} =require("@barteh/as-service")

var t=new AsService(8);

t.Observable()
.subscribe(a=>console.log(a))
 ```


License: MIT
