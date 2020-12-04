<template>
    <div v-if="loggedIn" class="container">
        <h1>Hello, {{ name }}!</h1>
        <div>
            You have found {{ codesCount }} codes.
        </div>
        <logout-button />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>

<script>
import LogoutButton from '../components/LogoutButton.vue';

export default {
    components: { LogoutButton },
    name: 'Codes',
    data() {
        return {
            codesFound: [],
            name: '',
            rank: -1,
            numTied: 0,
            loggedIn: false,
        };
    },
    computed: {
        codesCount() {
            return this.codesFound.filter(x => x).length;
        }
    },
    methods: {
        codeFound(i) {
            return this.codesFound[i]
        },
    },
    mounted() {
        fetch('/api/users/m/e', {
            credentials: 'same-origin',
        }).then(async (response) => {
            if (response.ok) {
                const data = await response.json();
                const {
                    codesFound,
                    name,
                    rank,
                    numTied,
                } = data;
                this.codesFound = codesFound;
                this.name = name;
                this.rank = rank;
                this.numTied = numTied;
                this.loggedIn = true;
            } else {
                this.$router.push('/login');
            }
        });
    },
};
</script>