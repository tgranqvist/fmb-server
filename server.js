const net = require('net');

const AUTH_PREAMBLE = Buffer.from('000f', 'hex');
const DATA_PREAMBLE = Buffer.from('00000000', 'hex');
const AUTH_OK = Buffer.from('01', 'hex');

const connections = new Map();

const server = net.createServer(socket => {
    socket.on('error', e => {
        console.error(e);
        socket.close();
    });

    socket.on('data', parse);
    socket.on('end', cleanup);
});

function parse(buffer) {
    if (buffer.slice(0, 2).equals(AUTH_PREAMBLE)) {
        authenticate(buffer, this);
    } else if (buffer.slice(0, 4).equals(DATA_PREAMBLE)) {
        readData(buffer, this);
    }
}

function authenticate(buffer, socket) {
    const IMEI = buffer.slice(2).toString();
    console.log(`Authenticated ${IMEI}`);

    // Check IMEI from allowed devices here. Write access log et cetera.
    socket.write(AUTH_OK);
}

function readData(buffer, socket) {
    console.log(`Got ${buffer.length} bytes of data`);
    console.log(`Data length: ${buffer.readUInt32BE(4)}`);
    console.log(`Codec ID: ${buffer.readUInt8(8)}`);
    
    const numRecords = buffer.readUInt8(9);
    console.log(`Records: ${numRecords}`);

    buffer = buffer.slice(10); // Discard data read so far

    for (let i = 0; i < numRecords; i++) {
        /*
        const timestamp = new Date(Number(buffer.readBigInt64BE()));
        buffer = buffer.slice(8);

        const priority = buffer.readUInt8();
        buffer = buffer.slice(1);

        console.log(`Timestamp: ${timestamp}`);
        console.log(`Prio: ${priority}`);
        
        const longitude = buffer.readUInt32BE(4);
        buffer = buffer.slice(4);
        const latitude = buffer.readUInt32BE(4);
        buffer = buffer.slice(4);

        const altitude = buffer.readUInt16BE();
        buffer = buffer.slice(2);

        const angle = buffer.readUInt16BE();
        buffer = buffer.slice(2);

        const satellites = buffer.readUInt8();
        buffer = buffer.slice(1);

        const speed = buffer.readUInt16BE();
        buffer = buffer.slice(2);

        console.log(`Timestamp: ${timestamp}`);
        console.log(`Prio: ${priority}`);
        console.log(`(${latitude};${longitude}) @ ${altitude} msl`);
        console.log(`Speed: ${speed}`);
        */
    }
    // Acknowledge transferred packets
    const ackReply = Buffer.from(numRecords.toString(16).padStart(4, '0'), 'hex');
    console.log(ackReply);
    socket.write(ackReply);
}

function cleanup() {
    console.log('Cleaning up');

    const connection = connections.get(this);
    if (!connection) return;

    const socket = connection.socket;
    socket.write('01');
    socket.close();
    connections.delete(this);
}

module.exports = server;