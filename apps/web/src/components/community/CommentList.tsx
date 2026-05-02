import { motion } from "framer-motion";
import { Comment } from "../../services/commentService";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  contentId?: string;
}

export function CommentList({ comments, contentId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sand/70">No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {comments.map((comment, index) => (
        <CommentItem key={comment._id || comment.id} comment={comment} index={index} contentId={contentId} />
      ))}
    </motion.div>
  );
}
