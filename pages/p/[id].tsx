import React from "react";
import { GetServerSideProps } from "next";
import ReactMarkdown from "react-markdown";
import Router from "next/router";
import Layout from "../../components/Layout";
import { PostProps } from "../../components/Post";
import { useSession } from "next-auth/react";
import prisma from "../../lib/prisma";

//特定の投稿を取得する(idがparamsのidで、postのauthorのnameとemailがあるもの)
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
  return {
    props: post,
  };
};
//投稿を更新する
async function publishPost(id: string): Promise<void> {
  await fetch(`/api/publish/${id}`, {
    method: "PUT",
  });
  await Router.push("/");
}
//投稿を削除する
async function deletePost(id: string): Promise<void> {
  await fetch(`/api/post/${id}`, { method: "DELETE" });
  Router.push("/");
}

const Post: React.FC<PostProps> = (props) => {
  //useSession()で認証確認
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Authentication ...</div>;
  }
  //ユーザーのセッション認証を確認
  const userHasValidSession = Boolean(session);
  //サーバーで確認したユーザーのアドレスとpropsとして渡された投稿のauthorのアドレスが同一であれば
  //サーバーで確認したユーザーのアドレスをpostBelongsToUserに代入
  const postBelongsToUser = session?.user?.email === props.author?.email;
  let title = props.title;
  if (!props.published) {
    title = `${title} (Draft)`;
  }

  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {props?.author?.name || "Unknown author"}</p>
        <ReactMarkdown children={props.content} />
        {/* 投稿が公開されていなければ次へ→ユーザー認証があれば次へ→投稿とユーザーが紐づいていれば次へ→ボタン処理 */}
        {!props.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(props.id)}>Publish</button>
        )}
        {userHasValidSession && postBelongsToUser && (
          <button onClick={() => deletePost(props.id)}>Delete</button>
        )}
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Post;
