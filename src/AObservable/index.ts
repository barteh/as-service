/*
 * File: index.ts
 * Project: @barteh/as-service
 * File Created: Tuesday, 8th December 2020 12:27:28 pm
 * Author: Ahad Rafat Talebi (office) (ahadrt@gmail.com)
 * -----
 * Last Modified: Tuesday, 8th December 2020 12:28:04 pm
 * Modified By: Ahad Rafat Talebi (office) (ahadrt@gmail.com>)
 * -----
 * Copyright 2018 - 2020 Borna Mehr Fann, Borna Mehr Fann
 * Trademark barteh
 */

declare type TSubscribeCallback = (value: any) => void;

export class ASubscriber {
  readonly _func: TSubscribeCallback;
  readonly _observable: AObservable;
  constructor(observable: AObservable, func: TSubscribeCallback) {
    this._func = func;
    this._observable = observable;
  }
  unsubscribe() {
    this._observable.removeSubscriber(this);
  }
}

declare type TObserverMapper = (p: any) => any;

export class AObservable {
  _value: any = undefined;
  _acc: any = undefined;
  _subscribers: Array<ASubscriber> = [];
  _source?: AObservable;
  _mapper?: TObserverMapper;

  constructor(
    initialValue: any = undefined,
    map?: TObserverMapper,
    source?: AObservable
  
  ) {

    this._value = initialValue;
    this._source = source;
    this._mapper = map;
    if (this._source) {
      this._source.subscribe((v: any) => {
        this.next(v);
      });
    }
  }

  subscribe(func: TSubscribeCallback) {

    if (!func || typeof func !== "function")
      throw "subscriber shoud have a function as a parameter.";
    const subscriber = new ASubscriber(this, func);
    this._subscribers.push(subscriber);

    if (this._value) {
      func(this._value);
    }
    return subscriber;
  }

  removeSubscriber(subs: ASubscriber) {
    const idx = this._subscribers.indexOf(subs);
    if (idx > -1) {
      delete this._subscribers[idx];
      this._subscribers.splice(idx, 1);
    }
  }

  // reduce(func:(acc:any,param:any)=>any):AObservable{
  //     return new
  // }

  getValue() {
    return this._value;
  }

  map(func: (p: any) => any): AObservable {
    const ret = new AObservable(this._value,  func,this);
    return ret;
  }

  next(newValue: any) {
    if (newValue !== undefined) {
      this._value = newValue;
      const self = this;
      this._subscribers.forEach(function (sub) {
        try {
          sub._func(self._mapper ? self._mapper(self._value) : self._value);
        } catch (error) {
          console.log("error:", error);
        }
      });
    }
  }
}

export default AObservable;
