<template>
    <div class="textarea-custom">
        <textarea class="text-input-field" :name="textarea_name" v-model="text" :placeholder="placeholder_text"></textarea>
    </div>
    <div class="word-count" v-if="totalCharacters!=max_length">{{totalCharacters}}/{{max_length}} remaining</div>
    <div class="warning" v-else>Character limit reached</div>
</template>



<script>
export default {
    name:'TextAreaCustom',


    props:{
        restored_text: String,
        name: String,
        character_limit: Number,        
    },


    data(){
        return{
            text: this.restored_text?this.restored_text:"",
            max_length: this.character_limit?this.character_limit:50,
            textarea_name: this.name,
            placeholder_text: ""
        }
    },


    computed:{
        totalCharacters(){
            return this.text.length
        },
    },


    watch:{
        text(){
            this.text = this.text.substring(0, this.max_length)
            this.sendValue(this.text)
        },
    },


    emits:['output'],


    setup(props,{emit}){
        const sendValue = (text) => {emit('output', text)}
        return {sendValue}
    },


    created(){
        this.placeholder_text = `This field has a limit of ${this.max_length} characters`
    }

}
</script>



<style scoped>
    .textarea-custom{
        margin: 15px 0px 5px 0px;
        display: flex;
        height: 100%;
    }

    .text-input-field{
        background-color: lightgray;
        border: transparent;
        border-radius: 5px;
        width: 100%;
        height: 100%;
        padding: 5px;
    }

    .word-count{
        margin: 12px 0px 0px 0px;
        text-align: right;
        color: goldenrod;
    }

    .warning{
        margin: 12px 0px 0px 0px;
        text-align: right;
        color: red;
    }
</style>