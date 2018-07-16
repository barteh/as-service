'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BtService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var btoa = btoa || function (str) {
    return new Buffer(str).toString('base64');
};

var BtService = exports.BtService = function () {
    function BtService(loader, mapper, autoload) {
        _classCallCheck(this, BtService);

        this._subs = {};
        this._lastParams = null;
        this._sub = new _rxjs2.default.BehaviorSubject();
        this._errorSub = new _rxjs2.default.BehaviorSubject();
        this._isLoading = false;
        this.ready = false;

        if (!loader) {
            console.log("barte error:", "btService", "loader is not set");
        }

        this._loader = typeof loader === "function" ? loader : function () {
            return loader;
        };
        this._mapper = mapper;
        this._autoload = autoload;
        if (autoload === true) this._reload();
    }

    _createClass(BtService, [{
        key: 'ErrorObservable',
        value: function ErrorObservable() {
            for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
                params[_key] = arguments[_key];
            }

            var subfor = this.getSub(params);
            return subfor.errorSub.filter(function (a) {
                return a !== undefined;
            });
        }
    }, {
        key: 'Observable',
        value: function Observable() {
            for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                params[_key2] = arguments[_key2];
            }

            var subfor = this.getSub(params);
            return subfor.sub.filter(function (a) {
                return a !== undefined;
            });
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            return this._reload(this._lastParams);
        }
    }, {
        key: 'load',
        value: function load() {

            return this._reload.apply(this, arguments);
        }
    }, {
        key: 'get',
        value: function get() {
            for (var _len3 = arguments.length, params = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                params[_key3] = arguments[_key3];
            }

            var subfor = this.getSub(params);

            if (subfor.state === "start") return this._reload.apply(this, params);else {
                var ret = new Promise(function (res, rej) {
                    var subs = subfor.sub.subscribe(function (a) {
                        res(a);
                        subs.unsubscribe();
                    });
                    var esubs = subfor.errorSub.subscribe(function (e) {
                        rej(e);
                        esubs.unsubscribe();
                    });
                });

                return ret;
            }
        }
    }, {
        key: 'publishAll',
        value: function publishAll() {}
    }, {
        key: 'publish',
        value: function publish() {
            for (var _len4 = arguments.length, params = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                params[_key4] = arguments[_key4];
            }

            var sub = this.getSub(params);
            sub.next(this.$data);
            this._sub.next(this.$data);
        }
    }, {
        key: 'getSub',
        value: function getSub() {
            for (var _len5 = arguments.length, params = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                params[_key5] = arguments[_key5];
            }

            var tmp = btoa(encodeURIComponent(params));

            if (!this._subs[tmp]) {

                this._subs[tmp] = {
                    sub: new _rxjs2.default.BehaviorSubject(),
                    errorSub: new _rxjs2.default.BehaviorSubject(),
                    state: "start"

                };
            }
            return this._subs[tmp];
        }
    }, {
        key: '_reload',
        value: function _reload() {
            var _this = this;

            for (var _len6 = arguments.length, params = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                params[_key6] = arguments[_key6];
            }

            var subfor = this.getSub(params);
            if (subfor.state === "loading") {

                var _ret = new Promise(function (res, rej) {
                    var subs = subfor.sub.subscribe(function (a) {
                        res(a);
                        subs.unsubscribe();
                    });
                    var esubs = subfor.errorSub.subscribe(function (e) {
                        rej(e);
                        esubs.unsubscribe();
                    });
                });

                return _ret;
            }

            // }

            var ret = new Promise(function (res, rej) {
                subfor.state = "loading";

                var fnret = _this._loader.apply(_this, params);

                var r = fnret;

                if (r instanceof _rxjs2.default.Observable) {

                    var sub = r.subscribe(function (b) {

                        var ret = _this._mapper ? _this._mapper(b) : b;
                        subfor.sub.next(b);

                        _this._sub.next(b);

                        _this._isLoading = false;
                        _this._loaded = true;

                        sub.unsubscribe();
                    });
                } else if (r instanceof Promise) {
                    fnret.then(function (d) {
                        _this.ready = true;
                        subfor.state = "idle";

                        var ret = _this._mapper ? _this._mapper(d) : d;

                        _this.$data = ret;

                        res(ret);

                        subfor.sub.next(ret);

                        _this._sub.next(ret);

                        _this._isLoading = false;
                        _this._loaded = true;
                    }).catch(function (e) {
                        subfor.state = "idle";

                        try {
                            rej(e);
                        } catch (e) {}

                        // this     ._subs[tmp].sub     .error(e);
                        subfor.errorSub.next(e);

                        _this._errorSub.next(e);

                        //   this._sub.error(e);
                    });
                } else {

                    var _ret2 = _this._mapper ? _this._mapper(r) : r;

                    res(_ret2);
                    subfor.sub.next(_ret2);

                    _this._sub.next(_ret2);

                    _this._isLoading = false;
                    _this._loaded = true;
                }
            });

            return ret;
        }
    }, {
        key: '_getFromPromise',
        value: function _getFromPromise() {}
    }, {
        key: 'ObservableAll',
        get: function get() {
            return this._sub.filter(function (a) {
                return a !== undefined;
            });
        }
    }, {
        key: 'ErrorObservableAll',
        get: function get() {
            return this._errorSub.filter(function (a) {
                return a !== undefined;
            });
        }
    }]);

    return BtService;
}();