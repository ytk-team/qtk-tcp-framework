const Client = require('../client');
const assert = require('power-assert');
const genUuid = require('uuid').v1;
const childProcess = require('child_process');
const port = 8212;

before('start server', async () => {
    childProcess.exec(`node ${__dirname}/server.js`);
    await new Promise((resolve) => setTimeout(() => resolve(), 1000));
});

describe("#tcp-request-framework", function () {
    this.timeout(1000000);

    it('should return [echo]', async () => {
        let uid = genUuid();
        let { uuid, data } = await new Promise((resolve) => {
            const client = new Client({ port });
            client.once('data', ({ uuid, data }) => {
                return resolve({ uuid, data });
            });
            client.on('exception', (error) => {
                console.log(error)
            })
            client.send({ uuid: uid, data: Buffer.from('echo') });
        });
        assert(uuid === uid && data.toString() === "echo", 'should return [echo]')
    });

    it('should return without error after 3 sec', async () => {
        const timeStart = new Date();

        let uid = genUuid();
        let { uuid, data } = await new Promise((resolve) => {
            const client = new Client({ port });
            client.once('data', ({ uuid, data }) => {
                return resolve({ uuid, data });
            });

            client.on('exception', (error) => {
                console.log(error)
            })
            client.send({ uuid: uid, data: Buffer.from('delayed_echo') });
        });

        const timeEnd = new Date();
        assert(timeEnd - timeStart >= 3000 && data.toString() === "delayed_echo", 'should return without error after 3 sec')
    });
});