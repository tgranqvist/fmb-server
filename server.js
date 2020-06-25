const net = require('net');
const redis = require('async-redis').createClient();
const extractors = require('./value-extractors.js');

const AUTH_PREAMBLE = Buffer.from('000f', 'hex');
const DATA_PREAMBLE = Buffer.from('00000000', 'hex');
const AUTH_OK = Buffer.from('01', 'hex');
const AUTH_DENY = Buffer.from('00', 'hex');

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
    // In this function `this` is bound to the socket

    if (buffer.slice(0, 2).equals(AUTH_PREAMBLE)) {
        authorize(buffer, this);
    } else if (buffer.slice(0, 4).equals(DATA_PREAMBLE)) {
        readData(buffer, this);
    }
}

function authorize(buffer, socket) {
    
    const IMEI = buffer.slice(2).toString();
    console.log(`authorized ${IMEI}`);

    // Check IMEI from allowed devices here. Write access log et cetera.
    // For multi-tracker use, shove the socket into a map with value of IMEI or
    // more info. Later handlers that are bound to the socket can get from that
    // map and access related attributes that way.
    connections.put(this, IMEI);
    socket.write(AUTH_OK);
}

function readData(buffer, socket) {

    console.log(`Got ${buffer.length} bytes of data`);
    console.log(`Data length: ${buffer.readUInt32BE(4)}`);
    console.log(`Codec ID: ${buffer.readUInt8(8)}`);
    
    const numRecords = buffer.readUInt8(9);
    console.log(`Records: ${numRecords}`);

    buffer = buffer.slice(10); // Discard data read so far

    const records = [];

    for (let i = 0; i < numRecords; i++) {
        const timestamp = new Date(Number(buffer.readBigInt64BE()));
        buffer = buffer.slice(8);

        const priority = buffer.readUInt8();
        buffer = buffer.slice(1);

        [buffer, gpsData] = readGPSElement(buffer);

        const ioEventId = buffer.readUInt8();
        buffer = buffer.slice(1);

        const numIds = buffer.readUInt8();
        buffer = buffer.slice(1);

        const ioOneByteCount = buffer.readUInt8();
        buffer = buffer.slice(1);
        [buffer, ioOneByteRecords] = readIOElement(buffer, ioOneByteCount, extractors.oneByteValueExtractor);

        const ioTwoByteCount = buffer.readUInt8();
        buffer = buffer.slice(1);
        [buffer, ioTwoByteRecords] = readIOElement(buffer, ioTwoByteCount, extractors.twoByteValueExtractor);

        const ioFourByteCount = buffer.readUInt8();
        buffer = buffer.slice(1);
        [buffer, ioFourByteRecords] = readIOElement(buffer, ioFourByteCount, extractors.fourByteValueExtractor);

        const ioEightByteCount =  buffer.readUInt8();
        buffer = buffer.slice(1);
        [buffer, ioEightByteRecords] = readIOElement(buffer, ioEightByteCount, extractors.eightByteValueExtractor);

        console.log(timestamp);
        console.log(`Prio: ${priority}`);
        console.log(gpsData);
        console.log(`I/O Event ID: ${ioEventId}`);
        console.log(`Number of IDs: ${numIds}`);
        console.log(ioOneByteRecords);
        console.log(ioTwoByteRecords);
        console.log(ioFourByteRecords);
        console.log(ioEightByteRecords);
    }

    const numRecords2 = buffer.readUInt8();
    buffer = buffer.slice(1);
    console.log(`Records2: ${numRecords2}`);

    const crc = buffer.readUInt32BE();
    buffer = buffer.slice(4);
    console.log(`CRC: ${crc}`);

    console.log(`Data left: ${buffer.length}`);

    // Acknowledge transferred packets
    const ackReply = Buffer.from(numRecords.toString(16).padStart(8, '0'), 'hex');
    socket.write(ackReply);
}

function readGPSElement(buffer) {
    const longitude = (buffer.readUInt32BE() / 10000000);
    buffer = buffer.slice(4);

    const latitude = (buffer.readUInt32BE() / 10000000);
    buffer = buffer.slice(4);

    const altitude = buffer.readUInt16BE();
    buffer = buffer.slice(2);

    const angle = buffer.readUInt16BE();
    buffer = buffer.slice(2);

    const satellites = buffer.readUInt8();
    buffer = buffer.slice(1);

    const speed = buffer.readUInt16BE();
    buffer = buffer.slice(2);

    const data = {
        latitude,
        longitude,
        altitude,
        angle,
        satellites,
        speed
    };

    return [buffer, data];
}

function readIOElement(buffer, count, extractor) {
    const records = {};
    for (let i = 0; i < count; i++) {
        const ioId = buffer.readUInt8();
        buffer = buffer.slice(1);

        const [len, ioValue] = extractor(buffer);
        buffer = buffer.slice(len);

        records[ioId] = ioValue;
    }

    return [buffer, records];
}

function cleanup() {
    console.log('Cleaning up (nop)');
}

module.exports = server;