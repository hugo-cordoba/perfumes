'use client';

import { useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { GENDER_FILTER_OPTIONS, type GenderFilter } from '@/lib/product-gender';
import styles from './GenderSelector.module.css';

function labelOf(value: GenderFilter): string {
  return GENDER_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/**
 * Selector de genero para la barra bajo el titulo del listado:
 * "Hombre [switch] Mujer".
 *
 * - Switch a la izquierda = Hombre, a la derecha = Mujer.
 * - Sin filtro de genero (todos los perfumes) el switch queda a la izquierda y
 *   ninguna de las dos etiquetas se resalta.
 * - Pulsar la etiqueta activa quita el filtro.
 *
 * El estado vive en la URL (`?gender=men` / `?gender=women`), igual que el resto
 * de filtros. Mientras Next carga la pagina nueva se enseña ya el valor elegido
 * (useTransition), para que el switch no se quede parado esperando al servidor.
 */
export default function GenderSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<GenderFilter | null>(null);

  const selected = (searchParams.get('gender') ?? '')
    .split(',')
    .filter((value): value is GenderFilter => GENDER_FILTER_OPTIONS.some((option) => option.value === value));

    // Filtro REAL de la URL. Con los dos marcados (?gender=men,women) no se filtra nada: cuenta como "ninguno".
        const active: GenderFilter | null = new Set(selected).size === 1 ? selected[0] : null;

    // Lo que SE VE: siempre hay una opcion marcada, la del switch. Sin filtro, el switch esta a la izquierda (Hombre).
    // Mientras Next carga la pagina nueva se enseña ya la opcion elegida.
    const current: GenderFilter = (isPending ? target : active) ?? 'men';

    function setGender(next: GenderFilter) {
      // Una sola navegacion a la vez (dos router.push seguidos se pisan).
      if (isPending) return;
      // Pulsar la opcion que ya esta filtrada no hace nada: nunca se puede deseleccionar.
      // Se compara con el filtro real (active), no con lo que se ve: sin filtro, pulsar
      // "Hombre" si debe aplicar el filtro de hombres.
      if (next === active) return;

    setTarget(next);

    const params = new URLSearchParams(searchParams.toString());
    params.set('gender', next);
    params.delete('page'); // al cambiar de filtro volvemos a la primera pagina
    const query = params.toString();

    startTransition(() => {
      router.push(`${pathname}?${query}`, { scroll: false });
    });
  }

  return (
    <div className={styles.group} role="group" aria-label="Filtrar por género">
      <button
        type="button"
        className={styles.label}
        data-label={labelOf('men')}
        aria-pressed={current === 'men'}
        onClick={() => setGender('men')}
      >
        {labelOf('men')}
      </button>

      <Switch
        checked={current === 'women'}
        onCheckedChange={(checked) => setGender(checked ? 'women' : 'men')}
        aria-label="Cambiar entre hombre y mujer"
      />

      <button
        type="button"
        className={styles.label}
        data-label={labelOf('women')}
        aria-pressed={current === 'women'}
        onClick={() => setGender('women')}
      >
        {labelOf('women')}
      </button>
    </div>
  );
}