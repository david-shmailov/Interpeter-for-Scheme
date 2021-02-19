import { expect } from 'chai';
import { parseL4, makePrimOp } from './L4-ast';
import { listPrim } from "./evalPrimitive";
import { evalNormalParse, evalNormalProgram } from './L4-normal';
import { isClosure, Value } from './L4-value';
import { makeOk, isOk, Result, bind } from "../shared/result";

describe('L4 Normal Eval Bonus', () => {



    it('evaluates recursive procedures', () => {
       expect(bind(parseL4(`(L4 (define f
                                  (lambda (x)
                                    (if (= x 0)
                                        1
                                        (* x (f (- x 1))))))
                                (f 5))`), evalNormalProgram)).to.deep.equal(makeOk(120));
    });


    it('evaluates higher-order functions 1/2 - bonus', () => {
        expect(bind(parseL4(`
            (L4 (define map
                  (lambda (f l)
                    (if (eq? l '())
                        l
                        (cons (f (car l)) (map f (cdr l))))))
                (map (lambda (x) (* x x)) '(1 2 3)))`), evalNormalProgram)).to.deep.equal(makeOk(listPrim([1, 4, 9])));
    });

    it('evaluates higher-order functions 2/2 - bonus', () => {
        expect(bind(parseL4(`
            (L4 (define empty? (lambda (x) (eq? x '())))
                (define filter (lambda (pred l)
                                 (if (empty? l)
                                     l
                                     (if (pred (car l))
                                         (cons (car l) (filter pred (cdr l)))
                                         (filter pred (cdr l))))))
                (filter (lambda (x) (not (= x 2))) '(1 2 3 2)))`), evalNormalProgram)).to.deep.equal(makeOk(listPrim([1, 3])));

    });

    // it('evaluates let', () => {
    //     expect(bind(parseL4(`(L4(let((x 1) (y 2)) (+ x y)))`), evalNormalProgram)).to.deep.equal(makeOk(3));
    //     expect(bind(parseL4(`(L4(let((z (/ 10 0))(x 1) (y 2)) (+ x y)))`), evalNormalProgram)).to.deep.equal(makeOk(3));
    // });

    it('evaluates the examples 1/3', () => {
        // Preserve bound variables in subst
        expect(bind(parseL4(`
            (L4 (define nf
                  (lambda (f n)
                    (if (= n 0)
                        (lambda (x) x)
                        (if (= n 1)
                            f
                            (lambda (x) (f ((nf f (- n 1)) x)))))))
                ((nf (lambda (x) (* x x)) 2) 3))`), evalNormalProgram)).to.deep.equal(makeOk(81));
   });


    it('evaluates the examples 2/3', () => {
        // Accidental capture of the z variable if no renaming
        expect(bind(parseL4(`
            (L4 (define z (lambda (x) (* x x)))
                (((lambda (x) (lambda (z) (x z))) (lambda (w) (z w))) 2))`), evalNormalProgram)).to.deep.equal(makeOk(4));
   });

    it('evaluates the examples 3/3', () => {
        // Y-combinator
        expect(bind(parseL4(`
            (L4 (((lambda (f) (f f))
                    (lambda (fact)
                      (lambda (n)
                        (if (= n 0)
                            1
                            (* n ((fact fact) (- n 1))))))) 6))`), evalNormalProgram)).to.deep.equal(makeOk(720));
    });
});
