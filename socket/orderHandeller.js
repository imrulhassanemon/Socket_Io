// import { validateOrder } from "./utils/helper"

import { getCollection } from "../config/database.js"
import { calculateTotals, createOrderDocument, generateOrderId, validateOrder } from "../utils/helper.js"

export const orderHandeler = (io, socket) => {
    console.log("a user connected", socket.id)


    // emit -> triger -> on -> listen 

    //place order 

    socket.on ("placeOrder", async (data, callback)=> {
        try {
            console.log("plce order from ", socket.id)
            const validation = validateOrder(data)

            if(!validation.valid){
               return callback({success: false, message: validation.message}) ;
            }
            const totals = calculateTotals(data.items);
            const orderId = generateOrderId()
            const order = createOrderDocument(data, orderId, totals)

            const ordersCollection = getCollection("orders")
            await ordersCollection.isertOne(order);

            socket.join(`order-${orderId}`)
            socket.join("customers")
            io.to('admins').emmit("newOrder", {order})
            callback({success: true, order})
            console.log(`order created: ${order}`)


            
        } catch (error) {
            console.log(error);
            callback({success:false, message: "Failed to place order"})
        }
    })
}