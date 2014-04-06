class TeamsController < ApplicationController

  def index
    @teams = Team.where.not(city:  'UNK')
    render json: @teams
  end
  
  def show
    @players = Team.season_totals(params[:id], params[:red_zone])
    render json: @players
  end

  def as_weekly 
    @players = Team.weekly_totals(params[:team], params[:red_zone])
    render json: @players
  end
end
