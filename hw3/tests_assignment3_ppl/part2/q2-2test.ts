// ===========================================================
// AST type models
import { isEmpty, allT, cons,rest ,first} from "../shared/list";
import { makeOk, safe2, Result, bind, mapResult, makeFailure, isOk } from "../shared/result";
import {isArray} from '../shared/type-predicates'
import { filter,map } from "ramda";
import {isAtomicGraphOff,GraphOff,EdgeOff, NodeDeclOff,isNodeDeclOff,makeNodeDeclOff, NodeOff, isCompoundGraphOff,makeGraphOff, DirOff, makeNodeRefOff, makeEdgeOff} from './mermaid-astOff'
// import {isAtomicGraph,Graph,Edge, NodeDecl,isNodeDecl,makeNodeDecl,isNodeRef,Node,isCompoundGraph, makeGraph,makeEdge,makeNodeRef, isEdge, isNode, isGraph} from './mermaid-ast'
// import {isAtomicGraph,Graph,Edge, NodeDecl,isNodeDecl,makeNodeDecl,isNodeRef,Node,isCompoundGraph, makeGraph,makeEdge,makeNodeRef, isEdge, isNode, isGraph} from './mermaid-ast'
import {mapL4toMermaidOff,unparseMermaidOff, L4toMermaidOff} from './mermaidOff'
import {mapL4toMermaid, unparseMermaid} from './mermaid'
// import {} from './mermaid-ast'
import {parseL4, parseL4Exp,parseL4Program,Parsed} from './L4-ast'
import { Sexp } from "s-expression";
import { parse as p } from "../shared/parser";                                                 
import { ok } from "assert";

//q2,1 tests






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

const getChildrenOff = (graph: GraphOff, nodeId: string):EdgeOff[]=>
isAtomicGraphOff(graph.content)?[]:filter((e:EdgeOff):boolean=>e.from.id===nodeId,graph.content);


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



const parse_header = (line: string): Result<DirOff> => {
    const tokens = line.trim().split(" ");
    if (tokens.length != 2)
        return makeFailure(`Bad header ${line}`);
    if (tokens[0] != 'graph')
        return makeFailure(`Bad header ${line}`);
    if (tokens[1] === "TD")
        return makeOk("TD");
    else if (tokens[1] === "LR")
        return makeOk("LR");
    else
        return makeFailure(`Bad direction ${tokens[1]}`);
}

const makeNodeOff = (id: string, label?: string): NodeOff =>
    label === undefined ? makeNodeRefOff(id) :
    makeNodeDeclOff(id, label);

// Format: "\t?<node> -->|<label>|? <node>"
const parse_edge = (line: string): Result<EdgeOff> => {
    const pattern = /\s*(\w+)(\[(.*)\])?\s*-->(\|(.*)\|)?\s*(\w+)(\[(.*)\])?\s*/;
    line = line.replace("--> ", " -->")
    const found = line.match(pattern);
    if (found === null) 
        return makeFailure(`Bad edge ${line}`);
    else {
        const [full, fromId, fromLabel, fromLabelNoBrackets, edgeLabel, edgeLabelNoBars, toId, toLabel, toLabelNoBrackets] = [...found];
        const from: NodeOff = makeNodeOff(fromId, fromLabelNoBrackets);
        const to: NodeOff = makeNodeOff(toId, toLabelNoBrackets);
        return makeOk(makeEdgeOff(from, to, edgeLabelNoBars));
    }
}


// const g1 = makeGraphOff("TD", [ makeEdgeOff(makeNodeOff("A", "aaa"), makeNodeOff("B"), "a to b")]);

// const pp = (x: any): void => console.log(JSON.stringify(x, undefined, 4));

// pp(g1);
// pp(bind(unparseMermaid(g1), parse));






const normalize_label=(s?:string):string|undefined=>
{
    if(s===undefined)
    return undefined;
const s2=s.toLowerCase().replace(`"`,"").replace(`"`,"");
if(s2.localeCompare("else")==0)
{
    return "alt";
}
if(s2.localeCompare("params")==0)
{
    return "args";
}
return s2;
}

const get_normalized_id=(s:string):string=>
{
    const s2=s.toLowerCase().replace(`"`,"").replace(`"`,"").replace(`true`,"#t").replace(`false`,"#f");
    const id=s2.split("_")[0];
    if(id.localeCompare("number")==0)
    {
        return "numexp";
    }
    if(id.localeCompare("symbol")==0)
    {
        return "symbolexp";
    }

    if(id.localeCompare("boolean")==0)
    {
        return "boolexp";
    }
    if(id.localeCompare("bool")==0)
    {
        return "boolexp";
    }

    if(id.localeCompare("str")==0)
    {
        return "strexp";
    }
    if(id.localeCompare("string")==0)
    {
        return "strexp";
    }
    if(id.localeCompare("params")==0)
    {
        return "args";
    }
    return id;
}

