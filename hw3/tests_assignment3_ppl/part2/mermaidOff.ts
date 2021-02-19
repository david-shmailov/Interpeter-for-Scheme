// ===========================================================
// Mermaid
import { concat, map, chain, identity, length, pluck, props, zipWith, repeat } from "ramda";
import { safe2,Result, makeOk, isOk,mapResult, bind,makeFailure} from "../shared/result";
import { first,isEmpty, rest, cons } from "../shared/list";
import { isBoolExp, isLitExp, isNumExp, isPrimOp, isStrExp, isVarRef, isBinding, isVarDecl,
         isAppExp, isDefineExp, isIfExp, isLetrecExp, isLetExp, isProcExp,
         VarDecl, Exp, CExp, VarRef, isSetExp, isProgram, Parsed, isAtomicExp, Binding, parseL4Exp, parseL4,
         NumExp, BoolExp, StrExp, PrimOp,parseL4Program } from "./L4-ast";
import { SExpValue, isSymbolSExp, isCompoundSExp, isEmptySExp, isClosure, isSExp, 
         valueToString, SymbolSExp, Closure, EmptySExp } from './L4-value';
import {isCompoundGraphOff,isEdgeOff,isNodeRefOff,isNodeDeclOff,
    NodeRefOff , EdgeOff , GraphContentOff, GraphOff, CompoundGraphOff, 
    makeNodeRefOff, NodeDeclOff, makeNodeDeclOff, makeTDGraphOff, makeEdgeOff } from "./mermaid-astOff";
import { parse as p ,isToken} from "../shared/parser";                                                 
import { isBoolean, isString, isNumber,isArray} from "../shared/type-predicates";
import { Sexp } from "s-expression";

// =======================================================================
// Id generators - one Id generator for each possible node types in the L4 AST
 const makeIdGen = (prefix: string): () => string => {
    let count: number = 0;
    return () => {
        count++;
        return `${prefix}_${count}`;
    };
};

// @Would be happy to define the list of keywords as a type
const generators = map((expTag: string) => ({expTag: expTag, gen: makeIdGen(expTag)}),
                       ["DefineExp", "VarDecl", "NumExp", "BoolExp", "PrimOp", "StrExp", "VarRef", "ProcExp",
                        "AppExp", "LitExp", "IfExp", "Params", "Rands", "Body", "string", "number", "boolean",
                        "Closure", "SymbolSExp", "EmptySExp", "CompoundSExp", "Program", "Exps", "Binding", 
                        "Bindings", "LetExp", "LetrecExp", "SetExp"]);

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
    rootNode: NodeDeclOff,
    graph: CompoundGraphOff
};

const makeRootedGraph = (rootNode: NodeDeclOff, graph?: CompoundGraphOff): RootedGraph => ({
        rootNode: rootNode,
        graph: graph !== undefined ? graph : []
});

// Dummy value for the exhaustive cases to avoid artificial failures.
const neverGraph = makeRootedGraph(makeNodeDeclOff("never", "never"));

const flatten = <T>(lls: T[][]): T[] => chain(identity, lls);

// Given a new root and a list of children graphs [child1...childn] - create a new rooted graph.
// root
//   root -> child1.root
//   ...
//   root -> childn.root
//   child1 edges
//   ...
//   childn edges
const composeRootedGraphs = (rootNode: NodeDeclOff, rootedGraphs: RootedGraph[], labels?: readonly string[]): RootedGraph =>
    makeRootedGraph(rootNode, 
        concat(
            zipWith((rootedGraph: RootedGraph, label: string) => 
                        makeEdgeOff(makeNodeRefOff(rootNode.id), rootedGraph.rootNode, label),
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
    //           Would be ok with type {tag: "tag", ...} instead of interface.
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

const mapValueToNode = (sexp: SExpValue): NodeDeclOff =>
    makeNodeDeclOff(genId(getValType(sexp)), getValLabel(sexp));

// -----------------------------------------------------------------------
// Map AST values

const mapASTNodeToRootNode = (ast: ASTNode, parentLabel: string): NodeDeclOff =>
    isArray(ast) ? makeNodeDeclOff(genId(parentLabel), ":") :
    isSExp(ast) ? mapValueToNode(ast) :
    isBinding(ast) ? makeNodeDeclOff(genId("Binding"), "Binding") : 
    isVarDecl(ast) ? makeNodeDeclOff(genId("VarDecl"), `"VarDecl(${ast.var})"`) :
    makeNodeDeclOff(genId(getASTNodeType(ast)), getASTNodeLabel(ast));

const mapASTToCompoundGraph = (ast: ASTNode, parentLabel: string): RootedGraph =>
    isAtomicASTNode(ast) ? makeRootedGraph(mapASTNodeToRootNode(ast, parentLabel)) :
    composeRootedGraphs(mapASTNodeToRootNode(ast, parentLabel), 
        zipWith(mapASTToCompoundGraph, getASTChildren(ast), getASTChildrenLabels(ast)),
        getASTChildrenLabels(ast));

const rootedGraphToGraph = (rg: RootedGraph): GraphOff =>
    makeTDGraphOff(cons(makeEdgeOff(rg.rootNode, first(rg.graph).to, first(rg.graph).label),
                     rest(rg.graph)));
                     
export const mapL4toMermaidOff = (exp: Parsed) : Result<GraphOff> =>
    isAtomicExp(exp) ? makeOk(makeTDGraphOff(mapASTNodeToRootNode(exp, ""))) :
    makeOk(rootedGraphToGraph(mapASTToCompoundGraph(exp, "")));

 export const unparse = (exp: NodeRefOff | EdgeOff | GraphContentOff): Result<string> =>
     isNodeDeclOff(exp) ? makeOk(`${exp.id}[${exp.label}]`) :
     isNodeRefOff(exp) ? makeOk(exp.id) :
     isEdgeOff(exp) ? safe2((from: string, to: string) => makeOk('\t' + from + ` -->${exp.label ? `|${exp.label}|` : ''} ` + to)) 
                     (unparse(exp.from), unparse(exp.to)) :
     isCompoundGraphOff(exp) ? bind(mapResult((edge: EdgeOff) => unparse(edge), exp),
                                 (edges: string[]) => makeOk(edges.join('\n'))) :
     makeFailure(`Bad Mermaid AST ${exp}`);


 export const unparseMermaidOff = (exp: GraphOff): Result<string> =>
 bind(unparse(exp.content), 
         (result: string) => 
         makeOk(`graph ${exp.dir}\n` + result));

// -----------------------------------------------------------------------
// L4toMermaid: Map a L4 AST to a mermaid concrete syntax string.
export const L4toMermaidOff = (concrete: string): Result<string> =>   
  bind(
      bind(
          bind(p(concrete), 
                    (sexp: Sexp) : Result<Parsed> => 
                    isArray(sexp) && first(sexp) === "L4" ? parseL4Program(sexp) :
                    parseL4Exp(sexp)), 
          mapL4toMermaidOff), 
    unparseMermaidOff);

// // Example
// const x = L4toMermaidOff("(let ((a 1) (b 2)) (+ a b))");

// isOk(x) ? console.log(x.value) : console.log(x.message);
