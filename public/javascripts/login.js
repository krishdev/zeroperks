import axios from 'axios';

const credentials = {
    data: {
        login: document.querySelector('#signin-btn'),
        register: document.querySelector('#signup-btn'),
        comment: document.querySelector('#comment-btn'),
        errorClass: ['border', 'border-danger', 'border-2'],
        formSubmitting: false
    },
    initialized () {
        var self = this;
        if (this.data.login) {
            this.data.login.addEventListener('click', function () {
                self.methods.login();
            })
        }
        if (this.data.register) {
            this.data.register.addEventListener('click', function () {
                self.methods.register();
            })
        }
        if (this.data.comment) {
            this.data.comment.addEventListener('click', function () {
                self.methods.comment();
            })
        }
    },
    methods: {
        login () {
            credentials.data.formSubmitting = true;
            
            var invalid = false;
            var form = document.forms.loginForm;
            var regex = {
                email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
            };
           
            if (!form.email.value.trim() || !regex.email.test(form.email.value)) {
                invalid = true;
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.email.classList.add(error);
                }
            } else if (form.email.classList.contains('border-danger')) {
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.email.classList.remove(error);
                }
            }

            if (!form.password.value.trim()) {
                invalid = true;
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.password.classList.add(error);
                }
            } else if (form.password.classList.contains('border-danger')) {
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.password.classList.remove(error);
                }
            }
            if (!invalid) {
                document.querySelector('#loginForm').submit();
            }
        },
        register () {
            credentials.data.formSubmitting = true;
            var regex = {
                email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
            };
            var invalid = false;
            var form = document.forms.registerForm;
            if (!form.username.value.trim()) {
                invalid = true;
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.username.classList.add(error);
                }
            } else if (form.username.classList.contains('border-danger')) {
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.username.classList.remove(error);
                }
            }

            if (!form.email.value.trim() || !regex.email.test(form.email.value)) {
                invalid = true;
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.email.classList.add(error);
                }
            } else if (form.email.classList.contains('border-danger')) {
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.email.classList.remove(error);
                }
            }

            if (!form.password.value.trim() || !regex.password.test(form.password.value)) {
                invalid = true;
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.password.classList.add(error);
                }
            } else if (form.password.classList.contains('border-danger')) {
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.password.classList.remove(error);
                }
            }

            if (!form.confirmPassword.value.trim() || form.password.value !== form.confirmPassword.value) {
                invalid = true;
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.confirmPassword.classList.add(error);
                }
            } else if (form.confirmPassword.classList.contains('border-danger')) {
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.confirmPassword.classList.remove(error);
                }
            }
            if (!invalid) {
                document.querySelector('#registerForm').submit();
            }
        },
        comment () {
            credentials.data.formSubmitting = true;
            
            var invalid = false;
            var form = document.querySelector('#commentTxt');
                       
            if (!form.value.trim()) {
                invalid = true;
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.classList.add(error);
                }
            } else if (form.classList.contains('border-danger')) {
                for (let i = 0; i < credentials.data.errorClass.length; i++) {
                    const error = credentials.data.errorClass[i];
                    form.classList.remove(error);
                }
            }
            if (!invalid) {
                axios.post('/acl/comment', {
                    comment: form.value,
                    postId: window.postId
                }).then(function (res) {
                    if(res.data.success) {
                        window.location.reload();
                    }
                })
            }
        },
    }
};

credentials.initialized();