import { LetExp, isProgram, isDefineExp, isLetExp, isPrimOp, isAppExp, isIfExp, isProcExp, isVarRef, isLitExp, isStrExp, isNumExp, ClassExp, CExp, ProcExp, Exp, Program, makeProcExp, makeVarDecl, isClassExp, makeIfExp, Binding, makeAppExp, makePrimOp, makeBoolExp, makeVarRef, isBoolExp, VarDecl, LitExp, parseL31Exp, parseL31 } from "./L31-ast";
import { Result } from "../shared/result";
import { first, rest, isEmpty } from "../shared/list";
import { isCompoundSExp, isEmptySExp, isSymbolSExp, valueToString } from "../imp/L3-value";
import { map } from "ramda";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>
    makeProcExp(exp.fields, [makeProcExp([makeVarDecl('msg')], [arr2CExp(exp.methods)])]);

export const arr2CExp = (bindings: Binding[]): CExp =>
    isEmpty(bindings) ? makeBoolExp(false) :
        makeIfExp(makeAppExp(makePrimOp('eq?'), [makeVarRef('msg'), makeVarRef(`'${first(bindings).var.var}`)]), makeAppExp(first(bindings).val, []), arr2CExp(rest(bindings)));

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> => isProgram(exp) ? parseL31((unparseL31ToL3(exp))) : parseL31Exp((unparseL31ToL3(exp)));

const unparseLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `'()` :
        isSymbolSExp(le.val) ? `'${valueToString(le.val)}` :
            isCompoundSExp(le.val) ? `'${valueToString(le.val)}` :
                `${le.val}`;

const unparseLExps = (les: Exp[]): string =>
    map(unparseL31ToL3, les).join(" ");

const unparseProcExp = (pe: ProcExp): string =>
    `(lambda (${map((p: VarDecl) => p.var, pe.args).join(" ")}) ${unparseLExps(pe.body)})`

const unparseLetExp = (le: LetExp): string =>
    `(let (${map((b: Binding) => `(${b.var.var} ${unparseL31ToL3(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`

export const unparseL31ToL3 = (exp: Program | Exp): string =>
    isBoolExp(exp) ? valueToString(exp.val) :
        isNumExp(exp) ? valueToString(exp.val) :
            isStrExp(exp) ? valueToString(exp.val) :
                isLitExp(exp) ? unparseLitExp(exp) :
                    isVarRef(exp) ? exp.var :
                        isProcExp(exp) ? unparseProcExp(exp) :
                            isIfExp(exp) ? `(if ${unparseL31ToL3(exp.test)} ${unparseL31ToL3(exp.then)} ${unparseL31ToL3(exp.alt)})` :
                                isAppExp(exp) ? `(${unparseL31ToL3(exp.rator)} ${unparseLExps(exp.rands)})` :
                                    isPrimOp(exp) ? exp.op :
                                        isLetExp(exp) ? unparseLetExp(exp) :
                                            isDefineExp(exp) ? `(define ${exp.var.var} ${unparseL31ToL3(exp.val)})` :
                                                isProgram(exp) ? `(L31 ${unparseLExps(exp.exps)})` :
                                                    isClassExp(exp) ? unparseProcExp(class2proc(exp)) :
                                                        exp;
