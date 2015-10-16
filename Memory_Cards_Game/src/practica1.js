/**
		Enrique  Delgado Solana
**/

/**
	Card
	
	Card.name = nombre que representa la carta
	Card.state = estado de la carta, boca arriba o boca abajo (inicialmente false)
	Card.found = marca si la carta ha sido encontrada (inicialmente false)
*/
Card = function(sprite) {
	this.name = sprite;
	this.state = false;
	this.found = false;
};

Card.prototype = {
	/**
		Cambia el estado de una carta
			state = true (boca arriba)
			state = false (boca abajo)
	*/
	flip: function(){
		if (this.state)
			this.state = false;
		else
			this.state = true;
	},

	/**
		Marca una carta como encontrada
	*/
	found: function(){
		this.found = true;
	},

	/**
		Compara dos cartas mirando su nombre
	*/
	compareTo: function(otherCard){
		return this.name == otherCard.name;
	},

	/**
		Llama al metodo para dibujar una carta, pidiendole que pinte la carta o la carta boca abajo en funcion del estad
	*/
	draw: function(gs, pos){
		if(this.state)
			gs.draw(this.name, pos);
		else
			gs.draw("back", pos);
	},

	/**
		Devuelve true si la carta ha sido encontrada y false en caso contrario
	*/
	isFound: function(){
		return this.found;
	},

	/**
		Devuelve true si a carta esta boca arriba y false en caso contrario
	*/
	isFaced: function(){
		return this.state;
	}
}


/**
	MemoryGame

	MemoryGame.message = mensaje que es mostrado por el juego (inicialmente Juego de cartas)
	MemoryGame.graficServer = referencia al servidor grafico introducido en la constructora
	MemoryGame.cards = array de Cards que contiene todas las cartas del juego
	MemoryGame.selectedCard = carta que está boca arriba cuando hemos pinchado 1 (inicialmente null, no hay carta boca arriba)
	MemoryGame.checking = variable que actua como semaforo para que no se pinche una tercera carta cuando la evaluación de otras dos es falsa
	MemoryGame.foundCards = variable para almacenar el numero de cartas encontradas y saber cuando es el fin facilmente (inicialmente 0)

*/
MemoryGame = function(gs) {
	this.message = "Juego de Cartas";
	this.graficServer = gs;
	this.cards = new Array();
	this.selectedCard = null;
	this.checking = false;
	this.foundCards = 0;

	var i = 0;

	for (var newCard in gs.maps){
		if(newCard != "back"){			//Si la carta no es back, la insertamos dos veces
			this.cards[i] = new Card(newCard);
			this.cards[i+1] = new Card(newCard);

			i = i + 2;
		}
	}
};

MemoryGame.prototype = {
	/**
		Desordena el array de cartas y llama a la función encargada de iniciar el bucle
	*/
	initGame: function() {
		this.cards.sort(function () {return Math.random() - 0.7});
		this.loop();
	},

	/**
		Función encargada de pintar el mensaje y llamar al metodo draw de todas las cartas
	*/
	draw: function() {
		this.graficServer.drawMessage(this.message);

		for (var card in this.cards)
			this.cards[card].draw(this.graficServer, card);
	},

	/**
		Bucle del juego, utiliza la función setInterval para llamar al metodo draw cada 16ms (60fps)
	*/
	loop: function() {
		var self = this;
		time = setInterval(function() {
			self.draw();
		}, 16);
	},

	/**
		Comprueba que el cardId recibido es valido (tiene que estar entre 0 y 15) y que no se esta comparando dos cartas diferentes
		Si los valores son validos comprueba si hay una carta boca arriba, si no la hay marca la pinchada como boca arriba
		Si hay carta boca arriba comprueba si son iguales
			Si lo son llama a sameCard()
			Si no lo son llama a diferentCard()
	*/
	onClick: function(cardId) {
		if (cardId >= 0 && cardId <= 15 && cardId != null && !this.cards[cardId].isFaced() && !this.checking) {
			this.cards[cardId].flip();				//Damos la vuelta a la carta pinchada
			if(this.selectedCard != null) { 		//Hay una carta volteada
				if(this.cards[cardId].compareTo(this.cards[this.selectedCard]))
					this.sameCard();
				else
					this.diferentCard(cardId)
			}
			else{									//No hay carta seleccionada
				this.selectedCard = cardId;			//Marcamos la carta dada la vuelta como seleccionada
			}
		}
	},

	/**
		Aumenta el contador de cartas encontradas y comprueba si emos acabado el juego
			Si hemos encontrado las 16 cartas imprime el mensaje hace el clearInterval de time para terminar de pintar y pinta una ultima vez para mostrar todo correctamente
			En caso contrario muestra el mensaje "Match found" y elimina la carta seleccionada
	*/
	sameCard: function () {
		this.foundCards = this.foundCards+2;

		if(this.foundCards == 16){
			this.message = "You Win!!";
			clearInterval(time);
			this.draw();
		}
		else{
			this.message = "Match found!!"
			this.selectedCard = null;	
		}
	},

	/**
		Las cartas son diferentes, para evitar que se pinche una tercera carta se pone a true el campo checking
		Se muestra el mensaje "try again" y tras un segundo se le da la vuelta a las cartas y se elimina la carta seleccionada
	*/
	diferentCard: function (cardId) {
		this.checking = true;
		this.message = "Try again";
		var self = this;

		setTimeout(function () {
		self.cards[cardId].flip()				
		self.cards[self.selectedCard].flip();
		self.selectedCard = null;
		self.checking = false;
		}, 1000);
	}
};
