class Game < ActiveRecord::Base
    has_many :game_stats, foreign_key: 'gsis_id'
    has_many :players, through: :game_stats
    has_many :teams 
    
    self.primary_key = :gsis_id

end
