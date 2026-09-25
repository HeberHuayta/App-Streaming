const express = require('express')
const http = require('http')
const {Server, Socket} = require('socket.io')


const app = express()
const server = http.createServer(app)

const sv = new Server(server)

app.use(express.static('.'))

io.on('connection', (socket) => {

    console.log('Usuario conectado:', socket.id)
})

sv.listen(3000, ()=> {

    console.log('Servidor en http://localhost:3000')
})