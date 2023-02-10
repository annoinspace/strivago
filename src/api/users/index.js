import express from "express"
import UsersModel from "./model.js"
import AccommodationsModel from "../accommodation/model.js"
import { jwtAuthMiddleware } from "../../lib/jwtAuth.js"
import { hostOnlyMiddleware } from "../../lib/HostOnly.js"
import { createAccessToken } from "../../lib/tools.js"
import createHttpError from "http-errors"

const usersRouter = express.Router()

usersRouter.post("/register", async (req, res, next) => {
  try {
    // make sure an email is not aready in use
    const existingUser = await UsersModel.findOne({ email: req.body.email })
    if (existingUser) {
      next(createHttpError(400, "Email already in use"))
    } else {
      const newUser = new UsersModel(req.body)
      const newUserSaved = await newUser.save()
      if (newUserSaved) {
        const payload = { _id: newUserSaved._id, role: newUserSaved.role }
        const accessToken = await createAccessToken(payload)
        res.status(201).send({ accessToken, message: "user created and can now login" })
      } else {
        res.status(400).send({ message: "something went wrong creating new user" })
      }
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await UsersModel.checkCredentials(email, password)
    if (user) {
      console.log("user", user)
      const payload = { _id: user._id, role: user.role }
      const accessToken = await createAccessToken(payload)
      res.status(201).send({ accessToken, message: "user can now login" })
    } else {
      next(createHttpError(401, "login unsuccessful"))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.find({})
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UsersModel.findById(req.user._id)
      res.send(user)
    } else {
      res.status(400).send({ message: "something went getting your profile" })
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me/accommodations", jwtAuthMiddleware, hostOnlyMiddleware, async (req, res, next) => {
  try {
    console.log("req.user", req.user)
    if (req.user.role === "Host") {
      const hostId = req.user._id
      const accommodations = await AccommodationsModel.find({ host: hostId })
      res.send(accommodations)
    } else {
      res.status(403).send({ message: "only hosts can access this information" })
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const userId = request.params.userId
    if (userId === request.user._id) {
      const userToDelete = await User.findByIdAndDelete(userId)
      if (userToDelete) {
        res.status(204).send({ message: "user deleted" })
      } else {
        next(createHttpError(404, `User with id ${userId} not found!`))
      }
    } else {
      next(createHttpError(401, `You can't delete another user :O`))
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter
