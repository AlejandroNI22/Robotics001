import sympy as sp

# Definiendo las variables
theta, alpha, a, d = sp.symbols('theta alpha a d')

# Declarandola explicitamente
T = sp.Matrix([[sp.cos(theta), -sp.sin(theta)*sp.cos(alpha), sp.sin(theta)*sp.sin(alpha), a*sp.cos(theta)],
                [sp.sin(theta), sp.cos(theta)*sp.cos(alpha), -sp.cos(theta)*sp.sin(alpha), a*sp.sin(theta)],
                [0, sp.sin(alpha), sp.cos(alpha), d],
                [0, 0, 0, 1]])

# Imprimiendo la matriz
sp.pprint(T)
print(type(T))