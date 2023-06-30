const { getDownloadURL } = require('firebase/storage');
const User = require('../models/users.model');
const AppError = require('../utils/appError');

class PostService {
  async findPost(id) {
    try {
      const post = await Post.findOne({
        where: {
          id,
          status: 'active',
        },
        attributes: {
          exclude: ['userId', 'status'],
        },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'profileImgUrl', 'description'],
          },
          {
            model: PostImg,
          },
        ],
      });
      if (!post) {
        throw new AppError(`post with id: ${id} not found`);
      }
      //!busque un post por el id, con status active
      //*incluir el modelo de User, PostImg
      //?validar que si no existe enviar un error y si existe lo retorna
    } catch (error) {
      throw new Error(error);
    }
  }
  async downloadImgsPost(post) {
    try {
      const imgRefUserProfile = ref(storage, post.user.profileImgUrl);
      const urlProfileUser = await getDownloadURL(imgRefUserProfile);

      post.user.profileImgUrl = urlProfileUser;

      const postImgsPromises = post.postImgs.map(async (postImg) => {
        const imgRef = ref(storage, postImg.postImgUrl);
        const url = await getDownloadURL(imgRef);

        postImg.postImgUrl = url;
        return postImg;
      });

      await Promise.all(postImgsPromises);

      return post;
    } catch (error) {
      throw new Error(error);
    }
  }
}
module.exports = PostService;
