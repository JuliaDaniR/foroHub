package com.aluracursos.forohub.springdoc;

import com.aluracursos.forohub.enumerador.Categoria;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.security.SecurityScheme;
import java.util.List;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocConfiguration {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes("bearer-key",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .info(new Info()
                        .title("API ForoHub")
                        .description("API Rest de la aplicación ForoHub, que contiene las funcionalidades de CRUD de Tópicos, respuestas , Usuarios y cursos")
                        .contact(new Contact()
                                .name("Equipo Backend")
                                .email("backend@foro.hub"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://foro.hub/api/licencia")));
    }

    @Bean
    public OpenApiCustomizer courseCustomizer() {
        return openApi -> {
            Schema<?> categoriaSchema = openApi.getComponents().getSchemas().get("Categoria");
            if (categoriaSchema != null) {
                for (Categoria categoria : Categoria.values()) {
                    ArraySchema arraySchema = new ArraySchema();
                    arraySchema.setItems(new StringSchema()._enum(List.of(categoria.getSubcategorias())));
                    categoriaSchema.addProperties(categoria.name(), arraySchema);
                }
            }
        };

    }
}
