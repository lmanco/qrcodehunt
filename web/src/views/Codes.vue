<template>
    <div v-if="loggedIn" class="container">
        <h1>Hello, {{ name }}!</h1>
        <div>
            You have found {{ codesCount }} codes. You are in {{ position }} place{{ tiedText }}
        </div>
        <ul>
            <li v-for="(code, index) in codesFound" :key="index">
                <input type="checkbox" disabled :checked="code"/>
                Code {{ index + 1 }}
            </li>
        </ul>
        <logout-button />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}
ul {
    list-style-type: none;
}
</style>

<script>
import LogoutButton from '../components/LogoutButton.vue';
import numeral from 'numeral';

export default {
    components: { LogoutButton },
    name: 'Codes',
    data() {
        return {
            codesFound: [],
            name: '',
            rank: -1,
            numTied: 0,
            loggedIn: false
        };
    },
    computed: {
        codesCount() {
            return this.codesFound.filter(x => x).length;
        },
        position() {
            return numeral(this.rank).format('0o');
        },
        tiedText() {
            if (this.numTied === 0)
                return '.';
            const prefix = ` and are tied with ${this.numTied}`;
            const suffix = (this.numTied === 1) ? ' other.' : ' others.';
            return `${prefix}${suffix}`;
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