export function curry (originalFunction) {

    return function curryOutput (...args) {
        if (args.length == 0) {
            return curryOutput;
        } else if (args.length >= originalFunction.length) {
            return originalFunction(...args);
        } else {
            return curry(originalFunction.bind(null, ...args));
        }
    }

}

export function deepClone(input) {
    if (typeof input !== "object") {
        return input;
    } else if (input instanceof Function) {
        return function(...args) {
            input(...args)
        };
    } else {
        let output;

        if (input instanceof Array) {
            output = [...input];
        } else {
            output = {...input};
        }

        for (const key in output) {
            output[key] = deepClone(output[key]);
        }

        return output;
    }
}