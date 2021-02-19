import {filter, mapObjIndexed} from "ramda"
import {map,sort,reduce,compose,slice} from "ramda"
/* Question 1 */

export const partition = <T1>( predicate:(x:T1)=> boolean ,ar1: T1[]) : [T1[],T1[]] => {
    let filterTrue = filter(predicate, ar1);
    let filterFalse = filter((x:T1)=> predicate(x)==false, ar1);
    return [filterTrue,filterFalse];
    
    }  


/* Question 2 */
export const mapMat = <T1,T2>(func : (x:T1) => T2, array: T1[][]) : T2[][] => {

   return array.map(map (func));
    
}

/* Question 3 */
export const composeMany = <R>(fns: Array<(a: R) => R>) =>{ 
    if(fns.length===0)return (x:R)=>x ;
    const fn1: (a: R) => R = fns[0];
    const fns2= fns.slice(1);
    if(fns2.length===0) return fn1;
  return fns2.reduce((prevFn, nextFn) => (value: R) => prevFn(nextFn(value)), fn1);
}
  

/* Question 4 */
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


export const maxSpeed = (array: Pokemon[]): Pokemon[] => { 
    let maxi:number =0;
    array.reduce((prev,cur) => (cur.base.Speed > maxi ? maxi=cur.base.Speed : maxi ), 0);
    return array.filter((x:Pokemon)=> x.base.Speed== maxi);
}


export const grassTypes = (array: Pokemon[]): string[] => {
  const gras= (x:string): boolean => { if (x == 'Grass') return true ;else return false;}
  let grass = array.filter((x:Pokemon)=> (x.type.some(gras)));
  let names : string[] = grass.map((x:Pokemon)=>x.name.english);
  return names.sort();
}

export const uniqueTypes =(array: Pokemon[]): string[]=> {
let S = new Set<string>();
let typ= array.reduce((perv,curr)=> (curr.type.reduce((typeprev,typenext)=>(S.add(typenext)),S)),S);
let ar1=[...S];
return ar1.sort();
}
