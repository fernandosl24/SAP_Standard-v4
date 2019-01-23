console.log("JS conectado");

function CrearPedido(){
	info = {
		"USUARIO": $("#empleado_id").val(),
		"CLIENTE": $("#dropdown_cliente").val(),
		"FECHA": $("#fecha_de_entrega").val(),
		"PRODUCTO": $("#dropdown_producto").val(),
		"CANTIDAD": $("#cantidad").val(),
		"ESTATUS": "Por Aprobar"
	};

	var mensaje = ""; 

	console.log(info);

	$.post( "/CrearPedidoVenta",info,function(result) {
	resultado = result.resultado;
	console.log(result.resultado);
	console.log(result.id_reserva);
	if (resultado == "success"){
	$("#modalConfirmacion").modal('show');
	  // mensaje = "Tu reserva se realizó de manera exitosa. <p> El id de tu reserva es: " + result.id_reserva + "</p>"
	  // $("#direccion_gmaps").attr('href',String(marcador.direccion_gmaps));
	  // $("#direccion_gmaps_boton").show();
	  console.log(resultado);
	} else {
	  // mensaje = "Hubo un error en tu reservación. Inténtalo de nuevo más tarde."
	  // $("#direccion_gmaps_boton").hide();
	  console.log(resultado);
	}
	console.log("Se realizó el post satisfactoriamente.");
	// $("#exampleModal").modal('hide');
	// $("#MensajeModalConfirmacion").html(mensaje);
	// $("#modalConfirmacion").modal('show');
	// infowindow.close();
	});
};

function mispedidos(){
	window.open('/mispedidos');
};