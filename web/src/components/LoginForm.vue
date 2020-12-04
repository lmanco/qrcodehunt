<template>
<div class="login-form">
    <input v-model="username" type="text" name="username" />
    <input v-model="password" type="password" name="password" />
    <button v-on:click="submitLogin" v-bind:disabled="loginButtonDisabled()" name="login">Login</button>
</div>
</template>

<style scoped>
.login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
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
                } else {
                    this.state == READY;
                }
            })
        },
    },
}
</script>