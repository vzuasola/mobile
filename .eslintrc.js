/**
 * Custom Configuration for eslint base on http://eslint.org/docs/rules/
 */

module.exports = {
    env: {
        "browser": true,
        "node": true,
        "es6": true,
        "commonjs": true
    },
    globals: {
        app: true,
        iapiSetCallout: true,
        iapiGetLoggedInPlayer: true,
        iapiLogin: true,
        iapiLogout: true,
        iapiSetClientParams: true,
        iapiLaunchClient: true,
        iapiLoginSessionToken: true,
        fimReady:true,
        launchFimCasino: true,
        fimSetEndpoint: true,
        fimInit: true,
    },
    parser: "babel-eslint",
    rules: {
        // Possible Errors
        "for-direction":                "off", // enforce “for” loop update clause moving the counter in the right direction.
        "getter-return":                "off", // enforce return statements in getters
        "no-await-in-loop":             "off", // disallow await inside of loops
        "no-compare-neg-zero":          "error", // disallow comparing against -0
        "no-cond-assign":               "error", // disallow assignment operators in conditional expressions
        "no-console":                   "off", // disallow the use of console
        "no-constant-condition":        "error", // disallow constant expressions in conditions
        "no-control-regex":             "error", // disallow control characters in regular expressions
        "no-debugger":                  "error", // disallow the use of debugger
        "no-dupe-args":                 "error", // disallow duplicate arguments in function definitions
        "no-dupe-keys":                 "error", // disallow duplicate keys in object literals
        "no-duplicate-case":            "error", // disallow duplicate case labels
        "no-empty":                     ["error", { "allowEmptyCatch": true }], // disallow empty block statements
        "no-empty-character-class":     "error", // disallow empty character classes in regular expressions
        "no-ex-assign":                 "error", // disallow reassigning exceptions in catch clauses
        "no-extra-boolean-cast":        "error", // disallow unnecessary boolean casts
        "no-extra-parens":              "off", // disallow unnecessary parentheses
        "no-extra-semi":                "error", // disallow unnecessary semicolons
        "no-func-assign":               "error", // disallow reassigning function declarations
        "no-inner-declarations":        "error", // disallow variable or function declarations in nested blocks
        "no-invalid-regexp":            "error", // disallow invalid regular expression strings in RegExp constructors
        "no-irregular-whitespace":      "error", // disallow irregular whitespace outside of strings and comments
        "no-obj-calls":                 "error", // disallow calling global object properties as functions
        "no-prototype-builtins":        "off", // disallow calling some Object.prototype methods directly on objects
        "no-regex-spaces":              "error", // disallow multiple spaces in regular expressions
        "no-sparse-arrays":             "error", // disallow sparse arrays
        "no-template-curly-in-string":  "off", // disallow template literal placeholder syntax in regular strings
        "no-unexpected-multiline":      "error", // disallow confusing multiline expressions
        "no-unreachable":               "error", // disallow unreachable code after return, throw, continue, and break statements
        "no-unsafe-finally":            "error", // disallow control flow statements in finally blocks
        "no-unsafe-negation":           "error", // disallow negating the left operand of relational operators
        "use-isnan":                    "error", // require calls to isNaN() when checking for NaN
        "valid-jsdoc":                  "off", // enforce valid JSDoc comments
        "valid-typeof":                 "error", // enforce comparing typeof expressions against valid strings


        // Best Practices
        "accessor-pairs":               "off", // enforce getter and setter pairs in objects
        "array-callback-return":        "off", // enforce return statements in callbacks of array methods
        "block-scoped-var":             "off", // enforce the use of variables within the scope they are defined
        "class-methods-use-this":       "off", // enforce that class methods utilize this
        "complexity":                   "off", // enforce a maximum cyclomatic complexity allowed in a program
        "consistent-return":            "off", // require return statements to either always or never specify values
        "curly":                        "error", // enforce consistent brace style for all control statements
        "default-case":                 "off", // require default cases in switch statements
        "dot-location":                 "off", // enforce consistent newlines before and after dots
        "dot-notation":                 "off", // enforce dot notation whenever possible
        "eqeqeq":                       ["error", "smart"], // require the use of === and !==
        "guard-for-in":                 "off", // require for-in loops to include an if statement
        "no-alert":                     "off", // disallow the use of alert, confirm, and prompt
        "no-caller":                    "off", // disallow the use of arguments.caller or arguments.callee
        "no-case-declarations":         "error", // disallow lexical declarations in case clauses
        "no-div-regex":                 "off", // disallow division operators explicitly at the beginning of regular expressions
        "no-else-return":               "off", // disallow else blocks after return statements in if statements
        "no-empty-function":            "error", // disallow empty functions
        "no-empty-pattern":             "error", // disallow empty destructuring patterns
        "no-eq-null":                   "off", // disallow null comparisons without type-checking operators
        "no-eval":                      "error", // disallow the use of eval()
        "no-extend-native":             "off", // disallow extending native types
        "no-extra-bind":                "off", // disallow unnecessary calls to .bind()
        "no-extra-label":               "off", // disallow unnecessary labels
        "no-fallthrough":               "error", // disallow fallthrough of case statements
        "no-floating-decimal":          "off", // disallow leading or trailing decimal points in numeric literals
        "no-global-assign":             "error", // disallow assignments to native objects or read-only global variables
        "no-implicit-coercion":         "off", // disallow shorthand type conversions
        "no-implicit-globals":          "off", // disallow variable and function declarations in the global scope
        "no-implied-eval":              "off", // disallow the use of eval()-like methods
        "no-invalid-this":              "off", // disallow this keywords outside of classes or class-like objects
        "no-iterator":                  "off", // disallow the use of the __iterator__ property
        "no-labels":                    "off", // disallow labeled statements
        "no-lone-blocks":               "off", // disallow unnecessary nested blocks
        "no-loop-func":                 "off", // disallow function declarations and expressions inside loop statements
        "no-magic-numbers":             "off", // disallow magic numbers
        "no-multi-spaces":              "off", // disallow multiple spaces
        "no-multi-str":                 "off", // disallow multiline strings
        "no-new":                       "off", // disallow new operators outside of assignments or comparisons
        "no-new-func":                  "off", // disallow new operators with the Function object
        "no-new-wrappers":              "off", // disallow new operators with the String, Number, and Boolean objects
        "no-octal":                     "error", // disallow octal literals
        "no-octal-escape":              "off", // disallow octal escape sequences in string literals
        "no-param-reassign":            "off", // disallow reassigning function parameters
        "no-proto":                     "error", // disallow the use of the __proto__ property
        "no-redeclare":                 "error", // disallow variable redeclaration
        "no-restricted-properties":     "off", // disallow certain properties on certain objects
        "no-return-assign":             "off", // disallow assignment operators in return statements
        "no-return-await":              "off", // disallow unnecessary return await
        "no-script-url":                "off", // disallow javascript: urls
        "no-self-assign":               "error", // disallow assignments where both sides are exactly the same
        "no-self-compare":              "off", // disallow comparisons where both sides are exactly the same
        "no-sequences":                 "off", // disallow comma operators
        "no-throw-literal":             "off", // disallow throwing literals as exceptions
        "no-unmodified-loop-condition": "off", // disallow unmodified loop conditions
        "no-unused-expressions":        "off", // disallow unused expressions
        "no-unused-labels":             "error", // disallow unused labels
        "no-useless-call":              "off", // disallow unnecessary calls to .call() and .apply()
        "no-useless-concat":            "off", // disallow unnecessary concatenation of literals or template literals
        "no-useless-escape":            "off", // disallow unnecessary escape characters
        "no-useless-return":            "off", // disallow redundant return statements
        "no-void":                      "off", // disallow void operators
        "no-warning-comments":          "off", // disallow specified warning terms in comments
        "no-with":                      "off", // disallow with statements
        "prefer-promise-reject-errors": "off", // require using Error objects as Promise rejection reasons
        "radix":                        "off", // enforce the consistent use of the radix argument when using parseInt()
        "require-await":                "off", // disallow async functions which have no await expression
        "vars-on-top":                  "off", // require var declarations be placed at the top of their containing scope
        "wrap-iife":                    "off", // require parentheses around immediate function invocations
        "yoda":                         "off", // require or disallow “Yoda” conditions


        // Strict
        "strict":                       "off", // require or disallow strict mode directives


        // Variables
        "init-declarations":            "off", // require or disallow initialization in variable declarations
        "no-catch-shadow":              "off", // disallow catch clause parameters from shadowing variables in the outer scope
        "no-delete-var":                "error", // disallow deleting variables
        "no-label-var":                 "off", // disallow labels that share a name with a variable
        "no-restricted-globals":        "off", // disallow specified global variables
        "no-shadow":                    "off", // disallow variable declarations from shadowing variables declared in the outer scope
        "no-shadow-restricted-names":   "off", // disallow identifiers from shadowing restricted names
        "no-undef":                     "error", // disallow the use of undeclared variables unless mentioned in /*global */ comments
        "no-undef-init":                "off", // disallow initializing variables to undefined
        "no-undefined":                 "off", // disallow the use of undefined as an identifier
        "no-unused-vars":               ["error", { "args": "none" }], // disallow unused variables
        "no-use-before-define":         "off", // disallow the use of variables before they are defined


        // Node.js and CommonJS
        "callback-return":              "off", // require return statements after callbacks
        "global-require":               "error", // require require() calls to be placed at top-level module scope
        "handle-callback-err":          "off", // require error handling in callbacks
        "no-buffer-constructor":        "off", // disallow use of the Buffer() constructor
        "no-mixed-requires":            "off", // disallow require calls to be mixed with regular variable declarations
        "no-new-require":               "off", // disallow new operators with calls to require
        "no-path-concat":               "off", // disallow string concatenation with __dirname and __filename
        "no-process-env":               "off", // disallow the use of process.env
        "no-process-exit":              "off", // disallow the use of process.exit()
        "no-restricted-modules":        "off", // disallow specified modules when loaded by require
        "no-sync":                      "off", // disallow synchronous methods


        // Stylistic Issues
        "array-bracket-newline":                "off", // enforce linebreaks after opening and before closing array brackets
        "array-bracket-spacing":                "off", // enforce consistent spacing inside array brackets
        "array-element-newline":                "off", // enforce line breaks after each array element
        "block-spacing":                        "off", // enforce consistent spacing inside single-line blocks
        "brace-style":                          "error", // enforce consistent brace style for blocks
        "camelcase":                            "off", // enforce camelcase naming convention
        "capitalized-comments":                 "off", // enforce or disallow capitalization of the first letter of a comment
        "comma-dangle":                         "off", // require or disallow trailing commas
        "comma-spacing":                        "error", // enforce consistent spacing before and after commas
        "comma-style":                          ["error", "last"], // enforce consistent comma style
        "computed-property-spacing":            "off", // enforce consistent spacing inside computed property brackets
        "consistent-this":                      "off", // enforce consistent naming when capturing the current execution context
        "eol-last":                             "error", // require or disallow newline at the end of files
        "func-call-spacing":                    "off", // require or disallow spacing between function identifiers and their invocations
        "func-name-matching":                   "off", // require function names to match the name of the variable or property to which they are assigned
        "func-names":                           "off", // require or disallow named function expressions
        "func-style":                           "off", // enforce the consistent use of either function declarations or expressions
        "id-blacklist":                         "off", // disallow specified identifiers
        "id-length":                            "off", // enforce minimum and maximum identifier lengths
        "id-match":                             "off", // require identifiers to match a specified regular expression
        "indent":                               ["error", 4, { "SwitchCase": 1 }], // enforce consistent indentation
        "jsx-quotes":                           "off", // enforce the consistent use of either double or single quotes in JSX attributes
        "key-spacing":                          "off", // enforce consistent spacing between keys and values in object literal properties
        "keyword-spacing":                      ["error", { "after": true, "before": true }], // enforce consistent spacing before and after keywords
        "line-comment-position":                "off", // enforce position of line comments
        "linebreak-style":                      "off", // enforce consistent linebreak style
        "lines-around-comment":                 "off", // require empty lines around comments
        "max-depth":                            "off", // enforce a maximum depth that blocks can be nested
        "max-len":                              "off", // enforce a maximum line length
        "max-lines":                            "off", // enforce a maximum number of lines per file
        "max-nested-callbacks":                 "off", // enforce a maximum depth that callbacks can be nested
        "max-params":                           "off", // enforce a maximum number of parameters in function definitions
        "max-statements":                       "off", // enforce a maximum number of statements allowed in function blocks
        "max-statements-per-line":              "off", // enforce a maximum number of statements allowed per line
        "multiline-ternary":                    "off", // enforce newlines between operands of ternary expressions
        "new-cap":                              "off", // require constructor names to begin with a capital letter
        "new-parens":                           "off", // require parentheses when invoking a constructor with no arguments
        "newline-per-chained-call":             "off", // require a newline after each call in a method chain
        "no-array-constructor":                 "off", // disallow Array constructors
        "no-bitwise":                           "off", // disallow bitwise operators
        "no-continue":                          "off", // disallow continue statements
        "no-inline-comments":                   "off", // disallow inline comments after code
        "no-lonely-if":                         "error", // disallow if statements as the only statement in else blocks
        "no-mixed-operators":                   "off", // disallow mixed binary operators
        "no-mixed-spaces-and-tabs":             "error", // disallow mixed spaces and tabs for indentation
        "no-multi-assign":                      "off", // disallow use of chained assignment expressions
        "no-multiple-empty-lines":              "off", // disallow multiple empty lines
        "no-negated-condition":                 "off", // disallow negated conditions
        "no-nested-ternary":                    "off", // disallow nested ternary expressions
        "no-new-object":                        "off", // disallow Object constructors
        "no-plusplus":                          "off", // disallow the unary operators ++ and --
        "no-restricted-syntax":                 "off", // disallow specified syntax
        "no-tabs":                              "off", // disallow all tabs
        "no-ternary":                           "off", // disallow ternary operators
        "no-trailing-spaces":                   "error", // disallow trailing whitespace at the end of lines
        "no-underscore-dangle":                 "off", // disallow dangling underscores in identifiers
        "no-unneeded-ternary":                  "off", // disallow ternary operators when simpler alternatives exist
        "no-whitespace-before-property":        "off", // disallow whitespace before properties
        "nonblock-statement-body-position":     "off", // enforce the location of single-line statements
        "object-curly-newline":                 "off", // enforce consistent line breaks inside braces
        "object-curly-spacing":                 "off", // enforce consistent spacing inside braces
        "object-property-newline":              "off", // enforce placing object properties on separate lines
        "one-var":                              "off", // enforce variables to be declared either together or separately in functions
        "one-var-declaration-per-line":         "off", // require or disallow newlines around variable declarations
        "operator-assignment":                  "off", // require or disallow assignment operator shorthand where possible
        "operator-linebreak":                   "off", // enforce consistent linebreak style for operators
        "padded-blocks":                        "off", // require or disallow padding within blocks
        "padding-line-between-statements":      "off", // require or disallow padding lines between statements
        "quote-props":                          "off", // require quotes around object literal property names
        "quotes":                               "off", // enforce the consistent use of either backticks, double, or single quotes
        "require-jsdoc":                        "off", // require JSDoc comments
        "semi":                                 "error", // require or disallow semicolons instead of ASI
        "semi-spacing":                         "off", // enforce consistent spacing before and after semicolons
        "semi-style":                           "off", // enforce location of semicolons
        "sort-keys":                            "off", // require object keys to be sorted
        "sort-vars":                            "off", // require variables within the same declaration block to be sorted
        "space-before-blocks":                  ["error", "always"], // enforce consistent spacing before blocks
        "space-before-function-paren":          ["error", { "anonymous": "always", "asyncArrow": "always", "named": "never" }], // enforce consistent spacing before function definition opening parenthesis
        "space-in-parens":                      "off", // enforce consistent spacing inside parentheses
        "space-infix-ops":                      "error", // require spacing around infix operators
        "space-unary-ops":                      ["error", { "words": true, "nonwords": false }], // enforce consistent spacing before or after unary operators
        "spaced-comment":                       "error", // enforce consistent spacing after the // or /* in a comment
        "switch-colon-spacing":                 "off", // enforce spacing around colons of switch statements
        "template-tag-spacing":                 "off", // require or disallow spacing between template tags and their literals
        "unicode-bom":                          "off", // require or disallow Unicode byte order mark (BOM)
        "wrap-regex":                           "off", // require parenthesis around regex literals


        // ECMAScript 6
        "arrow-body-style":             "off", // require braces around arrow function bodies
        "arrow-parens":                 "off", // require parentheses around arrow function arguments
        "arrow-spacing":                "off", // enforce consistent spacing before and after the arrow in arrow functions
        "constructor-super":            "error", // require super() calls in constructors
        "generator-star-spacing":       "off", // enforce consistent spacing around * operators in generator functions
        "no-class-assign":              "error", // disallow reassigning class members
        "no-confusing-arrow":           "off", // disallow arrow functions where they could be confused with comparisons
        "no-const-assign":              "error", // disallow reassigning const variables
        "no-dupe-class-members":        "error", // disallow duplicate class members
        "no-duplicate-imports":         "error", // disallow duplicate module imports
        "no-new-symbol":                "error", // disallow new operators with the Symbol object
        "no-restricted-imports":        "off", // disallow specified modules when loaded by import
        "no-this-before-super":         "error", // disallow this/super before calling super() in constructors
        "no-useless-computed-key":      "off", // disallow unnecessary computed property keys in object literals
        "no-useless-constructor":       "off", // disallow unnecessary constructors
        "no-useless-rename":            "off", // disallow renaming import, export, and destructured assignments to the same name
        "no-var":                       "off", // require let or const instead of var
        "object-shorthand":             "off", // require or disallow method and property shorthand syntax for object literals
        "prefer-arrow-callback":        "off", // require arrow functions as callbacks
        "prefer-const":                 "off", // require const declarations for variables that are never reassigned after declared
        "prefer-destructuring":         "off", // require destructuring from arrays and/or objects
        "prefer-numeric-literals":      "off", // disallow parseInt() and Number.parseInt() in favor of binary, octal, and hexadecimal literals
        "prefer-rest-params":           "off", // require rest parameters instead of arguments
        "prefer-spread":                "off", // require spread operators instead of .apply()
        "prefer-template":              "off", // require template literals instead of string concatenation
        "require-yield":                "error", // require generator functions to contain yield
        "rest-spread-spacing":          "off", // enforce spacing between rest and spread operators and their expressions
        "sort-imports":                 "off", // enforce sorted import declarations within modules
        "symbol-description":           "off", // require symbol descriptions
        "template-curly-spacing":       "off", // require or disallow spacing around embedded expressions of template strings
        "yield-star-spacing":           "off", // require or disallow spacing around the * in yield* expressions
    }
};
