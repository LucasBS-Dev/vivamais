package br.edu.vivamais;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Single-instance demo limiter; use shared atomic storage before horizontal scaling. */
@Component
public final class LoginRateLimiter {
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_KEYS = 8192;
    private final Map<String, Counter> counters = new HashMap<>();
    private final Clock clock;
    private final TokenCodec tokens;
    @org.springframework.beans.factory.annotation.Autowired
    public LoginRateLimiter(TokenCodec tokens) { this(tokens, Clock.systemUTC()); }
    LoginRateLimiter(TokenCodec tokens, Clock clock) { this.tokens = tokens; this.clock = clock; }
    public synchronized boolean allow(String remoteAddress, String email) {
        Instant now = clock.instant();
        counters.entrySet().removeIf(entry -> !entry.getValue().until().isAfter(now));
        String addressKey = "ip:" + tokens.hash(remoteAddress);
        String emailKey = "email:" + tokens.hash(email.trim().toLowerCase(Locale.ROOT));
        int newKeys = (counters.containsKey(addressKey) ? 0 : 1) + (counters.containsKey(emailKey) ? 0 : 1);
        if (counters.size() + newKeys > MAX_KEYS || exhausted(addressKey, 40) || exhausted(emailKey, 10)) return false;
        increment(addressKey, now); increment(emailKey, now);
        return true;
    }
    private boolean exhausted(String key, int maximum) {
        Counter value = counters.get(key); return value != null && value.count() >= maximum;
    }
    private void increment(String key, Instant now) {
        Counter current = counters.get(key);
        counters.put(key, current == null ? new Counter(1, now.plus(WINDOW)) : new Counter(current.count()+1, current.until()));
    }
    private record Counter(int count, Instant until) { }
}
