package com.codearena.repository;

import com.codearena.entity.Editorial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EditorialRepository extends JpaRepository<Editorial, Long> {
    Optional<Editorial> findByProblemId(Long problemId);
}
