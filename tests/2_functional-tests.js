/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    var text = Math.floor(Math.random() * 100000);
    var testId;
    var testId2;
    var testId3;

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {
    test('Create 2 threads', function(done) {
      chai.request(server)
      .post('/api/threads/test')
      .send({
        text: text,
        delete_password: 'pass'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
      });

      chai.request(server)
      .post('/api/threads/test')
      .send({
        text: text,
        delete_password: 'pass'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
    });
  });

  suite('GET', function() {

        test('Get 10 recent threads', function(done) {
          chai.request(server)
            .get('/api/threads/test')
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isArray(res.body);
              assert.isAtMost(res.body.length, 10);
              assert.property(res.body[0], '_id');
              assert.property(res.body[0], 'text');
              assert.property(res.body[0], 'created_on');
              assert.property(res.body[0], 'bumped_on');
              assert.property(res.body[0], 'replies');
              assert.isArray(res.body[0].replies);
              testId = res.body[0]._id;
              testId2 = res.body[1]._id;
              done();
            })
        });

    });

    suite('DELETE', function() {

      test('Delete a thread with valid password', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id:testId, delete_password:'pass'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });

      test('Delete a thread with invalid password', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id: testId2, delete_password: 'wrong'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });

    });


      suite('PUT', function() {
        test('Report one thread', function(done) {
          chai.request(server)
            .put('/api/threads/test')
            .send({
              thread_id: testId2,
            })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'success');

              done();
            });
        });
      });

  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    suite('POST', function() {
    test('Create Reply', function(done) {
      chai.request(server)
        .post('/api/replies/test')
        .send({
          delete_password:'reply_password',
          text: 'reply',
          thread_id: testId2,
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
  });


  suite('GET', function() {
    test('Get all replies of a thread', function(done) {
      chai.request(server)
        .get('/api/replies/test')
        .query({
          thread_id: testId2
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
           assert.property(res.body, '_id');
           assert.property(res.body, 'created_on');
           assert.property(res.body, 'bumped_on');
           assert.property(res.body, 'text');
           assert.property(res.body, 'replies');
           assert.notProperty(res.body, 'delete_password');
           assert.notProperty(res.body, 'reported');
           assert.isArray(res.body.replies);
           assert.notProperty(res.body.replies[0], 'delete_password');
           assert.notProperty(res.body.replies[0], 'reported');;

          testId3 = res.body.replies[0]._id;

          done();
        });
    });

  });

  suite('PUT', function() {
    test('Report a reply', function(done) {
      chai.request(server)
        .put('/api/replies/test')
        .send({
          thread_id: testId2,
          reply_id: testId3
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');

          done();
      });
    });
  });
  suite('DELETE', function() {

     test('Delete reply with invalid password', function(done) {
       chai.request(server)
       .delete('/api/threads/test')
       .send({thread_id: testId2 ,reply_id: testId3, delete_password: 'wrong'})
       .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'incorrect password');
         done();
       });
     });

     test('Delete reply with valid password', function(done) {
       chai.request(server)
       .delete('/api/threads/test')
       .send({thread_id: testId2 ,reply_id: testId3, delete_password: 'pass'})
       .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'success');
         done();
       });
     });

   });

  });

});
