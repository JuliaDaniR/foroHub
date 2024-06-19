package com.aluracursos.forohub.enumerador;

public enum Categoria {

    LENGUAJES_DE_PROGRAMACION("Lenguajes de Programacion", new String[]{
        "Java",
        "Python",
        "JavaScript",
        "C#",
        "C++",
        "Ruby",
        "Swift",
        "Kotlin",
        "TypeScript",
        "Go",
        "PHP",
        "HTML/CSS"
    }),
    FRAMEWORKS_Y_BIBLIOTECAS("Frameworks y Bibliotecas", new String[]{
        "Spring Framework",
        "Django",
        "React.js",
        "Angular",
        "Vue.js",
        "Express.js",
        "Flutter",
        ".NET Core",
        "Ruby on Rails",
        "Laravel"
    }),
    DESARROLLO_WEB("Desarrollo Web", new String[]{
        "Frontend Development",
        "Backend Development",
        "Desarrollo Full Stack",
        "Arquitectura Web",
        "Seguridad Web",
        "Experiencia de Usuario (UX)",
        "Diseño Web"
    }),
    DESARROLLO_DE_APLICACIONES_MOVILES("Desarrollo de Aplicaciones Moviles", new String[]{
        "iOS Development",
        "Android Development",
        "Desarrollo Cross-Platform",
        "Diseño de Interfaz de Usuario Móvil (UI)",
        "Desarrollo de Juegos Móviles"
    }),
    DEVOPS_Y_DESPLIEGUE("DevOps y Despliegue", new String[]{
        "Integración Continua / Entrega Continua (CI/CD)",
        "Administración de Sistemas",
        "Contenedores (Docker, Kubernetes)",
        "Gestión de Configuración (Ansible, Chef, Puppet)",
        "Monitoreo y Registro"
    }),
    BASES_DE_DATOS_Y_ALMACENAMIENTO_DE_DATOS("Bases de Datos y Almacenamiento de Datos", new String[]{
        "SQL",
        "NoSQL",
        "Bases de Datos Relacionales",
        "Bases de Datos No Relacionales",
        "Modelado de Datos",
        "Big Data"
    }),
    INTELIGENCIA_ARTIFICIAL_Y_CIENCIA_DE_DATOS("Inteligencia Artificial y Ciencia de Datos", new String[]{
        "Machine Learning",
        "Deep Learning",
        "Procesamiento del Lenguaje Natural (NLP)",
        "Visión por Computadora",
        "Análisis de Datos",
        "Minería de Datos"
    }),
    SEGURIDAD_INFORMATICA("Seguridad Informatica", new String[]{
        "Ciberseguridad",
        "Ethical Hacking",
        "Auditoría de Seguridad",
        "Protección de Datos",
        "Criptografía"
    }),
    OTROS("Otros", new String[]{
        "Desarrollo de Videojuegos",
        "Desarrollo de Software Empresarial",
        "Metodologías de Desarrollo Ágil",
        "Tutoriales y Recursos de Aprendizaje",
        "Carrera y Desarrollo Profesional"
    });

    private final String descripcion;
    private final String[] subcategorias;

    Categoria(String descripcion, String[] subcategorias) {
        this.descripcion = descripcion;
        this.subcategorias = subcategorias;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public String[] getSubcategorias() {
        return subcategorias;
    }
}
