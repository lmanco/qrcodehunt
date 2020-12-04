<template>
<div>
    <login-form />
    <register-form />
</div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';

export default {
    name: 'Login',
    components: {
        LoginForm,
        RegisterForm,
    },
};
</script>