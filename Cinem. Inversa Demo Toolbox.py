import roboticstoolbox as rtb
import spatialmath.base as smb
import spatialmath as sm
import numpy as np

np.set_printoptions(suppress=True, precision=4)

# # Crear instancia del Puma560
# p560 = rtb.models.DH.Puma560()

# # Graficar el robot en su posición inicial (qz)
# p560.plot(p560.qz, block=False)

# # Definir una matriz homogénea (una traslación y una rotación)
# T = sm.SE3.Trans(0.4, 0.1, 0) * sm.SE3(smb.rpy2tr(0, 180, 0, 'deg'))
# print(T, "\n")

# # Graficar la matriz (sobre el robot)
# smb.trplot(T.A, block=True)

# # Calcular la cinemática inversa para la matriz de transformación T
# q = p560.ikine_a(T)  # Default: izquierda codo arriba
# print(f"Izq, codo arriba\n {q.q}")

# # En grados
# print(f"Izq, codo arriba grados:\n {np.rad2deg(q.q)}")

# # Mostrar robot en posición calculada
# p560.plot(q.q, block=True)

# # Calcular inversa con configuración derecha, codo arriba
# q = p560.ikine_a(T, config='ru')
# print(f"Der, codo arriba\n {q.q}")

# # En grados
# print(f"Der, codo arriba grados:\n {np.rad2deg(q.q)}")

# p560.plot(q.q, block=True)

# # Calcular inversa con configuración derecha, codo abajo
# q = p560.ikine_a(T, config='rd')
# print(f"Der, codo abajo\n {q.q}")
# # En grados
# print(f"Der, codo abajo grados:\n {np.rad2deg(q.q)}")
# p560.plot(q.q, block=True)

# # Calcular inversa con configuración izquierda, codo abajo
# q = p560.ikine_a(T, config='ld')
# print(f"Izq, codo abajo\n {q.q}")
# # En grados
# print(f"Izq, codo abajo grados:\n {np.rad2deg(q.q)}")
# p560.plot(q.q, block=True)

# Crear instancia de un robot Kuka KR5
robot = rtb.DHRobot(
    [
        rtb.RevoluteDH(d=0.4, a=0.180, alpha=np.pi/2, qlim=[np.deg2rad(-155), np.deg2rad(155)]),
        rtb.RevoluteDH(d=0, a=0.6, alpha=0, offset=np.pi/2, qlim=[np.deg2rad(-180), np.deg2rad(65)]),
        rtb.RevoluteDH(d=0, a=1.20, alpha=np.pi/2, qlim=[np.deg2rad(-110), np.deg2rad(170)]),
        rtb.RevoluteDH(d=0.620, a=0, alpha=-np.pi/2, qlim=[np.deg2rad(-165), np.deg2rad(165)]),
        rtb.RevoluteDH(d=0, a=0, alpha=np.pi/2, qlim=[np.deg2rad(-140), np.deg2rad(140)]),
        rtb.RevoluteDH(d=0.115, a=0, alpha=0, qlim=[np.deg2rad(-360), np.deg2rad(360)]),
    ],
    name="Kuka KR5",
    base=sm.SE3(0, 0, 0)
)
print(robot)

robot.qz = [np.deg2rad(0), np.deg2rad(0), np.deg2rad(0), np.deg2rad(0), np.deg2rad(0), np.deg2rad(0)]
# robot.teach(robot.qz)
T_inicial = robot.fkine(robot.qz)
print(f"Matriz de posición inicial:\n{T_inicial}")

# Roll 180 en X, Pitch 0 en Y, Yaw 0 en Z
T_destino = sm.SE3.Trans(0.915, 0.0, 2.2) * sm.SE3(smb.rpy2tr(0, 0, 0.0, 'deg'))
print("Matriz T_destino:\n", T_destino, "\n")

# Para mantener código arriba
q_inicial = np.array([0, np.deg2rad(45), np.deg2rad(90), 0, np.deg2rad(0), 0])
robot.plot(q_inicial, block=True)

q = robot.ikine_LM(T_destino, q0=q_inicial, ilimit=100, slimit=100, tol=1e-6)
print(f"Éxito: {q.success}")
if q.success:
    print(f"Solución de cinemática inversa: {q.q}")
    T_resultado = robot.fkine(q.q)
    print(f"Matriz resultante después de IK:\n{T_resultado}")
    # Visualizar el robot en la posición calculada
    robot.plot(q.q, block=True)
else:
    print("No se encontró solución")
    