package com.codearena.repository;

import com.codearena.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationOtp(String otp);
    Optional<User> findByResetPasswordOtp(String otp);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
