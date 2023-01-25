<template>


    <header-custom v-if="loaded"/>


    <div class="app">

        <div class="checklist" v-if="loaded">
            <h4>Go through this checklist to complete the answer form:</h4>
            <div v-for="section in checklist_sections" :key="section" class="checklist-items">
                <span class="circle" :style="section.is_complete?{'background-color':'lightgreen','border-color':'lightgreen','color':'white'}:{'background-color':'white', 'color':'gray'}"><b>{{section.id+1}}</b></span>
                <span class="text">{{section.description}}</span>
            </div>
            <div class="last-item">
                <span class="circle" :style="all_sections_complete?{'background-color':'#ffd043','border-color':'#ffd043','color':'white'}:{'background-color':'white', 'color':'gray'}"><b>7</b></span>
                <span class="text"><b>Export Answer Form</b><button class="arrow-icon" v-on:click="submitForm()"></button></span>
            </div>
        </div>


        <div class="questions" v-if="loaded">
            <div class="message-top" v-if="alert_message=='Form saved!'" style="color:green">
                <i>{{alert_message}}</i>
            </div>
            <form>
                <!-- General Info -->
                <div class="section1">
                    <h2>{{form_sections[0].description}}<i v-show="sections_incomplete[0]">*Required! Fields incomplete.</i></h2>
                    <div v-for="field in form_sections[0].section_fields" :key="field.field_id">
                        <p class="field-title">{{field.field_text}}</p>
                        <input class="field-input" type="text" v-model="field.field_data">
                    </div>
                </div>
                <!-- Eviction Notice Reception Date -->
                <div class="section2">
                    <h2>{{form_sections[1].description}}<i v-show="sections_incomplete[1]">*Required! Field incomplete.</i></h2>
                    <div v-for="field in form_sections[1].section_fields" :key="field.field_id">
                        <p class="field-title">{{field.field_text}}</p>
                        <input class="field-input" type="date" v-model="field.field_data">
                    </div>
                </div>
                <!-- Eviction Reason -->
                <div class="section3">
                    <h2>{{form_sections[2].description}}<i v-show="sections_incomplete[2]">*Required! Field incomplete.</i></h2>
                    <div v-for="field in form_sections[2].section_fields" :key="field.field_id">
                        <p class="field-title"><input class="field-input" type="radio" name="field-input" :value="field.field_text" v-model="form_sections[2].section_data">{{field.field_text}}</p>                       
                    </div>
                </div>
                <!-- Specify Situation -->
                <div class="section4">
                    <h2>{{form_sections[3].description}}<i v-show="sections_incomplete[3]">*Required! Field incomplete.</i></h2>
                    <div>
                        <textarea-custom :restored_text="form_sections[3].section_data" :name="form_sections[3].description" :character_limit="form_sections[3].character_limit" @output="(value) => form_sections[3].section_data = value" />
                    </div>                   
                </div>
                <!-- Select Legal Defenses -->
                <div class="section5">
                    <h2>{{form_sections[4].description}}<i v-show="sections_incomplete[4]">*Required! Field incomplete.</i></h2>
                    <div v-for="field in form_sections[4].section_fields" :key="field.field_id">
                        <p class="field-title"><input type="checkbox" class="field-input" @click="toggleCheckedValue_Section5(field)" v-model="field.is_selected">{{field.field_text}}</p>
                    </div>
                    <div class="optional-textarea">
                        <textarea-custom v-if="form_sections[4].section_fields[9].is_selected" :restored_text="form_sections[4].section_fields[9].field_data" :name="form_sections[4].section_fields[9].field_text" :character_limit="form_sections[4].section_fields[9].character_limit" @output="(value) => form_sections[4].section_fields[9].field_data = value"/>
                    </div>
                </div>
                <!-- Select Counterclaims -->
                <div class="section6">
                        <h2>{{form_sections[5].description}}<i v-show="invalid_values[5]">*Invalid data entered</i><i v-show="sections_incomplete[5] && !invalid_values[5]">*Required! Fields incomplete.</i></h2>
                    <div v-for="field in form_sections[5].section_fields" :key="field.field_id">
                        <div class="section6-fields">
                            <div class="input-title-fields">
                                <input type="checkbox" class="field-input" @click="toggleCheckedValue_Section6(field)" v-model="field.is_selected"><p class="field-title">{{field.field_text}}</p>
                            </div>
                            <div class="field-data">
                                <p v-if="field.is_selected&&field.field_id!=1">$<input type="text" placeholder="Enter TBD if uncertain" v-model="field.field_data"></p>
                                <p v-if="field.is_selected&&field.field_id==1">$<input type="text" placeholder="Enter TBD if uncertain" v-model="field.field_data1">for <input type="text" v-model="field.field_data2">months</p>
                            </div>                           
                        </div>                        
                    </div>                    
                </div>

            </form>

            <watcher-custom :section="section" v-for="section in form_sections" :key="section" @output="isSectionComplete"/>
            <watcher-custom :section="section" v-for="section in checklist_sections" :key="section" @output="isChecklistComplete"/>

            <div class="footer">
                <div class="message-bottom" v-if="alert_message!='Form saved!'" style="color:red">
                    <i>{{alert_message}}</i>
                </div>
                <div class="buttons">
                    <button @click.prevent="clearForm()" class="button1">Clear Form</button>
                    <button @click.prevent="saveForm()" class="button2">Save Form</button>
                    <button @click.prevent="submitForm()" class="button3">Prepare Form</button>
                </div>
            </div>            
        </div>

        <transition name="fade" appear>
            <div class="overlay" v-show="show_overlay1 || show_overlay2"></div>
        </transition>
        <transition name="slide1" appear>
            <div class="modal_restoreForm" v-show="show_overlay1">
                <p>It appears you were already filling this form previously. Do you wish to continue?</p>
                <div class="modal_restoreFormbuttons">
                    <button class="modal_restoreFormbutton1" @click="show_overlay1=false;restoreForm()">Yes, I want to restore my form</button>
                    <button class="modal_restoreFormbutton2" @click="show_overlay1=false;clearForm()">No, take me to a new form</button>
                </div>
            </div>
        </transition>
        <transition name="slide2" appear>
            <div class="modal_saveForm" v-show="show_overlay2">
                <h1>Form saved!</h1>
                <div class="modal_saveFormbuttons">
                    <button class="modal_saveFormbutton" @click="show_overlay2=false">Okay!</button>
                </div>               
            </div>
        </transition>

    </div>
    
</template>



