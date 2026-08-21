package com.codearena.controller;

import com.codearena.dto.ApiResponse;
import com.codearena.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<String>> chat(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        String problemId = body.get("problemId");
        String code = body.get("code");
        String language = body.get("language");
        
        String response = aiChatService.generateResponse(
            message != null ? message : "", 
            problemId != null ? problemId : "", 
            code != null ? code : "", 
            language != null ? language : ""
        );
        
        return ResponseEntity.ok(ApiResponse.success("AI response generated.", response));
    }
}
