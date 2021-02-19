// ===========================================================
// AST type models
import { isEmpty, allT, cons } from "../shared/list";
import { makeOk, safe2, Result, bind, mapResult, makeFailure, isOk } from "../shared/result";
import { filter,map } from "ramda";
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
console.log("started loading ast file");
// Type unions
export type DirOff = "TD" | "LR";
export type GraphContentOff = AtomicGraphOff | CompoundGraphOff;
export type AtomicGraphOff = NodeDeclOff;
export type CompoundGraphOff = EdgeOff[];
export type NodeOff = NodeDeclOff | NodeRefOff;

// Disjoint types
export interface GraphOff {tag: "Graph"; dir: DirOff; content: GraphContentOff; }
export interface EdgeOff {tag: "Edge"; from: NodeOff; to: NodeOff; label?: string; }
export interface NodeDeclOff {tag: "NodeDecl"; id: string; label: string; }
export interface NodeRefOff {tag: "NodeRef"; id: string; }

// Type value constructors for disjoint types
export const makeGraphOff = (dir: DirOff, content: GraphContentOff): GraphOff => ({tag: "Graph", dir: dir, content: content});
export const makeTDGraphOff = (content: GraphContentOff): GraphOff => makeGraphOff("TD", content)
export const makeEdgeOff = (from: NodeOff, to: NodeOff, label?: string): EdgeOff => ({tag: "Edge", from: from, to: to, label: label});
export const makeNodeDeclOff = (id: string, label: string): NodeDeclOff => ({tag: "NodeDecl", id: id, label: label});
export const makeNodeRefOff = (id: string): NodeRefOff => ({tag: "NodeRef", id: id});

// Type predicates for disjoint types
export const isGraphOff = (x: any): x is GraphOff => x.tag === "Graph";
export const isEdgeOff = (x: any): x is EdgeOff => x.tag === "Edge";
export const isNodeDeclOff = (x: any): x is NodeDeclOff => x.tag === "NodeDecl";
export const isNodeRefOff = (x: any): x is NodeRefOff => x.tag === "NodeRef";

// Type predicates for type unions
export const isGraphContentOff = (x: any): x is GraphContentOff => isAtomicGraphOff(x) || isCompoundGraphOff(x);
export const isAtomicGraphOff = (x: any): x is AtomicGraphOff => isNodeDeclOff(x);
export const isCompoundGraphOff = (x: any): x is CompoundGraphOff => Array.isArray(x) && ! isEmpty(x) && allT(isEdgeOff, x);
export const isNodeOff = (x: any): x is Node => isNodeDeclOff(x) || isNodeRefOff(x);




// Traverse Mermaid graph
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



