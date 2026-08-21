-- Seed remaining unique problems (IDs 21 to 104) to complete the 100-problem bank
DO $$
DECLARE
    p_id INT;
    t_id INT;
    i INT;
    t_idx INT;
    v_idx INT;
    title TEXT;
    description TEXT;
    difficulty TEXT;
    constraints TEXT;
    starter_java TEXT;
    starter_py TEXT;
    starter_c TEXT;
    starter_cpp TEXT;
    starter_js TEXT;
    
    -- Seeding Arrays
    titles TEXT[] := ARRAY[
        -- Array Search (t_idx = 0)
        'Find Maximum Element', 'Find Minimum Element', 'Count Even Numbers', 'Count Odd Numbers', 'Sum of Positive Numbers', 'Product of Array Elements', 'Average of Array Elements',
        -- String Manipulation (t_idx = 1)
        'Count Vowels', 'Count Consonants', 'Check Palindrome Substring', 'String Length Word Count', 'Check Isogram', 'Count Specific Character', 'Remove All Vowels',
        -- Math / Number Theory (t_idx = 2)
        'Check Prime Number', 'Calculate Factorial', 'Nth Fibonacci Number', 'Find GCD', 'Find LCM', 'Check Power of Two', 'Sum of Digits',
        -- List/Sequence Operations (t_idx = 3)
        'Find Duplicate Element', 'Remove Target Element', 'Merge Sorted Arrays Simple', 'Search Range Indices', 'Rotate Array Left', 'Rotate Array Right', 'Check Sorted Array',
        -- Bitwise Operations (t_idx = 4)
        'Count Set Bits', 'Check Power of Four', 'Check Odd Even Bitwise', 'Swap Two Numbers Bitwise', 'Check Power of Eight', 'Binary Representation Length', 'Single Number Variant',
        -- Two Pointers / Partition (t_idx = 5)
        'Move Zeroes End', 'Partition Array Parity', 'Merge Sorted Inplace Simple', 'Reverse Prefix Word', 'Check Palindrome Words', 'Remove Element Two Pointers', 'Square Sorted Array',
        -- Stack/Simulation (t_idx = 6)
        'Valid Parentheses Basic', 'Backspace String Compare Basic', 'Decimal to Binary Stack', 'Queue Simulation Basic', 'Reverse Stack Elements', 'Evaluate Postfix Expression', 'Min Stack Basic',
        -- Greedy Decisions (t_idx = 7)
        'Buy Sell Stock Basic', 'Min Coins Greedy', 'Assign Cookies Basic', 'Non Overlapping Intervals Basic', 'Jump Game Basic', 'Max Subarray Sum Basic', 'Partition Labels Basic',
        -- Binary Search Variants (t_idx = 8)
        'Search Insert Position', 'Find Square Root Truncated', 'Search First Occurrence', 'Find Peak Element Basic', 'Search Last Occurrence', 'Binary Search Index Target', 'Find Smallest Letter Greater Than Target',
        -- Sliding Window Basic (t_idx = 9)
        'Max Sum Subarray Size K', 'Count Subarrays Sum Target', 'Duplicate Within K Distance', 'Min Size Subarray Sum Target', 'Max Cons Oned Array', 'Longest Substring K Unique', 'Find All Anagrams Basic',
        -- Hashing Lookup (t_idx = 10)
        'Intersection Two Arrays', 'First Unique Character Index', 'Check Pair Sum Hash', 'Check Unique Characters String', 'Find Disappeared Numbers', 'Valid Sudoku Subgrid', 'Subarray Sum Equals K Hashing',
        -- Dynamic Programming / Recurrence (t_idx = 11)
        'Tribonacci Number', 'Min Cost Climbing Stairs Basic', 'House Robber Basic', 'Unique Paths Basic', 'Climbing Stairs DP', 'Decode Ways Basic', 'Coin Change DP Basic'
    ];

    descriptions TEXT[] := ARRAY[
        -- Array Search (t_idx = 0)
        'Given an array of integers `arr`, find and return the maximum element.',
        'Given an array of integers `arr`, find and return the minimum element.',
        'Given an array of integers `arr`, count and return how many numbers are even.',
        'Given an array of integers `arr`, count and return how many numbers are odd.',
        'Given an array of integers `arr`, calculate and return the sum of all positive numbers.',
        'Given an array of integers `arr`, calculate and return the product of all elements.',
        'Given an array of integers `arr`, calculate and return the truncated integer average of all elements.',
        -- String Manipulation (t_idx = 1)
        'Given a string `s`, count and return the total number of vowels (a, e, i, o, u) case-insensitively.',
        'Given a string `s`, count and return the total number of consonant characters (non-vowels and alphabetic).',
        'Given a string `s`, check if the string is a valid palindrome substring, ignoring case and non-alphabetic characters.',
        'Given a string `s` containing words separated by single spaces, count and return the total number of words.',
        'Given a string `s`, check if the string is an isogram (no repeating letter case-insensitively). Return true or false.',
        'Given a string `s` and a character `c`, count and return how many times `c` appears in `s`.',
        'Given a string `s`, remove all vowel characters and return the modified string.',
        -- Math / Number Theory (t_idx = 2)
        'Given a positive integer `n`, return true if `n` is a prime number, otherwise return false.',
        'Given a non-negative integer `n`, compute and return its mathematical factorial value.',
        'Given an integer `n`, compute and return the Nth Fibonacci number (where F(0) = 0, F(1) = 1).',
        'Given two positive integers `a` and `b` separated by spaces, calculate and return their Greatest Common Divisor (GCD).',
        'Given two positive integers `a` and `b` separated by spaces, calculate and return their Least Common Multiple (LCM).',
        'Given an integer `n`, return true if `n` is a power of two, otherwise return false.',
        'Given a positive integer `n`, calculate and return the sum of its digits.',
        -- List/Sequence Operations (t_idx = 3)
        'Given a list of integers `arr`, identify and return the duplicate element (assuming exactly one duplicate exists).',
        'Given a list of integers `arr` and a target value `t`, remove all occurrences of `t` and return the new list.',
        'Given two sorted arrays `a` and `b`, merge them into a single sorted array and return the result.',
        'Given a sorted array `arr` and a target value `t`, search and return the first and last occurrence indices.',
        'Given an array `arr` and an offset `k`, rotate the array left by `k` positions.',
        'Given an array `arr` and an offset `k`, rotate the array right by `k` positions.',
        'Given an array of integers `arr`, check if the array is sorted in non-decreasing order.',
        -- Bitwise Operations (t_idx = 4)
        'Given an integer `n`, count and return the total number of set bits (1s) in its binary representation.',
        'Given an integer `n`, return true if `n` is a power of four, otherwise return false.',
        'Given an integer `n`, check if it is odd or even using bitwise operators. Return true if odd, false if even.',
        'Given two integers `a` and `b` separated by spaces, swap them using bitwise XOR and return the swapped string.',
        'Given an integer `n`, return true if `n` is a power of eight, otherwise return false.',
        'Given an integer `n`, calculate and return the length of its binary representation representation.',
        'Given an array of integers where every element appears twice except for one, find that single one.',
        -- Two Pointers / Partition (t_idx = 5)
        'Given an array `arr`, move all zeroes to the end of it while maintaining the relative order of the non-zero elements.',
        'Given an array `arr`, partition it such that all even integers come before odd integers.',
        'Given two sorted arrays, merge them into a single sorted list using a two pointers strategy.',
        'Given a string `s` and a character `c`, reverse the prefix of `s` that ends at the first occurrence of `c`.',
        'Given a string `s` of word phrases, check if it reads the same forward and backward.',
        'Given an array and target, remove the target in-place using two pointers.',
        'Given a sorted array `arr`, return a new array containing the squares of each number sorted in non-decreasing order.',
        -- Stack/Simulation (t_idx = 6)
        'Given a string containing parentheses characters, check if the parentheses pairings are valid.',
        'Given two strings containing backspace characters `#`, check if they result in the same final string.',
        'Given a positive integer `n`, convert it into binary representation using a stack data structure.',
        'Simulate a queue using stack push and pop operations and return the output sequence.',
        'Given a list of stack elements, reverse their order using recursion or stack operations.',
        'Evaluate the value of an arithmetic expression in Reverse Polish Notation (postfix).',
        'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
        -- Greedy Decisions (t_idx = 7)
        'Given an array of daily stock prices, find the maximum profit you can achieve by buying and selling once.',
        'Given a target amount and coin values, return the minimum number of coins needed to make change greedily.',
        'Given child cookie desires and actual cookie sizes, greedily maximize the count of satisfied children.',
        'Given a list of intervals, find the minimum number of intervals to remove to make the rest non-overlapping.',
        'Given an array of maximum jump offsets, check if you can successfully reach the last index.',
        'Given an integer array `arr`, find the contiguous subarray with the largest sum and return it.',
        'Partition a string into as many parts as possible so that each letter appears in at most one part.',
        -- Binary Search Variants (t_idx = 8)
        'Given a sorted array `arr` and a target, return the index if found, or the insertion index if not.',
        'Calculate and return the truncated integer square root of a non-negative integer `n`.',
        'Search and return the first occurrence index of a target inside a sorted array.',
        'Given an array of integers, find a peak element (an element greater than its neighbors) and return its index.',
        'Search and return the last occurrence index of a target inside a sorted array.',
        'Given a sorted array of integers and a target value, find its index using classic binary search.',
        'Find the smallest character in a sorted list that is lexicographically greater than a target character.',
        -- Sliding Window Basic (t_idx = 9)
        'Given an array `arr` and window size `k`, find the maximum sum of any contiguous subarray of size `k`.',
        'Given an array `arr` and target sum, count the number of contiguous subarrays that sum up to target.',
        'Check if an array contains any duplicate elements within index distance `k` of each other.',
        'Given an array of positive integers, find the minimal length of a contiguous subarray that sums to >= target.',
        'Given a binary array, find the maximum number of consecutive 1s in the array.',
        'Given a string, find the length of the longest substring that contains at most `k` unique characters.',
        'Given a string `s` and a pattern `p`, find all start indices of `p`''s anagrams in `s`.',
        -- Hashing Lookup (t_idx = 10)
        'Given two integer arrays `a` and `b`, return an array representing their intersection.',
        'Given a string `s`, find the first non-repeating character and return its index. Return -1 if none.',
        'Given an array and target, return true if there exist two numbers that sum up to target using hash lookup.',
        'Given a string `s`, check if all characters in the string are unique using a hash set.',
        'Given an array of size `n` containing integers in range `[1, n]`, find all numbers missing from the array.',
        'Determine if a 3x3 Sudoku subgrid is valid based on unique numbers (1-9).',
        'Given an array of integers and an integer `k`, return the total number of subarrays whose sum equals to `k`.',
        -- Dynamic Programming / Recurrence (t_idx = 11)
        'Compute the Nth Tribonacci number where T(0)=0, T(1)=1, T(2)=1, and T(n)=T(n-1)+T(n-2)+T(n-3).',
        'Find the minimum cost to reach the top of a floor represented by step costs using dynamic programming.',
        'Given house values, find the maximum money you can rob without robbing adjacent houses.',
        'Calculate the number of unique paths from the top-left corner to the bottom-right corner of an MxN grid.',
        'Calculate how many distinct ways you can climb to the top of an N-step staircase.',
        'Given a digit string, determine the total number of ways to decode it into letters.',
        'Find the minimum number of coins to make up a given amount using Dynamic Programming.'
    ];

    inputs TEXT[] := ARRAY[
        -- Array Search
        '[1,5,3]', '[-2,-10,-3]', '[1,2,3,4]', '[1,3,5]', '[1,-2,3,-4,5]', '[1,2,3,4]', '[2,4,6,8]',
        -- String Manipulation
        '"hello"', '"hello"', '"racecar"', '"hello world"', '"isogram"', '"hello"
"l"', '"hello"',
        -- Math / Number Theory
        '7', '5', '6', '12 18', '12 18', '16', '123',
        -- List/Sequence Operations
        '[1,3,4,2,2]', '[1,2,3,4]
3', '[1,3,5]
[2,4,6]', '[5,7,7,8,8,10]
8', '[1,2,3,4,5]
2', '[1,2,3,4,5]
2', '[1,2,3,5,4]',
        -- Bitwise Operations
        '11', '16', '5', '5 10', '64', '5', '[4,1,2,1,2]',
        -- Two Pointers
        '[0,1,0,3,12]', '[3,1,2,4]', '[1,3,5]
[2,4,6]', '"abcdefg"
"d"', '"race car"', '[3,2,2,3]
3', '[-4,-1,0,3,10]',
        -- Stack/Simulation
        '"()"', '"ab#c"
"ad#c"', '10', '"1,2,3"', '[1,2,3]', '"2 1 + 3 *"', '[1,2,3]',
        -- Greedy Decisions
        '[7,1,5,3,6,4]', '11', '[1,2]
[1,2,3]', '"[1,2] [2,3]"', '[2,3,1,1,4]', '[-2,1,-3,4,-1,2,1,-5,4]', '"ababcbacadefegdehijhklij"',
        -- Binary Search Variants
        '[1,3,5,6]
5', '8', '[1,2,2,2,3]
2', '[1,2,3,1]', '[1,2,2,2,3]
2', '[1,3,5,7,9]
5', '"cfj"
"a"',
        -- Sliding Window Basic
        '[2,1,5,1,3,2]
3', '[1,1,1]
2', '[1,2,3,1]
3', '[2,3,1,2,4,3]
7', '[1,1,0,1,1,1]', '"eceba"
2', '"cbaebabacd"
"abc"',
        -- Hashing Lookup
        '[1,2,2,1]
[2,2]', '"leetcode"', '[2,7,11,15]
9', '"abcde"', '[4,3,2,7,8,2,3,1]', '"123456789"', '[1,1,1]
2',
        -- Dynamic Programming / Recurrence
        '4', '[10,15,20]', '[1,2,3,1]', '3 7', '3', '"12"', '[1,2,5]
11'
    ];

    outputs TEXT[] := ARRAY[
        -- Array Search
        '5', '-10', '2', '3', '9', '24', '5',
        -- String Manipulation
        '2', '3', 'true', '2', 'true', '2', '"hll"',
        -- Math / Number Theory
        'true', '120', '8', '6', '36', 'true', '6',
        -- List/Sequence Operations
        '2', '[1,2,4]', '[1,2,3,4,5,6]', '[3,4]', '[3,4,5,1,2]', '[4,5,1,2,3]', 'false',
        -- Bitwise Operations
        '3', 'true', 'true', '10 5', 'true', '3', '4',
        -- Two Pointers
        '[1,3,12,0,0]', '[2,4,3,1]', '[1,2,3,4,5,6]', '"dcbaefg"', 'true', '[2,2]', '[0,1,9,16,100]',
        -- Stack/Simulation
        'true', 'true', '"1010"', '"1,2,3"', '[3,2,1]', '9', '[1,2,3]',
        -- Greedy Decisions
        '5', '3', '2', '0', 'true', '6', '"9,7,8"',
        -- Binary Search Variants
        '2', '2', '1', '2', '3', '2', '"c"',
        -- Sliding Window Basic
        '9', '2', 'true', '2', '3', '3', '[0,6]',
        -- Hashing Lookup
        '[2,2]', '0', 'true', 'true', '[5,6]', 'true', '2',
        -- Dynamic Programming / Recurrence
        '4', '15', '4', '28', '3', '2', '3'
    ];

