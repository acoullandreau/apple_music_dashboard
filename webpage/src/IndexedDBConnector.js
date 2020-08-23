

class IndexedDBConnector {

	constructor() {
		this.isConnected = false;
		this.dbName = 'UserDataStorage';
		this.dbVersion = 1;
		this.storeName = 'UserFiles';
    	this.db = null;
  	}


	connection() {

		if (this.isConnected === true) {
			return new Promise((resolve, reject) => {
				resolve(this.db);
			});
		} else {
			return new Promise((resolve, reject) => {
				var request = indexedDB.open(this.dbName, this.dbVersion);

				// if db doesn't exist
				request.onupgradeneeded = (event) => {
					this.db = request.result;

					//check if store exist, if not create store
					if (!this.db.objectStoreNames.contains(this.storeName)) {
						this.createStore(this.db, this.storeName);
					}
				}

				// if db exists, success and error functions
				request.onsuccess = function(event) {
					this.db = request.result;
					this.isConnected = true;
					resolve(this.db);
				}

				request.onerror = function(event) {
				  alert('error opening database ' + event.target.errorCode);
				  reject(event.target.errorCode)
				}
			})
		}

	}

	createStore(db, storeName) {
		//create object store
		var store = db.createObjectStore(storeName, {autoIncrement: true});

		// create index
		//var index = store.createIndex("fileName", "fileName", {unique:true});

	}

	addObjectsToDB(objectsDict) {
		//check if index exists, add if not, else edit
		this.connection().then(db => {
			var tx = db.transaction(this.storeName, "readwrite");
			var store = tx.objectStore(this.storeName);
			for (var file in objectsDict) {
				store.put(objectsDict[file], file);
			}

		})
	}

	readObjectFromDB() {
		this.connection().then(db => {

		})
	}

	removeObjectFromDB() {
		//check if index exist, delete if it does
		this.connection().then(db => {

		})
	}

	deleteStore() {
		this.connection().then(db => {
			var transaction = db.transaction(this.storeName, "readwrite");
			var objectStore = transaction.objectStore(this.storeName);
			var objectStoreRequest = objectStore.clear();

		})
	}


}

const connectorInstance = new IndexedDBConnector();
//Object.freeze(connectorInstance);

export default connectorInstance;



