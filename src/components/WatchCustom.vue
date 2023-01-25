<template>
    <div></div>
</template>



<script>
export default {
    name: 'WatchData',


    props:{
        section: Object
    },


    watch: {
        section: {
            handler(new_field){
                // console.log(val)
                this.sendValue(new_field)
            },
            deep: true,
            immediate: true
        }
    },


    emits:['output'],


    setup(props,{emit}){
        const sendValue = (field) => {emit('output', field)}
        return {sendValue}
    },
}
</script>