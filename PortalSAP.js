var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var o = require('odata');
var request = require('request');
var WebSocketClient = require('websocket').client;
var QRCode = require('qrcode')

app.use(bodyParser.json());

var port = process.env.PORT || '8080';
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true})); 

var client = new WebSocketClient();
var wsconnection;

o().config({
  // format: 'json',
  username: 'FSANCHEZ', 	// the basic auth username
  password: 'Welcome1.',
  isWithCredentials: true
});

app.get('/', function(req, res) {
	res.render('bienvenido');
});

app.get('/bienvenido',function(req,res){
	res.render('bienvenido');
});

app.get('/innovasport',function(req,res){
	res.render('innovahome');
});


// app.get('/home_tremec',function(req,res){
// 	res.render('home_tremec');
// });

app.post('/CrearPedidoVenta', function(req,res){
	var cookieJar = request.jar();
	pedido = req.body.pedido
	url = 'https://xs01b14ae55f1.us1.hana.ondemand.com/KUO/odata.xsodata/ventas?$select=ID_PEDIDO&$orderby=ID_PEDIDO%20desc&$top=1';

	o(url).get(function(data){
		if(typeof data.d.results[0] == 'undefined'){
			numero_nuevo = 1;
		} else {
		// console.log(data.d.results[0].ID_PEDIDO);
		numero_nuevo = Number(data.d.results[0].ID_PEDIDO) + 1;
		// console.log(numero_nuevo);
		}
		url2 = "https://xs01b14ae55f1.us1.hana.ondemand.com/KUO/odata.xsodata/ventas";
		fecha = new Date(req.body.FECHA)
		// console.log(fecha.getTime());
		ts = fecha.getTime();
		var idpedidofiori = numero_nuevo;
		var productofiori = req.body.PRODUCTO;
		var preciofiori = Math.round(Math.random()*100);
		var cantidadfiori = req.body.CANTIDAD;

		// console.log(ts);
			info = {
				"ID_PEDIDO": numero_nuevo,
				"USUARIO": req.body.USUARIO,
				"CLIENTE": req.body.CLIENTE,
				"FECHA": '/Date('+String(ts)+')/',
				"FECHA2": req.body.FECHA,
				"PRODUCTO": req.body.PRODUCTO,
				"CANTIDAD": req.body.CANTIDAD,
				"ESTATUS": req.body.ESTATUS
			};
			// console.log(info);
			o(url2).post(info).save(function(data){
				var options = {
				method:'GET',
				  url: 'https://bpmworkflowruntimewfs-i848070trial.hanatrial.ondemand.com/workflow-service/rest/v1/xsrf-token',
				  jar: cookieJar,
				  headers: {
				  	'X-CSRF-Token': 'Fetch',
				    'Authorization': 'Basic aTg0ODA3MDpaYXBoaXImRGVMOS4='
				  }
				};

				request(options,function(error,response,body){
					console.log(response.statusCode);
					console.log(response.headers);
					console.log("----------------------");
					console.log(response.headers['x-csrf-token']);
					var options = {
					method:'POST',
					  url: 'https://bpmworkflowruntimewfs-i848070trial.hanatrial.ondemand.com/workflow-service/rest/v1/workflow-instances',
					  headers: {
					    'X-CSRF-Token': response.headers['x-csrf-token'],
					    // 'X-CSRF-Token':'022AE2C479A206986AB9E9FA97C952A7',
					    'Content-type': 'application/json'
					  },
					  jar: cookieJar,
					  json: {
						  "definitionId": "workflow_fernando2",
						  "context": {
						               "product": productofiori,
						               "prod_id":idpedidofiori,
						               "price": preciofiori,
						               "quantity": cantidadfiori,
						               "email": "fernando.sanchez@sap.com"            
							}
						}
					};

					console.log(options);

					request(options,function(error,response,body){
						if(error){
							console.log(error)
						} else {
							// console.log(options);
							// console.log(response);
							// console.log(body);
							console.log("Información agregada satisfactoriamente");
							QRCode.toDataURL('https://portalsapjs.cfapps.us10.hana.ondemand.com/mispedidos', function (err, url) {
  							// console.log("QURCODE: " + url)
  							var mensaje_sms = "Tu pedido de " + productofiori + " de " + cantidadfiori + " unidades, con valor de " + preciofiori + " ha sido enviado para aprobacion\n\r" + "Da seguimiento aqui: https://portalsapjs.cfapps.us10.hana.ondemand.com/mispedidos\r\n" 
  							// var qr_code = "https://chart.googleapis.com/chart?cht=qr&chl=https%3A%2F%2Fportalsapjs.cfapps.us10.hana.ondemand.com%2Fmispedidos&chs=180x180&choe=UTF-8&chld=L|2"
							var sms = '{clientId:"clientID",topic:"in/sgw/dev",metadata:false,serviceId:10,inputParams:{dest:"+5215541857013",contents:"'+mensaje_sms+'",type:"httpclient"}}'
							// var qr_code_sms = '{clientId:"clientID",topic:"in/sgw/dev",metadata:false,serviceId:10,inputParams:{dest:"+5215541857013",contents:"'+qr_code+'",type:"httpclient"}}'
    						wsconnection.send(sms);
    						// wsconnection.send(qr_code_sms);
							res.send({"resultado":"success"}); 
							})
							
						} 
					});

				});

			}, function(status, error){
				console.error(status + " " + error);
				res.send({"resultado":"error"});  
			});
	});
});

