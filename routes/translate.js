const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const errorDatabase = {
    python: [
        // Basic Errors
        {
            pattern: /NameError.*not defined/i,
            explanation: "You're using a variable or function name that hasn't been defined yet. Python doesn't recognize it because it doesn't exist in memory.",
            wrongCode: "print(age)",
            rightCode: "age = 25\nprint(age)  # Output: 25",
            fix: "Define the variable before using it: age = value"
        },
        {
            pattern: /IndentationError|unexpected indent/i,
            explanation: "Python uses indentation (spaces or tabs) to define code blocks. Your indentation is inconsistent or missing.",
            wrongCode: "if x > 5:\nprint('hello')",
            rightCode: "if x > 5:\n    print('hello')",
            fix: "Use 4 spaces consistently for indentation. Don't mix tabs and spaces."
        },
        {
            pattern: /SyntaxError.*invalid syntax/i,
            explanation: "Python doesn't understand your code because of wrong syntax - missing colons, brackets, or wrong operators.",
            wrongCode: "if x = 5:",
            rightCode: "if x == 5:",
            fix: "Use == for comparison, = for assignment. Check for missing colons :"
        },
        {
            pattern: /TypeError.*(NoneType|undefined)/i,
            explanation: "You're trying to perform an operation on a None value. None means 'nothing' in Python.",
            wrongCode: "result = None\nprint(result.upper())",
            rightCode: "result = 'hello'\nprint(result.upper())  # Output: HELLO",
            fix: "Make sure your variable has a valid value before using methods on it."
        },
        {
            pattern: /KeyError/i,
            explanation: "You're trying to access a dictionary key that doesn't exist in the dictionary.",
            wrongCode: "my_dict = {'name': 'John'}\nprint(my_dict['age'])",
            rightCode: "my_dict = {'name': 'John', 'age': 25}\nprint(my_dict.get('age', 'Not found'))",
            fix: "Use .get() method or check if key exists with 'in' operator."
        },
        {
            pattern: /IndexError.*list index out of range/i,
            explanation: "You're trying to access a list element at an index that doesn't exist.",
            wrongCode: "my_list = [1, 2, 3]\nprint(my_list[5])",
            rightCode: "my_list = [1, 2, 3]\nif len(my_list) > 5:\n    print(my_list[5])\nelse:\n    print('Index out of range')",
            fix: "Check the list length before accessing index: if index < len(list):"
        },
        {
            pattern: /ImportError|ModuleNotFoundError/i,
            explanation: "Python cannot find the module you're trying to import.",
            wrongCode: "import non_existent_module",
            rightCode: "# First install the module: pip install module_name\nimport module_name",
            fix: "Install the module using pip or check if you spelled the module name correctly."
        },
        {
            pattern: /ValueError/i,
            explanation: "You passed the right type but wrong value to a function.",
            wrongCode: "int('hello')",
            rightCode: "int('123')  # Output: 123",
            fix: "Make sure the value matches what the function expects."
        },
        {
            pattern: /ZeroDivisionError/i,
            explanation: "You're trying to divide a number by zero, which is mathematically undefined.",
            wrongCode: "result = 10 / 0",
            rightCode: "if denominator != 0:\n    result = 10 / denominator\nelse:\n    print('Cannot divide by zero')",
            fix: "Check if denominator is zero before division."
        },
        {
            pattern: /AttributeError/i,
            explanation: "You're trying to access an attribute or method that doesn't exist for that object type.",
            wrongCode: "my_list = [1, 2, 3]\nmy_list.something()",
            rightCode: "my_list = [1, 2, 3]\nmy_list.append(4)  # append is a valid method",
            fix: "Check the object type and available methods using dir(object)."
        },
        // Advanced Python Errors
        {
            pattern: /EOFError/i,
            explanation: "Input() function didn't receive any data or file reached end unexpectedly.",
            wrongCode: "data = input()  # No input provided",
            rightCode: "try:\n    data = input()\nexcept EOFError:\n    print('No input received')",
            fix: "Use try-except block to handle missing input gracefully."
        },
        {
            pattern: /FloatingPointError/i,
            explanation: "A floating point operation failed (rare, usually with numpy).",
            wrongCode: "import numpy as np\nnp.seterr(all='raise')\nnp.sqrt(-1)",
            rightCode: "import numpy as np\nresult = np.sqrt(-1)  # Returns nan instead of error",
            fix: "Check for invalid math operations like sqrt of negative numbers."
        },
        {
            pattern: /OverflowError/i,
            explanation: "A numerical result is too large to be represented.",
            wrongCode: "import math\nmath.exp(1000)",
            rightCode: "import math\nresult = math.exp(1000)  # Use decimal or handle large numbers",
            fix: "Use decimal module or break down large calculations."
        },
        {
            pattern: /RecursionError/i,
            explanation: "Your recursive function exceeded the maximum recursion depth (default 1000).",
            wrongCode: "def infinite():\n    return infinite()\ninfinite()",
            rightCode: "def countdown(n):\n    if n <= 0:\n        return\n    countdown(n-1)\ncountdown(10)",
            fix: "Add a base case to stop recursion or increase recursion limit."
        },
        {
            pattern: /StopIteration/i,
            explanation: "You called next() on an iterator that has no more items.",
            wrongCode: "my_iter = iter([])\nnext(my_iter)",
            rightCode: "my_iter = iter([1,2,3])\nnext(my_iter, 'default')",
            fix: "Use next() with default value or catch StopIteration exception."
        },
        {
            pattern: /PermissionError/i,
            explanation: "You don't have permission to access a file or directory.",
            wrongCode: "with open('/root/file.txt', 'r') as f:",
            rightCode: "with open('user_file.txt', 'r') as f:",
            fix: "Check file permissions or use accessible file paths."
        },
        {
            pattern: /FileNotFoundError/i,
            explanation: "The file you're trying to open doesn't exist at the specified path.",
            wrongCode: "with open('missing.txt', 'r') as f:",
            rightCode: "import os\nif os.path.exists('file.txt'):\n    with open('file.txt', 'r') as f:",
            fix: "Check if file exists before opening or create it first."
        },
        {
            pattern: /IsADirectoryError/i,
            explanation: "You tried to open a directory as if it were a file.",
            wrongCode: "with open('/home', 'r') as f:",
            rightCode: "import os\nif os.path.isfile('/home'):\n    with open('/home', 'r') as f:",
            fix: "Check if path is a file using os.path.isfile() before opening."
        },
        {
            pattern: /NotADirectoryError/i,
            explanation: "You tried to use a file as a directory.",
            wrongCode: "import os\nos.listdir('file.txt')",
            rightCode: "import os\nif os.path.isdir('file.txt'):\n    os.listdir('file.txt')",
            fix: "Check if path is a directory before listing contents."
        },
        {
            pattern: /TimeoutError/i,
            explanation: "An operation timed out (network request, database query, etc.).",
            wrongCode: "import requests\nrequests.get('http://slow-site.com', timeout=1)",
            rightCode: "import requests\ntry:\n    requests.get('http://site.com', timeout=10)\nexcept requests.Timeout:",
            fix: "Increase timeout value or handle timeout exceptions."
        }
    ],
    javascript: [
        // Basic JS Errors
        {
            pattern: /ReferenceError.*(is not defined|not defined)/i,
            explanation: "You're trying to use a variable that hasn't been declared. JavaScript doesn't know what you're referring to.",
            wrongCode: "console.log(age)",
            rightCode: "let age = 25;\nconsole.log(age)  // Output: 25",
            fix: "Declare the variable using let, const, or var before using it."
        },
        {
            pattern: /TypeError.*(Cannot read property|undefined)/i,
            explanation: "You're trying to access a property of undefined or null. The object doesn't exist or is empty.",
            wrongCode: "let user = null;\nconsole.log(user.name)",
            rightCode: "let user = { name: 'John' };\nconsole.log(user?.name)  // Optional chaining",
            fix: "Use optional chaining (?.) or check if the object exists first."
        },
        {
            pattern: /SyntaxError.*Unexpected token/i,
            explanation: "JavaScript found a character it wasn't expecting. Usually a missing bracket, comma, or operator.",
            wrongCode: "let x = ;",
            rightCode: "let x = 5;",
            fix: "Check for missing values, extra commas, or unclosed brackets/parentheses."
        },
        {
            pattern: /TypeError.*(is not a function|called on non-object)/i,
            explanation: "You're trying to call something as a function that isn't a function.",
            wrongCode: "let x = 5;\nx()",
            rightCode: "let x = 5;\nconsole.log(x)  // x is a number, not a function",
            fix: "Check what type of value you're trying to call. Use typeof to verify."
        },
        {
            pattern: /RangeError/i,
            explanation: "A value is outside the allowed range, like an invalid array length or recursion depth.",
            wrongCode: "function infinite() { infinite() }\ninfinite()",
            rightCode: "function count(n) { if(n > 0) count(n-1) }\ncount(10)",
            fix: "Ensure recursion has a base case and array lengths are valid."
        },
        {
            pattern: /URIError/i,
            explanation: "Invalid URI (URL) was passed to decodeURIComponent or encodeURI.",
            wrongCode: "decodeURIComponent('%')",
            rightCode: "decodeURIComponent('%20')  // %20 is valid",
            fix: "Make sure your URI/URL is properly encoded."
        },
        {
            pattern: /EvalError/i,
            explanation: "The eval() function was used incorrectly. eval is generally discouraged in modern JS.",
            wrongCode: "eval('alert('Hello')')",
            rightCode: "// Avoid using eval. Use Function constructor or other approaches",
            fix: "Avoid using eval() for security and performance reasons."
        },
        // Advanced JS Errors
        {
            pattern: /Uncaught (in promise|TypeError)/i,
            explanation: "A Promise rejected but you didn't catch the error using .catch() or try-catch.",
            wrongCode: "fetch('url').then(res => res.json())",
            rightCode: "fetch('url')\n    .then(res => res.json())\n    .catch(err => console.error(err))",
            fix: "Always add .catch() to promises or use try-catch with async/await."
        },
        {
            pattern: /Maximum call stack size exceeded/i,
            explanation: "Your function is calling itself infinitely (recursion without base case).",
            wrongCode: "function infinite() { return infinite() }",
            rightCode: "function countdown(n) { if(n <= 0) return; countdown(n-1) }",
            fix: "Add a base case to stop recursion or use loops instead."
        },
        {
            pattern: /Cannot access '(.*)' before initialization/i,
            explanation: "You're using a let/const variable before its declaration (Temporal Dead Zone).",
            wrongCode: "console.log(x)\nlet x = 5",
            rightCode: "let x = 5\nconsole.log(x)",
            fix: "Declare variables at the top of their scope before using them."
        },
        {
            pattern: /Assignment to constant variable/i,
            explanation: "You're trying to reassign a value to a const variable, which can't be changed.",
            wrongCode: "const x = 5\nx = 10",
            rightCode: "let x = 5\nx = 10  // Use let instead of const",
            fix: "Use let instead of const if you need to reassign."
        },
        {
            pattern: /Missing initializer in const declaration/i,
            explanation: "Const variables must be initialized when declared.",
            wrongCode: "const x;",
            rightCode: "const x = 5;",
            fix: "Always assign a value when declaring const variables."
        },
        {
            pattern: /Unexpected reserved word/i,
            explanation: "You used a JavaScript reserved keyword as a variable name.",
            wrongCode: "let class = 'math'",
            rightCode: "let className = 'math'",
            fix: "Avoid using reserved keywords like class, function, return, etc. as variable names."
        },
        {
            pattern: /Unexpected end of input/i,
            explanation: "You forgot to close a bracket, parenthesis, or quote somewhere.",
            wrongCode: "function test() {",
            rightCode: "function test() {\n    return true\n}",
            fix: "Check for unclosed brackets {}, parentheses (), and quotes '' or \"\"."
        },
        {
            pattern: /JSON.parse.*unexpected/i,
            explanation: "JSON.parse() received invalid JSON format.",
            wrongCode: "JSON.parse('{name: 'John'}')",
            rightCode: "JSON.parse('{\"name\": \"John\"}')",
            fix: "Use double quotes for JSON keys and string values."
        }
    ],
    cpp: [
        // Basic C++ Errors
        {
            pattern: /segmentation fault|core dumped/i,
            explanation: "Your program tried to access memory it doesn't own. This usually happens with pointers or array out-of-bounds.",
            wrongCode: "int* ptr = nullptr;\n*ptr = 5;",
            rightCode: "int x = 5;\nint* ptr = &x;\n*ptr = 10;  // Now it's safe",
            fix: "Always initialize pointers. Check array bounds. Don't dereference null pointers."
        },
        {
            pattern: /undefined reference/i,
            explanation: "The linker cannot find a function or variable you declared. You declared it but never defined it.",
            wrongCode: "void myFunction(); // declared but not defined\nint main() { myFunction(); }",
            rightCode: "void myFunction() { }\nint main() { myFunction(); }",
            fix: "Define the function or link the correct library using -l flag."
        },
        {
            pattern: /too many arguments to function/i,
            explanation: "You're passing more arguments to a function than it was designed to accept.",
            wrongCode: "int sum(int a, int b) { return a+b; }\nsum(1,2,3)",
            rightCode: "int sum(int a, int b) { return a+b; }\nsum(1,2)",
            fix: "Check the function definition and pass the correct number of arguments."
        },
        {
            pattern: /no matching function for call/i,
            explanation: "You're trying to call a function with arguments that don't match any available overload.",
            wrongCode: "int sum(int a, int b) { return a+b; }\nsum(1.5, 2.5)",
            rightCode: "float sum(float a, float b) { return a+b; }\nsum(1.5, 2.5)",
            fix: "Check argument types. You may need to overload the function or cast types."
        },
        {
            pattern: /'cout' was not declared in this scope/i,
            explanation: "You forgot to include the iostream header or use std:: namespace.",
            wrongCode: "cout << 'hello';",
            rightCode: "#include <iostream>\nusing namespace std;\ncout << 'hello';",
            fix: "Add #include <iostream> and use std::cout or using namespace std;"
        },
        {
            pattern: /expected ';' before/i,
            explanation: "You forgot to put a semicolon at the end of a statement in C++.",
            wrongCode: "int x = 5",
            rightCode: "int x = 5;",
            fix: "Add semicolon at the end of statements (except after functions, loops, conditionals)."
        },
        {
            pattern: /'string' was not declared/i,
            explanation: "You're using std::string but forgot to include the string header.",
            wrongCode: "string name = 'John';",
            rightCode: "#include <string>\nstd::string name = 'John';",
            fix: "Add #include <string> and use std::string or using namespace std;"
        },
        {
            pattern: /cannot convert.*to.*/i,
            explanation: "You're trying to assign or pass a value of one type where another type is expected.",
            wrongCode: "int x = 'hello';",
            rightCode: "string x = 'hello';",
            fix: "Use correct data types or add type conversion (casting)."
        },
        {
            pattern: /was not declared in this scope/i,
            explanation: "You're using a variable or function that hasn't been declared yet or is out of scope.",
            wrongCode: "cout << x;\nint x = 5;",
            rightCode: "int x = 5;\ncout << x;",
            fix: "Declare variables before using them. Check scope (inside/outside functions)."
        },
        {
            pattern: /redefinition of/i,
            explanation: "You're trying to define the same function or variable multiple times.",
            wrongCode: "int x = 5;\nint x = 10;",
            rightCode: "int x = 5;\nx = 10;  // Assignment, not redefinition",
            fix: "Use assignment instead of redefinition, or use #pragma once in headers."
        },
        // Advanced C++ Errors
        {
            pattern: /multiple definition of/i,
            explanation: "The same function or variable is defined in multiple files or multiple times.",
            wrongCode: "// header.h\nint x = 5;\n// main.cpp\n#include 'header.h'\n// other.cpp\n#include 'header.h'",
            rightCode: "// header.h\nextern int x;\n// source.cpp\nint x = 5;",
            fix: "Use extern for declarations in headers and define in single source file."
        },
        {
            pattern: /cannot allocate memory|bad_alloc/i,
            explanation: "Your program ran out of memory (heap exhaustion).",
            wrongCode: "while(true) { new int[1000000]; }",
            rightCode: "Use smart pointers and free memory properly.",
            fix: "Free dynamically allocated memory using delete. Use vectors instead of raw arrays."
        },
        {
            pattern: /pure virtual function call/i,
            explanation: "You called a pure virtual function from constructor/destructor or with a deleted object.",
            wrongCode: "class Base { public: virtual void func() = 0; };\nBase* b = new Base();",
            rightCode: "class Derived : public Base { void func() override {} };\nBase* b = new Derived();",
            fix: "Don't create objects of abstract classes. Implement all pure virtual functions."
        },
        {
            pattern: /stack overflow|stack exhausted/i,
            explanation: "Your recursion depth is too deep or you allocated huge array on stack.",
            wrongCode: "int huge_array[10000000];  // On stack\nvoid infinite_recursion() { infinite_recursion(); }",
            rightCode: "int* huge_array = new int[10000000];  // On heap\nvoid recursion(int n) { if(n > 0) recursion(n-1); }",
            fix: "Use heap allocation (new) for large arrays. Limit recursion depth."
        },
        {
            pattern: /double free or corruption/i,
            explanation: "You tried to delete the same memory twice, causing memory corruption.",
            wrongCode: "int* ptr = new int(5);\ndelete ptr;\ndelete ptr;",
            rightCode: "int* ptr = new int(5);\ndelete ptr;\nptr = nullptr;  // Set to null after delete",
            fix: "Set pointers to nullptr after deleting. Use smart pointers (unique_ptr)."
        },
        {
            pattern: /invalid pointer|free\(\): invalid pointer/i,
            explanation: "You tried to delete a pointer that wasn't allocated with new.",
            wrongCode: "int x = 5;\nint* ptr = &x;\ndelete ptr;",
            rightCode: "int x = 5;\n// Don't delete stack variables",
            fix: "Only delete pointers that were allocated with new. Don't delete stack variables."
        },
        {
            pattern: /abort\(\) has been called/i,
            explanation: "Your program called abort() or an assertion failed.",
            wrongCode: "#include <cassert>\nassert(1 == 2);  // This will abort",
            rightCode: "if(1 != 2) { /* handle error gracefully */ }",
            fix: "Don't let assertions fail. Handle errors with proper conditions."
        },
        {
            pattern: /terminate called after throwing an instance of/i,
            explanation: "An exception was thrown but not caught anywhere.",
            wrongCode: "throw std::runtime_error('error');",
            rightCode: "try {\n    throw std::runtime_error('error');\n} catch(...) {\n    // handle\n}",
            fix: "Wrap throwing code in try-catch blocks."
        }
    ],
    react: [
        // Basic React Errors
        {
            pattern: /Invalid hook call|Hooks can only be called/i,
            explanation: "React Hooks have specific rules - they must be called at the top level of functional components, not inside conditions, loops, or nested functions.",
            wrongCode: "if (condition) { useState(false) }",
            rightCode: "const [value, setValue] = useState(false);\nif (condition) { setValue(true) }",
            fix: "Always call hooks at the top level of your component. Never inside conditions or loops."
        },
        {
            pattern: /Rendered more hooks than during the previous render/i,
            explanation: "The number of hooks called changed between renders. React relies on consistent hook order.",
            wrongCode: "if (flag) { useState() }\nuseEffect()",
            rightCode: "useState()\nuseEffect()\nif (flag) { /* do something */ }",
            fix: "Always call hooks in the same order every time. Don't conditionally call hooks."
        },
        {
            pattern: /Cannot update a component while rendering a different component/i,
            explanation: "You're trying to update state in one component while rendering another, causing a render conflict.",
            wrongCode: "ComponentA: setState() inside render of ComponentB",
            rightCode: "Use useEffect or event handlers for state updates, not during render.",
            fix: "Move state updates to useEffect, event handlers, or callbacks."
        },
        {
            pattern: /Each child in a list should have a unique key prop/i,
            explanation: "When rendering lists in React, each element needs a unique 'key' prop for efficient updates.",
            wrongCode: "items.map(item => <div>{item.name}</div>)",
            rightCode: "items.map(item => <div key={item.id}>{item.name}</div>)",
            fix: "Add a unique key prop (like id) to each element in your list."
        },
        // Advanced React Errors
        {
            pattern: /Can't perform a React state update on an unmounted component/i,
            explanation: "You're trying to update state after the component has been removed from DOM (memory leak).",
            wrongCode: "fetch().then(() => setState(data))  // Component may unmount before fetch completes",
            rightCode: "let mounted = true;\nfetch().then(() => { if(mounted) setState(data) });\nreturn () => { mounted = false }",
            fix: "Use cleanup function in useEffect to track mounted state."
        },
        {
            pattern: /Maximum update depth exceeded/i,
            explanation: "You created an infinite loop of state updates (setState inside useEffect without dependencies).",
            wrongCode: "useEffect(() => { setCount(count + 1) })  // No dependency array",
            rightCode: "useEffect(() => { setCount(count + 1) }, [])  // Empty array = run once",
            fix: "Add proper dependency array to useEffect. Don't update state that triggers the same effect."
        },
        {
            pattern: /Objects are not valid as a React child/i,
            explanation: "You tried to render a JavaScript object directly instead of a string or JSX.",
            wrongCode: "return <div>{{name: 'John'}}</div>",
            rightCode: "return <div>{user.name}</div>",
            fix: "Access object properties or convert object to string using JSON.stringify()."
        },
        {
            pattern: /React.Children.only expected to receive a single React element child/i,
            explanation: "A component that expects exactly one child received multiple children.",
            wrongCode: "<Component><div>1</div><div>2</div></Component>",
            rightCode: "<Component><div><div>1</div><div>2</div></div></Component>",
            fix: "Wrap multiple children in a single parent element or use React.Fragment."
        },
        {
            pattern: /createContext.*called with undefined context/i,
            explanation: "You're using a context without providing a value from Provider.",
            wrongCode: "const value = useContext(MyContext)  // No Provider above",
            rightCode: "<MyContext.Provider value={data}><Component /></MyContext.Provider>",
            fix: "Wrap components with Context.Provider and provide a value."
        },
        {
            pattern: /Element type is invalid.*expected a string/i,
            explanation: "You're trying to render something that's not a valid React component.",
            wrongCode: "import {WrongExport} from './Component'  // Component exports default, not named",
            rightCode: "import Component from './Component'  // Default import",
            fix: "Check your import/export statements. Make sure components are exported correctly."
        }
    ],
    node: [
        // Basic Node Errors
        {
            pattern: /Module not found|cannot find module/i,
            explanation: "Node.js cannot find the module you're trying to require or import.",
            wrongCode: "require('non-existent-package')",
            rightCode: "npm install package-name\nrequire('package-name')",
            fix: "Install the package using npm install, or check the file path if it's a local module."
        },
        {
            pattern: /listen EADDRINUSE/i,
            explanation: "The port you're trying to use is already taken by another process.",
            wrongCode: "app.listen(3000) // Port already in use",
            rightCode: "app.listen(3001) // Use a different port",
            fix: "Use a different port number or kill the process using the current port."
        },
        // Advanced Node Errors
        {
            pattern: /Cannot set headers after they are sent to the client/i,
            explanation: "You're trying to send multiple responses for a single request.",
            wrongCode: "res.send('First')\nres.send('Second')",
            rightCode: "res.send('Only one response')",
            fix: "Use return after res.send() or ensure you only send one response per request."
        },
        {
            pattern: /deprecated|DeprecationWarning/i,
            explanation: "You're using a feature that will be removed in future Node.js versions.",
            wrongCode: "const url = require('url')  // Legacy API",
            rightCode: "import url from 'node:url'  // New API",
            fix: "Check Node.js documentation for the recommended alternative."
        },
        {
            pattern: /ECONNREFUSED/i,
            explanation: "Node.js cannot connect to a server/database because it's not running or address is wrong.",
            wrongCode: "mongoose.connect('mongodb://localhost:27017/test')  // MongoDB not running",
            rightCode: "First start MongoDB server: mongod\nThen connect",
            fix: "Make sure the server/database is running and the address is correct."
        },
        {
            pattern: /ENOENT.*no such file or directory/i,
            explanation: "Node.js cannot find a file or directory at the specified path.",
            wrongCode: "fs.readFileSync('missing.txt')",
            rightCode: "if(fs.existsSync('file.txt')) {\n    fs.readFileSync('file.txt')\n}",
            fix: "Check if file exists before reading or use try-catch."
        },
        {
            pattern: /Callback must be a function/i,
            explanation: "You passed a non-function where a callback function was expected.",
            wrongCode: "fs.readFile('file.txt', 'utf8', 'not a function')",
            rightCode: "fs.readFile('file.txt', 'utf8', (err, data) => {\n    if(err) throw err\n    console.log(data)\n})",
            fix: "Always pass a function as callback."
        },
        {
            pattern: /Cannot find module '(.*)'\. Require stack/i,
            explanation: "Node.js can't resolve the module path in your require/import.",
            wrongCode: "require('../wrong/path/module')",
            rightCode: "require('./correct/path/module')",
            fix: "Check the relative path. Use ./ for same directory, ../ for parent directory."
        }
    ]
};

