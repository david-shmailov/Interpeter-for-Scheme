import {Parsed, isExp, isProgram, isCExp,Binding, isDefineExp, Exp, CExp, isBoolExp, isNumExp, isPrimOp, isVarRef, isVarDecl, isIfExp, isProcExp, isAppExp, isAtomicExp, isStrExp, AtomicExp, DefineExp, isBinding, isLetExp, isLitExp, ProcExp, VarDecl, IfExp, AppExp, LetExp, LitExp, LetrecExp, isLetrecExp, isSetExp, SetExp, Program, parseL4} from './L4-ast';
import { Result, makeOk, makeFailure, bind, mapResult, safe2, isOk, isFailure } from "../shared/result";
import {Graph,makeGraph,isGraph,GraphContent,AtomicGraph,makeAtomicGraph,isAtomicGraph,CompoundGraph,makeCompoundGraph,isCompoundGraph,Edge,makeEdge,isEdge,Node,makeNodeDecl,isNodeDecl,makeNodeRef,isNodeRef, makeTD, isTD} from "./mermaid-ast";
import { map, concat, flatten } from 'ramda';
import { isEmptySExp, isSymbolSExp, isCompoundSExp, CompoundSExp, SExpValue } from './L4-value';
import { cons } from '../shared/list';

export const makeVarGen = (): (v: string) => string => {
    let count: number = 0;
    return (v: string) => {
        count++;
        return `${v}__${count}`;
    };
};
const progrmgen= makeVarGen();
const strgen = makeVarGen();
const boolgen= makeVarGen();
const numgen= makeVarGen();
const primgen= makeVarGen();
const varrfgen= makeVarGen();
const vardecgen= makeVarGen();
const isifgen= makeVarGen();
const testgen= makeVarGen();
const thengen= makeVarGen();
const altgen= makeVarGen();
const procgen= makeVarGen();
const argsgen= makeVarGen();
const bodygen= makeVarGen();
const appexpgen= makeVarGen();
const randsgen= makeVarGen();
const defgen= makeVarGen();
const expgen= makeVarGen();
const bindgen= makeVarGen();
const litgen = makeVarGen();
const letgen = makeVarGen();
const letrecgen = makeVarGen();
const setgen = makeVarGen();
const emptysgen =makeVarGen();
const compsgen =makeVarGen();
const symbolgen =makeVarGen();


export const mapL4toMermaid = (exp: Parsed): Result<Graph> => 
isExp(exp)? makeOk(makeGraph(makeTD() ,L4exptoGraph(exp)))  :
isProgram(exp)? (exp.exps.length==1)? makeOk(makeGraph(makeTD() , L4exptoGraph(exp.exps[0]))): 
makeOk(makeGraph(makeTD() , L4protoGraph(exp))):
makeFailure("incorrect AST"+exp);

export const L4protoGraph = (exp: Program): GraphContent => {
    const mainNode= makeNodeDecl(progrmgen('Program'),"Program") ;
    const subnodemin= makeNodeDecl(expgen('Exps'),":");
    const subnode= map( L4exptoGraph, exp.exps);
    const Edge: Edge[]=[makeEdge(mainNode,subnodemin,"exps")];
    const Edges: Edge[]=[];
    const addnode=(x:GraphContent):Edge[] => isAtomicGraph(x) ? Edges.concat([makeEdge(subnodemin,x.node)]) :
    isCompoundGraph(x) ? Edges.concat([makeEdge(mainNode,x.edge[0].from)].concat(x.edge)) :
    Edges;
    const edge2 =flatten(map(addnode,subnode));
    
    return makeCompoundGraph(Edge.concat(edge2));
    
}


export const L4exptoGraph = (exp: Exp): GraphContent => 

    isDefineExp(exp)? L4DefExptoGraph(exp)  :
    isAtomicExp(exp)? L4AtomicExptoNode(exp):
    L4CompExptoNode(exp);




export const L4AtomicExptoNode = (exp: AtomicExp): AtomicGraph => 
    isBoolExp(exp) ? makeAtomicGraph (makeNodeDecl(boolgen('Boolean') ,"Boolean("+ (exp.val? "#t": "#f" )+")")) :
    isNumExp(exp) ? makeAtomicGraph (makeNodeDecl(numgen('Number'), "Number("+exp.val.toString()+")")) :
    isPrimOp(exp) ? makeAtomicGraph (makeNodeDecl(primgen('primOp'),"PrimOp("+exp.op+")" )) :
    isVarRef(exp) ? makeAtomicGraph (makeNodeDecl(varrfgen('VarRef'), "VarRef("+exp.var+")" )) :
    isStrExp(exp)? makeAtomicGraph (makeNodeDecl(strgen('String'),"String("+exp.val+")" )) :
    makeAtomicGraph (makeNodeDecl(" "," "));

