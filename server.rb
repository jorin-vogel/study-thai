require 'json'
require 'sinatra'
require 'sinatra/sequel'
require './database'

set :views, settings.root

phrases = database[:phrases]


get '/' do
  @data = phrases.select(:id, :en, :th, :tags).reverse_order(:timestamp).all.to_json

  erb :index
end

post '/api/phrases' do
  data = JSON.parse request.body.read
  data[:timestamp] = Time.now

  { :id => phrases.insert(data) }.to_json
end

put '/api/phrases/:id' do
  data = JSON.parse request.body.read
  phrases.where(:id => params[:id]).update(data)

  200
end

delete '/api/phrases/:id' do
  phrases.where(:id => params[:id]).delete

  200
end

