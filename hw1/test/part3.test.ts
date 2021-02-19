import { expect } from "chai";
import { Optional, makeNone, makeSome, bind as bindOptional, isNone, isSome } from "../src/part3/optional";
import { Result, makeOk, makeFailure, bind as bindResult, isFailure, isOk, monadicValidateUser,naiveValidateUser } from "../src/part3/result"
import { reduce } from "ramda";

describe("Assignment 1 Part 3 (Optional)", () => {
    const div = (x: number, y: number): Optional<number> =>
        y === 0 ? makeNone() : makeSome(x / y);

    const power = (x: number, y: number): Optional<number> =>
        y === 0 && x === 0 ? makeNone() : makeSome(Math.pow(x, y));

    const sqrt = (x: number): Optional<number> =>
        x < 0 ? makeNone() : makeSome(Math.sqrt(x));

    const isOptionalValue = <T>(x: T): (o: Optional<T>) => boolean =>
        o => isSome(o) && o.value === x;

    // sqrt(x) / y
    const fTest = (x: Optional<number>, y: Optional<number>): Optional<number> =>
        bindOptional(bindOptional(x, sqrt), xv => bindOptional(y, yv => div(xv, yv)));

    // sqrt(x^y / z)
    const gTest = (x: Optional<number>, y: Optional<number>, z: Optional<number>): Optional<number> => {
        let vo = bindOptional(x, xv => bindOptional(y, yv => power(xv, yv)));
        vo = bindOptional(vo, v => bindOptional(z, zv => div(v, zv)));
        vo = bindOptional(vo, sqrt);
        return vo;
    }

    const f = (x: number, y: number): Optional<number> =>
        fTest(makeSome(x), makeSome(y));

    const g = (x: number, y: number, z: number): Optional<number> =>
        gTest(makeSome(x), makeSome(y), makeSome(z));

    it("checks fTest returns None", () => {
        expect(f(-5, 6)).to.satisfy(isNone);
        expect(f(9, 0)).to.satisfy(isNone);
        expect(fTest(makeNone(), makeSome(8))).to.satisfy(isNone);
        expect(fTest(makeSome(9), makeNone())).to.satisfy(isNone);
    });

    it("check fTest returns Some<T> value", () => {
        expect(f(36, 3)).to.satisfy(isOptionalValue(2));
        expect(f(9, 1)).to.satisfy(isOptionalValue(3));
    });

    it("checks gTest returns None", () => {
        expect(g(0, 0, 6)).to.satisfy(isNone);
        expect(g(5, 2, 0)).to.satisfy(isNone);
        expect(g(4, 2, -2)).to.satisfy(isNone);
        expect(gTest(makeNone(), makeSome(8), makeSome(4))).to.satisfy(isNone);
        expect(gTest(makeSome(9), makeNone(), makeSome(1))).to.satisfy(isNone);
        expect(gTest(makeSome(9), makeSome(2), makeNone())).to.satisfy(isNone);
    });

    it("checks gTest returns Some<T> value", () => {
        expect(g(5, 2, 4)).to.deep.eq(makeSome(2.5));
        expect(g(3, 3, 3)).to.deep.eq(makeSome(3));
        expect(g(6, 2, 4)).to.deep.eq(makeSome(3));
        expect(g(5, 3, 5)).to.deep.eq(makeSome(5));
    });
});


