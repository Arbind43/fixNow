const { MongoClient } = require('mongodb');

async function migrate() {
  const localUri = 'mongodb://localhost:27017/fixnow';
  const remoteUri = 'mongodb+srv://mundaarbind73_db:jaggu%40%23123@cluster0.mhxgf5w.mongodb.net/fixnow?appName=Cluster0';

  console.log('Connecting to local DB...');
  const localClient = await MongoClient.connect(localUri);
  const localDb = localClient.db();

  console.log('Connecting to remote Atlas DB...');
  const remoteClient = await MongoClient.connect(remoteUri);
  const remoteDb = remoteClient.db();

  const collections = await localDb.listCollections().toArray();
  console.log(`Found ${collections.length} collections in local database.`);

  for (let c of collections) {
    const colName = c.name;
    if (colName === 'system.views' || colName === 'system.profile') continue;
    
    console.log(`Migrating collection: ${colName}...`);
    const docs = await localDb.collection(colName).find({}).toArray();
    
    if (docs.length > 0) {
      // Clear remote collection first
      await remoteDb.collection(colName).deleteMany({});
      // Insert all documents
      await remoteDb.collection(colName).insertMany(docs);
      console.log(`  -> Inserted ${docs.length} documents into ${colName}.`);
    } else {
      console.log(`  -> Collection ${colName} is empty. Skipped.`);
    }
  }

  console.log('Migration successfully completed!');
  await localClient.close();
  await remoteClient.close();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
