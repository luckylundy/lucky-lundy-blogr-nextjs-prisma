import prisma from "../../../lib/prisma";

// PUT /api/publish/:id
//drafts.tsxから個別のpostに遷移するときの処理
export default async function handle(req, res) {
  const postId = req.query.id;
  const post = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      published: true,
    },
  });
  res.json(post);
}
