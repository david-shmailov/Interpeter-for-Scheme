// <graph> ::= <header> <graphContent> // Graph(dir: Dir, content: GraphContent)
// <header> ::= graph (TD|LR)<newline> // Direction can be TD or LR 
// <graphContent> ::= <atomicGraph> | <compoundGraph> 
// <atomicGraph> ::= <nodeDecl> 
// <compoundGraph> ::= <edge>+  
// <edge> ::= <node> --><edgeLabel>? <node><newline> // <edgeLabel> is optional 
// // Edge(from: Node, to: Node, label?: string)
// <node> ::= <nodeDecl> | <nodeRef>    
// <nodeDecl> ::= <identifier>["<string>"] // NodeDecl(id: string, label: string) 
// <nodeRef> ::= <identifier> // NodeRef(id: string)

import { identical } from "ramda";

// <edgeLabel> ::= |<identifier>| // string
export type Dir = TD | LR;
export interface TD {tag: "TD"};
export interface LR {tag: "LR"};
export const makeTD = (): TD => ({tag: "TD"});
export const makeLR = (): LR => ({tag: "LR"});
export const isTD = (x: any): x is TD => x.tag === "TD";
export const isLR = (x: any): x is LR => x.tag === "LR";



export interface Graph {tag: "Graph"; dir: Dir; content: GraphContent};
export const makeGraph = (dir: Dir,content: GraphContent ): Graph => ({tag: "Graph", dir: dir, content: content});
export const isGraph = (x: any): x is Graph => x.tag === "Graph";

export type GraphContent = AtomicGraph | CompoundGraph ;

export interface AtomicGraph {tag: "AtomicGraph"; node  : NodeDecl }
export const makeAtomicGraph = (node: NodeDecl): AtomicGraph => ({tag: "AtomicGraph", node: node});
export const isAtomicGraph = (x: any): x is AtomicGraph => x.tag === "AtomicGraph";


export interface CompoundGraph {tag: "CompoundGraph"; edge  : Edge[] }
export const makeCompoundGraph = (edge: Edge[]): CompoundGraph => ({tag: "CompoundGraph", edge: edge});
export const isCompoundGraph = (x: any): x is CompoundGraph => x.tag === "CompoundGraph";

export interface Edge {tag: "Edge"; from: Node ; to: Node ; label?: string}
export const makeEdge = (from: Node, to: Node, label?: string): Edge => ({tag: "Edge", from: from, to: to, label: label });
export const isEdge = (x: any): x is Edge => x.tag === "Edge";

export type Node = NodeDecl | NodeRef ;

export interface  NodeDecl {tag: "NodeDecl"; id : string; label: string }
export const makeNodeDecl = (id : string , label: string ) : NodeDecl=> ({tag: "NodeDecl", id: id ,label:label });
export const isNodeDecl = (x: any): x is NodeDecl => x.tag === "NodeDecl";

export interface  NodeRef {tag: "NodeRef"; id : string }
export const makeNodeRef = (id : string ): NodeRef=> ({tag: "NodeRef", id: id});
export const isNodeRef = (x: any): x is NodeRef => x.tag === "NodeRef";
