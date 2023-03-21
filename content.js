const getAsinFromUrl = (url) => {
  const regex = /\/(?:dp|gp\/product)\/([A-Z0-9]+)(?:\/|\?|$)/i;
  const asinMatch = url.match(regex);
  return asinMatch && asinMatch[1];
};

try {
  const asin = getAsinFromUrl(window.location.href);

  if (asin) {
    console.log("ASIN capturado:", asin);
  } else {
    throw new Error("No se pudo capturar el ASIN. Verifica si la URL es correcta.");
  }
} catch (error) {
  console.error("Error al capturar el ASIN:", error);
}