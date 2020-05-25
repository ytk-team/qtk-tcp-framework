# qtk-tcp-framework
qtk微服务框架体系一环，为最底层的异步tcp请求框架。框架内部维护连接心跳，默认每20秒发送一个心跳包，30秒连接无响应超时。 **请求体/响应体必须为Buffer形式，框架不解析请求体/响应体内容，故数据协议开发者可以自行定义**。

## Server初始化
- **host:** 监听ip，默认localhost
- **port:** 监听端口
- **heartbeat:** 心跳包间隔(单位秒)，默认20
- **timeout:** 连接无响应超时(单位秒)，默认30。**(服务端不响应客户端请求情况不算连接超时，此时还有心跳包，故不会触发超时)**

```js
const server = new Server({ port: 8212 });
```

## Client初始化
- **host:** 服务端ip，默认localhost
- **port:** 服务端端口
- **timeout:** 连接无响应超时(单位秒)，默认30。**(服务端不响应客户端请求情况不算连接超时，此时还有心跳包，故不会触发超时)**

```js
const client = new Client({ port: 8212 });
```

## 客户端发送请求
- **uuid:** 36位uuid(含-), 每次请求的唯一标识
- **data:** 请求体buffer


```js
client.send({ uuid: uuid(), data: Buffer.from('echo') });
```

## 服务端接受请求
服务端监听data事件，回调函数包含两个参数:
- **socket:** 客户端socket对象
- **请求体信息:**
    - **uuid:** 客户端某次请求的uuid
    - **data:** 请求体buffer

```js
server.on('data', (socket, {uuid, data}) => {

})
```

## 服务端响应请求
服务端监听data事件，收到请求后，调用``send``方法响应本次客户端请求。``send``方法包含两个参数:

- **socket:** 客户端socket对象
- **响应体信息:**
    - **uuid:** 响应客户端某次请求的uuid
    - **data:** 响应体buffer

```js
server.on('data', (socket, {uuid, data}) => {
    server.send(socket, {uuid, data}); //原封不动返回data
})
```

## 客户端接受服务端响应
客户端监听data事件，回调函数包含一个参数:
- **响应体信息:**
    - **uuid:** 客户端某次请求的uuid
    - **data:** 响应体buffer

```js
client.on('data', ({uuid, data}) => {

})
```

## 系统事件

### Server
- **started:** 服务端启动
- **stopped:** 服务端停止
- **connected:** 新的客户端连接，参数: (socket)
- **closed:** 客户端断开，参数: (socket)
- **exception:** 系统出错，参数: (socket, error)
- **data:** 客户端请求, 参数: (socket, {uuid, data})

### Client
- **connected:** 连接服务端成功
- **closed:** 连接关闭
- **exception:** 系统出错，参数: (error)
- **data:** 服务端响应, 参数: ({uuid, data})

## Demo
```js
//server.js
const Server = require('@qtk/tcp-framework').Server;
const server = new Server({ port: 8212 });

server.on('data', (socket, {uuid, data}) => {
    switch(data.toString('utf8')) {
        case "echo":
            server.send(socket, {uuid, data});
            break;
        case "delayed_echo":
            setTimeout(() => {
                server.send(socket, {uuid, data});
            }, 3000);
            break;
        default:
            break;
    }
});

server.start();

//client.js
const Client = require('@qtk/tcp-framework').Client;
const uuid = require('uuid').v1;
const port = 8212;

client.on('data', ({uuid, data}) => {
    console.log(`got response, uuid: ${uuid}, data: ${data.toString('utf8')}`);
});

client.send({ uuid: uuid(), data: Buffer.from('echo') });

```

## 备注
- 3.0版本与之前的版本协议不兼容，请勿混合使用
- 3.0版本比2.0版性能提升13%