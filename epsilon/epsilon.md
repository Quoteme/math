# Die epsilon Funktion

Wir konstruieren eine neue Menge
$$H=\mathbb{R}\cup \{\epsilon\}$$
und definieren darauf zwei Verknüpfungen $$+, \cdot $$

Nun wollen wir die Eigenschaften von $(H, +, \cdot) $ herausfinden


```python
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline
import matplotlib.cbook as cbook
import random as random
# für widgets zum interagieren
from __future__ import print_function
from ipywidgets import interact, interactive, fixed, interact_manual
import ipywidgets as widgets
```


```python
class Epsilon:
    def __init__(self,a,b):
        self.re = a
        self.ep = b
    def __add__ (self, other):
        return Epsilon(self.re*other.re,self.ep+other.ep)
    def __mul__ (self, other):
        # distributivgesetz
        return Epsilon(self.re*other.re,self.re*other.ep+self.ep*other.re)
    def __pow__ (self, other):
        # e^x = Summe von x^n/n! für n = 0,1,...
        # e^(a+bε) = e^a * e^(bε)
        # e^(b*ε) = (e^ε)^b
        # e^ε  = 1/0! + ε/1! + 0/3! + 0/4! + ...
        #      = 1+ε
        # => x in IR, x^(a+bε) = e^ln(x)*(a+bε) = e^(ln(x)*a) * (1+ε)^(ln(x)*b)
        # (a+bε)^x = e^(ln(a+bε)*x)
        # ln(a+bε) = c+dε <=> e^(c+dε) = a+bε
        #                 <=> e^c * d(1+ε) = a+bε
        #                 <=> e^c*d + e^c*dε = a+bε
        # => ln(a+bε) existier <=> a=b = e^c*d, c,d in IR
            raise ValueError('nicht implementiert')
    def __repr__ (self):
        return str(self.re)+" + "+str(self.ep)+"ε" 
```


```python
Epsilon(1,1)
```




    1 + 1ε




```python
Epsilon(1,1)+Epsilon(2,3)
```




    2 + 4ε




```python
Epsilon(1,0)*Epsilon(0,0)
```




    0 + 0ε




```python
(Epsilon(1,2).re, Epsilon(1,2).ep)
```




    (1, 2)




```python
def gitterplot(a, x=-5, y=-5, w=10, h=10):
    # Erstelle ein Gitter (Grid) aus Epsilonzahlen
    xn = np.linspace(x,w,30)
    yn = np.linspace(y,h,10)
    grid = np.array([[Epsilon(x,y) for y in yn] for x in xn]) 

    # multipliziere alle Ep.Zahlen aus dem Gitter mit a
    print("a = " + str(a))
    grid *= a

    # Finde alle Realteile der Ep.Zahlen aus dem Gitter (in einer Liste)
    re = [ e.re for e in grid.flatten() ]

    # Finde alle Epsilonteile der Ep.Zahlen aus dem Gitter (in einer Liste)
    ep = [ e.ep for e in grid.flatten() ]

    fig, ax = plt.subplots()
    #ax.scatter(x, y, s, c, marker=verts)

    ax.scatter(re, ep)

    plt.show()

@interact(re=1.5, ep=1.5)
def f(re,ep):
    gitterplot(Epsilon(re,ep))
```


    interactive(children=(FloatSlider(value=1.5, description='re', max=4.5, min=-1.5), FloatSlider(value=1.5, desc…

