

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
			return new Promise((resolve) => {
				resolve(this.db);
			});
		} else {
			return new Promise((resolve, reject) => {
				var request = indexedDB.open(this.dbName, this.dbVersion);

				// if db doesn't exist
				request.onupgradeneeded = () => {
					this.db = request.result;

					//check if store exist, if not create store
					if (!this.db.objectStoreNames.contains(this.storeName)) {
						this.createStore(this.db, this.storeName);
					}
				}

				// if db exists, success and error functions
				request.onsuccess = function() {
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

	checkIfVizAvailable() {
		return new Promise((resolve) => {
			this.connection().then(db => {
					var transaction = db.transaction(this.storeName, "readonly");
					var objectStore = transaction.objectStore(this.storeName);
					var objectStoreRequest = objectStore.get('plotDetails');
					objectStoreRequest.onsuccess = function() {
						resolve(objectStoreRequest.result);
					};
			})
		})
	}

	createStore(db, storeName) {
		//create object store
		db.createObjectStore(storeName, {autoIncrement: true});

		// create index
		//var index = store.createIndex("fileName", "fileName", {unique:true});

	}

	addObjectsToDB(objectsDict) {
		//check if index exists, add if not, else edit
		this.connection().then(db => {
			var transaction = db.transaction(this.storeName, "readwrite");
			var objectStore = transaction.objectStore(this.storeName);
			for (var file in objectsDict) {
				objectStore.put(objectsDict[file], file);
			}

		})
	}

	addObjectToDB(object, objectName) {
		//check if index exists, add if not, else edit
		this.connection().then(db => {
			var transaction = db.transaction(this.storeName, "readwrite");
			var objectStore = transaction.objectStore(this.storeName);
			objectStore.put(object, objectName);
		})
	}

	readObjectFromDB(objectName) {
		return new Promise((resolve) => {
			this.connection().then(db => {
					var transaction = db.transaction(this.storeName, "readwrite");
					var objectStore = transaction.objectStore(this.storeName);
					var objectStoreRequest = objectStore.get(objectName);
					objectStoreRequest.onsuccess = function() {
						resolve(objectStoreRequest.result);
					};
			})
		})
	}

	deleteStore() {
		this.connection().then(db => {
			var transaction = db.transaction(this.storeName, "readwrite");
			var objectStore = transaction.objectStore(this.storeName);
			objectStore.clear();

		})
	}


}

const connectorInstance = new IndexedDBConnector();
//Object.freeze(connectorInstance);

export default connectorInstance;



