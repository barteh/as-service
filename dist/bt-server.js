"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BtServer = undefined;

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _hashcode = require("./hashcode");

var _hashcode2 = _interopRequireDefault(_hashcode);

var _localforage = require("localforage");

var _localforage2 = _interopRequireDefault(_localforage);

var _objecttoformdata = require("./objecttoformdata");

var _objecttoformdata2 = _interopRequireDefault(_objecttoformdata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BtServer {

  static start() {}
  static end() {}

  static beforSend() {
    BtServer.requestCount++;
    BtServer.start(BtServer.requestCount);
  }
  static afterRecieve() {
    BtServer.requestCount--;
    if (BtServer.requestCount < 0) BtServer.requestCount = 0;
    BtServer.end(BtServer.requestCount);
  }

  static checkuser(h) {
    BtServer.hookLoginRequire(h);
  }

  static errorHooks(e) {
    switch (e) {
      case 403:
        BtServer.hook403();
        break;
      default:
    }
  }
  static errorHandler(options, status) {
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

  static getAxios() {
    if (!BtServer.axiosInstance) BtServer.axiosInstance = _axios2.default.create({
      onDownloadProgress: e => {}
    });
    return BtServer.axiosInstance;
  }
  static controller(cont, meth, params, options) {
    options = options || { catch: false,
      timeout: BtServer.timeOut,
      method: 'GET'
    };
    options.method = options.method || "get";
    options.method = options.method.toLowerCase();

    let done = false;

    let timeout = options.timeOut || BtServer.timeOut;
    let cache = options.cache || false;

    let hash = "";

    if (process.env.NODE_ENV === "development") hash = `${cont}/${meth}.ctrl/${params ? JSON.stringify(params) : ""}`;else hash = (0, _hashcode2.default)({ cont, meth, params });

    // if(options.cache) hash=hashcode({cont,meth,params});
    // hash=`${cont}/${meth}.ctrl/${params?hashcode(params):""}`;

    return new Promise((res, rej) => {

      _localforage2.default.getItem(hash).then(a => {

        if (options.cache && a) {
          res(a);

          return;
        }

        BtServer.beforSend();

        const pars = options.method === "get" ? params : null;
        const dats = options.method === "post" ? (0, _objecttoformdata2.default)(params) : null;

        (0, _axios2.default)({
          //  ax({
          method: options.method,
          url: `${cont}/${meth}.ctrl`,
          params: pars,
          data: dats,
          timeout: timeout,
          config: {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
            //:{}}
          } }).then(d => {

          BtServer.afterRecieve();

          done = true;

          BtServer.checkuser(d.data.header.userState);

          if (d.header) {
            if (d.header.result !== 0) rej(d.data);
          } else {
            res(d.data);
            _localforage2.default.setItem(hash, d.data);
          }
        }).catch(d => {

          console.log(66, d);
          BtServer.afterRecieve();
          done = true;
          BtServer.errorHooks(d.request.status);
          rej(d.request.status);

          //  BtServer.errorHandler(options, d.request.status);
        });
      });
    });
  }

  static dvm(name, params, options) {
    options = options || { catch: false,
      timeout: BtServer.timeOut
    };

    let done = false;

    let timeout = options.timeOut || BtServer.timeOut;
    let cache = options.cache || false;

    let hash = "";

    if (process.env.NODE_ENV === "development") hash = `${name}${params ? JSON.stringify(params) : ""}`;else hash = (0, _hashcode2.default)({ name, params });

    //   hash = `${name}.dvm/${params ? hashcode(params) : ""}`;

    return new Promise((res, rej) => {
      _localforage2.default.getItem(hash).then(a => {
        if (options.cache && a) {
          res(a);

          return;
        }

        BtServer.beforSend();
        (0, _axios2.default)({ method: "get", url: `${name}.dvm`, params: params, timeout: timeout }).then(d => {

          BtServer.afterRecieve();
          _localforage2.default.setItem(hash, d.data);
          done = true;

          BtServer.checkuser(d.data.header.userState);

          if (d.header) {
            if (d.header.result !== 0) rej(d.data);
          } else res(d.data);
        }).catch(d => {
          BtServer.afterRecieve();
          done = true;
          BtServer.errorHooks(d.request.status);

          rej(d.request.status);

          //  BtServer.errorHandler(options, d.request.status);
        });
      });
    });
  }

}
exports.BtServer = BtServer;

BtServer.hookLoginRequire = () => {};

BtServer.hook403 = () => {};

BtServer.requestCount = 0;
BtServer.timeOut = 5000;
BtServer.axiosInstance = null;