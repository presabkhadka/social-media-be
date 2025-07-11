import app from '@adonisjs/core/services/app'
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'

app.ready(() => {
  const io = new Server(server.getNodeServer(), {
    cors: {
      origin: '*',
    },
  })
  io?.on('connection', (socket) => {
    console.log('A new connection', socket.id)
  })
})

export {}
