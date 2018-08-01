"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = _interopRequireDefault(require("rxjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var btoa = btoa || function (str) {
  return new Buffer(str).toString('base64');
};

var AsService =
/*#__PURE__*/
function () {
  function AsService(loader, mapper, autoload) {
    _classCallCheck(this, AsService);

    _defineProperty(this, "_subs", {});

    _defineProperty(this, "_lastParams", null);

    _defineProperty(this, "_sub", new _rxjs.default.BehaviorSubject());

    _defineProperty(this, "_errorSub", new _rxjs.default.BehaviorSubject());

    _defineProperty(this, "_isLoading", false);

    _defineProperty(this, "ready", false);

    if (!loader) {
      console.log("barte error:", "btService", "loader is not set");
      return undefined;
    }

    if (loader.$$isAsService) {
      this._loader = loader.getLoader();
      var sourceMapper = loader.getMapper();

      if (sourceMapper) {
        if (mapper) {
          this._mapper = function (data) {
            for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              params[_key - 1] = arguments[_key];
            }

            return mapper.apply(void 0, [sourceMapper.apply(void 0, [data].concat(params))].concat(params));
          };
        } else {
          this._mapper = function () {
            return sourceMapper.apply(void 0, arguments);
          };
        }

        console.log(175, sourceMapper, this._mapper);
      }
    } else {
      this._loader = typeof loader === "function" ? loader : function () {
        return loader;
      };
      this._mapper = mapper;
    }

    this._autoload = autoload ? true : false;
    if (autoload === true) this._reload();
    this.$$isAsService = true;
  }

  _createClass(AsService, [{
    key: "map",
    value: function map(mapper) {
      if (!mapper || typeof mapper !== "function") {
        console.log("AsService Error: mapper function not set");
        return undefined;
      } else return new AsService(this, mapper, this._autoload);
    }
  }, {
    key: "getMapper",
    value: function getMapper() {
      return this._mapper;
    }
  }, {
    key: "getLoader",
    value: function getLoader() {
      return this._loader;
    }
  }, {
    key: "publishNull",
    value: function publishNull() {
      for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }

      var subfor = this.getSub(params);
      subfor.sub.next(null);
    }
  }, {
    key: "ErrorObservable",
    value: function ErrorObservable() {
      for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        params[_key3] = arguments[_key3];
      }

      var subfor = this.getSub(params);
      return subfor.errorSub.filter(function (a) {
        return a !== undefined;
      });
    }
  }, {
    key: "Observable",
    value: function Observable() {
      for (var _len4 = arguments.length, params = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        params[_key4] = arguments[_key4];
      }

      var subfor = this.getSub(params);
      return subfor.sub.filter(function (a) {
        return a !== undefined;
      });
    }
  }, {
    key: "refresh",
    value: function refresh() {
      return this._reload(this._lastParams);
    }
  }, {
    key: "load",
    value: function load() {
      return this._reload.apply(this, arguments);
    }
  }, {
    key: "get",
    value: function get() {
      for (var _len5 = arguments.length, params = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        params[_key5] = arguments[_key5];
      }

      console.log(179, params);
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
    key: "publishAll",
    value: function publishAll() {}
  }, {
    key: "publish",
    value: function publish() {
      for (var _len6 = arguments.length, params = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        params[_key6] = arguments[_key6];
      }

      var sub = this.getSub(params);
      sub.next(this.$data);

      this._sub.next(this.$data);
    }
  }, {
    key: "getSub",
    value: function getSub() {
      for (var _len7 = arguments.length, params = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        params[_key7] = arguments[_key7];
      }

      var tmp = btoa(encodeURIComponent(params));

      if (!this._subs[tmp]) {
        this._subs[tmp] = {
          sub: new _rxjs.default.BehaviorSubject(),
          errorSub: new _rxjs.default.BehaviorSubject(),
          state: "start"
        };
      }

      return this._subs[tmp];
    }
  }, {
    key: "_reload",
    value: function _reload() {
      var _console,
          _this = this;

      for (var _len8 = arguments.length, params = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        params[_key8] = arguments[_key8];
      }

      (_console = console).log.apply(_console, [250].concat(params));

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
      } // }


      var ret = new Promise(function (res, rej) {
        subfor.state = "loading";

        var fnret = _this._loader.apply(_this, params);

        var r = fnret;

        if (r instanceof _rxjs.default.Observable) {
          var sub = r.subscribe(function (b) {
            var ret = _this._mapper ? _this._mapper.apply(_this, [b].concat(params)) : b;
            subfor.sub.next(ret);

            _this._sub.next(ret);

            _this._isLoading = false;
            _this._loaded = true;
            sub.unsubscribe();
          });
        } else if (r instanceof Promise) {
          fnret.then(function (d) {
            _this.ready = true;
            subfor.state = "idle";
            var ret = _this._mapper ? _this._mapper.apply(_this, [d].concat(params)) : d;
            _this.$data = ret;
            res(ret);
            subfor.sub.next(ret);

            _this._sub.next(ret);

            _this._isLoading = false;
            _this._loaded = true;
          }).catch(function (e) {
            subfor.state = "idle";

            try {
              res(ret);
            } catch (e) {
              rej(e);
            } // this     ._subs[tmp].sub     .error(e);


            subfor.errorSub.next(e);

            _this._errorSub.next(e); //   this._sub.error(e);

          });
        } else {
          var _ret2 = _this._mapper ? _this._mapper.apply(_this, [r].concat(params)) : r;

          subfor.sub.next(_ret2);

          _this._sub.next(_ret2);

          _this._isLoading = false;
          _this._loaded = true;
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