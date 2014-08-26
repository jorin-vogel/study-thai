require 'sinatra/sequel'

set :database, 'sqlite://database.db'

migration "simple db" do
  database.create_table :phrases do
    primary_key :id
    String :en
    String :th
    String :tags
    Datetime :timestamp
  end
end

migration "language independent" do
  database.alter_table :phrases do
    rename_column :en, :lang1
    rename_column :th, :lang2
  end
end