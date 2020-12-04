<template>
<div class="login-form">
    <div class="input">
        <label for="username">Username:&nbsp;</label>
        <input v-model="username" type="text" name="username" />
    </div>
    <div class="input">
        <label for="password">Password:&nbsp;</label>
        <input v-model="password" type="password" name="password" />
     </div>
    <button id="login" v-on:click="submitLogin" v-bind:disabled="loginButtonDisabled()" name="login">Login</button>
    <div class="error">{{ error }}</div>
</div>
</template>

<style scoped>
.login-form {
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
    name: 'LoginForm',
    data: function() {
        return {
            username: '',
            password: '',
            state: READY,
            error: ''
        };
    },
    methods: {
        loginButtonDisabled() {
            return this.state == LOADING;
        },
        submitLogin() {
            if (this.state == LOADING) return;

            this.state = LOADING;

            fetch('/api/login', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password,
                }),
            }).then((response) => {
                if (response.ok) {
                    this.$router.push('/codes');
                    this.error = '';
                } else {
                    this.state = READY;
                    response.json().then(res => this.error = res.error);
                }
            })
        },
    },
}
</script>