'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { slugify } from '@/lib/slugify';
import {
  createBrandAction,
  deleteBrandAction,
  importBrandsAction,
  updateBrandAction,
  type BrandDTO,
  type ImportBrandsResult,
} from '@/lib/actions/admin/brands.actions';
import formStyles from '@/components/checkout/checkoutForm.module.css';
import styles from './BrandsPageClient.module.css';

const EMPTY_FORM = { label: '', slug: '' };
type FormState = typeof EMPTY_FORM;

export default function BrandsPageClient({ initialBrands }: { initialBrands: BrandDTO[] }) {
  const [brands, setBrands] = useState<BrandDTO[]>(initialBrands);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Mientras el admin no toque el slug a mano, se autogenera desde el nombre.
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportBrandsResult | null>(null);

  function openNewForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(brand: BrandDTO) {
    setEditingId(brand.id);
    setForm({ label: brand.label, slug: brand.slug });
    setSlugTouched(true); // no reescribir el slug ya existente al editar el nombre
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  function handleLabelChange(value: string) {
    setForm((f) => ({
      label: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setForm((f) => ({ ...f, slug: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const result = editingId
      ? await updateBrandAction({ id: editingId, label: form.label, slug: form.slug })
      : await createBrandAction({ label: form.label, slug: form.slug });

    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setBrands((prev) => {
      if (editingId) return prev.map((b) => (b.id === result.data.id ? result.data : b));
      return [...prev, result.data].sort((a, b) => a.label.localeCompare(b.label));
    });
    closeForm();
  }

  async function handleDelete(brand: BrandDTO) {
    if (brand.productCount > 0) return; // el botón ya está deshabilitado; esto es solo defensivo
    if (!window.confirm(`¿Eliminar la marca "${brand.label}"?`)) return;

    setListError(null);
    setDeletingId(brand.id);
    const result = await deleteBrandAction(brand.id);
    setDeletingId(null);

    if (!result.ok) {
      setListError(result.error);
      return;
    }
    setBrands((prev) => prev.filter((b) => b.id !== brand.id));
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;

    setImportError(null);
    setImportResult(null);
    setIsImporting(true);

    const formData = new FormData();
    formData.append('file', file);
    const result = await importBrandsAction(formData);

    setIsImporting(false);

    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    setBrands(result.data.brands);
    setImportResult(result.data);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Marcas</h1>

        <div className={styles.headerActions}>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleImportFileChange}
            className={styles.hiddenFileInput}
          />
          <button
            type="button"
            className={styles.importButton}
            onClick={() => importInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? 'Importando...' : 'Importar Excel'}
          </button>

          {!isFormOpen && (
            <button type="button" className={styles.addButton} onClick={openNewForm}>
              + Nueva marca
            </button>
          )}
        </div>
      </div>

      <p className={styles.hint}>
        Importa marcas en bloque desde un Excel (.xlsx): una columna &quot;Nombre&quot; (o &quot;Marca&quot;) y, si
        quieres, otra &quot;Slug&quot;. Sin cabecera se usa la columna A. Las marcas que ya existen se omiten.
      </p>

      {importError && <p className={styles.error}>{importError}</p>}

      {importResult && (
        <div className={styles.importResult} role="status">
          <div className={styles.importResultHeader}>
            <strong>
              {importResult.created === 0
                ? 'No se ha creado ninguna marca nueva.'
                : `${importResult.created} marca${importResult.created === 1 ? '' : 's'} importada${importResult.created === 1 ? '' : 's'}.`}
            </strong>
            <button type="button" className={styles.cancelButton} onClick={() => setImportResult(null)}>
              Cerrar
            </button>
          </div>

          {importResult.skipped > 0 && (
            <p className={styles.importResultText}>
              {importResult.skipped} omitida{importResult.skipped === 1 ? '' : 's'} por existir ya
              {importResult.skippedLabels.length > 0 && (
                <>
                  : {importResult.skippedLabels.join(', ')}
                  {importResult.skipped > importResult.skippedLabels.length && '…'}
                </>
              )}
              .
            </p>
          )}

          {importResult.invalid.length > 0 && (
            <div>
              <p className={styles.importResultText}>
                {importResult.invalid.length} fila{importResult.invalid.length === 1 ? '' : 's'} con errores:
              </p>
              <ul className={styles.importResultList}>
                {importResult.invalid.slice(0, 10).map((item) => (
                  <li key={item.row}>
                    Fila {item.row}: {item.message}
                  </li>
                ))}
                {importResult.invalid.length > 10 && <li>…y {importResult.invalid.length - 10} más.</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {isFormOpen && (
        <form className={formStyles.form} onSubmit={handleSubmit}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Nombre</span>
            <input
              type="text"
              required
              autoFocus
              value={form.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className={formStyles.input}
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Slug</span>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={formStyles.input}
            />
            <span className={styles.hint}>
              URL: /brand/{form.slug || '...'}
              {editingId && ' — cambiarlo puede romper enlaces externos ya compartidos.'}
            </span>
          </label>

          {formError && <p className={styles.error}>{formError}</p>}

          <div className={styles.formActions}>
            <button type="submit" className={formStyles.submit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear marca'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={closeForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {listError && <p className={styles.error}>{listError}</p>}

      {brands.length === 0 && !isFormOpen && (
        <p className={styles.empty}>Todavía no has creado ninguna marca.</p>
      )}

      {brands.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Productos</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => {
                const canDelete = brand.productCount === 0;
                return (
                  <tr key={brand.id}>
                    <td>{brand.label}</td>
                    <td className={styles.slugCell}>{brand.slug}</td>
                    <td>{brand.productCount}</td>
                    <td className={styles.actionsCell}>
                      <button type="button" onClick={() => openEditForm(brand)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(brand)}
                        disabled={!canDelete || deletingId === brand.id}
                        title={
                          canDelete
                            ? undefined
                            : `No se puede borrar: hay ${brand.productCount} producto(s) con esta marca.`
                        }
                      >
                        {deletingId === brand.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}