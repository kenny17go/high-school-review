-- V5 additive migration. Run on a staging copy first; never recreates the V4 database.
begin;
insert into public.subjects(code,name,enabled,sort_order) values ('CHIN','國文',true,6)
on conflict(code) do update set name=excluded.name,enabled=excluded.enabled;

alter table public.questions add column if not exists source_type text not null default 'unknown';
alter table public.questions add column if not exists classification_status text not null default 'unclassified';
alter table public.questions add column if not exists classification_method text;
alter table public.questions add column if not exists verified_at timestamptz;
alter table public.questions add column if not exists learning_metadata jsonb not null default '{}';
alter table public.attempts add column if not exists subject_id bigint references public.subjects(id);
alter table public.wrong_questions add column if not exists subject_id bigint references public.subjects(id);
alter table public.national_exam_sources add column if not exists subject_id bigint references public.subjects(id);
alter table public.exam_scope_profiles add column if not exists learning_mapping jsonb not null default '{}';

-- Null legacy subject means math. Explicit subject IDs are never rewritten.
update public.questions set subject_id=(select id from public.subjects where code='MATH') where subject_id is null;
update public.attempts a set subject_id=coalesce((select q.subject_id from public.questions q where q.id=a.question_id),(select id from public.subjects where code='MATH')) where a.subject_id is null;
update public.wrong_questions w set subject_id=coalesce((select q.subject_id from public.questions q where q.id=w.question_id),(select id from public.subjects where code='MATH')) where w.subject_id is null;
update public.national_exam_sources n set subject_id=s.id from public.subjects s where n.subject_id is null and s.name=coalesce(n.subject,'數學');

create table if not exists public.classical_texts(
 text_id text primary key,title text not null,author text,era text,
 text_group text not null check(text_group in ('core15','extended15')),
 curriculum_status text not null,public_domain_status text not null,
 tags jsonb not null default '[]',aliases jsonb not null default '[]',source_reference text,notes text
);
create table if not exists public.passages(
 passage_id text primary key,subject_id bigint not null references public.subjects(id),title text not null,
 body text,source_url text,rights_status text not null default 'needs_review',
 publication_status text not null default 'needs_review' check(publication_status in ('verified','needs_review','unclassified'))
);
create table if not exists public.question_groups(
 group_id text primary key,subject_id bigint not null references public.subjects(id),
 passage_id text references public.passages(passage_id),title text
);
create table if not exists public.question_group_items(
 group_id text not null references public.question_groups(group_id),
 question_id bigint not null references public.questions(id),position integer not null check(position>=0),
 primary key(group_id,question_id),unique(group_id,position)
);
create table if not exists public.question_text_links(
 question_id bigint not null references public.questions(id),text_id text not null references public.classical_texts(text_id),
 relationship_type text not null check(relationship_type in ('direct','indirect','comparison','extended')),
 confidence numeric not null check(confidence between 0 and 1),
 classification_status text not null default 'needs_review' check(classification_status in ('verified','high_confidence','needs_review','unclassified')),
 classification_method text not null default 'metadata' check(classification_method in ('manual','metadata','rule','ai_assisted')),
 evidence text,verified_at timestamptz,primary key(question_id,text_id,relationship_type),
 check(classification_status<>'verified' or (evidence is not null and verified_at is not null))
);
create table if not exists public.question_skills(
 question_id bigint not null references public.questions(id),subject_id bigint not null references public.subjects(id),skill text not null,
 primary key(question_id,skill)
);
create table if not exists public.source_candidates(
 candidate_id text primary key,subject_id bigint not null references public.subjects(id),source_url text not null,
 metadata jsonb not null default '{}',classification_status text not null default 'needs_review',created_at timestamptz not null default now()
);
create index if not exists questions_subject_grade_page on public.questions(subject_id,grade,id);
create index if not exists question_text_lookup on public.question_text_links(text_id,classification_status,question_id);
create index if not exists question_skill_lookup on public.question_skills(subject_id,skill,question_id);
create index if not exists attempts_subject_user on public.attempts(user_id,subject_id);

-- Old clients need not send a new field. Derive it from the referenced question.
create or replace function public.v5_record_subject() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 select q.subject_id into new.subject_id from public.questions q where q.id=new.question_id;
 return new;
end $$;
do $$ begin
 if not exists(select 1 from pg_trigger where tgname='v5_attempt_subject' and tgrelid='public.attempts'::regclass) then
  create trigger v5_attempt_subject before insert or update of question_id on public.attempts for each row execute function public.v5_record_subject();
 end if;
 if not exists(select 1 from pg_trigger where tgname='v5_wrong_subject' and tgrelid='public.wrong_questions'::regclass) then
  create trigger v5_wrong_subject before insert or update of question_id on public.wrong_questions for each row execute function public.v5_record_subject();
 end if;
end $$;

alter table public.classical_texts enable row level security;
alter table public.passages enable row level security;
alter table public.question_groups enable row level security;
alter table public.question_group_items enable row level security;
alter table public.question_text_links enable row level security;
alter table public.question_skills enable row level security;
alter table public.source_candidates enable row level security;
-- No client grants/policies for the candidate queue; metadata remains private pending review.
revoke all on public.source_candidates from anon,authenticated;
grant select on public.classical_texts,public.passages,public.question_groups,public.question_group_items,public.question_text_links,public.question_skills to anon,authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='classical_texts' and policyname='v5_text_metadata_read') then
  create policy v5_text_metadata_read on public.classical_texts for select to anon,authenticated using(true);
  create policy v5_passage_read on public.passages for select to anon,authenticated using(publication_status='verified' and rights_status in ('public_domain','original','licensed'));
  create policy v5_group_read on public.question_groups for select to anon,authenticated using(exists(select 1 from public.passages p where p.passage_id=question_groups.passage_id));
  create policy v5_group_item_read on public.question_group_items for select to anon,authenticated using(exists(select 1 from public.question_groups g where g.group_id=question_group_items.group_id) and exists(select 1 from public.questions q where q.id=question_group_items.question_id));
  create policy v5_text_link_read on public.question_text_links for select to anon,authenticated using(classification_status='verified' and confidence>=0.9 and exists(select 1 from public.questions q where q.id=question_text_links.question_id));
  create policy v5_skill_read on public.question_skills for select to anon,authenticated using(exists(select 1 from public.questions q where q.id=question_skills.question_id));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='questions' and policyname='v5_chinese_review_gate') then
  create policy v5_chinese_review_gate on public.questions as restrictive for select to anon,authenticated
  using(subject_id is distinct from (select id from public.subjects where code='CHIN') or
    (classification_status='verified' and verified_at is not null and
      (source_type in ('platform_simulated','platform_generated') or
       (source_type in ('ceec_official','school_official','school_exam_verified') and source_url is not null))));
 end if;
end $$;
commit;
