package com.aluracursos.forohub.security;

import com.aluracursos.forohub.repository.IUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class AutenticacionService implements UserDetailsService {
    @Autowired
    private IUsuarioRepository usuarioRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Username "+ username);
        var usu = usuarioRepo.findByCorreoElectronico(username);
        System.out.println("Usu "+ usu);
        
        return usuarioRepo.findByCorreoElectronico(username);
    }
}

