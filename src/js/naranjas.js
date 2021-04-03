/**
  * Naranjas (2002) by Julia Masvernat
  * ES6 restoration for a fragment of the original interactive animation developed in Macromedia Flash
  * Original work: http://juliamasvernat.com.ar/img/naranjas.swf (needs Adobe Flash Player)

  * @developer Marcelo Terreni (http://www.terreni.com.ar/)
  * @CSS + E6 + HTML5 Audio
  * @date January 2020
**/

window.addEventListener('load', introToggle);

//====================================//
//		MANAGE INTRO & CONFIG VALUES		 //
//====================================//
function introToggle(){

	//configuration values
	const squareMinWidth = 48;
	const totalSqsLimit = 1000;
	const audioValues = {
		file: 'src/audio/efecto.mp3',
		limit : (window.matchMedia('(min-width: 1200px)').matches) ? 5 : 3 
		//max num of audio files playing simultaneously, less in mobile/tablets to prevent saturation
	}

	document.removeEventListener('load', introToggle);

	manageLang();

	return (() => initNaranjas(squareMinWidth, totalSqsLimit, audioValues))();
};


//===================================//
//		INIT NARANJAS CALCULATIONS		 //
//===================================//
function initNaranjas(squareMinWidth = 44, totalSqsLimit = 600, audioValues){

	let tempSquareMinWidth = squareMinWidth;

	const widthVport = window.innerWidth;
	const heightVport = window.innerHeight;

	//calculate remaining pixels to "share" equally among rendered squares sizes
	let restoH = widthVport % tempSquareMinWidth;
	let restoV = heightVport % tempSquareMinWidth;

	//Recursive function that calculates total amount of squares to fit the screen.
	//It might increment squareMinWidth to match a total squares upper limit. This tries to
	//prevent unforeseeable performance issues in higher screen resolutions in the future.
	let squaresValues;

	function iterateValues(tempSquareMinWidth, totalSqsLimit, restoH, restoV){
		
		// Horizontal and vertical values are calculated separately as sometimes squares are
		// actually rectangles (say 45.34x46.1px squares) to match the screen dimensions accurately
		squaresValues = {
			horizontals: amountNsize(restoH, tempSquareMinWidth, widthVport),
			verticals: amountNsize(restoV, tempSquareMinWidth, heightVport)
		};

		let totalSqs = squaresValues.horizontals.amount * squaresValues.verticals.amount;

		if(totalSqs > totalSqsLimit){
			tempSquareMinWidth += 1;
			restoH = widthVport % tempSquareMinWidth;
			restoV = heightVport % tempSquareMinWidth

			iterateValues(tempSquareMinWidth, totalSqsLimit, restoH, restoV);
		}
	
	}

	iterateValues(tempSquareMinWidth, totalSqsLimit, restoH, restoV);

	return buildSqs(squaresValues.horizontals, squaresValues.verticals, widthVport, heightVport, audioValues);	
}


//=================================================================//
//		Calculate size and total number of squares per dimension		 //
//=================================================================//
function amountNsize(resto, sqMinw, vportDimension){
	let amount, sqDim;

	if(resto === 0){
		amount = vportDimension / sqMinw;
		sqDim = sqMinw;
	}else if(resto !== 0){
		const minAmount = Math.floor(vportDimension / sqMinw);
		amount = minAmount;
		const sharedResto = resto / minAmount;
		sqDim = sqMinw + sharedResto;				
	}

	return { amount : amount,	size : sqDim };
}