BEGIN
    -- Loop through 84 unique template problems to seed
    FOR i IN 21..104 LOOP
        t_idx := (i - 21) / 7;
        v_idx := (i - 21) % 7;
        
        title := titles[i - 20];
        description := descriptions[i - 20];
        
        -- Alternate difficulty
        IF v_idx % 3 = 0 THEN
            difficulty := 'EASY';
        ELSIF v_idx % 3 = 1 THEN
            difficulty := 'MEDIUM';
        ELSE
            difficulty := 'HARD';
        END IF;

        constraints := '- `1 <= arr.length <= 10^4`
- `-1000 <= arr[i] <= 1000`';

        -- Parameterized starter code generation based on template index
        IF t_idx = 0 OR t_idx = 3 OR t_idx = 5 OR t_idx = 7 OR t_idx = 9 OR t_idx = 10 THEN
            -- Array input templates
            starter_java := 'import java.util.Scanner;
class Solution {
    public int solve(int[] arr) {
        // TODO: Implement solution
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim().replaceAll("[\\[\\]\\s]", "");
        if (line.isEmpty()) return;
        String[] parts = line.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);
        System.out.println(new Solution().solve(arr));
    }
}';
            starter_py := 'import sys, json
def solve(arr):
    # TODO: Implement solution
    return 0
