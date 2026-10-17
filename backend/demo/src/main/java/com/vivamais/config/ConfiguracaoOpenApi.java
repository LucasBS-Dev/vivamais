package com.vivamais.config;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.core.customizers.OpenApiCustomizer;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import java.util.List;

@Configuration
public class ConfiguracaoOpenApi {
    @Bean OpenAPI openApi() {
        return new OpenAPI().info(new Info().title("Viva+ API").version("0.1.0")
                .description("Fundação da demonstração acadêmica. Somente dados sintéticos. Módulos clínicos não implementados permanecem bloqueados."))
                .components(new Components().addSecuritySchemes("bearerAuth",new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("opaque")));
    }
    @Bean OpenApiCustomizer foundationContract() {
        return api -> {
            Schema<Object> problem=new Schema<>().type("object").required(List.of("status","title","detail"));
            problem.addProperty("status",new Schema<>().type("integer").format("int32"));
            problem.addProperty("title",new Schema<>().type("string"));
            problem.addProperty("detail",new Schema<>().type("string"));
            api.getComponents().addSchemas("ApiProblem",problem);
            api.getPaths().forEach((path,item) -> item.readOperations().forEach(operation -> {
                if(path.equals("/api/v1/auth/logout")) operation.setResponses(new ApiResponses().addApiResponse("204",new ApiResponse().description("Sessão revogada")));
                operation.getResponses().addApiResponse("401",error("Sessão ausente, inválida ou credenciais incorretas"));
                operation.getResponses().addApiResponse("500",error("Falha interna sem detalhes sensíveis"));
                if(!path.equals("/api/v1/auth/login")) operation.getResponses().addApiResponse("403",error("Recurso fora do escopo autorizado"));
            }));
            var entrar=api.getPaths().get("/api/v1/auth/login").getPost();
            entrar.setSecurity(List.of());
            entrar.getResponses().addApiResponse("400",error("Formato inválido"));
            entrar.getResponses().addApiResponse("413",error("Corpo maior que 8 KiB, inclusive chunked"));
            entrar.getResponses().addApiResponse("429",error("Limite de tentativas; Retry-After em segundos"));
        };
    }
    private static ApiResponse error(String description) {
        return new ApiResponse().description(description).content(new Content().addMediaType("application/problem+json",
                new MediaType().schema(new Schema<>().$ref("#/components/schemas/ApiProblem"))));
    }
}
