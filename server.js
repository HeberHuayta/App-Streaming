const express = require('express')
const http = require('http')
const {Server} = require('socket.io')


const app = express()
const server = http.createServer(app)

const sv = new Server(server)

app.use(express.static('.'))

sv.on('connection', (socket) => {

    console.log('Usuario conectado:', socket.id)

    socket.on('offer', (offer)=> {

        console.log('oferta recibida')

        socket.broadcast.emit('offer', offer)
    })

    socket.on('answer', (answer)=> {

        console.log('respuesta recibida')

        socket.broadcast.emit('answer', answer)
    })
})

server.listen(3000, ()=> {

    console.log('Servidor en http://localhost:3000')
})