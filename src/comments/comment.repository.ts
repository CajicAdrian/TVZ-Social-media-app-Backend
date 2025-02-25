import { User } from 'src/auth/user.entity';
import { PostRepository } from 'src/posts/post.repository';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  constructor(private postRepository: PostRepository) {
    super();
  }

  async getComments(postId: number, user: User): Promise<any[]> {
    const commentInfo = await this.manager.query(
      `SELECT id FROM comment WHERE "postId" = $1`,
      [postId],
    );
    const ids = commentInfo.map((info) => info.id);

    const query = this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likedUser')
      .whereInIds(ids);

    const comments = await query.getMany();

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user
        ? { id: comment.user.id, name: comment.user.username }
        : null,
      likeCount: comment.likeCount(),
      isLikedByUser: comment.isLikedByUser(user),
    }));
  }

  async createComment(
    createCommentDto: CreateCommentDto,
    post: Post,
    user: User,
  ): Promise<Comment> {
    const { content } = createCommentDto;
    const comment = new Comment();
    comment.content = content;
    comment.user = user;
    comment.post = post;

    await comment.save();

    delete comment.user;
    delete comment.post;

    return comment;
  }

  async getCommentById(commentId: number): Promise<Comment | null> {
    return this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user') // ✅ Ensure user is included
      .leftJoinAndSelect('comment.likes', 'likes') // ✅ Include likes
      .where('comment.id = :commentId', { commentId })
      .getOne();
  }
}
