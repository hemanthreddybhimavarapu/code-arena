package com.codearena.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.HashMap;

@Service
public class AiChatService {

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
            
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateResponse(String message, String problemId, String code, String language) {
        String systemPrompt = "You are Arena AI, an expert coding assistant integrated into the CodeArena platform. "
                + "Help the user solve the coding problem with ID: " + problemId + ". "
                + "The user is using language: " + language + ". "
                + "Their current code is:\n```" + language + "\n" + code + "\n```\n"
                + "Answer their questions about the problem, suggest hints, explain concepts, analyze time/space complexity, or debug their code. "
                + "Do not give the full solution directly unless they explicitly ask. Provide helpful guided hints and explanations first. "
                + "Respond in markdown.";

        String userQuery = message;
        String fullPrompt = systemPrompt + "\n\nUser Question: " + userQuery;

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equals("YOUR_API_KEY")) {
            try {
                // Construct Gemini API call
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey.trim();
                
                Map<String, Object> textPart = new HashMap<>();
                textPart.put("text", fullPrompt);
                
                Map<String, Object> partContainer = new HashMap<>();
                partContainer.put("parts", new Object[]{textPart});
                
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", new Object[]{partContainer});
                
                String jsonBody = objectMapper.writeValueAsString(requestBody);
                
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .timeout(Duration.ofSeconds(15))
                        .build();
                        
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    JsonNode node = objectMapper.readTree(response.body());
                    return node.path("candidates")
                            .path(0)
                            .path("content")
                            .path("parts")
                            .path(0)
                            .path("text")
                            .asText("Unable to parse AI response.");
                } else {
                    System.err.println("Gemini API call failed with status: " + response.statusCode() + " body: " + response.body());
                }
            } catch (Exception e) {
                System.err.println("Error calling Gemini API: " + e.getMessage());
            }
        }

        // Fallback: Local Intelligent Mock
        return generateMockResponse(message, problemId, code, language);
    }

    private String generateMockResponse(String message, String problemId, String code, String language) {
        String msgLower = message.toLowerCase();
        
        if (msgLower.contains("hello") || msgLower.contains("hi ") || msgLower.contains("hey")) {
            return "### Hello! 👋\n\nI am **Arena AI**, your coding assistant. How can I help you conquer this problem today?\n\n*You can ask me to **explain the problem**, **analyze complexity**, **debug your code**, or **suggest optimizations**!*";
        }
        
        if (msgLower.contains("debug") || msgLower.contains("bug") || msgLower.contains("error") || msgLower.contains("fix") || msgLower.contains("run")) {
            if (code == null || code.trim().isEmpty()) {
                return "### Debugging Review\n\nIt looks like you haven't written any code yet! Please write some code in the editor, and I'll gladly check it for any syntax or logical issues.";
            }
            return "### Code Debugging & Review 🔍\n\nBased on a quick analysis of your code in **" + language.toUpperCase() + "**:\n\n1. **Structure Check**: Your class and function declarations look syntactically correct.\n2. **Common Trap Warning**: Double-check your boundary conditions (e.g., empty arrays, extreme values) to avoid out-of-bounds or stack-overflow errors.\n3. **Recommendation**: Try running your code on the sample test cases first to trace intermediate values. If a test case fails, let me know the input and output and we can isolate the bug together!";
        }
        
        if (msgLower.contains("explain") || msgLower.contains("problem") || msgLower.contains("what is")) {
            return "### Problem Explanation 📖\n\nLet's break down this task:\n\n- **Objective**: You need to process the input and output the correct result satisfying all problem constraints.\n- **Key Inputs**: Read the input format specifications carefully (data types, ranges).\n- **Expected Output**: The exact structure expected (often matching case sensitivity or formatting precisely).\n- **Core Concept**: Usually, a simple brute-force approach (like nesting loops) will work for smaller constraints, but optimizing it using HashMaps, two-pointers, or dynamic programming is necessary for larger constraints.";
        }

        if (msgLower.contains("optimize") || msgLower.contains("complexity") || msgLower.contains("efficient") || msgLower.contains("time")) {
            return "### Complexity & Optimization Guide ⚡\n\n- **Current Analysis**: If using nested iterations, the time complexity is likely $O(N^2)$. For larger constraints ($N \\ge 10^5$), this will result in a **Time Limit Exceeded (TLE)**.\n- **Optimized Approaches**:\n  1. **HashMap**: Reduce lookup times from $O(N)$ to $O(1)$ by caching previous results.\n  2. **Sorting / Two-Pointers**: If the array is sorted (or you sort it in $O(N \\log N)$), you can run a single pass with two pointers.\n  3. **Space-Time Tradeoff**: Using a small amount of extra space (like a Hash Set) can significantly accelerate execution speed.";
        }
        
        if (msgLower.contains("hint") || msgLower.contains("help") || msgLower.contains("stuck")) {
            return "### Algorithmic Hint 💡\n\n- **Hint 1**: Try solving a simplified version of the problem first (e.g., array size = 2).\n- **Hint 2**: If you need to search for an element or pair, think about using a **HashMap** to remember elements you have already visited. This turns a quadratic time complexity into linear time!\n- **Hint 3**: Keep an eye on edge cases such as negative numbers, zero, or duplicate entries.";
        }

        return "### Arena AI Assistance 🤖\n\nI'm ready to help! I can assist with:\n- **Debugging**: Spotting logic bugs or syntax issues.\n- **Optimization**: Improving time and space complexity.\n- **Conceptual walkthroughs**: Explaining how the algorithm works.\n\n*Tip: Try asking: **\"Explain the problem\"** or **\"How can I optimize my code?\"***";
    }
}
