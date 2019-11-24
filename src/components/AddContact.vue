<!-- Window for adding a new contact -->
<template>
	<div class="add-contact">
		<!-- Close button -->
		<div class="close row middle-xs" @click="hideWindow">
			<div class="col-xs start-xs">
				Close
			</div>
			<div class="col-xs end-xs">
				X
			</div>
		</div>

		<!-- New contact form -->
		<div style="margin: 10px">
			Contact Name
		</div>
		<input type="text" v-model="contactName" style="margin: 10px" />

		<div style="margin: 10px">
			Their code
		</div>
		<input type="text" v-model="contactCode" style="margin: 10px" />

		<div style="margin: 10px">
			Your QR code
		</div>
		<qriously :value="personalCode" :size="177" />
		 <span style="margin: 10px">{{$store.state}}</span>
		<div style="margin: 10px">
			<button @click="addContact">Add Contact</button>
		</div>
	</div>
</template>

<script>
import { get, set } from 'idb-keyval'

export default {
	data() {
		return {
			contactName: '', // the display name you set for your new contact
			contactCode: '', // their code, in the format of TheirID_TheirPublicKeyFragment
			personalCode: this.$store.state.credentials.id + '_' + this.generatePublic(), // your code
		}
	},
	methods: {
		// Closes this window
		hideWindow() {
			this.$store.state.addContactVisible = false
		},
		// Adds new contact if the form was filled in
		addContact() {
			if (this.contactName.length == 0) return
			if (!this.contactCode.includes('_')) return

			// Gets id and generates encryption key out of the key fragment of the contact
			let id = this.contactCode.split('_')[0]
			let key = this.generateShared(this.contactCode.split('_')[1])

			let contact = { name: this.contactName, key: key }

			// Adds contact and new empty chat to vuex
			this.$set(this.$store.state.contacts, id, contact)
			this.$set(this.$store.state.chats, id, [])

			// Stores contact and new empty chat to idb
			set('contacts', this.$store.state.contacts).then(() => {
				console.log('contact created...')
				set('chats', this.$store.state.chats).then(() => {
					console.log('chat created.')
				})
			})

			this.hideWindow()
		},
		// Generates a public key fragment out of your secret
		generatePublic() {
			return this.dh(
				'3',
				this.$store.state.credentials.secret,
				this.$store.state.publicMod
			)
		},
		// Generates a shared encryption key out of their public key fragment
		generateShared(publicKey) {
			return this.dh(
				publicKey,
				this.$store.state.credentials.secret,
				this.$store.state.publicMod
			)
		},
		// A modPow method for the Diffie Hellman exchange
		dh(base, exponent, modulo) {
			let bigInt = require('big-integer')
			let b = bigInt(base) // small prime number
			let e = bigInt(exponent) // private secret, big prime number
			let m = bigInt(modulo) // big prime number
			// base^exponent % modulo = res
			return b.modPow(e, m).toString()
		},
	},
}
</script>

<style scoped>
.add-contact {
	border-right: 1px gray solid;
	height: 100vh;
	width: 100%;
}
.close {
	height: 50px;
	border-bottom: 1px solid gray;
	padding: 10px;
	background: lightgray;
	font-weight: bold;
}
</style>