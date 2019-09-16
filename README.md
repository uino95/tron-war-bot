# How to start developing and deploy afterwards
### Client
It's a vuejs project. Graphic components with vuetify.
The components folder is where you should place new components.
```
cd client
npm i
npm run serve
```
This will start the development server. To build use:
```
npm run build
```

To deploy (always from the client folder):

install firebase cli:
```
npm install -g firebase-tools
```
run
```
firebase login
```
and follow the isntructions printed into the terminal. Then run
```
firebase deploy --project tron-war-bot
```
You need the tronwarbot@gmail.com account to deploy

### Backend

```
cd backend
npm i
node server.js
```

### Smart Contracts


### Game Logic

- Territories:
  It represents the number of national territories controlled by the conquerer country. There are 241 countries in the map, once a country controls them all it is declared the winner of the current run.

- Cohesion:
  It represents the level of welfare and patriotism of a specific national territory. The higher the cohesion, the more united is the country and the higher is the chance for that country to keep conquering territories. The cohesion gets updated

- Final conquer quote:
  It represents the price for a single bet on the final winner which allows to redeem the final jackpot. The price varies depending on jackpot size and the probability of the chosen country to win the full run. The higher the probability or the jackpot, the higher the cost of a single bet. Prices steadily increase over turns, the sooner the bets get placed the higher will be the reward in case of victory.

- Next conquer %:
  It represents the exact likelihood for a country to conquer a territory in the upcoming turn. It is calculated considering the size of the conquered borders for a given country times its cohesion index. The more cohesive the country is the higher the chance it keeps on conquering territories. Similarly, the cohesion index affects also the probability for a given territory to rebel on the dominating country.
