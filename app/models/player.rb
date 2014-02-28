class Player < ActiveRecord::Base

  has_many :teams, foreign_key: 'team'  
  has_many :game_stats
  has_many :games, through: :game_stats, foreign_key: 'gsis_id'
  
  self.primary_key = :player_id
  
  def season_totals(player_id = :player_id)
    totals = {}
    
    stats = GameStat.where(:player_id => player_id).load
    i = 0
    stats.each do |single_game|
      
      single_game.attributes.keys.each do |attr|
        if attr != player_id || gsis_id || team
          if i == 0
            totals = single_game
            i += 1
          else
            totals[attr] = single_game[attr].to_i + totals[attr].to_i
          end
        end
      end
    end
  totals
  end
  
  
end
