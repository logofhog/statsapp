class Player < ActiveRecord::Base

  has_many :teams, foreign_key: 'team'  
  has_many :game_stats
  has_many :rz_game_stats
  has_many :games, through: :game_stats, foreign_key: 'gsis_id'
  
  self.primary_key = :player_id
  
  def self.season_totals(type = 'REGULAR', red_zone = 'no', omit_weeks =[0], positions, page)
    if red_zone == 'yes'
      red_zone = 'rz_'
    else
      red_zone = ''
    end
    sql = "
      select players.player_id, players.full_name, players.position,
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
      where players.player_id in (
      select distinct #{red_zone}game_stats.player_id from #{red_zone}game_stats) and season_type= 'Regular' and week not in (?)
      and players.position in (?)
      group by players.player_id, players.full_name, players.position
      order by total_tds desc limit(25) offset(?);
    "
    records_array = ActiveRecord::Base.connection.execute(sanitize_sql([sql, omit_weeks, positions, page]))
  
  end
#    totals = {}
#    omit_week = 18 # so that week 17 will be included
#    if type == 'without'
#      omit_17 = 17
#    end
#    if red_zone == 'yes'
#      stats = RzGameStat.where(:player_id => player_id).where("week NOT IN (?)", omit_weeks)
#    else
#      puts omit_weeks
#      stats = GameStat.where(:player_id => player_id).where("week NOT IN (?)", omit_weeks)
#    end
#    i = 0
#    invalid_attrs = ['player_id', 'gsis_id', 'team', 'week']
#    stats.each do |single_game|
#      if i == 0
#        totals = single_game
#        i += 1
#      else
#        if single_game.season_type.upcase == type.upcase && single_game.week != omit_week
#          single_game.attributes.keys.each do |attr|
#            unless attr.in? invalid_attrs
#                totals[attr] = single_game[attr].to_i + totals[attr].to_i
#            end
#          end
#        end
#      end
#    end
#  totals
#  end
  
  def weekly(stat, team, is_red_zone)
    puts is_red_zone
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
