# Drop database

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
