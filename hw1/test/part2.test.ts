import { expect } from "chai";

import { partition, mapMat,composeMany,uniqueTypes  } from "../src/part2/part2"
import {readFileSync} from "fs";


function biggerthen10(element:number) {
    return (element >= 10);
}

describe("Assignment 1 Part 2 Q:1 (partition)", () => {
    let a12 = [1, 2, 34, 4, 576, 3];
    let a13 = [[34, 576], [1, 2, 4, 3 ]];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    it("check 1",()=> {
        expect(partition(biggerthen10,a12)).to.eql(a13);
    });

    it("check 2",()=> {
        expect(partition(x => x % 2 === 0, numbers)).to.eql([[2, 4, 6, 8], [1, 3, 5, 7, 9]]);
    });
});

describe("Assignment 1 Part 2 Q:2 (mapMat)", () => {
    let result =  [[ 1, 4, 9 ], [ 16, 25, 36 ], [ 49, 64, 81 ]];
    let start =  [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];
    it("check 1 ", () => {
        expect(mapMat(x => x * x, start)).to.eql(result);
    });
});

describe("Assignment 1 Part 2 Q:3 (composeMany)", () => {
    const squareAndHalf = composeMany([(x: number) => x / 2, (x: number) => x * x]);
    it("check 1", () => {
        expect(squareAndHalf(5)).to.eql(12.5);
    });

    it("composes 3 functions", () => {
        const f = composeMany([(x: number) => x / 2, (x: number) => x * x, (x: number) => x + 3]);
        expect(f(1)).to.eq(8);
    });
});