//on nodeDecl labels
const get_normalized_name=(s:string):string=>
{
    let arr=s.trim().toLowerCase().replace(`"`,"").replace(`"`,"").replace(`true`,"#t").replace(`false`,"#f").split("(");
    let id=arr[0];
    if(id.localeCompare("number")==0)
    {
        id= "numexp";
    }
    if(id.localeCompare("boolean")==0)
    {
        id= "boolexp";
    }
    if(id.localeCompare("bool")==0)
    {
        id= "boolexp";
    }
    if(id.localeCompare("symbol")==0)
    {
        id="symbolexp";
    }
    if(id.localeCompare("str")==0)
    {
        id= "strexp";
    }
    if(id.localeCompare("string")==0)
    {
        id= "strexp";
    }
    if(id.localeCompare("params")==0)
    {
        id= "args";
    }
    arr[0]=id;
    s=arr.join("(");
    return s;
}

// type cmpnode=NodeDeclOff;
// type Node_=NodeOff;
export const testgraph=(offical:GraphOff,tested:GraphOff):number=>
{
    const cmp=(n1:{e:string|undefined,n:NodeDeclOff},n2:{e:string|undefined,n:NodeDeclOff})=>
    {
        //compare edge labels first otherwise compare normalized node name otherwise compare normalized node id.
        if(n1.e!==undefined&&n2.e!==undefined)
        {
            const cmp=n1.e.localeCompare(n2.e);
            if(cmp===0)
            {
                const cmp2= get_normalized_name(n1.n.label).localeCompare(get_normalized_name(n2.n.label));
                if(cmp2==0)
                {
                    return get_normalized_id(n1.n.id).localeCompare(get_normalized_id(n2.n.id));
                }
                else
                return cmp2;
            }
            else
            return cmp;
        }
        else
        {
            const cmp= get_normalized_name(n1.n.label).localeCompare(get_normalized_name(n2.n.label));
            if(cmp==0)
            {
                return get_normalized_id(n1.n.id).localeCompare(get_normalized_id(n2.n.id));
            }
            return cmp;
        }
    }

    let counter=offical.dir===tested.dir?1:0;
    const testNode=(offical_node:NodeOff,tested_node:NodeOff)=>
    {
        if (isNodeDeclOff(offical_node) && isNodeDeclOff(tested_node))
        {
            const offLabelNormalizedName = get_normalized_name(offical_node.label);
            const testedLabelNormalizedName = get_normalized_name(tested_node.label);
            if(offLabelNormalizedName === testedLabelNormalizedName)
            {
                counter += 1;//same nodedecl label
            }
            else
            {
                console.log("mismatch labels in node decl: tested is " + testedLabelNormalizedName + 
                ", should be " + offLabelNormalizedName + "\n");
            }
        }
        const offIDNormalizedName = get_normalized_id(offical_node.id);
        const testedIDNormalizedName = get_normalized_id(tested_node.id);

        if (offIDNormalizedName === testedIDNormalizedName)
        {
            counter += 1;//same node-id

            const childrenOff = getChildrenOff(offical,offical_node.id);
            const filteredChildrenOff = filter((e:EdgeOff):boolean=>isNodeDeclOff(e.to), childrenOff);

            let officalchildrens_nodes:{e:string|undefined,n:NodeDeclOff}[]=map((e:EdgeOff)=>
            (isNodeDeclOff(e.to)?
            {e:normalize_label(e.label),n:e.to}
            :{e:"never",n:makeNodeDeclOff("never","never")})
            ,filteredChildrenOff);

            const childrenTested = getChildrenOff(tested,tested_node.id);
            const filteredChildrenTested = filter((e:EdgeOff):boolean=>isNodeDeclOff(e.to), childrenTested);

            let tested_childrens_nodes:{e:string|undefined,n:NodeDeclOff}[]=map((e:EdgeOff)=>
            (isNodeDeclOff(e.to)?
            {e:normalize_label(e.label),n:e.to}
            :{e:"never",n:makeNodeDeclOff("never","never")})
            ,filteredChildrenTested);

            if(officalchildrens_nodes.length!==tested_childrens_nodes.length)//are there enough childrens for the node
            {
                console.log("mismatch in number of children of " + tested_node.id + ": tested is " + filteredChildrenTested.length + 
                ", should be " + filteredChildrenOff.length + "\n");
                return;
            }
            counter+=1;//same amount of childrens.
            officalchildrens_nodes=officalchildrens_nodes.sort(cmp);
            tested_childrens_nodes=tested_childrens_nodes.sort(cmp);
            officalchildrens_nodes.forEach((itemoff,i)=>
            {
                const itemtest=tested_childrens_nodes[i];
                if(normalize_label(itemoff.e)===normalize_label(itemtest.e))
                {
                counter+=1;//same label
                }
                else
                {
                    console.log("mismatch labels in edge: tested is " + normalize_label(itemtest.e) + 
                    ", should be " + normalize_label(itemoff.e) + "\n");
                }
                testNode(itemoff.n,itemtest.n);
            })
        }
        else
        {
            console.log("mismatch IDs: tested is: " + testedIDNormalizedName + 
            ", should be " + offIDNormalizedName);
        }
    }
    if(isAtomicGraphOff(offical.content)&&isAtomicGraphOff(tested.content))
    {   testNode(offical.content,tested.content);
        return counter ;
    }
    else if(isCompoundGraphOff(offical.content)&&isCompoundGraphOff(tested.content))
    {
        let rootoff=offical.content[0].from;
        let roottested=tested.content[0].from;
        testNode(rootoff,roottested);
        return counter;
    }
    else
    {
        console.log("one graph is compound and other is atomic...");
        return counter;
    }
}

