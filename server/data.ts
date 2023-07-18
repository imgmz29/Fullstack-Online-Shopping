export const possibleIngredients = [
  "strawberry",
  "milk",
  "banana",
]

export interface Item {
  _id: string
  name: string
  description: string
  price: number
  type?: "Coffee" | "Sandwich" | "Bakery" | "None"
  picture: string
  stock: number
}

export interface ItemWithCount {
  itemName: string
  count: number
}

export interface DraftOrder {
  customerId: string
  items: ItemWithCount[]
  totalPrice: number
}

export interface Order extends DraftOrder {
  _id: string
  state: "draft" | "queued" | "preparing" | "done"
  operatorId?: string
}

export interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
  orderCount: number
  promoCode: number
}

export interface CustomerWithOrders extends Customer {
  orders: Order[]
}

export interface Operator {
  _id: string
  name: string
  email: string
}

export interface Comment {
  _id: string
  orderId: string
  customerId: string
  operatorId: string
  itemId: string
  content: string
  rate: "1" | "2" | "3" | "4" | "5"
}

export interface Admin {
  _id: string
  name: string
}