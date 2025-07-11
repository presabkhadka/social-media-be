import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class MessagesController {
  public async sendMessage(ctx: HttpContext) {
    try {
      let email = ctx.email
      let { message } = ctx.request.only(['message'])

      if (!message) {
        return ctx.response.status(400).json({
          msg: 'Messages cannot be left empty',
        })
      }

      let sender = await prisma.user.findFirst({
        where: {
          email,
        },
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
