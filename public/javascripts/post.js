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
        
        if (!window.lIn) {
            this.triggerGoogleOneTap();
        } else {
            console.error('Google One Tap is not available.');
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
                    cmtElm.setAttribute('data-like-count', likes);
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
    },
    triggerGoogleOneTap () {
        axios.post('/post/get-client').then(res => {
            try {
                setTimeout(() => {
                    google.accounts.id.initialize({
                        client_id: res.data.clientId,
                        callback: this.handleCredentialResponse.bind(this),
                        auto_select: false,
                        cancel_on_tap_outside: false
                    });
                    google.accounts.id.prompt();
                }, 1500);
            } catch (error) {
                console.error('Google One Tap initialization failed:', error);
            }
        });
    },
    handleCredentialResponse(response) {
        axios.post('/post/auth/google-one-tap', {
            credential: response.credential
        }).then(res => {
            if (res.data.success) {
                window.location.reload();
            }
        });
    }
}

post.initialized();