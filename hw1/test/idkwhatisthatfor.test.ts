import { expect } from "chai";
import { Optional, makeSome, makeNone, isSome, isNone, bind as Optionalbind } from "../src/part3/optional";
import { Result, makeFailure, makeOk, isOk, isFailure, bind as Resultbind, naiveValidateUser, monadicValidateUser } from "../src/part3/result";

describe("Assignment 1 Part 3 Optional", () => {

    it("Some and None assignment example", () =>{
        const safeDiv = (x: number, y: number): Optional<number> =>
        y === 0 ? makeNone() : makeSome(x / y);
        expect(safeDiv(5, 2)).to.deep.equal({ tag: 'Some', value: 2.5 });
        expect(safeDiv(5, 0)).to.deep.equal({ tag: 'None'});
    });

    it("Some and None basic functions", () =>{
        const some = makeSome(5);
        const none = makeNone();

        expect(isSome(some)).equal(true);
        expect(isNone(none)).equal(true);

        // expect(isSome(5)).equal(false);
        // expect(isNone("Hello")).equal(false);
    });

    it("Optional bind", () =>{
        const op: Optional<number> = makeSome(5);
        const bind1 = Optionalbind(op, x => x > 2 ? makeSome(x*x) : makeNone());
        isSome(bind1) ? expect(bind1.value).equal(25) : expect("").equal("Optional bind, bind1")

       // const bind2 = Optionalbind(bind1, x => x > 25 ? makeSome(x/2) : makeNone());
      //  expect(isNone(bind2)).equal(true)
    });
});

describe("Assignment 1 Part 3 Result", () => {
    
    interface User {
        name: string;
        email: string;
        handle: string;
    }

    const number : number = 5
    const str : string = "a"

    it("Result assignment example", () =>{
        const validateName = (user: User): Result<User> =>
            user.name.length === 0 ? makeFailure("Name cannot be blank.") :
            user.name === "Bananas" ? makeFailure("Bananas is not a name.") :
            makeOk(user);
        const user1 = { name: "Ben", email: "bene@post.bgu.ac.il", handle: "bene" };
        const user2 = { name: "Bananas", email: "me@bananas.com", handle: "bene" };
        expect(validateName(user1)).to.deep.equal({ tag: 'Ok',value: { name: 'Ben', email: "bene@post.bgu.ac.il", handle: 'bene' } });
        expect(validateName(user2)).to.deep.equal({ tag: 'Failure', message: "Bananas is not a name."});
    });

    it("basic functions", () =>{

        const mOk = makeOk(number)
        let makefa = makeFailure(str)

        expect(mOk).to.deep.equal({tag : 'Ok', value: number})
        expect(makefa).to.deep.equal({ tag: 'Failure', message: str})

        expect(isOk(mOk)).equal(true)
      //  expect(isOk({tag : str})).equal(false)
        expect(isFailure(makefa)).equal(true)
      //  expect(isFailure({tag : str})).equal(false)
    });

    it("Result bind", () =>{
        const res : Result<number> = makeOk(number);

        const bind1 = Resultbind(res, x => x > 2 ? makeOk(x*x) : makeFailure(str));
        isOk(bind1) ? expect(bind1.value).equal(number*number) : expect("").equal("Result bind, bind1")

     //   const bind2 = Resultbind(bind1, x => x > 25 ? makeOk(x/2) : makeFailure(str));
    //    isFailure(bind2) ? expect(bind2.message).equal(str) : expect("").equal("Result bind, bind2")
    });

    
    it("naiveValidateUser", () =>{
        const user1 = { name: "Ben", email: "bene@post.bgu.ac.il", handle: "bene" };
        const user2 = { name: "a", email: "me@bananas.com", handle: "@" };

        expect(isOk(naiveValidateUser(user1))).equal(true)
        expect(isFailure(naiveValidateUser(user2))).equal(true)
    });

    it("monadicValidateUser", () =>{
        const user1 = { name: "Ben", email: "bene@post.bgu.ac.il", handle: "bene" };
        const user2 = { name: "a", email: "me@a.com", handle: "@" };

        const user3 = { name: "a", email: "a@post.bgu.ac.il", handle: "a" };

        expect(isOk(monadicValidateUser(user1))).equal(true)
        expect(isFailure(monadicValidateUser(user2))).equal(true)

        const user3Res = monadicValidateUser(user3)
        isOk(user3Res) ? expect(user3Res.value).to.deep.equal(user3) : expect("").equal("monadicValidateUsert user3Res")
    });
});