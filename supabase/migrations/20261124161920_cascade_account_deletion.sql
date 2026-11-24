-- Deleting an auth user removes their shops; deleting a shop removes every
-- shop-scoped row. Reassert CASCADE only for those ownership relationships.
-- Appointment references to an individual barber or service intentionally
-- remain ON DELETE SET NULL so existing appointment behavior is preserved.
DO $$
DECLARE
  fk record;
  source_column text;
  target_column text;
BEGIN
  FOR fk IN
    SELECT con.oid, con.conrelid, con.confrelid, con.conname, con.conkey, con.confkey
    FROM pg_constraint AS con
    WHERE con.contype = 'f'
      AND con.confdeltype <> 'c'
      AND (
        (con.conrelid = 'public.shops'::regclass AND con.confrelid = 'auth.users'::regclass)
        OR (
          con.conrelid IN (
            'public.barbers'::regclass,
            'public.services'::regclass,
            'public.clients'::regclass,
            'public.appointments'::regclass
          )
          AND con.confrelid = 'public.shops'::regclass
        )
      )
  LOOP
    SELECT att.attname
      INTO source_column
      FROM pg_attribute AS att
     WHERE att.attrelid = fk.conrelid
       AND att.attnum = fk.conkey[1];

    SELECT att.attname
      INTO target_column
      FROM pg_attribute AS att
     WHERE att.attrelid = fk.confrelid
       AND att.attnum = fk.confkey[1];

    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.conrelid::regclass, fk.conname);
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %s (%I) ON DELETE CASCADE',
      fk.conrelid::regclass,
      fk.conname,
      source_column,
      fk.confrelid::regclass,
      target_column
    );
  END LOOP;
END
$$;
