const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureGuest} = require('../helper/auth');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');

// Stories Index
router.get('/', (req, res) => {
    Story.find({status: 'public'})
        .populate('user')
        .sort({date: 'desc'})
        .then(stories => {
            res.render('stories/index', {
                stories: stories
            });
        });
})

// Add Story
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
})

// Edit Story
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
    .then(story => {


        if (story.user != req.user.id) {
            res.redirect('/stories');
        } else {
            res.render('stories/edit', {
                story: story
            })
        }
    })
})

// List stories from a user

router.get('/user/:userId', (req, res) => {
    Story.find({user: req.params.userId, status: 'public'})
        .populate('user')
        .then(stories => {
            res.render('stories/index', {
                stories: stories
            });
        });
})

// List logged in user stories
router.get('/my', ensureAuthenticated, (req, res) => {
    Story.find({user: req.user.id})
        .populate('user')
        .then(stories => {
            res.render('stories/index', {
                stories: stories
            });
        });
})

// Edit Story
router.put('/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
    .then(story => {
        
        var newStory = getStory(req);

        story.title = newStory.title;
        story.body = newStory.body;
        story.status = newStory.status;
        story.allowComments = newStory.allowComments;

        story.save()
            .then(story => {
                res.redirect('/dashboard');
            })
    })
})

// Delete
router.delete('/:id', (req, res) => {
    Story.deleteOne({_id: req.params.id})
        .then(() => {
            res.redirect('/dashboard');
        });
})

// Process Add Story
router.post('/', (req, res) => {

    const newStory = getStory(req);

    // Create Story

    new Story(newStory)
        .save()
        .then(story => {
            res.redirect(`/stories/show/${story._id}`)
        })

})

// Show single story
router.get('/show/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
    .populate('user')
    // .populate('comments.commentUser')
    .then(story => {
        if (story.status == 'public') {
            res.render('stories/show', {
                story: story
            });
        } else {
            if (req.user) {
                if (req.user.id == story.user._id) {
                    res.render('stories/show', {
                        story: story
                    })
                } else {
                    console.log('Boot out');
                    res.redirect('/stories');
                }
            } else {
                res.redirect('/stories');
            }
        }
    })
    .catch(err => {
        console.log(err);
    })
})

// Add comment
router.post('/comment/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
    .then(story => {
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user.id
        }

        // Push to comments array
        story.comments.unshift(newComment);

        story.save()
            .then(story => {
                res.redirect(`/stories/show/${story.id}`);
            });

    })
})

function getStory(req) {

    let allowComments;

    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }

    const newStory = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user.id
    }

    return newStory;

}

module.exports = router;