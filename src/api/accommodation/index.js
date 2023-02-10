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

accommodationRouter.get("/", jwtAuthMiddleware, hostOnlyMiddleware, async (req, res, next) => {
  try {
    const hostId = req.user._id
    const accommodations = await AccommodationsModel.find({ host: hostId })
    if (accommodations) {
      res.status(200).send(accommodations)
    }
  } catch (error) {
    next(error)
  }
})

accommodationRouter.get("/:accommId", jwtAuthMiddleware, hostOnlyMiddleware, async (req, res, next) => {
  try {
    const accomId = req.params.accommId
    const specificAccom = await AccommodationsModel.findById(accomId)
    if (specificAccom) {
      res.status(200).send(specificAccom)
    } else {
      res.status(404).send({ message: "accommodation does not exist" })
    }
  } catch (error) {
    next(error)
  }
})

accommodationRouter.put("/:accommId", jwtAuthMiddleware, hostOnlyMiddleware, async (req, res, next) => {
  try {
    const accomId = req.params.accommId

    const specificAccom = await AccommodationsModel.findById(accomId)
    const accomOwner = specificAccom.host.toString()
    const userMakingRequest = req.user._id

    if (specificAccom) {
      if (userMakingRequest === accomOwner) {
        console.log("user and host match")

        const updatedAccom = await AccommodationsModel.findByIdAndUpdate(accomId, req.body, { new: true })
        console.log("updated Accom", updatedAccom)
        res.status(200).send(updatedAccom)
      } else {
        res.status(403).send({ message: "user and host don't match" })
      }
    } else {
      res.status(404).send({ message: "accommodation does not exist" })
    }
  } catch (error) {
    next(error)
  }
})

accommodationRouter.delete("/:accommId", jwtAuthMiddleware, hostOnlyMiddleware, async (req, res, next) => {
  try {
    const accomId = req.params.accommId
    const specificAccom = await AccommodationsModel.findById(accomId)

    if (!specificAccom) return res.status(404).send({ message: "accommodation does not exist" })
    if (req.user._id !== specificAccom.host.toString())
      return res.status(403).send({ message: "user and host don't match" })

    await AccommodationsModel.findByIdAndDelete(accomId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default accommodationRouter
