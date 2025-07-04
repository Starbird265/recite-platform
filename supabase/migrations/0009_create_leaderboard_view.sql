create view leaderboard as
select
  user_id,
  avg(score) as avg_score,
  count(*) as attempts
from results
group by user_id
order by avg_score desc;