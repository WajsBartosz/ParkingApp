DB_USER="sqladmin"
DB_PASSWORD=""
DB_ADDRESS="parking-app-mysql-suqoskbj.mysql.database.azure.com"
DB_DATABASE="parking-app"

docker build -t parkingappcontainerregistry.azurecr.io/parking-app-backend:latest ../backend
docker push parkingappcontainerregistry.azurecr.io/parking-app-backend:latest
docker build -t parkingappcontainerregistry.azurecr.io/parking-app-frontend:latest ../frontend
docker push parkingappcontainerregistry.azurecr.io/parking-app-frontend:latest

az webapp create -g "parking-app-rg" --name "parking-app-backend" -p "parking-app-web-app-service-plan" --deployment-container-image-name "parkingappcontainerregistry.azurecr.io/parking-app-backend:latest"
az webapp config appsettings set --name "parking-app-backend" --resource-group "parking-app-rg" --settings DB_ADDRESS=$DB_ADDRESS DB_USER=$DB_USER DB_PASSWORD=$DB_PASSWORD DB_DATABASE=$DB_DATABASE
az webapp create -g "parking-app-rg" --name "parking-app-frontend" -p "parking-app-web-app-service-plan" --deployment-container-image-name "parkingappcontainerregistry.azurecr.io/parking-app-frontend:latest"
cd ../functions
func azure functionapp publish parking-app-function-app --python
