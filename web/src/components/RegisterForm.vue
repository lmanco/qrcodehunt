<template>
<div class="register-form">
    <input v-model="username" type="text" name="username" />
    <input v-model="password" type="password" name="password" />
    <button v-on:click="submitRegister" v-bind:disabled="registerButtonDisabled()" name="register">Register</button>
</div>
</template>

<style scoped>
.register-form {
    display: flex;
    flex-direction: column;
    align-items: center;
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
            state: READY,
        };
    },
    methods: {
        registerButtonDisabled() {
            return this.state == LOADING;
        },
        submitRegister() {
            if (this.state == LOADING) return;

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
                    this.state == READY;
                }
            })
        },
    },
}
</script>