//package com.aluracursos.forohub.controller;
//
//import com.aluracursos.forohub.DTO.DatosRegistroCurso;
//import com.aluracursos.forohub.DTO.DatosRegistroRespuestas;
//import com.aluracursos.forohub.DTO.DatosRegistroTopico;
//import com.aluracursos.forohub.DTO.DatosRespuestaRespuestas;
//import com.aluracursos.forohub.DTO.DatosRespuestaTopico;
//import com.aluracursos.forohub.enumerador.Categoria;
//import com.aluracursos.forohub.model.Curso;
//import com.aluracursos.forohub.model.Respuesta;
//import com.aluracursos.forohub.model.Topico;
//import com.aluracursos.forohub.model.Usuario;
//import com.aluracursos.forohub.repository.ICursoRepository;
//import com.aluracursos.forohub.repository.IRespuestaRepository;
//import com.aluracursos.forohub.repository.ITopicoRepository;
//import com.aluracursos.forohub.repository.IUsuarioRepository;
//import com.aluracursos.forohub.service.RespuestaService;
//import com.aluracursos.forohub.service.TopicoService;
//import com.aluracursos.forohub.service.UsuarioService;
//import jakarta.transaction.Transactional;
//import jakarta.validation.Valid;
//import java.net.URI;
//import java.time.format.DateTimeFormatter;
//import java.util.Arrays;
//import java.util.Collection;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.stream.Collectors;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.ModelAttribute;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestHeader;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.servlet.mvc.support.RedirectAttributes;
//import org.springframework.web.util.UriComponentsBuilder;
//
//@Controller
//@RequestMapping("/")
//public class ForoController {
//    
//    @Autowired
//    private TopicoService topicoService;
//    
//    @Autowired
//    private ITopicoRepository topicoRepo;
//    
//    @Autowired
//    private IUsuarioRepository usuarioRepo;
//    
//    @Autowired
//    private IRespuestaRepository respuestaRepo;
//    
//    @Autowired
//    private ICursoRepository cursoRepo;
//    
//    @Autowired
//    private RespuestaService respuestaService;
//    
//    @Autowired
//    private UsuarioService usuarioService;
//    
//    private static final Logger logger = LoggerFactory.getLogger(ForoController.class);
//    
//    @GetMapping("/")
//    public String mostrarForo(Model model) {
//        System.out.println("Entrando al index...");
//        
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        System.out.println("*****************autenticacion " + authentication);
//        if (authentication == null || !authentication.isAuthenticated()) {
//            System.out.println("Usuario no autenticado, redirigiendo a registro");
//            return "redirect:/registrar";
//        }
//        
//          Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
//         authorities.forEach(authority -> System.out.println("Rol: " + authority.getAuthority()));
//
//          Map<String, String[]> subcategoriasPorCategoria = new HashMap<>();
//        for (Categoria categoria : Categoria.values()) {
//            subcategoriasPorCategoria.put(categoria.name(), categoria.getSubcategorias());
//        }
//
//        model.addAttribute("subcategoriasPorCategoria", subcategoriasPorCategoria);
//      
//        List<Curso> cursos = cursoRepo.findAll();
//        model.addAttribute("cursoForm", new DatosRegistroCurso("", null, ""));
//        model.addAttribute("cursos", cursos);
//        model.addAttribute("categorias", Categoria.values());
//        return "index";
//    }
//    
//    
//      @GetMapping("/inicio")
//    public String inicio(Model model, Authentication authentication) {
//
//        System.out.println("Entrando al inicio...");
//       
//        System.out.println("*****************autenticacion " + authentication);
//        if (authentication == null || !authentication.isAuthenticated()) {
//            System.out.println("Usuario no autenticado, redirigiendo a registro");
//            return "redirect:/registrar";
//        }
//        
//          Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
//         authorities.forEach(authority -> System.out.println("Rol: " + authority.getAuthority()));
//
//          Map<String, String[]> subcategoriasPorCategoria = new HashMap<>();
//        for (Categoria categoria : Categoria.values()) {
//            subcategoriasPorCategoria.put(categoria.name(), categoria.getSubcategorias());
//        }
//
//        model.addAttribute("subcategoriasPorCategoria", subcategoriasPorCategoria);
//      
//        List<Curso> cursos = cursoRepo.findAll();
//        model.addAttribute("cursoForm", new DatosRegistroCurso("", null, ""));
//        model.addAttribute("cursos", cursos);
//        model.addAttribute("categorias", Categoria.values());
//        return "principal";
//    }
//    
//    
//    @GetMapping("/buscarTopicos")
//    public String buscarTopicos(@RequestParam(required = false) String categoria,
//            @RequestParam(required = false) String subcategoria,
//            Model model) {
//        
//        if (categoria != null && !categoria.isEmpty()) {
//            Categoria categoriaEnum = Categoria.valueOf(categoria);
//            List<Topico> topicos = topicoService.buscarPorCategoriaYSubcategoria(categoriaEnum, subcategoria);
//            model.addAttribute("topicos", topicos);
//        }
//        
//        model.addAttribute("categorias", Categoria.values());
//        return "index"; // Asegúrate de que esta sea la vista correcta que quieres renderizar
//    }
//    
//    @PostMapping("/registrarTopico")
//    public ResponseEntity<Map<String, String>> registrarTopico(@RequestBody @Valid DatosRegistroTopico datosRegistroTopico,
//            UriComponentsBuilder uriComponentsBuilder,
//            Authentication authentication,
//            RedirectAttributes redirectAttributes) {
//        System.out.println("registrando topico");
//        Usuario usuario = (Usuario) authentication.getPrincipal();
//        if (usuario == null || usuario.getId() == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
//        }
//        Long idAutor = usuario.getId();
//        System.out.println("ID del autor autenticado: " + idAutor);
//        
//        DatosRegistroTopico datos = new DatosRegistroTopico(
//                datosRegistroTopico.titulo(),
//                datosRegistroTopico.mensaje(),
//                idAutor,
//                datosRegistroTopico.cursoId());
//        
//        Topico topico = topicoService.registrarTopico(datos);
//        
//        if (topico != null) {
//            DatosRegistroTopico datosRespuestaTopico = new DatosRegistroTopico(
//                    topico.getTitulo(),
//                    topico.getMensaje(),
//                    topico.getAutor().getId(),
//                    topico.getCurso().getId()
//            );
//            redirectAttributes.addFlashAttribute("mensaje", "¡Tópico registrado exitosamente!");
//            return ResponseEntity.ok(Map.of("mensaje", "¡Tópico registrado exitosamente!"));
//        } else {
//            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ya existe un tópico con ese título y mensaje"));
//        }
//    }
//    
//    @GetMapping("/detalleTopico/{id}")
//    public String detalleTopico(@PathVariable Long id, Model model) {
//        System.out.println("Entrando al método detalleTopico... id " + id);
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        System.out.println("*****************autenticacion " + authentication);
//        if (authentication == null || !authentication.isAuthenticated()) {
//            System.out.println("Usuario no autenticado, redirigiendo a registro");
//            // Puedes lanzar una excepción o devolver un objeto indicando el error de autenticación si es necesario
//            return "redirect:/registrar";
//        } else {
//            Optional<Topico> topicoOpt = topicoRepo.findById(id);
//            if (topicoOpt.isPresent()) {
//                Topico topico = topicoOpt.get();
//                Boolean tieneSolucion = topicoService.tieneRespuestaComoSolucion(topico);
//                Boolean perteneceAlUsuario = topicoService.perteneceAlUsuario(topico);
//                model.addAttribute("topico", topico);
//                model.addAttribute("tieneSolucion", tieneSolucion);
//                model.addAttribute("perteneceAlUsuario", perteneceAlUsuario);
//                System.out.println("Usuario autenticado, mostrando detalle del tópico");
//                return "detalleTopico.html";
//            } else {
//                System.out.println("No se encontró el tópico");
//                return "redirect:/";
//            }
//        }
//    }
//    
//    private Long obtenerAutorId(Authentication authentication) {
//        
//        String username = authentication.getName();
//        System.out.println("username " + username);
//        // Obtiene el usuario desde el repositorio basado en el nombre de usuario
//        Usuario usuario = (Usuario) usuarioRepo.findByCorreoElectronico(username);
//        System.out.println("usuario " + usuario);
//        if (usuario != null) {
//            return usuario.getId();
//        }
//        
//        return null;
//    }
//    
//    @PostMapping("/foro/respuesta/registrar")
//    public ResponseEntity<?> registrarRespuesta(@RequestBody @Valid DatosRegistroRespuestas datosRegistroRespuesta,
//            UriComponentsBuilder uriComponentsBuilder, RedirectAttributes redirectAttributes) {
//        try {
//            // Agregar logs para verificar los datos recibidos
//            System.out.println("Mensaje recibido: " + datosRegistroRespuesta.mensaje());
//            System.out.println("ID del tópico recibido: " + datosRegistroRespuesta.topicoId());
//            // Verifica que datosRegistroRespuesta esté recibiendo los valores esperados correctamente
//
//            // Obtener el usuario autenticado
//            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//            Usuario autor = usuarioService.obtenerPorCorreoElectronico(userDetails.getUsername());
//
//            // Construir datos para el registro
//            DatosRegistroRespuestas datos = new DatosRegistroRespuestas(
//                    datosRegistroRespuesta.mensaje(),
//                    autor.getId(),
//                    datosRegistroRespuesta.topicoId()
//            );
//
//            // Agregar más logs para verificar antes de registrar
//            System.out.println("Datos a registrar: " + datos.toString());
//
//            // Registrar la respuesta usando el servicio correspondiente
//            Respuesta respuesta = respuestaService.registrarServicio(datos);
//            
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
//            String fechaFormateada = respuesta.getFechaCreacion().format(formatter);
//
//            // Construir el objeto de respuesta que se va a devolver en la respuesta HTTP
//            DatosRespuestaRespuestas datosRespuesta = new DatosRespuestaRespuestas(
//                    respuesta.getId(),
//                    respuesta.getMensaje(),
//                    fechaFormateada,
//                    respuesta.getSolucion(),
//                    respuesta.getAutor().getNombre(),
//                    respuesta.getAutor().getPerfil(),
//                    respuesta.getTopico().getTitulo()
//            );
//
//            // Construir la URI para la nueva respuesta registrada
//            URI url = uriComponentsBuilder.path("/respuesta/{id}").buildAndExpand(respuesta.getId()).toUri();
//            redirectAttributes.addFlashAttribute("mensajeRespuesta", "¡Respuesta registrada correctamente!");
//            // Retornar una respuesta con el estado CREATED y la URI de la nueva respuesta
//            return ResponseEntity.created(url).body(datosRespuesta);
//        } catch (Exception e) {
//            // Agregar un log para el error
//            System.err.println("Error al registrar la respuesta: " + e.getMessage());
//            // Retornar un ResponseEntity con un error 400 y un mensaje adecuado
//            return ResponseEntity.badRequest().body("Error al registrar la respuesta: " + e.getMessage());
//        }
//    }
//    
//    @GetMapping("/detalle/{id}")
//    public String retornarDatosTopico(@PathVariable Long id,
//            Model model, @RequestHeader("Authorization") String token, Authentication authentication) {
//        System.out.println("Authorization Header recibido: " + token);
//        Optional<Topico> optionalTopico = topicoRepo.findById(id);
//        System.out.println("optionalTopico " + optionalTopico);
//        
//        if (optionalTopico.isPresent()) {
//            Topico topico = optionalTopico.get();
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
//            List<DatosRespuestaRespuestas> respuestasDTO = topico.getRespuestas().stream().map(respuesta
//                    -> new DatosRespuestaRespuestas(
//                            respuesta.getId(),
//                            respuesta.getMensaje(),
//                            respuesta.getFechaCreacion().format(formatter),
//                            respuesta.getSolucion(),
//                            respuesta.getAutor().getNombre(),
//                            respuesta.getAutor().getPerfil(),
//                            respuesta.getTopico().getTitulo()
//                    )
//            ).collect(Collectors.toList());
//            
//            var datosTopico = new DatosRespuestaTopico(
//                    topico.getId(),
//                    topico.getTitulo(),
//                    topico.getMensaje(),
//                    topico.getFechaCreacion().format(formatter),
//                    topico.getAutor().getNombre(),
//                    topico.getCurso().getNombre(),
//                    respuestasDTO
//            );
//            Boolean tieneSolucion = topicoService.tieneRespuestaComoSolucion(topico);
//            Boolean perteneceAlUsuario = topicoService.perteneceAlUsuario(topico);
//            model.addAttribute("topico", topico);
//            model.addAttribute("tieneSolucion", tieneSolucion);
//            model.addAttribute("perteneceAlUsuario", perteneceAlUsuario);
//            model.addAttribute("topico", datosTopico);
//            Long autorId = obtenerAutorId(authentication);
//            model.addAttribute("autorId", autorId);
//            System.out.println("************autorId retornarDatos" + autorId);
//            return "detalleTopico";
//        } else {
//            model.addAttribute("error", "No se encontró ningún tópico con el ID proporcionado.");
//            return "redirect:/";
//        }
//    }
//    
//    @GetMapping("/login")
//    public String loginPage() {
//        return "login";
//    }
//    
//    @GetMapping("/registrar")
//    public String registerPage() {
//        return "registro";
//    }
//    
//    @GetMapping("/mostrarTopicos")
//    public ResponseEntity<Map<String, String>> ejemploEndpoint(Authentication authentication, Model model) {
//        System.out.println("/mostrar topico " + authentication);
//        // Verifica si el usuario está autenticado
//        if (authentication == null || !authentication.isAuthenticated()) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
//        }
//
//        // Obtiene el nombre de usuario autenticado
//        String username = authentication.getName();
//
//        // Obtiene el usuario desde el repositorio basado en el nombre de usuario
//        Usuario usuario = (Usuario) usuarioRepo.findByCorreoElectronico(username);
//
//        // Crea la respuesta JSON
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Respuesta del endpoint mostrarTopicos");
//        response.put("username", usuario != null ? usuario.getNombre() : "Usuario Desconocido");
//        model.addAttribute("autorId", usuario.getId());
//        System.out.println("autorId mostrarTopicos" + usuario.getId());
//        // Retorna la respuesta con el estado OK
//        return ResponseEntity.ok(response);
//    }
//    
//    @PutMapping("/respuesta/marcarSolucion/{idRespuesta}")
//    @Transactional
//    public ResponseEntity<Object> marcarRespuestaComoSolucion(@PathVariable Long idRespuesta, @RequestHeader("Authorization") String token) {
//        ResponseEntity<Object> response;
//        
//        try {
//            respuestaService.marcarRespuestaComoSolucion(idRespuesta);
//            response = ResponseEntity.ok().body("{\"message\": \"Respuesta marcada como solución\"}");
//        } catch (Exception e) {
//            response = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Error al marcar la respuesta como solución\"}");
//        }
//        
//        return response;
//    }
//    
//    @PutMapping("/respuesta/desmarcarSolucion/{idRespuesta}")
//    @Transactional
//    public ResponseEntity<Object> desmarcarRespuestaComoSolucion(@PathVariable Long idRespuesta, @RequestHeader("Authorization") String token) {
//        try {
//            respuestaService.desmarcarRespuestaComoSolucion(idRespuesta);
//            return ResponseEntity.ok().body("{\"message\": \"Respuesta desmarcada como solución\"}");
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Error al desmarcar la respuesta como solución\"}");
//        }
//    }
//    
//}
