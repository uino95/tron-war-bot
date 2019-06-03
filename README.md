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
```
firebase login
firebase deploy
```
You need the tronwarbot@gmail.com account to deploy

### Backend

```
cd backend
npm i
node server.js
```

### Smart Contracts
