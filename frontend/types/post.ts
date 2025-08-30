//this is used to define the shape of the post object

export interface Post {
  id: string
  content: string
  imageUrl?: string
  authorId: string
  isOP?: boolean
  upvotes: number
  downvotes: number
  createdAt: Date
  updatedAt: Date
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  authorId: string
  postId: string
  isOP: boolean
  commenterTag?: 'OP' | '#1' | '#2' | null
  createdAt: Date
  upvotes: number
  downvotes: number
}

export interface UserVote {
  userId: string
  postId?: string
  commentId?: string
  voteType: 'upvote' | 'downvote'
}