package com.codearena.repository;

import com.codearena.entity.Hint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HintRepository extends JpaRepository<Hint, Long> {
    List<Hint> findByProblemIdOrderByHintNumberAsc(Long problemId);
}