<script>
import Header from "./Header.vue"
import TextAreaCustom from './TextAreaCustom.vue'
import WatchData from './WatchCustom.vue'
import jsPDF from 'jspdf'
export default {
    name:'Form',


    components:{
        'header-custom':Header,
        'textarea-custom':TextAreaCustom,
        'watcher-custom':WatchData
    },


    data(){
        return{
            loaded: false,
            checklist_sections: [
                {
                    id:0,
                    description: "Provide general information",
                    is_complete: false
                },
                {
                    id:1,
                    description: "Enter the date the eviction notice was served",
                    is_complete: false
                },
                {
                    id:2,
                    description: "Select reason for eviction notice",
                    is_complete: false
                },            
                {
                    id:3,
                    description: "Specify your situation",
                    is_complete: false
                },            
                {
                    id:4,
                    description: "Select all legal defenses that apply",
                    is_complete: false
                },            
                {
                    id:5,
                    description: "Select all counterclaims that apply",
                    is_complete: false
                },                
            ],
            all_sections_complete: false,
            sections_incomplete: null,
            form_sections: [
                {
                    id:0,
                    description:"Provide general information",
                    section_fields: [
                        {
                            field_id: 0,
                            field_text: "Your Landlord's full name",
                            field_data: ""
                        },
                        {
                            field_id: 1,
                            field_text: "Your name",
                            field_data: ""
                        },
                        {
                            field_id: 2,
                            field_text: "Case Number",
                            field_data: ""
                        },
                        {
                            field_id: 3,
                            field_text: "Your email",
                            field_data: ""
                        }
                    ]
                },
                {
                    id:1,
                    description:"Enter the date the eviction notice was served",
                    section_fields: [
                        {
                            field_id: 0,
                            field_text: "Date notice was served",
                            field_data: ""
                        }
                    ]
                },
                {
                    id:2,
                    description:"Select reason for eviction notice",
                    section_fields: [
                        {
                            field_id: 0,
                            field_text: "I did not pay rent.",
                        },
                        {
                            field_id: 1,
                            field_text: "My lease expired and I did not sign a new lease.",
                        },
                        {
                            field_id: 2,
                            field_text: "My landlord alleged that I violated the lease.",
                        },
                        {
                            field_id: 3,
                            field_text: "Other reasons.",
                        }
                    ],
                    section_data: ""
                },
                {
                    id:3,
                    description: "Specify your situation",
                    section_data: "",
                    character_limit: 500
                },
                {
                    id: 4,
                    description: "Select all legal defenses that apply",
                    section_fields: [
                        {
                            field_id: 0,
                            field_text: "The plaintiff is not my landlord.",
                            is_selected: false
                        },
                        {
                            field_id: 1,
                            field_text: "I do not have a landlord-tenant relationship with the plaintiff.",
                            is_selected: false
                        },
                        {
                            field_id: 2,
                            field_text: "My landlord did not give me notice that my lease/rental agreement was terminated in accordance with the terms of our lease.",
                            is_selected: false
                        },
                        {
                            field_id: 3,
                            field_text: "The landlord did not properly demand that I move before filing the lawsuit.",
                            is_selected: false
                        },
                        {
                            field_id: 4,
                            field_text: "My landlord terminated my lease without valid reason.",
                            is_selected: false
                        },
                        {
                            field_id: 5,
                            field_text: "I do not owe any rent to my landlord.",
                            is_selected: false
                        },
                        {
                            field_id: 6,
                            field_text: "I offered and had money to pay my rent on/before the date I usually pay, but my landlord refused to accept it.",
                            is_selected: false
                        },
                        {
                            field_id: 7,
                            field_text: "My landlord would not accept my rent, correct late fees, and the court costs. I had all the money to pay.",
                            is_selected: false
                        },
                        {
                            field_id: 8,
                            field_text: "My landlord failed to repair the property. The failure has lowered its value or resulted in other damages more than the rent claimed.",
                            is_selected: false
                        },
                        {
                            field_id: 9,
                            field_text: "My landlord is not entitled to evict me or secure a money judgement for the following reasons (describe below):",
                            is_selected: false,
                            field_data: "",
                            character_limit: 100
                        },
                    ]
                },
                {
                    id: 5,
                    description: "Select all counterclaims that apply",
                    section_fields: [
                        {
                            field_id: 0,
                            is_selected: false,
                            field_text: "My landlord owes me money for the following reasons (enter the full amount below):",
                            field_data: ""
                        },
                        {
                            field_id: 1,
                            is_selected: false,
                            field_text: "My landlord failed to repair the property. Due to this failure, its value has reduced (enter numbers below):",
                            field_data1: "",
                            field_data2:""
                        },
                        {
                            field_id: 2,
                            is_selected: false,
                            field_text: "Since my landlord failed to make requested repairs, I made these repairs. I have all the receipts. I will bring the receipts and all documents concerning these payments to my trial (enter the total cost of the repairs below):",
                            field_data: ""
                        },
                        {
                            field_id: 3,
                            is_selected: false,
                            field_text: "My landlord's failure to repair resulted in damages to my person and property (enter the total cost of damages below):",
                            field_data: ""
                        },
                    ]
                }
            ],
            invalid_values: null,
            alert_message: null,
            restored_form_sections: '',
            restored_text: '',
            show_overlay1: false,
            show_overlay2: false,
            
            placeholder:true,
            placeholder_text:"Here is placeholder text. Correct link to be set later"
        }
    },


    methods:{
        check_previousFormData(){
            localStorage.getItem('user-info')?this.show_overlay1 = true:this.loaded = true
        },

        restoreForm(){
            this.restored_form_sections = JSON.parse(localStorage.getItem('user-info'))
            for(var i=0; i<this.restored_form_sections.length; i++){
                this.form_sections[i] = this.restored_form_sections[i]
                this.isSectionComplete(this.form_sections[i])
            }
            this.loaded = true
        },

        toggleCheckedValue_Section5(field){
            if(field.is_selected){
                field.is_selected=false
                if(field.field_id == 9){
                    field.field_data = ""
                }
            }else{
                field.is_selected=true
            }
        },

        toggleCheckedValue_Section6(field){
            console.log(field.is_selected)
            if(field.is_selected){
                field.is_selected = false
                field.field_id == 1?field.field_data1 = field.field_data2 = "":field.field_data = ""
                this.checklist_sections[5].is_complete = false
            }else{
                field.is_selected = true
            }
        },

        isChecklistComplete(){
            for(var i = 0; i<this.checklist_sections.length; i++){
                if(this.checklist_sections[i].is_complete == false){
                    this.all_sections_complete = false
                    break
                }else{
                    this.all_sections_complete = true
                }
            }
        },

        isSectionComplete(section){
            switch(section.id){
                //check if Section 1 is complete
                case 0: 
                    if(section.section_fields[0].field_data && section.section_fields[1].field_data && section.section_fields[2].field_data){
                        this.checklist_sections[section.id].is_complete = true
                        this.sections_incomplete[section.id] = false
                    }else{
                        this.checklist_sections[section.id].is_complete = false
                    }
                break
                //check if Section 2 is complete
                case 1: 
                    if(section.section_fields[0].field_data){
                        this.checklist_sections[section.id].is_complete = true
                        this.sections_incomplete[section.id] = false
                    }else{
                        this.checklist_sections[section.id].is_complete = false
                    }
                break
                //check if Section 3 is complete
                case 2: 
                    if(section.section_data){
                        this.checklist_sections[section.id].is_complete = true
                        this.sections_incomplete[section.id] = false
                    }else{
                        this.checklist_sections[section.id].is_complete = false
                    }
                break
                //check if Section 4 is complete
                case 3: 
                    if(section.section_data){
                        this.checklist_sections[section.id].is_complete = true
                        this.sections_incomplete[section.id] = false
                    }else{
                        this.checklist_sections[section.id].is_complete = false
                    }
                break
                //check if Section 5 is complete
                case 4:
                    for(var i=0; i<section.section_fields.length; i++){
                        if(section.section_fields[i].is_selected){
                            this.checklist_sections[section.id].is_complete = true
                            this.sections_incomplete[section.id] = false
                            break
                        }else{
                            this.checklist_sections[section.id].is_complete = false
                        }
                    }
                    if(section.section_fields[9].is_selected && !section.section_fields[9].field_data){
                        this.checklist_sections[4].is_complete = false
                    }                    
                break
                //check if Section 6 is complete
                case 5: 
                    var indexes = new Array, invalid_data_indexes = new Array
                    for(var j=0; j<section.section_fields.length; j++){
                        if(section.section_fields[j].is_selected){
                            indexes.push(j)
                        }
                    }
                    for(var k=0; k<indexes.length; k++){
                        if(indexes[k]!=1 && !section.section_fields[indexes[k]].field_data){
                            this.checklist_sections[section.id].is_complete = false
                            break
                        }else if(indexes[k]==1 && (!section.section_fields[indexes[k]].field_data1 || !section.section_fields[indexes[k]].field_data2)){
                            this.checklist_sections[section.id].is_complete = false
                            break
                        }else{
                            this.checklist_sections[section.id].is_complete = true
                            this.sections_incomplete[section.id] = false
                        }
                    }
                    //Validating data
                    for(var l=0; l<indexes.length; l++){
                        if(indexes[l]!=1 && !this.isValidValue('number', section.section_fields[indexes[l]].field_data)){
                            invalid_data_indexes.push(indexes[l])
                        }else if(indexes[l]==1 && (!this.isValidValue('number', section.section_fields[indexes[l]].field_data1) || !this.isValidValue('number', section.section_fields[indexes[l]].field_data2))){
                            invalid_data_indexes.push(indexes[l])
                        }
                    }
                    if(invalid_data_indexes.length>0){
                        this.invalid_values[section.id] = true
                        this.checklist_sections[section.id].is_complete = false
                    }else{
                        this.invalid_values[section.id] = false
                    }
                break  
            }
        },

        isValidValue(key, value){
            if(key=='number'){
                if(/^\d+$/.test(value) || value === "TBD" || value == ''){
                    return true
                }else{
                    return false
                }
            }            
        },

        clearForm(){
            location.reload()
            localStorage.removeItem("user-info")
            this.loaded = true
        },
        
        saveForm(){
            var no_invalid_value = (new Set(this.invalid_values).size == 1), completed_sections_count = 0
            this.alert_message = ""
            for(var i=0; i<this.checklist_sections.length; i++){
                if(this.checklist_sections[i].is_complete){
                    completed_sections_count+=1
                }
            }
            if(completed_sections_count>0){
                if(no_invalid_value){
                    this.alert_message = "Form saved!"
                    this.show_overlay2 = true
                    localStorage.setItem("user-info", JSON.stringify(this.form_sections))
                }else{
                    this.alert_message = "*Cannot save a form with invalid data!"
                }
            }else{
                this.alert_message = "*Cannot save an empty form! Please complete atleast one section."
            }
        },

        submitForm(){
            if(this.all_sections_complete!=true){
                for(var i=0; i<this.checklist_sections.length; i++){
                    if(!this.checklist_sections[i].is_complete){
                        this.sections_incomplete[i] = true
                    }
                }
            }else{
                this.sections_incomplete = new Array(this.checklist_sections.length).fill(false)
                console.log("Form submitted!")
                // this.$router.push({name:'PreviewDocument', params: {form_data: JSON.stringify(this.form_sections)}})
                localStorage.setItem("user-info", JSON.stringify(this.form_sections))
                const doc = new jsPDF({
                    orientation:"portrait",
                    unit:"in",
                    format:"a1"
                })
                doc
                    //****SECTION 1 ****//
                    //title
                    .setFontSize(16).setFont("times","bold").text("IN THE MAGISTRATE COURT OF FULTON COUNTY", 8.6, 0.9).text("STATE OF GEORGIA", 10.25, 1.15)
                    //venue address
                    .setFontSize(16).setFont("times","normal").text("Dispossesory Division \n185 Central Avenue, \nSW, TG100 \nAtlanta, Georgia 30303 \n(404) 613-5380 \nwww.magistratefulton.org", 14.5, 0.4)       
                    //plaintiff name
                    .setFontSize(20).text(this.form_sections[0].section_fields[1].field_data, 4.8, 2.20)                             
                    .setLineWidth(0.03).line(4.8,2.25,8.4,2.25)           
                    .setFontSize(16).text("PLAINTIFF", 4.8, 2.45)
                    //case number
                    .setFontSize(16).text("Case Number:", 12.3, 2.18)
                    .setFontSize(20).text(this.form_sections[0].section_fields[2].field_data, 13.7, 2.20)
                    .setLineWidth(0.03) .line(13.7,2.25,17.3,2.25)                                                                                  
                    //divider
                    .setFontSize(16).text("v.", 4.8, 2.85)
                    //defandant name  
                    .setFontSize(20).text(this.form_sections[0].section_fields[0].field_data, 4.8, 3.25)              
                    .setLineWidth(0.03).line(4.8, 3.30, 8.4, 3.30)  
                    .setFontSize(16).text("DEFENDANT", 4.8, 3.50)
                    //email address
                    .setFontSize(16).text("Email:", 12.3, 3.0)   
                    .setFontSize(20).text(this.form_sections[0].section_fields[3].field_data, 13.7, 3.02)
                    .setLineWidth(0.03).line(13.7,3.07,17.3,3.07) 
                    //warning
                    .setFontSize(16).setFont("times","bold").text("***EACH DEFENDANT MUST FILE HIS OWN ANSWER***", 12.3, 3.4)
                    .setFontSize(15.5).text("Attorneys may file answers for more than one defendant.", 12.3, 3.65)
                    //section-end line
                    .setLineWidth(0.03).line(0.44,3.75,23,3.75)

                    //****SECTION 2****//
                    //title
                    .setFontSize(16).setFont("times","bold").text("DISPOSSESORY ANSWER",10.05,4.2)
                    .setFontSize(13.5).setFont("times","normal").text("(Please note and then use another sheet(s) for additional space, as needed)",8.6,4.5)
                    //select role
                    .setFontSize(16).text("I am the: (check one)",0.45, 5.0)
                    .cell(4.0,4.84,0.17,0.17," ")
                    .setFontSize(16).text("Defendant",4.3,5.0)
                    .setFontSize(16).setFont("times","bold").text("OR",5.6,5.0)
                    .setLineWidth(0.03).line(5.6,5.05,5.95,5.05)
                    .cell(6.45,4.84,0.17,0.17," ")
                    .setFontSize(16).setFont("times","normal").text("Occupant of the subject premises",6.75,5.0)
                    //options list
                    .setFontSize(16).setFont("times","normal").text("I am filing an Answer and I state the following in response to Plaintiff's claim(s) in this lawsuit:",0.45,5.5)
                    //option 1
                    .addImage(this.form_sections[4].section_fields[0].is_selected?"data:image/png;base64,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":"","jpeg",0.61,5.65,0.3,0.2,"section1_checkmark1")
                    .setLineWidth(0.02).line(0.45,5.9,1.1,5.9)
                    .setFontSize(16).setFont("times","normal").text("The plaintiff is not my landlord.",1.4,5.9)
                    //option 2
                    .addImage(this.form_sections[4].section_fields[1].is_selected?"data:image/png;base64,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":"","jpeg",0.61,6.0,0.3,0.2,"section1_checkmark2")
                    .setLineWidth(0.02).line(0.45,6.25,1.1,6.25)
                    .setFontSize(16).setFont("times","normal").text("I do not have a landlord-tenant relationship with the plaintiff.",1.4,6.25)
                    //option 3
                    .addImage(this.form_sections[4].section_fields[2].is_selected?"data:image/png;base64,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":"","jpeg",0.61,6.35,0.3,0.2,"section1_checkmark3")
                    .setLineWidth(0.02).line(0.45,6.6,1.1,6.6)
                    .setFontSize(16).setFont("times","normal").text("My landlord did not give me notice that my lease/rental agreement was terminated in accordance with the terms of our lease.",1.4,6.6)
                    //option 4
                    .addImage(this.form_sections[4].section_fields[3].is_selected?"data:image/png;base64,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":"","jpeg",0.61,6.7,0.3,0.2,"section1_checkmark4")
                    .setLineWidth(0.02).line(0.45,6.95,1.1,6.95)
                    .setFontSize(16).setFont("times","normal").text("The landlord did not properly demand that I move before filing the lawsuit.",1.4,6.95)
                    //option 5
                    .addImage(this.form_sections[4].section_fields[4].is_selected?"data:image/png;base64,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":"","jpeg",0.61,7.05,0.3,0.2,"section1_checkmark5")
                    .setLineWidth(0.02).line(0.45,7.3,1.1,7.3)
                    .setFontSize(16).setFont("times","normal").text("My landlord terminated my lease without valid reason.",1.4,7.3)
                    //option 6
                    .addImage(this.form_sections[4].section_fields[5].is_selected?"data:image/png;base64,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":"","jpeg",0.61,7.4,0.3,0.2,"section1_checkmark6")
                    .setLineWidth(0.02).line(0.45,7.65,1.1,7.65)
                    .setFontSize(16).setFont("times","normal").text("I do not owe any rent to my landlord.",1.4,7.65)
                    //option 7
                    .addImage(this.form_sections[4].section_fields[6].is_selected?"data:image/png;base64,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":"","jpeg",0.61,7.75,0.3,0.2,"section1_checkmark7")
                    .setLineWidth(0.02).line(0.45,8,1.1,8)
                    .setFontSize(16).setFont("times","normal").text("I offered and had money to pay my rent on/before the date I usually pay, but my landlord refused to accept it.",1.4,8)
                    //option 8
                    .addImage(this.form_sections[4].section_fields[7].is_selected?"data:image/png;base64,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":"","jpeg",0.61,8.1,0.3,0.2,"section1_checkmark8")
                    .setLineWidth(0.02).line(0.45,8.35,1.1,8.35)
                    .setFontSize(16).setFont("times","normal").text("My landlord would not accept my rent, correct late fees, and the court costs. I had all the money to pay.",1.4,8.35)
                    //option 9
                    .addImage(this.form_sections[4].section_fields[8].is_selected?"data:image/png;base64,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":"","jpeg",0.61,8.45,0.3,0.2,"section1_checkmark9")
                    .setLineWidth(0.02).line(0.45,8.7,1.1,8.7)
                    .setFontSize(16).setFont("times","normal").text("My landlord failed to repair the property. The failure has lowered its value or resulted in other damages more than the rent claimed.",1.4,8.7)
                    //option 10
                    .addImage(this.form_sections[4].section_fields[9].is_selected?"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAByCAYAAACx1Ch2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAABWISURBVHhe7Z19vFVVmcfn/yl5uVxAuJfXy+tEiDAh44j2on5KRTJJVF7yXckpJWemMjMqasyXVF5MaqzgY0JqRJQ6mUqmlIFhSBnqkIATIhYQKojgmvV9zn4266y7zjn3cM8+95zL+n34fc65l3P32Xut737Ws1723v9goqIyUAQrKhNFsKIyUQQrKhNFsKIyUQQrKhNFsKIyUQQrKhNFsKLK0jvvvGMOHjwo5n0hRbCi2ixAKgaTqwhWVGHBkNoVPx8sDlgEK6qwXLCsD+zfb958/Q2z869/M9u3vcInCiqCdYTJbc4A5eDbB/KjD+/tPwBat/Zpc9+yH5qvfXWu+cxVV5uPTjrTTBh/nBkxbLgZe8wYM+n0M+T/RfxZsm0cwToCpWCJkrevbX/VPPizB8yNN9xgpp13vjnufePNsJYhpndDo+l+VBfTu7Gn6dO7t+l7dB8zoLmfGTRgoPzc0K2b+dWqX8o2IlhHuKj4t956yzy9Zq1ZMG++uWDmTHPMe0ebo3v2ElCa+vQVeAb0bTbD+g8yIwa1mCEDBpnB/fqblv4DzUD7f/2O7iuRC+AAUrcbwToCtd82fWvWrDFz5swxp556qhnYv7+A0atHo8A0eKCFxxpggGj4gMFmSL+BpqXZAoUtVEMHDpbX5t59BMJrP/u5ZOsRrE4lKtEV40t79+6V9+8cOCg51Asbnzc333iTOeVDJ0sk6t6la9qcuVawMBEKsDRi8R6giGJ9bGQ78yOnm5U/XiHfE+ohRrA6gYDpAEm4FVEJ7d69Wyr+E9NnmKGDW0yP7g2SE2lEIlqVAguQBjf1k2jVr1cf07NbgznLJvAPrfypefvNffI9AlWS8LuKYNW7tEKTCt7855fMvNtuNxP/9QTJmTQ69evbJMAAWQgqDEyuh9lIRZN3dI+e5pT3f8CsuO9+iYL6XfQqCymCVc8iUFDRVn/6wx/NF79wnRk9apQApTkTPbshgwYLWFjB4v9KgdWrew8zavhIs/C2eWb/3lyEomnVIQr9bgHNUwSrTiRzc7YipYKpyKQuN6x/1lz1qU8LQE29epv+fZqkCRs5ZGgrcLALlDR1NkknIddXohTg0XRecdnlZtMLL8p36dyg62KKYNWwqLxWk70WKiLGH5/dYK7+9FUCCr06mjuiDLAwHECSXajJU/M5hYnP85486n3jxpnl9yfNHl9p9yGC1UnkViCVyrgTemnTJnPN1bOleWvs2k3g0PElrHC5DkGFgRIghw8dKq8k91deMUsGS8mf+G7tFKADNnS5LqYIVg0LoBAVvGPHDnPTN240o0b+kzRTgEGkIcpotMEKlgubguRHMMAi5yLijRw+wiz9wT3yfa4AS0F62+5PBKvOpNFJJZHKVio51T133y1TLDoiTrSSQUwLhmtNuvVnhUcNWBiY+FmiXkMPc8Zpp0vyL7kbSXmyL65jU1jH0grU5uc3T642k8+YJJUPUAqLH3XUPli+FSwSfXqIRKovX/+lXIcAToqAFXIxRbBqUNu2bZNpF8BhykXBAAgFBNB8sEqZCMVr/6Zmyavutwk6uRsG5hA8xVxMEawaEpW1cuVKM378eNPQkMujdNwJA4VGKrULTimzLfKzkyaeKL1KlUZIH5xSLqYIVhXlVoYk5vZHHb1+5S/bZM0TPTOseZAPkmsfHN80dwBJpGJ7NKmXXXyJ9PrI33xQynUxRbA6SJIMH8iZOT3Gjqh4AFBofJB8+yCFDFTARZPKgj3JoZLvDcFSjospgtUB0jGp3Tt3ySAnvT3yHm3ueCWfCsHk2ocoZLbLZ+9evCQFSmS5CMFSjospgpWh/MInSkkTaLVq1SpZ5qtjUlibLay/c//P/10IJNes9mTu8LFHHpXvlDk+xG6V0fsr5GKKYGUkKfik+y4/20jx9r63zL4395pbbrpZKt0HxbcOcBZyCCZMlKLpmzhxotm4cWMQglJgtFcRrKxF/SV1+H9btppzzp6Szu2FYHIdgsm1D5Qm/GyfQc+XX34598UdoAhWlrLRSpeY/PzBh2RduY5LZQEWTShN6/nnnmf+9tprMoygY1TVVgSrCuLKF10PpV1/QAjB5DoEk2sfLNagM4msa6cQTZ7mddVUBKuC0sigr4xNXfiJCyRKhZLvECzlWJN8oh9DFf9xzTW5Xp/T/HaUIlgZaf369eYDJ54kqzmJJlmAReQDrnf/47tkjEqHEqT5jWB1Hmmzw7TMiBEj0uXBQMVrpcFiG4B72y3fTCNVLUCFIlgVFGDNmzfPNDU1mebm5jSiAADNlR+1QrCUY6Z+7rzjjuTLHaMOhqvdYBVKDjsiYewIyZybjRav7/67zPURQRQmfQWoUC8wBItr//NEPbZJJ4Dv+d5dd6XjUfqaJwWtkDNURSIWB0XCyjVtmPeAFTzYTiRtdujaT/nY2VLZes2eC5UfqdQhmFz7n2ebwEWkWvL9xXnly/tW5c2PxZyhDgus9CB0ZDkZXc6T/VXwYDuZXnz+BXPiCRNlUNKFSV8LQYVDMLn2P8/2+R6gCpa5Lz5SzBmqXRGLJuCNPXvMb3/9G3PH/AVmzhevl2vbFn3rTvP4Y6vMzp07OzVcTzz+uBkz+hiZQtHJXoWrLQ7B5Nr/PJ2BHy5dloOKf07ZBgdB+a9izlDlgZXsDHNe6KcrfmJOPfkUyR8YnOMCx27vOkreE66ZZJ37la+arVu3yuc5+GAB1ImoRL2EnZ6fRqRSkamQQzC55jPaAQCq73/3e61aiaInLf9VzBmqLLC0S7v3jTclUWUiVSdTh7cMkatG9MoRfkdhMMUwatQos2DBArNv3z7JvbRy6lVLliwx/frlenlZggVULCEmd7vr29/Jfbktf6mHztYUcovAs8/6mOn67qPk4PViRy434gYS3JlEfmejGGfaUFswvXr1Mj169DBTp041W7Zske3UY6+R6DB//nzT2NhoBg06dHFCVmBRhuRUpBbSSiQwSaehLfJB8p2hygKLRJX10rrSUa+kFai4jq3Z9oa4n5ItFH6WvMNWAG5paTE9e/Y0EyZMMOvWrUu2WF+aO3eurEUnWhFJsgaL1uDWm2+R706jVDlAuBCFnKFKgiVrsu1OcPc3Fo1xBlEoFGSoMFz7BUkEo7C46PKp1b/OFZQf0vWgvV93hIgSWqHcYIwmieMAKk6s0DGX41D5EKU0Z73ha1/P7Qhl4ZdTjasoWBpyf/noYwIDUFGojKWwdDZUWK79giOCUXi8vmfESPPoLx6RQtNBxjyoaqQcgetTn7xSorRWPsdP5YeOuRz75cM22TZ5Kb1rYErLps5UMmL94n9+Lger3Wnea+gPFZZrv+CwnpEKGcMSaf5QY2CxX9xxRaO0nlR6DKFjLsd+2WAApmOEgEpaDMrGLZ86UBAs7cI+/6eNEqkoRCIUMEluZV/bUrB+oQESf0vlYJpFKmv1E0/WZMS66IILpfljn9l/99g5ltAxl2O/fAD48ksvzZ1oVnrCdZqIBViMN3G2EpYpUArTL4hQYbn2Px8yQxIMMj7z9O/ku7VQO0wWaIZTdB2VngQAxTG5N9torylXyoBtA/C555wjA87sgxupNM/LO+lwDasVWDoMsGHDhrTno3mRD0WosFz7n/fNNtk+g6nHHzfBPLfhD2khdshZar+Xix2ASk8o9pN9xJWECrNtvoNIxY1n//rqjkMQJfuTZ37tuobVCiwdGV+xYoWcsXq/gKwiFhXGxC25BQvjuOAAtXmspoLSSEWPzI3SGrEqDRYnLGXMDMWWlzbLPuTNTHQWsDS3ImotW7ZMzloKlMKtNFhpFEgqje1TyFzFwoWcoioXnhupqHTM/un+ho6xPSbHJA0glw2qM4HFdAuva9eulULVaKXNQjkOFWYxExEaunQ1l198iTH77ZnrFqrsoOd2imaHnI58hnySJllBOpz9L2W26d4Km/erV68OzkJQB67rTcEcSw+EXhFNlDaHWuBtdahwi1lve8gtEL983fWyDwJQVmdsso1/m/VJOU4iFPudRtMMmj7dPp2W5cuXy/f74LhA+f9XL8oDS88cbee3bt6SXhBAIu9C0xaHCreYAUtvdcj9xb9956JDQGUBltW/z/6MNH8cn9tByQIstgtclCerP5HexwGAKP0D9sDU9QoVahWx8lYe2Mokmf7gSe9PVzG4Be/+HHKocEsZuHhlYpsm+JGHH073JQVK3U594XOfF6iobJp6bfqzilhsm+/7ypfmSDPMCew2gz5Y9axWYLmSrq89Po1c5CBUtha+D5LvUOG2xVQo5vuYn2QYQnqJLlCAVkr6edfIvnK5FM0RxwNY5DuhfXHNBLvr0Gd8y60b7bHwClTck72QAMt1PasoWFoZVOqfX/xf6RZrZWQJFqYyaJ7oKRIxeapnm2Bylex/6uTvv7VgYd7gJ/vK8YT2w3W5YOk9QTF541mTJ8s4mShwLEcOWInoNdF7+v3v1sn9B4Ara7AwlU4TRWLNnegEDitpRtwmu5AUKLUV94kCKvafTgnRivcSiUs0feWChXlCBE+MOPFfjj/0uNtkX3wdUWCllZicYU/+6okgRCGHCrocazQBAJqR22+9VfYjhapABaVSoBL/+EfLpXklSXejFa5UxHLhJFKRK44bPcY8t35Dbj/s/nOSSprh6cgCy+v2ktzfe++9clEmZzmVrhWjlaR2C/xwrU0JFcZTPR9+4CHZjwPMKTrQFLLmZlz4kMX+udsjulIOCiwA47wOiOtOrLLA0h4j7xctWpTXU3TPfnWoIg7HChc9xmNHjTabNr5gK4YdKWFbeYC1/plnZJVGpffP3ZYbAYELM6wga9Wd/YlgWblQqeke6yAqqyrJfyhQelVuQeNQZRyuFS6enXf2mZNzI/PUTTFb0aPlxrE0gZXeP397dDaIWjr3KY+19WFy3YlVFlj6OxXRgPk1CjFrsLA2iTxVXUbm2ZUiJllm1QD5Gc12pfePbbgpAO8Bi87BzGnTDy0BYn8iWOVpz67d5uQPfihvRYDeYCxUGZUyz+XTm7a6yTCv/MxKhRnnni8RjquGdOC1kgYkXfpDtCLfJD1geOTVV7bnQS4guT/jTqz2gZWcdRufe86MPWaMAOWevaHKqKS5tJ37JiAdEhHZ/WKdOs/e43NcSQRc/t+3127E4kQCKp6iJQ88Qi5EEawyRGElcHHBhUIFYESuUGVU0jQ56Uh2sh/Add2110oEpdnUy9NCf99ec6yasHO85HE/+8nKwiD57sRqN1jkWTQ/vH73O/8tg6c0iVk3hZhKBa7zpk41y+5ZKveK4m7B9Makl2aBes+wERKtyM9C22iP+Q5d+cFxcwM0Hd4Q+SD57sRqH1haQBYwzXE+/5+fTXuKWVSma82dyKNYx9XHAkXuBVC6UqKSFlgdc/JgjvfSiy6W44/KqTJgOYBxxk6d8nHJN7RCQlC018Cj5ue08gv8vhL2wSIyEx3pvMhcZlSqioKlyTNLbXgiqFaswlBJs13yJ1zoOxSIStkHi7yKgddnf79ejjvqkCoesdQ8HVQrHYcqPiu7MFTSPlh0Unhyl6QBHHdUqsqCpU7g4n5OJNf0mmg2tNeoDkHRHodgqKSBSYZRWlpMN9vr5N5fHG+6FCYqVTZgOdZVmjpZXe9gkaxz15xp06blIhXHieyJ5M5KHOnKFCwdBf/opDPTyFXPYBF1af54tO6mTZvsQeaOUY43gpWnbCNWkne8ZCvhn48dW5dgudtlnxmv4lmDrFeXZ9YkxxiVr/aB1QYx/MB0C2uSdFkzZ341pnxK2QUoZG5/ybAF+0pTzqXwCxcuTI4sqpgyBUsHTWkO8bzbbs9rEkOVXU2HYHKt42FAxX7PmjVLLteKTV5pZRuxnOZQ3ltdcuFFaTJP5YUqvFr2QfINVCwtZgXDCccfb7Zt25Z/b4Wogqo6WDxqjVUJwEXFUYGhSq+GfZD8fWH/eKUpXPPUUwKVRiv3esCo1so8x8pTAhn3MyViUWE6Yd0RTWMhoNQM8DIPKQ9CsrsOVK6jCqu6YKEELlZC6GQ1TU01ltn4DoGleRUGqisvu0L2l05IBKvtqj5YTn1wMw7WTQEWEcyt9GrYB4uoSRRVc4EuTTcnAz3bCFbbVfWmUM78pLfI6k9WBtDjoiL9is/apcDixrucCHodYwSr7aoqWH5lUGGsDGC9OBVJrsVrtYYjFCqdVKY51vGqb3z9v3LRNeSokqp+U+iJ6MVl77rqsyPB0vVVrEiVJUAhqHBUSXUsWEnTSGWxdr3bUV3kYgQquRo5lw9W3759zciRI83mzbn7gaaKYJWtDo9Y0ku0/1iByZ2TWXlK1KpGL9EHi4dJLV26NNkxRy5UOKqkOhYsr8LW/nZNmmfxqgOUWVrgst/VvUtXM3v2bPYqffxdKm8/U0cVVE2BRfRaMG++DEFQ2SEQKmmgYhCUyXFmA3bs2JH2+CJY7VNtgZXogpkzc3DRTGUctdg+zS93oyk4hODvpzqqoGoKLBnfslHrL1tfNuPGHJvJZfGuuXysd0OjPMua79YJZo1aqbz9TB1VUB2fvHvSid6HHngwXb/lDkG4DsESsp+kS/5mX4mKXOAa16xXXjUFlkYK4CLH4Zl9rIIIQYVDEBUzMPF3gMUSY4Y0uHdWjD6VV02BpQmz3uDt9d1/N6d9+MMyWc18ooJxuGAR+XQ7TCNxSTyiGdRppqjKqOaaQpXCxRCEAuFCdThg8Tfcx4spm8lnTMoNzqIYsSqumgULacWzpBkYaMKAjNyLqBOCp5g14vHKHaDzEvEIV0VV+2DZCqeZOv/c82QeD7hI6IlgIXiKGSgZCJUm0IcKR1VMNQ0W0qjFzcyYRwQuAMEheIqZqMdN/BnSkJwqgpWZahusZB5RFtlZEHhoE0k3UQuH4ClmluewTCdN1l2ocFTFVNtgaYU7EWbqlI+ncDFqrnecCQ2mymdsPoXTJhC1FSL9/kKOKqj6AAsTvax5YBPjT0zDpBeUWqiAywdLE3Waz9M/clo6ECqQtkXu94ccVVD1AxZO4CLy6EQ1uRbJPO91GELN7zRqrVv7tN2A/XMGX63bBJf//b6jCqq+wErE6k6eHU0kInqx8hO4fLAYlmCE/Uf33Zf7e8BE9iWCla3qDiztJfJwgBkzZpiuXbuaxsZG09zcLCtAecYP5v5VPGORuzmLgCqwvaLyP+87qqDqsilUMafIis8pU6aYcePGybLisWPHmunTp5vFixebN/bsOfR3vPoupdDfuI4qqLpK3nWS2p2o1p937txptm/fbnbt2sVfpktgENNDMg/pbg+Xkv9531EFVVcRC4AUJpW+5/c6ic2rgqUAipxtiUvJ/7zvqIKqbbCi6lYRrKgMZMz/AwVBxew4Ey2/AAAAAElFTkSuQmCC":"","jpeg",0.61,8.8,0.3,0.2,"section1_checkmark10")
                    .setLineWidth(0.02).line(0.45,9.05,1.1,9.05)
                    .setFontSize(16).setFont("times","normal").text("My landlord is not entitled to evict me or secure a money judgement for the following reasons (describe below):",1.4,9.05)
                    .setFontSize(16).setFont("helvetica","italic").text(this.form_sections[4].section_fields[9].field_data.substring(0,200),1.4,9.4)
                    .setLineWidth(0.02).line(1.4,9.47,22,9.47)
                    .setFontSize(16).setFont("helvetica","italic").text(this.form_sections[4].section_fields[9].field_data.substring(200,400),1.4,9.85)
                    .setLineWidth(0.02).line(1.4,9.92,22,9.92)
                    //option 11
                    .addImage(this.placeholder?"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAByCAYAAACx1Ch2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAABWISURBVHhe7Z19vFVVmcfn/yl5uVxAuJfXy+tEiDAh44j2on5KRTJJVF7yXckpJWemMjMqasyXVF5MaqzgY0JqRJQ6mUqmlIFhSBnqkIATIhYQKojgmvV9zn4266y7zjn3cM8+95zL+n34fc65l3P32Xut737Ws1723v9goqIyUAQrKhNFsKIyUQQrKhNFsKIyUQQrKhNFsKIyUQQrKhNFsKLK0jvvvGMOHjwo5n0hRbCi2ixAKgaTqwhWVGHBkNoVPx8sDlgEK6qwXLCsD+zfb958/Q2z869/M9u3vcInCiqCdYTJbc4A5eDbB/KjD+/tPwBat/Zpc9+yH5qvfXWu+cxVV5uPTjrTTBh/nBkxbLgZe8wYM+n0M+T/RfxZsm0cwToCpWCJkrevbX/VPPizB8yNN9xgpp13vjnufePNsJYhpndDo+l+VBfTu7Gn6dO7t+l7dB8zoLmfGTRgoPzc0K2b+dWqX8o2IlhHuKj4t956yzy9Zq1ZMG++uWDmTHPMe0ebo3v2ElCa+vQVeAb0bTbD+g8yIwa1mCEDBpnB/fqblv4DzUD7f/2O7iuRC+AAUrcbwToCtd82fWvWrDFz5swxp556qhnYv7+A0atHo8A0eKCFxxpggGj4gMFmSL+BpqXZAoUtVEMHDpbX5t59BMJrP/u5ZOsRrE4lKtEV40t79+6V9+8cOCg51Asbnzc333iTOeVDJ0sk6t6la9qcuVawMBEKsDRi8R6giGJ9bGQ78yOnm5U/XiHfE+ohRrA6gYDpAEm4FVEJ7d69Wyr+E9NnmKGDW0yP7g2SE2lEIlqVAguQBjf1k2jVr1cf07NbgznLJvAPrfypefvNffI9AlWS8LuKYNW7tEKTCt7855fMvNtuNxP/9QTJmTQ69evbJMAAWQgqDEyuh9lIRZN3dI+e5pT3f8CsuO9+iYL6XfQqCymCVc8iUFDRVn/6wx/NF79wnRk9apQApTkTPbshgwYLWFjB4v9KgdWrew8zavhIs/C2eWb/3lyEomnVIQr9bgHNUwSrTiRzc7YipYKpyKQuN6x/1lz1qU8LQE29epv+fZqkCRs5ZGgrcLALlDR1NkknIddXohTg0XRecdnlZtMLL8p36dyg62KKYNWwqLxWk70WKiLGH5/dYK7+9FUCCr06mjuiDLAwHECSXajJU/M5hYnP85486n3jxpnl9yfNHl9p9yGC1UnkViCVyrgTemnTJnPN1bOleWvs2k3g0PElrHC5DkGFgRIghw8dKq8k91deMUsGS8mf+G7tFKADNnS5LqYIVg0LoBAVvGPHDnPTN240o0b+kzRTgEGkIcpotMEKlgubguRHMMAi5yLijRw+wiz9wT3yfa4AS0F62+5PBKvOpNFJJZHKVio51T133y1TLDoiTrSSQUwLhmtNuvVnhUcNWBiY+FmiXkMPc8Zpp0vyL7kbSXmyL65jU1jH0grU5uc3T642k8+YJJUPUAqLH3XUPli+FSwSfXqIRKovX/+lXIcAToqAFXIxRbBqUNu2bZNpF8BhykXBAAgFBNB8sEqZCMVr/6Zmyavutwk6uRsG5hA8xVxMEawaEpW1cuVKM378eNPQkMujdNwJA4VGKrULTimzLfKzkyaeKL1KlUZIH5xSLqYIVhXlVoYk5vZHHb1+5S/bZM0TPTOseZAPkmsfHN80dwBJpGJ7NKmXXXyJ9PrI33xQynUxRbA6SJIMH8iZOT3Gjqh4AFBofJB8+yCFDFTARZPKgj3JoZLvDcFSjospgtUB0jGp3Tt3ySAnvT3yHm3ueCWfCsHk2ocoZLbLZ+9evCQFSmS5CMFSjospgpWh/MInSkkTaLVq1SpZ5qtjUlibLay/c//P/10IJNes9mTu8LFHHpXvlDk+xG6V0fsr5GKKYGUkKfik+y4/20jx9r63zL4395pbbrpZKt0HxbcOcBZyCCZMlKLpmzhxotm4cWMQglJgtFcRrKxF/SV1+H9btppzzp6Szu2FYHIdgsm1D5Qm/GyfQc+XX34598UdoAhWlrLRSpeY/PzBh2RduY5LZQEWTShN6/nnnmf+9tprMoygY1TVVgSrCuLKF10PpV1/QAjB5DoEk2sfLNagM4msa6cQTZ7mddVUBKuC0sigr4xNXfiJCyRKhZLvECzlWJN8oh9DFf9xzTW5Xp/T/HaUIlgZaf369eYDJ54kqzmJJlmAReQDrnf/47tkjEqHEqT5jWB1Hmmzw7TMiBEj0uXBQMVrpcFiG4B72y3fTCNVLUCFIlgVFGDNmzfPNDU1mebm5jSiAADNlR+1QrCUY6Z+7rzjjuTLHaMOhqvdYBVKDjsiYewIyZybjRav7/67zPURQRQmfQWoUC8wBItr//NEPbZJJ4Dv+d5dd6XjUfqaJwWtkDNURSIWB0XCyjVtmPeAFTzYTiRtdujaT/nY2VLZes2eC5UfqdQhmFz7n2ebwEWkWvL9xXnly/tW5c2PxZyhDgus9CB0ZDkZXc6T/VXwYDuZXnz+BXPiCRNlUNKFSV8LQYVDMLn2P8/2+R6gCpa5Lz5SzBmqXRGLJuCNPXvMb3/9G3PH/AVmzhevl2vbFn3rTvP4Y6vMzp07OzVcTzz+uBkz+hiZQtHJXoWrLQ7B5Nr/PJ2BHy5dloOKf07ZBgdB+a9izlDlgZXsDHNe6KcrfmJOPfkUyR8YnOMCx27vOkreE66ZZJ37la+arVu3yuc5+GAB1ImoRL2EnZ6fRqRSkamQQzC55jPaAQCq73/3e61aiaInLf9VzBmqLLC0S7v3jTclUWUiVSdTh7cMkatG9MoRfkdhMMUwatQos2DBArNv3z7JvbRy6lVLliwx/frlenlZggVULCEmd7vr29/Jfbktf6mHztYUcovAs8/6mOn67qPk4PViRy434gYS3JlEfmejGGfaUFswvXr1Mj169DBTp041W7Zske3UY6+R6DB//nzT2NhoBg06dHFCVmBRhuRUpBbSSiQwSaehLfJB8p2hygKLRJX10rrSUa+kFai4jq3Z9oa4n5ItFH6WvMNWAG5paTE9e/Y0EyZMMOvWrUu2WF+aO3eurEUnWhFJsgaL1uDWm2+R706jVDlAuBCFnKFKgiVrsu1OcPc3Fo1xBlEoFGSoMFz7BUkEo7C46PKp1b/OFZQf0vWgvV93hIgSWqHcYIwmieMAKk6s0DGX41D5EKU0Z73ha1/P7Qhl4ZdTjasoWBpyf/noYwIDUFGojKWwdDZUWK79giOCUXi8vmfESPPoLx6RQtNBxjyoaqQcgetTn7xSorRWPsdP5YeOuRz75cM22TZ5Kb1rYErLps5UMmL94n9+Lger3Wnea+gPFZZrv+CwnpEKGcMSaf5QY2CxX9xxRaO0nlR6DKFjLsd+2WAApmOEgEpaDMrGLZ86UBAs7cI+/6eNEqkoRCIUMEluZV/bUrB+oQESf0vlYJpFKmv1E0/WZMS66IILpfljn9l/99g5ltAxl2O/fAD48ksvzZ1oVnrCdZqIBViMN3G2EpYpUArTL4hQYbn2Px8yQxIMMj7z9O/ku7VQO0wWaIZTdB2VngQAxTG5N9torylXyoBtA/C555wjA87sgxupNM/LO+lwDasVWDoMsGHDhrTno3mRD0WosFz7n/fNNtk+g6nHHzfBPLfhD2khdshZar+Xix2ASk8o9pN9xJWECrNtvoNIxY1n//rqjkMQJfuTZ37tuobVCiwdGV+xYoWcsXq/gKwiFhXGxC25BQvjuOAAtXmspoLSSEWPzI3SGrEqDRYnLGXMDMWWlzbLPuTNTHQWsDS3ImotW7ZMzloKlMKtNFhpFEgqje1TyFzFwoWcoioXnhupqHTM/un+ho6xPSbHJA0glw2qM4HFdAuva9eulULVaKXNQjkOFWYxExEaunQ1l198iTH77ZnrFqrsoOd2imaHnI58hnySJllBOpz9L2W26d4Km/erV68OzkJQB67rTcEcSw+EXhFNlDaHWuBtdahwi1lve8gtEL983fWyDwJQVmdsso1/m/VJOU4iFPudRtMMmj7dPp2W5cuXy/f74LhA+f9XL8oDS88cbee3bt6SXhBAIu9C0xaHCreYAUtvdcj9xb9956JDQGUBltW/z/6MNH8cn9tByQIstgtclCerP5HexwGAKP0D9sDU9QoVahWx8lYe2Mokmf7gSe9PVzG4Be/+HHKocEsZuHhlYpsm+JGHH073JQVK3U594XOfF6iobJp6bfqzilhsm+/7ypfmSDPMCew2gz5Y9axWYLmSrq89Po1c5CBUtha+D5LvUOG2xVQo5vuYn2QYQnqJLlCAVkr6edfIvnK5FM0RxwNY5DuhfXHNBLvr0Gd8y60b7bHwClTck72QAMt1PasoWFoZVOqfX/xf6RZrZWQJFqYyaJ7oKRIxeapnm2Bylex/6uTvv7VgYd7gJ/vK8YT2w3W5YOk9QTF541mTJ8s4mShwLEcOWInoNdF7+v3v1sn9B4Ara7AwlU4TRWLNnegEDitpRtwmu5AUKLUV94kCKvafTgnRivcSiUs0feWChXlCBE+MOPFfjj/0uNtkX3wdUWCllZicYU/+6okgRCGHCrocazQBAJqR22+9VfYjhapABaVSoBL/+EfLpXklSXejFa5UxHLhJFKRK44bPcY8t35Dbj/s/nOSSprh6cgCy+v2ktzfe++9clEmZzmVrhWjlaR2C/xwrU0JFcZTPR9+4CHZjwPMKTrQFLLmZlz4kMX+udsjulIOCiwA47wOiOtOrLLA0h4j7xctWpTXU3TPfnWoIg7HChc9xmNHjTabNr5gK4YdKWFbeYC1/plnZJVGpffP3ZYbAYELM6wga9Wd/YlgWblQqeke6yAqqyrJfyhQelVuQeNQZRyuFS6enXf2mZNzI/PUTTFb0aPlxrE0gZXeP397dDaIWjr3KY+19WFy3YlVFlj6OxXRgPk1CjFrsLA2iTxVXUbm2ZUiJllm1QD5Gc12pfePbbgpAO8Bi87BzGnTDy0BYn8iWOVpz67d5uQPfihvRYDeYCxUGZUyz+XTm7a6yTCv/MxKhRnnni8RjquGdOC1kgYkXfpDtCLfJD1geOTVV7bnQS4guT/jTqz2gZWcdRufe86MPWaMAOWevaHKqKS5tJ37JiAdEhHZ/WKdOs/e43NcSQRc/t+3127E4kQCKp6iJQ88Qi5EEawyRGElcHHBhUIFYESuUGVU0jQ56Uh2sh/Add2110oEpdnUy9NCf99ec6yasHO85HE/+8nKwiD57sRqN1jkWTQ/vH73O/8tg6c0iVk3hZhKBa7zpk41y+5ZKveK4m7B9Makl2aBes+wERKtyM9C22iP+Q5d+cFxcwM0Hd4Q+SD57sRqH1haQBYwzXE+/5+fTXuKWVSma82dyKNYx9XHAkXuBVC6UqKSFlgdc/JgjvfSiy6W44/KqTJgOYBxxk6d8nHJN7RCQlC018Cj5ue08gv8vhL2wSIyEx3pvMhcZlSqioKlyTNLbXgiqFaswlBJs13yJ1zoOxSIStkHi7yKgddnf79ejjvqkCoesdQ8HVQrHYcqPiu7MFTSPlh0Unhyl6QBHHdUqsqCpU7g4n5OJNf0mmg2tNeoDkHRHodgqKSBSYZRWlpMN9vr5N5fHG+6FCYqVTZgOdZVmjpZXe9gkaxz15xp06blIhXHieyJ5M5KHOnKFCwdBf/opDPTyFXPYBF1af54tO6mTZvsQeaOUY43gpWnbCNWkne8ZCvhn48dW5dgudtlnxmv4lmDrFeXZ9YkxxiVr/aB1QYx/MB0C2uSdFkzZ341pnxK2QUoZG5/ybAF+0pTzqXwCxcuTI4sqpgyBUsHTWkO8bzbbs9rEkOVXU2HYHKt42FAxX7PmjVLLteKTV5pZRuxnOZQ3ltdcuFFaTJP5YUqvFr2QfINVCwtZgXDCccfb7Zt25Z/b4Wogqo6WDxqjVUJwEXFUYGhSq+GfZD8fWH/eKUpXPPUUwKVRiv3esCo1so8x8pTAhn3MyViUWE6Yd0RTWMhoNQM8DIPKQ9CsrsOVK6jCqu6YKEELlZC6GQ1TU01ltn4DoGleRUGqisvu0L2l05IBKvtqj5YTn1wMw7WTQEWEcyt9GrYB4uoSRRVc4EuTTcnAz3bCFbbVfWmUM78pLfI6k9WBtDjoiL9is/apcDixrucCHodYwSr7aoqWH5lUGGsDGC9OBVJrsVrtYYjFCqdVKY51vGqb3z9v3LRNeSokqp+U+iJ6MVl77rqsyPB0vVVrEiVJUAhqHBUSXUsWEnTSGWxdr3bUV3kYgQquRo5lw9W3759zciRI83mzbn7gaaKYJWtDo9Y0ku0/1iByZ2TWXlK1KpGL9EHi4dJLV26NNkxRy5UOKqkOhYsr8LW/nZNmmfxqgOUWVrgst/VvUtXM3v2bPYqffxdKm8/U0cVVE2BRfRaMG++DEFQ2SEQKmmgYhCUyXFmA3bs2JH2+CJY7VNtgZXogpkzc3DRTGUctdg+zS93oyk4hODvpzqqoGoKLBnfslHrL1tfNuPGHJvJZfGuuXysd0OjPMua79YJZo1aqbz9TB1VUB2fvHvSid6HHngwXb/lDkG4DsESsp+kS/5mX4mKXOAa16xXXjUFlkYK4CLH4Zl9rIIIQYVDEBUzMPF3gMUSY4Y0uHdWjD6VV02BpQmz3uDt9d1/N6d9+MMyWc18ooJxuGAR+XQ7TCNxSTyiGdRppqjKqOaaQpXCxRCEAuFCdThg8Tfcx4spm8lnTMoNzqIYsSqumgULacWzpBkYaMKAjNyLqBOCp5g14vHKHaDzEvEIV0VV+2DZCqeZOv/c82QeD7hI6IlgIXiKGSgZCJUm0IcKR1VMNQ0W0qjFzcyYRwQuAMEheIqZqMdN/BnSkJwqgpWZahusZB5RFtlZEHhoE0k3UQuH4ClmluewTCdN1l2ocFTFVNtgaYU7EWbqlI+ncDFqrnecCQ2mymdsPoXTJhC1FSL9/kKOKqj6AAsTvax5YBPjT0zDpBeUWqiAywdLE3Waz9M/clo6ECqQtkXu94ccVVD1AxZO4CLy6EQ1uRbJPO91GELN7zRqrVv7tN2A/XMGX63bBJf//b6jCqq+wErE6k6eHU0kInqx8hO4fLAYlmCE/Uf33Zf7e8BE9iWCla3qDiztJfJwgBkzZpiuXbuaxsZG09zcLCtAecYP5v5VPGORuzmLgCqwvaLyP+87qqDqsilUMafIis8pU6aYcePGybLisWPHmunTp5vFixebN/bsOfR3vPoupdDfuI4qqLpK3nWS2p2o1p937txptm/fbnbt2sVfpktgENNDMg/pbg+Xkv9531EFVVcRC4AUJpW+5/c6ic2rgqUAipxtiUvJ/7zvqIKqbbCi6lYRrKgMZMz/AwVBxew4Ey2/AAAAAElFTkSuQmCC":"","jpeg",0.61,10.02,0.3,0.2,"section1_checkmark11")
                    .setLineWidth(0.02).line(0.45,10.27,1.1,10.27)
                    .setFontSize(16).setFont("times","normal").text("Other",1.4,10.27)
                    .setFontSize(16).setFont("helvetica","italic").text(this.placeholder_text.substring(0,200),1.4,10.62)
                    .setLineWidth(0.02).line(1.4,10.69,22,10.69)
                    .setFontSize(16).setFont("helvetica","italic").text(this.placeholder_text.substring(200,400),1.4,11.02)
                    .setLineWidth(0.02).line(1.4,11.09,22,11.09)
                    .setFontSize(16).setFont("helvetica","italic").text(this.placeholder_text.substring(400,500),1.4,11.42)
                    .setLineWidth(0.02).line(1.4,11.49,22,11.49)
                    //section-end line
                    .setLineWidth(0.03).line(0.44,12,23,12)

                    //****SECTION 3****//
                    //title
                    .setFontSize(16).setFont("times","bold").text("COUNTERCLAIM",10.35,12.45)
                    //options list
                    //option 1
                    .addImage(this.form_sections[5].section_fields[0].is_selected?"data:image/png;base64,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":"","jpeg",0.61,12.7,0.3,0.2,"section2_checkmark1")
                    .setLineWidth(0.02).line(0.45,12.95,1.1,12.95)
                    .setFontSize(16).setFont("times","normal").text("My landlord owes me $",1.4,12.95)
                    .setFontSize(16).setFont("helvetica","italic").text(this.form_sections[5].section_fields[0].field_data,3.60,12.95)
                    .setLineWidth(0.01).line(3.55,13.0,5.0,13.0)
                    .setFontSize(16).setFont("times","normal").text("for the following reasons:",5.05,12.95)
                    //option 2
                    .addImage(this.form_sections[5].section_fields[1].is_selected?"data:image/png;base64,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":"","jpeg",0.61,13.15,0.3,0.2,"section2_checkmark2")
                    .setLineWidth(0.02).line(0.45,13.4,1.1,13.4)
                    .setFontSize(16).setFont("times","normal").text("My landlord failed to repair the property. Due to this failure, its value has been reduced by $",1.4,13.4)
                    .setFontSize(16).setFont("helvetica","italic").text(this.form_sections[5].section_fields[1].field_data1,9.7,13.4)
                    .setLineWidth(0.01).line(9.65,13.45,11.1,13.45)
                    .setFontSize(16).setFont("times","normal").text("each month for",11.15,13.4)
                    .setFontSize(16).setFont("helvetica","italic").text(this.form_sections[5].section_fields[1].field_data2,12.6,13.4)
                    .setLineWidth(0.01).line(12.55,13.45,14.0,13.45)
                    .setFontSize(16).setFont("times","normal").text("months.",14.05,13.4)
                    //option 3
                    .addImage(this.form_sections[5].section_fields[2].is_selected?"data:image/png;base64,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":"","jpeg",0.61,13.60,0.3,0.2,"section2_checkmark3")
                    .setLineWidth(0.02).line(0.45,13.85,1.1,13.85)
                    .setFontSize(16).setFont("times","normal").text("Since my landlord failed to make the requested repairs, I made these repairs at the total cost of $",1.4,13.85)
                    .setFontSize(16).setFont("helvetica","italic").text(this.form_sections[5].section_fields[2].field_data,10.05,13.85)
                    .setLineWidth(0.01).line(10.0,13.9,11.45,13.9)
                    .setFontSize(16).setFont("times","normal").text(". I have all my receipts. I will bring the receipts and all documents concerning these payments to my trial.",11.5,13.85)
                    //option 4
                    .addImage(this.form_sections[5].section_fields[3].is_selected?"data:image/png;base64,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":"","jpeg",0.61,14.05,0.3,0.2,"section2_checkmark4")
                    .setLineWidth(0.02).line(0.45,14.3,1.1,14.3)
                    .setFontSize(16).setFont("times","normal").text("My landlord's failure to repair resulted in damages of $",1.4,14.3)
                    .setFontSize(16).setFont("helvetica","italic").text(this.form_sections[5].section_fields[3].field_data,6.4,14.3)
                    .setLineWidth(0.01).line(6.35,14.35,7.8,14.35)
                    .setFontSize(16).setFont("times","normal").text("to my person and/or property.",7.85,14.3)
                    //section-end line
                    .setLineWidth(0.03).line(0.44,15.0,23,15.0)

                    //****SECTION 4****//
                    .setFontSize(16).setFont("times","normal").text("WHEREFORE, I ask this Court to:",0.45,15.25)
                    //subsection 1
                    .setFontSize(16).setFont("times","normal").text("(a) Dismiss Plaintiff's lawsuit with all costs assessed against Plaintiff;",0.9,15.85)
                    .setFontSize(16).setFont("times","normal").text("(b) Enter a judgement in Defendant's favor and against Plaintiff; and",0.9,16.1)
                    .setFontSize(16).setFont("times","normal").text("(c) Grant such other and further relief as the Court deems just and proper",0.9,16.35)
                    .setFontSize(14).setFont("times","normal").text("Sworn to and subscribed before me\nthis________ day of ________________, 20____",0.45,18.25)
                    .setLineWidth(0.03).line(0.45,19.1,5.5,19.1)
                    .setFontSize(16).setFont("times","normal").text("Deputy Clerk",0.45,19.3)
                    //subsection 2
                    .setLineWidth(0.02).line(9.85,16.4,19,16.4)
                    .setFontSize(16).setFont("times","normal").text("PRINT NAME",9.85,16.6)
                    .setLineWidth(0.02).line(9.85,17.5,19,17.5)
                    .setFontSize(16).setFont("times","normal").text("SIGNATURE",9.85,17.7)
                    .setLineWidth(0.02).line(9.85,18.6,19,18.6)
                    .setFontSize(16).setFont("times","normal").text("PHONE NUMBER",9.85,18.8)
                    //subsection 3
                    .cell(19.75,15.20,3.2,4.2," ")
                    .cell(19.8,15.25,3.1,4.1," ")
                    .cell(19.85,15.3,3,4," ")
                    .setFontSize(18).setFont("times","bold").text("ALL PARTIES SHOULD \n   APPEAR IN COURT \n\t  15 MINUTES \n\t\tEARLY",19.95,15.8)
                    .setFontSize(16).setFont("times","normal").text("JUSTICE CENTER TOWER \n    185 Central Avenue, SW\n\t  Atlanta, Georgia\n\t\t  30303",20.05,18)
                    //section-end line
                    .setLineWidth(0.03).line(0.44,19.6,23,19.6)

                    //****SECTION 4****//
                    //title
                    .setFontSize(16).setFont("times","bold").text("NOTICE OF TRIAL DATE",9.95,20.05)
                    //subsection1
                    .setFontSize(16).setFont("times","normal").text("The Plaintiff and Defendant are required to appear for trial on:",0.45,20.65)
                    .setFontSize(16).setFont("times","normal").text("Date:____/____/________\tTime:____________AM/PM\tin Courtroom____.",0.45,21.15)
                    .setFontSize(14).setFont("times","bold").text("IF YOU HAVE AN ATTORNEY, PLEASE NOTIFY HIM/HER TO BE PRESENT WITH YOU",0.45,21.75)
                    .setFontSize(16).setFont("times","normal").text("________________________________DEFENDANT",0.45,22.2)
                    .setFontSize(16).setFont("times","normal").text("Plaintiff's notice of trial was --- Picked-up",0.45,22.65)
                    .cell(4.25,22.5,0.17,0.17," ")
                    .setFontSize(16).setFont("times","normal").text("Mailed",4.7,22.65)
                    .cell(5.4,22.5,0.17,0.17," ")
                    .setFontSize(16).setFont("times","normal").text("E-mailed",5.9,22.65)
                    .cell(6.8,22.5,0.17,0.17," ")
                    //subsection 2
                    .setLineWidth(0.02).line(10.45,21.8,19.2,21.8)
                    .setFontSize(16).setFont("times","normal").text("DEPUTY CLERK",19.25,21.8)
                    .setFontSize(12).setFont("times","normal").text("Rev. 8/2017",22,23.8)
                doc.save("ApplicationDocument.pdf")
            }
            // console.log(this.sections_incomplete)
        },

        alertFunction(){
            // console.log(this.form_sections)
            console.log(this.form_sections)
        },
    },


    created(){
        //check for previously saved data
        this.check_previousFormData()

        //assign values to the invalid_values array
        this.invalid_values = new Array(this.form_sections.length).fill(false)
        this.sections_incomplete = new Array(this.checklist_sections.length).fill(false)
    },
}
</script>



