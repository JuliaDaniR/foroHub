package com.aluracursos.forohub.service;

import com.aluracursos.forohub.dto.DatosRegistroUsuario;
import com.aluracursos.forohub.dto.DatosRespuestaUsuario;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aluracursos.forohub.dto.DatosLeaderboardUsuario;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired 
    private UsuarioRepository usuarioRepo;
    
    public DatosRespuestaUsuario registrarUsuario(DatosRegistroUsuario datosRegistroUsuario) {
        Usuario usuario = new Usuario(datosRegistroUsuario);
        DatosRespuestaUsuario datosRespuestaUsuario = new DatosRespuestaUsuario(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreoElectronico(),
                usuario.getPerfil());

        usuarioRepo.save(usuario);
        return datosRespuestaUsuario;
    }    

    public Usuario obtenerPorCorreoElectronico(String username) {
       return (Usuario) usuarioRepo.findByCorreoElectronico(username);
    }

    public List<DatosLeaderboardUsuario> obtenerLeaderboard() {
        return usuarioRepo.findTop5ByActivoTrueOrderByPuntosDesc().stream()
                .map(u -> new DatosLeaderboardUsuario(u.getNombre(), u.getPerfil().name(), u.getPuntos()))
                .collect(Collectors.toList());
    }
}
