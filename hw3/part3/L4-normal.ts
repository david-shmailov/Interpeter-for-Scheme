// ========================================================
// L4 normal eval
import { Sexp } from "s-expression";
import { map } from "ramda";
import { CExp, Exp, IfExp, Program, parseL4Exp, isLetExp, isLetrecExp, VarRef, ProcExp, VarDecl, Binding, LetExp, PrimOp, AppExp, makeAppExp } from "./L4-ast";
import { isAppExp, isBoolExp, isCExp, isDefineExp, isIfExp, isLitExp, isNumExp,
         isPrimOp, isProcExp, isStrExp, isVarRef } from "./L4-ast";
import { applyEnv, makeEmptyEnv, Env, makeExtEnv } from './L4-env-normal';
//import { isTrueValue } from "./L4-eval";
import { applyPrimitive } from "./evalPrimitive";
import { isClosure, makeClosure, Value, Closure, SExpValue } from "./L4-value";
import { first, rest, isEmpty } from '../shared/list';
import { Result, makeOk, makeFailure, bind, mapResult, safe2, isOk, safe3 } from "../shared/result";
import { parse as p } from "../shared/parser";

// Evaluate a sequence of expressions (in a program)
export const evalExps = (exps: Exp[], env: Env): Result<Value> =>
    isEmpty(exps) ? makeFailure("Empty sequence") :
    isDefineExp(first(exps)) ? evalDefineExps(first(exps), rest(exps), env) :
    evalCExps(first(exps), rest(exps), env);

const evalCExps = (first: Exp, rest: Exp[], env: Env): Result<Value> =>
    isCExp(first) && isEmpty(rest) ? evalCExp(first, env) :
    isCExp(first) ? bind(evalCExp(first, env), _ => evalExps(rest, env)) :
    makeFailure("Never");
    

const evalCExp = (exps: CExp, env: Env): Result<Value> =>
    isNumExp(exps) ? makeOk(exps.val) :
    isBoolExp(exps) ? makeOk(exps.val) :
    isStrExp(exps) ? makeOk(exps.val) :
    isPrimOp(exps) ? makeOk(exps) : 
    isVarRef(exps) ? evalVarRef(exps,env): 
    isLitExp(exps) ? makeOk(exps.val) :
    isIfExp(exps) ? evalIf(exps, env) :
    isProcExp(exps) ? evalProc(exps, env) :
    isLetExp(exps) ? evalLet(exps, env) :
    isAppExp(exps) ? applyProcedure(exps.rator, exps.rands, env):
    makeFailure(`Bad L4 AST ${exps}`);



const evalVarRef = (exp: VarRef, env: Env): Result<Value> =>{
     const a= applyEnv(env, exp.var);
     const b=isOk (a)? evalCExp(a.value,env): a ;
     return b;
}


const evalIf = (exp: IfExp, env: Env): Result<Value> =>
bind(evalCExp(exp.test, env),
     (test: Value) => isTrueValue(test) ? evalCExp(exp.then, env) : evalCExp(exp.alt, env));

const evalProc = (exp: ProcExp, env: Env): Result<Closure> =>
makeOk(makeClosure(exp.args, exp.body, env));


const applyProcedure = (proc: CExp, args: CExp[], env:Env): Result<Value> =>
    isPrimOp(proc) ? applyPrimOp(proc,mapResult((rand: CExp) => evalCExp(rand, env), args)): 
    isNumExp(proc) ? makeFailure("1") :
    isBoolExp(proc) ? makeFailure ('2') :
    isStrExp(proc) ? makeFailure("3") :
    isVarRef(proc) ? applyvref(proc,args,env):
    isLitExp(proc) ? makeFailure("5") :
    isIfExp(proc) ?  makeFailure("6"):
    isLetExp(proc) ? makeFailure("7") :
    isAppExp(proc) ?  applyProcedure(proc.rator, proc.rands, env):
    isProcExp(proc) ? applyproc( proc, args , env ) :
    makeFailure(`Bad procedure ${JSON.stringify(proc)}`);

const applyvref=(proc:VarRef, args: CExp[], env:Env): Result<Value> =>{
const a= applyEnv(env, proc.var);
const b= isOk(a)? makeAppExp(a.value,args): a;
return isAppExp(b)? evalCExp(b, env ): b;
}
const applyPrimOp=(proc:PrimOp ,x:Result<Value[]> ): Result<Value> =>
   isOk(x)? applyPrimitive(proc, x.value): x;

const applyproc = (proc: ProcExp , args: CExp[], env:Env ): Result<Value> => {
    const vars = map((v: VarDecl) => v.var, proc.args );
    return evalExps(proc.body, makeExtEnv(vars, args, env));
}

// // Evaluate a sequence of expressions (in a program)
// export const evalSequence = (seq: Exp[], env: Env): Result<Value> =>
// isEmpty(seq) ? makeFailure("Empty sequence") :
// isDefineExp(first(seq)) ? evalDefineExps(first(seq), rest(seq), env) :
// evalCExps(first(seq), rest(seq), env);


// Eval a sequence of expressions when the first exp is a Define.
// Compute the rhs of the define, extend the env with the new binding
// then compute the rest of the exps in the new env.

const evalDefineExps = (def: Exp, exps: Exp[], env: Env): Result<Value> =>
// isDefineExp(def) ? bind(evalExp(def.val, env),
//                         (rhs: Value) => evalExps(exps, makeExtEnv([def.var.var], [rhs], env))) :
isDefineExp(def) ? evalExps(exps, makeExtEnv([def.var.var],[def.val] , env)) :                        
makeFailure("Unexpected " + def);


// LET: Direct evaluation rule without syntax expansion
// compute the values, extend the env, eval the body.
const evalLet = (exp: LetExp, env: Env): Result<Value> => {
    const vals =  map((b: Binding) => b.val, exp.bindings);
    const vars = map((b: Binding) => b.var.var, exp.bindings);
    return  evalExps(exp.body, makeExtEnv(vars, vals, env));
}



export const evalNormalProgram = (program: Program): Result<Value> =>
    evalExps(program.exps, makeEmptyEnv());

export const evalNormalParse = (s: string): Result<Value> =>
    bind(p(s),
         (parsed: Sexp) => bind(parseL4Exp(parsed),
                                (exp: Exp) => evalExps([exp], makeEmptyEnv())));
                                
export const isTrueValue = (x: Value): boolean =>
    ! (x === false);