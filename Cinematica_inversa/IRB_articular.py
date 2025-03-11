import sympy as sp
from sympy.matrices import rot_axis3
from spatialmath import SE3
from spatialmath.base import *
import matplotlib.pyplot as plt
import numpy as np
import roboticstoolbox as rtb
from roboticstoolbox import jtraj

# Definimos el modelo DH para el ABB-IRB-120-3-0-6
cubo1 = rtb.DHRobot([
    rtb.RevoluteDH(d=290, a=0, alpha=np.pi/2, qlim=[-2.88, 2.88]),
    rtb.RevoluteDH(d=0, a=270, alpha=0, offset=np.pi/2, qlim=[-1.92, 1.92]),
    rtb.RevoluteDH(d=0, a=70, alpha=np.pi/2, qlim=[-1.92, 1.22]),
    rtb.RevoluteDH(d=302, a=0, alpha=-np.pi/2, qlim=[-2.79, 2.79]),
    rtb.RevoluteDH(d=0, a=0, alpha=np.pi/2, qlim=[-2.09, 2.09]),
    rtb.RevoluteDH(d=72, a=0, alpha=0, qlim=[-6.98, 6.98])
], name="ABB-IRB-120-3-0-6", base=SE3(0,0,0))

cubo1.tool = SE3.OA([0, 1, 0], [0, 0, 1])
cubo1.qz = [0, 0, 0, 0, 0, 0]
print(cubo1)

# Definir configuraciones articulares en grados
q_list_deg = [
    np.array([0, 0, 0, 0, 0, 0]),
    np.array([45, -45, 45, -45, 45, -45]),
    np.array([-45, 45, -45, 45, -45, 45]),
    np.array([90, -90, 90, -90, 90, -90]),
    np.array([-90, 90, -90, 90, -90, 90])
]

# Convertir configuraciones articulares a radianes
q_list = [np.deg2rad(q) for q in q_list_deg]

# Definir el vector de tiempo
t = np.linspace(0, 3, 30)

# Generar trayectorias suaves entre configuraciones
traj = np.concatenate([jtraj(q_list[i], q_list[i + 1], t).q for i in range(len(q_list) - 1)], axis=0)

# Visualizar la trayectoria completa
cubo1.plot(traj, limits=[-600,600,-600,600,0,600], eeframe=True, backend='pyplot', shadow=True, jointaxes=True, block=True)

# Graficar la trayectoria del efector final en el espacio cartesiano
fig = plt.figure(figsize=(10, 8))
ax1 = fig.add_subplot(211, projection='3d')
ax2 = fig.add_subplot(212)

# Trayectoria del efector final
end_effector_traj = np.array([cubo1.fkine(q).t for q in traj])
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
