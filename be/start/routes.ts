import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

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
