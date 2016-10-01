export class Store {
    constructor(key) {
        this.storageType = 'localStorage';
        this.className = 'Store';

        if (!key) {
            this.err('{key} expected!');
            return;
        }

        if (!(key.constructor === String && key.trim().length > 0)) {
            this.err('{key} should be String and not-empty!');
            return;
        }

        this.key = key;
        this.obj = null;
    }

    err(...args) {
        console.error(`${this.className} error: `, args);
        return false;
    }

    get() {
        const value = window[this.storageType][this.key];

        if (value === undefined) {
            this.obj = undefined;
            return this.obj;
        }

        try {
            this.obj = JSON.parse(value);
        } catch (e) {
            this.err(e);

            this.obj = null;
        }

        return this.obj;
    }

    set(value) {
        if (!value) {
            return this.err('{value} expected!');
        }

        if (value.constructor !== Object && value.constructor !== Array) {
            return this.err('{value} should be Object/Array!');
        }

        try {
            window[this.storageType][this.key] = JSON.stringify(value);
            this.obj = value;
            return true;
        } catch (e) {
            return this.err(e);
        }
    }

    remove() {
        const value = window[this.storageType][this.key];

        if (value === undefined) {
            this.err('{key} not exist!');
        }

        try {
            window[this.storageType].removeItem(this.key);
            this.obj = null;

            return true;
        } catch (e) {
            return this.err(e);
        }
    }
}


export class Session extends Store {
    constructor(key) {
        super(key);

        this.storageType = 'sessionStorage';
        this.className = 'Session';
    }
}
