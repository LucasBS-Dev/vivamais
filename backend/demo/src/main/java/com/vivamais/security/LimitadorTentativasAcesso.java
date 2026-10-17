package com.vivamais.security;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Single-instance demo limiter; use shared atomic storage before horizontal scaling. */
@Component
public final class LimitadorTentativasAcesso {
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_KEYS = 8192;
    private final Map<String, Counter> counters = new HashMap<>();
    private final Clock clock;
    private final CodificadorToken codificadorTokens;
    @org.springframework.beans.factory.annotation.Autowired
    public LimitadorTentativasAcesso(CodificadorToken codificadorTokens) { this(codificadorTokens, Clock.systemUTC()); }
    LimitadorTentativasAcesso(CodificadorToken codificadorTokens, Clock clock) { this.codificadorTokens = codificadorTokens; this.clock = clock; }
    public synchronized boolean allow(String remoteAddress, String email) {
        Instant agora = clock.instant();
        counters.entrySet().removeIf(entry -> !entry.getValue().until().isAfter(agora));
        String addressKey = "ip:" + codificadorTokens.hash(remoteAddress);
        String emailKey = "email:" + codificadorTokens.hash(email.trim().toLowerCase(Locale.ROOT));
        int newKeys = (counters.containsKey(addressKey) ? 0 : 1) + (counters.containsKey(emailKey) ? 0 : 1);
        if (counters.size() + newKeys > MAX_KEYS || exhausted(addressKey, 40) || exhausted(emailKey, 10)) return false;
        increment(addressKey, agora); increment(emailKey, agora);
        return true;
    }
    private boolean exhausted(String key, int maximum) {
        Counter value = counters.get(key); return value != null && value.count() >= maximum;
    }
    private void increment(String key, Instant agora) {
        Counter current = counters.get(key);
        counters.put(key, current == null ? new Counter(1, agora.plus(WINDOW)) : new Counter(current.count()+1, current.until()));
    }
    private record Counter(int count, Instant until) { }
}
