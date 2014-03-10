class RzGameStat < ActiveRecord::Base
  
  belongs_to :teams 
  belongs_to :players
  belongs_to :games, foreign_key: 'gsis_id'
  
  self.primary_key = :gsis_id
  
end
