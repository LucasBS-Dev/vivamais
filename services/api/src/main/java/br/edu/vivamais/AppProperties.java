package br.edu.vivamais;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(boolean demoOnly, List<String> corsOrigins, Duration sessionDuration, String bootstrapPassword) { }
