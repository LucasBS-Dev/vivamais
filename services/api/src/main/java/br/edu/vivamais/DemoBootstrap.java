package br.edu.vivamais;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Explicit opt-in, synthetic fixtures only. Does not overwrite existing credentials. */
@Component
@Profile("bootstrap")
public class DemoBootstrap implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final AppProperties properties;
    public DemoBootstrap(JdbcTemplate jdbc, PasswordEncoder encoder, AppProperties properties) {
        this.jdbc=jdbc; this.encoder=encoder; this.properties=properties;
    }
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String password=properties.bootstrapPassword();
        if (!properties.demoOnly() || password==null || password.length()<12 || password.getBytes(StandardCharsets.UTF_8).length>72) {
            throw new IllegalStateException("Bootstrap exige demoOnly=true e DEMO_BOOTSTRAP_PASSWORD entre 12 caracteres e 72 bytes.");
        }
        seed("a","Clínica Escola Aurora — DEMO");
        seed("b","Clínica Escola Horizonte — DEMO");
    }
    private void seed(String code,String name) {
        UUID organization=id("organization-"+code);
        jdbc.update("INSERT INTO organization(id,name) VALUES(?,?) ON CONFLICT(id) DO NOTHING",organization,name);
        UUID admin=account(code,"admin","Administração "+code.toUpperCase()+" — DEMO","ADMIN",organization);
        UUID professional=account(code,"profissional","Profissional "+code.toUpperCase()+" — DEMO","PROFESSIONAL",organization);
        UUID account=account(code,"paciente","Paciente App "+code.toUpperCase()+" — DEMO","PATIENT",organization);
        jdbc.update("INSERT INTO professional(id,organization_id) VALUES(?,?) ON CONFLICT(id) DO NOTHING",professional,organization);
        UUID patient=id("patient-app-"+code), diary=id("patient-diary-"+code);
        jdbc.update("INSERT INTO patient(id,organization_id,user_account_id,display_name,modality) VALUES(?,?,?,?,'APP') ON CONFLICT(id) DO NOTHING",
                patient,organization,account,"Paciente App "+code.toUpperCase()+" — DEMO");
        jdbc.update("INSERT INTO patient(id,organization_id,display_name,modality) VALUES(?,?,?,'BRACELET_DIARY') ON CONFLICT(id) DO NOTHING",
                diary,organization,"Paciente Diário "+code.toUpperCase()+" — DEMO");
        for(UUID patientId:new UUID[]{patient,diary}) {
            jdbc.update("INSERT INTO patient_professional_assignment(patient_id,professional_id,organization_id) VALUES(?,?,?) ON CONFLICT DO NOTHING",patientId,professional,organization);
        }
        // Audit seed once, without recording password or identifying health data.
        UUID auditId=id("bootstrap-audit-"+code);
        jdbc.update("INSERT INTO audit_event(id,organization_id,actor_id,action,resource_type,resource_id) VALUES(?,?,?,'DEMO_BOOTSTRAPPED','organization',?) ON CONFLICT(id) DO NOTHING",
                auditId,organization,admin,organization);
    }
    private UUID account(String code,String prefix,String name,String role,UUID organization) {
        UUID account=id(prefix+"-"+code);
        jdbc.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
                account,organization,prefix+"."+code+"@demo.vivamais.invalid",name,encoder.encode(properties.bootstrapPassword()),role);
        return account;
    }
    static UUID id(String value) { return UUID.nameUUIDFromBytes(("viva-mais-demo:"+value).getBytes(StandardCharsets.UTF_8)); }
}
