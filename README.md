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
  It represents the level of welfare and patriotism of a specific national territory. The higher the cohesion, the more united is the country and the higher is the chance for that country to keep conquering territories.

- Final conquer quote:
  It represents the price for a single bet on the final winner which allows to redeem the final jackpot. The price varies depending on jackpot size and the probability of the chosen country to win the full run. The higher the probability or the jackpot, the higher the cost of a single bet. Prices steadily increase over turns, the sooner the bets get placed the higher will be the reward in case of victory.

- Next conquer %:
  It represents the exact likelihood for a country to conquer a territory in the upcoming turn. It is calculated considering the size of the conquered borders for a given country times its cohesion index. The more cohesive the country is the higher the chance it keeps on conquering territories. Similarly, the cohesion index affects also the probability for a given territory to rebel on the dominating country.



### Cohesion

--- in grande

Big news!
You can now support your country and help it winning the Tron World War!!

---

All you have to do is to engage with Tron War Bot's Facebook page [embed link] and mention your favorite country in either a post, a comment, a review or a share of a page's post and encourage your country's army into doing its best with a great motivational message.

As an example you can use this message, copy it and post it on Tron War Bot's page feed using the share button below!

"Italy is best country ever"
"I love Italy and all of its super cute penguins"
"I think nothing is stronger than Italy with all of its wonderful yet explosive nuclear bombs"
"I am in love with Italy's army and all of the strong and charming soldiers"

TronWarBot will automatically read your post/comment and update the cohesion of the mentioned country based on the energy of your message, which will drastically increase the winning odds for that country in the Tron World War!

Be creative now!!

--- in piccolo

The message, if valid, will update the cohesion of the mentioned country with the following criteria:

- A COMMENT is worth +-0.1% cohesion point for the mentioned country
- A VISITOR POST on page's feed is worth +-0.2% cohesion point for the mentioned country (or anything in between based on the message energy)
- A REVIEW is worth +-0.5% cohesion point for the mentioned country (or anything in between based on the message energy)
- A SHARE of a page's post is worth +-1.0% cohesion point for the mentioned country (or anything in between based on the message energy)

Beware that a negative message, will also make a country lose its cohesion.

P.S: Each facebook user is entitled to only one motivational comment plus one post and one share per day (UTC time), and a single page's review.  
