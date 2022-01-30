import { map } from "ramda";
import { valueToString } from "../imp/L3-value";
import { isEmpty } from "../shared/list";
import { Result, makeOk } from "../shared/result";
import { isBoolExp, isNumExp, isStrExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isLetExp, isDefineExp, isProgram, Binding, Exp, LetExp, ProcExp, Program, VarDecl } from "./L31-ast";

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string> =>
    makeOk(unparseL2(exp));

const unparseLExps = (les: Exp[]): string =>
    map(unparseL2, les).join(",");

const unparseLExps_forProgram = (les: Exp[]): string =>
    map(unparseL2, les).join("\n");

const unparseLExps_withOp = (rans: Exp[], rator: string): string =>
    ["not"].includes(rator) ? `(${rator} ${unparseLExps(rans)})` :
        ["=", "eq?"].includes(rator) ? `(${map(unparseL2, rans).join(` == `)})` :
            ["number?"].includes(rator) ? isEmpty(rans) ? `(lambda x : (type(x) == int) or (type(x) == float))` :
                `(lambda x : (type(x) == int) or (type(x) == float))(${unparseLExps(rans)})` :
                ["boolean?"].includes(rator) ? isEmpty(rans) ? `(lambda x : (type(x) == bool))` :
                    `(lambda x : (type(x) == bool))(${unparseLExps(rans)})` :
                    `(${map(unparseL2, rans).join(" " + rator + " ")})`;

const unparseProcExp = (pe: ProcExp): string =>
    `(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${unparseLExps(pe.body)})`

const unparseLetExp = (le: LetExp): string =>
    `(let (${map((b: Binding) => `(${b.var.var} ${unparseL2(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`

const isPrimitiveOp = (x: string): boolean =>
    ["+", "-", "*", "/", ">", "<", "=", "and", "or", "not", "eq?", "number?", "boolean?"].includes(x);

export const unparseL2 = (exp: Program | Exp): string =>
    isBoolExp(exp) ? valueToString(exp.val) :
        isNumExp(exp) ? valueToString(exp.val) :
            isStrExp(exp) ? valueToString(exp.val) :
                isVarRef(exp) ? exp.var :
                    isProcExp(exp) ? unparseProcExp(exp) :
                        isIfExp(exp) ? `(${unparseL2(exp.then)} if ${unparseL2(exp.test)} else ${unparseL2(exp.alt)})` :
                            isAppExp(exp) ? isPrimitiveOp(unparseL2(exp.rator)) ? `${unparseLExps_withOp(exp.rands, unparseL2(exp.rator))}` :
                                `${unparseL2(exp.rator)}(${unparseLExps(exp.rands)})` :
                                isPrimOp(exp) ? exp.op :
                                    isLetExp(exp) ? unparseLetExp(exp) :
                                        isDefineExp(exp) ? `${exp.var.var} = ${unparseL2(exp.val)}` :
                                            isProgram(exp) ? `${unparseLExps_forProgram(exp.exps)}` :
                                                'The provided Program | Exp is not valid in L2';