//======================//
//		Create squares    //
//======================//
function buildSqs(horizontals, verticals, widthVport, heightVport, audioValues){
	const naranjasGrid = document.getElementsByClassName('naranjas')[0];
	const totalSqs = horizontals.amount * verticals.amount;
	const sqWidth = decimals(horizontals.size / ( widthVport / 100), 3); //convert pixels to vw
	const sqHeight = decimals(verticals.size  / ( widthVport / 100), 3); //convert pixels to vw
		
	const fragment = document.createDocumentFragment();

	//Assign rows and columns to CSS grid
	naranjasGrid.style.gridTemplateColumns = `repeat(${horizontals.amount}, ${sqWidth}vw)`;
	naranjasGrid.style.gridTemplateRows = `repeat(${verticals.amount}, ${sqHeight}vw)`;
			
	for(let i = 0; i < totalSqs ; i++){
		let button = document.createElement("button");
		button.setAttribute('id', i);
		fragment.appendChild(button);			
	}


	return (
		naranjasGrid.appendChild(fragment),
		naranjasGrid.classList.add('naranjas-ready'), 
		getSqPositions(totalSqs, verticals.size, horizontals.size, widthVport, heightVport, naranjasGrid, audioValues)
	);

}


//=========================================//
//		Get squares coordinates in the DOM   //
//=========================================//
function getSqPositions(totalSqs, verticalSize, horizontalSize, widthVport, heightVport, naranjasGrid, audioValues){

	const sqsPos = [];

	//Read coordinates in DOM and create an array of values for device touch events & mousemove
	for(let i = 0; i < totalSqs ; i++){	
		const button = document.getElementById(i);
		sqsPos.push(i); 
		sqsPos[i] = {};
		sqsPos[i]["posY"] = button.offsetTop;
		sqsPos[i]["limY"] = button.offsetTop + verticalSize;
		sqsPos[i]["posX"] = button.offsetLeft;
		sqsPos[i]["limX"] = button.offsetLeft + horizontalSize;		
	}

	return enableButtons(sqsPos, widthVport, heightVport, naranjasGrid, audioValues);

}


//=====================================//
//		Enable UNMUTE & ABOUT buttons    //
//=====================================//
function enableButtons(sqsPos, widthVport, heightVport, naranjasGrid, audioValues){

	//create stylesheet to write a cross-device fullscreen value for transform: scale 
	const style = document.createElement('style');
	document.head.appendChild(style);

	//Circle grows from 1px at the top-right position 
	//So diameter is 2 times screensize + a bit more for box-model 
	//const scaleSize = (widthVport >= heightVport) ? widthVport * .26 : heightVport * .26;
	//style.sheet.insertRule(`.about-open::before{ transform: scale(${scaleSize})`)

	const btnUnmute = document.getElementsByClassName('btn-unmute')[0];
	const btnAbout = document.getElementsByClassName('btn-about')[0];
	const body = document.body;

	//Click on buttons on document body will hide buttons and start project interaction
	//before showing the about section in case of "btnAbout" click
	document.addEventListener(
		'click', 
		function(e){

			switch(e.target.classList[0]){
				case 'btn-unmute':					
					returnEvents();
				break; 
				case 'btn-about': 
					e.preventDefault();
					body.classList.add('about-opened');					
				break; 
				case 'about-btn-close':
					body.classList.remove('about-opened');
					returnEvents();
				break;
				case 'naranjas-body':
					returnEvents();
				break; 
			}

			function returnEvents(){

				btnAbout.classList.add('btn_disabled');
				btnUnmute.classList.add('btn_disabled');

				setTimeout(() => {
					attachEvent(sqsPos, audioValues);
				}, 600)
			
			}

		}
	);

}


//===================================//
//		Create TOUCH & MOVE events     //
//====================================//
function attachEvent(sqsPos, audioValues){

	const soundPlayers = createSoundObjects(audioValues);

	const events = ['onmousemove', 'ontouchstart', 'ontouchmove'];
	events.map( event => document[event] = matchSq(sqsPos, soundPlayers));	
};


