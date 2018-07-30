import Rx from 'rxjs';

var btoa = btoa || function (str) {
    return new Buffer(str).toString('base64');
};
export default class AsService {

    constructor(loader, mapper, autoload) {
        if (!loader) {
            console.log("barte error:", "btService", "loader is not set");
            return undefined;
        }

        if (loader.$$isAsService) {
            this._loader = loader.getLoader();
            let sourceMapper = loader.getMapper();
            if (sourceMapper) {
                if (mapper) {

                    this._mapper = (...params) => mapper(sourceMapper(...params), ...params);
                } else {

                    this._mapper = (...params) => {
                        return sourceMapper(...params);
                    }
                    console.log(175, sourceMapper, this._mapper);
                }
            }

        } else {
            this._loader = typeof loader === "function"
                ? loader
                : () => loader;
            this._mapper = mapper;
        }

        this._autoload = autoload
            ? true
            : false;
        if (autoload === true) 
            this._reload();
        
        this.$$isAsService = true;
    }

    map(mapper) {
        if (!mapper || typeof mapper!= "function") {
            console.log("AsService Error: mapper function not set")
            return undefined;
        }
        else return new AsService(this,mapper);
    }

    getMapper() {
        return this._mapper;
    }
    getLoader() {
        return this._loader;
    }

    _subs = {};
    _lastParams = null;
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

        let subfor = this.getSub(params)
        return subfor
            .errorSub
            .filter(a => a !== undefined);

    }
    Observable(...params) {
        let subfor = this.getSub(params);
        return subfor
            .sub
            .filter(a => a !== undefined);

    }

    refresh() {
        return this._reload(this._lastParams);
    }

    load(...params) {

        return this._reload(...params);
    }

    get(...params) {
        let subfor = this.getSub(params);

        if (subfor.state === "start") 
            return this._reload(...params);
        else {
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

    publishAll() {}
    publish(...params) {
        let sub = this.getSub(params);
        sub.next(this.$data);
        this
            ._sub
            .next(this.$data);
    }

    _isLoading = false;

    getSub(...params) {
        let tmp = btoa(encodeURIComponent(params));

        if (!this._subs[tmp]) {

            this._subs[tmp] = {
                sub: new Rx.BehaviorSubject(),
                errorSub: new Rx.BehaviorSubject(),
                state: "start"

            };
        }
        return this._subs[tmp];

    }

    ready = false;

    _reload(...params) {

        let subfor = this.getSub(params);
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

        // }

        let ret = new Promise((res, rej) => {
            subfor.state = "loading";

            let fnret = this._loader(...params);

            const r = fnret;

            if (r instanceof Rx.Observable) {

                let sub = r.subscribe(b => {

                    let ret = this._mapper
                        ? this._mapper(b, ...params)
                        : b;
                    subfor
                        .sub
                        .next(ret);

                    this
                        ._sub
                        .next(ret);

                    this._isLoading = false;
                    this._loaded = true;

                    sub.unsubscribe();
                })

            } else if (r instanceof Promise) {
                fnret.then(d => {
                    this.ready = true;
                    subfor.state = "idle";

                    let ret = this._mapper
                        ? this._mapper(d, ...params)
                        : d;

                    this.$data = ret;

                    res(ret);

                    subfor
                        .sub
                        .next(ret);

                    this
                        ._sub
                        .next(ret);

                    this._isLoading = false;
                    this._loaded = true;

                }).catch(e => {
                    subfor.state = "idle";

                    try {
                        res(ret);

                    } catch (e) {
                        rej(e);
                    }

                    // this     ._subs[tmp].sub     .error(e);
                    subfor
                        .errorSub
                        .next(e);

                    this
                        ._errorSub
                        .next(e);

                    //   this._sub.error(e);

                });

            } else {

                let ret = this._mapper
                    ? this._mapper(r, ...params)
                    : r;
                subfor
                    .sub
                    .next(ret);

                this
                    ._sub
                    .next(ret);

                this._isLoading = false;
                this._loaded = true;
                subfor.state = "idle";

            }

        });

        return ret;
    }

    _getFromPromise() {}

}