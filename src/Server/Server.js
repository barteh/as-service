/*
 * File: Server.js
 * Project: @barteh/as-service
 * File Created: Sunday, 29th July 2018 1:41:36 pm
 * Author: rafat (ahadrt@gmail.com)
 * -----
 * Last Modified: Wednesday, 16th October 2019 1:46:31 am
 * Modified By: rafat (ahadrt@gmail.com>)
 * -----
 * Copyright 2018 - 2019 Borna Mehr Fann, Borna Mehr Fann
 * Trademark barteh
 */

import axios from "axios";

import {hashcode, objectToFormData, isBrowser} from "../utils";

import localForage from "localforage";

const fakelocaLForge = {
    setItem: () => new Promise(r => r(undefined)),
    getItem: () => new Promise(r => r(undefined))

}




let tmpLocalForage = isBrowser()
    ? localForage
    : fakelocaLForge;



/**
 * @class
 * @classdesc axios based XHR request
 */
export default class Server {

static  _reqs={};    

    static addRequest(hash,canceller){
        if(hash)
       Server._reqs['e'+hash]={hash,canceller}

    }

    static removeRequest(hash){
        delete Server._reqs['e'+hash];
        
    }

    static hookLoginRequire = () => {};
    static hook403 = () => {};
    static hookAll = () => {};
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
        Server.hookAll();
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

    static timeOut = 12000;
    static axiosInstance = null;
    static getAxios() {
        if (!Server.axiosInstance) 
            Server.axiosInstance = axios.create({
                onDownloadProgress: (/*e*/) => {}
            });
        return Server.axiosInstance;
    }
    static controller(cont, meth, params, options) {
    
        options = options || {
            cache: false,
            timeout: Server.timeOut,
            method: 'GET'
        };
        options.cancel = options.cancel || Server.generalCancel;
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

        let prom = new Promise((res, rej) => {
            tmpLocalForage
                .getItem(hash)
                .then(a => {

                    if (cache && a) {

                        res(a);
                    }

                    Server.beforSend();

                    const pars = options.method === "get"
                        ? params
                        : null;
                    const dats = options.method === "post"
                        ? objectToFormData(params)
                        : null;
var ct=undefined;
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

                    }).then(d => {
                        Server.removeRequest(hash);
                        Server.afterRecieve();

                        Server.checkuser(d.data.header.userState);

                        if (d.header) {
                            tmpLocalForage.setItem(hash, d.data);
                            if (d.header.result !== 0) 
                                rej(d.data);

                            }
                        else {

                            tmpLocalForage.setItem(hash, d.data);
                            res(d.data);

                        }
                    }).catch(d => {
                        Server.removeRequest(hash);
                        if (d && d.data && d.data.header) 
                            Server.checkuser(d.data.header.userState);
                        Server.afterRecieve();

                        Server.errorHooks(d.request.status);
                        rej(d.request.status);

                        //  Server.errorHandler(options, d.request.status);
                    });
                  
                    
                    Server.addRequest(hash,ct);
                });
        });
        return prom;
    }

    static dvm(name, params, options) {
        options = options || {
            cache: false,
            timeout: Server.timeOut,
            cancel: Server.generalCancel
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
            tmpLocalForage
                .getItem(hash)
                .then(a => {
                    if (cache && a) {
                        res(a);

                    }

                    Server.beforSend();
                    axios({
                        method: "get",
                        url: `${name}.dvm`,
                        params: params,
                        timeout: timeout,
                    }).then(d => {

                        Server.afterRecieve();
                        tmpLocalForage.setItem(hash, d.data);

                        Server.checkuser(d.data.header.userState);

                        if (d.header) {
                            if (d.header.result !== 0) 
                                res(d.data);

                            }
                        else 
                            res(d.data);

                        }
                    ).catch(d => {
                        if (d && d.data && d.data.header) 
                            Server.checkuser(d.data.header.userState);
                        Server.afterRecieve();

                        Server.errorHooks(d.request.status);

                        rej(d.request.status);

                        //  Server.errorHandler(options, d.request.status);
                    });
                });
        });
    }

    static get(url, params, options) {
        options = options || { catch: false,
            timeout: Server.timeOut
        };

        let timeout = options.timeOut || Server.timeOut;

        return axios({
            method: "get",
            url,
            params,
            timeout,
            config: {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        }).then(a => a.data);
    }

}
