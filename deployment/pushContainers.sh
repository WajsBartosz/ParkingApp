docker build -t parkingappcontainerregistry.azurecr.io/parking-app-backend:latest ../backend
docker push parkingappcontainerregistry.azurecr.io/parking-app-backend:latest
docker build -t parkingappcontainerregistry.azurecr.io/parking-app-frontend:latest ../frontend
docker push parkingappcontainerregistry.azurecr.io/parking-app-frontend:latest