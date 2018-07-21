"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.server = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _utils = require("../utils");

var _localforage = _interopRequireDefault(require("localforage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var server =
/*#__PURE__*/
function () {
  function server() {
    _classCallCheck(this, server);
  }

  _createClass(server, null, [{
    key: "start",
    value: function start() {}
  }, {
    key: "end",
    value: function end() {}
  }, {
    key: "beforSend",
    value: function beforSend() {
      BtServer.requestCount++;
      BtServer.start(BtServer.requestCount);
    }
  }, {
    key: "afterRecieve",
    value: function afterRecieve() {
      BtServer.requestCount--;
      if (BtServer.requestCount < 0) BtServer.requestCount = 0;
      BtServer.end(BtServer.requestCount);
    }
  }, {
    key: "checkuser",
    value: function checkuser(h) {
      BtServer.hookLoginRequire(h);
    }
  }, {
    key: "errorHooks",
    value: function errorHooks(e) {
      switch (e) {
        case 403:
          BtServer.hook403();
          break;

        default:
      }
    }
  }, {
    key: "errorHandler",
    value: function errorHandler(options, status) {
      if (500 <= status && status < 600) {
        if (options.e500 && typeof options.e500 === "function") options.e500(status);
      } else if (400 <= status && status < 500) {
        if (options.e500 && typeof options.e500 === "function") options.e400(status);
      } else if (300 <= status && status < 400) {
        if (options.e500 && typeof options.e500 === "function") options.e300(status);
      } else if (100 <= status && status < 200) {
        if (options.e500 && typeof options.e500 === "function") options.e400(status);
      }

      if (options.error && typeof options.error === "function") {
        options.error(status);
      }
    }
  }, {
    key: "getAxios",
    value: function getAxios() {
      if (!BtServer.axiosInstance) BtServer.axiosInstance = _axios.default.create({
        onDownloadProgress: function onDownloadProgress(e) {}
      });
      return BtServer.axiosInstance;
    }
  }, {
    key: "controller",
    value: function controller(cont, meth, params, options) {
      options = options || {
        catch: false,
        timeout: BtServer.timeOut,
        method: 'GET'
      };
      options.method = options.method || "get";
      options.method = options.method.toLowerCase();
      var done = false;
      var timeout = options.timeOut || BtServer.timeOut;
      var cache = options.cache || false;
      var hash = "";
      if (process.env.NODE_ENV === "development") hash = "".concat(cont, "/").concat(meth, ".ctrl/").concat(params ? JSON.stringify(params) : "");else hash = (0, _utils.hashcode)({
        cont: cont,
        meth: meth,
        params: params
      }); // if(options.cache) hash=hashcode({cont,meth,params});
      // hash=`${cont}/${meth}.ctrl/${params?hashcode(params):""}`;

      return new Promise(function (res, rej) {
        _localforage.default.getItem(hash).then(function (a) {
          if (options.cache && a) {
            res(a);
            return;
          }

          BtServer.beforSend();
          var pars = options.method === "get" ? params : null;
          var dats = options.method === "post" ? (0, _utils.objectToFormData)(params) : null;
          (0, _axios.default)({
            //  ax({
            method: options.method,
            url: "".concat(cont, "/").concat(meth, ".ctrl"),
            params: pars,
            data: dats,
            timeout: timeout,
            config: {
              headers: {
                'Content-Type': 'multipart/form-data'
              } //:{}}

            }
          }).then(function (d) {
            BtServer.afterRecieve();
            done = true;
            BtServer.checkuser(d.data.header.userState);

            if (d.header) {
              if (d.header.result !== 0) rej(d.data);
            } else {
              res(d.data);

              _localforage.default.setItem(hash, d.data);
            }
          }).catch(function (d) {
            console.log(66, d);
            BtServer.afterRecieve();
            done = true;
            BtServer.errorHooks(d.request.status);
            rej(d.request.status); //  BtServer.errorHandler(options, d.request.status);
          });
        });
      });
    }
  }, {
    key: "dvm",
    value: function dvm(name, params, options) {
      options = options || {
        catch: false,
        timeout: BtServer.timeOut
      };
      var done = false;
      var timeout = options.timeOut || BtServer.timeOut;
      var cache = options.cache || false;
      var hash = "";
      if (process.env.NODE_ENV === "development") hash = "".concat(name).concat(params ? JSON.stringify(params) : "");else hash = (0, _utils.hashcode)({
        name: name,
        params: params
      }); //   hash = `${name}.dvm/${params ? hashcode(params) : ""}`;

      return new Promise(function (res, rej) {
        _localforage.default.getItem(hash).then(function (a) {
          if (options.cache && a) {
            res(a);
            return;
          }

          BtServer.beforSend();
          (0, _axios.default)({
            method: "get",
            url: "".concat(name, ".dvm"),
            params: params,
            timeout: timeout
          }).then(function (d) {
            BtServer.afterRecieve();

            _localforage.default.setItem(hash, d.data);

            done = true;
            BtServer.checkuser(d.data.header.userState);

            if (d.header) {
              if (d.header.result !== 0) rej(d.data);
            } else res(d.data);
          }).catch(function (d) {
            BtServer.afterRecieve();
            done = true;
            BtServer.errorHooks(d.request.status);
            rej(d.request.status); //  BtServer.errorHandler(options, d.request.status);
          });
        });
      });
    }
  }]);

  return server;
}();

exports.server = server;

_defineProperty(server, "hookLoginRequire", function () {});

_defineProperty(server, "hook403", function () {});

_defineProperty(server, "requestCount", 0);

_defineProperty(server, "timeOut", 5000);

_defineProperty(server, "axiosInstance", null);