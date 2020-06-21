const server = require('./server');

const PORT = process.env.PORT || 4242;

server.listen(PORT, () => {
    const endpoint = `${server.address().address}${server.address().port}`;
    console.log(`Server started on port ${endpoint}`)
});