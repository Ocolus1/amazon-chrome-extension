const state = {
  loading: false,
  results: null,
  error: null,
  tempoText: false,
};

const handleAnalyzeReviews = async (asin, port) => {
  const apiUrl = "https://pureworthyinstitutes.star0fstars77.repl.co";

  state.loading = true;
  state.results = null;
  state.error = null;
  state.tempoText = true;
  port.postMessage({ action: "updateState", state });

  try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: `asin=${asin}`,
		});

		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		const data = await response.json();
		console.log('Datos recibidos del servidor:', data);
    alert("this is fucked up", data)

    if (data.response) {
      state.results = {
        response : data.response
      }
    }else {

      state.results = {
        positives: data.positives
          .split('.')
          .filter((item) => item.trim().length > 0),
        negatives: data.negatives
          .split('.')
          .filter((item) => item.trim().length > 0),
        improvements: data.improvements
          .split('.')
          .filter((item) => item.trim().length > 0),
      };
    }

		state.error = null;
    state.loading = false;
	  state.tempoText = false;
    port.postMessage({ action: 'updateState', state });
  } catch (error) {
		console.error('Error al obtener datos del servidor:', error);
		state.results = null;
		state.error = error.toString();
    state.loading = false;
	  state.tempoText = false;
    port.postMessage({ action: 'updateState', state });
  }

  state.loading = false;
  state.tempoText = false;

  if (port.sender.tab) {
		port.postMessage({ action: 'updateState', state });
  }

};

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "popup-script");

  port.onMessage.addListener(async (request) => {
    console.log("Mensaje recibido en background.js:", request);
    if (request.action === "requestState") {
      port.postMessage({ action: "updateState", state });
    }

    if (request.action === "analyzeReviews") {
      const asin = request.asin;
      await handleAnalyzeReviews(asin, port);
    }
  });
});





