alter table public.orders
  add column if not exists student_name text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'student'
  ) then
    execute $migration$
      update public.orders
      set student_name = nullif(btrim(student::text), '')
      where student_name is null
        and nullif(btrim(student::text), '') is not null
        and student::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    $migration$;
  end if;
end
$$;
