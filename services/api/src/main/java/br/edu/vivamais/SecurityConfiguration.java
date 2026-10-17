package br.edu.vivamais;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.ProblemDetail;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, FoundationRepository repository, TokenCodec tokens,
                                            ObjectMapper mapper, @org.springframework.beans.factory.annotation.Qualifier("corsConfigurationSource") CorsConfigurationSource cors) throws Exception {
        return http.cors(config -> config.configurationSource(cors))
                // Bearer credential only: browsers cannot authenticate through automatically attached cookies.
                .csrf(config -> config.disable())
                .sessionManagement(config -> config.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(config -> config.disable())
                .httpBasic(config -> config.disable()).formLogin(config -> config.disable()).logout(config -> config.disable())
                .authorizeHttpRequests(config -> config
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/activate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/files/*/content").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/health/liveness", "/actuator/health/readiness").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(config -> config
                        .authenticationEntryPoint((request, response, exception) -> writeProblem(response,mapper,401,"Não autenticado","Informe uma sessão válida."))
                        .accessDeniedHandler((request, response, exception) -> writeProblem(response,mapper,403,"Acesso negado","Você não possui permissão para este recurso.")))
                .headers(config -> config.contentSecurityPolicy(policy -> policy.policyDirectives("default-src 'none'; frame-ancestors 'none'")))
                .addFilterBefore(new BearerTokenFilter(repository,tokens), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new RequestBodyLimitFilter(mapper), BearerTokenFilter.class)
                .build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties properties) {
        CorsConfiguration config=new CorsConfiguration();
        config.setAllowedOrigins(properties.corsOrigins());
        config.setAllowedMethods(List.of("GET","POST","PUT","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type"));
        config.setAllowCredentials(false); config.setMaxAge(600L);
        UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**",config);
        return source;
    }
    private static void writeProblem(HttpServletResponse response, ObjectMapper mapper,int status,String title,String detail) throws IOException {
        ProblemDetail problem=ProblemDetail.forStatus(status); problem.setTitle(title); problem.setDetail(detail);
        response.setStatus(status); response.setContentType("application/problem+json"); mapper.writeValue(response.getOutputStream(),problem);
    }
}
