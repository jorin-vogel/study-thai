require 'json'
require 'sinatra'
require './database'

set :environment, :production
set :views, settings.root
use Rack::Deflater


phrases = database[:phrases]


get %r{^/(add/?|edit/[0-9]+/?)?$} do
  @data = phrases.select(:id, :lang1, :lang2, :tags).reverse_order(:timestamp).all.to_json

  erb :index
end

get '/*' do
  redirect '/'
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

