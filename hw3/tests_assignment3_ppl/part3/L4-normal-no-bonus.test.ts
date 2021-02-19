import { expect } from 'chai';
import { parseL4, makePrimOp } from './L4-ast';
import { listPrim } from "./evalPrimitive";
import { evalNormalParse, evalNormalProgram } from './L4-normal';
import { isClosure, Value } from './L4-value';
import { makeOk, isOk, Result, bind } from "../shared/result";

describe('L4 Normal Eval No Bonus', () => {
    it('evaluates atoms', () => {
        expect(evalNormalParse("1")).to.deep.equal(makeOk(1));
        expect(evalNormalParse("#t")).to.deep.equal(makeOk(true));
        expect(evalNormalParse("+")).to.deep.equal(makeOk(makePrimOp("+")));
    });

    it('evaluates primitive procedures', () => {
        expect(evalNormalParse("(+ 1 2)")).to.deep.equal(makeOk(3));
        expect(evalNormalParse("(< 1 2)")).to.deep.equal(makeOk(true));
        expect(evalNormalParse("(not (> 1 2))")).to.deep.equal(makeOk(true));
        expect(evalNormalParse("(+ (* 2 2) 3)")).to.deep.equal(makeOk(7));
    });

    it('evaluates L2 syntactic forms', () => {
        expect(evalNormalParse("(if (< 1 2) 3 -3)")).to.deep.equal(makeOk(3));
        expect(evalNormalParse("(lambda (x) x)")).to.satisfy((e: Result<Value>) => isOk(e) && isClosure(e.value));
    });

    it('evaluates L3 syntactic forms', () => {
        expect(evalNormalParse("(cons 1 '())")).to.deep.equal(makeOk(listPrim([1])));
        expect(evalNormalParse("(car '(1 2))")).to.deep.equal(makeOk(1));
        expect(evalNormalParse("(cdr '(1 2))")).to.deep.equal(makeOk(listPrim([2])));
        expect(evalNormalParse("(number? 'x)")).to.deep.equal(makeOk(false));
        expect(evalNormalParse("(number? 1)")).to.deep.equal(makeOk(true));
        expect(evalNormalParse("(symbol? 'x)")).to.deep.equal(makeOk(true));
        expect(evalNormalParse("(symbol? 1)")).to.deep.equal(makeOk(false));
        expect(evalNormalParse("(pair? 1)")).to.deep.equal(makeOk(false));
        expect(evalNormalParse("(pair? '(1 2))")).to.deep.equal(makeOk(true));
        expect(evalNormalParse("(boolean? 1)")).to.deep.equal(makeOk(false));
        expect(evalNormalParse("(boolean? #t)")).to.deep.equal(makeOk(true));
        expect(evalNormalParse("(eq? 'x 'x)")).to.deep.equal(makeOk(true));
    });

    it('evaluates programs', () => {
        expect(bind(parseL4(`(L4 (define x (+ 3 2)) (* x x))`), evalNormalProgram)).to.deep.equal(makeOk(25));
        expect(bind(parseL4(`(L4 (define x 5) x)`), evalNormalProgram)).to.deep.equal(makeOk(5));
        expect(bind(parseL4(`(L4 (define x (+ 3 2)) (* x x) (+ x x))`), evalNormalProgram)).to.deep.equal(makeOk(10));
    });

    it('evaluates procedures', () => {
        expect(bind(parseL4(`(L4 (define f (lambda (x) (* x x))) (f 3))`), evalNormalProgram)).to.deep.equal(makeOk(9));
        expect(bind(parseL4(`(L4 (define f (lambda (x) (if (> x 0) x (- 0 x)))) (f -3))`), evalNormalProgram)).to.deep.equal(makeOk(3));
    });



    it('evaluates higher-order functions', () => {

        expect(bind(parseL4(`
            (L4 (define compose (lambda (f g) (lambda (x) (f (g x)))))
                ((compose not number?) 2))`), evalNormalProgram)).to.deep.equal(makeOk(false));
    });

    // it('evaluates let', () => {
    //     expect(bind(parseL4(`(L4(let((x 1) (y 2)) (+ x y)))`), evalNormalProgram)).to.deep.equal(makeOk(3));
    //     expect(bind(parseL4(`(L4(let((z (/ 10 0))(x 1) (y 2)) (+ x y)))`), evalNormalProgram)).to.deep.equal(makeOk(3));
    // });
    

    it('evaluates programs which would loop in applicative order, but complete in normal order 1/2', () => {
        expect(bind(parseL4(`
            (L4 (define loop (lambda () (loop)))
                (define f (lambda (x y z) (if (= x 1) y z)))
                (f 1 2 (loop)))`), evalNormalProgram)).to.deep.equal(makeOk(2));

    });

    it('evaluates programs which would loop in applicative order, but complete in normal order 2/2', () => {
        expect(bind(parseL4(`
        (L4 (define loop (lambda (x) (loop x)))
            (define g (lambda (x) 5))
            (g (loop 0)))`), evalNormalProgram)).to.deep.equal(makeOk(5));
    });

    it('evaluates programs which would give an error in applicative order, but not in normal order', () => {
        expect(bind(parseL4(`
            (L4 (define try
                  (lambda (a b)
                    (if (= a 0)
                        1
                        b)))
                (try 0 (/ 1 0)))`), evalNormalProgram)).to.deep.equal(makeOk(1));
    });

    it('evaluates programs which would cause side-effects in applicative order, but not in normal order', () => {
        expect(bind(parseL4(`
            (L4 (define f (lambda (x) (display x) (newline) (+ x 1)))
                (define g (lambda (x) 5))
                (g (f 0)))`), evalNormalProgram)).to.deep.equal(makeOk(5));
    });
});
