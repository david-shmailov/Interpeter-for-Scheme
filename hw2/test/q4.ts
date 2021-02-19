import { Exp, Program, isProgram, isBoolExp, isVarRef, isNumExp, isDefineExp, isProcExp, isIfExp, isAppExp, isPrimOp, PrimOp, CExp, isVarDecl} from '../imp/L2-ast';
import { Result,isOk ,isFailure, makeOk,mapResult, makeFailure} from '../imp/result';
import {unparseL2} from '../imp/L2-unparse';
import {parse as parseSexp} from '../imp/parser'
import { isError, isString } from 'util';
import { map, isEmpty, bind } from 'ramda';

/*
Purpose: Transform L2 AST to type script program string
Signature:  l2ToJS(Exp | Program)
Type: [Exp | Program] => [Result<string>]
*/
export const l2ToJS = (exp: Exp | Program): Result<string> => 
    //const str = unparseL2(exp);

isEmpty(exp)? makeFailure("Unknown expression: " + exp.tag):
isProgram(exp) ? makeOk(l2ToJSProgram(exp)) :
isNumExp(exp) ? makeOk(exp.val.toString()) :
isVarRef(exp) ? makeOk(exp.var) :
isBoolExp(exp) ? makeOk((exp.val? "True" : "False") ):
isVarDecl(exp)? makeOk(exp.var) :
isDefineExp(exp) ? makeOk("const " +exp.var.var + " = " + ResultToString(l2ToJS(exp.val)) ):
isProcExp(exp) ? makeOk("(" +"("+ map((p) => p.var, exp.args).join(",") +")"+ " => " 
                                   +stingfanc(exp.body) ):
isIfExp(exp) ? makeOk("(" +ResultToString(l2ToJS(exp.test)) +" ? "+ ResultToString(l2ToJS(exp.then)) + " : " + ResultToString(l2ToJS(exp.alt)) +")" ):
isAppExp(exp) ? (isPrimOp(exp.rator) ? makeOk(primOp (exp.rator, exp.rands)) :
makeOk(ResultToString(l2ToJS(exp.rator)) +"(" +map(mapstring, exp.rands).join(",") +")")) :
makeFailure("Unknown expression: " + exp.tag);

const l2ToJSProgram = (exp: Program): string =>{
const A = map(l2ToJS,exp.exps);
const fin= A[A.length-1];
isFailure(fin)? A[A.length]= fin :
A[A.length-1]=makeOk("console.log("+fin.value+");");

return  map(ResultToString, A).join(";\n");
}

const stingfanc= (b: CExp[]): string =>{
if(b.length == 1 )  return map(mapstring,b).join("; ") + ")";
const A = map(l2ToJS,b);
    const fin= A[A.length-1];
    isFailure(fin)? A[A.length]= fin :
    A[A.length-1]=makeOk("return "+fin.value+";");
    return "{" + map(ResultToString,A).join("; ")  + "})"
    }



const ResultToString = (res: Result<string>): string =>
isFailure(res)? res.message:
res.value;


const mapstring = (exp: Exp | Program): string =>
{
    const a = l2ToJS(exp);
    return ResultToString(a);
}

const primOp = (oprator : PrimOp, oprands : CExp[]) : string =>

oprator.op === "=" ? "(" + map(mapstring,oprands).join(" === ") + ")" :
oprator.op === "eq?" ? "(" + map(mapstring,oprands).join(" === ") + ")" :
oprator.op === "+" ? "(" +map(mapstring,oprands).join(" + ")+ ")" :
oprator.op === "-" ? "(" + map(mapstring,oprands).join(" - ") +")" :
oprator.op === "*" ? "(" +map(mapstring,oprands).join(" * ") +")": 
oprator.op === "/" ?"(" + map(mapstring,oprands).join(" / ") + ")" :
oprator.op === "not" ? "(!" + mapstring(oprands[0]) + ")" :
oprator.op === "and" ? "(" + map(mapstring,oprands).join(" && ") + ")" :
oprator.op === "or" ? "(" + map(mapstring,oprands).join(" || ") + ")" :
oprator.op === "<" ? "(" + map(mapstring,oprands).join(" < ") + ")" :
               "(" +map(mapstring,oprands).join(" > ") +")" ;


    //+ | - | * | / | < | > | = | not |  and | or | eq?
