import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Get posts (with optional circle filter)
router.get('/', (req, res) => {
  const { circle } = req.query;
  let posts = db.getPosts();
  if (circle && circle !== 'all') {
    posts = posts.filter(p => p.circle === circle || p.userId === req.user.id);
  }
  res.json({ posts });
});

// Create post with circle selection
router.post('/', (req, res) => {
  const { content, imageUrl, circle } = req.body;

  if (!content && !imageUrl) {
    return res.status(400).json({ error: 'محتوى المنشور لا يمكن أن يكون فارغاً' });
  }

  const newPost = {
    id: uuidv4(),
    userId: req.user.id,
    authorName: `${req.user.firstName} ${req.user.lastName}`,
    authorAvatar: req.user.avatar,
    content: content || '',
    imageUrl: imageUrl || null,
    circle: circle || 'public', // 'public', 'close_friends', 'family'
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  db.createPost(newPost);
  res.status(201).json({ post: newPost });
});

router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const post = db.likePost(id, req.user.id);
  if (!post) {
    return res.status(404).json({ error: 'المنشور غير موجود' });
  }
  res.json({ post });
});

router.post('/:id/comment', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'محتوى التعليق مطلوب' });
  }

  const comment = {
    id: uuidv4(),
    userId: req.user.id,
    authorName: `${req.user.firstName} ${req.user.lastName}`,
    authorAvatar: req.user.avatar,
    content,
    createdAt: new Date().toISOString(),
  };

  const post = db.addComment(id, comment);
  if (!post) {
    return res.status(404).json({ error: 'المنشور غير موجود' });
  }
  res.status(201).json({ post, comment });
});

export default router;
