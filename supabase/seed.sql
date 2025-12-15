-- Seed demo data for Ink & Fade
-- Re-run safely by truncating tables first (demo only).

truncate table bookings, reviews, portfolio_items, services, artists restart identity cascade;

with inserted_artist as (
  insert into artists (name, title, bio, avatar, rating, review_count, styles, location)
  values (
    'Marcus "Ink" Sterling',
    'Master Artist & Barber',
    'Specializing in hyper-realism tattoos and precision geometric fades for over 12 years. Winner of the 2023 Vanguard Arts Award.',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
    4.9,
    128,
    array['Realism','Fine Line','Skin Fade','Old School'],
    'Downtown Arts District, LA'
  )
  returning id
)
insert into services (artist_id, name, duration, price, deposit, description)
select id, 'Executive Fade', 45, 45, 15, 'Premium cut with hot towel treatment and straight razor finish.' from inserted_artist
union all
select id, 'Beard Sculpting', 30, 25, 10, 'Shaping and trimming with organic beard oil application.' from inserted_artist
union all
select id, 'Traditional Tattoo (Small)', 120, 150, 50, 'Up to 3x3 inches, black and grey or full color.' from inserted_artist
union all
select id, 'Realism Sleeve Session', 360, 800, 200, 'Full day session focusing on hyper-realistic textures.' from inserted_artist;

with a as (select id from artists limit 1)
insert into portfolio_items (artist_id, image_url, description, tags)
select id, 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600', 'Lion realism back piece', array['Realism','Black & Grey'] from a
union all
select id, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', 'Geometric sleeve', array['Geometric','Dotwork'] from a
union all
select id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600', 'Classic low fade', array['Fade','Traditional'] from a
union all
select id, 'https://images.unsplash.com/photo-1621605815841-aa88014397e1?auto=format&fit=crop&q=80&w=600', 'Traditional dagger', array['American Traditional'] from a;

with a as (select id from artists limit 1)
insert into reviews (artist_id, author, rating, content, date, verified)
select id, 'James W.', 5, 'Best realism work in the city. The attention to detail is insane.', '2 days ago', true from a
union all
select id, 'Sarah K.', 5, 'Marcus is a professional. Booking was seamless and the deposit system is fair.', '1 week ago', true from a
union all
select id, 'Michael R.', 4, 'Great cut, but hard to find parking near the studio.', '2 weeks ago', true from a;

