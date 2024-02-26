Guía de Programación con Turtle Art
===================================

Turtle Blocks expande a lo que los niños pueden hacer con el logotipo
y la forma en que se puede utilizar como el motivador subyacente para
"mejorar" los lenguajes de programación y dispositivos programables.

En esta guía, ilustramos este punto no solo llevando al lector a
través de numerosos ejemplos, sino también discutiendo algunas de
nuestras exploraciones favoritas de los Turtle Blocks, incluyendo
multimedia, Internet (tanto como un foro para la colaboración y la
recopilación de datos), y una amplia colección de sensores.

Empezando
---------

Los Bloques Tortuga Javascript están diseñado para funcionar en un
navegador. La mayor parte del desarrollo se ha hecho en Chrome, pero
también debería funcionar en Firefox. Se puede ejecutar directamente
desde index.html, desde un [servidor mantenido por Sugar
Labs](http://turtle.sugarlabs.org), desde [el repositorio
GitHub](http://rawgit.com/walterbender/turtleblocksjs/master/index.html),
o mediante la creación de [un servidor
local](https://github.com/walterbender/turtleblocksjs/blob/master/server.md).

Una vez que lo ha puesto en marcha en su navegador, comience haciendo
clic en (o arrastrando) bloques de la paleta de la tortuga. Utilice
múltiples bloques para crear dibujos; mientras la tortuga se mueve
bajo su control se dibujan líneas de colores.

Puede añadir bloques a su programa haciendo clic en ellos o
arrastrándolos desde la paleta a la zona principal. Puede eliminar un
bloque arrastrándolo de nuevo a la paleta. Haga clic en cualquier
lugar de una "pila" de bloques para iniciar la ejecución de esa pila o
haciendo clic en el conejo (rápida) o la tortuga (lenta) en la barra
de herramientas principal.  Para más detalles sobre cómo utilizar
Bloques Tortuga Javascript, consulte Uso de Bloques Tortuga Javascript
para más detalles.

ACERCA DE ESTA GUÍA
-------------------

Muchos de los ejemplos que se dan en la guía tienen enlaces a código
que puede ejecutar. Busque enlaces EJECUTAR EN VIVO que le lleven a
http://turtle.sugarlabs.org.

LA CUADRATURA
-------------

La introducción tradicional del logotipo ha sido dibujar
un cuadrado. Muchas veces cuando se ejecuta un taller, hago que los
estudiantes formen un círculo alrededor de un voluntario, la
"tortuga", y los invito a instruir a la tortuga a dibujar un
cuadrado. (Entreno al voluntario de antemano para tomar cada comando,
literalmente, al igual que nuestra tortuga gráfica.) Eventualmente el
grupo converge en "seguir adelante algún número de pasos", "gire a la
derecha (o izquierda) 90 grados", "siga adelante cierto número de
pasos "," gire a la derecha (o izquierda) 90 grados "," ir hacia
adelante un número de pasos"," gire a la derecha (o izquierda) 90
grados "," ir hacia adelante un número de pasos ". Sólo en raras
ocasiones el grupo incluye una final "Gire a la derecha (o izquierda)
90 grados" para volver a la tortuga a su orientación original. En este
punto introduzco el concepto de "repetición" y luego empezamos con la
programación con Turtle Blocks.

1. Conceptos Básicos de la tortuga
----------------------------------

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics1.svg'</img>

Una sola línea de longitud 100

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics2.svg'</img>

Cambio de la longitud de la línea a 200

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics3.svg'</img>

Adición de un giro a la derecha de 90 grados. La ejecución de esta
pila cuatro veces produce un cuadrado.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics4.svg'</img>

Adelante, derecha, adelante, derecha, ...

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics5.svg'</img>

Utilizando el bloque de repetición de la paleta de flujo

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics6.svg'</img>

Usando el bloque de Arco para hacer esquinas redondeadas

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics7.svg'</img>

Utilizando comenzar relleno y terminan Relleno de la paleta de la
pluma para hacer un cuadrado sólido

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics8.svg'</img>

Cambiar el color a 70 (azul) con el bloque Set color de la paleta de
la pluma

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/basics9.svg'</img>

Uso del bloque aleatorio de la paleta de números para seleccionar un
color al azar (0 a 100)

UNA CAJA DE ZAPATOS
-------------------

Al explicar las cajas en los talleres, a menudo utilizo una caja de
zapatos. Pongo a alguien a escribir un número en un pedazo de papel y
lo coloco en la caja de zapatos. Entonces pregunto repetidamente:
"¿Cuál es el número en el caja?" Una vez que está claro que podemos
hacer referencia al número de la caja de zapatos, pongo a alguien a
escribir un número diferente en la caja de zapatos. Una vez más
pregunto: "¿Cuál es el número en el cuadro?" El poder de la caja es
que se puede hacer referencia a ella varias veces desde varios lugares
en su programa.

2. Cajas
--------

Boxes (Cajas) les permiten almacenar un objeto, por ejemplo, un número
y, a continuación se refieren al objeto utilizando el nombre de la
caja. (Cada vez que se nombra a un cuadro, se crea un nuevo bloque en
la paleta de cajas que le permite acceder al contenido de la caja.)
Esto se utiliza de una manera trivial en el primer ejemplo de abajo:
poner 100 en el cuadro a continuación, haciendo referencia al cuadro
desde el bloque hacia adelante. En el segundo ejemplo, aumentamos el
valor del número guardado en la caja para que cada vez que el cuadro
se haga referencia por el bloque de Avanzar, el valor sea más grande.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/boxes1.svg'</img>

Poner un valor en una caja y luego hacer referencia al valor en la caja

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/boxes2.svg'</img>

Podemos cambiar el valor de la caja mientras el programa se
ejecuta. Aquí le sumamos 10 al valor en la caja con cada iteración. El
resultado en este caso es una espiral, ya que la tortuga avanza aún
más con cada paso.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/boxes3.svg'</img>

Si queremos hacer un cambio más complejo, podemos almacenar en la caja
un valor calculado basado en el contenido actual de la caja. Aquí
multiplicamos el contenido de la caja por 1,2 y guardamos el resultado
en el cuadro. El resultado en este caso es también una espiral, pero
que crece geométricamente en lugar de aritméticamente.

En la práctica, el uso de cajas no es distinto a la utilización de
pares de palabra clave y valores en lenguajes de programación basados
en texto. La palabra clave es el nombre de la caja y el valor asociado
con la palabra clave es el valor almacenado en la caja. Usted puede
tener tantas casillas como desee (hasta que se quede sin memoria) y
tratar las cajas como si fueran un diccionario. Tenga en cuenta que
las cajas son globales, es decir, todas las tortugas y todas las pilas
de acción comparten la misma colección de cajas.

3. Acción Pilas
---------------

Con los bloques tortuga hay una oportunidad para que el alumno se
expanda en el lenguaje, tomando la conversación en direcciones no
previstas por los desarrolladores de los bloques tortuga.

Las pilas de acción le permiten ampliar el lenguaje Bloques tortuga
mediante la definición de nuevos bloques. Por ejemplo, si dibuja un
montón de plazas, es posible que desee un bloque para dibujar
cuadrados. En los siguientes ejemplos, se define una acción que dibuja
un cuadrado (repetimos 4 hacia adelante 100 derecha 90), que a su vez
da lugar a un nuevo bloque en la paleta Acciones que podemos utilizar
cuando queremos dibujar un cuadrado. Cada nueva acción de pila resulta
en un nuevo bloque.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/actions1.svg'</img>

Definición de una acción para crear un nuevo bloque, "cuadrado"

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/actions2.svg'</img>

Uso del bloque "cuadrado"

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/actions3.svg'</img>

El bloque Do le permite especificar una acción por su nombre. En este
ejemplo, elegimos "uno de los" dos nombres, "cuadrado" y "triángulo"
para determinar qué acción tomar.

4. Parámetros 
-------------

Los bloques de parámetros tienen un valor que representa el estado de
algún atributo de tortuga, por ejemplo, la posición x o la y de la
tortuga, el rubro de la tortuga, el color de la pluma, el tamaño de la
pluma, etc. Usted puede utilizar el parámetro de bloques de manera
intercambiable con bloques de números. Usted puede cambiar sus valores
con el Agregar bloque o con los bloques correspondientes.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/parameters1.svg'</img>

Usando el parámetro de encabezado, que cambia cada vez que la tortuga
cambia de dirección, para cambiar el color de una espiral

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/parameters2.svg'</img>

"Squiral" por Brian Silverman utiliza los bloques de parámetros
encabezado y X. [EJECUTAR EN
VIVO](https://turtle.sugarlabs.org/?file=Card-36.tb&run=True)

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/parameters3.svg'</img>

A menudo sólo quiere incrementar un parámetro en 1. Para ello, utilice
Añardir-1-a bloque.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/parameters4.svg'</img>

Para incrementar (o disminuir) un parámetro por un valor arbitrario,
utilice Añardir-1-a bloque.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/parameters5.svg'</img>

Para realizar otros cambios a un parámetro basado en el valor actual,
utilice el parámetro establecer bloque. En este ejemplo, el tamaño de
la pluma se duplica con cada paso en la iteración.

5. Condicionales
----------------

Los condicionales son una herramienta poderosa en la
informática. Dejan que su programa se comporte de manera diferente
bajo diferentes circunstancias. La idea básica es que si una condición
es verdadera, a continuación, se tome algún tipo de acción. Las
variantes incluyen if-then-else (si-entonces-sino), while (mientras
que), until (hasta que), y forever (para siempre). Los Bloques de
tortuga proporcionan construcciones lógicas tales como equal (igual),
greater than (mayor que), less tan (menos que), and (y), or (o), y not
(no).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/conditionals1.svg'</img>

Usando un condicional para seleccionar un color. Una vez que el título
> 179, el color cambia. [CORRER EN
VIVO](http://turtle.sugarlabs.org/?file=Conditionals-1.tb&run=true)

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/conditionals2.svg'</img>

Las condicionales junto con el bloque aleatorio pueden ser utilizadas
para simular un lanzamiento de moneda.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/conditionals3.svg'</img>

Un lanzamiento de moneda es una operación tan común que hemos añadido
el bloque Uno-de para su conveniencia.

6. Multimedia
-------------

Los Bloques tortuga proporcionan herramientas de medios enriquecidos
que permiten la incorporación de sonido, tipografía, imágenes y video.

En el corazón de las extensiones multimedia esta mostrar bloque. Se
puede utilizar para mostrar texto, datos de imagen de la web o el
sistema de archivos local, o una cámara web. Otras extensiones
incluyen bloques para voz sintética, generación de tonos, y la
reproducción de vídeo.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/media1.svg'</img>

Utilizando Mostrar bloque para mostrar texto; la orientación del texto
coincide con la orientación de la tortuga. [CORRER EN
VIVO](https://turtle.sugarlabs.org/?file=Media-1.tb&run=True)

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/media2.svg'</img>

También puede utilizar Mostrar bloque para mostrar imágenes. Al hacer
clic en el bloque de imagen (izquierda) se abrirá un explorador de
archivos. Después de seleccionar un archivo de imagen (PNG, JPG, SVG,
etc.) en una miniatura aparecerá en el bloque de imagen (derecha).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/media3.svg'</img>

Mostrar bloque en combinación con el bloque de la cámara capturará y
mostrara una imagen de una cámara web.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/media4.svg'</img>

Mostrar bloque puede también ser usado en conjunción con un URL que
apunte a archivos de media.

7. Sensores
-----------

La idea de Seymour Papert del aprendizaje a través de hacer está bien
apoyado en los Bloques de tortuga. Según Papert, "el aprendizaje
ocurre especialmente felizmente en un contexto donde el alumno
participa conscientemente en la construcción de una entidad pública,
así se trate de un castillo de arena en la playa o una teoría del
universo". La investigación y el desarrollo que apoya y demuestra los
beneficios del aprendizaje de los niños en su interacción con el mundo
físico siguen creciendo. En forma similar, los niños pueden
comunicarse con el mundo físico usando una variedad de sensores en los
bloques de la tortuga. Bloques de sensores incluyen la entrada de
teclado, el sonido, el tiempo, la cámara, la ubicación del ratón, el
color que la tortuga ve. Por ejemplo, los niños pueden querer
construir una alarma antirrobo y guardar fotos del ladrón en un
archivo. Bloques de tortuga también hacen posible guardar y restaurar
los datos del sensor de un archivo. Los niños pueden usar un bloque
"URL" para importar datos desde una página web.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/sensors1.svg'</img>

El uso de sensores. El bloque de Loudness (sonoridad) se utiliza para
determinar si hay un intruso. Un sonido fuerte desencadena la acción
de alarma: la tortuga grita "intruso" y toma una foto del intruso.

Maestros de la comunidad de azúcar han desarrollado una amplia
colección de ejemplos que utilizan sensores Tortuga, Guzmán Trinidad,
un profesor de física de Uruguay, escribió un libro, Física de la XO,
que incluye una amplia variedad de sensores y experimentos. Tony
Forster, un ingeniero de Australia, también ha hecho contribuciones
notables a la comunidad por medio de ejemplos que documentan el uso de
bloques de tortuga. En un ejemplo, Tony utiliza la serie de
interruptores para medir la aceleración gravitacional; una bola
rodando por una rampa activa los interruptores en
secuencia.

Examinando el tiempo entre los eventos de activación se puede
determinar la constante de gravitación.  Uno de los retos típicos de
la utilización de sensores es la calibración. Esto también es cierto
en los Bloques de la tortuga. El ciclo de vida típico del proyecto
incluye: (1) Los valores de lectura; (2) trazar los valores a medida
que cambian con el tiempo; (3) la búsqueda de los valores mínimo y
máximo; y, finalmente, (4) la incorporación del bloque del sensor en
un programa de tortuga.

Ejemplo: Pintura
----------------

Como se describe en la
sección de Sensores, Bloques tortuga le permite al programador /
artista incorporar sensores en su trabajo. Entre los sensores
disponibles están el botón del ratón y la posición x e y del
ratón. Estos pueden ser usados ​​para crear un programa de pintura
simple, como se ilustra a continuación. Escribir su propio programa de
dibujo es empoderante: desmitifica una herramienta de uso común. Al
mismo tiempo, se coloca el peso de la responsabilidad en el
programador: una vez que lo escribimos, pertenece a nosotros, y
nosotros somos responsables de hacerlo cool. Algunas variaciones de
pintura también se muestran a continuación, incluyendo el uso de los
niveles de micrófono para variar el tamaño de la pluma a medida que
cambian los niveles sonoros ambientales. Una vez que los estudiantes
se dan cuenta de que pueden realizar cambios en el comportamiento de
su programa de dibujo, se vuelven profundamente comprometidos. ¿Cómo
va a modificar la pintura?

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/paint1.svg'</img>

En su forma más simple, la pintura es sólo cuestión de mover la
tortuga para donde el ratón se posicione.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/paint2.svg'</img>

Añadir una prueba para el botón del ratón nos permite mover a la
tortuga sin dejar un rastro de tinta.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/paint3.svg'</img>

En este ejemplo, cambiamos el tamaño de la pluma sobre la base del
volumen de entrada de micrófono.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/paint4.svg'</img>

En otro ejemplo, inspirado por un estudiante en un taller en Colombia, usamos el tiempo para cambiar tanto el color de la pluma y el tamaño de la pluma [CORRER EN VIVO](http://turtle.sugarlabs.org/?file=Paint-4.tb&run=true)

Ejemplo diapositivas
--------------------

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/slideshow1.svg'</img>

¿Por qué utilizar Powerpoint cuando puede escribir Powerpoint? En este
ejemplo, una pila de Acción se utiliza para detectar la entrada de
teclado: si el valor de teclado es cero, entonces ninguna tecla ha
sido presionada, por lo que llama a la acción otra vez. Si se pulsa
una tecla, el valor teclado es mayor que cero, por lo que regresó de
la acción y muestra la siguiente imagen.

Ejemplo entrada de teclado
--------------------------
<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/keyboard.svg'</img>

Para grabar los códigos de botones del teclado, es necesario utilizar un
*Mientras* bloque. En el ejemplo anterior, almacenamos el valor de
teclado en una caja, probarlo, y si es > 0, retorno el valor.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/keyboard2.svg'</img>

8. Tortugas, Sprites, botones, y eventos
----------------------------------------

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/turtles1.svg'</img>

Se crea una tortuga separada para cada bloque de inicio. Las tortugas
siguen su código en paralelo entre sí cada vez que se hace clic en el
botón Ejecutar. Cada tortuga mantiene su propio conjunto de parámetros
de posición, color, tamaño de la pluma, el estado de la pluma, etc. En
este ejemplo, tres tortugas diferentes dibujan tres formas diferentes.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/turtles2.svg'</img>

Se pueden aplicar gráficos personalizados a las tortugas, con el
bloque de Shell en la paleta de Medios. De este modo se puede tratar
las tortugas como sprites que se pueden mover por la pantalla. En este
ejemplo, el sprite cambia entre dos estados, mientras que se mueve por
la pantalla.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/turtles3.svg'</img>

Las tortugas pueden ser programadas para responder a un evento
"click", para que puedan ser utilizadas como botones. En este ejemplo,
cada vez que la tortuga se hace clic, se ejecuta la acción, que se
mueven a la tortuga a una ubicación aleatoria en la pantalla.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/turtles4.svg'</img>

También puede ser transmitidos Eventos. En este ejemplo, otra variante
en la pintura, los "botones" de tortuga, que escuchan acontecimientos
de "click", se utilizan para transmitir los eventos de cambio de
color. La tortuga usada como el pincel está escuchando estos eventos.

9. Acciones avanzadas
---------------------

En algún momento usted puede ser que desee una acción que no sólo
ejecute una pila de bloques, sino también que regrese un valor. Este
es el papel del bloque de retorno. Si pones un bloque de retorno en
una pila, entonces la pila acción se vuelve una pila de calcular.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/actions4.svg'</img>

En este ejemplo, una pila calcular se utiliza para devolver la
distancia actual de la tortuga desde el centro de la pantalla. Cambiar
el nombre de una pila de acción que tiene un bloque de retorno hará
que la creación de un nuevo bloque en la paleta de acciones que se
pueden utilizar para hacer referencia al valor de retorno. En este
caso, se crea un bloque de distancia

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/actions6.svg'</img>

También puede pasar argumentos a una pila de acción. En este ejemplo,
se calcula la distancia entre la tortuga y un punto arbitrario en la
pantalla al pasar coordenadas x e y en el bloque de calcular. Usted
puede agregar argumentos adicionales arrastrándolos a la "pinza".

Tenga en cuenta que args son locales a las pilas de acción, pero las
cajas no lo son. Si usted planea usar una acción en una función
recursiva, mejor evite las cajas

Ejemplo: Fibonacci
------------------

Cálculo de la secuencia de Fibonacci se hace a menudo utilizando un
método recursivo. En el siguiente ejemplo, se pasa un argumento para
la acción Fib, que devuelve un valor si el argumento es <2; de lo
contrario, devuelve la suma del resultado de llamar a la acción con el
argumento Fib - 1 y el argumento - 2.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/fibonacci1.svg'</img>

Cálculo de Fibonacci [CORRER  EN VIVO](http://turtle.sugarlabs.org/?file=Fibonacci-1.tb&run=true)

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/fibonacci2.svg'</img>

En el segundo ejemplo, se utiliza un bucle de repetición para generar
los seis primeros números de Fibonacci y los utilizamos para dibujar
un nautilus.

Dibuja una nautilus [CORRER  EN VIVO](http://turtle.sugarlabs.org/?file=nautilus.tb&run=true)

Ejemplo: Pintura de Reflexión
-----------------------------

Al combinar múltiples tortugas y pasar argumentos a las acciones,
podemos tener un poco más de diversión con la pintura. En el siguiente
ejemplo, la acción de pintura utiliza arg 1 y arg 2 para reflejar las
coordenadas del ratón sobre los ejes Y y X. El resultado es que la
pintura se refleja en los cuatro cuadrantes.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/turtles5.svg'</img>

Pintura de Reflexión [CORRER EN VIVO](http://turtle.sugarlabs.org/?file=Reflection-Paint.tb&run=true)

10. Cajas Avanzadas
-------------------

A veces es más conveniente calcular el nombre de una caja que
especificarlo explícitamente. (Tenga en cuenta que el bloque Do
(hacer) usa un mecanismo similar para el cálculo de los nombres de las
acciones).

En los siguientes ejemplos, usamos esto para acumular los resultados
de lanzar un par de dados 100 veces (ejemplo inspirado por Tony
Forster).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/boxes4.svg'</img>

En lugar de especificar una caja para cada resultado posible (2 a 12),
se utiliza una caja como un contador (índice) y se crea una caja con
el nombre del valor actual en el contador y se almacena en esa caja un
valor de 0.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/boxes5.svg'</img>

A continuación añadimos una acción para tirar los dados 100 veces. Para simular lanzar un par de dados, sumamos dos números aleatorios entre 1 y 6. Utilizamos el resultado como el nombre de la caja queremos incrementar. Así por ejemplo, si tiramos un 7, añadimos uno a la caja de llamada 7. De esta manera incrementamos el valor en la casilla correspondiente.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/boxes6.svg'</img>

Por último, trazamos los resultados. Una vez más, se utiliza una caja
como un contador (índice) y llamamos la acción trama en un bucle. En
la barra de acción, dibujamos un rectángulo con valor de longitud
almacenado en la caja con el nombre del valor actual del índice. Por
ejemplo, cuando el valor en la caja de índice es 2, la tortuga avanza
según el valor en la casilla 2, que es el número acumulado de veces
que los lanzamientos de dados resultaron en un 2; cuando el valor en
la caja índice es 3, la tortuga avanza por el valor en la casilla 3,
que es el número acumulado de veces que los lanzamientos de dados
resultaron en un 3; etc.

11. La Pila
-----------

A veces se necesita un lugar para almacenar temporalmente los
datos. Una forma de hacerlo es con cajas (como se menciona al final de
la sección Cajas de esta guía, que se puede utilizar como un
diccionario o pares palabra clave de valor individual). Sin embargo, a
veces es agradable usar simplemente una pila.

Lo primero que se pone en la pila está en la parte inferior. La última
cosa que pone en la pila está en la parte superior. Usted pone las
cosas en la pila usando el bloque de empuje. Usted toma las cosas
fuera de la pila utilizando el bloque pop. En los bloques de tortuga,
la pila es primera entrada - última salida (FILO), por lo que saca las
cosas fuera de la pila en el orden inverso en el que entran al montón.

También hay un bloque de índice que le permite referirse a un elemento
de la pila por un índice. En esencia, esto le permite tratar la pila
como una matriz. Algunos otros bloques útiles incluyen un bloque de
vaciar la pila, un bloque que devuelve la longitud de la pila, un
bloque que salva la pila en un archivo, y un bloque que carga la pila
de un archivo.

En los ejemplos siguientes se utiliza la pila para guardar un dibujo
hecho con un programa de dibujo similar a los ejemplos anteriores y
luego reproducir el dibujo haciendo estallar puntos fuera de la pila.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/heap1.svg'</img>

En el primer ejemplo, simplemente movemos la posición de tortuga cada
vez que dibujamos, junto con el estado de la pluma. Note que salen en
el orden inverso al que empujamos, empujamos y, luego x, del estado
del ratón.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/heap2.svg'</img>

En el segundo ejemplo, sacamos el estado pluma, X, y Y fuera de la
pila y reproducimos nuestro dibujo.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/heap3.svg'</img>

Utilice la opción Guardar Pila de bloques para guardar el estado de la
pila en un archivo. En este ejemplo, guardamos nuestro dibujo en un
archivo para su posterior reproducción.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/heap4.svg'</img>

Utilice el bloque Cargar Pila para cargar la pila de datos guardados
en un archivo. En este ejemplo, la reproducción del dibujo a partir de
datos almacenados en un archivo.

12. Extras
----------

La Paleta de Extras está llena de utilidades que le ayudan a utilizar
la salida de su proyecto de diferentes maneras.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/extras1.svg'</img>

El bloque Guardar como SVG guardará su dibujo como gráficos
vectoriales simples (SVG), un formato compatible con HTML5 y muchos
programas de manipulación de imágenes, por ejemplo, Inkscape. En el
ejemplo anterior, lo usamos para guardar un diseño en una forma que se
puede convertir en STL, un formato de archivo común utilizado por las
impresoras 3D. Algunas cosas para tomar not: (1) el bloque de sin
fondo se utiliza para suprimir la inclusión del relleno de fondo en la
salida SVG; (2) las líneas huecas se usan para hacer que el gráfico
tenga dimensión; y (3) la opción Guardar como bloque SVG escribe en el
directorio de Descargas en su ordenador. (Josh Burker me introdujo a
Tinkercad, un sitio web que se puede utilizar para convertir de SVG a
STL.)

13. Ayudas de Depuración
------------------------

Probablemente la ayuda de depuración más utilizada tantas en cualquier
idioma es la sentencia print. En los bloques de la tortuga, también es
muy útil. Se puede utilizar para examinar el valor de los parámetros y
variables (cajas) y para monitorear el progreso a través de un
programa.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/debugging1.svg'</img>

En este ejemplo, se utiliza el operador de adición para concatenar
cuerdas en una sentencia de impresión. El ratón x + "," + ratón y, se
imprimen en el bucle interno.

Bloques de parámetros, cajas, aritméticos y operadores booleanos, y
muchos bloques de sensor imprimirán su valor actual mientras el
programa se ejecuta cuando se ejecuta en "lento" o "paso- a paso "el
modo, obviando la necesidad de utilizar el bloque de impresión en
muchas situaciones.

El bloque de Espera hará una pausa en la ejecución del programa
durante un número (o fracciones) de segundo.

Los bloques ocultar y mostrar pueden ser utilizados para establecer
"puntos de quiebre". Cuando se encuentra un bloque oculto (Hide), los
bloques están ocultos y el programa pasa a toda velocidad. Cuando se
encuentra un bloque Mostrar, se muestran los valores de los bloques y
el programa avanza a un ritmo más lento.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/debugging2.svg'</img>

Un bloque demostración se utiliza para reducir la velocidad de
ejecución del código en una pila de Acción con el fin de facilitar la
depuración. En este caso, vamos más despacio durante la reproducción
con el fin de ver los valores estallar fuera de la pila.

14. Color avanzado
------------------

La representación interna del color en los bloques de la tortuga se
basa en el sistema de color de Munsell. Es un sistema de tres
dimensiones: (1) tono (rojo, amarillo, verde, azul, púrpura), (2)
valor (negro a blanco), y (3) croma (gris a vívido)

Hay parámetros para cada dimensión de color y "set"
correspondientes. Todas las tres dimensiones se han normalizado para
ejecutar desde 0 a 100. Para Matiz (Hue), 0 traza a Munsell 0R. Para
el Valor, 0 traza Munsell valor 0 (negro) y 100 traza a Munsell valor
10 (blanco). Para croma, 0 traza a Munsell croma 0 (gris) y 100 traza
a Munsell croma 26 (color espectral).

Una nota sobre En el sistema Munsell, el croma máximo de cada
tonalidad varía con valor. Para simplificar el modelo, si el croma
especificado es mayor que el croma máximo disponible para un par tono
/ valor, se utiliza el croma máximo disponible.

El bloque Establecer Color traza las tres dimensiones del espacio de
color Munsell en una sola dimensión. Siempre devuelve el par máximo
valor / croma de un color determinado, lo que garantiza colores
vivos. Si quiere colores más sutiles, asegúrese de usar el bloque
establecer Matiz en lugar del bloque Conjunto de color.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/guide-es/color1.svg'</img>

Color vs. Ejemplo de tonalidad [CORRER EN VIVO](https://turtle.sugarlabs.org/?file=Color-vs-Hue.tb&run=true)

Para establecer el color de fondo, utilice el bloque de fondo. Fijará
los antecedentes del triplete del actual tono / valor / croma.

15. Plugins
-----------

Hay un número cada vez mayor de las ampliaciones de los bloques de
tortuga en la forma de plugins. Vea
[Plugins](http://github.com/walterbender/turtleblocksjs/tree/master/plugins)
para más detalles.
