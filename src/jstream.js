"use strict";

console.clear();

function createStream (head, tail) {
    return [head, function () { return tail();}];
}

function integerFrom (n) {
    return createStream(n, integerFrom.bind(null, n + 1));
}

function enumerateInterval (low, high) {
    if (low > high) {
        return new Array(2);
    } 
    
    return createStream(low, enumerateInterval.bind(null, low + 1, high));
}

function head (stream) {
    return stream && stream[0];
}

function tail (stream) {
    return stream && stream[1] && stream[1].call();
}

function isEmptyStream (stream) {
    return stream == null || stream[1] == null;
}

function map (stream, iter) {
    if (isEmptyStream(stream)) return undefined;
    // return createStream(iter.call(null, head(stream)), map.bind(null,tail(stream), iter));
    return createStream(iter.call(null, head(stream)), function () {
        return map(tail(stream), iter);
    });
}

function take (stream, n) {
    if (n <= 0) return undefined;

    return createStream(head(stream), function () {
        return take(tail(stream), n - 1);
    });    
}

function each (stream, fn) {
    while(!isEmptyStream(stream)) {
        var h = head(stream);
        stream = tail(stream);
        fn.call(null, h);
    }
}

function printStream (stream) {
    each(stream, function (item) { console.log(":", item); });
}

function double (x) {
    return x*2;
}

var s = integerFrom(0);
// s = enumerateInterval(3,11);

// each(s, function (item) { console.log(":", item); });
printStream(take(map(s, double), 5));

