package com.vivamais.security;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class CodificadorTokenTest {
    @Test void issuesDistinct256BitTokensAndStoresOnlyStableDigest() {
        CodificadorToken codec=new CodificadorToken();
        String first=codec.issue(), second=codec.issue();
        assertThat(first).matches("[A-Za-z0-9_-]{43}").isNotEqualTo(second);
        assertThat(java.util.Base64.getUrlDecoder().decode(first)).hasSize(32);
        assertThat(codec.hash(first)).hasSize(64).isEqualTo(codec.hash(first)).isNotEqualTo(first).isNotEqualTo(codec.hash(second));
    }
}
