import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  public async makePost(ctx: HttpContext) {
    try {
      let email = ctx.email

      let currentUser = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      let { title, body } = ctx.request.only(['title', 'body'])

      if (!title || !body) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      await prisma.posts.create({
        data: {
          title,
          body: body,
          author: currentUser!.id,
        },
      })

      ctx.response.status(200).json({
        msg: 'Post created',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async editPost(ctx: HttpContext) {
    try {
      let postId = Number(ctx.params.postId)
      let { title, body } = ctx.request.only(['title', 'body'])
      let fieldsToUpdate: Record<string, any> = {}
      if (!postId) {
        return ctx.response.status(400).json({
          msg: 'Post id not present in the params',
        })
      }

      let postExitst = await prisma.posts.findFirst({
        where: {
          id: postId,
        },
      })

      if (!postExitst) {
        return ctx.response.status(404).json({
          msg: 'No post with such id found',
        })
      }

      if (title) fieldsToUpdate.title = title
      if (body) fieldsToUpdate.body = body

      if (Object.keys(fieldsToUpdate).length === 0) {
        return ctx.response.status(400).json({
          msg: 'No changes detected to update',
        })
      }

      await prisma.posts.update({
        where: {
          id: postId,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'Post updated',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deletePost(ctx: HttpContext) {
    try {
      let postId = Number(ctx.params.postId)

      if (!postId) {
        return ctx.response.status(400).json({
          msg: 'No post id present in the params',
        })
      }

      let postExists = await prisma.posts.findFirst({
        where: {
          id: postId,
        },
      })

      if (!postExists) {
        return ctx.response.status(404).json({
          msg: 'No post with such id found',
        })
      }

      await prisma.posts.delete({
        where: {
          id: postId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Post deleted successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async likePost(ctx: HttpContext) {
    try {
      let postId = Number(ctx.params.postId)
      let email = ctx.email

      if (!postId) {
        return ctx.response.status(400).json({
          msg: 'No post id present in the params',
        })
      }

      let postExists = await prisma.posts.findFirst({
        where: {
          id: postId,
        },
      })

      if (!postExists) {
        return ctx.response.status(404).json({
          msg: 'No post with such id found',
        })
      }

      let currentUser = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      let likedPost = await prisma.user.findFirst({
        where: {
          id: currentUser?.id,
        },
        select: {
          likedPost: true,
        },
      })

      if (likedPost?.likedPost.includes(postId)) {
        await prisma.user.update({
          where: {
            id: currentUser?.id,
          },
          data: {
            likedPost: likedPost.likedPost.filter((x) => x !== postId),
          },
        })

        await prisma.posts.update({
          where: {
            id: postId,
          },
          data: {
            likes: {
              decrement: 1,
            },
          },
        })

        return ctx.response.status(200).json({
          msg: 'Post unliked',
        })
      }

      await prisma.user.update({
        where: {
          id: currentUser?.id,
        },
        data: {
          likedPost: {
            set: [...likedPost!.likedPost, postId],
          },
        },
      })

      await prisma.posts.update({
        where: {
          id: postId,
        },
        data: {
          likes: {
            increment: 1,
          },
        },
      })

      return ctx.response.status(200).json({
        msg: 'Post liked',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async commentPost(ctx: HttpContext) {
    try {
      let postId = Number(ctx.params.postId)
      let email = ctx.email

      let { comment } = ctx.request.only(['comment'])

      if (!comment) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      if (!postId) {
        return ctx.response.status(400).json({
          msg: 'Post id not present in the params',
        })
      }

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

      await prisma.comment.create({
        data: {
          comment,
          authorId: currentUser.id,
          postId: postId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Comment added successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async editComment(ctx: HttpContext) {
    try {
      let email = ctx.email
      let commentId = Number(ctx.params.commentId)
      let { comment } = ctx.request.only(['comment'])

      let currentUser = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      let fieldsToUpdate: Record<string, any> = {}

      if (comment) fieldsToUpdate.comment = comment

      if (Object.keys(fieldsToUpdate).length === 0) {
        return ctx.response.status(400).json({
          msg: 'No changes found to update',
        })
      }

      if (!commentId) {
        return ctx.response.status(400).json({
          msg: 'No comment id present in the params',
        })
      }

      let commentExists = await prisma.comment.findFirst({
        where: {
          id: commentId,
        },
      })

      if (!commentExists) {
        return ctx.response.status(404).json({
          msg: 'No such comment found',
        })
      }

      if (commentExists.authorId !== currentUser!.id) {
        return ctx.response.status(400).json({
          msg: "Cannot edit other user's comment",
        })
      }

      await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'Comment updated successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deleteComment(ctx: HttpContext) {
    try {
      let email = ctx.email
      let commentId = Number(ctx.params.commentId)

      if (!commentId) {
        return ctx.response.status(400).json({
          msg: 'No comment id present in the params',
        })
      }

      let commentExists = await prisma.comment.findFirst({
        where: {
          id: commentId,
        },
      })

      if (!commentExists) {
        return ctx.response.status(404).json({
          msg: 'No such comment found',
        })
      }

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

      if (currentUser.id !== commentExists.authorId) {
        return ctx.response.status(409).json({
          msg: "Cannot delete other user's comment",
        })
      }

      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Comment deleted successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
