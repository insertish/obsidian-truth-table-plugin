const { Grammars } = require('ebnf');

const grammar = `
Formula ::= Operation

Term ::= Operation | Group | Symbol
Operation ::= Negation | And | Or | Xor
Operand ::= Symbol | Group

Group ::= "(" Term ")"
Symbol ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"

Negation ::= BACKSLASH "neg" WHITESPACE Operand
And ::= Operand WHITESPACE BACKSLASH ("land" | "wedge") WHITESPACE Operand
Or ::= Operand WHITESPACE BACKSLASH ("lor" | "vee") WHITESPACE Operand
Xor ::= Operand WHITESPACE BACKSLASH "oplus" WHITESPACE Operand

BACKSLASH ::= #x5C
WHITESPACEOP ::= " "
WHITESPACE ::= WHITESPACEOP WHITESPACE | WHITESPACEOP
`;

const parser = new Grammars.W3C.Parser(grammar);
const output = parser.getAST(process.argv[3]);

const fields = [];
function recurse(p) {
    if (p === null) return;
    if (p.type === 'Operation') {
        fields.push(p.text);
    }

    for (const child of p.children) {
        recurse(child);
    }
}

recurse(output);
console.log(fields);

// const { inspect } = require('util');
// console.log(inspect(output, false, 7, true));
