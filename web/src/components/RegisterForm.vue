<template>
<div class="register-form">
    <div class="input">
        <label for="username">Username:&nbsp;</label>
        <input v-model="username" type="text" name="username" />
    </div>
    <div class="input">
        <label for="password">Password:&nbsp;</label>
        <input v-model="password" type="password" name="password" />
     </div>
    <div class="input">
        <label for="confirm-password">Confirm Password:&nbsp;</label>
        <input v-model="confirmPassword" type="password" name="confirm-password" />
     </div>
    <button v-on:click="submitRegister" v-bind:disabled="registerButtonDisabled()" name="register">Register</button>
    <div class="error">{{ error }}</div>
</div>
</template>

<style scoped>
.register-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.input {
    margin-bottom: 8px;
}
#login {
    margin-bottom: 8px;
}
.error {
    color: red;
    height: 20px;
}
</style>

<script>
const READY = 0;
const LOADING = 1;
export default {
    name: 'RegisterForm',
    data: function() {
        return {
            username: '',
            password: '',
            confirmPassword: '',
            state: READY,
            error: ''
        };
    },
    methods: {
        registerButtonDisabled() {
            return this.state == LOADING;
        },
        submitRegister() {
            if (this.state == LOADING) return;

            if (this.password !== this.confirmPassword) {
                this.error = 'Password confirmation does not match password. Please re-enter it and try again.';
                return;
            }

            this.state = LOADING;

            fetch('/api/users', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.username,
                    password: this.password,
                }),
            }).then((response) => {
                if (response.ok) {
                    this.$router.push('/codes');
                } else {
                    this.state = READY;
                    response.json().then(res => this.error = res.error);
                }
            })
        },
    },
}
</script>