export const L4CompExptoNode = (exp: CExp) :  CompoundGraph =>
    isIfExp(exp) ?   L4IfExptoGraph( exp)  :
    isProcExp(exp)?  L4ProcexptoGraph(exp) :
    isAppExp(exp) ?  L4PAppExpptoGraph(exp):
    isBinding(exp)?  L4BindingtoGraph(exp) :
    isLetExp(exp)?   L4lettoGraph(exp)     :
    isLitExp(exp)?   L4LitToGraph(exp)     :
    isLetrecExp(exp)?L4letrectoGraph(exp)  :
    isSetExp(exp)?   L4SetExptoGraph(exp)  :
    makeCompoundGraph([]);

    export const L4LitToGraph = (exp : LitExp): CompoundGraph => {
        //SExpValue = number | boolean | string | PrimOp | Closure | SymbolSExp | EmptySExp | CompoundSExp
                
        const mainNode = makeNodeDecl(litgen('LitExp'),'LitExp');
        const edge: Edge[]=[];
        const edges:Edge[]=
        isNumExp(exp.val)? edge.concat ([makeEdge(mainNode,makeNodeDecl(numgen('Number'), exp.val.toString()))]) :
        isBoolExp(exp.val)? edge.concat ([makeEdge(mainNode,makeNodeDecl(boolgen('Boolean'), exp.val.toString()))]) :
        isPrimOp(exp.val)? edge.concat ([makeEdge(mainNode,makeNodeDecl(primgen('PrimOp'), exp.val.op))]) :
        isStrExp(exp.val)? edge.concat ([makeEdge(mainNode,makeNodeDecl(strgen('String'), exp.val.val))]) :
        isEmptySExp(exp.val)? edge.concat ([makeEdge(mainNode,makeNodeDecl(emptysgen('EmptySExp'),'EmptySExp'))]):
        isSymbolSExp(exp.val)? edge.concat ([makeEdge(mainNode,makeNodeDecl(symbolgen('SymbolSExp'), exp.val.toString()))]) :
        isCompoundSExp(exp.val)? CompoundSExtogr(exp.val,edge,mainNode):
        edge;

        return makeCompoundGraph(edges);
    }
    const CompoundSExtogr= (exp:CompoundSExp, edges:Edge[],mainNode: Node): Edge[] =>{
       const a=L4CompSExptoGraph(exp);
             return edges.concat ([makeEdge(mainNode,a.edge[0].from)].concat(a.edge))
    }
    export const L4SExpValueToGraph = (exp : SExpValue) : GraphContent => 
        //SExpValue = number | boolean | string | PrimOp  | SymbolSExp | EmptySExp | CompoundSExp
        typeof(exp)==='number' ?    makeAtomicGraph(makeNodeDecl(numgen('Number'),exp.toString())) :
        typeof(exp)==='boolean' ?   makeAtomicGraph(makeNodeDecl(boolgen('Boolean'),exp.toString())) :
        isPrimOp(exp) ?             makeAtomicGraph(makeNodeDecl(primgen('PrimOp'),exp.op)):
        typeof(exp)==='string' ?  makeAtomicGraph(makeNodeDecl(strgen('String'),exp)) :
        isEmptySExp(exp) ?  makeAtomicGraph(makeNodeDecl(emptysgen('EmptySExp'),'EmptySExp')) :
        isSymbolSExp(exp) ?  makeAtomicGraph(makeNodeDecl(symbolgen('SymbolSExp'),exp.val)) :
        isCompoundSExp(exp)?  L4CompSExptoGraph(exp):
        makeCompoundGraph([]); 

    
    
    export const L4CompSExptoGraph = ( exp : CompoundSExp) : CompoundGraph => {
        const mainNode = makeNodeDecl(compsgen('CompoundSExp'),'CompoundSExp');

        const subNode1 = L4SExpValueToGraph(exp.val1);
        const subNode2 = L4SExpValueToGraph(exp.val2);
        const edges: Edge[]=[];
        const edge: Edge[]=
        isAtomicGraph(subNode1)?  edges.concat ([makeEdge(mainNode,subNode1.node,'val1')]) :
        isCompoundGraph(subNode1)? edges.concat ([makeEdge(mainNode,subNode1.edge[0].from,'val1')].concat(subNode1.edge)):[];
        const edge2: Edge[]=
        isAtomicGraph(subNode2)?  edge.concat ([makeEdge(mainNode,subNode2.node,'val2')]) :
        isCompoundGraph(subNode2)?  edge.concat ([makeEdge(mainNode,subNode2.edge[0].from,'val2')].concat(subNode2.edge)):
        edge;
   

        return makeCompoundGraph(edge2);
    }


