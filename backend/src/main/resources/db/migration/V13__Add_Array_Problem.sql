-- Problem 20: Two Sum (EASY) - Arrays
INSERT INTO problems (id, title, description, difficulty, constraints, starter_code_java, starter_code_python, starter_code_c, starter_code_cpp, starter_code_js, time_limit_ms, memory_limit_mb)
VALUES (20, 'Two Sum', 
'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.',
'EASY',
'- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists.',
'import java.util.Scanner;
import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        if (line.startsWith("[") && line.endsWith("]")) {
            line = line.substring(1, line.length() - 1);
        }
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        int[] ans = new Solution().twoSum(nums, target);
        System.out.println("[" + ans[0] + "," + ans[1] + "]");
    }
}',
'import sys
import json

def twoSum(nums, target):
    dct = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in dct:
            return [dct[comp], i]
        dct[num] = i
    return []

if __name__ == "__main__":
    lines = sys.stdin.read().split()
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        print(json.dumps(twoSum(nums, target)).replace(" ", ""))',
'#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                res[0] = i;
                res[1] = j;
                return res;
            }
        }
    }
    return res;
}

int main() {
    char buf[1024];
    if (fgets(buf, sizeof(buf), stdin) == NULL) return 0;
    int target;
    if (scanf("%d", &target) != 1) return 0;
    
    int nums[500];
    int count = 0;
    char* token = strtok(buf, "[], \n\r");
    while (token != NULL) {
        nums[count++] = atoi(token);
        token = strtok(NULL, "[], \n\r");
    }
    
    int retSize;
    int* ans = twoSum(nums, count, target, &retSize);
    printf("[%d,%d]\n", ans[0], ans[1]);
    free(ans);
    return 0;
}',
'#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> m;
        for (int i = 0; i < nums.size(); ++i) {
            int comp = target - nums[i];
            if (m.count(comp)) {
                return {m[comp], i};
            }
            m[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    string str;
    if (cin >> str) {
        int target;
        if (cin >> target) {
            vector<int> nums;
            for (auto& c : str) {
                if (c == ''['' || c == '']'' || c == '','') c = '' '';
            }
            stringstream ss(str);
            int val;
            while (ss >> val) {
                nums.push_back(val);
            }
            vector<int> ans = Solution().twoSum(nums, target);
            cout << "[" << ans[0] << "," << ans[1] << "]" << endl;
        }
    }
    return 0;
}',
'const fs = require(''fs'');

function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) {
            return [map.get(comp), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

const input = fs.readFileSync(0, ''utf-8'').trim().split(/\s+/);
if (input.length >= 2) {
    const nums = JSON.parse(input[0]);
    const target = parseInt(input[1]);
    console.log(JSON.stringify(twoSum(nums, target)));
}', 5000, 512);

INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
(20, '[2,7,11,15]
9', '[0,1]', FALSE),
(20, '[3,2,4]
6', '[1,2]', FALSE),
(20, '[3,3]
6', '[0,1]', FALSE),
(20, '[1,5,8]
13', '[1,2]', TRUE),
(20, '[4,5,6]
10', '[0,2]', TRUE);

INSERT INTO hints (problem_id, hint_number, content) VALUES
(20, 1, 'A really brute force way would be to search for all possible pairs. That would be O(N^2) time complexity. Can we do better?'),
(20, 2, 'For each element, we want to find if target - element exists in the array.'),
(20, 3, 'Can we use a hash map to look up the complement in O(1) time?'),
(20, 4, 'Iterate through the array and store the value and index in the hash map.'),
(20, 5, 'If the complement is already in the map, we found our indices.');

INSERT INTO editorials (problem_id, content) VALUES
(20, '### Two Sum Editorial

#### Optimal Strategy:
1. **Analyze Constraints**: The array size is up to 10^4. An O(N) time complexity is optimal, using a hash map lookup.
2. **Design**: Store each number and its index in a hash map. For each element, look up target - element.
3. **Optimal Implementation**: Perform a single pass check: check if map has complement, if so return indices, else put number in map.
4. **Complexity Analysis**:
   - **Time Complexity**: O(N) single pass.
   - **Space Complexity**: O(N) for hash map.');

INSERT INTO tags (name) VALUES ('Arrays') ON CONFLICT DO NOTHING;
INSERT INTO problem_tags (problem_id, tag_id)
SELECT 20, id FROM tags WHERE name = 'Arrays';
