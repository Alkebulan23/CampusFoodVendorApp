-- 1. Build an automated callback operation mapping function
create or replace function public.handle_new_user_registration()
returns trigger as $$
begin
  insert into public.users (full_name, tut_email, user_type, creation_time)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', 'New Campus User'),
    lower(new.email),
    coalesce(upper(new.raw_user_meta_data->>'role'), 'STUDENT'),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Bind the operational loop directly to the primary user registry
create or replace trigger on_auth_user_signed_up
  after insert on auth.users
  for each row execute procedure public.handle_new_user_registration();