export const L4BindingtoGraph = (exp: Binding): CompoundGraph =>{
    const mainNode = makeNodeDecl(bindgen('Binding'),'Binding');
    const subNode1 = makeNodeDecl(vardecgen('VarDecl'),"VarDecl("+exp.var.var+")");
    const subGraph2 = L4exptoGraph(exp.val);
    const edge1 = makeEdge(mainNode,subNode1,"Var");
    const edges: Edge[] = [edge1];
    const edge:Edge[]=
    isAtomicGraph(subGraph2) ? edges.concat([makeEdge(mainNode,subGraph2.node)]) :
    isCompoundGraph(subGraph2) ?  edges.concat([makeEdge(mainNode,subGraph2.edge[0].from)].concat(subGraph2.edge)) :
    edges;
    return makeCompoundGraph(edge);
} 

export const L4IfExptoGraph = (exp: IfExp): CompoundGraph => {
    const mainNode = makeNodeDecl(isifgen('IfExp'),'IfExp');
    const subNode1 = makeNodeDecl(testgen('test'),'test');
    const subNode2 = makeNodeDecl(thengen('then'),'then');
    const subNode3 = makeNodeDecl(altgen('alt'),'alt');
    const edge1 = makeEdge(mainNode,subNode1,"Test");
    const edge2 = makeEdge(mainNode,subNode2,"Then");
    const edge3 = makeEdge(mainNode,subNode3,"Alt");
    const edges: Edge[]= [edge1,edge2,edge3];
    const test = L4exptoGraph(exp.test);
    const then = L4exptoGraph(exp.then);
    const alt = L4exptoGraph(exp.alt);
    const edgetest=
    isAtomicGraph(test) ?  edges.concat([makeEdge(subNode1,test.node)]) :
    isCompoundGraph(test) ? edges.concat([makeEdge(subNode1,test.edge[0].from)].concat(test.edge)) :
    edges;
    const edgethen=
    isAtomicGraph(then) ?  edgetest.concat([makeEdge(subNode1,then.node)]) :
    isCompoundGraph(then) ? edgetest.concat([makeEdge(subNode1,then.edge[0].from)].concat(then.edge)) :
    edges;
    const edgealt=
    isAtomicGraph(alt) ?  edgethen.concat([makeEdge(subNode1,alt.node)]) :
    isCompoundGraph(alt) ? edgethen.concat([makeEdge(subNode1,alt.edge[0].from)].concat(alt.edge)) :
    edges;
    return makeCompoundGraph(edgealt);
    
}

export const L4DefExptoGraph = (exp: DefineExp): CompoundGraph => {
    const mainNode: Node= makeNodeDecl(defgen('DefineExp'),"DefineExp") ;
    const subNode1: Node= makeNodeDecl(vardecgen('VarDecl'),"VarDecl("+exp.var.var+")");
    const subNode2= L4exptoGraph(exp.val);
    const Edges: Edge[]=
    isAtomicGraph(subNode2)? [makeEdge(mainNode,subNode1,"var") ,makeEdge(mainNode,subNode2.node,"val") ]:
    isCompoundGraph(subNode2)? [makeEdge(mainNode,subNode1,"var"),makeEdge(mainNode,subNode2.edge[0].from,"val")].concat(subNode2.edge): 
    [makeEdge(mainNode,subNode1,"var")];

    return makeCompoundGraph(Edges);

}

