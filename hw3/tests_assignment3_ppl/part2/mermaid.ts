// ===========================================================
// Mermaid
import { concat, map, chain, identity, length, pluck, props, zipWith, repeat } from "ramda";
import { Result, makeOk, bind, isOk, safe2,mapResult, makeFailure } from "../shared/result";
import { first, rest, cons } from "../shared/list";
import { isBoolExp, isLitExp, isNumExp, isPrimOp, isStrExp, isVarRef, isBinding, isVarDecl,
         isAppExp, isDefineExp, isIfExp, isLetrecExp, isLetExp, isProcExp,
         VarDecl, Exp, CExp, VarRef, isSetExp, isProgram, Parsed, isAtomicExp, Binding, parseL4Exp, 
         NumExp, BoolExp, StrExp,parseL4Program, PrimOp } from "./L4-ast";
import { SExpValue, isSymbolSExp, isCompoundSExp, isEmptySExp, isClosure, isSExp, 
         valueToString, SymbolSExp, Closure, EmptySExp } from './L4-value';
import { Graph, CompoundGraph, makeNodeRef, NodeDecl, makeNodeDecl, makeTDGraph, makeEdge,
    NodeRef,Edge, GraphContent, isNodeDecl, isNodeRef, isEdge, isCompoundGraph  } from "./mermaid-ast";
import { parse as p } from "../shared/parser";                                                 
import { isBoolean, isString, isNumber } from "../shared/type-predicates";
import { isArray } from "util";
import { Sexp } from "s-expression";

// =======================================================================
// Id generators - one Id generator for each possible node types in the L4 AST
export const makeIdGen = (prefix: string): () => string => {
    let count: number = 0;
    return () => {
        count++;
        return `${prefix}_${count}`;
    };
};

// @Would be happy to define the list of keywords as a type
// Could be achieved in TypeScript as
// const labels = ["a", "b", "c"] as const;
// type Labels = typeof labels[number];
const generators = map((expTag: string) => ({expTag: expTag, gen: makeIdGen(expTag)}),
                       ["DefineExp", "VarDecl", "NumExp", "BoolExp", "PrimOp", "StrExp", "VarRef", "ProcExp",
                        "AppExp", "LitExp", "IfExp", "Params", "Rands", "Body", "string", "number", "boolean",
                        "Closure", "SymbolSExp", "EmptySExp", "CompoundSExp", "Program", "Exps", "Binding", 
                        "Bindings", "LetExp", "LetrecExp", "SetExp"]);

// This deals with the irregularities in the naming of the fields / edges
const genId = (expTag: string): string => {
    const mapFieldToName = [{field: 'args', name: 'Params'},
                            {field: 'body', name: 'Body'},
                            {field: 'rands', name: 'Rands'},
                            {field: 'exps', name: 'Exps'},
                            {field: 'bindings', name: 'Bindings'}];
    const name = mapFieldToName.find((fnPair) => fnPair.field === expTag);
    const key = name ? name.name : expTag;
    const genPair = generators.find((genPair) => genPair.expTag === key);
    return genPair !== undefined ? genPair.gen() : `Never ${expTag}`;
};   

// =======================================================================
// RootedGraph is what is returned by each recursive call to the mapper functions
// RootedGraphs can be composed into larger graphs. 
type RootedGraph = {
    rootNode: NodeDecl,
    graph: CompoundGraph
};

const makeRootedGraph = (rootNode: NodeDecl, graph?: CompoundGraph): RootedGraph => ({
        rootNode: rootNode,
        graph: graph !== undefined ? graph : []
});

// Dummy value for the exhaustive cases to avoid artificial failures.
const neverGraph = makeRootedGraph(makeNodeDecl("never", "never"));

// A useful idiom to flatten a list of lists into a flat list.
// flatte([[1,2], [3,4]]) --> [1,2,3,4]
const flatten = <T>(lls: T[][]): T[] => chain(identity, lls);

