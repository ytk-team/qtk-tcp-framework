const ServerN = require('../server');
const serverN = new ServerN({ port: 8212 });
serverN.on('data', (socket, { uuid, data }) => {
    switch (data.toString('utf8')) {
        case "echo":
            serverN.send(socket, { uuid, data });
            break;
        case "delayed_echo":
            setTimeout(() => {
                serverN.send(socket, { uuid, data });
            }, 3000);
            break;
        default:
            break;
    }
});

// const ServerO = require('../../../silver_ins/core/node_modules/@qtk/tcp-framework').Server;
// const serverO = new ServerO({ port: 8213 });
// serverO.on('data', (socket, { uuid, data }) => {
//     switch (data.toString('utf8')) {
//         case "echo":
//             serverO.send(socket, { uuid, data });
//             break;
//         case "delayed_echo":
//             setTimeout(() => {
//                 serverO.send(socket, { uuid, data });
//             }, 3000);
//             break;
//         default:
//             break;
//     }
// });

Promise.all([
    serverN.start(),
    // serverO.start()
]);