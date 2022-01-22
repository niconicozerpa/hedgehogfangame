import { test, expect } from "@jest/globals";
import { curry } from "../functional";

function sum(a, b, c, d) {
    return a + b + c + d;
}

test("incomplete curried function should return itself", () => {
    const curriedSum = curry(sum);

    expect(curriedSum()).toBe(curriedSum);
    expect(curriedSum(100).name).toBe(curriedSum.name);
    expect(curriedSum(100, 101).name).toBe(curriedSum.name);

    expect(curriedSum(100, 101, 102).name).toBe(curriedSum.name);

    expect(curriedSum(100)(101).name).toBe(curriedSum.name);
    expect(curriedSum(100)(101, 102).name).toBe(curriedSum.name);
    expect(curriedSum(100, 101)(102).name).toBe(curriedSum.name);
    expect(curriedSum(100, 101, 102).name).toBe(curriedSum.name);

})


test("curried function different args", () => {
    const curriedSum = curry(sum);

    expect(curriedSum(100, 101, 102, 103)).toBe(sum(100, 101, 102, 103));
    expect(curriedSum(100)(101)(102)(103)).toBe(sum(100, 101, 102, 103));

    expect(curriedSum(100, 101)(102)(103)).toBe(sum(100, 101, 102, 103));
    expect(curriedSum(100)(101, 102)(103)).toBe(sum(100, 101, 102, 103));
    expect(curriedSum(100)(101)(102, 103)).toBe(sum(100, 101, 102, 103));

    expect(curriedSum(100)(101, 102, 103)).toBe(sum(100, 101, 102, 103));
    expect(curriedSum(100, 101)(102, 103)).toBe(sum(100, 101, 102, 103));
    expect(curriedSum(100, 101, 102)(103)).toBe(sum(100, 101, 102, 103));
});