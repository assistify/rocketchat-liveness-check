for (( i=1; i<=$1; i++ ))
do
    docker run -d --env SERVER=$2 loadtest
    sleep 2
done