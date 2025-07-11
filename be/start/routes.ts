import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import PostsController from '#controllers/posts_controller'

// user endpoints
router.post('/api/signup', (ctx) => new UsersController().registerUser(ctx))
router.post('/api/login', (ctx) => new UsersController().loginUser(ctx))
router
  .patch('/api/update-user', (ctx) => new UsersController().editUser(ctx))
  .use(middleware.user())
router
  .delete('/api/delete/:userId', (ctx) => new UsersController().deleteUser(ctx))
  .use(middleware.user())
router.get('/api/profile', (ctx) => new UsersController().getDetails(ctx)).use(middleware.user())

// friend request endpoints
router
  .post('/api/search-user', (ctx) => new UsersController().searchUsers(ctx))
  .use(middleware.user())
router
  .post('/api/add-friend/:friendId', (ctx) => new UsersController().addFriend(ctx))
  .use(middleware.user())
router
  .delete('/api/delete-request/:senderId/:receiverId', (ctx) =>
    new UsersController().cancelFriendRequest(ctx)
  )
  .use(middleware.user())
router
  .patch('/api/accept-request/:requestId', (ctx) => new UsersController().acceptFriendRequest(ctx))
  .use(middleware.user())
router
  .get('/api/view-friends', (ctx) => new UsersController().viewFriends(ctx))
  .use(middleware.user())

// post endpoints
router.post('/api/add-post', (ctx) => new PostsController().makePost(ctx)).use(middleware.user())
router
  .patch('/api/update-post/:postId', (ctx) => new PostsController().editPost(ctx))
  .use(middleware.user())
router
  .delete('/api/delete-post/:postId', (ctx) => new PostsController().deletePost(ctx))
  .use(middleware.user())
router
  .patch('/api/like-post/:postId', (ctx) => new PostsController().likePost(ctx))
  .use(middleware.user())
router
  .post('/api/post/:postId/comment', (ctx) => new PostsController().commentPost(ctx))
  .use(middleware.user())
router
  .patch('/api/post/comment/:commentId', (ctx) => new PostsController().editComment(ctx))
  .use(middleware.user())
router
  .delete('/api/post/comment/delete/:commentId', (ctx) => new PostsController().deleteComment(ctx))
  .use(middleware.user())