<style scoped>
    .app{
        display: flex;
        
    }

    .checklist, .questions{
        margin: 20px;
        border: 1px solid;
        border-radius: 10px;
        padding: 20px;
    }

    .checklist{
        background-color: #fff9e7;
        width: 32%;
        height: 80vh;
        overflow-y: scroll;
    }

    .checklist::-webkit-scrollbar{
        width: 0.5vw;       
    }

    .checklist::-webkit-scrollbar-thumb{
        background-color:#ffd043;
        border-radius: 10px;

    }

    .checklist::-webkit-scrollbar-track{
        background-color: #fff9e7;
        border-radius: 10px;
        margin: 5px 5px;
    }

    .checklist div{
        display: flex;
        margin: 20px;
    }

    .checklist-items .circle, .last-item .circle{
        margin: 15px -15px 0px 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        height: 5px;
        width: 5px;
        border: 2px solid gray;
        border-radius: 50%;
        z-index: 5;
    }

    .checklist-items .circle b, .last-item .circle b{
        margin: 1px 1px 0px 0px;
    }

    .checklist-items .text, .last-item .text{
        display: flex;
        justify-content: right;
        align-items: center;
        padding: 20px 20px 20px 40px;
        background-color: white;
        border-radius: 10px;
        color: gray;
    }

    .last-item .text{
        padding: 20px 60px 20px 40px;
    }

    .last-item .arrow-icon{
        float: right;
        width: 20px;
        height: 4px;
        border: 1px transparent;
        border-radius: 4px;
        background-color: #ffca28;
        position: relative;
        margin: 0px -40px 0px 20px;
        cursor: pointer;
    }

    .arrow-icon:after{
        content: "";
        display: inline-block;
        border-radius: 4px;
        width:13px;
        height: 4px;
        background-color: #ffca28;
        transform: rotate(45deg);
        position: absolute;
        right: -1px;
        bottom: 4px;
    }

    .arrow-icon:before{
        content: "";
        display: inline-block;
        border-radius: 4px;
        width:13px;
        height: 4px;
        background-color: #ffca28;
        transform: rotate(-45deg);
        position: absolute;
        right: -1px;
        bottom: -4px;
    }

    .questions{
        width: 68%;
        height: 80vh;
        overflow-y: scroll;
    }

    .questions::-webkit-scrollbar{
        width: 0.5vw;       
    }

    .questions::-webkit-scrollbar-thumb{
        background-color:#ffd043;
        border-radius: 10px;

    }

    .questions::-webkit-scrollbar-track{
        background-color: white;
        border-radius: 10px;
        margin: 5px 5px;
    }

    .questions .message-top{
        float: left;
        margin: 10px 0px 0px 50px;
    }

    .section1, .section2, .section3, .section4, .section5, .section6{
        padding: 20px 50px;
        margin: 20px 0px 10px 0px;        
    }

    .section1 h2, .section2 h2, .section3 h2, .section4 h2, .section5 h2, .section6 h2{
        border-bottom: 2px solid lightgray;
        padding: 5px 0px;
        margin: 0px 20px 0px 0px;
    }

    .section1 h2 i, .section2 h2 i, .section3 h2 i, .section4 h2 i, .section5 h2 i, .section6 h2 i{
        margin: 0px 0px 0px 10px;
        font-size: 14px;
        font-weight: normal;
        color: red;
    }

    .section1 div, .section2 div{
        margin: 20px 0px;
    }

    .section1 div .field-title, .section1 div .field-title{
        margin: 0px 0px 10px 0px;
    }

    .section1 div .field-input{
        display: flex;
        background-color: #e5e5e5 ;
        border: 1px transparent;
        border-radius: 5px;
        width: 40%;
        height: 25px;
        padding: 0px 10px;
    }

    .section2 div .field-input{
        background-color: #e5e5e5 ;
        border: 1px transparent;
        border-radius: 5px;
        padding: 5px 10px;
        width: 38%;
    }

    .section3 div .field-title, .section5 div .field-title{
        display: flex;
    }

    .section4 div{
        height: 150px;
        width: 98%;
    }

    .section5 .optional-textarea{
        width: 95%;
        height: 30px;
        margin: -10px 0px 0px 20px;
    }

    .section6 div .section6-fields{
        display: block;
        margin: 0px 0px 10px 0px;
    }

    .section6 div .section6-fields .input-title-fields{
        display: flex;
    }

    .section6 div .section6-fields .input-title-fields .field-input{
        margin: 10px 3px 3px 3px;
    }

    .section6 div .section6-fields .input-title-fields .field-title{
        margin: 16px 0px 10px 0px;
    }

    .section6 div .section6-fields .field-data{
        margin: 0px 0px 0px 18px;
    }

    .section6 div .section6-fields .field-data p{
        margin: 0;
    }

   .section6 div .section6-fields .field-data p input{
        margin: 0px 5px 0px 4px;
        background-color: lightgray;
        border: transparent;
        padding: 5px 5px;
    }

    .footer{
        margin: 35px 50px;
        height: 70px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .footer .buttons{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .button1, .button2, .button3{
        padding: 10px 20px;
        border: 1px solid #ffca28;
        border-radius: 10px;
        background-color: #ffca28;
        cursor: pointer;
        transition: 0.4s ease-out;
    }

    .button1:hover, .button2:hover, .button3:hover{
        box-shadow: 3px 3px  rgba(0,0,0,0.6);
    }

    .overlay{
        position: absolute;
        top:0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 98;
        background-color: rgba(0,0,0,0.3);
    }

    .fade-enter-active, .fade-leave-active{
        transition: opacity 0.5s ease;
    }

    .fade-enter-from, .fade-leave-to{
        opacity: 0;
    }

    .fade-enter-to, .fade-leave-from{
        opacity: 1;
    }

    .modal_restoreForm, .modal_saveForm{
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 99;
        width: 100%;
        max-width: 400px;
        background-color: #fff;
        border-radius: 16px;
        padding: 25px;
    }

    .modal_saveForm h1{
        text-align: center;
        padding: 15px;
        color: #222;
        font-weight: 300;
        font-family: 'Comic Sans MS';

    }

    .modal_restoreFormbuttons{
        display: flex;
        justify-content: space-between;
        padding: 10px;
    }

    .modal_saveFormbuttons{
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal_restoreFormbutton1, .modal_restoreFormbutton2, .modal_saveFormbutton{
        padding: 5px 10px;
        border: 1px solid #ffca28;
        border-radius: 10px;
        background-color: #ffca28;
        cursor: pointer;
        transition: 0.4s ease-out;
        color: white;
    }

    .modal_restoreFormbutton1:hover, .modal_restoreFormbutton2:hover, .modal_saveFormbutton:hover{
        box-shadow: 3px 3px  rgba(0,0,0,0.6);
    }

    .slide1-enter-active, .slide1-leave-active, .slide2-enter-active, .slide2-leave-active{
        transition: transform 0.5s;
    }

    .slide1-enter-from, .slide1-leave-to, .slide2-enter-from, .slide2-leave-to{
        transform: translateX(-50%) translateY(-100vh);
    }

</style>