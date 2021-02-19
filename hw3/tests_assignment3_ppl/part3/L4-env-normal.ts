// Environment for L4 (support for Letrec)
// =======================================
// An environment represents a partial function from symbols (variable names) to values.
// It supports the operation: apply-env(env,var)
// which either returns the value of var in the environment, or else throws an error.
//
// Env is defined inductively by the following cases:
// * <env> ::= <empty-env> | <extended-env> | <rec-env>
// * <empty-env> ::= (empty-env) // empty-env()
// * <extended-env> ::= (env (symbol+) (value+) next-env) // env(vars:List(Symbol), vals:List(Value), next-env: Env)
// * <rec-ext-env> ::= (rec-env (symbol+) (params+) (bodies+) next-env)
//       // rec-env(vars:List(Symbol), paramss:List(List(var-decl)), bodiess:List(List(cexp)), next-env: Env)
//
// The key operation on env is apply-env(var) which returns the value associated to var in env
// or throw an error if var is not defined in env.

import { VarDecl, CExp, makeProcExp } from './L4-ast';
import { Result, makeOk, makeFailure } from '../shared/result';

// ========================================================
// Environment data type
export type Env = EmptyEnv | ExtEnv | RecEnv;
export interface EmptyEnv {tag: "EmptyEnv" }
export interface ExtEnv {
    tag: "ExtEnv";
    vars: string[];
    exps: CExp[];
    currentEnv: Env;
    nextEnv: Env;
}
export interface RecEnv {
    tag: "RecEnv";
    vars: string[];
    paramss: VarDecl[][];
    bodiess: CExp[][];
    currentEnv: Env;
    nextEnv: Env;
}

export const makeEmptyEnv = (): EmptyEnv => ({tag: "EmptyEnv"});
export const makeExtEnv = (vs: string[], exps: CExp[], currentEnv: Env, nextEnv: Env): ExtEnv =>
    ({tag: "ExtEnv", vars: vs, exps: exps, currentEnv: currentEnv, nextEnv: nextEnv});
export const makeRecEnv = (vs: string[], paramss: VarDecl[][], bodiess: CExp[][], env: Env): RecEnv =>
    ({tag: "RecEnv", vars: vs, paramss: paramss, bodiess: bodiess, currentEnv: env, nextEnv: env});

const isEmptyEnv = (x: any): x is EmptyEnv => x.tag === "EmptyEnv";
const isExtEnv = (x: any): x is ExtEnv => x.tag === "ExtEnv";
const isRecEnv = (x: any): x is RecEnv => x.tag === "RecEnv";

export const isEnv = (x: any): x is Env => isEmptyEnv(x) || isExtEnv(x) || isRecEnv(x);

// Apply-env
export const applyEnv = (env: Env, v: string): Result<[CExp, Env]> =>
    isEmptyEnv(env) ? makeFailure(`var not found ${v}`) :
    isExtEnv(env) ? applyExtEnv(env, v) :
    applyRecEnv(env, v);

const applyExtEnv = (env: ExtEnv, v: string): Result<[CExp, Env]> =>
    env.vars.includes(v) ? makeOk([env.exps[env.vars.indexOf(v)], env.currentEnv]) :
    applyEnv(env.nextEnv, v);

const applyRecEnv = (env: RecEnv, v: string): Result<[CExp, Env]> =>
    env.vars.includes(v) ? makeOk([makeProcExp(env.paramss[env.vars.indexOf(v)],
                                               env.bodiess[env.vars.indexOf(v)]), env]) :
    applyEnv(env.nextEnv, v);
