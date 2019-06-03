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
