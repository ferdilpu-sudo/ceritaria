"use client";

import Link from "next/link";
import { useState } from "react";
import { CommentComposer } from "@/features/community/components/CommentComposer";
import { CommunityAvatar } from "@/features/community/components/CommunityAvatar";
import type { CommunityComment, CommunityProfile } from "@/features/community/types/community";

interface Props {
  comment: CommunityComment;
  profile?: CommunityProfile;
  replies: CommunityComment[];
  profiles: Map<string, CommunityProfile>;
  currentUserId: string | null;
  liked: Set<string>;
  onReply: (parentId: string, body: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReport: (commentId: string) => Promise<void>;
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam`;
  return `${Math.floor(hours / 24)} hari`;
}

export function CommentItem({ comment, profile, replies, profiles, currentUserId, liked, onReply, onLike, onDelete, onReport }: Props) {
  const [replying, setReplying] = useState(false);
  const own = currentUserId === comment.user_id;
  const name = profile?.display_name ?? "Penonton";

  return (
    <article className="border-b border-[var(--border)] py-5 last:border-b-0">
      <div className="flex gap-3">
        <Link href={`/u/${comment.user_id}`} aria-label={`Lihat profil ${name}`} className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
          <CommunityAvatar name={name} avatarUrl={profile?.avatar_url} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/u/${comment.user_id}`} className="font-black hover:text-red-300">{name}</Link>
            <span className="text-xs text-zinc-500">{relativeTime(comment.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{comment.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs font-bold text-zinc-400">
            <button onClick={() => onLike(comment.id)} disabled={!currentUserId} className="min-h-10 rounded-xl px-2 hover:text-white disabled:opacity-40">
              {liked.has(comment.id) ? "♥" : "♡"} {comment.like_count}
            </button>
            {currentUserId && <button onClick={() => setReplying((value) => !value)} className="min-h-10 rounded-xl px-2 hover:text-white">Balas</button>}
            {own ? (
              <button onClick={() => onDelete(comment.id)} className="min-h-10 rounded-xl px-2 text-red-300 hover:text-red-200">Hapus</button>
            ) : currentUserId ? (
              <button onClick={() => onReport(comment.id)} className="min-h-10 rounded-xl px-2 hover:text-white">Laporkan</button>
            ) : null}
          </div>
          {replying && (
            <div className="mt-3">
              <CommentComposer placeholder={`Balas ${name}...`} submitLabel="Balas" onCancel={() => setReplying(false)} onSubmit={async (body) => { await onReply(comment.id, body); setReplying(false); }} />
            </div>
          )}
          {replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l border-zinc-800 pl-4">
              {replies.map((reply) => {
                const replyProfile = profiles.get(reply.user_id);
                const replyOwn = currentUserId === reply.user_id;
                const replyName = replyProfile?.display_name ?? "Penonton";
                return (
                  <div key={reply.id} className="flex gap-2.5">
                    <Link href={`/u/${reply.user_id}`} className="shrink-0 rounded-full"><CommunityAvatar name={replyName} avatarUrl={replyProfile?.avatar_url} size="sm" /></Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><Link href={`/u/${reply.user_id}`} className="text-sm font-black hover:text-red-300">{replyName}</Link><span className="text-xs text-zinc-500">{relativeTime(reply.created_at)}</span></div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{reply.body}</p>
                      <div className="mt-1 flex gap-1 text-xs font-bold text-zinc-500">
                        <button onClick={() => onLike(reply.id)} disabled={!currentUserId} className="min-h-9 px-2 disabled:opacity-40">{liked.has(reply.id) ? "♥" : "♡"} {reply.like_count}</button>
                        {replyOwn && <button onClick={() => onDelete(reply.id)} className="min-h-9 px-2 text-red-300">Hapus</button>}
                        {!replyOwn && currentUserId && <button onClick={() => onReport(reply.id)} className="min-h-9 px-2">Laporkan</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
