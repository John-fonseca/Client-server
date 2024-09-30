import net from "net"; // Importar el módulo net para crear el cliente
import readline from "readline"; // Importar readline para manejar la entrada del usuario
import chalk from "chalk"; // Importar chalk para colorear los mensajes en consola
import fs from "fs"; // Importar el módulo fs para manejar archivos

const logFile = "./logs/client.log"; // Ruta del archivo de log
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let messageHistory = []; // Array para guardar el historial de mensajes

const logMessage = (message) => {
  const logEntry = `${new Date().toISOString()} - ${message}\n`; // Formato del mensaje de log
  fs.appendFileSync(logFile, logEntry); // Escribir el mensaje en el archivo de log
};

const displayHelp = () => {
  console.log(
    chalk.yellow(`
        Comandos disponibles:
        /help - Mostrar esta ayuda
        /history - Mostrar el historial de mensajes
        salir - Desconectar del servidor
    `)
  );
};

const displayHistory = () => {
  console.log(chalk.cyan("Historial de mensajes:"));
  messageHistory.forEach((msg, index) => {
    console.log(`${index + 1}: ${msg}`);
  });
};

const startClient = () => {
  const clientSocket = net.createConnection(
    { host: "127.0.0.1", port: 8080 },
    () => {
      console.log(
        chalk.green("Conectado al servidor. Escribe un mensaje para enviar:")
      ); // Indicar que el cliente está conectado
      logMessage("Conectado al servidor."); // Registrar que el cliente se ha conectado
      displayHelp(); // Mostrar la ayuda al iniciar
    }
  );

  clientSocket.on("data", (data) => {
    console.log(chalk.blue(`[SERVIDOR] ${data.toString()}`)); // Mostrar la respuesta del servidor
    logMessage(`Respuesta del servidor: ${data.toString()}`); // Registrar la respuesta del servidor
    messageHistory.push(`SERVIDOR: ${data.toString()}`); // Agregar al historial
  });

  clientSocket.on("error", (err) => {
    console.error(chalk.red("Error del cliente:"), err); // Mostrar errores del cliente
    logMessage(`Error del cliente: ${err.message}`); // Registrar errores en el log
  });

  rl.on("line", (msg) => {
    if (msg.toLowerCase() === "salir") {
      clientSocket.end(); // Cerrar la conexión si el usuario escribe "salir"
      rl.close(); // Cerrar la interfaz de readline
      logMessage("Cliente desconectado."); // Registrar la desconexión
    } else if (msg === "/help") {
      displayHelp(); // Mostrar la ayuda
    } else if (msg === "/history") {
      displayHistory(); // Mostrar el historial
    } else {
      clientSocket.write(msg); // Enviar mensaje al servidor
      logMessage(`Mensaje enviado: ${msg}`); // Registrar el mensaje enviado
      messageHistory.push(`CLIENTE: ${msg}`); // Agregar al historial
    }
  });
};

startClient(); // Iniciar el cliente