describe("Assignment 1 Part 3 (Result)", () => {

    interface User {
        name: string;
        email: string;
        handle: string;
    }

    let emptyemail: User = {name : "avi", email:"", handle: "mylife"};
    let emptyename: User = {name : "", email:"ff@gmail.com", handle: "mylife"};
    let emptyehandle: User = {name : "jodi froster", email:"ff@gmail.com", handle: ""};
    let bananas: User = {name : "yosi", email:"bananas.com", handle: "ban ayon"};
    let thinkisTwitter: User = {name : "yosi", email:"ban@ayon", handle: "@"};
    let thinkisBananas: User = {name : "Bananas", email:"basdfasdf", handle: "snajsd"};

    it("checks monadicValidateUser returns Failure on empty", () => {
        expect(monadicValidateUser(emptyemail)).to.satisfy(isFailure);
        expect(monadicValidateUser(emptyemail)).to.deep.eq(makeFailure("Email cannot be empty"));
        expect(monadicValidateUser(emptyename)).to.satisfy(isFailure);
        expect(monadicValidateUser(emptyename)).to.deep.eq(makeFailure("Name cannot be empty"));
        expect(monadicValidateUser(emptyehandle)).to.satisfy(isFailure);
        expect(monadicValidateUser(emptyehandle)).to.deep.eq(makeFailure("Handle cannot be empty"));
    });

    it("checks monadicValidateUser returns Failure when email endsWith bananas.com" , () => {
        expect(monadicValidateUser(bananas)).to.satisfy(isFailure);
        expect(monadicValidateUser(bananas)).to.deep.eq(makeFailure("Domain bananas.com is not allowed"));
    });


    it("checks monadicValidateUser returns Failure when handle startsWith @" , () => {
        expect(monadicValidateUser(thinkisTwitter)).to.satisfy(isFailure);
        expect(monadicValidateUser(thinkisTwitter)).to.deep.eq(makeFailure("This isn't Twitter"));
    });

    it("checks monadicValidateUser returns Failure when name is Bananas" , () => {
        expect(monadicValidateUser(thinkisBananas)).to.satisfy(isFailure);
        expect(monadicValidateUser(thinkisBananas)).to.deep.eq(makeFailure("Bananas is not a name"));
    });


    it("checks monadicValidateUser returns Ok", () => {
        let user: User = {name : "avi", email:"ilikebanan@aa.com", handle: "mylife"};
        expect(monadicValidateUser(user)).to.satisfy(isOk);
        expect(monadicValidateUser(user)).to.deep.eq(makeOk(user));
    });

    it("checks naiveValidateUser returns Failure on empty", () => {
        expect(naiveValidateUser(emptyemail)).to.satisfy(isFailure);
        expect(naiveValidateUser(emptyemail)).to.deep.eq(makeFailure("Email cannot be empty"));
        expect(naiveValidateUser(emptyename)).to.satisfy(isFailure);
        expect(naiveValidateUser(emptyename)).to.deep.eq(makeFailure("Name cannot be empty"));
        expect(naiveValidateUser(emptyehandle)).to.satisfy(isFailure);
        expect(naiveValidateUser(emptyehandle)).to.deep.eq(makeFailure("Handle cannot be empty"));
    });

    it("checks naiveValidateUser returns Failure when email endsWith bananas.com" , () => {
        expect(naiveValidateUser(bananas)).to.satisfy(isFailure);
        expect(naiveValidateUser(bananas)).to.deep.eq(makeFailure("Domain bananas.com is not allowed"));
    });

    it("checks naiveValidateUser returns Failure when handle startsWith @" , () => {
        expect(naiveValidateUser(thinkisTwitter)).to.satisfy(isFailure);
        expect(naiveValidateUser(thinkisTwitter)).to.deep.eq(makeFailure("This isn't Twitter"));
    });

    it("checks naiveValidateUser returns Failure when name is Bananas" , () => {
        expect(naiveValidateUser(thinkisBananas)).to.satisfy(isFailure);
        expect(naiveValidateUser(thinkisBananas)).to.deep.eq(makeFailure("Bananas is not a name"));
    });

    it("checks naiveValidateUser returns Ok", () => {
        let user: User = {name : "avi", email:"ilikebanan@aa.com", handle: "mylife"};
        expect(naiveValidateUser(user)).to.satisfy(isOk);
        expect(naiveValidateUser(user)).to.deep.eq(makeOk(user));
    });

    expect(monadicValidateUser(emptyemail)).to.satisfy(isFailure);

});


