-- Create OTPs Table
CREATE TABLE otps (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE
);

-- Seed FizzBuzz Problem
INSERT INTO problems (id, title, description, difficulty, constraints, starter_code_java, starter_code_python, starter_code_c, starter_code_cpp, starter_code_js, time_limit_ms, memory_limit_mb) VALUES
(3, 'Fizz Buzz',
'Given an integer `n`, return *a string array `answer` (1-indexed)* where:
- `answer[i] == "FizzBuzz"` if `i` is divisible by `3` and `5`.
- `answer[i] == "Fizz"` if `i` is divisible by `3`.
- `answer[i] == "Buzz"` if `i` is divisible by `5`.
- `answer[i] == i` (as a string) if none of the above conditions are true.',
'EASY',
'- `1 <= n <= 10^4`',
'import java.util.Scanner;
import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<String> fizzBuzz(int n) {
        // TODO: Implement your solution here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Solution sol = new Solution();
        List<String> ans = sol.fizzBuzz(n);
        System.out.println(ans.toString().replace(" ", ""));
    }
}',
'import sys
import json

def fizzBuzz(n):
    # TODO: Implement your solution here
    return []

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        ans = fizzBuzz(int(line))
        print(json.dumps(ans).replace(" ", ""))',
'#include <stdio.h>
#include <stdlib.h>

void fizzBuzz(int n) {
    // TODO: Print the output from 1 to n, separated by commas
    // e.g. printf("\\"1\\",\\"2\\",\\"Fizz\\"");
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    printf("[");
    fizzBuzz(n);
    printf("]\\n");
    return 0;
}',
'#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    vector<string> fizzBuzz(int n) {
        // TODO: Implement your solution here
        return {};
    }
};

int main() {
    int n;
    if (cin >> n) {
        Solution sol;
        vector<string> ans = sol.fizzBuzz(n);
        cout << "[";
        for (size_t i = 0; i < ans.size(); i++) {
            cout << "\\"" << ans[i] << "\\"";
            if (i < ans.size() - 1) cout << ",";
        }
        cout << "]" << endl;
    }
    return 0;
}',
'const fs = require(''fs'');

function fizzBuzz(n) {
    // TODO: Implement your solution here
    return [];
}

const input = fs.readFileSync(0, ''utf-8'').trim();
if (input) {
    console.log(JSON.stringify(fizzBuzz(parseInt(input))).replace(/\\s/g, ''''));
}',
5000, 512);

-- Seed Test Cases for FizzBuzz
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
(3, '3', '["1","2","Fizz"]', FALSE),
(3, '5', '["1","2","Fizz","4","Buzz"]', FALSE),
(3, '15', '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', FALSE),
(3, '1', '["1"]', TRUE),
(3, '20', '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16","17","Fizz","19","Buzz"]', TRUE);

-- Seed Valid Parentheses Problem
INSERT INTO problems (id, title, description, difficulty, constraints, starter_code_java, starter_code_python, starter_code_c, starter_code_cpp, starter_code_js, time_limit_ms, memory_limit_mb) VALUES
(4, 'Valid Parentheses',
'Given a string `s` containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.',
'MEDIUM',
'- `1 <= s.length <= 10^4`
- `s` consists of parentheses only `()[]{}`.',
'import java.util.Scanner;
import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        // TODO: Implement your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Solution sol = new Solution();
        System.out.println(sol.isValid(s));
    }
}',
'import sys

def isValid(s):
    # TODO: Implement your solution here
    return False

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(str(isValid(line)).lower())',
'#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isValid(char* s) {
    // TODO: Implement your solution here
    return false;
}

int main() {
    char buf[1024];
    if (scanf("%s", buf) == 1) {
        printf("%s\n", isValid(buf) ? "true" : "false");
    }
    return 0;
}',
'#include <iostream>
#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // TODO: Implement your solution here
        return false;
    }
};

int main() {
    string s;
    if (cin >> s) {
        Solution sol;
        cout << (sol.isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}',
'const fs = require(''fs'');

function isValid(s) {
    // TODO: Implement your solution here
    return false;
}

const input = fs.readFileSync(0, ''utf-8'').trim();
if (input) {
    console.log(isValid(input).toString());
}',
5000, 512);

-- Seed Test Cases for Valid Parentheses
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
(4, '()', 'true', FALSE),
(4, '()[]{}', 'true', FALSE),
(4, '(]', 'false', FALSE),
(4, ']', 'false', TRUE),
(4, '[', 'false', TRUE),
(4, '{[]}', 'true', TRUE),
(4, '([)]', 'false', TRUE);