// Given a new root and a list of children graphs [child1...childn] - create a new rooted graph.
// root
//   root -> child1.root
//   ...
//   root -> childn.root
//   child1 edges
//   ...
//   childn edges
const composeRootedGraphs = (rootNode: NodeDecl, rootedGraphs: RootedGraph[], labels?: readonly string[]): RootedGraph =>
    makeRootedGraph(rootNode, 
        concat(
            zipWith((rootedGraph: RootedGraph, label: string) => 
                        makeEdge(makeNodeRef(rootNode.id), rootedGraph.rootNode, label),
                    rootedGraphs, 
                    labels || repeat("", length(rootedGraphs))),
            flatten(pluck('graph')(rootedGraphs))));

// =======================================================================
// Generic functions to get information in a uniform manner from all L4 AST types

// Types of what can be the children of an AST node in L4-ast
type ASTChild = CExp | VarDecl | SExpValue | VarRef | Binding | Exp[] | VarDecl[] | Binding[];
// Any value that can occur within an AST tree
type ASTNode = Parsed | ASTChild;
type AtomicASTNode = VarRef | VarDecl | NumExp | BoolExp | StrExp | PrimOp | 
                    string | number | boolean | Closure | SymbolSExp | EmptySExp;

const isAtomicASTNode = (ast: ASTNode): ast is AtomicASTNode =>
    isVarDecl(ast) || isAtomicExp(ast) || 
    isNumber(ast) || isBoolean(ast) || isString(ast) || isSymbolSExp(ast) || isEmptySExp(ast) || isClosure(ast);

const getASTNodeLabel = (ast: ASTNode): string =>
    isNumExp(ast) || isBoolExp(ast) || isStrExp(ast) ? `"${getASTType(ast)}(${ast.val})"` :
    isPrimOp(ast) ? `"PrimOp(${ast.op})"` :
    isVarRef(ast) ? `"VarRef(${ast.var})"` :
    isVarDecl(ast) ? `"VarDecl(${ast.var})"` :
    isBinding(ast) ? "Binding" :
    isArray(ast) ? ":" :
    isSExp(ast) ? getValLabel(ast) :
    getASTType(ast);

const getASTNodeType = (ast: ASTNode): string =>
    isVarDecl(ast) ? "VarDecl" :
    isBinding(ast) ? "Binding" :
    isArray(ast) ? ":" :
    isSExp(ast) ? getValType(ast) :
    getASTType(ast);

const getASTType = (ast: Parsed): string => ast.tag;

const getASTChildrenLabels = (ast: ASTNode): string[] => 
    isArray(ast) ? repeat("", ast.length) :
    isDefineExp(ast) || isSetExp(ast) ? [ "var", "val" ] :
    isAtomicExp(ast) ? [] :
    isAppExp(ast) ? [ "rator", "rands" ] :
    isIfExp(ast) ? ["test", "then", "alt"] :
    isProcExp(ast) ? [ "args", "body" ] :
    isLetExp(ast) || isLetrecExp(ast) ? [ "bindings", "body" ] :
    isLitExp(ast) ? [ "val" ] :
    isProgram(ast) ? [ "exps" ] :
    isCompoundSExp(ast) ? ["val1", "val2"] :
    isSExp(ast) ? [] :
    isVarDecl(ast) ? [] :
    isBinding(ast) ? ["var", "val"] :
    [`Never ${ast}`];

const getASTChildren = (ast: ASTNode): ASTNode[] =>
    isArray(ast) ? ast :
    //@ts-ignore 'DefineExp' is not assignable to type 'Record<string, ASTChild>'.
    //           Index signature is missing in type 'DefineExp'.ts(2345)
    //           Would be ok with type T = {tag: "tag", ...} instead of interface T ...
    props(getASTChildrenLabels(ast))(ast);

// =======================================================================
// Mapping algorithm

