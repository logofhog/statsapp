class Team < ActiveRecord::Base
    has_many :players, foreign_key: 'team'
    has_many :games
    has_many :game_stats

    self.primary_key = :team_id

end
