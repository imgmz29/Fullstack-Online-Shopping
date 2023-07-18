import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import { DraftOrder, Order, Item, possibleIngredients } from './data'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { Issuer, Strategy } from 'openid-client'
import passport from 'passport'
import { keycloak } from "./secrets"
import http from "http"
import { Server } from "socket.io"

// set up socket io
const server = http.createServer()
const io = new Server(server)

let commentFlag = false

// set up Mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(mongoUrl)
let db: Db
let customers: Collection
let orders: Collection
let operators: Collection
let possibleItems: Collection
let comments: Collection
let admins: Collection


// set up Express
const app = express()
const port = parseInt(process.env.PORT) || 8095
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

// set up session
const sessionStore = MongoStore.create({
  mongoUrl,
  dbName: "Mini-Starbucks",
  ttl: 14 * 24 * 60 * 60 // 14 days
})
app.use(session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false},

  // comment out the following to default to a memory-based store, which,
  // of course, will not persist across load balanced servers
  // or survive a restart of the server
  store: sessionStore
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user: any, done: any) => {
  logger.info("serializeUser " + JSON.stringify(user))
  done(null, user)
})
passport.deserializeUser((user: any, done: any) => {
  logger.info("deserializeUser " + JSON.stringify(user))
  done(null, user)
})

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401)
    return
  }

  next()
}

// app routes
app.post(
  "/api/logout", 
  (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      res.redirect("/")
    })
  }
)

app.get("/api/orders", async (req, res) => {
  res.status(200).json(await orders.find({ state: { $ne: "draft" }}).toArray())
})

app.get("/api/user", (req, res) => {
  res.json(req.user || {})
})

app.get("/api/possible-ingredients", (req, res) => {
  res.status(200).json(possibleIngredients)
})

app.get("/api/possible-items", async (req, res) => {
  res.status(200).json(await possibleItems.find().toArray())
})

app.get("/api/all-customers", async (req, res) => {
  res.status(200).json(await customers.find().toArray())
})

app.get("/api/all-operators", async (req, res) => {
  res.status(200).json(await operators.find().toArray())
})

app.get("/api/customer", checkAuthenticated, async (req, res) => {
  const _id = req.user.preferred_username
  logger.info("/api/customer " + _id)
  const customer = await customers.findOne({ _id })
  if (customer == null) {
    res.status(404).json({ _id })
    return
  }
  customer.orders = await orders.find({ customerId: _id, state: { $ne: "draft" } }).toArray()
  res.status(200).json(customer)
})

app.get("/api/operator", checkAuthenticated, async (req, res) => {
  const _id = req.user.preferred_username
  const operator = await operators.findOne({ _id })
  if (operator == null) {
    res.status(404).json({ _id })
    return
  }
  operator.orders = await orders.find({ operatorId: _id }).toArray()
  res.status(200).json(operator)
})

app.get("/api/customer/order/:orderId", checkAuthenticated, async (req, res) => {
  const { orderId } = req.params
  const order = await orders.find({ _id: orderId }).toArray()
  // console.log(orderId)
  console.log("===============" + order +"=================")
  res.status(200).json(order)
})

app.get("/api/item/:itemId/comments", async (req, res) => {
  const { itemId } = req.params

  // TODO: validate customerId

  const itemComments = await comments.find({ itemId: itemId }).toArray()
  res.status(200).json(itemComments)
})

app.get("/api/customer/draft-order", checkAuthenticated, async (req, res) => {
  const customerId = req.user.preferred_username

  // TODO: validate customerId

  const draftOrder = await orders.findOne({ state: "draft", customerId })
  res.status(200).json(draftOrder || { customerId, items: [], totalPrice: 0 })
})