app.get('/mispedidos',function(req,res){
	res.render('mispedidos');
});

app.post('/EliminarPedido', function(req, res){
	id_pedido = req.body.id_pedido;

	// opciones para configuración del DELETE
	var options = {
	    url: "https://xs01b14ae55f1.us1.hana.ondemand.com/KUO/odata.xsodata/ventas(" + id_pedido +")",
	    method: 'DELETE',
	    auth: {
	    'user': 'FSANCHEZ',
	    'pass': 'Welcome1.'
		}
	};

	console.log(options.url);

	request(options, function (error, response, body) {
	    if (!error && response.statusCode == 204) {
	        console.log("El status de respuesta de eliminar es: " + response.statusCode);
	        res.send({"resultado":"success"}); 
	    } else {
	    	console.log("El error de respuesta de eliminar es: " + error);
	    	res.send({"resultado":"fail"}); 
	    };
	});
});

app.post('/consultarPedidos',function(req,res){
	id_usuario = req.body.id_usuario
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/KUO/odata.xsodata/ventas?$filter=USUARIO eq '" + id_usuario + "'";
	o(url).get(function(data){
		if(typeof data.d.results[0] !== 'undefined'){
			console.log(data.d.results);
			respuesta = ({"pedidos":data.d.results,"existe":true});
			res.send({"resultado": respuesta});
		} else {
			respuesta = ({"existe":false});
			res.send({"resultado": respuesta});
		};
	});
});

app.post('/consultarPedidosPorID',function(req,res){
	console.log(req.body);
	id_pedido = req.body.id_pedido
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/KUO/odata.xsodata/ventas?$filter=ID_PEDIDO eq " + id_pedido;
	o(url).get(function(data){
		if(typeof data.d.results[0] !== 'undefined'){
			console.log(data.d.results);
			// respuesta = ({"pedido":data.d.results,"existe":true});
			res.send({
		    replies: [{
		      type: 'text',
		      content: 'La información de tu pedido es la siguiente: ',
		    }],
		    conversation: {
		      memory: { pedido: data.d.results }
		    }
		  });
		} else {
			respuesta = ({"existe":false});
			res.send({"resultado": respuesta});
		};
	});
});

app.post('/EliminarPedidoRecast', function(req, res){
	id_pedido = req.body.id_pedido;

	// opciones para configuración del DELETE
	var options = {
	    url: "https://xs01b14ae55f1.us1.hana.ondemand.com/KUO/odata.xsodata/ventas(" + id_pedido +")",
	    method: 'DELETE',
	    auth: {
	    'user': 'FSANCHEZ',
	    'pass': 'Welcome1.'
		}
	};

	// console.log(options.url);

	request(options, function (error, response, body) {
	    if (!error && response.statusCode == 204) {
	        // console.log("El status de respuesta de eliminar es: " + response.statusCode);
	        res.send({
		    replies: [{
		      type: 'text',
		      content: 'Tu pedido ha sido eliminado satisfactoriamente. ¿Te puedo ayudar en algo más?'
		    }]
		  }); 
	    } else {
	    	// console.log("El error de respuesta de eliminar es: " + error);
	    	res.send({"resultado":"fail"}); 
	    };
	});
});

client.on('connectFailed', function(error) {
    console.log('Connect Error to wss: ' + error.toString());
});

client.on('open',function(error){
	client.send("{subscribe: 'out/sgw/SMSFernando'}");
})

 
client.on('connect', function(connection) {
	wsconnection = connection;
    console.log('WebSocket Client Connected');

    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });

    connection.on('message',function(message){
    	console.log(message);
    });
    function sendMessage(){
    	var sms = '{clientId:"clientID",topic:"in/sgw/dev",metadata:false,serviceId:10,inputParams:{dest:"+5215541857013",contents:"Hola Fernando",type:"httpclient"}}'
    	connection.send(sms);
    };	
});

 
client.connect('wss://mgwws.hana.ondemand.com/endpoints/v1/ws');

app.listen(port, function(req,res){
   console.log("Servidor Corriendo en puerto: " + port); 
});