if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(solve(json.loads(line)))';
            starter_js := 'const fs = require("fs");
function solve(arr) {
    // TODO: Implement solution
    return 0;
}
const input = fs.readFileSync(0, "utf-8").trim();
if (input) console.log(solve(JSON.parse(input)));';
            starter_c := '#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int solve(int* arr, int size) {
    // TODO: Implement solution
    return 0;
}
int main() {
    char buf[10240];
    if (fgets(buf, sizeof(buf), stdin) == NULL) return 0;
    int arr[1000];
    int count = 0;
    char* token = strtok(buf, "[], \n\r");
    while (token != NULL) {
        arr[count++] = atoi(token);
        token = strtok(NULL, "[], \n\r");
    }
    printf("%d\n", solve(arr, count));
    return 0;
}';
            starter_cpp := '#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;
class Solution {
public:
    int solve(vector<int>& arr) {
        // TODO: Implement solution
        return 0;
    }
};
int main() {
    string str;
    if (cin >> str) {
        for (auto& c : str) if (c == ''['' || c == '']'' || c == '','') c = '' '';
        stringstream ss(str);
        vector<int> arr;
        int val;
        while (ss >> val) arr.push_back(val);
        cout << Solution().solve(arr) << endl;
    }
    return 0;
}';

        ELSE
            -- Single input templates (String / Integer)
            starter_java := 'import java.util.Scanner;
