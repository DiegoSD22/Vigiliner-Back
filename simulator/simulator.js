const { io } = require("socket.io-client");

// 🔐 PON AQUÍ TU JWT
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NzU3YWZkMC05NDI1LTQwOTAtOTE4MC1lMzgyOGYxYTM4NjEiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3MDkzNTU5MiwiZXhwIjoxNzcxMDIxOTkyfQ.1SCV5Im_3nx-sYHw_ArU1kccPg2Ch11tLa186ouUGAw";

// 📍 ID del device que ya exista en tu base
const DEVICE_ID = "b718240b-9007-42b1-802c-e1612f5467a2";

// Punto inicial (ejemplo Monterrey)
let lat = 25.6866;
let lng = -100.3161;

console.log("TOKEN USADO:", TOKEN);

// Conectar al backend
const socket = io("http://localhost:3000", {
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("✅ Simulador conectado");

  socket.emit("joinDevice", DEVICE_ID);

  setInterval(() => {
    // Simular movimiento pequeño
    lat += (Math.random() - 0.5) * 0.0005;
    lng += (Math.random() - 0.5) * 0.0005;

    const location = {
      deviceId: DEVICE_ID,
      lat,
      lng,
      speed: Math.floor(Math.random() * 80),
      heading: Math.floor(Math.random() * 360),
    };

    console.log("📡 Enviando:", location);

    socket.emit("sendLocation", location);
  }, 10000); // cada 10 segundos
});

socket.on("disconnect", () => {
  console.log("❌ Simulador desconectado");
});
