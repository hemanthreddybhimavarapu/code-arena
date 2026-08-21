package com.codearena.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
@SuppressWarnings("null")
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String smtpUsername;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationOtp(String to, String username, String otp) {
        String subject = "CodeArena 7.0 - Verify Your Account";
        String content = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #050816; margin: 0; padding: 20px; color: #ffffff; }
                    .card { background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; max-width: 600px; margin: 0 auto; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                    .logo-badge { display: inline-block; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 14px; border-radius: 20px; font-weight: bold; color: #60a5fa; font-size: 13px; margin-bottom: 20px; }
                    .header-title { font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; }
                    .text-body { font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; }
                    .otp-box { text-align: center; margin: 30px 0; background: rgba(250, 204, 21, 0.08); border: 1px solid rgba(250, 204, 21, 0.3); padding: 20px; border-radius: 12px; }
                    .otp-code { font-size: 38px; font-weight: 900; color: #facc15; letter-spacing: 8px; font-family: monospace; }
                    .footer { border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 35px; padding-top: 20px; text-align: center; font-size: 13px; color: #94a3b8; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="logo-badge">⚡ CODEARENA 7.0 ACCOUNT VERIFICATION</div>
                    <h1 class="header-title">Hello, <span style="color: #60a5fa;">%s</span>!</h1>
                    <p class="text-body">
                      Thank you for registering on <strong>CodeArena 7.0</strong>. Use the 6-digit verification code below to authorize and activate your account. This code is valid for 15 minutes.
                    </p>

                    <div class="otp-box">
                      <div style="font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Your One-Time Verification Passcode</div>
                      <span class="otp-code">%s</span>
                    </div>

                    <p class="text-body" style="font-size: 13px; color: #94a3b8;">
                      If you did not request this code, please ignore this email or contact our support team.
                    </p>

                    <div class="footer">
                      <strong>CodeArena 7.0 Platform</strong> &bull; Practice &bull; Compile &bull; Compete &bull; Conquer
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(username, otp);
        sendHtmlEmail(to, subject, content);
    }

    public void sendPasswordResetOtp(String to, String username, String otp) {
        String subject = "CodeArena 7.0 - Password Reset Authorization";
        String content = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #050816; margin: 0; padding: 20px; color: #ffffff; }
                    .card { background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; max-width: 600px; margin: 0 auto; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                    .logo-badge { display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 14px; border-radius: 20px; font-weight: bold; color: #f87171; font-size: 13px; margin-bottom: 20px; }
                    .header-title { font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; }
                    .text-body { font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; }
                    .otp-box { text-align: center; margin: 30px 0; background: rgba(250, 204, 21, 0.08); border: 1px solid rgba(250, 204, 21, 0.3); padding: 20px; border-radius: 12px; }
                    .otp-code { font-size: 38px; font-weight: 900; color: #facc15; letter-spacing: 8px; font-family: monospace; }
                    .footer { border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 35px; padding-top: 20px; text-align: center; font-size: 13px; color: #94a3b8; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="logo-badge">🔑 SECURITY AUTHORIZATION</div>
                    <h1 class="header-title">Hello, <span style="color: #f87171;">%s</span>!</h1>
                    <p class="text-body">
                      We received a request to reset your <strong>CodeArena</strong> account password. Use the security code below to authorize your new password. This code expires in 15 minutes.
                    </p>

                    <div class="otp-box">
                      <div style="font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Password Reset Authorization Code</div>
                      <span class="otp-code">%s</span>
                    </div>

                    <p class="text-body" style="font-size: 13px; color: #94a3b8;">
                      If you did not request a password reset, please secure your account immediately.
                    </p>

                    <div class="footer">
                      <strong>CodeArena 7.0 Platform</strong> &bull; Practice &bull; Compile &bull; Compete &bull; Conquer
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(username, otp);
        sendHtmlEmail(to, subject, content);
    }

    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Welcome to CodeArena 7.0! 🚀 Your Developer Journey Begins";
        String content = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background-color: #050816; margin: 0; padding: 20px; color: #ffffff; }
                    .card { background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 16px; max-width: 600px; margin: 0 auto; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                    .logo-badge { display: inline-block; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 16px; border-radius: 20px; font-weight: bold; color: #60a5fa; font-size: 13px; margin-bottom: 20px; }
                    .header-title { font-size: 28px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px; }
                    .header-accent { color: #facc15; }
                    .text-body { font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; }
                    .feature-grid { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin: 25px 0; }
                    .feature-item { display: flex; align-items: flex-start; margin-bottom: 14px; }
                    .feature-item:last-child { margin-bottom: 0; }
                    .bullet-icon { color: #10b981; font-weight: bold; font-size: 16px; margin-right: 12px; }
                    .btn-primary { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%%, #8b5cf6 100%%); color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35); text-align: center; margin-top: 15px; }
                    .footer { border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 35px; padding-top: 20px; text-align: center; font-size: 13px; color: #94a3b8; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="logo-badge">⚡ CODEARENA 7.0 SAAS ENGINE</div>
                    <h1 class="header-title">Welcome to <span class="header-accent">CodeArena</span>, %s! 👋</h1>
                    <p class="text-body">
                      We are thrilled to welcome you to <strong>CodeArena 7.0</strong>—the ultimate competitive coding engine and developer evaluation platform. Your account is verified and ready.
                    </p>
                    
                    <div class="feature-grid">
                      <div class="feature-item">
                        <span class="bullet-icon">✓</span>
                        <div style="font-size: 14px; color: #e2e8f0;"><strong>Sandboxed Multi-Lang Compiler:</strong> Execute solutions in Java 17, Python 3.11, C++, C, & Node.js.</div>
                      </div>
                      <div class="feature-item">
                        <span class="bullet-icon">✓</span>
                        <div style="font-size: 14px; color: #e2e8f0;"><strong>Real-Time Leaderboards & Streaks:</strong> Solve tasks daily, unlock achievement badges, and track metrics.</div>
                      </div>
                      <div class="feature-item">
                        <span class="bullet-icon">✓</span>
                        <div style="font-size: 14px; color: #e2e8f0;"><strong>Global Developer Community:</strong> Benchmark execution runtimes & memory efficiency against developers worldwide.</div>
                      </div>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="http://localhost:5173/problems" class="btn-primary">Start Solving Problems Now &rarr;</a>
                    </div>

                    <p class="text-body" style="font-size: 14px; margin-bottom: 0;">
                      Happy Coding!<br>
                      <strong style="color: #ffffff;">The CodeArena Engineering Team</strong>
                    </p>

                    <div class="footer">
                      <strong>CodeArena 7.0 SaaS Engine</strong> &bull; Practice &bull; Compile &bull; Compete &bull; Conquer<br>
                      <span style="font-size: 11px; color: #64748b;">Automated account message sent to %s</span>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(firstName, to);
        sendHtmlEmail(to, subject, content);
    }

    public void sendContactEmail(String senderName, String senderEmail, String userSubject, String userMessage) {
        String adminEmail = (smtpUsername != null && !smtpUsername.isBlank()) ? smtpUsername : "codearena7.0@gmail.com";
        String emailSubject = "[CodeArena Support] " + userSubject;
        String content = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #050816; margin: 0; padding: 20px; color: #ffffff; }
                    .card { background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 16px; max-width: 600px; margin: 0 auto; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                    .badge { display: inline-block; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 14px; border-radius: 20px; font-weight: bold; color: #60a5fa; font-size: 13px; margin-bottom: 20px; }
                    .header-title { font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; }
                    .meta-box { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 14px; color: #cbd5e1; }
                    .message-box { background: rgba(15, 23, 42, 0.6); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; font-size: 15px; line-height: 1.7; color: #f8fafc; margin: 20px 0; white-space: pre-wrap; }
                    .footer { border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 35px; padding-top: 20px; text-align: center; font-size: 13px; color: #94a3b8; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="badge">📩 NEW SUPPORT INQUIRY</div>
                    <h1 class="header-title">Message from %s</h1>
                    
                    <div class="meta-box">
                      <div style="margin-bottom: 6px;"><strong>Sender Name:</strong> %s</div>
                      <div style="margin-bottom: 6px;"><strong>Sender Email:</strong> <a href="mailto:%s" style="color: #60a5fa;">%s</a></div>
                      <div><strong>Subject:</strong> %s</div>
                    </div>

                    <div class="message-box">%s</div>

                    <p style="font-size: 13px; color: #94a3b8;">
                      💡 You can reply directly to this email to respond to <strong>%s</strong> (%s).
                    </p>

                    <div class="footer">
                      <strong>CodeArena 7.0 Support Portal</strong> &bull; Practice &bull; Compile &bull; Compete &bull; Conquer
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(senderName, senderName, senderEmail, senderEmail, userSubject, userMessage, senderName, senderEmail);
        
        sendHtmlEmailWithReplyTo(adminEmail, emailSubject, content, senderEmail, senderName);
    }

    private void sendHtmlEmailWithReplyTo(String to, String subject, String htmlContent, String replyToEmail, String replyToName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            if (replyToEmail != null && !replyToEmail.isBlank()) {
                if (replyToName != null && !replyToName.isBlank()) {
                    helper.setReplyTo(replyToEmail, replyToName);
                } else {
                    helper.setReplyTo(replyToEmail);
                }
            }
            
            String from = (smtpUsername != null && !smtpUsername.isBlank()) ? smtpUsername : "codearena7.0@gmail.com";
            try {
                helper.setFrom(from, "CodeArena Support");
            } catch (Exception ignored) {
                helper.setFrom(from);
            }

            mailSender.send(message);
            System.out.println(">>> SUCCESS: Support Email sent to " + to + " (Reply-To: " + replyToEmail + ")");
        } catch (Exception e) {
            System.err.println("❌ FAILED to send support email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        sendHtmlEmailWithReplyTo(to, subject, htmlContent, null, null);
    }
}
