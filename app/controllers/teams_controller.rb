class TeamsController < ApplicationController

  def index
    @teams = Team.where.not(city:  'UNK')
    render json: @teams
  end
  
  def show
    @players = Player.all(:conditions => ["team = ? AND sorting_score > 0", 
                          params[:id]]) 
                          
    @players.each_with_index do |player, index|
      @players[index] = {'player' => player, 
                         'stats' => player.season_totals(player.id, 'REGULAR', params[:red_zone])}
      puts 'getting '
    end
    render json: @players
  end
  
end
