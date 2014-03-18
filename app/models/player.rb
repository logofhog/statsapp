class Player < ActiveRecord::Base

  has_many :teams, foreign_key: 'team'  
  has_many :game_stats
  has_many :rz_game_stats
  has_many :games, through: :game_stats, foreign_key: 'gsis_id'
  
  self.primary_key = :player_id
  
  def season_totals(player_id = :player_id, type = 'REGULAR', red_zone = 'no')
    totals = {}
    omit_week = 18 # so that week 17 will be included
    if type == 'without'
      omit_17 = 17
    end
    if red_zone == 'yes'
      puts 'red zone yes'
      stats = RzGameStat.where(:player_id => player_id)
    else
      puts 'red zone no'
      stats = GameStat.where(:player_id => player_id)
    end
    i = 0
    invalid_attrs = ['player_id', 'gsis_id', 'team', 'week']
    stats.each do |single_game|
      if i == 0
        totals = single_game
        i += 1
      else
        if single_game.season_type.upcase == type.upcase && single_game.week != omit_week
          single_game.attributes.keys.each do |attr|
            unless attr.in? invalid_attrs
                totals[attr] = single_game[attr].to_i + totals[attr].to_i
            end
          end
        end
      end
    end
  totals
  end
  
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
