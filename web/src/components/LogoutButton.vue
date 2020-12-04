<template>
<div>
    <button name="logout" v-on:click="logout">Logout</button>
</div>
</template>

<script>
const READY = 0;
const LOADING = 1;

export default {
    name: 'LogoutButton',
    data() {
        return {
            state: READY,
        };
    },
    methods: {
        logout() {
            if (this.state == READY) {
                this.state = LOADING;
                fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'same-origin',
                }).then(() => {
                    this.$router.push('/login');
                })
            }
        }
    }
}
</script>