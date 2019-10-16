/*
 * File: AsService.js
 * Project: @barteh/as-service
 * File Created: Thursday, 13th June 2019 7:27:52 am
 * Author: rafat (ahadrt@gmail.com)
 * -----
 * Last Modified: Wednesday, 16th October 2019 1:46:46 am
 * Modified By: rafat (ahadrt@gmail.com>)
 * -----
 * Copyright 2018 - 2019 Borna Mehr Fann, Borna Mehr Fann
 * Trademark barteh
 */

import Rx from 'rxjs';
import {Object} from 'core-js';
import {btoa} from '../utils';

/**
 * @class
 * @classdesc an Observable service of everything
 * @name AsService
 */
export default class AsService {

    /**
     * @constructor
     * @param {any} loader constant primitives | function | Promise | Observable
     * @param {function} mapper  function convert returned data
     * @param {boolean} autoload if true automaticaly load promis or async data
     * @param {number} paramcount number of parameters (internal use)
     * @param {boolean} forceSourceLoad if true force to reload even when data is exist
     */
    constructor(loader, mapper, autoload, paramcount, forceSourceLoad) {
        if (!loader) {
            console.log("barte error:", "asService", "loader is not set");
            //return undefined;
        }

        if (loader !== undefined && loader.$$isAsService) {
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
            if (autoload === true) 
                this._reload();
            }
        
        this._mapper = mapper;

        this._autoload = autoload
            ? true
            : false;

        this.$$isAsService = true;
    }

