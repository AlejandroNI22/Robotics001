import sympy as sp
from sympy.matrices import rot_axis3
# Para el ejemplo donde generamos la matriz DH
from spatialmath import *
from spatialmath.base import *
# Para poder Graficar
import matplotlib.pyplot as plt
import numpy as np
#Para usar el DH
import roboticstoolbox as rtb

# Definimos el modelo DH para el ABB-IRB-120-3-0-6
lrmate = rtb.DHRobot([
    rtb.RevoluteDH(d=0.290, a=0, alpha=np.pi/2, qlim=[-2.88, 2.88]),
    rtb.RevoluteDH(d=0, a=.27, alpha= 0, offset=np.pi/2, qlim=[-1.92, 1.92]),
    rtb.RevoluteDH(d=0, a=0.07, alpha=np.pi/2, qlim=[-1.92, 1.22]),
    rtb.RevoluteDH(d=0.302, a=0, alpha=-np.pi/2, qlim=[-2.79, 2.79]),
    rtb.RevoluteDH(d=0, a=0, alpha=np.pi/2, qlim=[-2.09, 2.09]),
    rtb.RevoluteDH(d=0.072, a=0, alpha=0, qlim=[-6.98, 6.98])
], name="ABB-IRB-120-3-0-6", base=SE3(0,0,0))

print(lrmate)

# Definimos posiciones articulares
joint1 = np.deg2rad(30)
joint2 = np.deg2rad(-45)
joint3 = np.deg2rad(60)
joint4 = np.deg2rad(-30)
joint5 = np.deg2rad(45)
joint6 = np.deg2rad(90)

# Matriz de transformación del efector final
T06DH = lrmate.fkine([joint1, joint2, joint3, joint4, joint5, joint6])
print(T06DH)

T06DH_all = lrmate.fkine_all([joint1, joint2, joint3, joint4, joint5, joint6])
print(T06DH_all[1]) # T01
print(T06DH_all[2]) # T12
print(T06DH_all[3]) # T23
print(T06DH_all[4]) # T34
print(T06DH_all[5]) # T45
print(T06DH_all[6]) # T56

# Definir variables articulares para la animación
q = np.array([
    [0, 0, 0, 0, 0, 0],
    [joint1, 0, 0, 0, 0, 0],
    [joint1, joint2, 0, 0, 0, 0],
    [joint1, joint2, joint3, 0, 0, 0],
    [joint1, joint2, joint3, joint4, 0, 0],
    [joint1, joint2, joint3, joint4, joint5, 0],
    [joint1, joint2, joint3, joint4, joint5, joint6],
    [joint1, joint2, joint3, joint4, joint5, 0],
    [joint1, joint2, joint3, joint4, 0, 0],
    [joint1, joint2, joint3, 0, 0, 0],
    [joint1, joint2, 0, 0, 0, 0],
    [joint1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
])

# Graficar con controlador
q1 = np.array([[0, 0, 0, 0, 0, 0]])
lrmate.teach(q1)
