import axios from 'axios';

const credentials = {
    data: {
        login: document.querySelector('#signin-btn'),
        register: document.querySelector('#signup-btn'),
        comment: document.querySelector('#comment-btn'),
        errorClass: 'o-Error',
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
            const emailRequired = !form.email.value.trim();
            const emailInvalid = !regex.email.test(form.email.value);
            const $emailRequired = form.email.parentElement.querySelector('.o-Form__error .required');
            const $emailInvalid =  form.email.parentElement.querySelector('.o-Form__error .email');
            if (emailRequired || emailInvalid) {
                invalid = true;
                if (emailRequired) {
                    $emailRequired.classList.add(credentials.data.errorClass);
                } else {
                    $emailRequired.classList.remove(credentials.data.errorClass);
                }
                
                if (!emailRequired && emailInvalid) {
                    $emailInvalid.classList.add(credentials.data.errorClass);
                } else {
                    $emailInvalid.classList.remove(credentials.data.errorClass);
                }
            } else  {
                $emailRequired.classList.remove(credentials.data.errorClass);
                $emailInvalid.classList.remove(credentials.data.errorClass);
            }

            const passwordRequired = !form.password.value.trim();
            const $passwordRequired = form.password.parentElement.querySelector('.o-Form__error .required');
            if (passwordRequired) {
                invalid = true;
                $passwordRequired.classList.add(credentials.data.errorClass);
            } else  {
                $passwordRequired.classList.remove(credentials.data.errorClass);
            }
            if (!invalid) {
                document.querySelector('#loginForm').submit();
            }
        },
        register () {
            credentials.data.formSubmitting = true;
            var regex = {
                email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                username: /^[(\w\s)]+$/g
            };
            var invalid = false;
            var form = document.forms.registerForm;
            const usernameRequired = !form.username.value.trim();
            const usernameInvalid = !regex.username.test(form.username.value) || form.username.value.trim().length < 3;
            const $usernameRequired = form.username.parentElement.querySelector('.o-Form__error .required');
            const $usernameInvalid =  form.username.parentElement.querySelector('.o-Form__error .username');
            if (usernameRequired || usernameInvalid) {
                invalid = true;
                if (usernameRequired) {
                    $usernameRequired.classList.add(credentials.data.errorClass);
                } else {
                    $usernameRequired.classList.remove(credentials.data.errorClass);
                }
                
                if (!usernameRequired && usernameInvalid) {
                    $usernameInvalid.classList.add(credentials.data.errorClass);
                } else {
                    $usernameInvalid.classList.remove(credentials.data.errorClass);
                }
            } else  {
                $usernameRequired.classList.remove(credentials.data.errorClass);
                $usernameInvalid.classList.remove(credentials.data.errorClass);
            }

            const emailRequired = !form.email.value.trim();
            const emailInvalid = !regex.email.test(form.email.value);
            const $emailRequired = form.email.parentElement.querySelector('.o-Form__error .required');
            const $emailInvalid =  form.email.parentElement.querySelector('.o-Form__error .email');
            if (emailRequired || emailInvalid) {
                invalid = true;
                if (emailRequired) {
                    $emailRequired.classList.add(credentials.data.errorClass);
                } else {
                    $emailRequired.classList.remove(credentials.data.errorClass);
                }
                
                if (!emailRequired && emailInvalid) {
                    $emailInvalid.classList.add(credentials.data.errorClass);
                } else {
                    $emailInvalid.classList.remove(credentials.data.errorClass);
                }
            } else  {
                $emailRequired.classList.remove(credentials.data.errorClass);
                $emailInvalid.classList.remove(credentials.data.errorClass);
            }

            const passwordRequired = !form.password.value.trim();
            const passwordInvalid = !regex.password.test(form.password.value);
            const $passwordRequired = form.password.parentElement.querySelector('.o-Form__error .required');
            const $passwordInvalid =  form.password.parentElement.querySelector('.o-Form__error .password');
            if (passwordRequired || passwordInvalid) {
                invalid = true;
                if (passwordRequired) {
                    $passwordRequired.classList.add(credentials.data.errorClass);
                } else {
                    $passwordRequired.classList.remove(credentials.data.errorClass);
                }
                
                if (!passwordRequired && passwordInvalid) {
                    $passwordInvalid.classList.add(credentials.data.errorClass);
                } else {
                    $passwordInvalid.classList.remove(credentials.data.errorClass);
                }
            } else  {
                $passwordRequired.classList.remove(credentials.data.errorClass);
                $passwordInvalid.classList.remove(credentials.data.errorClass);
            }

            const confirmPasswordRequired = !form.confirmPassword.value.trim();
            const confirmPasswordInvalid = form.password.value !== form.confirmPassword.value;
            const $confirmPasswordRequired = form.confirmPassword.parentElement.querySelector('.o-Form__error .required');
            const $confirmPasswordInvalid =  form.confirmPassword.parentElement.querySelector('.o-Form__error .confirmPassword');
            if (confirmPasswordRequired || confirmPasswordInvalid) {
                invalid = true;
                if (confirmPasswordRequired) {
                    $confirmPasswordRequired.classList.add(credentials.data.errorClass);
                } else {
                    $confirmPasswordRequired.classList.remove(credentials.data.errorClass);
                }
                
                if (!confirmPasswordRequired && confirmPasswordInvalid) {
                    $confirmPasswordInvalid.classList.add(credentials.data.errorClass);
                } else {
                    $confirmPasswordInvalid.classList.remove(credentials.data.errorClass);
                }
            } else  {
                $confirmPasswordRequired.classList.remove(credentials.data.errorClass);
                $confirmPasswordInvalid.classList.remove(credentials.data.errorClass);
            }
            if (!invalid) {
                document.querySelector('#registerForm').submit();
            }
        },
        comment () {
            credentials.data.formSubmitting = true;
            
            var invalid = false;
            var form = document.querySelector('#commentTxt');
            const $cmtError = document.querySelector('#commentTxt').nextElementSibling.querySelector('.required');
            if (!form.value.trim()) {
                invalid = true;
                $cmtError.classList.add(credentials.data.errorClass);
            } else {
                $cmtError.classList.remove(credentials.data.errorClass);
            }
            if (!invalid) {
                axios.post('/post/comment', {
                    comment: form.value,
                    postId: window.postId
                }).then(function (res) {
                    if(res.data.success) {
                        window.location.reload();
                    }
                }, error => {
                    console.log(error.body);
                })
            }
        },
    }
};

credentials.initialized();