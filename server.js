const net = require('net');

const PORT = process.env.PORT || 4242;

const devices = new Set();
const connections = new Map();

devices.add('359633100351209');

const server = net.createServer(socket => {
    socket.on('error', e => {
        console.error(e);
        socket.close();
    });

    //socket.on('readable', parse);
    socket.on('data', function(buffer) {
        //console.log(this);
        console.log(buffer);
        console.log(buffer.length);
        this.write(Buffer.from('01', 'hex'));
    });
    socket.on('end', cleanup);
});

server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
});


function parse() {
    const connection = connections.get(this);
    if (connection) {
        // Device already authenticated
        const socket = connection.socket;

	console.log('Doing xfer');

        if (!connection.waiting) {
            console.log('\tReading length');

            const tmp = socket.read(8);
            if (!tmp) return;

            const contentLength = tmp.slice(4).readUInt32BE();
            console.log(`Receiving ${contentLength} bytes of data`);
            const content = socket.read(contentLength);

            if (!content) {
                connection.waiting = true;
                connection.contentLength = contentLength;

                return;
            }

            console.log(content);
        }

        console.log('\tReading content');
        if (connection.contentLength < 1) {
            throw new Error(`Invelid content length ${connection.contentLength}`);
        }

        const content = socket.read(connection.contentLength);
        if (!content) {
            return;
        }
        console.log(content);
    } else {
	console.log('Doing auth');
        // Authenticate the device
        let IMEI = this.read(17);
        IMEI = IMEI.toString().slice(2);

        if (!devices.has(IMEI)) {
            throw new Error(`Unknown device ${IMEI}`);
        }
        console.log(`Connection from ${IMEI}`);

        connections.set(this, {IMEI, socket: this, waiting: false});

        this.write(Buffer.from('01', 'hex'));
    }
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
