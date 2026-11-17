import { backend } from './backend';

export const supabaseAdmin = {
  from: (collection: string) => ({
    select: (_columns = '*') => ({
      eq: async (field: string, value: unknown) => {
        const records = await backend.list(collection);
        const filtered = records.filter((item: any) => item?.[field] === value);
        return { data: filtered, error: null };
      },
      order: async (field: string, opts?: { ascending?: boolean }) => {
        const records = await backend.list(collection);
        const asc = opts?.ascending !== false;
        const sorted = [...records].sort((a: any, b: any) => {
          const av = a?.[field] ?? '';
          const bv = b?.[field] ?? '';
          return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
        return { data: sorted, error: null };
      },
    }),
    update: (updates: Record<string, unknown>) => ({
      eq: async (field: string, value: unknown) => {
        try {
          if (field === 'id' && typeof value === 'string') {
            const updated = await backend.update(collection, value, updates);
            return { data: updated, error: null };
          }
          const records = await backend.list(collection);
          const matches = records.filter((item: any) => item?.[field] === value);
          for (const item of matches) {
            if (item?.id) {
              await backend.update(collection, item.id, updates);
            }
          }
          return { data: matches, error: null };
        } catch (err: any) {
          return { data: null, error: { message: err?.message || 'Update failed' } };
        }
      },
    }),
    insert: async (rows: Record<string, unknown> | Record<string, unknown>[]) => {
      try {
        const list = Array.isArray(rows) ? rows : [rows];
        const created = [];
        for (const row of list) {
          created.push(await backend.create(collection, row));
        }
        return { data: created, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err?.message || 'Insert failed' } };
      }
    },
    delete: () => ({
      eq: async (field: string, value: unknown) => {
        try {
          if (field === 'id' && typeof value === 'string') {
            await backend.remove(collection, value);
            return { error: null };
          }
          const records = await backend.list(collection);
          const matches = records.filter((item: any) => item?.[field] === value);
          for (const item of matches) {
            if (item?.id) {
              await backend.remove(collection, item.id);
            }
          }
          return { error: null };
        } catch (err: any) {
          return { error: { message: err?.message || 'Delete failed' } };
        }
      },
    }),
  }),
};
