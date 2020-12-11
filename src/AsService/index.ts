/*
 * File: AsService.ts
 * Project: @barteh/as-service
 * File Created: Thursday, 13th June 2019 7:27:52 am
 * Author: rafat (ahadrt@gmail.com)
 * -----
 * Last Modified: Wednesday, 16th October 2019 1:46:46 am
 * Modified By: rafat (ahadrt@gmail.com>)
 * -----
 * Copyright 2018 - 2021 Borna Mehr Fann, Borna Mehr Fann
 * Trademark barteh
 */
import { AObservable, ASubscriber } from "../AObservable";

import { btoa } from "../utils";

declare type TMapper = (...params: any[]) => any;

interface ISub {
  sub: AObservable;
  state: "start" | "idle" | "loading";
  stateSub: AObservable;
  errorSub: AObservable;
  sourceObservable?: ASubscriber;
}
/**
 * @class
 * @classdesc an Observable service of everything
 * @name AsService
 */
export default class AsService {
  private _source: any;
  private _paramCount: number = 0;
  private _loader: any = undefined;
  private _mapper: TMapper;
  private _autoload: boolean;
  private _lastParams: any[];
  private _subs: { [hash: string]: ISub } = {};

  /**
   * @constructor
   * @param {any} loader constant primitives | function | Promise | AObservable
   * @param {function} mapper  function convert returned data
   * @param {boolean} autoload if true automaticaly load promis or async data
   * @param {number} paramcount number of parameters (internal use)
   * @param {boolean} forceSourceLoad if true force to reload even when data is exist
   */
  constructor(
    loader: any,
    mapper: TMapper = (a: any) => a,
    autoload: boolean = false,
    paramcount: number = 0,
    forceSourceLoad: boolean = false
  ) {
    if (!loader) {
      throw "barte error: asService loader is not set";
    }

    
    if ( loader instanceof(AsService)) {
      console.log(111,loader)
      this._source = loader;
      this._paramCount = paramcount;
      this._forceSourceLoad = forceSourceLoad !== undefined;
    } else {
      if (typeof loader === "function") {
        this._loader = loader;
        this._paramCount = loader.length;
      } else {
        this._loader = () => loader;
      }
      if (autoload === true) this._reload();
    }

    this._mapper = mapper;

    this._autoload = autoload ? true : false;
  }

  _forceSourceLoad = false;

  /**
   * @description make derived service from source service with new other mapper function
   * @param {function} mapper reduser function converts data with extra parameters
   * @param {booleaan} forceLoadSource if true force to load even when data exist (for refresh data)
   * @returns {AsService} returns new instance of AsService
   * @example
   * ```js
   * const s1=new AsService(x=>2*x); // 2*x
   * const s2=p1.map((data,y)=>{data+y}); //2*x+y
   *
   * p2.load(3,2)
   * .then(result=>{console.log("result: "+result)}); // result: 8
   *
   * // or subscribe it
   *
   * p2.AObservable(3,2)
   * .subscribe(r=>{console.log("result: "+result)}) // result: 16
   *
   * p2.AObservable(5,2)
   * .subscribe(r=>{console.log("result: "+result)}) // nothing not loaded yet p2.load(5,2)
   *
   * ```
   *
   *      */
  map(mapper: TMapper, forceLoadSource: boolean = false): AsService {
    if (!mapper || typeof mapper !== "function") {
      return this;
    } else
      return new AsService(
        this,
        mapper,
        this._autoload,
        mapper.length - 1,
        forceLoadSource
      );
  }

  /**
   * @description get mapper function of this service
   * @returns {function} mapper function
   */
  getMapper(): TMapper {
    if (this._source) {
      let sourceMapper = this._source.getMapper();
      if (sourceMapper) {
        if (this._mapper)
          return (...params: any[]) =>
            this._mapper(sourceMapper(...params), ...params);
      } else return this._mapper;
    }
    return this._mapper;
  }

  /**
   * @description gets loader function of service
   * @returns {function} loader function
   */
  getLoader(): any {
    if (this._source) {
      return this._source.getLoader();
    } else return this._loader;
  }

  _sub = new AObservable();
  _errorSub = new AObservable();
  _stateSub = new AObservable();

  StateObservable(...params: any[]) {
    const subFor = this.getSub(params);

    return subFor.stateSub;
  }

  get ObservableAll(): AObservable {
    return this._sub;
  }

  get ErrorObservableAll(): AObservable {
    return this._errorSub;
  }

  ErrorObservable(...params: any[]): AObservable {
    let subfor = this.getSub(...params);
    return subfor.errorSub;
  }

  /**
   *
   * @param  {...any} params
   * @requires  AObservable
   */
  Observable(...params: any[]): AObservable {
    let subfor = this.getSub(...params);

    return subfor.sub;
  }

  refresh(...params: any[]): Promise<any> {
    return this.forceLoad(...(params || this._lastParams));
  }

  forceLoad(...params: any[]): Promise<any> {
    this._lastParams = params;
    if (this._source) {
      return this._source
        .load(...params)
        .then((a: any) => (this._mapper ? this._mapper(a, ...params) : a))
        .catch((e: Error) => e);
    } else return this._reload(...params);
  }

