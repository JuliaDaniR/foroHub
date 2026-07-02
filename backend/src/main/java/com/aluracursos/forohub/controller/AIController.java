package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.dto.*;
import com.aluracursos.forohub.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/generate-topic")
    public ResponseEntity<AIDraftResponse> generateTopic(@RequestBody AIDraftRequest request) {
        return ResponseEntity.ok(aiService.generateTopic(request.prompt()));
    }

    @PostMapping("/summarize")
    public ResponseEntity<AISummaryResponse> summarizeTopic(@RequestBody AISummaryRequest request) {
        return ResponseEntity.ok(aiService.summarizeTopic(request.titulo(), request.mensaje(), request.respuestas()));
    }

    @PostMapping("/autocomplete-course")
    public ResponseEntity<DatosAutocompleteCursoResponse> autocompleteCourse(@RequestBody DatosAutocompleteCursoRequest request) {
        return ResponseEntity.ok(aiService.autocompleteCourse(request.nombre(), request.categoriaPrincipal()));
    }
}
