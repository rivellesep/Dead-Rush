# 04_proves_i_depuracio.md

## 1. Introducció

Aquest document recull el procés de verificació del prototip funcional de **Dead Rush**. S'han definit i executat casos de prova per validar les mecàniques principals, s'han detectat i documentat incidències reals, i s'han aplicat tècniques de depuració per garantir el correcte funcionament del joc.

L'objectiu és demostrar la capacitat de comprovar el comportament del programa, identificar errors i aplicar solucions de manera sistemàtica.

## 2. Casos de prova

S'han definit **5 casos de prova** que cobreixen les funcionalitats crítiques del joc. Per a cada cas s'indica l'objectiu, les condicions d'entrada, el resultat esperat i el resultat obtingut després de l'execució.

### CP-01: Inici de partida

| Camp | Descripció |
| :--- | :--- |
| **Objectiu** | Verificar que el joc s'inicia correctament des de la pantalla inicial. |
| **Condicions d'entrada** | Joc carregat al navegador. Pantalla d'inici visible. |
| **Accions** | Fer clic al botó "Començar". |
| **Resultat esperat** | La pantalla d'inici s'amaga. Apareix el jugador al centre del canvas. Les barres de vida i experiència mostren valors inicials (100/100, 0/100). El temporitzador comença a comptar. |
| **Resultat obtingut** | ✅ Correcte. La transició és fluida i tots els elements UI s'inicialitzen correctament. |
| **Estat** | Passat |

### CP-02: Moviment del jugador dins dels límits

| Camp | Descripció |
| :--- | :--- |
| **Objectiu** | Comprovar que el jugador es mou amb les tecles WASD i fletxes, i que no surt dels límits del canvas. |
| **Condicions d'entrada** | Partida en curs. Jugador al centre (400, 300). |
| **Accions** | Prémer i mantenir cadascuna de les tecles de moviment en totes direccions, incloent diagonals. Intentar moure's més enllà de les vores. |
| **Resultat esperat** | El jugador es desplaça en la direcció indicada. La velocitat en diagonal és normalitzada. El jugador s'atura exactament als límits del canvas sense sortir-se'n. |
| **Resultat obtingut** | ✅ Correcte. El jugador no travessa els marges. El moviment és fluid. |
| **Estat** | Passat |

### CP-03: Dispar automàtic i col·lisió amb enemics

| Camp | Descripció |
| :--- | :--- |
| **Objectiu** | Verificar que el jugador dispara automàticament a l'enemic més proper i que les bales redueixen la vida de l'enemic fins a eliminar-lo. |
| **Condicions d'entrada** | Partida en curs. Almenys un enemic present a la pantalla. |
| **Accions** | Deixar que el sistema de dispar automàtic actuï. Observar les bales. |
| **Resultat esperat** | Es generen bales en direcció a l'enemic més proper. En impactar, la barra de vida de l'enemic disminueix. Quan la vida arriba a 0, l'enemic desapareix i deixa anar una gemma d'experiència. |
| **Resultat obtingut** | ✅ Correcte. Les bales persegueixen l'enemic adequadament. La detecció de col·lisions funciona. |
| **Estat** | Passat |

### CP-04: Pujada de nivell i selecció de millora

| Camp | Descripció |
| :--- | :--- |
| **Objectiu** | Confirmar que en acumular suficient XP, el joc es pausa i mostra 3 opcions de millora, i que en seleccionar-ne una s'aplica correctament. |
| **Condicions d'entrada** | Partida en curs. Jugador amb XP proper al llindar. |
| **Accions** | Recollir gemmes fins a superar el llindar d'XP. Quan aparegui el panell, triar una millora. |
| **Resultat esperat** | El joc es pausa. Es mostren 3 millores aleatòries. En fer clic sobre una, el panell desapareix, el joc es reprèn i l'atribut corresponent del jugador (dany, velocitat de tret, etc.) augmenta. |
| **Resultat obtingut** | ✅ Correcte. Les millores s'apliquen i el joc continua sense errors. |
| **Estat** | Passat |

### CP-05: Escalat de dificultat

| Camp | Descripció |
| :--- | :--- |
| **Objectiu** | Verificar que la dificultat augmenta progressivament amb el temps. |
| **Condicions d'entrada** | Partida en curs durant almenys 20 segons. |
| **Accions** | Deixar transcórrer el temps i observar la quantitat i velocitat dels enemics. |
| **Resultat esperat** | Cada ~10 segons, la taxa d'aparició d'enemics i la seua velocitat base augmenten perceptiblement. Els enemics que apareixen més tard tenen més vida màxima que els inicials. |
| **Resultat obtingut** | ✅ Correcte. S'observa un increment progressiu del repte. Als 30 segons ja hi ha notablement més enemics que a l'inici. |
| **Estat** | Passat |

