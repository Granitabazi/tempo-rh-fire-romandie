-- Premier compte administrateur Fire Romandie.

insert into public.profiles(id,organization_id,full_name,role)
select
  '41aee9e4-e238-471a-9be9-bbb5ecfbbffa'::uuid,
  id,
  'Administrateur Fire Romandie',
  'admin'
from public.organizations
where slug='fire-romandie'
on conflict (id) do update set
  organization_id=excluded.organization_id,
  full_name=excluded.full_name,
  role=excluded.role,
  active=true;
