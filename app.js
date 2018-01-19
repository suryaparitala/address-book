express = require('express');
app = express();



var bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));


var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});


//mapping for elastic search
var indexname = "randomindex"

elasticClient.indices.create({
        index: indexname
    });

elasticClient.indices.putMapping({
        index: indexname,
        type: "contact",
        body: {
            properties: {
                name: { type: "string" },
                address: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                
            }
        }
    });

// home page
app.get('/', (req, res) => res.send('Hello this is the home page'));


// get the contact details
app.get('/contact', function(req, res){

	var elasticObj = {
    	index: indexname,
    	type: 'contact',
    	size: 10,
    	body: {
        	query: {
            	match_all: {
            		 
            	}
	        }
	    }
	};

	if(req.params.query){
				
		       elasticObj.body.query =  request.params.search_query;
	}
	if (req.query.size) {
		elasticObj.size = Number(req.query.size);
	}
	if(req.query.page){
		elasticObj.from = (Number(req.query.page - 1)) * Number(elasticObj.size);
	}

	if(req.params.query){
				
		       elasticObj.body.query =  request.params.search_query;
	}
	//console.log("--------------------------------------------------------------------------------------------------------------------------------------------");
	//console.log(elasticObj);


  		elasticClient.search(elasticObj).then(function(resp) {
	   // console.log(resp);
	    var hits = resp.hits.hits;
		console.log(resp);
		console.log(hits);
		res.send(hits);
	}, function(err) {
	    console.trace(err.message);
	});



    
});


// get the contact details
app.get('/contact/:name', function(req, res){
  
  	
    console.log(req.params.name);


  


		elasticClient.search({
			  index: indexname,
			  type: 'contact',
			  body: {
			    query: {
			      match: {
			        "name": req.params.name
			      }
			    }
			  }
			}).then(function (resp) {
			    var hits = resp.hits.hits;
			    console.log(resp);
			    console.log(hits);
			    res.send(hits);
			}, function (err) {
				console.log("error occured while searching");
				console.log(err);
			    console.trace(err.message);
});



    
    
	});


// update the contact details
app.put("/contact/:name", function(req, res){ // -------------------------------  put the partial document under the 'doc' key


console.log("----------------------------#########################****************************************************+++++++++++++++++++++++++++++++++++")    
console.log(req.body);


var obj = {"doc":req.body};


//console.log(obj.toString);

// body: {
  //   // put the partial document under the `doc` key
  //   doc: {
  //     title: 'Updated'
  //   }
  // }
elasticClient.update({
  index: indexname,
  type: 'contact',
  id: req.params.name,
   body : obj,
}, function (error, response) {

	if(error){
		console.log("error occured while updating");	
		console.log(error);
		res.send(error);
	}else{
		console.log("successfully updated");
		console.log(response);
		res.send(response);
	}
  // ...
});



});

app.post("/contact", function(req, res){
    
    

  	// send data to elastic search

  	console.log(req.body);
  	//console.log(req.body.phone.toString());

  	

  	elasticClient.search({
			  index: indexname,
			  type: 'contact',
			  body: {
			    query: {
			      match: {
			        "name": req.body.name
			      }
			    }
			  }
			}).then(function (resp) {
			    var hits = resp.hits.hits;
			    console.log(resp);
			    console.log(hits);
			    if(hits.length == 0){
			    	//the no one with same name

			    	if(req.body.phone.toString().length < 20){
  							console.log("too big phone number retry");
  		//alert("phone number too long");
  							res.send("too big phone number retry");
  					

			    	elasticClient.index({
				        index: indexname,
				        type: 'contact',
				        id:req.body.name,
				        body:req.body,

				    }, function (error, response) {
				  		
				    		if(error){
				    			console.log("error");
				    		}else{

				    			console.log("successfully added the the contact ");
				    			console.log(response);
				    			res.send(response);

				    		}

						});


				    }else{
				    	res.send("phone number too long , it must be less than 20 digits");
				    }


			    }else{
			    	res.send("Same name already exists please try with a new name or update the old name");
				}
			}, function (err) {
				console.log("error occured while searching");
				console.log(err);
			    console.trace(err.message);
});












  	

  	
  
    
});


app.delete('/contact/:name', function (req, res) {
  

 // delete the name from elastic search

 	elasticClient.search({
			  index: indexname,
			  type: 'contact',
			  body: {
			    query: {
			      match: {
			        "name": req.params.name
			      }
			    }
			  }
			}).then(function (resp) {
			    var hits = resp.hits.hits;
			    //console.log(resp);
			    //console.log(hits);

			    if(hits.length == 0){
			    	res.send("No person present with that name");
			    }
			    var del_id = hits[0]._id

			    console.log(del_id);

			    		elasticClient.delete({
							  index: indexname,
							  type: 'contact',
							  id: del_id
							}, function (error, response) {
							  // ...

							  if(error){
							  	console.log("error while deleting");
							  	console.log("error");
							  }else{

							  	console.log(response);
							  	res.send(response);

							  }
							});

			    
			}, function (err) {
				console.log("error occured while searching");
				console.log(err);
			    console.trace(err.message);
	});


});


app.listen(3000, () => console.log('The app listening on port 3000!'))