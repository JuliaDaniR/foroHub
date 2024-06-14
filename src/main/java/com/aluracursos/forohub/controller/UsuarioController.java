package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.DTO.DatosRegistroUsuario;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.service.UsuarioService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @PostMapping("/registrar")
    public ResponseEntity registrarUsuario(@RequestBody @Valid DatosRegistroUsuario datosRegistroUsuario, UriComponentsBuilder uriComponentsBuilder){
        
        Usuario usuario = usuarioService.registrarUsuario(datosRegistroUsuario);
    
        DatosRegistroUsuario datosRegistroUsuario1 = new DatosRegistroUsuario(
                usuario.getNombre(),
                usuario.getCorreoElectronico(),
                usuario.getPassword(), 
                usuario.getPerfil());
        
        URI url = uriComponentsBuilder.path("/usuario/{id}").buildAndExpand(usuario.getId()).toUri();
    
        return ResponseEntity.created(url).body(datosRegistroUsuario1);
        
    }
}
