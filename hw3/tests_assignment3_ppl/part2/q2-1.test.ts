// ===========================================================
// AST type models
import { isEmpty, allT, cons ,first} from "../shared/list";
import { makeOk, safe2, Result, bind, mapResult, makeFailure, isOk } from "../shared/result";
import {isArray} from '../shared/type-predicates'
import { filter,map } from "ramda";
// import {isAtomicGraphOff,GraphOff,EdgeOff, NodeDeclOff,isNodeDeclOff, NodeOff, isCompoundGraphOff} from './mermaid-astOff'
import {isNodeDecl,makeNodeDecl,isNodeRef,makeEdge,makeNodeRef, isEdge, isNode} from './mermaid-ast'
// import {isAtomicGraph,Graph,Edge, NodeDecl,isNodeDecl,makeNodeDecl,isNodeRef,Node,isCompoundGraph, makeGraph,makeEdge,makeNodeRef,makeTDGraph, isEdge, isNode, isGraph} from './mermaid-ast'
// import {mapL4toMermaidOff,unparseMermaidOff, L4toMermaidOff} from './mermaidOff'
// import {mapL4toMermaid,unparseMermaid} from './mermaid'
import {parseL4, parseL4Exp,parseL4Program,Parsed} from './L4-ast'
import { Sexp } from "s-expression";
import { parse as p } from "../shared/parser";                                                 
import { ok } from "assert";
import { expect } from 'chai';
import { exec } from "child_process";

//q2.1 tests






describe('NodeRef', () => {
    it('test  NodeDecl cases ', () => {
        const n: any=makeNodeRef("testid");
        expect(isNodeRef(n)).to.be.true;
        expect(isNodeRef(1)).to.be.false;
        expect(isNode(n)).to.be.true;
        expect(n.id).to.be.deep.equal("testid"); 
    });
});

describe('NodeDecl', () => {
    it('test  NodeDecl cases ', () => {
        const n: any=makeNodeDecl("testid","testlabel");
        expect(isNodeDecl(n)).to.be.true;
        expect(isNodeDecl(1)).to.be.false;
        expect(isNode(n)).to.be.true;
        expect(n.id).to.be.deep.equal("testid"); 
        expect(n.label).to.be.deep.equal("testlabel"); 
    });
});

describe('Edge', () => {
    it('test edge cases ', () => {
        const e: any=makeEdge(makeNodeDecl("ID","label"),makeNodeRef('id2ref'),"edgelabel");
        expect(isEdge(e)).to.be.true;
        expect(isEdge(1)).to.be.false;
        expect(e.from.id).to.be.deep.equal("ID"); 
        expect(e.to.id).to.be.deep.equal("id2ref"); 
        expect(e.label).to.be.deep.equal("edgelabel"); 
    });
});