import Rx from 'rxjs';

var btoa = btoa || function (str) {
    return new Buffer(str).toString('base64');
};
export default class AsService {

    constructor(loader, mapper, autoload, paramcount, forceSourceLoad) {
        if (!loader) {
            console.log("barte error:", "btService", "loader is not set");
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
    map(mapper, forceLoadSource) {

        if (!mapper || typeof mapper !== "function") {
            console.log("AsService Error: mapper function not set")
            return undefined;
        } else 
            return new AsService(this, mapper, this._autoload, mapper.length - 1, forceLoadSource);
        }
    
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
    Observable(...params) {
        let subfor = this.getSub(...params);

        return subfor
            .sub
            .filter(a => a !== undefined);

    }

    refresh() {
        return this.forceLoad(...this._lastParams);
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
  
        var subfor=this.getSub(params);
        this._lastParams = params;
        if (this._source) {
            
            if (this._forceSourceLoad) {
                return this.forceLoad(...params);
            } else {
                
                subfor.sub.state="loading";
                return this
                    ._source
                    .get(...params)
                    .then(a => {
                       subfor.sub.state="idle"; 
                        return this._mapper
                        ? this._mapper(a, ...params)
                        : a})
                    .catch(e => e);
            }

        } else {

            return this._reload(...params);
        }
    }

    get(...params) {
        let subfor = this.getSub(...params);
        
if(this._source){
   return this._source.get(...params)
    .then(a=>this.mapper(a));
}
else
      {  if (subfor.state === "start") {
            
            return this.load(...params);
        }
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
        }}
    }

    publishAll() {
        this.publish();
    }
    publish(...params) {
        
        let sub = this.getSub(...params);
        const v=sub.sub.getValue();
        sub.sub.next(sub.sub.getValue());
        this
        ._sub
        .next(v);
        
       
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

                    let ret = this._mapper
                        ? this._mapper(b, ...params)
                        : b;
                    subfor
                        .sub
                        .next(ret);

                    this
                        ._sub
                        .next(ret);

                })

            } else if (r instanceof Promise) {
                fnret.then(d => {

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
                    return ret;
                }).catch(e => {
                    subfor.state = "start";

                    try {
                        res(ret);

                    } catch (e) {
                        rej(e);
                    }

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