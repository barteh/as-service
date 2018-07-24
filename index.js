"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  AsService: true,
  Server: true
};
Object.defineProperty(exports, "AsService", {
  enumerable: true,
  get: function get() {
    return _AsService.default;
  }
});
Object.defineProperty(exports, "Server", {
  enumerable: true,
  get: function get() {
    return _Server.default;
  }
});

var _AsService = _interopRequireWildcard(require("./lib/AsService"));

Object.keys(_AsService).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _AsService[key];
    }
  });
});

var _Server = _interopRequireWildcard(require("./lib/Server"));

Object.keys(_Server).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Server[key];
    }
  });
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }
