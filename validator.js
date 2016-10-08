import { Reg } from 'common/config/reg.js';

const STRATEGY = {
    required(val, opt) {
        if (val) return true;
        return false;
    },
    notEmpty(val, opt) {
        return !(val === '' || (val.constructor === Array && val.length === 0) || (val.constructor === Object && Object.keys(val).length === 0));
    },
    equal(val, opt) {
        return val === opt;
    },
    length(val, opt) {
        return (val || '').length === opt;
    },
    min(val, opt) {
        return val.length >= opt;
    },
    max(val, opt) {
        return val.length <= opt;
    },
    option(val, opt) {
        return opt.indexOf(val) > -1;
    },
    email(val, opt) {
        return (Reg.email).test(val);
    },
    phone(val, opt) {
        return (Reg.phone).test(val);
    },
    username(val, opt) {
        return (Reg.username).test(val);
    },
    password(val, opt) {
        return /^(?=.*\d)((?=.*[a-z])|(?=.*[A-Z])).{6,20}$/.test(val);
    },
    website(val, opt) {
        return (Reg.website).test(val);
    },
    nickname(val, opt) {
        return !!(val && val.length > 2 && val.length < 21);
    },
};


function camelCased(str) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}


function err(...args) {
    console.error('Validator error: ', args);
    return false;
}


export class Validator {
    constructor() {
        this.result = {};

        return this;
    }


    static validate(strategy, value) {
        return this.resolve(strategy, value);
    }

    static resolve(strategy, value) {
        const obj = {};

        if (strategy.constructor === String) {
            const s = camelCased(strategy);

            if (!STRATEGY[s]) {
                return err(`strategy{${strategy}} not exist!`);
            }

            obj[s] = STRATEGY[s](value);
        } else if (strategy.constructor === Function) {
            obj[strategy.name] = strategy(value);
        } else if (strategy.constructor === Array) {
            strategy.forEach((e) => {
                const s = camelCased(e);

                if (!STRATEGY[s]) {
                    return err(`strategy{${e}} not exist!`);
                }

                obj[s] = STRATEGY[s](value);
            });
        } else if (strategy.constructor === Object) {
            Object.keys(strategy).forEach((key) => {
                const val = strategy[key];

                if (val.constructor === Function) {
                    obj[key] = val(value);
                } else {
                    const s = camelCased(key);

                    if (!STRATEGY[s]) {
                        return err(`strategy{${key}} not exist!`);
                    }

                    obj[s] = STRATEGY[s](value, val);
                }
            });
        }


        // valid&invalid&dirty&value
        obj.valid = Object.keys(obj).every(k => obj[k] === true);
        obj.invalid = !obj.valid;
        obj.dirty = value !== null;
        obj.value = value;

        return obj;
    }


    hasRequired(strategy) {
        if (strategy.constructor === String) {
            return strategy === 'required';
        } else if (strategy.constructor === Function) {
            return false;
        } else if (strategy.constructor === Array) {
            return strategy.indexOf('required') > -1;
        } else if (strategy.constructor === Object) {
            return ('required' in strategy);
        }

        return false;
    }


    do(name, strategy, value) {
        if (!value) {
            if (!this.hasRequired(strategy)) {
                this.result[name] = {
                    valid: true,
                    invalid: false,
                    dirty: false,
                    value: null,
                };

                this.isValidAll();
                return this;
            } else if (this.hasRequired(strategy)) {
                this.result[name] = {
                    valid: false,
                    invalid: true,
                    dirty: false,
                    value: null,
                };

                this.isValidAll();
                return this;
            }
        }

        this.result[name] = Validator.resolve(strategy, value);

        this.isValidAll();
        return this;
    }


    isValidAll() {
        delete this.result.valid;
        delete this.result.invalid;

        this.result.valid = Object.keys(this.result).every(k => this.result[k].valid === true);
        this.result.invalid = !this.result.valid;
    }
}
