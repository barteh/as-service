import axios from "axios";
import {hashcode, objectToFormData} from "../utils";

import localForage from "localforage";

export default class Server {
    static hookLoginRequire = () => {};
    static hook403 = () => {};

    static start() {}
    static end() {}

    static requestCount = 0;
    static beforSend() {
        Server.requestCount++;
        Server.start(Server.requestCount);
    }
    static afterRecieve() {
        Server.requestCount--;
        if (Server.requestCount < 0) 
            Server.requestCount = 0;
        Server.end(Server.requestCount);
    }

    static checkuser(h) {
        Server.hookLoginRequire(h);
    }

    static errorHooks(e) {
        switch (e) {
            case 403:
                Server.hook403();
                break;
            default:
        }
    }
    static errorHandler(options, status) {
        if (500 <= status && status < 600) {
            if (options.e500 && typeof options.e500 === "function") 
                options.e500(status);
            }
        else if (400 <= status && status < 500) {
            if (options.e500 && typeof options.e500 === "function") 
                options.e400(status);
            }
        else if (300 <= status && status < 400) {
            if (options.e500 && typeof options.e500 === "function") 
                options.e300(status);
            }
        else if (100 <= status && status < 200) {
            if (options.e500 && typeof options.e500 === "function") 
                options.e400(status);
            }
        
        if (options.error && typeof options.error === "function") {
            options.error(status);
        }
    }

    static timeOut = 5000;
    static axiosInstance = null;
    static getAxios() {
        if (!Server.axiosInstance) 
            Server.axiosInstance = axios.create({
                onDownloadProgress: (/*e*/) => {}
            });
        return Server.axiosInstance;
    }
    static controller(cont, meth, params, options) {
        options = options || { catch: false,
            timeout: Server.timeOut,
            method: 'GET'
        };
        options.method = options.method || "get";
        options.method = options
            .method
            .toLowerCase()

        let timeout = options.timeOut || Server.timeOut;
        let cache = options.cache || false;

        let hash = "";

        if (process.env.NODE_ENV === "development") 
            hash = `${cont}/${meth}.ctrl/${params
                ? JSON.stringify(params)
                : ""}`;
        else 
            hash = hashcode({cont, meth, params});
        
        // if(options.cache) hash=hashcode({cont,meth,params});
        // hash=`${cont}/${meth}.ctrl/${params?hashcode(params):""}`;

        let prom= new Promise((res, rej) => {

            localForage
                .getItem(hash)
                .then(a => {

                    if (cache && a) {

                        return res(a);
                    }

                    Server.beforSend();

                    const pars = options.method === "get"
                        ? params
                        : null;
                    const dats = options.method === "post"
                        ? objectToFormData(params)
                        : null;
                    
                    axios({
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
                        }
                        //:{}}
                    }).then(d => {

                        Server.afterRecieve();

                        Server.checkuser(d.data.header.userState);

                        if (d.header) {
                            localForage.setItem(hash, d.data);
                            if (d.header.result !== 0) 
                                 rej(d.data);
                             return prom;
                            }
                        else {

                            localForage.setItem(hash, d.data);
                            res(d.data);
                            return prom;
                        }
                    })
                    .catch(d => {

                        console.log(66, d.request.status);
                        Server.afterRecieve();

                        Server.errorHooks(d.request.status);
                        rej(d.request.status);
                        return prom;

                        //  Server.errorHandler(options, d.request.status);
                    });
                });
        });
        return prom;
    }

    static dvm(name, params, options) {
        options = options || { catch: false,
            timeout: Server.timeOut
        };

        let timeout = options.timeOut || Server.timeOut;
        let cache = options.cache || false;

        let hash = "";

        if (process.env.NODE_ENV === "development") 
            hash = `${name}${params
                ? JSON.stringify(params)
                : ""}`;
        else 
            hash = hashcode({name, params});
        
        //   hash = `${name}.dvm/${params ? hashcode(params) : ""}`;

        return new Promise((res, rej) => {
            localForage
                .getItem(hash)
                .then(a => {
                    if (cache && a) {
                        res(a);

                        return a;
                    }

                    Server.beforSend();
                    axios({method: "get", url: `${name}.dvm`, params: params, timeout: timeout}).then(d => {

                        Server.afterRecieve();
                        localForage.setItem(hash, d.data);

                        Server.checkuser(d.data.header.userState);

                        if (d.header) {
                            if (d.header.result !== 0) 
                                res(d.data);

                            }
                        else 
                            res(d.data);
                        return d.data;
                    }).catch(d => {
                        Server.afterRecieve();

                        Server.errorHooks(d.request.status);

                        rej(d.request.status);
                        return d.request.status;

                        //  Server.errorHandler(options, d.request.status);
                    });
                });
        });
    }

}
