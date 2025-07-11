import type { HttpContext } from '@adonisjs/core/http'
import prisma from '#services/Prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import app from '@adonisjs/core/services/app'

dotenv.config()

export default class UsersController {
  public async registerUser(ctx: HttpContext) {
    let { firstname, lastname, age, gender, email, password } = ctx.request.only([
      'firstname',
      'lastname',
      'age',
      'gender',
      'email',
      'password',
    ])

    if (!firstname || !lastname || !age || !gender || !email || !password) {
      return ctx.response.status(400).json({
        msg: 'Input fields cannot be left empty',
      })
    }

    let userExists = await prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (userExists) {
      return ctx.response.status(409).json({
        msg: 'User with this email already exists',
      })
    }

    let hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        firstname,
        lastname,
        age,
        gender,
        email,
        password: hashedPassword,
      },
    })

    ctx.response.status(200).json({
      msg: 'User registered successfully',
    })
  }

  public async loginUser(ctx: HttpContext) {
    try {
      let { email, password } = ctx.request.only(['email', 'password'])

      if (!email || !password) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let userExists = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (!userExists) {
        return ctx.response.status(404).json({
          msg: 'No such user found in db',
        })
      }

      let passwordMatch = await bcrypt.compare(password, userExists.password)

      if (!passwordMatch) {
        return ctx.response.status(401).json({
          msg: 'Invalid credentials, Please try again!',
        })
      }

      let token = jwt.sign({ email }, process.env.JWT_SECRET!)

      ctx.response.status(200).json({
        token,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async editUser(ctx: HttpContext) {
    try {
      let email = ctx.email

      let firstname = ctx.request.input('firstname')
      let lastname = ctx.request.input('lastname')
      let age = ctx.request.input('age')
      let gender = ctx.request.input('gender')
      let avatarImage = ctx.request.file('avatar', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg', 'svg'],
      })
      await avatarImage?.move(app.makePath('storage/uploads'))
      let avatar = avatarImage ? `./storage/uploads/${avatarImage.fileName}` : null
      let fieldsToUpdate: Record<string, any> = {}

      if (firstname) fieldsToUpdate.firstname = firstname
      if (lastname) fieldsToUpdate.lastname = lastname
      if (age) fieldsToUpdate.age = age
      if (gender) fieldsToUpdate.gender = gender
      if (avatar) fieldsToUpdate.avatar = avatar

      let userExists = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (!userExists) {
        return ctx.response.status(404).json({
          msg: 'No matching user found in the db',
        })
      }

      await prisma.user.update({
        where: {
          email,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'User updated successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deleteUser(ctx: HttpContext) {
    try {
      let email = ctx.email
      let userId = Number(ctx.params.userId)
      if (!userId) {
        return ctx.response.status(400).json({
          msg: 'No user id present in the params',
        })
      }

      let userExists = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      })

      if (!userExists) {
        return ctx.response.status(404).json({
          msg: 'No user with such id found',
        })
      }

      if (email !== userExists.email) {
        return ctx.response.status(409).json({
          msg: "Cannot perform this actions with other user's id",
        })
      }

      await prisma.user.delete({
        where: {
          id: userId,
        },
      })

      ctx.response.status(200).json({
        msg: 'User deleted successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async getDetails(ctx: HttpContext) {
    try {
      let email = ctx.email

      let userExists = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (!userExists) {
        return ctx.response.status(404).json({
          msg: 'No such user found',
        })
      }

      ctx.response.status(200).json({
        details: userExists,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async searchUsers(ctx: HttpContext) {
    try {
      let { firstname, lastname } = ctx.request.only(['firstname', 'lastname'])

      let searchParams: Record<string, any> = {}

      if (firstname)
        searchParams.firstname = {
          equals: firstname,
          mode: 'insensitive',
        }

      if (lastname)
        searchParams.lastname = {
          equals: lastname,
          mode: 'insensitive',
        }

      if (Object.keys(searchParams).length === 0) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let userExists = await prisma.user.findMany({
        where: searchParams,
      })

      if (!userExists || userExists.length === 0) {
        return ctx.response.status(404).json({
          msg: 'No such user found',
        })
      }

      ctx.response.status(200).json({
        user: userExists,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Somethign went wrong with the server',
      })
    }
  }

  public async addFriend(ctx: HttpContext) {
    try {
      let email = ctx.email

      let userDetails = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      let userId = Number(userDetails!.id)

      let friendId = Number(ctx.params.friendId)
      if (!friendId) {
        return ctx.response.status(400).json({
          msg: 'No friend id present in the params',
        })
      }

      let requsetSent = await prisma.friendRequest.findFirst({
        where: {
          senderId: userId,
          receiverId: friendId,
        },
      })

      if (requsetSent) {
        return ctx.response.status(409).json({
          msg: 'You have already sent request please wait for the response',
        })
      }

      await prisma.friendRequest.create({
        data: {
          senderId: userId,
          receiverId: friendId,
          status: 'PENDING',
        },
      })

      ctx.response.status(200).json({
        msg: 'Friend request sent successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async cancelFriendRequest(ctx: HttpContext) {
    try {
      let senderId = Number(ctx.params.senderId)
      let receiverId = Number(ctx.params.receiverId)

      if (!senderId) {
        return ctx.response.status(400).json({
          msg: 'Sender id not present in the params',
        })
      }

      if (!receiverId) {
        return ctx.response.status(400).json({
          msg: 'Receiver id not present in the params',
        })
      }

      let requestExists = await prisma.friendRequest.findFirst({
        where: {
          senderId,
          receiverId,
        },
      })

      if (!requestExists) {
        return ctx.response.status(404).json({
          msg: 'No such request found in the sever',
        })
      }

      await prisma.friendRequest.delete({
        where: {
          id: requestExists!.id,
        },
      })

      ctx.response.status(200).json({
        msg: 'Request deleted',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async acceptFriendRequest(ctx: HttpContext) {
    try {
      let requestId = Number(ctx.params.requestId)

      if (!requestId) {
        return ctx.response.status(400).json({
          msg: 'No request id present in the params',
        })
      }

      let requestExists = await prisma.friendRequest.findFirst({
        where: {
          id: requestId,
        },
      })

      if (!requestExists) {
        return ctx.response.status(404).json({
          msg: 'No any request with such id found',
        })
      }

      if (requestExists.status === 'ACCEPETED') {
        return ctx.response.status(400).json({
          msg: 'This request is already accepted',
        })
      }

      await prisma.friendRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: 'ACCEPETED',
        },
      })

      await prisma.friendship.create({
        data: {
          user1Id: requestExists.senderId,
          user2Id: requestExists.receiverId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Friend request accepted',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async viewFriends(ctx: HttpContext) {
    try {
      let email = ctx.email

      let currentUser = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (!currentUser) {
        return ctx.response.status(404).json({
          msg: 'No such user found',
        })
      }

      let userId = currentUser.id

      const userWithFriends = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          friendsInitiated: { include: { user2: true } },
          friendsReceived: { include: { user1: true } },
        },
      })

      let friends = [
        ...userWithFriends!.friendsInitiated.map((f) => f.user2),
        ...userWithFriends!.friendsReceived.map((f) => f.user1),
      ]

      let totalFriends = friends.length

      ctx.response.status(200).json({
        totalFriends,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
