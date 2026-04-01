# EndoSystem

MVP web mobile-first para registro de dolor y apoyo diario en endometriosis.

## Estado actual

Esta version esta hecha con:

- HTML
- CSS
- JavaScript
- localStorage

Objetivo de esta entrega:

- registrar check-ins reales
- persistir historial
- mostrar patrones simples y honestos
- sostener Modo Sola
- dejar un puente opt-in hacia EndoRed

## Archivos actuales

- `endogirl.html`: estructura de pantallas y componentes del MVP
- `style.css`: sistema visual mobile-first
- `script.js`: estado de app, persistencia, historial, insights y flujo de crisis

## Funciones implementadas en el MVP

- Check-in en 3 taps base:
  - Tap 1: dolor 1-10 y boton 20
  - Tap 2: sintomas validados
  - Tap 3: registrar
- Contexto opcional:
  - sueno
  - estres
  - comida gatillo
- Fase manual del ciclo:
  - menstrual
  - folicular
  - ovulatoria
  - lutea
- Historial persistido en `localStorage`
- Insights base:
  - promedio de dolor
  - dias de dolor alto
  - sintoma mas repetido
  - correlacion inicial con sueno, estres, comida o fase
- Modo Crisis
- Mensaje opt-in para EndoRed

## Estructura del registro guardado

```js
{
  id: "1711550000000",
  fecha: "27/03/2026",
  hora: "08:40",
  timestamp: "2026-03-27T11:40:00.000Z",
  dolor: 8,
  sintomas: ["dor", "fadiga"],
  contexto: {
    sleep: "ruim",
    stress: "alto",
    food: "sim"
  },
  ciclo: {
    phase: "lutea",
    day: 22
  }
}
```

## Roadmap de fases

## Fase 1 | JavaScript

Objetivo:

- usar el MVP todos los dias
- capturar datos reales
- detectar patrones iniciales

Pendientes sugeridos:

- filtro por fecha
- vista completa de historial
- editar o borrar registros
- exportar historial a JSON

## Fase 2 | TypeScript

Objetivo:

- tipar el dominio
- separar modelos y reglas

Modelos sugeridos:

```ts
interface CheckInModel {
  id: string;
  fecha: string;
  hora: string;
  timestamp: string;
  dolor: number;
  sintomas: SymptomId[];
  contexto: DailyContextModel;
  ciclo: CycleModel;
}

interface DailyContextModel {
  sleep: "bom" | "medio" | "ruim" | null;
  stress: "baixo" | "medio" | "alto" | null;
  food: "nao" | "talvez" | "sim" | null;
}

interface CycleModel {
  phase: "menstrual" | "folicular" | "ovulatoria" | "lutea";
  day: number;
}

type SymptomId = "inflamacao" | "dor" | "fadiga" | "depressao";
```

Separacion sugerida:

- `models/check-in.model.ts`
- `models/cycle.model.ts`
- `models/context.model.ts`
- `services/storage.service.ts`
- `services/insights.service.ts`

## Fase 3 | Angular

Objetivo:

- migrar el MVP a arquitectura modular y portfolio Junior Front-End

Arquitectura sugerida:

```text
src/app/
  core/
    services/
      storage.service.ts
      insights.service.ts
      cycle.service.ts
  features/
    check-in/
      check-in.component.ts
      pain-scale.component.ts
      symptom-selector.component.ts
      context-selector.component.ts
    history/
      history.component.ts
    crisis/
      crisis.component.ts
    shared/
      ui/
  models/
```

Tecnicas clave:

- Reactive Forms
- RxJS
- componentes pequenos
- servicios por responsabilidad
- routing por feature

## Fase 4 | Firebase

Objetivo:

- sincronizacion real
- auth
- compartir con EndoRed solo si ella lo autoriza

Colecciones sugeridas:

- `users`
- `checkins`
- `support_network`
- `permissions`

Reglas de producto:

- sharing siempre opt-in
- permisos granulares por persona
- no compartir automaticamente una crisis

## Fase 5 | FastAPI + PostgreSQL

Objetivo:

- backend propio v2
- correlaciones mas potentes
- APIs desacopladas del frontend

Modulos sugeridos:

- `auth`
- `checkins`
- `cycle`
- `insights`
- `support-network`

## Principios que no se rompen

- ella siempre en control
- maximo 3 taps en crisis
- Modo Sola tan fuerte como Modo Conectada
- el sistema valida, nunca minimiza
- algoritmo honesto: primero protocolo base, no falsa IA

## Proximo paso recomendado

Pasemos a la siguiente iteracion del MVP antes de migrar:

1. agregar filtro por fecha
2. permitir editar un check-in
3. exportar historial
4. luego migrar a TypeScript
