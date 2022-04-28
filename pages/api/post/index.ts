import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

export default async function handle(req, res) {
  //create.tsxから送信された情報を定義する
  const { title, content } = req.body;

  //サーバーサイドでgetSessionメソッドを呼び出し、認証されたユーザーからのリクエストか確認する
  const session = await getSession({ req });
  //定義したtitleとcontentをもとにpostを新規作成する
  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: {
        connect: {
          email: session?.user?.email,
        },
      },
    },
  });
  res.json(result);
}