// -----------------------------------------------------------------------
// SExpValue
const getValType = (sexp: SExpValue): string =>
    isString(sexp) ? 'string' :
    isBoolean(sexp) ? 'boolean' :
    isNumber(sexp) ? 'number' :
    isSymbolSExp(sexp) ? 'SymbolSExp' :
    isPrimOp(sexp) ? 'PrimOp' :
    isEmptySExp(sexp) ? 'EmptySExp' :
    isCompoundSExp(sexp) ? 'CompoundSExp' :
    'Never';

const getValLabel = (sexp: SExpValue): string =>
    isCompoundSExp(sexp) || 
    isEmptySExp(sexp)    || 
    isClosure(sexp) ? getValType(sexp) :
    `"${getValType(sexp)}(${valueToString(sexp)})"`;

const mapValueToNode = (sexp: SExpValue): NodeDecl =>
    makeNodeDecl(genId(getValType(sexp)), getValLabel(sexp));

// -----------------------------------------------------------------------
// Map AST values

const mapASTNodeToRootNode = (ast: ASTNode, parentLabel: string): NodeDecl =>
    isArray(ast) ? makeNodeDecl(genId(parentLabel), ":") :
    isSExp(ast) ? mapValueToNode(ast) :
    isBinding(ast) ? makeNodeDecl(genId("Binding"), "Binding") : 
    isVarDecl(ast) ? makeNodeDecl(genId("VarDecl"), `"VarDecl(${ast.var})"`) :
    makeNodeDecl(genId(getASTNodeType(ast)), getASTNodeLabel(ast));

const mapASTToCompoundGraph = (ast: ASTNode, parentLabel: string): RootedGraph =>
    isAtomicASTNode(ast) ? makeRootedGraph(mapASTNodeToRootNode(ast, parentLabel)) :
    composeRootedGraphs(mapASTNodeToRootNode(ast, parentLabel), 
        zipWith(mapASTToCompoundGraph, getASTChildren(ast), getASTChildrenLabels(ast)),
        getASTChildrenLabels(ast));

const rootedGraphToGraph = (rg: RootedGraph): Graph =>
    makeTDGraph(cons(makeEdge(rg.rootNode, first(rg.graph).to, first(rg.graph).label),
                     rest(rg.graph)));
                     
export const mapL4toMermaid = (exp: Parsed) : Result<Graph> =>
    isAtomicExp(exp) ? makeOk(makeTDGraph(mapASTNodeToRootNode(exp, ""))) :
    makeOk(rootedGraphToGraph(mapASTToCompoundGraph(exp, "")));
    
 export const unparse = (exp: NodeRef | Edge | GraphContent): Result<string> =>
     isNodeDecl(exp) ? makeOk(`${exp.id}[${exp.label}]`) :
     isNodeRef(exp) ? makeOk(exp.id) :
     isEdge(exp) ? safe2((from: string, to: string) => makeOk('\t' + from + ` -->${exp.label ? `|${exp.label}|` : ''} ` + to)) 
                     (unparse(exp.from), unparse(exp.to)) :
     isCompoundGraph(exp) ? bind(mapResult((edge: Edge) => unparse(edge), exp),
                                 (edges: string[]) => makeOk(edges.join('\n'))) :
     makeFailure(`Bad Mermaid AST ${exp}`);


 export const unparseMermaid = (exp: Graph): Result<string> =>
 bind(unparse(exp.content), 
         (result: string) => 
         makeOk(`graph ${exp.dir}\n` + result));

// -----------------------------------------------------------------------
// L4toMermaid: Map a L4 AST to a mermaid concrete syntax string.
export const L4toMermaid = (concrete: string): Result<string> =>   
  bind(
      bind(
          bind(p(concrete), 
                    (sexp: Sexp) : Result<Parsed> => 
                    isArray(sexp) && first(sexp) === "L4" ? parseL4Program(sexp) :
                    parseL4Exp(sexp)), 
          mapL4toMermaid), 
    unparseMermaid);

// // Example
// const x = L4toMermaid("(let ((a 1) (b 2)) (+ a b))");

// isOk(x) ? console.log(x.value) : console.log(x.message);
