import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import passport from "passport"
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler
} from "./errorHandlers.js"
import mongoose from "mongoose"

// import googleStrategy from "./lib/auth/google.js"

const server = express()

const port = process.env.PORT || 3001

// passport.use("google", googleStrategy)

// ---------------- WHITELIST FOR CORS ------------------

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOptions = {
  origin: (origin, corsNext) => {
    console.log("-----CURRENT ORIGIN -----", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true)
    } else {
      corsNext(createHttpError(400, `Origin ${origin} is not in the whitelist!`))
    }
  }
}

server.use(express.json())
server.use(cors(corsOptions))
server.use(passport.initialize())
// ****************** ENDPOINTS ********************
// server.use("/blogPosts", blogsRouter)

// ****************** ERROR HANDLERS ****************
server.use(badRequestHandler) // 400
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(notFoundHandler) // 404
server.use(genericErrorHandler) // 500

mongoose.set("strictQuery", false)
mongoose.connect(process.env.MONGO_URL)

mongoose.connection.on("connected", () => {
  console.log("connectd to mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("server is running on port:", port)
  })
})
