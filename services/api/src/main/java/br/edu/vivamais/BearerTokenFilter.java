package br.edu.vivamais;

import java.io.IOException;
import java.util.List;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public final class BearerTokenFilter extends OncePerRequestFilter {
    private final FoundationRepository repository;
    private final TokenCodec tokens;
    public BearerTokenFilter(FoundationRepository repository, TokenCodec tokens) { this.repository=repository; this.tokens=tokens; }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.matches("Bearer [A-Za-z0-9_-]{43}")) {
            repository.principal(tokens.hash(header.substring(7))).ifPresent(principal -> {
                var authentication=new UsernamePasswordAuthenticationToken(principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_"+principal.user().role().name())));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }
        chain.doFilter(request, response);
    }
}
