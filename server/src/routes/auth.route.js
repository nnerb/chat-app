import express from "express"

const router = express.Router()

router.get("/signup", (req, res) => {
  res.send({ message: "signup route"})
})

router.get("/login", (req, res) => {
  res.send({ message: "login route"})
})
router.get("/logout", (req, res) => {
  res.send({ message: "logout route"})
})

export default router