function detectLanguage(errorMsg) {
    const msg = errorMsg.toLowerCase();
    if (msg.includes('nameerror') || msg.includes('indentationerror') || msg.includes('syntaxerror') || 
        msg.includes('typeerror') || msg.includes('keyerror') || msg.includes('indexerror') || 
        msg.includes('valueerror') || msg.includes('attributeerror') || msg.includes('importerror') ||
        msg.includes('modulenotfound') || msg.includes('zerodivisionerror') || msg.includes('recursionerror')) return 'python';
    if (msg.includes('referenceerror') || msg.includes('cannot read property') || msg.includes('is not defined') || 
        msg.includes('rangeerror') || msg.includes('urierror') || msg.includes('evalerror') ||
        msg.includes('maximum call stack') || msg.includes('cannot access') || msg.includes('assignment to constant')) return 'javascript';
    if (msg.includes('segmentation fault') || msg.includes('undefined reference') || msg.includes('too many arguments') || 
        msg.includes('no matching function') || msg.includes('was not declared') || msg.includes('multiple definition') ||
        msg.includes('bad_alloc') || msg.includes('double free') || msg.includes('invalid pointer') ||
        msg.includes('stack overflow') || msg.includes('pure virtual')) return 'cpp';
    if (msg.includes('invalid hook') || msg.includes('hooks can only be called') || msg.includes('rendered more hooks') ||
        msg.includes('unmounted component') || msg.includes('maximum update depth') || msg.includes('objects are not valid')) return 'react';
    if (msg.includes('module not found') || msg.includes('cannot find module') || msg.includes('listen eaddrinuse') ||
        msg.includes('cannot set headers') || msg.includes('econnrefused') || msg.includes('enoent') ||
        msg.includes('deprecationwarning') || msg.includes('callback must be a function')) return 'node';
    return 'unknown';
}

