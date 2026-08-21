package com.codearena.repository;

import com.codearena.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findTopByEmailAndCodeOrderByExpiresAtDesc(String email, String code);
    Optional<Otp> findTopByEmailAndVerifiedTrueOrderByExpiresAtDesc(String email);
    void deleteByEmail(String email);
}
