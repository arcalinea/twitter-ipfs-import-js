const IPFS = require('ipfs')
const ipfs = new IPFS()

const twitterConfig = require('./config')
const processTweets = require('./processTweets')

ipfs.on('start', () => {

  var tweets = processTweets(twitterConfig.data_dir);
  const a = {
      tweet: {
          type: tweets[0]["type"],
          created_at: tweets[0]["created_at"],
          text: tweets[0]["text"]
      }
  }
  
  var addedTweets = []
  
  function putTweet(data, callback) {
      ipfs.dag.put(data, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
          if (err){
              console.log("ERROR", err)
              callback(err, null)
          }
          var tweet = cid.toBaseEncodedString()
          // console.log("Tweet put", tweet)
          callback(null, tweet)
      })
  }
  
  async function asyncPutTweet(){
      for (var i = 0; i < tweets.length; i++) {
          t = {
              type: tweets[i]["type"],
              created_at: tweets[i]["created_at"],
              text: tweets[i]["text"]
          }
          var cid = await ipfs.dag.put(t, { format: 'dag-cbor', hashAlg: 'sha3-512' })
          console.log("Putted cid", cid.toBaseEncodedString())
          // putTweet(t, (err, res) => {
          //     console.log("Tweet added to ipfs:", res)
          //     addedTweets.push(res)
          // })
      }
  }
  
  asyncPutTweet()
  
 
  setTimeout(function () {
    console.log("Tweets array:", addedTweets)
    
    for (var i = 0; i < addedTweets.length; i++) {
        var cid = addedTweets[i]
        console.log("Finding cid", cid)
        ipfs.dag.get(cid, (err, result) => {
            console.log(JSON.stringify(result.value))
            return result
        })
    }
  }, 100)
  

  function errOrLog (err, result) {
    if (err) {
      console.error('error: ' + err)
    } else {
      console.log(result.value)
    }
  }


})
