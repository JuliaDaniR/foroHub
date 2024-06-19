package com.aluracursos.forohub.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final SecurityFilter securityFilter;

    public SecurityConfiguration(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf().disable() // Deshabilitar CSRF para APIs stateless
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Deshabilitar sesiones
            .and()
            .authorizeHttpRequests()
                .requestMatchers(HttpMethod.POST, "/login").permitAll() // Permitir acceso al login
                .requestMatchers("/css/**", "/js/**", "/img/**", "/**").permitAll() // Permitir acceso a recursos estáticos y al frontend
                .requestMatchers(HttpMethod.POST, "/usuario/registrar").permitAll() // Permitir registro de usuarios
                .requestMatchers("/swagger-ui.html", "/v3/api-docs/**", "/swagger-ui/**").permitAll() // Permitir acceso a Swagger
                .requestMatchers("/detalleTopico/**").authenticated() // Requerir autenticación para detalle de tópicos
                .anyRequest().authenticated() // Requerir autenticación para todas las demás rutas
            .and()
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class) // Añadir filtro de seguridad personalizado
            .formLogin().disable(); // Deshabilitar el manejo de formularios de login

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
