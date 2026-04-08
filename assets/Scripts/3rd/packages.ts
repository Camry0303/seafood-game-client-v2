//=====FlyIo========
// 执行 npm install flyio
// 注意：为了兼容cocos，应在flyio的package.json中，将main字段指向index.js ["main": "index.js"]
import _fly from "flyio";
import { Fly } from "flyio";
export const fly = _fly as Fly;
//=================

// //=====Axios 原生兼容问题废弃========
// import * as _axios from "../../../node_modules/axios/dist/esm/axios.min.js";
// import { AxiosStatic } from "axios";
// const ensureImport = <T>(raw: T): T =>
//   typeof (raw as any).default === "object" ? (raw as any).default : raw;
// // 将其解包、并添加相关的类型推断
// export const axios = ensureImport(_axios).default as AxiosStatic;
// //=============

//======Socket.IO========
// 需要在cocos项目中启用websocket支持
import _io from "socket.io-client/dist/socket.io.js";
import { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
declare function lookup(opts?: Partial<ManagerOptions & SocketOptions>): Socket;
declare function lookup(
  uri: string,
  opts?: Partial<ManagerOptions & SocketOptions>
): Socket;
declare function lookup(
  uri: string | Partial<ManagerOptions & SocketOptions>,
  opts?: Partial<ManagerOptions & SocketOptions>
): Socket;
// 导出socket.io-client的lookup函数
export const io = _io as typeof lookup;
//==============
