package com.codearena.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboard_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "solved_count")
    @Builder.Default
    private Integer solvedCount = 0;

    @Column
    @Builder.Default
    private Integer score = 0;

    @Column(name = "acceptance_rate")
    @Builder.Default
    private Double acceptanceRate = 0.0;

    @Column(name = "total_execution_time")
    @Builder.Default
    private Long totalExecutionTime = 0L;

    @Column(name = "last_updated")
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}
