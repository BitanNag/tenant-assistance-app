<template>
    <div class="nav">
        <p class="eviction_defense">Eviction Defense</p>
        <p class="file_answer">File an answer</p>
        <a class="help" href="#">Help</a>
    </div>
</template>


<script>
export default {
    name:'Header'
}
</script>


<style scoped>
    .nav{
        width:100%;
        display: flex;
    }

    .eviction_defense{
        justify-content: left;
        margin: 0px 35% 0px 1%;
        color: goldenrod;
        padding: 14px 14px;
        font-size: 18px;
        font-weight: bold;
        font-family: Calibri;
        height: fit-content;
    }

    .file_answer, .help{
        justify-content: center;
    }

    .file_answer{
        color: goldenrod;
        text-align: center;
        padding: 14px 14px;
        font-size: 17px;
        height: fit-content;
        margin: 0;
        position: relative;
    }

    .file_answer::after{
        content: "";
        height: 2px;
        width: 20%;
        background: goldenrod;
        position: absolute;
        left: calc(45%);
        bottom: 0;
        top: 40px;
    }

    .help{
        float: left;
        color: gray;
        text-align: center;
        padding: 14px 14px;
        font-size: 17px;
        text-decoration: none;
    }

</style>