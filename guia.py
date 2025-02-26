from pylatex import Document, Section, Subsection, Command, Math, Tabular, NoEscape
from pylatex.utils import italic, bold

def create_dh_document(file_name='Metodo_Denavit_Hartenberg'):
    # Configuración del documento
    geometry_options = {"margin": "1in"}
    doc = Document(file_name, geometry_options=geometry_options)

    # Paquetes necesarios para ecuaciones y formato
    doc.preamble.append(Command('usepackage', 'amsmath'))  # Matemáticas avanzadas
    doc.preamble.append(Command('usepackage', 'utf8x'))    # Soporte UTF-8

    # Título y encabezado
    doc.preamble.append(Command('title', 'Método de Denavit-Hartenberg (DH)'))
    doc.preamble.append(Command('author', 'Generado por Grok 3 (xAI)'))
    doc.preamble.append(Command('date', '20 de febrero de 2025'))
    doc.append(NoEscape(r'\maketitle'))

    # Contenido principal
    with doc.create(Section('Respuesta Directa')):
        doc.append("El método de Denavit-Hartenberg (DH) es una técnica estándar en robótica para describir la cinemática de brazos robóticos en serie, usando cuatro parámetros por junta.\n")
        doc.append("Se introdujo en 1955 por Jacques Denavit y Richard Hartenberg para estandarizar sistemas de coordenadas.\n")
        doc.append("Los parámetros son: ángulo de rotación (θ), desplazamiento a lo largo del eje z (d), longitud del enlace (a), y ángulo de torsión (α).\n")
        doc.append("Es sorprendente cómo este método, aunque técnico, permite calcular fácilmente la posición y orientación del efector final, como en un robot plano de 2 juntas, donde la posición depende de ángulos y longitudes específicas.\n")

        with doc.create(Subsection('¿Qué es el Método DH?')):
            doc.append("El método DH asigna marcos de coordenadas a cada junta de un robot para modelar su movimiento. Cada junta tiene un marco con un eje z alineado con el eje de movimiento (rotación o traslación) y un eje x perpendicular, facilitando cálculos cinemáticos.\n")

        with doc.create(Subsection('¿Cómo Funciona?')):
            doc.append("Usa cuatro parámetros por junta: θ (ángulo variable para juntas rotativas), d (desplazamiento variable para juntas prismáticas), a (longitud fija del enlace), y α (ángulo fijo de torsión). Estas se combinan en matrices de transformación homogénea para encontrar la posición del efector final.\n")

        with doc.create(Subsection('Ejemplo Simple')):
            doc.append("Para un robot plano de 2 juntas rotativas:\n")
            doc.append("- Junta 1: θ₁ variable, d₁ = 0, a₁ fija, α₁ = 0.\n")
            doc.append("- Junta 2: θ₂ variable, d₂ = 0, a₂ fija, α₂ = 0.\n")
            doc.append("La posición del efector final es:\n")
            with doc.create(Math()):
                doc.append(NoEscape(r'x = a_1 \cos(\theta_1) + a_2 \cos(\theta_1 + \theta_2)'))
            with doc.create(Math()):
                doc.append(NoEscape(r'y = a_1 \sin(\theta_1) + a_2 \sin(\theta_1 + \theta_2)'))
            with doc.create(Math()):
                doc.append(NoEscape(r'z = 0'))

    # Generar el PDF
    doc.generate_pdf(clean_tex=False, compiler='pdflatex')
    print(f"Documento PDF generado exitosamente: {file_name}.pdf")

if __name__ == "__main__":
    create_dh_document()