'use server';

import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureUniqueSlug, slugify } from '@/lib/slugify';
import { runAdminAction, type AdminActionResult } from './admin-utils';

export interface BrandDTO {
  id: string;
  slug: string;
  label: string;
  productCount: number;
}

const include = { _count: { select: { products: true } } } as const;

function toDTO(row: { id: string; slug: string; label: string; _count: { products: number } }): BrandDTO {
  return { id: row.id, slug: row.slug, label: row.label, productCount: row._count.products };
}

/**
 * Lectura para la página de admin (se llama desde el Server Component).
 * El middleware ya exige rol ADMIN en /admin/:path*, pero se revalida
 * aquí también por si esta función se reutiliza desde otro sitio.
 */
export async function getBrands(): Promise<BrandDTO[]> {
  await requireAdmin();
  const rows = await prisma.brand.findMany({ orderBy: { label: 'asc' }, include });
  return rows.map(toDTO);
}

export interface BrandInput {
  label: string;
  /** Si se omite o queda vacío, se autogenera desde el label. */
  slug?: string;
}

export async function createBrandAction(input: BrandInput): Promise<AdminActionResult<BrandDTO>> {
  return runAdminAction(async () => {
    const label = input.label.trim();
    if (!label) throw new Error('El nombre es obligatorio.');

    const baseSlug = slugify(input.slug?.trim() || label);
    if (!baseSlug) throw new Error('No se ha podido generar un slug válido a partir del nombre.');

    const existingSlugs = (await prisma.brand.findMany({ select: { slug: true } })).map((b) => b.slug);
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const created = await prisma.brand.create({ data: { label, slug }, include });
    return toDTO(created);
  });
}

export interface UpdateBrandInput {
  id: string;
  label: string;
  slug: string;
}

export async function updateBrandAction(input: UpdateBrandInput): Promise<AdminActionResult<BrandDTO>> {
  return runAdminAction(async () => {
    const label = input.label.trim();
    const slug = slugify(input.slug.trim());
    if (!label) throw new Error('El nombre es obligatorio.');
    if (!slug) throw new Error('El slug no puede quedar vacío.');

    const existing = await prisma.brand.findUnique({ where: { id: input.id } });
    if (!existing) throw new Error('La marca no existe.');

    if (slug !== existing.slug) {
      const clash = await prisma.brand.findUnique({ where: { slug } });
      if (clash) throw new Error('Ya existe otra marca con ese slug.');
    }

    // El slug es la FK que usan los productos (brandSlug); el
    // ON UPDATE CASCADE del schema ya se encarga de propagar el cambio.
    const updated = await prisma.brand.update({
      where: { id: input.id },
      data: { label, slug },
      include,
    });

    return toDTO(updated);
  });
}

export async function deleteBrandAction(id: string): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    const brand = await prisma.brand.findUnique({ where: { id }, include });
    if (!brand) throw new Error('La marca no existe.');

    // A diferencia de Category (FK ON DELETE RESTRICT), Product.brandSlug
    // es opcional y su FK es ON DELETE SET NULL: la BBDD sí dejaría borrar
    // una marca en uso y desasignaría el campo en silencio. Se bloquea
    // aquí a propósito, igual que en categorías, para que el admin
    // reasigne o quite la marca de esos productos de forma explícita antes.
    if (brand._count.products > 0) {
      throw new Error(
        `No se puede borrar: hay ${brand._count.products} producto${brand._count.products === 1 ? '' : 's'} con esta marca.`
      );
    }

    await prisma.brand.delete({ where: { id } });
  });
}

/* ---------- Importación masiva desde Excel ---------- */

const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMPORT_ROWS = 2000;
const MAX_LABEL_LENGTH = 120;
const MAX_SKIPPED_LABELS_SHOWN = 10;

/** Cabeceras reconocidas (normalizadas: minúsculas y sin acentos). */
const LABEL_HEADERS = ['nombre', 'marca', 'marcas', 'brand', 'brands', 'label', 'name'];
const SLUG_HEADERS = ['slug'];

export interface ImportBrandsResult {
  created: number;
  /** Marcas que ya existían (o repetidas dentro del propio Excel) y no se han vuelto a crear. */
  skipped: number;
  /** Primeros nombres omitidos, para que el admin vea cuáles son. */
  skippedLabels: string[];
  /** Filas del Excel que no se han podido importar, con el motivo. */
  invalid: { row: number; message: string }[];
  /** Listado actualizado de marcas, para refrescar la tabla sin recargar. */
  brands: BrandDTO[];
}

interface ParsedBrandRow {
  rowNumber: number;
  label: string;
  slug?: string;
}

