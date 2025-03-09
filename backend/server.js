import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import searchRoutes from "./routes/searchRoutes.js";
import serviceRoutes from './routes/serviceRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import http from "http";
import { WebSocketServer } from "ws";
import { type } from "os";

dotenv.config();

//connect to database
connectDB();

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth", authRoutes);
app.use("/api", searchRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/appointments", appointmentRoutes);


//create the http server from the express app
const server = http.createServer(app);

//create the websocket server and associate it with the http server
const wss = new WebSocketServer({ server });

//websocket connection handler
wss.on("onnection", (ws) => {
  console.log("new websocket connection");

  //send a welcome message to the client
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "connected to websocket server",
    })
  );

  //handle incoming message from the client
  ws.on("message", (message) => {
    console.log("received message:", message.toString());
  });

  //handle client disconnection
  ws.on("close", () => {
    console.log("received message:", message.toString());
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
