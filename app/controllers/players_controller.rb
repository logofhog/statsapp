class PlayersController < ApplicationController

  def index
    stats_type = 'regular' || params[:type]
    is_red_zone = params[:red_zone] || 'no'
    position = params[:position].scan(/../)
    offset = params[:page] || 0
    page = offset.to_i * 25
    puts page
    
    if params[:position]
      if is_red_zone == 'no'
        @player = Player.where(:position => position)
                        .order("sorting_score DESC").limit(25).offset(page)
      else
        @player = Player.where(:position => position)
                        .order("rz_sorting_score DESC").limit(25).offset(page)
      end
    else
      if is_red_zone == 'no'
        @player = Player.order('sorting_score DESC').limit(25)
      else 
        @player = Player.order('rz_sorting_score DESC').limit(25)
      end
    end
    @player.each_with_index do |player, index|
      @player[index] = {'player' => player, 
                        'totals' => player.season_totals(player.player_id, stats_type, params[:red_zone])}
    end
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
    
    
#    @player = Player.where(position: ['RB','WR'])
#    @player.each do |player, index|
#      puts player
#      puts player.season_totals(player.player_id)
# #      @player[index] = player.season_totals
#    end

#    --------player to single game stats --------------
#    @player = Player.all(:order => "sorting_score DESC", :limit=>1)
# 
#    stats = @player[0].game_stats
#    stats.each do |stat|
#      puts stat.passing_tds
#    end

#    -----------single game to player stats----------------
#    @game = Game.all(:limit => 1).first

#    @game = Game.joins("LEFT JOIN game_stats g ON games.gsis_id = g.gsis_id")
#                .where("home_team = 'ATL'")
#                .where("season_year = 2013")
#                .where("season_type = 'regular'")
#                .uniq
                
# .joins("LEFT JOIN players ON players.player_id = game_stats.player_id")


#      -------------team to players ------------------------
#    @team = Team.all(:limit => 1).first
#    @team.players.each do |player|
#      puts player.season_totals(player.player_id)
#    end

#    -------------- team to single game --------------------
    

#    ----------------team to players stats ------------------


end
