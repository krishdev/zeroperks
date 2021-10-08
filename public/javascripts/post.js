import axios from 'axios';

const post = {
    data: {
        helpfulPost: document.querySelector('#helpfulPost')
    },
    initialized () {
        if (this.data.helpfulPost) {
            this.data.helpfulPost.addEventListener('click', () => {
                this.helpfulLike(window.postId);
            })
        }

        let allComments = document.querySelectorAll('[data-comment-id]');
        if (allComments) {
            allComments = Array.from(allComments);
            allComments.forEach(elm => {
                elm.addEventListener('click', () => {
                    this.helpfulLike(window.postId, elm.getAttribute('data-comment-id'));
                })
            })
        }
    },
    helpfulLike (postId, commentId) {
        axios.post('/post/like', {
            postId,
            commentId
        }).then (function (res) {
            const responseBody = res.data;
            if (responseBody && responseBody.success) {
                if (commentId) {
                    const cmtElm = document.querySelector('[data-comment-id="'+commentId+'"] span');
                    let likes = +cmtElm.getAttribute('data-like-count');
                    likes++
                    cmtElm.innerText = likes + (likes == 1 ? ' Like' : ' Likes');
                } else {
                    const postElm = document.querySelector('#helpfulPost span');
                    let likes = +postElm.getAttribute('data-like-count');
                    likes++
                    postElm.innerText = likes + (likes == 1 ? ' Like' : ' Likes');
                }
            }
        }, error => {
            console.log(error);
        })
    }
}

post.initialized();