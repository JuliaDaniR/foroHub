package com.aluracursos.forohub.model;

import com.aluracursos.forohub.DTO.DatosRegistroUsuario;
import com.aluracursos.forohub.enumerador.TipoPerfil;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Entity(name = "Usuario")
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @JsonIgnore
    private Long id;

    private String nombre;

    private String correoElectronico;

    @JsonIgnore
    private String password;

    private Boolean activo;

    @Enumerated(EnumType.STRING)
    private TipoPerfil perfil;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();

        // Añadir roles adicionales según el perfil del usuario
        switch (perfil) {
            case ADMINISTRADOR:
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                break;
            case MODERADOR:
                authorities.add(new SimpleGrantedAuthority("ROLE_MODERATOR"));
                break;
            case ESTUDIANTE:
                authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
                break;
            case INSTRUCTOR:
                authorities.add(new SimpleGrantedAuthority("ROLE_INSTRUCTOR"));
                break;
        }

        return authorities;
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return password;
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return correoElectronico;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return true;
    }

    public Usuario(DatosRegistroUsuario datosRegistroUsuario) {
        this.nombre = datosRegistroUsuario.nombre();
        this.correoElectronico = datosRegistroUsuario.email();
        this.password = new BCryptPasswordEncoder().encode(datosRegistroUsuario.password());
        this.perfil = datosRegistroUsuario.perfil();
        this.activo = true;
    }

    public void actualizarDatos(DatosRegistroUsuario.DatosActualizarUsuario datosActualizarUsuario) {
        if (datosActualizarUsuario.nombre() != null) {
            this.nombre = datosActualizarUsuario.nombre();
        }
        if (datosActualizarUsuario.email() != null) {
            this.correoElectronico = datosActualizarUsuario.email();
        }
        if (datosActualizarUsuario.perfil() != null) {
            this.perfil = datosActualizarUsuario.perfil();
        }
    }

    public void desactivarUsuario() {
        this.activo = false;
    }
}
