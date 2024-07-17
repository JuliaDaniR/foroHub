package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.DTO.DatosRegistroCurso;
import com.aluracursos.forohub.DTO.DatosRegistroRespuestas;
import com.aluracursos.forohub.DTO.DatosRegistroTopico;
import com.aluracursos.forohub.DTO.DatosRespuestaRespuestas;
import com.aluracursos.forohub.DTO.DatosRespuestaTopico;
import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.model.Respuesta;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.ICursoRepository;
import com.aluracursos.forohub.repository.IRespuestaRepository;
import com.aluracursos.forohub.repository.ITopicoRepository;
import com.aluracursos.forohub.repository.IUsuarioRepository;
import com.aluracursos.forohub.service.RespuestaService;
import com.aluracursos.forohub.service.TopicoService;
import com.aluracursos.forohub.service.UsuarioService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;


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
    private ICursoRepository cursoRepo;

    @Autowired
    private RespuestaService respuestaService;

    @Autowired
    private UsuarioService usuarioService;

    private static final Logger logger = LoggerFactory.getLogger(ForoController.class);

    private boolean isUserAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    @GetMapping("/")
    public String mostrarForo(Model model) {
        if (!isUserAuthenticated()) {
            return "redirect:/registrar";
        }
        setupCommonAttributes(model);
        return "index";
    }