export const unparse_mermaid_to_ast = (s: string): Result<GraphOff> => {
    s = s.trim().replace("\r", "").replace("\t", "");
    const lines = s.split("\n"); // May need to check "\r\n"
    const dir = parse_header(first(lines));
    if (lines.length === 2 && !lines[1].includes("-->"))
    {
        const arr = lines[1].split("[");
        if (arr.length === 2 && arr[1].includes("]"))
        {
            const label = arr[0];
            const id = arr[1].replace("]","");
            return bind(dir, (dir) => makeOk(makeGraphOff(dir, makeNodeDeclOff(id, label))));
        }
        else
        {
            return makeFailure("bad atomic graph");
        }
    }
    else
    {
        const edges = mapResult(parse_edge, rest(lines));
        return bind(dir, (dir) => bind (edges, (edges) => makeOk(makeGraphOff(dir, edges))));
    }
}

const get_mermaid_ast_off = (concrete: string): Result<GraphOff> =>

    bind(bind(bind(bind(p(concrete), 
    (sexp:Sexp):Result<Parsed>=>
      isArray(sexp)&&first(sexp)==="L4" ? parseL4Program(sexp) :
      parseL4Exp(sexp)
    ), mapL4toMermaidOff), unparseMermaidOff),unparse_mermaid_to_ast);
    // const x1 = p(concrete);
    // if (isOk(x1))
    // {
    //     const func =(sexp:Sexp):Result<Parsed>=>
    //     isArray(sexp)&&first(sexp)==="L4" ? parseL4Program(sexp) :
    //     parseL4Exp(sexp);
    //     const x2 = func(x1.value);
    //     if (isOk(x2))
    //     {
    //         const x3 = mapL4toMermaidOff(x2.value);
    //         if (isOk(x3))
    //         {
    //             const x4 = unparseMermaidOff(x3.value);
    //             if (isOk(x4))
    //             {
    //                 console.log(x4.value)
    //                 return unparse_mermaid_to_ast(x4.value);
    //             }
    //         }
    //     }
    // }
    // return makeFailure("err");


const get_mermaid_ast = (concrete: string): Result<GraphOff> =>
bind(bind(bind(bind(p(concrete), 
(sexp:Sexp):Result<Parsed>=>
  isArray(sexp)&&first(sexp)==="L4" ? parseL4Program(sexp) :
  parseL4Exp(sexp)
), mapL4toMermaid), unparseMermaid),unparse_mermaid_to_ast);


const mapL4toMermaid_test = (concrete: string):number =>   
{
   let offical= get_mermaid_ast_off(concrete);
   let tested= get_mermaid_ast(concrete);

    if(isOk(offical)&&isOk(tested))
    {
        return testgraph(offical.value,tested.value);
    }
    else if (!isOk(tested))
    {
        console.log("whole test failed: not ok tested: " + JSON.stringify(tested, undefined, 4))
    }
    return 0;
}



let sum = 0;

console.log("####################   test 1   ####################\n");
let test1 = mapL4toMermaid_test("1"); //give 4 on offical
console.log("test 1 score is "+ test1 +" out of 4");
sum += (test1/4);