//======================================================//
//		MATCH screen coordinates with button position     //
//======================================================//
function matchSq(sqsPos, soundPlayers){
	let plyrNum = 0;

	return function(e){ 
		let event;

		//Select touch device event (only 1st finger) or mousemove event
		(e.touches === undefined) ? event = e : event = e.touches[0]; 

		for(let i = 0; i < sqsPos.length; i++){

			if((event.clientY >= sqsPos[i].posY && event.clientY <= sqsPos[i].limY) && (event.clientX >= sqsPos[i].posX && event.clientX <= sqsPos[i].limX)){
				
				let sq = document.getElementById(i);	

				if(!sq.classList.contains('vanish')){
					//Use a small delay to control queuing and prevent multiple audios clogging
					//setTimeout( () => soundPlayers[plyrNum].play(), plyrNum * 5);
					
					soundPlayers[plyrNum].play();
					(plyrNum < soundPlayers.length - 1) ? plyrNum++ : plyrNum = 0;

					sq.classList.add('vanish');
				}

				break;
			}

		};

	};
}


//========================================================//
//		Create sound elements for "multichannel" playing    //
//========================================================//
function createSoundObjects(audioValues){
	const soundPlayers = [];

	for(let i = 0; i < audioValues.limit; i++){
		soundPlayers[i] = new Audio(audioValues.file);
		soundPlayers[i].preload;
		soundPlayers[i].volume = .5; //prevent saturation 
	}

	return soundPlayers;
}


//=====================//
//		TRIM DECIMALS		 //
//=====================//
function decimals(number, decPoints){
	const positions = Math.pow(10, decPoints);
	return Math.round(number * positions) / positions;
}


/*_______________________________________________________________________*/
//                                    																	 //
//                  EN/ES LANGUAGES SPECIFIC FUNCTIONS                   //
/*_______________________________________________________________________*/

//======================================//
//		Do checks for language changes    //
//======================================//
function manageLang(){

	//change default language if "es" in URL
	const langBtns = document.querySelectorAll('.about-langmenu a');

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const lang = urlParams.get('lang');
	changeLang(lang || undefined);

	if(lang){
		for(let e = 0; e < langBtns.length; e++){
			langBtns[e].setAttribute('aria-current', '');
		}
		document.querySelector('.about-langmenu a[lang="' + lang + '"]').setAttribute('aria-current', 'true');
	}

	//add events to language buttons in about page
	for( let i = 0; i < langBtns.length; i++){
		langBtns[i].addEventListener('click', function(e){
			e.preventDefault();
			for(let e = 0; e < langBtns.length; e++){
				langBtns[e].setAttribute('aria-current', '');
			}
			e.currentTarget.setAttribute('aria-current', 'true');
			const lang = langBtns[i].getAttribute('lang');
			changeLang(lang);	
		});
	}

}


