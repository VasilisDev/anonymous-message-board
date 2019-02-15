/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const CONN_STR  = 'mongodb://<username>:<password>@ds123963.mlab.com:23963/<dbname>';
var ObjectId = require('mongodb').ObjectId;




module.exports = function (app) {

  app.route('/api/threads/:board')

  .get((req, res) => {
    var { board } = req.params;
   MongoClient.connect(CONN_STR,(err,db) => {
  if(err)  console.log(err)
  db.collection(board).find({}, {
    reported: 0,
    delete_password: 0,
   'replies.reported': 0,
   'replies.delete_password': 0
 }).sort({"bumped_on": -1}).limit(10).toArray((err, docs) => {
   if(err) console.log(err);
   if(docs===null) res.json([])
  var threads = docs.map((thread) => {
                  var {
                    bumped_on, created_on, _id, replies, text,
                  } = thread;
                  return {
                    bumped_on,
                    created_on,
                    _id,
                    replies: replies.reverse().slice(0, 3),
                    replycount: replies.length,
                    text,
                   };
         });
        res.json(threads);
      })
    })
  })

  .post((req, res) => {

   var { board } = req.params;
    var { delete_password, text } = req.body;
     MongoClient.connect(CONN_STR,(err,db) => {
      if(err) console.log(err);

         var created_on = new Date().toUTCString().split(',')[1];
         var _id = new ObjectId();

         var thread = {
               _id,
               text,
               delete_password: delete_password,
               created_on: created_on,
               bumped_on: created_on,
               reported: false,
               replies: []
            };


         db.collection(board).insertOne(thread,
               (err,res)=>{
                   if(err) console.log(err);
                     })
        res.redirect(`/b/${board}/`);
     });
   })

.put((req,res)=>{
  var { board } = req.params;
  var {thread_id} = req.body;

  MongoClient.connect(CONN_STR,(err,db) => {
     if(err) console.log(err
     )
      db.collection(board).update({_id: ObjectId(req.body.thread_id)
      }, {
        $set: {
          'reported': true
        }
      }, {
        new: true
      },(err,resp)=>{
        if(err) console.log(err)
    })
  })
  res.send('success')
})


.delete((req,res)=>{

  var { board } = req.params;
  var { delete_password, thread_id } = req.body;


MongoClient.connect(CONN_STR,(err,db) => {
  db.collection(board).findOneAndDelete({
    _id: ObjectId(thread_id),
    delete_password:delete_password
  },(err,doc)=>{
    if (doc.value === null) {
               res.send('incorrect password');
             } else {
               res.send('success');
      }
    })
  })
})


  app.route('/api/replies/:board')
  .post((req,res)=>{
    var { board } = req.params;
    var { delete_password, thread_id, text } = req.body;
    var created_on = new Date().toUTCString().split(',')[1];
    var newReply = {
      _id: new ObjectId(),
      text,
      created_on: created_on,
      delete_password: delete_password,
      reported: false
    };

    MongoClient.connect(CONN_STR,(err,db) => {
      db.collection(board).update({
        _id: ObjectId(thread_id)
      }, {
        $push: {
          'replies': newReply
        },
        $set: {
          'bumped_on': new Date().toUTCString().split(',')[1]
        }
      }, {
        new: true
      }, (err, response) => {
       })
    })
res.redirect(`/b/${board}/${thread_id}`);
 })

.get((req,res)=>{

    var { board } = req.params;
    var { thread_id } = req.query;

  MongoClient.connect(CONN_STR,(err,db) => {
    db.collection(board).find({_id: ObjectId(thread_id)},
      {
        reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0
      })
      .toArray((err,doc)=>{
        res.json(doc[0]);
    });
  })
})

.put((req,res)=>{

  var { board } = req.params;
  var { reply_id, thread_id } = req.body;

  MongoClient.connect(CONN_STR,(err,db) => {
    db.collection(board).updateOne({
        _id: ObjectId(thread_id),
        'replies._id': ObjectId(reply_id)
      }, {
        $set: { 'replies.$.reported': true }
      },(err,doc)=>{
       })
    })
    res.send('reported');
  })

.delete((req,res)=>{


  var { board } = req.params;
  var { delete_password, reply_id, thread_id } = req.body;

  MongoClient.connect(CONN_STR,(err,db) => {
      db.collection(board).updateOne({
    _id: ObjectId(thread_id),
    replies: {
      $elemMatch: {
        _id: ObjectId(reply_id),
        delete_password: delete_password
      }
    }
  }, {
    $set: { 'replies.$.text': '[deleted]' }
  },(err,doc)=>{

    if (doc.value === null) {
       res.send('incorrect password');
         } else {
       res.send('success');
      }
    })
  })
})


};
