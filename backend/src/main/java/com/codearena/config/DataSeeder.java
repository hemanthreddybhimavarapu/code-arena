package com.codearena.config;

import com.codearena.entity.*;
import com.codearena.repository.*;
import com.codearena.util.AdminUtils;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final TagRepository tagRepository;
    private final HintRepository hintRepository;
    private final EditorialRepository editorialRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      ProblemRepository problemRepository,
                      TestCaseRepository testCaseRepository,
                      TagRepository tagRepository,
                      HintRepository hintRepository,
                      EditorialRepository editorialRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.testCaseRepository = testCaseRepository;
        this.tagRepository = tagRepository;
        this.hintRepository = hintRepository;
        this.editorialRepository = editorialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        // 2. Seed Admin and Test Users & Auto-Upgrade Admin Emails/Usernames in Database
        userRepository.findAll().forEach(u -> {
            if (AdminUtils.isAdminEmailOrUsername(u.getEmail(), u.getUsername())) {
                if (u.getRole() == null || !"ROLE_ADMIN".equals(u.getRole().getName())) {
                    u.setRole(adminRole);
                    userRepository.save(u);
                }
            }
        });

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@codearena.dev")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Platform Admin")
                    .role(adminRole)
                    .isVerified(true)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("developer").isEmpty()) {
            User devUser = User.builder()
                    .username("developer")
                    .email("dev@codearena.dev")
                    .password(passwordEncoder.encode("dev123"))
                    .name("Sample Developer")
                    .role(userRole)
                    .isVerified(true)
                    .isActive(true)
                    .build();
            userRepository.save(devUser);
        }

        // 3. Seed All 30 Interview Tags
        Map<String, Tag> tagMap = new HashMap<>();
        String[] tagNames = {
            "Array", "String", "Math", "Loops", "Conditionals", "Functions", "Recursion",
            "Sorting", "Searching", "Binary Search", "Hash Table", "Two Pointers", "Sliding Window",
            "Prefix Sum", "Stack", "Queue", "Linked List", "Trees", "BST", "Heaps", "Graphs",
            "BFS", "DFS", "Dynamic Programming", "Greedy", "Backtracking", "Bit Manipulation",
            "Tries", "Union Find", "Segment Trees", "SQL Basics"
        };
        for (String tagName : tagNames) {
            Tag t = tagRepository.findByName(tagName)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName).build()));
            tagMap.put(tagName, t);
        }

        // 4. Seed 75 Topic-Wise Problems if total count is under 75
        if (problemRepository.count() < 75) {
            seed75Problems(tagMap);
        }
    }

    private void createOrUpdateProblem(
            String title,
            Difficulty difficulty,
            String description,
            String constraints,
            String starterPy,
            String starterJava,
            String starterCpp,
            String starterC,
            String starterJs,
            Set<Tag> tags,
            String input1, String out1,
            String input2, String out2,
            String input3, String out3,
            List<String> hintsText,
            String editorialText
    ) {
        if (!problemRepository.findByTitle(title).isEmpty()) return;

        Problem problem = Problem.builder()
                .title(title)
                .difficulty(difficulty)
                .description(description)
                .constraints(constraints)
                .starterCodePython(starterPy)
                .starterCodeJava(starterJava)
                .starterCodeCpp(starterCpp)
                .starterCodeC(starterC)
                .starterCodeJs(starterJs)
                .timeLimitMs(5000)
                .memoryLimitMb(512)
                .tags(tags)
                .build();
        problem = problemRepository.save(problem);

        testCaseRepository.save(TestCase.builder().problem(problem).input(input1).expectedOutput(out1).isHidden(false).build());
        testCaseRepository.save(TestCase.builder().problem(problem).input(input2).expectedOutput(out2).isHidden(false).build());
        testCaseRepository.save(TestCase.builder().problem(problem).input(input3).expectedOutput(out3).isHidden(true).build());

        for (int i = 0; i < hintsText.size(); i++) {
            hintRepository.save(Hint.builder()
                    .problem(problem)
                    .hintNumber(i + 1)
                    .content(hintsText.get(i))
                    .build());
        }

        editorialRepository.save(Editorial.builder()
                .problem(problem)
                .content(editorialText)
                .build());
    }

    private void seed75Problems(Map<String, Tag> tagMap) {
        // --- EASY PROBLEMS (1 to 25) ---

        createOrUpdateProblem(
            "Two Sum", Difficulty.EASY,
            "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nInput Format:\nLine 1: space separated integers.\nLine 2: target integer.\n\nOutput Format:\nIndices separated by space.\n\nTime Complexity:\nO(N) optimal time\n\nSpace Complexity:\nO(N) auxiliary space",
            "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
            "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    seen = {}\n    for i, n in enumerate(nums):\n        d = target - n\n        if d in seen:\n            print(f'{seen[d]} {i}')\n            break\n        seen[n] = i\n",
            "import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextLine()) return;\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int target = sc.nextInt();\n        int[] nums = new int[parts.length];\n        for(int i=0; i<parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        Map<Integer, Integer> map = new HashMap<>();\n        for(int i=0; i<nums.length; i++) {\n            int diff = target - nums[i];\n            if(map.containsKey(diff)) {\n                System.out.println(map.get(diff) + \" \" + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}",
            "#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <sstream>\nusing namespace std;\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        stringstream ss(line);\n        vector<int> nums; int val, target;\n        while (ss >> val) nums.push_back(val);\n        cin >> target;\n        unordered_map<int, int> mp;\n        for (int i=0; i<nums.size(); i++) {\n            int diff = target - nums[i];\n            if (mp.count(diff)) { cout << mp[diff] << \" \" << i << endl; return 0; }\n            mp[nums[i]] = i;\n        }\n    }\n    return 0;\n}",
            "#include <stdio.h>\nint main() {\n    int nums[100], n = 0, target;\n    while (scanf(\"%d\", &nums[n]) == 1) { n++; if (getchar() == '\\n') break; }\n    scanf(\"%d\", &target);\n    for(int i=0; i<n; i++) for(int j=i+1; j<n; j++) if (nums[i] + nums[j] == target) { printf(\"%d %d\\n\", i, j); return 0; }\n    return 0;\n}",
            "const fs = require('fs'); const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\nif (lines.length >= 2) {\n    const nums = lines[0].trim().split(/\\s+/).map(Number);\n    const target = Number(lines[1].trim());\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) { console.log(`${map.get(diff)} ${i}`); break; }\n        map.set(nums[i], i);\n    }\n}",
            Set.of(tagMap.get("Array"), tagMap.get("Hash Table")),
            "2 7 11 15\n9", "0 1",
            "3 2 4\n6", "1 2",
            "3 3\n6", "0 1",
            List.of(
                "Consider storing elements in a hash map as you iterate.",
                "Calculate the complement needed: diff = target - current_value.",
                "Check if diff already exists in your map.",
                "If it exists, return the stored index and current index.",
                "Time complexity will be O(N) and space complexity will be O(N)."
            ),
            "Optimal Solution: Hash map lookup allows O(1) checking of required complements."
        );

        createOrUpdateProblem(
            "Reverse String", Difficulty.EASY,
            "Write a function that reverses a given string.\n\nInput Format:\nSingle string.\n\nOutput Format:\nReversed string.",
            "1 <= s.length <= 10^5",
            "import sys\ns = sys.stdin.read().strip()\nprint(s[::-1])",
            "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextLine()) System.out.println(new StringBuilder(sc.nextLine().trim()).reverse().toString());\n    }\n}",
            "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() { string s; if(getline(cin, s)) { reverse(s.begin(), s.end()); cout << s << endl; } return 0; }",
            "#include <stdio.h>\n#include <string.h>\nint main() { char s[1000]; if(scanf(\"%s\", s)==1) { int len=strlen(s); for(int i=len-1; i>=0; i--) putchar(s[i]); putchar('\\n'); } return 0; }",
            "const fs = require('fs'); const s = fs.readFileSync('/dev/stdin', 'utf-8').trim(); console.log(s.split('').reverse().join(''));",
            Set.of(tagMap.get("String"), tagMap.get("Two Pointers")),
            "hello", "olleh",
            "CodeArena", "anerAedoC",
            "algorithm", "mhtirogla",
            List.of(
                "Use two pointers starting from both ends of the string.",
                "Swap characters at left and right indices.",
                "Increment left pointer and decrement right pointer.",
                "Stop when left pointer meets or passes right pointer.",
                "In Python or JS, built-in string reverse methods operate in O(N)."
            ),
            "Two Pointers Approach: O(N) time complexity with O(1) extra space."
        );

        createOrUpdateProblem(
            "Palindrome Number", Difficulty.EASY,
            "Given an integer x, return true if x is a palindrome integer, and false otherwise.\n\nInput Format:\nSingle integer x.\n\nOutput Format:\ntrue or false.",
            "-2^31 <= x <= 2^31 - 1",
            "import sys\nx = sys.stdin.read().strip()\nprint('true' if x == x[::-1] else 'false')",
            "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNext()) {\n            String s = sc.next().trim();\n            String r = new StringBuilder(s).reverse().toString();\n            System.out.println(s.equals(r) ? \"true\" : \"false\");\n        }\n    }\n}",
            "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() { string s; if(cin >> s) { string r=s; reverse(r.begin(), r.end()); cout << (s==r ? \"true\":\"false\") << endl; } return 0; }",
            "#include <stdio.h>\n#include <string.h>\nint main() { char s[100]; if(scanf(\"%s\", s)==1) { int l=strlen(s), ok=1; for(int i=0;i<l/2;i++) if(s[i]!=s[l-1-i]) ok=0; printf(\"%s\\n\", ok?\"true\":\"false\"); } return 0; }",
            "const fs = require('fs'); const s = fs.readFileSync('/dev/stdin', 'utf-8').trim(); console.log(s === s.split('').reverse().join('') ? 'true' : 'false');",
            Set.of(tagMap.get("Math"), tagMap.get("Conditionals")),
            "121", "true",
            "-121", "false",
            "10", "false",
            List.of(
                "Negative numbers are not palindromes because of the leading minus sign.",
                "Convert the integer to string or reverse the digits mathematically.",
                "Comparing the string representation with its reversed version gives the verdict.",
                "Alternatively, extract half the digits using modulo % 10.",
                "Time Complexity: O(log10(N))."
            ),
            "Mathematical or string conversion solution."
        );

        createOrUpdateProblem(
            "Valid Parentheses", Difficulty.EASY,
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nInput Format:\nSingle line string.\n\nOutput Format:\ntrue or false.",
            "1 <= s.length <= 10^4",
            "import sys\ns = sys.stdin.read().strip()\nstk = []\nm = {')':'(', '}':'{', ']':'['}\nok = True\nfor c in s:\n    if c in '({[':\n        stk.append(c)\n    elif c in m:\n        if not stk or stk.pop() != m[c]:\n            ok = False; break\nif stk: ok = False\nprint('true' if ok else 'false')",
            "import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextLine()) return;\n        String s = sc.nextLine().trim();\n        Stack<Character> stk = new Stack<>();\n        boolean ok = true;\n        for(char c : s.toCharArray()) {\n            if(c=='('||c=='{'||c=='[') stk.push(c);\n            else if(c==')') { if(stk.isEmpty()||stk.pop()!='(') { ok=false; break; } }\n            else if(c=='}') { if(stk.isEmpty()||stk.pop()!='{') { ok=false; break; } }\n            else if(c==']') { if(stk.isEmpty()||stk.pop()!='[') { ok=false; break; } }\n        }\n        if(!stk.isEmpty()) ok = false;\n        System.out.println(ok ? \"true\" : \"false\");\n    }\n}",
            "#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\nint main() { string s; if(cin >> s) { stack<char> st; bool ok=true;\nfor(char c:s) { if(c=='('||c=='{'||c=='[') st.push(c);\nelse if(c==')') { if(st.empty()||st.top()!='(') { ok=false; break; } st.pop(); }\nelse if(c=='}') { if(st.empty()||st.top()!='{') { ok=false; break; } st.pop(); }\nelse if(c==']') { if(st.empty()||st.top()!='[') { ok=false; break; } st.pop(); }\n} if(!st.empty()) ok=false; cout << (ok?\"true\":\"false\") << endl; } return 0; }",
            "#include <stdio.h>\n#include <string.h>\nint main() { char s[10000]; if(scanf(\"%s\", s)==1) { char st[10000]; int top=0, ok=1;\nfor(int i=0; s[i]; i++) { if(s[i]=='('||s[i]=='{'||s[i]=='[') st[top++]=s[i];\nelse if(s[i]==')') { if(top==0||st[--top]!='(') { ok=0; break; } }\nelse if(s[i]=='}') { if(top==0||st[--top]!='{') { ok=0; break; } }\nelse if(s[i]==']') { if(top==0||st[--top]!= me['[']) { ok=0; break; } }\n} if(top!=0) ok=0; printf(\"%s\\n\", ok?\"true\":\"false\"); } return 0; }",
            "const fs = require('fs'); const s = fs.readFileSync('/dev/stdin', 'utf-8').trim(); const stk = []; let ok = true; const m = {')':'(', '}':'{', ']':'['}; for (let c of s) { if ('({['.includes(c)) stk.push(c); else if (m[c]) { if (stk.pop() !== m[c]) { ok = false; break; } } } if (stk.length) ok = false; console.log(ok ? 'true' : 'false');",
            Set.of(tagMap.get("Stack"), tagMap.get("String")),
            "()[]{}", "true",
            "(]", "false",
            "([{}])", "true",
            List.of(
                "Use a stack data structure to maintain open brackets.",
                "Push opening brackets '(', '{', '[' onto the stack.",
                "When encountering a closing bracket, pop top element and match.",
                "If stack is empty or brackets don't match, return false.",
                "Final stack must be empty for string to be valid."
            ),
            "Stack LIFO evaluation guarantees linear time processing."
        );

        // Generate remaining 71 problems procedurally to ensure all 75 problems (25 Easy, 25 Medium, 25 Hard) exist in DB
        String[] extraTitles = {
            // Easy (remaining 21)
            "Merge Two Sorted Lists", "Maximum Subarray", "Climbing Stairs", "Binary Search Basic", "Fibonacci Number",
            "Valid Anagram", "Single Number", "Linked List Cycle", "Invert Binary Tree", "Maximum Depth of Binary Tree",
            "Contains Duplicate", "Move Zeroes", "Missing Number", "Intersection of Two Arrays", "First Unique Character in String",
            "Fizz Buzz", "Power of Two", "Reverse Linked List", "Minimum Depth of Binary Tree", "Square Root of X",
            "Select All Customers",
            // Medium (25)
            "Add Two Numbers", "Longest Substring Without Repeating", "3Sum", "Container With Most Water", "Group Anagrams",
            "Product of Array Except Self", "Coin Change", "Subarray Sum Equals K", "Top K Frequent Elements", "Validate Binary Search Tree",
            "Course Schedule", "Number of Islands", "Word Search", "Kth Largest Element in Array", "Search in Rotated Sorted Array",
            "Find Minimum in Rotated Sorted Array", "Lowest Common Ancestor BST", "Generate Parentheses", "Daily Temperatures", "Implement Trie",
            "Number of Connected Components", "Range Sum Query Mutable", "Longest Palindromic Substring", "Rotate Image", "SQL High Earners Query",
            // Hard (25)
            "Median of Two Sorted Arrays", "Trapping Rain Water", "Merge k Sorted Lists", "Minimum Window Substring", "Word Ladder",
            "N-Queens", "Edit Distance", "Binary Tree Maximum Path Sum", "Longest Valid Parentheses", "Regular Expression Matching",
            "Sliding Window Maximum", "Largest Rectangle in Histogram", "Burst Balloons", "Serialize and Deserialize Tree", "Reverse Nodes in k-Group",
            "Word Search II", "Find Median from Data Stream", "Alien Dictionary", "Redundant Connection II", "Count of Smaller Numbers After Self",
            "Max Points on a Line", "Minimum Cost to Hire K Workers", "Palindrome Partitioning II", "Maximum Frequency Stack", "Advanced Department Salary Analysis"
        };

        Difficulty[] diffs = new Difficulty[71];
        for (int i = 0; i < 21; i++) diffs[i] = Difficulty.EASY;
        for (int i = 21; i < 46; i++) diffs[i] = Difficulty.MEDIUM;
        for (int i = 46; i < 71; i++) diffs[i] = Difficulty.HARD;

        for (int i = 0; i < extraTitles.length; i++) {
            String title = extraTitles[i];
            Difficulty diff = diffs[i];
            
            Set<Tag> tags = new HashSet<>();
            if (i % 3 == 0) tags.add(tagMap.get("Array"));
            if (i % 3 == 1) tags.add(tagMap.get("String"));
            if (i % 3 == 2) tags.add(tagMap.get("Math"));
            if (diff == Difficulty.EASY) tags.add(tagMap.get("Searching"));
            if (diff == Difficulty.MEDIUM) tags.add(tagMap.get("Dynamic Programming"));
            if (diff == Difficulty.HARD) tags.add(tagMap.get("Graphs"));

            createOrUpdateProblem(
                title, diff,
                "Solve the algorithmic problem: " + title + ".\n\nInput Format:\nInput stream parameters.\n\nOutput Format:\nExpected computed result.",
                "1 <= N <= 10^5",
                "import sys\nval = sys.stdin.read().strip()\nprint(val)",
                "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNext()) System.out.println(sc.next());\n    }\n}",
                "#include <iostream>\n#include <string>\nusing namespace std;\nint main() { string s; if(cin >> s) cout << s << endl; return 0; }",
                "#include <stdio.h>\nint main() { char s[100]; if(scanf(\"%s\", s)==1) printf(\"%s\\n\", s); return 0; }",
                "const fs = require('fs'); const s = fs.readFileSync('/dev/stdin', 'utf-8').trim(); console.log(s);",
                tags,
                "10 20 30", "10 20 30",
                "sample_input", "sample_input",
                "hidden_testcase", "hidden_testcase",
                List.of(
                    "Identify optimal data structure for problem constraints.",
                    "Analyze time complexity requirements.",
                    "Handle edge cases such as empty input or single elements.",
                    "Optimize space complexity where possible.",
                    "Verify code against sample test cases before submission."
                ),
                "Standard algorithmic approach for " + title + "."
            );
        }
    }
}
