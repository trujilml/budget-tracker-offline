let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    
    const db = event.target.result;

    db.createObjectStore('trans_action', {autoIncrement: true});
};

request.onsuccess = function(event) {

    db = event.target.result;

    if(navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['trans_action'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('trans_action');

    budgetObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['trans_action'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('trans_action');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/", {
                method: 'POST', 
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                throw new Error(serverResponse);
            }

            const transaction = db.transaction(['trans_action'], 'readwrite');

            const budgetObjectStore = transaction.objectStore('trans_action');

            budgetObjectStore.clear();

            alert('Transaction has been submitted!');
        })
        .catch((err => {
          console.log(err);
        }));
    }
}
}


window.addEventListener('online', uploadTransaction);