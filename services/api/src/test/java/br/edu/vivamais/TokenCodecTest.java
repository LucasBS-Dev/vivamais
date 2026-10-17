package br.edu.vivamais;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class TokenCodecTest {
    @Test void issuesDistinct256BitTokensAndStoresOnlyStableDigest() {
        TokenCodec codec=new TokenCodec();
        String first=codec.issue(), second=codec.issue();
        assertThat(first).matches("[A-Za-z0-9_-]{43}").isNotEqualTo(second);
        assertThat(java.util.Base64.getUrlDecoder().decode(first)).hasSize(32);
        assertThat(codec.hash(first)).hasSize(64).isEqualTo(codec.hash(first)).isNotEqualTo(first).isNotEqualTo(codec.hash(second));
    }
}
