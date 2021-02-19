import { ForExp,isDefineExp,isForExp, AppExp, Exp, Program, makeProgram,makeAppExp, isNumExp, makeProcExp,makeNumExp, isExp, isBoolExp, isPrimOp, isVarRef, isIfExp, isVarDecl, isProgram, CExp, makeIfExp, isAppExp, isProcExp, makeDefineExp, isAtomicExp, isCExp  } from "./L21-ast";
import { Result, makeOk,bind,makeFailure, safe3, safe2, mapResult ,} from "../imp/result";
import { map } from "ramda";

/*
Purpose:  convert a for expression into an equivelant app expression in L2
Signature: for2app(ForExp)
Type: [ForExp ==> AppExp]
*/

export const for2app = (exp: ForExp): AppExp =>{
    let list: Array<AppExp> = [makeAppExp( makeProcExp( [exp.var] , [exp.body]), [makeNumExp( exp.start.val )])];
  
  
    for (var _i = exp.start.val+1 ; _i <= exp.end.val; _i++){
        list.push(makeAppExp( makeProcExp( [exp.var] , [exp.body]), [makeNumExp( _i )]));
        
    }
    return makeAppExp(
         makeProcExp([],list), []);
  }
  
/*
Purpose: To convert an L21 AST into an L2 AST
Signature: L21ToL2(exp)
Type: [Exp | Program --> Result<Exp | Program>]
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
isProgram(exp) ? makeOk(makeProgram(map(L21ToL2define, exp.exps))):
isExp(exp) ? makeOk(L21ToL2define(exp)): 
makeFailure("Unexpected expression " + exp)  ;


export const L21ToL2define = (exp: Exp): Exp =>
isCExp(exp) ? L21ToL2All(exp) :
isDefineExp(exp) ? makeDefineExp(exp.var, L21ToL2All(exp.val)) :
exp;

export const L21ToL2All = (exp: CExp): CExp => 
isBoolExp(exp) ? exp :
isNumExp(exp) ? exp :
isPrimOp(exp) ? exp :
isVarRef(exp) ? exp :
isVarDecl(exp) ? exp :
isForExp(exp) ? L21ToL2All(for2app(exp)):
isIfExp(exp) ?  makeIfExp( L21ToL2All(exp.test) ,L21ToL2All(exp.then),L21ToL2All(exp.alt)) :
isProcExp(exp) ? makeProcExp(exp.args , map(L21ToL2All, exp.body)):
isAppExp(exp) ? makeAppExp(L21ToL2All(exp.rator) , map(L21ToL2All, exp.rands)) :
exp ;




