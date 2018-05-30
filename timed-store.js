'use strict';

module.exports = class TimedStore {
    constructor () {
        this.store = {};
        this.timer = {};
    }

    setk (key, value, timeout) {
        if (this.timer[key] !== undefined)
            clearTimeout(this.timer[key]);
        this.store[key] = value;
        this.timer[key] = setTimeout(() => {
            delete this.store[key];
            delete this.timer[key];
        }, timeout);
    }

    getk (key) {
        return this.store[key];
    }

    getDict () {
        var dict = {};
        for (var key in this.store) {
            dict[key] = this.store[key];
        }
        return dict;
    }
}

