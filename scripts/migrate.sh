
echo "Running migration script on LOCAL NETWORK..."
tronbox compile

sed -i 's/"address"\s\?:\s\?".*"/"address": ""/g' /vagrant/build/contracts/WarCoin.json
sed -i 's/"address"\s\?:\s\?".*"/"address": ""/g' /vagrant/build/contracts/TronWarBot.json

COUNTER=0
for file in /vagrant/migrations/*; do
    COUNTER=$(( $COUNTER + 1 ))
    echo "Executing migration number $COUNTER:  $(basename "$file")"
    tronbox migrate  -f $COUNTER --to $COUNTER

done
