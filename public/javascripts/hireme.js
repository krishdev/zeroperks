import axios from 'axios';

const hire = {
    form: document.querySelector('#contactForm'),
    data: {
        contactBtn: document.querySelector('#contactMe'),
        resendBtn: document.querySelector('#resend'),
        resendMess: document.querySelector('#resendMessage'),
        errorClass: 'o-Error',
        formSubmitting: false,
        success: false,
    },
    initialized () {
        this.data.contactBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        this.data.resendBtn.addEventListener('click', () => {
            this.resendMessage();
        })
    },
    sendMessage () {
        let invalid = false;
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        const nameRequired = !this.form.name.value.trim();
        const $nameRequired = this.form.name.parentElement.querySelector('.o-Form__error .required');
        if (nameRequired) {
            invalid = true;
            $nameRequired.classList.add(this.data.errorClass);
        } else {
            $nameRequired.classList.remove(this.data.errorClass);
        }

        const emailRequired = !this.form.email.value.trim();
        const emailInvalid = !emailRegex.test(this.form.email.value);
        const $emailRequired = this.form.email.parentElement.querySelector('.o-Form__error .required');
        const $emailInvalid = this.form.email.parentElement.querySelector('.o-Form__error .email');
        if (emailRequired || emailInvalid) {
            invalid = true;
            if (emailRequired) {
                $emailRequired.classList.add(this.data.errorClass);
            } else {
                $emailRequired.classList.remove(this.data.errorClass);
            }
            if (!emailRequired && emailInvalid) {
                $emailInvalid.classList.add(this.data.errorClass);
            } else {
                $emailInvalid.classList.remove(this.data.errorClass);
            }
        } else {
            $emailRequired.classList.remove(this.data.errorClass);
            $emailInvalid.classList.remove(this.data.errorClass);
        }

        const subjectRequired = !this.form.subject.value.trim();
        const $subjectRequired = this.form.subject.parentElement.querySelector('.o-Form__error .required');
        if (subjectRequired) {
            invalid = true;
            $subjectRequired.classList.add(this.data.errorClass);
        } else {
            $subjectRequired.classList.remove(this.data.errorClass);
        }

        const messageRequired = !this.form.message.value.trim();
        const $messageRequired = this.form.message.parentElement.querySelector('.o-Form__error .required');
        if (messageRequired) {
            invalid = true;
            $messageRequired.classList.add(this.data.errorClass);
        } else {
            $messageRequired.classList.remove(this.data.errorClass);
        }

        if (!invalid) {
            const self = this;
            this.data.formSubmitting = true;
            axios.post('/api/send-email', {
                from: `${this.form.email.value}`,
                to: 'mailkrishna2@gmail.com',
                subj: `Zeroperks Contact : ${this.form.subject.value}`,
                content: `${this.form.message.value}<p>Email: ${this.form.email.value}</p><p>Thank you: ${this.form.name.value}</p>`,
            }).then(function (res) {
                self.data.formSubmitting = false;
                if(res.data.success) {
                    self.form.classList.add('u-Hidden');
                    self.data.resendMess.classList.remove('u-Hidden');
                    self.data.success = true;
                }
            }, error => {
                self.data.formSubmitting = false;
                console.log(error.data);
            })
        }
    },
    resendMessage () {
        this.form.classList.remove('u-Hidden');
        this.data.resendMess.classList.add('u-Hidden');
        this.data.success = false;
        this.form.name.value = "";
        this.form.email.value = "";
        this.form.subject.value = "";
        this.form.message.value = "";
    }
}

hire.initialized();