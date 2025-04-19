import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // app.use is a middleware function that adds middleware to the request handling pipeline
app.use(express.json()) // express.json() is a middleware function that parses incoming requests with JSON payloads
app.use(express.urlencoded({extended: true})) // express.urlencoded() is a middleware function that parses incoming requests with urlencoded payloads
app.use(express.static("public")) // express.static() is a middleware function that serves static files
// app.use(cookieParser()) // cookieParser is a middleware function that parses cookies attached to the client request object

// routes
import userRoutes from "./routes/user.routes.js"
import contractRoutes from "./routes/contracts.routes.js"

app.use("/api/users", userRoutes)
app.use("/api/contracts", contractRoutes)


export default app;