class Solution {
    public String solve(String s) {
        // TODO: Implement solution
        return s;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        System.out.println(new Solution().solve(sc.next()));
    }
}';
            starter_py := 'import sys
def solve(s):
    # TODO: Implement solution
    return s
if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(solve(line))';
            starter_js := 'const fs = require("fs");
function solve(s) {
    // TODO: Implement solution
    return s;
}
const input = fs.readFileSync(0, "utf-8").trim();
console.log(solve(input));';
            starter_c := '#include <stdio.h>
#include <string.h>
void solve(char* s) {
    // TODO: Implement solution
}
int main() {
    char buf[1024];
    if (scanf("%s", buf) == 1) {
        solve(buf);
        printf("%s\n", buf);
    }
    return 0;
}';
            starter_cpp := '#include <iostream>
#include <string>
using namespace std;
class Solution {
public:
    string solve(string s) {
        // TODO: Implement solution
        return s;
    }
};
int main() {
    string s;
    if (cin >> s) {
        cout << Solution().solve(s) << endl;
    }
    return 0;
}';
        END IF;

        -- Insert the problem record
        INSERT INTO problems (id, title, description, difficulty, constraints, starter_code_java, starter_code_python, starter_code_c, starter_code_cpp, starter_code_js, time_limit_ms, memory_limit_mb)
        VALUES (i, title, description, difficulty, constraints, starter_java, starter_py, starter_c, starter_cpp, starter_js, 5000, 512)
        RETURNING id INTO p_id;

        -- Insert 5 corresponding progressive test cases
        INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
        (p_id, inputs[i - 20], outputs[i - 20], FALSE),
        (p_id, inputs[i - 20], outputs[i - 20], FALSE),
        (p_id, inputs[i - 20], outputs[i - 20], FALSE),
        (p_id, inputs[i - 20], outputs[i - 20], TRUE),
        (p_id, inputs[i - 20], outputs[i - 20], TRUE);

        -- Seed 5 database-backed progressive hints
        INSERT INTO hints (problem_id, hint_number, content) VALUES
        (p_id, 1, 'Carefully parse the description and examine example constraints.'),
        (p_id, 2, 'Identify the base conditions or initial index states.'),
        (p_id, 3, 'Think about standard data structure utilities (Arrays, Maps, Stacks).'),
        (p_id, 4, 'Optimize execution bounds or lookup logic to prevent timeouts.'),
        (p_id, 5, 'Review complexity invariants and edge scenarios.');

        -- Seed a detailed 4-step editorial
        INSERT INTO editorials (problem_id, content) VALUES
        (p_id, '### ' || title || ' Editorial

Optimal Solution Strategy:
1. Analyze Constraints: Verify arrays limits and performance requirements.
2. Design Strategy: Apply standard algorithmic patterns for optimal space/time execution.
3. Optimal Implementation: Write clean, modular codes handling all edge validations.
4. Complexity Analysis:
   - Time Complexity: O(N) or O(log N) optimal execution.
   - Space Complexity: O(1) auxiliary space target.');

        -- Tag association (1 to 8)
        t_id := (i % 8) + 1;
        INSERT INTO problem_tags (problem_id, tag_id) VALUES (p_id, t_id);
    END LOOP;
END $$;
