import { MongoClient, ObjectId } from 'mongodb'
import { Operator, Customer, Item, Order, Comment, Admin } from './data'

// Connection URL
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)

const operators: Operator[] = [
  {
    _id: "jim",
    name: "Jim",
    email: "jim@ms.com"
  },
]

const customers: Customer[] = [
  {
    _id: "alice",
    name: "Alice",
    email : "alice@ms.com",
    phone : "1112223333",
    orderCount: 0,
    promoCode: 0,
  },
  {
    _id: "bob",
    name: "Bob",
    email : "bob@ms.com",
    orderCount: 0,
    promoCode: 0,
  },
]

const possibleItems: Item[] = [
  {
    _id: "i1",
    name: "Latte",
    description: "This is Latte.",
    price: 10,
    type: "Coffee",
    picture: "https://images.pexels.com/photos/433145/pexels-photo-433145.jpeg?auto=compress&cs=tinysrgb&w=1600",
    stock: 10
  },
  {
    _id: "i2",
    name: "Espresso",
    description: "This is Espresso.",
    price: 8,
    type: "Coffee",
    picture: "https://images.pexels.com/photos/1727123/pexels-photo-1727123.jpeg?auto=compress&cs=tinysrgb&w=1600",
    stock: 50
  },
  {
    _id: "i3",
    name: "Turkey Sandwich",
    description: "This is Turkey Sandwich.",
    price: 10,
    type: "Sandwich",
    picture: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&cs=tinysrgb&w=1600",
    stock: 200
  },
  {
    _id: "i4",
    name: "Chicken Sandwich",
    description: "This is Chicken Sandwich.",
    price: 12,
    type: "Sandwich",
    picture: "https://images.pexels.com/photos/2282532/pexels-photo-2282532.jpeg?auto=compress&cs=tinysrgb&w=1600",
    stock: 100
  },
  {
    _id: "i5",
    name: "Chocolate Cake",
    description: "This is Chocolate Cake.",
    price: 5,
    type: "Bakery",
    picture: "https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=1600",
    stock: 10
  },
  {
    _id: "i6",
    name: "Cookie",
    description: "This is Cookie.",
    price: 2,
    type: "Bakery",
    picture: "https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=1600",
    stock: 10
  },
]

// const orders: Order[] = [
//   {
//     customerId: "alice",
//     items: [{itemName:"Latte", count:1}, {itemName:"Chocolate Cake", count: 2}],
//     totalPrice: 80,
//     _id: "11111",
//     state: "done",
//     operatorId: "jim",
//   },
// ]

const comments: Comment[] = [
  {
    _id: "1",
    orderId: "6376dec084494d2601c3013d",
    customerId: "alice",
    operatorId: "jim",
    itemId: "i1",
    content: "Very good!",
    rate: "5",
  },
]

const admins: Admin[] = [
  {
    _id: "owner1",
    name: "Owner1"
  },
]

async function main() {
  await client.connect()
  console.log('Connected successfully to MongoDB')

  const db = client.db("Mini-Starbucks")

  // set up unique index for upsert -- to make sure a customer cannot have more than one draft order
  db.collection("orders").createIndex(
    { customerId: 1 }, 
    { unique: true, partialFilterExpression: { state: "draft" } }
  )

  // add data
  console.log("inserting operators", await db.collection("operators").insertMany(operators as any))
  console.log("inserting customers", await db.collection("customers").insertMany(customers as any))
  console.log("inserting possibleItems", await db.collection("possibleItems").insertMany(possibleItems as any))
  console.log("inserting comments", await db.collection("comments").insertMany(comments as any))
  console.log("inserting admins", await db.collection("admins").insertMany(admins as any))
  // console.log("inserting orders", await db.collection("orders").insertMany(orders as any))

  process.exit(0)
}

main()
