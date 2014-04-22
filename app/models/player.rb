class Player < ActiveRecord::Base

  has_many :teams, foreign_key: 'team'  
  has_many :game_stats
  has_many :rz_game_stats
  has_many :games, through: :game_stats, foreign_key: 'gsis_id'
  
  self.primary_key = :player_id
  
  def self.season_totals(type = 'REGULAR', red_zone = 'no', omit_weeks =[0], positions, page, is_sum, player_id)
    if red_zone == 'yes'
      red_zone = 'rz_'
    else
      red_zone = ''
    end
    if is_sum == 'true'
      stat = 'sum'
    else
      stat = 'avg'
    end
    
    if player_id != '' 
      sql = "
        select players.player_id, players.full_name, players.position,
        #{stat}(passing_yds) as passing_yds,  
        #{stat}(passing_tds) as passing_tds, 
        #{stat}(passing_int) as passing_int,
        #{stat}(passing_attempts) as passing_attempts, 
        #{stat}(passing_completions) as passing_completions,
        #{stat}(rushing_yds) as rushing_yds,
        #{stat}(rushing_tds) as rushing_tds, 
        #{stat}(rushing_att) as rushing_att, 
        #{stat}(receiving_yds) as receiving_yds, 
        #{stat}(receiving_tds) as receiving_tds,
        #{stat}(receiving_rec) as receiving_rec,
        #{stat}(receiving_tar) as receiving_tar,
        (#{stat}(passing_yds)/25.00) + (#{stat}(passing_tds)*4) + (#{stat}(passing_int)*-1) + (#{stat}(rushing_yds)/10.00) + (#{stat}(rushing_tds)*6)
        + (#{stat}(receiving_yds)/10.00) + (#{stat}(receiving_tds)*6) + (#{stat}(receiving_rec)/2.00) 
         as total_tds
        from players 
        inner join #{red_zone}game_stats on players.player_id = #{red_zone}game_stats.player_id
        where players.player_id = '#{player_id}' and season_type= 'Regular' and week not in (?)
        and players.position in (?)
        group by players.player_id, players.full_name, players.position
        order by total_tds desc limit(25) offset(?);
      "
    else
      sql = "
        select players.player_id, players.full_name, players.position,
        #{stat}(passing_yds) as passing_yds,  
        #{stat}(passing_tds) as passing_tds, 
        #{stat}(passing_int) as passing_int,
        #{stat}(passing_attempts) as passing_attempts, 
        #{stat}(passing_completions) as passing_completions,
        #{stat}(rushing_yds) as rushing_yds,
        #{stat}(rushing_tds) as rushing_tds, 
        #{stat}(rushing_att) as rushing_att, 
        #{stat}(receiving_yds) as receiving_yds, 
        #{stat}(receiving_tds) as receiving_tds,
        #{stat}(receiving_rec) as receiving_rec,
        #{stat}(receiving_tar) as receiving_tar,
        (#{stat}(passing_yds)/25.00) + (#{stat}(passing_tds)*4) + (#{stat}(passing_int)*-1) + (#{stat}(rushing_yds)/10.00) + (#{stat}(rushing_tds)*6)
        + (#{stat}(receiving_yds)/10.00) + (#{stat}(receiving_tds)*6) + (#{stat}(receiving_rec)/2.00) 
         as total_tds
        from players 
        inner join #{red_zone}game_stats on players.player_id = #{red_zone}game_stats.player_id
        where players.player_id in (
        select distinct #{red_zone}game_stats.player_id from #{red_zone}game_stats) and season_type= 'Regular' and week not in (?)
        and players.position in (?)
        group by players.player_id, players.full_name, players.position
        order by total_tds desc limit(25) offset(?);
      "
    end
    records_array = ActiveRecord::Base.connection.execute(sanitize_sql([sql, omit_weeks, positions, page]))
  
  end
  
  def weekly(stat, team, is_red_zone)
    totals = {}
    query = stat + '>0'
    if is_red_zone == 'no'
      totals = GameStat.select(stat, 'week').where(:team => team, :season_type => 'Regular',
                                  :player_id => self.player_id)
                                  .where(query)
    else
      totals = RzGameStat.select(stat, 'week').where(:team => team, :season_type => 'Regular',
                                  :player_id => self.player_id)
                                  .where(query)
    end                                  
  end
  
  
end
