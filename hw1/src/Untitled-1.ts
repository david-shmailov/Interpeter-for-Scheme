/* Question 1 */

import { any } from "ramda";

export type Optional<T> = some<T> | none;

interface some<T>{
    tag:'Some';
    value:T;
}
interface none{
    tag:'None'
}
export const makeSome =<T>(x:T):some<T> => {return {  tag:'Some', value:x}};
   
export const makeNone =():none => {return {  tag:'None'}};

export const isSome = <T>(optional: Optional<T>): boolean => { if(optional.tag=='Some') return true; return false}
export const isNone=<T>(optional: Optional<T>): boolean => { if(optional.tag=='None') return true; return false}

/* Question 2 */


export const bind = <T, U>(optional: Optional<T>, f: (x: T) => Optional<U>): Optional<U> => {
   switch(optional.tag) {
       case "Some" : const newOptional = f(optional.value); return newOptional;
       case "None" : return optional;
    }
}


const isEven = (x: number): Optional<number> =>
  x % 2 === 0 ? makeSome(x) : makeNone();
const isDivisibleBy3 = (x: number): Optional<number> =>
  x % 3 === 0 ? makeSome(x) : makeNone();

const s = makeSome(4);
console.log(bind(s, isEven)); // => { tag: 'Some', value: 4 } 
console.log(bind(s, isDivisibleBy3)); // => { tag: 'None' }
