package com.codearena.controller;

import com.codearena.dto.ApiResponse;
import com.codearena.dto.ContactRequest;
import com.codearena.entity.ContactMessage;
import com.codearena.repository.ContactMessageRepository;
import com.codearena.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final EmailService emailService;
    private final ContactMessageRepository contactMessageRepository;

    public ContactController(EmailService emailService, ContactMessageRepository contactMessageRepository) {
        this.emailService = emailService;
        this.contactMessageRepository = contactMessageRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitContactForm(@Valid @RequestBody ContactRequest request) {
        // Save to database for admin panel viewing
        ContactMessage contactMessage = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .status("PENDING")
                .build();
        contactMessageRepository.save(contactMessage);

        // Send email to support/admin email
        emailService.sendContactEmail(
            request.getName(),
            request.getEmail(),
            request.getSubject(),
            request.getMessage()
        );

        return ResponseEntity.ok(ApiResponse.success("Thank you for reaching out! Your message has been sent to our support team.", null));
    }
}
