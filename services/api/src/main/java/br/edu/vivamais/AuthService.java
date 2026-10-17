package br.edu.vivamais;

import static br.edu.vivamais.ApiModels.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final FoundationRepository repository;
    private final PasswordEncoder encoder;
    private final TokenCodec tokens;
    private final AppProperties properties;
    private final String dummyHash;
    public AuthService(FoundationRepository repository, PasswordEncoder encoder, TokenCodec tokens, AppProperties properties) {
        this.repository=repository; this.encoder=encoder; this.tokens=tokens; this.properties=properties;
        dummyHash=encoder.encode(tokens.issue());
    }
    @Transactional
    public LoginResponse login(LoginRequest request) {
        var credentials = repository.credentials(request.email().trim().toLowerCase(Locale.ROOT));
        String hash = credentials.map(FoundationRepository.Credentials::passwordHash).orElse(dummyHash);
        boolean matches = request.password().getBytes(StandardCharsets.UTF_8).length <= 72 && encoder.matches(request.password(), hash);
        if (!matches || credentials.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas.");
        var user = credentials.orElseThrow().user();
        String token = tokens.issue();
        Instant now=Instant.now(), expiresAt=now.plus(properties.sessionDuration());
        var sessionId=repository.insertSession(user.id(), tokens.hash(token), now, expiresAt);
        repository.audit(user, "SESSION_CREATED", "auth_session", sessionId);
        return new LoginResponse(token, expiresAt, user);
    }
    @Transactional
    public void logout(SessionPrincipal principal) {
        repository.revokeSession(principal.sessionId());
        repository.audit(principal.user(), "SESSION_REVOKED", "auth_session", principal.sessionId());
    }
}