    _forceSourceLoad = false;
    _paramCount = 0;

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
     * p2.Observable(3,2)
     * .subscribe(r=>{console.log("result: "+result)}) // result: 16
     * 
     * p2.Observable(5,2)
     * .subscribe(r=>{console.log("result: "+result)}) // nothing not loaded yet p2.load(5,2)
     * 
     * ```
     * service.map(())
     */
    map(mapper, forceLoadSource) {

        if (!mapper || typeof mapper !== "function") {
            console.log("AsService Error: mapper function not set")
            return undefined;
        } else 
            return new AsService(this, mapper, this._autoload, mapper.length - 1, forceLoadSource);
        }
    
    /**
     * @description get mapper function of this service
     * @returns {function} mapper function
     */
        getMapper() {
        if (this._source) {
            let sourceMapper = this
                ._source
                .getMapper();
            if (sourceMapper) {
                if (this._mapper) 
                    return (...params) => this._mapper(sourceMapper(...params), ...params);
                }
            else 
                return this._mapper

        }
        return this._mapper;
    }

    /**
     * @description gets loader function of service
     * @returns {function} loader function
     */
    getLoader() {
        if (this._source) {
            return this
                ._source
                .getLoader();
        } else 
            return this._loader;
        }
    
    _subs = {};
    _lastParams = [];
    _sub = new Rx.BehaviorSubject();
    _errorSub = new Rx.BehaviorSubject();

    get ObservableAll() {
        return this
            ._sub
            .filter(a => a !== undefined);
    }

    get ErrorObservableAll() {
        return this
            ._errorSub
            .filter(a => a !== undefined);
    }

    ErrorObservable(...params) {

        let subfor = this.getSub(...params)
        return subfor
            .errorSub
            .filter(a => a !== undefined);

    }

    /**
     * 
     * @param  {...any} params 
     * @requires rsjs observable
     */
    Observable(...params) {
        let subfor = this.getSub(...params);

        return subfor
            .sub
            .filter(a => a !== undefined);

    }

    refresh(...params) {
        return this.forceLoad(...(params || this._lastParams));
    }

    forceLoad(...params) {
        this._lastParams = params;
        if (this._source) {

            return this
                ._source
                .load(...params)
                .then(a => this._mapper
                    ? this._mapper(a, ...params)
                    : a)
                .catch(e => e);

        } else 
            return this._reload(...params);
        }
    
    load(...params) {

        var subfor = this.getSub(params);
        this._lastParams = params;
        if (this._source) {

            if (this._forceSourceLoad) {
                return this.forceLoad(...params);
            } else {

                subfor.sub.state = "loading";
                return this
                    ._source
                    .get(...params)
                    .then(a => {
                        subfor.sub.state = "idle";
                        return this._mapper
                            ? this._mapper(a, ...params)
                            : a
                    })
                    .catch(e => e);
            }

        } else {

            return this._reload(...params);
        }
    }

    get(...params) {
        let subfor = this.getSub(...params);

        if (this._source) {
            return this
                ._source
                .get(...params)
                .then(a => {
                    if (this.mapper) 
                        return this.mapper(a, ...params);
                    else 
                        return a;
                    }
                );
        } else {
            if (subfor.state === "start") {

                return this.load(...params);
            } else {

                let ret = new Promise((res, rej) => {
                    let subs = subfor
                        .sub
                        .subscribe(a => {

                            res(a);
                            subs.unsubscribe();
                        });
                    let esubs = subfor
                        .errorSub
                        .subscribe(e => {
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
    publish(...params) {

        let sub = this.getSub(...params);
        const v = sub
            .sub
            .getValue();
        let nv = undefined;
        if (Array.isArray(v)) {
            nv = Array.from(v);

        } else if (typeof v === "object") {
            nv = Object.assign({}, v);
        } else {
            nv = Object.assign(v);
        }

        sub
            .sub
            .next(nv);

        this
            ._sub
            .next(nv);

    }

    getSub(...params) {

        const pars = params.slice(0, this._paramCount);
        let tmp = btoa(encodeURIComponent(pars));

        if (!this._subs[tmp]) {

            this._subs[tmp] = {
                sub: this._source === undefined
                    ? new Rx.BehaviorSubject()
                    : this
                        ._source
                        .Observable(...params)
                        .map(a => this._mapper(a, ...pars)),
                errorSub: this._source === undefined
                    ? new Rx.BehaviorSubject()
                    : this
                        ._source
                        .ErrorObservable(...params)
                        .map(a => this._mapper(a, ...pars)),
                state: this._source === undefined
                    ? "start"
                    : "idle"
            };

        }
        return this._subs[tmp];

    }

    getState(...params) {
        const sub = this.getSub(...params);
        return sub.state;
    }

    _reload(...params) {

        let subfor = this.getSub(...params);
        if (subfor.state === "loading") {

            let ret = new Promise((res, rej) => {

                let subs = subfor
                    .sub
                    .subscribe(a => {
                        res(a);
                        subs.unsubscribe();
                    });
                let esubs = subfor
                    .errorSub
                    .subscribe(e => {
                        rej(e);
                        esubs.unsubscribe();
                    });

            });

            return ret;
        }

        let ret = new Promise((res, rej) => {

            subfor.state = "loading";

            let fnret = this._loader(...params);

            const r = fnret;

            if (r._isScalar !== undefined) {
                if (subfor.sourceObservable !== undefined) 
                    subfor.sourceObservable.unsubscribe();
                subfor.sourceObservable = r.subscribe(b => {

                    let ret2 = this._mapper
                        ? this._mapper(b, ...params)
                        : b;
                    subfor
                        .sub
                        .next(ret2);

                    this
                        ._sub
                        .next(ret2);

                })

            } else if (r instanceof Promise) {
                fnret.then(d => {

                    subfor.state = "idle";

                    let ret2 = this._mapper
                        ? this._mapper(d, ...params)
                        : d;

                    this.$data = ret2;

                    res(ret2);

                    subfor
                        .sub
                        .next(ret2);

                    this
                        ._sub
                        .next(ret2);
                    return ret;
                }).catch(e => {
                    subfor.state = "start";
                    res(e)
                    rej(e)
                    //  rej(e) try {     res(e); } catch (e2) {     rej(e2); }

                    subfor
                        .errorSub
                        .next(e);

                    this
                        ._errorSub
                        .next(e);

                });

            } else {

                let ret = this._mapper
                    ? this._mapper(r, ...params)
                    : r;
                res(ret);
                subfor
                    .sub
                    .next(ret);

                this
                    ._sub
                    .next(ret);

                subfor.state = "idle";

            }

        });

        return ret;
    }

    _getFromPromise() {}

}



