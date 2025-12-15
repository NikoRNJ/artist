-- Datos demo para Ink & Fade
-- Puedes re-ejecutar truncando las tablas primero (solo demo).

truncate table bookings, reviews, portfolio_items, services, artists restart identity cascade;

with inserted_artist as (
  insert into artists (name, title, bio, avatar, rating, review_count, styles, location)
  values (
    'Marcus "Ink" Sterling',
    'Barbero y artista maestro',
    'Especializado en tatuajes hiperrealistas y degradados geométricos de precisión desde hace más de 12 años. Ganador del Premio Vanguard Arts 2023.',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
    4.9,
    128,
    array['Realismo','Línea fina','Degradado','Old school'],
    'Distrito de las Artes (Downtown), LA'
  )
  returning id
)
insert into services (artist_id, name, duration, price, deposit, description)
select id, 'Degradado ejecutivo', 45, 45, 15, 'Corte premium con toalla caliente y acabado a navaja.' from inserted_artist
union all
select id, 'Perfilado de barba', 30, 25, 10, 'Perfilado y recorte con aplicación de aceite de barba orgánico.' from inserted_artist
union all
select id, 'Tatuaje tradicional (pequeño)', 120, 150, 50, 'Hasta 3x3 pulgadas, negro y gris o a todo color.' from inserted_artist
union all
select id, 'Sesión de manga realista', 360, 800, 200, 'Sesión de día completo enfocada en texturas hiperrealistas.' from inserted_artist;

with a as (select id from artists limit 1)
insert into portfolio_items (artist_id, image_url, description, tags)
select id, 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600', 'Espalda hiperrealista de león', array['Realismo','Negro y gris'] from a
union all
select id, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', 'Manga geométrica', array['Geométrico','Dotwork'] from a
union all
select id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600', 'Degradado bajo clásico', array['Degradado','Tradicional'] from a
union all
select id, 'https://images.unsplash.com/photo-1621605815841-aa88014397e1?auto=format&fit=crop&q=80&w=600', 'Daga tradicional', array['Tradicional americano'] from a;

with a as (select id from artists limit 1)
insert into reviews (artist_id, author, rating, content, date, verified)
select id, 'James W.', 5, 'El mejor trabajo de realismo de la ciudad. La atención al detalle es increíble.', 'hace 2 días', true from a
union all
select id, 'Sarah K.', 5, 'Marcus es un profesional. La reserva fue sencilla y el sistema de depósito es justo.', 'hace 1 semana', true from a
union all
select id, 'Michael R.', 4, 'Gran corte, pero es difícil encontrar aparcamiento cerca del estudio.', 'hace 2 semanas', true from a;
