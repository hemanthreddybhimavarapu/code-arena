package com.codearena.service;

import com.codearena.dto.DiscussionCreateRequest;
import com.codearena.dto.DiscussionDto;
import com.codearena.entity.Discussion;
import com.codearena.entity.Problem;
import com.codearena.entity.User;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.DiscussionRepository;
import com.codearena.repository.ProblemRepository;
import com.codearena.repository.UserRepository;
import com.codearena.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    public DiscussionService(DiscussionRepository discussionRepository,
                             ProblemRepository problemRepository,
                             UserRepository userRepository) {
        this.discussionRepository = discussionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DiscussionDto> getDiscussions(Long problemId) {
        List<Discussion> list = discussionRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        return list.stream().map(d -> DiscussionDto.builder()
                .id(d.getId())
                .problemId(d.getProblem().getId())
                .userId(d.getUser().getId())
                .username(d.getUser().getUsername())
                .userAvatar(d.getUser().getAvatar())
                .content(d.getContent())
                .parentId(d.getParentId())
                .createdAt(d.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public DiscussionDto createDiscussion(Long problemId, DiscussionCreateRequest request, UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Discussion discussion = Discussion.builder()
                .problem(problem)
                .user(user)
                .content(request.getContent())
                .parentId(request.getParentId())
                .createdAt(LocalDateTime.now())
                .build();

        discussion = discussionRepository.save(discussion);

        return DiscussionDto.builder()
                .id(discussion.getId())
                .problemId(problem.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .userAvatar(user.getAvatar())
                .content(discussion.getContent())
                .parentId(discussion.getParentId())
                .createdAt(discussion.getCreatedAt())
                .build();
    }
}
