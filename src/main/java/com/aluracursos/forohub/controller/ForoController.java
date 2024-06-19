package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.DTO.DatosRegistroRespuestas.DatosActualizarRespuestas;
import com.aluracursos.forohub.DTO.DatosRespuestaRespuestas;
import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Respuesta;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.IRespuestaRepository;
import com.aluracursos.forohub.repository.ITopicoRepository;
import com.aluracursos.forohub.repository.IUsuarioRepository;
import com.aluracursos.forohub.service.RespuestaService;
import com.aluracursos.forohub.service.TopicoService;
import jakarta.transaction.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/")
public class ForoController {

    @Autowired
    private TopicoService topicoService;

    @Autowired
    private ITopicoRepository topicoRepo;

    @Autowired
    private IUsuarioRepository usuarioRepo;

    @Autowired
    private IRespuestaRepository respuestaRepo;

    @Autowired
    private RespuestaService respuestaService;

    private static final Logger logger = LoggerFactory.getLogger(ForoController.class);

    @GetMapping("/")
    public String mostrarForo(Model model) {
        System.out.println("Entrando al index...");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("*****************autenticacion " + authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Usuario no autenticado, redirigiendo a registro");
            return "redirect:/registrar";
        }
        model.addAttribute("categorias", Categoria.values());
        return "index";
    }

    @GetMapping("/buscarTopicos")
    public String buscarTopicos(@RequestParam(required = false) String categoria,
            @RequestParam(required = false) String subcategoria,
            Model model) {

        if (categoria != null && !categoria.isEmpty()) {
            Categoria categoriaEnum = Categoria.valueOf(categoria);
            List<Topico> topicos = topicoService.buscarPorCategoriaYSubcategoria(categoriaEnum, subcategoria);
            model.addAttribute("topicos", topicos);
        }

        model.addAttribute("categorias", Categoria.values());
        return "index";
    }

    @GetMapping("/detalleTopico/{id}")
    public String detalleTopico(@PathVariable Long id, Model model) {
        System.out.println("Entrando al método detalleTopico... id " + id);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("*****************autenticacion " + authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Usuario no autenticado, redirigiendo a registro");
            return "redirect:/registrar";
        } else {
            Optional<Topico> topicoOpt = topicoRepo.findById(id);
            if (topicoOpt.isPresent()) {
                Topico topico = topicoOpt.get();
                model.addAttribute("topico", topico);
                Boolean tieneSolucion = topicoService.tieneRespuestaComoSolucion(topico);
                model.addAttribute("tieneSolucion", tieneSolucion);
                Boolean perteneceAlUsuario = topicoService.perteneceAlUsuario(topico);
                model.addAttribute("perteneceAlUsuario", perteneceAlUsuario);

                System.out.println("Usuario autenticado, mostrando detalle del tópico");
                return "detalleTopico";
            } else {
                System.out.println("No se encontró el tópico, redirigiendo a index");
                return "redirect:/";
            }
        }
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/registrar")
    public String registerPage() {
        return "registro";
    }

    @GetMapping("/mostrarTopicos")
    public ResponseEntity<Map<String, String>> ejemploEndpoint(Authentication authentication) {
        System.out.println("/mostrar topico " + authentication);
        // Verifica si el usuario está autenticado
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        // Obtiene el nombre de usuario autenticado
        String username = authentication.getName();

        // Obtiene el usuario desde el repositorio basado en el nombre de usuario
        Usuario usuario = (Usuario) usuarioRepo.findByCorreoElectronico(username);

        // Crea la respuesta JSON
        Map<String, String> response = new HashMap<>();
        response.put("message", "Respuesta del endpoint mostrarTopicos");
        response.put("username", usuario != null ? usuario.getNombre() : "Usuario Desconocido");

        // Retorna la respuesta con el estado OK
        return ResponseEntity.ok(response);
    }

    @PutMapping("/respuesta/marcarSolucion/{idRespuesta}")
    @Transactional
    public ResponseEntity<Object> marcarRespuestaComoSolucion(@PathVariable Long idRespuesta) {
        ResponseEntity<Object> response;

        try {
            respuestaService.marcarRespuestaComoSolucion(idRespuesta);
            response = ResponseEntity.ok().body("{\"message\": \"Respuesta marcada como solución\"}");
        } catch (Exception e) {
            response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Error al marcar la respuesta como solución\"}");
        }

        return response;
    }

    @PutMapping("/respuesta/desmarcarSolucion/{idRespuesta}")
    @Transactional
    public ResponseEntity<Object> desmarcarRespuestaComoSolucion(@PathVariable Long idRespuesta) {
        try {
            respuestaService.desmarcarRespuestaComoSolucion(idRespuesta);
            return ResponseEntity.ok().body("{\"message\": \"Respuesta desmarcada como solución\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Error al desmarcar la respuesta como solución\"}");
        }
    }

}
