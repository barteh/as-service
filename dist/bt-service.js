'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BtService = undefined;

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var btoa = btoa || function (str) {
    return new Buffer(str).toString('base64');
};
class BtService {

    constructor(loader, mapper, autoload) {
        this._subs = {};
        this._lastParams = null;
        this._sub = new _rxjs2.default.BehaviorSubject();
        this._errorSub = new _rxjs2.default.BehaviorSubject();
        this._isLoading = false;
        this.ready = false;

        if (!loader) {
            console.log("barte error:", "btService", "loader is not set");
        }

        this._loader = typeof loader === "function" ? loader : () => loader;
        this._mapper = mapper;
        this._autoload = autoload;
        if (autoload === true) this._reload();
    }

    get ObservableAll() {
        return this._sub.filter(a => a !== undefined);
    }

    get ErrorObservableAll() {
        return this._errorSub.filter(a => a !== undefined);
    }

    ErrorObservable(...params) {

        let subfor = this.getSub(params);
        return subfor.errorSub.filter(a => a !== undefined);
    }
    Observable(...params) {
        let subfor = this.getSub(params);
        return subfor.sub.filter(a => a !== undefined);
    }
    refresh() {
        return this._reload(this._lastParams);
    }
    load(...params) {

        return this._reload(...params);
    }

    get(...params) {
        let subfor = this.getSub(params);

        if (subfor.state === "start") return this._reload(...params);else {
            let ret = new Promise((res, rej) => {
                let subs = subfor.sub.subscribe(a => {
                    res(a);
                    subs.unsubscribe();
                });
                let esubs = subfor.errorSub.subscribe(e => {
                    rej(e);
                    esubs.unsubscribe();
                });
            });

            return ret;
        }
    }

    publishAll() {}
    publish(...params) {
        let sub = this.getSub(params);
        sub.next(this.$data);
        this._sub.next(this.$data);
    }

    getSub(...params) {
        let tmp = btoa(encodeURIComponent(params));

        if (!this._subs[tmp]) {

            this._subs[tmp] = {
                sub: new _rxjs2.default.BehaviorSubject(),
                errorSub: new _rxjs2.default.BehaviorSubject(),
                state: "start"

            };
        }
        return this._subs[tmp];
    }

    _reload(...params) {

        let subfor = this.getSub(params);
        if (subfor.state === "loading") {

            let ret = new Promise((res, rej) => {
                let subs = subfor.sub.subscribe(a => {
                    res(a);
                    subs.unsubscribe();
                });
                let esubs = subfor.errorSub.subscribe(e => {
                    rej(e);
                    esubs.unsubscribe();
                });
            });

            return ret;
        }

        // }

        let ret = new Promise((res, rej) => {
            subfor.state = "loading";

            let fnret = this._loader(...params);

            const r = fnret;

            if (r instanceof _rxjs2.default.Observable) {

                let sub = r.subscribe(b => {

                    let ret = this._mapper ? this._mapper(b) : b;
                    subfor.sub.next(b);

                    this._sub.next(b);

                    this._isLoading = false;
                    this._loaded = true;

                    sub.unsubscribe();
                });
            } else if (r instanceof Promise) {
                fnret.then(d => {
                    this.ready = true;
                    subfor.state = "idle";

                    let ret = this._mapper ? this._mapper(d) : d;

                    this.$data = ret;

                    res(ret);

                    subfor.sub.next(ret);

                    this._sub.next(ret);

                    this._isLoading = false;
                    this._loaded = true;
                }).catch(e => {
                    subfor.state = "idle";

                    try {
                        rej(e);
                    } catch (e) {}

                    // this     ._subs[tmp].sub     .error(e);
                    subfor.errorSub.next(e);

                    this._errorSub.next(e);

                    //   this._sub.error(e);
                });
            } else {

                let ret = this._mapper ? this._mapper(r) : r;

                res(ret);
                subfor.sub.next(ret);

                this._sub.next(ret);

                this._isLoading = false;
                this._loaded = true;
            }
        });

        return ret;
    }

    _getFromPromise() {}

}
exports.BtService = BtService;