export const L4ProcexptoGraph = (exp: ProcExp): CompoundGraph => {
    const makenodeverdecl = (x: VarDecl) : Node => makeNodeDecl(vardecgen('VarDecl'),"VarDecl("+x.var+")");
    const makeEdgeargs= (x:Node): Edge =>makeEdge(subNode1,x); 
    const makeEdbodys= (gr:GraphContent): Edge => makeEdge(subNode2, isAtomicGraph(gr)? gr.node : isCompoundGraph(gr)? gr.edge[0].from: makeNodeDecl("","")); 
    const mainNode=   makeNodeDecl(procgen('ProcExp'),"ProcExp") ;
    const subNode1= makeNodeDecl(argsgen('args'),":");
    const subNode2= makeNodeDecl(bodygen('body'),":");
    const edgeargs= map( makeEdgeargs ,map(makenodeverdecl, exp.args));
    const bodytree=  map( L4exptoGraph, exp.body);
    const bodytreeedge= map(makeEdbodys, bodytree);
    const Edges: Edge[]=[makeEdge(mainNode,subNode1,"args") ,makeEdge(mainNode,subNode2,"body") ].concat(edgeargs);
    const Edges2=Edges.concat(bodytreeedge);
    const makearray= (x:GraphContent): Edge[] => isCompoundGraph(x)? Edges2.concat(x.edge): isAtomicGraph(x)? Edges2: Edges2;
    const Edgesfin=  map(makearray, bodytree)
    return makeCompoundGraph(Edgesfin[0]);
      
   }

export const L4PAppExpptoGraph = (exp: AppExp): CompoundGraph => { 
    const mainNode= makeNodeDecl(appexpgen('AppExp'),"AppExp") ;
    const subNode1= L4exptoGraph(exp.rator);
    const subNode2= makeNodeDecl(randsgen('rands'),":");
    const randsNodes= map( L4exptoGraph ,exp.rands);
    const makeEdrands= (gr:GraphContent): Edge => makeEdge(subNode2, isAtomicGraph(gr)? gr.node : isCompoundGraph(gr)? gr.edge[0].from: makeNodeDecl("","")); 
    const Edges: Edge[]=
    isAtomicGraph(subNode1)? [makeEdge(mainNode,subNode1.node,"rator") ,makeEdge(mainNode,subNode2,"rands") ]:
    isCompoundGraph(subNode1)? [makeEdge(mainNode,subNode1.edge[0].from,"rator") ,makeEdge(mainNode,subNode2,"rands") ].concat(subNode1.edge):[];
    const Edges2=Edges.concat(map(makeEdrands,randsNodes));
    const makearray= (x:GraphContent): Edge[] => isCompoundGraph(x)? Edges2.concat(x.edge): isAtomicGraph(x)? Edges2: Edges2;
    const Edgesfin=  map(makearray, randsNodes)

    return makeCompoundGraph(Edgesfin[0]);
      
   }