describe("Assignment 1 Part 3 (Result)", () => {
    const div = (x: number, y: number): Result<number> =>
        y === 0 ? makeFailure("division by 0") : makeOk(x / y);

    const power = (x: number, y: number): Result<number> =>
        y === 0 && x === 0 ? makeFailure("0 to the power of 0") : makeOk(Math.pow(x, y));

    const sqrt = (x: number): Result<number> =>
        x < 0 ? makeFailure("square root of negative number") : makeOk(Math.sqrt(x));

    const isResultValue = <T>(x: T): (r: Result<T>) => boolean =>
        r => isOk(r) && r.value === x;

    const isFailureMessage = <T>(msg: string): (r: Result<T>) => boolean =>
        r => isFailure(r) && r.message === msg;

    // sqrt(x) / y
    const fTest = (x: Result<number>, y: Result<number>): Result<number> =>
        bindResult(bindResult(x, sqrt), xv => bindResult(y, yv => div(xv, yv)));

    // sqrt(x^y / z)
    const gTest = (x: Result<number>, y: Result<number>, z: Result<number>): Result<number> => {
        let vo = bindResult(x, xv => bindResult(y, yv => power(xv, yv)));
        vo = bindResult(vo, v => bindResult(z, zv => div(v, zv)));
        vo = bindResult(vo, sqrt);
        return vo;
    }

    const f = (x: number, y: number): Result<number> =>
        fTest(makeOk(x), makeOk(y));

    const g = (x: number, y: number, z: number): Result<number> =>
        gTest(makeOk(x), makeOk(y), makeOk(z));

    it("checks fTest returns Failure", () => {
        expect(f(-5, 6)).to.deep.eq(makeFailure("square root of negative number"));
        expect(f(9, 0)).to.deep.eq(makeFailure("division by 0"));
        expect(fTest(makeFailure("blah"), makeOk(8))).to.deep.eq(makeFailure("blah"));
        expect(fTest(makeOk(9), makeFailure("test"))).to.deep.eq(makeFailure("test"));
    });

    it("check fTest returns Some<T> value", () => {
        expect(f(36, 3)).to.deep.eq(makeOk(2));
        expect(f(9, 1)).to.deep.eq(makeOk(3));
    });

    it("checks gTest returns None<T>", () => {
        expect(g(0, 0, 6)).to.deep.eq(makeFailure("0 to the power of 0"));
        expect(g(5, 2, 0)).to.deep.eq(makeFailure("division by 0"));
        expect(g(4, 2, -2)).to.deep.eq(makeFailure("square root of negative number"));
        expect(gTest(makeFailure("test2"), makeOk(8), makeOk(4))).to.deep.eq(makeFailure("test2"));
        expect(gTest(makeOk(9), makeFailure("hello"), makeOk(1))).to.deep.eq(makeFailure("hello"));
        expect(gTest(makeOk(9), makeOk(2), makeFailure("hi there"))).to.deep.eq(makeFailure("hi there"));
    });

    it("checks gTest returns Some<T> value", () => {
        expect(g(5, 2, 4)).to.deep.eq(makeOk(2.5));
        expect(g(3, 3, 3)).to.deep.eq(makeOk(3));
        expect(g(6, 2, 4)).to.deep.eq(makeOk(3));
        expect(g(5, 3, 5)).to.deep.eq(makeOk(5));
    });
});

describe("Assignment 1 Part 3 (reduce bind)", () => {
    const f = (x: number): Optional<number> => makeSome(x * 2);
    const g = (x: number): Optional<number> => makeSome(x + 2);

    it("checks reduce with bind works properly", () => {
        expect(reduce(bindOptional, makeSome(5), [f, g])).to.satisfy(isSome);
        // expect(reduce(bindOptional, makeNone(), [f, g])).to.satisfy(isNone); // compile error
        expect(reduce<(x: number) => Optional<number>, Optional<number>>(bindOptional, makeNone(), [f, g])).to.satisfy(isNone);
    });
});

describe("Assignment 1 Part 3 (reduce bind)", () => {
    const f = (x: number): Result<number> => makeOk(x * 2);
    const g = (x: number): Result<number> => makeOk(x + 2);

    it("checks reduce with bind works properly", () => {
        expect(reduce(bindResult, makeOk(5), [f, g])).to.satisfy(isOk);
        // expect(reduce(bindResult, makeFailure("error"), [f, g])).to.satisfy(isFailure); // compile error
        expect(reduce<(x: number) => Result<number>, Result<number>>(bindResult, makeFailure("error"), [f, g])).to.satisfy(isFailure)
    });
});