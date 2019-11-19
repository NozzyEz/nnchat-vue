import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        addContactVisible: false, // Is the add contact window visible
        selectedChat: null, // The conversation that's shown in the middle
        contacts: {}, // List of contacts
        chats: {}, // List of messages in chats
        credentials: {}, // Personal info
        apiURL: 'https://glacial-chamber-87753.herokuapp.com/api/',
        publicMod: "112457129983317064494133258034491756790943511028023366901014968560410379195027" // Public prime number used for the handshake
    },
})
