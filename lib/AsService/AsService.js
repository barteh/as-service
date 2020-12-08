"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
;
var AObservable_1 = require("./AObservable");
var utils_1 = require("../utils");
/**
 * @class
 * @classdesc an Observable service of everything
 * @name AsService
 */
var AsService = /** @class */ (function () {
    /**
     * @constructor
     * @param {any} loader constant primitives | function | Promise | AObservable
     * @param {function} mapper  function convert returned data
     * @param {boolean} autoload if true automaticaly load promis or async data
     * @param {number} paramcount number of parameters (internal use)
     * @param {boolean} forceSourceLoad if true force to reload even when data is exist
     */
    function AsService(loader, mapper, autoload, paramcount, forceSourceLoad) {
        if (mapper === void 0) { mapper = function (a) { return a; }; }
        if (autoload === void 0) { autoload = false; }
        if (paramcount === void 0) { paramcount = 0; }
        if (forceSourceLoad === void 0) { forceSourceLoad = false; }
        this._paramCount = 0;
        this._loader = undefined;
        this._subs = {};
        this._forceSourceLoad = false;
        this._sub = new AObservable_1.AObservable();
        this._errorSub = new AObservable_1.AObservable();
        this._stateSub = new AObservable_1.AObservable();
        if (!loader) {
            console.log("barte error:", "asService", "loader is not set");
            //return undefined;
        }
        if (loader !== undefined && loader._isAsService) {
            this._source = loader;
            this._paramCount = paramcount;
            this._forceSourceLoad = forceSourceLoad !== undefined;
        }
        else {
            if (typeof loader === "function") {
                this._loader = loader;
                this._paramCount = loader.length;
            }
            else {
                this._loader = function () { return loader; };
            }
            if (autoload === true)
                this._reload();
        }
        this._mapper = mapper;
        this._autoload = autoload
            ? true
            : false;
    }
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
    AsService.prototype.map = function (mapper, forceLoadSource) {
        if (!mapper || typeof mapper !== "function") {
            console.log("AsService Error: mapper function not set");
            return undefined;
        }
        else
            return new AsService(this, mapper, this._autoload, mapper.length - 1, forceLoadSource);
    };
    /**
     * @description get mapper function of this service
     * @returns {function} mapper function
     */
    AsService.prototype.getMapper = function () {
        var _this = this;
        if (this._source) {
            var sourceMapper_1 = this
                ._source
                .getMapper();
            if (sourceMapper_1) {
                if (this._mapper)
                    return function () {
                        var params = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            params[_i] = arguments[_i];
                        }
                        return _this._mapper.apply(_this, __spreadArrays([sourceMapper_1.apply(void 0, params)], params));
                    };
            }
            else
                return this._mapper;
        }
        return this._mapper;
    };
    /**
     * @description gets loader function of service
     * @returns {function} loader function
     */
    AsService.prototype.getLoader = function () {
        if (this._source) {
            return this
                ._source
                .getLoader();
        }
        else
            return this._loader;
    };
    AsService.prototype.StateObservable = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var subFor = this.getSub(params);
        return subFor
            .stateSub;
    };
    Object.defineProperty(AsService.prototype, "ObservableAll", {
        get: function () {
            return this
                ._sub;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AsService.prototype, "ErrorObservableAll", {
        get: function () {
            return this
                ._errorSub;
        },
        enumerable: false,
        configurable: true
    });
    AsService.prototype.ErrorObservable = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var subfor = this.getSub.apply(this, params);
        return subfor
            .errorSub;
    };
    /**
     *
     * @param  {...any} params
     * @requires  AObservable
     */
    AsService.prototype.Observable = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var subfor = this.getSub.apply(this, params);
        return subfor
            .sub;
    };
    AsService.prototype.refresh = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return this.forceLoad.apply(this, (params || this._lastParams));
    };
    AsService.prototype.forceLoad = function () {
        var _a;
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        this._lastParams = params;
        if (this._source) {
            return (_a = this
                ._source)
                .load.apply(_a, params).then(function (a) { return _this._mapper
                ? _this._mapper.apply(_this, __spreadArrays([a], params)) : a; })
                .catch(function (e) { return e; });
        }
        else
            return this._reload.apply(this, params);
    };
    AsService.prototype.load = function () {
        var _a;
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var subfor = this.getSub(params);
        this._lastParams = params;
        if (this._source) {
            if (this._forceSourceLoad) {
                return this.forceLoad.apply(this, params);
            }
            else {
                subfor.sub.state = "loading";
                subfor.stateSub.next("loading");
                return (_a = this
                    ._source)
                    .get.apply(_a, params).then(function (a) {
                    subfor.sub.state = "idle";
                    subfor.stateSub.next("idle");
                    return _this._mapper
                        ? _this._mapper.apply(_this, __spreadArrays([a], params)) : a;
                })
                    .catch(function (e) { return e; });
            }
        }
        else {
            return this._reload.apply(this, params);
        }
    };
    AsService.prototype.get = function () {
        var _a;
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var subfor = this.getSub.apply(this, params);
        if (this._source) {
            return (_a = this
                ._source)
                .get.apply(_a, params).then(function (a) {
                if (_this._mapper)
                    return _this._mapper.apply(_this, __spreadArrays([a], params));
                else
                    return a;
            });
        }
        else {
            if (subfor.state === "start") {
                return this.load.apply(this, params);
            }
            else {
                var ret = new Promise(function (res, rej) {
                    var subs = subfor
                        .sub
                        .subscribe(function (a) {
                        res(a);
                        subs.unsubscribe();
                    });
                    var esubs = subfor
                        .errorSub
                        .subscribe(function (e) {
                        rej(e);
                        esubs.unsubscribe();
                    });
                });
                return ret;
            }
        }
    };
    /**
     * @description calls all subscribers for all parameter combination
     */
    AsService.prototype.publishAll = function () {
        this.publish();
    };
    /**
     * @description calls all subscribers for just desired parameter combination
     * @param  {...any} params
     */
    AsService.prototype.publish = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var sub = this.getSub.apply(this, params);
        var v = sub
            .sub
            .getValue();
        var nv = undefined;
        if (Array.isArray(v)) {
            nv = Array.from(v);
        }
        else if (typeof v === "object") {
            nv = Object.assign({}, v);
        }
        else {
            nv = Object.assign(v);
        }
        sub
            .sub
            .next(nv);
        this
            ._sub
            .next(nv);
    };
    AsService.prototype.getSub = function () {
        var _a, _b, _c;
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var pars = params.slice(0, this._paramCount);
        var tmp = utils_1.btoa(encodeURIComponent(pars));
        if (!this._subs[tmp]) {
            this._subs[tmp] = {
                sub: this._source === undefined
                    ? new AObservable_1.AObservable()
                    : (_a = this
                        ._source)
                        .AObservable.apply(_a, params).map(function (a) { return _this._mapper.apply(_this, __spreadArrays([a], pars)); }),
                errorSub: this._source === undefined
                    ? new AObservable_1.AObservable()
                    : (_b = this
                        ._source)
                        .ErrorObservable.apply(_b, params),
                stateSub: this._source === undefined
                    ? new AObservable_1.AObservable()
                    : (_c = this
                        ._source)
                        .StateObservable.apply(_c, params),
                state: this._source === undefined
                    ? "start"
                    : "idle"
            };
        }
        return this._subs[tmp];
    };
    AsService.prototype.getState = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var sub = this.getSub.apply(this, params);
        return sub.state;
    };
    AsService.prototype._reload = function () {
        var _this = this;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var subfor = this.getSub.apply(this, params);
        if (subfor.state === "loading") {
            var ret_1 = new Promise(function (res, rej) {
                var subs = subfor
                    .sub
                    .subscribe(function (a) {
                    res(a);
                    subs.unsubscribe();
                });
                var esubs = subfor
                    .errorSub
                    .subscribe(function (e) {
                    rej(e);
                    esubs.unsubscribe();
                });
            });
            return ret_1;
        }
        var ret = new Promise(function (res, rej) {
            subfor.state = "loading";
            subfor.stateSub.next("loading");
            var fnret = _this._loader.apply(_this, params);
            var r = fnret;
            if (r._isScalar !== undefined) {
                if (subfor.sourceObservable !== undefined)
                    subfor.sourceObservable.unsubscribe();
                subfor.sourceObservable = r.subscribe(function (b) {
                    var ret2 = _this._mapper
                        ? _this._mapper.apply(_this, __spreadArrays([b], params)) : b;
                    subfor
                        .sub
                        .next(ret2);
                    _this
                        ._sub
                        .next(ret2);
                    subfor
                        .sourceObservable
                        .unsubscribe();
                });
            }
            else if (r instanceof Promise) {
                console.log(4555);
                fnret.then(function (d) {
                    subfor.state = "idle";
                    subfor.stateSub.next("idle");
                    var ret2 = _this._mapper
                        ? _this._mapper.apply(_this, __spreadArrays([d], params)) : d;
                    res(ret2);
                    subfor
                        .sub
                        .next(ret2);
                    _this
                        ._sub
                        .next(ret2);
                    return ret;
                }).catch(function (e) {
                    console.log(4558);
                    subfor.state = "start";
                    subfor.stateSub.next("start");
                    subfor
                        .errorSub
                        .next(e);
                    rej(e);
                    _this
                        ._errorSub
                        .next(e);
                });
            }
            else {
                var ret_2 = _this._mapper
                    ? _this._mapper.apply(_this, __spreadArrays([r], params)) : r;
                res(ret_2);
                subfor
                    .sub
                    .next(ret_2);
                _this
                    ._sub
                    .next(ret_2);
                subfor.state = "idle";
                subfor.stateSub.next("idle");
            }
        });
        return ret;
    };
    return AsService;
}());
exports.default = AsService;
//# sourceMappingURL=AsService.js.map