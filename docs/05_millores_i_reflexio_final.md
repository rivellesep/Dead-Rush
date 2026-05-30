# 05_millores_i_reflexio_final.md

## 1. Millores aplicades al codi

Durant la Fase 5 s'han identificat i aplicat diverses millores de qualitat al codi del joc **Dead Rush**. A continuació es documenten les tres més rellevants, seguint el format sol·licitat.

### Millora 1: Separació de responsabilitats en la funció `actualitzarJoc()`

**Situació inicial (abans):**
La funció `actualitzarJoc()` contenia més de 80 línies de codi i s'encarregava de múltiples tasques: moviment del jugador, dispars, actualització d'entitats, col·lisions, generació d'enemics i escalat de dificultat. Això dificultava la lectura, el manteniment i la depuració.

```javascript
// Codi original (fragment)
function actualitzarJoc() {
    // Moviment...
    // Dispars...
    // Actualitzar enemics...
    // Col·lisions...
    // Generació...
    // Escalat...
}
```

**Situació final (després):**
S'ha refactoritzat la funció principal extraient cada responsabilitat a una funció independent i ben anomenada. Ara `actualitzarJoc()` és una funció breu que orquestra la crida a aquestes subfuncions.

```javascript
function actualitzarJoc() {
    if (estat !== 'jugant' || pausa) return;

    processarMovimentJugador();
    processarDispars();
    actualitzarEntitats();
    processarColisions();
    generarEnemicsPerTemps();
    escalarDificultat();

    if (comptadorFrames % 60 === 0) {
        tempsJoc++;
    }
    actualitzarUI();
}
```

**Beneficis:**
* Codi més modular i reutilitzable.
* Millor llegibilitat: cada funció té un nom que descriu exactament què fa.
* Facilita la depuració: es pot aïllar el problema a una funció concreta.
* Compleix amb el principi de responsabilitat única (SRP).

---

### Millora 2: Unificació i millora dels noms de variables (català)

**Situació inicial (abans):**
El codi barrejava noms en anglès i català de manera inconsistent. Algunes variables tenien noms poc descriptius (`dx`, `dy`, `frameCount`, `spawnRate`). Això podia confondre i dificultava la comprensió del codi.

| Nom original | Nou nom | Justificació |
| :--- | :--- | :--- |
| `dx`, `dy` | `dirX`, `dirY` | Més explícit: "direcció X/Y". |
| `frameCount` | `comptadorFrames` | Català unificat i més descriptiu. |
| `spawnRate` | `taxaAparicio` | Català i reflecteix el propòsit. |
| `tecles.up/down/left/right` | `tecles.amunt/avall/esquerra/dreta` | Coherència amb l'idioma del projecte. |

**Situació final (després):**
S'han renombrat totes les variables principals per seguir una nomenclatura coherent en català. Això fa que el codi sigui més fàcil d'entendre per a qualsevol persona que llegeixi la documentació del projecte.

**Beneficis:**
* Elimina la barreja d'idiomes, millorant la professionalitat.
* Els noms són més expressius i redueixen la necessitat de comentaris addicionals.
* Facilita la cerca i substitució durant el manteniment.

---

### Millora 3: Documentació amb JSDoc

**Situació inicial (abans):**
El codi no contenia comentaris estructurats. Les funcions no estaven documentades, la qual cosa obligava a llegir la implementació per entendre què feien, quins paràmetres esperaven i què retornaven.

**Situació final (després):**
S'han afegit blocs de comentaris en format **JSDoc** abans de cada funció important. Aquest estàndard és àmpliament utilitzat en JavaScript i permet generar documentació automàtica.

**Exemple:**
```javascript
/**
 * Gestiona el tret automàtic del jugador cap a l'enemic més proper.
 */
function processarDispars() { ... }

/**
 * Comprova i resol totes les col·lisions del joc.
 */
function processarColisions() { ... }
```

**Beneficis:**
* Documentació integrada al codi, accessible des de l'editor.
* Millora la col·laboració i el manteniment futur.
* Compleix amb els estàndards de qualitat del sector (RA4).

---

## 2. Reflexió final

### Decisions preses durant el projecte
* **Tria del gènere:** Es va optar per un joc de supervivència amb hordes (*Vampire Survivors-like*) perquè combina mecàniques senzilles d'implementar amb una corba d'addicció alta. Era un repte assumible en 10 hores.
* **Arquitectura modular:** La decisió d'usar mòduls ES6 i separar les classes en fitxers independents va ser clau per mantenir el codi organitzat des del principi.
* **Ús d'IA:** S'ha utilitzat ChatGPT com a suport per a la generació de la documentació estructurada i per resoldre dubtes tècnics puntuals (com l'algorisme de col·lisió rectangle-cercle). En cap moment s'ha copiat codi sense entendre'l; s'ha revisat, adaptat i refactoritzat segons les necessitats del projecte.

### Dificultats trobades
* **Problema d'inicialització del DOM:** Va ser l'error més bloquejant. Aprendre a utilitzar `DOMContentLoaded` va ser fonamental per entendre el cicle de vida d'una pàgina web.
* **Col·lisions rectangle-cercle:** La detecció inicial no era precisa a les cantonades. Investigar i aplicar l'algorisme correcte va reforçar els coneixements de geometria computacional aplicada a videojocs.
* **Gestió del temps:** Tot i que el projecte estava pautat en fases, la realitat és que algunes parts (com la depuració) van consumir més temps del previst. La limitació explícita de l'abast va ser essencial per no desviar-se.

### Ús de la intel·ligència artificial
He utilitzat la IA principalment per a:
* Redactar els esquelets inicials dels documents Markdown, que després he personalitzat amb el contingut específic del meu projecte.
* Obtenir exemples d'implementació de funcions com `detectarColisioRectangleCercle()` i entendre'n el funcionament.
* Suggeriments de millores de refactorització (com les aplicades en aquesta fase).

**Què he acceptat i què he descartat:**
He acceptat les propostes estructurals i els algorismes validats. He descartat idees que ampliaven massa l'abast (com afegir efectes de partícules o modes de joc extra), perquè haurien posat en risc la finalització del projecte dins del temps.

### Què milloraria amb més temps
* **Persistència de rècords:** Guardar la millor puntuació en `localStorage` per fomentar la rejugabilitat.
* **Sons i música:** Afegir efectes de so en disparar, rebre dany i pujar de nivell per millorar la immersió.
* **Varietat d'enemics:** Implementar un segon tipus d'enemic amb comportament diferent (més ràpid, més resistent).
* **Personalització visual:** Permetre a l'usuari triar entre diferents colors per al jugador.

---

## Conclusió personal
Aquest projecte m'ha permès experimentar el cicle complet de desenvolupament d'un programari, des de la idea inicial fins a la refactorització final. He après a valorar la importància de **planificar abans de programar**, a **limitar l'abast** per garantir un producte acabat, i a **documentar** cada pas del procés.

El resultat és un joc senzill però funcional, que compleix els objectius marcats i del qual em sento orgullós. A més, he après a utilitzar Git de manera efectiva, a estructurar un projecte web amb mòduls i a confiar en la IA com una eina de suport, no com un substitut del meu propi criteri.

---