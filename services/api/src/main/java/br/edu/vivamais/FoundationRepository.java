package br.edu.vivamais;

import static br.edu.vivamais.ApiModels.*;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class FoundationRepository {
    private final JdbcTemplate jdbc;
    public FoundationRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    private static UserView user(ResultSet rs) throws SQLException {
        return new UserView(rs.getObject("id", UUID.class), rs.getString("email"), rs.getString("display_name"),
                Role.valueOf(rs.getString("role")), rs.getObject("organization_id", UUID.class));
    }
    private static PatientView patient(ResultSet rs) throws SQLException {
        return new PatientView(rs.getObject("id", UUID.class), rs.getString("display_name"),
                rs.getString("modality"), rs.getObject("organization_id", UUID.class));
    }
    public record Credentials(UserView user, String passwordHash) { }
    public Optional<Credentials> credentials(String email) {
        return jdbc.query("SELECT * FROM user_account WHERE email=? AND enabled=true",
                (rs, row) -> new Credentials(user(rs), rs.getString("password_hash")), email).stream().findFirst();
    }
    public Optional<SessionPrincipal> principal(String hash) {
        return jdbc.query("""
                SELECT u.*, s.id AS session_id FROM auth_session s JOIN user_account u ON u.id=s.user_account_id
                WHERE s.token_hash=? AND s.expires_at > now() AND s.revoked_at IS NULL AND u.enabled=true
                """, (rs, row) -> new SessionPrincipal(user(rs), rs.getObject("session_id", UUID.class)), hash)
                .stream().findFirst();
    }
    public UUID insertSession(UUID accountId, String hash, Instant now, Instant expiresAt) {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO auth_session(id,user_account_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)",
                id, accountId, hash, java.sql.Timestamp.from(now), java.sql.Timestamp.from(expiresAt));
        return id;
    }
    public void revokeSession(UUID id) { jdbc.update("UPDATE auth_session SET revoked_at=now() WHERE id=? AND revoked_at IS NULL", id); }
    public void audit(UserView actor, String action, String resourceType, UUID resourceId) {
        jdbc.update("INSERT INTO audit_event(id,organization_id,actor_id,action,resource_type,resource_id) VALUES(?,?,?,?,?,?)",
                UUID.randomUUID(), actor.organizationId(), actor.id(), action, resourceType, resourceId);
    }
    public OrganizationView organization(UUID id) {
        return jdbc.queryForObject("SELECT id,name FROM organization WHERE id=?",
                (rs, row) -> new OrganizationView(rs.getObject("id", UUID.class), rs.getString("name")), id);
    }
    public List<PatientView> authorizedPatients(UserView actor) {
        return jdbc.query("""
                SELECT p.* FROM patient p WHERE p.organization_id=? AND
                (?='ADMIN' OR EXISTS(SELECT 1 FROM patient_professional_assignment a
                    WHERE a.patient_id=p.id AND a.professional_id=? AND a.organization_id=p.organization_id))
                ORDER BY p.display_name, p.id
                """, (rs, row) -> patient(rs), actor.organizationId(), actor.role().name(), actor.id());
    }
    public Optional<PatientView> authorizedPatient(UUID patientId, UserView actor) {
        return jdbc.query("""
                SELECT p.* FROM patient p WHERE p.id=? AND p.organization_id=? AND
                (?='ADMIN' OR (?='PATIENT' AND p.user_account_id=?) OR
                (?='PROFESSIONAL' AND EXISTS(SELECT 1 FROM patient_professional_assignment a
                    WHERE a.patient_id=p.id AND a.professional_id=? AND a.organization_id=p.organization_id)))
                """, (rs, row) -> patient(rs), patientId, actor.organizationId(), actor.role().name(),
                actor.role().name(), actor.id(), actor.role().name(), actor.id()).stream().findFirst();
    }
    public Optional<PatientView> ownPatient(UserView actor) {
        return jdbc.query("SELECT * FROM patient WHERE user_account_id=? AND organization_id=?",
                (rs, row) -> patient(rs), actor.id(), actor.organizationId()).stream().findFirst();
    }
}
