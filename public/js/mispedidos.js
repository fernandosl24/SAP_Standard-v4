console.log("JS conectado");
id_usuario = "Fernando Sanchez Lara"

$.post("/consultarPedidos",{id_usuario:id_usuario},function(result){
      pedidos = result.resultado.pedidos;
      console.log(pedidos);
      if(pedidos.length>0){
      for(i=0; i < pedidos.length ;i++){
        $("#tabla_pedidos").append('<tr><th scope="row">' + pedidos[i].ID_PEDIDO + '</th><td>' + pedidos[i].CLIENTE + '</td><td>' + pedidos[i].FECHA2 + '</td><td>' + pedidos[i].PRODUCTO + '</td><td> ' + pedidos[i].CANTIDAD + '</td><td> ' + pedidos[i].ESTATUS + '</td><td><p><a class="btn btn-danger" onclick="EliminarPedido(' + pedidos[i].ID_PEDIDO + '); return false" href="#"" role="button">Eliminar</a></td></tr>');
      }
    }
});

function EliminarPedido(id_pedido){
	 $("#modalConfirmacionPedidoEliminado").modal('show');
	  $("#Close_modal_confirmacion_eliminado").on('click',function(){ 
	    $.post('/EliminarPedido', {"id_pedido":id_pedido}, function(result){
	      var resultado = result.resultado;
	      mensaje = resultado;
	      console.log(resultado);
	      if (resultado == "success"){
	          mensaje = "Tu pedido se eliminó de manera exitosa.";
	          console.log("Se realizó el post satisfactoriamente.");
	           location.reload();
	        } else {
	          mensaje = "Hubo un error. Inténtalo de nuevo más tarde."
	        }
	    });
	  });
};