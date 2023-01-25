<template>
    <Header />
    <div class="app">
        <div class="picture1">
            <h1>I have filed an answer online before</h1>
            <button>Continue</button>
        </div>
        <div class="picture2">
            <h1>I need help to complete the form</h1>
            <button v-on:click="redirect()">Get started</button>
        </div>
    </div>
    
</template>



<script>
import Header from './Header.vue'
export default {
    name:'Home.vue',


    components:{
        Header
    },


    methods:{
        redirect(){
            this.$router.push({name:'Form'})
        }
    }
}
</script>



<style scoped>
    .app{
        display: flex;
    }

    .picture1{
        width: 50vw;
        height: 100vh;
        position: relative;
        background-image: url('../assets/file_online.png');
        background-size: cover;
        color: white;
        margin: 90px 10px 50px 100px;
        border-radius: 10px 20px 20px 20px;
    }

    .picture1 h1{
        color: white;
        text-align: left;
        font-size: 70px;
        padding: 20px 100px 0px 60px;
        margin-right: 40px;
        font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
        font-weight: 20;
    }

    .picture1 button{
        margin-left: 60px;
        padding: 10px 30px;
        border: 1px solid goldenrod;
        border-radius: 10px;
        background: goldenrod;
        font-weight: bold;
        font-size: 15px;
        cursor: pointer;
    }

    .picture2{
        width: 50vw;
        height: 100vh;
        position: relative;
        background-image: url('../assets/complete_checklist.png');
        background-size: cover;
        margin: 90px 100px 50px 10px;
        border-radius: 10px 20px 20px 20px;
    }

    .picture2 h1{
        color: white;
        text-align: left;
        font-size: 70px;
        padding: 20px 100px 0px 60px;
        margin-right: 40px;
        font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
        font-weight: 20;
    }

    .picture2 button{
        margin-left: 60px;
        padding: 10px 30px;
        border: 1px solid goldenrod;
        border-radius: 10px;
        background: goldenrod;
        font-weight: bold;
        font-size: 15px;
        cursor: pointer;
    }
</style>