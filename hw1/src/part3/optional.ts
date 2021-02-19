/* Question 1 */


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

export const isSome = <T>(optional: any|Optional<T> ): boolean => { if(optional.tag==='Some') return true; else return false;}


export const isNone = <T>(optional: any|Optional<T> ): boolean => { 
    if(optional.tag=== 'None') return true; else return false; }

/* Question 2 */


export const bind = <T, U>(optional: Optional<T>, f: (x: T) => Optional<U>): Optional<U> => {
   switch(optional.tag) {
       case "Some" : const newOptional = f(optional.value); return newOptional;
       case "None" : return optional;
    }
}


