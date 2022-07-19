# test-vuejs
test-vuejs

# Starting dev env

* Move `local_env_example.sh` to `local_env.sh`
* Make sure your have a mysql instance running locally and create a DB for this project
* Fill in the variables with your local information. more importantly add the database variables
* after adding the database information import all the migrations with knex for this you must execute `./migrate_local.sh`
* install `nodemon` on the machine to run the local environment
* Run `./run_local` to start the local dev server 

# Deploying

* You need to have `ebcli` installed on your machine. Instruction about this [here](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install-advanced.html).
* Running `eb list` should show you a list of environments. It should returng a list containing just one env `* onlychat-stage`.
* To deploy you need ro run `eb deploy onlychat-stage` or simply `eb deploy`.
* For the deployment to pick up your changes you **must** make a commit. A push **is not necessary**.


# Using dynamodb local

## Starting server
* Move to the location where dynamodb is installed 
* Run `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`

## Seeding data
* `cd dynamodb-seed`
* create the table 
* run `aws dynamodb create-table --cli-input-json file://create-table-chat.json --endpoint-url http://localhost:8000` 
* seed data
* run `aws dynamodb batch-write-item --request-items file://insert-data-into-chat.json --endpoint-url http://localhost:8000`
* you should have seed data now

## Check if everything worked
* check if table exists
* run `aws dynamodb list-tables --endpoint-url http://localhost:8000`
* check if table has data
* run `aws dynamodb scan --table-name Chat --endpoint-url http://localhost:8000`

## Removing local table
If something went wrong and you want to start over you can delete the table and all of the data by running this: 
`aws dynamodb delete-table --table-name=Chat --endpoint-url http://localhost:8000`

You'll need to create the table again and seed data.


