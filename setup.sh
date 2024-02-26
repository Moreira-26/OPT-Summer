docker exec -it pg_container bash -c "rm -rf DB"

#Copy DB folder into container
docker cp DB pg_container:/

#Execute create SQL and populate
docker exec -it pg_container bash -c "cd DB && chmod +x populateDB.sh && ./populateDB.sh"