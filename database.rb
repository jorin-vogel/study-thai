require 'sinatra/sequel'

set :database, 'sqlite://study.db'

migration "simple db" do
  database.create_table :phrases do
    primary_key :id
    String :en
    String :th
    String :tags
    Datetime :timestamp
  end
end