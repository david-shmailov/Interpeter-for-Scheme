import { Result, isOk } from "../shared/result";
import { L4toMermaid } from "./mermaid";

let code = "(L4 1 #t “hello”)";
code = "(L4 (if (< 1 2) a b))";
const testlet = "(L4 (let ((x 5)(y 6)) (+ x y)))";
const testletrec= "(L4 (letrec ((x 5)(y 6)) (+ x y)))"



const a: Result<string>=L4toMermaid(testletrec);
isOk(a)? console.log( a.value) : console.log(a.message);
