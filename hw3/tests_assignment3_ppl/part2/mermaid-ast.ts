// ===========================================================
// AST type models
import { isEmpty, allT } from "../shared/list";
import { makeOk, safe2, Result, bind, mapResult, makeFailure } from "../shared/result";
/*
;; =============================================================================
;; Mermaid concrete & ast syntax
;;

;; <graph>          ::= <header> <graphContent> // Graph(dir: Dir, content: GraphContent)
;; <header>         ::= graph (TD|LR)<newline>  // Direction can be TD or LR
;; <graphContent>   ::= <atomicGraph> | <compoundGraph>
;; <atomicGraph>    ::= <nodeDecl>
;; <compoundGraph>  ::= <edge>+
;;
;; <edge>           ::= <node> --><edgeLabel>?<node><newline> // <edgeLabel> is optional
;;                                                            // Edge(from: Node, to: Node, label?: string)
;;
;; <node>           ::= <nodeDecl> | <nodeRef>
;; <nodeDecl>       ::= <identifier>["<string>"] // NodeDecl(id: string,label: string)
;; <nodeRef>        ::= <identifier> // NodeRef(id: string)
;; <edgeLabel>      ::= |<identifier>| // string
*/

// Type unions
export type Dir = "TD" | "LR";
export type GraphContent = AtomicGraph | CompoundGraph;
export type AtomicGraph = NodeDecl;
export type CompoundGraph = Edge[];
export type Node = NodeDecl | NodeRef;

// Disjoint types
export interface Graph {tag: "Graph"; dir: Dir; content: GraphContent; }
export interface Edge {tag: "Edge"; from: Node; to: Node; label?: string; }
export interface NodeDecl {tag: "NodeDecl"; id: string; label: string; }
export interface NodeRef {tag: "NodeRef"; id: string; }

// Type value constructors for disjoint types
export const makeGraph = (dir: Dir, content: GraphContent): Graph => ({tag: "Graph", dir: dir, content: content});
export const makeTDGraph = (content: GraphContent): Graph => makeGraph("TD", content)
export const makeEdge = (from: Node, to: Node, label?: string): Edge => ({tag: "Edge", from: from, to: to, label: label});
export const makeNodeDecl = (id: string, label: string): NodeDecl => ({tag: "NodeDecl", id: id, label: label});
export const makeNodeRef = (id: string): NodeRef => ({tag: "NodeRef", id: id});

// Type predicates for disjoint types
export const isGraph = (x: any): x is Graph => x.tag === "Graph";
export const isEdge = (x: any): x is Edge => x.tag === "Edge";
export const isNodeDecl = (x: any): x is NodeDecl => x.tag === "NodeDecl";
export const isNodeRef = (x: any): x is NodeRef => x.tag === "NodeRef";

// Type predicates for type unions
export const isGraphContent = (x: any): x is GraphContent => isAtomicGraph(x) || isCompoundGraph(x);
export const isAtomicGraph = (x: any): x is AtomicGraph => isNodeDecl(x);
export const isCompoundGraph = (x: any): x is CompoundGraph => Array.isArray(x) && ! isEmpty(x) && allT(isEdge, x);
export const isNode = (x: any): x is Node => isNodeDecl(x) || isNodeRef(x);


// Things to verify
// 1. Check root node: 
//    1.1 the type of the node is correct (type is derived from Id "<type>_<counter>"); 
//        Accept either NodeRef or NodeDecl in any edge
//        Derive type from id - normalize type case / indeterminate pairs (number, NumExp), (string, StrExp, StringExp), (boolean, BoolExp), (args, Params)
//    1.2 the label of the node is correct
//        If node is a NodeDecl - check its label / Cases with "" or without - ignore / Cases with () - can ignore content of the () 
// 2. Check children: 
//    2.1 Check number of children
//    2.2 Check label of edge to children 
//        Allow alternate pairs (alt, else), (params, args)
//        Normalize and sort list of edge labels / then compare
//    2.3 Check type of children
//        Normalize and sort list of types of children / then compare
// 3. Recurse on children
// Prepare list of test expressions:
// - All the atomic types (number, boolean, string)
// - SExpressions (empty, symbol, dotted pair, list)
// - All compound expressions
// - Program

// export const L4toMermaid = (concrete: string): Result<string>
// 1. Test that it works on a Program AND on a Exp 
// 2. Test that it returns a string starting with Graph ...

// ========================================================
// unparseMermaid: Map a Mermaid AST to a concrete syntax string.



