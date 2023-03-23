document.addEventListener("DOMContentLoaded", () => {
  let asin = null;

  const getAsinFromUrl = (url) => {
    const regex = /\/(?:dp|gp\/product)\/([A-Z0-9]+)(?:\/|\?|$)/i;
    const asinMatch = url.match(regex);
    return asinMatch && asinMatch[1];
  };

  const updateUI = (state) => {
    const container = document.getElementById("results-container");
    const loader = document.getElementById("loader");
    const tempText = document.getElementById('temp-text');
    loader.style.display = state.loading ? "block" : "none";
	  tempText.style.display = state.tempoText ? 'block' : 'none';

    if (state.error) {
      console.error("Error en la respuesta del servidor:", state.error);
      container.innerHTML = `<div class="text-center" >Error: ${state.error}</>`;
    } else if (state.results) {

      if (state.results.response) {
        const { response } = state.results;

        const renderList = (item) => 
            `
            <div class="container mt-4">
                <div class='card text-bg-waring mb-4 text-left'>
                  <div class="card-body text-muted">
                    <blockquote class="blockquote mb-0">
                      ${item}
                    </blockquote>
                  </div>
                </div>
              </div>
            `;
        container.innerHTML = `
          <h5 class='text-start mt-5'>Sorry! 😞</h5>
          ${renderList(response)}
        `;
      } else {

        const { positives, negatives, improvements } = state.results;
  
        const renderList = (items, style) => { 
          let data;
          if (style === "info") {
            data = `
            <div class="container mt-4">
                <div class='card text-bg-info mb-4 text-left'>
                  <div class="card-body text-muted">
                    <blockquote class="blockquote mb-0">
                      ${items
							.map(
								(item, id) =>
									`<p class="lh-sm">${id + 1}. ${item
										.trim()
										.replace(/[-]/g, '')
										.replace(/^(?:\d+\.)?\s*/, '')}</p>`
							)
							.join('')}
                    </blockquote>
                  </div>
                </div>
              </div>
            `;
          } else if (style === 'warning') {
            data = `
              <div class="container mt-4">
                <div class='card text-bg-warning mb-4 text-left '>
                  <div class="card-body text-muted">
                    <blockquote class="blockquote mb-0">
                      ${items
							.map(
								(item, id) =>
									`<p class="lh-sm">${id + 1}. ${item
										.trim()
										.replace(/[-]/g, '')
										.replace(/^(?:\d+\.)?\s*/, '')}</p>`
							)
							.join('')}
                    </blockquote>
                  </div>
                </div>
              </div>
            `;
          } else {
            data = `
              <div class="container mt-4">
                <div class='card text-bg-success text-left'>
                  <div class="card-body">
                    <blockquote class="blockquote mb-0">
                      ${items
							.map(
								(item, id) =>
									`<p class="lh-sm">${id+1}. ${item
										.trim()
										.replace(/[-]/g, '')
										.replace(/^(?:\d+\.)?\s*/, '')}</p>`
							)
							.join('')}
                    </blockquote>
                  </div>
                </div>
              </div>
            `;
          }
          return data
        }
        ;
        const the_body = document.querySelector('body');
        the_body.classList.add('full-height');
        container.innerHTML = `
          <h3 class='mb-3  mt-3'>Resultados del análisis de reseñas</h3>
          <h5 class='text-start'>Positivas 🚀</h5>
          ${renderList(positives, "info")}
          <h5 class='text-start'>Negativas 😞</h5>
          ${renderList(negatives, "warning")}
          <h5 class='text-start'>Mejoras 🦾</h5>
          ${renderList(improvements, "success")}
        `;
      }

    }
  };

  const extractor = document.querySelector("#extractor");
  
  const analyzeButton = document.getElementById('analyze-reviews-button');


  // listens for the click event and extracts the ASIN from the url
  extractor.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      asin = getAsinFromUrl(tabs[0].url);
      if (asin) {
        document.getElementById("asin").innerText = `ASIN:  ${asin}`;
        analyzeButton.style.display = "inline-block";
        extractor.style.display = 'none';
      }
    });
  })

  
  analyzeButton.addEventListener("click", () => {
    console.log("Botón 'Analizar reseñas' presionado. Enviando mensaje a background.js");

    analyzeButton.style.display = 'none';

    const port = chrome.runtime.connect({ name: "popup-script" });

    port.postMessage({ action: "analyzeReviews", asin: asin });

    port.onMessage.addListener((request) => {
      if (request.action === "updateState") {
        updateUI(request.state);
      }
    });

    port.postMessage({ action: "requestState" });
  });

  // Establecer conexión con background.js
  const port = chrome.runtime.connect({ name: "popup-script" });

  // Escuchar mensajes de background.js y actualizar el estado
  port.onMessage.addListener((request) => {
    if (request.action === "updateState") {
      updateUI(request.state);
    }
  });

  // Solicitar el estado actual cuando se carga el popup
  port.postMessage({ action: "requestState" });
});