  load(...params: any[]): Promise<any> {
    var subfor = this.getSub(params);

    this._lastParams = params;
   
    if (this._source) {
      

      console.log(params)

      if (this._forceSourceLoad) {
        return this.forceLoad(...params);
      } else {
        subfor.state = "loading";
        subfor.stateSub.next("loading");
        return this._source
          .get(...params)
          .then((a: any) => {
            subfor.state = "idle";
            subfor.stateSub.next("idle");
            return this._mapper ? this._mapper(a, ...params) : a;
          })
          .catch((e: Error) => e);
      }
    } else {
      return this._reload(...params);
    }
  }

  get(...params: any[]): any {
    let subfor = this.getSub(...params);

    if (this._source) {
      return this._source.get(...params).then((a: any) => {
        if (this._mapper) return this._mapper(a, ...params);
        else return a;
      });
    } else {
      if (subfor.state === "start") {
        return this.load(...params);
      } else {
        let ret = new Promise((res, rej) => {
          let subs = subfor.sub.subscribe((a: any) => {
            res(a);
            subs.unsubscribe();
          });
          let esubs = subfor.errorSub.subscribe((e: any) => {
            rej(e);
            esubs.unsubscribe();
          });
        });

        return ret;
      }
    }
  }

  /**
   * @description calls all subscribers for all parameter combination
   */
  publishAll() {
    this.publish();
  }
  /**
   * @description calls all subscribers for just desired parameter combination
   * @param  {...any} params
   */
  publish(...params: any[]) {
    let sub = this.getSub(...params);
    const v = sub.sub.getValue();
    let nv = undefined;
    if (Array.isArray(v)) {
      nv = Array.from(v);
    } else if (typeof v === "object") {
      nv = Object.assign({}, v);
    } else {
      nv = v;
      // nv = Object.assign(v);
    }

    sub.sub.next(nv);

    this._sub.next(nv);
  }

  getSub(...params: any[]): ISub {   

    const pars: any = params.slice(0, this._paramCount);

    let tmp = btoa(encodeURIComponent(pars));

    console.log(2222,params,this._source)

    if (!this._subs[tmp]) {

      this._subs[tmp] = {
        sub:
          this._source === undefined
            ? new AObservable()
            : this._source
                .Observable(...params)
                .map((a: any) => this._mapper(a, ...pars)),
        errorSub:
          this._source === undefined
            ? new AObservable()
            : this._source.ErrorObservable(...params),
        stateSub:
          this._source === undefined
            ? new AObservable()
            : this._source.StateObservable(...params),
        state: this._source === undefined ? "start" : "idle",
      };
    }

    return this._subs[tmp];
  }

  getState(...params: any[]) {
    const sub = this.getSub(...params);
    return sub.state;
  }

  _reload(...params: any[]) {
    let subfor = this.getSub(...params);
    if (subfor.state === "loading") {
      let ret = new Promise((res, rej) => {
        let subs = subfor.sub.subscribe((a: any) => {
          res(a);
          subs.unsubscribe();
        });
        let esubs = subfor.errorSub.subscribe((e: any) => {
          rej(e);
          esubs.unsubscribe();
        });
      });

      return ret;
    }

    let ret = new Promise((res, rej) => {
      subfor.state = "loading";
      subfor.stateSub.next("loading");

      let fnret = this._loader(...params);

      const r = fnret;

      if (r instanceof(AObservable)) {
        console.log(3333,subfor.sourceObservable)
        if (subfor.sourceObservable !== undefined)
          subfor.sourceObservable.unsubscribe();
        subfor.sourceObservable = r.subscribe((b: any) => {
          let ret2 = this._mapper ? this._mapper(b, ...params) : b;
          subfor.sub.next(ret2);

          this._sub.next(ret2);
          
          subfor.sourceObservable!.unsubscribe();
        });
      } else if (r instanceof Promise) {

        fnret
          .then((d: any) => {
            subfor.state = "idle";
            subfor.stateSub.next("idle");
            let ret2 = this._mapper ? this._mapper(d, ...params) : d;

            res(ret2);

            subfor.sub.next(ret2);

            this._sub.next(ret2);
            return ret;
          })
          .catch((e: any) => {
            console.log(4558);
            subfor.state = "start";
            subfor.stateSub.next("start");

            subfor.errorSub.next(e);
            rej(e);

            this._errorSub.next(e);
          });
      } else {

        let ret = this._mapper ? this._mapper(r, ...params) : r;

        res(ret);
        subfor.sub.next(ret);

        this._sub.next(ret);

        subfor.state = "idle";
        subfor.stateSub.next("idle");
      }
    });

    return ret;
  }

  subscribe(func: (a: any) => any, ...params: any[]) {
    if (!func) {
      throw "as-service error: should pass function into subscribe() method ";
    }
    if (params.length < 1) {
      return this._sub.subscribe(func);
    } else {
      return this.getSub(...params).sub.subscribe(func);
    }
  }
}
