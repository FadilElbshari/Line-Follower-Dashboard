import express from 'express';
import session from 'express-session';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const wrap = (expressMiddleWare) => (socket, next) => (expressMiddleWare(socket.request, {}, next));

const app = express();
const PORT = process.env.PORT;
const server = createServer(app);
const io = new Server(server);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'Assets')));

// Session middleware setup
const sessionMiddleware = session({
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    secret: "FBawfuabwfa",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
});

app.use(sessionMiddleware);
app.use(express.json());
io.use(wrap(sessionMiddleware));

// Send the HTML file to the client
app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, 'Assets', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        if (currentPort) {
            currentPort.close(); // Close the serial port on disconnect
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
