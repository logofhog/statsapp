class PlayersController < ApplicationController

  def index
    stats_type = 'regular' || params[:type]
    is_red_zone = params[:red_zone] || 'no'
    position = params[:position].scan(/../)
    omit_weeks = params[:omit_weeks].split(/,/) || []
    is_sum = params[:is_sum]
    page = (params[:page] || 0).to_i * 25
    
    @player = Player.season_totals(stats_type, is_red_zone, omit_weeks, position, page, is_sum)
    
    render json: @player
  end
  
  def show
    @player = Player.find(params[:id])
    player_stats = GameStat.where(:player_id => @player.player_id)
    player_stats.each_with_index do |game, index|
      player_stats[index] = {'single_game_stats' => player_stats[index],
                            'game' => Game.where(:gsis_id => game.gsis_id).first}
    end
      
    render json: {'player' => @player, 'stats' => player_stats}
  end
  
  def weekly
    players = Player.where(:team => params[:id])
    stats = []
    players.each do |player|
#      puts player.full_name
      stat = player.weekly(params[:stat], params[:id], params[:red_zone])
      if stat.size>0
        stats.append({'player' => player.full_name, 'stats' => stat})
      end
    end
#    puts stats.count()
    render json: stats
  end
  
  def search
    players = Player.where("lower(full_name) like ?", "%#{params[:query].downcase}%")
                    .limit(10).order('sorting_score DESC')
    puts players
    render json:players
  end



end
