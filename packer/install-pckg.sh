#!/usr/bin/env bash

set -eo pipefail

# system libraries
sudo apt-get update
sudo apt-get -y install wget gnupg2

# export DATABASE_USER=$DATABASE_USER
# export DATABASE_PASSWORD=$DATABASE_PASSWORD
# export DATABASE_NAME=$DATABASE_NAME
# export DATABASE_PORT=$DATABASE_PORT
# export HOST=$HOST
# export PORT=$PORT

# Install NVM

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

# Source NVM (you don't need to provide 'nvm' as an argument)

source ~/.nvm/nvm.sh

# Install Node.js version 20.7.0 (assuming it's a valid version)

nvm install 20.7.0

nvm use 20.7.0

# # install postgres
# sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
# wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
# sudo apt-get -y install postgresql-14

# # Create postgres user
# sudo su - postgres <<EOF
# psql -c "CREATE USER ${DATABASE_USER} WITH PASSWORD '${DATABASE_PASSWORD}';"
# psql -c "CREATE database ${DATABASE_NAME}"
# psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DATABASE_NAME} TO ${DATABASE_USER};"
# EOF
# sudo sed -i 's/\(scram-sha-256\|ident\|peer\)/trust/g' /etc/postgresql/14/main/pg_hba.conf
# sudo systemctl restart postgresql
sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

sudo groupadd csye6225
sudo useradd -s /bin/false -g csye6225 -d /opt/webapp -m fall23

cd /home/admin/webapp
npm i
#Giving exec writes to owner, user and group
sudo chmod -R 755 node_modules/
sudo rm -rf node_modules/
npm i

sudo cp -r /home/admin/webapp/* /opt/webapp/
sudo chown -R fall23:csye6225 /opt/webapp

cd /opt/webapp
sudo cp opt/users.csv /opt/
sudo chmod 755 /opt/users.csv

echo "installed npm dependencies"

sudo cp /opt/webapp/packer/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/bin/cloudwatch-config.json

# webapp system service
sudo cp packer/webapp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable webapp.service
