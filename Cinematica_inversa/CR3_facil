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

# Definimos el modelo DH para el LR Mate 200iD
cubo1=rtb.DHRobot(
    [
   rtb.RevoluteDH(d=134, a=0, alpha=np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
rtb.RevoluteDH(d=128.8, a=274, alpha=np.pi, offset=np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
rtb.RevoluteDH(d=116, a=230, alpha=-np.pi, qlim=[-0.8611*np.pi, 0.8611*np.pi]), 
rtb.RevoluteDH(d=116, a=0, alpha=-np.pi/2, offset=-np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
rtb.RevoluteDH(d=116, a=0, alpha=np.pi/2, qlim=[-2*np.pi, 2*np.pi]), 
rtb.RevoluteDH(d=105, a=0, alpha=0, qlim=[-2*np.pi, 2*np.pi]),
    ], name="Cobot CR3", base=SE3(0,0,0))

cubo1.tool=SE3.OA([0, 1, 0],[0, 0, 1])
cubo1.configurations_str('ru')
cubo1.qz= [0, 0, 0, 0, 0, 0]
print(cubo1)

cubo1.plot(q=cubo1.qz, limits=[-600,600,-600,600,0,600], eeframe=True, backend='pyplot', shadow=True, jointaxes=True, block=True)
#Ponemos el TCP alineado con el brazo
cubo1.tool=SE3.OA([0, 1, 0], [0, 0, 1])
cubo1.configurations_str('ru') #Right, elbow Up
cubo1.qz = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0] #Valores el cero

#Puntos en el espacio, X, Y, Z
T = np.array([
    [200.0000, 150.0000,  50.0000],
    [200.0000, 150.0000, 200.0000],
    [200.0000, 300.0000, 200.0000],
    [200.0000, 300.0000,  50.0000],
    [200.0000, 150.0000,  50.0000],
    [350.0000, 150.0000,  50.0000],
    [350.0000, 150.0000, 200.0000],
    [350.0000, 300.0000, 200.0000],
    [350.0000, 300.0000,  50.0000],
    [350.0000, 150.0000,  50.0000],
    [200.0000, 150.0000, 200.0000],
    [200.0000, 300.0000, 200.0000],
    [350.0000, 300.0000, 200.0000],
    [350.0000, 300.0000,  50.0000]
])

T_tool = SE3.Trans(-0.15, 0, 0.0) * SE3.Trans(T) 
sol = cubo1.ikine_LM(T_tool, "lu")
print(sol.success)
cubo1.plot(q=sol.q, limits=[-600,600,-600,600,-600,600], dt=1, eeframe=True, backend='pyplot', shadow=True, jointaxes=True, block=True)

#Guardar imagen
cubo1.plot(q=sol.q, limits=[-600,600,-600,600,-600,600], eeframe=True,  backend='pyplot', shadow=True, jointaxes=True, block=True, movie='TransCubo.gif')