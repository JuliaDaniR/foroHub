package com.aluracursos.forohub.service;

import com.aluracursos.forohub.DTO.DatosRegistroUsuario;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.IUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired 
    private IUsuarioRepository usuarioRepo;
    
    public Usuario registrarUsuario(DatosRegistroUsuario datosRegistroUsuario) {
       
        Usuario usuario = new Usuario(datosRegistroUsuario);
        return usuarioRepo.save(usuario);
    }    

    public Usuario obtenerPorCorreoElectronico(String username) {
       return (Usuario) usuarioRepo.findByCorreoElectronico(username);
    }
}
