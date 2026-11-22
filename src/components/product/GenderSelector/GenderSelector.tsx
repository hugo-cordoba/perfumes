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

  // Con los dos marcados (?gender=men,women) no se filtra nada: cuenta como "ninguno".
  const active = new Set(selected).size === 1 ? selected[0] : null;
  const current = isPending ? target : active;

  function setGender(next: GenderFilter | null) {
    setTarget(next);

    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('gender', next);
    else params.delete('gender');
    params.delete('page'); // al cambiar de filtro volvemos a la primera pagina
    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div className={styles.group} role="group" aria-label="Filtrar por género">
      <button
        type="button"
        className={styles.label}
        aria-pressed={current === 'men'}
        onClick={() => setGender(current === 'men' ? null : 'men')}
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
        aria-pressed={current === 'women'}
        onClick={() => setGender(current === 'women' ? null : 'women')}
      >
        {labelOf('women')}
      </button>
    </div>
  );
}