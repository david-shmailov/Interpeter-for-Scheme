import { expect } from "chai";
import { partition, mapMat, composeMany, maxSpeed, grassTypes, uniqueTypes } from "../src/part2/part2"

describe("Assignment 1 Part 2", () => {
    it("1.Numbers array partiton mod 2", () =>{
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let pratitionRes = partition((x: number) => x % 2 === 0, numbers);
        expect([[2,4,6,8],[1,3,5,7,9]]).to.deep.equal(pratitionRes);
        
    });

    it("1.String array have letter a in it", () =>{
        const str = ["Hello","CCA","a","c"];
        let pratitionRes = partition((x: String) => x.indexOf("a") > -1, str);
        expect([["a"],["Hello","CCA", "c"]]).to.deep.equal(pratitionRes);
        
    });

    it("2.Numbers array matMap power of 2", () =>{
        const mat = [[1, 2, 3],[4, 5, 6],[7, 8, 9]]
        let pratitionRes = mapMat((x: any) => x * x, mat);
        expect([ [ 1, 4, 9 ], [ 16, 25, 36 ], [ 49, 64, 81 ] ]).to.deep.equal(pratitionRes);
    });

    it("2.Numbers to char a if small than 10 else char b", () =>{
        const mat = [[9, 16, 20],[100, 5, 6],[7, 10, 12]]
        let mapMRes = mapMat(x => x < 10 ? "a" : "b", mat);
        expect([ [ "a", "b", "b" ], [ "b", "a", "a" ], [ "a", "b", "b" ] ]).to.deep.equal(mapMRes);
    });

    it("3.ComposeMany assignment example", () =>{
        const squareAndHalf = composeMany([(x: number) => x / 2, (x: number) => x * x]);
        expect(squareAndHalf(5)).equal(12.5);// => 12.5
        
        const add3 = composeMany([(x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1]);
        expect(add3(5)).equal(8)
    });

    it("3.ComposeMany string", () =>{
        const stringA = composeMany([(x: string) => "a", (x: string) => "b"]);
        expect(stringA("c")).equals("a");

        const stringConcatABC = composeMany([(x: string) => x.concat("C"), (x: string) => x.concat("B"), (x: string) => x.concat("A")]);
        expect(stringConcatABC("Hello")).equals("HelloABC");
    });

    interface Languages {
        english: string;
        japanese: string;
        chinese: string;
        french: string;
    }
    
    interface Stats {
        HP: number;
        Attack: number;
        Defense: number;
        "Sp. Attack": number;
        "Sp. Defense": number;
        Speed: number;
    }
    
    interface Pokemon {
        id: number;
        name: Languages;
        type: string[];
        base: Stats;
    }
    


    const l1: Languages  = { english: "pika", japanese: "", chinese: "", french: ""}
    const l2: Languages  = { english: "pokName", japanese: "", chinese: "", french: ""}
    const l3: Languages  = { english: "mue", japanese: "", chinese: "", french: ""}
    const l4: Languages  = { english: "mueC", japanese: "", chinese: "", french: ""}

    const s1: Stats = { HP: 90, Attack: 200, Defense: 150, "Sp. Attack": 10, "Sp. Defense": 10, Speed: 60}
    const s2: Stats = { HP: 500, Attack: 10, Defense: 10, "Sp. Attack": 1, "Sp. Defense": 1, Speed: 20}
    const s3: Stats = { HP: 1000, Attack: 1000, Defense: 1000, "Sp. Attack": 1000, "Sp. Defense": 10, Speed: 1000}
    const s4: Stats = { HP: 1000, Attack: 1000, Defense: 1000, "Sp. Attack": 1000, "Sp. Defense": 10, Speed: 1000}

    const p1: Pokemon = {id: 1 ,name: l1 ,type: ["Electric", "Lightning"], base: s1}
    const p2: Pokemon = {id: 2 ,name: l2 ,type: ["Water", "Grass"], base: s2}
    const p3: Pokemon = {id: 3 ,name: l3 ,type: ["Electric", "Lightning","Water", "Grass"], base: s3}
    const p4: Pokemon = {id: 4 ,name: l4 ,type: ["Lightning"], base: s4}

    it("4. Speed", () =>{
        const poks: Pokemon[] = [p1,p2,p3,p4]
        let coptyPoks = JSON.parse(JSON.stringify(poks));

        const speedPoks = maxSpeed(poks);
        expect(speedPoks.indexOf(p1)).lessThan(0);
        expect(speedPoks.indexOf(p2)).lessThan(0);
        expect(speedPoks.indexOf(p3)).greaterThan(-1);
        expect(speedPoks.indexOf(p4)).greaterThan(-1);

        expect(poks).to.deep.equal(coptyPoks);
    });

    it("4. Grass", () =>{
        const poks: Pokemon[] = [p1,p2,p3,p4]
        let coptyPoks = JSON.parse(JSON.stringify(poks));

        const GrassPoks: string[] = grassTypes(poks);
        expect(GrassPoks.length).equals(2);
        expect(GrassPoks[0]).equals("mue");
        expect(GrassPoks[1]).equals("pokName");

        expect(poks).to.deep.equal(coptyPoks);
    });

    it("4. UT", () =>{
        const poks: Pokemon[] = [p1,p2,p3,p4]
        let coptyPoks = JSON.parse(JSON.stringify(poks));

        const ut: string[] = uniqueTypes(poks);
        expect(ut).to.deep.equal(["Electric", "Grass", "Lightning", "Water"])

        expect(poks).to.deep.equal(coptyPoks);
    });


});
