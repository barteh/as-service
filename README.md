[![Build Status](https://travis-ci.org/barteh/as-service.svg?branch=master)](https://travis-ci.org/barteh/as-service)

# AsService

## Use any data as a service

### A super simple and easy to use reactive library for subscribing to any data. contains a hook for react js.
---

### What does it exactly do?
> It helps programmers (both back and front end) to avoid complexity of traditional state management systems such as React Redux and reactive programming pattern library like Rxjs. It is lightweight and easy to use library contains one core function and a hook for react. By using it we can subscribe vast the majority of data type such as primitive, complex, promises and function as a service and receive all changes by particular parameter (parametric subscription). We do not even need to control the subscribe-unsubscribe process in react with simple hook it do all the process automatically.




### Install

```cmd
npm i @barteh/as-service --save
```


### Usage


#### Import library

```js
import { AsService, Server } from "@barteh/as-service";
```


#### one: Primitive type (number | string | Array) as service

```js
var srv1 = new AsService(5); // number as service
srv1.Observable()
.subscribe(a => console.log("ser1 data via observable is:", a));

srv1.load().then(a => console.log("ser1 data via promis:", a));
```

#### two: Pure object as service

```js
var srv2 = new AsService({x: 9}); // object as service

srv2.Observable()
.subscribe(a => console.log("ser2 data via observable is:", a));

srv2.load().then(a => console.log("ser2 data via promis:", a));
```

#### three: Function as service (parametric observable)

```js
var srv3 = new AsService(param => param * 3); // function as service
srv3.Observable(2) //parametric observe
.subscribe(a => console.log("ser3 data via observable is:", a));

//passing (Number) 2  as parameter
srv3.load(2).then(a => console.log("ser3 data via promis:", a));
```

#### four: Promise as service 

```js
var ser4 = new AsService(param => new Promise((res, rej) => res(`im promise with parameter: ${param}`)));

ser4.Observable("myparam")
.subscribe(a => console.log("srv4: ", a));

ser4.load("myparam");
```

#### five: XHR as Service

 >using built in advanced methods name [ Server ] wraps axios for retrive data from http server and localforge for cache data.
 Following sample uses class [ Server ]  as input of AsService. You can use your own xhr library instead of this.

if  http://myserver/contacts/getcontact.ctrl http REST service exists.

```js
import {AsService,Server} from "@barteh/as-service"

var controller1 = (x, y) => Server.controller("contacts","getcontact", { name: x, lname: y });

var srv5 = new AsService(controller1);

srv5.Observable("Ahad", "Rafat")
.subscribe(a => console.log("srv5:", a));
```


#### six: observe state
> current state of a service is observable
    states can be one of ["start","loading","idle"]
```js

var srv6=new AsService(8);

srv6.StateObservable(77).subscribe(a=>console.log("current state is: ",a))

srv6.load(77);

```

#### Output

```cmd

> ser1 data via observable is: 5
> ser2 data via observable is: { x: 9 }
> ser3 data via observable is: 6
> srv4:  im promise with parameter: myparam

```

#### seven: AsService as AsService (Recursive Service)
> asn  AsService can use argument of constructor with deferent mapper but same loader. this is usefull to derivate a service from other. it important if you want to decrease number of services complexity and increase reusability of code.

```js
const ser1=new AsService([5,6,7,8]);
const ser2=new AsService(ser1,/*mapper*/ a=>a.map(b=>b*2)); //=> [10,12,14,16]
``` 

#### eight: derive from a Service using  map() operator.
> you can create new Service derived from another service using map operator. this operator sends both data and parameter to mapper function. mapper parameters can be more than loader parameters. 
```js
/*map(data,...params)*/
const ser1=new AsService((x,y)=>x+y);
const ser2=ser1.map((data,x,y,z)=>data+z);

ser1.load(/*x*/1,/*y*/,2,/*z*/,3)
.then(a=>console.log(a));
// output 
// > 6



```

```js
const ser1=new AsService([5,6,7,8]);
const ser2=ser1.map(a=>a.filter(b=>b<7)); // ==> [5,6]

```

### Test

 `npm  test`

## Using Both for web and node js

### Build

 `npm run build`


### Use in ES5

 ```js
 var { AsService } = require("@barteh/as-service");

var t = new AsService(8);

t.Observable()
.subscribe(a => console.log(a))
 ```

License: MIT
