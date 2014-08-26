require 'sinatra/sequel'

set :database, 'sqlite://database.db'

migration "simple db" do
  database.create_table :phrases do
    primary_key :id
    String :lang1
    String :lang2
    String :tags
    Datetime :timestamp
  end
end