@GetMapping("/inicio")
public String inicio(Model model) {
    // Verificar la autenticación del usuario
    if (!isUserAuthenticated()) {
        return "redirect:/registrar";
    }
    
    // Obtener la autenticación actual
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    
    // Verificar el rol del usuario
    if (authentication != null && authentication.isAuthenticated()) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isInstructor = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_INSTRUCTOR"));

        // Depurar los roles obtenidos
        System.out.println("isAdmin: " + isAdmin);
        System.out.println("isInstructor: " + isInstructor);

        // Pasar información al modelo según el rol
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("isInstructor", isInstructor);
    }
    
    // Configurar atributos comunes
    setupCommonAttributes(model);

    return "principal";
}

    @GetMapping("/buscarTopicos")
    public String buscarTopicos(@RequestParam(required = false) String categoria,
                                @RequestParam(required = false) String subcategoria,
                                Model model) {
        if (!isUserAuthenticated()) {
            return "redirect:/registrar";
        }
        if (categoria != null && !categoria.isEmpty()) {
            Categoria categoriaEnum = Categoria.valueOf(categoria);
            List<Topico> topicos = topicoService.buscarPorCategoriaYSubcategoria(categoriaEnum, subcategoria);
            model.addAttribute("topicos", topicos);
        }
        setupCommonAttributes(model);
        return "index";
    }

    @PostMapping("/registrarTopico")
    public ResponseEntity<Map<String, String>> registrarTopico(@RequestBody @Valid DatosRegistroTopico datosRegistroTopico,
                                                               UriComponentsBuilder uriComponentsBuilder,
                                                               Authentication authentication,
                                                               RedirectAttributes redirectAttributes) {
        if (!isUserAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        Usuario usuario = (Usuario) authentication.getPrincipal();
        Long idAutor = usuario.getId();

        DatosRegistroTopico datos = new DatosRegistroTopico(
                datosRegistroTopico.titulo(),
                datosRegistroTopico.mensaje(),
                idAutor,
                datosRegistroTopico.cursoId());

        Topico topico = topicoService.registrarTopico(datos);

        if (topico != null) {
            redirectAttributes.addFlashAttribute("mensaje", "¡Tópico registrado exitosamente!");
            return ResponseEntity.ok(Map.of("mensaje", "¡Tópico registrado exitosamente!"));
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ya existe un tópico con ese título y mensaje"));
        }
    }

    @GetMapping("/detalleTopico/{id}")
    public String detalleTopico(@PathVariable Long id, Model model) {
        if (!isUserAuthenticated()) {
            return "redirect:/registrar";
        }

        Optional<Topico> topicoOpt = topicoRepo.findById(id);
        if (topicoOpt.isPresent()) {
            Topico topico = topicoOpt.get();
            Boolean tieneSolucion = topicoService.tieneRespuestaComoSolucion(topico);
            Boolean perteneceAlUsuario = topicoService.perteneceAlUsuario(topico);
            model.addAttribute("topico", topico);
            model.addAttribute("tieneSolucion", tieneSolucion);
            model.addAttribute("perteneceAlUsuario", perteneceAlUsuario);
            return "detalleTopico";
        } else {
            return "redirect:/";
        }
    }

    @PostMapping("/foro/respuesta/registrar")
    public ResponseEntity<?> registrarRespuesta(@RequestBody @Valid DatosRegistroRespuestas datosRegistroRespuesta,
                                                UriComponentsBuilder uriComponentsBuilder,
                                                RedirectAttributes redirectAttributes) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Usuario autor = usuarioService.obtenerPorCorreoElectronico(userDetails.getUsername());

            DatosRegistroRespuestas datos = new DatosRegistroRespuestas(
                    datosRegistroRespuesta.mensaje(),
                    autor.getId(),
                    datosRegistroRespuesta.topicoId()
            );

            Respuesta respuesta = respuestaService.registrarServicio(datos);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            String fechaFormateada = respuesta.getFechaCreacion().format(formatter);

            DatosRespuestaRespuestas datosRespuesta = new DatosRespuestaRespuestas(
                    respuesta.getId(),
                    respuesta.getMensaje(),
                    fechaFormateada,
                    respuesta.getSolucion(),
                    respuesta.getAutor().getNombre(),
                    respuesta.getAutor().getPerfil(),
                    respuesta.getTopico().getTitulo()
            );

            URI url = uriComponentsBuilder.path("/respuesta/{id}").buildAndExpand(respuesta.getId()).toUri();
            redirectAttributes.addFlashAttribute("mensajeRespuesta", "¡Respuesta registrada correctamente!");
            return ResponseEntity.created(url).body(datosRespuesta);
        } catch (Exception e) {
            logger.error("Error al registrar la respuesta: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error al registrar la respuesta: " + e.getMessage());
        }
    }

    @GetMapping("/detalle/{id}")
    public String retornarDatosTopico(@PathVariable Long id,
                                      Model model, @RequestHeader("Authorization") String token, Authentication authentication) {
        Optional<Topico> optionalTopico = topicoRepo.findById(id);
        if (optionalTopico.isPresent()) {
            Topico topico = optionalTopico.get();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            List<DatosRespuestaRespuestas> respuestasDTO = topico.getRespuestas().stream().map(respuesta
                    -> new DatosRespuestaRespuestas(
                    respuesta.getId(),
                    respuesta.getMensaje(),
                    respuesta.getFechaCreacion().format(formatter),
                    respuesta.getSolucion(),
                    respuesta.getAutor().getNombre(),
                    respuesta.getAutor().getPerfil(),
                    respuesta.getTopico().getTitulo()
            )
            ).collect(Collectors.toList());

            var datosTopico = new DatosRespuestaTopico(
                    topico.getId(),
                    topico.getTitulo(),
                    topico.getMensaje(),
                    topico.getFechaCreacion().format(formatter),
                    topico.getAutor().getNombre(),
                    topico.getCurso().getNombre(),
                    respuestasDTO
            );
            Boolean tieneSolucion = topicoService.tieneRespuestaComoSolucion(topico);
            Boolean perteneceAlUsuario = topicoService.perteneceAlUsuario(topico);
            model.addAttribute("topico", topico);
            model.addAttribute("tieneSolucion", tieneSolucion);
            model.addAttribute("perteneceAlUsuario", perteneceAlUsuario);
            model.addAttribute("topico", datosTopico);
            return "detalleTopico";
        } else {
            model.addAttribute("error", "No se encontró ningún tópico con el ID proporcionado.");
            return "redirect:/";
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
    public ResponseEntity<Map<String, String>> ejemploEndpoint(Authentication authentication, Model model) {
        if (!isUserAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String username = authentication.getName();
        Usuario usuario = (Usuario) usuarioRepo.findByCorreoElectronico(username);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Respuesta del endpoint mostrarTopicos");
        response.put("username", usuario != null ? usuario.getNombre() : "Usuario Desconocido");
        model.addAttribute("autorId", usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/respuesta/marcarSolucion/{idRespuesta}")
    public ResponseEntity<Object> marcarRespuestaComoSolucion(@PathVariable Long idRespuesta) {
        try {
            respuestaService.marcarRespuestaComoSolucion(idRespuesta);
            return ResponseEntity.ok().body("{\"message\": \"Respuesta marcada como solución\"}");
        } catch (Exception e) {
            logger.error("Error al marcar la respuesta como solución: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Error al marcar la respuesta como solución\"}");
        }
    }

    @PutMapping("/respuesta/desmarcarSolucion/{idRespuesta}")
    public ResponseEntity<Object> desmarcarRespuestaComoSolucion(@PathVariable Long idRespuesta) {
        try {
            respuestaService.desmarcarRespuestaComoSolucion(idRespuesta);
            return ResponseEntity.ok().body("{\"message\": \"Respuesta desmarcada como solución\"}");
        } catch (Exception e) {
            logger.error("Error al desmarcar la respuesta como solución: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Error al desmarcar la respuesta como solución\"}");
        }
    }

    private void setupCommonAttributes(Model model) {
        Map<String, String[]> subcategoriasPorCategoria = new HashMap<>();
        for (Categoria categoria : Categoria.values()) {
            subcategoriasPorCategoria.put(categoria.name(), categoria.getSubcategorias());
        }
        List<Curso> cursos = cursoRepo.findAll();
        model.addAttribute("subcategoriasPorCategoria", subcategoriasPorCategoria);
        model.addAttribute("cursoForm", new DatosRegistroCurso("", null, ""));
        model.addAttribute("cursos", cursos);
        model.addAttribute("categorias", Categoria.values());
    }
}
