"use client";

import { useState } from "react";
import { CommentComposer } from "@/features/community/components/CommentComposer";
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

  return (
    <article className="border-b border-[var(--border)] py-5 last:border-b-0">
      <div className="flex gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-800 text-sm font-black">
          {(profile?.display_name ?? "P").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-black">{profile?.display_name ?? "Penonton"}</span>
            <span className="text-xs text-zinc-500">{relativeTime(comment.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{comment.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs font-bold text-zinc-400">
            <button onClick={() => onLike(comment.id)} disabled={!currentUserId} className="min-h-10 rounded-xl px-2 hover:text-white disabled:opacity-40">
              {liked.has(comment.id) ? "♥" : "♡"} {comment.like_count}
            </button>
            {currentUserId && (
              <button onClick={() => setReplying((value) => !value)} className="min-h-10 rounded-xl px-2 hover:text-white">Balas</button>
            )}
            {own ? (
              <button onClick={() => onDelete(comment.id)} className="min-h-10 rounded-xl px-2 text-red-300 hover:text-red-200">Hapus</button>
            ) : currentUserId ? (
              <button onClick={() => onReport(comment.id)} className="min-h-10 rounded-xl px-2 hover:text-white">Laporkan</button>
            ) : null}
          </div>
          {replying && (
            <div className="mt-3">
              <CommentComposer
                placeholder={`Balas ${profile?.display_name ?? "komentar"}...`}
                submitLabel="Balas"
                onCancel={() => setReplying(false)}
                onSubmit={async (body) => { await onReply(comment.id, body); setReplying(false); }}
              />
            </div>
          )}
          {replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l border-zinc-800 pl-4">
              {replies.map((reply) => {
                const replyProfile = profiles.get(reply.user_id);
                const replyOwn = currentUserId === reply.user_id;
                return (
                  <div key={reply.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{replyProfile?.display_name ?? "Penonton"}</span>
                      <span className="text-xs text-zinc-500">{relativeTime(reply.created_at)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{reply.body}</p>
                    <div className="mt-1 flex gap-1 text-xs font-bold text-zinc-500">
                      <button onClick={() => onLike(reply.id)} disabled={!currentUserId} className="min-h-9 px-2 disabled:opacity-40">{liked.has(reply.id) ? "♥" : "♡"} {reply.like_count}</button>
                      {replyOwn && <button onClick={() => onDelete(reply.id)} className="min-h-9 px-2 text-red-300">Hapus</button>}
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
