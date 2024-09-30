import net from "net"; // Importar el módulo net para crear el servidor
import chalk from "chalk"; // Importar chalk para colorear los mensajes en consola
import fs from "fs"; // Importar el módulo fs para manejar archivos

const logFile = "./logs/server.log"; // Ruta del archivo de log
const clients = []; // Array para mantener la lista de clientes conectados

const logMessage = (message) => {
  const logEntry = `${new Date().toISOString()} - ${message}\n`; // Formato del mensaje de log
  fs.appendFileSync(logFile, logEntry); // Escribir el mensaje en el archivo de log
};

const handleClient = (clientSocket) => {
  const clientAddress = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`; // Obtener la dirección del cliente
  const connectionMessage = `Cliente ${clientAddress} conectado.`;
  console.log(chalk.green(`[NUEVA CONEXIÓN] ${connectionMessage}`)); // Mostrar en consola
  logMessage(connectionMessage); // Registrar en el log
  clients.push(clientSocket); // Añadir cliente a la lista de clientes conectados

  clientSocket.on("data", (msg) => {
    const receivedMessage = `${clientAddress} ${msg.toString()}`;
    console.log(chalk.blue(`[${receivedMessage}]`)); // Mostrar el mensaje recibido del cliente
    logMessage(`Mensaje recibido: ${receivedMessage}`); // Registrar el mensaje recibido
    clientSocket.write("Mensaje recibido"); // Enviar respuesta al cliente

    // Enviar el mensaje a todos los demás clientes
    clients.forEach((client) => {
      if (client !== clientSocket) {
        client.write(receivedMessage);
      }
    });
  });

  clientSocket.on("end", () => {
    const disconnectionMessage = `Cliente ${clientAddress} desconectado.`;
    console.log(chalk.red(`[DESCONEXIÓN] ${disconnectionMessage}`)); // Mostrar en consola
    logMessage(disconnectionMessage); // Registrar en el log
    clients.splice(clients.indexOf(clientSocket), 1); // Eliminar el cliente de la lista
  });

  clientSocket.on("error", (err) => {
    console.error(chalk.red("Error del servidor:"), err);
    logMessage(`Error: ${err.message}`); // Registrar errores en el log
  });
};

const startServer = () => {
  const serverSocket = net.createServer(handleClient); // Crear el servidor
  serverSocket.listen(8080, () => {
    console.log(chalk.green("[SERVIDOR INICIADO] Esperando conexiones...")); // Indicar que el servidor está listo
    logMessage("Servidor iniciado, esperando conexiones..."); // Registrar que el servidor ha iniciado
  });
};

startServer(); // Iniciar el servidor
