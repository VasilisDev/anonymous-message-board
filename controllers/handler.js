
'use strict';

const ObjectId = require('mongodb').ObjectId;

// Threads OPs

function createThread(db, board, text, deletePwd) {

return  db.collection(board).insertOne(thread)
}

module.exports.setThread = setThread;