function findErrorPattern(language, errorMsg) {
    if (!errorDatabase[language]) return null;
    for (const error of errorDatabase[language]) {
        if (error.pattern.test(errorMsg)) {
            return error;
        }
    }
    return null;
}

router.post('/', auth, async (req, res) => {
    try {
        const { errorMessage } = req.body;
        
        if (!errorMessage || errorMessage.trim() === '') {
            return res.status(400).json({ msg: 'Please provide an error message' });
        }
        
        const language = detectLanguage(errorMessage);
        const matchedError = findErrorPattern(language, errorMessage);
        
        if (matchedError) {
            res.json({
                language: language,
                explanation: matchedError.explanation,
                wrongCode: matchedError.wrongCode,
                rightCode: matchedError.rightCode,
                fix: matchedError.fix
            });
        } else {
            let suggestions = "";
            if (errorMessage.includes('error')) {
                suggestions = "This appears to be a compilation/runtime error. Check line numbers, syntax, and variable declarations.";
            } else if (errorMessage.includes('warning')) {
                suggestions = "This is a warning, not an error. Your code will run but might have issues.";
            } else if (errorMessage.toLowerCase().includes('c++') || errorMessage.includes('.cpp')) {
                suggestions = "C++ errors are often about pointers, memory, or missing includes. Check line numbers carefully.";
            } else if (errorMessage.toLowerCase().includes('python') || errorMessage.includes('.py')) {
                suggestions = "Python errors are usually about indentation, variable names, or data types.";
            } else if (errorMessage.toLowerCase().includes('react')) {
                suggestions = "React errors often involve hooks, props, or component lifecycle. Check component structure.";
            } else {
                suggestions = "Try searching the exact error message on Google or Stack Overflow for solutions.";
            }
            
            res.json({
                language: language,
                explanation: `We couldn't find an exact match in our database. ${suggestions}`,
                wrongCode: "N/A",
                rightCode: "N/A",
                fix: "Copy the exact error message and search online. Check line numbers mentioned in the error."
            });
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;