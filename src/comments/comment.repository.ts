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

  async getComments(postId: number): Promise<any[]> {
    const commentInfo = await this.manager.query(
      `SELECT id FROM comment WHERE "postId" = $1`,
      [postId],
    );
    const ids = commentInfo.map((info) => info.id);
    const query = this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .whereInIds(ids);
    const comments = await query.getMany();

    return comments.map((comment) => ({
      ...comment,
      user: comment.user?.username,
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
}