export const L4lettoGraph = (exp:  LetExp): CompoundGraph => { 
    const mainNode= makeNodeDecl(letgen('LetExp'),"LetExp") ;
    const subNode1= makeNodeDecl(bindgen('bindings'),":");
    const subNode2= makeNodeDecl(bodygen('body'),":");
    const subNodes1= map( L4BindingtoGraph , exp.bindings);
    const subNodes2= map ( L4exptoGraph, exp.body );
    const makeEdrands2= (gr:GraphContent): Edge => makeEdge(subNode2, isAtomicGraph(gr)? gr.node : isCompoundGraph(gr)? gr.edge[0].from: makeNodeDecl("","")); 
    const makeEdrands1= (gr:GraphContent): Edge => makeEdge(subNode1, isAtomicGraph(gr)? gr.node : isCompoundGraph(gr)? gr.edge[0].from: makeNodeDecl("",""));
    const Edges: Edge[]=[makeEdge(mainNode,subNode1,"bindings") ,makeEdge(mainNode,subNode2,"body") ].concat(map(makeEdrands1,subNodes1)).concat(map(makeEdrands2,subNodes2));
    const subEdges: Edge[]=[];
    
    const makearray= (x:GraphContent): Edge[] => isCompoundGraph(x)? subEdges.concat(x.edge): isAtomicGraph(x)? subEdges: subEdges;
    const Edgesfin=  flatten(map(makearray, subNodes1));
    const Edgesfin2=  flatten(map(makearray, subNodes2));

    
    const a= (Edges.concat(Edgesfin).concat(Edgesfin2));

    return makeCompoundGraph(a);

   }

   export const L4letrectoGraph = (exp:  LetrecExp): CompoundGraph => { 
    const mainNode= makeNodeDecl(letrecgen('LetrecExp'),"LetrecExp") ;
    const subNode1= makeNodeDecl(bindgen('bindings'),":");
    const subNode2= makeNodeDecl(bodygen('body'),":");
    const subNodes1= map( L4BindingtoGraph , exp.bindings);
    const subNodes2= map ( L4exptoGraph, exp.body );
    const makeEdrands2= (gr:GraphContent): Edge => makeEdge(subNode2, isAtomicGraph(gr)? gr.node : isCompoundGraph(gr)? gr.edge[0].from: makeNodeDecl("","")); 
    const makeEdrands1= (gr:GraphContent): Edge => makeEdge(subNode1, isAtomicGraph(gr)? gr.node : isCompoundGraph(gr)? gr.edge[0].from: makeNodeDecl("",""));
    const Edges: Edge[]=[makeEdge(mainNode,subNode1,"bindings") ,makeEdge(mainNode,subNode2,"body") ].concat(map(makeEdrands1,subNodes1)).concat(map(makeEdrands2,subNodes2));
    const subEdges: Edge[]=[];
    
    const makearray= (x:GraphContent): Edge[] => isCompoundGraph(x)? subEdges.concat(x.edge): isAtomicGraph(x)? subEdges: subEdges;
    const Edgesfin=  flatten(map(makearray, subNodes1));
    const Edgesfin2=  flatten(map(makearray, subNodes2));

    
    const a= (Edges.concat(Edgesfin).concat(Edgesfin2));

    return makeCompoundGraph(a);

   }

   export const L4SetExptoGraph = (exp:  SetExp): CompoundGraph => { 
    const mainNode= makeNodeDecl(setgen('SetExp'),"SetExp") ;
    const subNode1= L4exptoGraph(exp.val);
    const subNode2= L4exptoGraph(exp.var );
    const Edges: Edge[]=
    isAtomicGraph(subNode1)?   [makeEdge(mainNode,subNode1.node)]:
    isCompoundGraph(subNode1) ?[makeEdge(mainNode,subNode1.edge[0].from)].concat(subNode1.edge) :
    [];
    const Edges2: Edge[]=
    isAtomicGraph(subNode2) ? Edges.concat([makeEdge(mainNode,subNode2.node)]) :
    isCompoundGraph(subNode2) ?Edges.concat([makeEdge(mainNode,subNode2.edge[0].from)].concat(subNode2.edge)) :
    Edges;

    return makeCompoundGraph(Edges2);
   }



   export const unparseMermaid = (exp: Graph): Result<string>=> {
       const S:string ="graph "+(isTD(exp.dir)? "TD": "LR")+"\n\t";
       
       const makeroottostring= (x: Edge): string => { 
        // const a: string= x.label
       
         const s1= isNodeDecl(x.from)? x.from.id+'["'+x.from.label+'"]'+" --> " : isNodeRef(x.from)? x.from.id+" --> ": S;
         const s2=(x.label!== undefined)? s1+"|"+x.label+"| ": s1 ;
         
         const s3= isNodeDecl(x.to)? s2+x.to.id+'["'+x.to.label+'"]'+"\n\t" : isNodeRef(x.to)? s2+x.to.id+"\n\t": s2;
         return s3;
        }

       const makeedgetostring= (x: Edge): string => { 
       // const a: string= x.label
      
        const s1= isNodeDecl(x.from)? x.from.id+" --> " : isNodeRef(x.from)? x.from.id+" --> ": S;
        const s2=(x.label!== undefined)? s1+"|"+x.label+"| ": s1 ;
        
        const s3= isNodeDecl(x.to)? s2+x.to.id+'["'+x.to.label+'"]'+"\n\t" : isNodeRef(x.to)? s2+x.to.id+"\n\t": s2;
        return s3;
       }

    
      const Sf= isAtomicGraph(exp.content)? exp.content.node.id+'["'+exp.content.node.label+'"]' :
      isCompoundGraph(exp.content)? map (makeedgetostring, exp.content.edge.slice(1)).join(""):
       S;
       const Sfroot= isAtomicGraph(exp.content)? "" :
       isCompoundGraph(exp.content)? makeroottostring(exp.content.edge[0]):
        S;

       const sfinel=S+Sfroot+Sf;
    
      return makeOk(sfinel);
   }

   export const L4toMermaid = (concrete: string): Result<string>=> {
   const a: Result<Program>=parseL4(concrete);
   return parsetogr(a, concrete);
   }
   const parsetogr=(a: Result<Program>, concrete: string): Result<string>=>
   isOk(a)? grtostring(mapL4toMermaid(a.value), concrete):makeFailure(a.message+"unable to parse the program"+concrete);

   const grtostring=(a: Result<Graph>, concrete: string): Result<string>=>
   isOk(a)?unparseMermaid(a.value) :  makeFailure(a.message+"unable to make a graph form the program"+concrete);



const a: Result<string>=L4toMermaid("(L4 1 #t “hello”)");
isOk(a)? console.log( a.value) : console.log(a.message);

       
   