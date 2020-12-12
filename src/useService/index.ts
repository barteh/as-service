// /*
//  * File: index.ts
//  * Project: @barteh/as-service
//  * File Created: Tuesday, 8th December 2020 12:33:18 pm
//  * Author: Ahad Rafat Talebi (office) (ahadrt@gmail.com)
//  * -----
//  * Last Modified: Tuesday, 8th December 2020 12:33:38 pm
//  * Modified By: Ahad Rafat Talebi (office) (ahadrt@gmail.com>)
//  * -----
//  * Copyright 2018 - 2021 Borna Mehr Fann, Borna Mehr Fann
//  * Trademark barteh
//  */
// /*
//  * File: useService.js
//  * Project: @barteh/react-withservice
//  * File Created: Wednesday, 16th October 2019 6:22:33 am
//  * Author: rafat (ahadrt@gmail.com)
//  * -----
//  * Last Modified: Wednesday, 16th October 2019 6:22:35 am
//  * Modified By: rafat (ahadrt@gmail.com>)
//  * -----
//  * Copyright 2018 - 2019 Borna Mehr Fann, Borna Mehr Fann
//  * Trademark barteh
//  */

// /**
//   * @class
//   * @classdesc return type of useService
//   *
//   */

//  import {useState, useEffect} from 'react';
//  import AsService from '../AsService';
// import {Subscription} from 'rxjs'

//  export type  TServiceStatus="loading" | "ready" | "error";

//  class AUseServiceReturnType {
//      /**
//       *
//       * @param {string} status , can be "loading" | "error" | "ready"
//       * @param {any} data an object or primitives return from servic
//       * @param {number} error contains http error codes like 404 or 500 ...
//       * @param {function} retry a function can do retry geting data for service
//       */
//      constructor(_status:TServiceStatus, _data?:any, _error?:number, _retry?:()=>any) {
//          this.status = _status;
//          this.data = _data;
//          this.error = _error;
//          this.retry = _retry;
//      }
 
//      status:TServiceStatus;
//      data:any;
//      error?:number;
//      retry?:()=>any;
//      toArray() {
//          return [this.status, this.data, this.error, this.retry]
//      }
//  }
 
//  /**
//   * @param {AsService} service
//   * @param  {any[]} params
//   * @returns {AUseServiceReturnType} {status, data, error, retry}
//   * @description Custom react hook for using ASService. 2 deferent mode of return can be used
//   * 1-{status, data, error, retry}=useService(...)
//   * 2-[status, data, error, retry]=useService(...).toArray()
//   *
//   */
//  export default function useService(service:AsService, ...params:any[]):AUseServiceReturnType {
 
//      if (service === undefined) 
//          throw new Error("service cant be undefined in useService");
     
//      function retry() {
//          setRet(new AUseServiceReturnType ("loading"));
//         return service.refresh(...params);
//      }
 
//      const [ret,
//          setRet] = useState(new AUseServiceReturnType("loading"));
//      useEffect( () => {
 
//          let sub:Subscription ,
//              errorsub:Subscription ;
 
//          function handleChangeDone(data:any) {
//              setRet(new AUseServiceReturnType("ready", data,undefined,retry));
//          }
//          function handleChangeError(error:number) {
//              setRet(new AUseServiceReturnType("error", undefined, error, retry));
//          }
//           sub = service
//              .Observable(...params)
//              .subscribe(handleChangeDone);
//          errorsub = service
//              .ErrorObservable(...params)
//              .subscribe(handleChangeError);
 
//          const getData = async() => {
//              await service.get(...params);
//          }
 
//          getData();
//          return () => {
//              setRet(new AUseServiceReturnType("loading"))
//              if (sub) 
//                  sub.unsubscribe();
//              if (errorsub) 
//                  errorsub.unsubscribe();
//              };
                  
//      }, [...params]);
 
//      return ret;
 
//  }
 