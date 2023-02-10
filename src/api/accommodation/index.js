import express from "express"
import AccommodationsModel from "./model.js"
import { hostOnlyMiddleware } from "../../lib/HostOnly.js"
import { jwtAuthMiddleware } from "../../lib/jwtAuth.js"

const accommodationRouter = express.Router()

accommodationRouter.post("/", jwtAuthMiddleware, hostOnlyMiddleware, async (req, res, next) => {
  try {
    const newAccommodation = new AccommodationsModel({
      ...req.body,
      host: req.user._id
    })
    const accommodation = await newAccommodation.save()
    res.status(201).send(accommodation)
  } catch (error) {
    next(error)
  }
})

accommodationRouter.get("/", async (req, res, next) => {
  try {
    const accommodations = await AccommodationsModel.find()
    if (accommodations) {
      res.status(200).send(accommodations)
    }
  } catch (error) {
    next(error)
  }
})

export default accommodationRouter