//==================================================================//
//		Change page title, html.lang and texts to a given language    //
//==================================================================//
function changeLang(lang = 'en'){

	const translations = {
		'en' : {
			htmlTitle : 'A Javascript restoration of «Naranjas» (2002) by Julia Masvernat :: Marcelo Terreni',
			unmute: 'Unmute',
			about: 'About',
			close: 'Close',
			title: 'This is a Javascript restoration of a selected screen from <span lang="es">Naranjas</span> (2002) by <span lang="es">Julia Masvernat</span>',
			description: '<p><a href="http://juliamasvernat.com.ar/img/naranjas.swf" lang="es">Naranjas</a> is an interactive animation artwork built in Flash by the argentinian artist <span lang="es">Julia Masvernat</span>. I\'ve chosen the <i>“purple level”</i> from the original project and had a try at rewriting it using modern webtechnologies like ES6 and CSS Animations.</p>\n<p>Being a 2002 project, I had to deal with some scenarios that weren\'t around at the time of its conception, like touch interactions or a much wider diversity of devices and screen sizes. A detailed tutorial of this new media restoration work is coming up soon. Meanwhile, <a href="http://terreni.com.ar">check any of the other works in my personal portfolio</a>.</p>',
			images : [
				{
					figcaption: 'Screen 9',
					alt : 'Pink squares shot downwards and upwards by a pink rectangle in the middle'
				},{
					figcaption: 'Screen 20',
					alt : 'Green and black squares over a white background'
				},{
					figcaption: 'Screen 14',
					alt : 'Pink squares over a red background'
				},{
					figcaption: 'Screen 13',
					alt : 'Purple squares getting smaller over a light blue background'
				}
			],
			credits : 'Restored with ES6 & CSS by <a href="http://terreni.com.ar">Marcelo Terreni</a>',
			viewsource : 'View source in <strong>GitHub</strong>'
		},
		'es' : {
			htmlTitle : 'Una versión en Javascript de «Naranjas» (2002) de Julia Masvernat :: Marcelo Terreni',
			unmute: 'Anular silencio',
			about: 'Créditos',
			close: 'Cerrar',
			title: 'Un ejercicio de preservación con Javascript sobre la obra Naranjas (2002) de Julia Masvernat',
			description: '<p><a href="http://juliamasvernat.com.ar/img/naranjas.swf">Naranjas</a> es una obra del género <i>"animación interactiva"</i> desarrollada en Flash por la artista argentina Julia Masvernat. Para este pequeño experimento de restauración, elegí uno de los <i>"niveles"</i> presentes en la obra original y lo reescribí utilizando tecnologías web modernas como ES6 o Animaciones CSS.</p>\n<p>El proceso incluyó pensar en cómo adecuar la obra original a determinadas circunstancias que no existían en 2002 como las interacciones táctiles o la adaptabilidad a diferentes dispositivos y tamaños de pantalla. Prontó escribiré un tutorial detallado sobre las soluciones que encontré durante el trabajo de restauración. Mientras tanto, <a href="http://terreni.com.ar">te invito a navegar alguno de los otros trabajos exhibidos en mi portfolio personal</a>.',
			images : [
				{
					figcaption: 'Pantalla 9',
					alt : 'Cuadrados rosa disparados hacia arriba y hacia abajo por un rectángulo rosa en el medio'
				},{
					figcaption: 'Pantalla 20',
					alt : 'Cuadrados verdes y negros sobre un fondo blanco'
				},{
					figcaption: 'Pantalla 14',
					alt : 'Cuadrados rosa sobre un fondo rojo'
				},{
					figcaption: 'Pantalla 13',
					alt : 'Cuadrados violeta reduciéndose sobre un fondo celeste'
				}
			],
			credits : 'Obra restaurada con ES6 & CSS por <a href="http://terreni.com.ar">Marcelo Terreni</a>',
			viewsource : 'Ver el código en <strong lang="en">GitHub</strong>'
		}
	};

	document.getElementsByTagName('html')[0].setAttribute('lang', lang);
	document.title = translations[lang].htmlTitle;

	const btnUnmute = document.querySelector('.btn-unmute span');		
	const btnAbout = document.getElementsByClassName('btn-about')[0];
	const btnAboutClose = document.querySelector('.about-btn-close span');

	/* Buttons translations */
	btnUnmute.textContent = translations[lang].unmute;
	btnAbout.textContent = translations[lang].about;
	btnAboutClose.textContent = translations[lang].close;

	const aboutTitle = document.getElementsByClassName('about-title')[0];
	const aboutDescription = document.getElementsByClassName('about-description')[0];
	const aboutScreenshots = document.querySelectorAll('.about-screenshots figure');
	const aboutViewSource = document.getElementsByClassName('btn-viewsource')[0];

	/* Text translation */
	aboutTitle.innerHTML = translations[lang].title;
	aboutDescription.innerHTML = translations[lang].description + '\n' + `<p class="about-credits">${translations[lang].credits}</p>`;
	aboutViewSource.innerHTML = translations[lang].viewsource;

	for(let i = 0; i < aboutScreenshots.length; i++){
		aboutScreenshots[i].querySelector('figcaption').innerHTML = `<p>${translations[lang].images[i].figcaption}</p>`;
		aboutScreenshots[i].querySelector('img').setAttribute('alt', translations[lang].images[i].alt);
	}

}