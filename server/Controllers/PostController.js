import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";

// Create a new Post
export const createPost = async (req, res) => {
    const newPost = new PostModel(req.body)

    try {
        await newPost.save()
        res.status(200).json("Post Created")

    } catch (err) {
        res.status(500).json(err)
    }
}

// Get a post
export const getPost = async (req, res) => {
    const id = req.params.id
    try {
        const post = await PostModel.findById(id)
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json(err)
    }
}

// Update a post
export const updatePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body
    try {
        const post = await PostModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post Updated")
        }
        else {
            res.status(403).json("Unauthorized to update this post")
        }
    } catch (err) {
        res.status(500).json(err)
    }
}

//Delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(id)
        if (post.userId === userId) {
            await post.deleteOne();
            res.status(200).json("Post Deleted successfully")
        }
        else {
            res.status(403).json("Unauthorized to delete this post")
        }

    } catch (err) {
        res.status(500).json(err)
    }
}

// Like/Dislike a post
export const likePost = async (req, res) => {
    const id = req.params.id
    const { userId } = req.body
    try {
        const post = await PostModel.findById(id)
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("Post Liked")
        }
        else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post Unliked")
        }

    } catch (err) {
        res.status(500).json(err)
    }
}

// Get Timeline Posts
export const getTimelinePosts = async (req, res) => {
    const userId = req.params.id
    try {
        const currentUserPosts = await PostModel.find({ userId: userId })
        const followingPosts = await UserModel.aggregrate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "following",
                    foreignField: "userId",
                    as: "followingPosts"
                }
            },
            {
                $project: {
                    followingPosts: 1,
                    _id: 0
                }
            }
        ])
        res.status(200).json(currentUserPosts.concat(followingPosts))
    } catch (err) {
        res.status(500).json(err)
    }
}