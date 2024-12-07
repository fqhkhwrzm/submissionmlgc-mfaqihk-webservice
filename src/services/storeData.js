const { Firestore } = require('@google-cloud/firestore');

// menerima dua parameter, yakni id dan data (response API)
const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.STORAGE_ACCESS_KEY,
  });
  
async function storeData(id, data) {
    try {
        const predictCollection = db.collection('predictions');
        return predictCollection.doc(id).set(data);
    } catch (e) {
        console.error(e);
    }
};

module.exports = storeData;