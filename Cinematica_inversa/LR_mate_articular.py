import sympy as sp
from spatialmath import SE3
from spatialmath.base import *
import matplotlib.pyplot as plt
import numpy as np
import roboticstoolbox as rtb
from roboticstoolbox.backends.PyPlot import PyPlot
from roboticstoolbox import jtraj
from mpl_toolkits.mplot3d import Axes3D

# Configurar NumPy para suprimir la notación científica y limitar la precisión
np.set_printoptions(suppress=True, precision=4,
                    formatter={'float': lambda x: f"{0:8.4g}" if abs(x) < 1e-10 else f"{x:8.4g}"})

# Declaramos nuestro robot, incluidos limites de movimiento
robot = rtb.DHRobot(
    [
        rtb.RevoluteDH(d=330, a=0, alpha=np.pi/2, qlim=[-2.89, 2.89]),
        rtb.RevoluteDH(d=0, a=440, alpha=0, offset=np.pi/2, qlim=[-1.75, 2.79]),
        rtb.RevoluteDH(d=0, a=35, alpha=np.pi/2, qlim=[-2.44, 2.44]),
        rtb.RevoluteDH(d=440, a=0, alpha=-np.pi/2, qlim=[-3.14, 3.14]),
        rtb.RevoluteDH(d=0, a=0, alpha=np.pi/2, qlim=[-2.09, 2.09]),
        rtb.RevoluteDH(d=80, a=0, alpha=0, qlim=[-6.28, 6.28]),
    ], name="LR mate 200", base=SE3(0, 0, 0))

# Definir configuraciones articulares en grados
q_list_deg = [
    np.array([0, 0, 0, 0, 0, 0]),
    np.array([30, -30, 30, -30, 30, -30]),
    np.array([-30, 30, -30, 30, -30, 30]),
    np.array([60, -60, 60, -60, 60, -60]),
    np.array([-60, 60, -60, 60, -60, 60])
]

# Convertir configuraciones articulares a radianes
q_list = [np.deg2rad(q) for q in q_list_deg]

# Definir el vector de tiempo
t = np.linspace(0, 3, 30)

# Generar trayectorias suaves entre configuraciones
traj = np.concatenate([jtraj(q_list[i], q_list[i + 1], t).q for i in range(len(q_list) - 1)], axis=0)

# Visualizar la trayectoria completa
robot.plot(traj)

# Graficar la trayectoria del efector final en el espacio cartesiano
fig = plt.figure(figsize=(10, 8))
ax1 = fig.add_subplot(211, projection='3d')
ax2 = fig.add_subplot(212)

# Trayectoria del efector final
end_effector_traj = np.array([robot.fkine(q).t for q in traj])
ax1.plot(end_effector_traj[:, 0], end_effector_traj[:, 1], end_effector_traj[:, 2])
ax1.set_title('Trayectoria del efector final en el espacio cartesiano')
ax1.set_xlabel('X')
ax1.set_ylabel('Y')
ax1.set_zlabel('Z')

# Guardar la gráfica de la trayectoria del efector final
fig.savefig('trayectoria_efector_final.png')

# Posiciones articulares a lo largo de la trayectoria
for i in range(traj.shape[1]):
    ax2.plot(traj[:, i], label=f'Joint {i+1}')
ax2.set_title('Posiciones articulares a lo largo de la trayectoria')
ax2.set_xlabel('Tiempo')
ax2.set_ylabel('Ángulo (rad)')
ax2.legend()

# Guardar la gráfica de las posiciones articulares
fig.savefig('posiciones_articulares.png')

plt.tight_layout()
plt.show(block=True)

