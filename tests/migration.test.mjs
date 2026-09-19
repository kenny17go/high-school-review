import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;
 create table subjects(id bigserial primary key,code text unique,name text,enabled boolean,sort_order integer);
 insert into subjects(code,name,enabled) values ('MATH','數學',true),('CHIN','國文',false);
 create table questions(id bigint primary key,subject_id bigint references subjects(id),grade integer,question_text text,source_url text);
 create table attempts(id bigint primary key,question_id bigint,user_id uuid);
 create table wrong_questions(id bigint primary key,question_id bigint,user_id uuid);
 create table national_exam_sources(id bigint primary key,subject text);
 create table exam_scope_profiles(id bigint primary key);
 insert into questions values (1,1,1,'Frozen math',null),(2,null,2,'Legacy math',null);
 insert into attempts values (1,1,'00000000-0000-0000-0000-000000000001');
 insert into wrong_questions values (1,2,'00000000-0000-0000-0000-000000000001');
 alter table questions enable row level security;
 create policy legacy_read on questions for select to anon,authenticated using(true);
 grant select on questions,subjects to anon,authenticated;`);
 const sql=fs.readFileSync(new URL('../supabase/migrations/20260914151605_v5_subject_core.sql',import.meta.url),'utf8');
 await db.exec(sql);await db.exec(sql); // repeatable and no duplicate rows/policies
 const rows=(await db.query('select id,question_text,subject_id from questions order by id')).rows;
 assert.equal(rows.length,2);assert.equal(rows[0].question_text,'Frozen math');assert.equal(rows[1].subject_id,1);
 assert.equal((await db.query('select subject_id from attempts')).rows[0].subject_id,1);
 assert.equal((await db.query('select subject_id from wrong_questions')).rows[0].subject_id,1);
 await db.exec("insert into attempts(id,question_id,user_id) values (2,2,'00000000-0000-0000-0000-000000000001')");
 assert.equal((await db.query('select subject_id from attempts where id=2')).rows[0].subject_id,1);
 await db.exec(`insert into questions(id,subject_id,grade,question_text,source_type,classification_status,verified_at) values
 (3,2,1,'pending','ceec_official','needs_review',null),
 (4,2,1,'original','platform_simulated','verified',now());
 insert into classical_texts values ('a','A','author','era','core15','108','original','[]','[]',null,null),('b','B','author','era','extended15','platform','original','[]','[]',null,null);
 insert into question_text_links(question_id,text_id,relationship_type,confidence,classification_status,classification_method,evidence,verified_at) values
 (4,'a','comparison',1,'verified','manual','test',now()),(4,'b','comparison',1,'verified','manual','test',now()),(3,'a','direct',0.5,'needs_review','rule',null,null);
 set role anon;`);
 assert.deepEqual((await db.query('select id from questions order by id')).rows.map(r=>r.id),[1,2,4]);
 assert.equal((await db.query('select * from question_text_links')).rows.length,2);
 await assert.rejects(db.query("insert into classical_texts(text_id) values ('unauthorized')"));
 await assert.rejects(db.query('select * from source_candidates'));
 await db.exec('reset role;');
 await db.exec(`insert into passages(passage_id,subject_id,title,body,rights_status,publication_status) values
 ('visible',2,'fixture','original body','original','verified'),
 ('pending',2,'fixture','pending body','original','needs_review'),
 ('rights-pending',2,'fixture','restricted body','needs_review','verified');
 insert into question_groups(group_id,subject_id,passage_id) values ('visible-group',2,'visible'),('hidden-group',2,'pending');
 insert into question_group_items(group_id,question_id,position) values ('visible-group',4,0),('hidden-group',4,0);`);
 for(const role of ['anon','authenticated']){
  await db.exec('set role '+role);
  assert.deepEqual((await db.query('select passage_id from passages')).rows.map(r=>r.passage_id),['visible']);
  assert.deepEqual((await db.query('select group_id from question_groups')).rows.map(r=>r.group_id),['visible-group']);
  assert.deepEqual((await db.query('select group_id from question_group_items')).rows.map(r=>r.group_id),['visible-group']);
  await assert.rejects(db.query("update passages set body='changed' where passage_id='visible'"));
  await db.exec('reset role');
 }
 const policies=(await db.query("select tablename from pg_tables where schemaname='public' and tablename in ('passages','classical_texts','source_candidates') and rowsecurity")).rows;
 assert.equal(policies.length,3);
 console.log('PASS: PostgreSQL migration twice, old rows preserved, subject backfill, many-to-many, anon RLS review gate and denied writes.');
}finally{await db.close();}