/** Minúsculas y sin acentos: "Máxima" y "maxima" cuentan como lo mismo. */
function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Lee la primera hoja con datos. Si la primera fila trae una cabecera
 * reconocida (Nombre / Marca / Brand / Label / Name, y opcionalmente Slug)
 * usa esas columnas; si no, toma la columna A como nombres y trata todas las
 * filas como datos.
 */
function readBrandRows(worksheet: ExcelJS.Worksheet): ParsedBrandRow[] {
  const rows: { rowNumber: number; cells: string[] }[] = [];
  const columnCount = worksheet.columnCount;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells: string[] = [];
    for (let col = 1; col <= columnCount; col += 1) {
      // `cell.text` ya resuelve fórmulas, texto enriquecido e hipervínculos.
      cells.push(row.getCell(col).text.trim());
    }
    if (cells.some(Boolean)) rows.push({ rowNumber, cells });
  });

  if (rows.length === 0) return [];

  const headerCells = rows[0].cells.map(normalizeText);
  const headerLabelCol = headerCells.findIndex((cell) => LABEL_HEADERS.includes(cell));

  let labelCol = 0;
  let slugCol = -1;
  let dataRows = rows;

  if (headerLabelCol !== -1) {
    labelCol = headerLabelCol;
    slugCol = headerCells.findIndex((cell) => SLUG_HEADERS.includes(cell));
    dataRows = rows.slice(1);
  }

  return dataRows.map((row) => ({
    rowNumber: row.rowNumber,
    label: row.cells[labelCol] ?? '',
    slug: slugCol !== -1 ? row.cells[slugCol] || undefined : undefined,
  }));
}

/**
 * Importa marcas en bloque desde un .xlsx (campo "file" del FormData).
 * Es idempotente: lo que ya existe se omite, así que se puede volver a
 * subir el mismo archivo sin crear duplicados.
 */
export async function importBrandsAction(formData: FormData): Promise<AdminActionResult<ImportBrandsResult>> {
  return runAdminAction(async () => {
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      throw new Error('No se ha seleccionado ningún archivo.');
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      throw new Error('Formato no soportado. Sube un archivo Excel (.xlsx).');
    }
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      throw new Error('El archivo supera el tamaño máximo permitido (5 MB).');
    }

    const workbook = new ExcelJS.Workbook();
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    } catch {
      throw new Error('No se ha podido leer el Excel. Comprueba que es un .xlsx válido y no está dañado.');
    }

    const worksheet = workbook.worksheets.find((sheet) => sheet.actualRowCount > 0);
    if (!worksheet) throw new Error('El Excel no contiene datos.');

    const parsedRows = readBrandRows(worksheet);
    if (parsedRows.length === 0) throw new Error('No se han encontrado marcas en el Excel.');
    if (parsedRows.length > MAX_IMPORT_ROWS) {
      throw new Error(`El Excel tiene demasiadas filas (máximo ${MAX_IMPORT_ROWS} por importación).`);
    }

    const existing = await prisma.brand.findMany({ select: { slug: true, label: true } });
    const knownSlugs = new Set(existing.map((brand) => brand.slug));
    const knownLabels = new Set(existing.map((brand) => normalizeText(brand.label)));

    const toCreate: { label: string; slug: string }[] = [];
    const skippedLabels: string[] = [];
    const invalid: { row: number; message: string }[] = [];
    let skipped = 0;

    for (const row of parsedRows) {
      const label = row.label.replace(/\s+/g, ' ').trim();

      if (!label) {
        invalid.push({ row: row.rowNumber, message: 'Nombre vacío.' });
        continue;
      }
      if (label.length > MAX_LABEL_LENGTH) {
        invalid.push({ row: row.rowNumber, message: `El nombre supera los ${MAX_LABEL_LENGTH} caracteres.` });
        continue;
      }

      const slug = slugify(row.slug?.trim() || label);
      if (!slug) {
        invalid.push({ row: row.rowNumber, message: `No se puede generar un slug válido para "${label}".` });
        continue;
      }

      const normalizedLabel = normalizeText(label);
      if (knownSlugs.has(slug) || knownLabels.has(normalizedLabel)) {
        skipped += 1;
        if (skippedLabels.length < MAX_SKIPPED_LABELS_SHOWN) skippedLabels.push(label);
        continue;
      }

      // También cuenta como "conocida" para detectar repetidas dentro del propio Excel.
      knownSlugs.add(slug);
      knownLabels.add(normalizedLabel);
      toCreate.push({ label, slug });
    }

    let created = 0;
    if (toCreate.length > 0) {
      const result = await prisma.brand.createMany({ data: toCreate, skipDuplicates: true });
      created = result.count;
    }

    return {
      created,
      skipped,
      skippedLabels,
      invalid,
      brands: await getBrands(),
    };
  });
}