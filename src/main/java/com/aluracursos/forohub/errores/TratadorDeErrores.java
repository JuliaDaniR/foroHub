package com.aluracursos.forohub.errores;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class TratadorDeErrores {
    
    @ExceptionHandler(EntityNotFoundException.class)
//Le aviso que tipo de excepcion tiene que atrapar y transformar en 404 NotFound
    public ResponseEntity tratarError404() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)//Tratar errores de campos incompletos o erroneos
    public ResponseEntity tratarError400(MethodArgumentNotValidException e) {

        //Accedo a la lista de errores lanzados por la excepcion
        var errores = e.getFieldErrors().stream()
                .map(DatosErrorValidacion::new).toList();

        return ResponseEntity.badRequest().body(errores);
    }

    @ExceptionHandler(ValidacionIntegridad.class)//Tratar errores de campos incompletos o erroneos
    public ResponseEntity errorHandlerValidaciones(Exception e) {

        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(ValidationException.class)//Tratar errores de campos incompletos o erroneos
    public ResponseEntity errorHandlerValidacionesDeNegocio(Exception e) {

        return ResponseEntity.badRequest().body(e.getMessage());
    }

    private record DatosErrorValidacion(String campo, String error) {

        //Realizo un constructor para que me muestre solo el campo del error y el mensaje
        public DatosErrorValidacion(FieldError error) {
            this(error.getField(), error.getDefaultMessage());
        }
    }
}