console.log("\n####################   test 2   ####################\n");
let test2 = mapL4toMermaid_test("#t");//give 4 on offical
console.log("test 2 score is " + test2 + " out of 4");
sum+=(test2/4);

console.log("\n####################   test 3   ####################\n");
let test3=mapL4toMermaid_test(`"abc"`);//give 4 on offical
console.log("test 3 score is "+test3+" out of 4");
sum+=(test3/4);

console.log("\n####################   test 4   ####################\n");
let test4=mapL4toMermaid_test(`q`);//give 4 on offical
console.log("test 4 score is "+test4+" out of 4");
sum+=(test4/4);

console.log("\n####################   test 5   ####################\n");
let test5=mapL4toMermaid_test("'5");//give 8 on offical
console.log("test 5 score is "+test5+" out of 8");
sum+=(test5/8);

console.log("\n####################   test 6   ####################\n");
let test6=mapL4toMermaid_test("'(#t 2 3)");//give 32 on offical
console.log("test 6 score is "+test6+" out of 32");
sum+=(test6/32);

console.log("\n####################   test 7   ####################\n");
let test7=mapL4toMermaid_test("+");//give 4 on offical
console.log("test 7 score is "+test7+" out of 4");
sum+=(test7/4);

console.log("\n####################   test 8   ####################\n");
let test8=mapL4toMermaid_test("(lambda(x y) (y (lambda(z) (x z))))");//give 64 on offical
console.log("test 8 score is "+test8+" out of 64");
sum+=(test8/64);

console.log("\n####################   test 9   ####################\n");
let test9=mapL4toMermaid_test("(letrec ((foo (lambda(x)(if (= x 0)0(+ 2 (foo (- x 1))))))) (foo 5))");//give 128 on offical
console.log("test 9 score is "+test9+" out of 128");
sum+=(test9/128);

console.log("\n####################   test 10   ####################\n");
let test10=mapL4toMermaid_test("(set! z (* 3 2))");//give 28 on offical
console.log("test 10 score is "+test10+" out of 28");
sum+=(test10/28);

console.log("\n####################   test 11  ####################\n");
let test11=mapL4toMermaid_test("(let ((x #t)(y #f)) x)");//give 40 on offical
console.log("test 11 score is "+test11+" out of 40");
sum+=(test11/40);

console.log("\n####################   test 12   ####################\n");
let test12=mapL4toMermaid_test("(- 1 2)");//give 20 on offical
console.log("test 12 score is "+test12+" out of 20");
sum+=(test12/20);

console.log("\n####################   test 13   ####################\n");
let test13=mapL4toMermaid_test("(lambda (x y) ((lambda (x) (+ x y))  (+ x x))1)");//give 88 on offical
console.log("test 13 score is "+test13+" out of 88");
sum+=(test13/88);

console.log("\n####################   test 14   ####################\n");
let test14=mapL4toMermaid_test("(L4 (lambda (x y) ((lambda (x) (+ x y))  (+ x x))1))");//give 96 on offical
console.log("test 14 score is "+test14+" out of 96");
sum+=(test14/96);

console.log("\n####################   test 15   ####################\n");
let test15=mapL4toMermaid_test("(L4 (if #t  '5 0))");//give 28 on offical
console.log("test 15 score is "+test15+" out of 28");
sum+=(test15/28);

console.log("\n####################   test 16   ####################\n");
let test16=mapL4toMermaid_test("(L4 (let ((x 1)(y 2))(> x y)(+ x y)))");//give 84 on offical
console.log("test 16 score is "+test16+" out of 84");
sum+=(test16/84);

console.log("\n####################   test 17   ####################\n");
let test17=mapL4toMermaid_test("(L4 (define (x #t) (and x x)))");//give 36 on offical
console.log("test 17 score is "+test17+" out of 36");
sum+=(test17/36);

const rounded_sum = Math.round(sum * 10) / 10;
console.log("total test score is " + rounded_sum + " (out of 17 points)");

/* tests 2.2:folowing cases 
1
#t
"abc"
q
'5
'(#t 2 3)
+
(lambda(x y) (y (lambda(z) (x z))))
(letrec ((foo (lambda(x)(if (= x 0)0(+ 2 (foo (- x 1))))))) (foo 5))
(set! z (* 3 2))
(let ((x #t)) x)
(- 1 2)
(lambda (x y) ((lambda (x) (+ x y))  (+ x x))1)
(L4 (lambda (x y) ((lambda (x) (+ x y))  (+ x x))1)) 
(L4 (if #t  5 0))
(L4 (let ((x 1)(y 2))(> x y)(+ x y)))
(L4 (define (x #t) (and x x)))
*/





