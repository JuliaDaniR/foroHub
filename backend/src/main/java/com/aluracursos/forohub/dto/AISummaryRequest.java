package com.aluracursos.forohub.dto;

import java.util.List;

public record AISummaryRequest(String titulo, String mensaje, List<String> respuestas) {
}
