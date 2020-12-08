"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.btoa = exports.isNode = exports.isBrowser = exports.objectToFormData = exports.hashcode = void 0;
function hashcode(inobjin) {
    var inobj = JSON.stringify(inobjin);
    //console.log(88888,inobj) return;
    var hash = 0;
    if (inobj.length === 0)
        return hash;
    for (var i = 0; i < inobj.length; i++) {
        var char = inobj.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}
exports.hashcode = hashcode;
function objectToFormData(obj) {
    var str = "";
    for (var k in obj) {
        str += k + "=" + obj[k] + "&";
    }
    str = str.slice(0, str.length - 1);
    return str;
}
exports.objectToFormData = objectToFormData;
exports.isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
exports.isNode = new Function("try {return this===global;}catch(e){return false;}");
exports.btoa = exports.isBrowser()
    ? window.btoa
    : function (str) { return Buffer
        .from(str)
        .toString('base64'); };
//# sourceMappingURL=utils.js.map