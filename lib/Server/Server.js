"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _utils = require("../utils");

var _localforage = _interopRequireDefault(require("localforage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fakelocaLForge = {
  setItem: function setItem() {
    return new Promise(function (r) {
      return r(undefined);
    });
  },
  getItem: function getItem() {
    return new Promise(function (r) {
      return r(undefined);
    });
  }
};
var tmpLocalForage = (0, _utils.isBrowser)() ? _localforage.default : fakelocaLForge;
/**
 * @class
 * @classdesc axios based XHR request
 */

var Server =
/*#__PURE__*/
function () {
  function Server() {
    _classCallCheck(this, Server);
  }

  _createClass(Server, null, [{
    key: "addRequest",
    value: function addRequest(hash, canceller) {
      if (hash) Server._reqs['e' + hash] = {
        hash: hash,
        canceller: canceller
      };
    }
  }, {
    key: "removeRequest",
    value: function removeRequest(hash) {
      delete Server._reqs['e' + hash];
    }
  }, {
    key: "start",
    value: function start() {}
  }, {
    key: "end",
    value: function end() {}
  }, {
    key: "beforSend",
    value: function beforSend() {
      Server.requestCount++;
      Server.start(Server.requestCount);
    }
  }, {
    key: "afterRecieve",
    value: function afterRecieve() {
      Server.requestCount--;
      if (Server.requestCount < 0) Server.requestCount = 0;
      Server.end(Server.requestCount);
    }
  }, {
    key: "checkuser",
    value: function checkuser(h) {
      Server.hookLoginRequire(h);
    }
  }, {
    key: "errorHooks",
    value: function errorHooks(e) {
      Server.hookAll();

      switch (e) {
        case 403:
          Server.hook403();
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
      if (!Server.axiosInstance) Server.axiosInstance = _axios.default.create({
        onDownloadProgress: function onDownloadProgress()
        /*e*/
        {}
      });
      return Server.axiosInstance;
    }
  }, {
    key: "controller",
    value: function controller(cont, meth, params, options) {
      options = options || {
        cache: false,
        timeout: Server.timeOut,
        method: 'GET'
      };
      options.cancel = options.cancel || Server.generalCancel;
      options.method = options.method || "get";
      options.method = options.method.toLowerCase();
      var timeout = options.timeOut || Server.timeOut;
      var cache = options.cache || false;
      var hash = "";
      if (process.env.NODE_ENV === "development") hash = "".concat(cont, "/").concat(meth, ".ctrl/").concat(params ? JSON.stringify(params) : "");else hash = (0, _utils.hashcode)({
        cont: cont,
        meth: meth,
        params: params
      }); // if(options.cache) hash=hashcode({cont,meth,params});
      // hash=`${cont}/${meth}.ctrl/${params?hashcode(params):""}`;

      var prom = new Promise(function (res, rej) {
        tmpLocalForage.getItem(hash).then(function (a) {
          if (cache && a) {
            res(a);
          }

          Server.beforSend();
          var pars = options.method === "get" ? params : null;
          var dats = options.method === "post" ? (0, _utils.objectToFormData)(params) : null;
          var ct = undefined;
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
              }
            }
          }).then(function (d) {
            Server.removeRequest(hash);
            Server.afterRecieve();
            Server.checkuser(d.data.header.userState);

            if (d.header) {
              tmpLocalForage.setItem(hash, d.data);
              if (d.header.result !== 0) rej(d.data);
            } else {
              tmpLocalForage.setItem(hash, d.data);
              res(d.data);
            }
          }).catch(function (d) {
            Server.removeRequest(hash);
            if (d && d.data && d.data.header) Server.checkuser(d.data.header.userState);
            Server.afterRecieve();
            Server.errorHooks(d.request.status);
            rej(d.request.status); //  Server.errorHandler(options, d.request.status);
          });
          Server.addRequest(hash, ct);
        });
      });
      return prom;
    }
  }, {
    key: "dvm",
    value: function dvm(name, params, options) {
      options = options || {
        cache: false,
        timeout: Server.timeOut,
        cancel: Server.generalCancel
      };
      var timeout = options.timeOut || Server.timeOut;
      var cache = options.cache || false;
      var hash = "";
      if (process.env.NODE_ENV === "development") hash = "".concat(name).concat(params ? JSON.stringify(params) : "");else hash = (0, _utils.hashcode)({
        name: name,
        params: params
      }); //   hash = `${name}.dvm/${params ? hashcode(params) : ""}`;

      return new Promise(function (res, rej) {
        tmpLocalForage.getItem(hash).then(function (a) {
          if (cache && a) {
            res(a);
          }

          Server.beforSend();
          (0, _axios.default)({
            method: "get",
            url: "".concat(name, ".dvm"),
            params: params,
            timeout: timeout
          }).then(function (d) {
            Server.afterRecieve();
            tmpLocalForage.setItem(hash, d.data);
            Server.checkuser(d.data.header.userState);

            if (d.header) {
              if (d.header.result !== 0) res(d.data);
            } else res(d.data);
          }).catch(function (d) {
            if (d && d.data && d.data.header) Server.checkuser(d.data.header.userState);
            Server.afterRecieve();
            Server.errorHooks(d.request.status);
            rej(d.request.status); //  Server.errorHandler(options, d.request.status);
          });
        });
      });
    }
  }, {
    key: "get",
    value: function get(url, params, options) {
      options = options || {
        catch: false,
        timeout: Server.timeOut
      };
      var timeout = options.timeOut || Server.timeOut;
      return (0, _axios.default)({
        method: "get",
        url: url,
        params: params,
        timeout: timeout,
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      }).then(function (a) {
        return a.data;
      });
    }
  }]);

  return Server;
}();

exports.default = Server;

_defineProperty(Server, "_reqs", {});

_defineProperty(Server, "hookLoginRequire", function () {});

_defineProperty(Server, "hook403", function () {});

_defineProperty(Server, "hookAll", function () {});

_defineProperty(Server, "requestCount", 0);

_defineProperty(Server, "timeOut", 12000);

_defineProperty(Server, "axiosInstance", null);