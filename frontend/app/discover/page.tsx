//this is the page that displays all of the posts

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ArrowUpIcon as ArrowUpSolid, ArrowDownIcon as ArrowDownSolid } from '@heroicons/react/24/solid'
import FadeContent from '../components/FadeContent'
import AnimatedContent from '../components/AnimatedContent'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, getDoc, setDoc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore'
import { Post, Comment, UserVote } from '../../types/post'

export default function DiscoverPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'upvote' | 'downvote' }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // connecting to firebase posts
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData: Post[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          content: data.content || '',
          imageUrl: data.imageUrl || null,
          authorId: data.authorId || '',
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          comments: [] // initialize as empty, will load when comments are expanded
        }
      })

      setPosts(postsData)
      setLoading(false)
    })

    loadUserVotes()

    return () => unsubscribe()
  }, [user, router])

  const loadUserVotes = async () => {
    if (!user) return

    try {
      // loading posts from firebase
      const votesQuery = query(collection(db, 'votes'))
      onSnapshot(votesQuery, (snapshot) => {
        const votes: { [key: string]: 'upvote' | 'downvote' } = {}
        snapshot.docs.forEach(doc => {
          const vote = doc.data()
          if (vote.userId === user.uid) {
            const key = vote.postId ? `post-${vote.postId}` : `comment-${vote.commentId}`
            votes[key] = vote.voteType
          }
        })
        setUserVotes(votes)
      })
    } catch (error) {
      console.error('Error loading user votes:', error)
    }
  }

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return

    const voteKey = `post-${postId}`
    const currentVote = userVotes[voteKey]
    
    try {
      const postRef = doc(db, 'posts', postId)
      const voteRef = doc(db, 'votes', `${user.uid}-post-${postId}`)

      if (currentVote === voteType) {
        // remove vote
        await deleteDoc(voteRef)
        await updateDoc(postRef, {
          [voteType === 'upvote' ? 'upvotes' : 'downvotes']: increment(-1)
        })
      } else {
        // add or change vote
        if (currentVote) {
          // change vote - remove old and add new
          await updateDoc(postRef, {
            [currentVote === 'upvote' ? 'upvotes' : 'downvotes']: increment(-1),
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: increment(1)
          })
        } else {
          // new vote
          await updateDoc(postRef, {
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: increment(1)
          })
        }

        await setDoc(voteRef, {
          userId: user.uid,
          postId,
          voteType
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const toggleComments = async (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
    
    // loading comments
    if (!showComments[postId]) {
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          orderBy('createdAt', 'asc')
        )
        
        onSnapshot(commentsQuery, (snapshot) => {
          const allComments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          })) as any[]
          
          const postComments = allComments.filter(comment => comment.postId === postId)
          
          // update the specific post with its comments
          setPosts(prevPosts => {
            return prevPosts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  comments: postComments as Comment[]
                }
              }
              return post
            })
          })
        })
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return

    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const existingCommenters = new Set(post.comments.map(c => c.authorId))
      let commenterTag: 'OP' | '#1' | '#2' | null = null
      
      if (user.uid === post.authorId) {
        commenterTag = 'OP'
      } else if (!existingCommenters.has(user.uid)) {
        const uniqueCommenters = Array.from(existingCommenters).filter(id => id !== post.authorId)
        if (uniqueCommenters.length === 0) {
          commenterTag = '#1'
        } else if (uniqueCommenters.length === 1) {
          commenterTag = '#2'
        }
      }

      const commentData = {
        content: newComment[postId].trim(),
        authorId: user.uid,
        postId,
        isOP: user.uid === post.authorId,
        commenterTag,
        createdAt: Timestamp.now(),
        upvotes: 0,
        downvotes: 0
      }

      await addDoc(collection(db, 'comments'), commentData)
      setNewComment(prev => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const getPostHeight = (post: Post) => {
    const baseHeight = 200
    const contentHeight = Math.max(100, post.content.length * 0.8)
    const imageHeight = post.imageUrl ? 150 : 0
    const commentsHeight = showComments[post.id] ? post.comments.length * 40 : 0
    return Math.min(600, baseHeight + contentHeight + imageHeight + commentsHeight)
  }

  const sortedPosts = [...posts].sort((a, b) => {
    const aScore = (a.upvotes - a.downvotes)
    const bScore = (b.upvotes - b.downvotes)
    const aTime = a.createdAt.getTime()
    const bTime = b.createdAt.getTime()
    
    // combine score and recency for sorting the posts (newer posts get bonus)
    const aFinalScore = aScore + (aTime / 1000000000)
    const bFinalScore = bScore + (bTime / 1000000000)
    
    return bFinalScore - aFinalScore
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading posts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-gray-900 border-r border-gray-800 z-50 flex flex-col items-center py-4">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push('/discover')}
            className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
            title="Discover"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </button>
          <button
            onClick={() => router.push('/create')}
            className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
            title="Create Post"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* main content */}
      <main className="ml-16 p-6">
        <FadeContent delay={200}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Posts</h1>
            <p className="text-gray-400">Anonymous posts and thoughts from Penn students</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-xl animate-pulse"
                  style={{ height: `${250 + Math.floor(Math.random() * 150)}px` }}
                >
                  <div className="w-full h-full bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedPosts.map((post) => {
                const upvoteKey = `post-${post.id}`
                const userUpvoted = userVotes[upvoteKey] === 'upvote'
                const userDownvoted = userVotes[upvoteKey] === 'downvote'
                const netScore = post.upvotes - post.downvotes

                return (
                  <AnimatedContent key={post.id} animation="slideUp" delay={100}>
                    <div
                      className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition-all duration-300 border border-gray-700 hover:border-gray-600"
                      style={{ height: `${getPostHeight(post)}px` }}
                    >
                      {/* post content */}
                      <div className="mb-4">
                        <p className="text-white text-sm leading-relaxed">
                          {post.content}
                        </p>
                        {post.imageUrl && (
                          <div className="mt-3">
                            <img
                              src={post.imageUrl}
                              alt="Post image"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* vote and comments */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(post.id, 'upvote')}
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              userUpvoted
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                          >
                            {userUpvoted ? (
                              <ArrowUpSolid className="w-4 h-4" />
                            ) : (
                              <ArrowUpIcon className="w-4 h-4" />
                            )}
                            <span className="text-xs">{post.upvotes}</span>
                          </button>
                          
                          <span className={`text-sm font-medium ${
                            netScore > 0 ? 'text-green-400' : 
                            netScore < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {netScore > 0 ? '+' : ''}{netScore}
                          </span>

                          <button
                            onClick={() => handleVote(post.id, 'downvote')}
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              userDownvoted
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                          >
                            {userDownvoted ? (
                              <ArrowDownSolid className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )}
                            <span className="text-xs">{post.downvotes}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* comments */}
                      {showComments[post.id] && (
                        <div className="mt-4 border-t border-gray-700 pt-4 space-y-2">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-800 rounded-lg p-2">
                              <div className="flex items-center gap-2 mb-1">
                                {comment.commenterTag && (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    comment.commenterTag === 'OP' ? 'bg-blue-600 text-white' :
                                    comment.commenterTag === '#1' ? 'bg-green-600 text-white' :
                                    'bg-orange-600 text-white'
                                  }`}>
                                    {comment.commenterTag}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt))}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{comment.content}</p>
                            </div>
                          ))}
                          
                          {/* adding comment */}
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              className="flex-1 bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedContent>
                )
              })}
            </div>
          )}
        </FadeContent>
      </main>
    </div>
  )
}