[![Build Status](https://travis-ci.org/barteh/as-service.svg?branch=master)](https://travis-ci.org/barteh/as-service)

# AsService

---
## A chained, cascade, parametric, observable and promise base data service. based on rxjs, using axios as default connector http server (XHR) and localforge for cache in indexedDB.


### why use AsService?
> Rxjs is greate and nice library implements event driven pattern but there are some little vacancy. thus using Rxjs directly for web application for data flow is not easy. you shuld create and manage observables on fly. no parametric observables. no pure reusable way to loading data from source like http and ... .  According to our experiance we crated current library that provides every thing as a parametric observable  service coveres wide range of  needs easily. so we created other tool named withservice base on this for using easily rxjs in react. [@barteh/react-withservice](https://github.com/barteh/react-withservice) .


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
