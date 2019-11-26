import Vue from 'vue'
import Vuex from 'vuex'
import { get, set } from 'idb-keyval'

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
    actions: {
        refreshToken() {
            let options = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            this._vm.$http.post(this.state.apiURL + 'refresh/', {refresh: this.state.credentials.refreshToken}, options).then(response => {
                let token = response.body.access
                if (token != null) {
                    console.log("new access token fetched...")
                    this.state.credentials.accessToken = token
                    set('credentials', this.state.credentials).then(() => {
                        console.log('token saved.')
                    })
                }
                else {
                    console.log("couldn't refresh token:")
                    console.log(response)
                }
            }).catch(e => {
                console.log("error while refreshing token:")
                console.log(e)
                if (e.body.code == 'token_not_valid') {
                    this.dispatch('login')
                }
            })
        },
        login() {
            let userCredentials = {
                username: this.state.credentials.id,
                password: this.state.credentials.password,
            }
            this._vm.$http.post(this.state.apiURL + 'token/', userCredentials).then((response) => {
                // Error, no tokens received
                if (!response.body.refresh || !response.body.access) {
                    console.log("tokens not received: ")
                    console.log(response)
                }
                else {
                    this.state.credentials.refreshToken = response.body.refresh
                    this.state.credentials.accessToken = response.body.access

                    // Stores credentials in idb
                    set('credentials', this.state.credentials).then(() => {
                        console.log('tokens stored.')
                    })
                }
            }, error => {
                console.log("error while logging in:")
                console.log(error)
            })
        }
    }
})
