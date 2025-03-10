import numpy as np
import matplotlib.pyplot as plt
import roboticstoolbox as rtb
from spatialmath import SE3

# Definición del robot
cubo1 = rtb.DHRobot([
    rtb.RevoluteDH(d=0.330, a=0, alpha=np.pi/2, qlim=[-5.93, 5.93]),
    rtb.RevoluteDH(d=0, a=0.260, alpha=0, offset=np.pi/2, qlim=[-1.75, 2.79]),
    rtb.RevoluteDH(d=0, a=0.020, alpha=np.pi/2, qlim=[-2.44, 2.44]),
    rtb.RevoluteDH(d=0.29, a=0, alpha=-np.pi/2, qlim=[-3.14, 3.14]),
    rtb.RevoluteDH(d=0, a=0, alpha=np.pi/2, qlim=[-2.09, 2.09]),
    rtb.RevoluteDH(d=0.070, a=0, alpha=0, qlim=[-6.28, 6.28])
], name="LR Mate 200iD", base=SE3(0, 0, 0))

# Configuración inicial del robot
cubo1.tool = SE3.OA([0, 1, 0], [0, 0, 1])
cubo1.qz = [0, 0, 0, 0, 0, 0]
print(cubo1)

# Graficar la posición inicial del robot
cubo1.plot(q=cubo1.qz, limits=[-1, 1, -1, 1, 0, 1], eeframe=True, backend='pyplot', shadow=True, jointaxes=True, block=True)

# Definición de los puntos de la trayectoria
T = np.array([
    [-0.25, 0.25, 0.15], [-0.25, 0.25, 0.40], [-0.25, -0.25, 0.40], [-0.25, -0.25, 0.15],
    [0.25, -0.25, 0.15], [0.25, -0.25, 0.40], [0.25, 0.25, 0.40], [0.25, 0.25, 0.15], [-0.25, 0.25, 0.15]
])

# Generación de la trayectoria
via = np.empty((0, 3))
for punto in T:
    via = np.vstack((via, np.array(punto)))
xyz_traj = rtb.mstraj(via, qdmax=[0.5, 0.5, 0.5], dt=0.02, tacc=0.2).q

# Graficar la trayectoria
fig = plt.figure()
ax = fig.add_subplot(111, projection="3d")
plt.plot(xyz_traj[:, 0], xyz_traj[:, 1], xyz_traj[:, 2])
ax.scatter(xyz_traj[0, 0], xyz_traj[0, 1], xyz_traj[0, 2], color='red', marker='*')
ax.scatter(xyz_traj[-1, 0], xyz_traj[-1, 1], xyz_traj[-1, 2], color='blue', marker='o')
plt.show()

# Transformación de la herramienta y solución de cinemática inversa
T_tool = SE3.Trans(-0.15, 0, 0.0) * SE3.Trans(xyz_traj) * SE3.OA([0, -1, 0], [1, 0, 0])
sol = cubo1.ikine_LM(T_tool, "lu")
print(sol.success)

# Graficar la solución de la cinemática inversa
cubo1.plot(q=sol.q, limits=[-0.3, 0.6, -0.6, 0.6, -0.1, 1], eeframe=True, backend='pyplot', shadow=True, jointaxes=True, block=True, movie='TransCubo.gif')