docker exec -it pg_container bash -c "rm -rf DB"

#Copy DB folder into container
docker cp DB_CARRIS pg_container:/

#Execute create SQL and populate
docker exec -it pg_container bash -c "cd DB_CARRIS && chmod +x populateDB.sh && ./populateDB.sh"
