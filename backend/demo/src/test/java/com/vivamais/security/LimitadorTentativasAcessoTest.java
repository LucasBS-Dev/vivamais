package com.vivamais.security;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class LimitadorTentativasAcessoTest {
    @Test void limitsNormalizedAccountsEvenFromDifferentAddresses() {
        var limiter=new LimitadorTentativasAcesso(new CodificadorToken());
        for(int i=0;i<10;i++) assertThat(limiter.allow("ip-"+i," DEMO@example.invalid ")).isTrue();
        assertThat(limiter.allow("new-ip","demo@example.invalid")).isFalse();
    }
    @Test void limitsAddressEvenWithDifferentAccounts() {
        var limiter=new LimitadorTentativasAcesso(new CodificadorToken());
        for(int i=0;i<40;i++) assertThat(limiter.allow("same-ip","demo"+i+"@example.invalid")).isTrue();
        assertThat(limiter.allow("same-ip","new@example.invalid")).isFalse();
    }
    @Test void releasesExpiredWindows() {
        var clock=new MutableClock(); var limiter=new LimitadorTentativasAcesso(new CodificadorToken(),clock);
        for(int i=0;i<10;i++) limiter.allow("ip","demo@example.invalid");
        assertThat(limiter.allow("ip","demo@example.invalid")).isFalse();
        clock.agora=clock.agora.plusSeconds(901);
        assertThat(limiter.allow("ip","demo@example.invalid")).isTrue();
    }
    @Test void refusesNewKeysWhenMemoryBoundIsReached() {
        var limiter=new LimitadorTentativasAcesso(new CodificadorToken());
        for(int i=0;i<4096;i++) assertThat(limiter.allow("ip-"+i,"user"+i+"@example.invalid")).isTrue();
        assertThat(limiter.allow("new-ip","new@example.invalid")).isFalse();
    }
    private static class MutableClock extends Clock {
        Instant agora=Instant.parse("2026-10-16T12:00:00Z");
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return agora; }
    }
}