## 3. Incidències detectades i solucionades

Durant el desenvolupament i les proves del prototip, es van detectar diverses incidències. A continuació es documenten les dues més rellevants, seguint el format exigit.

### Incidència #1: El joc no responia en prémer "Començar"

| Camp | Descripció |
| :--- | :--- |
| **Descripció de l'error** | En carregar la pàgina i prémer el botó "Començar", la pantalla d'inici s'amagava però no apareixia cap element del joc al canvas. El jugador no es dibuixava i no hi havia interacció. |
| **Com es va detectar** | Prova manual del CP-01. La consola del navegador mostrava errors del tipus `Cannot read properties of null`. |
| **Causa probable** | El codi JavaScript intentava accedir a elements del DOM (`canvas`, `startButton`, etc.) abans que el navegador els hagués creat completament. El codi s'executava de manera síncrona en carregar el mòdul, però el DOM encara no estava llest. |
| **Tècnica de depuració utilitzada** | Es van inserir `console.log` estratègics per traçar l'ordre d'execució. Es va comprovar que les referències a elements del DOM eren `null` en el moment d'adjuntar els event listeners. |
| **Solució aplicada** | Es va encapsular **tota** la lògica d'inicialització dins d'un listener d'esdeveniment `DOMContentLoaded`. Això garanteix que el codi només s'executi quan l'HTML ha estat completament parsejat. A més, es van afegir comprovacions de nul·litat per seguretat. |
| **Verificació** | Després del canvi, el joc s'inicia correctament en prémer "Començar". Els `console.log` de depuració mostren l'ordre correcte: "DOM carregat...", "Setup event listeners...", "Començar clicat". |

### Incidència #2: Col·lisions poc precises a les cantonades dels enemics

| Camp | Descripció |
| :--- | :--- |
| **Descripció de l'error** | El jugador (cercle) rebia dany en situacions on visualment no tocava l'enemic (quadrat), especialment quan s'aproximava a les cantonades del quadrat. |
| **Com es va detectar** | Durant proves de jugabilitat (CP-03 i CP-04), es va observar que el jugador perdia vida de manera injusta en apropar-se a enemics des de certs angles. |
| **Causa probable** | La funció de col·lisió original comparava la distància entre centres amb la suma de radis, però no tenia en compte la forma rectangular dels enemics. Per al jugador (cercle) i enemic (quadrat), cal una detecció específica rectangle-cercle. |
| **Tècnica de depuració utilitzada** | Es va dibuixar temporalment un cercle vermell al voltant del jugador per visualitzar el radi de col·lisió real. Es va observar que el problema ocorria exactament a les cantonades. Es va revisar la funció `detectarColisioRectangleCercle()` a `utils.js`. |
| **Solució aplicada** | Es va reescriure la funció perquè calculés el punt més proper del rectangle al centre del cercle, i després comprovés la distància entre aquest punt i el centre. Aquest és l'algorisme estàndard per a col·lisions rectangle-cercle. |
| **Verificació** | Després de la correcció, el jugador només rep dany quan el cercle i el quadrat es superposen realment, fins i tot a les cantonades. La sensació de joc va millorar notablement. |

## 4. Altres tècniques de depuració emprades

A més de les utilitzades en les incidències anteriors, durant el desenvolupament s'han fet servir:

- **Breakpoints a les DevTools del navegador:** Per inspeccionar l'estat de variables com `jugador.vida`, `spawnRate` o `enemics.length` en moments concrets de l'execució.
- **Live Edit:** Modificar valors numèrics (com la velocitat dels enemics) directament des de la consola per provar diferents balances de dificultat sense necessitat de recompilar.
- **Monitorització del rendiment:** Ús de la pestanya "Performance" per assegurar que el bucle de joc es manté a 60 FPS fins i tot amb molts elements en pantalla.

## 5. Conclusió

Tots els casos de prova definits han estat superats amb èxit després de solucionar les incidències documentades. El joc **Dead Rush** és estable, compleix les funcionalitats especificades a la Fase 1 i està preparat per a la següent fase de refactorització i millora.

El procés de verificació ha estat fonamental per garantir la qualitat del prototip i ha proporcionat evidències clares del cicle de desenvolupament: codificar, provar, detectar errors, depurar i corregir.

---