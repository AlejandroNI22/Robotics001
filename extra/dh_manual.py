import sympy as sp
from sympy.matrices import rot_axis3

import matplotlib.pyplot as plt
import numpy as np

from spatialmath import *
from spatialmath.base import *

theta, d, a, alpha = sp.symbols('theta d a alpha')

TDH = trotz(theta) @ transl(0, 0, d) @ transl(a, 0, 0) @ trotx(alpha)
sp.pprint(TDH)
print(type(TDH))