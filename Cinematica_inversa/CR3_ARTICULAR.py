import sympy as sp
from sympy.matrices import rot_axis3
from spatialmath import SE3
from spatialmath.base import *
import matplotlib.pyplot as plt
import numpy as np
import roboticstoolbox as rtb
from roboticstoolbox import jtraj

# Definimos el modelo DH para el LR Mate 200iD
cubo1 = rtb.DHRobot([
    rtb.RevoluteDH(d=134, a=0, alpha=np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
    rtb.RevoluteDH(d=128.8, a=274, alpha=np.pi, offset=np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
    rtb.RevoluteDH(d=116, a=230, alpha=-np.pi, qlim=[-0.8611*np.pi, 0.8611*np.pi]), 
    rtb.RevoluteDH(d=116, a=0, alpha=-np.pi/2, offset=-np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
    rtb.RevoluteDH(d=116, a=0, alpha=np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
    rtb.RevoluteDH(d=105, a=0, alpha=0, qlim=[-2*np.pi, 2*np.pi]),
], name="Cobot CR3", base=SE3(0,0,0))

cubo1.tool = SE3.OA([0, 1, 0], [0, 0, 1])
cubo1.qz = [0, 0, 0, 0, 0, 0]
print(cubo1)

# Nueva matriz de configuraciones articulares en grados
new_q_list_deg = [
    [-3.35, -1.52, -103.32, 14.84, 90.00, -3.35],
    [30.78, 4.63, -109.26, 14.63, 90.00, 30.78],
    [30.78, -30.34, -134.02, 74.36, 90.00, 30.78],
    [-3.35, -32.83, -126.54, 69.36, 90.00, -3.35],
    [-3.35, -1.52, -103.32, 14.84, 90.00, -3.35],
    [-2.12, -46.29, -37.30, -6.41, 90.00, -2.12],
    [-2.12, -58.89, -64.50, 33.39, 90.00, -2.12],
    [-3.35, -32.83, -126.54, 69.36, 90.00, -3.35],
    [-3.35, -1.52, -103.32, 14.84, 90.00, -3.35],
    [-2.12, -46.29, -37.30, -6.41, 90.00, -2.12],
    [19.30, -40.71, -47.48, -1.82, 90.00, 19.30],
    [19.30, -55.58, -71.89, 37.46, 90.00, 19.30],
    [-2.12, -58.89, -64.50, 33.39, 90.00, -2.12],
    [-2.12, -46.29, -37.30, -6.41, 90.00, -2.12],
    [19.30, -40.71, -47.48, -1.82, 90.00, 19.30],
    [19.30, -40.71, -47.48, -1.82, 90.00, 19.30],
    [30.78, -30.34, -134.02, 74.36, 90.00, 30.78],
    [19.30, -55.58, -71.89, 37.46, 90.00, 19.30],
    [19.30, -40.71, -47.48, -1.82, 90.00, 19.30],
    [30.78, 4.63, -109.26, 14.63, 90.00, 30.78],
    [-3.35, -1.52, -103.32, 14.84, 90.00, -3.35]
]

# Convertir la nueva matriz de configuraciones articulares a radianes
new_q_list = [np.deg2rad(q) for q in new_q_list_deg]

# Generar trayectorias suaves entre las nuevas configuraciones
t = np.linspace(0, 1, 50)  # Definir el tiempo para la interpolación
new_traj = np.concatenate([jtraj(new_q_list[i], new_q_list[i + 1], t).q for i in range(len(new_q_list) - 1)], axis=0)

# Visualizar la nueva trayectoria completa
cubo1.plot(new_traj, limits=[-600,600,-600,600,0,600], eeframe=True, backend='pyplot', shadow=True, jointaxes=True, block=False)

# Graficar la nueva trayectoria del efector final en el espacio cartesiano
fig = plt.figure(figsize=(10, 8))
ax1 = fig.add_subplot(211, projection='3d')
ax2 = fig.add_subplot(212)

# Nueva trayectoria del efector final
new_end_effector_traj = np.array([cubo1.fkine(q).t for q in new_traj])
ax1.plot(new_end_effector_traj[:, 0], new_end_effector_traj[:, 1], new_end_effector_traj[:, 2])
ax1.set_title('Nueva trayectoria del efector final en el espacio cartesiano')
ax1.set_xlabel('X')
ax1.set_ylabel('Y')
ax1.set_zlabel('Z')

# Guardar la nueva gráfica de la trayectoria del efector final
fig.savefig('nueva_trayectoria_efector_final.png')

# Nuevas posiciones articulares a lo largo de la trayectoria
for i in range(new_traj.shape[1]):
    ax2.plot(new_traj[:, i], label=f'Joint {i+1}')
ax2.set_title('Nuevas posiciones articulares a lo largo de la trayectoria')
ax2.set_xlabel('Tiempo')
ax2.set_ylabel('Ángulo (rad)')
ax2.legend()

# Guardar la nueva gráfica de las posiciones articulares
fig.savefig('nuevas_posiciones_articulares.png')

plt.tight_layout()
plt.show(block=True)
