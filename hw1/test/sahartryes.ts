import { reduce, map, identity, max, filter, any, type } from "ramda";
import { randomBytes } from "crypto";

export const sum : (a: number[]) => number =
 (a: number[]) => reduce(
    (acc : number,elem: number ) => acc + elem, 
  0 , a);

  let t = [1,2,3];
  //console.log(sum(t));


  export const aaaaaaaa : (num1 : number , array: number[]) => boolean =
  (num1 : number , array: number[]) =>  any((t: number) => t === num1 , array);

  let t1 = [1,2,3,4,5,6];
 // console.log(aaaaaaaa(5,t1));

export const partition: <T>(predicate: (x: T) => boolean, array: T[]) => T[][] = 
<T>(predicate: (x: T) => boolean, array: T[]) => reduce(
(acc : T[][],elem : T) => 
 predicate(elem) ? 
[acc[0].concat([elem]), acc[1]] : 
[acc[0], acc[1]],
[[],[]],
array
);


{
  interface Link<T> {
    x: T;
    next?: Link<T>;
}

{
  let lst2 : Link<string> = {
    x: "avi",
    next: { x: "bob",
            next: {x: "charles"}
    }
  }
  lst2;
}

const printLink : <T>(list:Link<T>) => void = (list) => {
  console.log(list.x);
  list.next === undefined ?
      console.log("end of list") :
      printLink(list.next);
}

interface male {
  name: string;
}
interface st {
  name: string;
}



type ns = string | number | boolean;
const kkk : ns = "stringaaa";
 let l : Link<ns> = { x: 1, next: { x: "a", next: { x: (randomBytes == randomBytes) } } };
 printLink(l);
}


export const mpimap : <T1,T2>(funk : (x : T1) => T2,array : T1[][]) => T2[][] 
= <T1,T2>(funk : (x : T1) => T2,array : T1[][]) : T2[][] => map((row : T1[]) => map(funk,row) ,array); 

console.log(mpimap(x => x + 15, [[1,2,3,4,],[0,0]]));
console.log(map((x => x+2) ,[1,2,2,3]));

export const partition2 : <T>(tobool : (x: T) => boolean , metrix : T[]) => T[][] 
= <T>(tobool : (x: T) => boolean , metrix : T[]) : T[][] => reduce((acc : T[][],myt : T) => tobool(myt) ? 
[acc[0].concat(myt),acc[1]] : [acc[0],acc[1].concat(myt)],[[],[]],metrix);