app.put("/api/customer/submit-comment", checkAuthenticated, async (req, res) => {
  const itemId = req.body.itemId
  const operatorId = req.body.operatorId
  const orderId = req.body.orderId
  const content = req.body.content
  const rating = req.body.rating
  // TODO: validate customerId

  const result = await comments.updateOne(
    {
      customerId: req.user.preferred_username,
      itemId: itemId,
      orderId: orderId,
      operatorId: operatorId
    },
    {
      $set: {
        content: content,
        rate: rating
      }
    },
    {
      upsert: true
    }
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/item/stock", checkAuthenticated, async (req, res) => {
  const itemsId = req.body.itemsId
  console.log("server: itemsId" + itemsId)
  const itemNum = req.body.itemNum
  const stock = req.body.stock
  // TODO: validate customerId

  const result = await possibleItems.updateOne(
    {
      _id: itemsId,
    },
    {
      $set: {
        stock: stock - itemNum,
      }
    },
    {
      upsert: false
    }
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/customer/draft-order", checkAuthenticated, async (req, res) => {
  const order: DraftOrder = req.body
  
  // TODO: validate customerId

  const result = await orders.updateOne(
    {
      customerId: req.user.preferred_username,
      state: "draft",
    },
    {
      $set: {
        items: order.items,
        totalPrice: order.totalPrice
      }
    },
    {
      upsert: true
    }
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/customer/update-promo-code", checkAuthenticated, async (req, res) => {
  const newPromo: number = req.body.newPromo
  const result = await customers.updateOne(
    {
      _id: req.user.preferred_username,
    },
    {
      $set: {
        promoCode: newPromo,
      }
    },
    {
      upsert: false
    }
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/customer/update-order-count", checkAuthenticated, async (req, res) => {
  const newCount = req.body.newCount
  const result = await customers.updateOne(
    {
      _id: req.user.preferred_username,
    },
    {
      $set: {
        orderCount: newCount,
      }
    },
    {
      upsert: false
    }
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/customer/update-profile", checkAuthenticated, async (req, res) => {
  const newName = req.body.newName
  const newEmail = req.body.newEmail
  const newPhone = req.body.newPhone
  const result = await customers.updateOne(
    {
      _id: req.user.preferred_username,
    },
    {
      $set: {
        name: newName,
        email: newEmail,
        phone: newPhone,
      }
    },
    {
      upsert: false
    }
  )
  commentFlag = true
  res.status(200).json({ status: "ok" })
})

app.put("/api/admin/update-operator/:operatorId", checkAuthenticated, async (req, res) => {
  const newName = req.body.newName
  const newEmail = req.body.newEmail

  const result = await operators.updateOne(
    {
      _id: req.params.operatorId,
    },
    {
      $set: {
        name: newName,
        email: newEmail,
      }
    },
    {
      upsert: false
    }
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/admin/delete-operator/:operatorId", checkAuthenticated, async (req, res) => {
  const result = await operators.deleteOne(
    {
      _id: req.params.operatorId,
    },
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/admin/add-operator/", checkAuthenticated, async (req, res) => {
  const newId = req.body.newId
  const newName = req.body.newName
  const newEmail = req.body.newEmail

  const result = await operators.insertOne(
    {
      _id: newId,
      name: newName,
      email: newEmail,
    },
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/admin/update-item/:itemId", checkAuthenticated, async (req, res) => {
  const newName = req.body.newName
  const newDescription = req.body.newDescription
  const newPrice = req.body.newPrice
  const newType = req.body.newType
  const newPicture = req.body.newPicture
  const newStock = req.body.newStock

  const result = await possibleItems.updateOne(
    {
      _id: req.params.itemId,
    },
    {
      $set: {
        name: newName,
        description: newDescription,
        price: newPrice,
        type: newType,
        picture: newPicture,
        stock: newStock,
      }
    },
    {
      upsert: false
    }
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/admin/delete-item/:itemId", checkAuthenticated, async (req, res) => {
  const result = await possibleItems.deleteOne(
    {
      _id: req.params.itemId,
    },
  )
  res.status(200).json({ status: "ok" })
})

app.put("/api/admin/add-item/", checkAuthenticated, async (req, res) => {
  const newId = req.body.newId
  const newName = req.body.newName
  const newDescription = req.body.newDescription
  const newPrice = req.body.newPrice
  const newType = req.body.newType
  const newPicture = req.body.newPicture
  const newStock = req.body.newStock

  const result = await possibleItems.insertOne(
    {
      _id: newId,
      name: newName,
      description: newDescription,
      price: newPrice,
      type: newType,
      picture: newPicture,
      stock: newStock,
    },
  )
  res.status(200).json({ status: "ok" })
})

app.post("/api/customer/submit-draft-order", checkAuthenticated, async (req, res) => {
  const result = await orders.updateOne(
    {
      customerId: req.user.preferred_username,
      state: "draft",
    },
    {
      $set: {
        state: "queued",
      }
    }
  )
  if (result.modifiedCount === 0) {
    res.status(400).json({ error: "no draft order" })
    return
  }
  res.status(200).json({ status: "ok" })
})

app.put("/api/order/:orderId", checkAuthenticated, async (req, res) => {
  const order: Order = req.body

  // TODO: validate order object

  const condition: any = {
    _id: new ObjectId(req.params.orderId),
    state: { 
      $in: [
        // because PUT is idempotent, ok to call PUT twice in a row with the existing state
        order.state
      ]
    },
  }
  switch (order.state) {
    case "preparing":
      condition.state.$in.push("queued")
      // can only go to blending state if no operator assigned (or is the current user, due to idempotency)
      condition.$or = [{ operatorId: { $exists: false }}, { operatorId: order.operatorId }]
      break
    case "done":
      condition.state.$in.push("preparing")
      condition.operatorId = order.operatorId
      break
    default:
      // invalid state
      res.status(400).json({ error: "invalid state" })
      return
  }
  
  const result = await orders.updateOne(
    condition,
    {
      $set: {
        state: order.state,
        operatorId: order.operatorId,
      }
    }
  )

  if (result.matchedCount === 0) {
    res.status(400).json({ error: "orderId does not exist or state change not allowed" })
    return
  }
  res.status(200).json({ status: "ok" })
})

// io.on('connetction', client => {
//   client.on("update-comment", () => {
//     if(commentFlag === false)
//       setTimeout(() => client.emit("update-comment-reply", false), 2000)
//     else{
//       commentFlag = false
//       setTimeout(() => client.emit("update-comment-reply", true), 2000)
//     }
// })})

// connect to Mongo
client.connect().then(() => {
  logger.info('connected successfully to MongoDB')
  db = client.db("Mini-Starbucks")
  operators = db.collection('operators')
  orders = db.collection('orders')
  customers = db.collection('customers')
  possibleItems = db.collection('possibleItems')
  comments = db.collection('comments')
  admins = db.collection('admins')

  Issuer.discover("http://127.0.0.1:8081/auth/realms/Mini-Starbucks/.well-known/openid-configuration").then(issuer => {
    const client = new issuer.Client(keycloak)
  
    passport.use("oidc", new Strategy(
      { 
        client,
        params: {
          // this forces a fresh login screen every time
          prompt: "login"
        }
      },
      async (tokenSet: any, userInfo: any, done: any) => {
        logger.info("oidc " + JSON.stringify(userInfo))

        const _id = userInfo.preferred_username
        const operator = await operators.findOne({ _id })
        const admin = await admins.findOne({ _id })
        if(admin != null)
        userInfo.roles = ["admin"]
        else if (operator != null) {
          userInfo.roles = ["operator"]
        } else {
          const customer = await customers.findOne({ _id })
          if(customer == null) {
            await customers.updateOne(
              { _id },
              {
                $set: {
                  name: userInfo.name,
                  email: userInfo.email,
                  orderCount: 0,
                  promoCode: 0
                }
              },
              { upsert: true }
            )
          }
          console.log(userInfo)
          userInfo.roles = ["customer"]
        }

        return done(null, userInfo)
      }
    ))

    app.get(
      "/api/login", 
      passport.authenticate("oidc", { failureRedirect: "/api/login" }), 
      (req, res) => res.redirect("/")
    )   

    app.get(
      "/api/login-callback/",
      passport.authenticate("oidc", {
        successRedirect: "/",
        failureRedirect: "/api/login",
      })
    )       

    // start server
    app.listen(port, () => {
      logger.info(`Mini-Starbucks server listening on port ${port}`)
    })
  })
})
