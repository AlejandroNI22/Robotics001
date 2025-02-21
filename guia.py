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

    # Respuesta Directa
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

    # Separador
    doc.append(NoEscape(r'\hrulefill'))

    # Nota Detallada
    with doc.create(Section('Nota Detallada')):
        doc.append("El método de Denavit-Hartenberg (DH), conocido también como \"método de Denavit-Hartenberg (DH)\" en español, es una convención fundamental en ingeniería robótica para describir la cinemática de manipuladores en serie. Introducido por Jacques Denavit y Richard Hartenberg en 1955, este método estandariza la asignación de marcos de coordenadas a los enlaces y juntas de un robot, facilitando el análisis cinemático, especialmente para sistemas robóticos espaciales. Richard Paul destacó su valor para el análisis cinemático en 1981, y sigue siendo una aproximación popular a pesar de otras convenciones desarrolladas.\n")

        with doc.create(Subsection('Definición y Parámetros')):
            doc.append("El método DH se basa en cuatro parámetros asociados a cada junta, que describen la relación geométrica entre marcos de coordenadas consecutivos:\n")
            doc.append("- θ: Ángulo de rotación alrededor del eje z del marco anterior, variable para juntas rotativas.\n")
            doc.append("- d: Desplazamiento a lo largo del eje z del marco anterior, variable para juntas prismáticas.\n")
            doc.append("- a: Longitud del enlace, que es la distancia entre los ejes z de dos juntas consecutivas, constante.\n")
            doc.append("- α: Ángulo de torsión alrededor del eje x común, constante, que define la orientación relativa entre ejes z.\n")
            doc.append("Estos parámetros se utilizan para construir matrices de transformación homogénea, que combinan rotaciones y traslaciones. La transformación general de un marco i-1 a i se expresa como:\n")
            with doc.create(Math()):
                doc.append(NoEscape(r'T_{i-1,i} = R_z(\theta_i) \cdot T_z(d_i) \cdot T_x(a_i) \cdot R_x(\alpha_i)'))
            doc.append("donde \( R_z \) y \( R_x \) son rotaciones alrededor de los ejes z y x, y \( T_z \), \( T_x \) son traslaciones a lo largo de los ejes z y x, respectivamente.\n")

        with doc.create(Subsection('Asignación de Marcos de Coordenadas')):
            doc.append("La convención DH especifica reglas claras para asignar marcos:\n")
            doc.append("- El eje z de cada marco se alinea con el eje de movimiento de la junta (rotación para juntas rotativas, traslación para prismáticas).\n")
            doc.append("- El eje x es perpendicular al eje z y yace en el plano que contiene el eje z actual y el eje z del siguiente marco.\n")
            doc.append("- El origen de cada marco está en la intersección del eje z actual y el eje x del marco anterior.\n")
            doc.append("Esta asignación no es única, y diferentes configuraciones pueden llevar a conjuntos de parámetros DH distintos, aunque los resultados cinemáticos finales deben ser consistentes. Es crucial seguir la convención para evitar errores, especialmente en robots con configuraciones no estándar.\n")

        with doc.create(Subsection('Tipos de Juntas y Variables')):
            doc.append("Es importante notar que para juntas rotativas, θ es la variable (el ángulo de rotación), mientras que d es constante. Para juntas prismáticas, d es la variable (desplazamiento lineal), y θ suele ser constante, a menudo 0. Esto afecta cómo se llena una tabla DH, que típicamente tiene la forma:\n")
            with doc.create(Tabular('|c|c|c|c|c|')) as table:
                table.add_hline()
                table.add_row((bold('Junta'), bold('θ (grados)'), bold('d (mm)'), bold('a (mm)'), bold('α (grados)')))
                table.add_hline()
                table.add_row(('1', 'θ₁', 'd₁', 'a₁', 'α₁'))
                table.add_row(('2', 'θ₂', 'd₂', 'a₂', 'α₂'))
                table.add_row(('...', '...', '...', '...', '...'))
                table.add_hline()
            doc.append("En esta tabla, θ y d representan las variables de junta, dependiendo del tipo, mientras que a y α son parámetros fijos basados en el diseño mecánico.\n")

        with doc.create(Subsection('Cálculo de Cinemática Directa')):
            doc.append("La cinemática directa se calcula multiplicando las matrices de transformación individuales desde la base hasta el efector final:\n")
            with doc.create(Math()):
                doc.append(NoEscape(r'T_{\text{base,efector}} = T_{0,1} \cdot T_{1,2} \cdot \ldots \cdot T_{n-1,n}'))
            doc.append("Cada \( T_{i-1,i} \) se deriva de los parámetros DH y proporciona la posición y orientación del efector final en términos del marco base. Por ejemplo, para un robot plano de 2 juntas rotativas con \( \alpha_1 = \alpha_2 = 0 \) y \( d_1 = d_2 = 0 \), las matrices se simplifican, y la posición resulta en:\n")
            with doc.create(Math()):
                doc.append(NoEscape(r'x = a_1 \cos(\theta_1) + a_2 \cos(\theta_1 + \theta_2)'))
            with doc.create(Math()):
                doc.append(NoEscape(r'y = a_1 \sin(\theta_1) + a_2 \sin(\theta_1 + \theta_2)'))
            with doc.create(Math()):
                doc.append(NoEscape(r'z = 0'))
            doc.append("Este ejemplo ilustra cómo los parámetros DH permiten calcular posiciones de manera sistemática, lo cual es sorprendente dado su simplicidad para problemas complejos.\n")

        with doc.create(Subsection('Aplicaciones y Limitaciones')):
            doc.append("El método DH es esencial para modelar, simular y controlar robots, especialmente en documentación de robots industriales y literatura de investigación. Es particularmente útil para robots en serie, pero para robots paralelos, se requieren otros métodos. Además, existen convenciones modificadas (como la DH modificada), que alteran el orden de parámetros o la asignación de marcos, pero la estándar es la más común.\n")

        with doc.create(Subsection('Recursos y Lecturas Adicionales')):
            doc.append("Para profundizar, se pueden consultar:\n")
            doc.append("- La página de Wikipedia sobre parámetros DH (\\url{https://en.wikipedia.org/wiki/Denavit–Hartenberg_parameters}), que ofrece una definición detallada y ejemplos.\n")
            doc.append("- Tutoriales como el de AutomaticAddison (\\url{https://automaticaddison.com/how-to-find-denavit-hartenberg-parameter-tables/}), que explica cómo encontrar tablas DH para brazos robóticos.\n")
            doc.append("- Recursos educativos como Robot Academy (\\url{https://robotacademy.net.au/lesson/denavit-hartenberg-notation/}), que incluye explicaciones y visualizaciones, incluyendo un video útil para entender los parámetros.\n")
            doc.append("Estos recursos proporcionan ejemplos prácticos, como el brazo SCARA, y herramientas para implementar cálculos cinemáticos.\n")

        with doc.create(Subsection('Conclusión')):
            doc.append("El método DH es una herramienta poderosa y ampliamente utilizada en robótica, ofreciendo una forma compacta y estandarizada de describir la cinemática. Su capacidad para manejar tanto juntas rotativas como prismáticas, y su aplicación en cálculos de posición y orientación, lo hacen indispensable. Sin embargo, requiere cuidado en la asignación de marcos para evitar errores, especialmente en configuraciones complejas.\n")

        doc.append(bold('Citas Clave:') + '\n')
        doc.append("- [Parámetros Denavit-Hartenberg - Wikipedia](https://en.wikipedia.org/wiki/Denavit–Hartenberg_parameters)\n")
        doc.append("- [Cómo Encontrar Tablas de Parámetros Denavit-Hartenberg](https://automaticaddison.com/how-to-find-denavit-hartenberg-parameter-tables/)\n")
        doc.append("- [Notación Denavit-Hartenberg | Robot Academy](https://robotacademy.net.au/lesson/denavit-hartenberg-notation/)\n")

    # Generar el PDF
    doc.generate_pdf(clean_tex=False)
    print(f"Documento PDF generado exitosamente: {file_name}.pdf")

if __name__ == "__main__":
    create_dh_document()