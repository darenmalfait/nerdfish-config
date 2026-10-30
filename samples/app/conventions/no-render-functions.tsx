import type * as React from 'react'

type Comment = { id: string; body: string }

type CommentItemProps = { comment: Comment }

function CommentItem({ comment }: CommentItemProps) {
	return <li>{comment.body}</li>
}

type DiscussionProps = {
	comments: Comment[]
	renderEmpty: () => React.ReactNode
}

export function Discussion({ comments, renderEmpty }: DiscussionProps) {
	if (comments.length === 0) {
		return renderEmpty()
	}

	return (
		<ul>
			{comments.map((comment) => (
				<CommentItem key={comment.id} comment={comment} />
			))}
		</ul>
	)
}
