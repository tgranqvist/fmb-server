/*
 * Value extractors for reading the IO Element section
 */


function oneByteValueExtractor(buffer) {
    return [1, buffer.readUInt8()];
}

function twoByteValueExtractor(buffer) {
    return [2, buffer.readUInt16BE()];
}

function fourByteValueExtractor(buffer) {
    return [4, buffer.readUInt32BE()];
}

function eightByteValueExtractor(buffer) {
    return [8, buffer.readBigInt64BE()];
}

exports.oneByteValueExtractor = oneByteValueExtractor;
exports.twoByteValueExtractor = twoByteValueExtractor;
exports.fourByteValueExtractor = fourByteValueExtractor;
exports.eightByteValueExtractor = eightByteValueExtractor;