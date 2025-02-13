import math

# Datos del cilindro
radio = 2.5  # cm
altura = 10  # cm
masa = 20  # kg

# Datos del robot Dobot CR3
capacidad_maxima = 3  # kg (capacidad máxima de carga del Dobot CR3)

# Gravedad
g = 9.81  # m/s^2

# Convertir radio y altura a metros
radio_m = radio / 100  # m
altura_m = altura / 100  # m

# Calcular el volumen del cilindro
volumen = math.pi * radio_m**2 * altura_m  # m^3

# Calcular la fuerza necesaria para levantar el cilindro
peso = masa * g  # N

# Verificar si el robot puede levantar la carga
if masa <= capacidad_maxima:
    print("El robot Dobot CR3 puede levantar el cilindro.")
else:
    print("El robot Dobot CR3 no puede levantar el cilindro.")
    
    