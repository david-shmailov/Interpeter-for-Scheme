// ========================================================
// L4 normal eval
import { Sexp } from "s-expression";
import { map, prop } from "ramda";
import { CExp, Exp, IfExp, Program, parseL4Exp, isLetExp, ProcExp, VarRef, parseL4 } from "./L4-ast";
import { isAppExp, isBoolExp, isCExp, isDefineExp, isIfExp, isLitExp, isNumExp,
         isPrimOp, isProcExp, isStrExp, isVarRef } from "./L4-ast";
import { applyEnv, makeEmptyEnv, Env, makeExtEnv, makeRecEnv } from './L4-env-normal';
import { applyPrimitive } from "./evalPrimitive";
import { isClosure, makeClosure, Value, Closure, valueToString } from "./L4-value";
import { first, rest, isEmpty } from '../shared/list';
import { Result, makeOk, makeFailure, bind, mapResult, isOk } from "../shared/result";
import { parse as p } from "../shared/parser";

const L4normalEval = (exp: CExp, env: Env): Result<Value> =>
    isNumExp(exp) ? makeOk(exp.val) :
    isBoolExp(exp) ? makeOk(exp.val) :
    isStrExp(exp) ? makeOk(exp.val) :
    isLitExp(exp) ? makeOk(exp.val) :
    isPrimOp(exp) ? makeOk(exp) :
    isVarRef(exp) ? evalVarRef(exp, env) :
    isAppExp(exp) ? bind(L4normalEval(exp.rator, env), rator => applyProcedure(rator, exp.rands, env)) :
    isIfExp(exp) ? evalIf(exp, env) :
    isProcExp(exp) ? evalProc(exp, env) :
    isLetExp(exp) ? makeFailure("TODO") :
    makeFailure(`Unsupported CExp: ${exp}`);

export const isTrueValue = (x: Value): boolean =>
    ! (x === false);

const evalIf = (exp: IfExp, env: Env): Result<Value> =>
    bind(L4normalEval(exp.test, env),
         test => isTrueValue(test) ? L4normalEval(exp.then, env) : L4normalEval(exp.alt, env));

const evalProc = (exp: ProcExp, env: Env): Result<Closure> =>
    makeOk(makeClosure(exp.args, exp.body, env));

const evalVarRef = (exp: VarRef, env: Env): Result<Value> =>
    bind(applyEnv(env, exp.var), ([cexp, expEnv]) => L4normalEval(cexp, expEnv));

const applyProcedure = (proc: Value, rands: CExp[], env: Env): Result<Value> => {
    if (isPrimOp(proc)) {
        const args = mapResult(rand => L4normalEval(rand, env), rands);
        return bind(args, args => applyPrimitive(proc, args));
    } else if (isClosure(proc)) {
        const vars = map(prop("var"), proc.params);
        return evalExps(proc.body, makeExtEnv(vars, rands, env, proc.env));
    } else {
        return makeFailure(`bad proc: ${proc}`);
    }
}

// Evaluate a sequence of expressions (in a program)
export const evalExps = (exps: Exp[], env: Env): Result<Value> =>
    isEmpty(exps) ? makeFailure("Empty sequence") :
    isDefineExp(first(exps)) ? evalDefine(first(exps), rest(exps), env) :
    evalCExps(first(exps), rest(exps), env);

const evalDefine = (def: Exp, rest: Exp[], env: Env): Result<Value> => {
    if (isDefineExp(def)) {
        if (isProcExp(def.val)) {
            return evalExps(rest, makeRecEnv([def.var.var], [def.val.args], [def.val.body], env));
        } else {
            return evalExps(rest, makeExtEnv([def.var.var], [def.val], env, env));
        }
    } else {
        return makeFailure("never");
    }
}

const evalCExps = (first: Exp, rest: Exp[], env: Env): Result<Value> =>
    isCExp(first) && isEmpty(rest) ? L4normalEval(first, env) :
    isCExp(first) ? bind(L4normalEval(first, env), _ => evalExps(rest, env)) :
    makeFailure("never");

export const evalNormalProgram = (program: Program): Result<Value> =>
    evalExps(program.exps, makeEmptyEnv());

export const evalNormalParse = (s: string): Result<Value> =>
    bind(p(s),
         (parsed: Sexp) => bind(parseL4Exp(parsed),
                                (exp: Exp) => evalExps([exp], makeEmptyEnv())));

// Example

const p1 = `
(L4 (define x (-))
    1)`;
const x = bind(parseL4(p1), evalNormalProgram);
isOk(x) ? console.log(x.value) : console.log(x.message);
