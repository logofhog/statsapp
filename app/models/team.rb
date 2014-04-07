class Team < ActiveRecord::Base
    has_many :players, foreign_key: 'team'
    has_many :games
    has_many :game_stats

    self.primary_key = :team_id
    
    def self.season_totals(team, red_zone = 'no')
      puts 'aaaaaaaaaaaaaaaaaaaaaa'
      if red_zone == 'yes'
        red_zone = 'rz_'
      else
        red_zone = ''
      end
      
      sql = "
        select players.full_name, players.position,
        sum(passing_yds) as passing_yds,  
        sum(passing_tds) as passing_tds, 
        sum(passing_int) as passing_int,
        sum(passing_attempts) as passing_attempts, 
        sum(passing_completions) as passing_completions,
        sum(rushing_yds) as rushing_yds,
        sum(rushing_tds) as rushing_tds, 
        sum(rushing_att) as rushing_att, 
        sum(receiving_yds) as receiving_yds, 
        sum(receiving_tds) as receiving_tds,
        sum(receiving_rec) as receiving_rec,
        sum(receiving_tar) as receiving_tar,
        (sum(passing_yds)/25.00) + (sum(passing_tds)*4) + (sum(passing_int)*-1) + (sum(rushing_yds)/10.00) + (sum(rushing_tds)*6)
        + (sum(receiving_yds)/10.00) + (sum(receiving_tds)*6) + (sum(receiving_rec)/2.00) 
         as total_tds
        from players 
        inner join #{red_zone}game_stats on players.player_id = #{red_zone}game_stats.player_id
        where players.team = (?)
        and season_type= 'Regular'
        group by players.full_name, players.position
        order by total_tds desc;
      "
      records_array = ActiveRecord::Base.connection.execute(sanitize_sql([sql, team]))
  end
  
  def self.weekly_totals(team, red_zone = 'no')
    if red_zone == 'yes'
      red_zone = 'rz_'
    else
      red_zone = ''
    end 
    
    sql = "
        select full_name, week, passing_yds, passing_tds,
        rushing_yds, rushing_tds, rushing_att, receiving_yds, 
        receiving_tds, receiving_rec, receiving_tar
        from players
        inner join #{red_zone}game_stats on players.player_id = #{red_zone}game_stats.player_id
        where #{red_zone}game_stats.team = (?) and season_type = 'Regular' order by #{red_zone}game_stats.week, full_name;
      "
      records_array = ActiveRecord::Base.connection.execute(sanitize_sql([sql, team]))
  end
  
end
