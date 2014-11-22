"use strict";

console.clear();

var EMPTY_STEAM = {
    isEmpty: function () {
        return true;
    },

    take: function () {
        return this;
    },

    take2: function () {
        return this;
    },

    map: function () { return this; },

    map2: function () { return this; },

    each: function () {},

    each2: function () {}
};

function Stream (h, t) {
    // var head = h;
    // var tail = function () {
    //     if (t == null) return EMPTY_STEAM;
        
    //     return t() || EMPTY_STEAM;
    // };

    this._head = h;
    this._tail = t;

    // Object.defineProperties(this, {
    //     "head": {
    //         get: function () { return head; }
    //     },
    //     "tail": {
    //         get: function () { return tail(); }
    //     }
    // });
}

Stream.prototype = {
    head: function () { return this._head; },

    tail: function () {
        if (this._tail == null) return EMPTY_STEAM;
        
        return this._tail() || EMPTY_STEAM;
    },
    
    isEmpty: function () {
        return false;
    },

    each: function (fn) {
        fn.call(null, this.head());

        var tail = this.tail();
        while (!tail.isEmpty()) {
            var head = tail.head();
            fn.call(null, head);
            tail = tail.tail();
        }
        // if (!this.tail().isEmpty()) {
            // this.tail().each(fn);
        // }
    },

    each2: function (fn) {
        fn.call(null, this.head());

        this.tail().each2(fn);
    },

    take: function (n) {
        if (n <= 0) return EMPTY_STEAM;

        var tail = this.tail();
        
        if (tail.isEmpty()) return EMPTY_STEAM;
        
        return new Stream(this.head(), tail.take.bind(tail, n - 1));
    },

    map: function (fn) {
        var head = fn.call(null, this.head());
        var tail = this.tail();

        if (tail.isEmpty()) return EMPTY_STEAM;

        return new Stream(head, tail.map.bind(tail, fn));
    },

    map2: function (fn) {
        var that = this;
        return new Stream(fn.call(null, this.head()), function inner_map2() {
            return that.tail().map2(fn);
        });
    },

    take2: function (n) {
        if (n <= 0) return EMPTY_STEAM;

        var that = this;
        
        return new Stream(this.head(), function inner_take2() {
            return that.tail().take2(n-1);
        });
    },
    
    print: function () {
        this.each(function (n) {console.log(n);});
    }
};



function integer (n) {
    return new Stream(n, integer.bind(null, n + 1));
}

function interval (low, high) {
    if (low > high) return EMPTY_STEAM;

    return new Stream(low, interval.bind(null, low + 1, high));
}

// var s = interval(1,5);
// s.each(function (n) {console.log(n);});

// setTimeout(function () {
    // integer(1).map(double).take(10000).each(function () {});
// }, 3000);

function test_1 () {
    console.time("test 1");
    integer(1).map(double).take(1000).each(function () {});
    console.timeEnd("test 1");
}

function test_2 () {
    console.time("test 2");
    integer(1).map2(double).take2(1000).each(function () {});
    console.timeEnd("test 2");
}

function test_3 () {
    console.time("test 3");
    var s = integerFrom(1);
    s = map(s, double);
    s = take(s, 1000);
    each(s, function () { });
    console.timeEnd("test 3");
}

function createStream (head, tail) {
    return [head, function _tail () { return tail();}];
}

function integerFrom (n) {
    return createStream(n, function _integerFrom() {
        return integerFrom(n+1);
    });
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
    // if (isEmptyStream(stream)) return undefined;
    // return createStream(iter.call(null, head(stream)), map.bind(null,tail(stream), iter));
    return createStream(iter(head(stream)), function _map () {
        return map(tail(stream), iter);
    });
}

function take (stream, n) {
    if (n <= 0) return undefined;

    return createStream(head(stream), function _take () {
        return take(tail(stream), n - 1);
    });    
}

function each (stream, fn) {
    if (isEmptyStream(stream)) return;
    
    fn(head(stream));
    each(tail(stream), fn);
    // while(!isEmptyStream(stream)) {
    //     var h = head(stream);
    //     stream = tail(stream);
    //     fn.call(null, h);
    // }
}

function printStream (stream) {
    each(stream, function (item) { console.log(":", item); });
}

function double (x) {
    return x*2;
}

// var s = integerFrom(0);
// s = enumerateInterval(3,11);

// each(s, function (item) { console.log(":", item); });
// printStream(take(map(s, double), 5));

test_1();

test_2();
test_3();
