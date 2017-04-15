var express = require('express');
//var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var Q = require('q');


var router = express.Router();

app.use('/scrape',router);
router.get('/scrape', function(req, res){	
// var query_url="http://www.imdb.com/find?q="+"matrix+1999"+"&s=all";
var query_url="http://www.imdb.com/find?q="+req.query.title+"+"+req.query.year+"&s=all";
	var getURL= function(the_url) {
		var some_imdb_url;
		var deferred = Q.defer();
		request( the_url, function(error, response, html){
			if(!error){
				var $ = cheerio.load(html);
				var href=$(".findList").find("tr").first().find("a").attr('href');
				some_imdb_url= "http://www.imdb.com"+href;
				console.log(some_imdb_url);
				
				deferred.resolve(some_imdb_url);
			}
		});

		return deferred.promise;
	};
	var get_movie_json= function( the_url) {

		request(the_url, function(error, response, html){
			if(!error){
				var $ = cheerio.load(html);

				var json = { Title : "", Year : "", imdbRating:"", Director:"", Actors:"", Plot:"", Poster:"", Metascore:"", imdbVotes:"", imdbID:""};
				var htmlsent ='<!DOCTYPE HTML><html><head><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script><link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"></head><body class="jumbotron"><center ><h2 class="btn btn-success btn-lg">';
				json.Title = $("h1[itemprop='name']").text();
				htmlsent+=json.Title+'</h2></br>';
				json.Year = $('div[class=title_wrapper]').find("span[id='titleYear']").find("a").text();
				htmlsent+='<h3 class="btn btn-danger">Year: '+json.Year+'</h3></br></br></br></center>';
				json.imdbRating=$('.ratingValue').find("span[itemprop='ratingValue']").text();

				$("span[itemprop='director']").find("span[itemprop='name']").each( function (index, element) {
					var director=$(element).eq(0).text();
					json.Director+=director+", ";
				});
				json.Director=json.Director.replace(/,\W+$/,"");
				$("span[itemprop='actors']").find("span[itemprop='name']").each( function() {
					var star=$(this).eq(0).text();
					json.Actors+=star+", ";
				});
				json.Actors=json.Actors.replace(/,\W+$/,"");
				
				json.Plot=$("div[class='summary_text']").text().trim();
				json.Poster=$(".poster").find("img").attr("src");
				htmlsent+='<img'+' src='+ json.Poster+' style="float:left;margin-right:20px;margin-left:20px;border-radius:10px">';
				var metascore =$("a[href='criticreviews?ref_=tt_ov_rt']").text().trim();
				var metascorePattern = /^\d+/;
				var metascore_res = metascorePattern.exec(metascore);
				if (metascore_res) {
					json.Metascore=metascore_res[0];	
				}
				json.imdbVotes=$("span[itemprop='ratingCount']").text();
				var imdbPattern= /tt\d+/;
				var imdbRes=imdbPattern.exec(the_url);
				json.imdbID=imdbRes[0];	
				htmlsent+='<h3 class="btn btn-primary">Plot: '+json.Plot+'</h3></br><h3 class="btn btn-primary" >Directors: '+json.Director+'</br>Actors: '+json.Actors+'</h3></br><h2 class="btn btn-primary">IMDb Rating:'+json.imdbRating+'</br> IMDb Votes: '+json.imdbVotes+'</h2></br><h2 class="btn btn-primary">Meta Score: '+json.Metascore+'</h2></br> </br> <center><a href="http://shubhamgpt198.imad.hasura-app.io">Try Another</a></center>'
			};
        	res.send(htmlsent);
		});

	};
	getURL(query_url).then( function (some_url){

		get_movie_json(some_url);

	});

});

app.use('/',router);
app.get('/',function(req,res){
res.sendFile(__dirname +'/ui/index.html');
});

app.listen('8080');
console.log('runningonport');
exports = module.exports = app;
