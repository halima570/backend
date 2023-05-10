const express = require("express")
const router = express.Router()
const User = require("../models/user")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const app=express()



const { getToken, COOKIE_OPTIONS, getRefreshToken , verifyUser } = require("../authenticate")

router.get('/logout', verifyUser, async (req, res, next) => {
  try {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies

    const user = await User.findById(req.user._id)

    const tokenIndex = user.refreshToken.findIndex(
      item => item.refreshToken === refreshToken
    )
    console.log(tokenIndex);

    if (tokenIndex !== -1) {
      delete user.refreshToken[tokenIndex]
    }

    await user.save()

    res.clearCookie('refreshToken', COOKIE_OPTIONS)
    res.send({ success: true })
  } catch (err) {
    res.statusCode = 500
    res.send(err)
  }
})

router.get("/me", verifyUser, (req, res, next) => {
  res.send(req.user)
})

router.post("/signup", async (req, res, next) => {
  try {
    if (!req.body.firstName) {
      throw new Error("The first name is required")
    }
    const user = await User.register(
      new User({ username: req.body.username }),
      req.body.password
    )
    user.firstName = req.body.firstName
    user.lastName = req.body.lastName || ""
    const token = getToken({ _id: user._id })
    const refreshToken = getRefreshToken({ _id: user._id })
    user.refreshToken.push({ refreshToken })
    await user.save()
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.send({ success: true, token ,user})
  } catch (error) {
    res.statusCode = 500
    res.send({
      name: error.name,
      message: error.message,
    })
  }
})

router.post("/login", passport.authenticate("local"), async (req, res, next) => {
  try {
    const token = getToken({ _id: req.user._id })
    const refreshToken = getRefreshToken({ _id: req.user._id })
    const user = await User.findById(req.user._id)
    user.refreshToken.push({ refreshToken })
    await user.save()
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.send(user)
  } catch (err) {
    res.statusCode = 500
    res.send(err)
  }
})


router.post("/refreshToken", async (req, res, next) => {
  const { signedCookies = {} } = req
  const { refreshToken } = signedCookies

  if (!refreshToken) {
    res.statusCode = 401
    res.send("Unauthorized")
    return
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const userId = payload._id
    const user = await User.findOne({ _id: userId })
    
    if (!user) {
      res.statusCode = 401
      res.send("Unauthorized")
      return
    }

    const tokenIndex = user.refreshToken.findIndex(
      item => item.refreshToken === refreshToken
    )

    if (tokenIndex === -1) {
      res.statusCode = 401
      res.send("Unauthorized")
      return
    }

    const token = getToken({ _id: userId })
    const newRefreshToken = getRefreshToken({ _id: userId })

    user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken }

    await user.save()

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
    res.send({ success: true, token })
  } catch (err) {
    res.statusCode = 401
    res.send("Unauthorized")
  }
})


module.exports = router
