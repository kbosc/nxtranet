/*
 *  ___   _   _ |  _|_ __  _
 *  |__) [_] |_ |<  |_ |  [_] |\|
 *
 * File: \utils\redux.ts
 * Project: dashboard
 * Created Date: Friday, 22nd October 2021 8:01:29 pm
 * Author: leone
 * -----
 * Last Modified: Mon Jan 17 2022
 * Modified By: leone
 * -----
 * Copyright (c) 2021 docktron
 * -----
 */

import type {AxiosInstance} from "axios";
import {AnyAction, Dispatch as ReduxDispatch} from "redux";
import type {ThunkDispatch} from "redux-thunk";
import {ThunkAction} from "redux-thunk";


type Awaited<T> = T extends PromiseLike<infer U> ? U : T

declare module "redux" {
  function bindActionCreators<M extends ActionCreatorsMapObject<any>>(
    actionCreators: M,
    dispatch: ReduxDispatch
  ): {
      [N in keyof M]: ReturnType<M[N]> extends ThunkAction<any, any, any, any>
      ? (...args: Parameters<M[N]>) => Promise<DispatchReturn<Awaited<Awaited<ReturnType<ReturnType<M[N]>>>['payload']>>>
      : M[N]
    };
}

type DefineAction = {
  DEFAULT: string;
  PENDING: string;
  REJECTED: string;
  FULFILLED: string;
  ON_EVENT: string;
};

export const defineAction = (name: string): DefineAction => {
  return {
    DEFAULT: name,
    PENDING: `${name}_PENDING`,
    REJECTED: `${name}_REJECTED`,
    FULFILLED: `${name}_FULFILLED`,
    ON_EVENT: `${name}_ON_EVENT`,
  }
}

export type ActionGen<S, R> = R | ((...args: ThunkParam<S>) => R | Promise<R>);
export type Action<Args extends any[], S, R> = (...args: Args) => ActionGen<S, R>;
export type Dispatch<S> = ThunkDispatch<S, AxiosInstance, AnyAction>;
export type ThunkParam<S> = [Dispatch<S>, () => S, AxiosInstance];

export type DispatchReturn<R> = {
  action: {
    type: string;
    payload: R,
  }
  value: R
}

export const createAction = <Args extends any[], S, R>(define: DefineAction, fn: Action<Args, S, R>) =>
  (...args: Args) => async (dispatch: Dispatch<S>, getState: () => S, api: AxiosInstance): Promise<{
    type: string,
    payload: R | Promise<R>,
  }> => {
    const ret = fn(...args);
    if (ret instanceof Function) {
      return await dispatch({
        type: define.DEFAULT,
        payload: ret(dispatch, getState, api),
      });
    } else {
      return dispatch({
        type: define.DEFAULT,
        payload: ret,
      });
    }
  };
