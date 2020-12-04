<template>
<div>
    <div v-if="loading">Checking code...</div>
    <div v-if="noGood">That code isn't valid!</div>
    <div v-if="noGood">You already scanned that code.</div>
    <router-link to="/codes">Home</router-link>
</div>
</template>

<script>
const LOADING = 0;
const NO_GOOD = 1;
const DUPLICATE = 2;
export default {
    name: 'CodeCheck',
    data() {
        return {
            state: LOADING,
        };
    },
    computed: {
        loading() {
            return this.state == LOADING;
        },
        noGood() {
            return this.state == NO_GOOD;
        },
        duplicate() {
            return this.state == DUPLICATE;
        },
    },
    async mounted() {
        const code = this.$route.code;
        const loginResponse = await fetch('/api/users/m/e', {
            credentials: 'same-origin',
        });
        if (!loginResponse.ok) {
            this.$router.push('/login');
            return;
        }
        const { name } = loginResponse.json();
        const codeResponse = await fetch(`/api/${name}/codesFound/${code}`, {
            method: 'PATCH',
            credentials: 'same-origin',
        });
        if (codeResponse.ok) {
            this.$router.push('/codes');
        } else if (codeResponse.status == 409) {
            this.state = DUPLICATE;
        } else {
            this.state = NO_GOOD;
        }
    },
}
</script>