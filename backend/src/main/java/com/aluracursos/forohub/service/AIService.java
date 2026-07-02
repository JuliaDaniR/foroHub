package com.aluracursos.forohub.service;

import com.aluracursos.forohub.dto.AIDraftResponse;
import com.aluracursos.forohub.dto.AISummaryResponse;
import com.aluracursos.forohub.dto.DatosAutocompleteCursoRequest;
import com.aluracursos.forohub.dto.DatosAutocompleteCursoResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Value("${gemini.api-key:mock-key-for-tests}")
    private String geminiApiKey;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com}")
    private String geminiBaseUrl;

    @Value("${openrouter.api-key:mock-key-for-tests}")
    private String openrouterApiKey;

    @Value("${openrouter.url:https://openrouter.ai/api/v1/chat/completions}")
    private String openrouterUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIDraftResponse generateTopic(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return new AIDraftResponse("Consulta sobre programación", "Escribe tu duda aquí...");
        }

        // 1. Try Google Gemini API if key is set
        if (isKeyConfigured(geminiApiKey)) {
            try {
                String url = geminiBaseUrl + "/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;
                String systemPrompt = "Eres un asistente técnico de redacción para un foro de programación. " +
                        "Corrige cualquier error de ortografía, tipeo o redacción en la idea del usuario (por ejemplo, 'variablee' debe corregirse a 'variable'). " +
                        "Genera un título descriptivo y formal (no repitas la pregunta tal cual) y un mensaje estructurado en Markdown basados en esta idea: \"" + prompt + "\". " +
                        "Tu respuesta DEBE ser únicamente un objeto JSON con los campos exactos \"titulo\" y \"mensaje\". No agregues nada de texto adicional ni formato markdown extra alrededor del JSON.";

                Map<String, Object> request = Map.of(
                        "contents", List.of(
                                Map.of(
                                        "parts", List.of(
                                                Map.of("text", systemPrompt)
                                        )
                                )
                        )
                );

                String responseStr = restTemplate.postForObject(url, request, String.class);
                JsonNode root = objectMapper.readTree(responseStr);
                String rawText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                
                return parseDraftResponse(rawText);
            } catch (Exception e) {
                System.err.println("Gemini API error (falling back to OpenRouter/Mock): " + e.getMessage());
            }
        }

        // 2. Try OpenRouter API if key is set
        if (isKeyConfigured(openrouterApiKey)) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openrouterApiKey);

                String systemPrompt = "Genera un título profesional y cuerpo del post en español basados en la idea: \"" + prompt + "\". " +
                        "Asegúrate de corregir cualquier error ortográfico o de redacción del usuario. " +
                        "Responde únicamente con un objeto JSON con los campos \"titulo\" y \"mensaje\".";

                Map<String, Object> request = Map.of(
                        "model", "openrouter/auto",
                        "messages", List.of(
                                Map.of("role", "user", "content", systemPrompt)
                        )
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
                String responseStr = restTemplate.postForObject(openrouterUrl, entity, String.class);
                JsonNode root = objectMapper.readTree(responseStr);
                String rawText = root.path("choices").get(0).path("message").path("content").asText();

                return parseDraftResponse(rawText);
            } catch (Exception e) {
                System.err.println("OpenRouter API error (falling back to Mock): " + e.getMessage());
            }
        }

        // 3. Fallback to Local Templates
        return getMockDraftResponse(prompt);
    }

    public AISummaryResponse summarizeTopic(String titulo, String mensaje, List<String> respuestas) {
        // 1. Try Google Gemini API if key is set
        if (isKeyConfigured(geminiApiKey)) {
            try {
                String url = geminiBaseUrl + "/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;
                String systemPrompt = "Resume la siguiente consulta de foro y sus respuestas en español. " +
                        "Utiliza Markdown con emojis y listas de puntos clave. Sé directo y estructurado. Indica si ya se halló una respuesta marcada como solución.\n\n" +
                        "Título: " + titulo + "\n" +
                        "Mensaje: " + mensaje + "\n" +
                        "Respuestas:\n" + String.join("\n", respuestas);

                Map<String, Object> request = Map.of(
                        "contents", List.of(
                                Map.of(
                                        "parts", List.of(
                                                Map.of("text", systemPrompt)
                                        )
                                )
                        )
                );

                String responseStr = restTemplate.postForObject(url, request, String.class);
                JsonNode root = objectMapper.readTree(responseStr);
                String rawText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                return new AISummaryResponse(rawText);
            } catch (Exception e) {
                System.err.println("Gemini Summary error (falling back): " + e.getMessage());
            }
        }

        // 2. Try OpenRouter API if key is set
        if (isKeyConfigured(openrouterApiKey)) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openrouterApiKey);

                String systemPrompt = "Resume la siguiente consulta y respuestas en español usando markdown:\n\n" +
                        "Título: " + titulo + "\n" +
                        "Mensaje: " + mensaje + "\n" +
                        "Respuestas:\n" + String.join("\n", respuestas);

                Map<String, Object> request = Map.of(
                        "model", "openrouter/auto",
                        "messages", List.of(
                                Map.of("role", "user", "content", systemPrompt)
                        )
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
                String responseStr = restTemplate.postForObject(openrouterUrl, entity, String.class);
                JsonNode root = objectMapper.readTree(responseStr);
                String rawText = root.path("choices").get(0).path("message").path("content").asText();
                return new AISummaryResponse(rawText);
            } catch (Exception e) {
                System.err.println("OpenRouter Summary error (falling back): " + e.getMessage());
            }
        }

        // 3. Fallback to Local Summary Mock
        return getMockSummary(titulo, respuestas);
    }

    private boolean isKeyConfigured(String key) {
        return key != null && !key.isBlank() && !key.equals("mock-key-for-tests");
    }

    private AIDraftResponse parseDraftResponse(String rawText) throws Exception {
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();
        
        JsonNode responseJson = objectMapper.readTree(cleaned);
        String title = responseJson.path("titulo").asText("Consulta sobre código");
        String body = responseJson.path("mensaje").asText("Escribe tu duda técnica aquí...");
        return new AIDraftResponse(title, body);
    }

    private AIDraftResponse getMockDraftResponse(String prompt) {
        // Clean common spelling mistakes/duplications in mock fallback
        String cleanedPrompt = prompt.trim()
                .replaceAll("(?i)variablee", "variable")
                .replaceAll("(?i)funcionn", "función")
                .replaceAll("(?i)coneccion", "conexión")
                .replaceAll("(?i)proyectoo", "proyecto");
        
        // Remove leading "¿" or "que es" or "como" to build a much cleaner title
        String cleanTitle = cleanedPrompt;
        if (cleanTitle.toLowerCase().startsWith("que es una ")) {
            cleanTitle = cleanTitle.substring(11);
        } else if (cleanTitle.toLowerCase().startsWith("que es un ")) {
            cleanTitle = cleanTitle.substring(10);
        } else if (cleanTitle.toLowerCase().startsWith("que es ")) {
            cleanTitle = cleanTitle.substring(7);
        } else if (cleanTitle.toLowerCase().startsWith("como ")) {
            cleanTitle = cleanTitle.substring(5);
        }
        cleanTitle = cleanTitle.replaceAll("[¿?]", "").trim();

        String lowerPrompt = cleanedPrompt.toLowerCase();
        String title = "Concepto de " + capitalize(cleanTitle);
        if (lowerPrompt.contains("variable") && lowerPrompt.contains("constante")) {
            title = "Diferencias entre variables y constantes";
        }

        String body = "Hola comunidad,\n\nQuisiera consultarles sobre el siguiente concepto técnico: \"" + cleanedPrompt + "\".\n\n¿Podrían explicarme las diferencias fundamentales y cuáles serían las mejores prácticas para estructurar esto en mi código?\n\n¡Muchas gracias de antemano!";
        
        if (lowerPrompt.contains("spring") || lowerPrompt.contains("boot")) {
            title = "Configuración óptima de Spring Boot";
            body = "Hola comunidad,\n\nEstoy desarrollando una API REST con Spring Boot y tengo dudas sobre la mejor forma de configurar los filtros de seguridad y la persistencia de datos.\n\n¿Me recomiendan utilizar constructores para la inyección de dependencias y cómo modularizar de forma correcta las clases DTO?\n\nAdjunto código de ejemplo:\n```java\n@RestController\n@RequestMapping(\"/api\")\npublic class MiController {\n    // ¿Inyección por constructor o @Autowired?\n}\n```\n\n¡Agradezco sus sugerencias!";
        } else if (lowerPrompt.contains("react") || lowerPrompt.contains("front")) {
            title = "Optimización de renderizado en React";
            body = "Hola foro,\n\nQuisiera consultarles sobre el manejo de estados en componentes grandes de React.\n\n¿Es conveniente separar los estados locales con hooks personalizados o delegar directamente en un proveedor de contexto general (Context API)? Además, ¿cómo evito renders innecesarios en componentes hijos?\n\n¡Gracias!";
        } else if (lowerPrompt.contains("websocket") || lowerPrompt.contains("chat")) {
            title = "Implementación de WebSockets con STOMP";
            body = "Hola a todos,\n\nEstoy agregando una sala de chat grupal en tiempo real a mi sistema y estoy utilizando Spring WebSocket con el broker STOMP.\n\n¿Cuál es la mejor estrategia para manejar desconexiones de usuarios y reconectar el socket automáticamente desde el frontend sin saturar el servidor?\n\n¡Saludos!";
        } else if (lowerPrompt.contains("error") || lowerPrompt.contains("bug")) {
            title = "Resolución de error de compilación / carga";
            body = "Hola foro,\n\nMe está surgiendo un error inesperado al intentar compilar el módulo del servidor. La consola arroja el siguiente detalle:\n```\njava.lang.NoClassDefFoundError: wrong name\n```\n\n¿Alguien ha lidiado con esto anteriormente y sabe si se debe a una discrepancia de paquetes en el classpath?\n\n¡Quedo atento, gracias!";
        }

        return new AIDraftResponse(title, body);
    }

    private AISummaryResponse getMockSummary(String titulo, List<String> respuestas) {
        StringBuilder summary = new StringBuilder();
        summary.append("### 🤖 Resumen del Asistente IA\n\n");
        summary.append("**Tema Principal:** ").append(titulo).append("\n\n");
        summary.append("**Análisis de la Consulta:** El usuario expone una duda o problema relacionado con la temática planteada en su mensaje original. ");

        if (respuestas == null || respuestas.isEmpty()) {
            summary.append("Actualmente, este hilo **no cuenta con respuestas**. Se sugiere iniciar la conversación aportando soluciones o recomendando material técnico relevante.");
        } else {
            summary.append("El hilo cuenta con **").append(respuestas.size()).append(" respuestas**. ");
            boolean hasSolution = respuestas.stream().anyMatch(r -> r.contains("✔") || r.toLowerCase().contains("solución") || r.toLowerCase().contains("solucion"));

            if (hasSolution) {
                summary.append("¡Buenas noticias! La comunidad ha identificado y **marcado una respuesta como la solución definitiva** al problema planteado, resolviendo los puntos clave de la discusión.");
            } else {
                summary.append("Los participantes han aportado diversas sugerencias, sin embargo, **aún no se ha marcado ninguna respuesta como la solución oficial**. Se recomienda al autor del tópico validar las respuestas recibidas y marcar la correcta.");
            }
        }

        return new AISummaryResponse(summary.toString());
    }

    public DatosAutocompleteCursoResponse autocompleteCourse(String nombre, String categoria) {
        if (isKeyConfigured(geminiApiKey)) {
            try {
                String url = geminiBaseUrl + "/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;
                String systemPrompt = "Eres un asistente técnico que ayuda a redactar metadatos para cursos de programación. " +
                        "Basado en el nombre del curso: \"" + nombre + "\" y su categoría: \"" + categoria + "\", genera una descripción concisa de 2 líneas en español y un listado de 4 o 5 etiquetas (tags) separadas por comas. " +
                        "Tu respuesta DEBE ser únicamente un objeto JSON con los campos exactos \"descripcion\" y \"tags\". No agregues nada de formato Markdown adicional ni comentarios.";

                Map<String, Object> request = Map.of(
                        "contents", List.of(
                                Map.of(
                                        "parts", List.of(
                                                Map.of("text", systemPrompt)
                                        )
                                )
                        )
                );

                String responseStr = restTemplate.postForObject(url, request, String.class);
                JsonNode root = objectMapper.readTree(responseStr);
                String rawText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                
                return parseAutocompleteResponse(rawText);
            } catch (Exception e) {
                System.err.println("Gemini Autocomplete error (falling back): " + e.getMessage());
            }
        }

        if (isKeyConfigured(openrouterApiKey)) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openrouterApiKey);

                String systemPrompt = "Genera una descripción corta (2 líneas) y 4 tags (separados por comas) para el curso \"" + nombre + "\" con categoría \"" + categoria + "\". " +
                        "Responde únicamente con un objeto JSON con los campos \"descripcion\" y \"tags\".";

                Map<String, Object> request = Map.of(
                        "model", "openrouter/auto",
                        "messages", List.of(
                                Map.of("role", "user", "content", systemPrompt)
                        )
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
                String responseStr = restTemplate.postForObject(openrouterUrl, entity, String.class);
                JsonNode root = objectMapper.readTree(responseStr);
                String rawText = root.path("choices").get(0).path("message").path("content").asText();

                return parseAutocompleteResponse(rawText);
            } catch (Exception e) {
                System.err.println("OpenRouter Autocomplete error (falling back): " + e.getMessage());
            }
        }

        // Mock Fallback
        String mockDesc = "Aprende de manera práctica los fundamentos y conceptos avanzados sobre " + nombre + ", diseñado para potenciar tu carrera profesional.";
        String mockTags = "Programación, " + (categoria != null ? capitalize(categoria.toLowerCase().replace("_", " ")) : "Tecnología") + ", Software";
        return new DatosAutocompleteCursoResponse(mockDesc, mockTags);
    }

    private DatosAutocompleteCursoResponse parseAutocompleteResponse(String rawText) throws Exception {
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();
        
        JsonNode responseJson = objectMapper.readTree(cleaned);
        String desc = responseJson.path("descripcion").asText("Detalles del curso de programación.");
        String tags = responseJson.path("tags").asText("Programación, Web");
        return new DatosAutocompleteCursoResponse(desc, tags);
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return "";
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }
}
