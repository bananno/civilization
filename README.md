# Civilization

## Run locally

Download and install:
```
git clone git@github.com:bananno/civilization.git
cd civilization
npm install
```

Start database and server in separate tabs:
```
mongod
npm start
```

Open local address:
```
http://localhost:3000
```

## Drop database

MongoDB must be running in one tab:
```
mongod
```

Open interface in another tab and drop database:
```
mongo
show dbs
use civilization
db.runCommand( { dropDatabase: 1 } )
```
