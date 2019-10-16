"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = _interopRequireDefault(require("rxjs"));

var _coreJs = require("core-js");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @class
 * @classdesc an Observable service of everything
 * @name AsService
 */
var AsService =
/*#__PURE__*/
function () {
  /**
   * @constructor
   * @param {any} loader constant primitives | function | Promise | Observable
   * @param {function} mapper  function convert returned data
   * @param {boolean} autoload if true automaticaly load promis or async data
   * @param {number} paramcount number of parameters (internal use)
   * @param {boolean} forceSourceLoad if true force to reload even when data is exist
   */
  function AsService(loader, mapper, autoload, paramcount, forceSourceLoad) {
    _classCallCheck(this, AsService);

    _defineProperty(this, "_forceSourceLoad", false);

    _defineProperty(this, "_paramCount", 0);

    _defineProperty(this, "_subs", {});

    _defineProperty(this, "_lastParams", []);

    _defineProperty(this, "_sub", new _rxjs.default.BehaviorSubject());

    _defineProperty(this, "_errorSub", new _rxjs.default.BehaviorSubject());

    if (!loader) {
      console.log("barte error:", "asService", "loader is not set"); //return undefined;
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
        this._loader = function () {
          return loader;
        };
      }

      if (autoload === true) this._reload();
    }

    this._mapper = mapper;
    this._autoload = autoload ? true : false;
    this.$$isAsService = true;
  }

  _createClass(AsService, [{
    key: "map",

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
    value: function map(mapper, forceLoadSource) {
      if (!mapper || typeof mapper !== "function") {
        console.log("AsService Error: mapper function not set");
        return undefined;
      } else return new AsService(this, mapper, this._autoload, mapper.length - 1, forceLoadSource);
    }
    /**
     * @description get mapper function of this service
     * @returns {function} mapper function
     */

  }, {
    key: "getMapper",
    value: function getMapper() {
      var _this = this;

      if (this._source) {
        var sourceMapper = this._source.getMapper();

        if (sourceMapper) {
          if (this._mapper) return function () {
            for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
              params[_key] = arguments[_key];
            }

            return _this._mapper.apply(_this, [sourceMapper.apply(void 0, params)].concat(params));
          };
        } else return this._mapper;
      }

      return this._mapper;
    }
    /**
     * @description gets loader function of service
     * @returns {function} loader function
     */

  }, {
    key: "getLoader",
    value: function getLoader() {
      if (this._source) {
        return this._source.getLoader();
      } else return this._loader;
    }
  }, {
    key: "ErrorObservable",
    value: function ErrorObservable() {
      var subfor = this.getSub.apply(this, arguments);
      return subfor.errorSub.filter(function (a) {
        return a !== undefined;
      });
    }
    /**
     * 
     * @param  {...any} params 
     * @requires rsjs observable
     */

  }, {
    key: "Observable",
    value: function Observable() {
      var subfor = this.getSub.apply(this, arguments);
      return subfor.sub.filter(function (a) {
        return a !== undefined;
      });
    }
  }, {
    key: "refresh",
    value: function refresh() {
      for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }

      return this.forceLoad.apply(this, _toConsumableArray(params || this._lastParams));
    }
  }, {
    key: "forceLoad",
    value: function forceLoad() {
      var _this2 = this;

      for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        params[_key3] = arguments[_key3];
      }

      this._lastParams = params;

      if (this._source) {
        var _this$_source;

        return (_this$_source = this._source).load.apply(_this$_source, params).then(function (a) {
          return _this2._mapper ? _this2._mapper.apply(_this2, [a].concat(params)) : a;
        }).catch(function (e) {
          return e;
        });
      } else return this._reload.apply(this, params);
    }
  }, {
    key: "load",
    value: function load() {
      var _this3 = this;

      for (var _len4 = arguments.length, params = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        params[_key4] = arguments[_key4];
      }

      var subfor = this.getSub(params);
      this._lastParams = params;

      if (this._source) {
        if (this._forceSourceLoad) {
          return this.forceLoad.apply(this, params);
        } else {
          var _this$_source2;

          subfor.sub.state = "loading";
          return (_this$_source2 = this._source).get.apply(_this$_source2, params).then(function (a) {
            subfor.sub.state = "idle";
            return _this3._mapper ? _this3._mapper.apply(_this3, [a].concat(params)) : a;
          }).catch(function (e) {
            return e;
          });
        }
      } else {
        return this._reload.apply(this, params);
      }
    }
  }, {
    key: "get",
    value: function get() {
      var _this4 = this;

      for (var _len5 = arguments.length, params = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        params[_key5] = arguments[_key5];
      }

      var subfor = this.getSub.apply(this, params);

      if (this._source) {
        var _this$_source3;

        return (_this$_source3 = this._source).get.apply(_this$_source3, params).then(function (a) {
          if (_this4.mapper) return _this4.mapper.apply(_this4, [a].concat(params));else return a;
        });
      } else {
        if (subfor.state === "start") {
          return this.load.apply(this, params);
        } else {
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
    }
    /**
     * @description calls all subscribers for all parameter combination
     */

  }, {
    key: "publishAll",
    value: function publishAll() {
      this.publish();
    }
    /**
     * @description calls all subscribers for just desired parameter combination
     * @param  {...any} params 
     */

  }, {
    key: "publish",
    value: function publish() {
      var sub = this.getSub.apply(this, arguments);
      var v = sub.sub.getValue();
      var nv = undefined;

      if (Array.isArray(v)) {
        nv = Array.from(v);
      } else if (_typeof(v) === "object") {
        nv = _coreJs.Object.assign({}, v);
      } else {
        nv = _coreJs.Object.assign(v);
      }

      sub.sub.next(nv);

      this._sub.next(nv);
    }
  }, {
    key: "getSub",
    value: function getSub() {
      var _this5 = this;

      for (var _len6 = arguments.length, params = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        params[_key6] = arguments[_key6];
      }

      var pars = params.slice(0, this._paramCount);
      var tmp = (0, _utils.btoa)(encodeURIComponent(pars));

      if (!this._subs[tmp]) {
        var _this$_source4, _this$_source5;

        this._subs[tmp] = {
          sub: this._source === undefined ? new _rxjs.default.BehaviorSubject() : (_this$_source4 = this._source).Observable.apply(_this$_source4, params).map(function (a) {
            return _this5._mapper.apply(_this5, [a].concat(_toConsumableArray(pars)));
          }),
          errorSub: this._source === undefined ? new _rxjs.default.BehaviorSubject() : (_this$_source5 = this._source).ErrorObservable.apply(_this$_source5, params).map(function (a) {
            return _this5._mapper.apply(_this5, [a].concat(_toConsumableArray(pars)));
          }),
          state: this._source === undefined ? "start" : "idle"
        };
      }

      return this._subs[tmp];
    }
  }, {
    key: "getState",
    value: function getState() {
      var sub = this.getSub.apply(this, arguments);
      return sub.state;
    }
  }, {
    key: "_reload",
    value: function _reload() {
      var _this6 = this;

      for (var _len7 = arguments.length, params = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        params[_key7] = arguments[_key7];
      }

      var subfor = this.getSub.apply(this, params);

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

      var ret = new Promise(function (res, rej) {
        subfor.state = "loading";

        var fnret = _this6._loader.apply(_this6, params);

        var r = fnret;

        if (r._isScalar !== undefined) {
          if (subfor.sourceObservable !== undefined) subfor.sourceObservable.unsubscribe();
          subfor.sourceObservable = r.subscribe(function (b) {
            var ret2 = _this6._mapper ? _this6._mapper.apply(_this6, [b].concat(params)) : b;
            subfor.sub.next(ret2);

            _this6._sub.next(ret2);
          });
        } else if (r instanceof Promise) {
          fnret.then(function (d) {
            subfor.state = "idle";
            var ret2 = _this6._mapper ? _this6._mapper.apply(_this6, [d].concat(params)) : d;
            _this6.$data = ret2;
            res(ret2);
            subfor.sub.next(ret2);

            _this6._sub.next(ret2);

            return ret;
          }).catch(function (e) {
            subfor.state = "start";
            res(e);
            rej(e); //  rej(e) try {     res(e); } catch (e2) {     rej(e2); }

            subfor.errorSub.next(e);

            _this6._errorSub.next(e);
          });
        } else {
          var _ret2 = _this6._mapper ? _this6._mapper.apply(_this6, [r].concat(params)) : r;

          res(_ret2);
          subfor.sub.next(_ret2);

          _this6._sub.next(_ret2);

          subfor.state = "idle";
        }
      });
      return ret;
    }
  }, {
    key: "_getFromPromise",
    value: function _getFromPromise() {}
  }, {
    key: "ObservableAll",
    get: function get() {
      return this._sub.filter(function (a) {
        return a !== undefined;
      });
    }
  }, {
    key: "ErrorObservableAll",
    get: function get() {
      return this._errorSub.filter(function (a) {
        return a !== undefined;
      });
    }
  }]);

  return AsService;
}();

exports.default = AsService;